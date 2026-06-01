import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation'
import { supabase } from '../lib/supabase'
import { Colors } from '../lib/theme'

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Collection'>
}

type CollectionItem = {
  id: string
  set_number: string
  name: string
  piece_count: number
  image_url: string
  status: 'owned' | 'wishlist'
  complete: boolean
  condition: 'sealed' | 'built' | 'partial' | 'incomplete'
  added_at: string
}

export default function CollectionScreen({ navigation }: Props) {
  const [items, setItems] = useState<CollectionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'owned' | 'wishlist'>('all')

  useFocusEffect(
    useCallback(() => {
      fetchCollection()
    }, [])
  )

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
    if (error) {
      Alert.alert('Error', error.message)
    } else {
      setItems(data || [])
    }
  }

  const filtered = filter === 'all' ? items : items.filter(i => i.status === filter)

  function renderItem({ item }: { item: CollectionItem }) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('SetDetail', { item })}
      >
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>🧱</Text>
          </View>
        )}
        <View style={styles.cardContent}>
          <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.cardDetail}>#{item.set_number}</Text>
          <Text style={styles.cardDetail}>{item.piece_count} pieces</Text>
          <View style={styles.cardFooter}>
            <View style={[styles.badge, item.status === 'owned' ? styles.badgeOwned : styles.badgeWishlist]}>
              <Text style={[styles.badgeText, item.status === 'owned' ? styles.badgeTextOwned : styles.badgeTextWishlist]}>
                {item.status === 'owned' ? '📦 Owned' : '⭐ Wishlist'}
              </Text>
            </View>
            {item.condition && (
              <View style={styles.conditionBadge}>
                <Text style={styles.conditionBadgeText}>{item.condition}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>My Collection</Text>
            <Text style={styles.count}>{filtered.length} sets</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('Scan')}
          >
            <Text style={styles.addButtonText}>+ Add Set</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterRow}>
        {(['all', 'owned', 'wishlist'] as const).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, filter === f && styles.filterButtonActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.yellow} />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No sets here yet!</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Scan')}>
            <Text style={styles.link}>Add a set to get started</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
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
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)'
  },
  backText: {
    color: Colors.yellow,
    fontSize: 16,
    marginBottom: 8
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white
  },
  count: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.6,
    marginTop: 4
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4
  },
  addButton: {
    backgroundColor: Colors.yellow,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  addButtonText: {
    color: Colors.text.onYellow,
    fontWeight: 'bold',
    fontSize: 15
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  filterButtonActive: {
    backgroundColor: Colors.yellow,
    borderColor: Colors.yellow
  },
  filterText: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.7
  },
  filterTextActive: {
    color: Colors.text.onYellow,
    fontWeight: 'bold',
    opacity: 1
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyText: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.6,
    marginBottom: 12
  },
  link: {
    color: Colors.yellow,
    fontSize: 15
  },
  list: {
    padding: 16
  },
  card: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden'
  },
  image: {
    width: 100,
    height: 100
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)'
  },
  imagePlaceholderText: {
    fontSize: 32
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between'
  },
  cardName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 4
  },
  cardDetail: {
    fontSize: 13,
    color: Colors.white,
    opacity: 0.6
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  badgeOwned: {
    backgroundColor: 'rgba(251,224,45,0.15)'
  },
  badgeWishlist: {
    backgroundColor: 'rgba(255,255,255,0.1)'
  },
  badgeText: {
    fontSize: 12
  },
  badgeTextOwned: {
    color: Colors.yellow
  },
  badgeTextWishlist: {
    color: Colors.white
  },
  conditionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)'
  },
  conditionBadgeText: {
    fontSize: 12,
    color: Colors.white,
    opacity: 0.7
  }
})