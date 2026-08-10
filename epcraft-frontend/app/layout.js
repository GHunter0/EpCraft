import "./globals.css";
import MainLayout from "@/components/MainLayout";
import { ShopProvider } from "@/lib/ShopContext";

export const metadata = {
  title: "EpCraft — Handcrafted Wood, Made For You",
  description:
    "Artisanal furniture and decor crafted with soul and precision, bridging traditional techniques with modern intelligence.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="bg-cream text-ink">
        <ShopProvider>
          <MainLayout>{children}</MainLayout>
        </ShopProvider>
      </body>
    </html>
  );
}


