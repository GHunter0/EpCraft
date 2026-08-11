import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignore in Route Handler
            }
          },
        },
      }
    )

    // Retrieve user session
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { shippingAddress, deliveryMethod, cartItems, paymentMethod = "card", customRequestId = null } = body

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
    }

    let subtotal = 0
    const orderItemsToInsert = []

    if (customRequestId) {
      const { data: customReq, error: customReqErr } = await supabase
        .from("custom_order_requests")
        .select("quoted_price, base_product_id, finish, dimension, engraving_text, font, status")
        .eq("id", customRequestId)
        .eq("user_id", user.id)
        .single();

      if (customReqErr || !customReq) {
        return NextResponse.json({ error: "Custom order request not found" }, { status: 404 })
      }

      if (customReq.status !== "quoted") {
        return NextResponse.json({ error: "Custom request is not in a payable quoted state" }, { status: 400 })
      }

      const itemPrice = Number(customReq.quoted_price)
      subtotal = itemPrice

      orderItemsToInsert.push({
        product_id: customReq.base_product_id || "oak-serving-board",
        quantity: 1,
        price_at_purchase: itemPrice,
        custom_options: {
          finish: customReq.finish,
          dimension: customReq.dimension,
          engraving_text: customReq.engraving_text,
          font: customReq.font,
          is_custom_studio_request: true,
          custom_request_id: customRequestId,
        },
      })
    } else {
      // Fetch product details from DB to calculate subtotal server-side (do not trust client price)
      const productIds = cartItems.map((item) => item.id)
      const { data: dbProducts, error: dbErr } = await supabase
        .from("products")
        .select("id, name, price, stock, allow_backorder")
        .in("id", productIds)

      if (dbErr || !dbProducts) {
        return NextResponse.json({ error: "Failed to verify products" }, { status: 500 })
      }

      for (const cartItem of cartItems) {
        const dbProduct = dbProducts.find((p) => p.id === cartItem.id)
        if (!dbProduct) {
          return NextResponse.json({ error: `Product not found: ${cartItem.id}` }, { status: 400 })
        }

        // Check stock availability
        if (!dbProduct.allow_backorder && Number(dbProduct.stock) < cartItem.quantity) {
          return NextResponse.json({ 
            error: `Insufficient stock for product "${dbProduct.name}". Only ${dbProduct.stock} unit(s) left.` 
          }, { status: 400 })
        }
        
        const itemPrice = Number(dbProduct.price)
        subtotal += itemPrice * cartItem.quantity
        
        orderItemsToInsert.push({
          product_id: cartItem.id,
          quantity: cartItem.quantity,
          price_at_purchase: itemPrice,
          custom_options: cartItem.customOptions || null,
        })
      }
    }

    // Fetch store settings for shipping & tax rates
    const { data: settings, error: settingsErr } = await supabase
      .from("store_settings")
      .select("standard_shipping, express_shipping, tax_percentage")
      .eq("id", 1)
      .single()

    const standardShipping = settings ? Number(settings.standard_shipping) : 0
    const expressShipping = settings ? Number(settings.express_shipping) : 150
    const taxPercentage = settings ? Number(settings.tax_percentage) : 8

    // Calculations
    const shipping = deliveryMethod === "express" ? expressShipping : standardShipping
    const tax = Math.round(subtotal * (taxPercentage / 100) * 100) / 100
    const total = subtotal + shipping + tax

    // Create the order row
    const isCOD = paymentMethod === "cod"
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        status: isCOD ? "processing" : "pending_payment",
        payment_status: "unpaid",
        payhere_order_id: isCOD ? "COD" : null,
        delivery_method: deliveryMethod,
        subtotal,
        tax,
        shipping,
        total,
        shipping_address: shippingAddress,
      })
      .select("id")
      .single()

    if (orderErr || !order) {
      console.error("Order creation failed:", orderErr)
      return NextResponse.json({ error: "Order creation failed" }, { status: 500 })
    }

    // Add order_id to order items and insert them
    const items = orderItemsToInsert.map((item) => ({
      ...item,
      order_id: order.id,
    }))

    const { error: itemsErr } = await supabase.from("order_items").insert(items)
    if (itemsErr) {
      console.error("Inserting order items failed:", itemsErr)
      // Delete parent order on failure to clean up
      await supabase.from("orders").delete().eq("id", order.id)
      return NextResponse.json({ error: "Failed to process order items" }, { status: 500 })
    }

    if (customRequestId) {
      const { error: updateReqErr } = await supabase
        .from("custom_order_requests")
        .update({ status: "accepted" })
        .eq("id", customRequestId)
      if (updateReqErr) {
        console.error("Failed to transition custom request to accepted status:", updateReqErr)
      }
    }

    if (isCOD) {
      return NextResponse.json({ success: true, orderId: order.id })
    }

    // PayHere parameters generation
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
    
    // Hash formula: UPPERCASE(MD5(merchant_id + order_id + formatted_amount + currency + UPPERCASE(MD5(merchant_secret))))
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
      notify_url: `https://tqgnhkhcepvtfujvbnte.supabase.co/functions/v1/payhere-notify`, // Temporary placeholder, user updates tunnel URL if needed, we also make our API endpoint
      order_id: order.id,
      items: `EpCraft Order #${order.id.slice(0, 8)}`,
      currency: "LKR",
      amount: formattedAmount,
      first_name: shippingAddress.name?.split(" ")[0] || "Customer",
      last_name: shippingAddress.name?.split(" ").slice(1).join(" ") || "EpCraft",
      email: user.email,
      phone: shippingAddress.phone || "",
      address: shippingAddress.address || "",
      city: shippingAddress.city || "",
      country: "Sri Lanka",
      hash: hash,
    }

    // Set correct notify_url to point to our Next.js API endpoint, but since PayHere sandbox needs a public URL, we pass it dynamically or allow local routing
    // Let's specify our Next.js notify endpoint:
    payhereParams.notify_url = `${request.nextUrl.origin}/api/payhere/notify`

    return NextResponse.json({ order_id: order.id, payhereParams })
  } catch (err) {
    console.error("Order creation route error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
