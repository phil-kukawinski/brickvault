import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import LoginScreen from './screens/LoginScreen'
import RegisterScreen from './screens/RegisterScreen'
import HomeScreen from './screens/HomeScreen'
import CollectionScreen from './screens/CollectionScreen'
import ScanScreen from './screens/ScanScreen'
import ProfileScreen from './screens/ProfileScreen'
import SearchHistoryScreen from './screens/SearchHistoryScreen'
import LandingScreen from './screens/LandingScreen'

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
      <Route path="/" element={session ? <HomeScreen /> : <LandingScreen />} />
      <Route path="/login" element={!session ? <LoginScreen /> : <Navigate to="/" />} />
      <Route path="/register" element={!session ? <RegisterScreen /> : <Navigate to="/" />} />
      <Route path="/collection" element={session ? <CollectionScreen /> : <Navigate to="/" />} />
      <Route path="/scan" element={session ? <ScanScreen /> : <Navigate to="/" />} />
      <Route path="/profile" element={session ? <ProfileScreen /> : <Navigate to="/" />} />
      <Route path="/history" element={session ? <SearchHistoryScreen /> : <Navigate to="/" />} />
    </Routes>
  )
}

export default App