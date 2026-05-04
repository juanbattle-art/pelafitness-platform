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
}

const MOMENTOS = ['Desayuno', 'Almuerzo', 'Merienda', 'Cena', 'Snack']

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
  const [ejercicios, setEjercicios] = useState([])
  const [nuevoEj, setNuevoEj] = useState({ ejercicio: '', series: '', repeticiones: '', peso_kg: '', notas: '' })

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
    setNuevaComida({ ...nuevaComida, nombre: al.nombre, calorias: al.calorias, proteinas: al.proteinas, carbohidratos: al.carbohidratos, grasas: al.grasas, gramos: al.porcion_gramos })
    setBusqueda(al.nombre)
    setResultados([])
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
    setNuevaComida({ nombre: '', calorias: '', proteinas: '', carbohidratos: '', grasas: '', gramos: '100', momento: 'Desayuno' })
    setBusqueda('')
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
          {['resumen', 'peso', 'agua', 'comidas', 'entrenamiento'].map(t => (
            <button key={t} style={s.tab(tab === t)} onClick={() => setTab(t)}>
              {{ resumen: '📊 Resumen', peso: '⚖️ Peso', agua: '💧 Agua', comidas: '🍎 Comidas', entrenamiento: '🏋️ Entrenamiento' }[t]}
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
              <div style={s.cardTitle}>Macros del día</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[['Proteínas', Math.round(totalProt) + 'g', '#4ade80'], ['Carbohidratos', Math.round(totalCarb) + 'g', '#f5e642'], ['Grasas', Math.round(totalGras) + 'g', '#f97316']].map(([label, val, color]) => (
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
                <div>
                  <button style={s.btnSm} onClick={() => setModoManual(!modoManual)}>
                    {modoManual ? 'Usar búsqueda' : '+ Agregar manualmente'}
                  </button>
                </div>
                {(modoManual || nuevaComida.nombre) && (
                  <>
                    {modoManual && (
                      <div>
                        <label style={s.label}>Nombre del alimento</label>
                        <input style={s.input} value={nuevaComida.nombre} onChange={e => setNuevaComida({ ...nuevaComida, nombre: e.target.value })} placeholder="Ej: Ensalada casera" />
                      </div>
                    )}
                    <div style={s.row}>
                      <div><label style={s.label}>Calorías</label><input style={s.input} type="number" value={nuevaComida.calorias} onChange={e => setNuevaComida({ ...nuevaComida, calorias: e.target.value })} placeholder="kcal" /></div>
                      <div><label style={s.label}>Gramos</label><input style={s.input} type="number" value={nuevaComida.gramos} onChange={e => setNuevaComida({ ...nuevaComida, gramos: e.target.value })} placeholder="g" /></div>
                    </div>
                    <div style={s.row}>
                      <div><label style={s.label}>Proteínas (g)</label><input style={s.input} type="number" value={nuevaComida.proteinas} onChange={e => setNuevaComida({ ...nuevaComida, proteinas: e.target.value })} placeholder="g" /></div>
                      <div><label style={s.label}>Carbohidratos (g)</label><input style={s.input} type="number" value={nuevaComida.carbohidratos} onChange={e => setNuevaComida({ ...nuevaComida, carbohidratos: e.target.value })} placeholder="g" /></div>
                    </div>
                    <div style={s.row}>
                      <div><label style={s.label}>Grasas (g)</label><input style={s.input} type="number" value={nuevaComida.grasas} onChange={e => setNuevaComida({ ...nuevaComida, grasas: e.target.value })} placeholder="g" /></div>
                      <div><label style={s.label}>Momento</label>
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
                            <div style={s.itemText}>{c.nombre_manual}</div>
                            <div style={s.itemSub}>{c.calorias} kcal · P: {c.proteinas}g · C: {c.carbohidratos}g · G: {c.grasas}g</div>
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
      </main>
    </div>
  )
}
