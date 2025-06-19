import { useState } from 'react';
import { TouchableOpacity, ActivityIndicator } from 'react-native';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { useAuth } from '../../context/AuthContext';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function TabLayout() {
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
  };

  return (
    <ProtectedRoute>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
          headerShown: true,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            headerShown: false,
            title: 'Grocery Lists',
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="shopping-cart" size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </ProtectedRoute>
  );
}