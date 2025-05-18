import Constants from 'expo-constants';

// Types for our API responses
interface LoginResponse {
    token: string;
    user: {
        id: string;
        email: string;
    };
}

interface RegisterResponse {
    token: string;
    user: {
        id: string;
        email: string;
    };
}

// Base API configuration
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000/api/v1';

// Helper function for making API request
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Something went wrong');
    }

    return response.json();
}

// Login Function
export async function loginUser(email: string, password: string): Promise<LoginResponse> {
    return fetchAPI('/auth/login', {
        method: 'Post',
        body: JSON.stringify({ email, password }),
    });
}

// Register Function
export async function registerUser(email: string, password: string): Promise<RegisterResponse> {
    return fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }
