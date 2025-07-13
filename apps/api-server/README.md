# ⚠️ API Server - DEPRECATED

## ⚠️ IMPORTANT NOTICE

**THIS EXPRESS BACKEND IS NO LONGER MAINTAINED AND IS DEPRECATED**

### Migration Status
- **Status**: **FULLY DEPRECATED** ❌
- **Reason**: Originally created for learning Express.js, but project evolved to use Next.js full-stack approach
- **Migration**: ✅ **COMPLETE** - All functionality successfully migrated to Next.js API routes in `apps/web/app/api/`
- **Recommendation**: **DO NOT USE** - Use the Next.js API routes instead

## What Was Migrated

### ✅ Fully Migrated Features
All Express.js functionality has been completely reimplemented in Next.js:

#### Authentication System
- User registration and login
- JWT token management
- Session handling
- Password hashing and validation
- **New**: better-auth integration for enhanced security

#### Room Management
- Create, read, update, delete rooms
- Room sharing and access control
- Room member management
- Permission-based access (Owner/Admin/Member)

#### Database Operations
- Complete Prisma ORM integration
- Transaction support for complex operations
- Type-safe database queries
- Migration system for schema changes

#### API Validation
- Zod schema validation for all endpoints
- Request/response type safety
- Error handling and user feedback
- Rate limiting and security measures

## New Next.js Implementation Benefits

### Performance Improvements
- **Server-side Rendering**: Better SEO and initial load times
- **Edge Runtime**: Faster API responses with edge deployment
- **Built-in Optimization**: Automatic code splitting and optimization
- **Streaming**: Progressive loading for better user experience

### Developer Experience
- **Full-stack TypeScript**: End-to-end type safety
- **Hot Reload**: Faster development with instant updates
- **Integrated API**: No need for separate backend server
- **Modern React**: React 19 with latest features

### Security Enhancements
- **better-auth**: Modern authentication with enhanced security
- **Built-in CSRF Protection**: Automatic security measures
- **Environment Security**: Secure environment variable handling
- **Edge Security**: Enhanced security with edge deployment

## Current Architecture

```
Old (Deprecated):          New (Active):
Express API Server    →     Next.js API Routes
├── /auth            →     ├── /app/api/auth
├── /rooms           →     ├── /app/api/rooms
├── /users           →     ├── /app/api/users
└── /middleware      →     └── /middleware.ts
```

## Migration Guide

If you're looking at this deprecated Express code for reference, here's how to find the equivalent in the new Next.js implementation:

### Express Routes → Next.js API Routes
```bash
# Old Express routes
apps/api-server/src/routes/auth.routes.ts
→ apps/web/app/api/auth/*/route.ts

apps/api-server/src/routes/room.routes.ts  
→ apps/web/app/api/rooms/*/route.ts
```

### Express Controllers → Next.js Route Handlers
```bash
# Old Express controllers
apps/api-server/src/controllers/auth.controller.ts
→ apps/web/app/api/auth/*/route.ts (GET, POST, etc.)

apps/api-server/src/controllers/room.controller.ts
→ apps/web/app/api/rooms/*/route.ts (GET, POST, PUT, DELETE)
```

### Express Middleware → Next.js Middleware
```bash
# Old Express middleware
apps/api-server/src/middlewares/auth.middleware.ts
→ apps/web/src/middleware.ts
→ apps/web/src/lib/auth-middleware.ts
```

## Removal Timeline

- **Phase 1**: ✅ All functionality migrated (Complete)
- **Phase 2**: ✅ New system tested and validated (Complete)
- **Phase 3**: ⚠️ This deprecated code marked for removal
- **Phase 4**: 🗑️ Will be removed in future cleanup

## For Developers

### If You Need Express Reference
The deprecated Express code is kept temporarily for reference purposes only. **Do not attempt to run or maintain this code.**

### For New Development
- Use Next.js API routes in `apps/web/app/api/`
- Follow the patterns established in the new implementation
- Refer to `apps/web/README.md` for current API documentation

### For Learning
If you're learning Express.js, this code can serve as a reference, but understand that:
- It's incomplete and not fully functional
- The Next.js implementation is the production-ready version
- Modern full-stack development often favors Next.js approach

---

## 📚 Educational Value

While deprecated, this Express implementation demonstrates:
- Basic Express.js server setup
- RESTful API design patterns
- Middleware implementation
- Database integration with Prisma
- JWT authentication basics

**However, the Next.js implementation shows more modern approaches to:**
- Full-stack TypeScript development
- Integrated frontend and backend
- Modern authentication patterns
- Edge-ready deployment
- Performance optimization

---

## ⚡ Quick Migration Reference

For developers migrating similar projects:

| Express Concept | Next.js Equivalent |
|---|---|
| `app.get('/api/path')` | `export async function GET()` in `route.ts` |
| `app.post('/api/path')` | `export async function POST()` in `route.ts` |
| Express middleware | Next.js middleware or route-level logic |
| `req.body` | `await request.json()` |
| `res.json()` | `return Response.json()` |
| Express error handling | Try-catch with `Response.json()` |

---

**⚠️ Remember: This code is deprecated. Use the Next.js implementation in `apps/web/` for all development.** 