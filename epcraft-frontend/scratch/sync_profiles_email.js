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
    
    // 1. Add email column to public.profiles
    await client.query(`
      ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;
    `);
    console.log("email column added to public.profiles!");

    // 2. Sync existing emails from auth.users to public.profiles
    await client.query(`
      UPDATE public.profiles p
      SET email = u.email
      FROM auth.users u
      WHERE p.id = u.id;
    `);
    console.log("Existing user emails synced!");

    // 3. Update handle_new_user trigger function to include email
    await client.query(`
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS trigger
      LANGUAGE plpgsql
      SECURITY DEFINER SET search_path = ''
      AS $$
      BEGIN
        INSERT INTO public.profiles (id, name, phone, address, is_admin, email)
        VALUES (
          new.id,
          coalesce(
            new.raw_user_meta_data->>'full_name',
            new.raw_user_meta_data->>'name',
            split_part(new.email, '@', 1)
          ),
          new.raw_user_meta_data->>'phone',
          new.raw_user_meta_data->>'address',
          false,
          new.email
        )
        ON CONFLICT (id) DO UPDATE
        SET email = excluded.email;
        RETURN new;
      END;
      $$;
    `);
    console.log("handle_new_user trigger function updated!");

  } catch (err) {
    console.error("Error executing database update:", err);
  } finally {
    await client.end();
  }
}

run();
