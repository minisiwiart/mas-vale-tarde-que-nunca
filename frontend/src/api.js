// Funciones para hablar con el backend
async function pedir(url, opciones) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...opciones
  });
  const datos = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(datos.error || 'Ocurrió un error');
  return datos;
}

export const api = {
  estudiantes: (q = '') => pedir(`/api/estudiantes?q=${encodeURIComponent(q)}`),
  crearEstudiante: (d) => pedir('/api/estudiantes', { method: 'POST', body: JSON.stringify(d) }),
  desactivarEstudiante: (id) => pedir(`/api/estudiantes/${id}/desactivar`, { method: 'PATCH' }),
  registrarLlegada: (d) => pedir('/api/llegadas', { method: 'POST', body: JSON.stringify(d) }),
  historial: (filtros = {}) => {
    const p = new URLSearchParams(Object.entries(filtros).filter(([, v]) => v));
    return pedir(`/api/llegadas?${p}`);
  },
  pendientes: () => pedir('/api/permisos/pendientes'),
  decidir: (id, d) => pedir(`/api/permisos/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
  reincidentes: () => pedir('/api/reportes/reincidentes')
};
