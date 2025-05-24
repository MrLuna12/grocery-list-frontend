import React, { useEffect } from 'react'; 
import { useAuth } from '../context/AuthContext';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!user) {
        return <Redirect href="/(auth)/login" />;
    }

    return <>{children}</>;
}