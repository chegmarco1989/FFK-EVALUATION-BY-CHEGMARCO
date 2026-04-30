/**
 * =============================================================================
 * TYPE DEFINITIONS - FRONTEND
 * =============================================================================
 * Central type registry for the frontend application.
 * Defines all TypeScript interfaces and types used across components.
 */

// =============================================================================
// USER & AUTHENTICATION TYPES
// =============================================================================

/**
 * User profile data
 * Matches the backend UserProfile type
 */
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  birthDate: string;
  city: string;
  country: string;
  avatar: string;
  company: string;
  jobPosition: string;
  mobile: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * Authentication response from backend
 */
export interface AuthResponse {
  accessToken: string;
}

/**
 * Authentication context state
 */
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  error: string | null;
}

// =============================================================================
// UNSPLASH API TYPES
// =============================================================================

/**
 * Unsplash photo object
 * Based on Unsplash API v1 response
 */
export interface UnsplashPhoto {
  id: string;
  created_at: string;
  updated_at: string;
  width: number;
  height: number;
  color: string;
  blur_hash: string;
  description: string | null;
  alt_description: string | null;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  links: {
    self: string;
    html: string;
    download: string;
    download_location: string;
  };
  likes: number;
  liked_by_user: boolean;
  user: {
    id: string;
    username: string;
    name: string;
    first_name: string;
    last_name: string | null;
    portfolio_url: string | null;
    bio: string | null;
    location: string | null;
    total_likes: number;
    total_photos: number;
    total_collections: number;
    profile_image: {
      small: string;
      medium: string;
      large: string;
    };
    links: {
      self: string;
      html: string;
      photos: string;
      likes: string;
    };
  };
  views?: number;
  downloads?: number;
}

/**
 * Extended photo with local like state
 */
export interface Photo extends UnsplashPhoto {
  isLikedByCurrentUser: boolean;
  localLikes: number;
}

// =============================================================================
// GALLERY TYPES
// =============================================================================

/**
 * Gallery filter categories
 */
export type GalleryCategory =
  | 'All'
  | 'Animation'
  | 'Branding'
  | 'Illustration'
  | 'Mobile'
  | 'Print'
  | 'Product Design'
  | 'Typography'
  | 'Web Design';

/**
 * Sort options for gallery
 */
export type SortOption = 'Popular' | 'Latest' | 'Oldest' | 'Most Liked';

/**
 * Gallery context state
 */
export interface GalleryContextType {
  photos: Photo[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  category: GalleryCategory;
  sortBy: SortOption;
  setCategory: (category: GalleryCategory) => void;
  setSortBy: (sort: SortOption) => void;
  loadMore: () => Promise<void>;
  toggleLike: (photoId: string) => Promise<void>;
  refreshPhotos: () => Promise<void>;
}

// =============================================================================
// LIKE STORAGE TYPES
// =============================================================================

/**
 * Like data stored in IndexedDB
 */
export interface LikeData {
  photoId: string;
  userId: string;
  timestamp: number;
}

/**
 * Like storage key format
 * Format: "likes:{userId}:{photoId}"
 */
export type LikeStorageKey = `likes:${string}:${string}`;

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

/**
 * Standard API success response
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Standard API error response
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * API response union type
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// =============================================================================
// COMPONENT PROP TYPES
// =============================================================================

/**
 * Props for photo card component
 */
export interface PhotoCardProps {
  photo: Photo;
  onLike: (photoId: string) => void;
  priority?: boolean;
}

/**
 * Props for skeleton loader
 */
export interface SkeletonProps {
  count?: number;
  className?: string;
}

/**
 * Props for error boundary
 */
export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Extract promise return type
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

/**
 * Make specific properties required
 */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
