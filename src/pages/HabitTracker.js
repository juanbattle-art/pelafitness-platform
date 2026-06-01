import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const COLORES = ['#f5e642', '#4ade80', '#60a5fa', '#f97316', '#a78bfa', '#f472b6', '#34d399', '#fb923c', '#e11d48', '#06b6d4']
const EMOJIS = ['💪', '🏋️', '🥗', '💧', '😴', '🧘', '📚', '🚀', '🔥', '⚡', '🎯', '🌅', '🧊', '🚫', '🏃', '🍎', '✍️', '🧠', '❤️', '🌿']
const DIAS_SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

const HABITOS_SUGERIDOS = [
  { nombre: 'Entrenar', emoji: '💪', color: '#f5e642' },
  { nombre: 'Tomar 2L de agua', emoji: '💧', color: '#60a5fa' },
  { nombre: 'Dormir 8 horas', emoji: '😴', color: '#a78bfa' },
  { nombre: 'Comer saludable', emoji: '🥗', color: '#4ade80' },
  { nombre: 'Sin alcohol', emoji: '🚫', color: '#f97316' },
  { nombre: 'Meditar', emoji: '🧘', color: '#34d399' },
  { nombre: 'Leer 30 min', emoji: '📚', color: '#fb923c' },
  { nombre: 'Caminar 10k pasos', emoji: '🏃', color: '#f472b6' },
]

function getDiasDelMes(year, month) {
  return new Date(year, month + 1, 0).getDate()
}
function getPrimerDiaSemana(year, month) {
  const d = new Date(year, month, 1).getDay()
  return d === 0 ? 6 : d - 1
}
function fechaStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}
function hoyStr() {
  const d = new Date()
  return fechaStr(d.getFullYear(), d.getMonth(), d.getDate())
}

const s = {
  page: { minHeight: '100vh', background: '#0a0a0a', fontFamily: "'DM Sans', sans-serif", paddingBottom: 100, color: '#f0f0f0' },
  header: { background: '#111', borderBottom: '1px solid #222', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 },
  logo: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 2, color: '#f5e642' },
  backBtn: { background: 'none', border: '1px solid #222', color: '#888', borderRadius: 8, padding: '6px 14px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' },
  main: { maxWidth: 480, margin: '0 auto', padding: '16px 16px' },
  card: { background: '#111', border: '1px solid #222', borderRadius: 14, padding: 16, marginBottom: 12 },
  btn: { background: '#f5e642', color: '#000', border: 'none', borderRadius: 8, padding: '12px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' },
  btnFull: { background: '#f5e642', color: '#000', border: 'none', borderRadius: 8, padding: '14px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', width: '100%' },
  btnGhost: { background: 'none', color: '#888', border: '1px solid #222', borderRadius: 8, padding: '10px 16px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' },
  btnDanger: { background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', border: '1px solid rgba(255,77,77,0.2)', borderRadius: 6, padding: '5px 10px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' },
  input: { width: '100%', background: '#0a0a0a', border: '1px solid #222', borderRadius: 8, padding: '10px 14px', color: '#f0f0f0', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' },
  label: { display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#555', marginBottom: 6, marginTop: 14 },
  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.88)', zIndex: 200, display: 'flex', alignItems: 'flex-end' },
  modalContent: { background: '#111', width: '100%', maxHeight: '92vh', borderRadius: '16px 16px 0 0', overflowY: 'auto', padding: 20 },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #222' },
  modalTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 1 },
  closeBtn: { background: 'none', border: 'none', color: '#888', fontSize: 24, cursor: 'pointer' },
  empty: { textAlign: 'center', color: '#444', padding: '40px 20px', fontSize: 14 },
  tabs: { display: 'flex', gap: 4, background: '#111', border: '1px solid #222', borderRadius: 12, padding: 5, marginBottom: 16 },
  tab: (a) => ({ flex: 1, padding: '9px 4px', background: a ? '#f5e642' : 'none', color: a ? '#000' : '#666', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center' }),
}

export default function HabitTracker({ perfil }) {
  const navigate = useNavigate()
  const [tab, setTab] = useState('mes')
  const [habitos, setHabitos] = useState([])
  const [registros, setRegistros] = useState({})
  const [loading, setLoading] = useState(true)
  const [modalNuevo, setModalNuevo] = useState(false)
  const [modalHabito, setModalHabito] = useState(null)
  const [nuevoHabito, setNuevoHabito] = useState({ nombre: '', emoji: '💪', color: '#f5e642' })
  const [saving, setSaving] = useState(false)
  const today = new Date()
  const [mesActual, setMesActual] = useState({ year: today.getFullYear(), month: today.getMonth() })

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
    if (fecha > hoyStr()) return
    const hecho = registros[habitoId]?.has(fecha)
    if (hecho) {
      await supabase.from('habitos_registros').delete().eq('habito_id', habitoId).eq('fecha', fecha)
      setRegistros(prev => { const n = { ...prev }; n[habitoId] = new Set(prev[habitoId]); n[habitoId].delete(fecha); return n })
    } else {
      await supabase.from('habitos_registros').upsert({ habito_id: habitoId, alumno_id: perfil.id, fecha, completado: true })
      setRegistros(prev => { const n = { ...prev }; n[habitoId] = new Set(prev[habitoId] || []); n[habitoId].add(fecha); return n })
    }
  }

  async function crearHabito() {
    if (!nuevoHabito.nombre.trim()) return
    setSaving(true)
    const { data } = await supabase.from('habitos').insert({ ...nuevoHabito, alumno_id: perfil.id }).select().single()
    if (data) { setHabitos(prev => [...prev, data]); setModalNuevo(false); setNuevoHabito({ nombre: '', emoji: '💪', color: '#f5e642' }) }
    setSaving(false)
  }

  async function eliminarHabito(id) {
    if (!window.confirm('¿Eliminar este hábito?')) return
    await supabase.from('habitos').update({ activo: false }).eq('id', id)
    setHabitos(prev => prev.filter(h => h.id !== id))
    setModalHabito(null)
  }

  function calcRacha(habitoId) {
    let racha = 0
    const d = new Date()
    for (let i = 0; i < 365; i++) {
      const f = d.toISOString().split('T')[0]
      if (registros[habitoId]?.has(f)) racha++
      else if (i > 0) break
      d.setDate(d.getDate() - 1)
    }
    return racha
  }

  function calcRachaMasLarga(habitoId) {
    if (!registros[habitoId]?.size) return 0
    const fechas = [...registros[habitoId]].sort()
    let max = 1, curr = 1
    for (let i = 1; i < fechas.length; i++) {
      const diff = (new Date(fechas[i]) - new Date(fechas[i-1])) / 86400000
      if (diff === 1) { curr++; max = Math.max(max, curr) } else curr = 1
    }
    return max
  }

  function getCompletadosMes(habitoId, year, month) {
    const dias = getDiasDelMes(year, month)
    let count = 0
    for (let d = 1; d <= dias; d++) {
      if (registros[habitoId]?.has(fechaStr(year, month, d))) count++
    }
    return count
  }

  function completadosHoy() {
    return habitos.filter(h => registros[h.id]?.has(hoyStr())).length
  }

  function pctHoy() {
    return habitos.length ? Math.round((completadosHoy() / habitos.length) * 100) : 0
  }

  const { year, month } = mesActual
  const diasMes = getDiasDelMes(year, month)
  const primerDia = getPrimerDiaSemana(year, month)
  const hoy = hoyStr()
  const esMesActual = year === today.getFullYear() && month === today.getMonth()

  function irMesAnterior() { setMesActual(prev => { const d = new Date(prev.year, prev.month - 1, 1); return { year: d.getFullYear(), month: d.getMonth() } }) }
  function irMesSiguiente() { if (!esMesActual) setMesActual(prev => { const d = new Date(prev.year, prev.month + 1, 1); return { year: d.getFullYear(), month: d.getMonth() } }) }

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={s.logo}>PELAFITNESS</div>
        <button style={s.backBtn} onClick={() => navigate('/')}>← Volver</button>
      </header>

      <main style={s.main}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: 1 }}>Mis Hábitos 🔥</div>
          <div style={{ fontSize: 13, color: '#555' }}>Construí tu disciplina día a día</div>
        </div>

        {/* Resumen hoy */}
        {habitos.length > 0 && (
          <div style={{ ...s.card, background: 'linear-gradient(135deg, #1a1a0a, #111)', border: '1px solid #f5e64230', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#888', marginBottom: 4 }}>HOY — {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 44, color: '#f5e642', lineHeight: 1 }}>{completadosHoy()}<span style={{ fontSize: 22, color: '#555' }}>/{habitos.length}</span></div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>hábitos completados</div>
              </div>
              <div style={{ position: 'relative', width: 76, height: 76 }}>
                <svg viewBox="0 0 76 76" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="38" cy="38" r="30" fill="none" stroke="#222" strokeWidth="7" />
                  <circle cx="38" cy="38" r="30" fill="none" stroke={pctHoy() === 100 ? '#4ade80' : '#f5e642'} strokeWidth="7"
                    strokeDasharray={`${pctHoy() * 1.885} 188.5`} strokeLinecap="round" />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: 17, color: pctHoy() === 100 ? '#4ade80' : '#f5e642' }}>{pctHoy()}%</div>
              </div>
            </div>
            <div style={{ marginTop: 10, height: 5, background: '#1a1a1a', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pctHoy()}%`, background: pctHoy() === 100 ? '#4ade80' : '#f5e642', borderRadius: 4, transition: 'width 0.5s' }} />
            </div>
            {pctHoy() === 100 && <div style={{ marginTop: 8, textAlign: 'center', fontSize: 13, color: '#4ade80', fontWeight: 700 }}>🎉 ¡Día perfecto! Todos los hábitos completados</div>}
          </div>
        )}

        <div style={s.tabs}>
          <button style={s.tab(tab === 'hoy')} onClick={() => setTab('hoy')}>Hoy</button>
          <button style={s.tab(tab === 'mes')} onClick={() => setTab('mes')}>Mes</button>
          <button style={s.tab(tab === 'stats')} onClick={() => setTab('stats')}>Stats</button>
          <button style={s.tab(tab === 'config')} onClick={() => setTab('config')}>Hábitos</button>
        </div>

        {/* TAB HOY */}
        {tab === 'hoy' && (
          <>
            {loading ? <div style={s.empty}>Cargando...</div> : habitos.length === 0 ? (
              <div style={s.empty}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
                <div>Todavía no tenés hábitos.<br />Andá a "Hábitos" para agregar.</div>
              </div>
            ) : (
              habitos.map(h => {
                const hecho = registros[h.id]?.has(hoy)
                const racha = calcRacha(h.id)
                return (
                  <div key={h.id} onClick={() => toggleHabito(h.id, hoy)}
                    style={{ ...s.card, borderColor: hecho ? h.color + '50' : '#222', background: hecho ? h.color + '0d' : '#111', cursor: 'pointer', transition: 'all 0.2s', userSelect: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 52, height: 52, borderRadius: 14, border: `2px solid ${hecho ? h.color : '#333'}`, background: hecho ? h.color : 'transparent', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.25s', flexShrink: 0, color: hecho ? '#000' : '#fff' }}>
                        {hecho ? '✓' : h.emoji}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: hecho ? h.color : '#f0f0f0', textDecoration: hecho ? 'line-through' : 'none', opacity: hecho ? 0.7 : 1 }}>{h.nombre}</div>
                        <div style={{ fontSize: 12, color: '#666', marginTop: 3, display: 'flex', gap: 12 }}>
                          {racha > 0 && <span>🔥 {racha} día{racha !== 1 ? 's' : ''}</span>}
                          <span>📅 {getCompletadosMes(h.id, today.getFullYear(), today.getMonth())}/{getDiasDelMes(today.getFullYear(), today.getMonth())} este mes</span>
                        </div>
                      </div>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: hecho ? h.color : '#333', transition: 'all 0.2s' }} />
                    </div>
                  </div>
                )
              })
            )}
          </>
        )}

        {/* TAB MES */}
        {tab === 'mes' && (
          <>
            {/* Navegación de meses */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <button onClick={irMesAnterior} style={{ background: '#111', border: '1px solid #222', color: '#f0f0f0', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 16 }}>‹</button>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 1, color: esMesActual ? '#f5e642' : '#f0f0f0' }}>
                {MESES[month]} {year}
              </div>
              <button onClick={irMesSiguiente} style={{ background: esMesActual ? '#111' : '#111', border: '1px solid #222', color: esMesActual ? '#333' : '#f0f0f0', borderRadius: 8, padding: '8px 14px', cursor: esMesActual ? 'default' : 'pointer', fontSize: 16 }}>›</button>
            </div>

            {loading ? <div style={s.empty}>Cargando...</div> : habitos.length === 0 ? (
              <div style={s.empty}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
                <div>Andá a "Hábitos" para agregar hábitos.</div>
              </div>
            ) : habitos.map(h => {
              const completadosMes = getCompletadosMes(h.id, year, month)
              const pct = Math.round((completadosMes / diasMes) * 100)
              return (
                <div key={h.id} style={s.card}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: 20 }}>{h.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{h.nombre}</div>
                      <div style={{ fontSize: 11, color: '#555' }}>{completadosMes}/{diasMes} días · {pct}%</div>
                    </div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: h.color }}>{pct}%</div>
                  </div>

                  {/* Cabecera días semana */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, marginBottom: 3 }}>
                    {DIAS_SEMANA.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 9, color: '#555', fontWeight: 700 }}>{d}</div>)}
                  </div>

                  {/* Grilla del mes */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
                    {Array(primerDia).fill(null).map((_, i) => <div key={'e' + i} />)}
                    {Array(diasMes).fill(null).map((_, i) => {
                      const dia = i + 1
                      const f = fechaStr(year, month, dia)
                      const hecho = registros[h.id]?.has(f)
                      const esHoy = f === hoy
                      const esFuturo = f > hoy
                      return (
                        <button key={dia} onClick={() => !esFuturo && toggleHabito(h.id, f)}
                          style={{ aspectRatio: '1', borderRadius: 6, border: esHoy ? `2px solid ${h.color}` : '1px solid #1a1a1a', background: hecho ? h.color : esFuturo ? '#0a0a0a' : '#1a1a1a', cursor: esFuturo ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: hecho ? '#000' : esHoy ? h.color : '#555', fontWeight: 700, transition: 'all 0.15s', opacity: esFuturo ? 0.3 : 1 }}>
                          {hecho ? '✓' : dia}
                        </button>
                      )
                    })}
                  </div>

                  {/* Barra progreso */}
                  <div style={{ marginTop: 10, height: 4, background: '#1a1a1a', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: h.color, borderRadius: 4, transition: 'width 0.5s' }} />
                  </div>
                </div>
              )
            })}
          </>
        )}

        {/* TAB STATS */}
        {tab === 'stats' && (() => {
          const diasMesStats = getDiasDelMes(today.getFullYear(), today.getMonth())
          const habitosConStats = [...habitos].map(h => ({
            ...h,
            completadosMes: getCompletadosMes(h.id, today.getFullYear(), today.getMonth()),
            pct: Math.round((getCompletadosMes(h.id, today.getFullYear(), today.getMonth()) / diasMesStats) * 100),
            racha: calcRacha(h.id),
            rachaMasLarga: calcRachaMasLarga(h.id)
          })).sort((a, b) => b.pct - a.pct)
          const totalCompletadosMes = habitosConStats.reduce((acc, h) => acc + h.completadosMes, 0)
          const totalPosiblesMes = habitos.length * diasMesStats
          const pctGlobal = totalPosiblesMes ? Math.round((totalCompletadosMes / totalPosiblesMes) * 100) : 0

          // Datos por semana del mes actual
          const semanasMes = []
          let diaActual = 1
          while (diaActual <= diasMesStats) {
            const semana = []
            const primerDiaSem = getPrimerDiaSemana(today.getFullYear(), today.getMonth())
            for (let s = 0; s < 5; s++) {
              const inicio = s === 0 ? 1 : semanasMes.length === 0 ? 1 : (7 - primerDiaSem) + 1 + (s - 1) * 7
              const items = []
              for (let d = inicio; d < inicio + 7 && d <= diasMesStats; d++) {
                const f = fechaStr(today.getFullYear(), today.getMonth(), d)
                const completados = habitos.filter(h => registros[h.id]?.has(f)).length
                items.push({ dia: d, fecha: f, completados, total: habitos.length })
              }
              if (items.length) semanasMes.push(items)
              break
            }
            break
          }

          // Calcular completados por día de la semana actual y las 4 anteriores
          const semanasData = []
          for (let w = 4; w >= 0; w--) {
            const dias = []
            for (let d = 0; d < 7; d++) {
              const fecha = new Date(today)
              fecha.setDate(today.getDate() - w * 7 - (today.getDay() === 0 ? 6 : today.getDay() - 1) + d)
              const f = fechaStr(fecha.getFullYear(), fecha.getMonth(), fecha.getDate())
              const completados = habitos.filter(h => registros[h.id]?.has(f)).length
              dias.push({ f, completados, total: habitos.length, dia: d })
            }
            semanasData.push(dias)
          }

          const maxBarValue = habitos.length || 1

          return (
            <>
              {/* Header progreso global */}
              <div style={{ ...s.card, background: '#0d0d0d', border: '1px solid #222', marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: 1 }}>PROGRESO GLOBAL — {MESES[today.getMonth()].toUpperCase()}</div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color: '#f5e642', lineHeight: 1.1 }}>{totalCompletadosMes}<span style={{ fontSize: 18, color: '#555' }}>/{totalPosiblesMes}</span></div>
                    <div style={{ fontSize: 12, color: '#888' }}>hábitos completados</div>
                  </div>
                  <div style={{ position: 'relative', width: 80, height: 80 }}>
                    <svg viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="40" cy="40" r="32" fill="none" stroke="#1a1a1a" strokeWidth="8" />
                      <circle cx="40" cy="40" r="32" fill="none" stroke={pctGlobal >= 80 ? '#4ade80' : pctGlobal >= 50 ? '#f5e642' : '#f97316'} strokeWidth="8"
                        strokeDasharray={`${pctGlobal * 2.01} 201`} strokeLinecap="round" />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: '#f5e642' }}>{pctGlobal}%</div>
                  </div>
                </div>
                <div style={{ height: 6, background: '#1a1a1a', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pctGlobal}%`, background: pctGlobal >= 80 ? '#4ade80' : '#f5e642', borderRadius: 4, transition: 'width 0.5s' }} />
                </div>
              </div>

              {/* Gráfico de barras por semana */}
              <div style={{ ...s.card, marginBottom: 12 }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 1, color: '#f0f0f0', marginBottom: 12 }}>📊 PROGRESO DIARIO — ÚLTIMAS 5 SEMANAS</div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  {semanasData.map((semana, si) => (
                    <div key={si} style={{ flex: 1, display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                      {semana.map((dia, di) => {
                        const pctDia = dia.total ? dia.completados / dia.total : 0
                        const altura = Math.max(4, pctDia * 80)
                        const esFuturo = dia.f > hoy
                        const esHoyDia = dia.f === hoy
                        const color = esFuturo ? '#1a1a1a' : pctDia === 0 ? '#222' : pctDia < 0.5 ? '#f97316' : pctDia < 1 ? '#f5e642' : '#4ade80'
                        return (
                          <div key={di} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <div style={{ width: '100%', height: altura, background: color, borderRadius: '3px 3px 0 0', border: esHoyDia ? '1px solid #fff' : 'none', transition: 'height 0.3s', minHeight: 4 }} />
                            {si === 4 && <div style={{ fontSize: 8, color: esHoyDia ? '#f5e642' : '#444', fontWeight: esHoyDia ? 700 : 400 }}>{DIAS_SEMANA[di]}</div>}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 10, fontSize: 10, flexWrap: 'wrap' }}>
                  {[{ color: '#4ade80', label: '100%' }, { color: '#f5e642', label: '50-99%' }, { color: '#f97316', label: '1-49%' }, { color: '#222', label: '0%' }].map(l => (
                    <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 8, height: 8, background: l.color, borderRadius: 2 }} />
                      <span style={{ color: '#555' }}>{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ranking con barras horizontales coloreadas */}
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 1, marginBottom: 10 }}>🏆 TOP HÁBITOS — {MESES[today.getMonth()].toUpperCase()}</div>
              <div style={s.card}>
                {habitosConStats.map((h, i) => (
                  <div key={h.id} style={{ marginBottom: i < habitosConStats.length - 1 ? 14 : 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: i === 0 ? '#f5e642' : i === 1 ? '#aaa' : i === 2 ? '#f97316' : '#444' }}>#{i+1}</span>
                        <span style={{ fontSize: 16 }}>{h.emoji}</span>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{h.nombre}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <span style={{ fontSize: 10, color: '#555' }}>🔥{h.racha}d</span>
                        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, color: h.color }}>{h.pct}%</span>
                      </div>
                    </div>
                    <div style={{ height: 8, background: '#1a1a1a', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${h.pct}%`, background: h.color, borderRadius: 4, transition: 'width 0.5s' }} />
                    </div>
                    <div style={{ fontSize: 10, color: '#555', marginTop: 3 }}>{h.completadosMes}/{diasMesStats} días · Mejor racha: {h.rachaMasLarga} días</div>
                  </div>
                ))}
              </div>

              {/* Mapa de calor anual */}
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 1, margin: '14px 0 10px' }}>📈 ACTIVIDAD ANUAL</div>
              <div style={s.card}>
                <div style={{ fontSize: 11, color: '#555', marginBottom: 8 }}>Últimas 52 semanas</div>
                <div style={{ display: 'flex', gap: 2 }}>
                  {Array(52).fill(null).map((_, semana) => {
                    const inicio = new Date(today)
                    inicio.setDate(today.getDate() - (51 - semana) * 7 - (today.getDay() === 0 ? 6 : today.getDay() - 1))
                    let total = 0, posibles = 0
                    for (let d = 0; d < 7; d++) {
                      const fecha = new Date(inicio)
                      fecha.setDate(inicio.getDate() + d)
                      const f = fechaStr(fecha.getFullYear(), fecha.getMonth(), fecha.getDate())
                      if (f <= hoy) {
                        posibles += habitos.length
                        total += habitos.filter(h => registros[h.id]?.has(f)).length
                      }
                    }
                    const pctSem = posibles ? total / posibles : 0
                    const color = posibles === 0 ? '#0d0d0d' : pctSem === 0 ? '#1a1a1a' : pctSem < 0.33 ? '#f5e64230' : pctSem < 0.66 ? '#f5e64270' : pctSem < 1 ? '#f5e642b0' : '#f5e642'
                    return (
                      <div key={semana} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {Array(7).fill(null).map((_, d) => {
                          const fecha = new Date(inicio)
                          fecha.setDate(inicio.getDate() + d)
                          const f = fechaStr(fecha.getFullYear(), fecha.getMonth(), fecha.getDate())
                          const completados = habitos.filter(h => registros[h.id]?.has(f)).length
                          const pct = habitos.length ? completados / habitos.length : 0
                          const c = f > hoy ? '#0d0d0d' : pct === 0 ? '#1a1a1a' : pct < 0.5 ? '#f5e64240' : pct < 1 ? '#f5e64280' : '#f5e642'
                          return <div key={d} style={{ aspectRatio: '1', borderRadius: 1, background: c }} />
                        })}
                      </div>
                    )
                  })}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8, fontSize: 10, color: '#555', alignItems: 'center' }}>
                  <span>Menos</span>
                  {['#1a1a1a', '#f5e64240', '#f5e64280', '#f5e642'].map((c, i) => <div key={i} style={{ width: 9, height: 9, background: c, borderRadius: 1 }} />)}
                  <span>Más</span>
                </div>
              </div>
            </>
          )
        })()}

        {/* TAB CONFIG */}
        {tab === 'config' && (
          <>
            <button style={{ ...s.btnFull, marginBottom: 16 }} onClick={() => setModalNuevo(true)}>+ Nuevo Hábito</button>

            {habitos.length === 0 ? (
              <div style={s.empty}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
                <div>Todavía no tenés hábitos.<br />Tocá "Nuevo Hábito" para empezar.</div>
              </div>
            ) : habitos.map(h => {
              const racha = calcRacha(h.id)
              const rachaMasLarga = calcRachaMasLarga(h.id)
              return (
                <div key={h.id} style={{ ...s.card, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: h.color + '20', border: `2px solid ${h.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{h.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{h.nombre}</div>
                    <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>🔥 {racha}d · Mejor: {rachaMasLarga}d</div>
                  </div>
                  <button style={s.btnDanger} onClick={() => eliminarHabito(h.id)}>Eliminar</button>
                </div>
              )
            })}
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

            {/* Sugeridos */}
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#555', marginBottom: 8 }}>SUGERIDOS</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {HABITOS_SUGERIDOS.map(s => (
                <button key={s.nombre} onClick={() => setNuevoHabito({ nombre: s.nombre, emoji: s.emoji, color: s.color })}
                  style={{ padding: '6px 12px', borderRadius: 20, border: `1px solid ${nuevoHabito.nombre === s.nombre ? s.color : '#222'}`, background: nuevoHabito.nombre === s.nombre ? s.color + '20' : '#0d0d0d', color: nuevoHabito.nombre === s.nombre ? s.color : '#888', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {s.emoji} {s.nombre}
                </button>
              ))}
            </div>

            <label style={s.label}>Nombre del hábito</label>
            <input style={s.input} placeholder="Ej: Meditar 10 minutos" value={nuevoHabito.nombre} onChange={e => setNuevoHabito(p => ({ ...p, nombre: e.target.value }))} />

            <label style={s.label}>Emoji</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 4 }}>
              {EMOJIS.map(e => (
                <button key={e} onClick={() => setNuevoHabito(p => ({ ...p, emoji: e }))}
                  style={{ width: 42, height: 42, borderRadius: 10, border: `2px solid ${nuevoHabito.emoji === e ? '#f5e642' : '#222'}`, background: nuevoHabito.emoji === e ? 'rgba(245,230,66,0.1)' : '#0d0d0d', fontSize: 18, cursor: 'pointer' }}>
                  {e}
                </button>
              ))}
            </div>

            <label style={s.label}>Color</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
              {COLORES.map(c => (
                <button key={c} onClick={() => setNuevoHabito(p => ({ ...p, color: c }))}
                  style={{ width: 34, height: 34, borderRadius: 8, background: c, border: nuevoHabito.color === c ? '3px solid #fff' : '2px solid transparent', cursor: 'pointer' }} />
              ))}
            </div>

            {/* Preview */}
            <div style={{ marginTop: 14, background: '#0d0d0d', borderRadius: 12, padding: 14, border: `1px solid ${nuevoHabito.color}40`, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: nuevoHabito.color + '20', border: `2px solid ${nuevoHabito.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{nuevoHabito.emoji}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: nuevoHabito.color }}>{nuevoHabito.nombre || 'Nombre del hábito...'}</div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button style={s.btnGhost} onClick={() => setModalNuevo(false)}>Cancelar</button>
              <button style={{ ...s.btn, flex: 1 }} onClick={crearHabito} disabled={saving || !nuevoHabito.nombre.trim()}>
                {saving ? 'Guardando...' : 'Crear Hábito 🎯'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&display=swap'); * { -webkit-tap-highlight-color: transparent; }`}</style>
    </div>
  )
}
