import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const s = {
  page: { minHeight: '100vh', background: '#0a0a0a' },
  header: { background: '#111', borderBottom: '1px solid #222', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 },
  logo: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, letterSpacing: 2, color: '#f5e642' },
  adminBadge: { background: 'rgba(245,230,66,0.1)', border: '1px solid rgba(245,230,66,0.3)', color: '#f5e642', fontSize: 11, padding: '4px 10px', borderRadius: 20, fontWeight: 600 },
  logoutBtn: { background: 'none', border: '1px solid #222', color: '#555', borderRadius: 8, padding: '6px 14px', fontSize: 13 },
  main: { maxWidth: 1100, margin: '0 auto', padding: '32px 24px' },
  tabs: { display: 'flex', gap: 4, borderBottom: '1px solid #1a1a1a', marginBottom: 32 },
  tab: (a) => ({ padding: '10px 20px', background: 'none', border: 'none', borderBottom: `2px solid ${a ? '#f5e642' : 'transparent'}`, color: a ? '#f5e642' : '#555', fontSize: 14, fontWeight: 500, cursor: 'pointer' }),
  section: { display: 'grid', gap: 16 },
  card: { background: '#111', border: '1px solid #222', borderRadius: 14, padding: '24px' },
  cardTitulo: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 1, marginBottom: 16 },
  formGrid: { display: 'grid', gap: 12 },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  label: { display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#555', marginBottom: 6 },
  input: { width: '100%', background: '#0a0a0a', border: '1px solid #222', borderRadius: 8, color: '#f0f0f0', fontSize: 14, padding: '10px 14px', outline: 'none' },
  select: { width: '100%', background: '#0a0a0a', border: '1px solid #222', borderRadius: 8, color: '#f0f0f0', fontSize: 14, padding: '10px 14px', outline: 'none', appearance: 'none' },
  textarea: { width: '100%', background: '#0a0a0a', border: '1px solid #222', borderRadius: 8, color: '#f0f0f0', fontSize: 14, padding: '10px 14px', outline: 'none', resize: 'vertical', minHeight: 80 },
  btn: { background: '#f5e642', color: '#000', border: 'none', borderRadius: 8, padding: '11px 24px', fontSize: 14, fontWeight: 700 },
  btnSec: { background: '#1a1a1a', color: '#888', border: '1px solid #222', borderRadius: 8, padding: '8px 16px', fontSize: 13 },
  btnDanger: { background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', border: '1px solid rgba(255,77,77,0.2)', borderRadius: 8, padding: '6px 12px', fontSize: 12 },
  lista: { display: 'grid', gap: 8, marginTop: 16 },
  item: { background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  itemTitulo: { fontSize: 15, fontWeight: 500 },
  itemSub: { fontSize: 12, color: '#444', marginTop: 2 },
  tag: (color) => ({ background: `${color}15`, border: `1px solid ${color}40`, color, fontSize: 11, padding: '2px 8px', borderRadius: 4, fontWeight: 600 }),
  success: { color: '#4ade80', fontSize: 13, marginTop: 8 },
  comentarioItem: { background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 10, padding: '16px', marginBottom: 8 },
}

const TIPOS = { entrenamiento: '#f5e642', nutricion: '#4ade80', mentalidad: '#818cf8' }

export default function Admin({ perfil }) {
  const [tab, setTab] = useState('programas')
  const [programas, setProgramas] = useState([])
  const [alumnos, setAlumnos] = useState([])
  const [comentarios, setComentarios] = useState([])
  const [msg, setMsg] = useState('')

  // Forms
  const [newProg, setNewProg] = useState({ titulo: '', descripcion: '', tipo: 'entrenamiento' })
  const [progSel, setProgSel] = useState('')
  const [newMod, setNewMod] = useState({ titulo: '', contenido: '', video_url: '', pdf_url: '' })
  const [modulos, setModulos] = useState([])
  const [asignAlumno, setAsignAlumno] = useState('')
  const [asignProg, setAsignProg] = useState('')
  const [newAlumno, setNewAlumno] = useState({ email: '', nombre: '', password: '' })
  const [respuestas, setRespuestas] = useState({})

  useEffect(() => { cargarTodo() }, [])

  async function cargarTodo() {
    const { data: p } = await supabase.from('programas').select('*').order('created_at', { ascending: false })
    setProgramas(p || [])
    const { data: a } = await supabase.from('profiles').select('*').eq('rol', 'alumno')
    setAlumnos(a || [])
    const { data: c } = await supabase.from('comentarios').select('*, profiles(nombre, email), modulos(titulo)').order('created_at', { ascending: false })
    setComentarios(c || [])
  }

  async function crearPrograma(e) {
    e.preventDefault()
    const { error } = await supabase.from('programas').insert(newProg)
    if (!error) { setMsg('Programa creado ✓'); setNewProg({ titulo: '', descripcion: '', tipo: 'entrenamiento' }); cargarTodo() }
  }

  async function cargarModulos(progId) {
    setProgSel(progId)
    if (!progId) return
    const { data } = await supabase.from('modulos').select('*').eq('programa_id', progId).order('orden')
    setModulos(data || [])
  }

  async function crearModulo(e) {
    e.preventDefault()
    if (!progSel) return
    const orden = modulos.length
    const { error } = await supabase.from('modulos').insert({ ...newMod, programa_id: progSel, orden })
    if (!error) { setMsg('Módulo agregado ✓'); setNewMod({ titulo: '', contenido: '', video_url: '', pdf_url: '' }); cargarModulos(progSel) }
  }

  async function eliminarModulo(id) {
    await supabase.from('modulos').delete().eq('id', id)
    cargarModulos(progSel)
  }

  async function asignar(e) {
    e.preventDefault()
    if (!asignAlumno || !asignProg) return
    const { error } = await supabase.from('asignaciones').insert({ alumno_id: asignAlumno, programa_id: asignProg })
    if (!error) setMsg('Programa asignado ✓')
    else setMsg('Ya estaba asignado')
  }

  async function crearAlumno(e) {
    e.preventDefault()
    const { data, error } = await supabase.auth.admin.createUser({ email: newAlumno.email, password: newAlumno.password, email_confirm: true })
    if (error) { setMsg('Error: ' + error.message); return }
    await supabase.from('profiles').insert({ id: data.user.id, email: newAlumno.email, nombre: newAlumno.nombre, rol: 'alumno' })
    setMsg('Alumno creado ✓')
    setNewAlumno({ email: '', nombre: '', password: '' })
    cargarTodo()
  }

  async function responder(comentId) {
    const texto = respuestas[comentId]
    if (!texto?.trim()) return
    await supabase.from('comentarios').update({ respuesta: texto }).eq('id', comentId)
    setMsg('Respuesta enviada ✓')
    cargarTodo()
  }

  async function logout() { await supabase.auth.signOut() }

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={s.logo}>PELAFITNESS <span style={{ fontSize: 14, color: '#333', fontFamily: 'DM Sans' }}>Admin</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={s.adminBadge}>⚡ Admin</div>
          <button style={s.logoutBtn} onClick={logout}>Salir</button>
        </div>
      </header>

      <main style={s.main}>
        <div style={s.tabs}>
          {['programas', 'modulos', 'alumnos', 'asignar', 'preguntas'].map(t => (
            <button key={t} style={s.tab(tab === t)} onClick={() => { setTab(t); setMsg('') }}>
              {{ programas: '📋 Programas', modulos: '📁 Módulos', alumnos: '👥 Alumnos', asignar: '🔗 Asignar', preguntas: '💬 Preguntas' }[t]}
            </button>
          ))}
        </div>

        {msg && <div style={s.success}>{msg}</div>}

        {/* PROGRAMAS */}
        {tab === 'programas' && (
          <div style={s.section}>
            <div style={s.card}>
              <div style={s.cardTitulo}>Crear programa</div>
              <form onSubmit={crearPrograma}>
                <div style={s.formGrid}>
                  <div style={s.formRow}>
                    <div>
                      <label style={s.label}>Título</label>
                      <input style={s.input} value={newProg.titulo} onChange={e => setNewProg({ ...newProg, titulo: e.target.value })} placeholder="Nombre del programa" required />
                    </div>
                    <div>
                      <label style={s.label}>Tipo</label>
                      <select style={s.select} value={newProg.tipo} onChange={e => setNewProg({ ...newProg, tipo: e.target.value })}>
                        <option value="entrenamiento">💪 Entrenamiento</option>
                        <option value="nutricion">🥗 Nutrición</option>
                        <option value="mentalidad">🧠 Mentalidad</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={s.label}>Descripción</label>
                    <textarea style={s.textarea} value={newProg.descripcion} onChange={e => setNewProg({ ...newProg, descripcion: e.target.value })} placeholder="Descripción del programa..." />
                  </div>
                  <button type="submit" style={s.btn}>Crear programa</button>
                </div>
              </form>
            </div>

            <div style={s.card}>
              <div style={s.cardTitulo}>Programas existentes</div>
              <div style={s.lista}>
                {programas.map(p => (
                  <div key={p.id} style={s.item}>
                    <div>
                      <div style={s.itemTitulo}>{p.titulo}</div>
                      <div style={s.itemSub}>{p.descripcion?.substring(0, 60)}</div>
                    </div>
                    <div style={s.tag(TIPOS[p.tipo] || '#f5e642')}>{p.tipo}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MODULOS */}
        {tab === 'modulos' && (
          <div style={s.section}>
            <div style={s.card}>
              <div style={s.cardTitulo}>Agregar módulo a programa</div>
              <div style={{ marginBottom: 20 }}>
                <label style={s.label}>Seleccioná el programa</label>
                <select style={s.select} value={progSel} onChange={e => cargarModulos(e.target.value)}>
                  <option value="">-- Elegí un programa --</option>
                  {programas.map(p => <option key={p.id} value={p.id}>{p.titulo}</option>)}
                </select>
              </div>

              {progSel && (
                <form onSubmit={crearModulo}>
                  <div style={s.formGrid}>
                    <div>
                      <label style={s.label}>Título del módulo</label>
                      <input style={s.input} value={newMod.titulo} onChange={e => setNewMod({ ...newMod, titulo: e.target.value })} placeholder="Ej: Semana 1 - Introducción" required />
                    </div>
                    <div>
                      <label style={s.label}>Contenido / Texto</label>
                      <textarea style={{ ...s.textarea, minHeight: 120 }} value={newMod.contenido} onChange={e => setNewMod({ ...newMod, contenido: e.target.value })} placeholder="Explicación, instrucciones, descripción..." />
                    </div>
                    <div style={s.formRow}>
                      <div>
                        <label style={s.label}>URL de video (YouTube)</label>
                        <input style={s.input} value={newMod.video_url} onChange={e => setNewMod({ ...newMod, video_url: e.target.value })} placeholder="https://youtube.com/watch?v=..." />
                      </div>
                      <div>
                        <label style={s.label}>URL de PDF</label>
                        <input style={s.input} value={newMod.pdf_url} onChange={e => setNewMod({ ...newMod, pdf_url: e.target.value })} placeholder="https://..." />
                      </div>
                    </div>
                    <button type="submit" style={s.btn}>Agregar módulo</button>
                  </div>
                </form>
              )}
            </div>

            {progSel && modulos.length > 0 && (
              <div style={s.card}>
                <div style={s.cardTitulo}>Módulos del programa</div>
                <div style={s.lista}>
                  {modulos.map((m, i) => (
                    <div key={m.id} style={s.item}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ color: '#f5e642', fontSize: 12, fontWeight: 700 }}>{i + 1}</span>
                          <div style={s.itemTitulo}>{m.titulo}</div>
                        </div>
                        <div style={s.itemSub}>
                          {m.video_url && '🎬 Video '}{m.pdf_url && '📄 PDF '}{m.contenido && '📝 Texto'}
                        </div>
                      </div>
                      <button style={s.btnDanger} onClick={() => eliminarModulo(m.id)}>Eliminar</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ALUMNOS */}
        {tab === 'alumnos' && (
          <div style={s.section}>
            <div style={s.card}>
              <div style={s.cardTitulo}>Crear alumno</div>
              <form onSubmit={crearAlumno}>
                <div style={s.formGrid}>
                  <div style={s.formRow}>
                    <div>
                      <label style={s.label}>Nombre</label>
                      <input style={s.input} value={newAlumno.nombre} onChange={e => setNewAlumno({ ...newAlumno, nombre: e.target.value })} placeholder="Nombre completo" required />
                    </div>
                    <div>
                      <label style={s.label}>Email</label>
                      <input style={s.input} type="email" value={newAlumno.email} onChange={e => setNewAlumno({ ...newAlumno, email: e.target.value })} placeholder="alumno@email.com" required />
                    </div>
                  </div>
                  <div>
                    <label style={s.label}>Contraseña inicial</label>
                    <input style={s.input} type="password" value={newAlumno.password} onChange={e => setNewAlumno({ ...newAlumno, password: e.target.value })} placeholder="Mínimo 6 caracteres" required minLength={6} />
                  </div>
                  <button type="submit" style={s.btn}>Crear alumno</button>
                </div>
              </form>
            </div>

            <div style={s.card}>
              <div style={s.cardTitulo}>Alumnos registrados</div>
              <div style={s.lista}>
                {alumnos.length === 0 ? <div style={{ color: '#333', fontSize: 14 }}>No hay alumnos todavía</div> : alumnos.map(a => (
                  <div key={a.id} style={s.item}>
                    <div>
                      <div style={s.itemTitulo}>{a.nombre || 'Sin nombre'}</div>
                      <div style={s.itemSub}>{a.email}</div>
                    </div>
                    <div style={s.tag('#4ade80')}>Alumno</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ASIGNAR */}
        {tab === 'asignar' && (
          <div style={s.card}>
            <div style={s.cardTitulo}>Asignar programa a alumno</div>
            <form onSubmit={asignar}>
              <div style={s.formGrid}>
                <div>
                  <label style={s.label}>Alumno</label>
                  <select style={s.select} value={asignAlumno} onChange={e => setAsignAlumno(e.target.value)} required>
                    <option value="">-- Elegí un alumno --</option>
                    {alumnos.map(a => <option key={a.id} value={a.id}>{a.nombre} ({a.email})</option>)}
                  </select>
                </div>
                <div>
                  <label style={s.label}>Programa</label>
                  <select style={s.select} value={asignProg} onChange={e => setAsignProg(e.target.value)} required>
                    <option value="">-- Elegí un programa --</option>
                    {programas.map(p => <option key={p.id} value={p.id}>{p.titulo}</option>)}
                  </select>
                </div>
                <button type="submit" style={s.btn}>Asignar programa</button>
              </div>
            </form>
          </div>
        )}

        {/* PREGUNTAS */}
        {tab === 'preguntas' && (
          <div style={s.section}>
            <div style={s.card}>
              <div style={s.cardTitulo}>Preguntas de alumnos</div>
              {comentarios.length === 0 ? (
                <div style={{ color: '#333', fontSize: 14 }}>No hay preguntas todavía</div>
              ) : comentarios.map(c => (
                <div key={c.id} style={s.comentarioItem}>
                  <div style={{ fontSize: 12, color: '#444', marginBottom: 8 }}>
                    <strong style={{ color: '#888' }}>{c.profiles?.nombre || c.profiles?.email}</strong> → {c.modulos?.titulo}
                  </div>
                  <div style={{ fontSize: 14, color: '#ccc', marginBottom: 12 }}>💬 {c.mensaje}</div>
                  {c.respuesta ? (
                    <div style={{ background: '#111', border: '1px solid #f5e64220', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#f5e642' }}>
                      ✅ {c.respuesta}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input style={{ ...s.input, flex: 1 }} placeholder="Escribí tu respuesta..." value={respuestas[c.id] || ''} onChange={e => setRespuestas({ ...respuestas, [c.id]: e.target.value })} />
                      <button style={s.btn} onClick={() => responder(c.id)}>Responder</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
