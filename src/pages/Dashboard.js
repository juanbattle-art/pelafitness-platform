import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const TIPO_CONFIG = {
  entrenamiento: { emoji: '💪', color: '#f5e642', label: 'Entrenamiento' },
  nutricion: { emoji: '🥗', color: '#4ade80', label: 'Nutrición' },
  mentalidad: { emoji: '🧠', color: '#818cf8', label: 'Mentalidad' },
}

const PDF_URL = 'https://pelafitness-platform.onrender.com/Guia-quema-grasa.pdf.pdf'

const s = {
  page: { minHeight: '100vh', background: '#0a0a0a' },
  header: { background: '#111', borderBottom: '1px solid #222', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 },
  logo: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, letterSpacing: 2, color: '#f5e642' },
  nombre: { fontSize: 13, color: '#555' },
  logoutBtn: { background: 'none', border: '1px solid #222', color: '#555', borderRadius: 8, padding: '6px 14px', fontSize: 13, cursor: 'pointer' },
  main: { maxWidth: 900, margin: '0 auto', padding: '32px 24px' },
  titulo: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, letterSpacing: 1, color: '#f0f0f0', marginBottom: 4 },
  subtitulo: { fontSize: 14, color: '#555' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 },
  card: { background: '#111', border: '1px solid #222', borderRadius: 14, padding: '24px', cursor: 'pointer', transition: 'all 0.2s', display: 'block' },
  cardEmoji: { fontSize: 32, marginBottom: 12 },
  cardTipo: { fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  cardTitulo: { fontSize: 18, fontWeight: 600, color: '#f0f0f0', marginBottom: 8, lineHeight: 1.3 },
  cardDesc: { fontSize: 13, color: '#666', lineHeight: 1.6 },
  empty: { textAlign: 'center', padding: '60px 24px', color: '#444' },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 15 },
  actionGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 32 },
  actionCard: (color) => ({ background: `${color}10`, border: `1px solid ${color}30`, borderRadius: 14, padding: '20px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center' }),
  actionEmoji: { fontSize: 36, marginBottom: 10 },
  actionLabel: (color) => ({ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 1, color }),
  actionSub: { fontSize: 12, color: '#555', marginTop: 4 },
  pdfBanner: { background: 'linear-gradient(135deg, #f5e64215, #f5e64205)', border: '1px solid #f5e64230', borderRadius: 14, padding: '20px 24px', marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' },
  pdfInfo: { display: 'flex', alignItems: 'center', gap: 14 },
  pdfIcon: { fontSize: 40 },
  pdfTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 1, color: '#f5e642' },
  pdfDesc: { fontSize: 13, color: '#888', marginTop: 2 },
  pdfBtn: { background: '#f5e642', color: '#000', border: 'none', borderRadius: 10, padding: '12px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', textDecoration: 'none', display: 'inline-block' },
  sectionTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 1, color: '#f0f0f0', marginBottom: 16, marginTop: 8 },
}

export default function Dashboard({ perfil }) {
  const [programas, setProgramas] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => { cargarProgramas() }, [])

  async function cargarProgramas() {
    const { data } = await supabase
      .from('asignaciones')
      .select('programa_id, programas(*)')
      .eq('alumno_id', perfil.id)
    setProgramas(data?.map(a => a.programas) || [])
    setLoading(false)
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  const acciones = [
    { emoji: '📊', label: 'MI SEGUIMIENTO', sub: 'Peso, agua, comidas', color: '#f5e642', ruta: '/seguimiento' },
    { emoji: '💪', label: 'MIS RUTINAS', sub: 'Armá tu entrenamiento', color: '#60a5fa', ruta: '/mi-rutina' },
    { emoji: '🥗', label: 'MI ALIMENTACIÓN', sub: 'Planes de comidas', color: '#4ade80', ruta: '/mi-plan-alimentacion' },
    { emoji: '🏋️', label: 'HOY ENTRENO', sub: 'Registrar sesión', color: '#f97316', ruta: '/mi-entrenamiento' },
  ]

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={s.logo}>PELAFITNESS</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={s.nombre}>Hola, {perfil?.nombre || 'Alumno'}</div>
          <button style={s.logoutBtn} onClick={logout}>Salir</button>
        </div>
      </header>

      <main style={s.main}>
        {/* Saludo */}
        <div style={{ marginBottom: 28 }}>
          <div style={s.titulo}>Bienvenido 💪</div>
          <div style={s.subtitulo}>Tu plataforma de coaching con Pelafitness</div>
        </div>

        {/* Banner PDF */}
        <div style={s.pdfBanner}>
          <div style={s.pdfInfo}>
            <div style={s.pdfIcon}>📘</div>
            <div>
              <div style={s.pdfTitle}>QUEMÁ GRASA SIN VUELTAS</div>
              <div style={s.pdfDesc}>Tu guía completa de nutrición y entrenamiento — incluida con tu acceso</div>
            </div>
          </div>
          <a href={PDF_URL} target="_blank" rel="noopener noreferrer" style={s.pdfBtn} download>
            ⬇ Descargar PDF
          </a>
        </div>

        {/* Acciones rápidas */}
        <div style={s.sectionTitle}>Acceso Rápido</div>
        <div style={s.actionGrid}>
          {acciones.map(a => (
            <div
              key={a.ruta}
              style={s.actionCard(a.color)}
              onClick={() => navigate(a.ruta)}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = a.color + '60' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = a.color + '30' }}
            >
              <div style={s.actionEmoji}>{a.emoji}</div>
              <div style={s.actionLabel(a.color)}>{a.label}</div>
              <div style={s.actionSub}>{a.sub}</div>
            </div>
          ))}
        </div>

        {/* Programas asignados */}
        {!loading && programas.length > 0 && (
          <>
            <div style={s.sectionTitle}>Mis Programas</div>
            <div style={s.grid}>
              {programas.map(p => {
                const config = TIPO_CONFIG[p.tipo] || { emoji: '📋', color: '#f5e642', label: p.tipo }
                return (
                  <div key={p.id} style={{ ...s.card, borderColor: '#222' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = config.color; e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#222'; e.currentTarget.style.transform = 'translateY(0)' }}
                    onClick={() => navigate(`/programa/${p.id}`)}>
                    <div style={s.cardEmoji}>{config.emoji}</div>
                    <div style={{ ...s.cardTipo, color: config.color }}>{config.label}</div>
                    <div style={s.cardTitulo}>{p.titulo}</div>
                    {p.descripcion && <div style={s.cardDesc}>{p.descripcion}</div>}
                  </div>
                )
              })}
            </div>
          </>
        )}

        {!loading && programas.length === 0 && (
          <div style={s.empty}>
            <div style={s.emptyIcon}>📭</div>
            <div style={s.emptyText}>Todavía no tenés programas asignados.<br />Pronto aparecerán acá.</div>
          </div>
        )}
      </main>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&display=swap');`}</style>
    </div>
  )
}
