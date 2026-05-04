import { useState, useEffect } from 'react'
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
  statNum: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color: '#f5e642', letterSpacing: 1 },
  statLabel: { fontSize: 12, color: '#555', marginTop: 4 },
  success: { color: '#4ade80', fontSize: 13, marginBottom: 16 },
  agua: { display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 },
  vaso: (lleno) => ({ width: 44, height: 44, borderRadius: 8, border: `2px solid ${lleno ? '#60a5fa' : '#222'}`, background: lleno ? 'rgba(96,165,250,0.2)' : 'transparent', cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }),
  progressBar: { width: '100%', height: 10, background: '#0a0a0a', borderRadius: 6, overflow: 'hidden', marginTop: 8, border: '1px solid #1a1a1a' },
  progressFill: (pct, color) => ({ width: `${Math.min(pct, 100)}%`, height: '100%', background: color, transition: 'width 0.3s ease', borderRadius: 6 }),
  progressLabel: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 12, color: '#888', marginBottom: 4 },
  progressValue: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 1 },
  preview: { background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 8, padding: '12px 16px', marginTop: 8, marginBottom: 8 },
  previewTitle: { fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#f5e642', marginBottom: 8 },
  previewGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 },
  previewItem: { textAlign: 'center' },
  previewVal: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: '#f0f0f0', letterSpacing: 1 },
  previewLab: { fontSize: 10, color: '#555', marginTop: 2, textTransform: 'uppercase', letterSpacing: 1 },
}

const MOMENTOS = ['Desayuno', 'Almuerzo', 'Merienda', 'Cena', 'Snack']
const METAS_DEFAULT = { calorias: 2000, proteinas: 150, carbohidratos: 200, grasas: 65 }

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
  const [nuevaComida, setNuevaComida] = useState({ nombre: '', calorias: '', proteinas: '', carbohidratos: '', grasas: '', gramos: '100', momento: 'Desayuno' })
  const [modoManual, setModoManual] = useState(false)
  const [alimentoBase, setAlimentoBase] = useState(null)
  const [ejercicios, setEjercicios] = useState([])
  const [nuevoEj, setNuevoEj] = useState({ ejercicio: '', series: '', repeticiones: '', peso_kg: '', notas: '' })
  const [metas, setMetas] = useState(METAS_DEFAULT)
  const [metasInput, setMetasInput] = useState(METAS_DEFAULT)

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
    const { data: al } = await supabase.from('alimentos').select('*').order('nombre').limit(200)
    setAlimentos(al || [])
    const { data: m } = await supabase.from('metas_nutricionales').select('*').eq('alumno_id', id).maybeSingle()
    if (m) {
      const cargadas = {
        calorias: parseFloat(m.calorias) || METAS_DEFAULT.calorias,
        proteinas: parseFloat(m.proteinas) || METAS_DEFAULT.proteinas,
        carbohidratos: parseFloat(m.carbohidratos) || METAS_DEFAULT.carbohidratos,
        grasas: parseFloat(m.grasas) || METAS_DEFAULT.grasas
      }
      setMetas(cargadas)
      setMetasInput(cargadas)
    }
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
    if (q.length < 2) { setResultados([]); return }
    const res = alimentos.filter(a => a.nombre.toLowerCase().includes(q.toLowerCase())).slice(0, 8)
    setResultados(res)
  }

  function seleccionarAlimento(al) {
    const porcion = parseFloat(al.porcion_gramos) || 100
    setAlimentoBase({
      nombre: al.nombre,
      cal_por_g: parseFloat(al.calorias) / porcion,
      prot_por_g: parseFloat(al.proteinas) / porcion,
      carb_por_g: parseFloat(al.carbohidratos) / porcion,
      gras_por_g: parseFloat(al.grasas) / porcion
    })
    setNuevaComida({
      ...nuevaComida,
      nombre: al.nombre,
      calorias: al.calorias,
      proteinas: al.proteinas,
      carbohidratos: al.carbohidratos,
      grasas: al.grasas,
      gramos: porcion
    })
    setBusqueda(al.nombre)
    setResultados([])
    setModoManual(false)
  }

  function actualizarGramos(g) {
    if (alimentoBase && g !== '') {
      const gramos = parseFloat(g) || 0
      setNuevaComida({
        ...nuevaComida,
        gramos: g,
        calorias: (alimentoBase.cal_por_g * gramos).toFixed(1),
        proteinas: (alimentoBase.prot_por_g * gramos).toFixed(1),
        carbohidratos: (alimentoBase.carb_por_g * gramos).toFixed(1),
        grasas: (alimentoBase.gras_por_g * gramos).toFixed(1)
      })
    } else {
      setNuevaComida({ ...nuevaComida, gramos: g })
    }
  }

  function activarManual() {
    setModoManual(true)
    setAlimentoBase(null)
    setBusqueda('')
    setResultados([])
    setNuevaComida({ nombre: '', calorias: '', proteinas: '', carbohidratos: '', grasas: '', gramos: '100', momento: nuevaComida.momento })
  }

  function limpiarFormComida() {
    setNuevaComida({ nombre: '', calorias: '', proteinas: '', carbohidratos: '', grasas: '', gramos: '100', momento: 'Desayuno' })
    setBusqueda('')
    setAlimentoBase(null)
    setModoManual(false)
  }

  async function agregarComida() {
    if (!nuevaComida.nombre || !nuevaComida.calorias) return
    await supabase.from('registros_comidas').insert({
      alumno_id: perfil.id, fecha,
      nombre_manual: nuevaComida.nombre,
      calorias: parseFloat(nuevaComida.calorias),
      proteinas: parseFloat(nuevaComida.proteinas) || 0,
      carbohidratos: parseFloat(nuevaComida.carbohidratos) || 0,
      grasas: parseFloat(nuevaComida.grasas) || 0,
      gramos: parseFloat(nuevaComida.gramos) || 100,
      momento: nuevaComida.momento
    })
    limpiarFormComida()
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

  async function guardarMetas() {
    const m = {
      alumno_id: perfil.id,
      calorias: parseFloat(metasInput.calorias) || METAS_DEFAULT.calorias,
      proteinas: parseFloat(metasInput.proteinas) || METAS_DEFAULT.proteinas,
      carbohidratos: parseFloat(metasInput.carbohidratos) || METAS_DEFAULT.carbohidratos,
      grasas: parseFloat(metasInput.grasas) || METAS_DEFAULT.grasas,
      updated_at: new Date().toISOString()
    }
    const { error } = await supabase.from('metas_nutricionales').upsert(m, { onConflict: 'alumno_id' })
    if (error) {
      setMsg('Error al guardar metas')
    } else {
      setMetas({ calorias: m.calorias, proteinas: m.proteinas, carbohidratos: m.carbohidratos, grasas: m.grasas })
      setMsg('Metas guardadas ✓')
    }
    setTimeout(() => setMsg(''), 2000)
  }

  const totalCal = comidas.reduce((s, c) => s + (parseFloat(c.calorias) || 0), 0)
  const totalProt = comidas.reduce((s, c) => s + (parseFloat(c.proteinas) || 0), 0)
  const totalCarb = comidas.reduce((s, c) => s + (parseFloat(c.carbohidratos) || 0), 0)
  const totalGras = comidas.reduce((s, c) => s + (parseFloat(c.grasas) || 0), 0)
  const ultimoPeso = registrosPeso[0]?.peso

  const pct = (actual, meta) => meta > 0 ? (actual / meta) * 100 : 0
  const restante = (actual, meta) => Math.max(0, meta - actual)

  const BarraProgreso = ({ label, actual, meta, unidad, color }) => {
    const porcentaje = pct(actual, meta)
    const falta = restante(actual, meta)
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={s.progressLabel}>
          <span style={{ fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', fontSize: 11, color: '#888' }}>{label}</span>
          <span>
            <span style={{ ...s.progressValue, color }}>{Math.round(actual)}</span>
            <span style={{ color: '#444', fontSize: 13 }}> / {meta}{unidad}</span>
          </span>
        </div>
        <div style={s.progressBar}>
          <div style={s.progressFill(porcentaje, color)} />
        </div>
        <div style={{ fontSize: 11, color: porcentaje >= 100 ? '#4ade80' : '#555', marginTop: 4 }}>
          {porcentaje >= 100
            ? `✓ Meta alcanzada (+${Math.round(actual - meta)}${unidad})`
            : `Faltan ${Math.round(falta)}${unidad} (${Math.round(porcentaje)}%)`}
        </div>
      </div>
    )
  }

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
          {['resumen', 'peso', 'agua', 'comidas', 'entrenamiento', 'metas'].map(t => (
            <button key={t} style={s.tab(tab === t)} onClick={() => setTab(t)}>
              {{ resumen: '📊 Resumen', peso: '⚖️ Peso', agua: '💧 Agua', comidas: '🍎 Comidas', entrenamiento: '🏋️ Entrenamiento', metas: '🎯 Metas' }[t]}
            </button>
          ))}
        </div>

        {tab === 'resumen' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
              <div style={s.stat}><div style={s.statNum}>{ultimoPeso || '—'}</div><div style={s.statLabel}>Peso actual (kg)</div></div>
              <div style={s.stat}><div style={s.statNum}>{Math.round(totalCal)}</div><div style={s.statLabel}>Calorías hoy</div></div>
              <div style={s.stat}><div style={s.statNum}>{vasosHoy}/{META_AGUA}</div><div style={s.statLabel}>Vasos de agua</div></div>
              <div style={s.stat}><div style={s.statNum}>{ejercicios.length}</div><div style={s.statLabel}>Ejercicios hoy</div></div>
            </div>

            <div style={s.card}>
              <div style={s.cardTitle}>Progreso del día vs metas</div>
              <BarraProgreso label="Calorías" actual={totalCal} meta={metas.calorias} unidad=" kcal" color="#f5e642" />
              <BarraProgreso label="Proteínas" actual={totalProt} meta={metas.proteinas} unidad="g" color="#4ade80" />
              <BarraProgreso label="Carbohidratos" actual={totalCarb} meta={metas.carbohidratos} unidad="g" color="#60a5fa" />
              <BarraProgreso label="Grasas" actual={totalGras} meta={metas.grasas} unidad="g" color="#f97316" />
              <button style={{ ...s.btnSm, marginTop: 8 }} onClick={() => setTab('metas')}>Ajustar metas →</button>
            </div>

            <div style={s.card}>
              <div style={s.cardTitle}>Macros del día</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[['Proteínas', Math.round(totalProt) + 'g', '#4ade80'], ['Carbohidratos', Math.round(totalCarb) + 'g', '#60a5fa'], ['Grasas', Math.round(totalGras) + 'g', '#f97316']].map(([label, val, color]) => (
                  <div key={label} style={{ textAlign: 'center', background: '#0d0d0d', borderRadius: 8, padding: '12px' }}>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color, letterSpacing: 1 }}>{val}</div>
                    <div style={{ fontSize: 11, color: '#444', marginTop: 2 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'peso' && (
          <div>
            <div style={s.card}>
              <div style={s.cardTitle}>Registrar peso</div>
              <div style={{ display: 'flex', gap: 12 }}>
                <input style={{ ...s.input, flex: 1 }} type="number" step="0.1" value={peso} onChange={e => setPeso(e.target.value)} placeholder="Ej: 85.5" />
                <button style={s.btn} onClick={guardarPeso}>Guardar</button>
              </div>
            </div>
            <div style={s.card}>
              <div style={s.cardTitle}>Historial de peso</div>
              {registrosPeso.length === 0 ? <div style={{ color: '#333', fontSize: 14 }}>No hay registros todavía</div> :
                registrosPeso.map(r => (
                  <div key={r.id} style={s.item}>
                    <div>
                      <div style={s.itemText}>{r.peso} kg</div>
                      <div style={s.itemSub}>{new Date(r.fecha).toLocaleDateString('es-AR')}</div>
                    </div>
                    <button style={s.btnDanger} onClick={() => eliminarPeso(r.id)}>✕</button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {tab === 'agua' && (
          <div style={s.card}>
            <div style={s.cardTitle}>Registro de agua</div>
            <div style={{ fontSize: 14, color: '#555', marginBottom: 16 }}>Meta: {META_AGUA} vasos por día.</div>
            <div style={s.agua}>
              {Array.from({ length: META_AGUA }).map((_, i) => (
                <div key={i} style={s.vaso(i < vasosHoy)} onClick={() => toggleVaso(i)}>💧</div>
              ))}
            </div>
            <div style={{ marginTop: 16, fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: vasosHoy >= META_AGUA ? '#4ade80' : '#f5e642' }}>
              {vasosHoy} / {META_AGUA} vasos
            </div>
            {vasosHoy >= META_AGUA && <div style={{ color: '#4ade80', fontSize: 14, marginTop: 8 }}>✅ ¡Meta de agua alcanzada!</div>}
          </div>
        )}

        {tab === 'comidas' && (
          <div>
            <div style={s.card}>
              <div style={s.cardTitle}>Agregar comida</div>
              <div style={s.grid}>
                <div>
                  <label style={s.label}>Buscar alimento</label>
                  <input style={s.input} value={busqueda} onChange={e => buscarAlimento(e.target.value)} placeholder="Ej: pollo, arroz, manzana..." />
                  {resultados.length > 0 && (
                    <div style={{ background: '#0d0d0d', border: '1px solid #222', borderRadius: 8, marginTop: 4 }}>
                      {resultados.map(a => (
                        <div key={a.id} style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #1a1a1a', fontSize: 13 }}
                          onClick={() => seleccionarAlimento(a)}
                          onMouseEnter={e => e.currentTarget.style.background = '#1a1a1a'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <span style={{ color: '#ccc' }}>{a.nombre}</span>
                          <span style={{ color: '#555', marginLeft: 8 }}>{a.calorias} kcal / {a.porcion_gramos}g</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={s.btnSm} onClick={() => modoManual ? limpiarFormComida() : activarManual()}>
                    {modoManual ? 'Usar búsqueda' : '+ Agregar manualmente'}
                  </button>
                  {(nuevaComida.nombre || modoManual) && (
                    <button style={s.btnSm} onClick={limpiarFormComida}>Limpiar</button>
                  )}
                </div>

                {alimentoBase && nuevaComida.gramos && (
                  <div style={s.preview}>
                    <div style={s.previewTitle}>📐 Cálculo automático para {nuevaComida.gramos}g</div>
                    <div style={s.previewGrid}>
                      <div style={s.previewItem}>
                        <div style={{ ...s.previewVal, color: '#f5e642' }}>{nuevaComida.calorias}</div>
                        <div style={s.previewLab}>kcal</div>
                      </div>
                      <div style={s.previewItem}>
                        <div style={{ ...s.previewVal, color: '#4ade80' }}>{nuevaComida.proteinas}g</div>
                        <div style={s.previewLab}>Proteínas</div>
                      </div>
                      <div style={s.previewItem}>
                        <div style={{ ...s.previewVal, color: '#60a5fa' }}>{nuevaComida.carbohidratos}g</div>
                        <div style={s.previewLab}>Carbos</div>
                      </div>
                      <div style={s.previewItem}>
                        <div style={{ ...s.previewVal, color: '#f97316' }}>{nuevaComida.grasas}g</div>
                        <div style={s.previewLab}>Grasas</div>
                      </div>
                    </div>
                  </div>
                )}

                {(modoManual || nuevaComida.nombre) && (
                  <>
                    {modoManual && (
                      <div>
                        <label style={s.label}>Nombre del alimento</label>
                        <input style={s.input} value={nuevaComida.nombre} onChange={e => setNuevaComida({ ...nuevaComida, nombre: e.target.value })} placeholder="Ej: Ensalada casera" />
                      </div>
                    )}
                    <div style={s.row}>
                      <div>
                        <label style={s.label}>Gramos {alimentoBase && <span style={{ color: '#f5e642', textTransform: 'none' }}>(auto-calcula)</span>}</label>
                        <input style={s.input} type="number" value={nuevaComida.gramos} onChange={e => actualizarGramos(e.target.value)} placeholder="g" />
                      </div>
                      <div>
                        <label style={s.label}>Calorías</label>
                        <input style={s.input} type="number" value={nuevaComida.calorias} onChange={e => setNuevaComida({ ...nuevaComida, calorias: e.target.value })} placeholder="kcal" disabled={!!alimentoBase} />
                      </div>
                    </div>
                    <div style={s.row}>
                      <div>
                        <label style={s.label}>Proteínas (g)</label>
                        <input style={s.input} type="number" value={nuevaComida.proteinas} onChange={e => setNuevaComida({ ...nuevaComida, proteinas: e.target.value })} placeholder="g" disabled={!!alimentoBase} />
                      </div>
                      <div>
                        <label style={s.label}>Carbohidratos (g)</label>
                        <input style={s.input} type="number" value={nuevaComida.carbohidratos} onChange={e => setNuevaComida({ ...nuevaComida, carbohidratos: e.target.value })} placeholder="g" disabled={!!alimentoBase} />
                      </div>
                    </div>
                    <div style={s.row}>
                      <div>
                        <label style={s.label}>Grasas (g)</label>
                        <input style={s.input} type="number" value={nuevaComida.grasas} onChange={e => setNuevaComida({ ...nuevaComida, grasas: e.target.value })} placeholder="g" disabled={!!alimentoBase} />
                      </div>
                      <div>
                        <label style={s.label}>Momento</label>
                        <select style={s.select} value={nuevaComida.momento} onChange={e => setNuevaComida({ ...nuevaComida, momento: e.target.value })}>
                          {MOMENTOS.map(m => <option key={m}>{m}</option>)}
                        </select>
                      </div>
                    </div>
                    <button style={s.btn} onClick={agregarComida}>Agregar comida</button>
                  </>
                )}
              </div>
            </div>
            <div style={s.card}>
              <div style={s.cardTitle}>Comidas del día — {Math.round(totalCal)} kcal</div>
              {comidas.length === 0 ? <div style={{ color: '#333', fontSize: 14 }}>No hay comidas registradas hoy</div> :
                MOMENTOS.map(momento => {
                  const del = comidas.filter(c => c.momento === momento)
                  if (del.length === 0) return null
                  return (
                    <div key={momento} style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#f5e642', marginBottom: 8 }}>{momento}</div>
                      {del.map(c => (
                        <div key={c.id} style={s.item}>
                          <div>
                            <div style={s.itemText}>{c.nombre_manual} {c.gramos && <span style={{ color: '#555', fontSize: 12 }}>· {c.gramos}g</span>}</div>
                            <div style={s.itemSub}>{Math.round(c.calorias)} kcal · P: {Math.round(c.proteinas)}g · C: {Math.round(c.carbohidratos)}g · G: {Math.round(c.grasas)}g</div>
                          </div>
                          <button style={s.btnDanger} onClick={() => eliminarComida(c.id)}>✕</button>
                        </div>
                      ))}
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {tab === 'entrenamiento' && (
          <div>
            <div style={s.card}>
              <div style={s.cardTitle}>Registrar ejercicio</div>
              <div style={s.grid}>
                <div><label style={s.label}>Ejercicio</label><input style={s.input} value={nuevoEj.ejercicio} onChange={e => setNuevoEj({ ...nuevoEj, ejercicio: e.target.value })} placeholder="Ej: Sentadilla, Press banca..." /></div>
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
              <div style={s.cardTitle}>🎯 Mis metas diarias</div>
              <div style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>
                Configurá cuánto querés consumir por día. Las barras del Resumen te van a mostrar cuánto te falta.
              </div>
              <div style={s.grid}>
                <div style={s.row}>
                  <div>
                    <label style={s.label}>Calorías (kcal)</label>
                    <input style={s.input} type="number" value={metasInput.calorias} onChange={e => setMetasInput({ ...metasInput, calorias: e.target.value })} placeholder="2000" />
                  </div>
                  <div>
                    <label style={s.label}>Proteínas (g)</label>
                    <input style={s.input} type="number" value={metasInput.proteinas} onChange={e => setMetasInput({ ...metasInput, proteinas: e.target.value })} placeholder="150" />
                  </div>
                </div>
                <div style={s.row}>
                  <div>
                    <label style={s.label}>Carbohidratos (g)</label>
                    <input style={s.input} type="number" value={metasInput.carbohidratos} onChange={e => setMetasInput({ ...metasInput, carbohidratos: e.target.value })} placeholder="200" />
                  </div>
                  <div>
                    <label style={s.label}>Grasas (g)</label>
                    <input style={s.input} type="number" value={metasInput.grasas} onChange={e => setMetasInput({ ...metasInput, grasas: e.target.value })} placeholder="65" />
                  </div>
                </div>
                <button style={s.btn} onClick={guardarMetas}>Guardar metas</button>
              </div>
            </div>

            <div style={s.card}>
              <div style={s.cardTitle}>💡 Guía rápida</div>
              <div style={{ fontSize: 13, color: '#888', lineHeight: 1.7 }}>
                <div style={{ marginBottom: 10 }}><strong style={{ color: '#f5e642' }}>Calorías:</strong> Para mantener peso, multiplicá tu peso (kg) × 30. Para bajar, restá 300-500. Para subir, sumá 300-500.</div>
                <div style={{ marginBottom: 10 }}><strong style={{ color: '#4ade80' }}>Proteínas:</strong> 1.6 a 2.2g por kg de peso corporal si entrenás fuerza.</div>
                <div style={{ marginBottom: 10 }}><strong style={{ color: '#60a5fa' }}>Carbohidratos:</strong> El resto de las calorías después de proteínas y grasas. Subí si entrenás mucho, bajá si querés definir.</div>
                <div><strong style={{ color: '#f97316' }}>Grasas:</strong> 0.8 a 1g por kg de peso corporal mínimo, para hormonas saludables.</div>
              </div>
            </div>

            <div style={s.card}>
              <div style={s.cardTitle}>Metas actuales activas</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
                <div style={s.stat}><div style={{ ...s.statNum, color: '#f5e642' }}>{metas.calorias}</div><div style={s.statLabel}>kcal/día</div></div>
                <div style={s.stat}><div style={{ ...s.statNum, color: '#4ade80' }}>{metas.proteinas}g</div><div style={s.statLabel}>Proteínas</div></div>
                <div style={s.stat}><div style={{ ...s.statNum, color: '#60a5fa' }}>{metas.carbohidratos}g</div><div style={s.statLabel}>Carbos</div></div>
                <div style={s.stat}><div style={{ ...s.statNum, color: '#f97316' }}>{metas.grasas}g</div><div style={s.statLabel}>Grasas</div></div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
