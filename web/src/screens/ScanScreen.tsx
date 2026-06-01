import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { fetchSetBySetNum, searchSets } from '../lib/rebrickable'
import type { LegoSet } from '../lib/rebrickable'
import { Colors } from '../lib/theme'

export default function ScanScreen() {
  const [input, setInput] = useState('')
  const [results, setResults] = useState<LegoSet[]>([])
  const [searching, setSearching] = useState(false)
  const [foundSet, setFoundSet] = useState<LegoSet | null>(null)
  const [condition, setCondition] = useState<'sealed' | 'built' | 'partial' | 'incomplete'>('sealed')
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navigate = useNavigate()

  const handleSearch = async () => {
    if (!input.trim()) return
    setSearching(true)
    setResults([])
    setFoundSet(null)

    const bySetNum = await fetchSetBySetNum(
      input.includes('-') ? input : `${input}-1`
    )
    if (bySetNum) {
      setSearching(false)
      setFoundSet(bySetNum)
      return
    }

    const res = await searchSets(input)
    setSearching(false)
    setResults(res)
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

  async function addToCollection(status: 'owned' | 'wishlist') {
    if (!foundSet) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('collection').insert({
      user_id: user.id,
      set_number: foundSet.set_num,
      name: foundSet.name,
      piece_count: foundSet.num_parts,
      image_url: foundSet.set_img_url,
      status,
      condition: status === 'owned' ? condition : null
    })
    if (!error) {
      navigate('/collection')
    }
  }

  function reset() {
    setFoundSet(null)
    setInput('')
    setResults([])
    setCondition('sealed')
  }

  return (
    <div style={styles.container}>
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
          <p style={styles.setDetail}>{foundSet.num_parts} pieces · {foundSet.year}</p>

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
                <p style={styles.rowName}>{set.name}</p>
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
    backgroundColor: 'rgba(255,255,255,0.08)',
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
    background: 'transparent',
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
    background: 'transparent',
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
  rowName: {
    fontSize: '15px',
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: '4px'
  },
  rowDetail: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.6)'
  }
}