/**
 * =============================================================================
 * APPLICATION CONSTANTS
 * =============================================================================
 * Centralized constants used throughout the application.
 * Makes configuration changes easier and prevents magic strings/numbers.
 */

import { GalleryCategory, SortOption } from '@/types';

// =============================================================================
// API CONFIGURATION
// =============================================================================

/**
 * Backend API base URL
 * Configured via environment variable
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9090/api';

/**
 * Unsplash API configuration
 */
export const UNSPLASH_API_URL = 'https://api.unsplash.com';
export const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || '';

/**
 * Number of images to load per page
 */
export const IMAGES_PER_PAGE = parseInt(
  process.env.NEXT_PUBLIC_IMAGES_PER_PAGE || '20',
  10
);

// =============================================================================
// AUTHENTICATION
// =============================================================================

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  THEME: 'theme_preference',
} as const;

/**
 * Test credentials for login page
 * As per specification
 */
export const TEST_CREDENTIALS = {
  VALID_USER_1: { username: 'muser1', password: 'mpassword1' },
  VALID_USER_2: { username: 'muser2', password: 'mpassword2' },
  BLOCKED_USER: { username: 'muser3', password: 'mpassword3' },
} as const;

// =============================================================================
// GALLERY CONFIGURATION
// =============================================================================

/**
 * Available gallery categories
 * These map to Unsplash search queries
 */
export const GALLERY_CATEGORIES: readonly GalleryCategory[] = [
  'All',
  'Animation',
  'Branding',
  'Illustration',
  'Mobile',
  'Print',
  'Product Design',
  'Typography',
  'Web Design',
] as const;

/**
 * Category to Unsplash query mapping
 * Maps our categories to Unsplash search terms
 */
export const CATEGORY_QUERY_MAP: Record<GalleryCategory, string> = {
  'All': 'creative design',
  'Animation': 'animation motion graphics',
  'Branding': 'branding logo design',
  'Illustration': 'illustration art',
  'Mobile': 'mobile app ui',
  'Print': 'print design poster',
  'Product Design': 'product design',
  'Typography': 'typography lettering',
  'Web Design': 'web design ui ux',
};

/**
 * Available sort options
 */
export const SORT_OPTIONS: readonly SortOption[] = [
  'Popular',
  'Latest',
  'Oldest',
  'Most Liked',
] as const;

/**
 * Sort option to Unsplash order_by mapping
 */
export const SORT_ORDER_MAP: Record<SortOption, string> = {
  'Popular': 'popular',
  'Latest': 'latest',
  'Oldest': 'oldest',
  'Most Liked': 'popular',
};

// =============================================================================
// UI CONFIGURATION
// =============================================================================

/**
 * Breakpoints for responsive design
 * Matches Tailwind CSS breakpoints
 */
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

/**
 * Number of columns in masonry grid per breakpoint
 */
export const MASONRY_COLUMNS = {
  MOBILE: 2,
  TABLET: 3,
  DESKTOP: 5,
} as const;

/**
 * Animation durations (in milliseconds)
 */
export const ANIMATION_DURATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
} as const;

/**
 * Debounce delays (in milliseconds)
 */
export const DEBOUNCE_DELAY = {
  SEARCH: 300,
  SCROLL: 150,
  RESIZE: 200,
} as const;

// =============================================================================
// BADGE TYPES
// =============================================================================

/**
 * User badge types for gallery
 * Displayed next to author names
 */
export const BADGE_TYPES = ['TEAM', 'PRO', 'BOOSTED'] as const;
export type BadgeType = typeof BADGE_TYPES[number];

/**
 * Badge colors
 */
export const BADGE_COLORS: Record<BadgeType, string> = {
  TEAM: 'bg-blue-100 text-blue-700',
  PRO: 'bg-purple-100 text-purple-700',
  BOOSTED: 'bg-amber-100 text-amber-700',
};

// =============================================================================
// ERROR MESSAGES
// =============================================================================

/**
 * User-friendly error messages
 */
export const ERROR_MESSAGES = {
  // Authentication errors
  INVALID_CREDENTIALS: 'Informations de connexion invalides',
  ACCOUNT_BLOCKED: 'Ce compte a été bloqué.',
  NETWORK_ERROR: 'Erreur de connexion. Veuillez réessayer.',
  SESSION_EXPIRED: 'Votre session a expiré. Veuillez vous reconnecter.',

  // Gallery errors
  FAILED_TO_LOAD_IMAGES: 'Impossible de charger les images. Veuillez réessayer.',
  FAILED_TO_LIKE: 'Impossible d\'aimer cette photo. Veuillez réessayer.',
  NO_MORE_IMAGES: 'Plus d\'images à charger.',

  // Generic errors
  SOMETHING_WENT_WRONG: 'Une erreur est survenue. Veuillez réessayer.',
  REQUIRED_FIELD: 'Ce champ est requis.',
} as const;

// =============================================================================
// SUCCESS MESSAGES
// =============================================================================

/**
 * User-friendly success messages
 */
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Connexion réussie !',
  LOGOUT_SUCCESS: 'Déconnexion réussie.',
  LIKE_ADDED: 'Photo ajoutée aux favoris.',
  LIKE_REMOVED: 'Photo retirée des favoris.',
} as const;

// =============================================================================
// ROUTES
// =============================================================================

/**
 * Application routes
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  GALLERY: '/gallery',
  PROFILE: '/profile',
} as const;

// =============================================================================
// SOCIAL LOGIN PROVIDERS
// =============================================================================

/**
 * Social login providers for login page
 * (UI only - not functional in this version)
 */
export const SOCIAL_PROVIDERS = [
  { name: 'Google', icon: '/google.png' },
  { name: 'Apple ID', icon: '/apple.png' },
  { name: 'Facebook', icon: '/facebook.png' },
] as const;

// =============================================================================
// INDEXEDDB CONFIGURATION
// =============================================================================

/**
 * IndexedDB database name and version
 */
export const IDB_CONFIG = {
  DB_NAME: 'gallery-app',
  VERSION: 1,
  STORE_NAME: 'likes',
} as const;
