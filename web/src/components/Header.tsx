import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Colors } from '../lib/theme'
import InstallPrompt from './InstallPrompt'

export default function Header() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  function goTo(path: string) {
    setOpen(false)
    navigate(path)
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <button style={styles.logoBtn} onClick={() => goTo('/')}>
          <img src="/logo.png" alt="BrickKeep" style={styles.logo} />
        </button>
        <button style={styles.hamburger} onClick={() => setOpen(!open)}>
          {open ? '✕' : '☰'}
        </button>
      </div>

      {open && (
        <>
          <div style={styles.overlay} onClick={() => setOpen(false)} />
          <div style={styles.dropdown}>
            {[
              { label: 'Home', path: '/profile' },
              { label: 'My Collection', path: '/collection', external: false },
              { label: 'Add a Set', path: '/scan', external: false },
              { label: 'Profile', path: '/profile', external: false },
              { label: 'Search History', path: '/history', external: false },
            ].map(item => (
              <button
                key={item.path}
                style={styles.menuItem}
                onClick={() => goTo(item.path)}
              >
                {item.label}
              </button>
            ))}

            <InstallPrompt />

            <a
              href="https://forms.gle/qfjWQNPVm7oCkqUB8"
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...styles.menuItem, color: Colors.yellow, textDecoration: 'none' }}
            >
              Share Feedback
            </a>

            <button
              style={{ ...styles.menuItem, ...styles.signOut }}
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    position: 'relative',
    zIndex: 100
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 24px 0px',
    position: 'relative'
  },
  hamburger: {
    background: 'none',
    border: 'none',
    color: '#FBE02D',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '4px',
    width: '40px',
    position: 'absolute',
    right: '24px',
    top: '50%',
    transform: 'translateY(-50%)'
  },
  logoBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0
  },
  logo: {
    height: '96px',
    objectFit: 'contain'
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    width: '240px',
    backgroundColor: '#001020',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0 0 12px 12px',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column'
  },
  menuItem: {
    background: 'none',
    border: 'none',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    color: '#FFFFFF',
    fontSize: '16px',
    padding: '18px 24px',
    textAlign: 'left',
    cursor: 'pointer'
  },
  signOut: {
    color: '#FBE02D',
    opacity: 0.7,
    border: 'none'
  }
}