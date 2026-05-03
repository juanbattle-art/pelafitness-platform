import { useState } from 'react'
import { supabase } from '../lib/supabase'

const FOTO1 = 'https://i.ibb.co/0j2xWY9v/pela20232.jpg'
const FOTO2 = 'https://i.ibb.co/rKLfQ9CX/pela20233.jpg'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function login(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Email o contraseña incorrectos')
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0a',
      display: 'grid', gridTemplateColumns: '1fr 1fr',
      fontFamily: "'DM Sans', sans-serif"
    }}>
      <div style={{ position: 'relative', overflow: 'hidden', display: 'grid', gridTemplateRows: '1fr 1fr', gap: 3 }}>
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <img src={FOTO1} alt="Pelafitness" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,10,10,0.1), transparent)' }} />
        </div>
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <img src={FOTO2} alt="Pelafitness" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,10,10,0.1), transparent)' }} />
        </div>
        <div style={{ position: 'absolute', bottom: 40, left: 40, right: 40 }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 42, letterSpacing: 2, color: '#fff', lineHeight: 1.1, textShadow: '0 2px 20px rgba(0,0,0,0.8)', marginBottom: 12 }}>
            TU CUERPO.<br /><span style={{ color: '#f5e642' }}>TU MEJOR</span><br />VERSIÓN.
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', letterSpacing: 0.5 }}>
            Coaching online personalizado · @pelafitness
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 60px' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div style={{ marginBottom: 48 }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 38, letterSpacing: 3, color: '#f5e642', marginBottom: 4 }}>PELAFITNESS</div>
            <div style={{ fontSize: 14, color: '#444' }}>Accedé a tu plataforma de coaching</div>
          </div>
          <form onSubmit={login}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#555', marginBottom: 8 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" required
                style={{ width: '100%', background: '#111', border: '1px solid #222', borderRadius: 10, color: '#f0f0f0', fontSize: 15, padding: '13px 16px', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = '#f5e642'}
                onBlur={e => e.target.style.borderColor = '#222'} />
            </div>
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#555', marginBottom: 8 }}>Contraseña</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                style={{ width: '100%', background: '#111', border: '1px solid #222', borderRadius: 10, color: '#f0f0f0', fontSize: 15, padding: '13px 16px', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = '#f5e642'}
                onBlur={e => e.target.style.borderColor = '#222'} />
            </div>
            {error && <div style={{ color: '#ff4d4d', fontSize: 13, marginBottom: 16, padding: '10px 14px', background: 'rgba(255,77,77,0.08)', borderRadius: 8, border: '1px solid rgba(255,77,77,0.2)' }}>{error}</div>}
            <button type="submit" disabled={loading}
              style={{ width: '100%', background: loading ? '#222' : '#f5e642', color: loading ? '#555' : '#000', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, padding: '15px', cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: 0.5 }}>
              {loading ? 'Ingresando...' : 'Ingresar →'}
            </button>
          </form>
          <div style={{ marginTop: 40, textAlign: 'center', fontSize: 12, color: '#333' }}>¿Problemas para acceder? Contactá a tu coach</div>
        </div>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&display=swap');`}</style>
    </div>
  )
}
