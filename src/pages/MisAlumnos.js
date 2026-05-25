import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const s = {
  page: { minHeight: '100vh', background: '#0a0a0a', fontFamily: "'DM Sans', sans-serif", paddingBottom: 40 },
  header: { background: '#111', borderBottom: '1px solid #222', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 },
  logo: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 2, color: '#f5e642' },
  backBtn: { background: 'none', border: '1px solid #222', color: '#888', borderRadius: 8, padding: '6px 14px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' },
  main: { maxWidth: 720, margin: '0 auto', padding: '20px 16px' },
  title: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: '#f5e642', letterSpacing: 2, marginBottom: 6 },
  subtitle: { fontSize: 13, color: '#666', marginBottom: 24 },
  searchBox: { width: '100%', background: '#111', border: '1px solid #222', borderRadius: 8, padding: '10px 14px', color: '#f0f0f0', fontSize: 14, outline: 'none', fontFamily: 'inherit', marginBottom: 16, boxSizing: 'border-box' },
  alumnoCard: { background: '#111', border: '1px solid #222', borderRadius: 12, padding: 18, marginBottom: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, transition: 'border-color 0.2s' },
  avatar: { width: 50, height: 50, borderRadius: '50%', background: '#f5e642', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, flexShrink: 0, fontFamily: "'Bebas Neue', sans-serif" },
  alumnoInfo: { flex: 1, minWidth: 0 },
  alumnoNombre: { fontSize: 15, fontWeight: 700, color: '#f0f0f0', marginBottom: 4 },
  alumnoEmail: { fontSize: 11, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  alumnoStats: { display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' },
  statBadge: { fontSize: 10, padding: '3px 8px', borderRadius: 6, background: '#1a1a1a', color: '#888', fontWeight: 600 },
  statActive: { background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' },
  statWarning: { background: 'rgba(245,230,66,0.1)', color: '#f5e642', border: '1px solid rgba(245,230,66,0.2)' },
  statDanger: { background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', border: '1px solid rgba(255,77,77,0.2)' },
  arrow: { color: '#444', fontSize: 24, flexShrink: 0 },
  empty: { textAlign: 'center', padding: '60px 20px', color: '#444', fontSize: 14 },
  loading: { textAlign: 'center', padding: '60px 20px', color: '#666', fontSize: 14 },
  resumen: { background: '#111', border: '1px solid #222', borderRadius: 12, padding: 16, marginBottom: 20, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, textAlign: 'center' },
  resumenStat: { display: 'flex', flexDirection: 'column', gap: 4 },
  resumenLabel: { fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: 1 },
  resumenValue: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: '#f5e642', letterSpacing: 1 },
  // Solicitudes pendientes
  pendSection: { background: 'rgba(245,230,66,0.05)', border: '1px solid rgba(245,230,66,0.25)', borderRadius: 12, padding: 16, marginBottom: 24 },
  pendTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: '#f5e642', letterSpacing: 1, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 },
  pendSubtitle: { fontSize: 12, color: '#888', marginBottom: 16 },
  pendCard: { background: '#111', border: '1px solid #2a2a2a', borderRadius: 10, padding: 14, marginBottom: 10 },
  pendInfo: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 },
  pendAvatar: { width: 42, height: 42, borderRadius: '50%', background: 'rgba(245,230,66,0.2)', color: '#f5e642', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900, flexShrink: 0, fontFamily: "'Bebas Neue', sans-serif" },
  pendBtns: { display: 'flex', gap: 8 },
  btnAprobar: { flex: 1, background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' },
  btnRechazar: { flex: 1, background: 'rgba(255,150,50,0.12)', color: '#ff9632', border: '1px solid rgba(255,150,50,0.3)', borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' },
  btnEliminar: { background: 'rgba(255,77,77,0.12)', color: '#ff4d4d', border: '1px solid rgba(255,77,77,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' },
}

function fechaHoy() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function sumarDias(fechaStr, dias) {
  const [a, m, d] = fechaStr.split('-').map(Number)
  const dt = new Date(a, m - 1, d)
  dt.setDate(dt.getDate() + dias)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
}

export default function MisAlumnos({ perfil }) {
  const navigate = useNavigate()
  const [alumnos, setAlumnos] = useState([])
  const [pendientes, setPendientes] = useState([])
  const [stats, setStats] = useState({})
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(true)
  const [procesando, setProcesando] = useState(null)

  useEffect(() => {
    cargarAlumnos()
  }, [])

  async function cargarAlumnos() {
    setLoading(true)
    const { data: todos, error } = await supabase
      .from('profiles')
      .select('id, email, nombre, rol, estado')
      .eq('rol', 'alumno')
      .order('nombre')

    if (error) {
      console.error('Error:', error)
      setLoading(false)
      return
    }

    // Separar pendientes de aprobados
    const pend = (todos || []).filter(a => a.estado === 'pendiente')
    const aprob = (todos || []).filter(a => a.estado === 'aprobado' || !a.estado)

    setPendientes(pend)
    setAlumnos(aprob)

    // Cargar stats solo de los aprobados (últimos 7 días)
    const hoy = fechaHoy()
    const hace7 = sumarDias(hoy, -6)
    const statsObj = {}

    for (const alumno of aprob) {
      const [{ data: comidas }, { data: peso }] = await Promise.all([
        supabase.from('registros_comidas').select('fecha, calorias').eq('alumno_id', alumno.id).gte('fecha', hace7).lte('fecha', hoy),
        supabase.from('registros_peso').select('peso, fecha').eq('alumno_id', alumno.id).order('fecha', { ascending: false }).limit(1)
      ])

      const diasConRegistro = new Set((comidas || []).map(c => c.fecha)).size
      const ultimoRegistro = (comidas || []).map(c => c.fecha).sort().reverse()[0] || null
      const ultimoPeso = peso?.[0]?.peso || null

      statsObj[alumno.id] = {
        diasActivos: diasConRegistro,
        ultimoRegistro,
        ultimoPeso,
        activoHoy: ultimoRegistro === hoy
      }
    }

    setStats(statsObj)
    setLoading(false)
  }

  async function aprobar(alumno) {
    setProcesando(alumno.id)
    const { error } = await supabase
      .from('profiles')
      .update({ estado: 'aprobado' })
      .eq('id', alumno.id)
    if (error) {
      alert('Error al aprobar: ' + error.message)
    } else {
      await cargarAlumnos()
    }
    setProcesando(null)
  }

  async function rechazar(alumno) {
    if (!window.confirm(`¿Rechazar a ${alumno.nombre}? No va a poder entrar a la app.`)) return
    setProcesando(alumno.id)
    const { error } = await supabase
      .from('profiles')
      .update({ estado: 'rechazado' })
      .eq('id', alumno.id)
    if (error) {
      alert('Error al rechazar: ' + error.message)
    } else {
      await cargarAlumnos()
    }
    setProcesando(null)
  }

  async function eliminar(alumno) {
    if (!window.confirm(`¿Eliminar el perfil de ${alumno.nombre}? Esta acción no se puede deshacer.`)) return
    setProcesando(alumno.id)
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', alumno.id)
    if (error) {
      alert('Error al eliminar: ' + error.message)
    } else {
      await cargarAlumnos()
    }
    setProcesando(null)
  }

  function abrirAlumno(alumno) {
    navigate(`/seguimiento?alumno=${alumno.id}`)
  }

  const alumnosFiltrados = alumnos.filter(a => 
    a.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    a.email.toLowerCase().includes(busqueda.toLowerCase())
  )

  const totalActivos = alumnos.filter(a => stats[a.id]?.activoHoy).length
  const promedioAdherencia = alumnos.length > 0 
    ? Math.round(alumnos.reduce((sum, a) => sum + (stats[a.id]?.diasActivos || 0), 0) / alumnos.length * 10) / 10
    : 0

  return (
    <div style={s.page}>
      <header style={s.header}>
        <button style={s.backBtn} onClick={() => navigate('/')}>← Volver</button>
        <div style={s.logo}>MIS ALUMNOS</div>
        <div style={{ width: 80 }}></div>
      </header>

      <main style={s.main}>
        <div style={s.title}>👀 Panel de Coach</div>
        <div style={s.subtitle}>Vé el seguimiento de tus alumnos. Tap en uno para ver/editar sus datos.</div>

        {/* SOLICITUDES PENDIENTES */}
        {!loading && pendientes.length > 0 && (
          <div style={s.pendSection}>
            <div style={s.pendTitle}>🔔 Solicitudes pendientes ({pendientes.length})</div>
            <div style={s.pendSubtitle}>Estas personas se registraron y esperan tu aprobación.</div>
            {pendientes.map(p => {
              const inicial = p.nombre?.charAt(0).toUpperCase() || '?'
              const esta = procesando === p.id
              return (
                <div key={p.id} style={s.pendCard}>
                  <div style={s.pendInfo}>
                    <div style={s.pendAvatar}>{inicial}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={s.alumnoNombre}>{p.nombre}</div>
                      <div style={s.alumnoEmail}>{p.email}</div>
                    </div>
                  </div>
                  <div style={s.pendBtns}>
                    <button style={{ ...s.btnAprobar, opacity: esta ? 0.5 : 1 }} disabled={esta} onClick={() => aprobar(p)}>
                      {esta ? '...' : '✓ Aprobar'}
                    </button>
                    <button style={{ ...s.btnRechazar, opacity: esta ? 0.5 : 1 }} disabled={esta} onClick={() => rechazar(p)}>
                      ✗ Rechazar
                    </button>
                    <button style={{ ...s.btnEliminar, opacity: esta ? 0.5 : 1 }} disabled={esta} onClick={() => eliminar(p)}>
                      🗑
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!loading && (
          <div style={s.resumen}>
            <div style={s.resumenStat}>
              <div style={s.resumenLabel}>Total alumnos</div>
              <div style={s.resumenValue}>{alumnos.length}</div>
            </div>
            <div style={s.resumenStat}>
              <div style={s.resumenLabel}>Activos hoy</div>
              <div style={s.resumenValue}>{totalActivos}</div>
            </div>
            <div style={s.resumenStat}>
              <div style={s.resumenLabel}>Días/sem prom.</div>
              <div style={s.resumenValue}>{promedioAdherencia}</div>
            </div>
          </div>
        )}

        <input 
          style={s.searchBox} 
          placeholder="🔍 Buscar alumno..." 
          value={busqueda} 
          onChange={e => setBusqueda(e.target.value)}
        />

        {loading && <div style={s.loading}>Cargando alumnos...</div>}

        {!loading && alumnosFiltrados.length === 0 && (
          <div style={s.empty}>
            {busqueda ? 'No se encontraron alumnos.' : 'Aún no tenés alumnos aprobados.'}
          </div>
        )}

        {!loading && alumnosFiltrados.map(alumno => {
          const st = stats[alumno.id] || {}
          const inicial = alumno.nombre?.charAt(0).toUpperCase() || '?'
          
          let badgeActividad
          if (st.activoHoy) {
            badgeActividad = <span style={{ ...s.statBadge, ...s.statActive }}>✅ Activo hoy</span>
          } else if (st.ultimoRegistro) {
            const diasSinReg = Math.round((new Date(fechaHoy()) - new Date(st.ultimoRegistro)) / (1000 * 60 * 60 * 24))
            if (diasSinReg <= 2) {
              badgeActividad = <span style={{ ...s.statBadge, ...s.statWarning }}>⏱️ Hace {diasSinReg}d</span>
            } else {
              badgeActividad = <span style={{ ...s.statBadge, ...s.statDanger }}>⚠️ Hace {diasSinReg}d</span>
            }
          } else {
            badgeActividad = <span style={{ ...s.statBadge, ...s.statDanger }}>📭 Sin registros</span>
          }

          let badgeAdherencia
          if (st.diasActivos >= 5) {
            badgeAdherencia = <span style={{ ...s.statBadge, ...s.statActive }}>📊 {st.diasActivos}/7 días</span>
          } else if (st.diasActivos >= 3) {
            badgeAdherencia = <span style={{ ...s.statBadge, ...s.statWarning }}>📊 {st.diasActivos}/7 días</span>
          } else {
            badgeAdherencia = <span style={{ ...s.statBadge, ...s.statDanger }}>📊 {st.diasActivos}/7 días</span>
          }

          return (
            <div key={alumno.id} style={s.alumnoCard} onClick={() => abrirAlumno(alumno)}>
              <div style={s.avatar}>{inicial}</div>
              <div style={s.alumnoInfo}>
                <div style={s.alumnoNombre}>{alumno.nombre}</div>
                <div style={s.alumnoEmail}>{alumno.email}</div>
                <div style={s.alumnoStats}>
                  {badgeActividad}
                  {badgeAdherencia}
                  {st.ultimoPeso && <span style={s.statBadge}>⚖️ {st.ultimoPeso}kg</span>}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
              <button
                onClick={(e) => { e.stopPropagation(); navigate(`/plan-entrenamiento/${alumno.id}`) }}
                style={{ background: 'rgba(245,230,66,0.15)', color: '#f5e642', border: '1px solid #f5e64240', borderRadius: 6, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
              >
                🏋️ Plan
              </button>
              <div style={s.arrow}>→</div>
            </div>
            </div>
          )
        })}
      </main>
    </div>
  )
}
