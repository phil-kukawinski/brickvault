import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { LegoSet } from '../lib/rebrickable'
import { Colors } from '../lib/theme'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { fetchSetBySetNum, searchSets, fetchThemeById } from '../lib/rebrickable'

export default function ScanScreen() {
  const [input, setInput] = useState('')
  const [results, setResults] = useState<LegoSet[]>([])
  const [searching, setSearching] = useState(false)
  const [foundSet, setFoundSet] = useState<LegoSet | null>(null)
  const [condition, setCondition] = useState<'sealed' | 'built' | 'partial' | 'incomplete'>('sealed')
  const [ownedSetNumbers, setOwnedSetNumbers] = useState<string[]>([])
  const [retailPrice, setRetailPrice] = useState<string>('')
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchOwned()
  }, [])

  async function fetchOwned() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('collection')
      .select('set_number')
      .eq('user_id', user.id)
    if (data) setOwnedSetNumbers(data.map(i => i.set_number))
  }

  useEffect(() => {
    if (!input.trim()) {
      setResults([])
      setFoundSet(null)
      return
    }
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      handleSearch()
    }, 500)
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [input])

  const handleSearch = async () => {
    if (!input.trim()) return
    await handleSearchWithInput(input)
  }

  async function handleSearchWithInput(value: string) {
    if (!value.trim()) return
    setSearching(true)
    setResults([])
    setFoundSet(null)

    const bySetNum = await fetchSetBySetNum(
      value.includes('-') ? value : `${value}-1`
    )
    if (bySetNum) {
      setSearching(false)
      setFoundSet(bySetNum)
      return
    }

    const res = await searchSets(value)
    setSearching(false)
    setResults(res)
  }

  async function handleBarcodeScan(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if ('BarcodeDetector' in window) {
      try {
        const detector = new (window as any).BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] })
        const bitmap = await createImageBitmap(file)
        const barcodes = await detector.detect(bitmap)
        if (barcodes.length > 0) {
          const value = barcodes[0].rawValue
          setInput(value)
          await handleSearchWithInput(value)
        } else {
          alert('No barcode detected. Try again with better lighting.')
        }
      } catch {
        alert('Could not read barcode. Try entering the set number manually.')
      }
    } else {
      alert('Barcode scanning is not supported on this browser. Please enter the set number manually.')
    }
  }

  async function addToCollection(status: 'owned' | 'wishlist') {
    if (!foundSet) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (ownedSetNumbers.includes(foundSet.set_num)) {
      const confirmed = window.confirm(
        `You already have ${foundSet.name} in your vault. Add another copy anyway?`
      )
      if (!confirmed) return
    }

    const theme = await fetchThemeById(foundSet.theme_id)

    const { error } = await supabase.from('collection').insert({
      user_id: user.id,
      set_number: foundSet.set_num,
      name: foundSet.name,
      piece_count: foundSet.num_parts,
      image_url: foundSet.set_img_url,
      status,
      condition: status === 'owned' ? condition : null,
      theme: theme || null,
      retail_price: retailPrice ? parseFloat(retailPrice) : null,
      release_year: foundSet.year || null
    })

    if (!error) {
      await supabase.from('activity_log').insert({
        user_id: user.id,
        action: status === 'owned' ? 'added_to_collection' : 'added_to_wishlist',
        set_number: foundSet.set_num,
        set_name: foundSet.name,
        details: status === 'owned' ? `Condition: ${condition}` : null
      })
      navigate('/collection')
    }
  }

  function reset() {
    setFoundSet(null)
    setInput('')
    setResults([])
    setCondition('sealed')
    setRetailPrice('')
  }

  return (
    <div style={styles.container}>
      <Header />
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/')}>← Back</button>
        <h1 style={styles.title}>Add a Set</h1>
      </div>

      <div style={styles.searchRow}>
        <input
          style={styles.input}
          type="text"
          placeholder="Set number or name (e.g. 42151 or Bugatti)"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          autoFocus
        />
        <button style={styles.searchBtn} onClick={handleSearch}>Search</button>
      </div>

      {window.innerWidth <= 768 && (
        <label style={styles.scanBtn}>
          📷 Scan Barcode
          <input
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={handleBarcodeScan}
          />
        </label>
      )}

      <a
        href="https://brickit.app"
        target="_blank"
        rel="noopener noreferrer"
        style={styles.brickitBtn}
      >
        🧱 Have loose bricks? Build something with Brickit
      </a>

      {searching && (
        <div style={styles.centered}>
          <p style={{ color: Colors.yellow }}>Searching...</p>
        </div>
      )}

      {foundSet && !searching && (
        <div style={styles.resultContainer}>
          <p style={styles.resultTitle}>Set Found!</p>
          {foundSet.set_img_url && (
            <img src={foundSet.set_img_url} alt={foundSet.name} style={styles.setImage} />
          )}
          <p style={styles.setName}>{foundSet.name}</p>
          <p style={styles.setDetail}>Set #{foundSet.set_num}</p>
          <p style={styles.setDetail}>{foundSet.num_parts} pieces</p>
          <p style={styles.setDetail}>Released: {foundSet.year}</p>
          {foundSet.is_obsolete && (
            <p style={{ ...styles.setDetail, color: '#FF8A65' }}>Retired</p>
          )}

          {ownedSetNumbers.includes(foundSet.set_num) && (
            <div style={styles.duplicateWarning}>
              ⚠️ This set is already in your vault
            </div>
          )}

          <p style={styles.conditionLabel}>Retail Price (optional)</p>
          <div style={styles.priceRow}>
            <span style={styles.priceDollar}>$</span>
            <input
              style={styles.priceInput}
              type="number"
              placeholder="0.00"
              value={retailPrice}
              onChange={e => setRetailPrice(e.target.value)}
            />
          </div>

          <button style={styles.addBtn} onClick={() => addToCollection('owned')}>
            📦 Add to Collection
          </button>

          <p style={styles.conditionLabel}>Condition</p>
          <div style={styles.conditionRow}>
            {(['sealed', 'built', 'partial', 'incomplete'] as const).map(c => (
              <button
                key={c}
                style={{ ...styles.conditionBtn, ...(condition === c ? styles.conditionBtnActive : {}) }}
                onClick={() => setCondition(c)}
              >
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>

          <button style={styles.wishlistBtn} onClick={() => addToCollection('wishlist')}>
            ⭐ Add to Wishlist
          </button>

          <button style={styles.resetBtn} onClick={reset}>Search again</button>
        </div>
      )}

      {results.length > 0 && !foundSet && !searching && (
        <div style={styles.resultsList}>
          {results.map(set => (
            <button
              key={set.set_num}
              style={styles.resultRow}
              onClick={() => setFoundSet(set)}
            >
              {set.set_img_url && (
                <img src={set.set_img_url} alt={set.name} style={styles.rowImage} />
              )}
              <div style={styles.rowContent}>
                <div style={styles.rowNameRow}>
                  <p style={styles.rowName}>{set.name}</p>
                  {ownedSetNumbers.includes(set.set_num) && (
                    <span style={styles.ownedBadge}>In Vault</span>
                  )}
                </div>
                <p style={styles.rowDetail}>#{set.set_num} · {set.num_parts} pcs · {set.year}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {!searching && !foundSet && results.length === 0 && input.length > 0 && (
        <div style={styles.centered}>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>No results found. Try a different search.</p>
        </div>
      )}
      <Footer />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: 'transparent',
    color: Colors.white
  },
  header: {
    padding: '8px 24px 16px'
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
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: Colors.white
  },
  searchRow: {
    display: 'flex',
    gap: '8px',
    padding: '16px 24px'
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(0,8,20,0.6)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '15px',
    color: Colors.white,
    outline: 'none'
  },
  searchBtn: {
    backgroundColor: Colors.yellow,
    color: Colors.text.onYellow,
    border: 'none',
    borderRadius: '8px',
    padding: '12px 16px',
    fontWeight: 'bold',
    fontSize: '15px',
    cursor: 'pointer'
  },
  centered: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '48px 24px'
  },
  resultContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '24px'
  },
  resultTitle: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: Colors.yellow,
    marginBottom: '16px'
  },
  setImage: {
    width: '240px',
    height: '180px',
    objectFit: 'contain',
    marginBottom: '16px'
  },
  setName: {
    fontSize: '20px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '8px',
    color: Colors.white
  },
  setDetail: {
    fontSize: '15px',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: '4px'
  },
  addBtn: {
    width: '100%',
    maxWidth: '400px',
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
  conditionLabel: {
    fontSize: '15px',
    fontWeight: 'bold',
    color: Colors.white,
    marginTop: '16px',
    marginBottom: '8px',
    textAlign: 'center'
  },
  conditionRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    justifyContent: 'center',
    marginBottom: '8px'
  },
  conditionBtn: {
    padding: '8px 14px',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(0,8,20,0.6)',
    color: Colors.white,
    fontSize: '13px',
    cursor: 'pointer'
  },
  conditionBtnActive: {
    backgroundColor: Colors.yellow,
    borderColor: Colors.yellow,
    color: Colors.text.onYellow,
    fontWeight: 'bold'
  },
  wishlistBtn: {
    width: '100%',
    maxWidth: '400px',
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
  resetBtn: {
    background: 'none',
    border: 'none',
    color: Colors.yellow,
    fontSize: '14px',
    cursor: 'pointer',
    marginTop: '20px',
    opacity: 0.8
  },
  resultsList: {
    display: 'flex',
    flexDirection: 'column'
  },
  resultRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 24px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    cursor: 'pointer',
    backgroundColor: 'rgba(0,8,20,0.4)',
    border: 'none',
    textAlign: 'left',
    width: '100%',
    color: Colors.white
  },
  rowImage: {
    width: '72px',
    height: '72px',
    objectFit: 'contain',
    marginRight: '12px'
  },
  rowContent: {
    flex: 1
  },
  rowNameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap' as const
  },
  rowName: {
    fontSize: '15px',
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: '4px'
  },
  rowDetail: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.6)'
  },
  ownedBadge: {
    backgroundColor: 'rgba(251,224,45,0.15)',
    color: Colors.yellow,
    fontSize: '11px',
    fontWeight: 'bold',
    padding: '2px 8px',
    borderRadius: '12px',
    whiteSpace: 'nowrap' as const
  },
  duplicateWarning: {
    backgroundColor: 'rgba(251,224,45,0.1)',
    border: '1px solid rgba(251,224,45,0.3)',
    borderRadius: '8px',
    padding: '10px 16px',
    color: Colors.yellow,
    fontSize: '14px',
    marginTop: '16px',
    textAlign: 'center' as const
  },
  scanBtn: {
    display: 'block',
    width: 'calc(100% - 48px)',
    margin: '0 24px 8px',
    padding: '14px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(0,8,20,0.6)',
    color: Colors.white,
    fontSize: '15px',
    cursor: 'pointer',
    textAlign: 'center' as const
  },
  brickitBtn: {
    display: 'block',
    width: 'calc(100% - 48px)',
    margin: '0 24px 8px',
    padding: '14px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.1)',
    backgroundColor: 'transparent',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '14px',
    cursor: 'pointer',
    textAlign: 'center' as const,
    textDecoration: 'none'
  },
  priceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    maxWidth: '400px',
    width: '100%'
  },
  priceDollar: {
    fontSize: '18px',
    color: Colors.white,
    fontWeight: 'bold'
  },
  priceInput: {
    flex: 1,
    backgroundColor: 'rgba(0,8,20,0.6)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '15px',
    color: Colors.white,
    outline: 'none'
  }
}