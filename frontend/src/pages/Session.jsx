import { useState, useRef, useEffect } from 'react'
import * as api from '../api'

const EXPR_EMOJI = {
  angry: '😠',
  disgusted: '🤢',
  fearful: '😨',
  happy: '😊',
  neutral: '😐',
  sad: '😢',
  surprised: '😲'
}

const EXPR_COLOR = {
  angry: 'var(--emotion-angry)',
  disgusted: 'var(--emotion-disgust)',
  fearful: 'var(--emotion-fear)',
  happy: 'var(--emotion-happy)',
  neutral: 'var(--emotion-neutral)',
  sad: 'var(--emotion-sad)',
  surprised: 'var(--emotion-surprise)'
}

export default function Session() {
  const [isRunning, setIsRunning] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [faceDetected, setFaceDetected] = useState(false)
  const [expression, setExpression] = useState({ label: 'neutral', confidence: 0 })
  const [speechStatus, setSpeechStatus] = useState('')
  const [transcript, setTranscript] = useState('')
  const [corrected, setCorrected] = useState('')
  const [corrections, setCorrections] = useState([])
  const [history, setHistory] = useState([])

  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const intervalRef = useRef(null)
  const recognitionRef = useRef(null)

  const handleStart = async () => {
    setStatus('starting')
    setError('')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true
      })

      streamRef.current = stream
      videoRef.current.srcObject = stream

      const response = await api.startSession()
      const sessId = response.data.sessionId
      setSessionId(sessId)
      setIsRunning(true)
      setStatus('running')

      setTimeout(() => {
        intervalRef.current = setInterval(async () => {
          const result = await api.analyzeFrame(sessId, videoRef.current)
          if (result) {
            setFaceDetected(result.face_detected)
            setExpression({
              label: result.expression || 'neutral',
              confidence: result.confidence || 0
            })
          }
        }, 2000)
      }, 1500)

      api.startSpeech(sessId)
    } catch (err) {
      setError('Could not start: ' + (err.response?.data?.message || err.message))
      setStatus('idle')
    }
  }

  const handleEnd = async () => {
    setStatus('ending')
    clearInterval(intervalRef.current)
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch(_) {}
    }
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    try { if (sessionId) await api.endSession(sessionId) } catch (_) {}
    setIsRunning(false)
    setSessionId(null)
    setStatus('idle')
    setSpeechStatus('')
    setTranscript('')
    setFaceDetected(false)
  }

  useEffect(() => () => {
    clearInterval(intervalRef.current)
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
  }, [])

  const exprColor = EXPR_COLOR[expression.label] || 'var(--text2)'

  return (
    <div style={{ animation: 'fadeUp 0.4s ease' }}>
      <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>Live Session</h1>
          <p style={{ color: 'var(--text2)' }}>Real-time expression analysis + speech correction</p>
        </div>
        {!isRunning
          ? <button onClick={handleStart} disabled={status==='starting'} style={btnStyle('var(--accent)','#000')}>{status==='starting'?'Starting...':'▶ Start Session'}</button>
          : <button onClick={handleEnd}   disabled={status==='ending'}   style={btnStyle('var(--accent2)','#fff')}>{status==='ending'?'Ending...':'⏹ End Session'}</button>
        }
      </div>

      {error && <div style={errorBox}>{error}</div>}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'20px' }}>
        {/* Camera */}
        <div style={panel}>
          <div style={panelHeader}>📹 Camera Feed</div>
          <div style={{ position:'relative', background:'#000', borderRadius:'10px', overflow:'hidden', aspectRatio:'4/3' }}>
            <video ref={videoRef} autoPlay muted playsInline style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
            {!isRunning && (
              <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text3)', flexDirection:'column', gap:'8px' }}>
                <span style={{ fontSize:'2rem' }}>📷</span>
                <span style={{ fontSize:'12px' }}>Press Start Session</span>
              </div>
            )}
            {isRunning && (
              <div style={{ position:'absolute', top:'12px', right:'12px', background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)', borderRadius:'6px', padding:'4px 10px', fontSize:'11px', color: faceDetected ? 'var(--accent)' : 'var(--accent2)' }}>
                {faceDetected ? '✓ Face detected' : '✗ No face — look at camera'}
              </div>
            )}
            {isRunning && faceDetected && (
              <div style={{ position:'absolute', bottom:'12px', left:'12px', background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)', borderRadius:'8px', padding:'8px 14px', border:`1px solid ${exprColor}40` }}>
                <span style={{ fontSize:'1.2rem' }}>{EXPR_EMOJI[expression.label]}</span>
                <span style={{ marginLeft:'8px', color:exprColor, fontWeight:500, textTransform:'capitalize' }}>{expression.label}</span>
                <span style={{ marginLeft:'8px', color:'var(--text3)', fontSize:'11px' }}>{(expression.confidence*100).toFixed(0)}%</span>
              </div>
            )}
          </div>
          {isRunning && !faceDetected && (
            <div style={{ padding:'12px 16px', fontSize:'12px', color:'var(--text2)', borderTop:'1px solid var(--border)' }}>
              💡 Make sure your face is well-lit and centered in the camera
            </div>
          )}
        </div>

        {/* Expression */}
        <div style={panel}>
          <div style={panelHeader}>🧠 Expression Analysis</div>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flex:1, gap:'16px', padding:'20px' }}>
            <div style={{ fontSize:'5rem', lineHeight:1, filter:(isRunning&&faceDetected)?'none':'grayscale(1) opacity(0.3)', transition:'all 0.4s' }}>
              {EXPR_EMOJI[expression.label]}
            </div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem', fontWeight:700, color:exprColor, textTransform:'capitalize', transition:'color 0.4s' }}>
              {isRunning && !faceDetected ? 'Searching for face...' : expression.label}
            </div>
            <div style={{ width:'100%' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px', fontSize:'12px', color:'var(--text2)' }}>
                <span>Confidence</span><span>{(expression.confidence*100).toFixed(1)}%</span>
              </div>
              <div style={{ background:'var(--border)', borderRadius:'4px', height:'8px' }}>
                <div style={{ width:`${expression.confidence*100}%`, height:'100%', background:exprColor, borderRadius:'4px', transition:'width 0.6s ease' }} />
              </div>
            </div>
            {isRunning && (
              <div style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'12px', color: faceDetected ? 'var(--accent)' : 'var(--accent2)' }}>
                <span style={{ width:'8px', height:'8px', borderRadius:'50%', background: faceDetected ? 'var(--accent)' : 'var(--accent2)', display:'inline-block', animation:'pulse 1.5s infinite' }} />
                {faceDetected ? 'Analyzing every 2 seconds' : 'Waiting for face...'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Speech */}
      <div style={{ ...panel, marginBottom:'20px' }}>
        <div style={{ ...panelHeader, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span>🎤 Speech Correction</span>
          {speechStatus && <span style={{ fontSize:'11px', color:'var(--text2)', background:'var(--surface2)', padding:'3px 10px', borderRadius:'20px' }}>{speechStatus}</span>}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', padding:'16px 20px 20px' }}>
          <div>
            <div style={{ fontSize:'11px', color:'var(--text3)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'8px' }}>You said</div>
            <div style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:'10px', padding:'14px', minHeight:'80px', fontSize:'13px', color: transcript ? 'var(--text)' : 'var(--text3)', fontStyle: transcript ? 'normal' : 'italic' }}>
              {transcript || 'Start speaking...'}
            </div>
          </div>
          <div>
            <div style={{ fontSize:'11px', color:'var(--text3)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'8px' }}>Corrected</div>
            <div style={{ background:'rgba(79,255,176,0.05)', border:'1px solid rgba(79,255,176,0.15)', borderRadius:'10px', padding:'14px', minHeight:'80px', fontSize:'13px', color: corrected ? 'var(--accent)' : 'var(--text3)', fontStyle: corrected ? 'normal' : 'italic' }}>
              {corrected || 'Corrected text appears here...'}
            </div>
          </div>
        </div>
        {corrections.length > 0 && (
          <div style={{ padding:'0 20px 20px' }}>
            <div style={{ fontSize:'11px', color:'var(--text3)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'8px' }}>Corrections Made</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
              {corrections.map((c,i) => (
                <div key={i} style={{ background:'rgba(255,181,71,0.1)', border:'1px solid rgba(255,181,71,0.2)', borderRadius:'6px', padding:'4px 10px', fontSize:'12px' }}>
                  <span style={{ color:'var(--accent2)', textDecoration:'line-through' }}>{c.original}</span>
                  <span style={{ color:'var(--text3)', margin:'0 4px' }}>→</span>
                  <span style={{ color:'var(--accent)' }}>{c.corrected}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div style={panel}>
          <div style={panelHeader}>📜 Session History</div>
          <div style={{ padding:'0 20px 20px', display:'flex', flexDirection:'column', gap:'10px', marginTop:'16px' }}>
            {history.map((h,i) => (
              <div key={i} style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:'10px', padding:'14px' }}>
                <div style={{ display:'flex', gap:'8px', marginBottom:'6px', fontSize:'12px' }}>
                  <span style={{ color:'var(--text3)' }}>{h.ts.toLocaleTimeString()}</span>
                  <span style={{ color:'var(--text3)' }}>·</span>
                  <span style={{ color:'var(--warn)' }}>{h.corrections?.length||0} corrections</span>
                </div>
                <div style={{ fontSize:'13px', color:'var(--text2)', marginBottom:'4px' }}>"{h.original}"</div>
                <div style={{ fontSize:'13px', color:'var(--accent)' }}>→ "{h.corrected}"</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const panel = { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'14px', overflow:'hidden' }
const panelHeader = { padding:'14px 20px', borderBottom:'1px solid var(--border)', fontSize:'13px', fontWeight:500, color:'var(--text2)', background:'var(--surface2)' }
const btnStyle = (bg,color) => ({ padding:'11px 24px', borderRadius:'10px', background:bg, color, fontWeight:600, fontSize:'14px' })
const errorBox = { background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'10px', padding:'12px 16px', marginBottom:'20px', color:'var(--error)' }