import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const s = {
  page: { minHeight: '100vh', background: '#0a0a0a', fontFamily: "'DM Sans', sans-serif", paddingBottom: 80, color: '#f0f0f0' },
  header: { background: '#111', borderBottom: '1px solid #222', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 },
  logo: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 2, color: '#f5e642' },
  backBtn: { background: 'none', border: '1px solid #222', color: '#888', borderRadius: 8, padding: '6px 14px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' },
  main: { maxWidth: 720, margin: '0 auto', padding: '20px 16px' },
  
  diaSelector: { background: '#111', border: '1px solid #222', borderRadius: 12, padding: 12, marginBottom: 14, display: 'flex', gap: 6, overflowX: 'auto' },
  diaTab: (selected) => ({
    background: selected ? '#f5e642' : '#1a1a1a',
    color: selected ? '#000' : '#888',
    border: 'none',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  }),
  
  diaTitulo: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 2, color: '#f5e642', marginBottom: 4 },
  diaSubtitulo: { fontSize: 13, color: '#888', marginBottom: 18 },
  
  ejercicioCard: { background: '#111', border: '1px solid #222', borderRadius: 12, marginBottom: 12, overflow: 'hidden' },
  ejercicioHeader: { padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  ejercicioInfo: { flex: 1 },
  ejercicioNombre: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 1, color: '#f0f0f0', marginBottom: 4 },
  ejercicioGrupo: { fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 1 },
  ejercicioPlan: { padding: '10px 16px', background: '#0d0d0d', borderTop: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a', fontSize: 13, color: '#999' },
  ejercicioNotas: { padding: '8px 16px', fontSize: 12, color: '#888', fontStyle: 'italic', borderTop: '1px solid #1a1a1a' },
  
  videoBtn: { background: 'rgba(96,165,250,0.15)', color: '#60a5fa', border: '1px solid #60a5fa40', borderRadius: 6, padding: '6px 12px', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, textDecoration: 'none', display: 'inline-block' },
  
  btnCompletar: { width: '100%', background: '#f5e642', color: '#000', border: 'none', padding: '14px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: 1 },
  btnCompletarHecho: { width: '100%', background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: 'none', padding: '14px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: 1 },
  
  empty: { textAlign: 'center', color: '#666', padding: '60px 20px', fontSize: 14 },
  
  // Modal
  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'flex-end' },
  modalContent: { background: '#111', width: '100%', maxHeight: '92vh', borderRadius: '16px 16px 0 0', overflowY: 'auto', padding: 20 },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #222', gap: 10 },
  modalTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 1, color: '#f0f0f0' },
  modalSub: { fontSize: 12, color: '#888', marginTop: 4 },
  closeBtn: { background: 'none', border: 'none', color: '#888', fontSize: 24, cursor: 'pointer', padding: 4 },
  
  videoEmbed: { width: '100%', aspectRatio: '16/9', borderRadius: 8, marginBottom: 14, background: '#000', border: 'none' },
  
  serieCard: { background: '#0d0d0d', border: '1px solid #222', borderRadius: 10, padding: '14px', marginBottom: 10 },
  serieTitulo: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, color: '#f5e642', letterSpacing: 1, marginBottom: 10, textAlign: 'center' },
  
  campoSerie: { marginBottom: 12 },
  campoLabel: { fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, textAlign: 'center', fontWeight: 700 },
  flechasRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 },
  flecha: { background: '#1a1a1a', border: '1px solid #f5e64240', borderRadius: 8, color: '#f5e642', fontSize: 18, width: 38, height: 38, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', userSelect: 'none', flexShrink: 0 },
  flechaInput: { width: 70, background: '#0a0a0a', border: '1px solid #f5e642', borderRadius: 8, padding: '8px', color: '#f5e642', fontSize: 18, textAlign: 'center', outline: 'none', fontFamily: "'Bebas Neue', sans-serif", fontWeight: 700 },
  flechaUnidad: { fontSize: 11, color: '#666', minWidth: 24 },
  
  agregarSerieBtn: { width: '100%', background: 'rgba(245,230,66,0.1)', color: '#f5e642', border: '1px dashed #f5e64240', borderRadius: 8, padding: '12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 },
  
  guardarBtn: { width: '100%', background: '#f5e642', color: '#000', border: 'none', borderRadius: 8, padding: '14px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' },
  
  success: { color: '#4ade80', fontSize: 13, marginBottom: 12, padding: '10px 14px', background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 8 },
  
  // Resumen último entrenamiento
  ultimoBox: { background: 'rgba(74,222,128,0.05)', border: '1px solid #4ade8030', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 12, color: '#4ade80' },
}

const DIAS_SEMANA = [
  { id: 'lunes', nombre: 'Lun' },
  { id: 'martes', nombre: 'Mar' },
  { id: 'miercoles', nombre: 'Mié' },
  { id: 'jueves', nombre: 'Jue' },
  { id: 'viernes', nombre: 'Vie' },
  { id: 'sabado', nombre: 'Sáb' },
  { id: 'domingo', nombre: 'Dom' }
]

function fechaHoy() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function diaActualSemana() {
  const dia = new Date().getDay() // 0=domingo, 1=lunes
  const map = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']
  return map[dia]
}

// Convierte URL de YouTube a embed
function getYoutubeEmbed(url) {
  if (!url) return null
  // youtu.be/XXXXX
  let match = url.match(/youtu\.be\/([^?&]+)/)
  if (match) return `https://www.youtube.com/embed/${match[1]}`
  // youtube.com/watch?v=XXXXX
  match = url.match(/[?&]v=([^&]+)/)
  if (match) return `https://www.youtube.com/embed/${match[1]}`
  // youtube.com/shorts/XXXXX
  match = url.match(/youtube\.com\/shorts\/([^?&]+)/)
  if (match) return `https://www.youtube.com/embed/${match[1]}`
  return null
}

export default function MiEntrenamiento({ perfil }) {
  const navigate = useNavigate()
  
  const [plan, setPlan] = useState(null)
  const [dias, setDias] = useState([])
  const [diaSeleccionado, setDiaSeleccionado] = useState(null)
  const [ejerciciosDelDia, setEjerciciosDelDia] = useState([])
  const [registrosHoy, setRegistrosHoy] = useState({})
  const [ultimoRegistro, setUltimoRegistro] = useState({})
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)
  
  const [ejActual, setEjActual] = useState(null)
  const [seriesEditando, setSeriesEditando] = useState([])
  
  useEffect(() => {
    cargarPlan()
  }, [])

  async function cargarPlan() {
    setLoading(true)
    
    // Cargar plan activo
    const { data: planData } = await supabase
      .from('planes_entrenamiento')
      .select('*')
      .eq('alumno_id', perfil.id)
      .eq('activo', true)
      .maybeSingle()
    
    setPlan(planData)
    
    if (!planData) {
      setLoading(false)
      return
    }
    
    // Cargar días
    const { data: diasData } = await supabase
      .from('plan_dias')
      .select('*')
      .eq('plan_id', planData.id)
      .order('orden')
    
    setDias(diasData || [])
    
    // Seleccionar día actual o primero
    const hoy = diaActualSemana()
    const diaHoy = (diasData || []).find(d => d.dia_semana === hoy)
    setDiaSeleccionado(diaHoy || diasData?.[0] || null)
    
    setLoading(false)
  }

  useEffect(() => {
    if (diaSeleccionado) {
      cargarEjerciciosDia()
    }
  }, [diaSeleccionado])

  async function cargarEjerciciosDia() {
    if (!diaSeleccionado) return
    
    const { data: ejs } = await supabase
      .from('plan_ejercicios')
      .select('*, ejercicios_catalogo(nombre, grupo_muscular, video_url)')
      .eq('dia_id', diaSeleccionado.id)
      .order('orden')
    
    setEjerciciosDelDia(ejs || [])
    
    // Cargar registros de HOY para cada ejercicio
    const hoy = fechaHoy()
    const idsEj = (ejs || []).map(e => e.id)
    
    if (idsEj.length > 0) {
      const { data: regs } = await supabase
        .from('registros_series')
        .select('*')
        .eq('alumno_id', perfil.id)
        .eq('fecha', hoy)
        .in('plan_ejercicio_id', idsEj)
      
      const mapRegs = {}
      ;(regs || []).forEach(r => {
        if (!mapRegs[r.plan_ejercicio_id]) mapRegs[r.plan_ejercicio_id] = []
        mapRegs[r.plan_ejercicio_id].push(r)
      })
      // Ordenar por número de serie
      Object.keys(mapRegs).forEach(k => {
        mapRegs[k].sort((a, b) => a.numero_serie - b.numero_serie)
      })
      setRegistrosHoy(mapRegs)
      
      // Cargar último registro de cada ejercicio (no de hoy)
      const ultimoMap = {}
      for (const ej of ejs) {
        const { data: ult } = await supabase
          .from('registros_series')
          .select('*')
          .eq('alumno_id', perfil.id)
          .eq('plan_ejercicio_id', ej.id)
          .neq('fecha', hoy)
          .order('fecha', { ascending: false })
          .limit(1)
        if (ult && ult[0]) ultimoMap[ej.id] = ult[0]
      }
      setUltimoRegistro(ultimoMap)
    }
  }

  function abrirEjercicio(ej) {
    setEjActual(ej)
    
    // Si ya tiene registros de hoy, los cargamos
    const yaRegistrados = registrosHoy[ej.id] || []
    
    if (yaRegistrados.length > 0) {
      setSeriesEditando(yaRegistrados.map(r => ({
        numero_serie: r.numero_serie,
        reps: r.reps_hechas,
        peso: r.peso_kg,
        rir: r.rir,
        notas: r.notas || ''
      })))
    } else {
      // Crear N series basado en lo planificado, prellenando con datos del último registro o del plan
      const ult = ultimoRegistro[ej.id]
      const series = []
      for (let i = 1; i <= ej.series_planificadas; i++) {
        series.push({
          numero_serie: i,
          reps: ult?.reps_hechas || parseInt(ej.reps_planificadas) || 10,
          peso: ult?.peso_kg || ej.peso_planificado_kg || 0,
          rir: ej.rir_planificado || 2,
          notas: ''
        })
      }
      setSeriesEditando(series)
    }
  }

  function actualizarSerie(idx, campo, valor) {
    const nuevas = [...seriesEditando]
    nuevas[idx][campo] = valor
    setSeriesEditando(nuevas)
  }

  function ajustarValor(idx, campo, delta) {
    const nuevas = [...seriesEditando]
    const actual = parseFloat(nuevas[idx][campo]) || 0
    let nuevo = actual + delta
    if (nuevo < 0) nuevo = 0
    nuevas[idx][campo] = nuevo
    setSeriesEditando(nuevas)
  }

  function agregarSerieExtra() {
    const nuevoNumero = seriesEditando.length + 1
    const ultima = seriesEditando[seriesEditando.length - 1] || { reps: 10, peso: 0, rir: 2 }
    setSeriesEditando([...seriesEditando, {
      numero_serie: nuevoNumero,
      reps: ultima.reps,
      peso: ultima.peso,
      rir: ultima.rir,
      notas: ''
    }])
  }

  function eliminarSerie(idx) {
    const nuevas = seriesEditando.filter((_, i) => i !== idx)
    // Renumerar
    nuevas.forEach((s, i) => s.numero_serie = i + 1)
    setSeriesEditando(nuevas)
  }

  async function guardarEntrenamiento() {
    if (!ejActual || seriesEditando.length === 0) return
    
    const hoy = fechaHoy()
    
    // Eliminar registros previos de hoy para este ejercicio
    await supabase
      .from('registros_series')
      .delete()
      .eq('alumno_id', perfil.id)
      .eq('plan_ejercicio_id', ejActual.id)
      .eq('fecha', hoy)
    
    // Insertar los nuevos
    const inserts = seriesEditando.map(s => ({
      alumno_id: perfil.id,
      plan_ejercicio_id: ejActual.id,
      fecha: hoy,
      numero_serie: s.numero_serie,
      reps_hechas: parseInt(s.reps) || 0,
      peso_kg: parseFloat(s.peso) || 0,
      rir: parseInt(s.rir) || 0,
      notas: s.notas
    }))
    
    await supabase.from('registros_series').insert(inserts)
    
    setEjActual(null)
    setSeriesEditando([])
    setMsg('Entrenamiento guardado ✓')
    cargarEjerciciosDia()
    setTimeout(() => setMsg(''), 2000)
  }

  if (loading) {
    return (
      <div style={s.page}>
        <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Cargando...</div>
      </div>
    )
  }

  if (!plan || dias.length === 0) {
    return (
      <div style={s.page}>
        <header style={s.header}>
          <button style={s.backBtn} onClick={() => navigate('/seguimiento')}>← Volver</button>
          <div style={s.logo}>MI ENTRENAMIENTO</div>
          <div style={{ width: 80 }}></div>
        </header>
        <main style={s.main}>
          <div style={s.empty}>
            🏋️ Tu plan de entrenamiento todavía no fue creado.<br/><br/>
            Avisale a tu coach para que te lo arme. 💪
          </div>
        </main>
      </div>
    )
  }

  const videoEmbed = ejActual?.ejercicios_catalogo?.video_url ? getYoutubeEmbed(ejActual.ejercicios_catalogo.video_url) : null

  return (
    <div style={s.page}>
      <header style={s.header}>
        <button style={s.backBtn} onClick={() => navigate('/seguimiento')}>← Volver</button>
        <div style={s.logo}>MI ENTRENAMIENTO</div>
        <div style={{ width: 80 }}></div>
      </header>

      <main style={s.main}>
        {msg && <div style={s.success}>{msg}</div>}

        {/* Selector de días */}
        <div style={s.diaSelector}>
          {dias.map(dia => (
            <button 
              key={dia.id} 
              style={s.diaTab(diaSeleccionado?.id === dia.id)}
              onClick={() => setDiaSeleccionado(dia)}
            >
              {DIAS_SEMANA.find(d => d.id === dia.dia_semana)?.nombre || dia.dia_semana.substring(0, 3)}
            </button>
          ))}
        </div>

        {diaSeleccionado && (
          <>
            <div style={s.diaTitulo}>{diaSeleccionado.nombre_dia}</div>
            <div style={s.diaSubtitulo}>{ejerciciosDelDia.length} ejercicios planificados</div>

            {ejerciciosDelDia.length === 0 ? (
              <div style={s.empty}>
                Este día no tiene ejercicios todavía.<br/>
                Avisale a tu coach. 💬
              </div>
            ) : ejerciciosDelDia.map(ej => {
              const yaHecho = (registrosHoy[ej.id] || []).length > 0
              return (
                <div key={ej.id} style={s.ejercicioCard}>
                  <div style={s.ejercicioHeader}>
                    <div style={s.ejercicioInfo}>
                      <div style={s.ejercicioNombre}>{ej.ejercicios_catalogo?.nombre}</div>
                      <div style={s.ejercicioGrupo}>{ej.ejercicios_catalogo?.grupo_muscular}</div>
                    </div>
                    {ej.ejercicios_catalogo?.video_url && (
                      <a href={ej.ejercicios_catalogo.video_url} target="_blank" rel="noopener noreferrer" style={s.videoBtn}>
                        🎬 Ver video
                      </a>
                    )}
                  </div>
                  <div style={s.ejercicioPlan}>
                    📋 {ej.series_planificadas} × {ej.reps_planificadas}
                    {ej.peso_planificado_kg && ` · ${ej.peso_planificado_kg}kg`}
                    {' · RIR ' + ej.rir_planificado}
                  </div>
                  {ej.notas && <div style={s.ejercicioNotas}>📝 {ej.notas}</div>}
                  
                  <button 
                    style={yaHecho ? s.btnCompletarHecho : s.btnCompletar} 
                    onClick={() => abrirEjercicio(ej)}
                  >
                    {yaHecho ? '✓ Completado - Ver/Editar' : '✓ Completar ejercicio'}
                  </button>
                </div>
              )
            })}
          </>
        )}
      </main>

      {/* Modal completar ejercicio */}
      {ejActual && (
        <div style={s.modal} onClick={() => setEjActual(null)}>
          <div style={s.modalContent} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div>
                <div style={s.modalTitle}>{ejActual.ejercicios_catalogo?.nombre}</div>
                <div style={s.modalSub}>
                  Planificado: {ejActual.series_planificadas}×{ejActual.reps_planificadas}
                  {ejActual.peso_planificado_kg && ` · ${ejActual.peso_planificado_kg}kg`}
                  {' · RIR ' + ejActual.rir_planificado}
                </div>
              </div>
              <button style={s.closeBtn} onClick={() => setEjActual(null)}>✕</button>
            </div>

            {/* Video */}
            {videoEmbed && (
              <iframe 
                src={videoEmbed} 
                style={s.videoEmbed}
                title="Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
            {!videoEmbed && ejActual.ejercicios_catalogo?.video_url && (
              <a 
                href={ejActual.ejercicios_catalogo.video_url} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ ...s.videoBtn, display: 'block', textAlign: 'center', marginBottom: 14, padding: 12 }}
              >
                🎬 Ver video del ejercicio
              </a>
            )}

            {/* Último registro */}
            {ultimoRegistro[ejActual.id] && (
              <div style={s.ultimoBox}>
                💡 Último registro: {ultimoRegistro[ejActual.id].reps_hechas} reps × {ultimoRegistro[ejActual.id].peso_kg}kg (RIR {ultimoRegistro[ejActual.id].rir})
              </div>
            )}

            {/* Series */}
            {seriesEditando.map((serie, idx) => (
              <div key={idx} style={s.serieCard}>
                <div style={s.serieTitulo}>SERIE {serie.numero_serie}</div>
                
                <div style={s.campoSerie}>
                  <div style={s.campoLabel}>Repeticiones</div>
                  <div style={s.flechasRow}>
                    <button style={s.flecha} onClick={() => ajustarValor(idx, 'reps', -1)}>◀</button>
                    <input 
                      type="number" 
                      style={s.flechaInput} 
                      value={serie.reps} 
                      onChange={e => actualizarSerie(idx, 'reps', e.target.value)}
                    />
                    <button style={s.flecha} onClick={() => ajustarValor(idx, 'reps', 1)}>▶</button>
                  </div>
                </div>
                
                <div style={s.campoSerie}>
                  <div style={s.campoLabel}>Peso (kg)</div>
                  <div style={s.flechasRow}>
                    <button style={s.flecha} onClick={() => ajustarValor(idx, 'peso', -2.5)}>◀</button>
                    <input 
                      type="number" 
                      step="0.5" 
                      style={s.flechaInput} 
                      value={serie.peso} 
                      onChange={e => actualizarSerie(idx, 'peso', e.target.value)}
                    />
                    <button style={s.flecha} onClick={() => ajustarValor(idx, 'peso', 2.5)}>▶</button>
                  </div>
                </div>
                
                <div style={s.campoSerie}>
                  <div style={s.campoLabel}>RIR (Reps in Reserve)</div>
                  <div style={s.flechasRow}>
                    <button style={s.flecha} onClick={() => ajustarValor(idx, 'rir', -1)}>◀</button>
                    <input 
                      type="number" 
                      style={s.flechaInput} 
                      value={serie.rir} 
                      onChange={e => actualizarSerie(idx, 'rir', e.target.value)}
                    />
                    <button style={s.flecha} onClick={() => ajustarValor(idx, 'rir', 1)}>▶</button>
                  </div>
                </div>
                
                {seriesEditando.length > 1 && (
                  <button 
                    style={{ background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', border: '1px solid rgba(255,77,77,0.2)', borderRadius: 6, padding: '6px 12px', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', width: '100%', marginTop: 4 }} 
                    onClick={() => eliminarSerie(idx)}
                  >
                    Eliminar esta serie
                  </button>
                )}
              </div>
            ))}

            <button style={s.agregarSerieBtn} onClick={agregarSerieExtra}>
              + Agregar otra serie
            </button>

            <button style={s.guardarBtn} onClick={guardarEntrenamiento}>
              💾 Guardar entrenamiento
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
