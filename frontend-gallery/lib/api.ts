/**
 * =============================================================================
 * API CLIENT
 * =============================================================================
 * Centralized API client for backend and Unsplash API calls.
 * Handles authentication, error handling, and request/response formatting.
 */

import {
  API_BASE_URL,
  UNSPLASH_API_URL,
  UNSPLASH_ACCESS_KEY,
  STORAGE_KEYS,
  IMAGES_PER_PAGE,
} from './constants';
import type {
  LoginCredentials,
  AuthResponse,
  User,
  UnsplashPhoto,
  ApiResponse,
} from '@/types';

// =============================================================================
// AUTHENTICATION API
// =============================================================================

/**
 * Login user with credentials
 * 
 * @param credentials - Username and password
 * @returns Authentication response with token
 * @throws Error if login fails
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  
  const data = await response.json() as ApiResponse<AuthResponse>;
  
  if (!response.ok || !data.success) {
    const error = 'error' in data ? data.error.message : 'Login failed';
    throw new Error(error);
  }
  
  return data.data;
}

/**
 * Get current user profile
 * Requires authentication token
 * 
 * @returns User profile
 * @throws Error if request fails
 */
export async function getCurrentUser(): Promise<User> {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  
  if (!token) {
    throw new Error('No authentication token');
  }
  
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  const data = await response.json() as ApiResponse<User>;
  
  if (!response.ok || !data.success) {
    const error = 'error' in data ? data.error.message : 'Failed to fetch user';
    throw new Error(error);
  }
  
  return data.data;
}

// =============================================================================
// UNSPLASH API
// =============================================================================

/**
 * Fetch photos from Unsplash
 * 
 * @param page - Page number (1-indexed)
 * @param query - Search query
 * @param orderBy - Sort order
 * @returns Array of photos
 * @throws Error if request fails
 */
export async function fetchUnsplashPhotos(
  page: number = 1,
  query: string = 'creative design',
  orderBy: string = 'popular'
): Promise<UnsplashPhoto[]> {
  if (!UNSPLASH_ACCESS_KEY) {
    throw new Error('Unsplash API key not configured');
  }
  
  const url = new URL(`${UNSPLASH_API_URL}/search/photos`);
  url.searchParams.append('query', query);
  url.searchParams.append('page', page.toString());
  url.searchParams.append('per_page', IMAGES_PER_PAGE.toString());
  url.searchParams.append('order_by', orderBy);
  
  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
    },
  });
  
  if (!response.ok) {
    throw new Error(`Unsplash API error: ${response.statusText}`);
  }
  
  const data = await response.json() as { results: UnsplashPhoto[] };
  return data.results;
}

/**
 * Trigger download tracking for Unsplash photo
 * Required by Unsplash API guidelines
 * 
 * @param downloadLocation - Download location URL from photo object
 */
export async function triggerUnsplashDownload(downloadLocation: string): Promise<void> {
  if (!UNSPLASH_ACCESS_KEY) return;
  
  try {
    await fetch(downloadLocation, {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    });
  } catch (error) {
    console.error('Failed to trigger download tracking:', error);
  }
}
