import jwt from "jsonwebtoken"

export const firmar = (u) =>
  jwt.sign({ id: u.id_usuario, rol: u.rol, nombre: u.nombre }, process.env.JWT_SECRET, { expiresIn: "8h" })

export function requiereSesion(req, res, next) {
  const token = (req.headers.authorization || "").replace("Bearer ", "")
  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: "Sesión vencida. Ingresa de nuevo." })
  }
}

export const requiereRol = (...roles) => (req, res, next) =>
  roles.includes(req.usuario.rol)
    ? next()
    : res.status(403).json({ error: "No tienes permiso para esta acción." })
