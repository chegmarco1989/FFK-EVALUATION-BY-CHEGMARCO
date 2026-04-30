# 🚀 User Management API

Enterprise-grade REST API for user management with JWT authentication, batch import capabilities, and comprehensive security features.

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Architecture Overview](#-architecture-overview)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [Running the Project](#-running-the-project)
- [Running Tests](#-running-tests)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Technical Decisions & Tradeoffs](#-technical-decisions--tradeoffs)
- [Known Limitations & Future Improvements](#-known-limitations--future-improvements)

## 🛠 Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.4+ (strict mode)
- **Framework**: Express 4.18
- **Database**: SQLite (via Prisma ORM 5.11)
  - Zero configuration required
  - Single file database (`dev.db`)
  - Perfect for development and demos
  - Easily migrated to PostgreSQL/MySQL for production
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Validation**: Zod
- **Testing**: Jest + Supertest
- **Documentation**: Swagger/OpenAPI 3.0
- **Security**: Helmet, CORS, Rate Limiting
- **Fake Data**: Faker.js

## 🏗 Architecture Overview

The application follows a **layered architecture** pattern for maximum maintainability and testability:

```
┌─────────────────────────────────────────────────────────┐
│                    HTTP Layer                           │
│  (Routes, Controllers, Middleware)                      │
│  - Request validation                                   │
│  - Authentication/Authorization                         │
│  - Error handling                                       │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│                 Business Logic Layer                    │
│  (Services)                                             │
│  - User management                                      │
│  - Authentication logic                                 │
│  - Data generation                                      │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│                  Data Access Layer                      │
│  (Prisma ORM)                                           │
│  - Database queries                                     │
│  - Transaction management                               │
└─────────────────────────────────────────────────────────┘
```

### Request Flow

```
Client Request
    ↓
Security Middleware (Helmet, CORS, Rate Limiting)
    ↓
Request Logging
    ↓
Route Handler
    ↓
Validation Middleware (Zod)
    ↓
Authentication Middleware (JWT)
    ↓
Authorization Middleware (Role Check)
    ↓
Controller (HTTP concerns)
    ↓
Service (Business logic)
    ↓
Database (Prisma)
    ↓
Response Formatter
    ↓
Client Response
```

## ✅ Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher (comes with Node.js)
- **Git**: For version control

## 📦 Installation & Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd backend-users
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

```bash
cp .env.example .env
```

Edit `.env` and configure your environment variables (see [Environment Variables](#-environment-variables) section).

### 4. Generate Prisma client

```bash
npm run prisma:generate
```

### 5. Run database migrations

```bash
npm run prisma:migrate
```

This creates the SQLite database and applies the schema.

### 6. (Optional) Seed database

You can use the API's `/api/users/generate` and `/api/users/batch` endpoints to populate the database with test data.

## 🔐 Environment Variables

Create a `.env` file in the project root with the following variables:

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | `9090` | No |
| `NODE_ENV` | Environment (development/production/test) | `development` | No |
| `DATABASE_URL` | SQLite database file path | `file:./dev.db` | Yes |
| `JWT_SECRET` | Secret key for JWT signing (min 32 chars) | - | Yes |
| `JWT_EXPIRES_IN` | JWT token expiration time | `24h` | No |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `5` | No |
| `RATE_LIMIT_WINDOW_MINUTES` | Rate limit window in minutes | `15` | No |
| `CORS_ORIGIN` | Allowed CORS origins (comma-separated) | `http://localhost:3000` | No |
| `MAX_FILE_SIZE` | Max upload file size in bytes | `10485760` (10MB) | No |
| `ALLOWED_FILE_TYPES` | Allowed MIME types | `application/json` | No |
| `LOG_LEVEL` | Logging level (error/warn/info/debug) | `info` | No |
| `ENABLE_REQUEST_LOGGING` | Enable request logging | `true` | No |

### Example `.env` file

```env
PORT=9090
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-min-32-characters-long"
JWT_EXPIRES_IN=24h
RATE_LIMIT_MAX_REQUESTS=5
RATE_LIMIT_WINDOW_MINUTES=15
CORS_ORIGIN=http://localhost:3000,http://localhost:9090
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=application/json
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true
```

## 🚀 Running the Project

### Development mode (with hot reload)

```bash
npm run dev
```

The server will start on `http://localhost:9090` (or your configured PORT).

**To stop the server**: Press `Ctrl+C` in the terminal

**To restart the server**:
1. Stop it with `Ctrl+C`
2. Run `npm run dev` again

### Production mode

```bash
# Build TypeScript to JavaScript
npm run build

# Start production server
npm start
```

### Access the API

- **API Base URL**: `http://localhost:9090/api`
- **Swagger Documentation**: `http://localhost:9090/api/docs`
- **Health Check**: `http://localhost:9090/api/health`

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

**Solution 3 - Regenerate Prisma Client:**
```bash
npm run prisma:generate
```
Then restart TypeScript server (Solution 1)

### Server won't start

```bash
# Clean and reinstall
rm -rf node_modules
rm package-lock.json
npm install
npm run prisma:generate
npm run dev
```

### Port already in use

If port 9090 is already in use:
1. Find the process: `netstat -ano | findstr :9090`
2. Kill it: `taskkill /PID <process_id> /F`
3. Or change the port in `.env`: `PORT=9091`

### Database errors

```bash
# Reset database
rm dev.db
npm run prisma:migrate
```

## 🧪 Running Tests

### Run all tests

```bash
npm test
```

### Run tests in watch mode

```bash
npm run test:watch
```

### Run integration tests only

```bash
npm run test:integration
```

### Generate coverage report

```bash
npm test -- --coverage
```

Coverage reports are generated in the `coverage/` directory.

## 📚 API Documentation

Interactive API documentation is available via Swagger UI at:

```
http://localhost:9090/api/docs
```

### Quick Start Guide

1. **Generate fake users**:
   ```
   GET /api/users/generate?count=100
   ```
   Downloads a JSON file with 100 realistic fake users.

2. **Import users**:
   ```
   POST /api/users/batch
   Content-Type: multipart/form-data
   Body: file=<users.json>
   ```
   Imports users from the downloaded JSON file.

3. **Login**:
   ```
   POST /api/auth
   Content-Type: application/json
   Body: { "username": "user@example.com", "password": "password123" }
   ```
   Returns JWT access token.

4. **Get current user profile**:
   ```
   GET /api/users/me
   Authorization: Bearer <your-token>
   ```

5. **Get user by username**:
   ```
   GET /api/users/:username
   Authorization: Bearer <your-token>
   ```
   Admins can view any profile, users can only view their own.

## 📁 Project Structure

```
backend-users/
├── src/
│   ├── config/              # Configuration files
│   │   ├── database.ts      # Prisma client singleton
│   │   ├── environment.ts   # Environment variable validation
│   │   └── swagger.ts       # Swagger/OpenAPI configuration
│   │
│   ├── controllers/         # HTTP request handlers
│   │   ├── auth.controller.ts
│   │   └── user.controller.ts
│   │
│   ├── middlewares/         # Express middleware
│   │   ├── auth.middleware.ts       # JWT authentication
│   │   ├── error.middleware.ts      # Error handling
│   │   ├── security.middleware.ts   # Security (Helmet, CORS, rate limiting)
│   │   └── validation.middleware.ts # Request validation
│   │
│   ├── routes/              # Route definitions
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   └── index.ts         # Route aggregator
│   │
│   ├── services/            # Business logic
│   │   ├── auth.service.ts  # Authentication logic
│   │   └── user.service.ts  # User management logic
│   │
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts
│   │
│   ├── utils/               # Utility functions
│   │   ├── logger.ts        # Logging utility
│   │   ├── response.ts      # Response formatters
│   │   └── validation.ts    # Zod validation schemas
│   │
│   └── index.ts             # Application entry point
│
├── tests/                   # Test files
│   ├── unit/                # Unit tests
│   ├── integration/         # Integration tests
│   └── setup.ts             # Test configuration
│
├── prisma/
│   └── schema.prisma        # Database schema
│
├── .env.example             # Example environment variables
├── .eslintrc.json           # ESLint configuration
├── .prettierrc              # Prettier configuration
├── jest.config.js           # Jest configuration
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
└── README.md                # This file
```

## 🎯 Technical Decisions & Tradeoffs

### 1. **SQLite vs PostgreSQL/MySQL**

**Decision**: SQLite  
**Rationale**: 
- Zero configuration required (no database server to install)
- Single file database (`dev.db`) - highly portable
- Perfect for development, testing, and demonstrations
- Sufficient performance for the project requirements
- Prisma ORM makes migration to other databases trivial

**Tradeoff**: Not suitable for high-concurrency production environments. For production with multiple servers, migrate to PostgreSQL or MySQL by simply changing the Prisma datasource provider.

**Migration path**:
```prisma
// In prisma/schema.prisma, change:
datasource db {
  provider = "postgresql"  // or "mysql"
  url      = env("DATABASE_URL")
}
```

Then update `.env`:
```env
# PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"

# MySQL  
DATABASE_URL="mysql://user:password@localhost:3306/mydb"
```

Run `npm run prisma:migrate` and you're done!

### 2. **JWT vs Session-based Authentication**

**Decision**: JWT (JSON Web Tokens)  
**Rationale**:
- Stateless authentication (no server-side session storage)
- Scales horizontally easily
- Works well with microservices
- Client can decode token to get user info

**Tradeoff**: Cannot revoke tokens before expiration without additional infrastructure (token blacklist). For production, consider implementing refresh tokens with database storage.

### 3. **Bcrypt for Password Hashing**

**Decision**: Bcrypt with 10 salt rounds  
**Rationale**:
- Industry standard for password hashing
- Automatically handles salting
- Configurable work factor (future-proof)
- Resistant to rainbow table attacks

**Tradeoff**: Slower than alternatives like Argon2, but more widely supported and battle-tested.

### 4. **Zod for Validation**

**Decision**: Zod over Joi or class-validator  
**Rationale**:
- Type inference (TypeScript types generated from schemas)
- Excellent TypeScript support
- Composable schemas
- Runtime and compile-time safety

**Tradeoff**: Slightly larger bundle size than Joi, but type safety benefits outweigh this.

### 5. **Layered Architecture**

**Decision**: Routes → Controllers → Services → Database  
**Rationale**:
- Clear separation of concerns
- Easy to test (mock services in controller tests)
- Business logic reusable across different interfaces
- Follows SOLID principles

**Tradeoff**: More files and boilerplate, but significantly better maintainability.

### 6. **Faker.js for Data Generation**

**Decision**: @faker-js/faker  
**Rationale**:
- Generates realistic data (not "test" or "example")
- Supports multiple locales
- Extensive API for various data types
- Active maintenance

**Tradeoff**: Adds ~2MB to bundle size, but essential for the requirements.

## 🔮 Known Limitations & Future Improvements

### Current Limitations

1. **No Token Refresh Mechanism**
   - Tokens expire after configured time
   - Users must re-login after expiration
   - **Future**: Implement refresh tokens with database storage

2. **No Token Revocation**
   - Cannot invalidate tokens before expiration
   - Logout is client-side only
   - **Future**: Implement token blacklist using Redis

3. **Single Database Connection**
   - No connection pooling
   - SQLite doesn't support concurrent writes well
   - **Future**: Migrate to PostgreSQL with connection pooling

4. **No Pagination on User List**
   - `/api/users` endpoint not implemented
   - Could return too much data
   - **Future**: Add pagination, filtering, and sorting

5. **No Email Verification**
   - Users can register with any email
   - No email confirmation required
   - **Future**: Add email verification flow

6. **No Password Reset**
   - Users cannot reset forgotten passwords
   - **Future**: Implement password reset via email

7. **No Audit Logging**
   - No tracking of who did what and when
   - **Future**: Add audit log table and middleware

8. **No File Upload Validation Beyond Size**
   - Only checks file size and MIME type
   - Doesn't validate JSON structure deeply
   - **Future**: Add JSON schema validation

### Planned Improvements

1. **Performance**
   - Add Redis caching for frequently accessed data
   - Implement database query optimization
   - Add database indexes for common queries

2. **Security**
   - Implement 2FA (Two-Factor Authentication)
   - Add IP-based rate limiting
   - Implement CAPTCHA for login
   - Add security headers audit

3. **Monitoring**
   - Integrate with APM tools (New Relic, Datadog)
   - Add structured logging (Winston, Pino)
   - Implement health check endpoints with database status
   - Add metrics collection (Prometheus)

4. **Testing**
   - Increase test coverage to 90%+
   - Add E2E tests with Playwright
   - Add load testing with k6
   - Add security testing (OWASP ZAP)

5. **Documentation**
   - Add architecture diagrams
   - Add sequence diagrams for complex flows
   - Add API usage examples in multiple languages
   - Add troubleshooting guide

6. **DevOps**
   - Add Docker support
   - Add CI/CD pipeline (GitHub Actions)
   - Add deployment scripts
   - Add database migration rollback support

---

## 📄 License

MIT

## 👤 Author

**MARC-AURELE A. CHEGNIMONHAN** (Benin Dev.)  
Senior Full-Stack Developer

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

**Built with ❤️ using TypeScript, Express, and Prisma**

*By MARC-AURELE A. CHEGNIMONHAN (Benin Dev.) - Senior Full-Stack Developer*
