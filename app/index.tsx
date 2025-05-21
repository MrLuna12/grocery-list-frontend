import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function AuthRedirect() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null; // or a loading screen
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)" />;
} 