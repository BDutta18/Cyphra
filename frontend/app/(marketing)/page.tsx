"use client";

import { Navigation } from "@/components/landing/Navigation";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { ArchitectureSection } from "@/components/landing/ArchitectureSection";
import { PrivacyModelSection } from "@/components/landing/PrivacyModelSection";
import { DocsSection } from "@/components/landing/DocsSection";
import { FeedbackSection } from "@/components/landing/FeedbackSection";
import { CtaSection } from "@/components/landing/CtaSection";
import { FooterSection } from "@/components/landing/FooterSection";

export default function MarketingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-white text-zinc-950 font-sans selection:bg-[#FFD400] selection:text-black">
      {/* Floating Glass Pill Navigation */}
      <Navigation />

      {/* Main Landing Page Flow (TradeXchain Architecture) */}
      <main className="flex-1">
        {/* 1. Hero Section with 3D ASCII Sphere, Char-in Headline, Simulator Terminal & Floating Marquee */}
        <HeroSection />

        {/* 2. Interactive Execution Cockpit with Formula & Proving Terminal */}
        <HowItWorksSection />

        {/* 3. System Architecture & Real-time Protocol Subsystems Board */}
        <ArchitectureSection />

        {/* 4. Privacy Model Bento Grid: What Stays Private vs What Is Public vs What You Prove */}
        <PrivacyModelSection />

        {/* 5. Interactive Docs Hub: SDK Quickstart, Compact Circuits, Invariants & Security */}
        <DocsSection />

        {/* 6. Level 5 Verified User Feedback: 79 Respondents, 4.63/5 Rating, What We Heard / Changed */}
        <FeedbackSection />

        {/* 7. Call To Action Spotlight Card with 3D Wireframe ASCII Sphere */}
        <CtaSection />
      </main>

      {/* 8. Luxury Footer with Midnight Preprod Explorer links and official handles */}
      <FooterSection />
    </div>
  );
}
