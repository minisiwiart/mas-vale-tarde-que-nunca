import { FormEvent, ReactNode, useCallback, useEffect, useState } from "react"
import { api, clearSession, getSession, saveSession, Usuario } from "./api"

type Role = "docente" | "coordinador" | "rector"
type Status = "Pendiente" | "Autorizada" | "No autorizada"
type IconName = "clock" | "plus" | "list" | "check" | "history" | "chart" | "students" | "users" | "logout" | "search" | "calendar" | "chevron" | "menu" | "edit" | "ban" | "close"

type Llegada = {
  id: number
  id_estudiante: number
  estudiante: string
  documento: string
  grupo: string | null
  docente: string
  fecha_hora: string
  motivo: string | null
  estado: "pendiente" | "autorizada" | "no_autorizada"
  reincidente: number | boolean
}
type Estudiante = {
  id: number
  documento: string
  nombres: string
  apellidos: string
  nombre: string
  grupo: string | null
  activo: number | boolean
  total: number
}
type UsuarioFila = { id: number; nombre: string; correo: string; rol: Role; activo: number | boolean }
type Reporte = {
  resumen: { total: number; autorizadas: number; no_autorizadas: number; pendientes: number }
  detalle: Llegada[]
}

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    clock: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5v5l3.2 2" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    list: (
      <>
        <path d="M9 6h10M9 12h10M9 18h10" />
        <path d="M5 6h.01M5 12h.01M5 18h.01" strokeWidth="3" />
      </>
    ),
    check: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 2.5 2.5L16 9" />
      </>
    ),
    history: (
      <>
        <path d="M4 12a8 8 0 1 0 2.3-5.7L4 8.5" />
        <path d="M4 4v4.5h4.5M12 8v4l2.5 1.5" />
      </>
    ),
    chart: (
      <>
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
      </>
    ),
    students: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 19v-2a4.5 4.5 0 0 1 4.5-4.5h2a4.5 4.5 0 0 1 4.5 4.5v2M16 5.5a3 3 0 0 1 0 5.8M17 13a4.5 4.5 0 0 1 3.5 4.4V19" />
      </>
    ),
    users: (
      <>
        <circle cx="12" cy="7.5" r="3.5" />
        <path d="M5 20v-2a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v2" />
      </>
    ),
    logout: (
      <>
        <path d="M10 4H5v16h5M14 8l4 4-4 4M9 12h9" />
      </>
    ),
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m15.5 15.5 5 5" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 3v4M17 3v4M3 10h18" />
      </>
    ),
    chevron: <path d="m8 10 4 4 4-4" />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    edit: (
      <>
        <path d="m4 20 4.2-1 10.9-10.9-3.2-3.2L5 15.8 4 20Z" />
        <path d="m14.8 6 3.2 3.2" />
      </>
    ),
    ban: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m6 6 12 12" />
      </>
    ),
    close: <path d="M6 6l12 12M18 6 6 18" />,
  }
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      {paths[name]}
    </svg>
  )
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`logo ${compact ? "logo--compact" : ""}`}>
      <div className="logo__mark">
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <circle
            cx="24"
            cy="24"
            r="19"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            d="M24 12v13l9 6"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="4"
          />
          <circle cx="38" cy="10" r="6" fill="#F5A623" />
        </svg>
      </div>
      {!compact && (
        <div className="logo__text">
          <strong>Más vale tarde</strong>
          <span>que nunca</span>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`status status--${status.toLowerCase().replace(" ", "-")}`}
    >
      {status}
    </span>
  )
}

function Button({
  children,
  variant = "primary",
  icon,
  onClick,
  type = "button",
  className = "",
  disabled,
}: {
  children: ReactNode
  variant?: "primary" | "success" | "danger" | "outline" | "ghost"
  icon?: IconName
  onClick?: () => void
  type?: "button" | "submit"
  className?: string
  disabled?: boolean
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`button button--${variant} ${className}`}
    >
      {icon && <Icon name={icon} size={18} />}
      {children}
    </button>
  )
}

function Field({
  label,
  placeholder,
  type = "text",
  icon,
  value,
  readOnly,
  onChange,
}: {
  label: string
  placeholder?: string
  type?: string
  icon?: IconName
  value?: string
  readOnly?: boolean
  onChange?: (value: string) => void
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <div
        className={`field__control ${
          readOnly ? "field__control--readonly" : ""
        }`}
      >
        {icon && <Icon name={icon} size={18} />}
        <input
          type={type}
          value={value}
          readOnly={readOnly}
          placeholder={placeholder}
          onChange={(event) => onChange?.(event.target.value)}
        />
      </div>
    </label>
  )
}

function SelectField({
  label,
  children,
  value,
  onChange,
}: {
  label: string
  children: ReactNode
  value?: string
  onChange?: (value: string) => void
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="field__control">
        <select
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
        >
          {children}
        </select>
        <Icon name="chevron" size={17} />
      </div>
    </label>
  )
}


const navigation: Record<Role, { label: string; icon: IconName }[]> = {
  docente: [
    { label: "Registrar llegada", icon: "plus" },
    { label: "Mis registros", icon: "list" },
  ],
  coordinador: [
    { label: "Permisos pendientes", icon: "check" },
    { label: "Historial", icon: "history" },
    { label: "Reportes", icon: "chart" },
    { label: "Estudiantes", icon: "students" },
  ],
  rector: [
    { label: "Historial", icon: "history" },
    { label: "Reportes", icon: "chart" },
    { label: "Usuarios", icon: "users" },
  ],
}
const roleLabel: Record<Role, string> = {
  docente: "Docente",
  coordinador: "Coordinador",
  rector: "Rector",
}
const statusLabel: Record<Llegada["estado"], Status> = {
  pendiente: "Pendiente",
  autorizada: "Autorizada",
  no_autorizada: "No autorizada",
}

// ---------- utilidades ----------
const initialsOf = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
const toDate = (value: string) => new Date(value.replace(" ", "T"))
const fmtDate = (value: string) =>
  toDate(value).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })
const fmtHour = (value: string | Date) =>
  (typeof value === "string" ? toDate(value) : value).toLocaleTimeString("es-CO", {
    hour: "numeric",
    minute: "2-digit",
  })
const query = (params: Record<string, string>) => {
  const q = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value),
  ).toString()
  return q ? `?${q}` : ""
}

function useApi<T>(path: string, initial: T) {
  const [data, setData] = useState<T>(initial)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const reload = useCallback(() => {
    setLoading(true)
    api<T>(path)
      .then((result) => {
        setData(result)
        setError("")
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [path])
  useEffect(reload, [reload])
  return { data, loading, error, reload }
}

function Notice({ error, loading, empty }: { error: string; loading: boolean; empty?: string }) {
  if (error) return <div className="alert alert--error">{error}</div>
  if (loading) return <p className="cell-subtitle">Cargando…</p>
  if (empty) return <p className="cell-subtitle">{empty}</p>
  return null
}

// ---------- ingreso ----------
function Login({ onLogin }: { onLogin: (session: { token: string; usuario: Usuario }) => void }) {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!email || !password) return setError("Escribe tu correo y contraseña.")
    setLoading(true)
    try {
      const session = await api<{ token: string; usuario: Usuario }>("/api/auth/login", {
        method: "POST",
        body: { correo: email, contrasena: password },
      })
      saveSession(session)
      onLogin(session)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }
  return (
    <main className="login">
      <div className="login__accent" />
      <div className="login__panel">
        <form className="login__card" onSubmit={submit}>
          <Logo />
          <div className="login__heading">
            <h1>Bienvenido</h1>
            <p>Ingresa tus datos para acceder a la plataforma.</p>
          </div>
          {error && <div className="alert alert--error">{error}</div>}
          <Field
            label="Correo institucional"
            placeholder="nombre@colegio.edu.co"
            type="email"
            value={email}
            onChange={setEmail}
          />
          <Field
            label="Contraseña"
            placeholder="Ingresa tu contraseña"
            type="password"
            value={password}
            onChange={setPassword}
          />
          <Button type="submit" className="button--full" disabled={loading}>
            {loading ? "Ingresando…" : "Ingresar"}
          </Button>
          <p className="login__help">
            Si olvidaste tu contraseña, comunícate con el administrador.
          </p>
        </form>
      </div>
      <aside className="login__visual">
        <div className="login__quote">
          <span className="eyebrow">Institución Educativa Rural</span>
          <h2>Cada minuto cuenta. Cada estudiante importa.</h2>
          <p>
            Una forma clara y sencilla de acompañar la puntualidad de nuestros
            estudiantes.
          </p>
        </div>
        <div className="login__rings" />
      </aside>
    </main>
  )
}

function PageHeader({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </header>
  )
}

function StudentCell({ name, recurrent }: { name: string; recurrent?: boolean }) {
  return (
    <div className="student-cell">
      <div className={`avatar ${recurrent ? "avatar--warning" : ""}`}>{initialsOf(name)}</div>
      <div>
        <strong>{name}</strong>
        {recurrent && <small>Reincidente</small>}
      </div>
    </div>
  )
}

function DataTable({
  headers,
  total,
  children,
}: {
  headers: string[]
  total: number
  children: ReactNode
}) {
  return (
    <div className="table-card">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
      <div className="table-footer">
        <span>{total === 1 ? "1 registro" : `${total} registros`}</span>
      </div>
    </div>
  )
}

// ---------- coordinador ----------
function PendingPermissions({ onDecided }: { onDecided: () => void }) {
  const { data, loading, error, reload } = useApi<Llegada[]>("/api/llegadas?estado=pendiente", [])
  const [problem, setProblem] = useState("")
  const decide = async (id: number, decision: "autorizada" | "no_autorizada") => {
    try {
      await api(`/api/llegadas/${id}/decision`, { method: "PATCH", body: { decision } })
      setProblem("")
      reload()
      onDecided()
    } catch (e) {
      setProblem((e as Error).message)
    }
  }
  return (
    <>
      <PageHeader
        title="Permisos pendientes"
        description="Revisa y gestiona las solicitudes de ingreso a clase."
      />
      <div className="summary-line">
        <div>
          <strong>{data.length}</strong>
          <span>Solicitudes por revisar</span>
        </div>
        <span>Actualizado hoy, {fmtHour(new Date())}</span>
      </div>
      {problem && <div className="alert alert--error">{problem}</div>}
      <Notice error={error} loading={loading} />
      <section className="permission-list">
        {data.map((row) => (
          <article className="permission-card" key={row.id}>
            <div className="permission-card__student">
              <div className="avatar avatar--large">{initialsOf(row.estudiante)}</div>
              <div>
                <h3>{row.estudiante}</h3>
                <p>
                  {row.grupo} · {fmtDate(row.fecha_hora)}
                </p>
              </div>
              <StatusBadge status="Pendiente" />
            </div>
            <div className="permission-card__details">
              <div>
                <span>Hora de llegada</span>
                <strong>{fmtHour(row.fecha_hora)}</strong>
              </div>
              <div>
                <span>Motivo</span>
                <strong>{row.motivo || "Sin motivo"}</strong>
              </div>
              <div>
                <span>Registrado por</span>
                <strong>{row.docente}</strong>
              </div>
            </div>
            <div className="permission-card__actions">
              <Button variant="danger" icon="close" onClick={() => decide(row.id, "no_autorizada")}>
                No autorizar
              </Button>
              <Button variant="success" icon="check" onClick={() => decide(row.id, "autorizada")}>
                Autorizar ingreso
              </Button>
            </div>
          </article>
        ))}
        {!loading && !error && !data.length && (
          <div className="empty-state">
            <Icon name="check" size={36} />
            <h3>Todo está al día</h3>
            <p>No hay permisos pendientes por revisar.</p>
          </div>
        )}
      </section>
    </>
  )
}

function History() {
  const [student, setStudent] = useState("")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [state, setState] = useState("")
  const { data, loading, error } = useApi<Llegada[]>(
    `/api/llegadas${query({ q: student, desde: from, hasta: to, estado: state })}`,
    [],
  )
  return (
    <>
      <PageHeader
        title="Historial de llegadas"
        description="Consulta y filtra todos los registros de ingreso."
      />
      <div className="filters-bar filters-bar--four">
        <Field label="Estudiante" placeholder="Buscar por nombre" icon="search" value={student} onChange={setStudent} />
        <Field label="Desde" type="date" value={from} onChange={setFrom} />
        <Field label="Hasta" type="date" value={to} onChange={setTo} />
        <SelectField label="Estado" value={state} onChange={setState}>
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="autorizada">Autorizada</option>
          <option value="no_autorizada">No autorizada</option>
        </SelectField>
      </div>
      <Notice error={error} loading={loading} empty={!data.length ? "No hay registros con esos filtros." : ""} />
      {data.length > 0 && (
        <DataTable headers={["Estudiante", "Grupo", "Fecha y hora", "Motivo", "Estado"]} total={data.length}>
          {data.map((row) => (
            <tr key={row.id}>
              <td><StudentCell name={row.estudiante} recurrent={!!row.reincidente} /></td>
              <td>{row.grupo}</td>
              <td>
                <strong>{fmtDate(row.fecha_hora)}</strong>
                <small className="cell-subtitle">{fmtHour(row.fecha_hora)}</small>
              </td>
              <td>{row.motivo || "—"}</td>
              <td><StatusBadge status={statusLabel[row.estado]} /></td>
            </tr>
          ))}
        </DataTable>
      )}
    </>
  )
}

function Reports() {
  const students = useApi<Estudiante[]>("/api/estudiantes", [])
  const [student, setStudent] = useState("")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [applied, setApplied] = useState({ id_estudiante: "", desde: "", hasta: "" })
  const { data, loading, error } = useApi<Reporte>(`/api/reportes${query(applied)}`, {
    resumen: { total: 0, autorizadas: 0, no_autorizadas: 0, pendientes: 0 },
    detalle: [],
  })
  const stats = [
    { label: "Total de llegadas", value: data.resumen.total, tone: "blue" },
    { label: "Autorizadas", value: data.resumen.autorizadas, tone: "green" },
    { label: "No autorizadas", value: data.resumen.no_autorizadas, tone: "red" },
    { label: "Pendientes", value: data.resumen.pendientes, tone: "orange" },
  ]
  const exportCsv = () => {
    const lines = [["Estudiante", "Grupo", "Fecha", "Hora", "Motivo", "Docente", "Estado"]]
    data.detalle.forEach((row) =>
      lines.push([
        row.estudiante,
        row.grupo ?? "",
        fmtDate(row.fecha_hora),
        fmtHour(row.fecha_hora),
        row.motivo ?? "",
        row.docente,
        statusLabel[row.estado],
      ]),
    )
    const csv = lines.map((line) => line.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(";")).join("\n")
    const link = document.createElement("a")
    link.href = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }))
    link.download = "reporte-llegadas.csv"
    link.click()
  }
  return (
    <>
      <PageHeader
        title="Reportes"
        description="Analiza las llegadas tarde por estudiante y periodo."
        action={<Button variant="outline" onClick={exportCsv}>Exportar reporte</Button>}
      />
      <div className="filters-bar filters-bar--report">
        <SelectField label="Estudiante" value={student} onChange={setStudent}>
          <option value="">Todos los estudiantes</option>
          {students.data.map((s) => (
            <option key={s.id} value={s.id}>{s.nombre}</option>
          ))}
        </SelectField>
        <Field label="Desde" type="date" value={from} onChange={setFrom} />
        <Field label="Hasta" type="date" value={to} onChange={setTo} />
        <Button onClick={() => setApplied({ id_estudiante: student, desde: from, hasta: to })}>
          Generar reporte
        </Button>
      </div>
      <div className="stat-grid">
        {stats.map((stat) => (
          <article className={`stat-card stat-card--${stat.tone}`} key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
            <small>En el periodo seleccionado</small>
          </article>
        ))}
      </div>
      <div className="section-heading">
        <div>
          <h2>Detalle del reporte</h2>
        </div>
      </div>
      <Notice error={error} loading={loading} empty={!data.detalle.length ? "No hay llegadas en este periodo." : ""} />
      {data.detalle.length > 0 && (
        <DataTable headers={["Estudiante", "Fecha", "Hora", "Motivo", "Docente", "Estado"]} total={data.detalle.length}>
          {data.detalle.map((row) => (
            <tr key={row.id}>
              <td><strong>{row.estudiante}</strong></td>
              <td>{fmtDate(row.fecha_hora)}</td>
              <td>{fmtHour(row.fecha_hora)}</td>
              <td>{row.motivo || "—"}</td>
              <td>{row.docente}</td>
              <td><StatusBadge status={statusLabel[row.estado]} /></td>
            </tr>
          ))}
        </DataTable>
      )}
    </>
  )
}

function StudentsPage() {
  const [search, setSearch] = useState("")
  const [group, setGroup] = useState("")
  const { data, loading, error, reload } = useApi<Estudiante[]>(
    `/api/estudiantes${query({ q: search, grupo: group })}`,
    [],
  )
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ documento: "", nombres: "", apellidos: "", grupo: "11-A" })
  const [problem, setProblem] = useState("")
  const create = async () => {
    try {
      await api("/api/estudiantes", { method: "POST", body: form })
      setForm({ documento: "", nombres: "", apellidos: "", grupo: "11-A" })
      setCreating(false)
      setProblem("")
      reload()
    } catch (e) {
      setProblem((e as Error).message)
    }
  }
  const toggle = async (s: Estudiante) => {
    await api(`/api/estudiantes/${s.id}/activo`, { method: "PATCH", body: { activo: !s.activo } })
    reload()
  }
  return (
    <>
      <PageHeader
        title="Estudiantes"
        description="Administra los estudiantes de grado 11."
        action={<Button icon="plus" onClick={() => setCreating(!creating)}>Crear estudiante</Button>}
      />
      {creating && (
        <section className="filters-bar filters-bar--four">
          <Field label="Documento" value={form.documento} onChange={(v) => setForm({ ...form, documento: v })} />
          <Field label="Nombres" value={form.nombres} onChange={(v) => setForm({ ...form, nombres: v })} />
          <Field label="Apellidos" value={form.apellidos} onChange={(v) => setForm({ ...form, apellidos: v })} />
          <SelectField label="Grupo" value={form.grupo} onChange={(v) => setForm({ ...form, grupo: v })}>
            <option>11-A</option>
            <option>11-B</option>
          </SelectField>
          <Button variant="success" icon="check" onClick={create}>Guardar estudiante</Button>
        </section>
      )}
      {problem && <div className="alert alert--error">{problem}</div>}
      <div className="filters-bar filters-bar--simple">
        <Field label="Buscar estudiante" placeholder="Nombre o documento" icon="search" value={search} onChange={setSearch} />
        <SelectField label="Grupo" value={group} onChange={setGroup}>
          <option value="">Todos los grupos</option>
          <option>11-A</option>
          <option>11-B</option>
        </SelectField>
      </div>
      <Notice error={error} loading={loading} empty={!data.length ? "No hay estudiantes para mostrar." : ""} />
      {data.length > 0 && (
        <DataTable headers={["Estudiante", "Documento", "Grupo", "Llegadas tarde", "Estado", "Acciones"]} total={data.length}>
          {data.map((s) => (
            <tr key={s.id}>
              <td><StudentCell name={s.nombre} recurrent={s.total >= 3} /></td>
              <td>{s.documento}</td>
              <td>{s.grupo}</td>
              <td><strong className={s.total >= 3 ? "warning-text" : ""}>{s.total}</strong></td>
              <td>
                <span className={s.activo ? "active-label" : "role-label"}>{s.activo ? "Activo" : "Inactivo"}</span>
              </td>
              <td>
                <div className="row-actions">
                  <button aria-label={s.activo ? "Desactivar" : "Activar"} title={s.activo ? "Desactivar" : "Activar"} onClick={() => toggle(s)}>
                    <Icon name="ban" size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      )}
    </>
  )
}

// ---------- docente ----------
function RegisterArrival() {
  const [search, setSearch] = useState("")
  const [matches, setMatches] = useState<Estudiante[]>([])
  const [selected, setSelected] = useState<Estudiante | null>(null)
  const [reason, setReason] = useState("")
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const now = new Date()

  useEffect(() => {
    if (!search.trim()) return setMatches([])
    const timer = setTimeout(() => {
      api<Estudiante[]>(`/api/estudiantes${query({ q: search, activos: "1" })}`)
        .then((list) => setMatches(list.slice(0, 5)))
        .catch(() => setMatches([]))
    }, 250)
    return () => clearTimeout(timer)
  }, [search])

  const register = async () => {
    if (!selected) return setMessage({ ok: false, text: "Primero busca y selecciona un estudiante." })
    try {
      await api("/api/llegadas", { method: "POST", body: { id_estudiante: selected.id, motivo: reason } })
      setMessage({ ok: true, text: `Llegada de ${selected.nombre} registrada. La coordinación recibió la solicitud de permiso.` })
      setSelected(null)
      setReason("")
      setSearch("")
    } catch (e) {
      setMessage({ ok: false, text: (e as Error).message })
    }
  }
  return (
    <>
      <PageHeader title="Registrar llegada tarde" description="Busca al estudiante y registra su hora de llegada." />
      {message && (
        <div className={`alert ${message.ok ? "alert--success" : "alert--error"}`}>{message.text}</div>
      )}
      <section className="form-card">
        <div className="form-card__section">
          <span className="step">1</span>
          <div className="form-card__content">
            <h2>Busca al estudiante</h2>
            <p>Ingresa el nombre completo o número de documento.</p>
            <Field label="Nombre o documento" placeholder="Ej. Mariana López" icon="search" value={search} onChange={setSearch} />
            {matches.length > 0 && (
              <div className="search-results">
                {matches.map((s) => (
                  <button key={s.id} onClick={() => { setSelected(s); setSearch(""); setMatches([]); setMessage(null) }}>
                    <div className="avatar">{initialsOf(s.nombre)}</div>
                    <span>
                      <strong>{s.nombre}</strong>
                      <small>{s.documento} · {s.grupo}</small>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="form-card__section">
          <span className="step">2</span>
          <div className="form-card__content">
            <h2>Datos de la llegada</h2>
            {selected ? (
              <div className="selected-student">
                <div className="avatar avatar--large">{initialsOf(selected.nombre)}</div>
                <div>
                  <strong>{selected.nombre}</strong>
                  <span>Documento {selected.documento} · {selected.grupo}</span>
                </div>
                <button onClick={() => setSelected(null)}>Cambiar</button>
              </div>
            ) : (
              <p className="cell-subtitle">Aún no has seleccionado un estudiante.</p>
            )}
            <div className="two-columns">
              <Field label="Fecha" icon="calendar" value={now.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })} readOnly />
              <Field label="Hora de llegada" icon="clock" value={fmtHour(now)} readOnly />
            </div>
            <label className="field">
              <span>Motivo de la tardanza <em>Opcional</em></span>
              <textarea
                placeholder="Escribe brevemente el motivo informado por el estudiante"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
            </label>
            <div className="form-actions">
              <Button variant="outline" onClick={() => { setSelected(null); setReason(""); setMessage(null) }}>Cancelar</Button>
              <Button variant="success" icon="check" onClick={register}>Registrar llegada</Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function MyRecords() {
  const [student, setStudent] = useState("")
  const [date, setDate] = useState("")
  const { data, loading, error } = useApi<Llegada[]>(
    `/api/llegadas${query({ q: student, desde: date, hasta: date })}`,
    [],
  )
  return (
    <>
      <PageHeader title="Mis registros" description="Llegadas tarde que has registrado recientemente." />
      <div className="filters-bar">
        <Field label="Buscar estudiante" placeholder="Nombre o documento" icon="search" value={student} onChange={setStudent} />
        <Field label="Fecha" type="date" value={date} onChange={setDate} />
      </div>
      <Notice error={error} loading={loading} empty={!data.length ? "Aún no has registrado llegadas." : ""} />
      {data.length > 0 && (
        <DataTable headers={["Estudiante", "Fecha", "Hora", "Grupo", "Estado"]} total={data.length}>
          {data.map((row) => (
            <tr key={row.id}>
              <td><StudentCell name={row.estudiante} /></td>
              <td>{fmtDate(row.fecha_hora)}</td>
              <td>{fmtHour(row.fecha_hora)}</td>
              <td>{row.grupo}</td>
              <td><StatusBadge status={statusLabel[row.estado]} /></td>
            </tr>
          ))}
        </DataTable>
      )}
    </>
  )
}

// ---------- rector ----------
function UsersPage({ yo }: { yo: number }) {
  const [search, setSearch] = useState("")
  const [role, setRole] = useState("")
  const { data, loading, error, reload } = useApi<UsuarioFila[]>("/api/usuarios", [])
  const [creating, setCreating] = useState(false)
  const empty = { nombre: "", correo: "", contrasena: "", rol: "docente" }
  const [form, setForm] = useState(empty)
  const [problem, setProblem] = useState("")
  const shown = data.filter(
    (u) =>
      (!role || u.rol === role) &&
      `${u.nombre} ${u.correo}`.toLowerCase().includes(search.toLowerCase()),
  )
  const create = async () => {
    try {
      await api("/api/usuarios", { method: "POST", body: form })
      setForm(empty)
      setCreating(false)
      setProblem("")
      reload()
    } catch (e) {
      setProblem((e as Error).message)
    }
  }
  const toggle = async (u: UsuarioFila) => {
    try {
      await api(`/api/usuarios/${u.id}/activo`, { method: "PATCH", body: { activo: !u.activo } })
      setProblem("")
      reload()
    } catch (e) {
      setProblem((e as Error).message)
    }
  }
  return (
    <>
      <PageHeader
        title="Usuarios"
        description="Administra el acceso y los roles de la plataforma."
        action={<Button icon="plus" onClick={() => setCreating(!creating)}>Crear usuario</Button>}
      />
      {creating && (
        <section className="filters-bar filters-bar--four">
          <Field label="Nombre" value={form.nombre} onChange={(v) => setForm({ ...form, nombre: v })} />
          <Field label="Correo" type="email" value={form.correo} onChange={(v) => setForm({ ...form, correo: v })} />
          <Field label="Contraseña (mínimo 6)" type="password" value={form.contrasena} onChange={(v) => setForm({ ...form, contrasena: v })} />
          <SelectField label="Rol" value={form.rol} onChange={(v) => setForm({ ...form, rol: v })}>
            <option value="docente">Docente</option>
            <option value="coordinador">Coordinador</option>
            <option value="rector">Rector</option>
          </SelectField>
          <Button variant="success" icon="check" onClick={create}>Guardar usuario</Button>
        </section>
      )}
      {problem && <div className="alert alert--error">{problem}</div>}
      <div className="filters-bar filters-bar--simple">
        <Field label="Buscar usuario" placeholder="Nombre o correo" icon="search" value={search} onChange={setSearch} />
        <SelectField label="Rol" value={role} onChange={setRole}>
          <option value="">Todos los roles</option>
          <option value="docente">Docente</option>
          <option value="coordinador">Coordinador</option>
          <option value="rector">Rector</option>
        </SelectField>
      </div>
      <Notice error={error} loading={loading} />
      {shown.length > 0 && (
        <DataTable headers={["Nombre", "Correo", "Rol", "Estado", "Acciones"]} total={shown.length}>
          {shown.map((u) => (
            <tr key={u.id}>
              <td><StudentCell name={u.nombre} /></td>
              <td>{u.correo}</td>
              <td><span className="role-label">{roleLabel[u.rol]}</span></td>
              <td><span className={u.activo ? "active-label" : "role-label"}>{u.activo ? "Activo" : "Inactivo"}</span></td>
              <td>
                <div className="row-actions">
                  {u.id !== yo && (
                    <button aria-label={u.activo ? "Desactivar" : "Activar"} title={u.activo ? "Desactivar" : "Activar"} onClick={() => toggle(u)}>
                      <Icon name="ban" size={18} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      )}
    </>
  )
}

// ---------- estructura general ----------
function AppShell({ user, onLogout }: { user: Usuario; onLogout: () => void }) {
  const role = user.rol
  const [page, setPage] = useState(navigation[role][0].label)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [pending, setPending] = useState(0)
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    if (role !== "coordinador") return
    api<Llegada[]>("/api/llegadas?estado=pendiente")
      .then((list) => setPending(list.length))
      .catch(() => undefined)
  }, [role, page, refresh])

  const content: Record<string, ReactNode> = {
    "Registrar llegada": <RegisterArrival />,
    "Mis registros": <MyRecords />,
    "Permisos pendientes": <PendingPermissions onDecided={() => setRefresh((n) => n + 1)} />,
    Historial: <History />,
    Reportes: <Reports />,
    Estudiantes: <StudentsPage />,
    Usuarios: <UsersPage yo={user.id} />,
  }
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? "sidebar--open" : ""}`}>
        <div className="sidebar__top">
          <Logo />
          <button className="sidebar__close" onClick={() => setMobileOpen(false)}>
            <Icon name="close" />
          </button>
        </div>
        <nav style={{ marginTop: 24 }}>
          <span>MENÚ PRINCIPAL</span>
          {navigation[role].map((item) => (
            <button
              key={item.label}
              className={page === item.label ? "active" : ""}
              onClick={() => {
                setPage(item.label)
                setMobileOpen(false)
              }}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
              {item.label === "Permisos pendientes" && pending > 0 && <b>{pending}</b>}
            </button>
          ))}
        </nav>
        <div className="sidebar__profile">
          <div className="avatar">{initialsOf(user.nombre)}</div>
          <div>
            <strong>{user.nombre}</strong>
            <span>{roleLabel[role]}</span>
          </div>
          <button onClick={onLogout} aria-label="Cerrar sesión">
            <Icon name="logout" size={19} />
          </button>
        </div>
      </aside>
      {mobileOpen && (
        <button className="overlay" aria-label="Cerrar menú" onClick={() => setMobileOpen(false)} />
      )}
      <div className="app-main">
        <header className="mobile-header">
          <button onClick={() => setMobileOpen(true)} aria-label="Abrir menú">
            <Icon name="menu" />
          </button>
          <Logo compact />
          <div className="avatar">{initialsOf(user.nombre)}</div>
        </header>
        <main className="content">{content[page]}</main>
        <nav className="bottom-nav">
          {navigation[role].slice(0, 4).map((item) => (
            <button key={item.label} className={page === item.label ? "active" : ""} onClick={() => setPage(item.label)}>
              <Icon name={item.icon} />
              <span>{item.label.split(" ")[0]}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}

export default function App() {
  const [session, setSession] = useState(getSession())
  const logout = () => {
    clearSession()
    setSession(null)
  }
  return session ? (
    <AppShell key={session.usuario.id} user={session.usuario} onLogout={logout} />
  ) : (
    <Login onLogin={setSession} />
  )
}
