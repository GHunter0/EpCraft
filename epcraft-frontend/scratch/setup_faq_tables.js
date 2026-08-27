const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const envPath = path.join(__dirname, '..', '.env.local');
let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

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
  console.error("❌ DATABASE_URL is not set in .env.local");
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

const faqsData = [
  {
    question: "How long does shipping and delivery take in Sri Lanka?",
    category: "delivery",
    content: "Standard nationwide delivery across Sri Lanka takes 3 to 5 business days. Custom crafted or engraved wood furniture takes 10 to 14 business days. Standard delivery fee is 500 LKR, with FREE delivery on orders over 15,000 LKR."
  },
  {
    question: "What is EpCraft's warranty and guarantee policy?",
    category: "warranty",
    content: "Every EpCraft handcrafted piece comes with a 1-Year Craftsmanship Warranty covering joinery, structural integrity, and wood defects. We also offer free finish touch-up advice."
  },
  {
    question: "What is your return and exchange policy?",
    category: "returns",
    content: "We offer a 7-day hassle-free return or exchange for any standard items in unused condition. Custom or engraved orders cannot be returned unless damaged during delivery."
  },
  {
    question: "Can I request custom sizing, engraving, or wood species?",
    category: "customization",
    content: "Yes! EpCraft specializes in bespoke woodwork. You can submit custom specifications (dimensions, mahogany, teak, oak, satinwood, or custom laser engraving) via our Custom Orders page."
  },
  {
    question: "What payment methods are accepted in Sri Lanka?",
    category: "payment",
    content: "We accept online payments in LKR via PayHere (Credit/Debit cards, Visa, Mastercard) as well as Cash on Delivery (COD) for eligible standard items."
  },
  {
    question: "How should I care for and clean handcrafted wood products?",
    category: "care",
    content: "Wipe down with a soft, slightly damp cloth. Avoid harsh chemicals or direct prolonged sunlight exposure. Re-apply natural beeswax or teak oil once every 6 months to maintain grain sheen."
  },
  {
    question: "Do you offer bulk or wholesale discounts for corporate gifts?",
    category: "wholesale",
    content: "Yes, EpCraft provides wholesale and bulk ordering for hotels, corporate gifting, and interior designers with custom branding options. Visit our Wholesale page or contact our team for quotes."
  }
];

async function run() {
  try {
    await client.connect();
    console.log("⚡ Connected to PostgreSQL database!");

    // 1. Create pgvector extension
    await client.query(`CREATE EXTENSION IF NOT EXISTS vector;`);

    // Drop previous table/function if dimension changed
    await client.query(`DROP TABLE IF EXISTS public.faq_embeddings CASCADE;`);

    // 2. Create faq_embeddings table with VECTOR(3072)
    await client.query(`
      CREATE TABLE public.faq_embeddings (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        question TEXT NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'general',
        embedding VECTOR(3072),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 3. Enable RLS and add public read policy
    await client.query(`
      ALTER TABLE public.faq_embeddings ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Allow public read access to FAQ embeddings" ON public.faq_embeddings;
      CREATE POLICY "Allow public read access to FAQ embeddings"
        ON public.faq_embeddings FOR SELECT TO public USING (true);
    `);

    // 4. Create match_faqs RPC function
    await client.query(`
      CREATE OR REPLACE FUNCTION match_faqs (
        query_embedding VECTOR(3072),
        match_threshold FLOAT DEFAULT 0.3,
        match_count INT DEFAULT 4
      )
      RETURNS TABLE (
        id BIGINT,
        question TEXT,
        content TEXT,
        category VARCHAR(50),
        similarity FLOAT
      )
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        RETURN QUERY
        SELECT
          fe.id,
          fe.question,
          fe.content,
          fe.category,
          (1 - (fe.embedding <=> query_embedding))::FLOAT AS similarity
        FROM public.faq_embeddings fe
        WHERE (1 - (fe.embedding <=> query_embedding)) > match_threshold
        ORDER BY fe.embedding <=> query_embedding
        LIMIT match_count;
      END;
      $$;
    `);

    console.log("✅ Database schema & match_faqs function updated to VECTOR(3072)!");

    // 5. Check GEMINI_API_KEY
    const apiKey = env.GEMINI_API_KEY;
    let genAI = null;
    if (apiKey) {
      genAI = new GoogleGenerativeAI(apiKey);
    } else {
      console.log("⚠️ GEMINI_API_KEY not found in .env.local.");
    }

    for (const faq of faqsData) {
      let vectorStr = null;
      if (genAI) {
        try {
          const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
          const textToEmbed = `${faq.question} ${faq.content}`;
          const result = await model.embedContent(textToEmbed);
          const values = result.embedding.values; // Array of 3072 floats
          vectorStr = `[${values.join(',')}]`;
        } catch (embErr) {
          console.error(`Failed to generate embedding for "${faq.question}":`, embErr.message);
        }
      }

      if (vectorStr) {
        await client.query(
          `INSERT INTO public.faq_embeddings (question, content, category, embedding) VALUES ($1, $2, $3, $4::vector)`,
          [faq.question, faq.content, faq.category, vectorStr]
        );
      } else {
        await client.query(
          `INSERT INTO public.faq_embeddings (question, content, category) VALUES ($1, $2, $3)`,
          [faq.question, faq.content, faq.category]
        );
      }
      console.log(`📌 Seeded FAQ with 3072-vector: ${faq.question}`);
    }

    console.log("🎉 All FAQs & Vector Embeddings successfully generated and seeded!");
  } catch (err) {
    console.error("❌ Error executing database update:", err);
  } finally {
    await client.end();
  }
}

run();
