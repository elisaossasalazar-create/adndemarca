import Link from "next/link";
import Image from "next/image";
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

        <Image
          src="/logo.png"
          alt="The Brand Camp · ADN de Marca"
          width={320}
          height={280}
          className="w-64 sm:w-80"
          priority
        />

        <p className="mt-5 max-w-md text-base font-normal text-neutral-500 leading-relaxed">
          la acción trae claridad, y por esooo durante el curso de ADN DE MARCA
          tendremos retos diarios y semanales para lanzarnos con todo y miedo,
          te vas a dar cuenta que la vida premia a los valientes, r u readyyyy?
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

      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{ backgroundColor: "var(--brand-pink)" }}
      >
        <a
          href="https://chatgpt.com/g/g-684b7b1862b481918624a11bf6959f29-brand-stein"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-bold text-white hover:opacity-75 transition-opacity"
        >
          brand-stein
        </a>
        <a
          href="https://app.hotmart.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-bold text-white hover:opacity-75 transition-opacity"
        >
          hotmart
        </a>
      </div>
    </div>
  );
}
