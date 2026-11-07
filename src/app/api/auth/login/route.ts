import { NextResponse } from "next/server";
import { z } from "zod";
import { SESSION_COOKIE, SESSION_MAX_AGE, expectedToken, passwordMatches } from "@/shared/lib/session";

const Body = z.object({ password: z.string().min(1).max(200) });

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!process.env.SONORIX_PASSWORD) {
    return NextResponse.json({ error: "Falta configurar SONORIX_PASSWORD en Vercel" }, { status: 500 });
  }
  // Pequeña espera fija: frena ataques de fuerza bruta sin necesitar base de datos.
  await new Promise((r) => setTimeout(r, 600));
  if (!parsed.success || !passwordMatches(parsed.data.password)) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }
  const token = await expectedToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token as string, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
