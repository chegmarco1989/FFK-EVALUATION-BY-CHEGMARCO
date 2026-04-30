/**
 * =============================================================================
 * USE INFINITE SCROLL HOOK
 * =============================================================================
 * Custom hook for implementing infinite scroll functionality.
 */

import { useEffect, useRef, useCallback } from 'react';

export interface UseInfiniteScrollOptions {
  onLoadMore: () => void;
  isLoading: boolean;
  hasMore: boolean;
  threshold?: number;
}

export default function useInfiniteScroll({
  onLoadMore,
  isLoading,
  hasMore,
  threshold = 500,
}: UseInfiniteScrollOptions) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      
      if (entry.isIntersecting && !isLoading && hasMore) {
        onLoadMore();
      }
    },
    [isLoading, hasMore, onLoadMore]
  );
  
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: `${threshold}px`,
      threshold: 0,
    };
    
    observerRef.current = new IntersectionObserver(handleObserver, options);
    
    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observerRef.current.observe(currentSentinel);
    }
    
    return () => {
      if (observerRef.current && currentSentinel) {
        observerRef.current.unobserve(currentSentinel);
      }
    };
  }, [handleObserver, threshold]);
  
  return sentinelRef;
}
