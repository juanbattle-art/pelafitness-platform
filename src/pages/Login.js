import { useState } from 'react'
import { supabase } from '../lib/supabase'

const s = {
  page: { minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' },
  box: { width: '100%', maxWidth: 400, background: '#111', border: '1px solid #222', borderRadius: 16, padding: '40px 32px' },
  logo: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, letterSpacing: 3, color: '#f5e642', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#555', textAlign: 'center', marginBottom: 32 },
  label: { display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#555', marginBottom: 8 },
  input: { width: '100%', background: '#0a0a0a', border: '1px solid #222', borderRadius: 10, color: '#f0f0f0', fontSize: 15, padding: '12px 16px', outline: 'none', marginBottom: 16, transition: 'border-color 0.2s' },
  btn: { width: '100%', background: '#f5e642', color: '#000', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, padding: '14px', marginTop: 8, cursor: 'pointer', transition: 'opacity 0.2s' },
  err: { color: '#ff4d4d', fontSize: 13, marginTop: 12, textAlign: 'center' },
}

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
    <div style={s.page}>
      <div style={s.box}>
        <div style={s.logo}>PELAFITNESS</div>
        <div style={s.sub}>Plataforma de coaching online</div>
        <form onSubmit={login}>
          <label style={s.label}>Email</label>
          <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" required />
          <label style={s.label}>Contraseña</label>
          <input style={s.input} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          {error && <div style={s.err}>{error}</div>}
          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
