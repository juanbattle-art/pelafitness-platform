import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/library'

const s = {
  modal: { 
    position: 'fixed', 
    top: 0, left: 0, right: 0, bottom: 0, 
    background: '#000', 
    zIndex: 300, 
    display: 'flex', 
    flexDirection: 'column' 
  },
  header: { 
    background: '#111', 
    borderBottom: '1px solid #222', 
    padding: '16px 20px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    color: '#f0f0f0',
    fontFamily: "'DM Sans', sans-serif"
  },
  title: { 
    fontFamily: "'Bebas Neue', sans-serif", 
    fontSize: 20, 
    letterSpacing: 1.5, 
    color: '#f5e642' 
  },
  closeBtn: { 
    background: 'none', 
    border: '1px solid #333', 
    color: '#888', 
    borderRadius: 8, 
    padding: '6px 14px', 
    fontSize: 13, 
    cursor: 'pointer', 
    fontFamily: 'inherit' 
  },
  videoContainer: { 
    flex: 1, 
    background: '#000', 
    position: 'relative', 
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  video: { 
    width: '100%', 
    height: '100%', 
    objectFit: 'cover'
  },
  overlay: { 
    position: 'absolute', 
    top: 0, left: 0, right: 0, bottom: 0, 
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  scanBox: { 
    width: '85%', 
    maxWidth: 320, 
    height: 180, 
    border: '3px solid #f5e642',
    borderRadius: 16,
    boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
    position: 'relative'
  },
  scanLine: { 
    position: 'absolute', 
    top: '50%', 
    left: 0, 
    right: 0, 
    height: 2, 
    background: '#f5e642',
    boxShadow: '0 0 8px #f5e642'
  },
  status: { 
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    textAlign: 'center', 
    color: '#f0f0f0', 
    fontSize: 14, 
    fontFamily: "'DM Sans', sans-serif",
    background: 'rgba(0,0,0,0.7)',
    padding: '12px 16px',
    borderRadius: 12,
    pointerEvents: 'auto'
  },
  // 🆕 Botón de flash
  flashBtn: (activo) => ({
    position: 'absolute',
    bottom: 30,
    left: '50%',
    transform: 'translateX(-50%)',
    background: activo ? '#f5e642' : 'rgba(0,0,0,0.7)',
    color: activo ? '#000' : '#f5e642',
    border: `2px solid ${activo ? '#f5e642' : '#f5e64260'}`,
    borderRadius: 50,
    padding: '12px 24px',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    pointerEvents: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
    transition: 'all 0.2s'
  }),
  error: { 
    color: '#ff4d4d', 
    fontSize: 13, 
    background: 'rgba(255,77,77,0.1)',
    border: '1px solid #ff4d4d40',
    padding: '14px 16px', 
    borderRadius: 8, 
    margin: 20,
    fontFamily: "'DM Sans', sans-serif"
  }
}

export default function EscanerBarras({ onScan, onClose }) {
  const videoRef = useRef(null)
  const codeReaderRef = useRef(null)
  const streamRef = useRef(null)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('Iniciando cámara...')
  
  // 🆕 Estado del flash
  const [flashOn, setFlashOn] = useState(false)
  const [flashSupported, setFlashSupported] = useState(false)

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader()
    codeReaderRef.current = codeReader

    async function iniciar() {
      try {
        setStatus('🎬 Iniciando cámara...')
        
        const constraints = {
          video: {
            facingMode: { ideal: 'environment' }
          }
        }
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        streamRef.current = stream
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.setAttribute('playsinline', true)
          await videoRef.current.play()
        }
        
        // 🆕 Verificar si el dispositivo soporta flash
        const videoTrack = stream.getVideoTracks()[0]
        if (videoTrack) {
          const capabilities = videoTrack.getCapabilities ? videoTrack.getCapabilities() : {}
          if (capabilities.torch) {
            setFlashSupported(true)
          }
        }
        
        setStatus('🎯 Apuntá al código de barras')
        
        codeReader.decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
          if (result) {
            const codigo = result.getText()
            setStatus(`✅ Detectado: ${codigo}`)
            
            if (navigator.vibrate) navigator.vibrate(200)
            
            // Apagar flash al detectar
            if (flashOn && videoTrack) {
              videoTrack.applyConstraints({ advanced: [{ torch: false }] }).catch(() => {})
            }
            
            stream.getTracks().forEach(t => t.stop())
            codeReader.reset()
            
            setTimeout(() => onScan(codigo), 300)
          }
        })
      } catch (err) {
        console.error('Error escáner:', err)
        if (err.name === 'NotAllowedError') {
          setError('🚫 Permisos de cámara denegados. Activalos en la configuración del navegador.')
        } else if (err.name === 'NotFoundError') {
          setError('📵 No se encontró cámara en este dispositivo.')
        } else {
          setError('❌ Error al iniciar cámara: ' + err.message)
        }
      }
    }
    
    iniciar()
    
    return () => {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset()
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject = null
      }
    }
  }, [onScan])

  // 🆕 Función para alternar el flash
  async function toggleFlash() {
    if (!streamRef.current) return
    
    const videoTrack = streamRef.current.getVideoTracks()[0]
    if (!videoTrack) return
    
    try {
      const nuevoEstado = !flashOn
      await videoTrack.applyConstraints({
        advanced: [{ torch: nuevoEstado }]
      })
      setFlashOn(nuevoEstado)
    } catch (err) {
      console.error('Error al cambiar flash:', err)
      setStatus('⚠️ Este dispositivo no soporta flash')
      setTimeout(() => setStatus('🎯 Apuntá al código de barras'), 2000)
    }
  }

  return (
    <div style={s.modal}>
      <div style={s.header}>
        <div style={s.title}>📷 ESCANEAR CÓDIGO</div>
        <button style={s.closeBtn} onClick={onClose}>✕ Cerrar</button>
      </div>
      
      {error ? (
        <div style={s.error}>
          {error}
          <div style={{ marginTop: 12, fontSize: 12, color: '#888' }}>
            💡 Tip: en iPhone, abrí el sitio en Safari (no Chrome). En Android funciona con cualquier navegador.
          </div>
        </div>
      ) : (
        <div style={s.videoContainer}>
          <video 
            ref={videoRef} 
            style={s.video}
            playsInline
            muted
            autoPlay
          />
          <div style={s.overlay}>
            <div style={s.scanBox}>
              <div style={s.scanLine} />
            </div>
          </div>
          <div style={s.status}>{status}</div>
          
          {/* 🆕 Botón de flash (solo si está soportado) */}
          {flashSupported && (
            <button 
              style={s.flashBtn(flashOn)} 
              onClick={toggleFlash}
            >
              {flashOn ? '🔆 Apagar' : '🔦 Encender flash'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
