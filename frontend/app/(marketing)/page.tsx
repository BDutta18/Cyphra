"use client";

import { Navigation } from "@/components/landing/Navigation";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { PrivacyModelSection } from "@/components/landing/PrivacyModelSection";
import { DocsSection } from "@/components/landing/DocsSection";
import { CtaSection } from "@/components/landing/CtaSection";
import { FooterSection } from "@/components/landing/FooterSection";

export default function MarketingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-white text-black font-sans selection:bg-[#FFD400] selection:text-black">
      {/* 1. Glassy Navbar with ONLY Logo and Name Cyphra on Top Left */}
      <Navigation />

      {/* Main Landing Flow (Minimal Text, Maximum Visual Polish) */}
      <main className="flex-1">
        {/* 2. Grand Hero with Rotating Char-in Words, Simulator Terminal, & Marquee */}
        <HeroSection />

        {/* 3. Core Capabilities with Animated Geometric Visuals */}
        <FeaturesSection />

        {/* 4. Execution Flow in Three Mathematical Steps */}
        <HowItWorksSection />

        {/* 5. Midnight Dual-Ledger Privacy Bento Grid */}
        <PrivacyModelSection />

        {/* 6. Developer Quickstart SDK & Compact Circuits */}
        <DocsSection />

        {/* 7. Call To Action with 3D ASCII Wireframe Sphere */}
        <CtaSection />
      </main>

      {/* 8. Minimalist Brand Footer */}
      <FooterSection />
    </div>
  );
}
