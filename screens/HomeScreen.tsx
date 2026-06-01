import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image
} from 'react-native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation'
import { supabase } from '../lib/supabase'
import { Colors } from '../lib/theme'

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>
}

export default function HomeScreen({ navigation }: Props) {
  const [username, setUsername] = useState('')

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single()
        if (data) setUsername(data.username)
      }
    }
    fetchProfile()
  }, [])

  async function handleSignOut() {
    Alert.alert('Sign out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out', style: 'destructive', onPress: async () => {
          await supabase.auth.signOut()
          navigation.replace('Login')
        }
      }
    ])
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.welcome}>Welcome back, {username || '...'}!</Text>
      </View>

      <View style={styles.grid}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Collection')}
        >
          <Text style={styles.cardIcon}>📦</Text>
          <Text style={styles.cardTitle}>My Collection</Text>
          <Text style={styles.cardSubtitle}>View your sets</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Scan')}
        >
          <Text style={styles.cardIcon}>🔍</Text>
          <Text style={styles.cardTitle}>Add a Set</Text>
          <Text style={styles.cardSubtitle}>Search or scan</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Your Vault</Text>
          <Text style={styles.statValue}>Track, collect,{'\n'}and share.</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.navy
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center'
  },
  logo: {
    width: 220,
    height: 110,
    marginBottom: 8
  },
  welcome: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.8
  },
  grid: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 16
  },
  card: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center'
  },
  cardIcon: {
    fontSize: 40,
    marginBottom: 12
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 4,
    textAlign: 'center'
  },
  cardSubtitle: {
    fontSize: 13,
    color: Colors.white,
    opacity: 0.6,
    textAlign: 'center'
  },
  statsRow: {
    paddingHorizontal: 24,
    marginTop: 24
  },
  statCard: {
    backgroundColor: Colors.yellow,
    borderRadius: 16,
    padding: 24
  },
  statLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.text.onYellow,
    opacity: 0.7,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.onYellow
  },
  signOutButton: {
    position: 'absolute',
    bottom: 48,
    left: 24,
    right: 24,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center'
  },
  signOutText: {
    color: Colors.yellow,
    fontSize: 16,
    opacity: 0.8
  }
})