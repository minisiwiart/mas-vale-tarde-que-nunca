const router = require('express').Router();
const pool = require('../db');

// Listar (con búsqueda opcional por nombre, apellido o documento)
router.get('/', async (req, res, next) => {
  try {
    const q = `%${(req.query.q || '').trim()}%`;
    const [rows] = await pool.query(
      `SELECT id_estudiante, documento, nombres, apellidos, grado, grupo, activo
       FROM estudiantes
       WHERE activo = 1 AND (nombres LIKE ? OR apellidos LIKE ? OR documento LIKE ?)
       ORDER BY apellidos, nombres`,
      [q, q, q]
    );
    res.json(rows);
  } catch (e) { next(e); }
});

// Crear
router.post('/', async (req, res, next) => {
  try {
    const { documento, nombres, apellidos, grupo } = req.body;
    if (!documento || !nombres || !apellidos) {
      return res.status(400).json({ error: 'Documento, nombres y apellidos son obligatorios' });
    }
    const [r] = await pool.query(
      'INSERT INTO estudiantes (documento, nombres, apellidos, grado, grupo) VALUES (?, ?, ?, ?, ?)',
      [documento.trim(), nombres.trim(), apellidos.trim(), '11', grupo || null]
    );
    res.status(201).json({ id_estudiante: r.insertId });
  } catch (e) { next(e); }
});

// Editar
router.put('/:id', async (req, res, next) => {
  try {
    const { documento, nombres, apellidos, grupo } = req.body;
    const [r] = await pool.query(
      'UPDATE estudiantes SET documento = ?, nombres = ?, apellidos = ?, grupo = ? WHERE id_estudiante = ?',
      [documento, nombres, apellidos, grupo || null, req.params.id]
    );
    if (!r.affectedRows) return res.status(404).json({ error: 'Estudiante no encontrado' });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// Desactivar (no se borra, para conservar el historial)
router.patch('/:id/desactivar', async (req, res, next) => {
  try {
    const [r] = await pool.query('UPDATE estudiantes SET activo = 0 WHERE id_estudiante = ?', [req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ error: 'Estudiante no encontrado' });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
