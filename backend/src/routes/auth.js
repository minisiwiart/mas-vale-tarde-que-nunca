import { Router } from "express"
import bcrypt from "bcryptjs"
import { pool } from "../db.js"
import { firmar } from "../auth.js"

const r = Router()

r.post("/login", async (req, res) => {
  const { correo, contrasena } = req.body || {}
  if (!correo || !contrasena) return res.status(400).json({ error: "Escribe tu correo y contraseña." })
  const [rows] = await pool.query("SELECT * FROM usuarios WHERE correo = ? AND activo = 1", [correo])
  const u = rows[0]
  if (!u || !(await bcrypt.compare(contrasena, u.contrasena)))
    return res.status(401).json({ error: "Revisa tu correo y contraseña e intenta nuevamente." })
  res.json({
    token: firmar(u),
    usuario: { id: u.id_usuario, nombre: u.nombre, correo: u.correo, rol: u.rol },
  })
})

export default r
