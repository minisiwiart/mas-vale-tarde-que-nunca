import { Router } from "express"
import { pool } from "../db.js"
import { requiereRol } from "../auth.js"

const r = Router()

const BASE = `
  SELECT l.id_llegada AS id, e.id_estudiante, e.documento,
         CONCAT(e.nombres, ' ', e.apellidos) AS estudiante, e.grupo,
         u.nombre AS docente, l.fecha_hora, l.motivo, l.estado,
         ((SELECT COUNT(*) FROM llegadas_tarde x WHERE x.id_estudiante = l.id_estudiante) >= 3) AS reincidente
  FROM llegadas_tarde l
  JOIN estudiantes e ON e.id_estudiante = l.id_estudiante
  JOIN usuarios u ON u.id_usuario = l.id_docente`

// Construye el WHERE según los filtros. Compartido con reportes.
export function filtros(q, usuario) {
  const w = [], p = []
  if (q.estado) { w.push("l.estado = ?"); p.push(q.estado) }
  if (q.id_estudiante) { w.push("l.id_estudiante = ?"); p.push(q.id_estudiante) }
  if (q.q) { w.push("(CONCAT(e.nombres,' ',e.apellidos) LIKE ? OR e.documento LIKE ?)"); p.push(`%${q.q}%`, `%${q.q}%`) }
  if (q.desde) { w.push("DATE(l.fecha_hora) >= ?"); p.push(q.desde) }
  if (q.hasta) { w.push("DATE(l.fecha_hora) <= ?"); p.push(q.hasta) }
  // Cada docente solo ve lo que él registró
  if (usuario?.rol === "docente") { w.push("l.id_docente = ?"); p.push(usuario.id) }
  return { where: w.length ? " WHERE " + w.join(" AND ") : "", params: p }
}
export { BASE }

r.get("/", async (req, res) => {
  const { where, params } = filtros(req.query, req.usuario)
  const [rows] = await pool.query(`${BASE}${where} ORDER BY l.fecha_hora DESC LIMIT 300`, params)
  res.json(rows)
})

// El docente registra una llegada tarde (la fecha y hora las pone el servidor)
r.post("/", requiereRol("docente", "coordinador"), async (req, res) => {
  const { id_estudiante, motivo } = req.body || {}
  if (!id_estudiante) return res.status(400).json({ error: "Selecciona un estudiante." })
  const [est] = await pool.query("SELECT id_estudiante FROM estudiantes WHERE id_estudiante = ? AND activo = 1", [id_estudiante])
  if (!est.length) return res.status(404).json({ error: "El estudiante no existe o está inactivo." })
  const [ins] = await pool.query(
    "INSERT INTO llegadas_tarde (id_estudiante, id_docente, motivo) VALUES (?, ?, ?)",
    [id_estudiante, req.usuario.id, (motivo || "").trim() || null]
  )
  res.status(201).json({ id: ins.insertId })
})

// El coordinador autoriza o no autoriza el ingreso
r.patch("/:id/decision", requiereRol("coordinador"), async (req, res) => {
  const { decision, observacion } = req.body || {}
  if (!["autorizada", "no_autorizada"].includes(decision))
    return res.status(400).json({ error: "Decisión no válida." })
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const [rows] = await conn.query("SELECT estado FROM llegadas_tarde WHERE id_llegada = ? FOR UPDATE", [req.params.id])
    if (!rows.length) { await conn.rollback(); return res.status(404).json({ error: "Registro no encontrado." }) }
    if (rows[0].estado !== "pendiente") { await conn.rollback(); return res.status(409).json({ error: "Este permiso ya fue resuelto." }) }
    await conn.query(
      "INSERT INTO permisos (id_llegada, id_coordinador, decision, observacion) VALUES (?, ?, ?, ?)",
      [req.params.id, req.usuario.id, decision, observacion || null]
    )
    await conn.query("UPDATE llegadas_tarde SET estado = ? WHERE id_llegada = ?", [decision, req.params.id])
    await conn.commit()
    res.json({ ok: true })
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
})

export default r
