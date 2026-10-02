import { Router } from "express"
import { pool } from "../db.js"
import { requiereRol } from "../auth.js"

const r = Router()

r.get("/", async (req, res) => {
  const w = [], p = []
  if (req.query.q) { w.push("(CONCAT(e.nombres,' ',e.apellidos) LIKE ? OR e.documento LIKE ?)"); p.push(`%${req.query.q}%`, `%${req.query.q}%`) }
  if (req.query.grupo) { w.push("e.grupo = ?"); p.push(req.query.grupo) }
  if (req.query.activos) w.push("e.activo = 1")
  const [rows] = await pool.query(
    `SELECT e.id_estudiante AS id, e.documento, e.nombres, e.apellidos,
            CONCAT(e.nombres,' ',e.apellidos) AS nombre, e.grupo, e.activo,
            COUNT(l.id_llegada) AS total
     FROM estudiantes e LEFT JOIN llegadas_tarde l ON l.id_estudiante = e.id_estudiante
     ${w.length ? "WHERE " + w.join(" AND ") : ""}
     GROUP BY e.id_estudiante ORDER BY e.apellidos, e.nombres LIMIT 300`, p)
  res.json(rows)
})

r.post("/", requiereRol("coordinador", "rector"), async (req, res) => {
  const { documento, nombres, apellidos, grupo } = req.body || {}
  if (!documento || !nombres || !apellidos) return res.status(400).json({ error: "Documento, nombres y apellidos son obligatorios." })
  try {
    await pool.query("INSERT INTO estudiantes (documento, nombres, apellidos, grupo) VALUES (?, ?, ?, ?)",
      [documento.trim(), nombres.trim(), apellidos.trim(), grupo || null])
    res.status(201).json({ ok: true })
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "Ya existe un estudiante con ese documento." })
    throw e
  }
})

r.patch("/:id/activo", requiereRol("coordinador", "rector"), async (req, res) => {
  await pool.query("UPDATE estudiantes SET activo = ? WHERE id_estudiante = ?", [req.body?.activo ? 1 : 0, req.params.id])
  res.json({ ok: true })
})

export default r
