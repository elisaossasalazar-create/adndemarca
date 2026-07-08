"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-400 transition hover:border-neutral-400 hover:text-neutral-600"
    >
      Salir
    </button>
  );
}
