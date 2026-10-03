import Link from "next/link";
import { WifiOff } from "lucide-react";

export const metadata = {
  title: "You're Offline | EpCraft",
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-cream px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sand text-bark">
        <WifiOff size={32} />
      </div>
      <h1 className="font-serif text-3xl font-bold text-espresso">You're offline</h1>
      <p className="max-w-md font-sans text-base text-bark">
        It looks like you've lost your connection. Check your network and
        we'll pick up right where you left off.
      </p>
      <Link href="/" className="btn-primary">
        Try Again
      </Link>
    </div>
  );
}
