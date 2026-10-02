const router = require('express').Router();
const pool = require('../db');

// Registrar una llegada tarde: la fecha y la hora las pone el servidor
router.post('/', async (req, res, next) => {
  try {
    const { id_estudiante, motivo } = req.body;
    if (!id_estudiante) return res.status(400).json({ error: 'Falta el estudiante' });
    const idDocente = req.body.id_docente || process.env.DEFAULT_DOCENTE_ID || 2;
    const [r] = await pool.query(
      'INSERT INTO llegadas_tarde (id_estudiante, id_docente, motivo) VALUES (?, ?, ?)',
      [id_estudiante, idDocente, (motivo || '').trim() || null]
    );
    res.status(201).json({ id_llegada: r.insertId, estado: 'pendiente' });
  } catch (e) { next(e); }
});

// Historial con filtros: ?estudiante=ID&desde=AAAA-MM-DD&hasta=AAAA-MM-DD&estado=pendiente
router.get('/', async (req, res, next) => {
  try {
    const { estudiante, desde, hasta, estado } = req.query;
    const where = [];
    const params = [];
    if (estudiante) { where.push('l.id_estudiante = ?'); params.push(estudiante); }
    if (desde) { where.push('l.fecha_hora >= ?'); params.push(`${desde} 00:00:00`); }
    if (hasta) { where.push('l.fecha_hora <= ?'); params.push(`${hasta} 23:59:59`); }
    if (estado) { where.push('l.estado = ?'); params.push(estado); }
    const [rows] = await pool.query(
      `SELECT l.id_llegada, l.id_estudiante, e.documento,
              CONCAT(e.nombres, ' ', e.apellidos) AS estudiante,
              l.fecha_hora, l.motivo, l.estado,
              p.observacion, p.fecha_decision
       FROM llegadas_tarde l
       JOIN estudiantes e ON e.id_estudiante = l.id_estudiante
       LEFT JOIN permisos p ON p.id_llegada = l.id_llegada
       ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
       ORDER BY l.fecha_hora DESC
       LIMIT 500`,
      params
    );
    res.json(rows);
  } catch (e) { next(e); }
});

module.exports = router;
