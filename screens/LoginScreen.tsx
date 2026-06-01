import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image
} from 'react-native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation'
import { supabase } from '../lib/supabase'
import { Colors } from '../lib/theme'

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>
}

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      Alert.alert('Login failed', error.message)
    } else {
      navigation.replace('Home')
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>BrickVault</Text>
        <Text style={styles.subtitle}>Your LEGO collection, organized.</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={Colors.mediumGray}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={Colors.mediumGray}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading
            ? <ActivityIndicator color={Colors.text.onYellow} />
            : <Text style={styles.buttonText}>Sign In</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>Don't have an account? Register</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.navy,
    justifyContent: 'center',
    paddingHorizontal: 32
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.yellow,
    marginBottom: 8
  },
  subtitle: {
    fontSize: 15,
    color: Colors.text.onNavy,
    opacity: 0.7
  },
  form: {
    width: '100%'
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    color: Colors.white
  },
  button: {
    backgroundColor: Colors.yellow,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16
  },
  buttonText: {
    color: Colors.text.onYellow,
    fontSize: 16,
    fontWeight: 'bold'
  },
  link: {
    color: Colors.yellow,
    textAlign: 'center',
    fontSize: 14,
    opacity: 0.9
  }
})