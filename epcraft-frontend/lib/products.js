// TEMP mock data layer — swap for real API/DB calls later.
// Keeping every screen pointed at this one file means wiring up the backend
// later is a one-place change instead of hunting through every page.

export const products = [
  {
    id: "walnut-dining-table",
    name: "Walnut Dining Table",
    maker: "Elias",
    price: 52400,
    category: "Furniture",
    material: "Premium American Walnut",
    woodType: "Walnut",
    inStock: true,
    image: "/images/products/placeholder-1.jpg",
    description:
      "A solid walnut dining table hand-finished with natural oil, built to seat six comfortably.",
  },
  {
    id: "oak-serving-board",
    name: "Oak Serving Board",
    maker: "Sarah",
    price: 3120,
    category: "Kitchenware",
    material: "Live Edge White Oak",
    woodType: "Oak",
    inStock: true,
    image: "/images/products/placeholder-2.jpg",
    description:
      "A live-edge oak serving board, food-safe finished, ideal for cheese and charcuterie.",
  },
  {
    id: "cedar-wall-art",
    name: "Cedar Wall Art",
    maker: "Marco",
    price: 9850,
    category: "Decor",
    material: "Aromatic Cedar",
    woodType: "Cedar",
    inStock: true,
    image: "/images/products/placeholder-3.jpg",
    description: "Hand-carved cedar wall panel with a warm, aromatic finish.",
  },
  {
    id: "cherry-nightstand",
    name: "Cherry Nightstand",
    maker: "Anna",
    price: 11200,
    category: "Furniture",
    material: "Solid Cherry Wood",
    woodType: "Cherry",
    inStock: true,
    image: "/images/products/placeholder-4.jpg",
    description: "A compact cherry-wood nightstand with a single soft-close drawer.",
  },
  {
    id: "maple-bowl-set",
    name: "Maple Bowl Set",
    maker: "Theo",
    price: 2320,
    category: "Kitchenware",
    material: "Hand-Turned Maple",
    woodType: "Maple",
    inStock: true,
    image: "/images/products/placeholder-5.jpg",
    description: "A set of three hand-turned maple bowls, finished with food-grade oil.",
  },
  {
    id: "ash-floating-shelf",
    name: "Ash Floating Shelf",
    maker: "Sofia",
    price: 4450,
    category: "Decor",
    material: "Natural Matte Ash",
    woodType: "Ash",
    inStock: false,
    image: "/images/products/placeholder-6.jpg",
    description: "A minimalist ash floating shelf with a hidden mounting bracket.",
  },
  {
    id: "ebony-valet-tray",
    name: "Ebony Valet Tray",
    maker: "Lucas",
    price: 6280,
    category: "Custom Gifts",
    material: "Dark Ebony",
    woodType: "Ebony",
    inStock: true,
    image: "/images/products/placeholder-7.jpg",
    description: "A dark ebony valet tray, hand-sanded to a satin finish.",
  },
  {
    id: "organic-desk-chair",
    name: "Organic Desk Chair",
    maker: "Julian",
    price: 71800,
    category: "Furniture",
    material: "Black Walnut Collection",
    woodType: "Walnut",
    inStock: true,
    image: "/images/products/placeholder-8.jpg",
    description: "An ergonomic bent-wood desk chair with an organic, sculpted silhouette.",
  },
];

export const categories = [
  { name: "Furniture", image: "/images/categories/furniture.jpg" },
  { name: "Decor", image: "/images/categories/decor.jpg" },
  { name: "Kitchenware", image: "/images/categories/kitchenware.jpg" },
  { name: "Custom Gifts", image: "/images/categories/custom-gifts.jpg" },
];

export function formatPrice(amount) {
  return `Rs. ${amount.toLocaleString("en-LK")}`;
}
