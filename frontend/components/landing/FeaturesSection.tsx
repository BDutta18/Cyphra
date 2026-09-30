"use client";

import { useEffect, useRef, useState } from "react";
import { Lock, Cpu, ShieldCheck, EyeOff } from "lucide-react";

function ProverVisual() {
  return (
    <svg viewBox="0 0 200 160" className="w-full h-full text-black">
      <defs>
        <clipPath id="proverClip">
          <rect x="30" y="20" width="140" height="120" rx="6" />
        </clipPath>
      </defs>
      <rect x="30" y="20" width="140" height="120" rx="6" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.6" />
      <g clipPath="url(#proverClip)">
        {[0, 1, 2, 3, 4].map((i) => (
          <rect
            key={i}
            x="40"
            y={35 + i * 20}
            width="120"
            height="12"
            rx="3"
            fill="currentColor"
            opacity="0.1"
          >
            <animate attributeName="opacity" values="0.1;0.8;0.1" dur="2s" begin={`${i * 0.2}s`} repeatCount="indefinite" />
            <animate attributeName="width" values="30;120;30" dur="2s" begin={`${i * 0.2}s`} repeatCount="indefinite" />
          </rect>
        ))}
      </g>
      <circle cx="100" cy="152" r="3.5" fill="#FFD400">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

function StreamVisual() {
  return (
    <svg viewBox="0 0 200 160" className="w-full h-full text-black">
      <circle cx="100" cy="80" r="14" fill="#FFD400">
        <animate attributeName="r" values="12;15;12" dur="2.5s" repeatCount="indefinite" />
      </circle>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i * 60) * (Math.PI / 180);
        const radius = 52;
        const x = 100 + Math.cos(angle) * radius;
        const y = 80 + Math.sin(angle) * radius;
        return (
          <g key={i}>
            <line
              x1="100"
              y1="80"
              x2={x.toFixed(4)}
              y2={y.toFixed(4)}
              stroke="currentColor"
              strokeWidth="1.5"
              opacity="0.25"
            >
              <animate attributeName="opacity" values="0.2;0.8;0.2" dur="2s" begin={`${i * 0.25}s`} repeatCount="indefinite" />
            </line>
            <circle cx={x.toFixed(4)} cy={y.toFixed(4)} r="6" fill="none" stroke="currentColor" strokeWidth="2">
              <animate attributeName="r" values="5;7;5" dur="2s" begin={`${i * 0.25}s`} repeatCount="indefinite" />
            </circle>
          </g>
        );
      })}
    </svg>
  );
}

function NullifierVisual() {
  return (
    <svg viewBox="0 0 200 160" className="w-full h-full text-black">
      <path
        d="M 50 80 Q 100 20 150 80 T 50 80"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.4"
      >
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="3s" repeatCount="indefinite" />
      </path>
      <circle cx="100" cy="80" r="8" fill="currentColor">
        <animate attributeName="r" values="7;10;7" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="100" cy="80" r="24" fill="none" stroke="#FFD400" strokeWidth="2" opacity="0.6">
        <animate attributeName="r" values="18;34;18" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

function AuditVisual() {
  return (
    <svg viewBox="0 0 200 160" className="w-full h-full text-black">
      <rect x="60" y="45" width="80" height="70" rx="8" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.5" />
      <circle cx="100" cy="72" r="10" fill="#FFD400" />
      <path d="M 100 82 L 100 100" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="100" cy="80" r="30" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" opacity="0.4">
        <animateTransform attributeName="transform" type="rotate" from="0 100 80" to="360 100 80" dur="8s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

const features = [
  {
    number: "01",
    title: "Client-Side Groth16 Prover",
    description: "Witnesses and note blinding salts never leave your browser memory. Succinct ZK-SNARK proofs generate locally in under 840ms with zero network telemetry.",
    visual: ProverVisual,
  },
  {
    number: "02",
    title: "Encrypted Invoicing Protocol",
    description: "B2B invoices, memo details, and line-items are encrypted end-to-end via Curve25519 ECDH. Public ledger observers see only an opaque 32-byte commitment hash.",
    visual: StreamVisual,
  },
  {
    number: "03",
    title: "Double-Spend Nullifier Tree",
    description: "Spend permissions are enforced atomically through cryptographic nullifiers on Midnight Preprod, preventing replay attacks without linking transaction history.",
    visual: NullifierVisual,
  },
  {
    number: "04",
    title: "Selective Compliance Keys",
    description: "Export cryptographically scoped, time-bounded viewing keys to tax inspectors or auditors to prove financial compliance without risking private spend authority.",
    visual: AuditVisual,
  },
];

export function FeaturesSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" ref={sectionRef} className="py-20 lg:py-28 bg-white border-t border-black/[0.06] font-sans">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="max-w-2xl mb-14">
          <span className="inline-flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-zinc-500 font-semibold mb-3">
            <span className="w-8 h-px bg-[#FFD400]" />
            Core Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black text-black tracking-tight leading-tight">
            Engineered for <br />
            <span className="text-zinc-500">Absolute Confidentiality.</span>
          </h2>
        </div>

        {/* Features 4-Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Visual = feature.visual;
            return (
              <div
                key={feature.number}
                className="group relative p-7 rounded-3xl border border-black/[0.07] bg-white hover:border-[#FFD400] transition-all duration-300 shadow-xs hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  {/* Visual Header */}
                  <div className="w-full h-36 mb-6 rounded-2xl bg-zinc-50/80 border border-black/[0.04] p-3 flex items-center justify-center overflow-hidden group-hover:bg-amber-50/30 transition-colors">
                    <Visual />
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-zinc-400">
                      {feature.number}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FFD400]" />
                  </div>

                  <h3 className="font-heading font-bold text-lg text-black mb-2 leading-snug">
                    {feature.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-sans">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
