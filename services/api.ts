import Constants from 'expo-constants';
import { jwtDecode } from 'jwt-decode';
import { ValidationUtils, SecurityUtils } from '../utils/validation';

// Types for our API responses
interface LoginResponse {
    token: string;
    user: {
        id: number;
        email: string;
    };
}

interface RegisterResponse {
    token: string;
    user: {
        id: number;
        email: string;
    };
}

interface GroceryList {
    id: number;
    title: string;
    created_at: string;
    updated_at: string;
    items?: Item[];
}

interface Item {
    id: number;
    name: string;
    quantity: number;
    checked_at: string | null;
    created_at: string;
    updated_at: string;
}

interface CreateGroceryListRequest {
    title: string;
}

interface CreateItemRequest {
    name: string;
    quantity: number;
}

// Secure API configuration
const getApiUrl = (): string => {
    const configUrl = Constants.expoConfig?.extra?.apiUrl;

    if (configUrl) {
        if (__DEV__) {
            return configUrl; // Allow HTTP in development
        } else {
            return configUrl.replace(/^http:/, 'https:'); // Force HTTPS in production
        }
    }

    return __DEV__ ? 'http://localhost:3000/api/v1' : 'https://your-production-api.com/api/v1';
};

const API_URL = getApiUrl();

// Helper function for making authenticated API requests
async function fetchAPI(endpoint: string, options: RequestInit = {}, token?: string) {
    if (token) {
        const decoded_token = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (typeof decoded_token.exp === 'number' && decoded_token.exp < currentTime) {
            throw new Error('TOKEN_EXPIRED');
        }
    }
    try {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...options.headers as Record<string, string>,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const url = `${API_URL}${endpoint}`;

        // Use shared security utility
        SecurityUtils.requireSecureConnection(url);

        // Create timeout controller for React Native compatibility
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        const response = await fetch(url, {
            ...options,
            headers,
            signal: controller.signal,
        });

        // Clear timeout if request completes successfully
        clearTimeout(timeoutId);

        if (!response.ok) {
            let errorMessage = 'Something went wrong';

            try {
                const errorData = await response.json();
                if (errorData.title) {
                    errorMessage = `Title ${errorData.title[0]}`;
                } else if (errorData.name) {
                    errorMessage = `Name ${errorData.name[0]}`;
                } else {
                    errorMessage = errorData.message || errorData.error || 'Something went wrong';
                }

            } catch {
                errorMessage = response.statusText || errorMessage;
            }

            throw new Error(errorMessage);
        }

        return response.json();
    } catch (error) {
        if (__DEV__) {
            console.log('API Error:', error);
        } else {
            console.log('API request failed');
        }
        throw error;
    }
}

// Auth Functions - using shared validation
export async function loginUser(email: string, password: string): Promise<LoginResponse> {
    // Use shared validation utility (single source of truth)
    const emailValidation = ValidationUtils.validateEmail(email);
    if (!emailValidation.isValid) {
        throw new Error(emailValidation.error || 'Invalid email');
    }

    const passwordValidation = ValidationUtils.validatePassword(password);
    if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.error || 'Invalid password');
    }

    return fetchAPI('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            email: emailValidation.sanitized,
            password
        }),
    });
}

export async function registerUser(email: string, password: string): Promise<RegisterResponse> {
    // Use shared validation utility
    const emailValidation = ValidationUtils.validateEmail(email);
    if (!emailValidation.isValid) {
        throw new Error(emailValidation.error || 'Invalid email');
    }

    const passwordValidation = ValidationUtils.validatePassword(password);
    if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.error || 'Invalid password');
    }

    return fetchAPI('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
            email: emailValidation.sanitized,
            password
        }),
    });
}

// Grocery List Functions - using shared validation
export async function fetchGroceryLists(token: string): Promise<GroceryList[]> {
    if (!token) {
        throw new Error('Authentication required');
    }

    return fetchAPI('/grocery_lists', {
        method: 'GET',
    }, token);
}

export async function createGroceryList(data: CreateGroceryListRequest, token: string): Promise<GroceryList> {
    if (!token) {
        throw new Error('Authentication required');
    }

    const titleValidation = ValidationUtils.validateListTitle(data.title);
    if (!titleValidation.isValid) {
        throw new Error(titleValidation.error || 'Invalid title');
    }

    return fetchAPI('/grocery_lists', {
        method: 'POST',
        body: JSON.stringify({ title: titleValidation.sanitized }),
    }, token);
}

export async function createItem(listId: number, data: CreateItemRequest, token: string): Promise<Item> {
    if (!token) {
        throw new Error('Authentication required');
    }

    if (!listId || listId <= 0) {
        throw new Error('Invalid list ID');
    }

    if (!data.name || data.name.trim().length === 0) {
        throw new Error('Item name is required');
    }

    if (!data.quantity || data.quantity <= 0) {
        throw new Error('Quantity must be greater than 0');
    }

    return fetchAPI(`/grocery_lists/${listId}/items`, {
        method: 'POST',
        body: JSON.stringify({ 
            name: data.name.trim(),
            quantity: data.quantity 
        }),
    }, token);
}

export async function fetchGroceryListById(id: number, token: string): Promise<GroceryList> {
    if (!token) {
        throw new Error('Authentication required');
    }

    if (!id || id <= 0) {
        throw new Error('Invalid list ID');
    }

    return fetchAPI(`/grocery_lists/${id}`, {
        method: 'GET',
    }, token);
}

export async function fetchGroceryItems(listId: number, token: string): Promise<Item[]> {
    if (!token) {
        throw new Error('Authentication required');
    }

    if (!listId || listId <= 0) {
        throw new Error('Invalid list ID');
    }

    return fetchAPI(`/grocery_lists/${listId}/items`, {
        method: 'GET',
    }, token);
}

export async function updateItem(listId: number, itemId: number, data: Partial<Item>, token: string): Promise<Item> {
    if (!token) {
        throw new Error('Authentication required');
    }

    if (!listId || listId <= 0) {
        throw new Error('Invalid list ID');
    }

    if (!itemId || itemId <= 0) {
        throw new Error('Invalid item ID');
    }

    return fetchAPI(`/grocery_lists/${listId}/items/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }, token);
}

// Export types for use in components
export type {
    GroceryList,
    Item,
    CreateGroceryListRequest,
    CreateItemRequest,
    LoginResponse,
    RegisterResponse
};