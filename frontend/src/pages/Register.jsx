import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../api'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [form, setForm]   = useState({ name: '', email: '', password: '', role: 'student' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { saveLogin } = useAuth()
  const navigate = useNavigate()

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await register(form)
      saveLogin(res.data.token, res.data.user)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(79,255,176,0.06) 0%, transparent 60%)' }}>
      <div className="card">
        <div className="logo">ExprAI</div>
        <h2 className="text-2xl font-bold text-black mb-1">Create account</h2>
        <p className="text-sm text-text2 mb-7">Start improving your communication</p>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="form-field">
            <label className="label">Full Name</label>
            <input name="name" value={form.name} onChange={handle}
              placeholder="Your name" required className="input" />
          </div>
          <div className="form-field">
            <label className="label">Email</label>
            <input name="email" type="email" value={form.email} onChange={handle}
              placeholder="you@example.com" required className="input" />
          </div>
          <div className="form-field">
            <label className="label">Password</label>
            <input name="password" type="password" value={form.password} onChange={handle}
              placeholder="Min 6 characters" required minLength={6} className="input" />
          </div>
          <div className="form-field">
            <label className="label">Role</label>
            <select name="role" value={form.role} onChange={handle} className="input">
              <option value="student">Student</option>
              <option value="professional">Professional</option>
            </select>
          </div>

          {error && <div className="error-box">{error}</div>}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating account...' : 'Register →'}
          </button>
        </form>

        <p className="link-text">
          Already have an account? <Link to="/login" className="text-accent">Login</Link>
        </p>
      </div>
    </div>
  )
}

// removed styles object

const styles = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: 'var(--bg)',
    backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(79,255,176,0.06) 0%, transparent 60%)',
  },
  card: {
    width: '100%', maxWidth: '420px', background: 'var(--surface)',
    border: '1px solid var(--border)', borderRadius: '20px',
    padding: '40px 36px', animation: 'fadeUp 0.5s ease',
  },
  logo: {
    fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem',
    color: 'var(--accent)', marginBottom: '20px',
    textShadow: '0 0 30px rgba(79,255,176,0.4)',
  },
  title: { fontSize: '1.6rem', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' },
  sub:   { color: 'var(--text2)', fontSize: '13px', marginBottom: '28px' },
  form:  { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '7px' },
  label: { fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '1px' },
  input: {
    background: 'var(--surface2)', border: '1px solid var(--border2)',
    color: 'var(--text)', padding: '11px 14px', borderRadius: '10px',
    fontSize: '14px', transition: 'border-color 0.2s',
  },
  btn: {
    marginTop: '4px', padding: '13px', borderRadius: '10px',
    background: 'var(--accent)', color: '#000', fontWeight: 600, fontSize: '14px',
  },
  error: {
    background: 'rgba(255,95,126,0.1)', border: '1px solid rgba(255,95,126,0.3)',
    color: 'var(--accent2)', padding: '10px 14px', borderRadius: '8px', fontSize: '13px',
  },
  link: { textAlign: 'center', marginTop: '20px', color: 'var(--text2)', fontSize: '13px' },
}
