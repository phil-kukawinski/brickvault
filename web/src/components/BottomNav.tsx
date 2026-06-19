import { useNavigate, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { label: 'Home', path: '/', icon: '🏠' },
  { label: 'Collection', path: '/collection', icon: '📦' },
  { label: 'Add', path: '/scan', icon: '➕' },
  { label: 'Profile', path: '/profile', icon: '👤' },
  { label: 'Activity', path: '/history', icon: '🕐' },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isMobile = window.innerWidth <= 768
  if (!isMobile) return null

  return (
    <>
      {/* Spacer so content doesn't hide behind nav */}
      <div style={{ height: '72px' }} />
      <div style={styles.container}>
        {NAV_ITEMS.map(item => {
          const active = pathname === item.path
          return (
            <button
              key={item.path}
              style={{
                ...styles.item,
                ...(active ? styles.itemActive : {})
              }}
              onClick={() => navigate(item.path)}
            >
              <span style={styles.icon}>{item.icon}</span>
              <span style={{
                ...styles.label,
                ...(active ? styles.labelActive : {})
              }}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '72px',
    backgroundColor: '#001020',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    zIndex: 200,
    paddingBottom: 'env(safe-area-inset-bottom)'
  },
  item: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px 0',
    minHeight: '56px'
  },
  itemActive: {
    borderTop: '2px solid #FBE02D'
  },
  icon: {
    fontSize: '22px'
  },
  label: {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.5)'
  },
  labelActive: {
    color: '#FBE02D',
    fontWeight: 'bold'
  }
}