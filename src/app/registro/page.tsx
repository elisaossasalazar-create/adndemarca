"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { CONTRACT_TEMPLATE } from "@/lib/contract-template";

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  socialHandle: string;
  password: string;
}

const emptyForm: FormData = {
  fullName: "",
  email: "",
  phone: "",
  socialHandle: "",
  password: "",
};

export default function RegistroPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [contract, setContract] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleStep1Submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStep(2);
  }

  async function handleFinalSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const missing = CONTRACT_TEMPLATE.find((b) => !contract[b.id]?.trim());
    if (missing) {
      setError("Completa todos los espacios del contrato antes de continuar.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, contract }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "No pudimos crear tu cuenta.");
        setSubmitting(false);
        return;
      }

      const signInResult = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (signInResult?.error) {
        router.push("/login");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Ocurrió un error inesperado. Intenta de nuevo.");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900">
      <header className="border-b border-neutral-100 px-6 py-5">
        <Link href="/" className="text-sm font-medium tracking-wide text-neutral-500">
          ADN de Marca · 7ma Edición
        </Link>
      </header>

      <main className="flex flex-1 justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 text-sm text-neutral-500">
            <span className={step === 1 ? "font-semibold text-neutral-900" : ""}>
              1. Tus datos
            </span>
            <span>→</span>
            <span className={step === 2 ? "font-semibold text-neutral-900" : ""}>
              2. Tu contrato
            </span>
          </div>

          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="flex flex-col gap-4">
              <h1 className="text-2xl font-semibold">Únete al reto</h1>

              <Field
                label="Nombre completo"
                value={form.fullName}
                onChange={(v) => setForm((f) => ({ ...f, fullName: v }))}
                required
              />
              <Field
                label="Correo electrónico"
                type="email"
                value={form.email}
                onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                required
              />
              <Field
                label="Número de celular"
                type="tel"
                value={form.phone}
                onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
                required
              />
              <Field
                label="Usuario de redes sociales"
                placeholder="@tu_usuario"
                value={form.socialHandle}
                onChange={(v) => setForm((f) => ({ ...f, socialHandle: v }))}
                required
              />
              <Field
                label="Contraseña"
                type="password"
                value={form.password}
                onChange={(v) => setForm((f) => ({ ...f, password: v }))}
                required
                minLength={8}
              />

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                className="mt-2 rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-700"
              >
                Continuar al contrato
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleFinalSubmit} className="flex flex-col gap-6">
              <div>
                <h1 className="text-2xl font-semibold">
                  Tu contrato consigo misma/o
                </h1>
                <p className="mt-1 text-sm text-neutral-600">
                  Completa cada frase. Este es tu compromiso para las próximas
                  5 semanas — podrás volver a verlo en tu perfil.
                </p>
              </div>

              {CONTRACT_TEMPLATE.map((blank) => (
                <div key={blank.id}>
                  <p className="text-sm leading-relaxed text-neutral-800">
                    {blank.before}
                    <input
                      type="text"
                      required
                      value={contract[blank.id] ?? ""}
                      placeholder={blank.placeholder}
                      onChange={(e) =>
                        setContract((c) => ({ ...c, [blank.id]: e.target.value }))
                      }
                      className="mx-1 inline-block w-56 max-w-full border-b border-neutral-400 bg-transparent px-1 py-0.5 align-baseline text-sm outline-none focus:border-neutral-900"
                    />
                    {blank.after}
                  </p>
                </div>
              ))}

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-medium text-neutral-700 transition hover:border-neutral-400"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50"
                >
                  {submitting ? "Creando cuenta…" : "Firmar y unirme al reto"}
                </button>
              </div>
            </form>
          )}

          <p className="mt-8 text-center text-sm text-neutral-500">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="font-medium text-neutral-900 underline">
              Entrar
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  minLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-neutral-700">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-neutral-300 px-3 py-2 text-base outline-none focus:border-neutral-900"
      />
    </label>
  );
}
