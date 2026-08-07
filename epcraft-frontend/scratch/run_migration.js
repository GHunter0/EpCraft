const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Parse environment variables manually
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

// Clean brackets
let cleanedConnectionString = connectionString.replace(/:\s*\[([^\]]+)\]\s*@/, ':$1@');

// Use transaction pooling IP (one of the resolved IPv4: 54.255.219.82) on port 6543
const poolerUrl = new URL(cleanedConnectionString);
const targetIp = '54.255.219.82';
const projectRef = 'tqgnhkhcepvtfujvbnte';

// Decode URL percent encoded characters from password if any
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

    // Let's create two test auth users using auth schema
    const userIdA = '11111111-1111-1111-1111-111111111111';
    const userIdB = '22222222-2222-2222-2222-222222222222';

    // Insert temp auth users
    await client.query(`
      insert into auth.users (id, email)
      values ('${userIdA}', 'usera@epcraft.com'), ('${userIdB}', 'userb@epcraft.com')
      on conflict (id) do nothing;
    `);

    // Insert temp profiles
    await client.query(`
      insert into public.profiles (id, name, is_admin)
      values ('${userIdA}', 'User A', false), ('${userIdB}', 'User B', false)
      on conflict (id) do update set name = excluded.name;
    `);

    // Let's insert a cart item, order, and wishlist item for User B
    await client.query(`
      insert into public.cart_items (user_id, product_id, quantity)
      values ('${userIdB}', 'walnut-dining-table', 1)
      on conflict do nothing;

      insert into public.wishlist_items (user_id, product_id)
      values ('${userIdB}', 'walnut-dining-table')
      on conflict do nothing;
    `);

    console.log("Setup test data done. Testing RLS now...");

    // Now test RLS. We can simulate session by setting config local request auth claim values.
    // 'request.jwt.claims' sets auth context in Supabase Postgres.
    await client.query("BEGIN;");
    await client.query(`set local request.jwt.claims = '{"sub": "${userIdA}"}';`);
    await client.query(`set local role = 'authenticated';`);

    // 1. User A tries to SELECT User B's cart
    const cartRes = await client.query(`select * from public.cart_items where user_id = '${userIdB}';`);
    console.log("RLS SELECT user B's cart by user A (should be 0 rows):", cartRes.rows.length);

    // 2. User A tries to DELETE User B's cart
    const deleteRes = await client.query(`delete from public.cart_items where user_id = '${userIdB}';`);
    console.log("RLS DELETE user B's cart by user A (should delete 0 rows):", deleteRes.rowCount);

    // 3. User A tries to SELECT User B's profile
    const profileRes = await client.query(`select * from public.profiles where id = '${userIdB}';`);
    console.log("RLS SELECT user B's profile by user A (should be 0 rows):", profileRes.rows.length);

    await client.query("COMMIT;");
    
    // Clean up
    await client.query(`delete from public.profiles where id in ('${userIdA}', '${userIdB}');`);
    await client.query(`delete from auth.users where id in ('${userIdA}', '${userIdB}');`);
    console.log("Test finished!");
  } catch (err) {
    console.error("Database connection/query failed:", err);
  } finally {
    await client.end();
  }
}

run();
