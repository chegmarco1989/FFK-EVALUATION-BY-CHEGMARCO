/**
 * =============================================================================
 * LIKE STORAGE SYSTEM - INDEXEDDB
 * =============================================================================
 * Manages photo likes using IndexedDB for persistent storage.
 * Likes survive page reloads and browser restarts.
 * Each user has their own separate likes.
 * 
 * 
 * - IndexedDB is like a client-side database (similar to SQLite)
 * - idb-keyval is a simple key-value wrapper (like Redis)
 * - Data persists across sessions
 * - Each user's likes are isolated by userId
 */

import { get, set, del, keys } from 'idb-keyval';
import { LikeData, LikeStorageKey } from '@/types';

/**
 * Generate storage key for a like
 * Format: "likes:{userId}:{photoId}"
 * 
 * @param userId - User ID
 * @param photoId - Photo ID
 * @returns Storage key
 */
function getLikeKey(userId: string, photoId: string): LikeStorageKey {
  return `likes:${userId}:${photoId}`;
}

/**
 * Check if user has liked a photo
 * 
 * @param userId - User ID
 * @param photoId - Photo ID
 * @returns True if liked
 * 
 * @example
 * const isLiked = await hasLiked('user123', 'photo456');
 */
export async function hasLiked(userId: string, photoId: string): Promise<boolean> {
  try {
    const key = getLikeKey(userId, photoId);
    const likeData = await get<LikeData>(key);
    return likeData !== undefined;
  } catch (error) {
    console.error('Error checking like status:', error);
    return false;
  }
}

/**
 * Add a like for a photo
 * 
 * @param userId - User ID
 * @param photoId - Photo ID
 * @returns Promise that resolves when like is saved
 * 
 * @example
 * await addLike('user123', 'photo456');
 */
export async function addLike(userId: string, photoId: string): Promise<void> {
  try {
    const key = getLikeKey(userId, photoId);
    const likeData: LikeData = {
      photoId,
      userId,
      timestamp: Date.now(),
    };
    await set(key, likeData);
  } catch (error) {
    console.error('Error adding like:', error);
    throw error;
  }
}

/**
 * Remove a like for a photo
 * 
 * @param userId - User ID
 * @param photoId - Photo ID
 * @returns Promise that resolves when like is removed
 * 
 * @example
 * await removeLike('user123', 'photo456');
 */
export async function removeLike(userId: string, photoId: string): Promise<void> {
  try {
    const key = getLikeKey(userId, photoId);
    await del(key);
  } catch (error) {
    console.error('Error removing like:', error);
    throw error;
  }
}

/**
 * Toggle like status for a photo
 * If liked, removes like. If not liked, adds like.
 * 
 * @param userId - User ID
 * @param photoId - Photo ID
 * @returns New like status (true if now liked, false if now unliked)
 * 
 * @example
 * const isNowLiked = await toggleLike('user123', 'photo456');
 */
export async function toggleLike(userId: string, photoId: string): Promise<boolean> {
  try {
    const isLiked = await hasLiked(userId, photoId);
    
    if (isLiked) {
      await removeLike(userId, photoId);
      return false;
    } else {
      await addLike(userId, photoId);
      return true;
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
}

/**
 * Get all liked photo IDs for a user
 * 
 * @param userId - User ID
 * @returns Array of photo IDs
 * 
 * @example
 * const likedPhotos = await getUserLikes('user123');
 * // => ['photo1', 'photo2', 'photo3']
 */
export async function getUserLikes(userId: string): Promise<string[]> {
  try {
    // Get all keys from IndexedDB
    const allKeys = await keys();
    
    // Filter keys for this user
    const userLikeKeys = allKeys.filter((key) => {
      if (typeof key !== 'string') return false;
      return key.startsWith(`likes:${userId}:`);
    });
    
    // Extract photo IDs from keys
    const photoIds = userLikeKeys.map((key) => {
      const parts = (key as string).split(':');
      return parts[2] || '';
    }).filter(Boolean);
    
    return photoIds;
  } catch (error) {
    console.error('Error getting user likes:', error);
    return [];
  }
}

/**
 * Get like count for a photo across all users
 * Note: This counts likes from all users in this browser
 * 
 * @param photoId - Photo ID
 * @returns Number of likes
 * 
 * @example
 * const likeCount = await getPhotoLikeCount('photo456');
 */
export async function getPhotoLikeCount(photoId: string): Promise<number> {
  try {
    const allKeys = await keys();
    
    // Count keys that match this photo
    const likeCount = allKeys.filter((key) => {
      if (typeof key !== 'string') return false;
      return key.endsWith(`:${photoId}`);
    }).length;
    
    return likeCount;
  } catch (error) {
    console.error('Error getting photo like count:', error);
    return 0;
  }
}

/**
 * Clear all likes for a user
 * Useful for logout or account deletion
 * 
 * @param userId - User ID
 * @returns Promise that resolves when all likes are cleared
 * 
 * @example
 * await clearUserLikes('user123');
 */
export async function clearUserLikes(userId: string): Promise<void> {
  try {
    const allKeys = await keys();
    
    // Find all keys for this user
    const userLikeKeys = allKeys.filter((key) => {
      if (typeof key !== 'string') return false;
      return key.startsWith(`likes:${userId}:`);
    });
    
    // Delete all user's likes
    await Promise.all(userLikeKeys.map((key) => del(key)));
  } catch (error) {
    console.error('Error clearing user likes:', error);
    throw error;
  }
}

/**
 * Get like statistics for a user
 * 
 * @param userId - User ID
 * @returns Statistics object
 * 
 * @example
 * const stats = await getLikeStats('user123');
 * // => { totalLikes: 42, oldestLike: Date, newestLike: Date }
 */
export async function getLikeStats(userId: string): Promise<{
  totalLikes: number;
  oldestLike: Date | null;
  newestLike: Date | null;
}> {
  try {
    const allKeys = await keys();
    
    // Get all like data for this user
    const userLikeKeys = allKeys.filter((key) => {
      if (typeof key !== 'string') return false;
      return key.startsWith(`likes:${userId}:`);
    });
    
    const likesData = await Promise.all(
      userLikeKeys.map((key) => get<LikeData>(key))
    );
    
    const validLikes = likesData.filter((like): like is LikeData => like !== undefined);
    
    if (validLikes.length === 0) {
      return {
        totalLikes: 0,
        oldestLike: null,
        newestLike: null,
      };
    }
    
    const timestamps = validLikes.map((like) => like.timestamp);
    const oldestTimestamp = Math.min(...timestamps);
    const newestTimestamp = Math.max(...timestamps);
    
    return {
      totalLikes: validLikes.length,
      oldestLike: new Date(oldestTimestamp),
      newestLike: new Date(newestTimestamp),
    };
  } catch (error) {
    console.error('Error getting like stats:', error);
    return {
      totalLikes: 0,
      oldestLike: null,
      newestLike: null,
    };
  }
}
