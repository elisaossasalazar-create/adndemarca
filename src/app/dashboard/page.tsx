import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getUserById } from "@/lib/db";
import LogoutButton from "./logout-button";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = getUserById(session.user.id);
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900">
      <header className="flex items-center justify-between border-b border-neutral-100 px-6 py-5">
        <div>
          <p className="text-sm font-medium tracking-wide text-neutral-500">
            ADN de Marca · 7ma Edición
          </p>
          <p className="mt-1 text-lg font-semibold">Hola, {user.full_name}</p>
        </div>
        <LogoutButton />
      </header>

      <main className="flex flex-1 flex-col items-center gap-6 px-6 py-12 text-center">
        <div className="rounded-2xl bg-neutral-50 px-8 py-6">
          <p className="text-sm text-neutral-500">Puntos totales</p>
          <p className="text-4xl font-semibold">{user.points_total}</p>
        </div>

        <p className="max-w-sm text-sm text-neutral-600">
          Pasar a la acción todos los días vale más que tener el plan perfecto.
        </p>

        <div className="mt-6 rounded-xl border border-dashed border-neutral-300 px-6 py-8 text-sm text-neutral-500">
          Tu reto diario, el reto de la semana y los retos extra estarán
          disponibles aquí muy pronto.
        </div>
      </main>
    </div>
  );
}
