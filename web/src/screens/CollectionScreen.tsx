import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Colors } from '../lib/theme'

type CollectionItem = {
  id: string
  set_number: string
  name: string
  piece_count: number
  image_url: string
  status: 'owned' | 'wishlist'
  complete: boolean
  condition: 'sealed' | 'built' | 'partial' | 'incomplete' | null
  added_at: string
}

export default function CollectionScreen() {
  const [items, setItems] = useState<CollectionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'owned' | 'wishlist'>('all')
  const [selected, setSelected] = useState<CollectionItem | null>(null)
  const [editStatus, setEditStatus] = useState<'owned' | 'wishlist'>('owned')
  const [editCondition, setEditCondition] = useState<'sealed' | 'built' | 'partial' | 'incomplete'>('sealed')
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchCollection()
  }, [])

  async function fetchCollection() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data, error } = await supabase
      .from('collection')
      .select('*')
      .eq('user_id', user.id)
      .order('added_at', { ascending: false })
    setLoading(false)
    if (!error) setItems(data || [])
  }

  async function handleSave() {
    if (!selected) return
    setSaving(true)
    await supabase
      .from('collection')
      .update({ status: editStatus, condition: editStatus === 'owned' ? editCondition : null })
      .eq('id', selected.id)
    setSaving(false)
    setSelected(null)
    fetchCollection()
  }

  async function handleAddAnother() {
    if (!selected) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('collection').insert({
      user_id: user.id,
      set_number: selected.set_number,
      name: selected.name,
      piece_count: selected.piece_count,
      image_url: selected.image_url,
      status: 'owned',
      condition: 'sealed'
    })
    setSelected(null)
    fetchCollection()
  }

  async function handleRemove() {
    if (!selected) return
    if (!window.confirm(`Remove ${selected.name} from your collection?`)) return
    await supabase.from('collection').delete().eq('id', selected.id)
    setSelected(null)
    fetchCollection()
  }

  function openDetail(item: CollectionItem) {
    setSelected(item)
    setEditStatus(item.status)
    setEditCondition(item.condition ?? 'sealed')
  }

  const filtered = filter === 'all' ? items : items.filter(i => i.status === filter)

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/')}>← Back</button>
        <div style={styles.headerRow}>
          <div>
            <h1 style={styles.title}>My Collection</h1>
            <p style={styles.count}>{filtered.length} sets</p>
          </div>
          <button style={styles.addButton} onClick={() => navigate('/scan')}>+ Add Set</button>
        </div>
      </div>

      <div style={styles.filterRow}>
        {(['all', 'owned', 'wishlist'] as const).map(f => (
          <button
            key={f}
            style={{ ...styles.filterBtn, ...(filter === f ? styles.filterBtnActive : {}) }}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={styles.centered}>
          <p style={{ color: Colors.yellow }}>Loading...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={styles.centered}>
          <p style={styles.emptyText}>No sets here yet!</p>
          <button style={styles.link} onClick={() => navigate('/scan')}>Add a set to get started</button>
        </div>
      ) : (
        <div style={styles.list}>
          {filtered.map(item => (
            <button key={item.id} style={styles.card} onClick={() => openDetail(item)}>
              {item.image_url
                ? <img src={item.image_url} alt={item.name} style={styles.cardImage} />
                : <div style={styles.imagePlaceholder}>🧱</div>
              }
              <div style={styles.cardContent}>
                <p style={styles.cardName}>{item.name}</p>
                <p style={styles.cardDetail}>#{item.set_number}</p>
                <p style={styles.cardDetail}>{item.piece_count} pieces</p>
                <div style={styles.cardFooter}>
                  <span style={{ ...styles.badge, ...(item.status === 'owned' ? styles.badgeOwned : styles.badgeWishlist) }}>
                    {item.status === 'owned' ? '📦 Owned' : '⭐ Wishlist'}
                  </span>
                  {item.condition && (
                    <span style={styles.conditionBadge}>{item.condition}</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div style={styles.modal} onClick={() => setSelected(null)}>
          <div style={styles.modalCard} onClick={e => e.stopPropagation()}>
            {selected.image_url && (
              <img src={selected.image_url} alt={selected.name} style={styles.modalImage} />
            )}
            <h2 style={styles.modalName}>{selected.name}</h2>
            <p style={styles.modalDetail}>Set #{selected.set_number} · {selected.piece_count} pieces</p>

            <p style={styles.sectionLabel}>Status</p>
            <div style={styles.optionRow}>
              {(['owned', 'wishlist'] as const).map(s => (
                <button
                  key={s}
                  style={{ ...styles.optionBtn, ...(editStatus === s ? styles.optionBtnActive : {}) }}
                  onClick={() => setEditStatus(s)}
                >
                  {s === 'owned' ? '📦 Owned' : '⭐ Wishlist'}
                </button>
              ))}
            </div>

            {editStatus === 'owned' && (
              <>
                <p style={styles.sectionLabel}>Condition</p>
                <div style={styles.optionRow}>
                  {(['sealed', 'built', 'partial', 'incomplete'] as const).map(c => (
                    <button
                      key={c}
                      style={{ ...styles.optionBtn, ...(editCondition === c ? styles.optionBtnActive : {}) }}
                      onClick={() => setEditCondition(c)}
                    >
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </button>
                  ))}
                </div>
              </>
            )}

            {editStatus === 'wishlist' && (
              <>
                <button style={styles.actionBtn} onClick={() => window.open(`https://www.google.com/search?q=LEGO+${encodeURIComponent(selected.name)}+set+${selected.set_number}&tbm=shop`, '_blank')}>
                  🛒 Google Shopping
                </button>
                <button style={styles.actionBtn} onClick={() => window.open('https://www.lego.com/en-us/storefinder', '_blank')}>
                  🏪 LEGO Store Finder
                </button>
                <button style={styles.actionBtn} onClick={() => window.open(`https://www.amazon.com/s?k=LEGO+${encodeURIComponent(selected.name)}`, '_blank')}>
                  📦 Amazon
                </button>
                <button style={styles.actionBtn} onClick={() => {
                  const text = `🧱 I'm looking to add to my BrickVault collection!\n\nSet: ${selected.name}\nSet #${selected.set_number} · ${selected.piece_count} pieces\n\nIf you have this or know where to find it, let me know!`
                  navigator.clipboard.writeText(text)
                  alert('Copied to clipboard!')
                }}>
                  📤 Share Wishlist Item
                </button>
              </>
            )}

            <button style={styles.saveBtn} onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button style={styles.addAnotherBtn} onClick={handleAddAnother}>
              + Add Another Copy
            </button>
            <button style={styles.removeBtn} onClick={handleRemove}>
              Remove this copy
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: Colors.navy,
    color: Colors.white
  },
  header: {
    padding: '60px 24px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.1)'
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
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '4px'
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: Colors.white
  },
  count: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.6)',
    marginTop: '4px'
  },
  addButton: {
    backgroundColor: Colors.yellow,
    color: Colors.text.onYellow,
    border: 'none',
    borderRadius: '8px',
    padding: '10px 16px',
    fontWeight: 'bold',
    fontSize: '15px',
    cursor: 'pointer'
  },
  filterRow: {
    display: 'flex',
    gap: '8px',
    padding: '12px 24px'
  },
  filterBtn: {
    padding: '8px 16px',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'transparent',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '14px',
    cursor: 'pointer'
  },
  filterBtnActive: {
    backgroundColor: Colors.yellow,
    borderColor: Colors.yellow,
    color: Colors.text.onYellow,
    fontWeight: 'bold'
  },
  centered: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '64px 24px'
  },
  emptyText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '16px',
    marginBottom: '12px'
  },
  link: {
    background: 'none',
    border: 'none',
    color: Colors.yellow,
    fontSize: '15px',
    cursor: 'pointer'
  },
  list: {
    padding: '16px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  card: {
    display: 'flex',
    backgroundColor: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '12px',
    overflow: 'hidden',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%'
  },
  cardImage: {
    width: '100px',
    height: '100px',
    objectFit: 'contain',
    flexShrink: 0
  },
  imagePlaceholder: {
    width: '100px',
    height: '100px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    flexShrink: 0
  },
  cardContent: {
    padding: '12px',
    flex: 1
  },
  cardName: {
    fontSize: '15px',
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: '4px'
  },
  cardDetail: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.6)'
  },
  cardFooter: {
    display: 'flex',
    gap: '6px',
    marginTop: '8px',
    flexWrap: 'wrap'
  },
  badge: {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px'
  },
  badgeOwned: {
    backgroundColor: 'rgba(251,224,45,0.15)',
    color: Colors.yellow
  },
  badgeWishlist: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: Colors.white
  },
  conditionBadge: {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    backgroundColor: 'rgba(255,255,255,0.08)',
    color: 'rgba(255,255,255,0.7)'
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalCard: {
    backgroundColor: Colors.navy,
    borderTop: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '16px 16px 0 0',
    padding: '24px',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '85vh',
    overflowY: 'auto'
  },
  modalImage: {
    width: '100%',
    height: '160px',
    objectFit: 'contain',
    marginBottom: '16px',
    borderRadius: '8px'
  },
  modalName: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: '4px'
  },
  modalDetail: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: '8px'
  },
  sectionLabel: {
    fontSize: '15px',
    fontWeight: 'bold',
    color: Colors.white,
    marginTop: '20px',
    marginBottom: '10px'
  },
  optionRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  optionBtn: {
    padding: '10px 16px',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'transparent',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '14px',
    cursor: 'pointer'
  },
  optionBtnActive: {
    backgroundColor: Colors.yellow,
    borderColor: Colors.yellow,
    color: Colors.text.onYellow,
    fontWeight: 'bold'
  },
  actionBtn: {
    width: '100%',
    padding: '14px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'transparent',
    color: Colors.white,
    fontSize: '15px',
    cursor: 'pointer',
    marginTop: '10px',
    textAlign: 'left'
  },
  saveBtn: {
    width: '100%',
    padding: '16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: Colors.yellow,
    color: Colors.text.onYellow,
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '24px'
  },
  addAnotherBtn: {
    width: '100%',
    padding: '16px',
    borderRadius: '8px',
    border: `1px solid ${Colors.yellow}`,
    background: 'transparent',
    color: Colors.yellow,
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '12px'
  },
  removeBtn: {
    width: '100%',
    padding: '16px',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    color: 'rgba(255,255,255,0.4)',
    fontSize: '14px',
    cursor: 'pointer',
    marginTop: '12px'
  }
}