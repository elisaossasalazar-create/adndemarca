import Link from "next/link";
import { Star, PinkStar } from "@/components/star";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900">
      <header className="px-6 py-5 flex items-center justify-between">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-neutral-400 font-medium">
            The Brand Camp
          </p>
          <p className="text-xs tracking-[0.15em] uppercase text-neutral-400">
            ADN de Marca · 7ma Edición
          </p>
        </div>
        <PinkStar size={22} />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <div className="flex items-center gap-2 mb-6">
          <Star size={18} />
          <span className="text-xs tracking-[0.2em] uppercase text-neutral-400 font-medium">
            5 semanas · 7ma edición
          </span>
          <Star size={18} />
        </div>

        <h1 className="max-w-lg text-4xl font-bold leading-tight sm:text-5xl lowercase">
          construye tu marca pasando a la acción
        </h1>

        <p className="mt-5 max-w-md text-base font-normal text-neutral-500 leading-relaxed">
          retos diarios y semanales para descubrir, construir y comunicar tu
          marca. suma puntos, mantén tu racha y compite por los premios finales.
        </p>

        <div className="mt-10 flex w-full max-w-xs flex-col gap-3">
          <Link
            href="/registro"
            className="rounded-full px-6 py-3.5 text-sm font-bold text-white transition hover:opacity-90"
            style={{ backgroundColor: "var(--brand-pink)" }}
          >
            quiero unirme al reto
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-neutral-300 px-6 py-3.5 text-sm font-medium text-neutral-700 transition hover:border-neutral-400"
          >
            ya tengo cuenta
          </Link>
        </div>
      </main>

      <footer className="px-6 py-10" style={{ backgroundColor: "var(--brand-blue)" }}>
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex justify-center mb-3">
            <Star size={28} />
          </div>
          <h2 className="mb-3 text-lg font-bold lowercase text-neutral-900">
            ¿qué es el reto?
          </h2>
          <p className="text-sm font-normal text-neutral-700 leading-relaxed">
            ADN de Marca es un curso de 5 semanas en el que construyes tu marca
            personal o de negocio a través de journaling diario, un entregable
            semanal en la comunidad de Hotmart, y retos extra opcionales con
            evidencia fotográfica.
          </p>
          <p className="mt-3 text-sm font-normal text-neutral-700">
            Las 3 personas con más puntos al final de las 5 semanas ganan premios.
          </p>
        </div>
      </footer>
    </div>
  );
}
