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
    
    // Update Orders RLS insert policy
    await client.query(`
      DROP POLICY IF EXISTS "Users insert own initial orders" ON public.orders;
      CREATE POLICY "Users insert own initial orders"
        ON public.orders FOR INSERT
        TO authenticated
        WITH CHECK (
          auth.uid() = user_id
          AND (status = 'pending_payment' OR status = 'processing')
          AND payment_status = 'unpaid'
        );
    `);
    
    console.log("Orders RLS policy updated successfully!");
  } catch (err) {
    console.error("Error executing database update:", err);
  } finally {
    await client.end();
  }
}

run();
