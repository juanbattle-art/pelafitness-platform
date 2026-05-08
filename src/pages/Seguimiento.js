import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { supabase } from '../lib/supabase'

const s = {
  page: { minHeight: '100vh', background: '#0a0a0a', fontFamily: "'DM Sans', sans-serif", paddingBottom: 80 },
  header: { background: '#111', borderBottom: '1px solid #222', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 },
  logo: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 2, color: '#f5e642' },
  backBtn: { background: 'none', border: '1px solid #222', color: '#888', borderRadius: 8, padding: '6px 14px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' },
  main: { maxWidth: 720, margin: '0 auto', padding: '20px 16px' },
  
  // Barra de navegación de días
  dayNav: { background: '#111', border: '1px solid #222', borderRadius: 12, padding: '12px 8px', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 },
  dayArrow: { background: '#1a1a1a', border: '1px solid #222', borderRadius: 8, color: '#f5e642', fontSize: 18, padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, lineHeight: 1 },
  dayCenter: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, cursor: 'pointer', position: 'relative' },
  dayBadge: { fontSize: 11, color: '#f5e642', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 },
  dayDate: { fontSize: 13, color: '#ccc', fontWeight: 600 },
  dayInputHidden: { position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' },
  hoyBtnSmall: { background: 'rgba(245,230,66,0.1)', border: '1px solid #f5e64240', borderRadius: 6, color: '#f5e642', fontSize: 11, padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, marginBottom: 12, marginLeft: 'auto', display: 'block' },
  
  bottomTabs: { position: 'fixed', bottom: 0, left: 0, right: 0, background: '#111', borderTop: '1px solid #222', display: 'flex', justifyContent: 'space-around', padding: '10px 0 12px', zIndex: 90 },
  bottomTab: (a) => ({ background: 'none', border: 'none', color: a ? '#f5e642' : '#666', fontFamily: 'inherit', fontSize: 11, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '4px 16px', fontWeight: a ? 700 : 500 }),
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
  searchHeader: { padding: '16px 20px', background: '#111', borderBottom: '1px solid #222', display: 'flex', alignItems: 'center', gap: 12 },
  searchInput: { flex: 1, background: '#1a1a1a', border: '1px solid #222', borderRadius: 8, padding: '10px 14px', color: '#f0f0f0', fontSize: 14, outline: 'none', fontFamily: 'inherit' },
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
  porcionContent: { background: '#111', width: '100%', maxHeight: '85vh', borderRadius: '16px 16px 0 0', overflowY: 'auto', padding: '20px' },
  porcionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #222' },
  porcionNombre: { fontSize: 16, fontWeight: 700, color: '#f0f0f0' },
  porcionMarca: { fontSize: 12, color: '#888', marginTop: 2 },
  porcionRow: { display: 'flex', gap: 10, marginBottom: 14 },
  porcionInput: { flex: 1, background: '#0a0a0a', border: '1px solid #222', borderRadius: 8, padding: '10px 14px', color: '#f0f0f0', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' },
  porcionSelect: { flex: 1.3, background: '#0a0a0a', border: '1px solid #222', borderRadius: 8, padding: '10px 14px', color: '#f0f0f0', fontSize: 14, outline: 'none', fontFamily: 'inherit', appearance: 'none', boxSizing: 'border-box' },
  porcionPreview: { background: '#0d0d0d', border: '1px solid #222', borderRadius: 10, padding: 14, marginBottom: 14 },
  porcionMacros: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, textAlign: 'center' },
  porcionMacro: { fontSize: 18, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 0.5 },
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
  
  // Resumen 7 días
  weekDay: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #1a1a1a' },
  weekDayLeft: { display: 'flex', flexDirection: 'column', gap: 2 },
  weekDayName: { fontSize: 13, color: '#ccc', fontWeight: 600 },
  weekDayDate: { fontSize: 11, color: '#666' },
  weekDayCal: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 1 },
}

const MOMENTOS = [
  { id: 'Desayuno', icono: '🌅', nombre: 'Desayuno' },
  { id: 'Almuerzo', icono: '🍽️', nombre: 'Almuerzo' },
  { id: 'Merienda', icono: '☕', nombre: 'Merienda' },
  { id: 'Cena', icono: '🌙', nombre: 'Cena' },
  { id: 'Snack', icono: '🍎', nombre: 'Snacks' },
]

// =================== HELPERS DE FECHA ===================
function fechaHoy() {
  // Devuelve la fecha de HOY en formato YYYY-MM-DD usando timezone local
  const d = new Date()
  const año = d.getFullYear()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${año}-${mes}-${dia}`
}

function sumarDias(fechaStr, dias) {
  const [año, mes, dia] = fechaStr.split('-').map(Number)
  const d = new Date(año, mes - 1, dia)
  d.setDate(d.getDate() + dias)
  const a = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const di = String(d.getDate()).padStart(2, '0')
  return `${a}-${m}-${di}`
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

// =================== CIRCLE PROGRESS ===================
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
      <circle 
        cx="80" cy="80" r={radius} 
        fill="none" 
        stroke={over ? '#ff4d4d' : '#f5e642'}
        strokeWidth="10" 
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 80 80)"
        style={{ transition: 'stroke-dashoffset 0.5s' }}
      />
      <text x="80" y="74" textAnchor="middle" fill="#f0f0f0" fontSize="32" fontFamily="'Bebas Neue', sans-serif" letterSpacing="1">
        {Math.round(restantes)}
      </text>
      <text x="80" y="94" textAnchor="middle" fill="#666" fontSize="10" letterSpacing="1">
        RESTANTES
      </text>
    </svg>
  )
}

// =================== BARRA DE NAVEGACIÓN DE DÍAS ===================
function DayNavigator({ fecha, setFecha }) {
  const { badge, texto } = formatearFecha(fecha)
  const hoy = fechaHoy()
  
  return (
    <>
      <div style={s.dayNav}>
        <button style={s.dayArrow} onClick={() => setFecha(sumarDias(fecha, -1))} title="Día anterior">◀</button>
        <div style={s.dayCenter}>
          {badge && <div style={s.dayBadge}>{badge}</div>}
          <div style={s.dayDate}>📅 {texto}</div>
          <input 
            type="date" 
            value={fecha} 
            onChange={e => setFecha(e.target.value)} 
            style={s.dayInputHidden}
          />
        </div>
        <button style={s.dayArrow} onClick={() => setFecha(sumarDias(fecha, 1))} title="Día siguiente">▶</button>
      </div>
      {fecha !== hoy && (
        <button style={s.hoyBtnSmall} onClick={() => setFecha(hoy)}>↻ Volver a hoy</button>
      )}
    </>
  )
}

// =================== COMPONENTE PRINCIPAL ===================
export default function Seguimiento({ perfil }) {
  const navigate = useNavigate()
 const [searchParams] = useSearchParams()
  const alumnoIdParam = searchParams.get('alumno')
  const esAdminViendo = perfil.rol === 'admin' && alumnoIdParam
  const alumnoIdActual = esAdminViendo ? alumnoIdParam : alumnoIdActual
  const [alumnoNombre, setAlumnoNombre] = useState('')
  const [fecha, setFecha] = useState(fechaHoy())
  const [vasosHoy, setVasosHoy] = useState(0)
  const [comidas, setComidas] = useState([])
  const [ejercicios, setEjercicios] = useState([])
  const [recientes, setRecientes] = useState([])
  const [historial7Dias, setHistorial7Dias] = useState([])
  const [metas, setMetas] = useState({ calorias: 2000, proteinas: 150, carbohidratos: 200, grasas: 65 })
  const [fabOpen, setFabOpen] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchMomento, setSearchMomento] = useState('Desayuno')
  const [busqueda, setBusqueda] = useState('')
  const [resultados, setResultados] = useState([])
  const [buscando, setBuscando] = useState(false)
  const [searchTab, setSearchTab] = useState('todo')
  const [alimentoSel, setAlimentoSel] = useState(null)
  const [gramos, setGramos] = useState('100')
  const [tipoPorcion, setTipoPorcion] = useState('100g')
  const [showPesoModal, setShowPesoModal] = useState(false)
  const [showEjercicioModal, setShowEjercicioModal] = useState(false)
  const [showMetasModal, setShowMetasModal] = useState(false)
  const [pesoInput, setPesoInput] = useState('')
  const [ejercicioInput, setEjercicioInput] = useState({ ejercicio: '', series: '', repeticiones: '', peso_kg: '', notas: '' })
  const [metasForm, setMetasForm] = useState({ calorias: '', proteinas: '', carbohidratos: '', grasas: '' })
  
  const META_AGUA = 8
  const timeoutRef = useRef(null)

  // Auto-actualizar a HOY si pasa la medianoche con la app abierta
  useEffect(() => {
    const interval = setInterval(() => {
      const nuevaHoy = fechaHoy()
      // Solo actualizar si estábamos viendo lo que era "hoy" y ya cambió
      if (fecha < nuevaHoy && tab === 'panel') {
        setFecha(nuevaHoy)
      }
    }, 60000) // chequear cada 1 minuto
    return () => clearInterval(interval)
  }, [fecha, tab])

 useEffect(() => {
  if (esAdminViendo) {
    supabase.from('profiles').select('nombre').eq('id', alumnoIdParam).single()
      .then(({ data }) => { if (data) setAlumnoNombre(data.nombre) })
  }
}, [alumnoIdParam, esAdminViendo])

useEffect(() => { cargarTodo() }, [fecha, alumnoIdActual])
  useEffect(() => { cargarHistorial() }, [tab, alumnoIdActual])

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

  // Carga el resumen de los últimos 7 días para el Tab Progreso
  async function cargarHistorial() {
    if (tab !== 'progreso') return
    const id =alumnoIdActual
    const hoy = fechaHoy()
    const hace7 = sumarDias(hoy, -6)
    
    const { data } = await supabase
      .from('registros_comidas')
      .select('fecha, calorias')
      .eq('alumno_id', id)
      .gte('fecha', hace7)
      .lte('fecha', hoy)
    
    // Agrupar por fecha
    const porFecha = {}
    for (let i = 0; i < 7; i++) {
      const f = sumarDias(hoy, -i)
      porFecha[f] = 0
    }
    if (data) {
      data.forEach(c => {
        if (porFecha[c.fecha] !== undefined) {
          porFecha[c.fecha] += (c.calorias || 0)
        }
      })
    }
    
    const arr = Object.entries(porFecha)
      .map(([fecha, calorias]) => ({ fecha, calorias }))
      .sort((a, b) => b.fecha.localeCompare(a.fecha))
    
    setHistorial7Dias(arr)
  }

  const totalCal = comidas.reduce((s, c) => s + (c.calorias || 0), 0)
  const totalProt = comidas.reduce((s, c) => s + (c.proteinas || 0), 0)
  const totalCarb = comidas.reduce((s, c) => s + (c.carbohidratos || 0), 0)
  const totalGras = comidas.reduce((s, c) => s + (c.grasas || 0), 0)
  const ultimoPeso = registrosPeso[0]?.peso

  async function buscarAlimento(q) {
    setBusqueda(q)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    if (q.length < 2) {
      setResultados([])
      setBuscando(false)
      return
    }

    setBuscando(true)

    try {
      const { data: resLocalesDB, error } = await supabase
        .from('alimentos')
        .select('*')
        .ilike('nombre', `%${q}%`)
        .order('nombre')
        .limit(40)
      
      if (error) console.error('Error Supabase:', error)
      
      const resLocales = (resLocalesDB || []).map(a => ({ ...a, fuente: 'local' }))
      setResultados(resLocales)
      setBuscando(false)
    } catch (err) {
      console.error('Error búsqueda local:', err)
      setResultados([])
      setBuscando(false)
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=20&lc=es`
        const response = await fetch(url, { mode: 'cors' })
        if (!response.ok) return
        
        const data = await response.json()
        if (!data.products || data.products.length === 0) return

        const codigosVistos = new Set()
        const resAPI = data.products
          .filter(p => {
            if (!p.code || codigosVistos.has(p.code)) return false
            const tieneNombre = p.product_name && p.product_name.trim().length > 0
            const tieneCalorias = p.nutriments && p.nutriments['energy-kcal_100g']
            if (!tieneNombre || !tieneCalorias) return false
            codigosVistos.add(p.code)
            return true
          })
          .map(p => ({
            id: `off-${p.code}`,
            codigo_barras: p.code,
            nombre: p.product_name,
            marca: p.brands || '',
            imagen_url: p.image_small_url || p.image_url || null,
            calorias: Math.round(p.nutriments['energy-kcal_100g'] || 0),
            proteinas: parseFloat((p.nutriments['proteins_100g'] || 0).toFixed(1)),
            carbohidratos: parseFloat((p.nutriments['carbohydrates_100g'] || 0).toFixed(1)),
            grasas: parseFloat((p.nutriments['fat_100g'] || 0).toFixed(1)),
            porciones: p.serving_size ? [{ nombre: p.serving_size, gramos: parseFloat(p.serving_quantity) || 100 }] : [],
            fuente: 'openfoodfacts'
          }))
          .slice(0, 15)

        setResultados(prev => {
          const sololocales = prev.filter(x => x.fuente === 'local')
          return [...sololocales, ...resAPI]
        })
      } catch (err) {
        console.log('OFF no disponible:', err.message)
      }
    }, 500)
  }

  function abrirBuscador(momento) {
    setSearchMomento(momento)
    setShowSearch(true)
    setBusqueda('')
    setResultados([])
    setSearchTab('todo')
  }

  function seleccionarAlimento(al) {
    setAlimentoSel(al)
    setGramos('100')
    setTipoPorcion('100g')
  }

  function calcularPorGramos(al, g) {
    const factor = parseFloat(g) / 100
    return {
      calorias: Math.round((al.calorias || 0) * factor * 10) / 10,
      proteinas: Math.round((al.proteinas || 0) * factor * 10) / 10,
      carbohidratos: Math.round((al.carbohidratos || 0) * factor * 10) / 10,
      grasas: Math.round((al.grasas || 0) * factor * 10) / 10,
    }
  }

  function calcularGramosFinal() {
    if (tipoPorcion === '100g') return parseFloat(gramos) || 0
    if (tipoPorcion === 'gramos') return parseFloat(gramos) || 0
    const porcion = alimentoSel?.porciones?.find(p => p.nombre === tipoPorcion)
    if (porcion) return (parseFloat(gramos) || 1) * porcion.gramos
    const factores = { 'unidad': 100, 'taza': 240, 'cucharada': 15, 'cucharadita': 5 }
    return (parseFloat(gramos) || 1) * (factores[tipoPorcion] || 100)
  }

  const macrosPreview = alimentoSel ? calcularPorGramos(alimentoSel, calcularGramosFinal()) : null

  async function agregarComida() {
    if (!alimentoSel) return
    const gFinal = calcularGramosFinal()
    const m = calcularPorGramos(alimentoSel, gFinal)
    const nombreCompleto = `${alimentoSel.nombre}${alimentoSel.marca ? ` (${alimentoSel.marca})` : ''} - ${gFinal}g`
    
    await supabase.from('registros_comidas').insert({
      alumno_id: alumnoIdActual, 
      fecha, 
      momento: searchMomento,
      nombre_manual: nombreCompleto,
      calorias: m.calorias,
      proteinas: m.proteinas,
      carbohidratos: m.carbohidratos,
      grasas: m.grasas,
      gramos: gFinal
    })

    try {
      await supabase.from('alimentos_recientes').insert({
        alumno_id: alumnoIdActual,
        alimento_data: alimentoSel,
        ultima_vez: new Date().toISOString()
      })
    } catch(e) { /* opcional */ }

    setAlimentoSel(null)
    setShowSearch(false)
    setBusqueda('')
    setResultados([])
    setMsg('Comida agregada ✓')
    cargarTodo()
    setTimeout(() => setMsg(''), 2000)
  }

  async function eliminarComida(id) {
    await supabase.from('registros_comidas').delete().eq('id', id)
    cargarTodo()
  }

  async function toggleVaso(i) {
    const nuevos = i + 1 === vasosHoy ? i : i + 1
    const { data: existing } = await supabase.from('registros_agua').select('*').eq('alumno_id', alumnoIdActual).eq('fecha', fecha).maybeSingle()
    if (existing) {
      await supabase.from('registros_agua').update({ vasos: nuevos }).eq('id', existing.id)
    } else {
      await supabase.from('registros_agua').insert({ alumno_id: alumnoIdActual, vasos: nuevos, fecha })
    }
    setVasosHoy(nuevos)
  }

  async function guardarPeso() {
    if (!pesoInput) return
    await supabase.from('registros_peso').insert({ alumno_id: alumnoIdActual, peso: parseFloat(pesoInput), fecha })
    setPesoInput('')
    setShowPesoModal(false)
    setMsg('Peso guardado ✓')
    cargarTodo()
    setTimeout(() => setMsg(''), 2000)
  }

  async function guardarEjercicio() {
    if (!ejercicioInput.ejercicio) return
    await supabase.from('registros_entrenamiento').insert({ 
      alumno_id: alumnoIdActual, fecha, 
      ejercicio: ejercicioInput.ejercicio,
      series: parseInt(ejercicioInput.series) || 0,
      repeticiones: parseInt(ejercicioInput.repeticiones) || 0,
      peso_kg: parseFloat(ejercicioInput.peso_kg) || 0,
      notas: ejercicioInput.notas
    })
    setEjercicioInput({ ejercicio: '', series: '', repeticiones: '', peso_kg: '', notas: '' })
    setShowEjercicioModal(false)
    setMsg('Ejercicio agregado ✓')
    cargarTodo()
    setTimeout(() => setMsg(''), 2000)
  }

  async function eliminarEjercicio(id) {
    await supabase.from('registros_entrenamiento').delete().eq('id', id)
    cargarTodo()
  }

  function abrirModalMetas() {
    setMetasForm({
      calorias: metas.calorias,
      proteinas: metas.proteinas,
      carbohidratos: metas.carbohidratos,
      grasas: metas.grasas
    })
    setShowMetasModal(true)
  }

  async function guardarMetas() {
    const nuevas = {
      alumno_id: alumnoIdActual,
      calorias: parseFloat(metasForm.calorias) || 0,
      proteinas: parseFloat(metasForm.proteinas) || 0,
      carbohidratos: parseFloat(metasForm.carbohidratos) || 0,
      grasas: parseFloat(metasForm.grasas) || 0
    }
    
    const { data: existing } = await supabase.from('metas_nutricionales').select('*').eq('alumno_id', alumnoIdActual).maybeSingle()
    
    if (existing) {
      await supabase.from('metas_nutricionales').update(nuevas).eq('alumno_id', alumnoIdActual)
    } else {
      await supabase.from('metas_nutricionales').insert(nuevas)
    }
    
    setMetas(nuevas)
    setShowMetasModal(false)
    setMsg('Metas actualizadas ✓')
    cargarTodo()
    setTimeout(() => setMsg(''), 2000)
  }

  const calMacros = (parseFloat(metasForm.proteinas) || 0) * 4 + 
                    (parseFloat(metasForm.carbohidratos) || 0) * 4 + 
                    (parseFloat(metasForm.grasas) || 0) * 9
  const calObjetivo = parseFloat(metasForm.calorias) || 0
  const diff = Math.round(calMacros - calObjetivo)
  const macrosOk = Math.abs(diff) <= 50

  const resultadosVisibles = searchTab === 'recientes' 
    ? recientes.map(r => ({ ...r.alimento_data, fuente: r.alimento_data?.fuente || 'local' }))
    : resultados

  const promedio7Dias = historial7Dias.length > 0 
    ? Math.round(historial7Dias.reduce((s, d) => s + d.calorias, 0) / historial7Dias.filter(d => d.calorias > 0).length || 0)
    : 0

  return (
    <div style={s.page}>
      <header style={s.header}>
        <button style={s.backBtn} onClick={() => navigate(esAdminViendo ? '/mis-alumnos' : '/')}>← Volver</button>
        <div style={s.logo}>SEGUIMIENTO</div>
        <div style={{ width: 80 }}></div>
      </header>

      <main style={s.main}>
        {msg && <div style={s.success}>{msg}</div>}

        <DayNavigator fecha={fecha} setFecha={setFecha} />

        {tab === 'panel' && (
          <div>
            <div style={s.card}>
              <div style={s.cardTitle}>Calorías</div>
              <div style={s.calorieCircle}>
                <CalorieCircle consumidas={totalCal} meta={metas.calorias} />
                <div style={s.circleStats}>
                  <div style={s.circleStat}>
                    <span style={s.circleIcon}>🎯</span>
                    <div>
                      <div style={s.circleLabel}>Objetivo</div>
                      <div style={s.circleValue}>{metas.calorias}</div>
                    </div>
                  </div>
                  <div style={s.circleStat}>
                    <span style={s.circleIcon}>🍴</span>
                    <div>
                      <div style={s.circleLabel}>Alimentos</div>
                      <div style={s.circleValue}>{Math.round(totalCal)}</div>
                    </div>
                  </div>
                  <div style={s.circleStat}>
                    <span style={s.circleIcon}>🔥</span>
                    <div>
                      <div style={s.circleLabel}>Ejercicio</div>
                      <div style={s.circleValue}>{ejercicios.length}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={s.card}>
              <div style={s.cardTitle}>Macros del día</div>
              <div style={s.macroBar}>
                {[
                  { label: 'Proteínas', actual: totalProt, meta: metas.proteinas, color: '#4ade80', unit: 'g' },
                  { label: 'Carbos', actual: totalCarb, meta: metas.carbohidratos, color: '#f5e642', unit: 'g' },
                  { label: 'Grasas', actual: totalGras, meta: metas.grasas, color: '#f97316', unit: 'g' },
                ].map(m => {
                  const pct = m.meta > 0 ? (m.actual / m.meta) * 100 : 0
                  return (
                    <div key={m.label} style={s.macroCard}>
                      <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{m.label}</div>
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: m.color, letterSpacing: 1 }}>
                        {Math.round(m.actual)}<span style={{ fontSize: 14, color: '#444' }}>/{m.meta}{m.unit}</span>
                      </div>
                      <div style={s.macroBarBg}>
                        <div style={s.macroBarFill(m.color, pct)} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              <div style={s.card}>
                <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>💧 Agua</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: '#60a5fa', letterSpacing: 1 }}>{vasosHoy}/{META_AGUA}</div>
                <div style={{ fontSize: 11, color: '#444', marginTop: 4 }}>{vasosHoy * 250} ml</div>
              </div>
              <div style={s.card}>
                <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>⚖️ Peso</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: '#f5e642', letterSpacing: 1 }}>{ultimoPeso || '—'}</div>
                <div style={{ fontSize: 11, color: '#444', marginTop: 4 }}>kg</div>
              </div>
            </div>
          </div>
        )}

        {tab === 'diario' && (
          <div>
            <div style={{ background: '#111', borderRadius: 12, border: '1px solid #222', padding: 18, marginBottom: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>Calorías restantes</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 38, color: totalCal > metas.calorias ? '#ff4d4d' : '#f5e642', letterSpacing: 1, margin: '6px 0' }}>
                {Math.round(Math.max(0, metas.calorias - totalCal))}
              </div>
              <div style={{ fontSize: 12, color: '#666' }}>
                <span style={{ color: '#888' }}>{metas.calorias}</span> objetivo − <span style={{ color: '#888' }}>{Math.round(totalCal)}</span> consumidas
              </div>
            </div>

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

        {tab === 'progreso' && (
          <div>
            <div style={s.card}>
              <div style={s.cardTitle}>📊 Últimos 7 días</div>
              <div style={{ marginBottom: 14, padding: '10px 14px', background: '#0d0d0d', borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>Promedio diario</span>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: '#f5e642', letterSpacing: 1 }}>{promedio7Dias} kcal</span>
                </div>
              </div>
              {historial7Dias.map(d => {
                const { badge, texto } = formatearFecha(d.fecha)
                const pct = metas.calorias > 0 ? (d.calorias / metas.calorias) * 100 : 0
                const cumplio = d.calorias > 0 && d.calorias <= metas.calorias
                return (
                  <div key={d.fecha} style={s.weekDay} onClick={() => { setFecha(d.fecha); setTab('diario') }} >
                    <div style={s.weekDayLeft}>
                      <div style={s.weekDayName}>
                        {badge && <span style={{ color: '#f5e642', marginRight: 6, fontSize: 10, fontWeight: 700 }}>{badge}</span>}
                        {texto}
                      </div>
                      {d.calorias > 0 && (
                        <div style={{ ...s.macroBarBg, marginTop: 6, width: 120 }}>
                          <div style={s.macroBarFill(cumplio ? '#4ade80' : '#f5e642', pct)} />
                        </div>
                      )}
                    </div>
                    <div style={{ ...s.weekDayCal, color: d.calorias === 0 ? '#444' : (d.calorias > metas.calorias ? '#ff4d4d' : '#f5e642') }}>
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
                <div style={{ color: '#444', fontSize: 13, padding: '20px 0', textAlign: 'center' }}>No hay registros aún. Tocá el "+" para agregar.</div>
              ) : registrosPeso.map((r, i) => {
                const diff = i < registrosPeso.length - 1 ? r.peso - registrosPeso[i + 1].peso : null
                return (
                  <div key={r.id} style={s.detailRow}>
                    <div>
                      <div style={s.detailValue}>{r.peso} kg
                        {diff !== null && <span style={{ marginLeft: 8, fontSize: 12, color: diff < 0 ? '#4ade80' : diff > 0 ? '#ff4d4d' : '#555' }}>{diff > 0 ? '+' : ''}{diff.toFixed(1)} kg</span>}
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
                <div style={{ color: '#444', fontSize: 13, padding: '20px 0', textAlign: 'center' }}>No hay ejercicios. Tocá el "+" para agregar.</div>
              ) : ejercicios.map((e, i) => (
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

        {tab === 'mas' && (
          <div>
            <div style={s.card}>
              <div style={s.cardTitle}>💧 Agua del día</div>
              <div style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>Meta: {META_AGUA} vasos (~2L). Tocá un vaso para registrarlo.</div>
              <div style={s.agua}>
                {Array.from({ length: META_AGUA }).map((_, i) => (
                  <div key={i} style={s.vaso(i < vasosHoy)} onClick={() => toggleVaso(i)}>💧</div>
                ))}
              </div>
              <div style={{ textAlign: 'center', marginTop: 14, fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: vasosHoy >= META_AGUA ? '#4ade80' : '#60a5fa', letterSpacing: 1 }}>
                {vasosHoy} / {META_AGUA}
              </div>
            </div>

            <div style={s.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ ...s.cardTitle, marginBottom: 0 }}>🎯 Mis metas diarias</div>
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

      <button style={s.fab} onClick={() => setFabOpen(!fabOpen)}>{fabOpen ? '×' : '+'}</button>

      {fabOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 94 }} onClick={() => setFabOpen(false)} />
          <div style={s.fabMenu}>
            <button style={s.fabItem} onClick={() => { setFabOpen(false); abrirBuscador('Desayuno') }}>🔍 Buscar alimento</button>
            <button style={s.fabItem} onClick={() => { setFabOpen(false); setShowPesoModal(true) }}>⚖️ Registrar peso</button>
            <button style={s.fabItem} onClick={() => { setFabOpen(false); setShowEjercicioModal(true) }}>🏋️ Agregar ejercicio</button>
            <button style={s.fabItem} onClick={() => { setFabOpen(false); abrirModalMetas() }}>🎯 Editar metas</button>
          </div>
        </>
      )}

      <nav style={s.bottomTabs}>
        <button style={s.bottomTab(tab === 'panel')} onClick={() => setTab('panel')}>
          <span style={s.bottomIcon}>📊</span>Panel
        </button>
        <button style={s.bottomTab(tab === 'diario')} onClick={() => setTab('diario')}>
          <span style={s.bottomIcon}>📔</span>Diario
        </button>
        <button style={s.bottomTab(tab === 'progreso')} onClick={() => setTab('progreso')}>
          <span style={s.bottomIcon}>📈</span>Progreso
        </button>
        <button style={s.bottomTab(tab === 'mas')} onClick={() => setTab('mas')}>
          <span style={s.bottomIcon}>⋯</span>Más
        </button>
      </nav>

      {showSearch && (
        <div style={s.searchModal}>
          <div style={s.searchHeader}>
            <button style={s.searchClose} onClick={() => { setShowSearch(false); setBusqueda(''); setResultados([]) }}>✕</button>
            <input
              autoFocus
              style={s.searchInput}
              value={busqueda}
              onChange={e => buscarAlimento(e.target.value)}
              placeholder={`Buscar para ${searchMomento}...`}
            />
          </div>
          <div style={s.searchTabs}>
            <button style={s.searchTab(searchTab === 'todo')} onClick={() => setSearchTab('todo')}>Todo</button>
            <button style={s.searchTab(searchTab === 'recientes')} onClick={() => setSearchTab('recientes')}>Recientes</button>
          </div>
          <div style={s.searchResults}>
            {buscando && <div style={s.loader}>🔍 Buscando...</div>}
            {!buscando && searchTab === 'todo' && busqueda.length < 2 && <div style={s.empty}>Escribí al menos 2 letras para buscar.</div>}
            {!buscando && searchTab === 'recientes' && recientes.length === 0 && <div style={s.empty}>Todavía no usaste alimentos.<br/>Buscá uno y aparecerán acá.</div>}
            {!buscando && resultadosVisibles.length === 0 && busqueda.length >= 2 && searchTab === 'todo' && <div style={s.empty}>No se encontraron alimentos.<br/>Probá otro término.</div>}
            
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
                    {a.calorias} kcal · {a.proteinas}g P · {a.carbohidratos}g C · {a.grasas}g G (100g)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {alimentoSel && (
        <div style={s.porcionModal} onClick={() => setAlimentoSel(null)}>
          <div style={s.porcionContent} onClick={e => e.stopPropagation()}>
            <div style={s.porcionHeader}>
              <div>
                <div style={s.porcionNombre}>{alimentoSel.nombre}</div>
                {alimentoSel.marca && <div style={s.porcionMarca}>{alimentoSel.marca}</div>}
              </div>
              <button style={s.searchClose} onClick={() => setAlimentoSel(null)}>✕</button>
            </div>

            <label style={s.label}>Cantidad y porción</label>
            <div style={s.porcionRow}>
              <input style={s.porcionInput} type="number" step="0.1" value={gramos} onChange={e => setGramos(e.target.value)} placeholder="100" />
              <select style={s.porcionSelect} value={tipoPorcion} onChange={e => setTipoPorcion(e.target.value)}>
                <option value="100g">por 100g</option>
                <option value="gramos">gramos</option>
                <option value="unidad">unidad (~100g)</option>
                <option value="taza">taza (240g)</option>
                <option value="cucharada">cucharada (15g)</option>
                <option value="cucharadita">cucharadita (5g)</option>
                {alimentoSel.porciones && alimentoSel.porciones.map(p => (
                  <option key={p.nombre} value={p.nombre}>{p.nombre} ({p.gramos}g)</option>
                ))}
              </select>
            </div>

            <label style={s.label}>Momento</label>
            <select style={{ ...s.porcionSelect, width: '100%', marginBottom: 14 }} value={searchMomento} onChange={e => setSearchMomento(e.target.value)}>
              {MOMENTOS.map(m => <option key={m.id} value={m.id}>{m.icono} {m.nombre}</option>)}
            </select>

            {macrosPreview && (
              <div style={s.porcionPreview}>
                <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Para {Math.round(calcularGramosFinal())}g</div>
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

      {showEjercicioModal && (
        <div style={s.porcionModal} onClick={() => setShowEjercicioModal(false)}>
          <div style={s.porcionContent} onClick={e => e.stopPropagation()}>
            <div style={s.porcionHeader}>
              <div style={s.porcionNombre}>🏋️ Agregar ejercicio</div>
              <button style={s.searchClose} onClick={() => setShowEjercicioModal(false)}>✕</button>
            </div>
            <label style={s.label}>Ejercicio</label>
            <input style={{ ...s.porcionInput, width: '100%', marginBottom: 14 }} value={ejercicioInput.ejercicio} onChange={e => setEjercicioInput({ ...ejercicioInput, ejercicio: e.target.value })} placeholder="Ej: Sentadilla" autoFocus />
            <div style={s.porcionRow}>
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

      {showMetasModal && (
        <div style={s.porcionModal} onClick={() => setShowMetasModal(false)}>
          <div style={s.porcionContent} onClick={e => e.stopPropagation()}>
            <div style={s.porcionHeader}>
              <div style={s.porcionNombre}>🎯 Editar mis metas diarias</div>
              <button style={s.searchClose} onClick={() => setShowMetasModal(false)}>✕</button>
            </div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 14 }}>Tu coach te puede pasar estos valores.</div>
            <label style={s.label}>🔥 Calorías (kcal)</label>
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
                  <span style={{ color: '#888' }}>Calorías de tus macros:</span>
                  <span style={{ fontWeight: 700, color: macrosOk ? '#4ade80' : '#ff4d4d' }}>{Math.round(calMacros)} kcal</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: '#888' }}>Calorías objetivo:</span>
                  <span style={{ fontWeight: 700, color: '#f5e642' }}>{calObjetivo} kcal</span>
                </div>
                <div style={{ color: macrosOk ? '#4ade80' : '#ff4d4d', fontSize: 11, fontWeight: 600 }}>
                  {macrosOk ? '✅ Los macros cuadran con tus calorías' : `⚠️ Diferencia de ${diff > 0 ? '+' : ''}${diff} kcal`}
                </div>
              </div>
            )}
            <button style={{ ...s.btn, opacity: macrosOk ? 1 : 0.5, cursor: macrosOk ? 'pointer' : 'not-allowed' }} onClick={() => { if (macrosOk) guardarMetas() }}>
              {macrosOk ? 'Guardar metas' : 'Ajustá los macros para guardar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
