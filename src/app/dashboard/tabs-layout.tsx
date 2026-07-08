"use client";

import { useState } from "react";
import type { ReactNode } from "react";

const TABS = [
  { id: "inicio", label: "Inicio" },
  { id: "calendario", label: "Calendario" },
  { id: "ranking", label: "Ranking" },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface Props {
  inicio: ReactNode;
  calendario: ReactNode;
  ranking: ReactNode;
}

export default function TabsLayout({ inicio, calendario, ranking }: Props) {
  const [active, setActive] = useState<TabId>("inicio");

  const content: Record<TabId, ReactNode> = { inicio, calendario, ranking };

  return (
    <div className="flex flex-1 flex-col">
      {/* Tab bar */}
      <div className="border-b border-neutral-100 px-6">
        <div className="flex gap-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`py-3 text-sm font-medium transition-colors ${
                active === tab.id
                  ? "border-b-2 text-neutral-900"
                  : "text-neutral-400 hover:text-neutral-600"
              }`}
              style={active === tab.id ? { borderColor: "var(--brand-pink)", color: "var(--foreground)" } : {}}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 px-6 py-6">{content[active]}</div>
    </div>
  );
}
