import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@/auth";
import {
  getBrandSteinConversation,
  saveBrandSteinConversation,
  clearBrandSteinConversation,
  type BrandSteinMessage,
} from "@/lib/db";
import { BRAND_STEIN_SYSTEM_PROMPT } from "@/lib/brandstein-prompt";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// GET — load saved conversation
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const messages = getBrandSteinConversation(session.user.id);
  return NextResponse.json({ messages });
}

// POST — send message, stream response
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: { messages?: BrandSteinMessage[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const messages = (body.messages ?? []) as Anthropic.MessageParam[];
  if (!messages.length) {
    return NextResponse.json({ error: "Sin mensajes" }, { status: 400 });
  }

  const stream = client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    system: BRAND_STEIN_SYSTEM_PROMPT,
    messages,
  });

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(new TextEncoder().encode(chunk.delta.text));
          }
        }
        controller.close();
      } catch (e) {
        controller.error(e);
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

// PUT — save / pause conversation
export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: { messages?: BrandSteinMessage[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  saveBrandSteinConversation(session.user.id, body.messages ?? []);
  return NextResponse.json({ ok: true });
}

// DELETE — clear conversation
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  clearBrandSteinConversation(session.user.id);
  return NextResponse.json({ ok: true });
}
