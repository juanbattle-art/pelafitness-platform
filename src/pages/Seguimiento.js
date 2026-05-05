import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const s = {
  page: { minHeight: '100vh', background: '#0a0a0a', fontFamily: "'DM Sans', sans-serif" },
  header: { background: '#111', borderBottom: '1px solid #222', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 },
  logo: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, letterSpacing: 2, color: '#f5e642' },
  backBtn: { background: 'none', border: '1px solid #222', color: '#888', borderRadius: 8, padding: '6px 14px', fontSize: 13, cursor: 'pointer' },
  main: { maxWidth: 860, margin: '0 auto', padding: '28px 20px' },
  tabs: { display: 'flex', gap: 4, borderBottom: '1px solid #1a1a1a', marginBottom: 28, overflowX: 'auto' },
  tab: (a) => ({ padding: '10px 16px', background: 'none', border: 'none', borderBottom: `2px solid ${a ? '#f5e642' : 'transparent'}`, color: a ? '#f5e642' : '#555', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }),
  card: { background: '#111', border: '1px solid #222', borderRadius: 12, padding: '20px', marginBottom: 16 },
  cardTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 1, marginBottom: 16 },
  grid: { display: 'grid', gap: 12 },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  row3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 },
  label: { display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#555', marginBottom: 7 },
  input: { width: '100%', background: '#0a0a0a', border: '1px solid #222', borderRadius: 8, color: '#f0f0f0', fontFamily: 'inherit', fontSize: 14, padding: '10px 14px', outline: 'none', boxSizing: 'border-box' },
  select: { width: '100%', background: '#0a0a0a', border: '1px solid #222', borderRadius: 8, color: '#f0f0f0', fontFamily: 'inherit', fontSize: 14, padding: '10px 14px', outline: 'none', appearance: 'none', boxSizing: 'border-box' },
  btn: { background: '#f5e642', color: '#000', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' },
  btnSm: { background: '#1a1a1a', color: '#888', border: '1px solid #222', borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' },
  btnDanger: { background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', border: '1px solid rgba(255,77,77,0.2)', borderRadius: 6, padding: '5px 10px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' },
  item: { background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  itemText: { fontSize: 14, color: '#ccc' },
  itemSub: { fontSize: 12, color: '#444', marginTop: 2 },
  stat: { background: '#111', border: '1px solid #222', borderRadius: 12, padding: '16px 20px', textAlign: 'center' },
  statNum: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: '#f5e642', letterSpacing: 1 },
  statLabel: { fontSize: 11, color: '#555', marginTop: 4 },
  success: { color: '#4ade80', fontSize: 13, marginBottom: 12 },
  agua: { display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 },
  vaso: (lleno) => ({ width: 44, height: 44, borderRadius: 8, border: `2px solid ${lleno ? '#60a5fa' : '#222'}`, background: lleno ? 'rgba(96,165,250,0.2)' : 'transparent', cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }),
}

const MOMENTOS = ['Desayuno', 'Almuerzo', 'Merienda', 'Cena', 'Snack']

function ProgressBar({ actual, meta, color }) {
  const pct = meta > 0 ? Math.min((actual / meta) * 100, 100) : 0
  const over = meta > 0 && actual > meta
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ background: '#1a1a1a', borderRadius: 6, height: 8, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: over ? '#ff4d4d' : color, borderRadius: 6, transition: 'width 0.3s' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 11, color: over ? '#ff4d4d' : '#666' }}>{Math.round(actual)}</span>
        <span style={{ fontSize: 11, color: '#444' }}>meta: {Math.round(meta)}</span>
      </div>
    </div>
  )
}

export default function Seguimiento({ perfil }) {
  const navigate = useNavigate()
  const [tab, setTab] = useState('resumen')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [msg, setMsg] = useState('')
  const [peso, setPeso] = useState('')
  const [registrosPeso, setRegistrosPeso] = useState([])
  const [vasosHoy, setVasosHoy] = useState(0)
  const META_AGUA = 8
  const [comidas, setComidas] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [alimentos, setAlimentos] = useState([])
  const [resultados, setResultados] = useState([])
  const [buscando, setBuscando] = useState(false)
  const [alimentoSel, setAlimentoSel] = useState(null)
  const [gramos, setGramos] = useState('100')
  const [momento, setMomento] = useState('Desayuno')
  const [modoManual, setModoManual] = useState(false)
  const [manualData, setManualData] = useState({ nombre: '', calorias: '', proteinas: '', carbohidratos: '', grasas: '' })
  const [ejercicios, setEjercicios] = useState([])
  const [nuevoEj, setNuevoEj] =
