import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createUser, getUserByEmail } from "@/lib/db";
import { CONTRACT_TEMPLATE } from "@/lib/contract-template";

const registerSchema = z.object({
  fullName: z.string().trim().min(2, "El nombre es muy corto"),
  email: z.string().trim().email("Correo inválido"),
  phone: z.string().trim().min(7, "Número de celular inválido"),
  socialHandle: z.string().trim().min(1, "Ingresa tu usuario de redes"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  contract: z.record(z.string(), z.string().trim().min(1, "Completa todos los espacios del contrato")),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const { fullName, email, phone, socialHandle, password, contract } = parsed.data;

  const missingBlank = CONTRACT_TEMPLATE.find((blank) => !contract[blank.id]);
  if (missingBlank) {
    return NextResponse.json(
      { error: "Completa todos los espacios del contrato" },
      { status: 400 }
    );
  }

  if (getUserByEmail(email)) {
    return NextResponse.json(
      { error: "Ya existe una cuenta con ese correo" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  createUser({
    id: randomUUID(),
    full_name: fullName,
    email: email.toLowerCase(),
    phone,
    social_handle: socialHandle,
    password_hash: passwordHash,
    contract_json: JSON.stringify(contract),
  });

  return NextResponse.json({ ok: true });
}
