import { Check, Hammer, ShieldCheck, Truck, Home } from "lucide-react";

const stages = [
  { label: "Order Placed", icon: Check },
  { label: "In Production", icon: Hammer },
  { label: "Quality Check", icon: ShieldCheck },
  { label: "Shipped", icon: Truck },
  { label: "Delivered", icon: Home },
];

export default function OrderTracker({ currentStep }) {
  return (
    <div className="flex items-center justify-between py-8">
      {stages.map((stage, i) => {
        const Icon = stage.icon;
        const done = i < currentStep;
        const active = i === currentStep;
        const upcoming = i > currentStep;
        return (
          <div key={stage.label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-pill ${
                  done
                    ? "bg-gold text-white shadow"
                    : active
                    ? "border-2 border-border bg-white text-gold shadow-[0_0_0_4px_rgba(194,233,198,0.3)]"
                    : "bg-border/30 text-ink opacity-50"
                }`}
              >
                <Icon size={18} />
              </div>
              <span
                className={`whitespace-nowrap font-sans text-sm ${
                  active ? "text-gold" : upcoming ? "text-ink opacity-50" : "text-ink"
                }`}
              >
                {stage.label}
              </span>
            </div>
            {i < stages.length - 1 && (
              <div
                className={`mx-2 h-0.5 flex-1 ${i < currentStep ? "bg-gold" : "bg-border"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
