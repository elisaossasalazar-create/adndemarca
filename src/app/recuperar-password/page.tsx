import Link from "next/link";

export default function RecuperarPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900">
      <header className="border-b border-neutral-100 px-6 py-5">
        <Link href="/" className="text-sm font-medium tracking-wide text-neutral-500">
          ADN de Marca · 7ma Edición
        </Link>
      </header>

      <main className="flex flex-1 justify-center px-6 py-12">
        <div className="w-full max-w-sm text-center">
          <h1 className="mb-3 text-2xl font-semibold">Recuperar contraseña</h1>
          <p className="text-sm text-neutral-600">
            La recuperación de contraseña por correo estará disponible muy
            pronto. Mientras tanto, escríbenos para ayudarte a restablecerla.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block rounded-full border border-neutral-300 px-6 py-3 text-sm font-medium text-neutral-700 transition hover:border-neutral-400"
          >
            Volver a entrar
          </Link>
        </div>
      </main>
    </div>
  );
}
