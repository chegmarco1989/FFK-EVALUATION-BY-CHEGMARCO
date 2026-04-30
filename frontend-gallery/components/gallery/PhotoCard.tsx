/**
 * =============================================================================
 * PHOTO CARD COMPONENT
 * =============================================================================
 * Individual photo card with like button and author info.
 */

'use client';

import { useState } from 'react';
import { Photo } from '@/types';
import { cn, formatCompactNumber } from '@/lib/utils';

export interface PhotoCardProps {
  photo: Photo;
  onLike: (photoId: string) => void;
}

export default function PhotoCard({ photo, onLike }: PhotoCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showHeartParticles, setShowHeartParticles] = useState(false);
  
  const handleLike = () => {
    onLike(photo.id);
    
    // Trigger heart particles animation
    if (!photo.isLikedByCurrentUser) {
      setShowHeartParticles(true);
      setTimeout(() => setShowHeartParticles(false), 1000);
    }
  };
  
  return (
    <div className="masonry-item group relative">
      <div className="card-hover relative overflow-hidden">
        {/* Image skeleton */}
        {!imageLoaded && (
          <div className="skeleton w-full h-64" />
        )}
        
        {/* Image */}
        <img
          src={photo.urls.regular}
          alt={photo.alt_description || 'Gallery image'}
          className={cn(
            'w-full h-auto object-cover transition-all duration-300 group-hover:scale-105',
            !imageLoaded && 'opacity-0'
          )}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Heart particles */}
        {showHeartParticles && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute text-2xl animate-float-up"
                style={{
                  left: `${20 + i * 15}%`,
                  animationDelay: `${i * 0.1}s`,
                }}
              >
                ❤️
              </div>
            ))}
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center justify-between">
              {/* Author info */}
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
              
              {/* Like button */}
              <button
                onClick={handleLike}
                className={cn(
                  'p-2 rounded-full transition-all transform hover:scale-110',
                  photo.isLikedByCurrentUser
                    ? 'bg-red-500 text-white animate-heart-pop'
                    : 'bg-white/20 text-white hover:bg-white/30'
                )}
                aria-label={photo.isLikedByCurrentUser ? 'Unlike' : 'Like'}
              >
                {photo.isLikedByCurrentUser ? '❤️' : '🤍'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
