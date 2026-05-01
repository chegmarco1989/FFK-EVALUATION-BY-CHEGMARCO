# 🎨 Gallery - Image Gallery Application

World-class image gallery application with authentication, infinite scroll, and persistent likes. Built with Next.js 16, TypeScript, and Tailwind CSS.

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [Running the Project](#-running-the-project)
- [Project Structure](#-project-structure)
- [Design System](#-design-system)
- [Technical Decisions](#-technical-decisions)
- [Known Limitations](#-known-limitations)

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.4+ (strict mode)
- **Styling**: Tailwind CSS 3.4
- **State Management**: React Context API
- **Client-Side Storage**: IndexedDB (via idb-keyval)
  - Persistent like storage (survives page reloads)
  - No 5MB limit like localStorage
  - Per-user isolated data
  - Asynchronous API for better performance
- **Animations**: Framer Motion + CSS animations
- **API Integration**: Unsplash API
- **Fonts**: Playfair Display + DM Sans (Google Fonts)

## ✨ Features

### Authentication
- ✅ Beautiful login page with pixel-perfect design
- ✅ Test credentials validation
- ✅ Blocked account handling
- ✅ Session persistence (localStorage)
- ✅ Smooth animations and transitions
- ✅ Form validation with real-time feedback

### Gallery
- ✅ Masonry grid layout (Pinterest-style)
- ✅ Infinite scroll with automatic loading
- ✅ Category filtering (9 categories)
- ✅ Sort options (Popular, Latest, Oldest, Most Liked)
- ✅ Responsive design (5 columns desktop, 2 mobile)
- ✅ Skeleton loaders with shimmer effect
- ✅ Image lazy loading
- ✅ Smooth hover effects

### Like System
- ✅ Toggle like with heart animation
- ✅ Persistent storage (IndexedDB)
- ✅ Per-user likes (isolated by username)
- ✅ Real-time like counter updates
- ✅ Survives page reloads and browser restarts

### Design
- ✅ Premium design system with custom colors
- ✅ Glassmorphism effects
- ✅ Smooth animations and transitions
- ✅ Custom scrollbar styling
- ✅ Responsive typography
- ✅ Accessibility-friendly (ARIA labels, keyboard navigation)

## ✅ Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Unsplash API Key**: Get one at [unsplash.com/developers](https://unsplash.com/developers)

## 📦 Installation & Setup

### 1. Clone the repository

```bash
cd frontend-gallery
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Unsplash API key:

```env
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your-unsplash-access-key-here
NEXT_PUBLIC_API_URL=http://localhost:9090/api
NEXT_PUBLIC_IMAGES_PER_PAGE=20
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_UNSPLASH_ACCESS_KEY` | Unsplash API access key | Yes |
| `NEXT_PUBLIC_API_URL` | Backend API URL | No (defaults to localhost:9090) |
| `NEXT_PUBLIC_IMAGES_PER_PAGE` | Images per page | No (defaults to 20) |

### Getting Unsplash API Key

1. Go to [unsplash.com/developers](https://unsplash.com/developers)
2. Create a new application
3. Copy the "Access Key"
4. Paste it in `.env.local`

## 🚀 Running the Project

### Development mode

```bash
npm run dev
```

Server runs on `http://localhost:3000`

**To stop the server**: Press `Ctrl+C` in the terminal

**To restart the server**:
1. Stop it with `Ctrl+C`
2. Run `npm run dev` again

### Production build

```bash
npm run build
npm start
```

### Type checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

---

## 🔧 Troubleshooting

### TypeScript errors in VS Code (red underlines)

If you see TypeScript errors in VS Code but the code runs fine:

**Solution 1 - Restart TypeScript Server:**
1. Press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
2. Type: `TypeScript: Restart TS Server`
3. Press Enter

**Solution 2 - Reload VS Code:**
1. Press `Ctrl+Shift+P`
2. Type: `Developer: Reload Window`
3. Press Enter

**Solution 3 - Clean rebuild:**
```bash
# Stop the server (Ctrl+C)
rm -rf .next
rm -rf node_modules
npm install
npm run dev
```

### Port already in use

If port 3000 is already in use, Next.js will automatically use port 3001, 3002, etc.

To force a specific port:
```bash
PORT=3005 npm run dev
```

### Images not loading from Unsplash

1. Check your `.env.local` file has the correct API key
2. Restart the server after changing `.env.local`
3. Check browser console for API errors

### Likes not persisting

1. Check browser console for IndexedDB errors
2. Clear browser data and try again
3. Make sure you're using a modern browser (Chrome, Firefox, Edge)

### Build errors

```bash
# Clean everything and rebuild
rm -rf .next
rm -rf node_modules
rm package-lock.json
npm install
npm run build
```

## 🧪 Test Credentials

Use these credentials to test the login functionality:

| Username | Password | Result |
|----------|----------|--------|
| `muser1` | `mpassword1` | ✅ Success → Redirects to gallery |
| `muser2` | `mpassword2` | ✅ Success → Redirects to gallery |
| `muser3` | `mpassword3` | ❌ Error: "Ce compte a été bloqué." |
| Any other | Any other | ❌ Error: "Informations de connexion invalides" |

## 📁 Project Structure

```
frontend-gallery/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group
│   │   └── login/                # Login page
│   │       └── page.tsx
│   ├── (dashboard)/              # Dashboard route group
│   │   └── gallery/              # Gallery page
│   │       └── page.tsx
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page (redirects)
│   └── globals.css               # Global styles
│
├── components/                   # React components
│   ├── auth/                     # Auth-related components
│   ├── gallery/                  # Gallery components
│   └── ui/                       # Reusable UI components
│
├── context/                      # React contexts
│   └── AuthContext.tsx           # Authentication context
│
├── hooks/                        # Custom React hooks
│
├── lib/                          # Utility libraries
│   ├── api.ts                    # API client
│   ├── constants.ts              # App constants
│   ├── likes.ts                  # Like storage (IndexedDB)
│   └── utils.ts                  # Utility functions
│
├── types/                        # TypeScript types
│   └── index.ts                  # Type definitions
│
├── public/                       # Static assets
│
├── .env.local.example            # Example environment variables
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies
└── README.md                     # This file
```

## 🎨 Design System

### Colors

- **Primary**: Amber/Orange (`#F5A623`) - Brand color
- **Neutral**: Beige/Cream palette - Background and text
- **Semantic**: Success, Error, Warning, Info

### Typography

- **Headings**: Playfair Display (serif, elegant)
- **Body**: DM Sans (sans-serif, clean)

### Spacing

- Consistent 8px grid system
- Custom spacing utilities (18, 88, 100, 112, 128)

### Animations

- Fade in/out
- Slide in (left, right, up, down)
- Scale in/out
- Shake (for errors)
- Shimmer (for skeleton loaders)
- Heart pop (for likes)

### Components

- **Buttons**: Primary, Secondary with hover states
- **Inputs**: With focus states and error handling
- **Cards**: With soft shadows and hover effects
- **Skeleton Loaders**: Shimmer animation
- **Glassmorphism**: Backdrop blur effects

## 🎯 Technical Decisions

### 1. **Next.js App Router**

**Decision**: Use App Router over Pages Router  
**Rationale**:
- Server Components for better performance
- Improved routing with layouts
- Better TypeScript support
- Future-proof architecture

### 2. **IndexedDB for Likes**

**Decision**: IndexedDB (via idb-keyval) over localStorage  
**Rationale**:
- **No storage limits**: localStorage has 5MB limit, IndexedDB can store much more
- **Better performance**: Asynchronous API doesn't block the main thread
- **Structured storage**: Key-value pairs with proper data types
- **Persistence**: Data survives page reloads and browser restarts
- **Per-user isolation**: Each user's likes are stored separately

**How it works**:
- Like key format: `likes:{userId}:{photoId}`
- Example: `likes:muser1:abc123` stores that muser1 liked photo abc123
- All operations are async and non-blocking
- Data persists across sessions

**Tradeoff**: Slightly more complex API than localStorage, but significantly better for this use case where we need to store potentially hundreds of likes per user.

### 3. **Context API for State**

**Decision**: React Context over Redux/Zustand  
**Rationale**:
- Simple state requirements
- No need for complex middleware
- Built-in to React (no extra dependencies)
- Sufficient for auth and gallery state

**Tradeoff**: Not ideal for very large apps, but perfect for this use case.

### 4. **Tailwind CSS**

**Decision**: Tailwind over CSS-in-JS or CSS Modules  
**Rationale**:
- Rapid development
- Consistent design system
- Excellent TypeScript support
- Small production bundle (PurgeCSS)
- Easy responsive design

### 5. **Masonry Grid with CSS**

**Decision**: CSS columns over JavaScript library  
**Rationale**:
- Native browser support
- Better performance (no JS calculations)
- Simpler implementation
- Responsive by default

**Tradeoff**: Less control over item placement, but sufficient for this use case.

## 🔮 Known Limitations & Future Improvements

### Current Limitations

1. **Mock Authentication**
   - Login doesn't actually call backend API
   - Uses hardcoded test credentials
   - **Future**: Integrate with real backend API

2. **No Real-time Sync**
   - Likes are local only (IndexedDB)
   - Not synced across devices
   - **Future**: Sync likes with backend database

3. **Limited Error Handling**
   - Basic error messages
   - No retry logic for failed requests
   - **Future**: Implement comprehensive error handling

4. **No Image Upload**
   - Gallery is read-only
   - Can't upload own images
   - **Future**: Add image upload functionality

5. **No User Profile**
   - Can't edit profile
   - No profile page
   - **Future**: Add user profile management

6. **No Search**
   - Can't search for specific images
   - Only category filtering
   - **Future**: Add search functionality

### Planned Improvements

1. **Performance**
   - Implement virtual scrolling for large galleries
   - Add image preloading
   - Optimize bundle size

2. **Features**
   - Collections/Albums
   - Image download
   - Share functionality
   - Comments on images
   - Follow users

3. **Accessibility**
   - Screen reader improvements
   - Keyboard navigation enhancements
   - High contrast mode
   - Reduced motion mode

4. **PWA**
   - Offline support
   - Install as app
   - Push notifications

5. **Testing**
   - Unit tests (Jest)
   - Integration tests (Testing Library)
   - E2E tests (Playwright)

---

## 📄 License

MIT

## 👤 Author

**MARC-AURELE A. CHEGNIMONHAN** (Benin Dev.)  
Senior Full-Stack Developer

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**

*By MARC-AURELE A. CHEGNIMONHAN (Benin Dev.) - Senior Full-Stack Developer*
