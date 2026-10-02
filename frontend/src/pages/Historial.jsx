import { useEffect, useState } from 'react';
import { api } from '../api.js';

const ETIQUETA = { pendiente: 'Pendiente', autorizada: 'Autorizada', no_autorizada: 'No autorizada' };

export default function Historial() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [filtros, setFiltros] = useState({ estudiante: '', desde: '', hasta: '', estado: '' });
  const [filas, setFilas] = useState([]);
  const [reincidentes, setReincidentes] = useState({ umbral: 3, estudiantes: [] });
  const [error, setError] = useState(null);

  useEffect(() => { api.estudiantes().then(setEstudiantes).catch(() => {}); }, []);
  useEffect(() => {
    api.historial(filtros).then(setFilas).catch((e) => setError(e.message));
    api.reincidentes().then(setReincidentes).catch(() => {});
  }, [filtros]);

  const cambiar = (e) => setFiltros({ ...filtros, [e.target.name]: e.target.value });
  const esReincidente = (idEst) => reincidentes.estudiantes.some((r) => r.id_estudiante === idEst);

  return (
    <section>
      <h2>Historial y reportes</h2>
      {error && <p className="error">{error}</p>}
      <div className="formulario">
        <select name="estudiante" value={filtros.estudiante} onChange={cambiar}>
          <option value="">Todos los estudiantes</option>
          {estudiantes.map((s) => <option key={s.id_estudiante} value={s.id_estudiante}>{s.apellidos} {s.nombres}</option>)}
        </select>
        <input type="date" name="desde" value={filtros.desde} onChange={cambiar} />
        <input type="date" name="hasta" value={filtros.hasta} onChange={cambiar} />
        <select name="estado" value={filtros.estado} onChange={cambiar}>
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="autorizada">Autorizada</option>
          <option value="no_autorizada">No autorizada</option>
        </select>
      </div>

      <h3>Reincidentes ({reincidentes.umbral} o más llegadas tarde)</h3>
      {reincidentes.estudiantes.length === 0 ? <p className="nota">Sin reincidentes por ahora.</p> : (
        <ul>
          {reincidentes.estudiantes.map((r) => <li key={r.id_estudiante}><strong>{r.estudiante}</strong>: {r.total_llegadas} llegadas</li>)}
        </ul>
      )}

      <h3>Registros ({filas.length})</h3>
      <div className="tabla-scroll">
        <table>
          <thead><tr><th>Fecha y hora</th><th>Estudiante</th><th>Motivo</th><th>Estado</th><th>Observación</th></tr></thead>
          <tbody>
            {filas.map((f) => (
              <tr key={f.id_llegada} className={esReincidente(f.id_estudiante) ? 'reincidente' : ''}>
                <td>{f.fecha_hora}</td><td>{f.estudiante}</td><td>{f.motivo}</td>
                <td><span className={`etiqueta ${f.estado}`}>{ETIQUETA[f.estado]}</span></td>
                <td>{f.observacion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
