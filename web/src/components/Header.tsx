import { useNavigate } from 'react-router-dom'

export default function Header() {
  const navigate = useNavigate()

  return (
    <div style={styles.header}>
      <button style={styles.logoBtn} onClick={() => navigate('/')}>
        <img src="/logo.png" alt="BrickVault" style={styles.logo} />
      </button>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 24px 0px',
    backgroundColor: 'transparent'
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
  }
}