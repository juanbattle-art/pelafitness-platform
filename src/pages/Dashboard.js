import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const TIPO_CONFIG = {
  entrenamiento: { emoji: '💪', color: '#f5e642', label: 'Entrenamiento' },
  nutricion: { emoji: '🥗', color: '#4ade80', label: 'Nutrición' },
  mentalidad: { emoji: '🧠', color: '#818cf8', label: 'Mentalidad' },
}

const s = {
  page: { minHeight: '100vh', background: '#0a0a0a' },
  header: { background: '#111', borderBottom: '1px solid #222', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 },
  logo: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, letterSpacing: 2, color: '#f5e642' },
  nombre: { fontSize: 13, color: '#555' },
  logoutBtn: { background: 'none', border: '1px solid #222', color: '#555', borderRadius: 8, padding: '6px 14px', fontSize: 13 },
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={s.titulo}>Mis Programas</div>
            <div style={s.subtitulo}>Tu contenido personalizado de Pelafitness</div>
          </div>
          <button onClick={() => navigate('/seguimiento')} style={{ background: '#f5e642', color: '#000', border: 'none', borderRadius: 10, padding: '12px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            📊 Mi Seguimiento
          </button>
        </div>

        {loading ? (
          <div style={s.empty}><div style={s.emptyText}>Cargando...</div></div>
        ) : programas.length === 0 ? (
          <div style={s.empty}>
            <div style={s.emptyIcon}>📭</div>
            <div style={s.emptyText}>Todavía no tenés programas asignados.<br />Pronto aparecerán acá.</div>
          </div>
        ) : (
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
        )}
      </main>
    </div>
  )
}
