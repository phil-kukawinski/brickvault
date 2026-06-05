import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Colors } from '../lib/theme'

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setDone(true)
      setTimeout(() => navigate('/'), 3000)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <img src="/logo.png" alt="BrickKeep" style={styles.logo} />
        <h1 style={styles.title}>Reset Password</h1>

        {done ? (
          <p style={styles.success}>Password updated! Redirecting you home...</p>
        ) : (
          <form onSubmit={handleReset} style={styles.form}>
            <input
              style={styles.input}
              type="password"
              placeholder="New password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <input
              style={styles.input}
              type="password"
              placeholder="Confirm new password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
            />
            {error && <p style={styles.error}>{error}</p>}
            <button style={styles.btn} type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px'
  },
  content: {
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px'
  },
  logo: {
    height: '80px',
    objectFit: 'contain'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: '8px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%'
  },
  input: {
    backgroundColor: 'rgba(0,8,20,0.6)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    padding: '14px',
    fontSize: '16px',
    color: Colors.white,
    outline: 'none',
    width: '100%'
  },
  btn: {
    backgroundColor: Colors.yellow,
    color: Colors.text.onYellow,
    border: 'none',
    borderRadius: '8px',
    padding: '16px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    width: '100%'
  },
  error: {
    color: '#ff6b6b',
    fontSize: '14px',
    textAlign: 'center' as const
  },
  success: {
    color: Colors.yellow,
    fontSize: '16px',
    textAlign: 'center' as const
  }
}