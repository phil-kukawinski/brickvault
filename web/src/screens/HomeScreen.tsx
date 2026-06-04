import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Colors } from '../lib/theme'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const CHART_COLORS = [
  '#FBE02D', '#4FC3F7', '#81C784', '#FF8A65', '#CE93D8',
  '#F48FB1', '#80DEEA', '#FFCC80', '#A5D6A7', '#EF9A9A',
  '#90CAF9', '#FFAB91', '#B0BEC5', '#80CBC4', '#DCE775'
]

type ThemeData = { name: string; value: number }
type GalleryItem = {
  id: string
  storage_path: string
  media_type: 'image' | 'video'
  label: string
  caption: string | null
}

export default function HomeScreen() {
  const [username, setUsername] = useState('')
  const [stats, setStats] = useState({ owned: 0, wishlist: 0, pieces: 0, retailTotal: 0 })
  const [themeData, setThemeData] = useState<ThemeData[]>([])
  const [gallery, setGallery] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('username, full_name')
      .eq('id', user.id)
      .single()
    if (profile) setUsername(profile.full_name || profile.username)

    const { data: collection } = await supabase
      .from('collection')
      .select('status, piece_count, theme, retail_price')
      .eq('user_id', user.id)
    if (collection) {
      const owned = collection.filter(i => i.status === 'owned').length
      const wishlist = collection.filter(i => i.status === 'wishlist').length
      const pieces = collection.filter(i => i.status === 'owned').reduce((sum, i) => sum + (i.piece_count || 0), 0)
      const retailTotal = collection.filter(i => i.status === 'owned' && i.retail_price).reduce((sum, i) => sum + (i.retail_price || 0), 0)
      setStats({ owned, wishlist, pieces, retailTotal })

      const themeCounts: Record<string, number> = {}
      collection.filter(i => i.status === 'owned').forEach(i => {
        const theme = i.theme || 'Other'
        themeCounts[theme] = (themeCounts[theme] || 0) + 1
      })
      setThemeData(Object.entries(themeCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value))
    }

    const { data: media } = await supabase
      .from('set_media')
      .select('id, storage_path, media_type, label, caption')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(4)
    if (media) setGallery(media)

    setLoading(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  function getPublicUrl(path: string) {
    const { data } = supabase.storage.from('set-media').getPublicUrl(path)
    return data.publicUrl
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <Header />
        <div style={styles.centered}>
          <p style={{ color: Colors.yellow }}>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <Header />
      <div style={styles.content}>
        <p style={styles.welcome}>Welcome back, {username || '...'}!</p>

        <div style={styles.statsRow}>
          <div style={{ ...styles.statCard, cursor: 'pointer' }} onClick={() => navigate('/collection?filter=owned')}>
            <p style={styles.statNum}>{stats.owned}</p>
            <p style={styles.statLabel}>Owned</p>
          </div>
          <div style={{ ...styles.statCard, cursor: 'pointer' }} onClick={() => navigate('/collection?filter=wishlist')}>
            <p style={styles.statNum}>{stats.wishlist}</p>
            <p style={styles.statLabel}>Wishlist</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statNum}>{stats.pieces.toLocaleString()}</p>
            <p style={styles.statLabel}>Pieces</p>
          </div>
        </div>

        <button style={styles.addSetBtn} onClick={() => navigate('/scan')}>
          + Add a Set
        </button>

        {stats.retailTotal > 0 && (
          <div style={styles.valueCard}>
            <p style={styles.valueLabel}>Collection Retail Value</p>
            <p style={styles.valueAmount}>
              ${stats.retailTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <a href="https://www.brickeconomy.com" target="_blank" rel="noopener noreferrer" style={styles.valueLink}>
              Check market value on BrickEconomy →
            </a>
          </div>
        )}

        {themeData.length > 0 && (
          <div style={styles.card}>
            <p style={styles.cardTitle}>Collection by Theme</p>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={themeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                    if (!percent || percent < 0.05 || midAngle === undefined || !cx || !cy || !innerRadius || !outerRadius) return null
                    const RADIAN = Math.PI / 180
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
                    const x = cx + radius * Math.cos(-midAngle * RADIAN)
                    const y = cy + radius * Math.sin(-midAngle * RADIAN)
                    return (
                      <text x={x} y={y} fill="#001B3D" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
                        {`${(percent * 100).toFixed(0)}%`}
                      </text>
                    )
                  }}
                  labelLine={false}
                >
                  {themeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#001020',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: Colors.white
                  }}
                />
                <Legend
                  formatter={(value) => value}
                  wrapperStyle={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {gallery.length > 0 && (
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <p style={styles.cardTitle}>Recent Photos</p>
              <button style={styles.seeAllBtn} onClick={() => navigate('/profile')}>See all →</button>
            </div>
            <div style={styles.galleryGrid}>
              {gallery.map(item => (
                <div key={item.id} style={styles.galleryItem}>
                  {item.media_type === 'image' ? (
                    <img
                      src={getPublicUrl(item.storage_path)}
                      alt={item.caption || item.label}
                      style={styles.galleryImg}
                      onClick={() => window.open(getPublicUrl(item.storage_path), '_blank')}
                    />
                  ) : (
                    <video src={getPublicUrl(item.storage_path)} style={styles.galleryImg} controls />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={styles.navGrid}>
          <button style={styles.navCard} onClick={() => navigate('/collection')}>
            <span style={styles.navIcon}>📦</span>
            <span style={styles.navTitle}>My Collection</span>
            <span style={styles.navSubtitle}>View your sets</span>
          </button>
          <button style={styles.navCard} onClick={() => navigate('/scan')}>
            <span style={styles.navIcon}>🔍</span>
            <span style={styles.navTitle}>Add a Set</span>
            <span style={styles.navSubtitle}>Search or scan</span>
          </button>
        </div>

        <button style={styles.signOutButton} onClick={handleSignOut}>
          Sign Out
        </button>
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
    maxWidth: '600px',
    margin: '0 auto',
    padding: '24px',
    width: '100%'
  },
  centered: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '64px'
  },
  welcome: {
    fontSize: '16px',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: '20px',
    textAlign: 'center' as const
  },
  statsRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px'
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(0,8,20,0.6)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center' as const
  },
  statNum: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: Colors.yellow,
    marginBottom: '4px'
  },
  statLabel: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.6)'
  },
  addSetBtn: {
    backgroundColor: Colors.yellow,
    color: Colors.text.onYellow,
    border: 'none',
    borderRadius: '8px',
    padding: '14px',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
    width: '100%',
    marginBottom: '16px'
  },
  valueCard: {
    backgroundColor: 'rgba(0,8,20,0.6)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px',
    textAlign: 'center' as const
  },
  valueLabel: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    marginBottom: '8px'
  },
  valueAmount: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: Colors.yellow,
    marginBottom: '8px'
  },
  valueLink: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '13px',
    textDecoration: 'none'
  },
  card: {
    backgroundColor: 'rgba(0,8,20,0.6)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center' as const,
    marginBottom: '16px'
  },
  seeAllBtn: {
    background: 'none',
    border: 'none',
    color: Colors.yellow,
    fontSize: '13px',
    cursor: 'pointer'
  },
  galleryGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px'
  },
  galleryItem: {
    borderRadius: '8px',
    overflow: 'hidden'
  },
  galleryImg: {
    width: '100%',
    height: '120px',
    objectFit: 'cover' as const,
    cursor: 'pointer',
    display: 'block'
  },
  navGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '16px'
  },
  navCard: {
    backgroundColor: 'rgba(0,8,20,0.6)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer'
  },
  navIcon: {
    fontSize: '36px'
  },
  navTitle: {
    fontSize: '15px',
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center' as const
  },
  navSubtitle: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center' as const
  },
  signOutButton: {
    width: '100%',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(0,8,20,0.6)',
    color: Colors.yellow,
    fontSize: '16px',
    cursor: 'pointer',
    marginBottom: '16px'
  }
}