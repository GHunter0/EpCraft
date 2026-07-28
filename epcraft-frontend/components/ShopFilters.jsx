"use client";

const categoryOptions = ["Furniture", "Decor", "Kitchenware", "Custom Gifts"];
const woodOptions = ["Oak", "Walnut", "Teak", "Mango"];
const finishSwatches = [
  { name: "Natural Oak", color: "#e5d5c0" },
  { name: "Dark Espresso", color: "#3d2b1f" },
  { name: "Honey Gold", color: "#c68e17" },
  { name: "Charcoal Grey", color: "#5c5c5c" },
];

function FilterSection({ title, children }) {
  return (
    <div className="flex w-full flex-col gap-4">
      <h3 className="border-b border-border/40 pb-2 font-serif text-base text-espresso">
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function ShopFilters({
  selectedCategory,
  onCategoryChange,
  selectedWood,
  onWoodChange,
  inStockOnly,
  onInStockChange,
  selectedFinish,
  onFinishChange,
}) {
  return (
    <aside className="flex w-full flex-col gap-8 md:w-64 md:shrink-0">
      <FilterSection title="Category">
        <div className="flex flex-col gap-3">
          {categoryOptions.map((cat) => (
            <label key={cat} className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedCategory === cat}
                onChange={() => onCategoryChange(selectedCategory === cat ? null : cat)}
                className="h-5 w-5 rounded border-border/60 text-espresso focus:ring-gold"
              />
              <span className="font-sans text-base text-bark">{cat}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Wood Type">
        <div className="flex flex-col gap-3">
          {woodOptions.map((wood) => (
            <label key={wood} className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedWood === wood}
                onChange={() => onWoodChange(selectedWood === wood ? null : wood)}
                className="h-5 w-5 rounded border-border/60 text-espresso focus:ring-gold"
              />
              <span className="font-sans text-base text-bark">{wood}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Finish">
        <div className="flex gap-3">
          {finishSwatches.map((swatch) => (
            <button
              key={swatch.name}
              type="button"
              aria-label={swatch.name}
              onClick={() => onFinishChange(selectedFinish === swatch.name ? null : swatch.name)}
              className="h-8 w-8 rounded-pill transition"
              style={{
                backgroundColor: swatch.color,
                boxShadow:
                  selectedFinish === swatch.name
                    ? "0 0 0 2px white, 0 0 0 4px #502c12"
                    : "0 0 0 2px white",
              }}
            />
          ))}
        </div>
      </FilterSection>

      <div className="flex items-center justify-between">
        <span className="font-serif text-base text-espresso">In Stock Only</span>
        <button
          type="button"
          role="switch"
          aria-checked={inStockOnly}
          onClick={() => onInStockChange(!inStockOnly)}
          className={`relative h-6 w-11 rounded-pill transition ${
            inStockOnly ? "bg-espresso" : "bg-border"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-pill bg-white shadow transition ${
              inStockOnly ? "left-5" : "left-0.5"
            }`}
          />
        </button>
      </div>
    </aside>
  );
}
