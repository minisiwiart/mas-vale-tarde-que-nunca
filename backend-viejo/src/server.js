require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/salud', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, baseDeDatos: 'conectada' });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'No se pudo conectar a la base de datos' });
  }
});

app.use('/api/estudiantes', require('./routes/estudiantes'));
app.use('/api/llegadas', require('./routes/llegadas'));
app.use('/api/permisos', require('./routes/permisos'));
app.use('/api/reportes', require('./routes/reportes'));

// Manejo general de errores
app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Ya existe un registro con ese dato' });
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API lista en http://localhost:${PORT}`));
