"use client";

import { removeUser } from "./actions";

export default function DeleteUserButton({ userId, userName }: { userId: string; userName: string }) {
  async function handleDelete(formData: FormData) {
    if (!confirm(`¿Eliminar a ${userName}? Esto borra todos sus datos y no se puede deshacer.`)) return;
    await removeUser(formData);
  }

  return (
    <form action={handleDelete}>
      <input type="hidden" name="userId" value={userId} />
      <button
        type="submit"
        className="text-xs font-semibold text-white bg-red-400 hover:bg-red-500 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap"
      >
        eliminar
      </button>
    </form>
  );
}
