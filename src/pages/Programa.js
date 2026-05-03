import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const s = {
  page: { minHeight: '100vh', background: '#0a0a0a' },
  header: { background: '#111', borderBottom: '1px solid #222', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16, position: 'sticky', top: 0, zIndex: 100 },
  backBtn: { background: 'none', border: '1px solid #222', color: '#888', borderRadius: 8, padding: '6px 14px', fontSize: 13 },
  logo: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 2, color: '#f5e642' },
  main: { maxWidth: 800, margin: '0 auto', padding: '32px 24px' },
  titulo: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 42, letterSpacing: 1, marginBottom: 8 },
  desc: { fontSize: 15, color: '#666', marginBottom: 32, lineHeight: 1.6 },
  modulos: { display: 'grid', gap: 12 },
  modulo: { background: '#111', border: '1px solid #222', borderRadius: 12, padding: '20px 24px', cursor: 'pointer', transition: 'border-color 0.2s' },
  moduloTitulo: { fontSize: 16, fontWeight: 600, marginBottom: 6 },
  moduloPreview: { fontSize: 13, color: '#555', lineHeight: 1.5 },
  // Modal
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 16px', overflowY: 'auto' },
  modal: { background: '#111', border: '1px solid #222', borderRadius: 16, width: '100%', maxWidth: 700, padding: '32px', position: 'relative' },
  closeBtn: { position: 'absolute', top: 16, right: 16, background: '#1a1a1a', border: '1px solid #222', color: '#888', borderRadius: 8, padding: '6px 12px', fontSize: 13 },
  modalTitulo: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: 1, marginBottom: 16 },
  contenido: { fontSize: 15, color: '#ccc', lineHeight: 1.8, whiteSpace: 'pre-wrap', marginBottom: 20 },
  video: { width: '100%', aspectRatio: '16/9', borderRadius: 10, marginBottom: 20, border: 'none' },
  pdfLink: { display: 'inline-flex', alignItems: 'center', gap: 8, background: '#1a1a1a', border: '1px solid #333', color: '#f5e642', borderRadius: 8, padding: '10px 16px', fontSize: 14, textDecoration: 'none', marginBottom: 20 },
  // Comentarios
  comentSection: { marginTop: 24, borderTop: '1px solid #1a1a1a', paddingTop: 24 },
  comentTitulo: { fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#888', letterSpacing: 0.5 },
  comentBox: { display: 'flex', gap: 10, marginBottom: 16 },
  comentInput: { flex: 1, background: '#0a0a0a', border: '1px solid #222', borderRadius: 8, color: '#f0f0f0', fontSize: 14, padding: '10px 14px', outline: 'none', resize: 'none', minHeight: 60 },
  comentBtn: { background: '#f5e642', color: '#000', border: 'none', borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 700, alignSelf: 'flex-end' },
  comentItem: { background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 10, padding: '14px 16px', marginBottom: 8 },
  comentMensaje: { fontSize: 14, color: '#ccc', marginBottom: 8, lineHeight: 1.6 },
  comentRespuesta: { background: '#111', border: '1px solid #f5e64220', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#f5e642', lineHeight: 1.6 },
  comentFecha: { fontSize: 11, color: '#333', marginTop: 6 },
}

function getYoutubeId(url) {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
  return match ? match[1] : null
}

export default function Programa({ perfil }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [programa, setPrograma] = useState(null)
  const [modulos, setModulos] = useState([])
  const [moduloActivo, setModuloActivo] = useState(null)
  const [comentarios, setComentarios] = useState([])
  const [nuevoComentario, setNuevoComentario] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => { cargar() }, [id])

  async function cargar() {
    const { data: prog } = await supabase.from('programas').select('*').eq('id', id).single()
    setPrograma(prog)
    const { data: mods } = await supabase.from('modulos').select('*').eq('programa_id', id).order('orden')
    setModulos(mods || [])
  }

  async function abrirModulo(modulo) {
    setModuloActivo(modulo)
    const { data } = await supabase.from('comentarios').select('*').eq('modulo_id', modulo.id).order('created_at')
    setComentarios(data || [])
  }

  async function enviarComentario() {
    if (!nuevoComentario.trim()) return
    setEnviando(true)
    await supabase.from('comentarios').insert({ alumno_id: perfil.id, modulo_id: moduloActivo.id, mensaje: nuevoComentario.trim() })
    setNuevoComentario('')
    const { data } = await supabase.from('comentarios').select('*').eq('modulo_id', moduloActivo.id).order('created_at')
    setComentarios(data || [])
    setEnviando(false)
  }

  if (!programa) return <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ color: '#333' }}>Cargando...</div></div>

  return (
    <div style={s.page}>
      <header style={s.header}>
        <button style={s.backBtn} onClick={() => navigate('/')}>← Volver</button>
        <div style={s.logo}>PELAFITNESS</div>
      </header>

      <main style={s.main}>
        <div style={s.titulo}>{programa.titulo}</div>
        {programa.descripcion && <div style={s.desc}>{programa.descripcion}</div>}

        <div style={s.modulos}>
          {modulos.map((m, i) => (
            <div key={m.id} style={s.modulo}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#f5e642'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#222'}
              onClick={() => abrirModulo(m)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ background: '#1a1a1a', border: '1px solid #222', borderRadius: 6, padding: '4px 10px', fontSize: 12, color: '#f5e642', fontWeight: 700 }}>{i + 1}</div>
                <div style={s.moduloTitulo}>{m.titulo}</div>
              </div>
              {m.contenido && <div style={{ ...s.moduloPreview, marginTop: 8 }}>{m.contenido.substring(0, 100)}{m.contenido.length > 100 ? '...' : ''}</div>}
            </div>
          ))}
        </div>
      </main>

      {moduloActivo && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && setModuloActivo(null)}>
          <div style={s.modal}>
            <button style={s.closeBtn} onClick={() => setModuloActivo(null)}>✕ Cerrar</button>
            <div style={s.modalTitulo}>{moduloActivo.titulo}</div>

            {moduloActivo.video_url && (() => {
              const ytId = getYoutubeId(moduloActivo.video_url)
              return ytId
                ? <iframe style={s.video} src={`https://www.youtube.com/embed/${ytId}`} allowFullScreen title="video" />
                : <video style={s.video} src={moduloActivo.video_url} controls />
            })()}

            {moduloActivo.contenido && <div style={s.contenido}>{moduloActivo.contenido}</div>}

            {moduloActivo.pdf_url && (
              <a href={moduloActivo.pdf_url} target="_blank" rel="noreferrer" style={s.pdfLink}>
                📄 Descargar PDF
              </a>
            )}

            <div style={s.comentSection}>
              <div style={s.comentTitulo}>PREGUNTAS Y COMENTARIOS</div>
              <div style={s.comentBox}>
                <textarea style={s.comentInput} value={nuevoComentario} onChange={e => setNuevoComentario(e.target.value)} placeholder="Escribí tu pregunta o comentario..." />
                <button style={s.comentBtn} onClick={enviarComentario} disabled={enviando}>{enviando ? '...' : 'Enviar'}</button>
              </div>
              {comentarios.map(c => (
                <div key={c.id} style={s.comentItem}>
                  <div style={s.comentMensaje}>💬 {c.mensaje}</div>
                  {c.respuesta && <div style={s.comentRespuesta}>✅ {c.respuesta}</div>}
                  <div style={s.comentFecha}>{new Date(c.created_at).toLocaleDateString('es-AR')}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
