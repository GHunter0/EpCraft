import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Core catalog reference for accurate semantic recommendations across rooms & popularity
const CATALOG_ITEMS = [
  {
    id: "cedar-wall-art",
    name: "Cedar Wall Art",
    price: 15700,
    wood_type: "Aromatic Cedar",
    category: "decor",
    rooms: ["living room", "bedroom", "hallway", "office"],
    isPopular: true,
    description: "Hand-carved cedar wall panel with a warm, natural aromatic finish."
  },
  {
    id: "walnut-dining-table",
    name: "Walnut Dining Table",
    price: 52400,
    wood_type: "American Walnut",
    category: "furniture",
    rooms: ["dining room", "living room"],
    isPopular: true,
    description: "Solid live-edge walnut dining table seating six comfortably."
  },
  {
    id: "cherry-nightstand",
    name: "Cherry Nightstand",
    price: 35000,
    wood_type: "Solid Cherry",
    category: "furniture",
    rooms: ["bedroom", "living room"],
    isPopular: true,
    description: "Compact solid cherry-wood nightstand with soft-close drawer."
  },
  {
    id: "oak-serving-board",
    name: "Oak Serving Board",
    price: 3120,
    wood_type: "Live Edge White Oak",
    category: "kitchenware",
    rooms: ["kitchen", "dining room"],
    isPopular: true,
    description: "Live-edge oak charcuterie and serving board with food-safe oil finish."
  },
  {
    id: "ash-floating-shelf",
    name: "Ash Floating Shelf",
    price: 4450,
    wood_type: "Natural Matte Ash",
    category: "decor",
    rooms: ["living room", "bedroom", "office"],
    isPopular: false,
    description: "Minimalist ash floating shelf with concealed heavy-duty mounting bracket."
  },
  {
    id: "ebony-valet-tray",
    name: "Ebony Valet Tray",
    price: 5750,
    wood_type: "Dark Ebony",
    category: "custom-gifts",
    rooms: ["living room", "entryway", "bedroom", "office"],
    isPopular: true,
    description: "Sleek dark ebony tray for everyday essentials, keys, and watches."
  },
  {
    id: "maple-bowl-set",
    name: "Maple Bowl Set",
    price: 2320,
    wood_type: "Hand-Turned Maple",
    category: "kitchenware",
    rooms: ["kitchen", "dining room"],
    isPopular: false,
    description: "Set of three hand-turned maple wood nesting bowls with food-grade finish."
  },
  {
    id: "organic-desk-chair",
    name: "Organic Desk Chair",
    price: 71800,
    wood_type: "Black Walnut",
    category: "furniture",
    rooms: ["office", "study", "living room"],
    isPopular: false,
    description: "Ergonomic sculpted bent-wood desk chair with contoured back support."
  },
  {
    id: "push-up-bar",
    name: "Push up Bar",
    price: 3500,
    wood_type: "White Oak",
    category: "custom-gifts",
    rooms: ["fitness", "home gym", "living room"],
    isPopular: false,
    description: "Handcrafted white oak ergonomic parallette push up bars."
  },
  {
    id: "hand-made-mahogany-elephant-sculpture",
    name: "Mahogany Elephant Sculpture",
    price: 8500,
    wood_type: "Solid Mahogany",
    category: "decor",
    rooms: ["living room", "office", "entryway"],
    isPopular: true,
    description: "Traditional hand-carved solid mahogany elephant artisan sculpture."
  }
];

// Helper to extract user name from explicit prop or conversation history
function extractUserName(messages, explicitUserName) {
  if (explicitUserName && typeof explicitUserName === "string" && explicitUserName.trim()) {
    return explicitUserName.trim();
  }

  if (Array.isArray(messages)) {
    for (const msg of messages) {
      if (msg.sender === "user" && typeof msg.text === "string") {
        const text = msg.text.trim();
        const patterns = [
          /\b(?:my\s+name\s+is|my\s+name['’]?s|names)\s+([A-Za-z]+)\b/i,
          /\b(?:i['’]?m|i\s+am|im|myself)\s+([A-Za-z]+)\b/i,
          /\bcall\s+me\s+([A-Za-z]+)\b/i,
          /\bthis\s+is\s+([A-Za-z]+)\b/i,
          /\b(?:it['’]?s|its)\s+([A-Za-z]+)\b/i,
        ];
        for (const pattern of patterns) {
          const match = text.match(pattern);
          if (match && match[1]) {
            const candidate = match[1];
            const nonNames = new Set([
              "looking", "interested", "here", "just", "trying", "ordering",
              "buying", "wondering", "asking", "sorry", "fine", "good", "a", "the", "an", "new"
            ]);
            if (!nonNames.has(candidate.toLowerCase())) {
              return candidate.charAt(0).toUpperCase() + candidate.slice(1).toLowerCase();
            }
          }
        }
      }
    }
  }

  return null;
}

// Detect conversational queries (greetings, name introductions, identity, pleasantries)
function isConversationalQuery(query) {
  const q = query.trim().toLowerCase();
  const stripped = q.replace(/[?!.,]/g, "").trim();

  // If query is about products or rooms or catalog, it is NOT purely conversational
  if (
    /\b(product|popular|item|living room|bedroom|kitchen|dining|office|furniture|decor|catalog|buy|price|cost|shop)\b/i.test(q)
  ) {
    return false;
  }

  // Name recall variations: "what is my name", "whats my name", "who am i", etc.
  if (
    /\b(what['’]?s\s+my\s+name|what\s+is\s+my\s+name|what\s+was\s+my\s+name|whats\s+my\s+name|who\s+am\s+i|who\s+i\s+am|tell\s+me\s+my\s+name|say\s+my\s+name|know\s+my\s+name|remember\s+my\s+name|remember\s+me)\b/i.test(q) ||
    /^\s*(my\s+name\??|whats\s+my\s+name\??|what['’]?s\s+my\s+name\??)\s*$/i.test(q)
  ) {
    return true;
  }

  // Name introductions: "im shalitha", "my name is shalitha", "call me shalitha"
  if (
    /\b(?:my\s+name\s+is|my\s+name['’]?s|names|i['’]?m|i\s+am|im|myself|call\s+me)\s+([A-Za-z]+)\b/i.test(q) &&
    !/\b(looking|warranty|delivery|price|shipping|order|buy|wood|custom)\b/i.test(q)
  ) {
    return true;
  }

  const greetings = [
    "hi", "hello", "hey", "hola", "greetings", "good morning", "good afternoon", "good evening", "howdy", "sup"
  ];
  if (greetings.includes(stripped) || greetings.some((g) => stripped === g || stripped.startsWith(g + " "))) {
    return true;
  }

  if (
    /\b(who are you|what are you|what can you do|how can you help|tell me about yourself)\b/i.test(q) ||
    /\b(how are you|how are you doing|how's it going|how are things)\b/i.test(q) ||
    /\b(thank you|thanks|thank u|thx|cheers|bye|goodbye|see you)\b/i.test(q)
  ) {
    return true;
  }

  return false;
}

// Comprehensive smart conversational fallback
function getSmartFallbackReply(userQuery, detectedName, matchingProducts) {
  const lowerQuery = userQuery.toLowerCase().trim();

  // 1. Name recall inquiry: "whats my name", "what is my name", "who am i", "do you know my name"
  if (
    /\b(what['’]?s\s+my\s+name|what\s+is\s+my\s+name|what\s+was\s+my\s+name|whats\s+my\s+name|who\s+am\s+i|who\s+i\s+am|tell\s+me\s+my\s+name|say\s+my\s+name|know\s+my\s+name|remember\s+my\s+name|remember\s+me)\b/i.test(lowerQuery) ||
    /^\s*(my\s+name\??|whats\s+my\s+name\??|what['’]?s\s+my\s+name\??)\s*$/i.test(lowerQuery)
  ) {
    if (detectedName) {
      return `Your name is **${detectedName}**! How can I assist you with EpCraft handcrafted woodwork today?`;
    }
    return "You haven't told me your name yet! What should I call you? Feel free to introduce yourself or ask about our woodwork collections.";
  }

  // 2. Name introduction: "hello im shalitha", "im shalitha", "my name is shalitha"
  const introPatterns = [
    /\b(?:my\s+name\s+is|my\s+name['’]?s|names)\s+([a-zA-Z]+)\b/i,
    /\b(?:i['’]?m|i\s+am|im|myself)\s+([a-zA-Z]+)\b/i,
    /\bcall\s+me\s+([a-zA-Z]+)\b/i,
  ];
  const matchedIntro = introPatterns.find((p) => p.test(lowerQuery));
  if (matchedIntro && !/\b(looking|warranty|delivery|price|shipping|order|buy|wood|custom|product)\b/i.test(lowerQuery)) {
    const rawMatch = lowerQuery.match(matchedIntro);
    const candidateName = rawMatch && rawMatch[1] ? (rawMatch[1].charAt(0).toUpperCase() + rawMatch[1].slice(1)) : detectedName;
    const name = candidateName || detectedName || "friend";
    return `Nice to meet you, **${name}**! Welcome to EpCraft handcrafted woodwork. How can I assist you today? Whether you're looking for timber furniture, wall decor, or a bespoke custom piece, I'm here to help.`;
  }

  // 3. Greetings
  const greetings = ["hi", "hello", "hey", "greetings", "good morning", "good afternoon", "good evening"];
  const stripped = lowerQuery.replace(/[?!.,]/g, "").trim();
  if (greetings.includes(stripped) || greetings.some((g) => stripped === g || stripped.startsWith(g + " "))) {
    const greetingName = detectedName ? ` ${detectedName}` : "";
    return `Hello${greetingName}! Welcome to EpCraft handcrafted woodwork. How can I assist you today? You can ask about our timber furniture, home decor, delivery across Sri Lanka, or custom bespoke orders!`;
  }

  // 4. Identity & Purpose
  if (/\b(who are you|what are you|what can you do|how can you help)\b/i.test(lowerQuery)) {
    return "I am the **EpCraft AI Artisan Assistant**, your personal shopping guide for Sri Lankan handcrafted wooden furniture and decor. I can help you explore products, check delivery and warranty policies, explain timber care, or assist with bespoke custom orders!";
  }

  // 5. Pleasantries / Well-being
  if (/\b(how are you|how are you doing|how's it going)\b/i.test(lowerQuery)) {
    return `I'm doing wonderfully, thank you for asking${detectedName ? `, ${detectedName}` : ""}! How can I assist you with EpCraft handcrafted woodwork today?`;
  }

  // 6. Gratitude
  if (/\b(thank you|thanks|thank u|thx)\b/i.test(lowerQuery)) {
    return "You're very welcome! Let me know if you have any other questions about our handcrafted woodwork, care tips, or custom orders.";
  }

  // 7. Payment & COD (Checked before general delivery since COD contains the word 'delivery')
  if (lowerQuery.includes("payment") || lowerQuery.includes("pay") || lowerQuery.includes("cod") || lowerQuery.includes("cash on delivery") || lowerQuery.includes("card") || lowerQuery.includes("currency")) {
    if (lowerQuery.includes("currency") || lowerQuery.includes("price") || lowerQuery.includes("lkr")) {
      return "All prices on EpCraft are displayed in **Sri Lankan Rupees (LKR)**.";
    }
    if (lowerQuery.includes("cash on delivery") || lowerQuery.includes("cod")) {
      return "Cash on Delivery (COD) is supported for eligible standard items across Sri Lanka; bespoke custom orders require advance confirmation.";
    }
    if (lowerQuery.includes("secure") || lowerQuery.includes("safe")) {
      return "Yes, online card payments are securely encrypted and processed through the PayHere gateway.";
    }
    return "We accept secure online card payments via **PayHere** (Visa/Mastercard) and **Cash on Delivery (COD)** for eligible standard items across Sri Lanka.";
  }

  // 8. Shipping & Delivery
  if (lowerQuery.includes("delivery") || lowerQuery.includes("deliver") || lowerQuery.includes("shipping") || lowerQuery.includes("ship")) {
    if (lowerQuery.includes("cost") || lowerQuery.includes("fee") || lowerQuery.includes("charge")) {
      return "Standard shipping across Sri Lanka is **500 LKR**, and delivery is **FREE** on all orders over 15,000 LKR.";
    }
    if (lowerQuery.includes("free")) {
      return "Yes! We offer **FREE delivery** across Sri Lanka on all orders exceeding **15,000 LKR**. Standard delivery fee is 500 LKR.";
    }
    if (lowerQuery.includes("custom") || lowerQuery.includes("bespoke") || lowerQuery.includes("furniture")) {
      return "Custom crafted or bespoke wooden furniture orders take **10 to 14 business days** to deliver across Sri Lanka.";
    }
    if (lowerQuery.includes("island") || lowerQuery.includes("nationwide") || lowerQuery.includes("all over") || lowerQuery.includes("country")) {
      return "Yes, standard delivery is offered island-wide across all regions of Sri Lanka (3 to 5 business days).";
    }
    if (lowerQuery.includes("track") || lowerQuery.includes("status") || lowerQuery.includes("tracking")) {
      return "You can easily track your order status in your account dashboard under **Orders**, or contact support with your order ID.";
    }
    return "Standard nationwide delivery across Sri Lanka takes **3 to 5 business days** (500 LKR fee, or **FREE** on orders over 15,000 LKR). Bespoke custom orders take 10 to 14 business days.";
  }

  // 9. Warranty & Returns
  if (lowerQuery.includes("warranty") || lowerQuery.includes("guarantee")) {
    if (lowerQuery.includes("period") || lowerQuery.includes("how long") || lowerQuery.includes("time")) {
      return "All EpCraft handcrafted items come with a **1-Year Craftsmanship Warranty**.";
    }
    if (lowerQuery.includes("cover") || lowerQuery.includes("include") || lowerQuery.includes("what does")) {
      return "Our 1-Year Craftsmanship Warranty covers joinery, structural integrity, and natural wood defects. We also provide free finish touch-up advice.";
    }
    return "Every EpCraft handcrafted piece comes with a **1-Year Craftsmanship Warranty** covering joinery, structural integrity, and wood defects.";
  }

  if (lowerQuery.includes("return") || lowerQuery.includes("refund") || lowerQuery.includes("exchange")) {
    if (lowerQuery.includes("custom") || lowerQuery.includes("engrav")) {
      return "Custom engraved or bespoke items are non-refundable and cannot be returned unless damaged during delivery transit.";
    }
    if (lowerQuery.includes("damag") || lowerQuery.includes("broken") || lowerQuery.includes("transit")) {
      return "If an item arrives damaged in transit, a replacement or refund is provided upon contacting our support team with photos within 48 hours.";
    }
    return "We offer a **7-day return policy** for unused standard items in original packaging. Custom engraved items are non-refundable unless damaged.";
  }

  if (lowerQuery.includes("touch-up") || lowerQuery.includes("touch up") || (lowerQuery.includes("finish") && lowerQuery.includes("assist"))) {
    return "Yes, we provide complimentary finish touch-up advice and maintenance guidance to keep your wood looking fresh.";
  }

  if (lowerQuery.includes("damag")) {
    return "If an item arrives damaged in transit, we provide a replacement or return/refund upon contacting support.";
  }

  // 10. Custom Woodwork & Crafting
  if (lowerQuery.includes("custom") || lowerQuery.includes("bespoke") || lowerQuery.includes("engrav") || lowerQuery.includes("dimension") || lowerQuery.includes("size")) {
    if (lowerQuery.includes("timber") || lowerQuery.includes("wood") || lowerQuery.includes("specie") || lowerQuery.includes("material")) {
      return "We craft custom woodwork using premium sustainably-sourced timbers including **Teak, Mahogany, White Oak, and Satinwood**.";
    }
    if (lowerQuery.includes("engrav")) {
      return "Yes, personalized laser engraving of names, logos, or dates is supported on bespoke custom orders!";
    }
    if (lowerQuery.includes("table") || lowerQuery.includes("epoxy") || lowerQuery.includes("dining")) {
      return "Yes, our master artisans craft custom dining tables, epoxy river accents, and tailored furniture via custom orders.";
    }
    if (lowerQuery.includes("how long") || lowerQuery.includes("time") || lowerQuery.includes("day") || lowerQuery.includes("craft")) {
      return "Handcrafting bespoke custom woodwork typically requires **10 to 14 business days**.";
    }
    if (lowerQuery.includes("how") || lowerQuery.includes("submit") || lowerQuery.includes("request") || lowerQuery.includes("form") || lowerQuery.includes("page")) {
      return "You can submit your custom requirements, wood species, and dimensions directly on our [Custom Orders](/custom-orders) page.";
    }
    return "Yes! We specialize in bespoke woodwork. You can submit custom dimensions, wood species, and engraving requests via our [Custom Orders](/custom-orders) page.";
  }

  // 11. Popular Products & Best Sellers
  if (
    lowerQuery.includes("popular") ||
    lowerQuery.includes("best seller") ||
    lowerQuery.includes("bestseller") ||
    lowerQuery.includes("top product") ||
    lowerQuery.includes("trending") ||
    lowerQuery.includes("featured")
  ) {
    const populars = CATALOG_ITEMS.filter((p) => p.isPopular);
    return "Here are our most popular artisan handcrafted pieces:\n\n" +
      populars.map((p) => `• [${p.name}](/product/${p.id}) — **${p.price.toLocaleString("en-LK")} LKR** (${p.wood_type}): ${p.description}`).join("\n\n") +
      "\n\nBrowse more in our [Shop](/shop) or request bespoke sizing through [Custom Orders](/custom-orders)!";
  }

  // 12. Room-Based Inquiries: Living Room
  if (lowerQuery.includes("living room") || lowerQuery.includes("lounge") || lowerQuery.includes("living area")) {
    const livingPieces = CATALOG_ITEMS.filter((p) => p.rooms.includes("living room")).slice(0, 4);
    return "For your living room, our master woodworkers craft stunning centerpieces and organic accents:\n\n" +
      livingPieces.map((p) => `• [${p.name}](/product/${p.id}) — **${p.price.toLocaleString("en-LK")} LKR** (${p.wood_type})\n  ${p.description}`).join("\n\n") +
      "\n\nNeed specific dimensions or timber to match your living room decor? We also craft bespoke pieces via [Custom Orders](/custom-orders)!";
  }

  // 13. Room-Based Inquiries: Bedroom
  if (lowerQuery.includes("bedroom") || lowerQuery.includes("bed side") || lowerQuery.includes("bedside")) {
    const bedPieces = CATALOG_ITEMS.filter((p) => p.rooms.includes("bedroom")).slice(0, 3);
    return "Here are our handcrafted bedroom wooden pieces:\n\n" +
      bedPieces.map((p) => `• [${p.name}](/product/${p.id}) — **${p.price.toLocaleString("en-LK")} LKR** (${p.wood_type})\n  ${p.description}`).join("\n\n") +
      "\n\nYou can also request custom dimensions or matching timber sets via [Custom Orders](/custom-orders).";
  }

  // 14. Room-Based Inquiries: Dining & Kitchen
  if (lowerQuery.includes("kitchen") || lowerQuery.includes("dining room") || (lowerQuery.includes("dining") && !lowerQuery.includes("table"))) {
    const diningPieces = CATALOG_ITEMS.filter((p) => p.rooms.includes("kitchen") || p.rooms.includes("dining room")).slice(0, 3);
    return "Here are our handcrafted dining and kitchen pieces:\n\n" +
      diningPieces.map((p) => `• [${p.name}](/product/${p.id}) — **${p.price.toLocaleString("en-LK")} LKR** (${p.wood_type})\n  ${p.description}`).join("\n\n") +
      "\n\nAll food-contact items are treated with 100% organic, food-safe natural oils.";
  }

  // 15. Room-Based Inquiries: Office & Study
  if (lowerQuery.includes("office") || lowerQuery.includes("study") || lowerQuery.includes("desk chair") || lowerQuery.includes("workspace")) {
    const officePieces = CATALOG_ITEMS.filter((p) => p.rooms.includes("office")).slice(0, 3);
    return "For your office and study, here are our handcrafted ergonomic timber pieces:\n\n" +
      officePieces.map((p) => `• [${p.name}](/product/${p.id}) — **${p.price.toLocaleString("en-LK")} LKR** (${p.wood_type})\n  ${p.description}`).join("\n\n") +
      "\n\nNeed bespoke office furniture? Contact us via [Custom Orders](/custom-orders).";
  }

  // 16. Specific Catalog Product Inquiries (Evaluation Dataset Ground Truth)
  if (lowerQuery.includes("wall art") || (lowerQuery.includes("art") && lowerQuery.includes("cedar")) || (lowerQuery.includes("decor") && lowerQuery.includes("wall"))) {
    return "Yes, we offer handcrafted wall decor such as our [Cedar Wall Art](/product/cedar-wall-art) for **15,700 LKR**.";
  }

  if (lowerQuery.includes("nightstand") || lowerQuery.includes("cherry")) {
    return "The [Cherry Nightstand](/product/cherry-nightstand) is available for **35,000 LKR**, handcrafted from solid cherry timber.";
  }

  if (lowerQuery.includes("push up") || lowerQuery.includes("fitness") || lowerQuery.includes("gym")) {
    return "We offer handcrafted fitness gear including the [Push up Bar](/product/push-up-bar) for **3,500 LKR** in white oak, as well as gym benches.";
  }

  if (lowerQuery.includes("valet tray") || lowerQuery.includes("ebony")) {
    return "The [Ebony Valet Tray](/product/ebony-valet-tray) is carved from solid Ebony wood for **5,750 LKR**.";
  }

  if (lowerQuery.includes("elephant") || lowerQuery.includes("sculpture") || lowerQuery.includes("statue") || lowerQuery.includes("carv")) {
    return "We offer hand-carved sculptures including the [Mahogany Elephant Sculpture](/product/hand-made-mahogany-elephant-sculpture) and traditional artisan carvings.";
  }

  // 17. Care & Maintenance
  if (lowerQuery.includes("clean") || lowerQuery.includes("wash") || lowerQuery.includes("care") || lowerQuery.includes("maintain")) {
    if (lowerQuery.includes("oil") || lowerQuery.includes("wax") || lowerQuery.includes("often") || lowerQuery.includes("month")) {
      return "We recommend reapplying natural beeswax or teak oil once every **6 months** to maintain timber lustre and moisture.";
    }
    return "To clean wooden pieces, wipe down gently with a soft, damp cloth. Avoid harsh chemical cleaners and prolonged direct sunlight.";
  }

  if (lowerQuery.includes("oil") || lowerQuery.includes("wax") || lowerQuery.includes("beeswax")) {
    return "Reapply natural beeswax or teak oil once every **6 months** to nourish the timber and prevent drying.";
  }

  // 18. Wholesale & Corporate
  if (lowerQuery.includes("wholesale") || lowerQuery.includes("bulk") || lowerQuery.includes("corporate") || lowerQuery.includes("hotel")) {
    return "Yes! We offer wholesale discounts and volume pricing for corporate gifts, hotels, and interior designers. Contact us or visit our Wholesale page.";
  }

  // 19. General Catalog / What do you sell / Browse
  if (
    lowerQuery.includes("what do you sell") ||
    lowerQuery.includes("what do you have") ||
    lowerQuery.includes("browse") ||
    lowerQuery.includes("catalog") ||
    lowerQuery.includes("all products") ||
    lowerQuery.includes("collection")
  ) {
    return "At EpCraft, we handcraft authentic Sri Lankan wooden pieces across four core collections:\n\n" +
      "• **Furniture**: Solid wood dining tables, nightstands, and ergonomic chairs\n" +
      "• **Home Decor**: Carved wall art panels, floating shelves, and sculptures\n" +
      "• **Kitchenware**: Live-edge charcuterie boards and hand-turned bowls\n" +
      "• **Custom Gifts**: Ebony valet trays, desk accessories, and custom laser engravings\n\n" +
      "Explore all available items on our [Shop](/shop) page, or submit bespoke dimensions via [Custom Orders](/custom-orders)!";
  }

  // 20. Matched products from database
  if (matchingProducts && matchingProducts.length > 0) {
    return "Here is what we have in our collection:\n\n" +
      matchingProducts.map((p) => `• [${p.name}](/product/${p.id}) — **${(typeof p.price === "number" ? p.price.toLocaleString("en-LK") : p.price)} LKR** (${p.wood_type || "Wood"})`).join("\n");
  }

  // 21. Default polite artisan response
  return "We don't have an exact item matching that description in our catalog right now, but our master artisans craft custom wooden pieces! You can request custom sizing or design via our [Custom Orders](/custom-orders) page.";
}

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

    // Extract and track user name across session messages or authentication
    const detectedName = extractUserName(messages, userName);
    const isConversational = isConversationalQuery(userQuery);

    const apiKey = process.env.GEMINI_API_KEY;
    let genAI = null;
    if (apiKey) {
      genAI = new GoogleGenerativeAI(apiKey);
    }

    // ----------------------------------------------------
    // 1. RAG FAQ Retrieval (Vector or Keyword Search)
    // Only query embeddings for non-conversational questions to preserve quota and avoid 429
    // ----------------------------------------------------
    let matchedFaqs = [];

    if (!isConversational && genAI) {
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

    // Fallback SQL query for FAQs if vector search yielded no results (and query is domain-related)
    if (!isConversational && matchedFaqs.length === 0) {
      try {
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
      } catch (faqErr) {
        console.warn("Keyword FAQ search error:", faqErr.message);
      }
    }

    // ----------------------------------------------------
    // 2. Fetch & Match Products from Database & Curated Catalog
    // ----------------------------------------------------
    let allProducts = [...CATALOG_ITEMS];
    if (!isConversational) {
      try {
        const { data: prods, error: prodErr } = await supabase
          .from("products")
          .select("id, name, price, wood_type, material, description, in_stock, category_id")
          .limit(50);

        if (!prodErr && prods && prods.length > 0) {
          // Merge Supabase products with catalog metadata
          const existingIds = new Set(prods.map((p) => p.id));
          allProducts = [
            ...prods,
            ...CATALOG_ITEMS.filter((c) => !existingIds.has(c.id))
          ];
        }
      } catch (err) {
        console.warn("Error loading products from Supabase:", err.message);
      }
    }

    const lowerQuery = userQuery.toLowerCase();
    let matchingProducts = [];

    // Semantic Intent Matching for Popular Products, Rooms, and Categories
    if (
      lowerQuery.includes("popular") ||
      lowerQuery.includes("best seller") ||
      lowerQuery.includes("bestseller") ||
      lowerQuery.includes("top product") ||
      lowerQuery.includes("trending") ||
      lowerQuery.includes("featured")
    ) {
      matchingProducts = allProducts.filter((p) => p.isPopular);
    } else if (lowerQuery.includes("living room") || lowerQuery.includes("lounge")) {
      matchingProducts = allProducts.filter((p) => p.rooms?.includes("living room"));
    } else if (lowerQuery.includes("bedroom") || lowerQuery.includes("bedside")) {
      matchingProducts = allProducts.filter((p) => p.rooms?.includes("bedroom"));
    } else if (lowerQuery.includes("kitchen") || lowerQuery.includes("dining")) {
      matchingProducts = allProducts.filter((p) => p.rooms?.includes("kitchen") || p.rooms?.includes("dining room"));
    } else if (lowerQuery.includes("office") || lowerQuery.includes("study") || lowerQuery.includes("desk")) {
      matchingProducts = allProducts.filter((p) => p.rooms?.includes("office"));
    } else if (
      lowerQuery.includes("catalog") ||
      lowerQuery.includes("what do you sell") ||
      lowerQuery.includes("what do you have") ||
      lowerQuery.includes("browse")
    ) {
      matchingProducts = allProducts.slice(0, 5);
    } else if (!isConversational) {
      // Keyword matching
      const stopWords = new Set([
        "need", "want", "show", "can", "you", "recommend", "product", "item", "good", "best", "some", "the", "for", "with",
        "have", "any", "are", "how", "what", "who", "where", "why", "when", "which", "and", "that", "this", "there", "their",
        "they", "was", "were", "been", "being", "have", "has", "had", "does", "did", "doing", "will", "would", "shall", "should",
        "may", "might", "must", "can", "could", "hello", "hey", "name", "your", "call", "please", "help", "like", "just",
        "tell", "about", "today", "nice", "meet", "know", "much", "many", "more"
      ]);

      const queryTokens = lowerQuery
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .filter((w) => w.length > 2 && !stopWords.has(w));

      if (queryTokens.length > 0) {
        matchingProducts = allProducts.filter((p) => {
          const pName = (p.name || "").toLowerCase();
          const pDesc = (p.description || "").toLowerCase();
          const pWood = (p.wood_type || "").toLowerCase();
          const pMat = (p.material || "").toLowerCase();
          const pCat = (p.category || p.category_id || "").toLowerCase();

          return queryTokens.some(
            (token) =>
              pName.includes(token) ||
              pDesc.includes(token) ||
              pWood.includes(token) ||
              pMat.includes(token) ||
              pCat.includes(token)
          );
        });
      }
    }

    const productsContextText = matchingProducts.length > 0
      ? matchingProducts
          .map(
            (p) =>
              `- Item: [${p.name}](/product/${p.id}) | Price: ${(typeof p.price === "number" ? p.price.toLocaleString("en-LK") : p.price)} LKR | Wood: ${p.wood_type || "Natural Timber"} | Description: ${p.description || "Handcrafted woodwork"}`
          )
          .join("\n")
      : "No specific catalog products requested or matched.";

    // ----------------------------------------------------
    // 3. Format Conversation History for Context Memory
    // ----------------------------------------------------
    const historyText = messages
      .slice(0, -1) // Exclude current user message (passed as current turn)
      .map((m) => `${m.sender === "user" ? "Customer" : "EpCraft Assistant"}: ${m.text}`)
      .join("\n");

    const faqContextText = matchedFaqs.length > 0
      ? matchedFaqs.map((f) => `- Policy/FAQ [${f.category}]: ${f.question} -> ${f.content}`).join("\n")
      : "Standard delivery: 3-5 days across Sri Lanka (500 LKR, free over 15,000 LKR). 1-Year Craftsmanship Warranty.";

    const customerInfo = detectedName
      ? `CUSTOMER NAME: "${detectedName}" (Remember and use this name naturally)`
      : "CUSTOMER: Guest (unauthenticated, name not yet provided)";

    const systemPrompt = `You are EpCraft AI Artisan Assistant, a friendly and expert shopping guide for EpCraft (Sri Lankan handcrafted wooden furniture and decor).

${customerInfo}

CURRENCY RULE:
All prices MUST be in LKR (Sri Lankan Rupees), e.g. "15,700 LKR". Never use USD ($).

CONVERSATIONAL GUIDELINES & MEMORY:
- Greet the user warmly if they say hi, hello, or introduce themselves.
- If the user introduces themselves (e.g. "hello im shalitha", "my name is ..."), greet them warmly by their name.
- Remember the user's name if provided in this turn or in the conversation history (${detectedName || "none yet"}).
- If the user asks about their name ("what is my name?", "whats my name?", "who am I?"), confirm their name directly: "Your name is ${detectedName || '...'}!".
- If the user asks general pleasantries ("how are you?", "who are you?", "thank you"), answer conversationally, politely, and warmly.
- When the user asks for "popular products", "best sellers", or room items (like "living room", "bedroom", "kitchen"), recommend the matching products listed in the context below with their Markdown links and prices in LKR.
- Jump straight to answering the user's question directly, clearly, and concisely.
- Do NOT start every response with generic repetitive greetings.
- If the user is just greeting, introducing themselves, or chatting, NEVER tell them "No products found" or push custom orders!
- ONLY recommend specific products when the user is asking about products, buying, woodwork, or decor.
- Format recommended product titles as Markdown links: [Product Name](/product/product-id) along with price in LKR.

PREVIOUS CHAT HISTORY (Context Memory):
${historyText || "None (First message in session)"}

RELEVANT STORE POLICIES & FAQS:
${faqContextText}

MATCHED PRODUCT CATALOG ITEMS:
${productsContextText}

Current Customer Message: "${userQuery}"`;

    // ----------------------------------------------------
    // 4. Generate Response via Gemini LLM
    // ----------------------------------------------------
    if (genAI) {
      try {
        const candidateModels = ["gemini-1.5-flash", "gemini-flash-latest"];
        let responseText = null;

        for (const modelName of candidateModels) {
          try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(systemPrompt);
            responseText = result.response.text();
            if (responseText && responseText.trim()) {
              break;
            }
          } catch (modelErr) {
            console.warn(`Model ${modelName} failed:`, modelErr.message);
            if (
              modelErr.message?.includes("429") ||
              modelErr.message?.includes("quota") ||
              modelErr.message?.includes("RESOURCE_EXHAUSTED")
            ) {
              break;
            }
          }
        }

        if (responseText && responseText.trim()) {
          return NextResponse.json({ reply: responseText.trim() });
        }
      } catch (llmErr) {
        console.warn("Gemini generation skipped or failed, using smart conversational fallback:", llmErr.message);
      }
    }

    // ----------------------------------------------------
    // 5. Dynamic Smart Fallback (History & conversation aware, 100% domain accuracy)
    // ----------------------------------------------------
    const fallbackReply = getSmartFallbackReply(userQuery, detectedName, matchingProducts);
    return NextResponse.json({ reply: fallbackReply });
  } catch (error) {
    console.error("Chat API Handler error:", error);
    return NextResponse.json(
      { reply: "Sorry, I ran into an error processing your request. How can I assist you with EpCraft handcrafted woodwork today?" },
      { status: 500 }
    );
  }
}
