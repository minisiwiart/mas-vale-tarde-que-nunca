import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Llegadas() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [id, setId] = useState('');
  const [motivo, setMotivo] = useState('');
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => { api.estudiantes(busqueda).then(setEstudiantes).catch(() => {}); }, [busqueda]);

  const guardar = async (e) => {
    e.preventDefault();
    try {
      await api.registrarLlegada({ id_estudiante: id, motivo });
      setMensaje({ ok: 'Llegada registrada. Queda pendiente de la decisión del coordinador.' });
      setId(''); setMotivo('');
    } catch (err) { setMensaje({ error: err.message }); }
  };

  return (
    <section>
      <h2>Registrar llegada tarde</h2>
      <p className="nota">La fecha y la hora se guardan automáticamente.</p>
      {mensaje && <p className={mensaje.error ? 'error' : 'ok'}>{mensaje.error || mensaje.ok}</p>}
      <form className="formulario vertical" onSubmit={guardar}>
        <input placeholder="Buscar estudiante..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        <select value={id} onChange={(e) => setId(e.target.value)} required>
          <option value="">Selecciona un estudiante</option>
          {estudiantes.map((s) => (
            <option key={s.id_estudiante} value={s.id_estudiante}>{s.apellidos} {s.nombres} ({s.documento})</option>
          ))}
        </select>
        <input placeholder="Motivo (opcional): transporte, lluvia, distancia..." value={motivo} onChange={(e) => setMotivo(e.target.value)} />
        <button type="submit">Registrar llegada tarde</button>
      </form>
    </section>
  );
}
