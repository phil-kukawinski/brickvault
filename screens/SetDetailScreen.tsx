import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RouteProp } from '@react-navigation/native'
import { RootStackParamList } from '../navigation'
import { supabase } from '../lib/supabase'
import { Colors } from '../lib/theme'

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SetDetail'>
  route: RouteProp<RootStackParamList, 'SetDetail'>
}

const CONDITIONS = ['sealed', 'built', 'partial', 'incomplete'] as const
type Condition = typeof CONDITIONS[number]

export default function SetDetailScreen({ navigation, route }: Props) {
  const { item } = route.params
  const [condition, setCondition] = useState<Condition>(item.condition ?? 'sealed')
  const [status, setStatus] = useState<'owned' | 'wishlist'>(item.status)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    const { error } = await supabase
      .from('collection')
      .update({ condition: status === 'owned' ? condition : null, status })
      .eq('id', item.id)
    setSaving(false)
    if (error) {
      Alert.alert('Error', error.message)
    } else {
      navigation.goBack()
    }
  }

  async function handleAddAnother() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('collection').insert({
      user_id: user.id,
      set_number: item.set_number,
      name: item.name,
      piece_count: item.piece_count,
      image_url: item.image_url,
      status: 'owned',
      condition: 'sealed'
    })
    setSaving(false)
    if (error) {
      Alert.alert('Error', error.message)
    } else {
      Alert.alert('Added!', 'Another copy has been added to your collection.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ])
    }
  }

  async function handleRemove() {
    Alert.alert('Remove set', `Remove this copy of ${item.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: async () => {
          const { error } = await supabase.from('collection').delete().eq('id', item.id)
          if (error) {
            Alert.alert('Error', error.message)
          } else {
            navigation.goBack()
          }
        }
      }
    ])
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      {item.image_url && (
        <Image source={{ uri: item.image_url }} style={styles.image} resizeMode="contain" />
      )}

      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.detail}>Set #{item.set_number}</Text>
      <Text style={styles.detail}>{item.piece_count} pieces</Text>

      <Text style={styles.sectionLabel}>Status</Text>
      <View style={styles.optionRow}>
        {(['owned', 'wishlist'] as const).map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.optionButton, status === s && styles.optionButtonActive]}
            onPress={() => setStatus(s)}
          >
            <Text style={[styles.optionText, status === s && styles.optionTextActive]}>
              {s === 'owned' ? '📦 Owned' : '⭐ Wishlist'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {status === 'owned' && (
        <>
          <Text style={styles.sectionLabel}>Condition</Text>
          <View style={styles.optionRow}>
            {CONDITIONS.map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.optionButton, condition === c && styles.optionButtonActive]}
                onPress={() => setCondition(c)}
              >
                <Text style={[styles.optionText, condition === c && styles.optionTextActive]}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
        {saving
          ? <ActivityIndicator color={Colors.text.onYellow} />
          : <Text style={styles.saveButtonText}>Save Changes</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity style={styles.addAnotherButton} onPress={handleAddAnother} disabled={saving}>
        <Text style={styles.addAnotherText}>+ Add Another Copy</Text>
      </TouchableOpacity>

      {status === 'wishlist' && (
        <>
          <TouchableOpacity
            style={styles.findStoreButton}
            onPress={() => {
              const { Linking } = require('react-native')
              Alert.alert('Shop', 'Where would you like to search?', [
                {
                  text: 'LEGO Store Online',
                  onPress: () => Linking.openURL('https://www.lego.com/en-us/')
                },
                {
                  text: 'LEGO Store Finder',
                  onPress: () => Linking.openURL('https://www.lego.com/en-us/stores')
                },
                {
                  text: 'Google Shopping',
                  onPress: () => Linking.openURL(`https://www.google.com/search?q=LEGO+${encodeURIComponent(item.name)}+set+${item.set_number}&tbm=shop`)
                },
                {
                  text: 'Amazon',
                  onPress: () => Linking.openURL(`https://www.amazon.com/s?k=LEGO+${encodeURIComponent(item.name)}`)
                },
                { text: 'Cancel', style: 'cancel' }
              ])
            }}
          >
            <Text style={styles.findStoreText}>🛒 Shop</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => {
              const { Share } = require('react-native')
              Share.share({
                message: `🧱 I'm looking to add to my LEGO collection!\n\nSet: ${item.name}\nSet #${item.set_number} · ${item.piece_count} pieces\n\nIf you have this or know where to find it, let me know!`
              })
            }}
          >
            <Text style={styles.shareText}>📤 Share</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity onPress={handleRemove} style={styles.removeButton}>
        <Text style={styles.removeText}>Remove this copy</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: Colors.navy,
    flexGrow: 1
  },
  backText: {
    color: Colors.yellow,
    fontSize: 16,
    marginBottom: 16
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 16,
    borderRadius: 12
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 4
  },
  detail: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.6,
    marginBottom: 2
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 10,
    color: Colors.white
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  optionButtonActive: {
    backgroundColor: Colors.yellow,
    borderColor: Colors.yellow
  },
  optionText: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.7
  },
  optionTextActive: {
    color: Colors.text.onYellow,
    fontWeight: 'bold',
    opacity: 1
  },
  saveButton: {
    backgroundColor: Colors.yellow,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 32
  },
  saveButtonText: {
    color: Colors.text.onYellow,
    fontSize: 16,
    fontWeight: 'bold'
  },
  addAnotherButton: {
    borderWidth: 1,
    borderColor: Colors.yellow,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 12
  },
  addAnotherText: {
    color: Colors.yellow,
    fontSize: 16,
    fontWeight: 'bold'
  },
  findStoreButton: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 12
  },
  findStoreText: {
    color: Colors.white,
    fontSize: 16,
    opacity: 0.8
  },
  shareButton: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 12
  },
  shareText: {
    color: Colors.white,
    fontSize: 16,
    opacity: 0.8
  },
  removeButton: {
    marginTop: 32,
    alignItems: 'center'
  },
  removeText: {
    color: Colors.white,
    opacity: 0.4,
    fontSize: 14
  }
})