import Link from "next/link";
import { Droplets, Sun, Sparkles } from "lucide-react";

export const metadata = {
  title: "Care Instructions | EpCraft",
};

const tips = [
  {
    icon: Droplets,
    title: "Cleaning",
    body: "Wipe clean with a dry or slightly damp soft cloth. Avoid soaking the surface or using harsh chemical cleaners, which can strip the natural finish.",
  },
  {
    icon: Sparkles,
    title: "Re-oiling",
    body: "Re-oil every 6–12 months with a food-safe mineral or beeswax oil to keep the finish breathable and the grain protected.",
  },
  {
    icon: Sun,
    title: "Placement",
    body: "Keep pieces out of direct, prolonged sunlight and away from heating vents or radiators to prevent warping and fading over time.",
  },
];

export default function CarePage() {
  return (
    <div className="container-page flex flex-col gap-12 py-16">
      <div className="max-w-2xl">
        <h1 className="font-serif text-4xl font-bold text-espresso md:text-5xl">
          Care Instructions
        </h1>
        <p className="mt-4 font-sans text-base leading-relaxed text-bark">
          Solid wood is meant to age gracefully. A few simple habits will keep
          your EpCraft piece looking its best for generations.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {tips.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex flex-col gap-3 rounded-2xl border border-border/40 bg-white p-8 shadow-soft">
            <Icon size={24} className="text-espresso" />
            <h2 className="font-serif text-xl font-semibold text-espresso">{title}</h2>
            <p className="font-sans text-sm leading-relaxed text-bark">{body}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 rounded-2xl bg-cream/60 p-8">
        <h3 className="font-serif text-xl font-semibold text-espresso">A note on wood movement</h3>
        <p className="font-sans text-sm leading-relaxed text-bark">
          Because it&apos;s a natural material, solid wood will expand and contract
          slightly with humidity and temperature changes — this is normal and
          part of what makes every piece one-of-a-kind. Weight, grain pattern,
          and color will also vary slightly between individual pieces.
        </p>
      </div>

      <div className="rounded-2xl bg-cream/60 p-8 text-center">
        <p className="font-sans text-base text-bark">
          Have a specific care question about your piece?
        </p>
        <Link href="/contact" className="btn-primary mt-4 inline-flex">
          Contact Us
        </Link>
      </div>
    </div>
  );
}
