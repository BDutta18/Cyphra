"use client";

import { Navigation } from "@/components/landing/Navigation";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { PrivacyModelSection } from "@/components/landing/PrivacyModelSection";
import { FeedbackSection } from "@/components/landing/FeedbackSection";
import { CtaSection } from "@/components/landing/CtaSection";
import { FooterSection } from "@/components/landing/FooterSection";

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-950 flex flex-col font-sans selection:bg-amber-400/30 selection:text-zinc-900">
      {/* Floating Glass Pill Navbar */}
      <Navigation />

      {/* Main Landing Flow */}
      <main className="flex-1">
        <HeroSection />
        <HowItWorksSection />
        <PrivacyModelSection />
        <FeedbackSection />
        <CtaSection />
      </main>

      {/* Luxury Footer */}
      <FooterSection />
    </div>
  );
}
