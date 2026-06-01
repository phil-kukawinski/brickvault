import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import LoginScreen from '../screens/LoginScreen'
import RegisterScreen from '../screens/RegisterScreen'
import HomeScreen from '../screens/HomeScreen'
import ScanScreen from '../screens/ScanScreen'
import CollectionScreen from '../screens/CollectionScreen'
import SetDetailScreen from '../screens/SetDetailScreen'

export type RootStackParamList = {
  Login: undefined
  Register: undefined
  Home: undefined
  Scan: undefined
  Collection: undefined
  SetDetail: { item: {
    id: string
    set_number: string
    name: string
    piece_count: number
    image_url: string
    status: 'owned' | 'wishlist'
    condition: 'sealed' | 'built' | 'partial' | 'incomplete'
    complete: boolean
    added_at: string
  }}
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Scan" component={ScanScreen} />
        <Stack.Screen name="Collection" component={CollectionScreen} />
        <Stack.Screen name="SetDetail" component={SetDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}