import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createResource, getResources, type ResourceCategory } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const resources = getResources();
  return NextResponse.json({ resources });
}

const VALID_CATEGORIES = new Set<ResourceCategory>(["libro", "video", "podcast", "substack"]);

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  if (!adminEmail || session.user.email?.toLowerCase() !== adminEmail) {
    return NextResponse.json({ error: "Solo el admin puede publicar recursos." }, { status: 403 });
  }

  let body: { category?: string; title?: string; description?: string; url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const category = String(body.category ?? "").trim() as ResourceCategory;
  const title = String(body.title ?? "").trim();
  const description = String(body.description ?? "").trim();
  const url = String(body.url ?? "").trim();

  if (!VALID_CATEGORIES.has(category)) {
    return NextResponse.json({ error: "Categoría inválida." }, { status: 400 });
  }
  if (!title) {
    return NextResponse.json({ error: "El título es obligatorio." }, { status: 400 });
  }
  if (!url || !/^https?:\/\/.+/.test(url)) {
    return NextResponse.json({ error: "El enlace debe comenzar con http:// o https://" }, { status: 400 });
  }

  const resource = createResource(category, title, description, url);
  return NextResponse.json({ ok: true, resource });
}
