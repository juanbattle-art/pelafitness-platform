import { useState } from 'react'
import { supabase } from '../lib/supabase'

const FOTO = 'https://i.ibb.co/0j2xWY9v/pela20232.jpg'

export default function Login() {
  const [modo, setModo] = useState('login') // 'login' o 'registro'
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [exitoRegistro, setExitoRegistro] = useState(false)

  async function login(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Email o contraseña incorrectos')
    setLoading(false)
  }

  async function registrar(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!nombre.trim()) {
      setError('Ingresá tu nombre')
      setLoading(false)
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setLoading(false)
      return
    }

    // Registrar con el nombre en metadata (el trigger lo usa para crear el perfil)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre: nombre.trim() }
      }
    })

    if (error) {
      if (error.message.includes('already registered') || error.message.includes('already been registered')) {
        setError('Ese email ya está registrado. Probá iniciar sesión.')
      } else {
        setError('Error al registrarse: ' + error.message)
      }
      setLoading(false)
      return
    }

    // Registro exitoso
    setExitoRegistro(true)
    setLoading(false)
    // Cerramos cualquier sesión automática para que vea la pantalla de éxito
    await supabase.auth.signOut()
  }

  function cambiarModo(nuevoModo) {
    setModo(nuevoModo)
    setError('')
    setExitoRegistro(false)
    setPassword('')
  }

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10, color: '#fff', fontSize: 15,
    padding: '13px 16px', outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 0.2s'
  }

  const labelStyle = {
    display: 'block', fontSize: 11, fontWeight: 700,
    letterSpacing: 1, textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.4)', marginBottom: 8
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
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 44, letterSpacing: 4,
            color: '#f5e642', marginBottom: 6
          }}>PELAFITNESS</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', letterSpacing: 0.5 }}>
            Tu plataforma de coaching online
          </div>
        </div>

        {/* Tabs Login / Registro */}
        {!exitoRegistro && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 28, background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 4 }}>
            <button
              onClick={() => cambiarModo('login')}
              style={{
                flex: 1, padding: '10px', borderRadius: 8, border: 'none',
                background: modo === 'login' ? '#f5e642' : 'transparent',
                color: modo === 'login' ? '#000' : 'rgba(255,255,255,0.6)',
                fontWeight: 700, fontSize: 13, cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all 0.2s'
              }}
            >
              Ingresar
            </button>
            <button
              onClick={() => cambiarModo('registro')}
              style={{
                flex: 1, padding: '10px', borderRadius: 8, border: 'none',
                background: modo === 'registro' ? '#f5e642' : 'transparent',
                color: modo === 'registro' ? '#000' : 'rgba(255,255,255,0.6)',
                fontWeight: 700, fontSize: 13, cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all 0.2s'
              }}
            >
              Crear cuenta
            </button>
          </div>
        )}

        {/* Pantalla de éxito tras registro */}
        {exitoRegistro ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, color: '#f5e642', letterSpacing: 1, marginBottom: 12 }}>
              ¡CUENTA CREADA!
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: 24 }}>
              Tu cuenta fue creada correctamente.<br/>
              Ahora tu coach tiene que <strong style={{ color: '#f5e642' }}>aprobar tu acceso</strong>.<br/><br/>
              Avisale que ya te registraste 💪
            </div>
            <button
              onClick={() => cambiarModo('login')}
              style={{
                width: '100%', background: '#f5e642', color: '#000',
                border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700,
                padding: '14px', cursor: 'pointer'
              }}
            >
              Volver a Ingresar
            </button>
          </div>
        ) : (
          <form onSubmit={modo === 'login' ? login : registrar}>
            {/* Campo nombre solo en registro */}
            {modo === 'registro' && (
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Nombre completo</label>
                <input
                  type="text" value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  placeholder="Ej: Juan Pérez" required
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#f5e642'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                />
              </div>
            )}

            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com" required
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#f5e642'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
              />
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={labelStyle}>Contraseña</label>
              <input
                type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={modo === 'registro' ? 'Mínimo 6 caracteres' : '••••••••'} required
                style={inputStyle}
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
              {loading
                ? (modo === 'login' ? 'Ingresando...' : 'Creando cuenta...')
                : (modo === 'login' ? 'Ingresar →' : 'Crear cuenta →')}
            </button>
          </form>
        )}

        {!exitoRegistro && (
          <div style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
            {modo === 'login'
              ? '¿No tenés cuenta? Tocá "Crear cuenta"'
              : 'Después de registrarte, tu coach aprobará tu acceso'}
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&display=swap');
        input::placeholder { color: rgba(255,255,255,0.25) !important; }
      `}</style>
    </div>
  )
}
