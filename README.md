# 🚀 FFK Evaluations - Technical Assessment

This repository contains two enterprise-grade applications built as part of a technical evaluation:

1. **Backend Users API** - User management system with JWT authentication
2. **Frontend Gallery** - Image gallery with authentication and persistent likes

## 📁 Project Structure

```
ffk-evaluations/
├── backend-users/          # Node.js/Express API
│   ├── src/                # Source code
│   ├── tests/              # Unit & integration tests
│   ├── prisma/             # Database schema
│   └── README.md           # Backend documentation
│
├── frontend-gallery/       # Next.js 16 application
│   ├── app/                # App Router pages
│   ├── components/         # React components
│   ├── lib/                # Utilities & API client
│   └── README.md           # Frontend documentation
│
└── README.md               # This file
```

## 🎯 Quick Start

### Backend Setup

```bash
cd backend-users
npm install
cp .env.example .env
# Edit .env with your configuration
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Backend runs on `http://localhost:9090`

### Frontend Setup

```bash
cd frontend-gallery
npm install
cp .env.local.example .env.local
# Add your Unsplash API key to .env.local
npm run dev
```

Frontend runs on `http://localhost:3000`

## 📚 Documentation

- **Backend**: See [backend-users/README.md](./backend-users/README.md)
- **Frontend**: See [frontend-gallery/README.md](./frontend-gallery/README.md)

## 🛠 Tech Stack

### Backend
- Node.js + TypeScript
- Express.js
- Prisma ORM + SQLite
- JWT Authentication
- Zod Validation
- Jest + Supertest
- Swagger/OpenAPI

### Frontend
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- IndexedDB (idb-keyval)
- Unsplash API
- Framer Motion

## ✨ Key Features

### Backend
- ✅ JWT authentication with bcrypt password hashing
- ✅ Generate realistic fake users with Faker.js
- ✅ Batch import users from JSON files
- ✅ Role-based access control (admin/user)
- ✅ Comprehensive API documentation (Swagger)
- ✅ Rate limiting and security headers
- ✅ Full test coverage

### Frontend
- ✅ Beautiful authentication page
- ✅ Masonry grid gallery (Pinterest-style)
- ✅ Infinite scroll with lazy loading
- ✅ Persistent likes (IndexedDB)
- ✅ Category filtering and sorting
- ✅ Responsive design (mobile-first)
- ✅ Smooth animations and transitions

## 🧪 Test Credentials

### Frontend Login
- `muser1` / `mpassword1` ✅
- `muser2` / `mpassword2` ✅
- `muser3` / `mpassword3` ❌ (blocked)

## 📖 API Documentation

Once the backend is running, visit:
- Swagger UI: `http://localhost:9090/api/docs`
- OpenAPI JSON: `http://localhost:9090/api/docs.json`

## 🏗 Architecture

### Backend Architecture
```
Routes → Controllers → Services → Database (SQLite)
  ↓         ↓            ↓           ↓
HTTP    Validation   Business    Prisma ORM
Layer   Middleware    Logic       (dev.db file)
```

### Frontend Architecture
```
Pages → Context → API Client → Backend/Unsplash
  ↓        ↓          ↓              ↓
UI     State Mgmt  HTTP Calls    External APIs
         +
    IndexedDB
  (Local Storage)
```

## 🗄️ Database Information

### Backend
- **Database**: SQLite (file-based)
- **Location**: `backend-users/dev.db`
- **ORM**: Prisma
- **Why SQLite?**
  - Zero configuration (no server to install)
  - Single portable file
  - Perfect for development and demos
  - Easy migration to PostgreSQL/MySQL for production

### Frontend
- **Storage**: IndexedDB (browser-based)
- **Library**: idb-keyval
- **Purpose**: Store user likes persistently
- **Data**: Isolated per user, survives page reloads

## 🎨 Design Philosophy

- **Clean Code**: Extensive comments explaining "why", not just "what"
- **Type Safety**: Strict TypeScript with no `any` types
- **Error Handling**: Comprehensive error handling at every layer
- **Security**: Industry best practices (bcrypt, JWT, rate limiting, CORS)
- **Performance**: Optimized queries, lazy loading, caching
- **Accessibility**: ARIA labels, keyboard navigation, semantic HTML
- **Responsive**: Mobile-first design with breakpoints
- **Testing**: Unit and integration tests for critical paths

## 📝 Code Quality

- ✅ TypeScript strict mode enabled
- ✅ ESLint + Prettier configured
- ✅ Comprehensive inline documentation
- ✅ Consistent naming conventions
- ✅ Layered architecture (separation of concerns)
- ✅ DRY principles applied
- ✅ SOLID principles followed

## 🚀 Deployment

### Backend
```bash
cd backend-users
npm run build
npm start
```

**Restart backend server:**
1. Stop with `Ctrl+C`
2. Run `npm run dev` (development) or `npm start` (production)

### Frontend
```bash
cd frontend-gallery
npm run build
npm start
```

**Restart frontend server:**
1. Stop with `Ctrl+C`
2. Run `npm run dev` (development) or `npm start` (production)

---

## 🔧 Common Issues & Solutions

### TypeScript Errors in VS Code

If you see red underlines in VS Code but code runs fine:

**Quick Fix:**
1. Press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
2. Type: `TypeScript: Restart TS Server`
3. Press Enter

**Alternative:**
1. Press `Ctrl+Shift+P`
2. Type: `Developer: Reload Window`
3. Press Enter

### Backend Won't Start

```bash
cd backend-users
rm -rf node_modules
npm install
npm run prisma:generate
npm run dev
```

### Frontend Won't Start

```bash
cd frontend-gallery
rm -rf node_modules .next
npm install
npm run dev
```

### Port Already in Use

**Backend (port 9090):**
- Change port in `.env`: `PORT=9091`
- Or kill the process using the port

**Frontend (port 3000):**
- Next.js will automatically use next available port (3001, 3002, etc.)

### Database Issues

```bash
cd backend-users
rm dev.db
npm run prisma:migrate
```

## 🔐 Security Features

- JWT token-based authentication
- Bcrypt password hashing (10 rounds)
- Rate limiting on authentication endpoints
- CORS configuration
- Helmet security headers
- Input validation with Zod
- SQL injection prevention (Prisma ORM)
- XSS protection

## 📊 Performance Optimizations

- Database indexes on frequently queried fields
- Lazy loading images
- Infinite scroll pagination
- IndexedDB for client-side storage
- Next.js image optimization
- Code splitting
- Tree shaking

## 🤝 Contributing

This is an evaluation project, but feedback is welcome!

## 📄 License

MIT

---

**Built with ❤️ by MARC-AURELE A. CHEGNIMONHAN (Benin Dev.)**  
*Senior Full-Stack Developer*

*This project demonstrates 10+ years of experience in building production-grade applications with modern technologies and best practices.*
