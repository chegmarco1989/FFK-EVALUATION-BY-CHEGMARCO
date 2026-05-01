/**
 * =============================================================================
 * GALLERY PAGE
 * =============================================================================
 * Main gallery page with masonry grid, infinite scroll, and like functionality.
 * World-class design inspired by Dribbble/Behance.
 */

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { fetchUnsplashPhotos } from '@/lib/api';
import { hasLiked, toggleLike as toggleLikeStorage } from '@/lib/likes';
import type { Photo, GalleryCategory, SortOption } from '@/types';
import { GALLERY_CATEGORIES, SORT_OPTIONS, CATEGORY_QUERY_MAP, SORT_ORDER_MAP, ROUTES } from '@/lib/constants';
import { cn, formatCompactNumber } from '@/lib/utils';
import ThemeToggle from '@/components/ui/ThemeToggle';
import PhotoCard from '@/components/gallery/PhotoCard';

export default function GalleryPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<GalleryCategory>('All');
  const [sortBy, setSortBy] = useState<SortOption>('Popular');
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(true);

  /**
   * Redirect to login if not authenticated
   */
  useEffect(() => {
    if (!isAuthenticated) {
      router.push(ROUTES.LOGIN);
    }
  }, [isAuthenticated, router]);

  /**
   * Load photos from Unsplash
   */
  const loadPhotos = async (pageNum: number, reset: boolean = false) => {
    if (!user) return;

    try {
      setIsLoading(true);
      const query = CATEGORY_QUERY_MAP[category];
      const orderBy = SORT_ORDER_MAP[sortBy];

      const unsplashPhotos = await fetchUnsplashPhotos(pageNum, query, orderBy);

      // Check like status for each photo
      const photosWithLikes = await Promise.all(
        unsplashPhotos.map(async (photo) => {
          const isLiked = await hasLiked(user.username, photo.id);
          return {
            ...photo,
            isLikedByCurrentUser: isLiked,
            localLikes: photo.likes + (isLiked ? 1 : 0),
          };
        })
      );

      setPhotos(reset ? photosWithLikes : [...photos, ...photosWithLikes]);
      setHasMore(photosWithLikes.length > 0);
    } catch (error) {
      console.error('Failed to load photos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Initial load
   */
  useEffect(() => {
    if (user) {
      loadPhotos(1, true);
    }
  }, [category, sortBy, user]);

  /**
   * Handle like toggle
   */
  const handleLike = async (photoId: string) => {
    if (!user) return;

    try {
      const isNowLiked = await toggleLikeStorage(user.username, photoId);

      // Update local state
      setPhotos(photos.map(photo => {
        if (photo.id === photoId) {
          return {
            ...photo,
            isLikedByCurrentUser: isNowLiked,
            localLikes: photo.likes + (isNowLiked ? 1 : 0),
          };
        }
        return photo;
      }));
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  /**
   * Handle infinite scroll
   */
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
        !isLoading &&
        hasMore
      ) {
        setPage(p => p + 1);
        loadPhotos(page + 1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoading, hasMore, page]);

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-dark-950">
      {/* Navigation bar */}
      <nav className="glass sticky top-0 z-50 border-b border-neutral-200 dark:border-dark-800">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <h1 className="font-playfair text-2xl font-bold text-neutral-900 dark:text-white">
              Gallery
            </h1>

            <div className="flex items-center gap-4">
              <ThemeToggle />

              <div className="flex items-center gap-3">
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-10 h-10 rounded-full border-2 border-primary-500"
                />
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-neutral-600 dark:text-dark-400">@{user.username}</p>
                </div>
              </div>

              <button
                onClick={logout}
                className="btn-secondary text-sm py-2"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Filters */}
      <div className="bg-white dark:bg-dark-900 border-b border-neutral-200 dark:border-dark-800 sticky top-[73px] z-40">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between mb-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="input py-2 text-sm w-auto dark:bg-dark-800 dark:text-white dark:border-dark-700"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary text-sm py-2 flex items-center gap-2"
            >
              <span>Filters</span>
              <svg
                className={cn(
                  "w-4 h-4 transition-transform",
                  showFilters ? "rotate-180" : ""
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Categories */}
          {showFilters && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 animate-fade-in">
              {GALLERY_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                    category === cat
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'bg-white dark:bg-dark-800 text-neutral-700 dark:text-dark-200 border border-neutral-300 dark:border-dark-700 hover:border-primary-500'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Gallery grid */}
      <div className="container-custom py-8">
        {isLoading && photos.length === 0 ? (
          <div className="masonry-grid">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="masonry-item">
                <div className="skeleton h-64 rounded-lg" />
              </div>
            ))}
          </div>
        ) : (
          <div className="masonry-grid">
            {photos.map((photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                onLike={handleLike}
              />
            ))}
          </div>
        )}

        {/* Loading more */}
        {isLoading && photos.length > 0 && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent" />
          </div>
        )}

        {/* No more photos */}
        {!hasMore && photos.length > 0 && (
          <div className="text-center py-8 text-neutral-600 dark:text-dark-400">
            No more images to load
          </div>
        )}
      </div>
    </div>
  );
}
