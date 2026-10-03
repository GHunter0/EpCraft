import "./globals.css";
import MainLayout from "@/components/MainLayout";
import { ShopProvider } from "@/lib/ShopContext";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

export const metadata = {
  title: "EpCraft — Handcrafted Wood, Made For You",
  description:
    "Artisanal furniture and decor crafted with soul and precision, bridging traditional techniques with modern intelligence.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: ["/icons/icon-192.png", "/icons/icon-512.png"],
    apple: "/icons/apple-icon-180.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EpCraft",
  },
};

export const viewport = {
  themeColor: "#502c12",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="bg-cream text-ink">
        <ServiceWorkerRegister />
        <ShopProvider>
          <MainLayout>{children}</MainLayout>
        </ShopProvider>
      </body>
    </html>
  );
}


