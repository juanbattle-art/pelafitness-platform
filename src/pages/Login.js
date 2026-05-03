import { useState } from 'react'
import { supabase } from '../lib/supabase'

const FOTO = 'https://i.ibb.co/0j2xWY9v/pela20232.jpg'

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
      minHeight: '100vh',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif",
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: `url(${FOTO})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        filter: 'brightness(0.8)'
      }} />

      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'linear-gradient(135deg, rgba(10,10,10,0.35) 0%, rgba(10,10,10,0.15) 50%, rgba(10,10,10,0.35) 100%)'
      }} />

      <div style={{
        position: 'relative', zIndex: 2,
        width: '100%', maxWidth: 440,
        padding: '48px 40px',
        background: 'rgba(10,10,10,0.4)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20,
        margin: '24px 16px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 44, letterSpacing: 4,
            color: '#f5e642', marginBottom: 6
          }}>PELAFITNESS</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', letterSpacing: 0.5 }}>
            Tu plataforma de coaching online
          </div>
        </div>

        <div style={{ height: 1, background: 'rgba(245,230,66,0.2)', marginBottom: 32 }} />

        <form onSubmit={login}>
          <div style={{ marginBottom: 18 }}>
            <label style={{
              display: 'block', fontSize: 11, fontWeight: 700,
              letterSpacing: 1, textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.4)', marginBottom: 8
            }}>Email</label>
            <input
              type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com" required
              style={{
                width: '100%', background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 10, color: '#fff', fontSize: 15,
                padding: '13px 16px', outline: 'none',
                boxSizing: 'border-box', transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#f5e642'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
            />
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{
              display: 'block', fontSize: 11, fontWeight: 700,
              letterSpacing: 1, textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.4)', marginBottom: 8
            }}>Contraseña</label>
            <input
              type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required
              style={{
                width: '100%', background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 10, color: '#fff', fontSize: 15,
                padding: '13px 16px', outline: 'none',
                boxSizing: 'border-box', transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#f5e642'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
            />
          </div>

          {error && (
            <div style={{
              color: '#ff4d4d', fontSize: 13, marginBottom: 16,
              padding: '10px 14px', background: 'rgba(255,77,77,0.1)',
              borderRadius: 8, border: '1px solid rgba(255,77,77,0.25)'
            }}>{error}</div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', background: loading ? 'rgba(245,230,66,0.3)' : '#f5e642',
            color: loading ? '#888' : '#000', border: 'none',
            borderRadius: 10, fontSize: 16, fontWeight: 700,
            padding: '15px', cursor: loading ? 'not-allowed' : 'pointer',
            letterSpacing: 0.5, transition: 'all 0.2s'
          }}>
            {loading ? 'Ingresando...' : 'Ingresar →'}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
          ¿Problemas para acceder? Contactá a tu coach
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&display=swap');
        input::placeholder { color: rgba(255,255,255,0.25) !important; }
      `}</style>
    </div>
  )
}
