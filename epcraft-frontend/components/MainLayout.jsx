"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";

export default function MainLayout({ children }) {
  const [chatOpen, setChatOpen] = useState(false);
  const pathname = usePathname();
  const isAdminPath = pathname?.startsWith("/admin");

  if (isAdminPath) {
    return <main className="min-h-screen bg-[#fcfaf7]">{children}</main>;
  }

  return (
    <>
      <Navbar onOpenChat={() => setChatOpen(true)} />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <ChatBot externalOpen={chatOpen} setExternalOpen={setChatOpen} />
    </>
  );
}
