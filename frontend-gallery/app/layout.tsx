/**
 * =============================================================================
 * ROOT LAYOUT
 * =============================================================================
 * Root layout component for the entire application.
 * Sets up fonts, metadata, and global providers.
 */

import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

/**
 * Playfair Display font for headings
 * Elegant serif font for titles
 */
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
});

/**
 * DM Sans font for body text
 * Clean, modern sans-serif for readability
 */
const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
  weight: ['400', '500', '700'],
});

/**
 * Application metadata
 */
export const metadata: Metadata = {
  title: 'Gallery - Beautiful Image Collection',
  description: 'Discover and curate beautiful images from talented creators around the world',
  keywords: ['gallery', 'images', 'photos', 'design', 'inspiration'],
  authors: [{ name: 'Gallery Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#F5A623',
};

/**
 * Root layout component
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="font-sans antialiased bg-neutral-100 text-neutral-900">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
