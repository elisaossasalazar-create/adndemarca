import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900">
      <header className="border-b border-neutral-100 px-6 py-5">
        <p className="text-sm font-medium tracking-wide text-neutral-500">
          ADN de Marca · 7ma Edición
        </p>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <h1 className="max-w-xl text-3xl font-semibold leading-tight sm:text-4xl">
          Construye tu marca pasando a la acción, no solo reflexionando
        </h1>
        <p className="mt-4 max-w-md text-neutral-600">
          5 semanas de retos diarios y semanales para descubrir, construir y
          comunicar tu marca. Suma puntos, mantén tu racha y compite por los
          premios finales.
        </p>

        <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
          <Link
            href="/registro"
            className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-700"
          >
            Quiero unirme al reto
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-medium text-neutral-700 transition hover:border-neutral-400"
          >
            Entrar
          </Link>
        </div>
      </main>

      <footer className="border-t border-neutral-100 px-6 py-10">
        <div className="mx-auto max-w-2xl text-center text-sm text-neutral-500">
          <h2 className="mb-2 text-base font-semibold text-neutral-800">
            Sobre el curso
          </h2>
          <p>
            ADN de Marca es un curso de 5 semanas en el que cada participante
            construye su marca personal o de negocio a través de journaling
            diario, un entregable obligatorio semanal en la comunidad de
            Hotmart, y retos extra opcionales con evidencia fotográfica.
          </p>
          <p className="mt-3">
            Acumula puntos por cada reto completado: las 3 personas con más
            puntos al final de las 5 semanas ganan premios.
          </p>
        </div>
      </footer>
    </div>
  );
}
