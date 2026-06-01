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
  Alert
} from 'react-native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation'
import { supabase } from '../lib/supabase'
import { Colors } from '../lib/theme'

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Register'>
}

export default function RegisterScreen({ navigation }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister() {
    if (!username.trim()) {
      Alert.alert('Username required', 'Please enter a username.')
      return
    }
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setLoading(false)
      Alert.alert('Registration failed', error.message)
      return
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ id: data.user.id, username: username.trim() })

      setLoading(false)

      if (profileError) {
        Alert.alert('Profile error', profileError.message)
      } else {
        Alert.alert('Success!', 'Account created. Please check your email to confirm your account.', [
          { text: 'OK', onPress: () => navigation.replace('Login') }
        ])
      }
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.logoContainer}>
        <Text style={styles.title}>BrickVault</Text>
        <Text style={styles.subtitle}>Create your account</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor={Colors.mediumGray}
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />
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

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          {loading
            ? <ActivityIndicator color={Colors.text.onYellow} />
            : <Text style={styles.buttonText}>Create Account</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.replace('Login')}>
          <Text style={styles.link}>Already have an account? Sign in</Text>
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