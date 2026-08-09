import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request) {
  try {
    // Parse form-urlencoded parameters
    const formData = await request.formData()
    const payload = Object.fromEntries(formData.entries())

    const {
      merchant_id,
      order_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
      payment_id
    } = payload

    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET

    if (!merchantSecret) {
      console.error("PAYHERE_MERCHANT_SECRET is missing from environment")
      return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 })
    }

    // Verify PayHere MD5 Signature
    const hashedSecret = crypto
      .createHash("md5")
      .update(merchantSecret)
      .digest("hex")
      .toUpperCase()

    const computedHash = crypto
      .createHash("md5")
      .update(merchant_id + order_id + payhere_amount + payhere_currency + status_code + hashedSecret)
      .digest("hex")
      .toUpperCase()

    if (computedHash !== md5sig) {
      console.warn("Unauthorized PayHere callback signature mismatch")
      return NextResponse.json({ error: "Invalid Signature" }, { status: 400 })
    }

    // If validated and payment status is successful ('2' = Success/Paid)
    if (status_code === "2") {
      const supabaseAdmin = createAdminClient()

      // 1. Perform atomic stock decrement
      const { error: rpcErr } = await supabaseAdmin.rpc("decrement_order_stock", {
        p_order_id: order_id
      })

      if (rpcErr) {
        console.error(`Stock decrement failed for order ${order_id}:`, rpcErr)
        // Mark payment as paid but flag the order status as stock_error for manual action
        await supabaseAdmin
          .from("orders")
          .update({
            payment_status: "paid",
            status: "stock_error",
            payhere_order_id: payment_id
          })
          .eq("id", order_id)
        return NextResponse.json({ error: rpcErr.message || "Stock reservation failed" }, { status: 400 })
      }
      
      // 2. Update order status using service role to bypass RLS
      const { error } = await supabaseAdmin
        .from("orders")
        .update({
          payment_status: "paid",
          status: "processing",
          payhere_order_id: payment_id // Save reference ID
        })
        .eq("id", order_id)

      if (error) {
        console.error(`Failed to update order ${order_id} to paid:`, error)
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
      }

      console.log(`Order ${order_id} successfully paid and stock decremented. PayHere ref: ${payment_id}`)
    } else {
      console.log(`Payment status code ${status_code} received for Order ${order_id}`)
    }

    return new Response("OK", { status: 200 })
  } catch (err) {
    console.error("PayHere notify route error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
