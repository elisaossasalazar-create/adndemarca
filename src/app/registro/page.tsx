"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { CONTRACT_TEMPLATE } from "@/lib/contract-template";
import { PinkStar } from "@/components/star";

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
      <header className="px-6 py-5 flex items-center justify-between border-b border-neutral-100">
        <Link href="/" className="text-xs tracking-[0.2em] uppercase text-neutral-400 font-medium">
          The Brand Camp · ADN de Marca
        </Link>
        <PinkStar size={20} />
      </header>

      <main className="flex flex-1 justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Step indicator */}
          <div className="mb-8 flex items-center gap-3">
            <div className={`flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide ${step === 1 ? "text-neutral-900" : "text-neutral-400"}`}>
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
                style={step === 1 ? { backgroundColor: "var(--brand-pink)", color: "white" } : { backgroundColor: "#e5e5e5", color: "#999" }}
              >1</span>
              tus datos
            </div>
            <span className="text-neutral-300">→</span>
            <div className={`flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide ${step === 2 ? "text-neutral-900" : "text-neutral-400"}`}>
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
                style={step === 2 ? { backgroundColor: "var(--brand-pink)", color: "white" } : { backgroundColor: "#e5e5e5", color: "#999" }}
              >2</span>
              tu contrato
            </div>
          </div>

          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="flex flex-col gap-4">
              <h1 className="text-3xl font-bold lowercase mb-2">únete al reto</h1>

              <Field label="Nombre completo" value={form.fullName} onChange={(v) => setForm((f) => ({ ...f, fullName: v }))} required />
              <Field label="Correo electrónico" type="email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} required />
              <Field label="Número de celular" type="tel" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} required />
              <Field label="Usuario de redes sociales" placeholder="@tu_usuario" value={form.socialHandle} onChange={(v) => setForm((f) => ({ ...f, socialHandle: v }))} required />
              <Field label="Contraseña" type="password" value={form.password} onChange={(v) => setForm((f) => ({ ...f, password: v }))} required minLength={8} />

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button
                type="submit"
                className="mt-2 rounded-full py-3.5 text-sm font-bold text-white transition hover:opacity-90"
                style={{ backgroundColor: "var(--brand-pink)" }}
              >
                continuar al contrato
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleFinalSubmit} className="flex flex-col gap-6">
              <div>
                <h1 className="text-3xl font-bold lowercase">tu contrato contigo</h1>
                <p className="mt-2 text-sm font-normal text-neutral-500">
                  Completa cada frase. Este es tu compromiso para las próximas 5 semanas.
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
                      className="mx-1 inline-block w-56 max-w-full border-b-2 bg-transparent px-1 py-0.5 align-baseline text-sm outline-none transition-colors"
                      style={{ borderColor: "var(--brand-pink)" }}
                    />
                    {blank.after}
                  </p>
                </div>
              ))}

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-medium text-neutral-700 transition hover:border-neutral-400"
                >
                  volver
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-full py-3.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: "var(--brand-pink)" }}
                >
                  {submitting ? "creando cuenta…" : "firmar y unirme al reto"}
                </button>
              </div>
            </form>
          )}

          <p className="mt-8 text-center text-sm text-neutral-500">
            ¿ya tienes cuenta?{" "}
            <Link href="/login" className="font-bold underline underline-offset-2" style={{ color: "var(--brand-pink)" }}>
              entrar
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
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-neutral-600 text-xs uppercase tracking-wide">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-neutral-200 px-4 py-3 text-base outline-none focus:border-[#FF63A6] transition-colors"
      />
    </label>
  );
}
