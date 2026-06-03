import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Colors } from '../lib/theme'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const CHART_COLORS = [
  '#FBE02D', '#4FC3F7', '#81C784', '#FF8A65', '#CE93D8',
  '#F48FB1', '#80DEEA', '#FFCC80', '#A5D6A7', '#EF9A9A',
  '#90CAF9', '#FFAB91', '#B0BEC5', '#80CBC4', '#DCE775'
]

type Profile = {
  id: string
  username: string
  full_name: string | null
  location: string | null
  bio: string | null
  collecting_goals: string | null
  favorite_themes: string[] | null
  public_profile: boolean
}

type CollectionItem = {
  id: string
  set_number: string
  name: string
  piece_count: number
  image_url: string
  condition: string | null
  theme: string | null
  release_year: number | null
}

type GalleryItem = {
  id: string
  storage_path: string
  media_type: 'image' | 'video'
  label: string
  caption: string | null
  set_name: string | null
}

type ThemeData = {
  name: string
  value: number
}

export default function PublicProfileScreen() {
  const { username } = useParams<{ username: string }>()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [collection, setCollection] = useState<CollectionItem[]>([])
  const [gallery, setGallery] = useState<GalleryItem[]>([])
  const [themeData, setThemeData] = useState<ThemeData[]>([])
  const [stats, setStats] = useState({ owned: 0, wishlist: 0, pieces: 0 })
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (username) fetchPublicProfile(username)
  }, [username])

  async function fetchPublicProfile(username: string) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single()

    if (!profileData) {
      setNotFound(true)
      setLoading(false)
      return
    }

    if (!profileData.public_profile) {
      setProfile(profileData)
      setLoading(false)
      return
    }

    setProfile(profileData)

    const { data: collectionData } = await supabase
      .from('collection')
      .select('id, set_number, name, piece_count, image_url, condition, theme, release_year')
      .eq('user_id', profileData.id)
      .eq('status', 'owned')
      .order('added_at', { ascending: false })

    if (collectionData) {
      setCollection(collectionData)
      const owned = collectionData.length
      const pieces = collectionData.reduce((sum, i) => sum + (i.piece_count || 0), 0)
      setStats(s => ({ ...s, owned, pieces }))

      const themeCounts: Record<string, number> = {}
      collectionData.forEach(i => {
        const theme = i.theme || 'Other'
        themeCounts[theme] = (themeCounts[theme] || 0) + 1
      })
      setThemeData(
        Object.entries(themeCounts)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
      )
    }

    const { data: wishlistData } = await supabase
      .from('collection')
      .select('id')
      .eq('user_id', profileData.id)
      .eq('status', 'wishlist')
    setStats(s => ({ ...s, wishlist: wishlistData?.length || 0 }))

    const { data: mediaData } = await supabase
      .from('set_media')
      .select(`
        id, storage_path, media_type, label, caption,
        collection:collection_id ( name )
      `)
      .eq('user_id', profileData.id)
      .order('created_at', { ascending: false })

    if (mediaData) {
      setGallery(mediaData.map((item: any) => ({
        id: item.id,
        storage_path: item.storage_path,
        media_type: item.media_type,
        label: item.label,
        caption: item.caption,
        set_name: item.collection?.name || null
      })))
    }

    setLoading(false)
  }

  function getPublicUrl(path: string) {
    const { data } = supabase.storage.from('set-media').getPublicUrl(path)
    return data.publicUrl
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

  if (notFound) {
    return (
      <div style={styles.container}>
        <div style={styles.centered}>
          <img src="/logo.png" alt="BrickKeep" style={styles.logo} />
          <p style={styles.errorText}>User not found.</p>
          <button style={styles.homeBtn} onClick={() => navigate('/')}>
            Go to BrickKeep
          </button>
        </div>
      </div>
    )
  }

  if (profile && !profile.public_profile) {
    return (
      <div style={styles.container}>
        <div style={styles.centered}>
          <img src="/logo.png" alt="BrickKeep" style={styles.logo} />
          <p style={styles.errorText}>This profile is private.</p>
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
        <img src="/logo.png" alt="BrickKeep" style={styles.logo} />
      </div>

      <div style={styles.content}>
        <div style={styles.profileHeader}>
          <h1 style={styles.username}>{profile?.full_name || profile?.username}</h1>
          {profile?.full_name && (
            <p style={styles.handle}>@{profile.username}</p>
          )}
          {profile?.location && (
            <p style={styles.location}>📍 {profile.location}</p>
          )}
          {profile?.bio && (
            <p style={styles.bio}>{profile.bio}</p>
          )}
          {profile?.collecting_goals && (
            <p style={styles.goal}>Collects to: {profile.collecting_goals}</p>
          )}
        </div>

        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <p style={styles.statNum}>{stats.owned}</p>
            <p style={styles.statLabel}>Owned</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statNum}>{stats.wishlist}</p>
            <p style={styles.statLabel}>Wishlist</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statNum}>{stats.pieces.toLocaleString()}</p>
            <p style={styles.statLabel}>Pieces</p>
          </div>
        </div>

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
            <p style={styles.cardTitle}>Gallery</p>
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
                  <div style={styles.galleryInfo}>
                    {item.set_name && <p style={styles.gallerySetName}>{item.set_name}</p>}
                    <span style={styles.galleryLabel}>{item.label.replace('_', ' ')}</span>
                    {item.caption && <p style={styles.galleryCaption}>{item.caption}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {collection.length > 0 && (
          <div style={styles.card}>
            <p style={styles.cardTitle}>Collection</p>
            <div style={styles.collectionList}>
              {collection.map(item => (
                <div key={item.id} style={styles.collectionItem}>
                  {item.image_url && (
                    <img src={item.image_url} alt={item.name} style={styles.setImage} />
                  )}
                  <div style={styles.setInfo}>
                    <p style={styles.setName}>{item.name}</p>
                    <p style={styles.setDetail}>#{item.set_number} · {item.piece_count} pcs</p>
                    {item.theme && <p style={styles.setDetail}>{item.theme}</p>}
                    {item.condition && (
                      <span style={styles.conditionBadge}>{item.condition}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={styles.footer}>
          <button style={styles.homeBtn} onClick={() => navigate('/')}>
            Track your own collection on BrickKeep
          </button>
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
    padding: '16px 24px 0'
  },
  logo: {
    height: '80px',
    objectFit: 'contain'
  },
  content: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '24px'
  },
  centered: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '16px'
  },
  profileHeader: {
    marginBottom: '24px'
  },
  username: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: Colors.yellow,
    marginBottom: '4px'
  },
  handle: {
    fontSize: '15px',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: '8px'
  },
  location: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: '8px'
  },
  bio: {
    fontSize: '15px',
    color: 'rgba(255,255,255,0.8)',
    lineHeight: '1.5',
    marginBottom: '8px'
  },
  goal: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.5)',
    fontStyle: 'italic'
  },
  statsRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px'
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(0,8,20,0.6)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center'
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
  card: {
    backgroundColor: 'rgba(0,8,20,0.6)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '24px'
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: '16px',
    textAlign: 'center'
  },
  galleryGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px'
  },
  galleryItem: {
    backgroundColor: 'rgba(0,8,20,0.4)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  galleryImg: {
    width: '100%',
    height: '130px',
    objectFit: 'cover' as const,
    cursor: 'pointer',
    display: 'block'
  },
  galleryInfo: {
    padding: '8px'
  },
  gallerySetName: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: '4px',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  galleryLabel: {
    backgroundColor: 'rgba(251,224,45,0.15)',
    color: Colors.yellow,
    fontSize: '10px',
    fontWeight: 'bold',
    padding: '2px 6px',
    borderRadius: '10px',
    textTransform: 'capitalize' as const
  },
  galleryCaption: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.5)',
    marginTop: '4px'
  },
  collectionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  collectionItem: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    backgroundColor: 'rgba(0,8,20,0.4)',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  setImage: {
    width: '72px',
    height: '72px',
    objectFit: 'contain' as const,
    flexShrink: 0
  },
  setInfo: {
    flex: 1,
    padding: '8px'
  },
  setName: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: '2px'
  },
  setDetail: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.5)'
  },
  conditionBadge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '11px',
    padding: '2px 8px',
    borderRadius: '10px',
    marginTop: '4px',
    display: 'inline-block'
  },
  errorText: {
    fontSize: '18px',
    color: 'rgba(255,255,255,0.6)'
  },
  homeBtn: {
    backgroundColor: Colors.yellow,
    color: Colors.text.onYellow,
    border: 'none',
    borderRadius: '8px',
    padding: '14px 24px',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  footer: {
    display: 'flex',
    justifyContent: 'center',
    paddingBottom: '48px'
  }
}