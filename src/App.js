import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'
import Programa from './pages/Programa'

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
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      setPerfil(data)
    } else {
      setPerfil({
        id: user.id,
        email: user.email,
        nombre: user.email === ADMIN_EMAIL ? 'Juan' : 'Alumno',
        rol: user.email === ADMIN_EMAIL ? 'admin' : 'alumno'
      })
    }
    setLoading(false)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0a0a0a' }}>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: 2, color: '#f5e642' }}>
        PELAFITNESS
      </div>
    </div>
  )

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/" />} />
        <Route path="/" element={session ? (perfil?.rol === 'admin' ? <Navigate to="/admin" /> : <Dashboard perfil={perfil} />) : <Navigate to="/login" />} />
        <Route path="/admin" element={session && perfil?.rol === 'admin' ? <Admin perfil={perfil} /> : <Navigate to="/" />} />
        <Route path="/programa/:id" element={session ? <Programa perfil={perfil} /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}
