"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { markNotificationsRead } from "@/app/dashboard/notification-actions";

interface Notification {
  id: string;
  message: string;
  post_id: string | null;
  read: number;
  created_at: string;
}

function timeAgo(dateStr: string): string {
  let normalized = dateStr.replace(" ", "T");
  if (!normalized.endsWith("Z") && !normalized.includes("+")) normalized += "Z";
  const diff = Date.now() - new Date(normalized).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  return `hace ${days} día${days !== 1 ? "s" : ""}`;
}

interface Props {
  notifications: Notification[];
}

export default function NotificationsBell({ notifications }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [localNotifs, setLocalNotifs] = useState(notifications);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = localNotifs.filter((n) => n.read === 0).length;

  // Close on click outside
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function handleOpen() {
    setOpen((v) => !v);
    if (unreadCount > 0) {
      setLocalNotifs((prev) => prev.map((n) => ({ ...n, read: 1 })));
      startTransition(() => markNotificationsRead());
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={handleOpen}
        className="relative flex items-center justify-center w-8 h-8 rounded-full hover:bg-neutral-100 transition-colors"
        aria-label="Notificaciones"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-500">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
            style={{ backgroundColor: "var(--brand-pink)" }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-80 rounded-2xl border border-neutral-100 bg-white shadow-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
            <p className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">Notificaciones</p>
            {pending && <span className="text-[10px] text-neutral-400">guardando…</span>}
          </div>

          {localNotifs.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-neutral-400">No tienes notificaciones aún.</p>
            </div>
          ) : (
            <ul className="max-h-72 overflow-y-auto divide-y divide-neutral-50">
              {localNotifs.map((n) => (
                <li
                  key={n.id}
                  className={`px-4 py-3 ${n.read === 0 ? "bg-pink-50/40" : ""}`}
                >
                  <p className="text-xs text-neutral-700 leading-relaxed">{n.message}</p>
                  <p className="mt-1 text-[10px] text-neutral-400">{timeAgo(n.created_at)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
