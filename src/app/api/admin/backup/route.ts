import { readFile } from "node:fs/promises";
import path from "node:path";
import { auth } from "@/auth";

const DB_PATH = path.join(process.cwd(), "data", "app.db");

export async function GET() {
  const session = await auth();
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();

  if (!session?.user?.email || !adminEmail || session.user.email.toLowerCase() !== adminEmail) {
    return new Response("No autorizado", { status: 401 });
  }

  try {
    const buffer = await readFile(DB_PATH);
    const now = new Date().toISOString().slice(0, 19).replace(/[:.]/g, "-");
    const filename = `adndemarca-backup-${now}.db`;

    return new Response(buffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response("No se pudo leer la base de datos", { status: 500 });
  }
}
