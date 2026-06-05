import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Colors } from '../lib/theme'
import Footer from '../components/Footer'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const [resetSent, setResetSent] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      navigate('/')
    }
  }

  async function handleForgotPassword() {
    if (!email.trim()) {
      alert('Please enter your email address first.')
      return
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://mybrickkeep.com/reset-password'
    })
    if (error) {
      alert('Error sending reset email: ' + error.message)
    } else {
      setResetSent(true)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <img src="/logo.png" alt="BrickKeep" style={styles.logo} />
        <p style={styles.subtitle}>Your LEGO collection, organized.</p>

        <form onSubmit={handleLogin} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}
          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {resetSent ? (
            <p style={styles.resetSuccess}>
              Check your email for a password reset link!
            </p>
          ) : (
            <button
              style={styles.forgotBtn}
              type="button"
              onClick={handleForgotPassword}
            >
              Forgot your password?
            </button>
          )}

        <p style={styles.linkText}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.link}>Register</Link>
        </p>
      </div>
    <Footer />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: 'transparent',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px'
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  logo: {
    width: '180px',
    height: '180px',
    objectFit: 'contain',
    marginBottom: '4px'
  },
  title: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: Colors.yellow,
    marginBottom: '4px'
  },
  subtitle: {
    fontSize: '15px',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: '40px'
  },
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    padding: '14px',
    fontSize: '16px',
    color: Colors.white,
    outline: 'none',
    width: '100%'
  },
  button: {
    backgroundColor: Colors.yellow,
    color: Colors.text.onYellow,
    border: 'none',
    borderRadius: '8px',
    padding: '16px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    width: '100%',
    marginTop: '8px'
  },
  error: {
    backgroundColor: 'rgba(204,0,0,0.2)',
    border: '1px solid rgba(204,0,0,0.4)',
    borderRadius: '8px',
    padding: '12px',
    color: '#ff6b6b',
    fontSize: '14px'
  },
  linkText: {
    marginTop: '24px',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '14px'
  },
  link: {
    color: Colors.yellow,
    textDecoration: 'none'
  },
  forgotBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '14px',
    cursor: 'pointer',
    marginTop: '8px',
    textDecoration: 'underline'
  },
  resetSuccess: {
    color: Colors.yellow,
    fontSize: '14px',
    textAlign: 'center' as const,
    marginTop: '8px'
  },
}