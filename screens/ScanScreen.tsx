import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  TextInput
} from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation'
import { fetchSetByBarcode, fetchSetBySetNum, LegoSet, searchSets } from '../lib/rebrickable'
import { supabase } from '../lib/supabase'
import { Colors } from '../lib/theme'

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Scan'>
}

export default function ScanScreen({ navigation }: Props) {
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(false)
  const [loading, setLoading] = useState(false)
  const [foundSet, setFoundSet] = useState<LegoSet | null>(null)
  const [manualMode, setManualMode] = useState(true)
  const [manualInput, setManualInput] = useState('')
  const [searchResults, setSearchResults] = useState<LegoSet[]>([])
  const [searching, setSearching] = useState(false)
  const [condition, setCondition] = useState<'sealed' | 'built' | 'partial' | 'incomplete'>('sealed')
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function handleBarCodeScanned({ data }: { data: string }) {
    setScanned(true)
    setLoading(true)
    setFoundSet(null)
    const set = await fetchSetByBarcode(data)
    setLoading(false)
    if (set) {
      setFoundSet(set)
    } else {
      Alert.alert(
        'Set not found',
        `No LEGO set found for barcode: ${data}`,
        [{ text: 'Scan Again', onPress: () => setScanned(false) }]
      )
    }
  }

  const handleManualSearch = async () => {
    if (!manualInput.trim()) return
    setSearching(true)
    setSearchResults([])
    setFoundSet(null)

    const bySetNum = await fetchSetBySetNum(
      manualInput.includes('-') ? manualInput : `${manualInput}-1`
    )
    if (bySetNum) {
      setSearching(false)
      setFoundSet(bySetNum)
      return
    }

    const results = await searchSets(manualInput)
    setSearching(false)
    setSearchResults(results)
  }

  useEffect(() => {
    if (!manualInput.trim()) {
      setSearchResults([])
      setFoundSet(null)
      return
    }
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      handleManualSearch()
    }, 500)
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [manualInput])

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
    if (error) {
      Alert.alert('Error', error.message)
    } else {
      resetAll()
      navigation.replace('Collection')
    }
  }

  function resetAll() {
    setFoundSet(null)
    setScanned(false)
    setManualInput('')
    setSearchResults([])
    setCondition('sealed')
  }

  function renderSetResult(set: LegoSet, onSearchAgain: () => void, searchAgainLabel: string) {
    return (
      <ScrollView contentContainerStyle={styles.resultContainer}>
        <Text style={styles.resultTitle}>Set Found!</Text>
        {set.set_img_url && (
          <Image source={{ uri: set.set_img_url }} style={styles.setImage} resizeMode="contain" />
        )}
        <Text style={styles.setName}>{set.name}</Text>
        <Text style={styles.setDetail}>Set #{set.set_num}</Text>
        <Text style={styles.setDetail}>{set.num_parts} pieces · {set.year}</Text>

        <TouchableOpacity style={styles.button} onPress={() => addToCollection('owned')}>
          <Text style={styles.buttonText}>📦 Add to Collection</Text>
        </TouchableOpacity>

        <Text style={styles.conditionLabel}>Condition</Text>
        <View style={styles.conditionRow}>
          {(['sealed', 'built', 'partial', 'incomplete'] as const).map(c => (
            <TouchableOpacity
              key={c}
              style={[styles.conditionButton, condition === c && styles.conditionButtonActive]}
              onPress={() => setCondition(c)}
            >
              <Text style={[styles.conditionButtonText, condition === c && styles.conditionButtonTextActive]}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[styles.button, styles.wishlistButton]} onPress={() => addToCollection('wishlist')}>
          <Text style={[styles.buttonText, styles.wishlistButtonText]}>⭐ Add to Wishlist</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onSearchAgain}>
          <Text style={styles.link}>{searchAgainLabel}</Text>
        </TouchableOpacity>
      </ScrollView>
    )
  }

  // --- Manual Mode (default) ---
  if (manualMode) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { resetAll(); navigation.goBack() }}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add a Set</Text>
        </View>

        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Set number or name (e.g. 42151 or Bugatti)"
            placeholderTextColor={Colors.mediumGray}
            value={manualInput}
            onChangeText={setManualInput}
            onSubmitEditing={handleManualSearch}
            returnKeyType="search"
            autoFocus
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleManualSearch}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.scanToggle} onPress={() => setManualMode(false)}>
          <Text style={styles.scanToggleText}>📷 Scan a barcode instead</Text>
        </TouchableOpacity>

        {searching && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={Colors.yellow} />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        )}

        {foundSet && !searching && renderSetResult(foundSet, resetAll, 'Search again')}

        {searchResults.length > 0 && !foundSet && !searching && (
          <ScrollView>
            {searchResults.map(set => (
              <TouchableOpacity
                key={set.set_num}
                style={styles.resultRow}
                onPress={() => setFoundSet(set)}
              >
                {set.set_img_url && (
                  <Image source={{ uri: set.set_img_url }} style={styles.rowImage} resizeMode="contain" />
                )}
                <View style={styles.rowContent}>
                  <Text style={styles.rowName} numberOfLines={2}>{set.name}</Text>
                  <Text style={styles.rowDetail}>#{set.set_num} · {set.num_parts} pcs · {set.year}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {!searching && !foundSet && searchResults.length === 0 && manualInput.length > 0 && (
          <View style={styles.centered}>
            <Text style={styles.errorText}>No results found. Try a different search.</Text>
          </View>
        )}
      </View>
    )
  }

  // --- Camera Mode ---
  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.yellow} />
      </View>
    )
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setManualMode(true)}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan a Set</Text>
        </View>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Camera permission is required to scan sets.</Text>
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.cameraContainer}>
      {!scanned && !loading && !foundSet && (
        <>
          <CameraView
            style={StyleSheet.absoluteFill}
            onBarcodeScanned={handleBarCodeScanned}
            barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a'] }}
          />
          <View style={styles.overlay}>
            <Text style={styles.overlayTitle}>Scan a LEGO Set</Text>
            <View style={styles.scanWindow} />
            <Text style={styles.overlayHint}>Point at the barcode on the box</Text>
            <TouchableOpacity style={styles.manualButton} onPress={() => setManualMode(true)}>
              <Text style={styles.manualButtonText}>Search manually instead</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.backButton} onPress={() => setManualMode(true)}>
            <Text style={styles.backButtonText}>✕ Cancel</Text>
          </TouchableOpacity>
        </>
      )}

      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.yellow} />
          <Text style={styles.loadingText}>Looking up set...</Text>
        </View>
      )}

      {foundSet && !loading && renderSetResult(foundSet, () => setScanned(false), 'Scan another set')}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.navy
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000'
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white
  },
  searchRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 8
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: Colors.white
  },
  searchButton: {
    backgroundColor: Colors.yellow,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center'
  },
  searchButtonText: {
    color: Colors.text.onYellow,
    fontWeight: 'bold',
    fontSize: 15
  },
  scanToggle: {
    alignSelf: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20
  },
  scanToggleText: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.7
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  overlayTitle: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 32
  },
  scanWindow: {
    width: 260,
    height: 260,
    borderWidth: 3,
    borderColor: Colors.yellow,
    borderRadius: 16,
    marginBottom: 32
  },
  overlayHint: {
    color: Colors.white,
    opacity: 0.7,
    fontSize: 14,
    marginBottom: 24
  },
  manualButton: {
    borderWidth: 1,
    borderColor: Colors.yellow,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10
  },
  manualButtonText: {
    color: Colors.yellow,
    fontSize: 14
  },
  backButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20
  },
  backButtonText: {
    color: Colors.white,
    fontSize: 16
  },
  resultContainer: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 32,
    backgroundColor: Colors.navy
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: Colors.yellow
  },
  setImage: {
    width: 240,
    height: 180,
    marginBottom: 16
  },
  setName: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: Colors.white
  },
  setDetail: {
    fontSize: 15,
    color: Colors.white,
    opacity: 0.6,
    marginBottom: 4
  },
  button: {
    backgroundColor: Colors.yellow,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    width: '100%',
    marginTop: 24
  },
  buttonText: {
    color: Colors.text.onYellow,
    fontSize: 16,
    fontWeight: 'bold'
  },
  wishlistButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.yellow,
    marginTop: 12
  },
  wishlistButtonText: {
    color: Colors.yellow
  },
  link: {
    color: Colors.yellow,
    fontSize: 14,
    marginTop: 20,
    textAlign: 'center',
    opacity: 0.8
  },
  errorText: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.6,
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 24
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.white,
    opacity: 0.7
  },
  resultRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center'
  },
  rowImage: {
    width: 72,
    height: 72,
    marginRight: 12
  },
  rowContent: {
    flex: 1
  },
  rowName: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
    color: Colors.white
  },
  rowDetail: {
    fontSize: 13,
    color: Colors.white,
    opacity: 0.6
  },
  conditionLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    alignSelf: 'flex-start',
    color: Colors.white
  },
  conditionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignSelf: 'flex-start'
  },
  conditionButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  conditionButtonActive: {
    backgroundColor: Colors.yellow,
    borderColor: Colors.yellow
  },
  conditionButtonText: {
    fontSize: 13,
    color: Colors.white,
    opacity: 0.7
  },
  conditionButtonTextActive: {
    color: Colors.text.onYellow,
    fontWeight: 'bold',
    opacity: 1
  }
})