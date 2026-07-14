"use client";

import { PinkStar } from "@/components/star";

export default function BrandSteinTab() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center justify-center gap-6 py-16 text-center">
      <PinkStar size={64} />

      <div>
        <p className="text-lg font-bold text-neutral-900">Brand-Stein</p>
        <p className="mt-1 text-sm text-neutral-500 leading-relaxed">
          Tu mentor estratégico de marca. Construye tu ADN paso a paso.
        </p>
      </div>

      <a
        href="https://chatgpt.com/g/g-684b7b1862b481918624a11bf6959f29-brand-stein"
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full px-8 py-3 text-sm font-bold text-white transition hover:opacity-90"
        style={{ backgroundColor: "var(--brand-pink)" }}
      >
        Abrir Brand-Stein →
      </a>
    </div>
  );
}
