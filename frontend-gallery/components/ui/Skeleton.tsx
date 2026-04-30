/**
 * =============================================================================
 * SKELETON LOADER COMPONENT
 * =============================================================================
 * Loading placeholder with shimmer animation.
 */

import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  count?: number;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export default function Skeleton({
  className,
  count = 1,
  variant = 'rectangular',
  width,
  height,
  ...props
}: SkeletonProps) {
  const variantStyles = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };
  
  const style = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
  };
  
  if (count === 1) {
    return (
      <div
        className={cn(
          'skeleton',
          variantStyles[variant],
          className
        )}
        style={style}
        {...props}
      />
    );
  }
  
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'skeleton',
            variantStyles[variant],
            className
          )}
          style={style}
          {...props}
        />
      ))}
    </>
  );
}
