import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchSetBySetNum } from '../lib/rebrickable'
import type { LegoSet } from '../lib/rebrickable'
import { Colors } from '../lib/theme'

export default function SetScreen() {
  const { setNum } = useParams<{ setNum: string }>()
  const [set, setSet] = useState<LegoSet | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (setNum) fetchSet(setNum)
  }, [setNum])

  async function fetchSet(num: string) {
    const data = await fetchSetBySetNum(num.includes('-') ? num : `${num}-1`)
    setSet(data)
    setLoading(false)
  }

  function handleShare() {
    const url = `https://mybrickkeep.com/set/${setNum}`
    if (navigator.share) {
      navigator.share({ title: set?.name || 'BrickKeep', url })
    } else {
      navigator.clipboard.writeText(url)
      alert('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.centered}>
          <p style={{ color: Colors.yellow }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (!set) {
    return (
      <div style={styles.container}>
        <div style={styles.centered}>
          <img src="/logo.png" alt="BrickKeep" style={styles.logo} />
          <p style={styles.errorText}>Set not found.</p>
          <button style={styles.homeBtn} onClick={() => navigate('/')}>
            Go to BrickKeep
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <img src="/logo.png" alt="BrickKeep" style={styles.logo} onClick={() => navigate('/')} />
      </div>

      <div style={styles.content}>
        {set.set_img_url && (
          <img src={set.set_img_url} alt={set.name} style={styles.setImage} />
        )}

        <h1 style={styles.setName}>{set.name}</h1>

        <div style={styles.detailsCard}>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Set Number</span>
            <span style={styles.detailValue}>#{set.set_num}</span>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Pieces</span>
            <span style={styles.detailValue}>{set.num_parts.toLocaleString()}</span>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Year</span>
            <span style={styles.detailValue}>{set.year}</span>
          </div>
          {set.is_obsolete && (
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Status</span>
              <span style={{ ...styles.detailValue, color: '#FF8A65' }}>Retired</span>
            </div>
          )}
        </div>

        <button style={styles.shareBtn} onClick={handleShare}>
          📤 Share this Set
        </button>

        <a
          href={`https://www.brickeconomy.com/search?query=${set.set_num}`}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.marketBtn}
        >
          💰 Check Market Value
        </a>

        <button style={styles.homeBtn} onClick={() => navigate('/')}>
          Track this in BrickKeep
        </button>
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
    maxWidth: '500px',
    margin: '0 auto',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px'
  },
  centered: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '16px'
  },
  setImage: {
    width: '100%',
    maxHeight: '300px',
    objectFit: 'contain',
    borderRadius: '12px'
  },
  setName: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: Colors.yellow,
    textAlign: 'center' as const
  },
  detailsCard: {
    backgroundColor: 'rgba(0,8,20,0.6)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '12px',
    padding: '20px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px'
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    paddingBottom: '12px'
  },
  detailLabel: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.5)'
  },
  detailValue: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#FFFFFF'
  },
  shareBtn: {
    width: '100%',
    padding: '16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: Colors.yellow,
    color: Colors.text.onYellow,
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  marketBtn: {
    display: 'block',
    width: '100%',
    padding: '14px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(0,8,20,0.5)',
    color: '#FFFFFF',
    fontSize: '15px',
    cursor: 'pointer',
    textAlign: 'center' as const,
    textDecoration: 'none',
    boxSizing: 'border-box' as const
  },
  homeBtn: {
    width: '100%',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.2)',
    backgroundColor: 'transparent',
    color: '#FFFFFF',
    fontSize: '15px',
    cursor: 'pointer'
  },
  errorText: {
    fontSize: '18px',
    color: 'rgba(255,255,255,0.6)'
  }
}