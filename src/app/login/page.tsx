"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { PinkStar } from "@/components/star";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setSubmitting(false);

    if (result?.error) {
      setError("Correo o contraseña incorrectos.");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900">
      <header className="px-6 py-5 flex items-center justify-between border-b border-neutral-100">
        <Link href="/" className="text-xs tracking-[0.2em] uppercase text-neutral-400 font-medium">
          The Brand Camp · ADN de Marca
        </Link>
        <PinkStar size={20} />
      </header>

      <main className="flex flex-1 justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <h1 className="mb-6 text-3xl font-bold lowercase">bienvenida de vuelta</h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-neutral-600 text-xs uppercase tracking-wide">Correo electrónico</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl border border-neutral-200 px-4 py-3 text-base outline-none focus:border-[#FF63A6] transition-colors"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-neutral-600 text-xs uppercase tracking-wide">Contraseña</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl border border-neutral-200 px-4 py-3 text-base outline-none focus:border-[#FF63A6] transition-colors"
              />
            </label>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 rounded-full py-3.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: "var(--brand-pink)" }}
            >
              {submitting ? "entrando…" : "entrar"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm font-normal">
            <Link href="/recuperar-password" className="text-neutral-400 underline underline-offset-2">
              ¿olvidaste tu contraseña?
            </Link>
          </p>

          <p className="mt-6 text-center text-sm text-neutral-500">
            ¿aún no tienes cuenta?{" "}
            <Link href="/registro" className="font-bold underline underline-offset-2" style={{ color: "var(--brand-pink)" }}>
              únete al reto
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
