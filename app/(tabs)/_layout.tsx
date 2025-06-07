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
            title: 'Grocery Lists',
            headerRight: () => (
              <TouchableOpacity
                onPress={handleLogout}
                disabled={isLoggingOut}
                style={{ marginRight: 15, padding: 8 }}
              >
                {isLoggingOut ? (
                  <ActivityIndicator size="small" color="#007AFF" />
                ) : (
                  <MaterialIcons name="logout" size={24} color="#007AFF" />
                )}
              </TouchableOpacity>
            ),
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="shopping-cart" size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </ProtectedRoute>
  );
} 