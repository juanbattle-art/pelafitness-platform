import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'
import Programa from './pages/Programa'
import Seguimiento from './pages/Seguimiento'
import MisAlumnos from './pages/MisAlumnos'
import PlanEntrenamiento from './pages/PlanEntrenamiento'
import MiEntrenamiento from './pages/MiEntrenamiento'
import MiRutina from './pages/MiRutina'
import MiPlanAlimentacion from './pages/MiPlanAlimentacion'
import HabitTracker from './pages/HabitTracker'

const ADMIN_EMAIL = 'juanbattle@hotmail.com'

export default function App() {
  const [session, setSession] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) cargarPerfil(session.user)
      else setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) cargarPerfil(session.user)
      else { setPerfil(null); setLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function cargarPerfil(user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (data) {
      setPerfil(data)
    } else {
      setPerfil({
        id: user.id,
        email: user.email,
        nombre: user.email === ADMIN_EMAIL ? 'Juan' : 'Alumno',
        rol: user.email === ADMIN_EMAIL ? 'admin' : 'alumno',
        estado: 'aprobado'
      })
    }
    setLoading(false)
  }

  async function cerrarSesion() {
    await supabase.auth.signOut()
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0a0a0a' }}>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: 2, color: '#f5e642' }}>PELAFITNESS</div>
    </div>
  )

  const esPendiente = session && perfil && perfil.rol !== 'admin' && perfil.estado === 'pendiente'
  const esRechazado = session && perfil && perfil.rol !== 'admin' && perfil.estado === 'rechazado'

  if (esPendiente || esRechazado) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif", padding: 24 }}>
        <div style={{ maxWidth: 420, width: '100%', textAlign: 'center', padding: '48px 32px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20 }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, letterSpacing: 3, color: '#f5e642', marginBottom: 24 }}>PELAFITNESS</div>
          <div style={{ fontSize: 52, marginBottom: 20 }}>{esRechazado ? '🚫' : '⏳'}</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, letterSpacing: 1, color: '#fff', marginBottom: 16 }}>
            {esRechazado ? 'ACCESO NO AUTORIZADO' : 'ESPERANDO APROBACIÓN'}
          </div>
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 32 }}>
            {esRechazado ? (
              <>Tu solicitud de acceso no fue aprobada.<br />Contactá a tu coach para más información.</>
            ) : (
              <>¡Hola {perfil.nombre}! 👋<br /><br />Tu cuenta fue creada correctamente, pero tu coach todavía no aprobó tu acceso.<br /><br />Avisale que ya te registraste y volvé a entrar en un rato 💪</>
            )}
          </div>
          <button onClick={cerrarSesion} style={{ width: '100%', background: '#f5e642', color: '#000', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, padding: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>
            Cerrar sesión
          </button>
        </div>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&display=swap');`}</style>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/" />} />
        <Route path="/" element={session ? (perfil?.rol === 'admin' ? <Navigate to="/admin" /> : <Dashboard perfil={perfil} />) : <Navigate to="/login" />} />
        <Route path="/admin" element={session && perfil?.rol === 'admin' ? <Admin perfil={perfil} /> : <Navigate to="/" />} />
        <Route path="/programa/:id" element={session ? <Programa perfil={perfil} /> : <Navigate to="/login" />} />
        <Route path="/plan-entrenamiento/:alumnoId" element={session && perfil?.rol === 'admin' ? <PlanEntrenamiento perfil={perfil} /> : <Navigate to="/" />} />
        <Route path="/mi-entrenamiento" element={session ? <MiEntrenamiento perfil={perfil} /> : <Navigate to="/login" />} />
        <Route path="/seguimiento" element={session ? <Seguimiento perfil={perfil} /> : <Navigate to="/login" />} />
        <Route path="/mis-alumnos" element={session && perfil?.rol === 'admin' ? <MisAlumnos perfil={perfil} /> : <Navigate to="/" />} />
        <Route path="/mi-rutina" element={session ? <MiRutina perfil={perfil} /> : <Navigate to="/login" />} />
        <Route path="/mi-plan-alimentacion" element={session ? <MiPlanAlimentacion perfil={perfil} /> : <Navigate to="/login" />} />
        <Route path="/habitos" element={session && perfil ? <HabitTracker perfil={perfil} /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}
