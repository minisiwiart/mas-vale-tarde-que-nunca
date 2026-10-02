import { useState } from 'react';
import Estudiantes from './pages/Estudiantes.jsx';
import Llegadas from './pages/Llegadas.jsx';
import Permisos from './pages/Permisos.jsx';
import Historial from './pages/Historial.jsx';

const SECCIONES = [
  ['llegadas', 'Registrar llegada', Llegadas],
  ['permisos', 'Permisos', Permisos],
  ['historial', 'Historial y reportes', Historial],
  ['estudiantes', 'Estudiantes', Estudiantes]
];

export default function App() {
  const [actual, setActual] = useState('llegadas');
  const Pantalla = SECCIONES.find(([id]) => id === actual)[2];

  return (
    <>
      <header className="cabecera">
        <h1>Más vale tarde que nunca</h1>
        <p>Llegar tarde se registra, llegar mejor se logra.</p>
      </header>
      <nav className="menu">
        {SECCIONES.map(([id, nombre]) => (
          <button key={id} className={id === actual ? 'activo' : ''} onClick={() => setActual(id)}>
            {nombre}
          </button>
        ))}
      </nav>
      <main className="contenido">
        <Pantalla />
      </main>
    </>
  );
}
