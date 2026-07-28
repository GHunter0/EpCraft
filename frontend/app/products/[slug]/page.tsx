"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

type Product = {
  slug: string;
  name: string;
  room: string;
  badge: string;
  price: string;
  rating: string;
  reviews: number;
  description: string;
  woodLabel: string;
  sizeLabel: string;
  finishes: { name: string; className: string }[];
  sizes: string[];
  images: string[];
  detailsTitle: string;
  detailsText: string;
  bullets: string[];
};

type Recommendation = {
  slug: string;
  name: string;
  price: string;
  image: string;
};

const products: Record<string, Product> = {
  "modern-heirloom-dining-table": {
    slug: "modern-heirloom-dining-table",
    name: "Modern Heirloom Dining Table",
    room: "Dining Room",
    badge: "Solid American Walnut",
    price: "Rs. 3,250.00",
    rating: "4.8",
    reviews: 24,
    description:
      "A timeless centerpiece handcrafted with traditional joinery, designed to last for generations. Each piece celebrates the natural variations and rich textures of premium solid wood.",
    woodLabel: "Wood Finish",
    sizeLabel: "Table Size",
    finishes: [
      { name: "Walnut", className: "bg-[#986033]" },
      { name: "Honey", className: "bg-[#d0a05d]" },
      { name: "Espresso", className: "bg-[#4c2a23]" },
    ],
    sizes: [
      'Standard (72" L × 36" W × 30" H)',
      'Compact (60" L × 34" W × 30" H)',
      'Large (84" L × 40" W × 30" H)',
    ],
    images: [
      "/epcraft/product-detail/main-table.jpg",
      "/epcraft/product-detail/thumbnail-1.jpg",
      "/epcraft/product-detail/thumbnail-2.jpg",
      "/epcraft/product-detail/thumbnail-3.jpg",
      "/epcraft/product-detail/thumbnail-4.jpg",
    ],
    detailsTitle: "The Art of the Heirloom",
    detailsText:
      "Inspired by the clean lines of Scandinavian modernism and the enduring strength of traditional Shaker furniture, the Modern Heirloom Dining Table is designed to be the anchor of your home. Each tabletop is book-matched from a single walnut log to ensure color consistency and a flowing grain pattern that tells a story.",
    bullets: [
      "Hand-rubbed oil and wax finish for a natural, breathable surface.",
      "Traditional mortise and tenon joinery for superior durability.",
      "Sustainable-harvested American Black Walnut.",
    ],
  },

  "minimalist-oak-floating-shelf": {
    slug: "minimalist-oak-floating-shelf",
    name: "Minimalist Oak Floating Shelf",
    room: "Living Room",
    badge: "Natural White Oak",
    price: "Rs. 4,200.00",
    rating: "4.7",
    reviews: 18,
    description:
      "A clean floating shelf with concealed mounting hardware, designed to bring warm natural texture to contemporary interiors.",
    woodLabel: "Wood Finish",
    sizeLabel: "Shelf Size",
    finishes: [
      { name: "Natural", className: "bg-[#d9c09a]" },
      { name: "Honey", className: "bg-[#b77b39]" },
      { name: "Dark Oak", className: "bg-[#5b3927]" },
    ],
    sizes: [
      'Small (24" W)',
      'Medium (36" W)',
      'Large (48" W)',
    ],
    images: ["/epcraft/furniture/minimalist-oak-floating-shelf.jpg"],
    detailsTitle: "Quiet, Functional Craft",
    detailsText:
      "The Minimalist Oak Floating Shelf is shaped from solid oak and finished to preserve the wood's natural grain. Its hidden mounting system keeps the profile clean while supporting everyday objects with confidence.",
    bullets: [
      "Solid oak construction.",
      "Concealed steel mounting hardware.",
      "Hand-sanded natural matte finish.",
    ],
  },

  "sculptural-teak-serving-bowl": {
    slug: "sculptural-teak-serving-bowl",
    name: "Sculptural Teak Serving Bowl",
    room: "Kitchenware",
    badge: "Hand-Turned Teak",
    price: "Rs. 1,850.00",
    rating: "4.9",
    reviews: 31,
    description:
      "A sculptural serving bowl turned by hand to showcase the expressive grain and warmth of sustainably sourced teak.",
    woodLabel: "Wood Finish",
    sizeLabel: "Bowl Size",
    finishes: [
      { name: "Natural", className: "bg-[#b57a3f]" },
      { name: "Golden", className: "bg-[#d19a4d]" },
      { name: "Smoked", className: "bg-[#5a3b2d]" },
    ],
    sizes: ["Small", "Medium", "Large"],
    images: ["/epcraft/furniture/sculptural-teak-serving-bowl.jpg"],
    detailsTitle: "Made to Gather Around",
    detailsText:
      "Every bowl is individually turned, sanded and sealed by hand. Natural knots and grain movement make each piece unique while the food-safe finish keeps it practical for everyday serving.",
    bullets: [
      "Food-safe natural oil finish.",
      "Individually hand-turned.",
      "Sustainably sourced teak.",
    ],
  },

  "nordic-mango-nightstand": {
    slug: "nordic-mango-nightstand",
    name: "Nordic Mango Nightstand",
    room: "Bedroom",
    badge: "Solid Mango Wood",
    price: "Rs. 6,800.00",
    rating: "4.6",
    reviews: 16,
    description:
      "A warm, compact bedside piece combining Scandinavian proportions with the lively grain of mango wood.",
    woodLabel: "Wood Finish",
    sizeLabel: "Nightstand Size",
    finishes: [
      { name: "Honey", className: "bg-[#c39350]" },
      { name: "Natural", className: "bg-[#dfc39a]" },
      { name: "Walnut", className: "bg-[#6c442c]" },
    ],
    sizes: ["Standard", "Wide"],
    images: ["/epcraft/furniture/nordic-mango-nightstand.jpg"],
    detailsTitle: "Warmth Beside the Bed",
    detailsText:
      "Designed with soft edges and practical storage, the Nordic Mango Nightstand balances visual lightness with durable solid-wood construction.",
    bullets: [
      "Solid mango wood frame.",
      "Hand-finished honey-gold surface.",
      "Soft-close drawer hardware.",
    ],
  },

  "artisan-serving-platter": {
    slug: "artisan-serving-platter",
    name: "Artisan Serving Platter",
    room: "Kitchenware",
    badge: "Live Edge White Oak",
    price: "Rs. 1,200.00",
    rating: "4.8",
    reviews: 22,
    description:
      "A generous live-edge serving platter made for cheeses, breads and shared table moments.",
    woodLabel: "Wood Finish",
    sizeLabel: "Platter Size",
    finishes: [
      { name: "Natural", className: "bg-[#d5b68d]" },
      { name: "Honey", className: "bg-[#c18b4a]" },
      { name: "Smoked", className: "bg-[#654434]" },
    ],
    sizes: ["Medium", "Large"],
    images: ["/epcraft/furniture/artisan-serving-platter.jpg"],
    detailsTitle: "Crafted for Sharing",
    detailsText:
      "Each platter follows the original edge of the timber, keeping the organic form of the tree visible. The surface is sealed with a food-safe blend that is easy to maintain.",
    bullets: [
      "Food-safe oil and wax finish.",
      "Natural live edge.",
      "Hand-shaped white oak.",
    ],
  },

  "executive-desk-set": {
    slug: "executive-desk-set",
    name: "Executive Desk Set",
    room: "Home Office",
    badge: "Black Walnut Collection",
    price: "Rs. 2,950.00",
    rating: "4.7",
    reviews: 19,
    description:
      "A coordinated walnut desk collection that organizes everyday tools while bringing calm craftsmanship to a workspace.",
    woodLabel: "Wood Finish",
    sizeLabel: "Set Size",
    finishes: [
      { name: "Walnut", className: "bg-[#74482f]" },
      { name: "Natural", className: "bg-[#c39a70]" },
      { name: "Ebony", className: "bg-[#30231f]" },
    ],
    sizes: ["Standard Set", "Extended Set"],
    images: ["/epcraft/furniture/executive-desk-set.jpg"],
    detailsTitle: "A More Intentional Workspace",
    detailsText:
      "The Executive Desk Set groups essential accessories into a coherent handcrafted system. Every edge is softened by hand and every component is finished to reveal the depth of black walnut.",
    bullets: [
      "Modular organizer components.",
      "Solid black walnut construction.",
      "Hand-applied natural oil finish.",
    ],
  },

  "walnut-dining-table": {
    slug: "walnut-dining-table",
    name: "Walnut Dining Table",
    room: "Dining Room",
    badge: "Solid American Walnut",
    price: "Rs. 52,400",
    rating: "4.8",
    reviews: 24,
    description:
      "A substantial handcrafted dining table designed to become the warm, enduring centre of family meals and celebrations.",
    woodLabel: "Wood Finish",
    sizeLabel: "Table Size",
    finishes: [
      { name: "Walnut", className: "bg-[#7b4b2d]" },
      { name: "Honey", className: "bg-[#c49355]" },
      { name: "Espresso", className: "bg-[#3f2922]" },
    ],
    sizes: ["Six Seater", "Eight Seater", "Ten Seater"],
    images: ["/epcraft/walnut-dining-table.jpg"],
    detailsTitle: "A Table Made for Gathering",
    detailsText:
      "Crafted to celebrate the depth and movement of walnut grain, this dining table combines a generous surface with a strong, balanced base for everyday use.",
    bullets: [
      "Solid walnut construction.",
      "Hand-applied protective oil finish.",
      "Traditional joinery for long-term durability.",
    ],
  },

  "oak-serving-board": {
    slug: "oak-serving-board",
    name: "Oak Serving Board",
    room: "Kitchenware",
    badge: "Solid White Oak",
    price: "Rs. 3,120",
    rating: "4.7",
    reviews: 19,
    description:
      "A versatile oak board made for serving bread, cheese and shared snacks with a clean handcrafted finish.",
    woodLabel: "Wood Finish",
    sizeLabel: "Board Size",
    finishes: [
      { name: "Natural", className: "bg-[#d8bd91]" },
      { name: "Honey", className: "bg-[#bd8143]" },
      { name: "Smoked", className: "bg-[#684735]" },
    ],
    sizes: ["Small", "Medium", "Large"],
    images: ["/epcraft/oak-serving-board.jpg"],
    detailsTitle: "Simple Craft for the Table",
    detailsText:
      "Shaped from solid oak and carefully sanded by hand, this serving board highlights the material's pale grain while remaining practical for everyday hosting.",
    bullets: [
      "Food-safe oil finish.",
      "Solid oak construction.",
      "Rounded hand-finished edges.",
    ],
  },

  "cedar-wall-art": {
    slug: "cedar-wall-art",
    name: "Cedar Wall Art",
    room: "Home Decor",
    badge: "Handcrafted Cedar",
    price: "Rs. 9,850",
    rating: "4.9",
    reviews: 27,
    description:
      "A geometric wall composition assembled from individually shaped cedar pieces to create warmth, depth and movement.",
    woodLabel: "Wood Tone",
    sizeLabel: "Artwork Size",
    finishes: [
      { name: "Natural", className: "bg-[#b77b48]" },
      { name: "Charred", className: "bg-[#2f2925]" },
      { name: "Mixed", className: "bg-[#7b4d31]" },
    ],
    sizes: ["Medium", "Large", "Statement"],
    images: ["/epcraft/cedar-wall-art.jpg"],
    detailsTitle: "Geometry in Natural Wood",
    detailsText:
      "Each cedar segment is cut, arranged and finished by hand, creating a sculptural surface whose shadows change throughout the day.",
    bullets: [
      "Individually shaped cedar pieces.",
      "Ready-to-hang mounting system.",
      "Natural and charred wood tones.",
    ],
  },

  "cherry-nightstand": {
    slug: "cherry-nightstand",
    name: "Cherry Nightstand",
    room: "Bedroom",
    badge: "Solid Cherry Wood",
    price: "Rs. 11,200",
    rating: "4.7",
    reviews: 21,
    description:
      "A refined bedside table with practical storage, warm cherry tones and softly rounded handcrafted details.",
    woodLabel: "Wood Finish",
    sizeLabel: "Nightstand Size",
    finishes: [
      { name: "Natural Cherry", className: "bg-[#b66b3f]" },
      { name: "Honey", className: "bg-[#ca8d4d]" },
      { name: "Dark Cherry", className: "bg-[#663628]" },
    ],
    sizes: ["Compact", "Standard", "Wide"],
    images: ["/epcraft/cherry-nightstand.jpg"],
    detailsTitle: "Quiet Storage Beside the Bed",
    detailsText:
      "Built from solid cherry, this nightstand balances a light visual profile with useful bedside storage and durable drawer construction.",
    bullets: [
      "Solid cherry frame and drawer fronts.",
      "Smooth hand-rubbed finish.",
      "Soft-close drawer hardware.",
    ],
  },

  "maple-bowl-set": {
    slug: "maple-bowl-set",
    name: "Maple Bowl Set",
    room: "Kitchenware",
    badge: "Hand-Turned Maple",
    price: "Rs. 2,320",
    rating: "4.8",
    reviews: 30,
    description:
      "A nested set of smooth maple bowls, individually turned to bring natural warmth to serving and preparation.",
    woodLabel: "Wood Finish",
    sizeLabel: "Set Size",
    finishes: [
      { name: "Natural", className: "bg-[#e0c79f]" },
      { name: "Honey", className: "bg-[#c99657]" },
      { name: "Warm Maple", className: "bg-[#aa6e3d]" },
    ],
    sizes: ["3-Piece Set", "4-Piece Set", "5-Piece Set"],
    images: ["/epcraft/maple-bowl-set.jpg"],
    detailsTitle: "Turned for Everyday Use",
    detailsText:
      "The bowls are shaped from maple and finished with a food-safe oil that preserves their pale grain and smooth tactile character.",
    bullets: [
      "Food-safe natural finish.",
      "Nested space-saving design.",
      "Individually hand-turned.",
    ],
  },

  "ash-floating-shelf": {
    slug: "ash-floating-shelf",
    name: "Ash Floating Shelf",
    room: "Living Room",
    badge: "Solid Ash Wood",
    price: "Rs. 4,450",
    rating: "4.6",
    reviews: 17,
    description:
      "A minimal floating shelf crafted from ash, with a clean profile and concealed wall-mounting system.",
    woodLabel: "Wood Finish",
    sizeLabel: "Shelf Size",
    finishes: [
      { name: "Natural", className: "bg-[#dbc39e]" },
      { name: "Whitewashed", className: "bg-[#eadfcd]" },
      { name: "Smoked", className: "bg-[#706052]" },
    ],
    sizes: ['24" Wide', '36" Wide', '48" Wide'],
    images: ["/epcraft/ash-floating-shelf.jpg"],
    detailsTitle: "A Clean Line on the Wall",
    detailsText:
      "The Ash Floating Shelf pairs expressive grain with concealed hardware, allowing books, plants and objects to appear lightly supported.",
    bullets: [
      "Solid ash construction.",
      "Concealed mounting hardware.",
      "Hand-sanded matte finish.",
    ],
  },

  "ebony-valet-tray": {
    slug: "ebony-valet-tray",
    name: "Ebony Valet Tray",
    room: "Custom Gifts",
    badge: "Premium Ebony",
    price: "Rs. 5,880",
    rating: "4.9",
    reviews: 26,
    description:
      "A refined bedside or desk organizer created for watches, jewellery and everyday personal objects.",
    woodLabel: "Wood Finish",
    sizeLabel: "Tray Size",
    finishes: [
      { name: "Ebony", className: "bg-[#2b2421]" },
      { name: "Walnut", className: "bg-[#70472f]" },
      { name: "Natural", className: "bg-[#b68f6e]" },
    ],
    sizes: ["Compact", "Standard", "Large"],
    images: ["/epcraft/ebony-valet-tray.jpg"],
    detailsTitle: "Order for Everyday Essentials",
    detailsText:
      "Designed with dedicated spaces for personal items, this valet tray combines precise joinery with a rich dark surface and soft protective lining.",
    bullets: [
      "Hand-finished hardwood construction.",
      "Soft-lined accessory compartments.",
      "Designed for watches and jewellery.",
    ],
  },

  "organic-desk-chair": {
    slug: "organic-desk-chair",
    name: "Organic Desk Chair",
    room: "Home Office",
    badge: "Sculpted Hardwood",
    price: "Rs. 7,180",
    rating: "4.7",
    reviews: 20,
    description:
      "A comfortable desk chair combining sculpted wooden supports with a soft upholstered seat and an ergonomic silhouette.",
    woodLabel: "Wood Finish",
    sizeLabel: "Chair Size",
    finishes: [
      { name: "Natural Oak", className: "bg-[#c49b6e]" },
      { name: "Walnut", className: "bg-[#6c4631]" },
      { name: "Dark", className: "bg-[#3e3029]" },
    ],
    sizes: ["Standard", "Tall"],
    images: ["/epcraft/organic-desk-chair.jpg"],
    detailsTitle: "Crafted Comfort for Focus",
    detailsText:
      "Curved wooden elements and supportive upholstery create a desk chair that feels warm and residential while remaining practical for daily work.",
    bullets: [
      "Sculpted solid-wood frame.",
      "Supportive upholstered seat and back.",
      "Height-adjustable swivel base.",
    ],
  },


  "curated-dining-chairs": {
    slug: "curated-dining-chairs",
    name: "Curated Dining Chairs",
    room: "Dining Room",
    badge: "Solid American Walnut",
    price: "Rs. 450.00 each",
    rating: "4.8",
    reviews: 17,
    description:
      "A refined dining chair with a solid hardwood frame, gently curved backrest and balanced proportions designed for long, comfortable meals.",
    woodLabel: "Wood Finish",
    sizeLabel: "Set Size",
    finishes: [
      { name: "Walnut", className: "bg-[#7a4d31]" },
      { name: "Natural", className: "bg-[#c59b6f]" },
      { name: "Espresso", className: "bg-[#3f2a22]" },
    ],
    sizes: ["Single Chair", "Set of 2", "Set of 4", "Set of 6"],
    images: ["/epcraft/product-detail/curated-dining-chairs.jpg"],
    detailsTitle: "Balanced Comfort at the Table",
    detailsText:
      "Each chair is shaped to complement handcrafted dining tables while remaining comfortable for everyday use. The frame is joined and finished by hand to preserve strength and natural character.",
    bullets: [
      "Solid hardwood frame.",
      "Comfortable curved back support.",
      "Hand-applied natural oil finish.",
    ],
  },

  "organic-form-bowl": {
    slug: "organic-form-bowl",
    name: "Organic Form Bowl",
    room: "Kitchenware",
    badge: "Hand-Turned Hardwood",
    price: "Rs. 1,200.00",
    rating: "4.9",
    reviews: 28,
    description:
      "A softly sculpted wooden bowl designed for fruit, serving and display, with each curve shaped to highlight the natural grain.",
    woodLabel: "Wood Finish",
    sizeLabel: "Bowl Size",
    finishes: [
      { name: "Natural", className: "bg-[#bc8651]" },
      { name: "Honey", className: "bg-[#d2a25f]" },
      { name: "Dark", className: "bg-[#5b3b2c]" },
    ],
    sizes: ["Small", "Medium", "Large"],
    images: ["/epcraft/product-detail/organic-form-bowl.jpg"],
    detailsTitle: "Sculpted by Hand",
    detailsText:
      "The Organic Form Bowl is turned and sanded by hand, allowing small variations in shape and grain to make every piece unique.",
    bullets: [
      "Food-safe natural finish.",
      "Individually hand-turned.",
      "Made from sustainably sourced hardwood.",
    ],
  },

  "slatted-oak-credenza": {
    slug: "slatted-oak-credenza",
    name: "Slatted Oak Credenza",
    room: "Living Room",
    badge: "Solid White Oak",
    price: "Rs. 2,100.00",
    rating: "4.7",
    reviews: 21,
    description:
      "A low-profile storage credenza with rhythmic slatted doors, warm oak grain and a clean modern silhouette.",
    woodLabel: "Wood Finish",
    sizeLabel: "Credenza Size",
    finishes: [
      { name: "Natural Oak", className: "bg-[#caa477]" },
      { name: "Honey Oak", className: "bg-[#a96f3f]" },
      { name: "Smoked Oak", className: "bg-[#594239]" },
    ],
    sizes: ["Compact", "Standard", "Wide"],
    images: ["/epcraft/product-detail/slatted-oak-credenza.jpg"],
    detailsTitle: "Storage with Quiet Detail",
    detailsText:
      "The slatted facade adds texture while keeping the overall form calm and architectural. Adjustable shelving provides practical storage for living and dining spaces.",
    bullets: [
      "Solid oak frame and slatted doors.",
      "Adjustable interior shelving.",
      "Soft-close concealed hinges.",
    ],
  },

  "arc-floor-lamp": {
    slug: "arc-floor-lamp",
    name: "The Arc Floor Lamp",
    room: "Lighting",
    badge: "Wood and Brass",
    price: "Rs. 580.00",
    rating: "4.6",
    reviews: 14,
    description:
      "A sculptural floor lamp with a graceful wooden arc and warm focused light, designed to soften reading corners and living spaces.",
    woodLabel: "Wood Finish",
    sizeLabel: "Lamp Size",
    finishes: [
      { name: "Natural", className: "bg-[#c79d70]" },
      { name: "Walnut", className: "bg-[#714a32]" },
      { name: "Dark", className: "bg-[#3a2a24]" },
    ],
    sizes: ["Standard"],
    images: ["/epcraft/product-detail/arc-floor-lamp.jpg"],
    detailsTitle: "Light with a Crafted Presence",
    detailsText:
      "The Arc Floor Lamp combines a slender handcrafted wooden stem with a warm shade and stable weighted base, creating functional lighting with a sculptural profile.",
    bullets: [
      "Hand-shaped wooden arc.",
      "Warm ambient light.",
      "Stable weighted base.",
    ],
  },

};

const recommendations: Recommendation[] = [
  {
    slug: "curated-dining-chairs",
    name: "Curated Dining Chairs",
    price: "Rs. 450.00 each",
    image: "/epcraft/product-detail/curated-dining-chairs.jpg",
  },
  {
    slug: "organic-form-bowl",
    name: "Organic Form Bowl",
    price: "Rs. 1,200.00",
    image: "/epcraft/product-detail/organic-form-bowl.jpg",
  },
  {
    slug: "slatted-oak-credenza",
    name: "Slatted Oak Credenza",
    price: "Rs. 2,100.00",
    image: "/epcraft/product-detail/slatted-oak-credenza.jpg",
  },
  {
    slug: "arc-floor-lamp",
    name: "The Arc Floor Lamp",
    price: "Rs. 580.00",
    image: "/epcraft/product-detail/arc-floor-lamp.jpg",
  },
];

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <path d="M3 4h2l2.2 10a2 2 0 0 0 2 1.6h7.5a2 2 0 0 0 1.9-1.4L21 7H6" />
      <circle cx="9.5" cy="20" r="1" />
      <circle cx="17.5" cy="20" r="1" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <circle cx="12" cy="8" r="3.2" />
      <path d="M6 19c.8-3.6 2.8-5.4 6-5.4s5.2 1.8 6 5.4" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
      <circle cx="18" cy="5" r="2.2" />
      <circle cx="6" cy="12" r="2.2" />
      <circle cx="18" cy="19" r="2.2" />
      <path d="m8 11 7.8-4.7M8 13l7.8 4.7" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
      <path d="M12 2c.8 3.9 2.6 5.7 6.5 6.5-3.9.8-5.7 2.6-6.5 6.5-.8-3.9-2.6-5.7-6.5-6.5C9.4 7.7 11.2 5.9 12 2Z" />
      <path d="M19 13c.4 2 1.3 2.9 3.3 3.3-2 .4-2.9 1.3-3.3 3.3-.4-2-1.3-2.9-3.3-3.3 2-.4 2.9-1.3 3.3-3.3Z" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z" />
      <circle cx="7" cy="18" r="1.5" />
      <circle cx="18" cy="18" r="1.5" />
    </svg>
  );
}

function WarrantyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="m12 2 2.2 2 3-.2.8 2.8 2.6 1.6-1 2.8 1 2.8-2.6 1.6-.8 2.8-3-.2-2.2 2-2.2-2-3 .2-.8-2.8L3.4 14l1-2.8-1-2.8L6 6.8 6.8 4l3 .2L12 2Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const slugValue = params?.slug;
  const slug = Array.isArray(slugValue) ? slugValue[0] : slugValue;
  const product = slug ? products[slug] : undefined;

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedFinish, setSelectedFinish] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [cartCount, setCartCount] = useState(0);
  const [cartMessage, setCartMessage] = useState("");
  const [activeTab, setActiveTab] = useState("Description");
  const [chatOpen, setChatOpen] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState("");

  useEffect(() => {
    setSelectedImage(0);
    setSelectedFinish(0);
    setQuantity(1);
    setCartMessage("");
    setSelectedSize(product?.sizes[0] ?? "");
  }, [slug, product]);

  const selectedMainImage = useMemo(
    () => product?.images[selectedImage] ?? product?.images[0] ?? "",
    [product, selectedImage],
  );

  if (!product) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#fbf5ec] px-6 text-center text-[#5a321b]">
        <div>
          <h1 className="font-[Georgia,serif] text-4xl">Product not found</h1>
          <Link href="/shop/furniture" className="mt-6 inline-block rounded-full border border-[#5a2e14] px-6 py-3">
            Return to Furniture
          </Link>
        </div>
      </main>
    );
  }

  function handleNewsletter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();

    if (!email.includes("@")) {
      setNewsletterMessage("Please enter a valid email address.");
      return;
    }

    setNewsletterMessage("Thank you. You are now subscribed.");
    event.currentTarget.reset();
  }

  function addToCart() {
    setCartCount((current) => current + quantity);
    setCartMessage(`${quantity} item${quantity > 1 ? "s" : ""} added to cart.`);
  }

  return (
    <main className="min-h-screen bg-[#fbf5ec] font-[Arial,sans-serif] text-[#5a321b]">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-[#eadfce] bg-[#fbf5ec]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[82px] max-w-[1900px] items-center justify-between px-6 md:px-12 lg:px-16">
          <Link href="/" className="font-[Georgia,serif] text-[34px] font-semibold tracking-[-0.04em] text-[#5a2e14]">
            EpCraft
          </Link>

          <nav className="hidden items-center gap-12 text-[18px] text-[#5d5047] lg:flex">
            <Link href="/shop/furniture" className="border-b-2 border-[#6b4328] pb-2 font-medium text-[#5a2e14]">
              Shop
            </Link>
            <Link href="/#categories" className="transition hover:text-[#5a2e14]">
              Custom Orders
            </Link>
            <Link href="/#story" className="transition hover:text-[#5a2e14]">
              Our Story
            </Link>
            <button type="button" onClick={() => setChatOpen(true)} className="transition hover:text-[#5a2e14]">
              AI Stylist
            </button>
          </nav>

          <div className="flex items-center gap-3 md:gap-5">
            <button type="button" className="rounded-full p-2 transition hover:bg-[#f1e5d6]" aria-label="Search">
              <SearchIcon />
            </button>

            <button type="button" className="relative rounded-full p-2 transition hover:bg-[#f1e5d6]" aria-label="Cart">
              <CartIcon />
              {cartCount > 0 && (
                <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#5a2e14] px-1 text-[10px] text-white">
                  {cartCount}
                </span>
              )}
            </button>

            <button type="button" className="rounded-full p-2 transition hover:bg-[#f1e5d6]" aria-label="Account">
              <UserIcon />
            </button>
          </div>
        </div>
      </header>

      {/* PRODUCT SUMMARY */}
      <section className="px-6 pb-20 pt-10 md:px-12 lg:px-16">
        <div className="mx-auto max-w-[1450px]">
          <div className="mb-8 flex flex-wrap items-center gap-2 text-[12px] text-[#7a6b5f]">
            <Link href="/" className="hover:text-[#5a2e14]">Home</Link>
            <span>›</span>
            <span>{product.room}</span>
            <span>›</span>
            <span className="font-medium text-[#5a2e14]">{product.name}</span>
          </div>

          <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] xl:gap-16">
            {/* IMAGE GALLERY */}
            <div>
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-[#e8ded1]">
                <Image
                  src={selectedMainImage}
                  alt={product.name}
                  fill
                  priority
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover"
                />

                <button
                  type="button"
                  onClick={() => setSelectedImage((current) => (current + 1) % product.images.length)}
                  className="absolute bottom-5 right-5 rounded-full bg-white/95 px-5 py-3 text-[13px] font-medium text-[#5a321b] shadow-lg"
                >
                  ↻ 360° View
                </button>
              </div>

              <div className="mt-5 flex gap-4 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border-2 ${
                      selectedImage === index ? "border-[#7a4627]" : "border-transparent"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      fill
                      unoptimized
                      sizes="96px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* PRODUCT INFORMATION */}
            <div className="lg:pt-1">
              <span className="inline-flex rounded-full bg-[#d9f0d4] px-4 py-1.5 text-[12px] font-medium text-[#4d7850]">
                {product.badge}
              </span>

              <h1 className="mt-4 max-w-[650px] font-[Georgia,serif] text-[42px] font-semibold leading-[1.04] tracking-[-0.03em] md:text-[55px]">
                {product.name}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="font-[Georgia,serif] text-[24px]">{product.price}</span>
                <span className="text-[18px] tracking-[0.08em] text-[#e2a44e]">★★★★★</span>
                <span className="text-[12px] text-[#6f6259]">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>

              <p className="mt-8 max-w-[620px] text-[16px] leading-7 text-[#60554d]">
                {product.description}
              </p>

              <div className="mt-8">
                <p className="text-[13px] font-semibold text-[#46382f]">{product.woodLabel}</p>
                <div className="mt-3 flex gap-3">
                  {product.finishes.map((finish, index) => (
                    <button
                      key={finish.name}
                      type="button"
                      onClick={() => setSelectedFinish(index)}
                      className={`h-11 w-11 rounded-full border-2 ${finish.className} ${
                        selectedFinish === index
                          ? "border-[#5a2e14] ring-2 ring-[#ead5c2]"
                          : "border-white shadow"
                      }`}
                      title={finish.name}
                      aria-label={finish.name}
                    />
                  ))}
                </div>
              </div>

              <label className="mt-7 block text-[13px] font-semibold text-[#46382f]">
                {product.sizeLabel}
                <select
                  value={selectedSize}
                  onChange={(event) => setSelectedSize(event.target.value)}
                  className="mt-3 h-14 w-full rounded-xl border border-[#e2d6c8] bg-white px-4 text-[14px] text-[#51463e] outline-none focus:border-[#6b4328]"
                >
                  {product.sizes.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </label>

              <div className="mt-7 grid gap-4 sm:grid-cols-[130px_1fr]">
                <div className="flex h-14 items-center justify-between rounded-full bg-white px-4 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                    className="grid h-8 w-8 place-items-center rounded-full hover:bg-[#f2e8dc]"
                  >
                    −
                  </button>
                  <span className="font-semibold">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((current) => current + 1)}
                    className="grid h-8 w-8 place-items-center rounded-full hover:bg-[#f2e8dc]"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={addToCart}
                  className="h-14 rounded-full bg-[#95613d] px-8 text-[15px] font-medium text-white shadow-lg transition hover:bg-[#77472a]"
                >
                  Add to Cart
                </button>
              </div>

              {cartMessage && (
                <p className="mt-3 text-[13px] font-medium text-[#4d7850]">{cartMessage}</p>
              )}

              <button
                type="button"
                onClick={() => window.alert("Custom order form will be connected by the assigned teammate.")}
                className="mt-6 w-full text-center text-[14px] font-medium text-[#d6a75e] hover:text-[#ad7931]"
              >
                ♙ Customize This Piece
              </button>

              <button
                type="button"
                onClick={() => setChatOpen(true)}
                className="mt-5 w-full text-center text-[13px] font-medium text-[#4e7d5a] hover:text-[#315d3d]"
              >
                ◉ Ask AI Assistant about this product
              </button>

              <div className="mt-8 space-y-4 border-t border-[#eadfce] pt-7 text-[13px] text-[#51463e]">
                <div className="flex items-center gap-3">
                  <TruckIcon />
                  <span>Free white-glove delivery in 6–8 weeks</span>
                </div>
                <div className="flex items-center gap-3">
                  <WarrantyIcon />
                  <span>Lifetime warranty on structural integrity</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TABS + STORY */}
      <section className="px-6 pb-20 md:px-12 lg:px-16">
        <div className="mx-auto max-w-[1450px] border-t border-[#eadfce] pt-8">
          <div className="flex gap-8 overflow-x-auto border-b border-[#eadfce] text-[13px] md:gap-12">
            {["Description", "Dimensions & Care", "Craftsman Story", `Reviews (${product.reviews})`].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`shrink-0 border-b-2 pb-4 transition ${
                  activeTab === tab
                    ? "border-[#7a4627] font-semibold text-[#5a321b]"
                    : "border-transparent text-[#9a8d82]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="grid gap-10 pt-12 lg:grid-cols-[1fr_0.9fr] xl:gap-16">
            <article>
              <h2 className="font-[Georgia,serif] text-[32px]">{product.detailsTitle}</h2>

              {activeTab === "Description" && (
                <>
                  <p className="mt-6 max-w-[720px] text-[15px] leading-7 text-[#60554d]">
                    {product.detailsText}
                  </p>
                  <ul className="mt-6 space-y-4 text-[14px] leading-6 text-[#60554d]">
                    {product.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#8d5633]" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {activeTab === "Dimensions & Care" && (
                <div className="mt-6 space-y-4 text-[15px] leading-7 text-[#60554d]">
                  <p>Selected size: {selectedSize}</p>
                  <p>Dust with a soft dry cloth. Avoid harsh chemicals and prolonged direct sunlight.</p>
                  <p>Refresh the wood surface periodically with a furniture-safe natural oil.</p>
                </div>
              )}

              {activeTab === "Craftsman Story" && (
                <p className="mt-6 text-[15px] leading-7 text-[#60554d]">
                  This piece is made in small batches by Elias Thorne and his workshop using traditional joinery, hand shaping and natural finishes.
                </p>
              )}

              {activeTab.startsWith("Reviews") && (
                <div className="mt-6 rounded-2xl bg-white p-6 text-[15px] leading-7 text-[#60554d] shadow-sm">
                  Customers consistently praise the material quality, stable construction and careful delivery experience.
                </div>
              )}
            </article>

            <aside className="rounded-2xl bg-white p-7 shadow-[0_12px_30px_rgba(72,42,20,0.08)]">
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 overflow-hidden rounded-full bg-[#e3d4c3]">
                  <Image
                    src="/epcraft/product-detail/elias-thorne.jpg"
                    alt="Elias Thorne"
                    fill
                    unoptimized
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-[Georgia,serif] text-[24px]">Elias Thorne</h3>
                  <p className="text-[12px] font-medium text-[#8a5a38]">Master Woodworker</p>
                  <p className="mt-1 text-[11px] text-[#665a51]">⌖ Workshop: Cotswolds, UK</p>
                </div>
              </div>

              <blockquote className="mt-6 text-[15px] italic leading-7 text-[#62574f]">
                “I believe every piece of wood has a hidden geometry. My work is simply to listen to the grain and reveal it in a way that serves the home for a hundred years.”
              </blockquote>

              <div className="mt-6 flex flex-wrap gap-3">
                <button type="button" className="rounded-full bg-[#f8f0e5] px-5 py-2 text-[12px]">
                  Follow Artist
                </button>
                <button type="button" className="rounded-full border border-[#eadfce] px-5 py-2 text-[12px]">
                  View Portfolio
                </button>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* RECOMMENDATIONS */}
      <section className="px-6 pb-24 md:px-12 lg:px-16">
        <div className="mx-auto max-w-[1450px]">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-[Georgia,serif] text-[32px]">You may also like</h2>
            <div className="flex gap-3">
              <button type="button" className="grid h-10 w-10 place-items-center rounded-full border border-[#e4d7c8]">←</button>
              <button type="button" className="grid h-10 w-10 place-items-center rounded-full border border-[#e4d7c8]">→</button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
            {recommendations.map((item) => (
              <Link key={item.name} href={`/products/${item.slug}`} className="group">
                <div className="relative aspect-square overflow-hidden rounded-xl bg-[#e9ddce]">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    unoptimized
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.035]"
                  />
                </div>
                <h3 className="mt-4 text-[14px] font-semibold text-[#4f4036]">{item.name}</h3>
                <p className="mt-1 text-[12px] text-[#74513c]">{item.price}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#eadfce] px-6 pb-8 pt-20 md:px-12 lg:px-16">
        <div className="mx-auto grid max-w-[1840px] gap-14 md:grid-cols-2 xl:grid-cols-[1.3fr_0.75fr_0.8fr_1.3fr]">
          <div>
            <h2 className="font-[Georgia,serif] text-[48px] font-semibold tracking-[-0.04em] text-[#5a2e14]">EpCraft</h2>
            <p className="mt-6 max-w-[440px] text-[18px] leading-[1.55] text-[#675c54]">
              Crafting the future of wood with the precision of AI and the soul of the artisan.
            </p>

            <div className="mt-8 flex gap-5">
              <a href="mailto:hello@epcraft.com" className="grid h-12 w-12 place-items-center rounded-full border border-[#dfcdb8]" aria-label="Email">
                <MailIcon />
              </a>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(window.location.href);
                  window.alert("Website link copied.");
                }}
                className="grid h-12 w-12 place-items-center rounded-full border border-[#dfcdb8]"
                aria-label="Share"
              >
                <ShareIcon />
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-[Georgia,serif] text-[25px]">Explore</h3>
            <div className="mt-7 flex flex-col gap-4 text-[17px] text-[#625850]">
              <Link href="/shop/furniture">New Arrivals</Link>
              <Link href="/shop/furniture">Best Sellers</Link>
              <button type="button" onClick={() => setChatOpen(true)} className="text-left">The AI Design Lab</button>
              <Link href="/shop/furniture">Wholesale</Link>
            </div>
          </div>

          <div>
            <h3 className="font-[Georgia,serif] text-[25px]">Concierge</h3>
            <div className="mt-7 flex flex-col gap-4 text-[17px] text-[#625850]">
              <a href="#footer">Shipping &amp; Returns</a>
              <a href="#footer">Care Instructions</a>
              <a href="mailto:hello@epcraft.com">Contact Us</a>
              <a href="#footer">Terms of Service</a>
            </div>
          </div>

          <div>
            <h3 className="font-[Georgia,serif] text-[25px]">Newsletter</h3>
            <p className="mt-7 max-w-[520px] text-[18px] leading-[1.55] text-[#625850]">
              Join our inner circle for early access and craftsmanship stories.
            </p>

            <form onSubmit={handleNewsletter} className="mt-8">
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                className="w-full rounded-full border border-[#e7dbcc] bg-white px-7 py-4 outline-none focus:border-[#5a2e14]"
              />
              <button type="submit" className="mt-4 w-full rounded-full bg-[#5a2e14] px-7 py-4 text-[18px] text-white">
                Subscribe
              </button>
              {newsletterMessage && <p className="mt-3 text-[14px]">{newsletterMessage}</p>}
            </form>
          </div>
        </div>

        <div className="mx-auto mt-20 flex max-w-[1840px] flex-col gap-5 border-t border-[#eadfce] pt-7 text-[14px] text-[#665b53] md:flex-row md:items-center md:justify-between">
          <p>© 2026 EpCraft Handcrafted Wood. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#footer">Privacy Policy</a>
            <a href="#footer">Terms of Use</a>
          </div>
        </div>
      </footer>

      {!chatOpen && (
        <button
          type="button"
          onClick={() => setChatOpen(true)}
          className="fixed bottom-7 right-7 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#5a2e14] text-white shadow-xl transition hover:scale-105"
          aria-label="Open AI Stylist"
        >
          <SparkleIcon />
        </button>
      )}

      {chatOpen && (
        <section className="fixed bottom-6 right-6 z-[70] flex h-[500px] w-[calc(100%-48px)] max-w-[380px] flex-col overflow-hidden rounded-3xl border border-[#e3d4c3] bg-[#fbf5ec] shadow-2xl">
          <div className="flex items-center justify-between bg-[#5a2e14] px-5 py-4 text-white">
            <div>
              <p className="font-[Georgia,serif] text-[20px]">EpCraft AI Stylist</p>
              <p className="text-[11px] text-white/70">Handcrafted product assistant</p>
            </div>
            <button type="button" onClick={() => setChatOpen(false)} className="rounded-full px-3 py-1 text-2xl hover:bg-white/10">×</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-[85%] rounded-2xl bg-white px-4 py-3 text-[14px] leading-relaxed text-[#51463f]">
              Hi! Ask me anything about {product.name}.
            </div>
          </div>

          <div className="flex gap-2 border-t border-[#e3d4c3] bg-white p-3">
            <input placeholder="Ask about this product..." className="min-w-0 flex-1 rounded-full bg-[#f4ece2] px-4 py-3 text-[14px] outline-none" />
            <button type="button" className="rounded-full bg-[#5a2e14] px-5 py-3 text-[14px] text-white">Send</button>
          </div>
        </section>
      )}
    </main>
  );
}