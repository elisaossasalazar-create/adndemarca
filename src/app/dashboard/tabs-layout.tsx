"use client";

import { useState } from "react";
import type { ReactNode } from "react";

const TABS = [
  { id: "inicio", label: "Inicio" },
  { id: "calendario", label: "Calendario" },
  { id: "ranking", label: "Ranking" },
  { id: "comunidad", label: "Comunidad" },
  { id: "recursos", label: "Recursos" },
  { id: "brandstein", label: "Brand-Stein ✦" },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface Props {
  inicio: ReactNode;
  calendario: ReactNode;
  ranking: ReactNode;
  comunidad: ReactNode;
  recursos: ReactNode;
  brandstein: ReactNode;
}

export default function TabsLayout({ inicio, calendario, ranking, comunidad, recursos, brandstein }: Props) {
  const [active, setActive] = useState<TabId>("inicio");

  const content: Record<TabId, ReactNode> = { inicio, calendario, ranking, comunidad, recursos, brandstein };

  return (
    <div className="flex flex-1 flex-col">
      {/* Tab bar */}
      <div className="border-b border-neutral-100 overflow-x-auto">
        <div className="flex gap-5 px-6 min-w-max">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`py-3 text-sm font-medium transition-colors whitespace-nowrap ${
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
