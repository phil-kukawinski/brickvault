import { useNavigate } from 'react-router-dom'
import { Colors } from '../lib/theme'

export default function Footer() {
  const navigate = useNavigate()
  const isMobile = window.innerWidth <= 768
  if (isMobile) return null

  return (
    <div style={styles.footer}>
        <a
        href="https://forms.gle/qfjWQNPVm7oCkqUB8"
          target="_blank"
          rel="noopener noreferrer"
          style={styles.feedbackBtn}
        >
          Share Feedback
        </a>
        <p style={styles.feedbackText}>BrickKeep is looking for your feedback.</p>

      <div style={styles.links}>
          {[
          { label: 'Home', path: '/' },
          { label: 'My Collection', path: '/collection' },
          { label: 'Add a Set', path: '/scan' },
          { label: 'Profile', path: '/profile' },
          { label: 'Activity History', path: '/history' },
          { label: 'About', path: '/about' },
          { label: 'Privacy', path: '/privacy' },
        ].map((item, index, arr) => (
            <span key={item.path} style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <button style={styles.link} onClick={() => navigate(item.path)}>
                {item.label}
              </button>
              {index < arr.length - 1 && (
                <span style={styles.separator}>|</span>
              )}
            </span>
          ))}
        </div>
      <p style={styles.copy}>© {new Date().getFullYear()} BrickKeep. All rights reserved.</p>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  footer: {
    marginTop: 'auto',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    padding: '32px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px'
  },
  links: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '8px 24px'
  },
  link: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '14px',
    cursor: 'pointer'
  },
  copy: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: '12px'
  },
  separator: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: '14px'
  },
  feedbackBtn: {
    backgroundColor: Colors.yellow,
    color: '#001B3D',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    textDecoration: 'none',
    marginBottom: '8px'
  },
  feedbackText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '13px',
    marginTop: '-8px',
    marginBottom: '16px'
  },
}