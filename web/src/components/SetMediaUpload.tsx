import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Colors } from '../lib/theme'

type MediaItem = {
  id: string
  storage_path: string
  media_type: 'image' | 'video'
  label: string
  caption: string | null
  created_at: string
}

type Props = {
  collectionId: string
  userId: string
}

export default function SetMediaUpload({ collectionId, userId }: Props) {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [uploading, setUploading] = useState(false)
  const [label, setLabel] = useState<'sealed' | 'built' | 'in_progress' | 'display'>('built')
  const [caption, setCaption] = useState('')
  const [showUpload, setShowUpload] = useState(false)

  useEffect(() => {
    fetchMedia()
  }, [collectionId])

  async function fetchMedia() {
    const { data } = await supabase
      .from('set_media')
      .select('*')
      .eq('collection_id', collectionId)
      .order('created_at', { ascending: false })
    setMedia(data || [])
  }

  async function compressImage(file: File): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()
      img.onload = () => {
        const maxSize = 1200
        let width = img.width
        let height = img.height
        if (width > height && width > maxSize) {
          height = (height * maxSize) / width
          width = maxSize
        } else if (height > maxSize) {
          width = (width * maxSize) / height
          height = maxSize
        }
        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(blob => {
          if (blob) {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }))
          } else {
            resolve(file)
          }
        }, 'image/jpeg', 0.8)
      }
      img.src = URL.createObjectURL(file)
    })
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const mediaType = file.type.startsWith('video') ? 'video' : 'image'
    
    const processedFile = mediaType === 'image' ? await compressImage(file) : file
    
    const ext = mediaType === 'image' ? 'jpg' : file.name.split('.').pop()
    const path = `${userId}/${collectionId}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('set-media')
      .upload(path, processedFile)

    if (uploadError) {
      alert('Upload failed: ' + uploadError.message)
      setUploading(false)
      return
    }

    const { error: dbError } = await supabase.from('set_media').insert({
      user_id: userId,
      collection_id: collectionId,
      storage_path: path,
      media_type: mediaType,
      label,
      caption: caption.trim() || null
    })

    setUploading(false)
    if (!dbError) {
      setCaption('')
      setShowUpload(false)
      fetchMedia()
    }
  }

  async function handleDelete(item: MediaItem) {
    if (!window.confirm('Delete this photo?')) return
    await supabase.storage.from('set-media').remove([item.storage_path])
    await supabase.from('set_media').delete().eq('id', item.id)
    fetchMedia()
  }

  function getPublicUrl(path: string) {
    const { data } = supabase.storage.from('set-media').getPublicUrl(path)
    return data.publicUrl
  }

  const LABELS = [
    { value: 'sealed', label: 'Sealed' },
    { value: 'built', label: 'Built' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'display', label: 'On Display' }
  ]

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <p style={styles.title}>Photos & Videos</p>
        <button style={styles.addBtn} onClick={() => setShowUpload(!showUpload)}>
          {showUpload ? 'Cancel' : '+ Add'}
        </button>
      </div>

      {showUpload && (
        <div style={styles.uploadForm}>
          <p style={styles.fieldLabel}>Label</p>
          <div style={styles.labelRow}>
            {LABELS.map(l => (
              <button
                key={l.value}
                style={{
                  ...styles.labelBtn,
                  ...(label === l.value ? styles.labelBtnActive : {})
                }}
                onClick={() => setLabel(l.value as typeof label)}
              >
                {l.label}
              </button>
            ))}
          </div>

          <p style={styles.fieldLabel}>Caption (optional)</p>
          <input
            style={styles.input}
            type="text"
            placeholder="Add a caption..."
            value={caption}
            onChange={e => setCaption(e.target.value)}
          />

          <label style={styles.fileLabel}>
            {uploading ? 'Uploading...' : '📷 Choose Photo or Video'}
            <input
              type="file"
              accept="image/*,video/*"
              style={{ display: 'none' }}
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </div>
      )}

      {media.length > 0 && (
        <div style={styles.grid}>
          {media.map(item => (
            <div key={item.id} style={styles.mediaItem}>
              {item.media_type === 'image' ? (
                <img
                  src={getPublicUrl(item.storage_path)}
                  alt={item.caption || item.label}
                  style={styles.mediaImg}
                  onClick={() => window.open(getPublicUrl(item.storage_path), '_blank')}
                />
              ) : (
                <video
                  src={getPublicUrl(item.storage_path)}
                  style={styles.mediaImg}
                  controls
                />
              )}
              <div style={styles.mediaInfo}>
                <span style={styles.mediaLabel}>{item.label.replace('_', ' ')}</span>
                {item.caption && <p style={styles.mediaCaption}>{item.caption}</p>}
              </div>
              <button style={styles.deleteBtn} onClick={() => handleDelete(item)}>✕</button>
            </div>
          ))}
        </div>
      )}

      {media.length === 0 && !showUpload && (
        <p style={styles.emptyText}>No photos yet. Add one to document this set!</p>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    marginTop: '24px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    paddingTop: '20px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  title: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: Colors.white
  },
  addBtn: {
    backgroundColor: Colors.yellow,
    color: Colors.text.onYellow,
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  uploadForm: {
    backgroundColor: 'rgba(0,8,20,0.4)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px'
  },
  fieldLabel: {
    fontSize: '13px',
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: '8px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px'
  },
  labelRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '8px',
    marginBottom: '16px'
  },
  labelBtn: {
    padding: '8px 14px',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.2)',
    backgroundColor: 'transparent',
    color: Colors.white,
    fontSize: '13px',
    cursor: 'pointer'
  },
  labelBtnActive: {
    backgroundColor: Colors.yellow,
    borderColor: Colors.yellow,
    color: Colors.text.onYellow,
    fontWeight: 'bold'
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(0,8,20,0.6)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '15px',
    color: Colors.white,
    outline: 'none',
    marginBottom: '16px'
  },
  fileLabel: {
    display: 'block',
    width: '100%',
    padding: '14px',
    borderRadius: '8px',
    border: `1px solid ${Colors.yellow}`,
    color: Colors.yellow,
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
    textAlign: 'center' as const
  },
  grid: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px'
  },
  mediaItem: {
    backgroundColor: 'rgba(0,8,20,0.4)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    overflow: 'hidden',
    position: 'relative' as const
  },
  mediaImg: {
    width: '100%',
    maxHeight: '240px',
    objectFit: 'cover' as const,
    cursor: 'pointer',
    display: 'block'
  },
  mediaInfo: {
    padding: '10px 12px'
  },
  mediaLabel: {
    backgroundColor: 'rgba(251,224,45,0.15)',
    color: Colors.yellow,
    fontSize: '11px',
    fontWeight: 'bold',
    padding: '2px 8px',
    borderRadius: '12px',
    textTransform: 'capitalize' as const
  },
  mediaCaption: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.6)',
    marginTop: '6px'
  },
  deleteBtn: {
    position: 'absolute' as const,
    top: '8px',
    right: '8px',
    backgroundColor: 'rgba(0,0,0,0.6)',
    border: 'none',
    borderRadius: '50%',
    color: Colors.white,
    width: '28px',
    height: '28px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  emptyText: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center' as const,
    padding: '16px 0'
  }
}