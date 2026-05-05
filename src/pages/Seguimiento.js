import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const s = {
  page: { minHeight: '100vh', background: '#0a0a0a', fontFamily: "'DM Sans', sans-serif" },
  header: { background: '#111', borderBottom: '1px solid #222', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 },
  logo: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, letterSpacing: 2, color: '#f5e642' },
  backBtn: { background: 'none', border: '1px solid #222', color: '#888', borderRadius: 8, padding: '6px 14px', fontSize: 13, cursor: 'pointer' },
  main: { maxWidth: 860, margin: '0 auto', padding: '28px 20px' },
  tabs: { display: 'flex', gap: 4, borderBottom: '1px solid #1a1a1a', marginBottom: 28, overflowX: 'auto' },
  tab: (a) => ({ padding: '10px 16px', background: 'none', border: 'none', borderBottom: `2px solid ${a ? '#f5e642' : 'transparent'}`, color: a ? '#f5e642' : '#555', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }),
  card: { background: '#111', border: '1px solid #222', borderRadius: 12, padding: '20px', marginBottom: 16 },
  cardTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 1, marginBottom: 16 },
  grid: { display: 'grid', gap: 12 },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  row3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 },
  label: { display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#555', marginBottom: 7 },
  input: { width: '100%', background: '#0a0a0a', border: '1px solid #222', borderRadius: 8, color: '#f0f0f0', fontFamily: 'inherit', fontSize: 14, padding: '10px 14px', outline: 'none', boxSizing: 'border-box' },
  select: { width: '100%', background: '#0a0a0a', border: '1px solid #222', borderRadius: 8, color: '#f0f0f0', fontFamily: 'inherit', fontSize: 14, padding: '10px 14px', outline: 'none', appearance: 'none', boxSizing: 'border-box' },
  btn: { background: '#f5e642', color: '#000', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' },
  btnSm: { background: '#1a1a1a', color: '#888', border: '1px solid #222', borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' },
  btnDanger: { background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', border: '1px solid rgba(255,77,77,0.2)', borderRadius: 6, padding: '5px 10px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' },
  item: { background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  itemText: { fontSize: 14, color: '#ccc' },
  itemSub: { fontSize: 12, color: '#444', marginTop: 2 },
  stat: { background: '#111', border: '1px solid #222', borderRadius: 12, padding: '16px 20px', textAlign: 'center' },
  statNum: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: '#f5e642', letterSpacing: 1 },
  statLabel: { fontSize: 11, color: '#555', marginTop: 4 },
  success: { color: '#4ade80', fontSize: 13, marginBottom: 12 },
  agua: { display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 },
  vaso: (lleno) => ({ width: 44, height: 44, borderRadius: 8, border: `2px solid ${lleno ? '#60a5fa' : '#222'}`, background: lleno ? 'rgba(96,165,250,0.2)' : 'transparent', cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }),
}

const MOMENTOS = ['Desayuno', 'Almuerzo', 'Merienda', 'Cena', 'Snack']

function ProgressBar({ actual, meta, color }) {
  const pct = meta > 0 ? Math.min((actual / meta) * 100, 100) : 0
  const over = meta > 0 && actual > meta
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ background: '#1a1a1a', borderRadius: 6, height: 8, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: over ? '#ff4d4d' : color, borderRadius: 6, transition: 'width 0.3s' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 11, color: over ? '#ff4d4d' : '#666' }}>{Math.round(actual)}</span>
        <span style={{ fontSize: 11, color: '#444' }}>meta: {Math.round(meta)}</span>
      </div>
    </div>
  )
}

export default function Seguimiento({ perfil }) {
  const navigate = useNavigate()
  const [tab, setTab] = useState('resumen')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [msg, setMsg] = useState('')
  const [peso, setPeso] = useState('')
  const [registrosPeso, setRegistrosPeso] = useState([])
  const [vasosHoy, setVasosHoy] = useState(0)
  const META_AGUA = 8
  const [comidas, setComidas] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [alimentos, setAlimentos] = useState([])
  const [resultados, setResultados] = useState([])
  const [buscando, setBuscando] = useState(false)
  const [alimentoSel, setAlimentoSel] = useState(null)
  const [gramos, setGramos] = useState('100')
  const [momento, setMomento] = useState('Desayuno')
  const [modoManual, setModoManual] = useState(false)
  const [manualData, setManualData] = useState({ nombre: '', calorias: '', proteinas: '', carbohidratos: '', grasas: '' })
  const [ejercicios, setEjercicios] = useState([])
  const [nuevoEj, setNuevoEj] = useState({ ejercicio: '', series: '', repeticiones: '', peso_kg: '', notas: '' })
  const [metas, setMetas] = useState({ calorias: 2000, proteinas: 150, carbohidratos: 200, grasas: 65 })
  const [editandoMetas, setEditandoMetas] = useState(false)
  const [metasForm, setMetasForm] = useState({ calorias: '', proteinas: '', carbohidratos: '', grasas: '' })
  const [calcTab, setCalcTab] = useState(false)
  const [calcData, setCalcData] = useState({ peso: '', altura: '', edad: '', sexo: 'masculino', actividad: '1.375', objetivo: 'perder' })
  const [calcResult, setCalcResult] = useState(null)
  const timeoutRef = useRef(null)

  useEffect(() => { cargarTodo() }, [fecha])

  async function cargarTodo() {
    const id = perfil.id
    const { data: p } = await supabase.from('registros_peso').select('*').eq('alumno_id', id).order('fecha', { ascending: false }).limit(10)
    setRegistrosPeso(p || [])
    const { data: a } = await supabase.from('registros_agua').select('*').eq('alumno_id', id).eq('fecha', fecha).single()
    setVasosHoy(a?.vasos || 0)
    const { data: c } = await supabase.from('registros_comidas').select('*').eq('alumno_id', id).eq('fecha', fecha).order('created_at')
    setComidas(c || [])
    const { data: e } = await supabase.from('registros_entrenamiento').select('*').eq('alumno_id', id).eq('fecha', fecha).order('created_at')
    setEjercicios(e || [])
    const { data: al } = await supabase.from('alimentos').select('*').order('nombre').limit(300)
    setAlimentos(al || [])
    const { data: m } = await supabase.from('metas_nutricionales').select('*').eq('alumno_id', id).single()
    if (m) setMetas(m)
  }

  function calcularTDEE() {
    const { peso: p, altura: h, edad, sexo, actividad, objetivo } = calcData
    if (!p || !h || !edad) return
    let tmb = sexo === 'masculino'
      ? 10 * parseFloat(p) + 6.25 * parseFloat(h) - 5 * parseFloat(edad) + 5
      : 10 * parseFloat(p) + 6.25 * parseFloat(h) - 5 * parseFloat(edad) - 161
    let tdee = tmb * parseFloat(actividad)
    let calorias = tdee
    if (objetivo === 'perder') calorias = tdee - 400
    if (objetivo === 'perder_rapido') calorias = tdee - 700
    if (objetivo === 'ganar') calorias = tdee + 300
    calorias = Math.round(calorias)
    const prot = Math.round(parseFloat(p) * 2.0)
    const gras = Math.round((calorias * 0.25) / 9)
    const carb = Math.round((calorias - prot * 4 - gras * 9) / 4)
    setCalcResult({ calorias, proteinas: prot, carbohidratos: carb, grasas: gras, tdee: Math.round(tdee) })
  }

  function aplicarResultado() {
    if (!calcResult) return
    setMetasForm({ calorias: calcResult.calorias, proteinas: calcResult.proteinas, carbohidratos: calcResult.carbohidratos, grasas: calcResult.grasas })
    setEditandoMetas(true)
    setCalcTab(false)
  }

  async function guardarMetas() {
    const nuevas = { alumno_id: perfil.id, calorias: parseFloat(metasForm.calorias), proteinas: parseFloat(metasForm.proteinas), carbohidratos: parseFloat(metasForm.carbohidratos), grasas: parseFloat(metasForm.grasas) }
    const { data: existing } = await supabase.from('metas_nutricionales').select('*').eq('alumno_id', perfil.id).single()
    if (existing) {
      await supabase.from('metas_nutricionales').update(nuevas).eq('alumno_id', perfil.id)
    } else {
      await supabase.from('metas_nutricionales').insert(nuevas)
    }
    setMetas(nuevas)
    setEditandoMetas(false)
    setMsg('Metas guardadas ✓')
    setTimeout(() => setMsg(''), 2000)
  }

  async function guardarPeso() {
    if (!peso) return
    await supabase.from('registros_peso').insert({ alumno_id: perfil.id, peso: parseFloat(peso), fecha })
    setPeso('')
    setMsg('Peso guardado ✓')
    cargarTodo()
    setTimeout(() => setMsg(''), 2000)
  }

  async function eliminarPeso(id) {
    await supabase.from('registros_peso').delete().eq('id', id)
    cargarTodo()
  }

  async function toggleVaso(i) {
    const nuevos = i + 1 === vasosHoy ? i : i + 1
    const { data: existing } = await supabase.from('registros_agua').select('*').eq('alumno_id', perfil.id).eq('fecha', fecha).single()
    if (existing) {
      await supabase.from('registros_agua').update({ vasos: nuevos }).eq('id', existing.id)
    } else {
      await supabase.from('registros_agua').insert({ alumno_id: perfil.id, vasos: nuevos, fecha })
    }
    setVasosHoy(nuevos)
  }

  function buscarAlimento(q) {
    setBusqueda(q)
    setAlimentoSel(null)

    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    if (q.length < 2) {
      setResultados([])
      setBuscando(false)
      return
    }

    // 1. Mostrar resultados locales al instante
    const resLocales = alimentos
      .filter(a => a.nombre.toLowerCase().includes(q.toLowerCase()))
      .slice(0, 10)
      .map(a => ({ ...a, fuente: 'local' }))
    setResultados(resLocales)

    // 2. Buscar en Open Food Facts con debounce de 500ms
    timeoutRef.current = setTimeout(async () => {
      setBuscando(true)
      try {
        const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=20&lc=es`
        const response = await fetch(url)
        const data = await response.json()

        let resAPI = []
        if (data.products && data.products.length > 0) {
          resAPI = data.products
            .filter(p => {
              const tieneNombre = p.product_name && p.product_name.trim().length > 0
              const tieneCalorias = p.nutriments && p.nutriments['energy-kcal_100g']
              return tieneNombre && tieneCalorias
            })
            .map((p, idx) => ({
              id: `off-${p.code || idx}`,
              nombre: p.product_name + (p.brands ? ` (${p.brands})` : ''),
              calorias: Math.round(p.nutriments['energy-kcal_100g'] || 0),
              proteinas: parseFloat((p.nutriments['proteins_100g'] || 0).toFixed(1)),
              carbohidratos: parseFloat((p.nutriments['carbohydrates_100g'] || 0).toFixed(1)),
              grasas: parseFloat((p.nutriments['fat_100g'] || 0).toFixed(1)),
              fuente: 'openfoodfacts'
            }))
            .slice(0, 15)
        }

        // Combinar locales + API
        setResultados([...resLocales, ...resAPI])
      } catch (err) {
        console.error('Error Open Food Facts:', err)
      } finally {
        setBuscando(false)
      }
    }, 500)
  }

  function seleccionarAlimento(al) {
    setAlimentoSel(al)
    setBusqueda(al.nombre)
    setResultados([])
    setGramos('100')
    setModoManual(false)
  }

  function calcularPorGramos(al, g) {
    const factor = parseFloat(g) / 100
    return {
      calorias: Math.round(al.calorias * factor * 10) / 10,
      proteinas: Math.round(al.proteinas * factor * 10) / 10,
      carbohidratos: Math.round(al.carbohidratos * factor * 10) / 10,
      grasas: Math.round(al.grasas * factor * 10) / 10,
    }
  }

  const macrosPreview = alimentoSel && gramos ? calcularPorGramos(alimentoSel, gramos) : null

  async function agregarComida() {
    if (modoManual) {
      if (!manualData.nombre || !manualData.calorias) return
      await supabase.from('registros_comidas').insert({
        alumno_id: perfil.id, fecha, momento,
        nombre_manual: manualData.nombre,
        calorias: parseFloat(manualData.calorias),
        proteinas: parseFloat(manualData.proteinas) || 0,
        carbohidratos: parseFloat(manualData.carbohidratos) || 0,
        grasas: parseFloat(manualData.grasas) || 0,
        gramos: 100
      })
      setManualData({ nombre: '', calorias: '', proteinas: '', carbohidratos: '', grasas: '' })
    } else {
      if (!alimentoSel || !gramos) return
      const m = calcularPorGramos(alimentoSel, gramos)
      await supabase.from('registros_comidas').insert({
        alumno_id: perfil.id, fecha, momento,
        nombre_manual: `${alimentoSel.nombre} (${gramos}g)`,
        calorias: m.calorias,
        proteinas: m.proteinas,
        carbohidratos: m.carbohidratos,
        grasas: m.grasas,
        gramos: parseFloat(gramos)
      })
      setAlimentoSel(null)
      setBusqueda('')
      setGramos('100')
    }
    setMsg('Comida agregada ✓')
    cargarTodo()
    setTimeout(() => setMsg(''), 2000)
  }

  async function eliminarComida(id) {
    await supabase.from('registros_comidas').delete().eq('id', id)
    cargarTodo()
  }

  async function agregarEjercicio() {
    if (!nuevoEj.ejercicio) return
    await supabase.from('registros_entrenamiento').insert({ alumno_id: perfil.id, fecha, ...nuevoEj, series: parseInt(nuevoEj.series) || 0, repeticiones: parseInt(nuevoEj.repeticiones) || 0, peso_kg: parseFloat(nuevoEj.peso_kg) || 0 })
    setNuevoEj({ ejercicio: '', series: '', repeticiones: '', peso_kg: '', notas: '' })
    setMsg('Ejercicio agregado ✓')
    cargarTodo()
    setTimeout(() => setMsg(''), 2000)
  }

  async function eliminarEjercicio(id) {
    await supabase.from('registros_entrenamiento').delete().eq('id', id)
    cargarTodo()
  }

  const totalCal = comidas.reduce((s, c) => s + (c.calorias || 0), 0)
  const totalProt = comidas.reduce((s, c) => s + (c.proteinas || 0), 0)
  const totalCarb = comidas.reduce((s, c) => s + (c.carbohidratos || 0), 0)
  const totalGras = comidas.reduce((s, c) => s + (c.grasas || 0), 0)
  const ultimoPeso = registrosPeso[0]?.peso
  const calRestantes = Math.max(0, metas.calorias - totalCal)

  return (
    <div style={s.page}>
      <header style={s.header}>
        <button style={s.backBtn} onClick={() => navigate('/')}>← Volver</button>
        <div style={s.logo}>SEGUIMIENTO</div>
        <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
          style={{ background: '#1a1a1a', border: '1px solid #222', borderRadius: 8, color: '#888', fontSize: 13, padding: '6px 12px', outline: 'none', fontFamily: 'inherit' }} />
      </header>

      <main style={s.main}>
        {msg && <div style={s.success}>{msg}</div>}

        <div style={s.tabs}>
          {['resumen', 'comidas', 'peso', 'agua', 'entrenamiento', 'metas'].map(t => (
            <button key={t} style={s.tab(tab === t)} onClick={() => setTab(t)}>
              {{ resumen: '📊 Resumen', comidas: '🍎 Comidas', peso: '⚖️ Peso', agua: '💧 Agua', entrenamiento: '🏋️ Entreno', metas: '🎯 Mis Metas' }[t]}
            </button>
          ))}
        </div>

        {tab === 'resumen' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 20 }}>
              <div style={s.stat}><div style={s.statNum}>{ultimoPeso || '—'}</div><div style={s.statLabel}>Peso (kg)</div></div>
              <div style={s.stat}><div style={{ ...s.statNum, color: totalCal > metas.calorias ? '#ff4d4d' : '#f5e642' }}>{Math.round(totalCal)}</div><div style={s.statLabel}>Calorías consumidas</div></div>
              <div style={s.stat}><div style={{ ...s.statNum, color: '#60a5fa' }}>{Math.round(calRestantes)}</div><div style={s.statLabel}>Calorías restantes</div></div>
              <div style={s.stat}><div style={{ ...s.statNum, color: '#60a5fa' }}>{vasosHoy}/{META_AGUA}</div><div style={s.statLabel}>Vasos de agua</div></div>
              <div style={s.stat}><div style={s.statNum}>{ejercicios.length}</div><div style={s.statLabel}>Ejercicios</div></div>
            </div>
            <div style={s.card}>
              <div style={s.cardTitle}>Progreso de macros</div>
              <div style={{ display: 'grid', gap: 16 }}>
                {[['🔥 Calorías', totalCal, metas.calorias, 'kcal', '#f5e642'], ['🥩 Proteínas', totalProt, metas.proteinas, 'g', '#4ade80'], ['🍚 Carbohidratos', totalCarb, metas.carbohidratos, 'g', '#f5e642'], ['🥑 Grasas', totalGras, metas.grasas, 'g', '#f97316']].map(([label, actual, meta, unit, color]) => (
                  <div key={label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, color: '#ccc', fontWeight: 500 }}>{label}</span>
                      <span style={{ fontSize: 12, color: '#666' }}>{Math.round(actual)}{unit} / {meta}{unit}</span>
                    </div>
                    <ProgressBar actual={actual} meta={meta} color={color} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'comidas' && (
          <div>
            <div style={s.card}>
              <div style={s.cardTitle}>Agregar comida</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <button style={{ ...s.btnSm, ...(!modoManual ? { background: '#f5e642', color: '#000', borderColor: '#f5e642' } : {}) }} onClick={() => setModoManual(false)}>🔍 Buscar</button>
                <button style={{ ...s.btnSm, ...(modoManual ? { background: '#f5e642', color: '#000', borderColor: '#f5e642' } : {}) }} onClick={() => { setModoManual(true); setAlimentoSel(null); setBusqueda('') }}>✏️ Manual</button>
              </div>
              {!modoManual && (
                <div style={s.grid}>
                  <div style={{ position: 'relative' }}>
                    <label style={s.label}>Buscar alimento</label>
                    <input style={s.input} value={busqueda} onChange={e => buscarAlimento(e.target.value)} placeholder="Ej: pan, manteca, queso, manzana..." />
                    {buscando && (
                      <div style={{ marginTop: 8, padding: '8px 14px', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.3)', borderRadius: 8, color: '#60a5fa', fontSize: 12, textAlign: 'center' }}>
                        🔍 Buscando en 2 millones de alimentos...
                      </div>
                    )}
                    {resultados.length > 0 && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#0d0d0d', border: '1px solid #222', borderRadius: 8, zIndex: 50, maxHeight: 320, overflowY: 'auto', marginTop: 4 }}>
                        {resultados.map(a => (
                          <div key={a.id} style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #1a1a1a' }}
                            onClick={() => seleccionarAlimento(a)}
                            onMouseEnter={e => e.currentTarget.style.background = '#1a1a1a'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 4, background: a.fuente === 'local' ? 'rgba(74,222,128,0.15)' : 'rgba(245,230,66,0.15)', color: a.fuente === 'local' ? '#4ade80' : '#f5e642' }}>
                                {a.fuente === 'local' ? '📦' : '🌍'}
                              </span>
                              <div style={{ fontSize: 13, color: '#ccc' }}>{a.nombre}</div>
                            </div>
                            <div style={{ fontSize: 11, color: '#555', marginTop: 4 }}>{a.calorias} kcal · P: {a.proteinas}g · C: {a.carbohidratos}g · G: {a.grasas}g — por 100g</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {alimentoSel && (
                    <>
                      <div style={{ background: '#0d0d0d', border: '1px solid #f5e64230', borderRadius: 8, padding: '12px 16px' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#f5e642', marginBottom: 4 }}>{alimentoSel.nombre}</div>
                        <div style={{ fontSize: 11, color: '#555' }}>Base: {alimentoSel.calorias} kcal / 100g</div>
                      </div>
                      <div style={s.row}>
                        <div><label style={s.label}>Gramos</label><input style={s.input} type="number" value={gramos} onChange={e => setGramos(e.target.value)} placeholder="100" /></div>
                        <div><label style={s.label}>Momento</label><select style={s.select} value={momento} onChange={e => setMomento(e.target.value)}>{MOMENTOS.map(m => <option key={m}>{m}</option>)}</select></div>
                      </div>
                      {macrosPreview && gramos > 0 && (
                        <div style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: 8, padding: '12px 16px' }}>
                          <div style={{ fontSize: 11, color: '#555', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Para {gramos}g:</div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, textAlign: 'center' }}>
                            <div><div style={{ fontSize: 18, fontWeight: 700, color: '#f5e642', fontFamily: "'Bebas Neue', sans-serif" }}>{macrosPreview.calorias}</div><div style={{ fontSize: 10, color: '#555' }}>kcal</div></div>
                            <div><div style={{ fontSize: 18, fontWeight: 700, color: '#4ade80', fontFamily: "'Bebas Neue', sans-serif" }}>{macrosPreview.proteinas}g</div><div style={{ fontSize: 10, color: '#555' }}>prot</div></div>
                            <div><div style={{ fontSize: 18, fontWeight: 700, color: '#f5e642', fontFamily: "'Bebas Neue', sans-serif" }}>{macrosPreview.carbohidratos}g</div><div style={{ fontSize: 10, color: '#555' }}>carb</div></div>
                            <div><div style={{ fontSize: 18, fontWeight: 700, color: '#f97316', fontFamily: "'Bebas Neue', sans-serif" }}>{macrosPreview.grasas}g</div><div style={{ fontSize: 10, color: '#555' }}>gras</div></div>
                          </div>
                        </div>
                      )}
                      <button style={s.btn} onClick={agregarComida}>Agregar al diario</button>
                    </>
                  )}
                </div>
              )}
              {modoManual && (
                <div style={s.grid}>
                  <div><label style={s.label}>Nombre</label><input style={s.input} value={manualData.nombre} onChange={e => setManualData({ ...manualData, nombre: e.target.value })} placeholder="Ej: Ensalada casera" /></div>
                  <div style={s.row}>
                    <div><label style={s.label}>Calorías</label><input style={s.input} type="number" value={manualData.calorias} onChange={e => setManualData({ ...manualData, calorias: e.target.value })} placeholder="kcal" /></div>
                    <div><label style={s.label}>Momento</label><select style={s.select} value={momento} onChange={e => setMomento(e.target.value)}>{MOMENTOS.map(m => <option key={m}>{m}</option>)}</select></div>
                  </div>
                  <div style={s.row3}>
                    <div><label style={s.label}>Proteínas (g)</label><input style={s.input} type="number" value={manualData.proteinas} onChange={e => setManualData({ ...manualData, proteinas: e.target.value })} placeholder="g" /></div>
                    <div><label style={s.label}>Carbos (g)</label><input style={s.input} type="number" value={manualData.carbohidratos} onChange={e => setManualData({ ...manualData, carbohidratos: e.target.value })} placeholder="g" /></div>
                    <div><label style={s.label}>Grasas (g)</label><input style={s.input} type="number" value={manualData.grasas} onChange={e => setManualData({ ...manualData, grasas: e.target.value })} placeholder="g" /></div>
                  </div>
                  <button style={s.btn} onClick={agregarComida}>Agregar al diario</button>
                </div>
              )}
            </div>
            <div style={s.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={s.cardTitle}>Diario del día</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: totalCal > metas.calorias ? '#ff4d4d' : '#f5e642' }}>{Math.round(totalCal)} kcal</div>
              </div>
              {comidas.length === 0 ? <div style={{ color: '#333', fontSize: 14 }}>No hay comidas registradas hoy</div> :
                MOMENTOS.map(mom => {
                  const del = comidas.filter(c => c.momento === mom)
                  if (del.length === 0) return null
                  const subtotal = del.reduce((s, c) => s + c.calorias, 0)
                  return (
                    <div key={mom} style={{ marginBottom: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#f5e642' }}>{mom}</div>
                        <div style={{ fontSize: 11, color: '#555' }}>{Math.round(subtotal)} kcal</div>
                      </div>
                      {del.map(c => (
                        <div key={c.id} style={s.item}>
                          <div>
                            <div style={s.itemText}>{c.nombre_manual}</div>
                            <div style={s.itemSub}>{Math.round(c.calorias)} kcal · P: {Math.round(c.proteinas)}g · C: {Math.round(c.carbohidratos)}g · G: {Math.round(c.grasas)}g</div>
                          </div>
                          <button style={s.btnDanger} onClick={() => eliminarComida(c.id)}>✕</button>
                        </div>
                      ))}
                    </div>
                  )
                })}
              {comidas.length > 0 && (
                <div style={{ background: '#0d0d0d', borderRadius: 8, padding: '14px 16px', marginTop: 8 }}>
                  <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Total del día</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, textAlign: 'center' }}>
                    <div><div style={{ fontSize: 20, fontWeight: 700, color: '#f5e642', fontFamily: "'Bebas Neue', sans-serif" }}>{Math.round(totalCal)}</div><div style={{ fontSize: 10, color: '#555' }}>kcal</div></div>
                    <div><div style={{ fontSize: 20, fontWeight: 700, color: '#4ade80', fontFamily: "'Bebas Neue', sans-serif" }}>{Math.round(totalProt)}g</div><div style={{ fontSize: 10, color: '#555' }}>prot</div></div>
                    <div><div style={{ fontSize: 20, fontWeight: 700, color: '#f5e642', fontFamily: "'Bebas Neue', sans-serif" }}>{Math.round(totalCarb)}g</div><div style={{ fontSize: 10, color: '#555' }}>carb</div></div>
                    <div><div style={{ fontSize: 20, fontWeight: 700, color: '#f97316', fontFamily: "'Bebas Neue', sans-serif" }}>{Math.round(totalGras)}g</div><div style={{ fontSize: 10, color: '#555' }}>gras</div></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'peso' && (
          <div>
            <div style={s.card}>
              <div style={s.cardTitle}>Registrar peso</div>
              <div style={{ display: 'flex', gap: 12 }}>
                <input style={{ ...s.input, flex: 1 }} type="number" step="0.1" value={peso} onChange={e => setPeso(e.target.value)} placeholder="Ej: 85.5 kg" />
                <button style={s.btn} onClick={guardarPeso}>Guardar</button>
              </div>
            </div>
            <div style={s.card}>
              <div style={s.cardTitle}>Historial</div>
              {registrosPeso.length === 0 ? <div style={{ color: '#333', fontSize: 14 }}>No hay registros todavía</div> :
                registrosPeso.map((r, i) => {
                  const diff = i < registrosPeso.length - 1 ? r.peso - registrosPeso[i + 1].peso : null
                  return (
                    <div key={r.id} style={s.item}>
                      <div>
                        <div style={s.itemText}>{r.peso} kg
                          {diff !== null && <span style={{ marginLeft: 8, fontSize: 12, color: diff < 0 ? '#4ade80' : diff > 0 ? '#ff4d4d' : '#555' }}>{diff > 0 ? '+' : ''}{diff.toFixed(1)} kg</span>}
                        </div>
                        <div style={s.itemSub}>{new Date(r.fecha + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                      </div>
                      <button style={s.btnDanger} onClick={() => eliminarPeso(r.id)}>✕</button>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {tab === 'agua' && (
          <div style={s.card}>
            <div style={s.cardTitle}>Registro de agua</div>
            <div style={{ fontSize: 14, color: '#555', marginBottom: 20 }}>Meta diaria: {META_AGUA} vasos (aprox. 2 litros). Tocá para registrar.</div>
            <div style={s.agua}>
              {Array.from({ length: META_AGUA }).map((_, i) => (
                <div key={i} style={s.vaso(i < vasosHoy)} onClick={() => toggleVaso(i)}>💧</div>
              ))}
            </div>
            <div style={{ marginTop: 20, fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, color: vasosHoy >= META_AGUA ? '#4ade80' : '#f5e642' }}>{vasosHoy} / {META_AGUA}</div>
            <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>{vasosHoy * 250}ml de {META_AGUA * 250}ml</div>
            {vasosHoy >= META_AGUA && <div style={{ color: '#4ade80', fontSize: 14, marginTop: 12, fontWeight: 600 }}>✅ ¡Meta de agua alcanzada!</div>}
          </div>
        )}

        {tab === 'entrenamiento' && (
          <div>
            <div style={s.card}>
              <div style={s.cardTitle}>Registrar ejercicio</div>
              <div style={s.grid}>
                <div><label style={s.label}>Ejercicio</label><input style={s.input} value={nuevoEj.ejercicio} onChange={e => setNuevoEj({ ...nuevoEj, ejercicio: e.target.value })} placeholder="Ej: Sentadilla, Press banca, Peso muerto..." /></div>
                <div style={s.row}>
                  <div><label style={s.label}>Series</label><input style={s.input} type="number" value={nuevoEj.series} onChange={e => setNuevoEj({ ...nuevoEj, series: e.target.value })} placeholder="4" /></div>
                  <div><label style={s.label}>Repeticiones</label><input style={s.input} type="number" value={nuevoEj.repeticiones} onChange={e => setNuevoEj({ ...nuevoEj, repeticiones: e.target.value })} placeholder="10" /></div>
                </div>
                <div style={s.row}>
                  <div><label style={s.label}>Peso (kg)</label><input style={s.input} type="number" step="0.5" value={nuevoEj.peso_kg} onChange={e => setNuevoEj({ ...nuevoEj, peso_kg: e.target.value })} placeholder="60" /></div>
                  <div><label style={s.label}>Notas</label><input style={s.input} value={nuevoEj.notas} onChange={e => setNuevoEj({ ...nuevoEj, notas: e.target.value })} placeholder="último set al fallo..." /></div>
                </div>
                <button style={s.btn} onClick={agregarEjercicio}>Agregar ejercicio</button>
              </div>
            </div>
            <div style={s.card}>
              <div style={s.cardTitle}>Entrenamiento del día</div>
              {ejercicios.length === 0 ? <div style={{ color: '#333', fontSize: 14 }}>No hay ejercicios registrados hoy</div> :
                ejercicios.map((e, i) => (
                  <div key={e.id} style={s.item}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: '#f5e642', fontSize: 12, fontWeight: 700 }}>{i + 1}</span>
                        <div style={s.itemText}>{e.ejercicio}</div>
                      </div>
                      <div style={s.itemSub}>{e.series} series × {e.repeticiones} reps · {e.peso_kg}kg {e.notas && `· ${e.notas}`}</div>
                    </div>
                    <button style={s.btnDanger} onClick={() => eliminarEjercicio(e.id)}>✕</button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {tab === 'metas' && (
          <div>
            <div style={s.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={s.cardTitle}>🧮 Calculadora de calorías</div>
                <button style={s.btnSm} onClick={() => setCalcTab(!calcTab)}>{calcTab ? 'Cerrar' : 'Calcular mis macros'}</button>
              </div>
              <div style={{ fontSize: 13, color: '#555' }}>Calculá tus calorías y macros ideales usando la fórmula Mifflin-St Jeor.</div>
              {calcTab && (
                <div style={{ ...s.grid, marginTop: 16 }}>
                  <div style={s.row}>
                    <div><label style={s.label}>Peso actual (kg)</label><input style={s.input} type="number" value={calcData.peso} onChange={e => setCalcData({ ...calcData, peso: e.target.value })} placeholder="85" /></div>
                    <div><label style={s.label}>Altura (cm)</label><input style={s.input} type="number" value={calcData.altura} onChange={e => setCalcData({ ...calcData, altura: e.target.value })} placeholder="175" /></div>
                  </div>
                  <div style={s.row}>
                    <div><label style={s.label}>Edad</label><input style={s.input} type="number" value={calcData.edad} onChange={e => setCalcData({ ...calcData, edad: e.target.value })} placeholder="30" /></div>
                    <div><label style={s.label}>Sexo</label><select style={s.select} value={calcData.sexo} onChange={e => setCalcData({ ...calcData, sexo: e.target.value })}><option value="masculino">Masculino</option><option value="femenino">Femenino</option></select></div>
                  </div>
                  <div><label style={s.label}>Nivel de actividad</label>
                    <select style={s.select} value={calcData.actividad} onChange={e => setCalcData({ ...calcData, actividad: e.target.value })}>
                      <option value="1.2">Sedentario (sin ejercicio)</option>
                      <option value="1.375">Poco activo (1-3 días/semana)</option>
                      <option value="1.55">Moderadamente activo (3-5 días/semana)</option>
                      <option value="1.725">Muy activo (6-7 días/semana)</option>
                      <option value="1.9">Extremadamente activo (2x por día)</option>
                    </select>
                  </div>
                  <div><label style={s.label}>Objetivo</label>
                    <select style={s.select} value={calcData.objetivo} onChange={e => setCalcData({ ...calcData, objetivo: e.target.value })}>
                      <option value="perder">Perder grasa (déficit -400 kcal)</option>
                      <option value="perder_rapido">Perder grasa rápido (déficit -700 kcal)</option>
                      <option value="mantener">Mantener peso</option>
                      <option value="ganar">Ganar músculo (+300 kcal)</option>
                    </select>
                  </div>
                  <button style={s.btn} onClick={calcularTDEE}>Calcular</button>
                  {calcResult && (
                    <div style={{ background: '#0d0d0d', border: '1px solid #f5e64230', borderRadius: 10, padding: '16px' }}>
                      <div style={{ fontSize: 11, color: '#f5e642', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>Tu resultado</div>
                      <div style={{ fontSize: 13, color: '#555', marginBottom: 12 }}>TDEE: <span style={{ color: '#888' }}>{calcResult.tdee} kcal/día</span></div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, textAlign: 'center', marginBottom: 16 }}>
                        <div><div style={{ fontSize: 24, fontWeight: 700, color: '#f5e642', fontFamily: "'Bebas Neue', sans-serif" }}>{calcResult.calorias}</div><div style={{ fontSize: 10, color: '#555' }}>kcal/día</div></div>
                        <div><div style={{ fontSize: 24, fontWeight: 700, color: '#4ade80', fontFamily: "'Bebas Neue', sans-serif" }}>{calcResult.proteinas}g</div><div style={{ fontSize: 10, color: '#555' }}>proteínas</div></div>
                        <div><div style={{ fontSize: 24, fontWeight: 700, color: '#f5e642', fontFamily: "'Bebas Neue', sans-serif" }}>{calcResult.carbohidratos}g</div><div style={{ fontSize: 10, color: '#555' }}>carbos</div></div>
                        <div><div style={{ fontSize: 24, fontWeight: 700, color: '#f97316', fontFamily: "'Bebas Neue', sans-serif" }}>{calcResult.grasas}g</div><div style={{ fontSize: 10, color: '#555' }}>grasas</div></div>
                      </div>
                      <button style={s.btn} onClick={aplicarResultado}>Usar estos valores como mis metas</button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div style={s.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={s.cardTitle}>🎯 Mis metas diarias</div>
                {!editandoMetas && <button style={s.btnSm} onClick={() => { setMetasForm({ calorias: metas.calorias, proteinas: metas.proteinas, carbohidratos: metas.carbohidratos, grasas: metas.grasas }); setEditandoMetas(true) }}>Editar</button>}
              </div>
              {!editandoMetas ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                  {[['🔥 Calorías', metas.calorias, 'kcal', '#f5e642'], ['🥩 Proteínas', metas.proteinas, 'g', '#4ade80'], ['🍚 Carbohidratos', metas.carbohidratos, 'g', '#f5e642'], ['🥑 Grasas', metas.grasas, 'g', '#f97316']].map(([label, val, unit, color]) => (
                    <div key={label} style={{ background: '#0d0d0d', borderRadius: 8, padding: '14px', textAlign: 'center' }}>
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color, letterSpacing: 1 }}>{val}{unit}</div>
                      <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{label}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={s.grid}>
                  <div style={s.row}>
                    <div><label style={s.label}>Calorías (kcal)</label><input style={s.input} type="number" value={metasForm.calorias} onChange={e => setMetasForm({ ...metasForm, calorias: e.target.value })} /></div>
                    <div><label style={s.label}>Proteínas (g)</label><input style={s.input} type="number" value={metasForm.proteinas} onChange={e => setMetasForm({ ...metasForm, proteinas: e.target.value })} /></div>
                  </div>
                  <div style={s.row}>
                    <div><label style={s.label}>Carbohidratos (g)</label><input style={s.input} type="number" value={metasForm.carbohidratos} onChange={e => setMetasForm({ ...metasForm, carbohidratos: e.target.value })} /></div>
                    <div><label style={s.label}>Grasas (g)</label><input style={s.input} type="number" value={metasForm.grasas} onChange={e => setMetasForm({ ...metasForm, grasas: e.target.value })} /></div>
                  </div>
                  {(() => {
                    const cal = parseFloat(metasForm.calorias) || 0
                    const prot = parseFloat(metasForm.proteinas) || 0
                    const carb = parseFloat(metasForm.carbohidratos) || 0
                    const gras = parseFloat(metasForm.grasas) || 0
                    const totalMacros = Math.round(prot * 4 + carb * 4 + gras * 9)
                    const diff = totalMacros - cal
                    const ok = Math.abs(diff) <= 50
                    return (
                      <div style={{ background: ok ? 'rgba(74,222,128,0.05)' : 'rgba(255,77,77,0.05)', border: `1px solid ${ok ? '#4ade8040' : '#ff4d4d40'}`, borderRadius: 8, padding: '12px 16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: 12, color: '#555' }}>Calorías de tus macros:</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: ok ? '#4ade80' : '#ff4d4d' }}>{totalMacros} kcal</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: 12, color: '#555' }}>Calorías objetivo:</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#f5e642' }}>{cal} kcal</span>
                        </div>
                        <div style={{ fontSize: 12, color: ok ? '#4ade80' : '#ff4d4d', marginTop: 4 }}>
                          {ok ? '✅ Los macros cuadran con tus calorías' : `❌ Diferencia de ${diff > 0 ? '+' : ''}${diff} kcal — ajustá los macros`}
                        </div>
                      </div>
                    )
                  })()}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      style={{ ...s.btn, opacity: Math.abs((parseFloat(metasForm.proteinas)||0)*4 + (parseFloat(metasForm.carbohidratos)||0)*4 + (parseFloat(metasForm.grasas)||0)*9 - (parseFloat(metasForm.calorias)||0)) <= 50 ? 1 : 0.4, cursor: Math.abs((parseFloat(metasForm.proteinas)||0)*4 + (parseFloat(metasForm.carbohidratos)||0)*4 + (parseFloat(metasForm.grasas)||0)*9 - (parseFloat(metasForm.calorias)||0)) <= 50 ? 'pointer' : 'not-allowed' }}
                      onClick={() => { if(Math.abs((parseFloat(metasForm.proteinas)||0)*4 + (parseFloat(metasForm.carbohidratos)||0)*4 + (parseFloat(metasForm.grasas)||0)*9 - (parseFloat(metasForm.calorias)||0)) <= 50) guardarMetas() }}>
                      Guardar metas
                    </button>
                    <button style={s.btnSm} onClick={() => setEditandoMetas(false)}>Cancelar</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
