const router = require('express').Router();
const pool = require('../db');

// Llegadas pendientes de decisión
router.get('/pendientes', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT l.id_llegada, e.documento, CONCAT(e.nombres, ' ', e.apellidos) AS estudiante,
              l.fecha_hora, l.motivo
       FROM llegadas_tarde l
       JOIN estudiantes e ON e.id_estudiante = l.id_estudiante
       WHERE l.estado = 'pendiente'
       ORDER BY l.fecha_hora DESC`
    );
    res.json(rows);
  } catch (e) { next(e); }
});

// El coordinador decide: autorizada o no_autorizada
router.put('/:idLlegada', async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { decision, observacion } = req.body;
    if (!['autorizada', 'no_autorizada'].includes(decision)) {
      return res.status(400).json({ error: 'La decisión debe ser "autorizada" o "no_autorizada"' });
    }
    const idCoordinador = req.body.id_coordinador || process.env.DEFAULT_COORDINADOR_ID || 1;

    await conn.beginTransaction();
    const [llegada] = await conn.query(
      'SELECT estado FROM llegadas_tarde WHERE id_llegada = ? FOR UPDATE', [req.params.idLlegada]
    );
    if (!llegada.length) { await conn.rollback(); return res.status(404).json({ error: 'Llegada no encontrada' }); }
    if (llegada[0].estado !== 'pendiente') { await conn.rollback(); return res.status(409).json({ error: 'Esta llegada ya tiene una decisión' }); }

    await conn.query(
      'INSERT INTO permisos (id_llegada, id_coordinador, decision, observacion) VALUES (?, ?, ?, ?)',
      [req.params.idLlegada, idCoordinador, decision, (observacion || '').trim() || null]
    );
    await conn.query('UPDATE llegadas_tarde SET estado = ? WHERE id_llegada = ?', [decision, req.params.idLlegada]);
    await conn.commit();
    res.json({ ok: true, estado: decision });
  } catch (e) {
    await conn.rollback();
    next(e);
  } finally {
    conn.release();
  }
});

module.exports = router;
