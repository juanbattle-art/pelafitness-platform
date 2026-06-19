import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// ============================================================
// LISTA DE EJERCICIOS POR GRUPO MUSCULAR (mejores primero)
// ============================================================
const EJERCICIOS_GYM = [
  // PECHO
  { nombre: 'Press banca plano con barra', grupo: 'Pecho', equipo: 'Barra', nivel: 'intermedio' },
  { nombre: 'Press banca inclinado con barra', grupo: 'Pecho', equipo: 'Barra', nivel: 'intermedio' },
  { nombre: 'Press banca plano con mancuernas', grupo: 'Pecho', equipo: 'Mancuernas', nivel: 'principiante' },
  { nombre: 'Press banca inclinado con mancuernas', grupo: 'Pecho', equipo: 'Mancuernas', nivel: 'principiante' },
  { nombre: 'Aperturas con mancuernas en plano', grupo: 'Pecho', equipo: 'Mancuernas', nivel: 'principiante' },
  { nombre: 'Aperturas en polea cruzada', grupo: 'Pecho', equipo: 'Polea', nivel: 'principiante' },
  { nombre: 'Press en máquina de pecho', grupo: 'Pecho', equipo: 'Máquina', nivel: 'principiante' },
  { nombre: 'Fondos en paralelas (pecho)', grupo: 'Pecho', equipo: 'Paralelas', nivel: 'intermedio' },
  { nombre: 'Pull-over con mancuerna', grupo: 'Pecho', equipo: 'Mancuernas', nivel: 'intermedio' },

  // ESPALDA
  { nombre: 'Dominadas con peso', grupo: 'Espalda', equipo: 'Barra', nivel: 'avanzado' },
  { nombre: 'Remo con barra', grupo: 'Espalda', equipo: 'Barra', nivel: 'intermedio' },
  { nombre: 'Jalón al pecho en polea', grupo: 'Espalda', equipo: 'Polea', nivel: 'principiante' },
  { nombre: 'Remo con mancuerna a una mano', grupo: 'Espalda', equipo: 'Mancuernas', nivel: 'principiante' },
  { nombre: 'Remo en polea baja sentado', grupo: 'Espalda', equipo: 'Polea', nivel: 'principiante' },
  { nombre: 'Jalón al pecho agarre neutro', grupo: 'Espalda', equipo: 'Polea', nivel: 'principiante' },
  { nombre: 'Remo en máquina', grupo: 'Espalda', equipo: 'Máquina', nivel: 'principiante' },
  { nombre: 'Peso muerto convencional', grupo: 'Espalda', equipo: 'Barra', nivel: 'avanzado' },
  { nombre: 'Remo en T con barra', grupo: 'Espalda', equipo: 'Barra', nivel: 'intermedio' },
  { nombre: 'Pullover en polea', grupo: 'Espalda', equipo: 'Polea', nivel: 'principiante' },

  // HOMBROS
  { nombre: 'Press militar con barra de pie', grupo: 'Hombros', equipo: 'Barra', nivel: 'avanzado' },
  { nombre: 'Press militar con mancuernas sentado', grupo: 'Hombros', equipo: 'Mancuernas', nivel: 'principiante' },
  { nombre: 'Elevaciones laterales con mancuernas', grupo: 'Hombros', equipo: 'Mancuernas', nivel: 'principiante' },
  { nombre: 'Elevaciones laterales en polea', grupo: 'Hombros', equipo: 'Polea', nivel: 'principiante' },
  { nombre: 'Face pull en polea', grupo: 'Hombros', equipo: 'Polea', nivel: 'principiante' },
  { nombre: 'Elevaciones frontales con mancuernas', grupo: 'Hombros', equipo: 'Mancuernas', nivel: 'principiante' },
  { nombre: 'Press en máquina de hombros', grupo: 'Hombros', equipo: 'Máquina', nivel: 'principiante' },
  { nombre: 'Pájaros con mancuernas', grupo: 'Hombros', equipo: 'Mancuernas', nivel: 'principiante' },
  { nombre: 'Upright row con barra', grupo: 'Hombros', equipo: 'Barra', nivel: 'intermedio' },

  // BÍCEPS
  { nombre: 'Curl con barra recta', grupo: 'Bíceps', equipo: 'Barra', nivel: 'principiante' },
  { nombre: 'Curl con mancuernas alterno', grupo: 'Bíceps', equipo: 'Mancuernas', nivel: 'principiante' },
  { nombre: 'Curl martillo con mancuernas', grupo: 'Bíceps', equipo: 'Mancuernas', nivel: 'principiante' },
  { nombre: 'Curl en polea baja', grupo: 'Bíceps', equipo: 'Polea', nivel: 'principiante' },
  { nombre: 'Curl concentrado con mancuerna', grupo: 'Bíceps', equipo: 'Mancuernas', nivel: 'principiante' },
  { nombre: 'Curl en banco Scott con barra', grupo: 'Bíceps', equipo: 'Barra', nivel: 'intermedio' },
  { nombre: 'Curl inclinado con mancuernas', grupo: 'Bíceps', equipo: 'Mancuernas', nivel: 'intermedio' },
  { nombre: 'Curl con barra Z', grupo: 'Bíceps', equipo: 'Barra', nivel: 'principiante' },

  // TRÍCEPS
  { nombre: 'Fondos en paralelas (tríceps)', grupo: 'Tríceps', equipo: 'Paralelas', nivel: 'intermedio' },
  { nombre: 'Press francés con barra', grupo: 'Tríceps', equipo: 'Barra', nivel: 'intermedio' },
  { nombre: 'Extensión en polea alta con cuerda', grupo: 'Tríceps', equipo: 'Polea', nivel: 'principiante' },
  { nombre: 'Extensión en polea alta con barra', grupo: 'Tríceps', equipo: 'Polea', nivel: 'principiante' },
  { nombre: 'Extensión con mancuerna sobre cabeza', grupo: 'Tríceps', equipo: 'Mancuernas', nivel: 'principiante' },
  { nombre: 'Press cerrado con barra', grupo: 'Tríceps', equipo: 'Barra', nivel: 'intermedio' },
  { nombre: 'Kickback con mancuerna', grupo: 'Tríceps', equipo: 'Mancuernas', nivel: 'principiante' },
  { nombre: 'Press francés con mancuernas', grupo: 'Tríceps', equipo: 'Mancuernas', nivel: 'principiante' },

  // CUÁDRICEPS
  { nombre: 'Sentadilla con barra', grupo: 'Cuádriceps', equipo: 'Barra', nivel: 'intermedio' },
  { nombre: 'Prensa de piernas', grupo: 'Cuádriceps', equipo: 'Máquina', nivel: 'principiante' },
  { nombre: 'Extensión de cuádriceps en máquina', grupo: 'Cuádriceps', equipo: 'Máquina', nivel: 'principiante' },
  { nombre: 'Sentadilla Hack con barra', grupo: 'Cuádriceps', equipo: 'Barra', nivel: 'avanzado' },
  { nombre: 'Zancadas con mancuernas', grupo: 'Cuádriceps', equipo: 'Mancuernas', nivel: 'principiante' },
  { nombre: 'Sentadilla búlgara con mancuernas', grupo: 'Cuádriceps', equipo: 'Mancuernas', nivel: 'intermedio' },
  { nombre: 'Máquina Hack squat', grupo: 'Cuádriceps', equipo: 'Máquina', nivel: 'principiante' },
  { nombre: 'Step up con mancuernas', grupo: 'Cuádriceps', equipo: 'Mancuernas', nivel: 'principiante' },

  // ISQUIOTIBIALES
  { nombre: 'Peso muerto rumano con barra', grupo: 'Isquiotibiales', equipo: 'Barra', nivel: 'intermedio' },
  { nombre: 'Curl femoral en máquina tumbado', grupo: 'Isquiotibiales', equipo: 'Máquina', nivel: 'principiante' },
  { nombre: 'Curl femoral en máquina sentado', grupo: 'Isquiotibiales', equipo: 'Máquina', nivel: 'principiante' },
  { nombre: 'Peso muerto rumano con mancuernas', grupo: 'Isquiotibiales', equipo: 'Mancuernas', nivel: 'principiante' },
  { nombre: 'Good morning con barra', grupo: 'Isquiotibiales', equipo: 'Barra', nivel: 'avanzado' },
  { nombre: 'Peso muerto a una pierna con mancuerna', grupo: 'Isquiotibiales', equipo: 'Mancuernas', nivel: 'intermedio' },

  // GLÚTEOS
  { nombre: 'Hip thrust con barra', grupo: 'Glúteos', equipo: 'Barra', nivel: 'principiante' },
  { nombre: 'Hip thrust en máquina', grupo: 'Glúteos', equipo: 'Máquina', nivel: 'principiante' },
  { nombre: 'Sentadilla sumo con mancuerna', grupo: 'Glúteos', equipo: 'Mancuernas', nivel: 'principiante' },
  { nombre: 'Abducción de cadera en máquina', grupo: 'Glúteos', equipo: 'Máquina', nivel: 'principiante' },
  { nombre: 'Patada de glúteo en polea', grupo: 'Glúteos', equipo: 'Polea', nivel: 'principiante' },
  { nombre: 'Step up con énfasis en glúteo', grupo: 'Glúteos', equipo: 'Mancuernas', nivel: 'principiante' },
  { nombre: 'Sentadilla búlgara enfocada en glúteo', grupo: 'Glúteos', equipo: 'Mancuernas', nivel: 'intermedio' },

  // GEMELOS
  { nombre: 'Elevación de talones de pie en máquina', grupo: 'Gemelos', equipo: 'Máquina', nivel: 'principiante' },
  { nombre: 'Elevación de talones sentado en máquina', grupo: 'Gemelos', equipo: 'Máquina', nivel: 'principiante' },
  { nombre: 'Elevación de talones de pie con mancuernas', grupo: 'Gemelos', equipo: 'Mancuernas', nivel: 'principiante' },
  { nombre: 'Elevación de talones en prensa', grupo: 'Gemelos', equipo: 'Máquina', nivel: 'principiante' },

  // ABDOMEN
  { nombre: 'Crunch en polea alta', grupo: 'Abdomen', equipo: 'Polea', nivel: 'principiante' },
  { nombre: 'Elevación de piernas en barra', grupo: 'Abdomen', equipo: 'Barra', nivel: 'intermedio' },
  { nombre: 'Plancha', grupo: 'Abdomen', equipo: 'Peso corporal', nivel: 'principiante' },
  { nombre: 'Rueda abdominal', grupo: 'Abdomen', equipo: 'Rueda', nivel: 'intermedio' },
  { nombre: 'Crunch en banco declinado', grupo: 'Abdomen', equipo: 'Banco', nivel: 'principiante' },
  { nombre: 'Oblicuos en polea', grupo: 'Abdomen', equipo: 'Polea', nivel: 'principiante' },

  // CARDIO
  { nombre: 'Cinta de correr', grupo: 'Cardio', equipo: 'Máquina', nivel: 'principiante' },
  { nombre: 'Bicicleta estática', grupo: 'Cardio', equipo: 'Máquina', nivel: 'principiante' },
  { nombre: 'Elíptica', grupo: 'Cardio', equipo: 'Máquina', nivel: 'principiante' },
  { nombre: 'Remo ergómetro', grupo: 'Cardio', equipo: 'Máquina', nivel: 'principiante' },
  { nombre: 'HIIT en bicicleta', grupo: 'Cardio', equipo: 'Máquina', nivel: 'intermedio' },
  { nombre: 'Escaladora (StepMill)', grupo: 'Cardio', equipo: 'Máquina', nivel: 'principiante' },
]

const GRUPOS_MUSCULARES = ['Todos', 'Pecho', 'Espalda', 'Hombros', 'Bíceps', 'Tríceps', 'Cuádriceps', 'Isquiotibiales', 'Glúteos', 'Gemelos', 'Abdomen', 'Cardio']

const LIMITE_IA_MES = 40
function inicioDeMes() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString()
}
function fechaHoy() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ============================================================
// ESTILOS
// ============================================================
const s = {
  page: { minHeight: '100vh', background: '#0a0a0a', fontFamily: "'DM Sans', sans-serif", paddingBottom: 80, color: '#f0f0f0' },
  header: { background: '#111', borderBottom: '1px solid #222', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 },
  logo: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 2, color: '#f5e642' },
  backBtn: { background: 'none', border: '1px solid #222', color: '#888', borderRadius: 8, padding: '6px 14px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' },
  main: { maxWidth: 720, margin: '0 auto', padding: '20px 16px' },
  tabs: { display: 'flex', gap: 4, background: '#111', border: '1px solid #222', borderRadius: 12, padding: 6, marginBottom: 20 },
  tab: (a) => ({ flex: 1, padding: '10px 6px', background: a ? '#f5e642' : 'none', color: a ? '#000' : '#666', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center' }),
  btn: { background: '#f5e642', color: '#000', border: 'none', borderRadius: 8, padding: '12px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' },
  btnFull: { background: '#f5e642', color: '#000', border: 'none', borderRadius: 8, padding: '14px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', width: '100%' },
  btnSm: { background: '#1a1a1a', color: '#f5e642', border: '1px solid #f5e64240', borderRadius: 6, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 },
  btnDanger: { background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', border: '1px solid rgba(255,77,77,0.2)', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' },
  btnGhost: { background: 'none', color: '#888', border: '1px solid #222', borderRadius: 8, padding: '10px 16px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' },
  btnGreen: { background: '#4ade8020', color: '#4ade80', border: '1px solid #4ade8040', borderRadius: 8, padding: '14px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', width: '100%' },
  input: { width: '100%', background: '#0a0a0a', border: '1px solid #222', borderRadius: 8, padding: '10px 14px', color: '#f0f0f0', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' },
  label: { display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#555', marginBottom: 6, marginTop: 12 },
  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'flex-end' },
  modalContent: { background: '#111', width: '100%', maxHeight: '95vh', borderRadius: '16px 16px 0 0', overflowY: 'auto', padding: 20 },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #222' },
  modalTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 1, color: '#f0f0f0' },
  closeBtn: { background: 'none', border: 'none', color: '#888', fontSize: 24, cursor: 'pointer', padding: 4 },
  card: { background: '#111', border: '1px solid #222', borderRadius: 12, padding: 16, marginBottom: 12, cursor: 'pointer' },
  empty: { textAlign: 'center', color: '#444', padding: '60px 20px', fontSize: 14 },
  grupoPill: (sel) => ({ padding: '6px 14px', borderRadius: 20, border: `1px solid ${sel ? '#f5e642' : '#222'}`, background: sel ? 'rgba(245,230,66,0.1)' : 'transparent', color: sel ? '#f5e642' : '#666', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' }),
  ejercicioPill: (sel) => ({ padding: '8px 14px', borderRadius: 10, border: `1px solid ${sel ? '#4ade80' : '#222'}`, background: sel ? 'rgba(74,222,128,0.1)' : '#0d0d0d', color: sel ? '#4ade80' : '#888', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }),
  nivelBadge: (n) => ({ fontSize: 10, padding: '2px 7px', borderRadius: 4, fontWeight: 700, background: n === 'principiante' ? 'rgba(74,222,128,0.15)' : n === 'avanzado' ? 'rgba(255,77,77,0.15)' : 'rgba(245,230,66,0.15)', color: n === 'principiante' ? '#4ade80' : n === 'avanzado' ? '#ff4d4d' : '#f5e642' }),
  serieCard: { background: '#0d0d0d', border: '1px solid #222', borderRadius: 10, padding: 14, marginBottom: 10 },
  flechasRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 },
  flecha: { background: '#1a1a1a', border: '1px solid #f5e64240', borderRadius: 8, color: '#f5e642', fontSize: 18, width: 38, height: 38, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  flechaInput: { width: 70, background: '#0a0a0a', border: '1px solid #f5e642', borderRadius: 8, padding: '8px', color: '#f5e642', fontSize: 18, textAlign: 'center', outline: 'none', fontFamily: "'Bebas Neue', sans-serif", fontWeight: 700 },
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function MiEntrenamiento({ perfil }) {
  const navigate = useNavigate()
  const [tab, setTab] = useState('rutinas')

  // --- Estado Rutinas ---
  const [rutinas, setRutinas] = useState([])
  const [loadingRutinas, setLoadingRutinas] = useState(true)
  const [rutinaDetalle, setRutinaDetalle] = useState(null)
  const [diasRutina, setDiasRutina] = useState([])

  // --- Estado Generador IA ---
  const [modoIA, setModoIA] = useState(false)
  const [ejerciciosSeleccionados, setEjerciciosSeleccionados] = useState([])
  const [grupoFiltro, setGrupoFiltro] = useState('Todos')
  const [busqueda, setBusqueda] = useState('')
  const [diasSemana, setDiasSemana] = useState(4)
  const [objetivo, setObjetivo] = useState('hipertrofia')
  const [cardioMinutos, setCardioMinutos] = useState(0)
  const [generando, setGenerando] = useState(false)
  const [rutinaGenerada, setRutinaGenerada] = useState(null)
  const [usosIaMes, setUsosIaMes] = useState(0)
  const [guardandoRutina, setGuardandoRutina] = useState(false)

  // --- Estado Entrenar Hoy ---
  const [plan, setPlan] = useState(null)
  const [diasPlan, setDiasPlan] = useState([])
  const [diaSeleccionado, setDiaSeleccionado] = useState(null)
  const [ejerciciosDia, setEjerciciosDia] = useState([])
  const [registrosHoy, setRegistrosHoy] = useState({})
  const [ultimoRegistro, setUltimoRegistro] = useState({})
  const [ejActual, setEjActual] = useState(null)
  const [seriesEditando, setSeriesEditando] = useState([])
  const [msgGuardado, setMsgGuardado] = useState('')
  const [loadingPlan, setLoadingPlan] = useState(true)

  // --- Estado Progreso ---
  const [progresoEj, setProgresoEj] = useState(null)
  const [historialEj, setHistorialEj] = useState([])
  const [loadingHistorial, setLoadingHistorial] = useState(false)
  const [rutinaParaProgreso, setRutinaParaProgreso] = useState(null)
  const [diasParaProgreso, setDiasParaProgreso] = useState([])
  const [ejerciciosParaProgreso, setEjerciciosParaProgreso] = useState([])

  useEffect(() => {
    cargarRutinas()
    cargarUsosIa()
    cargarPlanEntrenamiento()
  }, [])

  // ============================================================
  // CARGA DE DATOS
  // ============================================================
  async function cargarUsosIa() {
    const { count } = await supabase.from('uso_ia').select('*', { count: 'exact', head: true })
      .eq('alumno_id', perfil.id).eq('tipo', 'entrenamiento').gte('created_at', inicioDeMes())
    setUsosIaMes(count || 0)
  }

  async function cargarRutinas() {
    setLoadingRutinas(true)
    const { data } = await supabase.from('rutinas').select('*').eq('alumno_id', perfil.id).order('created_at', { ascending: false })
    setRutinas(data || [])
    setLoadingRutinas(false)
  }

  async function cargarDiasRutina(rutinaId) {
    const { data } = await supabase.from('rutina_dias').select('*, rutina_ejercicios(*, ejercicios_catalogo(*))').eq('rutina_id', rutinaId).order('orden')
    setDiasRutina(data || [])
  }

  async function cargarPlanEntrenamiento() {
    setLoadingPlan(true)
    const { data: planData } = await supabase.from('planes_entrenamiento').select('*').eq('alumno_id', perfil.id).eq('activo', true).maybeSingle()
    setPlan(planData)
    if (planData) {
      const { data: diasData } = await supabase.from('plan_dias').select('*').eq('plan_id', planData.id).order('orden')
      setDiasPlan(diasData || [])
      if (diasData && diasData.length > 0) {
        const diaHoy = diasData[0]
        setDiaSeleccionado(diaHoy)
        cargarEjerciciosDia(diaHoy, perfil.id)
      }
    }
    setLoadingPlan(false)
  }

  async function cargarEjerciciosDia(dia, alumnoId) {
    if (!dia) return
    const { data: ejs } = await supabase.from('plan_ejercicios').select('*, ejercicios_catalogo(nombre, grupo_muscular, video_url)').eq('dia_id', dia.id).order('orden')
    setEjerciciosDia(ejs || [])
    const hoy = fechaHoy()
    const ids = (ejs || []).map(e => e.id)
    if (ids.length > 0) {
      const { data: regs } = await supabase.from('registros_series').select('*').eq('alumno_id', alumnoId).eq('fecha', hoy).in('plan_ejercicio_id', ids)
      const mapRegs = {}
      ;(regs || []).forEach(r => {
        if (!mapRegs[r.plan_ejercicio_id]) mapRegs[r.plan_ejercicio_id] = []
        mapRegs[r.plan_ejercicio_id].push(r)
      })
      Object.keys(mapRegs).forEach(k => mapRegs[k].sort((a, b) => a.numero_serie - b.numero_serie))
      setRegistrosHoy(mapRegs)
      const ultMap = {}
      for (const ej of ejs) {
        const { data: ult } = await supabase.from('registros_series').select('*').eq('alumno_id', alumnoId).eq('plan_ejercicio_id', ej.id).neq('fecha', hoy).order('fecha', { ascending: false }).limit(1)
        if (ult && ult[0]) ultMap[ej.id] = ult[0]
      }
      setUltimoRegistro(ultMap)
    }
  }

  async function cargarEjerciciosParaProgreso(rutinaId) {
    const { data: dias } = await supabase.from('rutina_dias').select('*, rutina_ejercicios(*, ejercicios_catalogo(*))').eq('rutina_id', rutinaId).order('orden')
    setDiasParaProgreso(dias || [])
    const todosEjs = (dias || []).flatMap(d => d.rutina_ejercicios || [])
    setEjerciciosParaProgreso(todosEjs)
  }

  async function cargarHistorialEjercicio(ejNombre) {
    setLoadingHistorial(true)
    setProgresoEj(ejNombre)
    const { data } = await supabase.from('registros_series').select('*').eq('alumno_id', perfil.id).order('fecha', { ascending: false }).limit(100)
    // filtrar por nombre buscando en plan_ejercicio_id (simplificado: traemos todo y filtramos)
    setHistorialEj(data || [])
    setLoadingHistorial(false)
  }

  // ============================================================
  // GENERADOR IA
  // ============================================================
  async function generarRutinaIA() {
    if (ejerciciosSeleccionados.length < 6) {
      alert('Seleccioná al menos 6 ejercicios para generar la rutina')
      return
    }
    if (usosIaMes >= LIMITE_IA_MES) {
      alert(`Límite de ${LIMITE_IA_MES} generaciones mensuales alcanzado.`)
      return
    }
    setGenerando(true)
    setRutinaGenerada(null)

    const listaEjercicios = ejerciciosSeleccionados.map(e => `"${e.nombre}" (${e.grupo})`).join(', ')
    const cardioTexto = cardioMinutos > 0 ? `Incluir ${cardioMinutos} minutos de cardio por sesión.` : 'Sin cardio.'

    const prompt = `Eres un entrenador experto en hipertrofia. Crea una rutina de gym de ${diasSemana} días por semana para objetivo: ${objetivo}. Usa SOLO estos ejercicios: ${listaEjercicios}. ${cardioTexto} Principios: series efectivas mínimas por grupo muscular (10-20 series semanales para hipertrofia), frecuencia 2x por grupo muscular si es posible, RIR entre 1-3, progresión de volumen. Responde SOLO JSON sin texto ni markdown: {"nombre":"Rutina ${diasSemana} días - ${objetivo}","dias":[{"nombre":"Día 1 - Pecho y Tríceps","ejercicios":[{"nombre":"Press banca plano con barra","series":4,"repeticiones":"8-10","rir":2,"notas":"Ejercicio principal, enfocate en la técnica"},{"nombre":"Press banca inclinado con mancuernas","series":3,"repeticiones":"10-12","rir":2,"notas":""}]}]}`

    try {
      const response = await fetch('https://zdmoxnapheaizbinxvqr.supabase.co/functions/v1/quick-responder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkbW94bmFwaGVhaXpiaW54dnFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NTI0NTgsImV4cCI6MjA2MDMyODQ1OH0.rnkDz4Lal4rFPiGnCOBSFh7-1wPxKJ5yoU-jLRVBkQE'
        },
        body: JSON.stringify({ prompt })
      })
      const data = await response.json()
      const texto = data.content?.[0]?.text || ''
      const clean = texto.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      setRutinaGenerada(parsed)
      try {
        await supabase.from('uso_ia').insert({ alumno_id: perfil.id, tipo: 'entrenamiento' })
        setUsosIaMes(prev => prev + 1)
      } catch (e) {}
    } catch (e) {
      alert('Error al generar la rutina. Intentá de nuevo.')
    }
    setGenerando(false)
  }

  async function guardarRutinaGenerada() {
    if (!rutinaGenerada) return
    setGuardandoRutina(true)
    const { data: nuevaRutina } = await supabase.from('rutinas').insert({
      alumno_id: perfil.id,
      nombre: rutinaGenerada.nombre,
      descripcion: `Generada por IA · ${diasSemana} días · ${objetivo}`
    }).select().single()

    if (nuevaRutina) {
      for (let i = 0; i < rutinaGenerada.dias.length; i++) {
        const dia = rutinaGenerada.dias[i]
        const { data: nuevoDia } = await supabase.from('rutina_dias').insert({
          rutina_id: nuevaRutina.id,
          nombre: dia.nombre,
          orden: i
        }).select().single()
        if (nuevoDia) {
          for (let j = 0; j < dia.ejercicios.length; j++) {
            const ej = dia.ejercicios[j]
            // Buscar en catálogo si existe
            const { data: ejCatalogo } = await supabase.from('ejercicios_catalogo').select('id').ilike('nombre', ej.nombre).maybeSingle()
            await supabase.from('rutina_ejercicios').insert({
              dia_id: nuevoDia.id,
              ejercicio_id: ejCatalogo?.id || null,
              nombre_libre: ejCatalogo ? null : ej.nombre,
              series: ej.series,
              repeticiones: ej.repeticiones,
              rir: ej.rir,
              notas: ej.notas || '',
              orden: j
            })
          }
        }
      }
      setRutinas(prev => [nuevaRutina, ...prev])
      setRutinaGenerada(null)
      setModoIA(false)
      setEjerciciosSeleccionados([])
      alert(`✅ "${nuevaRutina.nombre}" guardada!`)
    }
    setGuardandoRutina(false)
  }

  async function eliminarRutina(id) {
    if (!window.confirm('¿Eliminar esta rutina?')) return
    await supabase.from('rutinas').delete().eq('id', id)
    setRutinas(prev => prev.filter(r => r.id !== id))
    setRutinaDetalle(null)
  }

  // ============================================================
  // REGISTRAR SERIES
  // ============================================================
  function abrirEjercicio(ej) {
    setEjActual(ej)
    const yaRegistrados = registrosHoy[ej.id] || []
    if (yaRegistrados.length > 0) {
      setSeriesEditando(yaRegistrados.map(r => ({ numero_serie: r.numero_serie, reps: r.reps_hechas, peso: r.peso_kg, rir: r.rir, notas: r.notas || '' })))
    } else {
      const ult = ultimoRegistro[ej.id]
      const series = []
      for (let i = 1; i <= ej.series_planificadas; i++) {
        series.push({ numero_serie: i, reps: ult?.reps_hechas || parseInt(ej.reps_planificadas) || 10, peso: ult?.peso_kg || ej.peso_planificado_kg || 0, rir: ej.rir_planificado || 2, notas: '' })
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
    setSeriesEditando([...seriesEditando, { numero_serie: seriesEditando.length + 1, reps: ultima.reps, peso: ultima.peso, rir: ultima.rir, notas: '' }])
  }

  function eliminarSerie(idx) {
    const nuevas = seriesEditando.filter((_, i) => i !== idx)
    nuevas.forEach((s, i) => s.numero_serie = i + 1)
    setSeriesEditando(nuevas)
  }

  async function guardarEntrenamiento() {
    if (!ejActual || seriesEditando.length === 0) return
    const hoy = fechaHoy()
    await supabase.from('registros_series').delete().eq('alumno_id', perfil.id).eq('plan_ejercicio_id', ejActual.id).eq('fecha', hoy)
    await supabase.from('registros_series').insert(seriesEditando.map(s => ({
      alumno_id: perfil.id,
      plan_ejercicio_id: ejActual.id,
      fecha: hoy,
      numero_serie: s.numero_serie,
      reps_hechas: parseInt(s.reps) || 0,
      peso_kg: parseFloat(s.peso) || 0,
      rir: parseInt(s.rir) || 0,
      notas: s.notas
    })))
    setEjActual(null)
    setSeriesEditando([])
    setMsgGuardado('✓ Guardado')
    cargarEjerciciosDia(diaSeleccionado, perfil.id)
    setTimeout(() => setMsgGuardado(''), 2000)
  }

  // ============================================================
  // FILTROS
  // ============================================================
  const ejerciciosFiltrados = EJERCICIOS_GYM.filter(e =>
    (grupoFiltro === 'Todos' || e.grupo === grupoFiltro) &&
    e.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  function toggleEjercicio(ej) {
    setEjerciciosSeleccionados(prev =>
      prev.find(e => e.nombre === ej.nombre)
        ? prev.filter(e => e.nombre !== ej.nombre)
        : [...prev, ej]
    )
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={s.logo}>PELAFITNESS</div>
        <button style={s.backBtn} onClick={() => navigate('/')}>← Volver</button>
      </header>

      <main style={s.main}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, letterSpacing: 1 }}>Mi Entrenamiento</div>
          <div style={{ fontSize: 13, color: '#555' }}>Rutinas, registro y progreso</div>
        </div>

        <div style={s.tabs}>
          <button style={s.tab(tab === 'rutinas')} onClick={() => setTab('rutinas')}>💪 Rutinas</button>
          <button style={s.tab(tab === 'hoy')} onClick={() => setTab('hoy')}>🏋️ Hoy</button>
          <button style={s.tab(tab === 'progreso')} onClick={() => setTab('progreso')}>📈 Progreso</button>
        </div>

        {/* =================== TAB RUTINAS =================== */}
        {tab === 'rutinas' && !modoIA && !rutinaGenerada && (
          <>
            <button style={{ ...s.btnGreen, marginBottom: 12 }} onClick={() => setModoIA(true)}>🤖 Crear rutina con IA</button>
            <button style={{ ...s.btnFull, marginBottom: 16, background: '#1a1a1a', color: '#f5e642', border: '1px solid #f5e64240' }} onClick={() => alert('Función de rutina manual próximamente')}>+ Nueva rutina manual</button>

            {loadingRutinas ? <div style={s.empty}>Cargando...</div> : rutinas.length === 0 ? (
              <div style={s.empty}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🏋️</div>
                <div>Todavía no tenés rutinas.<br />Creá una con IA o manualmente.</div>
              </div>
            ) : rutinas.map(r => (
              <div key={r.id} style={s.card} onClick={() => { setRutinaDetalle(r); cargarDiasRutina(r.id) }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 1, color: '#f5e642' }}>{r.nombre}</div>
                    {r.descripcion && <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{r.descripcion}</div>}
                    <div style={{ fontSize: 11, color: '#444', marginTop: 4 }}>{new Date(r.created_at).toLocaleDateString('es-UY')}</div>
                  </div>
                  <div style={{ color: '#f5e642', fontSize: 20 }}>›</div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* =================== GENERADOR IA =================== */}
        {tab === 'rutinas' && modoIA && !rutinaGenerada && (
          <>
            <div style={{ marginBottom: 16 }}>
              <button style={s.btnGhost} onClick={() => { setModoIA(false); setEjerciciosSeleccionados([]) }}>← Volver</button>
            </div>

            <div style={{ background: 'rgba(245,230,66,0.05)', border: '1px solid #f5e64220', borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: '#f5e642', marginBottom: 6 }}>🤖 CREAR RUTINA CON IA</div>
              <div style={{ fontSize: 13, color: '#888', lineHeight: 1.6 }}>
                1. Elegí tus ejercicios favoritos<br />
                2. Configurá frecuencia y objetivo<br />
                3. La IA arma tu rutina con los principios correctos de hipertrofia
              </div>
            </div>

            <div style={{ background: 'rgba(245,230,66,0.08)', border: '1px solid #f5e64230', borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#999' }}>
                Generaciones disponibles este mes: <strong style={{ color: '#4ade80' }}>{Math.max(0, LIMITE_IA_MES - usosIaMes)}</strong> / {LIMITE_IA_MES}
              </div>
            </div>

            <label style={s.label}>Objetivo</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {['hipertrofia', 'fuerza', 'definición', 'principiante'].map(o => (
                <button key={o} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${objetivo === o ? '#f5e642' : '#222'}`, background: objetivo === o ? 'rgba(245,230,66,0.1)' : '#0d0d0d', color: objetivo === o ? '#f5e642' : '#888', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', fontWeight: objetivo === o ? 700 : 400, textTransform: 'capitalize' }} onClick={() => setObjetivo(o)}>{o}</button>
              ))}
            </div>

            <label style={s.label}>Días de entrenamiento por semana</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {[2, 3, 4, 5, 6].map(d => (
                <button key={d} style={{ flex: 1, padding: '10px 8px', borderRadius: 8, border: `1px solid ${diasSemana === d ? '#f5e642' : '#222'}`, background: diasSemana === d ? 'rgba(245,230,66,0.1)' : '#0d0d0d', color: diasSemana === d ? '#f5e642' : '#888', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => setDiasSemana(d)}>{d}</button>
              ))}
            </div>

            <label style={s.label}>Cardio por sesión (minutos)</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {[0, 15, 20, 30, 45].map(m => (
                <button key={m} style={{ padding: '8px 14px', borderRadius: 8, border: `1px solid ${cardioMinutos === m ? '#60a5fa' : '#222'}`, background: cardioMinutos === m ? 'rgba(96,165,250,0.1)' : '#0d0d0d', color: cardioMinutos === m ? '#60a5fa' : '#888', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', fontWeight: cardioMinutos === m ? 700 : 400 }} onClick={() => setCardioMinutos(m)}>{m === 0 ? 'Sin cardio' : `${m} min`}</button>
              ))}
            </div>

            <label style={s.label}>Elegí tus ejercicios ({ejerciciosSeleccionados.length} seleccionados)</label>
            <input style={{ ...s.input, marginBottom: 10 }} placeholder="🔍 Buscar ejercicio..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 10, marginBottom: 12 }}>
              {GRUPOS_MUSCULARES.map(g => (
                <button key={g} style={s.grupoPill(grupoFiltro === g)} onClick={() => setGrupoFiltro(g)}>{g}</button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
              {ejerciciosFiltrados.map(ej => {
                const sel = !!ejerciciosSeleccionados.find(e => e.nombre === ej.nombre)
                return (
                  <div key={ej.nombre} style={{ padding: '10px 14px', borderRadius: 10, border: `1px solid ${sel ? '#4ade80' : '#222'}`, background: sel ? 'rgba(74,222,128,0.08)' : '#0d0d0d', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => toggleEjercicio(ej)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 16 }}>{sel ? '✅' : '⬜'}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: sel ? '#4ade80' : '#f0f0f0' }}>{ej.nombre}</div>
                        <div style={{ fontSize: 11, color: '#555' }}>{ej.equipo}</div>
                      </div>
                    </div>
                    <span style={s.nivelBadge(ej.nivel)}>{ej.nivel}</span>
                  </div>
                )
              })}
            </div>

            {ejerciciosSeleccionados.length > 0 && (
              <div style={{ background: '#0d0d0d', border: '1px solid #222', borderRadius: 10, padding: 12, marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: '#555', marginBottom: 8 }}>SELECCIONADOS ({ejerciciosSeleccionados.length}):</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {ejerciciosSeleccionados.map(e => (
                    <span key={e.nombre} onClick={() => toggleEjercicio(e)} style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid #4ade8040', color: '#4ade80', fontSize: 12, padding: '3px 8px', borderRadius: 6, cursor: 'pointer' }}>
                      {e.nombre} ✕
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              style={{ ...s.btnFull, background: (generando || usosIaMes >= LIMITE_IA_MES || ejerciciosSeleccionados.length < 6) ? '#333' : '#f5e642', color: (generando || usosIaMes >= LIMITE_IA_MES || ejerciciosSeleccionados.length < 6) ? '#888' : '#000', fontSize: 16, padding: '16px' }}
              onClick={generarRutinaIA}
              disabled={generando || ejerciciosSeleccionados.length < 6 || usosIaMes >= LIMITE_IA_MES}
            >
              {generando ? '🤖 Generando tu rutina...' : `🤖 Generar rutina (${ejerciciosSeleccionados.length} ejercicios)`}
            </button>
            {ejerciciosSeleccionados.length < 6 && <div style={{ textAlign: 'center', fontSize: 12, color: '#555', marginTop: 8 }}>Seleccioná al menos 6 ejercicios</div>}
          </>
        )}

        {/* =================== RUTINA GENERADA =================== */}
        {tab === 'rutinas' && rutinaGenerada && (
          <>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: '#f5e642', marginBottom: 4 }}>✅ RUTINA GENERADA</div>
            <div style={{ fontSize: 13, color: '#555', marginBottom: 16 }}>{rutinaGenerada.nombre}</div>

            {rutinaGenerada.dias?.map((dia, i) => (
              <div key={i} style={{ background: '#111', border: '1px solid #222', borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', background: '#161616', borderBottom: '1px solid #222' }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 1, color: '#f5e642' }}>{dia.nombre}</div>
                  <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{dia.ejercicios?.length} ejercicios · {dia.ejercicios?.reduce((s, e) => s + e.series, 0)} series totales</div>
                </div>
                {dia.ejercicios?.map((ej, j) => (
                  <div key={j} style={{ padding: '10px 16px', borderBottom: '1px solid #111' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#f0f0f0', flex: 1 }}>{ej.nombre}</div>
                      <div style={{ fontSize: 12, color: '#f5e642', whiteSpace: 'nowrap', marginLeft: 8 }}>{ej.series}×{ej.repeticiones}</div>
                    </div>
                    <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>RIR {ej.rir}{ej.notas ? ` · ${ej.notas}` : ''}</div>
                  </div>
                ))}
              </div>
            ))}

            <button style={{ ...s.btnFull, background: '#f5e642', color: '#000', marginBottom: 10 }} onClick={guardarRutinaGenerada} disabled={guardandoRutina}>
              {guardandoRutina ? 'Guardando...' : '💾 Guardar esta rutina'}
            </button>
            <button style={{ ...s.btnGhost, width: '100%' }} onClick={() => setRutinaGenerada(null)}>← Generar otra</button>
          </>
        )}

        {/* =================== TAB HOY =================== */}
        {tab === 'hoy' && (
          <>
            {msgGuardado && (
              <div style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid #4ade8040', color: '#4ade80', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13 }}>
                {msgGuardado}
              </div>
            )}

            {loadingPlan ? (
              <div style={s.empty}>Cargando...</div>
            ) : !plan || diasPlan.length === 0 ? (
              <div style={s.empty}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🏋️</div>
                <div style={{ marginBottom: 16 }}>Tu coach todavía no armó tu plan de entrenamiento.<br />O podés crear una rutina con IA arriba.</div>
              </div>
            ) : (
              <>
                {/* Selector de días */}
                <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 10, marginBottom: 16 }}>
                  {diasPlan.map(dia => (
                    <button key={dia.id} style={{ background: diaSeleccionado?.id === dia.id ? '#f5e642' : '#1a1a1a', color: diaSeleccionado?.id === dia.id ? '#000' : '#888', border: 'none', borderRadius: 8, padding: '10px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }} onClick={() => { setDiaSeleccionado(dia); cargarEjerciciosDia(dia, perfil.id) }}>
                      {dia.nombre_dia}
                    </button>
                  ))}
                </div>

                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 1, color: '#f5e642', marginBottom: 4 }}>{diaSeleccionado?.nombre_dia}</div>
                <div style={{ fontSize: 13, color: '#555', marginBottom: 16 }}>{ejerciciosDia.length} ejercicios planificados</div>

                {ejerciciosDia.map(ej => {
                  const yaHecho = (registrosHoy[ej.id] || []).length > 0
                  return (
                    <div key={ej.id} style={{ background: '#111', border: `1px solid ${yaHecho ? '#4ade8040' : '#222'}`, borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
                      <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 1, color: '#f0f0f0', marginBottom: 4 }}>{ej.ejercicios_catalogo?.nombre}</div>
                          <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>{ej.ejercicios_catalogo?.grupo_muscular}</div>
                        </div>
                        {yaHecho && <span style={{ fontSize: 20 }}>✅</span>}
                      </div>
                      <div style={{ padding: '10px 16px', background: '#0d0d0d', borderTop: '1px solid #1a1a1a', fontSize: 13, color: '#999' }}>
                        📋 {ej.series_planificadas} series × {ej.reps_planificadas} reps · RIR {ej.rir_planificado}
                        {ej.peso_planificado_kg ? ` · ${ej.peso_planificado_kg}kg` : ''}
                      </div>
                      {ej.notas && <div style={{ padding: '8px 16px', fontSize: 12, color: '#888', fontStyle: 'italic', borderTop: '1px solid #1a1a1a' }}>📝 {ej.notas}</div>}
                      <button style={{ width: '100%', background: yaHecho ? 'rgba(74,222,128,0.15)' : '#f5e642', color: yaHecho ? '#4ade80' : '#000', border: 'none', padding: '14px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: 1 }} onClick={() => abrirEjercicio(ej)}>
                        {yaHecho ? '✓ Completado — Ver/Editar' : '✓ Registrar series'}
                      </button>
                    </div>
                  )
                })}
              </>
            )}
          </>
        )}

        {/* =================== TAB PROGRESO =================== */}
        {tab === 'progreso' && (
          <>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, letterSpacing: 1, marginBottom: 4 }}>📈 PROGRESO SEMANAL</div>
            <div style={{ fontSize: 13, color: '#555', marginBottom: 20 }}>Seguí la evolución de tus ejercicios</div>

            {rutinas.length === 0 ? (
              <div style={s.empty}>Creá una rutina primero para ver tu progreso.</div>
            ) : (
              <>
                {!rutinaParaProgreso ? (
                  <>
                    <label style={s.label}>Elegí una rutina</label>
                    {rutinas.map(r => (
                      <div key={r.id} style={s.card} onClick={() => { setRutinaParaProgreso(r); cargarEjerciciosParaProgreso(r.id) }}>
                        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: '#f5e642' }}>{r.nombre}</div>
                        {r.descripcion && <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{r.descripcion}</div>}
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                      <button style={s.btnGhost} onClick={() => { setRutinaParaProgreso(null); setProgresoEj(null); setHistorialEj([]) }}>← Volver</button>
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, color: '#f5e642' }}>{rutinaParaProgreso.nombre}</div>
                    </div>

                    {!progresoEj ? (
                      <>
                        <div style={{ fontSize: 13, color: '#888', marginBottom: 12 }}>Elegí un ejercicio para ver su historial:</div>
                        {diasParaProgreso.map(dia => (
                          <div key={dia.id} style={{ marginBottom: 16 }}>
                            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, color: '#555', letterSpacing: 1, marginBottom: 8 }}>{dia.nombre}</div>
                            {(dia.rutina_ejercicios || []).map(ej => (
                              <div key={ej.id} style={{ padding: '12px 14px', background: '#111', border: '1px solid #222', borderRadius: 10, marginBottom: 6, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => cargarHistorialEjercicio(ej.ejercicios_catalogo?.nombre || ej.nombre_libre)}>
                                <div>
                                  <div style={{ fontSize: 14, fontWeight: 600 }}>{ej.ejercicios_catalogo?.nombre || ej.nombre_libre}</div>
                                  <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{ej.series}×{ej.repeticiones} · RIR {ej.rir}</div>
                                </div>
                                <span style={{ color: '#f5e642', fontSize: 18 }}>›</span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </>
                    ) : (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                          <button style={s.btnGhost} onClick={() => { setProgresoEj(null); setHistorialEj([]) }}>← Volver</button>
                          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, color: '#f0f0f0' }}>{progresoEj}</div>
                        </div>

                        {loadingHistorial ? (
                          <div style={s.empty}>Cargando historial...</div>
                        ) : historialEj.length === 0 ? (
                          <div style={s.empty}>Todavía no tenés registros de este ejercicio.</div>
                        ) : (
                          <>
                            <div style={{ fontSize: 12, color: '#555', marginBottom: 12 }}>{historialEj.length} registros encontrados</div>
                            {historialEj.slice(0, 30).map((reg, i) => (
                              <div key={i} style={{ background: '#111', border: '1px solid #222', borderRadius: 10, padding: '12px 14px', marginBottom: 8 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                  <div style={{ fontSize: 12, color: '#555' }}>{reg.fecha} · Serie {reg.numero_serie}</div>
                                  <div style={{ fontSize: 11, background: 'rgba(74,222,128,0.1)', color: '#4ade80', padding: '2px 8px', borderRadius: 4 }}>RIR {reg.rir}</div>
                                </div>
                                <div style={{ display: 'flex', gap: 16 }}>
                                  <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: '#f5e642' }}>{reg.reps_hechas}</div>
                                    <div style={{ fontSize: 10, color: '#555' }}>REPS</div>
                                  </div>
                                  <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: '#60a5fa' }}>{reg.peso_kg}</div>
                                    <div style={{ fontSize: 10, color: '#555' }}>KG</div>
                                  </div>
                                  <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: '#f97316' }}>{Math.round(reg.reps_hechas * reg.peso_kg)}</div>
                                    <div style={{ fontSize: 10, color: '#555' }}>VOL</div>
                                  </div>
                                </div>
                                {reg.notas && <div style={{ fontSize: 11, color: '#666', fontStyle: 'italic', marginTop: 6 }}>📝 {reg.notas}</div>}
                              </div>
                            ))}
                          </>
                        )}
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* =================== MODAL DETALLE RUTINA =================== */}
      {rutinaDetalle && (
        <div style={s.modal} onClick={() => setRutinaDetalle(null)}>
          <div style={{ ...s.modalContent, maxHeight: '95vh' }} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div>
                <div style={s.modalTitle}>{rutinaDetalle.nombre}</div>
                {rutinaDetalle.descripcion && <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{rutinaDetalle.descripcion}</div>}
              </div>
              <button style={s.closeBtn} onClick={() => setRutinaDetalle(null)}>✕</button>
            </div>

            {diasRutina.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#444', padding: '30px 0', fontSize: 13 }}>Cargando días...</div>
            ) : diasRutina.map(dia => (
              <div key={dia.id} style={{ background: '#0d0d0d', border: '1px solid #222', borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', background: '#161616', borderBottom: '1px solid #222' }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 1, color: '#f5e642' }}>{dia.nombre}</div>
                  <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{dia.rutina_ejercicios?.length} ejercicios</div>
                </div>
                {(dia.rutina_ejercicios || []).map(ej => (
                  <div key={ej.id} style={{ padding: '10px 16px', borderBottom: '1px solid #111' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#f0f0f0' }}>{ej.ejercicios_catalogo?.nombre || ej.nombre_libre}</div>
                      <div style={{ fontSize: 12, color: '#f5e642', whiteSpace: 'nowrap', marginLeft: 8 }}>{ej.series}×{ej.repeticiones}</div>
                    </div>
                    <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>RIR {ej.rir}{ej.notas ? ` · ${ej.notas}` : ''}</div>
                  </div>
                ))}
              </div>
            ))}

            <button style={{ background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', border: '1px solid rgba(255,77,77,0.2)', borderRadius: 8, padding: '12px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', width: '100%', marginTop: 8 }} onClick={() => eliminarRutina(rutinaDetalle.id)}>
              Eliminar Rutina
            </button>
          </div>
        </div>
      )}

      {/* =================== MODAL REGISTRAR SERIES =================== */}
      {ejActual && (
        <div style={s.modal} onClick={() => setEjActual(null)}>
          <div style={s.modalContent} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div>
                <div style={s.modalTitle}>{ejActual.ejercicios_catalogo?.nombre}</div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                  Planificado: {ejActual.series_planificadas}×{ejActual.reps_planificadas} · RIR {ejActual.rir_planificado}
                  {ejActual.peso_planificado_kg ? ` · ${ejActual.peso_planificado_kg}kg` : ''}
                </div>
              </div>
              <button style={s.closeBtn} onClick={() => setEjActual(null)}>✕</button>
            </div>

            {ultimoRegistro[ejActual.id] && (
              <div style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid #4ade8030', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#4ade80' }}>
                💡 Último: {ultimoRegistro[ejActual.id].reps_hechas} reps × {ultimoRegistro[ejActual.id].peso_kg}kg (RIR {ultimoRegistro[ejActual.id].rir})
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
                  <div style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, textAlign: 'center', fontWeight: 700 }}>RIR (Reps in Reserve)</div>
                  <div style={s.flechasRow}>
                    <button style={s.flecha} onClick={() => ajustarValor(idx, 'rir', -1)}>◀</button>
                    <input type="number" style={s.flechaInput} value={serie.rir} onChange={e => actualizarSerie(idx, 'rir', e.target.value)} />
                    <button style={s.flecha} onClick={() => ajustarValor(idx, 'rir', 1)}>▶</button>
                  </div>
                </div>

                <input style={{ ...s.input, fontSize: 12, marginTop: 8 }} placeholder="Notas opcionales (ej: tempo lento, pausa...)" value={serie.notas} onChange={e => actualizarSerie(idx, 'notas', e.target.value)} />

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

            <button style={{ ...s.btnFull, background: '#f5e642', color: '#000' }} onClick={guardarEntrenamiento}>
              💾 Guardar entrenamiento
            </button>
          </div>
        </div>
      )}

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&display=swap');`}</style>
    </div>
  )
}
