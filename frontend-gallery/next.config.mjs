/**
 * =============================================================================
 * NEXT.JS CONFIGURATION
 * =============================================================================
 * Configuration for Next.js application.
 * Optimizes images, enables strict mode, and configures external domains.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Enable React strict mode for better development experience */
  reactStrictMode: true,
  
  /* Image optimization configuration */
  images: {
    /* Allow images from Unsplash and DiceBear */
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
        pathname: '/**',
      },
    ],
    /* Image formats to support */
    formats: ['image/avif', 'image/webp'],
    /* Device sizes for responsive images */
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    /* Image sizes for different breakpoints */
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  /* Experimental features */
  experimental: {
    /* Enable optimized package imports */
    optimizePackageImports: ['framer-motion'],
  },
  
  /* Compiler options */
  compiler: {
    /* Remove console.log in production */
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
};

export default nextConfig;
