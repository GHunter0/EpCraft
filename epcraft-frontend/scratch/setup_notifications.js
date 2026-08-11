const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    }
    env[key] = value.trim();
  }
});

const connectionString = env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set in env");
  process.exit(1);
}

const cleanedConnectionString = connectionString.replace(/:\s*\[([^\]]+)\]\s*@/, ':$1@');
const poolerUrl = new URL(cleanedConnectionString);
const targetIp = '54.255.219.82';
const rawPassword = decodeURIComponent(poolerUrl.password);
const username = `postgres.tqgnhkhcepvtfujvbnte`;

const client = new Client({
  host: targetIp,
  port: 6543,
  database: 'postgres',
  user: username,
  password: rawPassword,
  ssl: {
    rejectUnauthorized: false
  }
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to PostgreSQL successfully!");
    
    // 1. Create public.notifications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.notifications (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id uuid NOT null REFERENCES public.profiles(id) ON DELETE CASCADE,
        title text NOT null,
        message text NOT null,
        link text,
        is_read boolean DEFAULT false NOT null,
        created_at timestamptz DEFAULT now() NOT null
      );
    `);
    console.log("notifications table verified/created!");

    // 2. Enable RLS and add policies
    await client.query(`
      ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "Users can select own notifications" ON public.notifications;
      DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
      
      CREATE POLICY "Users can select own notifications"
        ON public.notifications FOR SELECT
        USING (auth.uid() = user_id);

      CREATE POLICY "Users can update own notifications"
        ON public.notifications FOR UPDATE
        USING (auth.uid() = user_id);
    `);
    console.log("RLS policies applied to notifications table!");

    // 3. Create Custom Request status change notification trigger
    await client.query(`
      CREATE OR REPLACE FUNCTION public.handle_custom_request_notification()
      RETURNS trigger
      LANGUAGE plpgsql
      SECURITY DEFINER SET search_path = ''
      AS $$
      BEGIN
        IF NEW.status IS DISTINCT FROM OLD.status THEN
          IF NEW.status = 'quoted' THEN
            INSERT INTO public.notifications (user_id, title, message, link)
            VALUES (
              NEW.user_id,
              'Quote Prepared',
              'Your custom quote has been prepared. Review details and proceed to checkout.',
              '/account'
            );
          ELSIF NEW.status = 'declined' THEN
            INSERT INTO public.notifications (user_id, title, message, link)
            VALUES (
              NEW.user_id,
              CASE WHEN NEW.rejection_reason IS NOT NULL THEN 'Request Declined' ELSE 'Request Cancelled' END,
              COALESCE(NEW.rejection_reason, 'Your custom design request was cancelled.'),
              '/account'
            );
          END IF;
        END IF;
        RETURN NEW;
      END;
      $$;

      DROP TRIGGER IF EXISTS tr_custom_request_notification ON public.custom_order_requests;
      CREATE TRIGGER tr_custom_request_notification
        AFTER UPDATE ON public.custom_order_requests
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_custom_request_notification();
    `);
    console.log("custom_order_requests trigger created!");

    // 4. Create Order status & payment status change notification trigger
    await client.query(`
      CREATE OR REPLACE FUNCTION public.handle_order_notification()
      RETURNS trigger
      LANGUAGE plpgsql
      SECURITY DEFINER SET search_path = ''
      AS $$
      DECLARE
        v_status_label text;
      BEGIN
        IF NEW.status IS DISTINCT FROM OLD.status OR NEW.payment_status IS DISTINCT FROM OLD.payment_status THEN
          -- Order status notifications
          IF NEW.status IS DISTINCT FROM OLD.status THEN
            CASE NEW.status
              WHEN 'processing' THEN v_status_label := 'Order Placed';
              WHEN 'crafting' THEN v_status_label := 'In Production';
              WHEN 'quality_check' THEN v_status_label := 'Quality Check';
              WHEN 'shipped' THEN v_status_label := 'Shipped';
              WHEN 'delivered' THEN v_status_label := 'Delivered';
              ELSE v_status_label := NEW.status;
            END CASE;

            INSERT INTO public.notifications (user_id, title, message, link)
            VALUES (
              NEW.user_id,
              'Order Update: ' || v_status_label,
              'Your order #' || UPPER(SUBSTRING(NEW.id::text, 1, 8)) || ' is now in status: ' || v_status_label || '.',
              '/orders'
            );
          END IF;

          -- Payment status notifications
          IF NEW.payment_status IS DISTINCT FROM OLD.payment_status AND NEW.payment_status = 'paid' THEN
            INSERT INTO public.notifications (user_id, title, message, link)
            VALUES (
              NEW.user_id,
              'Payment Confirmed',
              'Payment for order #' || UPPER(SUBSTRING(NEW.id::text, 1, 8)) || ' was successful. Thank you!',
              '/orders'
            );
          END IF;
        END IF;
        RETURN NEW;
      END;
      $$;

      DROP TRIGGER IF EXISTS tr_order_notification ON public.orders;
      CREATE TRIGGER tr_order_notification
        AFTER UPDATE ON public.orders
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_order_notification();
    `);
    console.log("orders trigger created!");

  } catch (err) {
    console.error("Error executing database update:", err);
  } finally {
    await client.end();
  }
}

run();
