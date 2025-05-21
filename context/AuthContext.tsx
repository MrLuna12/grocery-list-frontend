import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from '../services/api';

//Define the shape of our user
interface User {
    id: string;
    email: string;
}

// Define the shape of our context
interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Login Function
    const login = async (email: string, password: string) => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await loginUser(email, password);
            setUser(response.user);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Register function
    const register = async (email: string, password: string) => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await registerUser(email, password);
            setUser(response.user);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Logout function
    const logout = () => {
        setUser(null);
        setError(null);
    };

    // Create the value object that will be provided to consumers
    const value = {
        user,
        isLoading,
        error,
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Create a custom hook to use the auth context
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}