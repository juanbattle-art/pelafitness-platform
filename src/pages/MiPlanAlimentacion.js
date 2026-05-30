import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const MOMENTOS = ['Desayuno', 'Almuerzo', 'Merienda', 'Cena', 'Pre-entreno', 'Post-entreno', 'Colación']

const s = {
  page: { minHeight: '100vh', background: '#0a0a0a', fontFamily: "'DM Sans', sans-serif", paddingBottom: 80, color: '#f0f0f0' },
  header: { background: '#111', borderBottom: '1px solid #222', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 },
  logo: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 2, color: '#f5e642' },
  backBtn: { background: 'none', border: '1px solid #222', color: '#888', borderRadius: 8, padding: '6px 14px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' },
  main: { maxWidth: 720, margin: '0 auto', padding: '20px 16px' },
  btn: { background: '#f5e642', color: '#000', border: 'none', borderRadius: 8, padding: '12px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' },
  btnFull: { background: '#f5e642', color: '#000', border: 'none', borderRadius: 8, padding: '14px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', width: '100%' },
  btnSm: { background: '#1a1a1a', color: '#f5e642', border: '1px solid #f5e64240', borderRadius: 6, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 },
  btnDanger: { background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', border: '1px solid rgba(255,77,77,0.2)', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' },
  btnGhost: { background: 'none', color: '#888', border: '1px solid #222', borderRadius: 8, padding: '10px 16px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' },
  input: { width: '100%', background: '#0a0a0a', border: '1px solid #222', borderRadius: 8, padding: '10px 14px', color: '#f0f0f0', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' },
  select: { width: '100%', background: '#0a0a0a', border: '1px solid #222', borderRadius: 8, padding: '10px 14px', color: '#f0f0f0', fontSize: 14, outline: 'none', fontFamily: 'inherit', appearance: 'none', boxSizing: 'border-box' },
  label: { display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#555', marginBottom: 6, marginTop: 12 },
  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'flex-end' },
  modalContent: { background: '#111', width: '100%', maxHeight: '92vh', borderRadius: '16px 16px 0 0', overflowY: 'auto', padding: 20 },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #222' },
  modalTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 1, color: '#f0f0f0' },
  closeBtn: { background: 'none', border: 'none', color: '#888', fontSize: 24, cursor: 'pointer', padding: 4 },
  planCard: { background: '#111', border: '1px solid #222', borderRadius: 12, padding: 16, marginBottom: 12, cursor: 'pointer' },
  empty: { textAlign: 'center', color: '#444', padding: '60px 20px', fontSize: 14 },
  macroCircle: (color) => ({ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block', marginRight: 4 }),
}

function calcTotales(comidas) {
  return (comidas || []).reduce((acc, comida) => {
    (comida.plan_comida_items || []).forEach(item => {
      acc.calorias += item.calorias || 0
      acc.proteinas += item.proteinas || 0
      acc.carbohidratos += item.carbohidratos || 0
      acc.grasas += item.grasas || 0
    })
    return acc
  }, { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 })
}

export default function MiPlanAlimentacion({ perfil }) {
  const navigate = useNavigate()
  const [planes, setPlanes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalNuevoPlan, setModalNuevoPlan] = useState(false)
  const [modalDetalle, setModalDetalle] = useState(null)
  const [modalAgregarComida, setModalAgregarComida] = useState(false)
  const [modalAgregarAlimento, setModalAgregarAlimento] = useState(null) // comida seleccionada
  const [comidasPlan, setComidasPlan] = useState([])
  const [saving, setSaving] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [resultadosBusqueda, setResultadosBusqueda] = useState([])
  const [buscando, setBuscando] = useState(false)
  const [alimentoSeleccionado, setAlimentoSeleccionado] = useState(null)
  const [gramosInput, setGramosInput] = useState(100)
  const [alimentoForm, setAlimentoForm] = useState({ nombre: '', calorias: '', proteinas: '', carbohidratos: '', grasas: '', cantidad_gramos: 100 })
  const [modoManual, setModoManual] = useState(false)

  const [nuevoPlanForm, setNuevoPlanForm] = useState({ nombre: '', descripcion: '', calorias_objetivo: '' })
  const [nuevaComidaMomento, setNuevaComidaMomento] = useState('Desayuno')

  useEffect(() => { cargarPlanes() }, [])

  async function cargarPlanes() {
    setLoading(true)
    const { data } = await supabase.from('planes_alimentacion').select('*').eq('alumno_id', perfil.id).order('created_at', { ascending: false })
    setPlanes(data || [])
    setLoading(false)
  }

  async function cargarComidasPlan(planId) {
    const { data } = await supabase.from('plan_comidas').select('*, plan_comida_items(*)').eq('plan_id', planId).order('orden')
    setComidasPlan(data || [])
  }

  async function crearPlan() {
    if (!nuevoPlanForm.nombre.trim()) return
    setSaving(true)
    const { data } = await supabase.from('planes_alimentacion').insert({ ...nuevoPlanForm, alumno_id: perfil.id, calorias_objetivo: parseInt(nuevoPlanForm.calorias_objetivo) || null }).select().single()
    if (data) {
      setPlanes(prev => [data, ...prev])
      setModalNuevoPlan(false)
      setNuevoPlanForm({ nombre: '', descripcion: '', calorias_objetivo: '' })
      setModalDetalle(data)
      setComidasPlan([])
    }
    setSaving(false)
  }

  async function eliminarPlan(id) {
    if (!window.confirm('¿Eliminar este plan?')) return
    await supabase.from('planes_alimentacion').delete().eq('id', id)
    setPlanes(prev => prev.filter(p => p.id !== id))
    setModalDetalle(null)
  }

  async function agregarComida() {
    if (!modalDetalle) return
    setSaving(true)
    const { data } = await supabase.from('plan_comidas').insert({ plan_id: modalDetalle.id, momento: nuevaComidaMomento, orden: comidasPlan.length }).select().single()
    if (data) {
      setComidasPlan(prev => [...prev, { ...data, plan_comida_items: [] }])
      setModalAgregarComida(false)
    }
    setSaving(false)
  }

  async function eliminarComida(comidaId) {
    await supabase.from('plan_comidas').delete().eq('id', comidaId)
    setComidasPlan(prev => prev.filter(c => c.id !== comidaId))
  }

  async function buscarAlimento(q) {
    if (!q || q.length < 2) { setResultadosBusqueda([]); return }
    setBuscando(true)
    // Buscar en base local
    const { data: local } = await supabase.from('alimentos').select('*').ilike('nombre', `%${q}%`).limit(8)
    setResultadosBusqueda(local || [])
    // También buscar en Open Food Facts
    try {
      const res = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=8&lc=es`)
      const json = await res.json()
      const externos = (json.products || []).filter(p => p.nutriments && p.product_name_es).map(p => ({
        id: 'off_' + p.code,
        nombre: p.product_name_es || p.product_name,
        calorias: Math.round(p.nutriments['energy-kcal_100g'] || 0),
        proteinas: Math.round(p.nutriments.proteins_100g || 0),
        carbohidratos: Math.round(p.nutriments.carbohydrates_100g || 0),
        grasas: Math.round(p.nutriments.fat_100g || 0),
        porcion_gramos: 100,
        fuente: 'off'
      }))
      setResultadosBusqueda(prev => [...prev, ...externos.slice(0, 5)])
    } catch (e) { /* sin internet, solo local */ }
    setBuscando(false)
  }

  function seleccionarAlimento(alimento) {
    setAlimentoSeleccionado(alimento)
    setGramosInput(alimento.porcion_gramos || 100)
  }

  function calcularPorGramos(alimento, gramos) {
    const factor = gramos / 100
    return {
      calorias: Math.round((alimento.calorias || 0) * factor),
      proteinas: Math.round((alimento.proteinas || 0) * factor * 10) / 10,
      carbohidratos: Math.round((alimento.carbohidratos || 0) * factor * 10) / 10,
      grasas: Math.round((alimento.grasas || 0) * factor * 10) / 10,
    }
  }

  async function agregarAlimentoAComida() {
    if (!modalAgregarAlimento) return
    setSaving(true)
    let item
    if (modoManual) {
      item = {
        comida_id: modalAgregarAlimento.id,
        nombre: alimentoForm.nombre,
        cantidad_gramos: parseInt(alimentoForm.cantidad_gramos) || 100,
        calorias: parseInt(alimentoForm.calorias) || 0,
        proteinas: parseFloat(alimentoForm.proteinas) || 0,
        carbohidratos: parseFloat(alimentoForm.carbohidratos) || 0,
        grasas: parseFloat(alimentoForm.grasas) || 0,
        orden: modalAgregarAlimento.plan_comida_items?.length || 0
      }
    } else {
      const macros = calcularPorGramos(alimentoSeleccionado, gramosInput)
      item = {
        comida_id: modalAgregarAlimento.id,
        nombre: alimentoSeleccionado.nombre,
        cantidad_gramos: gramosInput,
        ...macros,
        orden: modalAgregarAlimento.plan_comida_items?.length || 0
      }
    }
    const { data } = await supabase.from('plan_comida_items').insert(item).select().single()
    if (data) {
      setComidasPlan(prev => prev.map(c => c.id === modalAgregarAlimento.id
        ? { ...c, plan_comida_items: [...(c.plan_comida_items || []), data] }
        : c
      ))
      setModalAgregarAlimento(null)
      setAlimentoSeleccionado(null)
      setBusqueda('')
      setResultadosBusqueda([])
      setModoManual(false)
      setAlimentoForm({ nombre: '', calorias: '', proteinas: '', carbohidratos: '', grasas: '', cantidad_gramos: 100 })
    }
    setSaving(false)
  }

  async function eliminarAlimento(comidaId, itemId) {
    await supabase.from('plan_comida_items').delete().eq('id', itemId)
    setComidasPlan(prev => prev.map(c => c.id === comidaId
      ? { ...c, plan_comida_items: c.plan_comida_items.filter(i => i.id !== itemId) }
      : c
    ))
  }

  const totales = calcTotales(comidasPlan)

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={s.logo}>PELAFITNESS</div>
        <button style={s.backBtn} onClick={() => navigate('/')}>← Volver</button>
      </header>

      <main style={s.main}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, letterSpacing: 1, color: '#f0f0f0' }}>Mi Alimentación</div>
          <div style={{ fontSize: 13, color: '#555' }}>Armá tus planes de comidas personalizados</div>
        </div>

        <button style={{ ...s.btnFull, marginBottom: 16 }} onClick={() => setModalNuevoPlan(true)}>
          + Nuevo Plan
        </button>

        {loading ? (
          <div style={s.empty}>Cargando...</div>
        ) : planes.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🥗</div>
            <div>Todavía no creaste ningún plan.<br />Tocá "Nuevo Plan" para empezar.</div>
          </div>
        ) : (
          planes.map(p => (
            <div key={p.id} style={s.planCard} onClick={() => { setModalDetalle(p); cargarComidasPlan(p.id) }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 1, color: '#4ade80' }}>{p.nombre}</div>
                  {p.descripcion && <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{p.descripcion}</div>}
                  {p.calorias_objetivo && <div style={{ fontSize: 12, color: '#f5e642', marginTop: 4 }}>🎯 {p.calorias_objetivo} kcal objetivo</div>}
                </div>
                <div style={{ color: '#4ade80', fontSize: 20 }}>›</div>
              </div>
            </div>
          ))
        )}
      </main>

      {/* MODAL NUEVO PLAN */}
      {modalNuevoPlan && (
        <div style={s.modal} onClick={() => setModalNuevoPlan(false)}>
          <div style={s.modalContent} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div style={s.modalTitle}>NUEVO PLAN</div>
              <button style={s.closeBtn} onClick={() => setModalNuevoPlan(false)}>✕</button>
            </div>
            <label style={s.label}>Nombre del plan</label>
            <input style={s.input} placeholder="Ej: Plan Déficit Semana 1" value={nuevoPlanForm.nombre} onChange={e => setNuevoPlanForm(p => ({ ...p, nombre: e.target.value }))} />
            <label style={s.label}>Descripción (opcional)</label>
            <input style={s.input} placeholder="Ej: Para bajar de grasa" value={nuevoPlanForm.descripcion} onChange={e => setNuevoPlanForm(p => ({ ...p, descripcion: e.target.value }))} />
            <label style={s.label}>Calorías objetivo (opcional)</label>
            <input style={s.input} type="number" placeholder="Ej: 2000" value={nuevoPlanForm.calorias_objetivo} onChange={e => setNuevoPlanForm(p => ({ ...p, calorias_objetivo: e.target.value }))} />
            <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
              <button style={s.btnGhost} onClick={() => setModalNuevoPlan(false)}>Cancelar</button>
              <button style={{ ...s.btn, flex: 1 }} onClick={crearPlan} disabled={saving}>{saving ? 'Guardando...' : 'Crear Plan'}</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLE PLAN */}
      {modalDetalle && (
        <div style={s.modal} onClick={() => setModalDetalle(null)}>
          <div style={{ ...s.modalContent, maxHeight: '95vh' }} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div>
                <div style={s.modalTitle}>{modalDetalle.nombre}</div>
                {modalDetalle.descripcion && <div style={{ fontSize: 12, color: '#666' }}>{modalDetalle.descripcion}</div>}
              </div>
              <button style={s.closeBtn} onClick={() => setModalDetalle(null)}>✕</button>
            </div>

            {/* Resumen macros */}
            {comidasPlan.length > 0 && (
              <div style={{ background: '#0d0d0d', border: '1px solid #222', borderRadius: 10, padding: 14, marginBottom: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, textAlign: 'center' }}>
                  {[
                    { label: 'KCAL', value: Math.round(totales.calorias), color: '#f5e642' },
                    { label: 'PROT', value: `${Math.round(totales.proteinas)}g`, color: '#60a5fa' },
                    { label: 'CARBS', value: `${Math.round(totales.carbohidratos)}g`, color: '#f97316' },
                    { label: 'GRASAS', value: `${Math.round(totales.grasas)}g`, color: '#facc15' },
                  ].map(m => (
                    <div key={m.label}>
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: m.color }}>{m.value}</div>
                      <div style={{ fontSize: 10, color: '#555', letterSpacing: 1 }}>{m.label}</div>
                    </div>
                  ))}
                </div>
                {modalDetalle.calorias_objetivo && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ height: 4, background: '#1a1a1a', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min((totales.calorias / modalDetalle.calorias_objetivo) * 100, 100)}%`, background: '#f5e642', borderRadius: 4, transition: 'width 0.3s' }} />
                    </div>
                    <div style={{ fontSize: 11, color: '#555', marginTop: 4, textAlign: 'center' }}>
                      {Math.round(totales.calorias)} / {modalDetalle.calorias_objetivo} kcal objetivo
                    </div>
                  </div>
                )}
              </div>
            )}

            {comidasPlan.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#444', padding: '30px 0', fontSize: 13 }}>
                Todavía no hay comidas en este plan.<br />Agregá una comida para empezar.
              </div>
            ) : (
              comidasPlan.map(comida => {
                const subtotal = (comida.plan_comida_items || []).reduce((acc, i) => acc + (i.calorias || 0), 0)
                return (
                  <div key={comida.id} style={{ background: '#0d0d0d', border: '1px solid #222', borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 1, color: '#4ade80' }}>{comida.momento}</div>
                        {subtotal > 0 && <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{subtotal} kcal</div>}
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button style={s.btnSm} onClick={() => { setModalAgregarAlimento(comida); setAlimentoSeleccionado(null); setBusqueda(''); setResultadosBusqueda([]) }}>+ Alimento</button>
                        <button style={s.btnDanger} onClick={() => eliminarComida(comida.id)}>✕</button>
                      </div>
                    </div>
                    {(comida.plan_comida_items || []).length === 0 ? (
                      <div style={{ padding: '10px 16px', fontSize: 12, color: '#444' }}>Sin alimentos todavía</div>
                    ) : (
                      (comida.plan_comida_items || []).map(item => (
                        <div key={item.id} style={{ padding: '10px 16px', borderBottom: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: 13, color: '#f0f0f0', fontWeight: 600 }}>{item.nombre}</div>
                            <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>
                              {item.cantidad_gramos}g · {item.calorias} kcal · P:{item.proteinas}g C:{item.carbohidratos}g G:{item.grasas}g
                            </div>
                          </div>
                          <button style={s.btnDanger} onClick={() => eliminarAlimento(comida.id, item.id)}>✕</button>
                        </div>
                      ))
                    )}
                  </div>
                )
              })
            )}

            <button style={{ ...s.btnFull, marginTop: 8, marginBottom: 8, background: '#4ade8020', color: '#4ade80', border: '1px solid #4ade8040' }} onClick={() => setModalAgregarComida(true)}>
              + Agregar Comida
            </button>
            <button style={{ background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', border: '1px solid rgba(255,77,77,0.2)', borderRadius: 8, padding: '12px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', width: '100%' }} onClick={() => eliminarPlan(modalDetalle.id)}>
              Eliminar Plan
            </button>
          </div>
        </div>
      )}

      {/* MODAL AGREGAR COMIDA */}
      {modalAgregarComida && (
        <div style={s.modal} onClick={() => setModalAgregarComida(false)}>
          <div style={s.modalContent} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div style={s.modalTitle}>NUEVA COMIDA</div>
              <button style={s.closeBtn} onClick={() => setModalAgregarComida(false)}>✕</button>
            </div>
            <label style={s.label}>Momento del día</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {MOMENTOS.map(m => (
                <button key={m} style={{ padding: '8px 14px', borderRadius: 8, border: `1px solid ${nuevaComidaMomento === m ? '#4ade80' : '#222'}`, background: nuevaComidaMomento === m ? 'rgba(74,222,128,0.1)' : '#0d0d0d', color: nuevaComidaMomento === m ? '#4ade80' : '#888', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', fontWeight: nuevaComidaMomento === m ? 700 : 400 }} onClick={() => setNuevaComidaMomento(m)}>{m}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={s.btnGhost} onClick={() => setModalAgregarComida(false)}>Cancelar</button>
              <button style={{ ...s.btn, flex: 1, background: '#4ade80' }} onClick={agregarComida} disabled={saving}>{saving ? 'Guardando...' : 'Agregar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AGREGAR ALIMENTO */}
      {modalAgregarAlimento && (
        <div style={s.modal} onClick={() => setModalAgregarAlimento(null)}>
          <div style={{ ...s.modalContent, maxHeight: '95vh' }} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div>
                <div style={s.modalTitle}>AGREGAR ALIMENTO</div>
                <div style={{ fontSize: 12, color: '#666' }}>{modalAgregarAlimento.momento}</div>
              </div>
              <button style={s.closeBtn} onClick={() => setModalAgregarAlimento(null)}>✕</button>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <button style={{ ...s.btnSm, flex: 1, background: !modoManual ? 'rgba(245,230,66,0.1)' : '#0d0d0d', borderColor: !modoManual ? '#f5e642' : '#222', color: !modoManual ? '#f5e642' : '#666' }} onClick={() => setModoManual(false)}>🔍 Buscar</button>
              <button style={{ ...s.btnSm, flex: 1, background: modoManual ? 'rgba(245,230,66,0.1)' : '#0d0d0d', borderColor: modoManual ? '#f5e642' : '#222', color: modoManual ? '#f5e642' : '#666' }} onClick={() => setModoManual(true)}>✏️ Manual</button>
            </div>

            {modoManual ? (
              <>
                <label style={s.label}>Nombre del alimento</label>
                <input style={s.input} placeholder="Ej: Arroz con pollo" value={alimentoForm.nombre} onChange={e => setAlimentoForm(p => ({ ...p, nombre: e.target.value }))} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={s.label}>Gramos</label>
                    <input style={s.input} type="number" value={alimentoForm.cantidad_gramos} onChange={e => setAlimentoForm(p => ({ ...p, cantidad_gramos: e.target.value }))} />
                  </div>
                  <div>
                    <label style={s.label}>Calorías</label>
                    <input style={s.input} type="number" value={alimentoForm.calorias} onChange={e => setAlimentoForm(p => ({ ...p, calorias: e.target.value }))} />
                  </div>
                  <div>
                    <label style={s.label}>Proteínas (g)</label>
                    <input style={s.input} type="number" value={alimentoForm.proteinas} onChange={e => setAlimentoForm(p => ({ ...p, proteinas: e.target.value }))} />
                  </div>
                  <div>
                    <label style={s.label}>Carbos (g)</label>
                    <input style={s.input} type="number" value={alimentoForm.carbohidratos} onChange={e => setAlimentoForm(p => ({ ...p, carbohidratos: e.target.value }))} />
                  </div>
                  <div>
                    <label style={s.label}>Grasas (g)</label>
                    <input style={s.input} type="number" value={alimentoForm.grasas} onChange={e => setAlimentoForm(p => ({ ...p, grasas: e.target.value }))} />
                  </div>
                </div>
                <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                  <button style={s.btnGhost} onClick={() => setModalAgregarAlimento(null)}>Cancelar</button>
                  <button style={{ ...s.btn, flex: 1 }} onClick={agregarAlimentoAComida} disabled={saving || !alimentoForm.nombre}>{saving ? 'Guardando...' : 'Agregar'}</button>
                </div>
              </>
            ) : !alimentoSeleccionado ? (
              <>
                <input
                  style={{ ...s.input, marginBottom: 10 }}
                  placeholder="🔍 Buscar alimento..."
                  value={busqueda}
                  onChange={e => { setBusqueda(e.target.value); buscarAlimento(e.target.value) }}
                />
                {buscando && <div style={{ textAlign: 'center', color: '#555', fontSize: 12, padding: 10 }}>Buscando...</div>}
                <div style={{ maxHeight: 350, overflowY: 'auto' }}>
                  {resultadosBusqueda.map((a, i) => (
                    <div key={a.id || i} style={{ padding: '12px 14px', borderBottom: '1px solid #1a1a1a', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => seleccionarAlimento(a)}>
                      <div>
                        <div style={{ fontSize: 14, color: '#f0f0f0', fontWeight: 600 }}>{a.nombre}</div>
                        <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>por 100g · {a.calorias} kcal · P:{a.proteinas}g C:{a.carbohidratos}g G:{a.grasas}g</div>
                      </div>
                      <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: a.fuente === 'off' ? 'rgba(245,230,66,0.1)' : 'rgba(74,222,128,0.1)', color: a.fuente === 'off' ? '#f5e642' : '#4ade80', fontWeight: 700 }}>{a.fuente === 'off' ? 'web' : 'local'}</span>
                    </div>
                  ))}
                  {busqueda.length > 1 && resultadosBusqueda.length === 0 && !buscando && (
                    <div style={{ textAlign: 'center', color: '#444', padding: '20px', fontSize: 13 }}>
                      No encontré "{busqueda}".<br />
                      <button style={{ ...s.btnSm, marginTop: 10 }} onClick={() => { setModoManual(true); setAlimentoForm(p => ({ ...p, nombre: busqueda })) }}>Ingresarlo manual</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid #4ade8040', borderRadius: 10, padding: '12px 14px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#4ade80' }}>{alimentoSeleccionado.nombre}</div>
                    <div style={{ fontSize: 11, color: '#888' }}>por 100g: {alimentoSeleccionado.calorias} kcal</div>
                  </div>
                  <button style={s.btnSm} onClick={() => setAlimentoSeleccionado(null)}>Cambiar</button>
                </div>

                <label style={s.label}>Cantidad en gramos</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <button style={{ background: '#1a1a1a', border: '1px solid #f5e64240', borderRadius: 10, color: '#f5e642', fontSize: 22, width: 44, height: 44, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setGramosInput(p => Math.max(5, p - 10))}>−</button>
                  <input style={{ ...s.input, textAlign: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: '#f5e642', border: '1px solid #f5e642', flex: 1 }} type="number" value={gramosInput} onChange={e => setGramosInput(parseInt(e.target.value) || 0)} />
                  <button style={{ background: '#1a1a1a', border: '1px solid #f5e64240', borderRadius: 10, color: '#f5e642', fontSize: 22, width: 44, height: 44, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setGramosInput(p => p + 10)}>+</button>
                </div>

                {(() => {
                  const m = calcularPorGramos(alimentoSeleccionado, gramosInput)
                  return (
                    <div style={{ background: '#0d0d0d', border: '1px solid #222', borderRadius: 10, padding: 14, marginBottom: 16 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, textAlign: 'center' }}>
                        {[{ l: 'KCAL', v: m.calorias, c: '#f5e642' }, { l: 'PROT', v: `${m.proteinas}g`, c: '#60a5fa' }, { l: 'CARBS', v: `${m.carbohidratos}g`, c: '#f97316' }, { l: 'GRASAS', v: `${m.grasas}g`, c: '#facc15' }].map(x => (
                          <div key={x.l}>
                            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: x.c }}>{x.v}</div>
                            <div style={{ fontSize: 9, color: '#555', letterSpacing: 1 }}>{x.l}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}

                <div style={{ display: 'flex', gap: 10 }}>
                  <button style={s.btnGhost} onClick={() => setAlimentoSeleccionado(null)}>← Volver</button>
                  <button style={{ ...s.btn, flex: 1 }} onClick={agregarAlimentoAComida} disabled={saving}>{saving ? 'Guardando...' : 'Agregar al Plan'}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&display=swap');`}</style>
    </div>
  )
}
