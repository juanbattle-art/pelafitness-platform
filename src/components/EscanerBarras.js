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
  error: { 
    color: '#ff4d4d', 
    fontSize: 13, 
    background: 'rgba(255,77,77,0.1)',
    border: '1px solid #ff4d4d40',
    padding: '14px 16px', 
    borderRadius: 8, 
    margin: 20,
    fontFamily: "'DM Sans', sans-serif"
  },
  loadingState: {
    color: '#f5e642',
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    textAlign: 'center',
    padding: 40
  }
}

export default function EscanerBarras({ onScan, onClose }) {
  const videoRef = useRef(null)
  const codeReaderRef = useRef(null)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('Iniciando cámara...')

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader()
    codeReaderRef.current = codeReader

    async function iniciar() {
      try {
        setStatus('🎬 Iniciando cámara...')
        
        // Pedir permiso de cámara con la trasera preferida
        const constraints = {
          video: {
            facingMode: { ideal: 'environment' } // cámara trasera si existe
          }
        }
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.setAttribute('playsinline', true)
          await videoRef.current.play()
        }
        
        setStatus('🎯 Apuntá al código de barras')
        
        // Empezar a escanear
        codeReader.decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
          if (result) {
            // ¡Detectó un código!
            const codigo = result.getText()
            setStatus(`✅ Detectado: ${codigo}`)
            
            // Vibrar si el dispositivo lo soporta
            if (navigator.vibrate) navigator.vibrate(200)
            
            // Detener escáner y avisar al padre
            stream.getTracks().forEach(t => t.stop())
            codeReader.reset()
            
            setTimeout(() => onScan(codigo), 300)
          }
          // Los errores frecuentes (no encontró código) los ignoramos
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
    
    // Cleanup: detener cámara al cerrar
    return () => {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset()
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject
        stream.getTracks().forEach(t => t.stop())
        videoRef.current.srcObject = null
      }
    }
  }, [onScan])

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
        </div>
      )}
    </div>
  )
}
