// Conexión con el backend de Express. En local, Vite redirige /api a localhost:3000.
// En producción define VITE_API_URL (por ejemplo https://mi-backend.vercel.app).
const BASE = import.meta.env.VITE_API_URL ?? ""

export type Usuario = {
  id: number
  nombre: string
  correo: string
  rol: "docente" | "coordinador" | "rector"
}

const KEY = "mvtqn_sesion"

export function getSession(): { token: string; usuario: Usuario } | null {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "null")
  } catch {
    return null
  }
}
export const saveSession = (s: { token: string; usuario: Usuario }) =>
  localStorage.setItem(KEY, JSON.stringify(s))
export const clearSession = () => localStorage.removeItem(KEY)

export async function api<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...(getSession() ? { Authorization: `Bearer ${getSession()!.token}` } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    })
  } catch {
    throw new Error("No hay conexión con el servidor. Revisa que el backend esté encendido.")
  }
  const data = await res.json().catch(() => ({}))
  if (res.status === 401 && !path.startsWith("/api/auth/")) {
    clearSession()
    window.location.reload()
  }
  if (!res.ok) throw new Error(data.error || "Ocurrió un error. Intenta de nuevo.")
  return data as T
}
