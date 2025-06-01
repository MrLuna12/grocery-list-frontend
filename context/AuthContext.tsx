import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { loginUser, registerUser } from '../services/api';
import { ValidationUtils } from '../utils/validation';

interface User {
    id: number;
    email: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    getToken: () => Promise<string | null>;
}

const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        checkStoredAuth();
    }, []);

    const checkStoredAuth = async () => {
        try {
            const storedToken = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
            const storedUserData = await SecureStore.getItemAsync(USER_DATA_KEY);
            
            if (storedToken && storedUserData) {
                const userData = JSON.parse(storedUserData);
                setUser(userData);
            }
        } catch (error) {
            console.log('Error checking stored auth');
            await clearAuthData();
        } finally {
            setIsLoading(false);
        }
    };

    const storeAuthData = async (authToken: string, userData: User) => {
        try {
            await SecureStore.setItemAsync(AUTH_TOKEN_KEY, authToken);
            await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(userData));
            setUser(userData);
        } catch (error) {
            throw new Error('Failed to store authentication data securely');
        }
    };

    const clearAuthData = async () => {
        try {
            await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
            await SecureStore.deleteItemAsync(USER_DATA_KEY);
            setUser(null);
        } catch (error) {
            console.log('Error clearing auth data');
        }
    };

    const getToken = async (): Promise<string | null> => {
        try {
            return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
        } catch (error) {
            return null;
        }
    };

    // Login with validation - but using shared validation utils
    const login = async (email: string, password: string) => {
        try {
            setIsLoading(true);
            setError(null);

            // Use shared validation (single source of truth)
            const emailValidation = ValidationUtils.validateEmail(email);
            if (!emailValidation.isValid) {
                throw new Error(emailValidation.error);
            }

            const passwordValidation = ValidationUtils.validatePassword(password);
            if (!passwordValidation.isValid) {
                throw new Error(passwordValidation.error);
            }

            // API call handles its own validation too (defense in depth)
            const response = await loginUser(emailValidation.sanitized, password);
            await storeAuthData(response.token, response.user);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Login failed';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (email: string, password: string) => {
        try {
            setIsLoading(true);
            setError(null);

            // Use shared validation
            const emailValidation = ValidationUtils.validateEmail(email);
            if (!emailValidation.isValid) {
                throw new Error(emailValidation.error);
            }

            const passwordValidation = ValidationUtils.validatePassword(password);
            if (!passwordValidation.isValid) {
                throw new Error(passwordValidation.error);
            }

            const response = await registerUser(emailValidation.sanitized, password);
            await storeAuthData(response.token, response.user);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Registration failed';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        await clearAuthData();
        setError(null);
    };

    const value = {
        user,
        isLoading,
        error,
        login,
        register,
        logout,
        getToken,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}