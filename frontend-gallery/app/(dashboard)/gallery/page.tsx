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

export default function GalleryPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<GalleryCategory>('All');
  const [sortBy, setSortBy] = useState<SortOption>('Popular');
  const [hasMore, setHasMore] = useState(true);
  
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
    <div className="min-h-screen bg-neutral-50">
      {/* Navigation bar */}
      <nav className="glass sticky top-0 z-50 border-b border-neutral-200">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <h1 className="font-playfair text-2xl font-bold text-neutral-900">
              Gallery
            </h1>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-10 h-10 rounded-full border-2 border-primary-500"
                />
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-neutral-900">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-neutral-600">@{user.username}</p>
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
      <div className="bg-white border-b border-neutral-200 sticky top-[73px] z-40">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between mb-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="input py-2 text-sm w-auto"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            
            <button className="btn-secondary text-sm py-2">
              Filters
            </button>
          </div>
          
          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {GALLERY_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                  category === cat
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-white text-neutral-700 border border-neutral-300 hover:border-primary-500'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
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
              <div key={photo.id} className="masonry-item group">
                <div className="card-hover relative overflow-hidden">
                  <img
                    src={photo.urls.regular}
                    alt={photo.alt_description || 'Gallery image'}
                    className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={photo.user.profile_image.small}
                            alt={photo.user.name}
                            className="w-8 h-8 rounded-full border-2 border-white"
                          />
                          <div>
                            <p className="text-white text-sm font-medium">{photo.user.name}</p>
                            <div className="flex items-center gap-2 text-xs text-white/80">
                              <span>❤️ {formatCompactNumber(photo.localLikes)}</span>
                              <span>👁️ {formatCompactNumber(photo.views || 0)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleLike(photo.id)}
                          className={cn(
                            'p-2 rounded-full transition-all',
                            photo.isLikedByCurrentUser
                              ? 'bg-error-DEFAULT text-white animate-heart-pop'
                              : 'bg-white/20 text-white hover:bg-white/30'
                          )}
                        >
                          {photo.isLikedByCurrentUser ? '❤️' : '🤍'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
          <div className="text-center py-8 text-neutral-600">
            No more images to load
          </div>
        )}
      </div>
    </div>
  );
}
