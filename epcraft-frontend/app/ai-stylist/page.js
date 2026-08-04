"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Check, ArrowRight, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const questions = [
  {
    id: "room",
    title: "Which room are you styling?",
    options: ["Dining Room", "Living Room", "Kitchen / Pantry", "Home Office"],
  },
  {
    id: "vibe",
    title: "What is your primary interior aesthetic?",
    options: [
      "Wabi-Sabi Organic",
      "Mid-Century Modern",
      "Scandinavian Minimalist",
      "Rustic Luxury",
    ],
  },
  {
    id: "lighting",
    title: "How would you describe your space's natural light?",
    options: ["Abundant & Bright", "Soft Warm Ambient", "Cozy & Dim"],
  },
];

export default function AiStylistPage() {
  const [answers, setAnswers] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState(null);

  const supabase = createClient();

  const handleSelect = (option) => {
    const questionId = questions[currentStep].id;
    const newAnswers = { ...answers, [questionId]: option };
    setAnswers(newAnswers);

    if (currentStep < questions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      generateRecommendations(newAnswers);
    }
  };

  const generateRecommendations = async (finalAnswers) => {
    setIsGenerating(true);
    
    try {
      const { data } = await supabase
        .from("products")
        .select("*")
        .limit(2);

      const matched = (data || []).map((p) => ({
        ...p,
        woodType: p.wood_type,
        category: p.category_id,
      }));

      setRecommendations({
        woodMatch: finalAnswers.vibe?.includes("Mid-Century") ? "American Walnut" : "European White Oak",
        paletteAdvice: "Pair dark timber grains with soft linen tones, matte black accents, and warm 2700K lighting.",
        items: matched,
      });
    } catch (err) {
      console.error("AI recommendation match error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const resetQuiz = () => {
    setAnswers({});
    setCurrentStep(0);
    setRecommendations(null);
  };

  return (
    <div className="container-page py-16 bg-cream min-h-screen">
      <div className="mx-auto max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 rounded-pill bg-gold/10 px-4 py-2 font-sans text-xs font-semibold uppercase tracking-wider text-gold">
          <Sparkles size={16} />
          EpCraft Timber Intelligence
        </div>
        <h1 className="h1 mt-4">AI Stylist & Woodcraft Advisor</h1>
        <p className="body-text mt-3 text-bark">
          Answer 3 quick questions about your living space to receive personalized wood species, finish, and piece recommendations.
        </p>
      </div>

      {!recommendations && !isGenerating && (
        <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-border/60 bg-white p-8 shadow-card md:p-12">
          {/* Progress Bar */}
          <div className="mb-8 flex items-center justify-between">
            <span className="font-sans text-xs font-semibold uppercase tracking-widest text-bark">
              Step {currentStep + 1} of {questions.length}
            </span>
            <div className="flex gap-1.5">
              {questions.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 rounded-pill transition-all ${
                    idx === currentStep
                      ? "w-8 bg-gold"
                      : idx < currentStep
                      ? "w-2 bg-espresso"
                      : "w-2 bg-sand"
                  }`}
                />
              ))}
            </div>
          </div>

          <h2 className="font-serif text-2xl font-semibold text-ink">
            {questions[currentStep].title}
          </h2>

          <div className="mt-8 flex flex-col gap-4">
            {questions[currentStep].options.map((option) => {
              const selected = answers[questions[currentStep].id] === option;
              return (
                <button
                  key={option}
                  onClick={() => handleSelect(option)}
                  className={`flex items-center justify-between rounded-xl border p-5 text-left font-sans text-base transition-all ${
                    selected
                      ? "border-gold bg-gold/5 font-semibold text-espresso shadow-sm"
                      : "border-border/60 bg-cream/40 text-bark hover:border-gold hover:bg-cream"
                  }`}
                >
                  <span>{option}</span>
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                      selected
                        ? "border-gold bg-gold text-white"
                        : "border-bark/30 bg-white"
                    }`}
                  >
                    {selected && <Check size={14} />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {isGenerating && (
        <div className="mx-auto mt-16 flex max-w-lg flex-col items-center justify-center gap-6 rounded-2xl border border-border/60 bg-white py-16 shadow-soft text-center">
          <Sparkles className="h-12 w-12 animate-spin text-gold" />
          <h3 className="font-serif text-2xl font-semibold text-espresso">Analyzing Grain & Spatial Aesthetics...</h3>
          <p className="font-sans text-sm text-bark">Matching room palette with handcrafted timber selections</p>
        </div>
      )}

      {recommendations && (
        <div className="mx-auto mt-12 max-w-4xl flex flex-col gap-12">
          <div className="rounded-2xl border border-gold/40 bg-white p-8 shadow-card md:p-12">
            <div className="flex items-center justify-between border-b border-border/60 pb-6">
              <div>
                <span className="font-sans text-xs font-semibold uppercase tracking-widest text-gold">
                  Your AI Styling Profile
                </span>
                <h2 className="font-serif text-3xl font-bold text-espresso mt-1">
                  Ideal Match: {recommendations.woodMatch}
                </h2>
              </div>
              <button
                onClick={resetQuiz}
                className="flex items-center gap-2 font-sans text-sm text-bark hover:text-espresso"
              >
                <RefreshCw size={16} /> Retake Quiz
              </button>
            </div>

            <div className="mt-6 flex flex-col gap-4">
              <h4 className="font-serif text-lg font-semibold text-ink">Design Recommendation</h4>
              <p className="font-sans text-base leading-relaxed text-bark">
                {recommendations.paletteAdvice}
              </p>
            </div>

            <div className="mt-10 flex flex-col gap-6">
              <h4 className="font-serif text-xl font-semibold text-espresso">Recommended Pieces for You</h4>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {recommendations.items.map((prod) => (
                  <div
                    key={prod.id}
                    className="flex flex-col justify-between rounded-xl border border-border/60 bg-cream/30 p-6 shadow-soft"
                  >
                    <div>
                      <span className="font-sans text-xs uppercase tracking-wider text-bark/60">
                        {prod.category} • {prod.woodType}
                      </span>
                      <h5 className="font-serif text-xl font-bold text-ink mt-1">{prod.name}</h5>
                      <p className="font-sans text-lg font-semibold text-espresso mt-2">Rs. {prod.price.toLocaleString("en-LK")}</p>
                    </div>
                    <Link
                      href={`/product/${prod.id}`}
                      className="mt-6 inline-flex items-center justify-center gap-2 rounded-pill bg-espresso px-6 py-3 font-sans text-sm font-medium text-white transition hover:bg-gold"
                    >
                      View Details & Customize <ArrowRight size={16} />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
