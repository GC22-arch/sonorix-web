// Sesión sin base de datos: la cookie es un HMAC derivado de la contraseña.
// Cambiar SONORIX_PASSWORD (o SONORIX_SECRET) cierra todas las sesiones.
// Usa Web Crypto, así funciona igual en el proxy (edge) y en las rutas (node).

export const SESSION_COOKIE = "sx_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 400;

const enc = new TextEncoder();

function secret(): string | null {
  return process.env.SONORIX_SECRET || process.env.SONORIX_PASSWORD || null;
}

function toBase64Url(buf: ArrayBuffer): string {
  let s = "";
  for (const b of new Uint8Array(buf)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function expectedToken(): Promise<string | null> {
  const s = secret();
  if (!s) return null;
  const key = await crypto.subtle.importKey("raw", enc.encode(s), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return toBase64Url(await crypto.subtle.sign("HMAC", key, enc.encode("sonorix-session-v1")));
}

export async function isValidSession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const expected = await expectedToken();
  return expected !== null && safeEqual(token, expected);
}

export function passwordMatches(input: string): boolean {
  const pw = process.env.SONORIX_PASSWORD;
  return Boolean(pw) && safeEqual(input, pw as string);
}
