import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const MOMENTOS = ['Desayuno', 'Almuerzo', 'Merienda', 'Cena', 'Pre-entreno', 'Post-entreno', 'Colación']

const ALIMENTOS_RAPIDOS = [
  // Proteínas
  { nombre: 'Pechuga de pollo', calorias: 165, proteinas: 31, carbohidratos: 0, grasas: 4, categoria: '🍗 Proteínas' },
  { nombre: 'Carne magra de vaca', calorias: 180, proteinas: 28, carbohidratos: 0, grasas: 7, categoria: '🍗 Proteínas' },
  { nombre: 'Atún en lata', calorias: 116, proteinas: 26, carbohidratos: 0, grasas: 1, categoria: '🍗 Proteínas' },
  { nombre: 'Salmón', calorias: 208, proteinas: 20, carbohidratos: 0, grasas: 13, categoria: '🍗 Proteínas' },
  { nombre: 'Huevo entero', calorias: 155, proteinas: 13, carbohidratos: 1, grasas: 11, categoria: '🍗 Proteínas' },
  { nombre: 'Clara de huevo', calorias: 52, proteinas: 11, carbohidratos: 1, grasas: 0, categoria: '🍗 Proteínas' },
  { nombre: 'Yogur griego natural', calorias: 59, proteinas: 10, carbohidratos: 4, grasas: 0, categoria: '🍗 Proteínas' },
  { nombre: 'Queso cottage', calorias: 98, proteinas: 11, carbohidratos: 3, grasas: 4, categoria: '🍗 Proteínas' },
  { nombre: 'Carne de cerdo magra', calorias: 143, proteinas: 26, carbohidratos: 0, grasas: 4, categoria: '🍗 Proteínas' },
  { nombre: 'Merluza', calorias: 82, proteinas: 18, carbohidratos: 0, grasas: 1, categoria: '🍗 Proteínas' },
  { nombre: 'Lentejas', calorias: 116, proteinas: 9, carbohidratos: 20, grasas: 0, categoria: '🍗 Proteínas' },
  { nombre: 'Garbanzos', calorias: 164, proteinas: 9, carbohidratos: 27, grasas: 3, categoria: '🍗 Proteínas' },
  // Carbohidratos
  { nombre: 'Arroz blanco', calorias: 130, proteinas: 3, carbohidratos: 28, grasas: 0, categoria: '🌾 Carbohidratos' },
  { nombre: 'Arroz integral', calorias: 111, proteinas: 3, carbohidratos: 23, grasas: 1, categoria: '🌾 Carbohidratos' },
  { nombre: 'Avena', calorias: 389, proteinas: 17, carbohidratos: 66, grasas: 7, categoria: '🌾 Carbohidratos' },
  { nombre: 'Papa', calorias: 77, proteinas: 2, carbohidratos: 17, grasas: 0, categoria: '🌾 Carbohidratos' },
  { nombre: 'Batata', calorias: 86, proteinas: 2, carbohidratos: 20, grasas: 0, categoria: '🌾 Carbohidratos' },
  { nombre: 'Pan integral', calorias: 247, proteinas: 13, carbohidratos: 41, grasas: 4, categoria: '🌾 Carbohidratos' },
  { nombre: 'Quinoa', calorias: 120, proteinas: 4, carbohidratos: 21, grasas: 2, categoria: '🌾 Carbohidratos' },
  { nombre: 'Banana', calorias: 89, proteinas: 1, carbohidratos: 23, grasas: 0, categoria: '🌾 Carbohidratos' },
  { nombre: 'Manzana', calorias: 52, proteinas: 0, carbohidratos: 14, grasas: 0, categoria: '🌾 Carbohidratos' },
  { nombre: 'Fideos integrales', calorias: 124, proteinas: 5, carbohidratos: 25, grasas: 1, categoria: '🌾 Carbohidratos' },
  // Grasas
  { nombre: 'Palta', calorias: 160, proteinas: 2, carbohidratos: 9, grasas: 15, categoria: '🥑 Grasas' },
  { nombre: 'Aceite de oliva', calorias: 884, proteinas: 0, carbohidratos: 0, grasas: 100, categoria: '🥑 Grasas' },
  { nombre: 'Almendras', calorias: 579, proteinas: 21, carbohidratos: 22, grasas: 50, categoria: '🥑 Grasas' },
  { nombre: 'Nueces', calorias: 654, proteinas: 15, carbohidratos: 14, grasas: 65, categoria: '🥑 Grasas' },
  { nombre: 'Manteca de maní', calorias: 588, proteinas: 25, carbohidratos: 20, grasas: 50, categoria: '🥑 Grasas' },
  // Vegetales
  { nombre: 'Brócoli', calorias: 34, proteinas: 3, carbohidratos: 7, grasas: 0, categoria: '🥦 Vegetales' },
  { nombre: 'Espinaca', calorias: 23, proteinas: 3, carbohidratos: 4, grasas: 0, categoria: '🥦 Vegetales' },
  { nombre: 'Tomate', calorias: 18, proteinas: 1, carbohidratos: 4, grasas: 0, categoria: '🥦 Vegetales' },
  { nombre: 'Zanahoria', calorias: 41, proteinas: 1, carbohidratos: 10, grasas: 0, categoria: '🥦 Vegetales' },
  { nombre: 'Calabaza', calorias: 26, proteinas: 1, carbohidratos: 7, grasas: 0, categoria: '🥦 Vegetales' },
  { nombre: 'Lechuga', calorias: 15, proteinas: 1, carbohidratos: 3, grasas: 0, categoria: '🥦 Vegetales' },
  { nombre: 'Pepino', calorias: 15, proteinas: 1, carbohidratos: 4, grasas: 0, categoria: '🥦 Vegetales' },
]

const CATEGORIAS = ['Todos', '🍗 Proteínas', '🌾 Carbohidratos', '🥑 Grasas', '🥦 Vegetales']

const s = {
  page: { minHeight: '100vh', background: '#0a0a0a', fontFamily: "'DM Sans', sans-serif", paddingBottom: 80, color: '#f0f0f0' },
  header: { background: '#111', borderBottom: '1px solid #222', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 },
  logo: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 2, color: '#f5e642' },
  backBtn: { background: 'none', border: '1px solid #222', color: '#888', borderRadius: 8, padding: '6px 14px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' },
  main: { maxWidth: 720, margin: '0 auto', padding: '20px 16px' },
  tabs: { display: 'flex', gap: 4, background: '#111', border: '1px solid #222', borderRadius: 12, padding: 6, marginBottom: 20 },
  tab: (a) => ({ flex: 1, padding: '10px 8px', background: a ? '#f5e642' : 'none', color: a ? '#000' : '#666', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center' }),
  btn: { background: '#f5e642', color: '#000', border: 'none', borderRadius: 8, padding: '12px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' },
  btnFull: { background: '#f5e642', color: '#000', border: 'none', borderRadius: 8, padding: '14px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', width: '100%' },
  btnSm: { background: '#1a1a1a', color: '#f5e642', border: '1px solid #f5e64240', borderRadius: 6, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 },
  btnDanger: { background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', border: '1px solid rgba(255,77,77,0.2)', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' },
  btnGhost: { background: 'none', color: '#888', border: '1px solid #222', borderRadius: 8, padding: '10px 16px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' },
  btnGreen: { background: '#4ade8020', color: '#4ade80', border: '1px solid #4ade8040', borderRadius: 8, padding: '14px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', width: '100%' },
  input: { width: '100%', background: '#0a0a0a', border: '1px solid #222', borderRadius: 8, padding: '10px 14px', color: '#f0f0f0', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' },
  label: { display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#555', marginBottom: 6, marginTop: 12 },
  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'flex-end' },
  modalContent: { background: '#111', width: '100%', maxHeight: '92vh', borderRadius: '16px 16px 0 0', overflowY: 'auto', padding: 20 },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #222' },
  modalTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 1, color: '#f0f0f0' },
  closeBtn: { background: 'none', border: 'none', color: '#888', fontSize: 24, cursor: 'pointer', padding: 4 },
  card: { background: '#111', border: '1px solid #222', borderRadius: 12, padding: 16, marginBottom: 12, cursor: 'pointer' },
  empty: { textAlign: 'center', color: '#444', padding: '60px 20px', fontSize: 14 },
  alimentoPill: (sel) => ({ padding: '8px 14px', borderRadius: 10, border: `1px solid ${sel ? '#4ade80' : '#222'}`, background: sel ? 'rgba(74,222,128,0.1)' : '#0d0d0d', color: sel ? '#4ade80' : '#888', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }),
  categoriaPill: (sel) => ({ padding: '6px 14px', borderRadius: 20, border: `1px solid ${sel ? '#f5e642' : '#222'}`, background: sel ? 'rgba(245,230,66,0.1)' : 'transparent', color: sel ? '#f5e642' : '#666', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' }),
}

function calcTotales(comidas) {
  return (comidas || []).reduce((acc, comida) => {
    ;(comida.plan_comida_items || comida.items || []).forEach(item => {
      acc.calorias += item.calorias || 0
      acc.proteinas += item.proteinas || 0
      acc.carbohidratos += item.carbohidratos || 0
      acc.grasas += item.grasas || 0
    })
    return acc
  }, { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 })
}

export default function MiPlanAlimentacion({ perfil }) {
  const navigate = useNavigate()
  const [tab, setTab] = useState('planes') // 'planes' | 'generar'
  const [planes, setPlanes] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Generador IA
  const [alimentosSeleccionados, setAlimentosSeleccionados] = useState([])
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todos')
  const [caloriasObjetivo, setCaloriasObjetivo] = useState('')
  const [objetivo, setObjetivo] = useState('bajar de grasa')
  const [generando, setGenerando] = useState(false)
  const [planesGenerados, setPlanesGenerados] = useState([])
  const [planGeneradoDetalle, setPlanGeneradoDetalle] = useState(null)
  const [guardandoPlan, setGuardandoPlan] = useState(false)

  // Planes manuales
  const [modalDetalle, setModalDetalle] = useState(null)
  const [comidasPlan, setComidasPlan] = useState([])
  const [modalAgregarComida, setModalAgregarComida] = useState(false)
  const [modalAgregarAlimento, setModalAgregarAlimento] = useState(null)
  const [nuevaComidaMomento, setNuevaComidaMomento] = useState('Desayuno')
  const [busqueda, setBusqueda] = useState('')
  const [alimentoSeleccionado, setAlimentoSeleccionado] = useState(null)
  const [gramosInput, setGramosInput] = useState(100)
  const [modoManual, setModoManual] = useState(false)
  const [alimentoForm, setAlimentoForm] = useState({ nombre: '', calorias: '', proteinas: '', carbohidratos: '', grasas: '', cantidad_gramos: 100 })
  const [modalNuevoPlan, setModalNuevoPlan] = useState(false)
  const [nuevoPlanForm, setNuevoPlanForm] = useState({ nombre: '', descripcion: '', calorias_objetivo: '' })

  useEffect(() => { cargarPlanes() }, [])

  async function cargarPlanes() {
    setLoading(true)
    const { data } = await supabase.from('planes_alimentacion').select('*').eq('alumno_id', perfil.id).order('created_at', { ascending: false })
    setPlanes(data || [])
    setLoading(false)
  }

  async function cargarComidasPlan(planId) {
    const { data } = await supabase.from('plan_comidas').select('*, plan_comida_items(*)').eq('plan_id', planId).order('orden')
    setComidasPlan(data || [])
  }

  function toggleAlimento(alimento) {
    setAlimentosSeleccionados(prev =>
      prev.find(a => a.nombre === alimento.nombre)
        ? prev.filter(a => a.nombre !== alimento.nombre)
        : [...prev, alimento]
    )
  }

  async function generarPlanesIA() {
    if (alimentosSeleccionados.length < 5) {
      alert('Seleccioná al menos 5 alimentos para generar los planes')
      return
    }
    setGenerando(true)
    setPlanesGenerados([])

    const calorias = caloriasObjetivo || 2000
    const listaAlimentos = alimentosSeleccionados.map(a => `${a.nombre} (${a.calorias}kcal/100g, P:${a.proteinas}g C:${a.carbohidratos}g G:${a.grasas}g)`).join(', ')

    const prompt = 'Eres nutricionista deportivo. Crea 7 planes de comida diaria DIFERENTES usando SOLO estos alimentos: ' + listaAlimentos + '. Objetivo: ' + objetivo + '. ' + calorias + ' kcal por dia. Cada plan tiene 4 comidas: Desayuno, Almuerzo, Merienda, Cena. Reglas: 1) Desayuno con alimentos tipicos de desayuno (avena, huevos, yogur, frutas). 2) Almuerzo y Cena con proteina + carbo + vegetal. 3) Merienda liviana. 4) Los macros de cada item deben ser correctos segun gramos: si el alimento tiene X kcal/100g y usas Y gramos, calorias = X*Y/100. 5) NO pongas salmon ni carne de desayuno. 6) NO incluyas los campos calorias_total, proteinas_total, carbohidratos_total, grasas_total. Responde SOLO JSON valido sin texto ni markdown: {"planes":[{"nombre":"Plan Dia 1","comidas":[{"momento":"Desayuno","items":[{"nombre":"Avena","cantidad_gramos":80,"calorias":311,"proteinas":14,"carbohidratos":53,"grasas":6},{"nombre":"Huevo entero","cantidad_gramos":100,"calorias":155,"proteinas":13,"carbohidratos":1,"grasas":11}]},{"momento":"Almuerzo","items":[{"nombre":"Pechuga de pollo","cantidad_gramos":200,"calorias":330,"proteinas":62,"carbohidratos":0,"grasas":8}]},{"momento":"Merienda","items":[{"nombre":"Yogur griego natural","cantidad_gramos":200,"calorias":118,"proteinas":20,"carbohidratos":8,"grasas":0}]},{"momento":"Cena","items":[{"nombre":"Salmon","cantidad_gramos":150,"calorias":312,"proteinas":30,"carbohidratos":0,"grasas":20}]}]}]}'

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
      setPlanesGenerados(parsed.planes || [])
    } catch (e) {
      alert('Error al generar los planes. Intentá de nuevo.')
    }
    setGenerando(false)
  }

  async function guardarPlanGenerado(plan) {
    setGuardandoPlan(true)
    const { data: nuevoPlan } = await supabase.from('planes_alimentacion').insert({
      alumno_id: perfil.id,
      nombre: plan.nombre,
      descripcion: `Generado por IA · Objetivo: ${objetivo}`,
      calorias_objetivo: plan.calorias_total
    }).select().single()

    if (nuevoPlan) {
      for (let i = 0; i < plan.comidas.length; i++) {
        const comida = plan.comidas[i]
        const { data: nuevaComida } = await supabase.from('plan_comidas').insert({
          plan_id: nuevoPlan.id,
          momento: comida.momento,
          orden: i
        }).select().single()
        if (nuevaComida) {
          for (let j = 0; j < comida.items.length; j++) {
            await supabase.from('plan_comida_items').insert({
              comida_id: nuevaComida.id,
              ...comida.items[j],
              orden: j
            })
          }
        }
      }
      setPlanes(prev => [nuevoPlan, ...prev])
      setTab('planes')
      setPlanGeneradoDetalle(null)
      alert(`✅ "${plan.nombre}" guardado en tus planes!`)
    }
    setGuardandoPlan(false)
  }

  async function crearPlan() {
    if (!nuevoPlanForm.nombre.trim()) return
    setSaving(true)
    const { data } = await supabase.from('planes_alimentacion').insert({ ...nuevoPlanForm, alumno_id: perfil.id, calorias_objetivo: parseInt(nuevoPlanForm.calorias_objetivo) || null }).select().single()
    if (data) {
      setPlanes(prev => [data, ...prev])
      setModalNuevoPlan(false)
      setNuevoPlanForm({ nombre: '', descripcion: '', calorias_objetivo: '' })
      setModalDetalle(data)
      setComidasPlan([])
    }
    setSaving(false)
  }

  async function eliminarPlan(id) {
    if (!window.confirm('¿Eliminar este plan?')) return
    await supabase.from('planes_alimentacion').delete().eq('id', id)
    setPlanes(prev => prev.filter(p => p.id !== id))
    setModalDetalle(null)
  }

  async function agregarComida() {
    if (!modalDetalle) return
    setSaving(true)
    const { data } = await supabase.from('plan_comidas').insert({ plan_id: modalDetalle.id, momento: nuevaComidaMomento, orden: comidasPlan.length }).select().single()
    if (data) {
      setComidasPlan(prev => [...prev, { ...data, plan_comida_items: [] }])
      setModalAgregarComida(false)
    }
    setSaving(false)
  }

  async function eliminarComida(comidaId) {
    await supabase.from('plan_comidas').delete().eq('id', comidaId)
    setComidasPlan(prev => prev.filter(c => c.id !== comidaId))
  }

  async function agregarAlimentoAComida() {
    if (!modalAgregarAlimento) return
    setSaving(true)
    let item
    if (modoManual) {
      item = { comida_id: modalAgregarAlimento.id, nombre: alimentoForm.nombre, cantidad_gramos: parseInt(alimentoForm.cantidad_gramos) || 100, calorias: parseInt(alimentoForm.calorias) || 0, proteinas: parseFloat(alimentoForm.proteinas) || 0, carbohidratos: parseFloat(alimentoForm.carbohidratos) || 0, grasas: parseFloat(alimentoForm.grasas) || 0, orden: modalAgregarAlimento.plan_comida_items?.length || 0 }
    } else {
      const factor = gramosInput / 100
      item = { comida_id: modalAgregarAlimento.id, nombre: alimentoSeleccionado.nombre, cantidad_gramos: gramosInput, calorias: Math.round((alimentoSeleccionado.calorias || 0) * factor), proteinas: Math.round((alimentoSeleccionado.proteinas || 0) * factor * 10) / 10, carbohidratos: Math.round((alimentoSeleccionado.carbohidratos || 0) * factor * 10) / 10, grasas: Math.round((alimentoSeleccionado.grasas || 0) * factor * 10) / 10, orden: modalAgregarAlimento.plan_comida_items?.length || 0 }
    }
    const { data } = await supabase.from('plan_comida_items').insert(item).select().single()
    if (data) {
      setComidasPlan(prev => prev.map(c => c.id === modalAgregarAlimento.id ? { ...c, plan_comida_items: [...(c.plan_comida_items || []), data] } : c))
      setAlimentoSeleccionado(null); setBusqueda(''); setModoManual(false)
      setAlimentoForm({ nombre: '', calorias: '', proteinas: '', carbohidratos: '', grasas: '', cantidad_gramos: 100 })
      setModalAgregarAlimento(null)
    }
    setSaving(false)
  }

  async function eliminarAlimento(comidaId, itemId) {
    await supabase.from('plan_comida_items').delete().eq('id', itemId)
    setComidasPlan(prev => prev.map(c => c.id === comidaId ? { ...c, plan_comida_items: c.plan_comida_items.filter(i => i.id !== itemId) } : c))
  }

  const alimentosFiltrados = ALIMENTOS_RAPIDOS.filter(a =>
    (categoriaFiltro === 'Todos' || a.categoria === categoriaFiltro) &&
    a.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  const totales = calcTotales(comidasPlan)

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={s.logo}>PELAFITNESS</div>
        <button style={s.backBtn} onClick={() => navigate('/')}>← Volver</button>
      </header>

      <main style={s.main}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, letterSpacing: 1 }}>Mi Alimentación</div>
          <div style={{ fontSize: 13, color: '#555' }}>Planes de comidas personalizados</div>
        </div>

        <div style={s.tabs}>
          <button style={s.tab(tab === 'planes')} onClick={() => setTab('planes')}>🥗 Mis Planes</button>
          <button style={s.tab(tab === 'generar')} onClick={() => setTab('generar')}>🤖 Generar con IA</button>
        </div>

        {/* TAB MIS PLANES */}
        {tab === 'planes' && (
          <>
            <button style={{ ...s.btnFull, marginBottom: 16 }} onClick={() => setModalNuevoPlan(true)}>+ Nuevo Plan Manual</button>
            <button style={{ ...s.btnGreen, marginBottom: 16 }} onClick={() => setTab('generar')}>🤖 Generar 7 planes con IA</button>

            {loading ? <div style={s.empty}>Cargando...</div> : planes.length === 0 ? (
              <div style={s.empty}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🥗</div>
                <div>Todavía no tenés planes.<br />Creá uno manual o generá 7 con IA.</div>
              </div>
            ) : planes.map(p => (
              <div key={p.id} style={s.card} onClick={() => { setModalDetalle(p); cargarComidasPlan(p.id) }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 1, color: '#4ade80' }}>{p.nombre}</div>
                    {p.descripcion && <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{p.descripcion}</div>}
                    {p.calorias_objetivo && <div style={{ fontSize: 12, color: '#f5e642', marginTop: 4 }}>🎯 {p.calorias_objetivo} kcal</div>}
                  </div>
                  <div style={{ color: '#4ade80', fontSize: 20 }}>›</div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* TAB GENERAR CON IA */}
        {tab === 'generar' && (
          <>
            {planesGenerados.length === 0 ? (
              <>
                {/* Info */}
                <div style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid #4ade8020', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: '#4ade80', marginBottom: 6 }}>¿CÓMO FUNCIONA?</div>
                  <div style={{ fontSize: 13, color: '#888', lineHeight: 1.6 }}>
                    1. Seleccioná los alimentos que te gustan<br />
                    2. Poné tus calorías objetivo<br />
                    3. La IA te arma 7 planes de comida diferentes<br />
                    4. Guardá los que más te gusten
                  </div>
                </div>

                {/* Objetivo */}
                <label style={s.label}>Tu objetivo</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                  {['bajar de grasa', 'mantener peso', 'ganar músculo'].map(o => (
                    <button key={o} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${objetivo === o ? '#f5e642' : '#222'}`, background: objetivo === o ? 'rgba(245,230,66,0.1)' : '#0d0d0d', color: objetivo === o ? '#f5e642' : '#888', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', fontWeight: objetivo === o ? 700 : 400, textTransform: 'capitalize' }} onClick={() => setObjetivo(o)}>{o}</button>
                  ))}
                </div>

                <label style={s.label}>Calorías objetivo por día</label>
                <input style={{ ...s.input, marginBottom: 16 }} type="number" placeholder="Ej: 2000" value={caloriasObjetivo} onChange={e => setCaloriasObjetivo(e.target.value)} />

                {/* Selección alimentos */}
                <label style={s.label}>Seleccioná tus alimentos ({alimentosSeleccionados.length} seleccionados)</label>
                <input style={{ ...s.input, marginBottom: 10 }} placeholder="🔍 Buscar alimento..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 10, marginBottom: 12 }}>
                  {CATEGORIAS.map(c => (
                    <button key={c} style={s.categoriaPill(categoriaFiltro === c)} onClick={() => setCategoriaFiltro(c)}>{c}</button>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
                  {alimentosFiltrados.map(a => {
                    const sel = !!alimentosSeleccionados.find(x => x.nombre === a.nombre)
                    return (
                      <button key={a.nombre} style={s.alimentoPill(sel)} onClick={() => toggleAlimento(a)}>
                        <span style={{ fontSize: 16 }}>{sel ? '✅' : '⬜'}</span>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: sel ? '#4ade80' : '#f0f0f0' }}>{a.nombre}</div>
                          <div style={{ fontSize: 10, color: '#555' }}>{a.calorias} kcal/100g</div>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {alimentosSeleccionados.length > 0 && (
                  <div style={{ background: '#0d0d0d', border: '1px solid #222', borderRadius: 10, padding: 12, marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: '#555', marginBottom: 8 }}>SELECCIONADOS:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {alimentosSeleccionados.map(a => (
                        <span key={a.nombre} style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid #4ade8040', color: '#4ade80', fontSize: 12, padding: '3px 8px', borderRadius: 6 }}>
                          {a.nombre} ✕
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  style={{ ...s.btnFull, background: generando ? '#333' : '#4ade80', color: generando ? '#888' : '#000', fontSize: 16, padding: '16px' }}
                  onClick={generarPlanesIA}
                  disabled={generando || alimentosSeleccionados.length < 5}
                >
                  {generando ? '🤖 Generando tus 7 planes...' : `🤖 Generar 7 planes (${alimentosSeleccionados.length} alimentos)`}
                </button>
                {alimentosSeleccionados.length < 5 && <div style={{ textAlign: 'center', fontSize: 12, color: '#555', marginTop: 8 }}>Seleccioná al menos 5 alimentos</div>}
              </>
            ) : (
              <>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: '#4ade80', marginBottom: 4 }}>🎉 7 PLANES GENERADOS!</div>
                <div style={{ fontSize: 13, color: '#555', marginBottom: 20 }}>Tocá cada plan para verlo en detalle y guardarlo.</div>

                {planesGenerados.map((plan, i) => {
                  const todosItems = plan.comidas?.flatMap(c => c.items) || []
                  const tCal = Math.round(todosItems.reduce((s, i) => s + (i.calorias || 0), 0))
                  const tP = Math.round(todosItems.reduce((s, i) => s + (i.proteinas || 0), 0))
                  const tC = Math.round(todosItems.reduce((s, i) => s + (i.carbohidratos || 0), 0))
                  const tG = Math.round(todosItems.reduce((s, i) => s + (i.grasas || 0), 0))
                  return (
                    <div key={i} style={s.card} onClick={() => setPlanGeneradoDetalle(plan)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: '#4ade80' }}>{plan.nombre}</div>
                          <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>{plan.comidas?.length} comidas · {tCal} kcal</div>
                          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                            {[{ l: 'P', v: tP, c: '#60a5fa' }, { l: 'C', v: tC, c: '#f97316' }, { l: 'G', v: tG, c: '#facc15' }].map(m => (
                              <span key={m.l} style={{ fontSize: 12, color: m.c, fontWeight: 700 }}>{m.l}: {m.v}g</span>
                            ))}
                          </div>
                        </div>
                        <div style={{ color: '#4ade80', fontSize: 20 }}>›</div>
                      </div>
                    </div>
                  )
                })}

                <button style={{ ...s.btnGhost, width: '100%', marginTop: 8 }} onClick={() => setPlanesGenerados([])}>← Generar de nuevo</button>
              </>
            )}
          </>
        )}
      </main>

      {/* MODAL DETALLE PLAN GENERADO */}
      {planGeneradoDetalle && (
        <div style={s.modal} onClick={() => setPlanGeneradoDetalle(null)}>
          <div style={{ ...s.modalContent, maxHeight: '95vh' }} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div style={s.modalTitle}>{planGeneradoDetalle.nombre}</div>
              <button style={s.closeBtn} onClick={() => setPlanGeneradoDetalle(null)}>✕</button>
            </div>

            {/* Macros totales */}
            <div style={{ background: '#0d0d0d', border: '1px solid #222', borderRadius: 10, padding: 14, marginBottom: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, textAlign: 'center' }}>
                {(() => { const its = planGeneradoDetalle.comidas?.flatMap(c => c.items) || []; const tCal2 = Math.round(its.reduce((s,i)=>s+(i.calorias||0),0)); const tP2 = Math.round(its.reduce((s,i)=>s+(i.proteinas||0),0)); const tC2 = Math.round(its.reduce((s,i)=>s+(i.carbohidratos||0),0)); const tG2 = Math.round(its.reduce((s,i)=>s+(i.grasas||0),0)); return [{ l: 'KCAL', v: tCal2, c: '#f5e642' }, { l: 'PROT', v: tP2+'g', c: '#60a5fa' }, { l: 'CARBS', v: tC2+'g', c: '#f97316' }, { l: 'GRASAS', v: tG2+'g', c: '#facc15' }] })().map(m => (
                  <div key={m.l}>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: m.c }}>{m.v}</div>
                    <div style={{ fontSize: 10, color: '#555', letterSpacing: 1 }}>{m.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {planGeneradoDetalle.comidas?.map((comida, i) => (
              <div key={i} style={{ background: '#0d0d0d', border: '1px solid #222', borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
                <div style={{ padding: '10px 16px', borderBottom: '1px solid #1a1a1a', background: '#111' }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, letterSpacing: 1, color: '#4ade80' }}>{comida.momento}</div>
                </div>
                {comida.items?.map((item, j) => (
                  <div key={j} style={{ padding: '10px 16px', borderBottom: '1px solid #111' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#f0f0f0' }}>{item.nombre}</div>
                      <div style={{ fontSize: 12, color: '#f5e642' }}>{item.cantidad_gramos}g</div>
                    </div>
                    <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{item.calorias} kcal · P:{item.proteinas}g C:{item.carbohidratos}g G:{item.grasas}g</div>
                  </div>
                ))}
              </div>
            ))}

            <button style={{ ...s.btnFull, background: '#4ade80', color: '#000', marginTop: 8 }} onClick={() => guardarPlanGenerado(planGeneradoDetalle)} disabled={guardandoPlan}>
              {guardandoPlan ? 'Guardando...' : '💾 Guardar este plan'}
            </button>
          </div>
        </div>
      )}

      {/* MODAL NUEVO PLAN MANUAL */}
      {modalNuevoPlan && (
        <div style={s.modal} onClick={() => setModalNuevoPlan(false)}>
          <div style={s.modalContent} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div style={s.modalTitle}>NUEVO PLAN</div>
              <button style={s.closeBtn} onClick={() => setModalNuevoPlan(false)}>✕</button>
            </div>
            <label style={s.label}>Nombre del plan</label>
            <input style={s.input} placeholder="Ej: Plan Déficit Semana 1" value={nuevoPlanForm.nombre} onChange={e => setNuevoPlanForm(p => ({ ...p, nombre: e.target.value }))} />
            <label style={s.label}>Descripción (opcional)</label>
            <input style={s.input} placeholder="Ej: Para bajar de grasa" value={nuevoPlanForm.descripcion} onChange={e => setNuevoPlanForm(p => ({ ...p, descripcion: e.target.value }))} />
            <label style={s.label}>Calorías objetivo (opcional)</label>
            <input style={s.input} type="number" placeholder="Ej: 2000" value={nuevoPlanForm.calorias_objetivo} onChange={e => setNuevoPlanForm(p => ({ ...p, calorias_objetivo: e.target.value }))} />
            <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
              <button style={s.btnGhost} onClick={() => setModalNuevoPlan(false)}>Cancelar</button>
              <button style={{ ...s.btn, flex: 1 }} onClick={crearPlan} disabled={saving}>{saving ? 'Guardando...' : 'Crear Plan'}</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLE PLAN MANUAL */}
      {modalDetalle && (
        <div style={s.modal} onClick={() => setModalDetalle(null)}>
          <div style={{ ...s.modalContent, maxHeight: '95vh' }} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div>
                <div style={s.modalTitle}>{modalDetalle.nombre}</div>
                {modalDetalle.descripcion && <div style={{ fontSize: 12, color: '#666' }}>{modalDetalle.descripcion}</div>}
              </div>
              <button style={s.closeBtn} onClick={() => setModalDetalle(null)}>✕</button>
            </div>

            {comidasPlan.length > 0 && (
              <div style={{ background: '#0d0d0d', border: '1px solid #222', borderRadius: 10, padding: 14, marginBottom: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, textAlign: 'center' }}>
                  {[{ l: 'KCAL', v: Math.round(totales.calorias), c: '#f5e642' }, { l: 'PROT', v: `${Math.round(totales.proteinas)}g`, c: '#60a5fa' }, { l: 'CARBS', v: `${Math.round(totales.carbohidratos)}g`, c: '#f97316' }, { l: 'GRASAS', v: `${Math.round(totales.grasas)}g`, c: '#facc15' }].map(m => (
                    <div key={m.l}>
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: m.c }}>{m.v}</div>
                      <div style={{ fontSize: 10, color: '#555', letterSpacing: 1 }}>{m.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {comidasPlan.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#444', padding: '30px 0', fontSize: 13 }}>Agregá una comida para empezar.</div>
            ) : comidasPlan.map(comida => (
              <div key={comida.id} style={{ background: '#0d0d0d', border: '1px solid #222', borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 1, color: '#4ade80' }}>{comida.momento}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={s.btnSm} onClick={() => { setModalAgregarAlimento(comida); setAlimentoSeleccionado(null) }}>+ Alimento</button>
                    <button style={s.btnDanger} onClick={() => eliminarComida(comida.id)}>✕</button>
                  </div>
                </div>
                {(comida.plan_comida_items || []).length === 0 ? (
                  <div style={{ padding: '10px 16px', fontSize: 12, color: '#444' }}>Sin alimentos todavía</div>
                ) : (comida.plan_comida_items || []).map(item => (
                  <div key={item.id} style={{ padding: '10px 16px', borderBottom: '1px solid #111', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{item.nombre}</div>
                      <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{item.cantidad_gramos}g · {item.calorias} kcal</div>
                    </div>
                    <button style={s.btnDanger} onClick={() => eliminarAlimento(comida.id, item.id)}>✕</button>
                  </div>
                ))}
              </div>
            ))}

            <button style={{ ...s.btnGreen, marginBottom: 8 }} onClick={() => setModalAgregarComida(true)}>+ Agregar Comida</button>
            <button style={{ background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', border: '1px solid rgba(255,77,77,0.2)', borderRadius: 8, padding: '12px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', width: '100%' }} onClick={() => eliminarPlan(modalDetalle.id)}>Eliminar Plan</button>
          </div>
        </div>
      )}

      {/* MODAL AGREGAR COMIDA */}
      {modalAgregarComida && (
        <div style={s.modal} onClick={() => setModalAgregarComida(false)}>
          <div style={s.modalContent} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div style={s.modalTitle}>NUEVA COMIDA</div>
              <button style={s.closeBtn} onClick={() => setModalAgregarComida(false)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {MOMENTOS.map(m => (
                <button key={m} style={{ padding: '8px 14px', borderRadius: 8, border: `1px solid ${nuevaComidaMomento === m ? '#4ade80' : '#222'}`, background: nuevaComidaMomento === m ? 'rgba(74,222,128,0.1)' : '#0d0d0d', color: nuevaComidaMomento === m ? '#4ade80' : '#888', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', fontWeight: nuevaComidaMomento === m ? 700 : 400 }} onClick={() => setNuevaComidaMomento(m)}>{m}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={s.btnGhost} onClick={() => setModalAgregarComida(false)}>Cancelar</button>
              <button style={{ ...s.btn, flex: 1, background: '#4ade80' }} onClick={agregarComida} disabled={saving}>{saving ? 'Guardando...' : 'Agregar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AGREGAR ALIMENTO */}
      {modalAgregarAlimento && (
        <div style={s.modal} onClick={() => setModalAgregarAlimento(null)}>
          <div style={{ ...s.modalContent, maxHeight: '95vh' }} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div>
                <div style={s.modalTitle}>AGREGAR ALIMENTO</div>
                <div style={{ fontSize: 12, color: '#666' }}>{modalAgregarAlimento.momento}</div>
              </div>
              <button style={s.closeBtn} onClick={() => setModalAgregarAlimento(null)}>✕</button>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <button style={{ ...s.btnSm, flex: 1, background: !modoManual ? 'rgba(245,230,66,0.1)' : '#0d0d0d', borderColor: !modoManual ? '#f5e642' : '#222', color: !modoManual ? '#f5e642' : '#666' }} onClick={() => setModoManual(false)}>🔍 Lista rápida</button>
              <button style={{ ...s.btnSm, flex: 1, background: modoManual ? 'rgba(245,230,66,0.1)' : '#0d0d0d', borderColor: modoManual ? '#f5e642' : '#222', color: modoManual ? '#f5e642' : '#666' }} onClick={() => setModoManual(true)}>✏️ Manual</button>
            </div>

            {modoManual ? (
              <>
                <label style={s.label}>Nombre</label>
                <input style={s.input} placeholder="Ej: Arroz con pollo" value={alimentoForm.nombre} onChange={e => setAlimentoForm(p => ({ ...p, nombre: e.target.value }))} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div><label style={s.label}>Gramos</label><input style={s.input} type="number" value={alimentoForm.cantidad_gramos} onChange={e => setAlimentoForm(p => ({ ...p, cantidad_gramos: e.target.value }))} /></div>
                  <div><label style={s.label}>Calorías</label><input style={s.input} type="number" value={alimentoForm.calorias} onChange={e => setAlimentoForm(p => ({ ...p, calorias: e.target.value }))} /></div>
                  <div><label style={s.label}>Proteínas (g)</label><input style={s.input} type="number" value={alimentoForm.proteinas} onChange={e => setAlimentoForm(p => ({ ...p, proteinas: e.target.value }))} /></div>
                  <div><label style={s.label}>Carbos (g)</label><input style={s.input} type="number" value={alimentoForm.carbohidratos} onChange={e => setAlimentoForm(p => ({ ...p, carbohidratos: e.target.value }))} /></div>
                  <div><label style={s.label}>Grasas (g)</label><input style={s.input} type="number" value={alimentoForm.grasas} onChange={e => setAlimentoForm(p => ({ ...p, grasas: e.target.value }))} /></div>
                </div>
                <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                  <button style={s.btnGhost} onClick={() => setModalAgregarAlimento(null)}>Cancelar</button>
                  <button style={{ ...s.btn, flex: 1 }} onClick={agregarAlimentoAComida} disabled={saving || !alimentoForm.nombre}>{saving ? 'Guardando...' : 'Agregar'}</button>
                </div>
              </>
            ) : !alimentoSeleccionado ? (
              <>
                <input style={{ ...s.input, marginBottom: 10 }} placeholder="🔍 Buscar..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
                <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8, marginBottom: 10 }}>
                  {CATEGORIAS.map(c => <button key={c} style={s.categoriaPill(categoriaFiltro === c)} onClick={() => setCategoriaFiltro(c)}>{c}</button>)}
                </div>
                <div style={{ maxHeight: 350, overflowY: 'auto' }}>
                  {alimentosFiltrados.map(a => (
                    <div key={a.nombre} style={{ padding: '12px 14px', borderBottom: '1px solid #1a1a1a', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => { setAlimentoSeleccionado(a); setGramosInput(100) }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{a.nombre}</div>
                        <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>100g · {a.calorias} kcal · P:{a.proteinas}g</div>
                      </div>
                      <span style={{ fontSize: 11, color: '#666' }}>{a.categoria.split(' ')[0]}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid #4ade8040', borderRadius: 10, padding: '12px 14px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#4ade80' }}>{alimentoSeleccionado.nombre}</div>
                    <div style={{ fontSize: 11, color: '#888' }}>por 100g: {alimentoSeleccionado.calorias} kcal</div>
                  </div>
                  <button style={s.btnSm} onClick={() => setAlimentoSeleccionado(null)}>Cambiar</button>
                </div>
                <label style={s.label}>Cantidad en gramos</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <button style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 10, color: '#f5e642', fontSize: 22, width: 44, height: 44, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setGramosInput(p => Math.max(5, p - 10))}>−</button>
                  <input style={{ ...s.input, textAlign: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: '#f5e642', border: '1px solid #f5e642', flex: 1 }} type="number" value={gramosInput} onChange={e => setGramosInput(parseInt(e.target.value) || 0)} />
                  <button style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 10, color: '#f5e642', fontSize: 22, width: 44, height: 44, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setGramosInput(p => p + 10)}>+</button>
                </div>
                {(() => {
                  const f = gramosInput / 100
                  const m = { cal: Math.round(alimentoSeleccionado.calorias * f), p: Math.round(alimentoSeleccionado.proteinas * f * 10) / 10, c: Math.round(alimentoSeleccionado.carbohidratos * f * 10) / 10, g: Math.round(alimentoSeleccionado.grasas * f * 10) / 10 }
                  return (
                    <div style={{ background: '#0d0d0d', border: '1px solid #222', borderRadius: 10, padding: 14, marginBottom: 16 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', textAlign: 'center', gap: 8 }}>
                        {[{ l: 'KCAL', v: m.cal, c: '#f5e642' }, { l: 'PROT', v: `${m.p}g`, c: '#60a5fa' }, { l: 'CARBS', v: `${m.c}g`, c: '#f97316' }, { l: 'GRASAS', v: `${m.g}g`, c: '#facc15' }].map(x => (
                          <div key={x.l}><div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: x.c }}>{x.v}</div><div style={{ fontSize: 9, color: '#555' }}>{x.l}</div></div>
                        ))}
                      </div>
                    </div>
                  )
                })()}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button style={s.btnGhost} onClick={() => setAlimentoSeleccionado(null)}>← Volver</button>
                  <button style={{ ...s.btn, flex: 1 }} onClick={agregarAlimentoAComida} disabled={saving}>{saving ? 'Guardando...' : 'Agregar al Plan'}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&display=swap');`}</style>
    </div>
  )
}
