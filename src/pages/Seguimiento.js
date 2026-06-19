import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import EscanerBarras from '../components/EscanerBarras'

const s = {
  page: { minHeight: '100vh', background: '#0a0a0a', fontFamily: "'DM Sans', sans-serif", paddingBottom: 80 },
  header: { background: '#111', borderBottom: '1px solid #222', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 },
  logo: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 2, color: '#f5e642' },
  backBtn: { background: 'none', border: '1px solid #222', color: '#888', borderRadius: 8, padding: '6px 14px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' },
  main: { maxWidth: 720, margin: '0 auto', padding: '20px 16px' },
  adminBanner: { background: 'rgba(245,230,66,0.15)', border: '1px solid #f5e64240', borderRadius: 8, padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  adminBannerText: { fontSize: 12, color: '#f5e642', fontWeight: 600 },
  adminBannerBtn: { background: '#f5e642', color: '#000', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 },
  dayNav: { background: '#111', border: '1px solid #222', borderRadius: 12, padding: '12px 8px', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 },
  dayArrow: { background: '#1a1a1a', border: '1px solid #222', borderRadius: 8, color: '#f5e642', fontSize: 18, padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, lineHeight: 1 },
  dayCenter: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, cursor: 'pointer', position: 'relative' },
  dayBadge: { fontSize: 11, color: '#f5e642', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 },
  dayDate: { fontSize: 13, color: '#ccc', fontWeight: 600 },
  dayInputHidden: { position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' },
  hoyBtnSmall: { background: 'rgba(245,230,66,0.1)', border: '1px solid #f5e64240', borderRadius: 6, color: '#f5e642', fontSize: 11, padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, marginBottom: 12, marginLeft: 'auto', display: 'block' },
  bottomTabs: { position: 'fixed', bottom: 0, left: 0, right: 0, background: '#111', borderTop: '1px solid #222', display: 'flex', justifyContent: 'space-around', padding: '10px 0 12px', zIndex: 90 },
  bottomTab: (a) => ({ background: 'none', border: 'none', color: a ? '#f5e642' : '#666', fontFamily: 'inherit', fontSize: 10, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '4px 12px', fontWeight: a ? 700 : 500 }),
  bottomIcon: { fontSize: 22, lineHeight: 1 },
  fab: { position: 'fixed', bottom: 80, right: 20, width: 56, height: 56, borderRadius: '50%', background: '#f5e642', color: '#000', border: 'none', fontSize: 28, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(245,230,66,0.4)', zIndex: 95, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  fabMenu: { position: 'fixed', bottom: 150, right: 20, background: '#1a1a1a', border: '1px solid #333', borderRadius: 12, padding: 8, zIndex: 96, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 200, boxShadow: '0 8px 24px rgba(0,0,0,0.6)' },
  fabItem: { background: 'none', border: 'none', color: '#ccc', padding: '12px 16px', textAlign: 'left', fontSize: 14, cursor: 'pointer', borderRadius: 8, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 12 },
  card: { background: '#111', border: '1px solid #222', borderRadius: 12, padding: '20px', marginBottom: 14 },
  cardTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 1, marginBottom: 14, color: '#f0f0f0' },
  calorieCircle: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, marginBottom: 8 },
  circleSvg: { width: 160, height: 160, flexShrink: 0 },
  circleStats: { flex: 1, display: 'flex', flexDirection: 'column', gap: 12 },
  circleStat: { display: 'flex', alignItems: 'center', gap: 10 },
  circleIcon: { fontSize: 18 },
  circleLabel: { fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 1 },
  circleValue: { fontSize: 18, fontFamily: "'Bebas Neue', sans-serif", color: '#f0f0f0', letterSpacing: 1 },
  macroBar: { display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 12 },
  macroCard: { flex: 1, textAlign: 'center' },
  macroBarBg: { height: 4, background: '#1a1a1a', borderRadius: 4, overflow: 'hidden', marginTop: 6 },
  macroBarFill: (color, pct) => ({ height: '100%', width: `${Math.min(pct, 100)}%`, background: color, borderRadius: 4, transition: 'width 0.3s' }),
  momentoCard: { background: '#111', border: '1px solid #222', borderRadius: 12, marginBottom: 12, overflow: 'hidden' },
  momentoHeader: { padding: '14px 18px', borderBottom: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  momentoNombre: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 17, letterSpacing: 1, color: '#f0f0f0' },
  momentoCal: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, color: '#f5e642', letterSpacing: 1 },
  momentoComida: { padding: '12px 18px', borderBottom: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  comidaNombre: { fontSize: 13, color: '#ccc', flex: 1 },
  comidaSub: { fontSize: 11, color: '#555', marginTop: 2 },
  comidaCal: { fontSize: 13, color: '#888', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 1, marginRight: 12 },
  agregarBtn: { width: '100%', padding: '14px', background: 'none', border: 'none', color: '#f5e642', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', textAlign: 'left', paddingLeft: 18 },
  searchModal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#0a0a0a', zIndex: 200, display: 'flex', flexDirection: 'column' },
  searchHeader: { padding: '16px 20px', background: '#111', borderBottom: '1px solid #222', display: 'flex', alignItems: 'center', gap: 8 },
  searchInput: { flex: 1, background: '#1a1a1a', border: '1px solid #222', borderRadius: 8, padding: '10px 14px', color: '#f0f0f0', fontSize: 14, outline: 'none', fontFamily: 'inherit' },
  scanBtn: { background: 'rgba(245,230,66,0.15)', color: '#f5e642', border: '1px solid #f5e64240', borderRadius: 8, padding: '10px 14px', fontSize: 18, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 },
  searchClose: { background: 'none', border: 'none', color: '#888', fontSize: 24, cursor: 'pointer', padding: 4 },
  searchTabs: { display: 'flex', borderBottom: '1px solid #222', background: '#111' },
  searchTab: (a) => ({ flex: 1, padding: '12px', background: 'none', border: 'none', borderBottom: `2px solid ${a ? '#f5e642' : 'transparent'}`, color: a ? '#f5e642' : '#666', fontFamily: 'inherit', fontSize: 13, fontWeight: a ? 700 : 500, cursor: 'pointer' }),
  searchResults: { flex: 1, overflowY: 'auto', padding: '8px 0' },
  resultItem: { padding: '14px 20px', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' },
  resultImg: { width: 48, height: 48, borderRadius: 8, background: '#1a1a1a', objectFit: 'cover', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 },
  resultInfo: { flex: 1, minWidth: 0 },
  resultNombre: { fontSize: 14, color: '#f0f0f0', fontWeight: 600, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  resultMeta: { fontSize: 11, color: '#666' },
  resultBadge: (fuente) => ({ display: 'inline-block', fontSize: 10, padding: '2px 6px', borderRadius: 4, marginRight: 6, background: fuente === 'local' ? 'rgba(74,222,128,0.15)' : fuente === 'custom' ? 'rgba(168,85,247,0.15)' : 'rgba(245,230,66,0.15)', color: fuente === 'local' ? '#4ade80' : fuente === 'custom' ? '#a855f7' : '#f5e642', fontWeight: 700, letterSpacing: 0.5 }),
  loader: { padding: '20px', textAlign: 'center', color: '#60a5fa', fontSize: 12 },
  empty: { padding: '40px 20px', textAlign: 'center', color: '#444', fontSize: 13 },
  porcionModal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 250, display: 'flex', alignItems: 'flex-end' },
  porcionContent: { background: '#111', width: '100%', maxHeight: '90vh', borderRadius: '16px 16px 0 0', overflowY: 'auto', padding: '20px' },
  porcionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #222' },
  porcionNombre: { fontSize: 16, fontWeight: 700, color: '#f0f0f0' },
  porcionMarca: { fontSize: 12, color: '#888', marginTop: 2 },
  unidadOption: (selected) => ({ background: selected ? 'rgba(245,230,66,0.1)' : '#0d0d0d', border: `1px solid ${selected ? '#f5e642' : '#222'}`, borderRadius: 10, padding: '12px 14px', marginBottom: 8, cursor: 'pointer', transition: 'all 0.2s' }),
  unidadHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  unidadNombre: { fontSize: 14, fontWeight: 600, color: '#f0f0f0', flex: 1 },
  unidadGramos: { fontSize: 11, color: '#666' },
  unidadMacros: { fontSize: 11, color: '#999', marginTop: 4, display: 'flex', gap: 8, flexWrap: 'wrap' },
  cantidadBox: { background: '#0d0d0d', border: '1px solid #222', borderRadius: 10, padding: 14, marginBottom: 14 },
  cantidadLabel: { fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, textAlign: 'center' },
  cantidadRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 },
  cantidadArrow: { background: '#1a1a1a', border: '1px solid #f5e64240', borderRadius: 10, color: '#f5e642', fontSize: 22, width: 44, height: 44, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', userSelect: 'none' },
  cantidadInput: { width: 70, background: '#0a0a0a', border: '1px solid #f5e642', borderRadius: 10, padding: '10px', color: '#f5e642', fontSize: 22, textAlign: 'center', outline: 'none', fontFamily: "'Bebas Neue', sans-serif", fontWeight: 700 },
  porcionInput: { flex: 1, background: '#0a0a0a', border: '1px solid #222', borderRadius: 8, padding: '10px 14px', color: '#f0f0f0', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' },
  porcionSelect: { flex: 1.3, background: '#0a0a0a', border: '1px solid #222', borderRadius: 8, padding: '10px 14px', color: '#f0f0f0', fontSize: 14, outline: 'none', fontFamily: 'inherit', appearance: 'none', boxSizing: 'border-box' },
  porcionPreview: { background: '#0d0d0d', border: '1px solid #f5e64240', borderRadius: 10, padding: 14, marginBottom: 14 },
  porcionMacros: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, textAlign: 'center' },
  porcionMacro: { fontSize: 20, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 0.5 },
  porcionMacroLabel: { fontSize: 9, color: '#555', marginTop: 2 },
  btn: { background: '#f5e642', color: '#000', border: 'none', borderRadius: 8, padding: '14px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', width: '100%' },
  btnSm: { background: '#1a1a1a', color: '#f5e642', border: '1px solid #f5e64240', borderRadius: 6, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 },
  btnDanger: { background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', border: '1px solid rgba(255,77,77,0.2)', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' },
  label: { display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#555', marginBottom: 6 },
  detailRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #1a1a1a' },
  detailLabel: { fontSize: 13, color: '#999' },
  detailValue: { fontSize: 14, color: '#f0f0f0', fontWeight: 600 },
  agua: { display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12, justifyContent: 'center' },
  vaso: (lleno) => ({ width: 50, height: 50, borderRadius: 10, border: `2px solid ${lleno ? '#60a5fa' : '#222'}`, background: lleno ? 'rgba(96,165,250,0.2)' : 'transparent', cursor: 'pointer', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }),
  success: { color: '#4ade80', fontSize: 13, marginBottom: 10, padding: '10px 14px', background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 8 },
  metaCheck: (ok) => ({ background: ok ? 'rgba(74,222,128,0.05)' : 'rgba(255,77,77,0.05)', border: `1px solid ${ok ? '#4ade8040' : '#ff4d4d40'}`, borderRadius: 8, padding: '12px 14px', marginBottom: 14, fontSize: 12 }),
  weekDay: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #1a1a1a' },
  weekDayLeft: { display: 'flex', flexDirection: 'column', gap: 2 },
  weekDayName: { fontSize: 13, color: '#ccc', fontWeight: 600 },
  weekDayDate: { fontSize: 11, color: '#666' },
  weekDayCal: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 1 },
  customAlert: { background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 8, padding: '12px 14px', marginBottom: 14, fontSize: 12, color: '#a855f7' },
  // Estilos entrenamiento
  rutinaCard: { background: '#111', border: '1px solid #222', borderRadius: 12, padding: 16, marginBottom: 12, cursor: 'pointer' },
  ejercicioCard: { background: '#111', border: '1px solid #222', borderRadius: 12, marginBottom: 12, overflow: 'hidden' },
  serieCard: { background: '#0d0d0d', border: '1px solid #222', borderRadius: 10, padding: 14, marginBottom: 10 },
  flechasRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 },
  flecha: { background: '#1a1a1a', border: '1px solid #f5e64240', borderRadius: 8, color: '#f5e642', fontSize: 18, width: 38, height: 38, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  flechaInput: { width: 70, background: '#0a0a0a', border: '1px solid #f5e642', borderRadius: 8, padding: '8px', color: '#f5e642', fontSize: 18, textAlign: 'center', outline: 'none', fontFamily: "'Bebas Neue', sans-serif", fontWeight: 700 },
}

const MOMENTOS = [
  { id: 'Desayuno', icono: '🌅', nombre: 'Desayuno' },
  { id: 'Almuerzo', icono: '🍽️', nombre: 'Almuerzo' },
  { id: 'Merienda', icono: '☕', nombre: 'Merienda' },
  { id: 'Cena', icono: '🌙', nombre: 'Cena' },
  { id: 'Snack', icono: '🍎', nombre: 'Snacks' },
]

function fechaHoy() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function sumarDias(fechaStr, dias) {
  const [año, mes, dia] = fechaStr.split('-').map(Number)
  const d = new Date(año, mes - 1, dia)
  d.setDate(d.getDate() + dias)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatearFecha(fechaStr) {
  const hoy = fechaHoy()
  const ayer = sumarDias(hoy, -1)
  const mañana = sumarDias(hoy, 1)
  if (fechaStr === hoy) return { badge: 'HOY', texto: formatearLargo(fechaStr) }
  if (fechaStr === ayer) return { badge: 'AYER', texto: formatearLargo(fechaStr) }
  if (fechaStr === mañana) return { badge: 'MAÑANA', texto: formatearLargo(fechaStr) }
  return { badge: null, texto: formatearLargo(fechaStr) }
}

function formatearLargo(fechaStr) {
  const [año, mes, dia] = fechaStr.split('-').map(Number)
  const d = new Date(año, mes - 1, dia)
  return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
}

function CalorieCircle({ consumidas, meta }) {
  const restantes = Math.max(0, meta - consumidas)
  const pct = Math.min((consumidas / meta) * 100, 100)
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference
  const over = consumidas > meta
  return (
    <svg style={s.circleSvg} viewBox="0 0 160 160">
      <circle cx="80" cy="80" r={radius} fill="none" stroke="#1a1a1a" strokeWidth="10" />
      <circle cx="80" cy="80" r={radius} fill="none" stroke={over ? '#ff4d4d' : '#f5e642'} strokeWidth="10" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} transform="rotate(-90 80 80)" style={{ transition: 'stroke-dashoffset 0.5s' }} />
      <text x="80" y="74" textAnchor="middle" fill="#f0f0f0" fontSize="32" fontFamily="'Bebas Neue', sans-serif" letterSpacing="1">{Math.round(restantes)}</text>
      <text x="80" y="94" textAnchor="middle" fill="#666" fontSize="10" letterSpacing="1">RESTANTES</text>
    </svg>
  )
}

function DayNavigator({ fecha, setFecha }) {
  const { badge, texto } = formatearFecha(fecha)
  const hoy = fechaHoy()
  return (
    <>
      <div style={s.dayNav}>
        <button style={s.dayArrow} onClick={() => setFecha(sumarDias(fecha, -1))}>◀</button>
        <div style={s.dayCenter}>
          {badge && <div style={s.dayBadge}>{badge}</div>}
          <div style={s.dayDate}>📅 {texto}</div>
          <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} style={s.dayInputHidden} />
        </div>
        <button style={s.dayArrow} onClick={() => setFecha(sumarDias(fecha, 1))}>▶</button>
      </div>
      {fecha !== hoy && <button style={s.hoyBtnSmall} onClick={() => setFecha(hoy)}>↻ Volver a hoy</button>}
    </>
  )
}

export default function Seguimiento({ perfil }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const alumnoIdParam = searchParams.get('alumno')
  const esAdminViendo = perfil.rol === 'admin' && alumnoIdParam
  const alumnoIdActual = esAdminViendo ? alumnoIdParam : perfil.id
  const [alumnoNombre, setAlumnoNombre] = useState('')
  const [tab, setTab] = useState('panel')
  const [fecha, setFecha] = useState(fechaHoy())
  const [msg, setMsg] = useState('')
  const [registrosPeso, setRegistrosPeso] = useState([])
  const [vasosHoy, setVasosHoy] = useState(0)
  const [comidas, setComidas] = useState([])
  const [ejercicios, setEjercicios] = useState([])
  const [recientes, setRecientes] = useState([])
  const [historial7Dias, setHistorial7Dias] = useState([])
  const [metas, setMetas] = useState({ calorias: 2000, proteinas: 150, carbohidratos: 200, grasas: 65 })
  const [fabOpen, setFabOpen] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showEscaner, setShowEscaner] = useState(false)
  const [searchMomento, setSearchMomento] = useState('Desayuno')
  const [busqueda, setBusqueda] = useState('')
  const [resultados, setResultados] = useState([])
  const [buscando, setBuscando] = useState(false)
  const [searchTab, setSearchTab] = useState('todo')
  const [alimentoSel, setAlimentoSel] = useState(null)
  const [unidadSel, setUnidadSel] = useState(null)
  const [cantidad, setCantidad] = useState(1)
  const [showPesoModal, setShowPesoModal] = useState(false)
  const [showEjercicioModal, setShowEjercicioModal] = useState(false)
  const [showMetasModal, setShowMetasModal] = useState(false)
  const [pesoInput, setPesoInput] = useState('')
  const [ejercicioInput, setEjercicioInput] = useState({ ejercicio: '', series: '', repeticiones: '', peso_kg: '', notas: '' })
  const [metasForm, setMetasForm] = useState({ calorias: '', proteinas: '', carbohidratos: '', grasas: '' })
  const [showCalc, setShowCalc] = useState(false)
  const [calcForm, setCalcForm] = useState({ edad: '', sexo: 'hombre', peso: '', altura: '', actividad: 'moderado', objetivo: 'bajar de peso' })
  const [showCargarPlan, setShowCargarPlan] = useState(false)
  const [planesDisponibles, setPlanesDisponibles] = useState([])
  const [cargandoPlanes, setCargandoPlanes] = useState(false)
  const [aplicandoPlan, setAplicandoPlan] = useState(false)
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [customForm, setCustomForm] = useState({ codigo_barras: '', nombre: '', marca: '', calorias: '', proteinas: '', carbohidratos: '', grasas: '', imagen_url: '', unidades: [] })

  // ============ ESTADO ENTRENAMIENTO ============
  const [rutinas, setRutinas] = useState([])
  const [loadingRutinas, setLoadingRutinas] = useState(true)
  const [rutinaActiva, setRutinaActiva] = useState(null) // rutina seleccionada para entrenar
  const [diasRutinaActiva, setDiasRutinaActiva] = useState([])
  const [diaEntrenoSeleccionado, setDiaEntrenoSeleccionado] = useState(null)
  const [ejerciciosDiaEntreno, setEjerciciosDiaEntreno] = useState([])
  const [registrosEntreno, setRegistrosEntreno] = useState({})
  const [ultimoRegistroEntreno, setUltimoRegistroEntreno] = useState({})
  const [ejActual, setEjActual] = useState(null)
  const [seriesEditando, setSeriesEditando] = useState([])
  const [showSeleccionarRutina, setShowSeleccionarRutina] = useState(false)

  const META_AGUA = 8
  const timeoutRef = useRef(null)

  useEffect(() => {
    if (esAdminViendo) {
      supabase.from('profiles').select('nombre').eq('id', alumnoIdParam).single()
        .then(({ data }) => { if (data) setAlumnoNombre(data.nombre) })
    }
  }, [alumnoIdParam, esAdminViendo])

  useEffect(() => {
    const interval = setInterval(() => {
      const nuevaHoy = fechaHoy()
      if (fecha < nuevaHoy && tab === 'panel') setFecha(nuevaHoy)
    }, 60000)
    return () => clearInterval(interval)
  }, [fecha, tab])

  useEffect(() => { cargarTodo() }, [fecha, alumnoIdActual])
  useEffect(() => { cargarHistorial() }, [tab, alumnoIdActual])
  useEffect(() => { cargarRutinas() }, [alumnoIdActual])

  // ============ CARGA GENERAL ============
  async function cargarTodo() {
    const id = alumnoIdActual
    const [{ data: p }, { data: a }, { data: c }, { data: e }, { data: m }, { data: rec }] = await Promise.all([
      supabase.from('registros_peso').select('*').eq('alumno_id', id).order('fecha', { ascending: false }).limit(20),
      supabase.from('registros_agua').select('*').eq('alumno_id', id).eq('fecha', fecha).maybeSingle(),
      supabase.from('registros_comidas').select('*').eq('alumno_id', id).eq('fecha', fecha).order('created_at'),
      supabase.from('registros_entrenamiento').select('*').eq('alumno_id', id).eq('fecha', fecha).order('created_at'),
      supabase.from('metas_nutricionales').select('*').eq('alumno_id', id).maybeSingle(),
      supabase.from('alimentos_recientes').select('*').eq('alumno_id', id).order('ultima_vez', { ascending: false }).limit(20)
    ])
    setRegistrosPeso(p || [])
    setVasosHoy(a?.vasos || 0)
    setComidas(c || [])
    setEjercicios(e || [])
    setRecientes(rec || [])
    if (m) setMetas(m)
  }

  async function cargarHistorial() {
    if (tab !== 'progreso') return
    const id = alumnoIdActual
    const hoy = fechaHoy()
    const hace7 = sumarDias(hoy, -6)
    const { data } = await supabase.from('registros_comidas').select('fecha, calorias').eq('alumno_id', id).gte('fecha', hace7).lte('fecha', hoy)
    const porFecha = {}
    for (let i = 0; i < 7; i++) { const f = sumarDias(hoy, -i); porFecha[f] = 0 }
    if (data) data.forEach(c => { if (porFecha[c.fecha] !== undefined) porFecha[c.fecha] += (c.calorias || 0) })
    const arr = Object.entries(porFecha).map(([fecha, calorias]) => ({ fecha, calorias })).sort((a, b) => b.fecha.localeCompare(a.fecha))
    setHistorial7Dias(arr)
  }

  // ============ RUTINAS ============
  async function cargarRutinas() {
    setLoadingRutinas(true)
    const { data } = await supabase.from('rutinas').select('*').eq('alumno_id', alumnoIdActual).order('created_at', { ascending: false })
    setRutinas(data || [])
    setLoadingRutinas(false)
  }

  async function seleccionarRutina(rutina) {
    setRutinaActiva(rutina)
    setShowSeleccionarRutina(false)
    const { data: dias } = await supabase
      .from('rutina_dias')
      .select('*, rutina_ejercicios(*, ejercicios_catalogo(*))')
      .eq('rutina_id', rutina.id)
      .order('orden')
    setDiasRutinaActiva(dias || [])
    if (dias && dias.length > 0) {
      setDiaEntrenoSeleccionado(dias[0])
      cargarRegistrosDia(dias[0])
    }
  }

  async function cargarRegistrosDia(dia) {
    if (!dia) return
    // Los ejercicios vienen del día de la rutina
    const ejercicios = dia.rutina_ejercicios || []
    setEjerciciosDiaEntreno(ejercicios)

    // Cargar registros de HOY para cada ejercicio de la rutina
    const ids = ejercicios.map(e => e.id)
    if (ids.length === 0) return

    const hoy = fechaHoy()
    const { data: regs } = await supabase
      .from('registros_series_rutina')
      .select('*')
      .eq('alumno_id', alumnoIdActual)
      .eq('fecha', hoy)
      .in('rutina_ejercicio_id', ids)

    const mapRegs = {}
    ;(regs || []).forEach(r => {
      if (!mapRegs[r.rutina_ejercicio_id]) mapRegs[r.rutina_ejercicio_id] = []
      mapRegs[r.rutina_ejercicio_id].push(r)
    })
    Object.keys(mapRegs).forEach(k => mapRegs[k].sort((a, b) => a.numero_serie - b.numero_serie))
    setRegistrosEntreno(mapRegs)

    // Último registro de cada ejercicio
    const ultMap = {}
    for (const ej of ejercicios) {
      const { data: ult } = await supabase
        .from('registros_series_rutina')
        .select('*')
        .eq('alumno_id', alumnoIdActual)
        .eq('rutina_ejercicio_id', ej.id)
        .neq('fecha', hoy)
        .order('fecha', { ascending: false })
        .limit(1)
      if (ult && ult[0]) ultMap[ej.id] = ult[0]
    }
    setUltimoRegistroEntreno(ultMap)
  }

  function abrirEjercicioEntreno(ej) {
    setEjActual(ej)
    const yaRegistrados = registrosEntreno[ej.id] || []
    if (yaRegistrados.length > 0) {
      setSeriesEditando(yaRegistrados.map(r => ({
        numero_serie: r.numero_serie,
        reps: r.reps_hechas,
        peso: r.peso_kg,
        rir: r.rir,
        notas: r.notas || ''
      })))
    } else {
      const ult = ultimoRegistroEntreno[ej.id]
      const seriesPlan = parseInt(ej.series) || 3
      const repsPlan = parseInt(ej.repeticiones) || 10
      const series = []
      for (let i = 1; i <= seriesPlan; i++) {
        series.push({
          numero_serie: i,
          reps: ult?.reps_hechas || repsPlan,
          peso: ult?.peso_kg || 0,
          rir: ej.rir || 2,
          notas: ''
        })
      }
      setSeriesEditando(series)
    }
  }

  function ajustarValor(idx, campo, delta) {
    const nuevas = [...seriesEditando]
    const actual = parseFloat(nuevas[idx][campo]) || 0
    let nuevo = actual + delta
    if (nuevo < 0) nuevo = 0
    nuevas[idx][campo] = nuevo
    setSeriesEditando(nuevas)
  }

  function actualizarSerie(idx, campo, valor) {
    const nuevas = [...seriesEditando]
    nuevas[idx][campo] = valor
    setSeriesEditando(nuevas)
  }

  function agregarSerieExtra() {
    const ultima = seriesEditando[seriesEditando.length - 1] || { reps: 10, peso: 0, rir: 2 }
    setSeriesEditando([...seriesEditando, {
      numero_serie: seriesEditando.length + 1,
      reps: ultima.reps,
      peso: ultima.peso,
      rir: ultima.rir,
      notas: ''
    }])
  }

  function eliminarSerie(idx) {
    const nuevas = seriesEditando.filter((_, i) => i !== idx)
    nuevas.forEach((s, i) => s.numero_serie = i + 1)
    setSeriesEditando(nuevas)
  }

  async function guardarSeries() {
    if (!ejActual || seriesEditando.length === 0) return
    const hoy = fechaHoy()
    await supabase.from('registros_series_rutina').delete()
      .eq('alumno_id', alumnoIdActual)
      .eq('rutina_ejercicio_id', ejActual.id)
      .eq('fecha', hoy)
    await supabase.from('registros_series_rutina').insert(
      seriesEditando.map(s => ({
        alumno_id: alumnoIdActual,
        rutina_ejercicio_id: ejActual.id,
        fecha: hoy,
        numero_serie: s.numero_serie,
        reps_hechas: parseInt(s.reps) || 0,
        peso_kg: parseFloat(s.peso) || 0,
        rir: parseInt(s.rir) || 0,
        notas: s.notas || ''
      }))
    )
    setEjActual(null)
    setSeriesEditando([])
    setMsg('✓ Series guardadas')
    setTimeout(() => setMsg(''), 2000)
    if (diaEntrenoSeleccionado) cargarRegistrosDia(diaEntrenoSeleccionado)
  }

  // ============ ALIMENTOS ============
  const totalCal = comidas.reduce((s, c) => s + (c.calorias || 0), 0)
  const totalProt = comidas.reduce((s, c) => s + (c.proteinas || 0), 0)
  const totalCarb = comidas.reduce((s, c) => s + (c.carbohidratos || 0), 0)
  const totalGras = comidas.reduce((s, c) => s + (c.grasas || 0), 0)
  const ultimoPeso = registrosPeso[0]?.peso

  async function buscarAlimento(q) {
    setBusqueda(q)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (q.length < 2) { setResultados([]); setBuscando(false); return }
    setBuscando(true)
    try {
      const { data: resLocalesDB } = await supabase.from('alimentos').select('*').ilike('nombre', `%${q}%`).order('nombre').limit(40)
      const resLocales = (resLocalesDB || []).map(a => ({ ...a, fuente: 'local' }))
      setResultados(resLocales)
      setBuscando(false)
    } catch (err) { setResultados([]); setBuscando(false) }
    timeoutRef.current = setTimeout(async () => {
      try {
        const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=20&lc=es`
        const response = await fetch(url, { mode: 'cors' })
        if (!response.ok) return
        const data = await response.json()
        if (!data.products || data.products.length === 0) return
        const codigosVistos = new Set()
        const resAPI = data.products.filter(p => {
          if (!p.code || codigosVistos.has(p.code)) return false
          const tieneNombre = p.product_name && p.product_name.trim().length > 0
          const tieneCalorias = p.nutriments && p.nutriments['energy-kcal_100g']
          if (!tieneNombre || !tieneCalorias) return false
          codigosVistos.add(p.code)
          return true
        }).map(p => ({
          id: `off-${p.code}`, codigo_barras: p.code, nombre: p.product_name, marca: p.brands || '',
          imagen_url: p.image_small_url || p.image_url || null,
          calorias: Math.round(p.nutriments['energy-kcal_100g'] || 0),
          proteinas: parseFloat((p.nutriments['proteins_100g'] || 0).toFixed(1)),
          carbohidratos: parseFloat((p.nutriments['carbohydrates_100g'] || 0).toFixed(1)),
          grasas: parseFloat((p.nutriments['fat_100g'] || 0).toFixed(1)),
          unidades: [], fuente: 'openfoodfacts'
        })).slice(0, 15)
        setResultados(prev => { const soloLocales = prev.filter(x => x.fuente === 'local'); return [...soloLocales, ...resAPI] })
      } catch (err) {}
    }, 500)
  }

  async function onScanBarcode(codigo) {
    setShowEscaner(false)
    setBuscando(true)
    const { data: localData } = await supabase.from('alimentos').select('*').eq('codigo_barras', codigo).maybeSingle()
    if (localData) { seleccionarAlimento({ ...localData, fuente: 'local' }); setBuscando(false); setMsg(`✅ Encontrado: ${localData.nombre}`); setTimeout(() => setMsg(''), 2000); return }
    try {
      const url = `https://world.openfoodfacts.org/api/v0/product/${codigo}.json`
      const response = await fetch(url)
      const data = await response.json()
      if (data.status === 1 && data.product) {
        const p = data.product
        const tieneNombre = p.product_name && p.product_name.trim().length > 0
        const tieneCalorias = p.nutriments && p.nutriments['energy-kcal_100g'] && p.nutriments['energy-kcal_100g'] > 0
        if (!tieneNombre || !tieneCalorias) {
          setCustomForm({ codigo_barras: codigo, nombre: tieneNombre ? p.product_name : '', marca: p.brands || '', calorias: tieneCalorias ? Math.round(p.nutriments['energy-kcal_100g']) : '', proteinas: p.nutriments?.['proteins_100g'] ? parseFloat(p.nutriments['proteins_100g']).toFixed(1) : '', carbohidratos: p.nutriments?.['carbohydrates_100g'] ? parseFloat(p.nutriments['carbohydrates_100g']).toFixed(1) : '', grasas: p.nutriments?.['fat_100g'] ? parseFloat(p.nutriments['fat_100g']).toFixed(1) : '', imagen_url: p.image_small_url || p.image_url || '', unidades: [] })
          setShowCustomModal(true); setBuscando(false); return
        }
        const alimento = { codigo_barras: codigo, nombre: p.product_name, marca: p.brands || '', imagen_url: p.image_small_url || p.image_url || null, calorias: Math.round(p.nutriments['energy-kcal_100g']), proteinas: parseFloat(p.nutriments['proteins_100g'] || 0), carbohidratos: parseFloat(p.nutriments['carbohydrates_100g'] || 0), grasas: parseFloat(p.nutriments['fat_100g'] || 0), unidades: [], categoria: 'Escaneado', pais: p.countries || 'Internacional', popularidad: 1 }
        const { data: insertado } = await supabase.from('alimentos').insert(alimento).select().single()
        if (insertado) { seleccionarAlimento({ ...insertado, fuente: 'local' }); setMsg(`✅ ${insertado.nombre} agregado`) }
        else { seleccionarAlimento({ ...alimento, id: `off-${codigo}`, fuente: 'openfoodfacts' }); setMsg(`✅ ${alimento.nombre} cargado`) }
        setTimeout(() => setMsg(''), 2500)
      } else {
        setCustomForm({ codigo_barras: codigo, nombre: '', marca: '', calorias: '', proteinas: '', carbohidratos: '', grasas: '', imagen_url: '', unidades: [] })
        setShowCustomModal(true); setMsg('🆕 Producto nuevo.'); setTimeout(() => setMsg(''), 3000)
      }
    } catch (err) { setMsg('❌ Error al buscar producto'); setTimeout(() => setMsg(''), 3000) }
    setBuscando(false)
  }

  async function guardarCustom() {
    if (!customForm.nombre || !customForm.calorias) { setMsg('⚠️ Faltan nombre y calorías'); setTimeout(() => setMsg(''), 2000); return }
    const alimento = { codigo_barras: customForm.codigo_barras || null, nombre: customForm.nombre.trim(), marca: customForm.marca.trim(), imagen_url: customForm.imagen_url || null, calorias: parseFloat(customForm.calorias) || 0, proteinas: parseFloat(customForm.proteinas) || 0, carbohidratos: parseFloat(customForm.carbohidratos) || 0, grasas: parseFloat(customForm.grasas) || 0, unidades: (customForm.unidades || []).filter(u => u.nombre && u.gramos).map(u => ({ nombre: u.nombre.trim(), gramos: parseFloat(u.gramos) || 100 })), categoria: 'Custom', pais: 'Argentina', popularidad: 1 }
    const { data: insertado } = await supabase.from('alimentos').insert(alimento).select().single()
    if (insertado) { setShowCustomModal(false); seleccionarAlimento({ ...insertado, fuente: 'custom' }); setMsg(`✅ ${insertado.nombre} agregado`); setTimeout(() => setMsg(''), 2500) }
    else { const { data: existente } = await supabase.from('alimentos').select('*').eq('nombre', alimento.nombre).maybeSingle(); if (existente) { setShowCustomModal(false); seleccionarAlimento({ ...existente, fuente: 'local' }) } }
  }

  function abrirBuscador(momento) { setSearchMomento(momento); setShowSearch(true); setBusqueda(''); setResultados([]); setSearchTab('todo') }

  function seleccionarAlimento(al) {
    setAlimentoSel(al)
    if (al.unidades && Array.isArray(al.unidades) && al.unidades.length > 0) { setUnidadSel(al.unidades[0]); setCantidad(1) }
    else { setUnidadSel({ nombre: 'Por gramos', gramos: 100, esGramos: true }); setCantidad(100) }
  }

  function calcularPorGramos(al, g) {
    const factor = parseFloat(g) / 100
    return { calorias: Math.round((al.calorias || 0) * factor * 10) / 10, proteinas: Math.round((al.proteinas || 0) * factor * 10) / 10, carbohidratos: Math.round((al.carbohidratos || 0) * factor * 10) / 10, grasas: Math.round((al.grasas || 0) * factor * 10) / 10 }
  }

  function calcularGramosFinal() {
    if (!unidadSel) return 0
    const cant = parseFloat(cantidad) || 0
    if (unidadSel.esGramos) return cant
    return unidadSel.gramos * cant
  }

  const gramosFinal = calcularGramosFinal()
  const macrosPreview = alimentoSel ? calcularPorGramos(alimentoSel, gramosFinal) : null

  async function agregarComida() {
    if (!alimentoSel || !unidadSel) return
    const gFinal = calcularGramosFinal()
    if (gFinal <= 0) return
    const m = calcularPorGramos(alimentoSel, gFinal)
    let nombreCompleto
    if (unidadSel.esGramos) nombreCompleto = `${alimentoSel.nombre}${alimentoSel.marca ? ` (${alimentoSel.marca})` : ''} - ${gFinal}g`
    else { const cant = parseFloat(cantidad) || 1; nombreCompleto = `${cant === 1 ? '' : cant + '× '}${unidadSel.nombre} - ${alimentoSel.nombre}${alimentoSel.marca ? ` (${alimentoSel.marca})` : ''}` }
    await supabase.from('registros_comidas').insert({ alumno_id: alumnoIdActual, fecha, momento: searchMomento, nombre_manual: nombreCompleto, calorias: m.calorias, proteinas: m.proteinas, carbohidratos: m.carbohidratos, grasas: m.grasas, gramos: gFinal })
    try { await supabase.from('alimentos_recientes').insert({ alumno_id: alumnoIdActual, alimento_data: alimentoSel, ultima_vez: new Date().toISOString() }) } catch(e) {}
    setAlimentoSel(null); setUnidadSel(null); setCantidad(1); setShowSearch(false); setBusqueda(''); setResultados([])
    setMsg('Comida agregada ✓'); cargarTodo(); setTimeout(() => setMsg(''), 2000)
  }

  async function eliminarComida(id) { await supabase.from('registros_comidas').delete().eq('id', id); cargarTodo() }

  async function abrirCargarPlan() {
    setShowCargarPlan(true); setCargandoPlanes(true)
    const { data } = await supabase.from('planes_alimentacion').select('*').eq('alumno_id', alumnoIdActual).order('created_at', { ascending: false })
    setPlanesDisponibles(data || []); setCargandoPlanes(false)
  }

  async function aplicarPlanAlDia(plan) {
    if (!window.confirm(`¿Cargar "${plan.nombre}" en el día?`)) return
    setAplicandoPlan(true)
    const momentosValidos = ['Desayuno', 'Almuerzo', 'Merienda', 'Cena', 'Snack']
    const mapMomento = (m) => momentosValidos.includes(m) ? m : 'Snack'
    const { data: comidasPlan } = await supabase.from('plan_comidas').select('*, plan_comida_items(*)').eq('plan_id', plan.id).order('orden')
    const inserts = []
    for (const comida of (comidasPlan || [])) {
      for (const item of (comida.plan_comida_items || [])) {
        inserts.push({ alumno_id: alumnoIdActual, fecha, momento: mapMomento(comida.momento), nombre_manual: `${item.nombre}${item.cantidad_gramos ? ` - ${item.cantidad_gramos}g` : ''}`, calorias: item.calorias || 0, proteinas: item.proteinas || 0, carbohidratos: item.carbohidratos || 0, grasas: item.grasas || 0, gramos: item.cantidad_gramos || 0 })
      }
    }
    if (inserts.length > 0) { await supabase.from('registros_comidas').insert(inserts) }
    setAplicandoPlan(false); setShowCargarPlan(false); setTab('diario')
    setMsg(`✅ Plan cargado (${inserts.length} alimentos)`); cargarTodo(); setTimeout(() => setMsg(''), 2500)
  }

  async function toggleVaso(i) {
    const nuevos = i + 1 === vasosHoy ? i : i + 1
    const { data: existing } = await supabase.from('registros_agua').select('*').eq('alumno_id', alumnoIdActual).eq('fecha', fecha).maybeSingle()
    if (existing) await supabase.from('registros_agua').update({ vasos: nuevos }).eq('id', existing.id)
    else await supabase.from('registros_agua').insert({ alumno_id: alumnoIdActual, vasos: nuevos, fecha })
    setVasosHoy(nuevos)
  }

  async function guardarPeso() {
    if (!pesoInput) return
    await supabase.from('registros_peso').insert({ alumno_id: alumnoIdActual, peso: parseFloat(pesoInput), fecha })
    setPesoInput(''); setShowPesoModal(false); setMsg('Peso guardado ✓'); cargarTodo(); setTimeout(() => setMsg(''), 2000)
  }

  async function guardarEjercicio() {
    if (!ejercicioInput.ejercicio) return
    await supabase.from('registros_entrenamiento').insert({ alumno_id: alumnoIdActual, fecha, ejercicio: ejercicioInput.ejercicio, series: parseInt(ejercicioInput.series) || 0, repeticiones: parseInt(ejercicioInput.repeticiones) || 0, peso_kg: parseFloat(ejercicioInput.peso_kg) || 0, notas: ejercicioInput.notas })
    setEjercicioInput({ ejercicio: '', series: '', repeticiones: '', peso_kg: '', notas: '' })
    setShowEjercicioModal(false); setMsg('Ejercicio agregado ✓'); cargarTodo(); setTimeout(() => setMsg(''), 2000)
  }

  async function eliminarEjercicio(id) { await supabase.from('registros_entrenamiento').delete().eq('id', id); cargarTodo() }

  function abrirModalMetas() { setMetasForm({ calorias: metas.calorias, proteinas: metas.proteinas, carbohidratos: metas.carbohidratos, grasas: metas.grasas }); setShowMetasModal(true) }

  async function guardarMetas() {
    const nuevas = { alumno_id: alumnoIdActual, calorias: parseFloat(metasForm.calorias) || 0, proteinas: parseFloat(metasForm.proteinas) || 0, carbohidratos: parseFloat(metasForm.carbohidratos) || 0, grasas: parseFloat(metasForm.grasas) || 0 }
    const { data: existing } = await supabase.from('metas_nutricionales').select('*').eq('alumno_id', alumnoIdActual).maybeSingle()
    if (existing) await supabase.from('metas_nutricionales').update(nuevas).eq('alumno_id', alumnoIdActual)
    else await supabase.from('metas_nutricionales').insert(nuevas)
    setMetas(nuevas); setShowMetasModal(false); setMsg('Metas actualizadas ✓'); cargarTodo(); setTimeout(() => setMsg(''), 2000)
  }

  function calcularMacrosAuto() {
    const p = parseFloat(calcForm.peso), a = parseFloat(calcForm.altura), e = parseInt(calcForm.edad)
    if (!p || !a || !e) { setMsg('⚠️ Completá edad, peso y altura'); setTimeout(() => setMsg(''), 2500); return }
    const bmr = calcForm.sexo === 'hombre' ? 10 * p + 6.25 * a - 5 * e + 5 : 10 * p + 6.25 * a - 5 * e - 161
    const factores = { sedentario: 1.2, ligero: 1.375, moderado: 1.55, activo: 1.725, muy_activo: 1.9 }
    const mults = { 'bajar de peso': 0.80, 'tonificar': 0.88, 'mantener': 1.0, 'ganar músculo': 1.10 }
    const tdee = bmr * (factores[calcForm.actividad] || 1.55)
    const calorias = Math.round(tdee * (mults[calcForm.objetivo] || 1))
    const proteinas = Math.round(p * 2)
    let grasas = Math.round(p * 1)
    const minG = Math.round(p * 0.6); if (grasas < minG) grasas = minG
    let carbohidratos = Math.round((calorias - proteinas * 4 - grasas * 9) / 4); if (carbohidratos < 0) carbohidratos = 0
    setMetasForm({ calorias, proteinas, carbohidratos, grasas })
    setMsg('✅ Macros calculados.'); setTimeout(() => setMsg(''), 2500)
  }

  const calMacros = (parseFloat(metasForm.proteinas) || 0) * 4 + (parseFloat(metasForm.carbohidratos) || 0) * 4 + (parseFloat(metasForm.grasas) || 0) * 9
  const calObjetivo = parseFloat(metasForm.calorias) || 0
  const diff = Math.round(calMacros - calObjetivo)
  const macrosOk = Math.abs(diff) <= 50

  const resultadosVisibles = searchTab === 'recientes' ? recientes.map(r => ({ ...r.alimento_data, fuente: r.alimento_data?.fuente || 'local' })) : resultados
  const promedio7Dias = historial7Dias.length > 0 ? Math.round(historial7Dias.reduce((s, d) => s + d.calorias, 0) / (historial7Dias.filter(d => d.calorias > 0).length || 1)) : 0
  const unidadesDisponibles = alimentoSel?.unidades && Array.isArray(alimentoSel.unidades) && alimentoSel.unidades.length > 0
    ? [...alimentoSel.unidades, { nombre: 'Por gramos (escribir cantidad)', gramos: 100, esGramos: true }]
    : [{ nombre: 'Por gramos (escribir cantidad)', gramos: 100, esGramos: true }]

  return (
    <div style={s.page}>
      <header style={s.header}>
        <button style={s.backBtn} onClick={() => navigate(esAdminViendo ? '/mis-alumnos' : '/')}>← Volver</button>
        <div style={s.logo}>SEGUIMIENTO</div>
        <div style={{ width: 80 }}></div>
      </header>

      <main style={s.main}>
        {esAdminViendo && (
          <div style={s.adminBanner}>
            <div style={s.adminBannerText}>👀 Viendo a: <strong>{alumnoNombre || 'Cargando...'}</strong></div>
            <button style={s.adminBannerBtn} onClick={() => navigate('/mis-alumnos')}>← Alumnos</button>
          </div>
        )}

        {msg && <div style={s.success}>{msg}</div>}

        {tab !== 'entreno' && <DayNavigator fecha={fecha} setFecha={setFecha} />}

        {/* =================== PANEL =================== */}
        {tab === 'panel' && (
          <div>
            <div style={s.card}>
              <div style={s.cardTitle}>Calorías</div>
              <div style={s.calorieCircle}>
                <CalorieCircle consumidas={totalCal} meta={metas.calorias} />
                <div style={s.circleStats}>
                  <div style={s.circleStat}><span style={s.circleIcon}>🎯</span><div><div style={s.circleLabel}>Objetivo</div><div style={s.circleValue}>{metas.calorias}</div></div></div>
                  <div style={s.circleStat}><span style={s.circleIcon}>🍴</span><div><div style={s.circleLabel}>Alimentos</div><div style={s.circleValue}>{Math.round(totalCal)}</div></div></div>
                  <div style={s.circleStat}><span style={s.circleIcon}>🔥</span><div><div style={s.circleLabel}>Ejercicios</div><div style={s.circleValue}>{ejercicios.length}</div></div></div>
                </div>
              </div>
              {totalCal > metas.calorias && (
                <div style={{ background: 'rgba(255,77,77,0.1)', border: '1px solid rgba(255,77,77,0.3)', borderRadius: 8, padding: '12px 14px', marginTop: 14, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#ff4d4d', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>🚨 Te pasaste</div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: '#ff4d4d' }}>+{Math.round(totalCal - metas.calorias)} kcal</div>
                </div>
              )}
            </div>
            <div style={s.card}>
              <div style={s.cardTitle}>Macros del día</div>
              <div style={s.macroBar}>
                {[
                  { label: 'Proteínas', actual: totalProt, meta: metas.proteinas, color: '#4ade80' },
                  { label: 'Carbos', actual: totalCarb, meta: metas.carbohidratos, color: '#f5e642' },
                  { label: 'Grasas', actual: totalGras, meta: metas.grasas, color: '#f97316' },
                ].map(m => {
                  const pct = m.meta > 0 ? (m.actual / m.meta) * 100 : 0
                  return (
                    <div key={m.label} style={s.macroCard}>
                      <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{m.label}</div>
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: m.color }}>
                        {Math.round(m.actual)}<span style={{ fontSize: 14, color: '#444' }}>/{m.meta}g</span>
                      </div>
                      <div style={s.macroBarBg}><div style={s.macroBarFill(m.color, pct)} /></div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              <div style={s.card}>
                <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>💧 Agua</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: '#60a5fa' }}>{vasosHoy}/{META_AGUA}</div>
                <div style={{ fontSize: 11, color: '#444', marginTop: 4 }}>{vasosHoy * 250} ml</div>
              </div>
              <div style={s.card}>
                <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>⚖️ Peso</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: '#f5e642' }}>{ultimoPeso || '—'}</div>
                <div style={{ fontSize: 11, color: '#444', marginTop: 4 }}>kg</div>
              </div>
            </div>
          </div>
        )}

        {/* =================== DIARIO =================== */}
        {tab === 'diario' && (
          <div>
            <button onClick={abrirCargarPlan} style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid #4ade8040', borderRadius: 10, padding: '14px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', width: '100%', marginBottom: 14 }}>
              📋 Cargar uno de mis planes al día
            </button>
            {totalCal > metas.calorias ? (
              <div style={{ background: '#111', borderRadius: 12, border: '1px solid rgba(255,77,77,0.3)', padding: 18, marginBottom: 14, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#ff4d4d', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>🚨 Te pasaste por</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 38, color: '#ff4d4d', margin: '6px 0' }}>+{Math.round(totalCal - metas.calorias)}</div>
                <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase' }}>kcal sobre tu objetivo</div>
              </div>
            ) : (
              <div style={{ background: '#111', borderRadius: 12, border: '1px solid #222', padding: 18, marginBottom: 14, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>Calorías restantes</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 38, color: '#f5e642', margin: '6px 0' }}>{Math.round(Math.max(0, metas.calorias - totalCal))}</div>
                <div style={{ fontSize: 12, color: '#666' }}>{metas.calorias} objetivo − {Math.round(totalCal)} consumidas</div>
              </div>
            )}
            {MOMENTOS.map(mom => {
              const delMomento = comidas.filter(c => c.momento === mom.id)
              const calMomento = delMomento.reduce((s, c) => s + (c.calorias || 0), 0)
              return (
                <div key={mom.id} style={s.momentoCard}>
                  <div style={s.momentoHeader}>
                    <div style={s.momentoNombre}>{mom.icono} {mom.nombre}</div>
                    <div style={s.momentoCal}>{Math.round(calMomento)} kcal</div>
                  </div>
                  {delMomento.map(c => (
                    <div key={c.id} style={s.momentoComida}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={s.comidaNombre}>{c.nombre_manual}</div>
                        <div style={s.comidaSub}>P: {Math.round(c.proteinas)}g · C: {Math.round(c.carbohidratos)}g · G: {Math.round(c.grasas)}g</div>
                      </div>
                      <div style={s.comidaCal}>{Math.round(c.calorias)}</div>
                      <button style={s.btnDanger} onClick={() => eliminarComida(c.id)}>✕</button>
                    </div>
                  ))}
                  <button style={s.agregarBtn} onClick={() => abrirBuscador(mom.id)}>+ Agregar alimento</button>
                </div>
              )
            })}
          </div>
        )}

        {/* =================== ENTRENO =================== */}
        {tab === 'entreno' && (
          <div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, letterSpacing: 1, marginBottom: 4 }}>HOY ENTRENO</div>
            <div style={{ fontSize: 13, color: '#555', marginBottom: 20 }}>{new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>

            {/* Sin rutina seleccionada */}
            {!rutinaActiva && (
              <>
                {loadingRutinas ? (
                  <div style={s.empty}>Cargando rutinas...</div>
                ) : rutinas.length === 0 ? (
                  <div style={s.empty}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🏋️</div>
                    <div style={{ marginBottom: 16 }}>Todavía no tenés rutinas creadas.</div>
                    <button style={{ background: '#f5e642', color: '#000', border: 'none', borderRadius: 8, padding: '12px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => navigate('/mi-entrenamiento')}>
                      Ir a crear una rutina
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>Elegí la rutina que vas a hacer hoy:</div>
                    {rutinas.map(r => (
                      <div key={r.id} style={s.rutinaCard} onClick={() => seleccionarRutina(r)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 1, color: '#f5e642' }}>{r.nombre}</div>
                            {r.descripcion && <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{r.descripcion}</div>}
                          </div>
                          <div style={{ color: '#f5e642', fontSize: 20 }}>›</div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}

            {/* Rutina seleccionada */}
            {rutinaActiva && (
              <>
                {/* Header rutina activa */}
                <div style={{ background: 'rgba(245,230,66,0.08)', border: '1px solid #f5e64230', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, color: '#f5e642', letterSpacing: 1 }}>{rutinaActiva.nombre}</div>
                    <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{diasRutinaActiva.length} días</div>
                  </div>
                  <button style={{ background: 'none', border: '1px solid #333', color: '#888', borderRadius: 6, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => { setRutinaActiva(null); setDiasRutinaActiva([]); setDiaEntrenoSeleccionado(null); setEjerciciosDiaEntreno([]) }}>
                    Cambiar
                  </button>
                </div>

                {/* Selector de días */}
                <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 10, marginBottom: 16 }}>
                  {diasRutinaActiva.map(dia => (
                    <button key={dia.id} style={{ background: diaEntrenoSeleccionado?.id === dia.id ? '#f5e642' : '#1a1a1a', color: diaEntrenoSeleccionado?.id === dia.id ? '#000' : '#888', border: 'none', borderRadius: 8, padding: '10px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
                      onClick={() => { setDiaEntrenoSeleccionado(dia); cargarRegistrosDia(dia) }}>
                      {dia.nombre}
                    </button>
                  ))}
                </div>

                {diaEntrenoSeleccionado && (
                  <>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: '#f5e642', letterSpacing: 1, marginBottom: 4 }}>{diaEntrenoSeleccionado.nombre}</div>
                    <div style={{ fontSize: 13, color: '#555', marginBottom: 16 }}>{ejerciciosDiaEntreno.length} ejercicios</div>

                    {ejerciciosDiaEntreno.length === 0 ? (
                      <div style={s.empty}>Este día no tiene ejercicios.</div>
                    ) : ejerciciosDiaEntreno.map(ej => {
                      const yaHecho = (registrosEntreno[ej.id] || []).length > 0
                      const regsHoy = registrosEntreno[ej.id] || []
                      return (
                        <div key={ej.id} style={{ ...s.ejercicioCard, border: `1px solid ${yaHecho ? '#4ade8040' : '#222'}` }}>
                          <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 1, color: '#f0f0f0', marginBottom: 4 }}>
                                {ej.ejercicios_catalogo?.nombre || ej.nombre_libre}
                              </div>
                              <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>
                                {ej.ejercicios_catalogo?.grupo_muscular}
                              </div>
                            </div>
                            {yaHecho && <span style={{ fontSize: 20 }}>✅</span>}
                          </div>

                          <div style={{ padding: '10px 16px', background: '#0d0d0d', borderTop: '1px solid #1a1a1a', fontSize: 13, color: '#999' }}>
                            📋 {ej.series} series × {ej.repeticiones} reps · RIR {ej.rir}
                            {ej.notas ? ` · ${ej.notas}` : ''}
                          </div>

                          {/* Resumen de lo hecho hoy */}
                          {yaHecho && (
                            <div style={{ padding: '8px 16px', borderTop: '1px solid #111' }}>
                              <div style={{ fontSize: 11, color: '#4ade80', marginBottom: 4, fontWeight: 700 }}>HOY:</div>
                              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {regsHoy.map((r, i) => (
                                  <span key={i} style={{ fontSize: 12, color: '#aaa', background: '#1a1a1a', padding: '3px 8px', borderRadius: 6 }}>
                                    S{r.numero_serie}: {r.reps_hechas}reps × {r.peso_kg}kg (RIR {r.rir})
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <button style={{ width: '100%', background: yaHecho ? 'rgba(74,222,128,0.15)' : '#f5e642', color: yaHecho ? '#4ade80' : '#000', border: 'none', padding: '14px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: 1 }}
                            onClick={() => abrirEjercicioEntreno(ej)}>
                            {yaHecho ? '✓ Completado — Editar' : '✓ Registrar series'}
                          </button>
                        </div>
                      )
                    })}
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* =================== PROGRESO =================== */}
        {tab === 'progreso' && (
          <div>
            <div style={s.card}>
              <div style={s.cardTitle}>📊 Últimos 7 días</div>
              <div style={{ marginBottom: 14, padding: '10px 14px', background: '#0d0d0d', borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>Promedio diario</span>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: '#f5e642' }}>{promedio7Dias} kcal</span>
                </div>
              </div>
              {historial7Dias.map(d => {
                const { badge, texto } = formatearFecha(d.fecha)
                const pct = metas.calorias > 0 ? (d.calorias / metas.calorias) * 100 : 0
                const cumplio = d.calorias > 0 && d.calorias <= metas.calorias
                return (
                  <div key={d.fecha} style={s.weekDay} onClick={() => { setFecha(d.fecha); setTab('diario') }}>
                    <div style={s.weekDayLeft}>
                      <div style={s.weekDayName}>
                        {badge && <span style={{ color: '#f5e642', marginRight: 6, fontSize: 10, fontWeight: 700 }}>{badge}</span>}
                        {texto}
                      </div>
                      {d.calorias > 0 && <div style={{ ...s.macroBarBg, marginTop: 6, width: 120 }}><div style={s.macroBarFill(cumplio ? '#4ade80' : '#f5e642', pct)} /></div>}
                    </div>
                    <div style={{ ...s.weekDayCal, color: d.calorias === 0 ? '#444' : d.calorias > metas.calorias ? '#ff4d4d' : '#f5e642' }}>
                      {Math.round(d.calorias)} <span style={{ fontSize: 11, color: '#444' }}>kcal</span>
                    </div>
                  </div>
                )
              })}
              <div style={{ fontSize: 11, color: '#444', marginTop: 12, textAlign: 'center', fontStyle: 'italic' }}>Tocá un día para ver el detalle</div>
            </div>
            <div style={s.card}>
              <div style={s.cardTitle}>⚖️ Historial de peso</div>
              {registrosPeso.length === 0 ? (
                <div style={{ color: '#444', fontSize: 13, padding: '20px 0', textAlign: 'center' }}>No hay registros aún.</div>
              ) : registrosPeso.map((r, i) => {
                const diffPeso = i < registrosPeso.length - 1 ? r.peso - registrosPeso[i + 1].peso : null
                return (
                  <div key={r.id} style={s.detailRow}>
                    <div>
                      <div style={s.detailValue}>{r.peso} kg
                        {diffPeso !== null && <span style={{ marginLeft: 8, fontSize: 12, color: diffPeso < 0 ? '#4ade80' : diffPeso > 0 ? '#ff4d4d' : '#555' }}>{diffPeso > 0 ? '+' : ''}{diffPeso.toFixed(1)} kg</span>}
                      </div>
                      <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{formatearLargo(r.fecha)}</div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={s.card}>
              <div style={s.cardTitle}>🏋️ Entrenamientos del día</div>
              {ejercicios.length === 0 ? (
                <div style={{ color: '#444', fontSize: 13, padding: '20px 0', textAlign: 'center' }}>No hay ejercicios.</div>
              ) : ejercicios.map(e => (
                <div key={e.id} style={s.detailRow}>
                  <div style={{ flex: 1 }}>
                    <div style={s.detailValue}>{e.ejercicio}</div>
                    <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{e.series}×{e.repeticiones} · {e.peso_kg}kg {e.notas && `· ${e.notas}`}</div>
                  </div>
                  <button style={s.btnDanger} onClick={() => eliminarEjercicio(e.id)}>✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =================== MÁS =================== */}
        {tab === 'mas' && (
          <div>
            <div style={s.card}>
              <div style={s.cardTitle}>💧 Agua del día</div>
              <div style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>Meta: {META_AGUA} vasos (~2L)</div>
              <div style={s.agua}>
                {Array.from({ length: META_AGUA }).map((_, i) => (
                  <div key={i} style={s.vaso(i < vasosHoy)} onClick={() => toggleVaso(i)}>💧</div>
                ))}
              </div>
              <div style={{ textAlign: 'center', marginTop: 14, fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: vasosHoy >= META_AGUA ? '#4ade80' : '#60a5fa' }}>
                {vasosHoy} / {META_AGUA}
              </div>
            </div>
            <div style={s.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ ...s.cardTitle, marginBottom: 0 }}>🎯 Metas diarias</div>
                <button style={s.btnSm} onClick={abrirModalMetas}>✏️ Editar</button>
              </div>
              <div style={s.detailRow}><span style={s.detailLabel}>🔥 Calorías</span><span style={s.detailValue}>{metas.calorias} kcal</span></div>
              <div style={s.detailRow}><span style={s.detailLabel}>🥩 Proteínas</span><span style={s.detailValue}>{metas.proteinas} g</span></div>
              <div style={s.detailRow}><span style={s.detailLabel}>🍚 Carbohidratos</span><span style={s.detailValue}>{metas.carbohidratos} g</span></div>
              <div style={s.detailRow}><span style={s.detailLabel}>🥑 Grasas</span><span style={s.detailValue}>{metas.grasas} g</span></div>
            </div>
          </div>
        )}
      </main>

      {/* FAB */}
      {tab !== 'entreno' && (
        <button style={s.fab} onClick={() => setFabOpen(!fabOpen)}>{fabOpen ? '×' : '+'}</button>
      )}
      {fabOpen && tab !== 'entreno' && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 94 }} onClick={() => setFabOpen(false)} />
          <div style={s.fabMenu}>
            <button style={s.fabItem} onClick={() => { setFabOpen(false); abrirBuscador('Desayuno') }}>🔍 Buscar alimento</button>
            <button style={s.fabItem} onClick={() => { setFabOpen(false); abrirCargarPlan() }}>📋 Cargar un plan</button>
            <button style={s.fabItem} onClick={() => { setFabOpen(false); setShowPesoModal(true) }}>⚖️ Registrar peso</button>
            <button style={s.fabItem} onClick={() => { setFabOpen(false); setShowEjercicioModal(true) }}>🏋️ Agregar ejercicio</button>
            <button style={s.fabItem} onClick={() => { setFabOpen(false); abrirModalMetas() }}>🎯 Editar metas</button>
          </div>
        </>
      )}

      {/* BOTTOM NAV */}
      <nav style={s.bottomTabs}>
        <button style={s.bottomTab(tab === 'panel')} onClick={() => setTab('panel')}><span style={s.bottomIcon}>📊</span>Panel</button>
        <button style={s.bottomTab(tab === 'diario')} onClick={() => setTab('diario')}><span style={s.bottomIcon}>📔</span>Diario</button>
        <button style={s.bottomTab(tab === 'entreno')} onClick={() => setTab('entreno')}><span style={s.bottomIcon}>🏋️</span>Entreno</button>
        <button style={s.bottomTab(tab === 'progreso')} onClick={() => setTab('progreso')}><span style={s.bottomIcon}>📈</span>Progreso</button>
        <button style={s.bottomTab(tab === 'mas')} onClick={() => setTab('mas')}><span style={s.bottomIcon}>⋯</span>Más</button>
      </nav>

      {/* MODAL REGISTRAR SERIES */}
      {ejActual && (
        <div style={s.porcionModal} onClick={() => setEjActual(null)}>
          <div style={s.porcionContent} onClick={e => e.stopPropagation()}>
            <div style={s.porcionHeader}>
              <div>
                <div style={s.porcionNombre}>{ejActual.ejercicios_catalogo?.nombre || ejActual.nombre_libre}</div>
                <div style={s.porcionMarca}>{ejActual.series}×{ejActual.repeticiones} · RIR {ejActual.rir}</div>
              </div>
              <button style={s.searchClose} onClick={() => setEjActual(null)}>✕</button>
            </div>

            {ultimoRegistroEntreno[ejActual.id] && (
              <div style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid #4ade8030', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#4ade80' }}>
                💡 Último: {ultimoRegistroEntreno[ejActual.id].reps_hechas} reps × {ultimoRegistroEntreno[ejActual.id].peso_kg}kg (RIR {ultimoRegistroEntreno[ejActual.id].rir})
              </div>
            )}

            {seriesEditando.map((serie, idx) => (
              <div key={idx} style={s.serieCard}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, color: '#f5e642', letterSpacing: 1, marginBottom: 10, textAlign: 'center' }}>SERIE {serie.numero_serie}</div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, textAlign: 'center', fontWeight: 700 }}>Repeticiones</div>
                  <div style={s.flechasRow}>
                    <button style={s.flecha} onClick={() => ajustarValor(idx, 'reps', -1)}>◀</button>
                    <input type="number" style={s.flechaInput} value={serie.reps} onChange={e => actualizarSerie(idx, 'reps', e.target.value)} />
                    <button style={s.flecha} onClick={() => ajustarValor(idx, 'reps', 1)}>▶</button>
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, textAlign: 'center', fontWeight: 700 }}>Peso (kg)</div>
                  <div style={s.flechasRow}>
                    <button style={s.flecha} onClick={() => ajustarValor(idx, 'peso', -2.5)}>◀</button>
                    <input type="number" step="0.5" style={s.flechaInput} value={serie.peso} onChange={e => actualizarSerie(idx, 'peso', e.target.value)} />
                    <button style={s.flecha} onClick={() => ajustarValor(idx, 'peso', 2.5)}>▶</button>
                  </div>
                </div>

                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, textAlign: 'center', fontWeight: 700 }}>RIR</div>
                  <div style={s.flechasRow}>
                    <button style={s.flecha} onClick={() => ajustarValor(idx, 'rir', -1)}>◀</button>
                    <input type="number" style={s.flechaInput} value={serie.rir} onChange={e => actualizarSerie(idx, 'rir', e.target.value)} />
                    <button style={s.flecha} onClick={() => ajustarValor(idx, 'rir', 1)}>▶</button>
                  </div>
                </div>

                <input style={{ width: '100%', background: '#0a0a0a', border: '1px solid #222', borderRadius: 8, padding: '10px 14px', color: '#f0f0f0', fontSize: 12, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', marginTop: 8 }} placeholder="Notas (opcional)..." value={serie.notas} onChange={e => actualizarSerie(idx, 'notas', e.target.value)} />

                {seriesEditando.length > 1 && (
                  <button style={{ background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', border: '1px solid rgba(255,77,77,0.2)', borderRadius: 6, padding: '6px 12px', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', width: '100%', marginTop: 8 }} onClick={() => eliminarSerie(idx)}>
                    Eliminar esta serie
                  </button>
                )}
              </div>
            ))}

            <button style={{ width: '100%', background: 'rgba(245,230,66,0.1)', color: '#f5e642', border: '1px dashed #f5e64240', borderRadius: 8, padding: '12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 14 }} onClick={agregarSerieExtra}>
              + Agregar otra serie
            </button>

            <button style={s.btn} onClick={guardarSeries}>💾 Guardar entrenamiento</button>
          </div>
        </div>
      )}

      {/* MODAL BUSCAR ALIMENTO */}
      {showSearch && (
        <div style={s.searchModal}>
          <div style={s.searchHeader}>
            <button style={s.searchClose} onClick={() => { setShowSearch(false); setBusqueda(''); setResultados([]) }}>✕</button>
            <input autoFocus style={s.searchInput} value={busqueda} onChange={e => buscarAlimento(e.target.value)} placeholder={`Buscar para ${searchMomento}...`} />
            <button onClick={() => setShowEscaner(true)} style={s.scanBtn}>📷</button>
          </div>
          <div style={s.searchTabs}>
            <button style={s.searchTab(searchTab === 'todo')} onClick={() => setSearchTab('todo')}>Todo</button>
            <button style={s.searchTab(searchTab === 'recientes')} onClick={() => setSearchTab('recientes')}>Recientes</button>
          </div>
          <div style={s.searchResults}>
            {buscando && <div style={s.loader}>🔍 Buscando...</div>}
            {!buscando && searchTab === 'todo' && busqueda.length < 2 && <div style={s.empty}>Escribí al menos 2 letras o tocá 📷 para escanear.</div>}
            {!buscando && searchTab === 'recientes' && recientes.length === 0 && <div style={s.empty}>Todavía no usaste alimentos.</div>}
            {resultadosVisibles.map(a => (
              <div key={a.id} style={s.resultItem} onClick={() => seleccionarAlimento(a)}>
                <div style={s.resultImg}>
                  {a.imagen_url ? <img src={a.imagen_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} onError={e => { e.target.style.display='none' }} /> : '🍽️'}
                </div>
                <div style={s.resultInfo}>
                  <div style={s.resultNombre}>{a.nombre}</div>
                  <div style={s.resultMeta}>
                    <span style={s.resultBadge(a.fuente)}>{a.fuente === 'local' ? '📦' : a.fuente === 'custom' ? '✏️' : '🌍'}</span>
                    {a.marca && <span style={{ color: '#999' }}>{a.marca} · </span>}
                    {a.calorias} kcal · {a.proteinas}g P · {a.carbohidratos}g C · {a.grasas}g G
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL PORCIÓN */}
      {alimentoSel && (
        <div style={s.porcionModal} onClick={() => { setAlimentoSel(null); setUnidadSel(null); setCantidad(1) }}>
          <div style={s.porcionContent} onClick={e => e.stopPropagation()}>
            <div style={s.porcionHeader}>
              <div>
                <div style={s.porcionNombre}>{alimentoSel.nombre}</div>
                {alimentoSel.marca && <div style={s.porcionMarca}>{alimentoSel.marca}</div>}
              </div>
              <button style={s.searchClose} onClick={() => { setAlimentoSel(null); setUnidadSel(null); setCantidad(1) }}>✕</button>
            </div>
            <label style={s.label}>Elegí una opción</label>
            {unidadesDisponibles.map((u, idx) => {
              const isSelected = unidadSel?.nombre === u.nombre
              const macrosUnidad = calcularPorGramos(alimentoSel, u.gramos)
              return (
                <div key={idx} style={s.unidadOption(isSelected)} onClick={() => { setUnidadSel(u); setCantidad(u.esGramos ? 100 : 1) }}>
                  <div style={s.unidadHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${isSelected ? '#f5e642' : '#444'}`, background: isSelected ? '#f5e642' : 'transparent', flexShrink: 0 }} />
                      <div style={s.unidadNombre}>{u.nombre}</div>
                    </div>
                    {!u.esGramos && <div style={s.unidadGramos}>({u.gramos}g)</div>}
                  </div>
                  {!u.esGramos && (
                    <div style={s.unidadMacros}>
                      <span>🔥 {macrosUnidad.calorias} kcal</span>
                      <span style={{ color: '#4ade80' }}>P: {macrosUnidad.proteinas}g</span>
                      <span style={{ color: '#f5e642' }}>C: {macrosUnidad.carbohidratos}g</span>
                      <span style={{ color: '#f97316' }}>G: {macrosUnidad.grasas}g</span>
                    </div>
                  )}
                </div>
              )
            })}
            {unidadSel && (
              <div style={s.cantidadBox}>
                <div style={s.cantidadLabel}>{unidadSel.esGramos ? '📏 Gramos' : `Cantidad de "${unidadSel.nombre}"`}</div>
                <div style={s.cantidadRow}>
                  <button style={s.cantidadArrow} onClick={() => { const c = parseFloat(cantidad) || 0; const min = unidadSel.esGramos ? 5 : 0.5; const step = unidadSel.esGramos ? 5 : 0.5; setCantidad(Math.max(min, c - step)) }}>◀</button>
                  <input type="number" style={s.cantidadInput} value={cantidad} onChange={e => setCantidad(e.target.value)} step={unidadSel.esGramos ? 5 : 0.5} />
                  <button style={s.cantidadArrow} onClick={() => { const c = parseFloat(cantidad) || 0; const step = unidadSel.esGramos ? 5 : 0.5; setCantidad(c + step) }}>▶</button>
                </div>
              </div>
            )}
            <label style={s.label}>Momento del día</label>
            <select style={{ ...s.porcionSelect, width: '100%', marginBottom: 14 }} value={searchMomento} onChange={e => setSearchMomento(e.target.value)}>
              {MOMENTOS.map(m => <option key={m.id} value={m.id}>{m.icono} {m.nombre}</option>)}
            </select>
            {macrosPreview && gramosFinal > 0 && (
              <div style={s.porcionPreview}>
                <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, textAlign: 'center' }}>Total ({Math.round(gramosFinal)}g)</div>
                <div style={s.porcionMacros}>
                  <div><div style={{ ...s.porcionMacro, color: '#f5e642' }}>{macrosPreview.calorias}</div><div style={s.porcionMacroLabel}>kcal</div></div>
                  <div><div style={{ ...s.porcionMacro, color: '#4ade80' }}>{macrosPreview.proteinas}g</div><div style={s.porcionMacroLabel}>prot</div></div>
                  <div><div style={{ ...s.porcionMacro, color: '#f5e642' }}>{macrosPreview.carbohidratos}g</div><div style={s.porcionMacroLabel}>carb</div></div>
                  <div><div style={{ ...s.porcionMacro, color: '#f97316' }}>{macrosPreview.grasas}g</div><div style={s.porcionMacroLabel}>gras</div></div>
                </div>
              </div>
            )}
            <button style={s.btn} onClick={agregarComida}>Agregar a {searchMomento}</button>
          </div>
        </div>
      )}

      {/* MODAL PESO */}
      {showPesoModal && (
        <div style={s.porcionModal} onClick={() => setShowPesoModal(false)}>
          <div style={s.porcionContent} onClick={e => e.stopPropagation()}>
            <div style={s.porcionHeader}>
              <div style={s.porcionNombre}>⚖️ Registrar peso</div>
              <button style={s.searchClose} onClick={() => setShowPesoModal(false)}>✕</button>
            </div>
            <label style={s.label}>Peso (kg)</label>
            <input style={{ ...s.porcionInput, width: '100%', marginBottom: 14 }} type="number" step="0.1" value={pesoInput} onChange={e => setPesoInput(e.target.value)} placeholder="Ej: 85.5" autoFocus />
            <button style={s.btn} onClick={guardarPeso}>Guardar peso</button>
          </div>
        </div>
      )}

      {/* MODAL EJERCICIO */}
      {showEjercicioModal && (
        <div style={s.porcionModal} onClick={() => setShowEjercicioModal(false)}>
          <div style={s.porcionContent} onClick={e => e.stopPropagation()}>
            <div style={s.porcionHeader}>
              <div style={s.porcionNombre}>🏋️ Agregar ejercicio</div>
              <button style={s.searchClose} onClick={() => setShowEjercicioModal(false)}>✕</button>
            </div>
            <label style={s.label}>Ejercicio</label>
            <input style={{ ...s.porcionInput, width: '100%', marginBottom: 14 }} value={ejercicioInput.ejercicio} onChange={e => setEjercicioInput({ ...ejercicioInput, ejercicio: e.target.value })} placeholder="Ej: Sentadilla" autoFocus />
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              <div style={{ flex: 1 }}><label style={s.label}>Series</label><input style={s.porcionInput} type="number" value={ejercicioInput.series} onChange={e => setEjercicioInput({ ...ejercicioInput, series: e.target.value })} placeholder="4" /></div>
              <div style={{ flex: 1 }}><label style={s.label}>Reps</label><input style={s.porcionInput} type="number" value={ejercicioInput.repeticiones} onChange={e => setEjercicioInput({ ...ejercicioInput, repeticiones: e.target.value })} placeholder="10" /></div>
              <div style={{ flex: 1 }}><label style={s.label}>Peso (kg)</label><input style={s.porcionInput} type="number" value={ejercicioInput.peso_kg} onChange={e => setEjercicioInput({ ...ejercicioInput, peso_kg: e.target.value })} placeholder="60" /></div>
            </div>
            <label style={s.label}>Notas</label>
            <input style={{ ...s.porcionInput, width: '100%', marginBottom: 14 }} value={ejercicioInput.notas} onChange={e => setEjercicioInput({ ...ejercicioInput, notas: e.target.value })} placeholder="opcional..." />
            <button style={s.btn} onClick={guardarEjercicio}>Guardar ejercicio</button>
          </div>
        </div>
      )}

      {/* MODAL METAS */}
      {showMetasModal && (
        <div style={s.porcionModal} onClick={() => setShowMetasModal(false)}>
          <div style={s.porcionContent} onClick={e => e.stopPropagation()}>
            <div style={s.porcionHeader}>
              <div style={s.porcionNombre}>🎯 Editar metas diarias</div>
              <button style={s.searchClose} onClick={() => setShowMetasModal(false)}>✕</button>
            </div>
            <button style={{ background: showCalc ? 'rgba(245,230,66,0.15)' : '#1a1a1a', color: '#f5e642', border: '1px solid #f5e64240', borderRadius: 6, padding: '12px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', width: '100%', fontWeight: 700, marginBottom: 14 }} onClick={() => setShowCalc(!showCalc)}>
              🧮 {showCalc ? 'Ocultar calculadora' : 'Calcular mis macros automáticamente'}
            </button>
            {showCalc && (
              <div style={{ background: '#0d0d0d', border: '1px solid #f5e64240', borderRadius: 10, padding: 14, marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                  <div style={{ flex: 1 }}><label style={s.label}>Edad</label><input style={s.porcionInput} type="number" value={calcForm.edad} onChange={e => setCalcForm({ ...calcForm, edad: e.target.value })} placeholder="28" /></div>
                  <div style={{ flex: 1 }}><label style={s.label}>Sexo</label><select style={{ ...s.porcionSelect, width: '100%' }} value={calcForm.sexo} onChange={e => setCalcForm({ ...calcForm, sexo: e.target.value })}><option value="hombre">Hombre</option><option value="mujer">Mujer</option></select></div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                  <div style={{ flex: 1 }}><label style={s.label}>Peso (kg)</label><input style={s.porcionInput} type="number" value={calcForm.peso} onChange={e => setCalcForm({ ...calcForm, peso: e.target.value })} placeholder="75" /></div>
                  <div style={{ flex: 1 }}><label style={s.label}>Altura (cm)</label><input style={s.porcionInput} type="number" value={calcForm.altura} onChange={e => setCalcForm({ ...calcForm, altura: e.target.value })} placeholder="175" /></div>
                </div>
                <label style={s.label}>Actividad</label>
                <select style={{ ...s.porcionSelect, width: '100%', marginBottom: 12 }} value={calcForm.actividad} onChange={e => setCalcForm({ ...calcForm, actividad: e.target.value })}>
                  <option value="sedentario">Sedentario</option><option value="ligero">Ligero (1-3 días)</option><option value="moderado">Moderado (3-5 días)</option><option value="activo">Activo (6-7 días)</option><option value="muy_activo">Muy activo</option>
                </select>
                <label style={s.label}>Objetivo</label>
                <select style={{ ...s.porcionSelect, width: '100%', marginBottom: 14 }} value={calcForm.objetivo} onChange={e => setCalcForm({ ...calcForm, objetivo: e.target.value })}>
                  <option value="bajar de peso">Bajar de peso</option><option value="tonificar">Tonificar</option><option value="mantener">Mantener</option><option value="ganar músculo">Ganar músculo</option>
                </select>
                <button style={{ ...s.btn, background: '#4ade80' }} onClick={calcularMacrosAuto}>Calcular y completar ↓</button>
              </div>
            )}
            <label style={s.label}>🔥 Calorías</label>
            <input style={{ ...s.porcionInput, width: '100%', marginBottom: 14 }} type="number" value={metasForm.calorias} onChange={e => setMetasForm({ ...metasForm, calorias: e.target.value })} placeholder="2000" />
            <label style={s.label}>🥩 Proteínas (g)</label>
            <input style={{ ...s.porcionInput, width: '100%', marginBottom: 14 }} type="number" value={metasForm.proteinas} onChange={e => setMetasForm({ ...metasForm, proteinas: e.target.value })} placeholder="150" />
            <label style={s.label}>🍚 Carbohidratos (g)</label>
            <input style={{ ...s.porcionInput, width: '100%', marginBottom: 14 }} type="number" value={metasForm.carbohidratos} onChange={e => setMetasForm({ ...metasForm, carbohidratos: e.target.value })} placeholder="200" />
            <label style={s.label}>🥑 Grasas (g)</label>
            <input style={{ ...s.porcionInput, width: '100%', marginBottom: 14 }} type="number" value={metasForm.grasas} onChange={e => setMetasForm({ ...metasForm, grasas: e.target.value })} placeholder="65" />
            {metasForm.calorias && (
              <div style={s.metaCheck(macrosOk)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: '#888' }}>Cal de macros:</span>
                  <span style={{ fontWeight: 700, color: macrosOk ? '#4ade80' : '#ff4d4d' }}>{Math.round(calMacros)} kcal</span>
                </div>
                <div style={{ color: macrosOk ? '#4ade80' : '#ff4d4d', fontSize: 11, fontWeight: 600 }}>
                  {macrosOk ? '✅ Los macros cuadran' : `⚠️ Diferencia de ${diff > 0 ? '+' : ''}${diff} kcal`}
                </div>
              </div>
            )}
            <button style={{ ...s.btn, opacity: macrosOk ? 1 : 0.5 }} onClick={() => { if (macrosOk) guardarMetas() }}>
              {macrosOk ? 'Guardar metas' : 'Ajustá los macros para guardar'}
            </button>
          </div>
        </div>
      )}

      {/* MODAL CARGAR PLAN ALIMENTACION */}
      {showCargarPlan && (
        <div style={s.porcionModal} onClick={() => setShowCargarPlan(false)}>
          <div style={s.porcionContent} onClick={e => e.stopPropagation()}>
            <div style={s.porcionHeader}>
              <div>
                <div style={s.porcionNombre}>📋 Cargar un plan</div>
                <div style={s.porcionMarca}>Se suma al diario del día</div>
              </div>
              <button style={s.searchClose} onClick={() => setShowCargarPlan(false)}>✕</button>
            </div>
            {cargandoPlanes ? <div style={s.loader}>Cargando...</div> : planesDisponibles.length === 0 ? (
              <div style={s.empty}>No tenés planes. Creá uno en "Mi Alimentación".</div>
            ) : (
              <>
                {planesDisponibles.map(plan => (
                  <div key={plan.id} style={{ ...s.unidadOption(false), display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: aplicandoPlan ? 0.5 : 1 }} onClick={() => { if (!aplicandoPlan) aplicarPlanAlDia(plan) }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#4ade80' }}>{plan.nombre}</div>
                      {plan.descripcion && <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{plan.descripcion}</div>}
                      {plan.calorias_objetivo && <div style={{ fontSize: 12, color: '#f5e642', marginTop: 4 }}>🎯 {plan.calorias_objetivo} kcal</div>}
                    </div>
                    <div style={{ color: '#4ade80', fontSize: 22, fontWeight: 700 }}>＋</div>
                  </div>
                ))}
                {aplicandoPlan && <div style={s.loader}>Cargando plan...</div>}
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL CUSTOM */}
      {showCustomModal && (
        <div style={s.porcionModal} onClick={() => setShowCustomModal(false)}>
          <div style={s.porcionContent} onClick={e => e.stopPropagation()}>
            <div style={s.porcionHeader}>
              <div><div style={s.porcionNombre}>📝 Crear producto</div><div style={s.porcionMarca}>Valores por 100g</div></div>
              <button style={s.searchClose} onClick={() => setShowCustomModal(false)}>✕</button>
            </div>
            <div style={s.customAlert}>💡 Mirá la etiqueta nutricional. Cargá los valores POR 100g.</div>
            <label style={s.label}>Nombre *</label>
            <input style={{ ...s.porcionInput, width: '100%', marginBottom: 14 }} value={customForm.nombre} onChange={e => setCustomForm({ ...customForm, nombre: e.target.value })} placeholder="Ej: Galletitas integrales" autoFocus />
            <label style={s.label}>Marca</label>
            <input style={{ ...s.porcionInput, width: '100%', marginBottom: 14 }} value={customForm.marca} onChange={e => setCustomForm({ ...customForm, marca: e.target.value })} placeholder="Ej: Granix" />
            <label style={s.label}>🔥 Calorías *</label>
            <input style={{ ...s.porcionInput, width: '100%', marginBottom: 14 }} type="number" value={customForm.calorias} onChange={e => setCustomForm({ ...customForm, calorias: e.target.value })} placeholder="450" />
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              <div style={{ flex: 1 }}><label style={s.label}>Proteínas</label><input style={s.porcionInput} type="number" step="0.1" value={customForm.proteinas} onChange={e => setCustomForm({ ...customForm, proteinas: e.target.value })} placeholder="10" /></div>
              <div style={{ flex: 1 }}><label style={s.label}>Carbos</label><input style={s.porcionInput} type="number" step="0.1" value={customForm.carbohidratos} onChange={e => setCustomForm({ ...customForm, carbohidratos: e.target.value })} placeholder="60" /></div>
              <div style={{ flex: 1 }}><label style={s.label}>Grasas</label><input style={s.porcionInput} type="number" step="0.1" value={customForm.grasas} onChange={e => setCustomForm({ ...customForm, grasas: e.target.value })} placeholder="15" /></div>
            </div>
            <button style={s.btn} onClick={guardarCustom}>✅ Guardar y agregar</button>
          </div>
        </div>
      )}

      {showEscaner && <EscanerBarras onScan={onScanBarcode} onClose={() => setShowEscaner(false)} />}

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&display=swap');`}</style>
    </div>
  )
}
