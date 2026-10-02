import express from "express"
import cors from "cors"
import "dotenv/config"
import { requiereSesion, requiereRol } from "./auth.js"
import authRoutes from "./routes/auth.js"
import llegadas from "./routes/llegadas.js"
import estudiantes from "./routes/estudiantes.js"
import reportes from "./routes/reportes.js"
import usuarios from "./routes/usuarios.js"

const app = express()
app.use(cors({ origin: process.env.FRONTEND_URL || true }))
app.use(express.json())

app.get("/api/salud", (_req, res) => res.json({ ok: true }))
app.use("/api/auth", authRoutes)
app.use("/api/llegadas", requiereSesion, llegadas)
app.use("/api/estudiantes", requiereSesion, estudiantes)
app.use("/api/reportes", requiereSesion, requiereRol("coordinador", "rector"), reportes)
app.use("/api/usuarios", requiereSesion, requiereRol("rector"), usuarios)

// Errores no controlados (por ejemplo, la base de datos apagada)
app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: "Error del servidor. Revisa la conexión con la base de datos." })
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Backend listo en http://localhost:${port}`))
