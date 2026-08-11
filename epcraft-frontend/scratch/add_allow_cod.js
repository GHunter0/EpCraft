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
    
    // Add allow_cod column to products table
    await client.query(`
      ALTER TABLE public.products 
      ADD COLUMN IF NOT EXISTS allow_cod boolean default true not null;
    `);
    
    console.log("allow_cod column added successfully!");
  } catch (err) {
    console.error("Error executing database update:", err);
  } finally {
    await client.end();
  }
}

run();
