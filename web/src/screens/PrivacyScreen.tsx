import { useNavigate } from 'react-router-dom'
import { Colors } from '../lib/theme'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function PrivacyScreen() {
  const navigate = useNavigate()

  return (
    <div style={styles.container}>
      <Header />
      <div style={styles.content}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>
        <h1 style={styles.title}>Privacy Policy</h1>
        <p style={styles.updated}>Last updated: June 2026</p>

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Overview</h2>
          <p style={styles.text}>
            BrickKeep ("we", "us", or "our") is committed to protecting your privacy. This policy explains what information we collect, how we use it, and your rights regarding your data. By using BrickKeep at mybrickkeep.com, you agree to the terms of this policy.
          </p>
        </div>

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Information We Collect</h2>
          <p style={styles.subheading}>Account Information</p>
          <p style={styles.text}>When you create an account, we collect your email address, username, and password (stored securely via Supabase authentication).</p>
          <p style={styles.subheading}>Profile Information</p>
          <p style={styles.text}>You may optionally provide your full name, location, bio, collecting preferences, and favorite LEGO themes. This information is stored in your profile and is only visible to others if you set your profile to public.</p>
          <p style={styles.subheading}>Collection Data</p>
          <p style={styles.text}>We store information about the LEGO sets you add to your collection or wishlist, including set numbers, names, piece counts, conditions, themes, retail prices, and release years.</p>
          <p style={styles.subheading}>Photos and Videos</p>
          <p style={styles.text}>If you choose to upload photos or videos of your sets, these files are stored securely via Supabase Storage. You control who can see them through your profile visibility settings.</p>
          <p style={styles.subheading}>Activity Data</p>
          <p style={styles.text}>We log activity such as adding or removing sets from your collection. This data is only visible to you in your Search History and is never shared with third parties.</p>
        </div>

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>How We Use Your Information</h2>
          <p style={styles.text}>We use your information solely to provide and improve BrickKeep. Specifically:</p>
          <div style={styles.bulletList}>
            {[
              'To create and manage your account',
              'To display your collection and profile',
              'To enable public profile sharing if you choose to make your profile public',
              'To improve app features based on usage patterns',
              'To respond to feedback you submit'
            ].map((item, i) => (
              <div key={i} style={styles.bulletItem}>
                <span style={styles.bullet}>•</span>
                <p style={styles.bulletText}>{item}</p>
              </div>
            ))}
          </div>
          <p style={styles.text}>We do not sell your data, use it for advertising, or share it with third parties for marketing purposes.</p>
        </div>

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Third-Party Services</h2>
          <p style={styles.text}>BrickKeep uses the following third-party services to operate:</p>
          <div style={styles.thirdPartyList}>
            {[
              { name: 'Supabase', purpose: 'Database, authentication, and file storage. Your account data and uploads are stored on Supabase servers.', link: 'https://supabase.com/privacy' },
              { name: 'Rebrickable', purpose: "LEGO set database used to look up set information. Set searches may be sent to Rebrickable's API.", link: 'https://rebrickable.com/privacy/' },
              { name: 'BrickEconomy', purpose: 'Market value links open BrickEconomy in a new tab. We do not share your data with BrickEconomy.', link: 'https://www.brickeconomy.com/page/privacy' },
              { name: 'Vercel', purpose: 'Hosting provider for mybrickkeep.com. Standard web traffic logs may be retained by Vercel.', link: 'https://vercel.com/legal/privacy-policy' },
            ].map(s => (
              <div key={s.name} style={styles.thirdPartyItem}>
                <p style={styles.thirdPartyName}>{s.name}</p>
                <p style={styles.thirdPartyDesc}>{s.purpose}</p>
                <a href={s.link} target="_blank" rel="noopener noreferrer" style={styles.thirdPartyLink}>
                  View their privacy policy →
                </a>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Data Retention</h2>
          <p style={styles.text}>
            Your data is retained for as long as your account is active. If you delete your account, all associated data including your profile, collection, activity logs, and uploaded media will be permanently deleted within 30 days.
          </p>
        </div>

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Your Rights</h2>
          <div style={styles.bulletList}>
            {[
              'Access: You can view all data associated with your account at any time through your profile and collection pages.',
              'Correction: You can update your profile information at any time.',
              'Deletion: You can delete individual items from your collection or gallery at any time. To delete your entire account and all associated data, contact us.',
              'Portability: You can view and export your collection data at any time.',
              'Privacy control: You can make your profile private at any time in your profile settings.'
            ].map((item, i) => (
              <div key={i} style={styles.bulletItem}>
                <span style={styles.bullet}>•</span>
                <p style={styles.bulletText}>{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Children's Privacy</h2>
          <p style={styles.text}>
            BrickKeep is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe a child under 13 has provided us with personal information, please contact us and we will delete it promptly.
          </p>
        </div>

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Changes to This Policy</h2>
          <p style={styles.text}>
            We may update this privacy policy from time to time. When we do, we will update the "Last updated" date at the top of this page. Continued use of BrickKeep after changes constitutes acceptance of the updated policy.
          </p>
        </div>

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Contact</h2>
          <p style={styles.text}>
            If you have questions about this privacy policy or your data, please reach out via the feedback form.
          </p>
          <button
            style={styles.feedbackBtn}
            onClick={() => window.open('https://forms.gle/qfjWQNPVm7oCkqUB8', '_blank')}
          >
            Contact Us
          </button>
        </div>
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
    maxWidth: '640px',
    margin: '0 auto',
    padding: '24px',
    width: '100%'
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: Colors.yellow,
    fontSize: '16px',
    cursor: 'pointer',
    marginBottom: '16px',
    padding: 0
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: Colors.yellow,
    marginBottom: '8px',
    textAlign: 'center' as const
  },
  updated: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.4)',
    marginBottom: '24px',
    textAlign: 'center' as const
  },
  card: {
    backgroundColor: 'rgba(0,8,20,0.6)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '20px'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: Colors.yellow,
    marginBottom: '16px'
  },
  subheading: {
    fontSize: '15px',
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: '6px',
    marginTop: '16px'
  },
  text: {
    fontSize: '15px',
    color: 'rgba(255,255,255,0.8)',
    lineHeight: '1.7',
    marginBottom: '12px'
  },
  bulletList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '12px'
  },
  bulletItem: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start'
  },
  bullet: {
    color: Colors.yellow,
    fontSize: '16px',
    flexShrink: 0,
    marginTop: '2px'
  },
  bulletText: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.7)',
    lineHeight: '1.6'
  },
  thirdPartyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginTop: '8px'
  },
  thirdPartyItem: {
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    paddingBottom: '16px'
  },
  thirdPartyName: {
    fontSize: '15px',
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: '4px'
  },
  thirdPartyDesc: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.6)',
    lineHeight: '1.5',
    marginBottom: '6px'
  },
  thirdPartyLink: {
    color: Colors.yellow,
    fontSize: '13px',
    textDecoration: 'none'
  },
  feedbackBtn: {
    backgroundColor: Colors.yellow,
    color: Colors.text.onYellow,
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '8px'
  }
}