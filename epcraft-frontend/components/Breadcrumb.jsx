import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function Breadcrumb({ items }) {
  return (
    <nav className="flex items-center gap-2 font-sans text-xs">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={item.label} className="flex items-center gap-2">
            {item.href && !isLast ? (
              <Link href={item.href} className="text-bark hover:text-espresso">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "font-semibold text-espresso" : "text-bark"}>
                {item.label}
              </span>
            )}
            {!isLast && <ChevronRight size={12} className="text-bark" />}
          </span>
        );
      })}
    </nav>
  );
}
