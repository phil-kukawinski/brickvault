import { useState } from 'react'
import { Colors } from '../lib/theme'

export default function InstallPrompt() {
  const [open, setOpen] = useState(false)
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
  const isAndroid = /android/i.test(navigator.userAgent)

  return (
    <>
      <button style={styles.trigger} onClick={() => setOpen(true)}>
        📱 Add to Home Screen
      </button>

      {open && (
        <div style={styles.overlay} onClick={() => setOpen(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={() => setOpen(false)}>✕</button>
            <h2 style={styles.title}>Add BrickKeep to your Home Screen</h2>
            <p style={styles.subtitle}>Use BrickKeep like a native app — no App Store required.</p>

            {isIOS && (
              <div style={styles.steps}>
                <div style={styles.step}>
                  <span style={styles.stepNum}>1</span>
                  <div style={styles.stepContent}>
                    <p style={styles.stepTitle}>Open in Safari</p>
                    <p style={styles.stepDesc}>Make sure you're using Safari, not Chrome or another browser.</p>
                  </div>
                </div>
                <div style={styles.step}>
                  <span style={styles.stepNum}>2</span>
                  <div style={styles.stepContent}>
                    <p style={styles.stepTitle}>Tap the Share button</p>
                    <p style={styles.stepDesc}>Tap the share icon at the bottom of the screen — it looks like a box with an arrow pointing up.</p>
                  </div>
                </div>
                <div style={styles.step}>
                  <span style={styles.stepNum}>3</span>
                  <div style={styles.stepContent}>
                    <p style={styles.stepTitle}>Tap "Add to Home Screen"</p>
                    <p style={styles.stepDesc}>Scroll down in the share sheet and tap "Add to Home Screen", then tap "Add".</p>
                  </div>
                </div>
              </div>
            )}

            {isAndroid && (
              <div style={styles.steps}>
                <div style={styles.step}>
                  <span style={styles.stepNum}>1</span>
                  <div style={styles.stepContent}>
                    <p style={styles.stepTitle}>Open in Chrome</p>
                    <p style={styles.stepDesc}>Make sure you're using Chrome on your Android device.</p>
                  </div>
                </div>
                <div style={styles.step}>
                  <span style={styles.stepNum}>2</span>
                  <div style={styles.stepContent}>
                    <p style={styles.stepTitle}>Tap the menu</p>
                    <p style={styles.stepDesc}>Tap the three dots in the top right corner of Chrome.</p>
                  </div>
                </div>
                <div style={styles.step}>
                  <span style={styles.stepNum}>3</span>
                  <div style={styles.stepContent}>
                    <p style={styles.stepTitle}>Tap "Add to Home Screen"</p>
                    <p style={styles.stepDesc}>Tap "Add to Home Screen" and then "Add" to confirm.</p>
                  </div>
                </div>
              </div>
            )}

            {!isIOS && !isAndroid && (
              <div style={styles.steps}>
                <div style={styles.step}>
                  <span style={styles.stepNum}>📱</span>
                  <div style={styles.stepContent}>
                    <p style={styles.stepTitle}>On iPhone</p>
                    <p style={styles.stepDesc}>Open mybrickkeep.com in Safari → tap the Share button → tap "Add to Home Screen".</p>
                  </div>
                </div>
                <div style={styles.step}>
                  <span style={styles.stepNum}>🤖</span>
                  <div style={styles.stepContent}>
                    <p style={styles.stepTitle}>On Android</p>
                    <p style={styles.stepDesc}>Open mybrickkeep.com in Chrome → tap the three dots menu → tap "Add to Home Screen".</p>
                  </div>
                </div>
              </div>
            )}

            <button style={styles.doneBtn} onClick={() => setOpen(false)}>
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  )
}

const styles: Record<string, React.CSSProperties> = {
  trigger: {
    backgroundColor: 'rgba(0,8,20,0.6)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    color: Colors.white,
    fontSize: '14px',
    padding: '10px 20px',
    cursor: 'pointer'
  },
  overlay: {
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
  modal: {
    backgroundColor: '#001020',
    borderTop: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '16px 16px 0 0',
    padding: '24px',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '85vh',
    overflowY: 'auto'
  },
  closeBtn: {
    position: 'absolute' as const,
    top: '16px',
    right: '16px',
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '20px',
    cursor: 'pointer'
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: '8px',
    paddingRight: '32px'
  },
  subtitle: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: '24px'
  },
  steps: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '24px'
  },
  step: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start'
  },
  stepNum: {
    backgroundColor: Colors.yellow,
    color: Colors.text.onYellow,
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '14px',
    flexShrink: 0
  },
  stepContent: {
    flex: 1
  },
  stepTitle: {
    fontSize: '15px',
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: '4px'
  },
  stepDesc: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.6)',
    lineHeight: '1.5'
  },
  doneBtn: {
    width: '100%',
    padding: '16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: Colors.yellow,
    color: Colors.text.onYellow,
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer'
  }
}