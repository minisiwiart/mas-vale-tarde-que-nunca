import { useEffect, useState } from 'react';
import { api } from '../api.js';

const vacio = { documento: '', nombres: '', apellidos: '', grupo: '' };

export default function Estudiantes() {
  const [lista, setLista] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [form, setForm] = useState(vacio);
  const [mensaje, setMensaje] = useState(null);

  const cargar = () => api.estudiantes(busqueda).then(setLista).catch((e) => setMensaje({ error: e.message }));
  useEffect(() => { cargar(); }, [busqueda]);

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const guardar = async (e) => {
    e.preventDefault();
    try {
      await api.crearEstudiante(form);
      setForm(vacio);
      setMensaje({ ok: 'Estudiante registrado' });
      cargar();
    } catch (err) { setMensaje({ error: err.message }); }
  };

  const desactivar = async (id) => {
    if (!confirm('¿Desactivar a este estudiante? Su historial se conserva.')) return;
    await api.desactivarEstudiante(id);
    cargar();
  };

  return (
    <section>
      <h2>Estudiantes de grado 11</h2>
      {mensaje && <p className={mensaje.error ? 'error' : 'ok'}>{mensaje.error || mensaje.ok}</p>}
      <form className="formulario" onSubmit={guardar}>
        <input name="documento" placeholder="Documento" value={form.documento} onChange={cambiar} required />
        <input name="nombres" placeholder="Nombres" value={form.nombres} onChange={cambiar} required />
        <input name="apellidos" placeholder="Apellidos" value={form.apellidos} onChange={cambiar} required />
        <input name="grupo" placeholder="Grupo (ej. 11-A)" value={form.grupo} onChange={cambiar} />
        <button type="submit">Agregar</button>
      </form>
      <input className="buscador" placeholder="Buscar por nombre, apellido o documento" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
      <p className="nota">{lista.length} estudiantes</p>
      <div className="tabla-scroll">
        <table>
          <thead><tr><th>Documento</th><th>Apellidos</th><th>Nombres</th><th>Grupo</th><th></th></tr></thead>
          <tbody>
            {lista.map((s) => (
              <tr key={s.id_estudiante}>
                <td>{s.documento}</td><td>{s.apellidos}</td><td>{s.nombres}</td><td>{s.grupo}</td>
                <td><button className="secundario" onClick={() => desactivar(s.id_estudiante)}>Desactivar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
