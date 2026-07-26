import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { DatabaseSync } from "node:sqlite";
import { writeFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { getResources, createResource, type ResourceCategory } from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  if (!session?.user?.email || !adminEmail || session.user.email.toLowerCase() !== adminEmail) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let tempPath: string | null = null;
  try {
    const formData = await req.formData();
    const file = formData.get("db") as File | null;
    if (!file) return NextResponse.json({ error: "No se recibió archivo" }, { status: 400 });

    // Write uploaded .db to a temp file
    const bytes = await file.arrayBuffer();
    tempPath = join("/tmp", `restore-${randomUUID()}.db`);
    writeFileSync(tempPath, Buffer.from(bytes));

    // Open the backup DB and read resources
    const backupDb = new DatabaseSync(tempPath);
    const rows = backupDb.prepare("SELECT * FROM resources ORDER BY created_at ASC").all() as {
      id: string; category: string; title: string; description: string; url: string; created_at: string;
    }[];
    backupDb.close();

    // Get existing resource IDs to avoid duplicates
    const existing = new Set(getResources().map((r) => r.id));

    let imported = 0;
    for (const row of rows) {
      if (existing.has(row.id)) continue;
      const validCategories: ResourceCategory[] = ["libro", "video", "podcast", "substack"];
      const category = validCategories.includes(row.category as ResourceCategory)
        ? (row.category as ResourceCategory)
        : "libro";
      createResource(category, row.title, row.description ?? "", row.url);
      imported++;
    }

    return NextResponse.json({ ok: true, imported, total: rows.length });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  } finally {
    if (tempPath) try { unlinkSync(tempPath); } catch { /* ignore */ }
  }
}
