import Link from "next/link";
import { TreePine, Hammer, Compass, Award, ShieldCheck, Heart } from "lucide-react";

export const metadata = {
  title: "Our Story — EpCraft Artisanal Heritage",
  description:
    "Discover the soul, technique, and sustainable timber sourcing behind EpCraft handcrafted furniture.",
};

const pillars = [
  {
    icon: TreePine,
    title: "Sustainably Sourced Timber",
    description:
      "Every log is ethically harvested from certified, responsibly managed forests, honoring the life and grain of natural timber.",
  },
  {
    icon: Hammer,
    title: "Master Craftsmanship",
    description:
      "Traditional mortise-and-tenon joinery meets modern numerical precision to build heirloom pieces designed for generations.",
  },
  {
    icon: Compass,
    title: "AI-Augmented Design",
    description:
      "We pair human aesthetic wisdom with algorithmic spatial intelligence to craft pieces tailored to your exact architectural space.",
  },
  {
    icon: Award,
    title: "Zero-V.O.C. Organic Oils",
    description:
      "Finished exclusively with non-toxic, food-safe organic oil rubs that highlight natural texture while preserving timber longevity.",
  },
];

const timeline = [
  {
    year: "2018",
    title: "The Workshop Begins",
    description:
      "EpCraft started in a single-bay workshop in the countryside, driven by a passion for solid walnut and reclaimed white oak.",
  },
  {
    year: "2021",
    title: "Digital & Physical Fusion",
    description:
      "Introduced custom interactive 3D dimensioning so patrons could co-create their furniture alongside our master woodworkers.",
  },
  {
    year: "2024",
    title: "Generative Timber Intelligence",
    description:
      "Launched the EpCraft AI Stylist, blending material science, grain analysis, and interior styling algorithms.",
  },
];

export default function StoryPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative flex min-h-[480px] w-full flex-col justify-center bg-espresso py-20 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-espresso via-espresso/90 to-transparent" />
        <div className="container-page relative z-10 flex flex-col gap-6">
          <span className="font-sans text-xs font-semibold uppercase tracking-widest text-gold">
            Artisanal Heritage & Vision
          </span>
          <h1 className="max-w-3xl font-serif text-4xl leading-tight md:text-6xl">
            Where Raw Nature Meets Intention & Precision
          </h1>
          <p className="max-w-2xl font-sans text-lg text-sand/90">
            EpCraft was born from a simple belief: furniture shouldn&apos;t just fill a space — it should anchor it with warmth, history, and human artistry.
          </p>
        </div>
      </section>

      {/* Craftsmanship Pillars */}
      <section className="container-page py-24">
        <div className="text-center">
          <span className="font-sans text-xs font-semibold uppercase tracking-widest text-gold">
            Guiding Philosophy
          </span>
          <h2 className="h2 mt-2">The EpCraft Standard</h2>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar) => {
            const IconComponent = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-white p-8 shadow-soft transition hover:-translate-y-1 hover:shadow-card"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-pill bg-cream text-espresso">
                  <IconComponent size={24} />
                </div>
                <h3 className="font-serif text-xl font-semibold text-ink">{pillar.title}</h3>
                <p className="font-sans text-sm leading-relaxed text-bark">{pillar.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Timeline Section */}
      <section className="border-y border-border/60 bg-cream py-24">
        <div className="container-page flex flex-col items-center">
          <span className="font-sans text-xs font-semibold uppercase tracking-widest text-gold">
            Our Journey
          </span>
          <h2 className="h2 mt-2 text-center">Evolution of the Craft</h2>

          <div className="mt-16 flex w-full max-w-3xl flex-col gap-12 border-l-2 border-gold/40 pl-6 md:pl-12">
            {timeline.map((item) => (
              <div key={item.year} className="relative flex flex-col gap-2">
                <span className="absolute -left-[31px] md:-left-[55px] top-1 flex h-4 w-4 rounded-full bg-gold ring-4 ring-cream" />
                <span className="font-serif text-2xl font-bold text-espresso">{item.year}</span>
                <h3 className="font-serif text-xl text-ink">{item.title}</h3>
                <p className="font-sans text-base text-bark">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Artisan Spotlight CTA */}
      <section className="container-page py-24 text-center">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-pill bg-gold/20 text-gold">
            <Heart size={32} />
          </div>
          <h2 className="h2">Have a Custom Vision in Mind?</h2>
          <p className="font-sans text-base text-bark">
            Our studio collaborates with interior architects, designers, and homeowners worldwide to build bespoke tables, boards, and installations.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            <Link href="/customize" className="btn-primary">
              Launch Customization Studio
            </Link>
            <Link href="/contact" className="btn-outline-dark">
              Contact Master Craftsman
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
