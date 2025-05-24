import { FontAwesome } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { ProtectedRoute } from '../../components/ProtectedRoute';

export default function TabLayout() {
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
          tabBarIcon: ({ color }) => (
            <FontAwesome name="shopping-basket" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
    </ProtectedRoute>
  );
} 