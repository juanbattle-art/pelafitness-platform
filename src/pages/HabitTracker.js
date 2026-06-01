import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const COLORES = ['#f5e642', '#4ade80', '#60a5fa', '#f97316', '#a78bfa', '#f472b6', '#34d399', '#fb923c']
const EMOJIS = ['✅', '💪', '🏋️', '🥗', '💧', '😴', '🧘', '📚', '🚀', '🔥', '⚡', '🎯', '🌅', '🧊', '🚫']

const hoy = () => new Date().toISOString().split('T')[0]
const fechasSemana = () => {
  const dias = []
  const hoyDate = new Date()
  const diaSemana = hoyDate.getDay()
  const lunes = new Date(hoyDate)
  lunes.setDate(hoyDate.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1))
  for (let i = 0; i < 7; i++) {
    const d = new Date(lunes)
    d.setDate(lunes.getDate() + i)
    dias.push(d.toISOString().split('T')[0])
  }
  return dias
}
const fechas30Dias = () => {
  const dias = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dias.push(d.toISOString().split('T')[0])
  }
  return dias
}
const DIAS_SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const NOMBRE_DIA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

const s = {
  page: { minHeight: '100vh', background: '#0a0a0a', fontFamily: "'DM Sans', sans-serif", paddingBottom: 100, color: '#f0f0f0' },
  header: { background: '#111', borderBottom: '1px solid #222', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 },
  logo: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 2, color: '#f5e642' },
  backBtn: { background: 'none', border: '1px solid #222', color: '#888', borderRadius: 8, padding: '6px 14px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' },
  main: { maxWidth: 480, margin: '0 auto', padding: '20px 16px' },
  tabs: { display: 'flex', gap: 4, background: '#111', border: '1px solid #222', borderRadius: 12, padding: 5, marginBottom: 20 },
  tab: (a) => ({ flex: 1, padding: '9px 6px', background: a ? '#f5e642' : 'none', color: a ? '#000' : '#666', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center' }),
  card: { background: '#111', border: '1px solid #222', borderRadius: 14, padding: 16, marginBottom: 12 },
  btn: { background: '#f5e642', color: '#000', border: 'none', borderRadius: 8, padding: '12px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' },
  btnFull: { background: '#f5e642', color: '#000', border: 'none', borderRadius: 8, padding: '14px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', width: '100%' },
  btnGhost: { background: 'none', color: '#888', border: '1px solid #222', borderRadius: 8, padding: '10px 16px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' },
  btnDanger: { background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', border: '1px solid rgba(255,77,77,0.2)', borderRadius: 6, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' },
  input: { width: '100%', background: '#0a0a0a', border: '1px solid #222', borderRadius: 8, padding: '10px 14px', color: '#f0f0f0', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' },
  label: { display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#555', marginBottom: 6, marginTop: 14 },
  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'flex-end' },
  modalContent: { background: '#111', width: '100%', maxHeight: '90vh', borderRadius: '16px 16px 0 0', overflowY: 'auto', padding: 20 },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #222' },
  modalTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 1 },
  closeBtn: { background: 'none', border: 'none', color: '#888', fontSize: 24, cursor: 'pointer' },
  empty: { textAlign: 'center', color: '#444', padding: '40px 20px', fontSize: 14 },
}

export default function HabitTracker({ perfil }) {
  const navigate = useNavigate()
  const [tab, setTab] = useState('hoy')
  const [habitos, setHabitos] = useState([])
  const [registros, setRegistros] = useState({}) // { [habitoId]: Set<fecha> }
  const [loading, setLoading] = useState(true)
  const [modalNuevo, setModalNuevo] = useState(false)
  const [nuevoHabito, setNuevoHabito] = useState({ nombre: '', emoji: '✅', color: '#f5e642' })
  const [saving, setSaving] = useState(false)

  const semana = fechasSemana()
  const dias30 = fechas30Dias()

  useEffect(() => { if (perfil?.id) cargarTodo() }, [perfil])

  async function cargarTodo() {
    setLoading(true)
    const [{ data: h }, { data: r }] = await Promise.all([
      supabase.from('habitos').select('*').eq('alumno_id', perfil.id).eq('activo', true).order('created_at'),
      supabase.from('habitos_registros').select('habito_id, fecha').eq('alumno_id', perfil.id)
    ])
    setHabitos(h || [])
    const reg = {}
    ;(r || []).forEach(({ habito_id, fecha }) => {
      if (!reg[habito_id]) reg[habito_id] = new Set()
      reg[habito_id].add(fecha)
    })
    setRegistros(reg)
    setLoading(false)
  }

  async function toggleHabito(habitoId, fecha) {
    const completado = registros[habitoId]?.has(fecha)
    if (completado) {
      await supabase.from('habitos_registros').delete().eq('habito_id', habitoId).eq('fecha', fecha)
      setRegistros(prev => {
        const nuevo = { ...prev }
        nuevo[habitoId] = new Set(prev[habitoId])
        nuevo[habitoId].delete(fecha)
        return nuevo
      })
    } else {
      await supabase.from('habitos_registros').upsert({ habito_id: habitoId, alumno_id: perfil.id, fecha, completado: true })
      setRegistros(prev => {
        const nuevo = { ...prev }
        nuevo[habitoId] = new Set(prev[habitoId] || [])
        nuevo[habitoId].add(fecha)
        return nuevo
      })
    }
  }

  async function crearHabito() {
    if (!nuevoHabito.nombre.trim()) return
    setSaving(true)
    const { data } = await supabase.from('habitos').insert({ ...nuevoHabito, alumno_id: perfil.id }).select().single()
    if (data) {
      setHabitos(prev => [...prev, data])
      setModalNuevo(false)
      setNuevoHabito({ nombre: '', emoji: '✅', color: '#f5e642' })
    }
    setSaving(false)
  }

  async function eliminarHabito(id) {
    if (!window.confirm('¿Eliminar este hábito?')) return
    await supabase.from('habitos').update({ activo: false }).eq('id', id)
    setHabitos(prev => prev.filter(h => h.id !== id))
  }

  function calcRacha(habitoId) {
    let racha = 0
    const fechaHoy = new Date()
    for (let i = 0; i < 365; i++) {
      const d = new Date(fechaHoy)
      d.setDate(fechaHoy.getDate() - i)
      const f = d.toISOString().split('T')[0]
      if (registros[habitoId]?.has(f)) racha++
      else if (i > 0) break
    }
    return racha
  }

  function calcRachaMasLarga(habitoId) {
    if (!registros[habitoId]) return 0
    const fechas = [...registros[habitoId]].sort()
    let maxRacha = 0, racha = 0
    for (let i = 0; i < fechas.length; i++) {
      if (i === 0) { racha = 1; continue }
      const prev = new Date(fechas[i - 1])
      const curr = new Date(fechas[i])
      const diff = (curr - prev) / (1000 * 60 * 60 * 24)
      if (diff === 1) racha++
      else racha = 1
      maxRacha = Math.max(maxRacha, racha)
    }
    return Math.max(maxRacha, racha)
  }

  function completadosHoy() {
    return habitos.filter(h => registros[h.id]?.has(hoy())).length
  }

  function porcentajeSemana() {
    if (!habitos.length) return 0
    const total = habitos.length * 7
    const completados = habitos.reduce((acc, h) => {
      return acc + semana.filter(f => registros[h.id]?.has(f)).length
    }, 0)
    return Math.round((completados / total) * 100)
  }

  const hoyStr = hoy()
  const completadosHoyNum = completadosHoy()
  const porcentaje = habitos.length ? Math.round((completadosHoyNum / habitos.length) * 100) : 0

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={s.logo}>PELAFITNESS</div>
        <button style={s.backBtn} onClick={() => navigate('/')}>← Volver</button>
      </header>

      <main style={s.main}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 34, letterSpacing: 1 }}>Mis Hábitos 🔥</div>
          <div style={{ fontSize: 13, color: '#555' }}>Construí tu disciplina día a día</div>
        </div>

        {/* Resumen del día */}
        {habitos.length > 0 && (
          <div style={{ ...s.card, background: 'linear-gradient(135deg, #1a1a0a, #111)', border: '1px solid #f5e64230', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, letterSpacing: 1, color: '#888', marginBottom: 4 }}>HOY</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 42, color: '#f5e642', lineHeight: 1 }}>{completadosHoyNum}/{habitos.length}</div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>hábitos completados</div>
              </div>
              <div style={{ position: 'relative', width: 80, height: 80 }}>
                <svg viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="40" cy="40" r="32" fill="none" stroke="#222" strokeWidth="8" />
                  <circle cx="40" cy="40" r="32" fill="none" stroke="#f5e642" strokeWidth="8"
                    strokeDasharray={`${porcentaje * 2.01} 201`} strokeLinecap="round" />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: '#f5e642' }}>{porcentaje}%</div>
              </div>
            </div>
            <div style={{ marginTop: 12, height: 4, background: '#222', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${porcentaje}%`, background: '#f5e642', borderRadius: 4, transition: 'width 0.5s' }} />
            </div>
          </div>
        )}

        <div style={s.tabs}>
          <button style={s.tab(tab === 'hoy')} onClick={() => setTab('hoy')}>Hoy</button>
          <button style={s.tab(tab === 'semana')} onClick={() => setTab('semana')}>Semana</button>
          <button style={s.tab(tab === 'mes')} onClick={() => setTab('mes')}>Mes</button>
          <button style={s.tab(tab === 'stats')} onClick={() => setTab('stats')}>Stats</button>
        </div>

        {/* TAB HOY */}
        {tab === 'hoy' && (
          <>
            <button style={{ ...s.btnFull, marginBottom: 16 }} onClick={() => setModalNuevo(true)}>+ Nuevo Hábito</button>

            {loading ? <div style={s.empty}>Cargando...</div> : habitos.length === 0 ? (
              <div style={s.empty}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
                <div>Todavía no tenés hábitos.<br />Tocá "Nuevo Hábito" para empezar.</div>
              </div>
            ) : (
              habitos.map(h => {
                const hecho = registros[h.id]?.has(hoyStr)
                const racha = calcRacha(h.id)
                return (
                  <div key={h.id} style={{ ...s.card, borderColor: hecho ? h.color + '40' : '#222', background: hecho ? h.color + '08' : '#111', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <button
                        onClick={() => toggleHabito(h.id, hoyStr)}
                        style={{ width: 48, height: 48, borderRadius: 12, border: `2px solid ${hecho ? h.color : '#333'}`, background: hecho ? h.color : 'transparent', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0 }}
                      >
                        {hecho ? '✓' : h.emoji}
                      </button>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: hecho ? h.color : '#f0f0f0', textDecoration: hecho ? 'line-through' : 'none', opacity: hecho ? 0.8 : 1 }}>{h.nombre}</div>
                        {racha > 0 && (
                          <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                            🔥 {racha} día{racha !== 1 ? 's' : ''} de racha
                          </div>
                        )}
                      </div>
                      <button style={s.btnDanger} onClick={() => eliminarHabito(h.id)}>✕</button>
                    </div>
                  </div>
                )
              })
            )}
          </>
        )}

        {/* TAB SEMANA */}
        {tab === 'semana' && (
          <>
            <div style={{ ...s.card, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 1 }}>Esta Semana</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: '#f5e642' }}>{porcentajeSemana()}%</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
                {NOMBRE_DIA.map((d, i) => (
                  <div key={i} style={{ textAlign: 'center', fontSize: 10, color: semana[i] === hoyStr ? '#f5e642' : '#555', fontWeight: semana[i] === hoyStr ? 700 : 400 }}>{d}</div>
                ))}
              </div>
            </div>

            {habitos.map(h => (
              <div key={h.id} style={s.card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 18 }}>{h.emoji}</span>
                  <div style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>{h.nombre}</div>
                  <div style={{ fontSize: 12, color: '#555' }}>{semana.filter(f => registros[h.id]?.has(f)).length}/7</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                  {semana.map((f, i) => {
                    const hecho = registros[h.id]?.has(f)
                    const esHoy = f === hoyStr
                    const esFuturo = f > hoyStr
                    return (
                      <button key={f} onClick={() => !esFuturo && toggleHabito(h.id, f)}
                        style={{ aspectRatio: '1', borderRadius: 8, border: esHoy ? `2px solid ${h.color}` : '1px solid #333', background: hecho ? h.color : esFuturo ? '#0d0d0d' : '#1a1a1a', cursor: esFuturo ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: hecho ? '#000' : '#666', fontWeight: 700, transition: 'all 0.2s' }}>
                        {hecho ? '✓' : ''}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </>
        )}

        {/* TAB MES */}
        {tab === 'mes' && (
          <>
            <div style={{ ...s.card, marginBottom: 16 }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 1, marginBottom: 12 }}>Últimos 30 días</div>
              <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {dias30.map(f => {
                  const totalHabitos = habitos.length
                  const completados = habitos.filter(h => registros[h.id]?.has(f)).length
                  const pct = totalHabitos ? completados / totalHabitos : 0
                  const esHoy = f === hoyStr
                  const color = pct === 0 ? '#1a1a1a' : pct < 0.5 ? '#f5e64240' : pct < 1 ? '#f5e64280' : '#f5e642'
                  return (
                    <div key={f} style={{ width: 'calc(14.28% - 2px)', aspectRatio: '1', borderRadius: 4, background: color, border: esHoy ? '2px solid #f5e642' : 'none', transition: 'all 0.2s' }} title={`${f}: ${completados}/${totalHabitos}`} />
                  )
                })}
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 12, fontSize: 11, color: '#555' }}>
                <span>⬛ 0%</span>
                <span style={{ color: '#f5e64240' }}>▪ &lt;50%</span>
                <span style={{ color: '#f5e64280' }}>▪ &lt;100%</span>
                <span style={{ color: '#f5e642' }}>▪ 100%</span>
              </div>
            </div>

            {habitos.map(h => {
              const totalMes = dias30.filter(f => registros[h.id]?.has(f)).length
              const pct = Math.round((totalMes / 30) * 100)
              return (
                <div key={h.id} style={s.card}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 18 }}>{h.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{h.nombre}</div>
                      <div style={{ fontSize: 12, color: '#555' }}>{totalMes}/30 días</div>
                    </div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: h.color }}>{pct}%</div>
                  </div>
                  <div style={{ height: 6, background: '#1a1a1a', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: h.color, borderRadius: 4, transition: 'width 0.5s' }} />
                  </div>
                </div>
              )
            })}
          </>
        )}

        {/* TAB STATS */}
        {tab === 'stats' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              {[
                { label: 'Hábitos activos', value: habitos.length, color: '#f5e642', emoji: '🎯' },
                { label: 'Completados hoy', value: completadosHoyNum, color: '#4ade80', emoji: '✅' },
                { label: 'Esta semana', value: `${porcentajeSemana()}%`, color: '#60a5fa', emoji: '📅' },
                { label: 'Mejor racha', value: habitos.length ? Math.max(...habitos.map(h => calcRacha(h.id))) + '🔥' : '0', color: '#f97316', emoji: '🏆' },
              ].map(stat => (
                <div key={stat.label} style={{ ...s.card, textAlign: 'center' }}>
                  <div style={{ fontSize: 28, marginBottom: 4 }}>{stat.emoji}</div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: stat.color }}>{stat.value}</div>
                  <div style={{ fontSize: 11, color: '#555' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 1, marginBottom: 12 }}>Ranking de Hábitos</div>
            {[...habitos]
              .map(h => ({ ...h, pct: Math.round((dias30.filter(f => registros[h.id]?.has(f)).length / 30) * 100), racha: calcRacha(h.id), rachaMasLarga: calcRachaMasLarga(h.id) }))
              .sort((a, b) => b.pct - a.pct)
              .map((h, i) => (
                <div key={h.id} style={{ ...s.card, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: i === 0 ? '#f5e642' : i === 1 ? '#888' : i === 2 ? '#f97316' : '#444', width: 28 }}>#{i + 1}</div>
                  <span style={{ fontSize: 20 }}>{h.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{h.nombre}</div>
                    <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>
                      🔥 {h.racha} días · Mejor: {h.rachaMasLarga} días
                    </div>
                  </div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: h.color }}>{h.pct}%</div>
                </div>
              ))
            }
          </>
        )}
      </main>

      {/* MODAL NUEVO HÁBITO */}
      {modalNuevo && (
        <div style={s.modal} onClick={() => setModalNuevo(false)}>
          <div style={s.modalContent} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div style={s.modalTitle}>NUEVO HÁBITO</div>
              <button style={s.closeBtn} onClick={() => setModalNuevo(false)}>✕</button>
            </div>

            <label style={s.label}>Nombre del hábito</label>
            <input style={s.input} placeholder="Ej: Tomar 2L de agua 💧" value={nuevoHabito.nombre} onChange={e => setNuevoHabito(p => ({ ...p, nombre: e.target.value }))} />

            <label style={s.label}>Emoji</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
              {EMOJIS.map(e => (
                <button key={e} onClick={() => setNuevoHabito(p => ({ ...p, emoji: e }))}
                  style={{ width: 44, height: 44, borderRadius: 10, border: `2px solid ${nuevoHabito.emoji === e ? '#f5e642' : '#222'}`, background: nuevoHabito.emoji === e ? 'rgba(245,230,66,0.1)' : '#0d0d0d', fontSize: 20, cursor: 'pointer' }}>
                  {e}
                </button>
              ))}
            </div>

            <label style={s.label}>Color</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
              {COLORES.map(c => (
                <button key={c} onClick={() => setNuevoHabito(p => ({ ...p, color: c }))}
                  style={{ width: 36, height: 36, borderRadius: 8, background: c, border: nuevoHabito.color === c ? '3px solid #fff' : '2px solid transparent', cursor: 'pointer' }} />
              ))}
            </div>

            {/* Preview */}
            <div style={{ marginTop: 16, background: '#0d0d0d', borderRadius: 12, padding: 14, border: `1px solid ${nuevoHabito.color}40`, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: nuevoHabito.color + '20', border: `2px solid ${nuevoHabito.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{nuevoHabito.emoji}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: nuevoHabito.color }}>{nuevoHabito.nombre || 'Nombre del hábito'}</div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button style={s.btnGhost} onClick={() => setModalNuevo(false)}>Cancelar</button>
              <button style={{ ...s.btn, flex: 1 }} onClick={crearHabito} disabled={saving || !nuevoHabito.nombre.trim()}>
                {saving ? 'Guardando...' : 'Crear Hábito'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&display=swap');`}</style>
    </div>
  )
}
