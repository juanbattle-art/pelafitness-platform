import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const GRUPOS = ['Todos', 'Pecho', 'Hombros', 'Tríceps', 'Bíceps', 'Espalda', 'Cuádriceps', 'Isquiotibiales', 'Glúteos', 'Gemelos', 'Abdomen']
const MOMENTOS_COMIDA = ['Desayuno', 'Almuerzo', 'Merienda', 'Cena', 'Pre-entreno', 'Post-entreno']

const s = {
  page: { minHeight: '100vh', background: '#0a0a0a', fontFamily: "'DM Sans', sans-serif", paddingBottom: 80, color: '#f0f0f0' },
  header: { background: '#111', borderBottom: '1px solid #222', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 },
  logo: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 2, color: '#f5e642' },
  backBtn: { background: 'none', border: '1px solid #222', color: '#888', borderRadius: 8, padding: '6px 14px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' },
  main: { maxWidth: 720, margin: '0 auto', padding: '20px 16px' },
  tabs: { display: 'flex', gap: 4, background: '#111', border: '1px solid #222', borderRadius: 12, padding: 6, marginBottom: 20 },
  tab: (a) => ({ flex: 1, padding: '10px 8px', background: a ? '#f5e642' : 'none', color: a ? '#000' : '#666', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center' }),
  card: { background: '#111', border: '1px solid #222', borderRadius: 12, padding: 16, marginBottom: 12 },
  cardTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 1, marginBottom: 12, color: '#f0f0f0' },
  btn: { background: '#f5e642', color: '#000', border: 'none', borderRadius: 8, padding: '12px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' },
  btnFull: { background: '#f5e642', color: '#000', border: 'none', borderRadius: 8, padding: '14px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', width: '100%' },
  btnSm: { background: '#1a1a1a', color: '#f5e642', border: '1px solid #f5e64240', borderRadius: 6, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 },
  btnDanger: { background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', border: '1px solid rgba(255,77,77,0.2)', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' },
  btnGhost: { background: 'none', color: '#888', border: '1px solid #222', borderRadius: 8, padding: '10px 16px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' },
  input: { width: '100%', background: '#0a0a0a', border: '1px solid #222', borderRadius: 8, padding: '10px 14px', color: '#f0f0f0', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' },
  label: { display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#555', marginBottom: 6, marginTop: 12 },
  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'flex-end' },
  modalContent: { background: '#111', width: '100%', maxHeight: '92vh', borderRadius: '16px 16px 0 0', overflowY: 'auto', padding: 20 },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #222' },
  modalTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 1, color: '#f0f0f0' },
  closeBtn: { background: 'none', border: 'none', color: '#888', fontSize: 24, cursor: 'pointer', padding: 4 },
  rutinaCard: { background: '#111', border: '1px solid #222', borderRadius: 12, padding: 16, marginBottom: 12, cursor: 'pointer' },
  empty: { textAlign: 'center', color: '#444', padding: '60px 20px', fontSize: 14 },
  grupoPill: (sel) => ({ padding: '6px 14px', borderRadius: 20, border: `1px solid ${sel ? '#f5e642' : '#222'}`, background: sel ? 'rgba(245,230,66,0.1)' : 'transparent', color: sel ? '#f5e642' : '#666', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' }),
  ejercicioItem: (sel) => ({ padding: '12px 14px', background: sel ? 'rgba(245,230,66,0.08)' : '#0d0d0d', border: `1px solid ${sel ? '#f5e642' : '#222'}`, borderRadius: 10, marginBottom: 8, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }),
  dificultadBadge: (d) => ({ fontSize: 10, padding: '2px 8px', borderRadius: 4, fontWeight: 700, background: d === 'principiante' ? 'rgba(74,222,128,0.15)' : d === 'avanzado' ? 'rgba(255,77,77,0.15)' : 'rgba(245,230,66,0.15)', color: d === 'principiante' ? '#4ade80' : d === 'avanzado' ? '#ff4d4d' : '#f5e642' }),
}

export default function MiRutina({ perfil }) {
  const navigate = useNavigate()
  const [tab, setTab] = useState('rutinas') // 'rutinas' | 'catalogo'
  const [rutinas, setRutinas] = useState([])
  const [catalogo, setCatalogo] = useState([])
  const [loading, setLoading] = useState(true)
  const [grupoFiltro, setGrupoFiltro] = useState('Todos')
  const [busqueda, setBusqueda] = useState('')

  // Modales
  const [modalNuevaRutina, setModalNuevaRutina] = useState(false)
  const [modalDetalle, setModalDetalle] = useState(null) // rutina seleccionada
  const [modalAgregarDia, setModalAgregarDia] = useState(false)
  const [modalAgregarEjercicio, setModalAgregarEjercicio] = useState(null) // dia seleccionado
  const [modalEjercicioDetalle, setModalEjercicioDetalle] = useState(null)

  const [nuevaRutinaForm, setNuevaRutinaForm] = useState({ nombre: '', descripcion: '' })
  const [nuevoDiaNombre, setNuevoDiaNombre] = useState('')
  const [ejercicioConfig, setEjercicioConfig] = useState({ series: 3, repeticiones: '10-12', peso_sugerido: '', notas: '' })
  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState(null)
  const [saving, setSaving] = useState(false)
  const [diasRutina, setDiasRutina] = useState([])

  useEffect(() => { cargarTodo() }, [])

  async function cargarTodo() {
    setLoading(true)
    const [{ data: r }, { data: c }] = await Promise.all([
      supabase.from('rutinas').select('*').eq('alumno_id', perfil.id).order('created_at', { ascending: false }),
      supabase.from('ejercicios_catalogo').select('*').order('grupo_muscular').order('nombre')
    ])
    setRutinas(r || [])
    setCatalogo(c || [])
    setLoading(false)
  }

  async function cargarDiasRutina(rutinaId) {
    const { data: dias } = await supabase.from('rutina_dias').select('*, rutina_ejercicios(*, ejercicios_catalogo(*))').eq('rutina_id', rutinaId).order('orden')
    setDiasRutina(dias || [])
  }

  async function crearRutina() {
    if (!nuevaRutinaForm.nombre.trim()) return
    setSaving(true)
    const { data } = await supabase.from('rutinas').insert({ ...nuevaRutinaForm, alumno_id: perfil.id }).select().single()
    if (data) {
      setRutinas(prev => [data, ...prev])
      setModalNuevaRutina(false)
      setNuevaRutinaForm({ nombre: '', descripcion: '' })
      setModalDetalle(data)
      setDiasRutina([])
    }
    setSaving(false)
  }

  async function eliminarRutina(id) {
    if (!window.confirm('¿Eliminar esta rutina?')) return
    await supabase.from('rutinas').delete().eq('id', id)
    setRutinas(prev => prev.filter(r => r.id !== id))
    setModalDetalle(null)
  }

  async function agregarDia() {
    if (!nuevoDiaNombre.trim() || !modalDetalle) return
    setSaving(true)
    const { data } = await supabase.from('rutina_dias').insert({ rutina_id: modalDetalle.id, nombre: nuevoDiaNombre, orden: diasRutina.length }).select().single()
    if (data) {
      setDiasRutina(prev => [...prev, { ...data, rutina_ejercicios: [] }])
      setNuevoDiaNombre('')
      setModalAgregarDia(false)
    }
    setSaving(false)
  }

  async function eliminarDia(diaId) {
    await supabase.from('rutina_dias').delete().eq('id', diaId)
    setDiasRutina(prev => prev.filter(d => d.id !== diaId))
  }

  async function agregarEjercicioADia() {
    if (!ejercicioSeleccionado || !modalAgregarEjercicio) return
    setSaving(true)
    const { data } = await supabase.from('rutina_ejercicios').insert({
      dia_id: modalAgregarEjercicio.id,
      ejercicio_id: ejercicioSeleccionado.id,
      series: ejercicioConfig.series,
      repeticiones: ejercicioConfig.repeticiones,
      peso_sugerido: ejercicioConfig.peso_sugerido,
      notas: ejercicioConfig.notas,
      orden: modalAgregarEjercicio.rutina_ejercicios?.length || 0
    }).select('*, ejercicios_catalogo(*)').single()
    if (data) {
      setDiasRutina(prev => prev.map(d => d.id === modalAgregarEjercicio.id
        ? { ...d, rutina_ejercicios: [...(d.rutina_ejercicios || []), data] }
        : d
      ))
      setModalAgregarEjercicio(null)
      setEjercicioSeleccionado(null)
      setEjercicioConfig({ series: 3, repeticiones: '10-12', peso_sugerido: '', notas: '' })
    }
    setSaving(false)
  }

  async function eliminarEjercicioDelDia(diaId, ejercicioId) {
    await supabase.from('rutina_ejercicios').delete().eq('id', ejercicioId)
    setDiasRutina(prev => prev.map(d => d.id === diaId
      ? { ...d, rutina_ejercicios: d.rutina_ejercicios.filter(e => e.id !== ejercicioId) }
      : d
    ))
  }

  const catalogoFiltrado = catalogo.filter(e => {
    const matchGrupo = grupoFiltro === 'Todos' || e.grupo_muscular.includes(grupoFiltro)
    const matchBusqueda = e.nombre.toLowerCase().includes(busqueda.toLowerCase()) || e.grupo_muscular.toLowerCase().includes(busqueda.toLowerCase())
    return matchGrupo && matchBusqueda
  })

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={s.logo}>PELAFITNESS</div>
        <button style={s.backBtn} onClick={() => navigate('/')}>← Volver</button>
      </header>

      <main style={s.main}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, letterSpacing: 1, color: '#f0f0f0' }}>Mi Entrenamiento</div>
          <div style={{ fontSize: 13, color: '#555' }}>Armá tus rutinas y explorá ejercicios</div>
        </div>

        <div style={s.tabs}>
          <button style={s.tab(tab === 'rutinas')} onClick={() => setTab('rutinas')}>💪 Mis Rutinas</button>
          <button style={s.tab(tab === 'catalogo')} onClick={() => setTab('catalogo')}>📚 Ejercicios</button>
        </div>

        {/* TAB RUTINAS */}
        {tab === 'rutinas' && (
          <>
            <button style={{ ...s.btnFull, marginBottom: 16 }} onClick={() => setModalNuevaRutina(true)}>
              + Nueva Rutina
            </button>

            {loading ? (
              <div style={s.empty}>Cargando...</div>
            ) : rutinas.length === 0 ? (
              <div style={s.empty}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🏋️</div>
                <div>Todavía no creaste ninguna rutina.<br />Tocá "Nueva Rutina" para empezar.</div>
              </div>
            ) : (
              rutinas.map(r => (
                <div key={r.id} style={s.rutinaCard} onClick={() => { setModalDetalle(r); cargarDiasRutina(r.id) }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 1, color: '#f5e642' }}>{r.nombre}</div>
                      {r.descripcion && <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{r.descripcion}</div>}
                    </div>
                    <div style={{ color: '#f5e642', fontSize: 20 }}>›</div>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* TAB CATÁLOGO */}
        {tab === 'catalogo' && (
          <>
            <input
              style={{ ...s.input, marginBottom: 12 }}
              placeholder="🔍 Buscar ejercicio..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, marginBottom: 12 }}>
              {GRUPOS.map(g => (
                <button key={g} style={s.grupoPill(grupoFiltro === g)} onClick={() => setGrupoFiltro(g)}>{g}</button>
              ))}
            </div>
            <div style={{ fontSize: 12, color: '#444', marginBottom: 12 }}>{catalogoFiltrado.length} ejercicios</div>
            {catalogoFiltrado.map(e => (
              <div key={e.id} style={s.ejercicioItem(false)} onClick={() => setModalEjercicioDetalle(e)}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#f0f0f0' }}>{e.nombre}</div>
                  <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{e.grupo_muscular} {e.equipo ? `· ${e.equipo}` : ''}</div>
                </div>
                <span style={s.dificultadBadge(e.dificultad)}>{e.dificultad}</span>
              </div>
            ))}
          </>
        )}
      </main>

      {/* MODAL NUEVA RUTINA */}
      {modalNuevaRutina && (
        <div style={s.modal} onClick={() => setModalNuevaRutina(false)}>
          <div style={s.modalContent} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div style={s.modalTitle}>NUEVA RUTINA</div>
              <button style={s.closeBtn} onClick={() => setModalNuevaRutina(false)}>✕</button>
            </div>
            <label style={s.label}>Nombre de la rutina</label>
            <input style={s.input} placeholder="Ej: Rutina Fuerza 4 días" value={nuevaRutinaForm.nombre} onChange={e => setNuevaRutinaForm(p => ({ ...p, nombre: e.target.value }))} />
            <label style={s.label}>Descripción (opcional)</label>
            <input style={s.input} placeholder="Ej: Para ganar músculo" value={nuevaRutinaForm.descripcion} onChange={e => setNuevaRutinaForm(p => ({ ...p, descripcion: e.target.value }))} />
            <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
              <button style={s.btnGhost} onClick={() => setModalNuevaRutina(false)}>Cancelar</button>
              <button style={{ ...s.btn, flex: 1 }} onClick={crearRutina} disabled={saving}>{saving ? 'Guardando...' : 'Crear Rutina'}</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLE RUTINA */}
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

            {diasRutina.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#444', padding: '30px 0', fontSize: 13 }}>
                Todavía no hay días en esta rutina.<br />Agregá un día para empezar.
              </div>
            ) : (
              diasRutina.map(dia => (
                <div key={dia.id} style={{ background: '#0d0d0d', border: '1px solid #222', borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 1, color: '#f5e642' }}>{dia.nombre}</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button style={s.btnSm} onClick={() => { setModalAgregarEjercicio(dia); setEjercicioSeleccionado(null) }}>+ Ejercicio</button>
                      <button style={s.btnDanger} onClick={() => eliminarDia(dia.id)}>✕</button>
                    </div>
                  </div>
                  {(dia.rutina_ejercicios || []).length === 0 ? (
                    <div style={{ padding: '12px 16px', fontSize: 12, color: '#444' }}>Sin ejercicios todavía</div>
                  ) : (
                    (dia.rutina_ejercicios || []).map(ej => (
                      <div key={ej.id} style={{ padding: '10px 16px', borderBottom: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: 13, color: '#f0f0f0', fontWeight: 600 }}>{ej.ejercicios_catalogo?.nombre}</div>
                          <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{ej.series} series × {ej.repeticiones} reps{ej.peso_sugerido ? ` · ${ej.peso_sugerido}` : ''}</div>
                          {ej.notas && <div style={{ fontSize: 11, color: '#666', fontStyle: 'italic', marginTop: 2 }}>{ej.notas}</div>}
                        </div>
                        <button style={s.btnDanger} onClick={() => eliminarEjercicioDelDia(dia.id, ej.id)}>✕</button>
                      </div>
                    ))
                  )}
                </div>
              ))
            )}

            <button style={{ ...s.btnFull, marginTop: 8, marginBottom: 8 }} onClick={() => setModalAgregarDia(true)}>+ Agregar Día</button>
            <button style={{ background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', border: '1px solid rgba(255,77,77,0.2)', borderRadius: 8, padding: '12px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', width: '100%' }} onClick={() => eliminarRutina(modalDetalle.id)}>
              Eliminar Rutina
            </button>
          </div>
        </div>
      )}

      {/* MODAL AGREGAR DÍA */}
      {modalAgregarDia && (
        <div style={s.modal} onClick={() => setModalAgregarDia(false)}>
          <div style={s.modalContent} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div style={s.modalTitle}>NUEVO DÍA</div>
              <button style={s.closeBtn} onClick={() => setModalAgregarDia(false)}>✕</button>
            </div>
            <label style={s.label}>Nombre del día</label>
            <input style={s.input} placeholder="Ej: Día 1 - Pecho y Tríceps" value={nuevoDiaNombre} onChange={e => setNuevoDiaNombre(e.target.value)} />
            <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {['Día 1 - Empuje', 'Día 2 - Piernas', 'Día 3 - Jalón', 'Día 4 - Full Body', 'Descanso activo'].map(s => (
                  <button key={s} style={{ padding: '6px 12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#888', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => setNuevoDiaNombre(s)}>{s}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={s.btnGhost} onClick={() => setModalAgregarDia(false)}>Cancelar</button>
              <button style={{ ...s.btn, flex: 1 }} onClick={agregarDia} disabled={saving}>{saving ? 'Guardando...' : 'Agregar Día'}</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AGREGAR EJERCICIO A DÍA */}
      {modalAgregarEjercicio && (
        <div style={s.modal} onClick={() => setModalAgregarEjercicio(null)}>
          <div style={{ ...s.modalContent, maxHeight: '95vh' }} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div>
                <div style={s.modalTitle}>AGREGAR EJERCICIO</div>
                <div style={{ fontSize: 12, color: '#666' }}>{modalAgregarEjercicio.nombre}</div>
              </div>
              <button style={s.closeBtn} onClick={() => setModalAgregarEjercicio(null)}>✕</button>
            </div>

            {!ejercicioSeleccionado ? (
              <>
                <input style={{ ...s.input, marginBottom: 10 }} placeholder="🔍 Buscar ejercicio..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
                <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 10, marginBottom: 10 }}>
                  {GRUPOS.map(g => (
                    <button key={g} style={s.grupoPill(grupoFiltro === g)} onClick={() => setGrupoFiltro(g)}>{g}</button>
                  ))}
                </div>
                <div style={{ maxHeight: 350, overflowY: 'auto' }}>
                  {catalogoFiltrado.map(e => (
                    <div key={e.id} style={s.ejercicioItem(ejercicioSeleccionado?.id === e.id)} onClick={() => setEjercicioSeleccionado(e)}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#f0f0f0' }}>{e.nombre}</div>
                        <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{e.grupo_muscular}{e.equipo ? ` · ${e.equipo}` : ''}</div>
                      </div>
                      <span style={s.dificultadBadge(e.dificultad)}>{e.dificultad}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div style={{ background: 'rgba(245,230,66,0.08)', border: '1px solid #f5e64240', borderRadius: 10, padding: '12px 14px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#f5e642' }}>{ejercicioSeleccionado.nombre}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>{ejercicioSeleccionado.grupo_muscular}</div>
                  </div>
                  <button style={s.btnSm} onClick={() => setEjercicioSeleccionado(null)}>Cambiar</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={s.label}>Series</label>
                    <input style={s.input} type="number" min="1" max="10" value={ejercicioConfig.series} onChange={e => setEjercicioConfig(p => ({ ...p, series: parseInt(e.target.value) || 3 }))} />
                  </div>
                  <div>
                    <label style={s.label}>Repeticiones</label>
                    <input style={s.input} placeholder="Ej: 8-12" value={ejercicioConfig.repeticiones} onChange={e => setEjercicioConfig(p => ({ ...p, repeticiones: e.target.value }))} />
                  </div>
                </div>
                <label style={s.label}>Peso sugerido (opcional)</label>
                <input style={s.input} placeholder="Ej: 20kg, peso corporal..." value={ejercicioConfig.peso_sugerido} onChange={e => setEjercicioConfig(p => ({ ...p, peso_sugerido: e.target.value }))} />
                <label style={s.label}>Notas (opcional)</label>
                <input style={s.input} placeholder="Ej: Controlá la bajada" value={ejercicioConfig.notas} onChange={e => setEjercicioConfig(p => ({ ...p, notas: e.target.value }))} />

                <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                  <button style={s.btnGhost} onClick={() => setEjercicioSeleccionado(null)}>← Volver</button>
                  <button style={{ ...s.btn, flex: 1 }} onClick={agregarEjercicioADia} disabled={saving}>{saving ? 'Guardando...' : 'Agregar al Día'}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL DETALLE EJERCICIO (catálogo) */}
      {modalEjercicioDetalle && (
        <div style={s.modal} onClick={() => setModalEjercicioDetalle(null)}>
          <div style={s.modalContent} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div style={s.modalTitle}>{modalEjercicioDetalle.nombre}</div>
              <button style={s.closeBtn} onClick={() => setModalEjercicioDetalle(null)}>✕</button>
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(245,230,66,0.1)', border: '1px solid #f5e64240', color: '#f5e642', fontSize: 12, padding: '4px 10px', borderRadius: 6 }}>💪 {modalEjercicioDetalle.grupo_muscular}</span>
              {modalEjercicioDetalle.equipo && <span style={{ background: '#1a1a1a', border: '1px solid #222', color: '#888', fontSize: 12, padding: '4px 10px', borderRadius: 6 }}>🏋️ {modalEjercicioDetalle.equipo}</span>}
              <span style={s.dificultadBadge(modalEjercicioDetalle.dificultad)}>{modalEjercicioDetalle.dificultad}</span>
            </div>
            {modalEjercicioDetalle.descripcion && (
              <div style={{ fontSize: 14, color: '#999', lineHeight: 1.6, marginBottom: 16 }}>{modalEjercicioDetalle.descripcion}</div>
            )}
            <button style={s.btnFull} onClick={() => { setModalEjercicioDetalle(null); setTab('rutinas') }}>
              Ir a mis rutinas para agregar este ejercicio
            </button>
          </div>
        </div>
      )}

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&display=swap');`}</style>
    </div>
  )
}
