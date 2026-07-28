"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";

export default function MainLayout({ children }) {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <Navbar onOpenChat={() => setChatOpen(true)} />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <ChatBot externalOpen={chatOpen} setExternalOpen={setChatOpen} />
    </>
  );
}
