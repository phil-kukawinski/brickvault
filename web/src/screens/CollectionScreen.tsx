import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Colors } from '../lib/theme'
import Header from '../components/Header'
import Footer from '../components/Footer'
import SetMediaUpload from '../components/SetMediaUpload'

type CollectionItem = {
  id: string
  set_number: string
  name: string
  piece_count: number
  image_url: string
  status: 'owned' | 'wishlist'
  complete: boolean
  condition: 'sealed' | 'built' | 'partial' | 'incomplete' | null
  theme: string | null
  retail_price: number | null
  release_year: number | null
  retired_year: number | null
  added_at: string
}

export default function CollectionScreen() {
  const [items, setItems] = useState<CollectionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'owned' | 'wishlist'>('owned')
  const [selected, setSelected] = useState<CollectionItem | null>(null)
  const [editStatus, setEditStatus] = useState<'owned' | 'wishlist'>('owned')
  const [editCondition, setEditCondition] = useState<'sealed' | 'built' | 'partial' | 'incomplete'>('sealed')
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()
  const [userId, setUserId] = useState<string>('')
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null)
  const [editingPriceValue, setEditingPriceValue] = useState<string>('')
  const [sort, setSort] = useState<'newest' | 'oldest' | 'name' | 'pieces' | 'theme'>('newest')
  const [filterThemes, setFilterThemes] = useState<string[]>([])
  const [filterConditions, setFilterConditions] = useState<string[]>([])
  const [filterMinPieces, setFilterMinPieces] = useState('')
  const [filterMaxPieces, setFilterMaxPieces] = useState('')
  const [filterMinPrice, setFilterMinPrice] = useState('')
  const [filterMaxPrice, setFilterMaxPrice] = useState('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [nameOrder, setNameOrder] = useState<'az' | 'za'>('az')
  const availableThemes = [...new Set(items.map(i => i.theme).filter(Boolean))] as string[]

  useEffect(() => {
    fetchCollection()
  }, [])

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
    }
    getUser()
  }, [])

  const location = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const filterParam = params.get('filter')
    if (filterParam === 'owned' || filterParam === 'wishlist' || filterParam === 'all') {
      setFilter(filterParam)
    }
  }, [location.search])

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
      .update({
        status: editStatus,
        condition: editStatus === 'owned' ? editCondition : null,
        retail_price: selected.retail_price
      })
      .eq('id', selected.id)
    setSaving(false)
    setSelected(null)
    fetchCollection()
  }

  async function handleSavePrice(itemId: string) {
    await supabase
      .from('collection')
      .update({ retail_price: editingPriceValue ? parseFloat(editingPriceValue) : null })
      .eq('id', itemId)
    setEditingPriceId(null)
    setEditingPriceValue('')
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
      condition: 'sealed',
      theme: selected.theme || null,
      release_year: selected.release_year || null,
      retired_year: selected.retired_year || null,
      retail_price: selected.retail_price || null
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

  const filtered = (filter === 'all' ? [
    ...items.filter(i => i.status === 'owned'),
    ...items.filter(i => i.status === 'wishlist')
  ] : items.filter(i => i.status === filter))
    .filter(i => filterThemes.length === 0 || (i.theme && filterThemes.includes(i.theme)))
    .filter(i => filterConditions.length === 0 || (i.condition && filterConditions.includes(i.condition)))
    .filter(i => !filterMinPieces || i.piece_count >= parseInt(filterMinPieces))
    .filter(i => !filterMaxPieces || i.piece_count <= parseInt(filterMaxPieces))
    .filter(i => !filterMinPrice || (i.retail_price && i.retail_price >= parseFloat(filterMinPrice)))
    .filter(i => !filterMaxPrice || (i.retail_price && i.retail_price <= parseFloat(filterMaxPrice)))
    .filter(i => !filterDateFrom || new Date(i.added_at) >= new Date(filterDateFrom))
    .filter(i => !filterDateTo || new Date(i.added_at) <= new Date(filterDateTo))
    .sort((a, b) => {
      if (filter === 'all') {
        if (a.status !== b.status) return a.status === 'owned' ? -1 : 1
      }
      switch (sort) {
        case 'newest': return new Date(b.added_at).getTime() - new Date(a.added_at).getTime()
        case 'oldest': return new Date(a.added_at).getTime() - new Date(b.added_at).getTime()
        case 'name': return nameOrder === 'az'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
        case 'pieces': return b.piece_count - a.piece_count
        case 'theme': return (a.theme || 'zzz').localeCompare(b.theme || 'zzz')
        default: return 0
      }
    })

    const activeFilterCount = [
  filterThemes.length > 0,
  filterConditions.length > 0,
  filterMinPieces,
  filterMaxPieces,
  filterMinPrice,
  filterMaxPrice,
  filterDateFrom,
  filterDateTo
].filter(Boolean).length

  return (
    <div style={styles.container}>
        <Header />
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

      <div style={styles.sortRow}>
        <span style={styles.sortLabel}>Sort:</span>
        {(['newest', 'oldest', 'name', 'pieces', 'theme'] as const).map(s => (
          <button
            key={s}
            style={{ ...styles.sortBtn, ...(sort === s ? styles.sortBtnActive : {}) }}
            onClick={() => setSort(s)}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {(sort === 'newest' || sort === 'oldest') && (
        <div style={styles.subFilterRow}>
          <span style={styles.subFilterLabel}>Date range:</span>
          <div style={styles.filterRangeRow}>
            <input
              style={styles.filterRangeInput}
              type="date"
              value={filterDateFrom}
              onChange={e => setFilterDateFrom(e.target.value)}
            />
            <span style={styles.rangeSep}>to</span>
            <input
              style={styles.filterRangeInput}
              type="date"
              value={filterDateTo}
              onChange={e => setFilterDateTo(e.target.value)}
            />
          </div>
        </div>
      )}

      {sort === 'name' && (
        <div style={styles.subFilterRow}>
          <span style={styles.subFilterLabel}>Order:</span>
          <div style={styles.filterChips}>
            {([{ value: 'az', label: 'A → Z' }, { value: 'za', label: 'Z → A' }]).map(o => (
              <button
                key={o.value}
                style={{ ...styles.chip, ...(nameOrder === o.value ? styles.chipActive : {}) }}
                onClick={() => setNameOrder(o.value as 'az' | 'za')}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {sort === 'pieces' && (
        <div style={styles.subFilterRow}>
          <span style={styles.subFilterLabel}>Piece range:</span>
          <div style={styles.filterRangeRow}>
            <input
              style={styles.filterRangeInput}
              type="number"
              placeholder="Min"
              value={filterMinPieces}
              onChange={e => setFilterMinPieces(e.target.value)}
            />
            <span style={styles.rangeSep}>to</span>
            <input
              style={styles.filterRangeInput}
              type="number"
              placeholder="Max"
              value={filterMaxPieces}
              onChange={e => setFilterMaxPieces(e.target.value)}
            />
          </div>
        </div>
      )}

      {sort === 'theme' && availableThemes.length > 0 && (
        <div style={styles.subFilterRow}>
          <span style={styles.subFilterLabel}>Filter by theme:</span>
          <div style={styles.filterChips}>
            {availableThemes.map(theme => (
              <button
                key={theme}
                style={{ ...styles.chip, ...(filterThemes.includes(theme) ? styles.chipActive : {}) }}
                onClick={() => setFilterThemes(prev =>
                  prev.includes(theme) ? prev.filter(t => t !== theme) : [...prev, theme]
                )}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeFilterCount > 0 && (
        <div style={{ padding: '0 24px 8px' }}>
          <button
            style={styles.clearFiltersBtn}
            onClick={() => {
              setFilterThemes([])
              setFilterConditions([])
              setFilterMinPieces('')
              setFilterMaxPieces('')
              setFilterMinPrice('')
              setFilterMaxPrice('')
              setFilterDateFrom('')
              setFilterDateTo('')
              setNameOrder('az')
            }}
          >
            Clear filters
          </button>
        </div>
      )}

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
            <div key={item.id} style={{ ...styles.card, position: 'relative' }} onClick={() => openDetail(item)}>
              {item.image_url
                ? <img src={item.image_url} alt={item.name} style={styles.cardImage} />
                : <div style={styles.imagePlaceholder}>🧱</div>
              }
              <div style={styles.cardContent}>
                <p style={styles.cardName}>{item.name}</p>
                <p style={styles.cardDetail}>#{item.set_number}</p>
                <p style={styles.cardDetail}>{item.piece_count} pieces</p>
                {item.release_year && (
                  <p style={styles.cardDetail}>Released: {item.release_year}{item.retired_year ? ` · Retired: ${item.retired_year}` : ''}</p>
                )}
                {item.theme && (
                  <p style={styles.cardDetail}>{item.theme}</p>
                )}
                {editingPriceId === item.id ? (
                  <div style={styles.inlinePriceEdit} onClick={e => e.stopPropagation()}>
                    <span style={{ color: Colors.white, fontSize: '13px' }}>$</span>
                    <input
                      style={styles.inlinePriceInput}
                      type="number"
                      placeholder="0.00"
                      value={editingPriceValue}
                      onChange={e => setEditingPriceValue(e.target.value)}
                      autoFocus
                    />
                    <button
                      style={styles.inlinePriceSave}
                      onClick={e => { e.stopPropagation(); handleSavePrice(item.id) }}
                    >
                      Save
                    </button>
                    <button
                      style={styles.inlinePriceCancel}
                      onClick={e => { e.stopPropagation(); setEditingPriceId(null) }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <p
                    style={{ ...styles.cardDetail, color: item.retail_price ? 'rgba(255,255,255,0.6)' : Colors.yellow, cursor: 'pointer' }}
                    onClick={e => { e.stopPropagation(); setEditingPriceId(item.id); setEditingPriceValue(item.retail_price?.toString() || '') }}
                  >
                    {item.retail_price
                      ? `Retail: $${item.retail_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : 'Missing retail price'
                    }
                  </p>
                )}
                <div style={styles.cardFooter}>
                  <span style={{ ...styles.badge, ...(item.status === 'owned' ? styles.badgeOwned : styles.badgeWishlist) }}>
                    {item.status === 'owned' ? '📦 Owned' : '⭐ Wishlist'}
                  </span>
                  {item.condition && (
                    <span style={styles.conditionBadge}>{item.condition}</span>
                  )}
                </div>
              </div>
              {item.status === 'wishlist' && (
                <button
                  style={styles.quickRemoveBtn}
                  onClick={async e => {
                    e.stopPropagation()
                    if (!window.confirm(`Remove ${item.name} from your wishlist?`)) return
                    await supabase.from('collection').delete().eq('id', item.id)
                    fetchCollection()
                  }}
                >
                  ✕ Remove
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div style={styles.modal} onClick={() => setSelected(null)}>
           <div style={styles.modalCard} onClick={e => e.stopPropagation()}>
    <div style={styles.modalHeader}>
      <button style={styles.closeBtn} onClick={() => setSelected(null)}>✕</button>
    </div>
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

            <p style={styles.sectionLabel}>Retail Price</p>
            <div style={styles.modalPriceRow}>
              <span style={styles.priceDollar}>$</span>
              <input
                style={styles.modalPriceInput}
                type="number"
                placeholder="0.00"
                value={selected.retail_price?.toString() || ''}
                onChange={async e => {
                  const val = e.target.value
                  setSelected({ ...selected, retail_price: val ? parseFloat(val) : null })
                }}
              />
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
                    const text = `🧱 I'm looking to add to my BrickKeep collection!\n\nSet: ${selected.name}\nSet #${selected.set_number} · ${selected.piece_count} pieces\n\nIf you have this or know where to find it, let me know!`
                    if (navigator.share) {
                        navigator.share({
                        title: 'BrickKeep Wishlist',
                        text
                        })
                    } else {
                        navigator.clipboard.writeText(text)
                        alert('Copied to clipboard!')
                    }
                    }}>
                  📤 Share Wishlist Item
                </button>
              </>
            )}

            <a href={`https://www.brickeconomy.com/search?query=${selected.set_number}`}
  target="_blank"
  rel="noopener noreferrer"
  style={styles.marketBtn}
>
  💰 Check Market Value
</a>

            <button style={styles.saveBtn} onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button style={styles.addAnotherBtn} onClick={handleAddAnother}>
              + Add Another Copy
            </button>
            <button style={styles.removeBtn} onClick={handleRemove}>
              Remove this copy
            </button>
            <SetMediaUpload
              collectionId={selected.id}
              userId={userId}
            />
          </div>
        </div>
      )}
    
    <Footer />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    padding: '8px 24px 16px',
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
    backgroundColor: 'rgba(0,8,20,0.5)',
    color: Colors.white,
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
    backgroundColor: 'rgba(0,8,20,0.6)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '12px',
    overflow: 'hidden',
    cursor: 'pointer',
    textAlign: 'left' as const,
    width: '100%',
    position: 'relative' as const
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
    backgroundColor: 'rgba(0,8,20,0.5)',
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
    backgroundColor: '#001020',
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
    backgroundColor: 'transparent',
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
  },
  marketBtn: {
    display: 'block',
    width: '100%',
    padding: '14px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(0,8,20,0.5)',
    color: Colors.white,
    fontSize: '15px',
    cursor: 'pointer',
    marginTop: '12px',
    textAlign: 'center',
    textDecoration: 'none',
    boxSizing: 'border-box'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '8px'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '4px 8px'
  },
  sortRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '0 24px 12px',
    overflowX: 'auto' as const,
    flexWrap: 'nowrap' as const,
    scrollbarWidth: 'none' as const
  },
  sortLabel: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.5)',
    marginRight: '4px'
  },
  sortBtn: {
    padding: '6px 14px',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(0,8,20,0.6)',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '13px',
    cursor: 'pointer'
  },
  sortBtnActive: {
    backgroundColor: Colors.yellow,
    borderColor: Colors.yellow,
    color: Colors.text.onYellow,
    fontWeight: 'bold'
  },
  inlinePriceEdit: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '4px'
  },
  inlinePriceInput: {
    width: '80px',
    backgroundColor: 'rgba(0,8,20,0.6)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '6px',
    padding: '4px 8px',
    fontSize: '13px',
    color: Colors.white,
    outline: 'none'
  },
  inlinePriceSave: {
    backgroundColor: Colors.yellow,
    color: Colors.text.onYellow,
    border: 'none',
    borderRadius: '6px',
    padding: '4px 10px',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  inlinePriceCancel: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.4)',
    fontSize: '12px',
    cursor: 'pointer'
  },
  modalPriceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '8px'
  },
  priceDollar: {
    fontSize: '18px',
    color: Colors.white,
    fontWeight: 'bold'
  },
  modalPriceInput: {
    flex: 1,
    backgroundColor: 'rgba(0,8,20,0.6)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '15px',
    color: Colors.white,
    outline: 'none'
  },
  quickRemoveBtn: {
    position: 'absolute' as const,
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: 'rgba(255,0,0,0.15)',
    border: '1px solid rgba(255,0,0,0.3)',
    borderRadius: '8px',
    color: '#ff6b6b',
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    whiteSpace: 'nowrap' as const
  },
  filterToggleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '0 24px 12px'
  },
  filterToggleBtn: {
    background: 'none',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '20px',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '13px',
    padding: '6px 14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  filterBadge: {
    backgroundColor: Colors.yellow,
    color: Colors.text.onYellow,
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    fontSize: '11px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  clearFiltersBtn: {
    background: 'none',
    border: 'none',
    color: Colors.yellow,
    fontSize: '13px',
    cursor: 'pointer'
  },
  filterPanel: {
    backgroundColor: 'rgba(0,8,20,0.6)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '16px',
    margin: '0 24px 12px'
  },
  filterLabel: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    marginBottom: '8px',
    marginTop: '12px'
  },
  filterChips: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '8px',
    marginBottom: '4px'
  },
  chip: {
    padding: '6px 12px',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.2)',
    backgroundColor: 'transparent',
    color: Colors.white,
    fontSize: '13px',
    cursor: 'pointer'
  },
  chipActive: {
    backgroundColor: Colors.yellow,
    borderColor: Colors.yellow,
    color: Colors.text.onYellow,
    fontWeight: 'bold'
  },
  filterRangeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px'
  },
  filterRangeInput: {
    flex: 1,
    backgroundColor: 'rgba(0,8,20,0.6)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '14px',
    color: Colors.white,
    outline: 'none'
  },
  rangeSep: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '13px'
  },
  rangePrefix: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '14px'
  },
  subFilterRow: {
    padding: '0 24px 12px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px'
  },
  subFilterLabel: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px'
  },
}