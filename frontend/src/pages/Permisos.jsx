import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Permisos() {
  const [lista, setLista] = useState([]);
  const [obs, setObs] = useState({});
  const [mensaje, setMensaje] = useState(null);

  const cargar = () => api.pendientes().then(setLista).catch((e) => setMensaje({ error: e.message }));
  useEffect(() => { cargar(); }, []);

  const decidir = async (id, decision) => {
    try {
      await api.decidir(id, { decision, observacion: obs[id] || '' });
      setMensaje({ ok: decision === 'autorizada' ? 'Ingreso autorizado' : 'Ingreso no autorizado' });
      cargar();
    } catch (err) { setMensaje({ error: err.message }); }
  };

  return (
    <section>
      <h2>Permisos pendientes</h2>
      {mensaje && <p className={mensaje.error ? 'error' : 'ok'}>{mensaje.error || mensaje.ok}</p>}
      {lista.length === 0 && <p className="nota">No hay llegadas pendientes.</p>}
      {lista.map((l) => (
        <div className="tarjeta" key={l.id_llegada}>
          <strong>{l.estudiante}</strong> <span className="nota">({l.documento})</span>
          <div className="nota">{l.fecha_hora}{l.motivo ? ` · ${l.motivo}` : ''}</div>
          <input placeholder="Observación (opcional)" value={obs[l.id_llegada] || ''} onChange={(e) => setObs({ ...obs, [l.id_llegada]: e.target.value })} />
          <div className="acciones">
            <button onClick={() => decidir(l.id_llegada, 'autorizada')}>Autorizar</button>
            <button className="secundario" onClick={() => decidir(l.id_llegada, 'no_autorizada')}>No autorizar</button>
          </div>
        </div>
      ))}
    </section>
  );
}
