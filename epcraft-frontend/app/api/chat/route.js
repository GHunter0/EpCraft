import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req) {
  try {
    const body = await req.json();
    const { messages, userName } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid messages payload." },
        { status: 400 }
      );
    }

    // Extract current turn user message
    const lastUserMsg = [...messages].reverse().find((m) => m.sender === "user") || messages[messages.length - 1];
    const userQuery = lastUserMsg?.text || "";

    if (!userQuery.trim()) {
      return NextResponse.json({
        reply: "How can I assist you with EpCraft handcrafted woodwork today?",
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    let genAI = null;
    if (apiKey) {
      genAI = new GoogleGenerativeAI(apiKey);
    }

    // ----------------------------------------------------
    // 1. RAG FAQ Retrieval (Vector or Keyword Search)
    // ----------------------------------------------------
    let matchedFaqs = [];

    if (genAI) {
      try {
        const embedModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
        const embRes = await embedModel.embedContent(userQuery);
        const queryEmbedding = embRes?.embedding?.values;

        if (queryEmbedding && Array.isArray(queryEmbedding)) {
          const { data, error } = await supabase.rpc("match_faqs", {
            query_embedding: queryEmbedding,
            match_threshold: 0.25,
            match_count: 3,
          });

          if (!error && data && data.length > 0) {
            matchedFaqs = data;
          }
        }
      } catch (embErr) {
        console.warn("Vector embedding search failed, falling back to keyword search:", embErr.message);
      }
    }

    // Fallback SQL query for FAQs if vector search yielded no results
    if (matchedFaqs.length === 0) {
      const { data: keywordFaqs } = await supabase
        .from("faq_embeddings")
        .select("id, question, content, category")
        .limit(10);

      if (keywordFaqs && keywordFaqs.length > 0) {
        const lowerQ = userQuery.toLowerCase();
        const filtered = keywordFaqs.filter(
          (f) =>
            f.question.toLowerCase().includes(lowerQ) ||
            f.content.toLowerCase().includes(lowerQ) ||
            lowerQ.split(" ").some((word) => word.length > 3 && f.content.toLowerCase().includes(word))
        );
        matchedFaqs = filtered.length > 0 ? filtered : [];
      }
    }

    // ----------------------------------------------------
    // 2. Fetch & Match Products from Database (Strict Keyword Filtering)
    // ----------------------------------------------------
    let allProducts = [];
    try {
      const { data: prods, error: prodErr } = await supabase
        .from("products")
        .select("id, name, price, wood_type, material, description, in_stock, category_id")
        .limit(50);

      if (!prodErr && prods) {
        allProducts = prods;
      }
    } catch (err) {
      console.warn("Error loading products from Supabase:", err.message);
    }

    // Smart product filtering based on query keywords
    const lowerQuery = userQuery.toLowerCase();
    const stopWords = new Set(["need", "want", "show", "can", "you", "recommend", "product", "item", "good", "best", "some", "the", "for", "with", "have", "any"]);
    const queryTokens = lowerQuery
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w));

    let matchingProducts = [];
    if (queryTokens.length > 0) {
      matchingProducts = allProducts.filter((p) => {
        const pName = (p.name || "").toLowerCase();
        const pDesc = (p.description || "").toLowerCase();
        const pWood = (p.wood_type || "").toLowerCase();
        const pMat = (p.material || "").toLowerCase();

        return queryTokens.some(
          (token) =>
            pName.includes(token) ||
            pDesc.includes(token) ||
            pWood.includes(token) ||
            pMat.includes(token)
        );
      });
    }

    // ONLY strictly match relevant products if keyword matches exist.
    // If no keyword match found, do NOT output random items unless explicitly asked to browse catalog.
    const productsContextText = matchingProducts.length > 0
      ? matchingProducts
          .map(
            (p) =>
              `- Item: [${p.name}](/product/${p.id}) | Price: ${p.price} LKR | Wood: ${p.wood_type || 'Natural Timber'} | Description: ${p.description || 'Handcrafted woodwork'}`
          )
          .join("\n")
      : "No exact product matches found for the user's specific request. Suggest checking the Shop page or custom orders.";

    // ----------------------------------------------------
    // 3. Format Conversation History for Context Memory
    // ----------------------------------------------------
    const historyText = messages
      .slice(0, -1) // Exclude current user message (which is passed as current turn)
      .map((m) => `${m.sender === "user" ? "User" : "Assistant"}: ${m.text}`)
      .join("\n");

    const faqContextText = matchedFaqs.length > 0
      ? matchedFaqs.map((f) => `- Policy/FAQ [${f.category}]: ${f.question} -> ${f.content}`).join("\n")
      : "Standard delivery: 3-5 days across Sri Lanka (500 LKR, free over 15,000 LKR). 1-Year Craftsmanship Warranty.";

    const customerInfo = userName ? `LOGGED-IN CUSTOMER NAME: "${userName}"` : "CUSTOMER: Guest (unauthenticated)";

    const systemPrompt = `You are EpCraft AI Artisan Assistant, a helpful shopping guide for EpCraft (Sri Lankan handcrafted wooden furniture and decor).

${customerInfo}

CURRENCY RULE:
All prices MUST be in LKR (Sri Lankan Rupees), e.g. "15,700 LKR". Never use USD ($).

CONVERSATION STYLE & FLOW:
- DO NOT start every response with "Thank you for reaching out to EpCraft!".
- Jump straight to answering the user's question directly, clearly, and concisely.
- Remember the user's name if provided or if introduced in conversation history.

PREVIOUS CHAT HISTORY (Context Memory):
${historyText || "None (First message in session)"}

RELEVANT STORE POLICIES & FAQS:
${faqContextText}

MATCHED PRODUCT CATALOG ITEMS (STRICT MATCHES ONLY):
${productsContextText}

INSTRUCTIONS:
1. ONLY recommend products that are relevant to what the user asked for. Do NOT list unrelated products (e.g. if the user asks for wall art, ONLY recommend wall art items like [Cedar Wall Art](/product/cedar-wall-art)).
2. Format recommended product titles as Markdown links: [Product Name](/product/product-id) along with price in LKR.
3. If no matching item exists for their specific request, inform them gently and suggest custom orders.
4. Keep answers clean, conversational, and direct.

Current User Question: "${userQuery}"`;

    // ----------------------------------------------------
    // 4. Generate Response via Gemini LLM (gemini-flash-latest)
    // ----------------------------------------------------
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const result = await model.generateContent(systemPrompt);
        const responseText = result.response.text();

        if (responseText) {
          return NextResponse.json({ reply: responseText.trim() });
        }
      } catch (llmErr) {
        console.error("Gemini API Error:", llmErr);
        if (llmErr.status === 429 || llmErr.message?.includes("429")) {
          return NextResponse.json({
            reply: "The EpCraft AI assistant is currently receiving high traffic. Please try again in a moment!",
          });
        }
      }
    }

    // ----------------------------------------------------
    // 5. Dynamic Smart Fallback (Strict matching, no repetitive boilerplate)
    // ----------------------------------------------------
    let fallbackReply = "";

    if (lowerQuery.includes("delivery") || lowerQuery.includes("shipping") || lowerQuery.includes("day") || lowerQuery.includes("fee")) {
      fallbackReply = "Standard delivery across Sri Lanka takes **3–5 business days** (500 LKR fee, or **FREE** on orders above 15,000 LKR). Custom furniture items take 10–14 business days.";
    } else if (lowerQuery.includes("warranty") || lowerQuery.includes("guarantee")) {
      fallbackReply = "All EpCraft handcrafted products come with a **1-Year Craftsmanship Warranty** covering joinery, wood movement, and structural integrity.";
    } else if (lowerQuery.includes("return") || lowerQuery.includes("refund") || lowerQuery.includes("exchange")) {
      fallbackReply = "We offer a **7-day return policy** for unused standard items. Custom engraved pieces are non-refundable unless damaged in transit.";
    } else if (matchingProducts.length > 0) {
      fallbackReply = "Here is what we have in our collection:\n\n" +
        matchingProducts.map(p => `• [${p.name}](/product/${p.id}) — **${p.price} LKR** (${p.wood_type || 'Wood'})`).join("\n");
    } else {
      fallbackReply = "We don't have an exact item matching that description in our catalog right now, but our master artisans craft custom wooden pieces! You can request custom sizing or design via our Custom Orders page.";
    }

    return NextResponse.json({ reply: fallbackReply });
  } catch (error) {
    console.error("Chat API Handler error:", error);
    return NextResponse.json(
      { reply: "Sorry, I ran into an error processing your request. Please try asking again." },
      { status: 500 }
    );
  }
}
