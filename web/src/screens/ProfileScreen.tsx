import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Colors } from '../lib/theme'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const THEMES = [
  'Star Wars', 'Technic', 'City', 'Creator', 'Harry Potter',
  'Marvel', 'DC', 'Architecture', 'Ideas', 'Ninjago',
  'Friends', 'Minecraft', 'Speed Champions', 'Icons', 'Art'
]

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
  preferred_condition: string | null
  favorite_themes: string[] | null
}

type ThemeData = {
  name: string
  value: number
}

type GalleryItem = {
  id: string
  storage_path: string
  media_type: 'image' | 'video'
  label: string
  caption: string | null
  set_name: string | null
  set_number: string | null
  created_at: string
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [fullName, setFullName] = useState('')
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')
  const [collectingGoal, setCollectingGoal] = useState('mixed')
  const [preferredCondition, setPreferredCondition] = useState('any')
  const [favoriteThemes, setFavoriteThemes] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [stats, setStats] = useState({ owned: 0, wishlist: 0, total: 0, pieces: 0, retailTotal: 0 })
  const [themeData, setThemeData] = useState<ThemeData[]>([])
  const [gallery, setGallery] = useState<GalleryItem[]>([])
  const navigate = useNavigate()
  const [publicProfile, setPublicProfile] = useState(true)

  useEffect(() => {
    fetchProfile()
    fetchStats()
    fetchGallery()
  }, [])

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    if (data) {
  setProfile(data)
  setFullName(data.full_name || '')
  setLocation(data.location || '')
  setBio(data.bio || '')
  setCollectingGoal(data.collecting_goals || 'mixed')
  setPreferredCondition(data.preferred_condition || 'any')
  setFavoriteThemes(data.favorite_themes || [])
  setPublicProfile(data.public_profile ?? true)
}
    setLoading(false)
  }

  async function fetchStats() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('collection')
      .select('status, piece_count, theme, retail_price')
      .eq('user_id', user.id)
    if (data) {
      const owned = data.filter(i => i.status === 'owned').length
      const wishlist = data.filter(i => i.status === 'wishlist').length
      const pieces = data
        .filter(i => i.status === 'owned')
        .reduce((sum, i) => sum + (i.piece_count || 0), 0)
      const retailTotal = data
        .filter(i => i.status === 'owned' && i.retail_price)
        .reduce((sum, i) => sum + (i.retail_price || 0), 0)

      setStats({ owned, wishlist, total: data.length, pieces, retailTotal })

      const themeCounts: Record<string, number> = {}
      data
        .filter(i => i.status === 'owned')
        .forEach(i => {
          const theme = i.theme || 'Other'
          themeCounts[theme] = (themeCounts[theme] || 0) + 1
        })

      const chartData = Object.entries(themeCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)

      setThemeData(chartData)
    }
  }

  async function fetchGallery() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('set_media')
      .select(`
        id,
        storage_path,
        media_type,
        label,
        caption,
        created_at,
        collection:collection_id (
          name,
          set_number
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (data) {
      setGallery(data.map((item: any) => ({
        id: item.id,
        storage_path: item.storage_path,
        media_type: item.media_type,
        label: item.label,
        caption: item.caption,
        set_name: item.collection?.name || null,
        set_number: item.collection?.set_number || null,
        created_at: item.created_at
      })))
    }
  }

  function getPublicUrl(path: string) {
    const { data } = supabase.storage.from('set-media').getPublicUrl(path)
    return data.publicUrl
  }

  function toggleTheme(theme: string) {
    setFavoriteThemes(prev =>
      prev.includes(theme) ? prev.filter(t => t !== theme) : [...prev, theme]
    )
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim() || null,
          location: location.trim() || null,
          bio: bio.trim() || null,
          collecting_goals: collectingGoal,
          preferred_condition: preferredCondition,
          favorite_themes: favoriteThemes.length > 0 ? favoriteThemes : null,
          public_profile: publicProfile
        })
        .eq('id', profile.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
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
        <button style={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>
        <h1 style={styles.title}>My Profile</h1>

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
          <div style={styles.chartCard}>
            <p style={styles.chartTitle}>Collection by Theme</p>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={themeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {themeData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
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
          <div style={styles.galleryCard}>
            <p style={styles.chartTitle}>My Gallery</p>
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
                    <video
                      src={getPublicUrl(item.storage_path)}
                      style={styles.galleryImg}
                      controls
                    />
                  )}
                  <div style={styles.galleryInfo}>
                    {item.set_name && (
                      <p style={styles.gallerySetName}>{item.set_name}</p>
                    )}
                    <span style={styles.galleryLabel}>{item.label.replace('_', ' ')}</span>
                    {item.caption && (
                      <p style={styles.galleryCaption}>{item.caption}</p>
                    )}
                    <div style={styles.galleryActions}>
                      <button
                        style={styles.galleryEditBtn}
                        onClick={() => {
                          const newCaption = window.prompt('Edit caption:', item.caption || '')
                          if (newCaption !== null) {
                            supabase
                              .from('set_media')
                              .update({ caption: newCaption.trim() || null })
                              .eq('id', item.id)
                              .then(() => fetchGallery())
                          }
                        }}
                      >
                        Edit
                      </button>
                      <button
                        style={styles.galleryDeleteBtn}
                        onClick={async () => {
                          if (!window.confirm('Delete this photo?')) return
                          await supabase.storage.from('set-media').remove([item.storage_path])
                          await supabase.from('set_media').delete().eq('id', item.id)
                          fetchGallery()
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={styles.valueCard}>
          <p style={styles.valueTitle}>💰 Collection Value</p>
          {stats.retailTotal > 0 ? (
            <>
              <p style={styles.valueAmount}>
                ${stats.retailTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p style={styles.valueSubtitle}>
                Combined retail value of your owned sets. Secondary market values may be higher — check BrickEconomy for current prices.
              </p>
            </>
          ) : (
            <p style={styles.valueSubtitle}>
              Add sets to your collection to see their retail value here.
            </p>
          )}
          <a
            href="https://www.brickeconomy.com"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.valueBtn}
          >
            Check BrickEconomy
          </a>
        </div>

        <form onSubmit={handleSave} style={styles.form}>
          <p style={styles.sectionLabel}>Profile Visibility</p>
          <div style={styles.optionRow}>
            <button
              type="button"
              style={{ ...styles.optionBtn, ...(publicProfile ? styles.optionBtnActive : {}) }}
              onClick={() => setPublicProfile(true)}
            >
              Public
            </button>
            <button
              type="button"
              style={{ ...styles.optionBtn, ...(!publicProfile ? styles.optionBtnActive : {}) }}
              onClick={() => setPublicProfile(false)}
            >
              Private
            </button>
          </div>
          {publicProfile && profile?.username && (
            <a
              href={`/u/${profile.username}`}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.profileLinkBtn}
            >
              View my public profile →
            </a>
          )}

          <p style={styles.sectionLabel}>Username</p>
          <div style={styles.staticField}>{profile?.username}</div>

          <p style={styles.sectionLabel}>Full Name</p>
          <input
            style={styles.input}
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
          />

          <p style={styles.sectionLabel}>Location</p>
          <input
            style={styles.input}
            type="text"
            placeholder="e.g. Detroit, MI"
            value={location}
            onChange={e => setLocation(e.target.value)}
          />

          <p style={styles.sectionLabel}>Bio</p>
          <textarea
            style={{ ...styles.input, height: '80px', resize: 'none' }}
            placeholder="Tell other collectors about yourself..."
            value={bio}
            onChange={e => setBio(e.target.value)}
          />

          <p style={styles.sectionLabel}>I collect to...</p>
          <div style={styles.optionRow}>
            {[
              { value: 'completionist', label: 'Complete sets' },
              { value: 'investor', label: 'Invest' },
              { value: 'builder', label: 'Build' },
              { value: 'displayer', label: 'Display' },
              { value: 'mixed', label: 'All of the above' }
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                style={{
                  ...styles.optionBtn,
                  ...(collectingGoal === opt.value ? styles.optionBtnActive : {})
                }}
                onClick={() => setCollectingGoal(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <p style={styles.sectionLabel}>I prefer sets that are...</p>
          <div style={styles.optionRow}>
            {[
              { value: 'sealed', label: 'Sealed' },
              { value: 'built', label: 'Built' },
              { value: 'any', label: 'Either' }
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                style={{
                  ...styles.optionBtn,
                  ...(preferredCondition === opt.value ? styles.optionBtnActive : {})
                }}
                onClick={() => setPreferredCondition(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <p style={styles.sectionLabel}>Favorite themes</p>
          <div style={styles.themeGrid}>
            {THEMES.map(theme => (
              <button
                key={theme}
                type="button"
                style={{
                  ...styles.themeBtn,
                  ...(favoriteThemes.includes(theme) ? styles.themeBtnActive : {})
                }}
                onClick={() => toggleTheme(theme)}
              >
                {theme}
              </button>
            ))}
          </div>

          

          <button style={styles.saveBtn} type="submit" disabled={saving}>
            {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
          </button>
        </form>

        <button style={styles.collectionBtn} onClick={() => navigate('/collection')}>
          View My Collection
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
    padding: '24px',
    maxWidth: '600px',
    margin: '0 auto',
    width: '100%',
    flex: 1
  },
  centered: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: '24px'
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
  chartCard: {
    backgroundColor: 'rgba(0,8,20,0.6)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '24px'
  },
  chartTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: '16px',
    textAlign: 'center'
  },
  valueCard: {
    backgroundColor: 'rgba(0,8,20,0.6)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '24px'
  },
  valueTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: '8px'
  },
  valueSubtitle: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.6)',
    lineHeight: '1.5',
    marginBottom: '16px'
  },
  valueBtn: {
    display: 'block',
    textAlign: 'center',
    backgroundColor: Colors.yellow,
    color: Colors.text.onYellow,
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '15px',
    fontWeight: 'bold',
    textDecoration: 'none'
  },
  valueAmount: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: Colors.yellow,
    marginBottom: '8px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  sectionLabel: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.6)',
    marginTop: '16px',
    marginBottom: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  staticField: {
    backgroundColor: 'rgba(0,8,20,0.4)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '14px',
    fontSize: '16px',
    color: 'rgba(255,255,255,0.5)'
  },
  input: {
    backgroundColor: 'rgba(0,8,20,0.6)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    padding: '14px',
    fontSize: '16px',
    color: Colors.white,
    outline: 'none',
    width: '100%'
  },
  optionRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '8px'
  },
  optionBtn: {
    padding: '10px 16px',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(0,8,20,0.6)',
    color: Colors.white,
    fontSize: '14px',
    cursor: 'pointer'
  },
  optionBtnActive: {
    backgroundColor: Colors.yellow,
    borderColor: Colors.yellow,
    color: Colors.text.onYellow,
    fontWeight: 'bold'
  },
  themeGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '8px'
  },
  themeBtn: {
    padding: '8px 14px',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(0,8,20,0.6)',
    color: Colors.white,
    fontSize: '13px',
    cursor: 'pointer'
  },
  themeBtnActive: {
    backgroundColor: Colors.yellow,
    borderColor: Colors.yellow,
    color: Colors.text.onYellow,
    fontWeight: 'bold'
  },
  saveBtn: {
    backgroundColor: Colors.yellow,
    color: Colors.text.onYellow,
    border: 'none',
    borderRadius: '8px',
    padding: '16px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '24px'
  },
  collectionBtn: {
    width: '100%',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(0,8,20,0.6)',
    color: Colors.white,
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '12px'
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: Colors.yellow,
    fontSize: '16px',
    cursor: 'pointer',
    marginBottom: '8px',
    padding: 0
  },
  galleryCard: {
    backgroundColor: 'rgba(0,8,20,0.6)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '24px'
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
    height: '140px',
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
  galleryActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '8px'
  },
  galleryEditBtn: {
    background: 'none',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '6px',
    color: Colors.white,
    fontSize: '11px',
    padding: '4px 10px',
    cursor: 'pointer'
  },
  galleryDeleteBtn: {
    background: 'none',
    border: '1px solid rgba(255,0,0,0.3)',
    borderRadius: '6px',
    color: '#ff6b6b',
    fontSize: '11px',
    padding: '4px 10px',
    cursor: 'pointer'
  },
  profileLinkBtn: {
    display: 'block',
    color: Colors.yellow,
    fontSize: '14px',
    textDecoration: 'none',
    marginTop: '8px'
  },
}