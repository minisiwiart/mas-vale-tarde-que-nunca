const router = require('express').Router();
const pool = require('../db');

// Estudiantes reincidentes (umbral configurable con UMBRAL_REINCIDENTE)
router.get('/reincidentes', async (_req, res, next) => {
  try {
    const umbral = Number(process.env.UMBRAL_REINCIDENTE || 3);
    const [rows] = await pool.query(
      `SELECT e.id_estudiante, e.documento, CONCAT(e.nombres, ' ', e.apellidos) AS estudiante,
              COUNT(l.id_llegada) AS total_llegadas, MAX(l.fecha_hora) AS ultima_llegada
       FROM estudiantes e
       JOIN llegadas_tarde l ON l.id_estudiante = e.id_estudiante
       GROUP BY e.id_estudiante, e.documento, e.nombres, e.apellidos
       HAVING COUNT(l.id_llegada) >= ?
       ORDER BY total_llegadas DESC`,
      [umbral]
    );
    res.json({ umbral, estudiantes: rows });
  } catch (e) { next(e); }
});

// Resumen de un estudiante: total y cantidad por estado
router.get('/estudiante/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS total,
              SUM(estado = 'pendiente') AS pendientes,
              SUM(estado = 'autorizada') AS autorizadas,
              SUM(estado = 'no_autorizada') AS no_autorizadas
       FROM llegadas_tarde WHERE id_estudiante = ?`,
      [req.params.id]
    );
    res.json(rows[0]);
  } catch (e) { next(e); }
});

module.exports = router;
