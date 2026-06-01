import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Colors } from '../lib/theme'

export default function RegisterScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!username.trim()) {
      setError('Username is required.')
      return
    }
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setLoading(false)
      setError(error.message)
      return
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ id: data.user.id, username: username.trim() })

      setLoading(false)

      if (profileError) {
        setError(profileError.message)
      } else {
        navigate('/')
      }
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <img src="/logo.png" alt="BrickVault" style={styles.logo} />
        <h1 style={styles.title}>BrickVault</h1>
        <p style={styles.subtitle}>Create your account</p>

        <form onSubmit={handleRegister} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}
          <input
            style={styles.input}
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
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
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={styles.linkText}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
  backgroundColor: 'transparent',
    display: 'flex',
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
  }
}