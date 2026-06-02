import { useNavigate } from 'react-router-dom'
import { Colors } from '../lib/theme'

export default function LandingScreen() {
  const navigate = useNavigate()

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <img src="/logo.png" alt="BrickVault" style={styles.logo} />
        <h1 style={styles.title}>BrickVault</h1>
        <p style={styles.tagline}>Your LEGO collection, organized.</p>
        <p style={styles.subtitle}>
          Track what you own, build your wishlist, discover market values,
          and share your vault with other collectors.
        </p>

        <div style={styles.buttons}>
          <button style={styles.primaryBtn} onClick={() => navigate('/register')}>
            Get Started — It's Free
          </button>
          <button style={styles.secondaryBtn} onClick={() => navigate('/login')}>
            Sign In
          </button>
        </div>

        <div style={styles.features}>
          {[
            { icon: '📦', title: 'Track Your Collection', desc: 'Log every set you own with condition and status.' },
            { icon: '⭐', title: 'Build a Wishlist', desc: 'Save sets you want and find them in stores.' },
            { icon: '💰', title: 'Check Market Value', desc: 'See what your sets are worth on the secondary market.' },
            { icon: '🔍', title: 'Search Any Set', desc: 'Find any LEGO set by name or number instantly.' },
          ].map(f => (
            <div key={f.title} style={styles.featureCard}>
              <span style={styles.featureIcon}>{f.icon}</span>
              <p style={styles.featureTitle}>{f.title}</p>
              <p style={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>

        <div style={styles.footer}>
          <p style={styles.footerText}>© {new Date().getFullYear()} BrickVault. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px'
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: '560px',
    width: '100%'
  },
  logo: {
    width: '160px',
    height: '160px',
    objectFit: 'contain',
    marginBottom: '4px'
  },
  title: {
    fontSize: '42px',
    fontWeight: 'bold',
    color: Colors.yellow,
    marginBottom: '8px',
    textAlign: 'center'
  },
  tagline: {
    fontSize: '18px',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: '16px',
    textAlign: 'center'
  },
  subtitle: {
    fontSize: '15px',
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: '1.6',
    marginBottom: '40px'
  },
  buttons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
    marginBottom: '56px'
  },
  primaryBtn: {
    backgroundColor: Colors.yellow,
    color: Colors.text.onYellow,
    border: 'none',
    borderRadius: '8px',
    padding: '18px',
    fontSize: '17px',
    fontWeight: 'bold',
    cursor: 'pointer',
    width: '100%'
  },
  secondaryBtn: {
    backgroundColor: 'rgba(0,8,20,0.6)',
    color: Colors.white,
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    padding: '18px',
    fontSize: '17px',
    cursor: 'pointer',
    width: '100%'
  },
  features: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    width: '100%',
    marginBottom: '48px'
  },
  featureCard: {
    backgroundColor: 'rgba(0,8,20,0.6)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  featureIcon: {
    fontSize: '28px'
  },
  featureTitle: {
    fontSize: '15px',
    fontWeight: 'bold',
    color: Colors.white
  },
  featureDesc: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.5)',
    lineHeight: '1.5'
  },
  footer: {
    borderTop: '1px solid rgba(255,255,255,0.08)',
    paddingTop: '24px',
    width: '100%',
    textAlign: 'center'
  },
  footerText: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.3)'
  }
}