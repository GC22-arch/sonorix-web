# Sonorix Web · TECH // SOUND

La versión de Sonorix para el celular y el navegador: una PWA que funciona desde cualquier lugar. Hablás, Groq Whisper transcribe y el texto queda copiado listo para pegar.

**En vivo:** <https://sonorix-web.vercel.app> (pide contraseña).
**App de escritorio para Windows:** [GC22-arch/sonorix](https://github.com/GC22-arch/sonorix).

## Funciones

- Botón grande para grabar: un toque empieza y termina, o lo mantenés pulsado mientras hablás. En la compu también sirve la barra espaciadora.
- Onda de audio en vivo con colores neón.
- Limpieza con IA (natural, formal o casual), comandos de voz y vocabulario propio.
- Historial con búsqueda, guardado solo en el dispositivo.
- Instalable como app en Android e iPhone.

## Despliegue propio en Vercel

1. Hacé un fork de este repo e importalo en Vercel.
2. En **Settings → Environment Variables** agregá:

   | Variable | Valor |
   |---|---|
   | `GROQ_API_KEY` | Clave gratis de <https://console.groq.com/keys> |
   | `SONORIX_PASSWORD` | La contraseña para entrar a la app |
   | `GROQ_WHISPER_MODEL` | *(opcional)* `whisper-large-v3-turbo` |
   | `GROQ_CLEANUP_MODEL` | *(opcional)* `llama-3.1-8b-instant` |

3. Volvé a desplegar.

Las claves nunca llegan al navegador: el audio pasa por `/api/transcribe`, que es una ruta del servidor. La sesión es una cookie HMAC derivada de la contraseña, así que al cambiar `SONORIX_PASSWORD` se cierran todas las sesiones.

## Desarrollo

```bash
cp .env.local.example .env.local   # completá tus valores
npm install
npm run dev
```

Stack: Next.js 16, React 19, TypeScript, Tailwind CSS 3.4, Zod y Zustand, con arquitectura feature-first.

---

by **GC**
