import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Colors } from '../lib/theme'

const THEMES = [
  'Star Wars', 'Technic', 'City', 'Creator', 'Harry Potter',
  'Marvel', 'DC', 'Architecture', 'Ideas', 'Ninjago',
  'Friends', 'Minecraft', 'Speed Champions', 'Icons', 'Art'
]

export default function RegisterScreen() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')
  const [collectingGoal, setCollectingGoal] = useState<string>('mixed')
  const [preferredCondition, setPreferredCondition] = useState<string>('any')
  const [favoriteThemes, setFavoriteThemes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const navigate = useNavigate()

  function toggleTheme(theme: string) {
    setFavoriteThemes(prev =>
      prev.includes(theme) ? prev.filter(t => t !== theme) : [...prev, theme]
    )
  }

  async function handleStep1(e: React.FormEvent) {
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
        setUserId(data.user.id)
        setStep(2)
      }
    }
  }

  async function handleStep2(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return
    setLoading(true)
    setError('')

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim() || null,
        location: location.trim() || null,
        bio: bio.trim() || null,
        collecting_goals: collectingGoal,
        preferred_condition: preferredCondition,
        favorite_themes: favoriteThemes.length > 0 ? favoriteThemes : null
      })
      .eq('id', userId)

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      navigate('/')
    }
  }

  async function handleSkip() {
    navigate('/')
  }

  if (step === 2) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <img src="/logo.png" alt="BrickVault" style={styles.logo} />
          <h1 style={styles.title}>Set Up Your Vault</h1>
          <p style={styles.subtitle}>Tell us about your collection style</p>

          <form onSubmit={handleStep2} style={styles.form}>
            {error && <div style={styles.error}>{error}</div>}

            <input
              style={styles.input}
              type="text"
              placeholder="Full Name (optional)"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
            />
            <input
              style={styles.input}
              type="text"
              placeholder="Location (e.g. Detroit, MI)"
              value={location}
              onChange={e => setLocation(e.target.value)}
            />
            <textarea
              style={{ ...styles.input, height: '80px', resize: 'none' }}
              placeholder="Bio (optional)"
              value={bio}
              onChange={e => setBio(e.target.value)}
            />

            <p style={styles.sectionLabel}>I collect to...</p>
            <div style={styles.optionRow}>
              {[
                { value: 'completionist', label: '🏆 Complete sets' },
                { value: 'investor', label: '💰 Invest' },
                { value: 'builder', label: '🔧 Build' },
                { value: 'displayer', label: '🖼️ Display' },
                { value: 'mixed', label: '🎯 All of the above' }
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  style={{
                    ...styles.optionBtn,
                    ...(collectingGoal === opt.value ? styles.optionBtnActive : {})
                  }}
                  onClick={() => setCollectingGoal(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <p style={styles.sectionLabel}>I prefer sets that are...</p>
            <div style={styles.optionRow}>
              {[
                { value: 'sealed', label: '📦 Sealed' },
                { value: 'built', label: '🔧 Built' },
                { value: 'any', label: '🎯 Either' }
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  style={{
                    ...styles.optionBtn,
                    ...(preferredCondition === opt.value ? styles.optionBtnActive : {})
                  }}
                  onClick={() => setPreferredCondition(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <p style={styles.sectionLabel}>Favorite themes (pick any)</p>
            <div style={styles.themeGrid}>
              {THEMES.map(theme => (
                <button
                  key={theme}
                  type="button"
                  style={{
                    ...styles.themeBtn,
                    ...(favoriteThemes.includes(theme) ? styles.themeBtnActive : {})
                  }}
                  onClick={() => toggleTheme(theme)}
                >
                  {theme}
                </button>
              ))}
            </div>

            <button style={styles.button} type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Finish Setup'}
            </button>
          </form>

          <button style={styles.skipBtn} onClick={handleSkip}>
            Skip for now
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <img src="/logo.png" alt="BrickVault" style={styles.logo} />
        <h1 style={styles.title}>BrickVault</h1>
        <p style={styles.subtitle}>Create your account</p>

        <form onSubmit={handleStep1} style={styles.form}>
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px'
  },
  card: {
    width: '100%',
    maxWidth: '480px',
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
    marginBottom: '32px'
  },
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
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
  sectionLabel: {
    fontSize: '15px',
    fontWeight: 'bold',
    color: Colors.white,
    marginTop: '8px',
    marginBottom: '8px',
    alignSelf: 'flex-start'
  },
  optionRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '8px'
  },
  optionBtn: {
    padding: '10px 16px',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(0,8,20,0.6)',
    color: Colors.white,
    fontSize: '14px',
    cursor: 'pointer'
  },
  optionBtnActive: {
    backgroundColor: Colors.yellow,
    borderColor: Colors.yellow,
    color: Colors.text.onYellow,
    fontWeight: 'bold'
  },
  themeGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '8px'
  },
  themeBtn: {
    padding: '8px 14px',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(0,8,20,0.6)',
    color: Colors.white,
    fontSize: '13px',
    cursor: 'pointer'
  },
  themeBtnActive: {
    backgroundColor: Colors.yellow,
    borderColor: Colors.yellow,
    color: Colors.text.onYellow,
    fontWeight: 'bold'
  },
  skipBtn: {
    marginTop: '16px',
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.4)',
    fontSize: '14px',
    cursor: 'pointer'
  }
}