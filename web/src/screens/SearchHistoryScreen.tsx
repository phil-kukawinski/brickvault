import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Colors } from '../lib/theme'
import Header from '../components/Header'
import Footer from '../components/Footer'

type ActivityItem = {
  id: string
  action: string
  set_number: string | null
  set_name: string | null
  details: string | null
  created_at: string
}

export default function SearchHistoryScreen() {
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchActivity()
  }, [])

  async function fetchActivity() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('activity_log')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)
    setActivity(data || [])
    setLoading(false)
  }

  async function clearHistory() {
    if (!window.confirm('Clear all search history?')) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('activity_log').delete().eq('user_id', user.id)
    setActivity([])
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  function actionLabel(action: string) {
    switch (action) {
      case 'added_to_collection': return 'Added to Collection'
      case 'added_to_wishlist': return 'Added to Wishlist'
      case 'removed': return 'Removed'
      case 'updated': return 'Updated'
      default: return action
    }
  }

  return (
    <div style={styles.container}>
      <Header />
      <div style={styles.content}>
        <div style={styles.headerRow}>
          <h1 style={styles.title}>Activity History</h1>
          {activity.length > 0 && (
            <button style={styles.clearBtn} onClick={clearHistory}>
              Clear All
            </button>
          )}
        </div>

        {loading ? (
          <div style={styles.centered}>
            <p style={{ color: Colors.yellow }}>Loading...</p>
          </div>
        ) : activity.length === 0 ? (
          <div style={styles.centered}>
            <p style={styles.emptyText}>No activity yet.</p>
            <button style={styles.link} onClick={() => navigate('/scan')}>
              Start adding sets to your collection
            </button>
          </div>
        ) : (
          <div style={styles.list}>
            {activity.map(item => (
              <div key={item.id} style={styles.card}>
                <div style={styles.cardLeft}>
                  <p style={styles.actionLabel}>{actionLabel(item.action)}</p>
                  {item.set_name && (
                    <p style={styles.setName}>{item.set_name}</p>
                  )}
                  {item.set_number && (
                    <p style={styles.setDetail}>Set #{item.set_number}</p>
                  )}
                  {item.details && (
                    <p style={styles.details}>{item.details}</p>
                  )}
                </div>
                <p style={styles.date}>{formatDate(item.created_at)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column'
  },
  content: {
    padding: '24px',
    maxWidth: '600px',
    margin: '0 auto',
    width: '100%',
    flex: 1
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    textAlign: 'center' as const
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center' as const,
    flex: 1
  },
  clearBtn: {
    background: 'none',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '14px',
    padding: '8px 16px',
    cursor: 'pointer'
  },
  centered: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '64px 24px',
    gap: '12px'
  },
  emptyText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '16px'
  },
  link: {
    background: 'none',
    border: 'none',
    color: Colors.yellow,
    fontSize: '15px',
    cursor: 'pointer'
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  card: {
    backgroundColor: 'rgba(0,8,20,0.6)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px'
  },
  cardLeft: {
    flex: 1
  },
  actionLabel: {
    fontSize: '13px',
    fontWeight: 'bold',
    color: Colors.yellow,
    marginBottom: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  setName: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: '2px'
  },
  setDetail: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.5)'
  },
  details: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.5)',
    marginTop: '4px'
  },
  date: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.4)',
    whiteSpace: 'nowrap',
    flexShrink: 0
  }
}