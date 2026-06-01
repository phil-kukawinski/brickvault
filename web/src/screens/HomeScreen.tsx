import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Colors } from '../lib/theme'

export default function HomeScreen() {
  const [username, setUsername] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single()
        if (data) setUsername(data.username)
      }
    }
    fetchProfile()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <img src="/logo.png" alt="BrickVault" style={styles.logo} />
        <p style={styles.welcome}>Welcome back, {username || '...'}!</p>
      </div>

      <div style={styles.grid}>
        <button style={styles.card} onClick={() => navigate('/collection')}>
          <span style={styles.cardIcon}>📦</span>
          <span style={styles.cardTitle}>My Collection</span>
          <span style={styles.cardSubtitle}>View your sets</span>
        </button>

        <button style={styles.card} onClick={() => navigate('/scan')}>
          <span style={styles.cardIcon}>🔍</span>
          <span style={styles.cardTitle}>Add a Set</span>
          <span style={styles.cardSubtitle}>Search or scan</span>
        </button>
      </div>

      <div style={styles.statCard}>
        <p style={styles.statLabel}>YOUR VAULT</p>
        <p style={styles.statValue}>Track, collect, and share.</p>
      </div>

      <button style={styles.signOutButton} onClick={handleSignOut}>
        Sign Out
      </button>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: 'transparent',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '60px 24px 48px'
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '40px'
  },
  logo: {
    width: '220px',
    height: '110px',
    objectFit: 'contain',
    marginBottom: '8px'
  },
  welcome: {
    fontSize: '16px',
    color: 'rgba(255,255,255,0.8)'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    width: '100%',
    maxWidth: '500px',
    marginBottom: '24px'
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer'
  },
  cardIcon: {
    fontSize: '40px'
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center'
  },
  cardSubtitle: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center'
  },
  statCard: {
    backgroundColor: Colors.yellow,
    borderRadius: '16px',
    padding: '24px',
    width: '100%',
    maxWidth: '500px',
    marginBottom: '24px'
  },
  statLabel: {
    fontSize: '13px',
    fontWeight: 'bold',
    color: Colors.text.onYellow,
    opacity: 0.7,
    marginBottom: '4px',
    letterSpacing: '1px'
  },
  statValue: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: Colors.text.onYellow
  },
  signOutButton: {
    marginTop: 'auto',
    width: '100%',
    maxWidth: '500px',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.2)',
    backgroundColor: 'transparent',
    color: Colors.yellow,
    fontSize: '16px',
    cursor: 'pointer'
  }
}