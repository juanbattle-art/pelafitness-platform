import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const s = {
  page: { minHeight: '100vh', background: '#0a0a0a', fontFamily: "'DM Sans', sans-serif", paddingBottom: 80, color: '#f0f0f0' },
  header: { background: '#111', borderBottom: '1px solid #222', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 },
  logo: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 2, color: '#f5e642' },
  backBtn: { background: 'none', border: '1px solid #222', color: '#888', borderRadius: 8, padding: '6px 14px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' },
  main: { maxWidth: 720, margin: '0 auto', padding: '20px 16px' },
  alumnoBox: { background: 'rgba(245,230,66,0.1)', border: '1px solid #f5e64240', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#f5e642', fontWeight: 600 },
  card: { background: '#111', border: '1px solid #222', borderRadius: 12, padding: 16, marginBottom: 14 },
  cardTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 1, marginBottom: 14, color: '#f0f0f0' },
  empty: { textAlign: 'center', color: '#666', padding: '40px 20px', fontSize: 13 },
  btn: { background: '#f5e642', color: '#000', border: 'none', borderRadius: 8, padding: '12px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' },
  btnFull: { background: '#f5e642', color: '#000', border: 'none', borderRadius: 8, padding: '14px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', width: '100%' },
  btnSm: { background: '#1a1a1a', color: '#f5e642', border: '1px solid #f5e64240', borderRadius: 6, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 },
  btnDanger: { background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', border: '1px solid rgba(255,77,77,0.2)', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' },
  diaCard: { background: '#1a1a1a', border: '1px solid #333', borderRadius: 12, marginBottom: 12, overflow: 'hidden' },
  diaHeader: { padding: '14px 16px', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#161616' },
  diaNombre: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 1, color: '#f5e642' },
  diaSub: { fontSize: 11, color: '#888' },
  ejercicioRow: { padding: '12px 16px', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  ejercicioNombre: { fontSize: 13, color: '#f0f0f0', fontWeight: 600 },
  ejercicioMeta: { fontSize: 11, color: '#888', marginTop: 2 },
  
  // Modal
  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'flex-end' },
  modalContent: { background: '#111', width: '100%', maxHeight: '90vh', borderRadius: '16px 16px 0 0', overflowY: 'auto', padding: 20 },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #222' },
  modalTitle: { fontSize: 17, fontWeight: 700, color: '#f0f0f0' },
  closeBtn: { background: 'none', border: 'none', color: '#888', fontSize: 24, cursor: 'pointer', padding: 4 },
  
  label: { display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#666', marginBottom: 6, marginTop: 12 },
  input: { width: '100%', background: '#0a0a0a', border: '1px solid #222', borderRadius: 8, padding: '10px 14px', color: '#f0f0f0', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' },
  select: { width: '100%', background: '#0a0a0a', border: '1px solid #222', borderRadius: 8, padding: '10px 14px', color: '#f0f0f0', fontSize: 14, outline: 'none', fontFamily: 'inherit', appearance: 'none', boxSizing: 'border-box' },
  textarea: { width: '100%', background: '#0a0a0a', border: '1px solid #222', borderRadius: 8, padding: '10px 14px', color: '#f0f0f0', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', minHeight: 60, resize: 'vertical' },
  
  catalogoLista: { display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 300, overflowY: 'auto', marginBottom: 14 },
  catalogoItem: (selected) => ({
    padding: '10px 14px',
    background: selected ? 'rgba(245,230,66,0.1)' : '#0d0d0d',
    border: `1px solid ${selected ? '#f5e642' : '#222'}`,
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 13,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }),
  catalogoGrupo: { fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: 1 },
  
  rowGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  
  success: { color: '#4ade80', fontSize: 13, marginBottom: 12, padding: '10px 14px', background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 8 },
  
  searchInput: { width: '100%', background: '#0a0a0a', border: '1px solid #222', borderRadius: 8, padding: '10px 14px', color: '#f0f0f0', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 10 },
  
  videoLink: { color: '#60a5fa', fontSize: 12, textDecoration: 'none' },
}

const DIAS_SEMANA = [
  { id: 'lunes', nombre: 'Lunes' },
  { id: 'martes', nombre: 'Martes' },
  { id: 'miercoles', nombre: 'Miércoles' },
  { id: 'jueves', nombre: 'Jueves' },
  { id: 'viernes', nombre: 'Viernes' },
  { id: 'sabado', nombre: 'Sábado' },
  { id: 'domingo', nombre: 'Domingo' }
]

export default function PlanEntrenamiento({ perfil }) {
  const { alumnoId } = useParams()
  const navigate = useNavigate()
  
  const [alumno, setAlumno] = useState(null)
  const [plan, setPlan] = useState(null)
  const [dias, setDias] = useState([])
  const [ejerciciosPorDia, setEjerciciosPorDia] = useState({})
  const [catalogo, setCatalogo] = useState([])
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)
  
  // Modales
  const [showAddDia, setShowAddDia] = useState(false)
  const [showAddEjercicio, setShowAddEjercicio] = useState(null) // dia_id
  const [showEditEjercicio, setShowEditEjercicio] = useState(null) // ejercicio del plan
  const [showCrearEjercicio, setShowCrearEjercicio] = useState(false)
  const [showEditarVideo, setShowEditarVideo] = useState(null) // ejercicio del catalogo
  
  // Forms
  const [diaForm, setDiaForm] = useState({ dia_semana: 'lunes', nombre_dia: '' })
  const [ejercicioForm, setEjercicioForm] = useState({ 
    ejercicio_id: '', 
    series_planificadas: 4, 
    reps_planificadas: '8-12', 
    peso_planificado_kg: '', 
    rir_planificado: 2,
    notas: ''
  })
  const [busquedaCatalogo, setBusquedaCatalogo] = useState('')
  const [crearEjForm, setCrearEjForm] = useState({ nombre: '', grupo_muscular: 'Pecho', video_url: '' })
  const [videoUrlForm, setVideoUrlForm] = useState('')

  useEffect(() => {
    cargarTodo()
  }, [alumnoId])

  async function cargarTodo() {
    setLoading(true)
    
    // Cargar perfil del alumno
    const { data: alumnoData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', alumnoId)
      .single()
    setAlumno(alumnoData)
    
    // Cargar catálogo
    const { data: cat } = await supabase
      .from('ejercicios_catalogo')
      .select('*')
      .order('grupo_muscular')
      .order('orden')
    setCatalogo(cat || [])
    
    // Cargar plan del alumno (o crear si no tiene)
    let { data: planData } = await supabase
      .from('planes_entrenamiento')
      .select('*')
      .eq('alumno_id', alumnoId)
      .eq('activo', true)
      .maybeSingle()
    
    if (!planData) {
      const { data: nuevo } = await supabase
        .from('planes_entrenamiento')
        .insert({ alumno_id: alumnoId, nombre: 'Plan principal', activo: true })
        .select()
        .single()
      planData = nuevo
    }
    setPlan(planData)
    
    if (planData) {
      const { data: diasData } = await supabase
        .from('plan_dias')
        .select('*')
        .eq('plan_id', planData.id)
        .order('orden')
      setDias(diasData || [])
      
      // Cargar ejercicios de cada día
      const ejerciciosMap = {}
      for (const dia of (diasData || [])) {
        const { data: ejs } = await supabase
          .from('plan_ejercicios')
          .select('*, ejercicios_catalogo(nombre, grupo_muscular, video_url)')
          .eq('dia_id', dia.id)
          .order('orden')
        ejerciciosMap[dia.id] = ejs || []
      }
      setEjerciciosPorDia(ejerciciosMap)
    }
    
    setLoading(false)
  }

  async function agregarDia() {
    if (!diaForm.nombre_dia || !plan) return
    
    const { data } = await supabase
      .from('plan_dias')
      .insert({
        plan_id: plan.id,
        dia_semana: diaForm.dia_semana,
        nombre_dia: diaForm.nombre_dia,
        orden: dias.length
      })
      .select()
      .single()
    
    setDias([...dias, data])
    setEjerciciosPorDia({ ...ejerciciosPorDia, [data.id]: [] })
    setDiaForm({ dia_semana: 'lunes', nombre_dia: '' })
    setShowAddDia(false)
    setMsg('Día agregado ✓')
    setTimeout(() => setMsg(''), 2000)
  }

  async function eliminarDia(diaId) {
    if (!confirm('¿Eliminar este día y todos sus ejercicios?')) return
    await supabase.from('plan_dias').delete().eq('id', diaId)
    setDias(dias.filter(d => d.id !== diaId))
    const nuevoMap = { ...ejerciciosPorDia }
    delete nuevoMap[diaId]
    setEjerciciosPorDia(nuevoMap)
    setMsg('Día eliminado ✓')
    setTimeout(() => setMsg(''), 2000)
  }

  async function agregarEjercicio() {
    if (!ejercicioForm.ejercicio_id || !showAddEjercicio) return
    
    const ejercicios = ejerciciosPorDia[showAddEjercicio] || []
    
    const { data } = await supabase
      .from('plan_ejercicios')
      .insert({
        dia_id: showAddEjercicio,
        ejercicio_id: ejercicioForm.ejercicio_id,
        series_planificadas: parseInt(ejercicioForm.series_planificadas) || 4,
        reps_planificadas: ejercicioForm.reps_planificadas,
        peso_planificado_kg: parseFloat(ejercicioForm.peso_planificado_kg) || null,
        rir_planificado: parseInt(ejercicioForm.rir_planificado) || 2,
        notas: ejercicioForm.notas,
        orden: ejercicios.length
      })
      .select('*, ejercicios_catalogo(nombre, grupo_muscular, video_url)')
      .single()
    
    setEjerciciosPorDia({ 
      ...ejerciciosPorDia, 
      [showAddEjercicio]: [...ejercicios, data] 
    })
    
    setEjercicioForm({ ejercicio_id: '', series_planificadas: 4, reps_planificadas: '8-12', peso_planificado_kg: '', rir_planificado: 2, notas: '' })
    setBusquedaCatalogo('')
    setShowAddEjercicio(null)
    setMsg('Ejercicio agregado ✓')
    setTimeout(() => setMsg(''), 2000)
  }

  async function actualizarEjercicio() {
    if (!showEditEjercicio) return
    
    await supabase
      .from('plan_ejercicios')
      .update({
        series_planificadas: parseInt(ejercicioForm.series_planificadas) || 4,
        reps_planificadas: ejercicioForm.reps_planificadas,
        peso_planificado_kg: parseFloat(ejercicioForm.peso_planificado_kg) || null,
        rir_planificado: parseInt(ejercicioForm.rir_planificado) || 2,
        notas: ejercicioForm.notas
      })
      .eq('id', showEditEjercicio.id)
    
    setShowEditEjercicio(null)
    setEjercicioForm({ ejercicio_id: '', series_planificadas: 4, reps_planificadas: '8-12', peso_planificado_kg: '', rir_planificado: 2, notas: '' })
    setMsg('Ejercicio actualizado ✓')
    cargarTodo()
    setTimeout(() => setMsg(''), 2000)
  }

  async function eliminarEjercicio(ejId, diaId) {
    if (!confirm('¿Eliminar este ejercicio?')) return
    await supabase.from('plan_ejercicios').delete().eq('id', ejId)
    setEjerciciosPorDia({ 
      ...ejerciciosPorDia, 
      [diaId]: ejerciciosPorDia[diaId].filter(e => e.id !== ejId) 
    })
    setMsg('Ejercicio eliminado ✓')
    setTimeout(() => setMsg(''), 2000)
  }

  async function crearEjercicioCatalogo() {
    if (!crearEjForm.nombre) return
    
    const { data, error } = await supabase
      .from('ejercicios_catalogo')
      .insert(crearEjForm)
      .select()
      .single()
    
    if (error) {
      setMsg('Error: ' + error.message)
      return
    }
    
    setCatalogo([...catalogo, data])
    setCrearEjForm({ nombre: '', grupo_muscular: 'Pecho', video_url: '' })
    setShowCrearEjercicio(false)
    setMsg('Ejercicio creado en el catálogo ✓')
    setTimeout(() => setMsg(''), 2000)
  }

  async function actualizarVideoCatalogo() {
    if (!showEditarVideo) return
    
    await supabase
      .from('ejercicios_catalogo')
      .update({ video_url: videoUrlForm })
      .eq('id', showEditarVideo.id)
    
    setShowEditarVideo(null)
    setVideoUrlForm('')
    setMsg('Video actualizado ✓')
    cargarTodo()
    setTimeout(() => setMsg(''), 2000)
  }

  function abrirEditEjercicio(ej) {
    setEjercicioForm({
      ejercicio_id: ej.ejercicio_id,
      series_planificadas: ej.series_planificadas,
      reps_planificadas: ej.reps_planificadas,
      peso_planificado_kg: ej.peso_planificado_kg || '',
      rir_planificado: ej.rir_planificado,
      notas: ej.notas || ''
    })
    setShowEditEjercicio(ej)
  }

  const catalogoFiltrado = busquedaCatalogo
    ? catalogo.filter(e => e.nombre.toLowerCase().includes(busquedaCatalogo.toLowerCase()) || e.grupo_muscular.toLowerCase().includes(busquedaCatalogo.toLowerCase()))
    : catalogo

  if (loading) {
    return (
      <div style={s.page}>
        <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Cargando...</div>
      </div>
    )
  }

  return (
    <div style={s.page}>
      <header style={s.header}>
        <button style={s.backBtn} onClick={() => navigate('/mis-alumnos')}>← Alumnos</button>
        <div style={s.logo}>PLAN ENTRENAMIENTO</div>
        <div style={{ width: 80 }}></div>
      </header>

      <main style={s.main}>
        <div style={s.alumnoBox}>
          👀 Editando plan de: <strong>{alumno?.nombre}</strong>
        </div>

        {msg && <div style={s.success}>{msg}</div>}

        {dias.length === 0 ? (
          <div style={s.card}>
            <div style={s.empty}>
              📋 Este alumno no tiene días en su plan todavía.<br/>
              Empezá agregando un día (ej: "Lunes - Pierna").
            </div>
            <button style={{ ...s.btnFull, marginTop: 12 }} onClick={() => setShowAddDia(true)}>
              + Agregar primer día
            </button>
          </div>
        ) : (
          <>
            {dias.map(dia => {
              const ejs = ejerciciosPorDia[dia.id] || []
              return (
                <div key={dia.id} style={s.diaCard}>
                  <div style={s.diaHeader}>
                    <div>
                      <div style={s.diaNombre}>{dia.nombre_dia}</div>
                      <div style={s.diaSub}>{DIAS_SEMANA.find(d => d.id === dia.dia_semana)?.nombre}</div>
                    </div>
                    <button style={s.btnDanger} onClick={() => eliminarDia(dia.id)}>🗑️</button>
                  </div>
                  
                  {ejs.length === 0 ? (
                    <div style={{ padding: '14px 16px', color: '#666', fontSize: 12, fontStyle: 'italic' }}>
                      Sin ejercicios todavía
                    </div>
                  ) : ejs.map(ej => (
                    <div key={ej.id} style={s.ejercicioRow}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={s.ejercicioNombre}>
                          {ej.ejercicios_catalogo?.video_url && '🎬 '}
                          {ej.ejercicios_catalogo?.nombre}
                        </div>
                        <div style={s.ejercicioMeta}>
                          {ej.series_planificadas}×{ej.reps_planificadas}
                          {ej.peso_planificado_kg && ` · ${ej.peso_planificado_kg}kg`}
                          {' · RIR ' + ej.rir_planificado}
                        </div>
                        {ej.notas && <div style={{ ...s.ejercicioMeta, color: '#999', fontStyle: 'italic' }}>📝 {ej.notas}</div>}
                      </div>
                      <button style={s.btnSm} onClick={() => abrirEditEjercicio(ej)}>✏️</button>
                      <button style={s.btnDanger} onClick={() => eliminarEjercicio(ej.id, dia.id)}>✕</button>
                    </div>
                  ))}
                  
                  <button 
                    style={{ width: '100%', background: 'none', border: 'none', color: '#f5e642', padding: '12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', borderTop: '1px solid #222' }} 
                    onClick={() => setShowAddEjercicio(dia.id)}
                  >
                    + Agregar ejercicio
                  </button>
                </div>
              )
            })}
            
            <button style={{ ...s.btnFull, marginTop: 14 }} onClick={() => setShowAddDia(true)}>
              + Agregar otro día
            </button>
          </>
        )}
        
        <div style={{ marginTop: 30, padding: 16, background: '#0d0d0d', borderRadius: 10, border: '1px solid #222' }}>
          <div style={{ fontSize: 11, color: '#666', marginBottom: 8 }}>HERRAMIENTAS</div>
          <button style={{ ...s.btn, marginRight: 8 }} onClick={() => setShowCrearEjercicio(true)}>
            ➕ Crear ejercicio nuevo
          </button>
        </div>
      </main>

      {/* MODAL: Agregar día */}
      {showAddDia && (
        <div style={s.modal} onClick={() => setShowAddDia(false)}>
          <div style={s.modalContent} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div style={s.modalTitle}>📅 Agregar día al plan</div>
              <button style={s.closeBtn} onClick={() => setShowAddDia(false)}>✕</button>
            </div>
            <label style={s.label}>Día de la semana</label>
            <select 
              style={s.select} 
              value={diaForm.dia_semana} 
              onChange={e => setDiaForm({ ...diaForm, dia_semana: e.target.value })}
            >
              {DIAS_SEMANA.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </select>
            <label style={s.label}>Nombre del día (ej: "Pierna", "Pecho/Tríceps")</label>
            <input 
              style={s.input} 
              value={diaForm.nombre_dia} 
              onChange={e => setDiaForm({ ...diaForm, nombre_dia: e.target.value })}
              placeholder="Pierna"
              autoFocus
            />
            <button style={{ ...s.btnFull, marginTop: 16 }} onClick={agregarDia}>
              Agregar día
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Agregar ejercicio */}
      {showAddEjercicio && (
        <div style={s.modal} onClick={() => setShowAddEjercicio(null)}>
          <div style={s.modalContent} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div style={s.modalTitle}>💪 Agregar ejercicio</div>
              <button style={s.closeBtn} onClick={() => setShowAddEjercicio(null)}>✕</button>
            </div>
            
            <label style={s.label}>Buscar en el catálogo</label>
            <input 
              style={s.searchInput} 
              value={busquedaCatalogo} 
              onChange={e => setBusquedaCatalogo(e.target.value)}
              placeholder="Ej: sentadilla, pecho, etc."
            />
            
            <div style={s.catalogoLista}>
              {catalogoFiltrado.map(ej => (
                <div 
                  key={ej.id} 
                  style={s.catalogoItem(ejercicioForm.ejercicio_id === ej.id)}
                  onClick={() => setEjercicioForm({ ...ejercicioForm, ejercicio_id: ej.id })}
                >
                  <div>
                    <div>{ej.video_url && '🎬 '}{ej.nombre}</div>
                  </div>
                  <div style={s.catalogoGrupo}>{ej.grupo_muscular}</div>
                </div>
              ))}
            </div>

            {ejercicioForm.ejercicio_id && (
              <>
                <div style={s.rowGrid}>
                  <div>
                    <label style={s.label}>Series</label>
                    <input 
                      style={s.input} 
                      type="number" 
                      value={ejercicioForm.series_planificadas} 
                      onChange={e => setEjercicioForm({ ...ejercicioForm, series_planificadas: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={s.label}>Reps</label>
                    <input 
                      style={s.input} 
                      value={ejercicioForm.reps_planificadas} 
                      onChange={e => setEjercicioForm({ ...ejercicioForm, reps_planificadas: e.target.value })}
                      placeholder="8-12 o 10"
                    />
                  </div>
                </div>
                <div style={s.rowGrid}>
                  <div>
                    <label style={s.label}>Peso (kg)</label>
                    <input 
                      style={s.input} 
                      type="number" 
                      step="0.5"
                      value={ejercicioForm.peso_planificado_kg} 
                      onChange={e => setEjercicioForm({ ...ejercicioForm, peso_planificado_kg: e.target.value })}
                      placeholder="opcional"
                    />
                  </div>
                  <div>
                    <label style={s.label}>RIR</label>
                    <input 
                      style={s.input} 
                      type="number" 
                      value={ejercicioForm.rir_planificado} 
                      onChange={e => setEjercicioForm({ ...ejercicioForm, rir_planificado: e.target.value })}
                    />
                  </div>
                </div>
                <label style={s.label}>Notas</label>
                <textarea 
                  style={s.textarea} 
                  value={ejercicioForm.notas} 
                  onChange={e => setEjercicioForm({ ...ejercicioForm, notas: e.target.value })}
                  placeholder="Tempo 3-1-1, descanso 90s, etc."
                />
                <button style={{ ...s.btnFull, marginTop: 16 }} onClick={agregarEjercicio}>
                  Agregar al plan
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Editar ejercicio */}
      {showEditEjercicio && (
        <div style={s.modal} onClick={() => setShowEditEjercicio(null)}>
          <div style={s.modalContent} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div style={s.modalTitle}>✏️ Editar: {showEditEjercicio.ejercicios_catalogo?.nombre}</div>
              <button style={s.closeBtn} onClick={() => setShowEditEjercicio(null)}>✕</button>
            </div>
            <div style={s.rowGrid}>
              <div>
                <label style={s.label}>Series</label>
                <input style={s.input} type="number" value={ejercicioForm.series_planificadas} onChange={e => setEjercicioForm({ ...ejercicioForm, series_planificadas: e.target.value })} />
              </div>
              <div>
                <label style={s.label}>Reps</label>
                <input style={s.input} value={ejercicioForm.reps_planificadas} onChange={e => setEjercicioForm({ ...ejercicioForm, reps_planificadas: e.target.value })} />
              </div>
            </div>
            <div style={s.rowGrid}>
              <div>
                <label style={s.label}>Peso (kg)</label>
                <input style={s.input} type="number" step="0.5" value={ejercicioForm.peso_planificado_kg} onChange={e => setEjercicioForm({ ...ejercicioForm, peso_planificado_kg: e.target.value })} />
              </div>
              <div>
                <label style={s.label}>RIR</label>
                <input style={s.input} type="number" value={ejercicioForm.rir_planificado} onChange={e => setEjercicioForm({ ...ejercicioForm, rir_planificado: e.target.value })} />
              </div>
            </div>
            <label style={s.label}>Notas</label>
            <textarea style={s.textarea} value={ejercicioForm.notas} onChange={e => setEjercicioForm({ ...ejercicioForm, notas: e.target.value })} />
            
            <button 
              style={{ ...s.btnSm, marginTop: 12, marginBottom: 12, background: 'rgba(96,165,250,0.1)', color: '#60a5fa', border: '1px solid #60a5fa40' }} 
              onClick={() => {
                setVideoUrlForm(showEditEjercicio.ejercicios_catalogo?.video_url || '')
                setShowEditarVideo({ id: showEditEjercicio.ejercicio_id, nombre: showEditEjercicio.ejercicios_catalogo?.nombre })
                setShowEditEjercicio(null)
              }}
            >
              🎬 Asignar/cambiar video
            </button>
            
            <button style={s.btnFull} onClick={actualizarEjercicio}>
              Guardar cambios
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Crear ejercicio nuevo en el catálogo */}
      {showCrearEjercicio && (
        <div style={s.modal} onClick={() => setShowCrearEjercicio(false)}>
          <div style={s.modalContent} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div style={s.modalTitle}>➕ Crear ejercicio nuevo</div>
              <button style={s.closeBtn} onClick={() => setShowCrearEjercicio(false)}>✕</button>
            </div>
            <label style={s.label}>Nombre del ejercicio</label>
            <input 
              style={s.input} 
              value={crearEjForm.nombre} 
              onChange={e => setCrearEjForm({ ...crearEjForm, nombre: e.target.value })}
              placeholder="Ej: Sentadilla con peso corporal"
              autoFocus
            />
            <label style={s.label}>Grupo muscular</label>
            <select 
              style={s.select} 
              value={crearEjForm.grupo_muscular} 
              onChange={e => setCrearEjForm({ ...crearEjForm, grupo_muscular: e.target.value })}
            >
              <option value="Pecho">Pecho</option>
              <option value="Pierna">Pierna</option>
              <option value="Glúteo">Glúteo</option>
              <option value="Espalda">Espalda</option>
              <option value="Hombros">Hombros</option>
              <option value="Bíceps">Bíceps</option>
              <option value="Tríceps">Tríceps</option>
              <option value="Core">Core</option>
              <option value="Pantorrilla">Pantorrilla</option>
              <option value="Antebrazo">Antebrazo</option>
              <option value="Trapecio">Trapecio</option>
              <option value="Cardio">Cardio</option>
              <option value="Otro">Otro</option>
            </select>
            <label style={s.label}>URL de video (opcional)</label>
            <input 
              style={s.input} 
              value={crearEjForm.video_url} 
              onChange={e => setCrearEjForm({ ...crearEjForm, video_url: e.target.value })}
              placeholder="https://youtu.be/... o IG, etc."
            />
            <button style={{ ...s.btnFull, marginTop: 16 }} onClick={crearEjercicioCatalogo}>
              Crear ejercicio
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Editar video del ejercicio */}
      {showEditarVideo && (
        <div style={s.modal} onClick={() => setShowEditarVideo(null)}>
          <div style={s.modalContent} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div style={s.modalTitle}>🎬 Video de: {showEditarVideo.nombre}</div>
              <button style={s.closeBtn} onClick={() => setShowEditarVideo(null)}>✕</button>
            </div>
            <label style={s.label}>URL del video</label>
            <input 
              style={s.input} 
              value={videoUrlForm} 
              onChange={e => setVideoUrlForm(e.target.value)}
              placeholder="https://youtu.be/..."
              autoFocus
            />
            <div style={{ fontSize: 11, color: '#666', marginTop: 8 }}>
              Acepta YouTube, Instagram, Vimeo, o cualquier URL.
            </div>
            <button style={{ ...s.btnFull, marginTop: 16 }} onClick={actualizarVideoCatalogo}>
              Guardar video
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
