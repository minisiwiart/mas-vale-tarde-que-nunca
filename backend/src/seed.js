// Pone contraseñas reales (cifradas) a los usuarios de ejemplo y crea un rector.
// Uso:  npm run crear-usuarios
import bcrypt from "bcryptjs"
import { pool } from "./db.js"

const CLAVE = "Cambiar123"
const hash = await bcrypt.hash(CLAVE, 10)

await pool.query("UPDATE usuarios SET contrasena = ? WHERE contrasena = 'REEMPLAZAR_POR_HASH'", [hash])
await pool.query(
  "INSERT IGNORE INTO usuarios (nombre, correo, contrasena, rol) VALUES ('Rector de ejemplo', 'rector@ejemplo.com', ?, 'rector')",
  [hash]
)
console.log("Listo. Usuarios de ejemplo (contraseña: " + CLAVE + "):")
console.log(" - docente@ejemplo.com")
console.log(" - coordinador@ejemplo.com")
console.log(" - rector@ejemplo.com")
await pool.end()
