import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { auth } from "@/auth";
import { getUserById, createCommunityPost } from "@/lib/db";
import { getCurrentWeek } from "@/lib/course";

const UPLOADS_DIR = path.join(process.cwd(), "data", "uploads");

const ALLOWED_TYPES = new Set([
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/heic", "image/heif",
  "video/mp4", "video/quicktime", "video/webm", "video/3gpp",
  "application/pdf",
]);

const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30 MB

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const user = getUserById(session.user.id);
  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const content = String(formData.get("content") ?? "").trim();
  const file = formData.get("file") as File | null;

  if (!content && (!file || file.size === 0)) {
    return NextResponse.json({ error: "Escribe algo o adjunta un archivo." }, { status: 400 });
  }
  if (content.length > 1000) {
    return NextResponse.json({ error: "El mensaje es muy largo (máx. 1000 caracteres)." }, { status: 400 });
  }

  let fileName: string | null = null;
  let fileType: string | null = null;

  if (file && file.size > 0) {
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Tipo de archivo no permitido. Sube una imagen, video o PDF." },
        { status: 400 }
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "El archivo es muy grande (máx. 30 MB)." }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase() || ".bin";
    const safeName = `${randomUUID()}${ext}`;
    await mkdir(UPLOADS_DIR, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(UPLOADS_DIR, safeName), buffer);

    fileName = safeName;
    fileType = file.type;
  }

  const rawPostType = String(formData.get("post_type") ?? "reto").trim();
  const postType: "reto" | "libre" = rawPostType === "libre" ? "libre" : "reto";

  const week = getCurrentWeek();
  const post = createCommunityPost(session.user.id, user.full_name, week, content, fileName, fileType, postType);

  return NextResponse.json({ ok: true, post });
}
