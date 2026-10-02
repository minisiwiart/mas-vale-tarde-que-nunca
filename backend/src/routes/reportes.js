import { Router } from "express"
import { pool } from "../db.js"
import { BASE, filtros } from "./llegadas.js"

const r = Router()

r.get("/", async (req, res) => {
  const { where, params } = filtros(req.query, null)
  const [detalle] = await pool.query(`${BASE}${where} ORDER BY l.fecha_hora DESC LIMIT 500`, params)
  const cuenta = (e) => detalle.filter((d) => d.estado === e).length
  res.json({
    resumen: {
      total: detalle.length,
      autorizadas: cuenta("autorizada"),
      no_autorizadas: cuenta("no_autorizada"),
      pendientes: cuenta("pendiente"),
    },
    detalle,
  })
})

export default r
