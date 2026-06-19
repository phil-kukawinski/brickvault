import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import LoginScreen from './screens/LoginScreen'
import RegisterScreen from './screens/RegisterScreen'
import CollectionScreen from './screens/CollectionScreen'
import ScanScreen from './screens/ScanScreen'
import ProfileScreen from './screens/ProfileScreen'
import SearchHistoryScreen from './screens/SearchHistoryScreen'
import LandingScreen from './screens/LandingScreen'
import BottomNav from './components/BottomNav'
import PublicProfileScreen from './screens/PublicProfileScreen'
import AboutScreen from './screens/AboutScreen'
import PrivacyScreen from './screens/PrivacyScreen'
import HomeScreen from './screens/HomeScreen'
import ResetPasswordScreen from './screens/ResetPasswordScreen'
import SetScreen from './screens/SetScreen'

function App() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#001B3D' }}>
        <div style={{ color: '#FBE02D', fontSize: 24 }}>Loading...</div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={!session ? <LandingScreen /> : <><HomeScreen /><BottomNav /></>} />
      <Route path="/login" element={!session ? <LoginScreen /> : <Navigate to="/" />} />
      <Route path="/register" element={!session ? <RegisterScreen /> : <Navigate to="/" />} />
      <Route path="/collection" element={session ? <><CollectionScreen /><BottomNav /></> : <Navigate to="/" />} />
      <Route path="/scan" element={session ? <><ScanScreen /><BottomNav /></> : <Navigate to="/" />} />
      <Route path="/profile" element={session ? <><ProfileScreen /><BottomNav /></> : <Navigate to="/" />} />
      <Route path="/u/:username" element={<PublicProfileScreen />} />
      <Route path="/history" element={session ? <><SearchHistoryScreen /><BottomNav /></> : <Navigate to="/" />} />
      <Route path="/about" element={<AboutScreen />} />
      <Route path="/privacy" element={<PrivacyScreen />} />
      <Route path="/reset-password" element={<ResetPasswordScreen />} />
      <Route path="/set/:setNum" element={<SetScreen />} />
    </Routes>
  )
}

export default App