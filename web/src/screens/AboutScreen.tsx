import { useNavigate } from 'react-router-dom'
import { Colors } from '../lib/theme'

export default function AboutScreen() {
  const navigate = useNavigate()

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <img src="/logo.png" alt="BrickKeep" style={styles.logo} onClick={() => navigate('/')} />
      </div>

      <div style={styles.content}>
        <h1 style={styles.title}>About BrickKeep</h1>

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Why BrickKeep Exists</h2>
          <p style={styles.text}>
            It started with a spreadsheet. Like a lot of LEGO collectors, the instinct was to track everything in a simple grid — set numbers, conditions, what was built, what was still sealed. It worked. Until it didn't.
          </p>
          <p style={styles.text}>
            Spreadsheets don't show you a photo of the Millennium Falcon next to its piece count. They don't tell you what a retired set is worth on the secondary market. They don't let you share your collection with a friend who's looking to trade. And they're definitely not something you'd show off.
          </p>
          <p style={styles.text}>
            LEGO collecting is a serious hobby for millions of people — builders, investors, displayers, completionists. It deserves a tool that takes it seriously too. That's why BrickKeep was built.
          </p>
        </div>

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>What BrickKeep Does</h2>
          <div style={styles.featureList}>
            {[
              { icon: '📦', title: 'Track Your Collection', desc: 'Log every set you own with condition, status, and notes. Know exactly what you have.' },
              { icon: '⭐', title: 'Build a Wishlist', desc: 'Save sets you want and find them in stores via Google Shopping, Amazon, or the LEGO Store Finder.' },
              { icon: '💰', title: 'Check Market Value', desc: 'See what your sets are worth on the secondary market via BrickEconomy.' },
              { icon: '🔍', title: 'Search Any Set', desc: 'Find any LEGO set by name, set number, or barcode — powered by the Rebrickable database.' },
              { icon: '📷', title: 'Document Your Builds', desc: 'Upload photos and videos of your sets — sealed, built, on display, or in progress.' },
              { icon: '🌍', title: 'Share Your Vault', desc: 'Make your profile public and share your collection with the world.' },
            ].map(f => (
              <div key={f.title} style={styles.feature}>
                <span style={styles.featureIcon}>{f.icon}</span>
                <div>
                  <p style={styles.featureTitle}>{f.title}</p>
                  <p style={styles.featureDesc}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Built for Collectors, by a Collector</h2>
          <p style={styles.text}>
            BrickKeep is an independent project built with a genuine love for the hobby. It's not backed by LEGO, affiliated with any retailer, or driven by advertising. It's just a tool built to make collecting easier, more organized, and a lot more fun to show off.
          </p>
          <p style={styles.text}>
            It's still early days. New features are being added regularly based on feedback from collectors like you. If you have thoughts, ideas, or things that aren't working — the feedback form is always open.
          </p>
          <button
            style={styles.feedbackBtn}
            onClick={() => window.open('https://forms.gle/qfjWQNPVm7oCkqUB8', '_blank')}
          >
            Share Feedback
          </button>
        </div>

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Powered By</h2>
          <p style={styles.text}>BrickKeep is built on top of some great tools and databases:</p>
          <div style={styles.poweredList}>
            {[
              { name: 'Rebrickable', desc: 'LEGO set and parts database' },
              { name: 'BrickEconomy', desc: 'LEGO market value and price history' },
              { name: 'Supabase', desc: 'Database and authentication' },
              { name: 'Vercel', desc: 'Hosting and deployment' },
            ].map(p => (
              <div key={p.name} style={styles.poweredItem}>
                <p style={styles.poweredName}>{p.name}</p>
                <p style={styles.poweredDesc}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.footer}>
          <button style={styles.privacyLink} onClick={() => navigate('/privacy')}>
            Privacy Policy
          </button>
          <p style={styles.copy}>© {new Date().getFullYear()} BrickKeep. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    color: '#FFFFFF'
  },
  header: {
    display: 'flex',
    justifyContent: 'center',
    padding: '16px 24px 0',
    cursor: 'pointer'
  },
  logo: {
    height: '80px',
    objectFit: 'contain',
    cursor: 'pointer'
  },
  content: {
    maxWidth: '640px',
    margin: '0 auto',
    padding: '24px'
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: Colors.yellow,
    marginBottom: '24px'
  },
  card: {
    backgroundColor: 'rgba(0,8,20,0.6)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '20px'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: Colors.yellow,
    marginBottom: '16px'
  },
  text: {
    fontSize: '15px',
    color: 'rgba(255,255,255,0.8)',
    lineHeight: '1.7',
    marginBottom: '12px'
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  feature: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start'
  },
  featureIcon: {
    fontSize: '24px',
    flexShrink: 0
  },
  featureTitle: {
    fontSize: '15px',
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: '4px'
  },
  featureDesc: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.6)',
    lineHeight: '1.5'
  },
  poweredList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '8px'
  },
  poweredItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    paddingBottom: '12px'
  },
  poweredName: {
    fontSize: '15px',
    fontWeight: 'bold',
    color: Colors.white
  },
  poweredDesc: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.5)'
  },
  feedbackBtn: {
    backgroundColor: Colors.yellow,
    color: Colors.text.onYellow,
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '8px'
  },
  footer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    paddingBottom: '48px',
    marginTop: '8px'
  },
  privacyLink: {
    background: 'none',
    border: 'none',
    color: Colors.yellow,
    fontSize: '14px',
    cursor: 'pointer',
    opacity: 0.8
  },
  copy: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.3)'
  }
}