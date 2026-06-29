"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

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
      <header className="border-b border-neutral-100 px-6 py-5">
        <Link href="/" className="text-sm font-medium tracking-wide text-neutral-500">
          ADN de Marca · 7ma Edición
        </Link>
      </header>

      <main className="flex flex-1 justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <h1 className="mb-6 text-2xl font-semibold">Entrar</h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-neutral-700">Correo electrónico</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg border border-neutral-300 px-3 py-2 text-base outline-none focus:border-neutral-900"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-neutral-700">Contraseña</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-lg border border-neutral-300 px-3 py-2 text-base outline-none focus:border-neutral-900"
              />
            </label>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50"
            >
              {submitting ? "Entrando…" : "Entrar"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm">
            <Link href="/recuperar-password" className="text-neutral-500 underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </p>

          <p className="mt-6 text-center text-sm text-neutral-500">
            ¿Aún no tienes cuenta?{" "}
            <Link href="/registro" className="font-medium text-neutral-900 underline">
              Únete al reto
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
