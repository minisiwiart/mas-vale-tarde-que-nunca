import { FormEvent, ReactNode, useMemo, useState } from "react"

type Role = "Docente" | "Coordinador" | "Administrador"
type Status = "Pendiente" | "Autorizada" | "No autorizada"
type IconName = "clock" | "plus" | "list" | "check" | "history" | "chart" | "students" | "users" | "logout" | "search" | "calendar" | "chevron" | "menu" | "edit" | "ban" | "close"

const students = [
  {
    name: "Mariana López",
    document: "1.102.849.321",
    group: "11° A",
    total: 8,
  },
  {
    name: "Juan David Rojas",
    document: "1.104.295.842",
    group: "11° B",
    total: 3,
  },
  {
    name: "Sofía Martínez",
    document: "1.100.659.773",
    group: "11° A",
    total: 2,
  },
  {
    name: "Samuel Herrera",
    document: "1.105.284.109",
    group: "11° B",
    total: 6,
  },
  {
    name: "Valentina Gómez",
    document: "1.103.991.502",
    group: "11° A",
    total: 1,
  },
]

const permissionRows: {
  student: string
  group: string
  date: string
  hour: string
  reason: string
  teacher: string
  status: Status
}[] = [
  {
    student: "Mariana López",
    group: "11° A",
    date: "24 feb 2025",
    hour: "7:42 a. m.",
    reason: "El transporte escolar se retrasó",
    teacher: "Diana Marcela Ruiz",
    status: "Pendiente",
  },
  {
    student: "Juan David Rojas",
    group: "11° B",
    date: "24 feb 2025",
    hour: "7:35 a. m.",
    reason: "Cita médica",
    teacher: "Carlos Ramírez",
    status: "Pendiente",
  },
  {
    student: "Sofía Martínez",
    group: "11° A",
    date: "24 feb 2025",
    hour: "7:28 a. m.",
    reason: "Dificultad en la vía",
    teacher: "Diana Marcela Ruiz",
    status: "Pendiente",
  },
]

const historyRows = [
  { ...permissionRows[0], date: "24 feb 2025", status: "Pendiente" as Status },
  { ...permissionRows[1], date: "21 feb 2025", status: "Autorizada" as Status },
  {
    ...permissionRows[2],
    date: "20 feb 2025",
    status: "No autorizada" as Status,
  },
  {
    ...permissionRows[0],
    student: "Samuel Herrera",
    group: "11° B",
    date: "19 feb 2025",
    hour: "8:03 a. m.",
    status: "Autorizada" as Status,
  },
  {
    ...permissionRows[0],
    student: "Valentina Gómez",
    date: "18 feb 2025",
    hour: "7:31 a. m.",
    status: "Autorizada" as Status,
  },
]

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
}: {
  children: ReactNode
  variant?: "primary" | "success" | "danger" | "outline" | "ghost"
  icon?: IconName
  onClick?: () => void
  type?: "button" | "submit"
  className?: string
}) {
  return (
    <button
      type={type}
      onClick={onClick}
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
  Docente: [
    { label: "Registrar llegada", icon: "plus" },
    { label: "Mis registros", icon: "list" },
  ],
  Coordinador: [
    { label: "Permisos pendientes", icon: "check" },
    { label: "Historial", icon: "history" },
    { label: "Reportes", icon: "chart" },
    { label: "Estudiantes", icon: "students" },
  ],
  Administrador: [{ label: "Usuarios", icon: "users" }],
}

const initials: Record<Role, string> = {
  Docente: "DR",
  Coordinador: "AM",
  Administrador: "LP",
}
const names: Record<Role, string> = {
  Docente: "Diana Marcela Ruiz",
  Coordinador: "Andrés Mejía",
  Administrador: "Laura Pineda",
}

function Login({ onLogin }: { onLogin: () => void }) {
  const [error, setError] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!email || !password) setError(true)
    else onLogin()
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
          {error && (
            <div className="alert alert--error">
              Revisa tu correo y contraseña e intenta nuevamente.
            </div>
          )}
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
          <Button type="submit" className="button--full">
            Ingresar
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

function PendingPermissions() {
  const [rows, setRows] = useState(permissionRows)
  const decide = (name: string) =>
    setRows((current) => current.filter((row) => row.student !== name))
  return (
    <>
      <PageHeader
        title="Permisos pendientes"
        description="Revisa y gestiona las solicitudes de ingreso a clase."
      />
      <div className="summary-line">
        <div>
          <strong>{rows.length}</strong>
          <span>Solicitudes por revisar</span>
        </div>
        <span>Actualizado hoy, 8:12 a. m.</span>
      </div>
      <section className="permission-list">
        {rows.map((row) => (
          <article className="permission-card" key={row.student}>
            <div className="permission-card__student">
              <div className="avatar avatar--large">
                {row.student
                  .split(" ")
                  .map((part) => part[0])
                  .slice(0, 2)}
              </div>
              <div>
                <h3>{row.student}</h3>
                <p>
                  {row.group} · {row.date}
                </p>
              </div>
              <StatusBadge status="Pendiente" />
            </div>
            <div className="permission-card__details">
              <div>
                <span>Hora de llegada</span>
                <strong>{row.hour}</strong>
              </div>
              <div>
                <span>Motivo</span>
                <strong>{row.reason}</strong>
              </div>
              <div>
                <span>Registrado por</span>
                <strong>{row.teacher}</strong>
              </div>
            </div>
            <div className="permission-card__actions">
              <Button
                variant="danger"
                icon="close"
                onClick={() => decide(row.student)}
              >
                No autorizar
              </Button>
              <Button
                variant="success"
                icon="check"
                onClick={() => decide(row.student)}
              >
                Autorizar ingreso
              </Button>
            </div>
          </article>
        ))}
        {!rows.length && (
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

function RegisterArrival() {
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState(students[0])
  const [confirmed, setConfirmed] = useState(false)
  const matches = students.filter(
    (student) =>
      student.name.toLowerCase().includes(query.toLowerCase()) ||
      student.document.includes(query),
  )
  return (
    <>
      <PageHeader
        title="Registrar llegada tarde"
        description="Busca al estudiante y registra su hora de llegada."
      />
      {confirmed && (
        <div className="alert alert--success">
          <Icon name="check" /> Llegada registrada. La coordinación recibió la
          solicitud de permiso.
        </div>
      )}
      <section className="form-card">
        <div className="form-card__section">
          <span className="step">1</span>
          <div className="form-card__content">
            <h2>Busca al estudiante</h2>
            <p>Ingresa el nombre completo o número de documento.</p>
            <Field
              label="Nombre o documento"
              placeholder="Ej. Mariana López"
              icon="search"
              value={query}
              onChange={setQuery}
            />
            {query && (
              <div className="search-results">
                {matches.slice(0, 3).map((student) => (
                  <button
                    key={student.document}
                    onClick={() => {
                      setSelected(student)
                      setQuery("")
                    }}
                  >
                    <div className="avatar">
                      {student.name
                        .split(" ")
                        .map((part) => part[0])
                        .slice(0, 2)}
                    </div>
                    <span>
                      <strong>{student.name}</strong>
                      <small>
                        {student.document} · {student.group}
                      </small>
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
            <div className="selected-student">
              <div className="avatar avatar--large">
                {selected.name
                  .split(" ")
                  .map((part) => part[0])
                  .slice(0, 2)}
              </div>
              <div>
                <strong>{selected.name}</strong>
                <span>
                  Documento {selected.document} · {selected.group}
                </span>
              </div>
              <button
                aria-label="Cambiar estudiante"
                onClick={() => setQuery(" ")}
              >
                Cambiar
              </button>
            </div>
            <div className="two-columns">
              <Field
                label="Fecha"
                icon="calendar"
                value="24 de febrero de 2025"
                readOnly
              />
              <Field
                label="Hora de llegada"
                icon="clock"
                value="7:42 a. m."
                readOnly
              />
            </div>
            <label className="field">
              <span>
                Motivo de la tardanza <em>Opcional</em>
              </span>
              <textarea placeholder="Escribe brevemente el motivo informado por el estudiante" />
            </label>
            <div className="form-actions">
              <Button variant="outline">Cancelar</Button>
              <Button
                variant="success"
                icon="check"
                onClick={() => setConfirmed(true)}
              >
                Registrar llegada
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function MyRecords() {
  return (
    <>
      <PageHeader
        title="Mis registros"
        description="Llegadas tarde que has registrado recientemente."
      />
      <div className="filters-bar">
        <Field
          label="Buscar estudiante"
          placeholder="Nombre o documento"
          icon="search"
        />
        <Field label="Fecha" type="date" />
      </div>
      <DataTable headers={["Estudiante", "Fecha", "Hora", "Grupo", "Estado"]}>
        {historyRows.map((row) => (
          <tr key={`${row.student}-${row.date}`}>
            <td>
              <StudentCell name={row.student} />
            </td>
            <td>{row.date}</td>
            <td>{row.hour}</td>
            <td>{row.group}</td>
            <td>
              <StatusBadge status={row.status} />
            </td>
          </tr>
        ))}
      </DataTable>
    </>
  )
}

function StudentCell({
  name,
  recurrent,
}: {
  name: string
  recurrent?: boolean
}) {
  return (
    <div className="student-cell">
      <div className={`avatar ${recurrent ? "avatar--warning" : ""}`}>
        {name
          .split(" ")
          .map((part) => part[0])
          .slice(0, 2)}
      </div>
      <div>
        <strong>{name}</strong>
        {recurrent && <small>Reincidente</small>}
      </div>
    </div>
  )
}

function DataTable({
  headers,
  children,
}: {
  headers: string[]
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
        <span>Mostrando 1–5 de 24 registros</span>
        <div>
          <button>Anterior</button>
          <button className="active">1</button>
          <button>2</button>
          <button>Siguiente</button>
        </div>
      </div>
    </div>
  )
}

function History() {
  return (
    <>
      <PageHeader
        title="Historial de llegadas"
        description="Consulta y filtra todos los registros de ingreso."
      />
      <div className="filters-bar filters-bar--four">
        <Field
          label="Estudiante"
          placeholder="Buscar por nombre"
          icon="search"
        />
        <Field label="Desde" type="date" />
        <Field label="Hasta" type="date" />
        <SelectField label="Estado">
          <option>Todos los estados</option>
          <option>Autorizada</option>
          <option>Pendiente</option>
        </SelectField>
      </div>
      <DataTable
        headers={["Estudiante", "Grupo", "Fecha y hora", "Motivo", "Estado"]}
      >
        {historyRows.map((row, index) => (
          <tr key={`${row.student}-${row.date}`}>
            <td>
              <StudentCell
                name={row.student}
                recurrent={index === 0 || index === 3}
              />
            </td>
            <td>{row.group}</td>
            <td>
              <strong>{row.date}</strong>
              <small className="cell-subtitle">{row.hour}</small>
            </td>
            <td>{row.reason}</td>
            <td>
              <StatusBadge status={row.status} />
            </td>
          </tr>
        ))}
      </DataTable>
    </>
  )
}

function Reports() {
  const stats = [
    { label: "Total de llegadas", value: "24", tone: "blue" },
    { label: "Autorizadas", value: "17", tone: "green" },
    { label: "No autorizadas", value: "4", tone: "red" },
    { label: "Pendientes", value: "3", tone: "orange" },
  ]
  return (
    <>
      <PageHeader
        title="Reportes"
        description="Analiza las llegadas tarde por estudiante y periodo."
        action={<Button variant="outline">Exportar reporte</Button>}
      />
      <div className="filters-bar filters-bar--report">
        <SelectField label="Estudiante">
          <option>Mariana López</option>
          <option>Todos los estudiantes</option>
        </SelectField>
        <Field label="Desde" type="date" />
        <Field label="Hasta" type="date" />
        <Button>Generar reporte</Button>
      </div>
      <div className="stat-grid">
        {stats.map((stat) => (
          <article
            className={`stat-card stat-card--${stat.tone}`}
            key={stat.label}
          >
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
            <small>En el periodo seleccionado</small>
          </article>
        ))}
      </div>
      <div className="section-heading">
        <div>
          <h2>Detalle del reporte</h2>
          <p>Mariana López · 1 al 24 de febrero de 2025</p>
        </div>
      </div>
      <DataTable headers={["Fecha", "Hora", "Motivo", "Docente", "Estado"]}>
        {historyRows.slice(0, 4).map((row) => (
          <tr key={row.date}>
            <td>
              <strong>{row.date}</strong>
            </td>
            <td>{row.hour}</td>
            <td>{row.reason}</td>
            <td>{row.teacher}</td>
            <td>
              <StatusBadge status={row.status} />
            </td>
          </tr>
        ))}
      </DataTable>
    </>
  )
}

function StudentsPage() {
  return (
    <>
      <PageHeader
        title="Estudiantes"
        description="Administra los estudiantes de grado 11."
        action={<Button icon="plus">Crear estudiante</Button>}
      />
      <div className="filters-bar filters-bar--simple">
        <Field
          label="Buscar estudiante"
          placeholder="Nombre o documento"
          icon="search"
        />
        <SelectField label="Grupo">
          <option>Todos los grupos</option>
          <option>11° A</option>
          <option>11° B</option>
        </SelectField>
      </div>
      <DataTable
        headers={[
          "Estudiante",
          "Documento",
          "Grupo",
          "Llegadas tarde",
          "Estado",
          "Acciones",
        ]}
      >
        {students.map((student) => (
          <tr key={student.document}>
            <td>
              <StudentCell name={student.name} recurrent={student.total > 5} />
            </td>
            <td>{student.document}</td>
            <td>{student.group}</td>
            <td>
              <strong className={student.total > 5 ? "warning-text" : ""}>
                {student.total}
              </strong>
            </td>
            <td>
              <span className="active-label">Activo</span>
            </td>
            <td>
              <div className="row-actions">
                <button aria-label="Editar">
                  <Icon name="edit" size={18} />
                </button>
                <button aria-label="Desactivar">
                  <Icon name="ban" size={18} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>
    </>
  )
}

function UsersPage() {
  const users = [
    ["Diana Marcela Ruiz", "diana.ruiz@colegio.edu.co", "Docente"],
    ["Carlos Ramírez", "carlos.ramirez@colegio.edu.co", "Docente"],
    ["Andrés Mejía", "andres.mejia@colegio.edu.co", "Coordinador"],
    ["Laura Pineda", "laura.pineda@colegio.edu.co", "Administrador"],
  ]
  return (
    <>
      <PageHeader
        title="Usuarios"
        description="Administra el acceso y los roles de la plataforma."
        action={<Button icon="plus">Crear usuario</Button>}
      />
      <div className="filters-bar filters-bar--simple">
        <Field
          label="Buscar usuario"
          placeholder="Nombre o correo"
          icon="search"
        />
        <SelectField label="Rol">
          <option>Todos los roles</option>
          <option>Docente</option>
          <option>Coordinador</option>
        </SelectField>
      </div>
      <DataTable headers={["Nombre", "Correo", "Rol", "Estado", "Acciones"]}>
        {users.map(([name, email, role]) => (
          <tr key={email}>
            <td>
              <StudentCell name={name} />
            </td>
            <td>{email}</td>
            <td>
              <span className="role-label">{role}</span>
            </td>
            <td>
              <span className="active-label">Activo</span>
            </td>
            <td>
              <div className="row-actions">
                <button aria-label="Editar">
                  <Icon name="edit" size={18} />
                </button>
                <button aria-label="Desactivar">
                  <Icon name="ban" size={18} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>
    </>
  )
}

function AppShell({ onLogout }: { onLogout: () => void }) {
  const [role, setRole] = useState<Role>("Coordinador")
  const [page, setPage] = useState("Permisos pendientes")
  const [mobileOpen, setMobileOpen] = useState(false)
  const pages: Record<string, ReactNode> = useMemo(
    () => ({
      "Registrar llegada": <RegisterArrival />,
      "Mis registros": <MyRecords />,
      "Permisos pendientes": <PendingPermissions />,
      Historial: <History />,
      Reportes: <Reports />,
      Estudiantes: <StudentsPage />,
      Usuarios: <UsersPage />,
    }),
    [],
  )
  const changeRole = (next: Role) => {
    setRole(next)
    setPage(navigation[next][0].label)
  }
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? "sidebar--open" : ""}`}>
        <div className="sidebar__top">
          <Logo />
          <button
            className="sidebar__close"
            onClick={() => setMobileOpen(false)}
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="role-switcher">
          <label>Vista de demostración</label>
          <select
            value={role}
            onChange={(event) => changeRole(event.target.value as Role)}
          >
            <option>Docente</option>
            <option>Coordinador</option>
            <option>Administrador</option>
          </select>
          <Icon name="chevron" size={16} />
        </div>
        <nav>
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
              {item.label === "Permisos pendientes" && <b>3</b>}
            </button>
          ))}
        </nav>
        <div className="sidebar__profile">
          <div className="avatar">{initials[role]}</div>
          <div>
            <strong>{names[role]}</strong>
            <span>{role}</span>
          </div>
          <button onClick={onLogout} aria-label="Cerrar sesión">
            <Icon name="logout" size={19} />
          </button>
        </div>
      </aside>
      {mobileOpen && (
        <button
          className="overlay"
          aria-label="Cerrar menú"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div className="app-main">
        <header className="mobile-header">
          <button onClick={() => setMobileOpen(true)} aria-label="Abrir menú">
            <Icon name="menu" />
          </button>
          <Logo compact />
          <div className="avatar">{initials[role]}</div>
        </header>
        <main className="content">{pages[page]}</main>
        <nav className="bottom-nav">
          {navigation[role].slice(0, 4).map((item) => (
            <button
              key={item.label}
              className={page === item.label ? "active" : ""}
              onClick={() => setPage(item.label)}
            >
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
  const [loggedIn, setLoggedIn] = useState(true)
  return loggedIn ? (
    <AppShell onLogout={() => setLoggedIn(false)} />
  ) : (
    <Login onLogin={() => setLoggedIn(true)} />
  )
}
