import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request) {
  try {
    const supabase = await createClient()

    // 1. Retrieve authenticated user session
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { requestId } = await request.json()
    if (!requestId) {
      return NextResponse.json({ error: "Request ID is required" }, { status: 400 })
    }

    // 2. Fetch custom request details and verify status is 'quoted'
    const { data: customReq, error: reqErr } = await supabase
      .from("custom_order_requests")
      .select("*")
      .eq("id", requestId)
      .eq("user_id", user.id)
      .single()

    if (reqErr || !customReq) {
      return NextResponse.json({ error: "Custom request not found" }, { status: 404 })
    }

    if (customReq.status !== "quoted") {
      return NextResponse.json({ error: "Request is not in a payable quoted state" }, { status: 400 })
    }

    // 3. Get user profile details for shipping information
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    const shippingAddress = {
      name: profile?.name || user.email.split("@")[0],
      phone: profile?.phone || "",
      address: profile?.address || "Custom Order Address",
      city: "Colombo",
      zip: "00100",
    }

    const subtotal = Number(customReq.quoted_price)
    const tax = Math.round(subtotal * 0.08 * 100) / 100
    const shipping = 0 // Free standard delivery on custom quotes
    const total = subtotal + shipping + tax

    // 4. Create Order (status: pending_payment, payment_status: unpaid)
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        status: "pending_payment",
        payment_status: "unpaid",
        delivery_method: "standard",
        subtotal,
        tax,
        shipping,
        total,
        shipping_address: shippingAddress,
      })
      .select("id")
      .single()

    if (orderErr || !order) {
      console.error("Order creation failed for custom quote:", orderErr)
      return NextResponse.json({ error: "Failed to initialize order record" }, { status: 500 })
    }

    // 5. Insert matching Order Items
    // product_id must reference a valid product. If customReq has no base_product_id, we fallback to 'oak-serving-board'
    const orderItem = {
      order_id: order.id,
      product_id: customReq.base_product_id || "oak-serving-board",
      quantity: 1,
      price_at_purchase: subtotal,
      custom_options: {
        finish: customReq.finish,
        dimension: customReq.dimension,
        engraving_text: customReq.engraving_text,
        font: customReq.font,
        is_custom_studio_request: true,
      },
    }

    const { error: itemsErr } = await supabase
      .from("order_items")
      .insert(orderItem)

    if (itemsErr) {
      console.error("Inserting order item failed for custom quote:", itemsErr)
      // Cleanup parent order on failure
      await supabase.from("orders").delete().eq("id", order.id)
      return NextResponse.json({ error: "Failed to initialize order details" }, { status: 500 })
    }

    // 6. Transition custom_order_requests status to 'accepted'
    // This policy is verified under RLS for owner check
    const { error: updateReqErr } = await supabase
      .from("custom_order_requests")
      .update({ status: "accepted" })
      .eq("id", customReq.id)

    if (updateReqErr) {
      console.error("Updating custom request status failed:", updateReqErr)
      // Cleanup order & item
      await supabase.from("orders").delete().eq("id", order.id)
      return NextResponse.json({ error: "Failed to confirm quote acceptance" }, { status: 500 })
    }

    // 7. Generate PayHere Checkout Sandbox parameters & hash
    const merchantId = process.env.PAYHERE_MERCHANT_ID
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET

    if (!merchantId || !merchantSecret) {
      const missing = [];
      if (!merchantId) missing.push("PAYHERE_MERCHANT_ID");
      if (!merchantSecret) missing.push("PAYHERE_MERCHANT_SECRET");
      console.error(`PayHere Configuration Error: Missing ${missing.join(" and ")}`);
      return NextResponse.json({ 
        error: `Configuration Error: Missing ${missing.join(" and ")} on Vercel.`
      }, { status: 500 });
    }

    const hashedSecret = crypto
      .createHash("md5")
      .update(merchantSecret)
      .digest("hex")
      .toUpperCase()

    const formattedAmount = total.toFixed(2)
    const hash = crypto
      .createHash("md5")
      .update(merchantId + order.id + formattedAmount + "LKR" + hashedSecret)
      .digest("hex")
      .toUpperCase()

    const payhereParams = {
      merchant_id: merchantId,
      return_url: `${request.nextUrl.origin}/order-confirmation?order_id=${order.id}`,
      cancel_url: `${request.nextUrl.origin}/checkout?error=cancelled&order_id=${order.id}`,
      notify_url: `${request.nextUrl.origin}/api/payhere/notify`,
      order_id: order.id,
      items: `Custom Order Quote Acceptance #${order.id.slice(0, 8)}`,
      currency: "LKR",
      amount: formattedAmount,
      first_name: shippingAddress.name.split(" ")[0] || "Customer",
      last_name: shippingAddress.name.split(" ").slice(1).join(" ") || "EpCraft",
      email: user.email,
      phone: shippingAddress.phone || "",
      address: shippingAddress.address || "",
      city: shippingAddress.city || "",
      country: "Sri Lanka",
      hash: hash,
    }

    return NextResponse.json({ order_id: order.id, payhereParams })
  } catch (err) {
    console.error("Custom order accept route error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
