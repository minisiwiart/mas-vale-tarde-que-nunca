import { Router } from "express"
import bcrypt from "bcryptjs"
import { pool } from "../db.js"

const r = Router()

r.get("/", async (_req, res) => {
  const [rows] = await pool.query(
    "SELECT id_usuario AS id, nombre, correo, rol, activo FROM usuarios ORDER BY nombre")
  res.json(rows)
})

r.post("/", async (req, res) => {
  const { nombre, correo, contrasena, rol } = req.body || {}
  if (!nombre || !correo || !contrasena) return res.status(400).json({ error: "Nombre, correo y contraseña son obligatorios." })
  if (!["docente", "coordinador", "rector"].includes(rol)) return res.status(400).json({ error: "Rol no válido." })
  if (contrasena.length < 6) return res.status(400).json({ error: "La contraseña debe tener mínimo 6 caracteres." })
  try {
    await pool.query("INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES (?, ?, ?, ?)",
      [nombre.trim(), correo.trim(), await bcrypt.hash(contrasena, 10), rol])
    res.status(201).json({ ok: true })
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "Ya existe un usuario con ese correo." })
    throw e
  }
})

r.patch("/:id/activo", async (req, res) => {
  if (Number(req.params.id) === req.usuario.id) return res.status(400).json({ error: "No puedes desactivar tu propio usuario." })
  await pool.query("UPDATE usuarios SET activo = ? WHERE id_usuario = ?", [req.body?.activo ? 1 : 0, req.params.id])
  res.json({ ok: true })
})

export default r
