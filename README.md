# Squad Draw Monorepo

## Project Overview

This monorepo contains a full-stack application with the following structure:

- **apps/web**: Next.js frontend app with integrated API routes
- **apps/api-server**: ⚠️ **DEPRECATED** - Express REST API server (not maintained, moved to Next.js API routes)
- **apps/ws-server**: WebSocket server (Socket.IO)
- **packages/**: Shared code (UI, config, db, schemas, TypeScript config, ESLint config)

---

## Current Progress

### ⚠️ apps/api-server (DEPRECATED)
- **Status**: **NOT MAINTAINED** - This Express backend is deprecated and incomplete
- **Reason**: Originally created for learning purposes, functionality has been moved to Next.js API routes
- **Migration**: All room-related functionality has been migrated to `apps/web/app/api/`
- **Note**: Authentication will be implemented using better-auth in the Next.js app

### apps/ws-server (WebSocket Server)
- **Framework**: Socket.IO (with HTTP server)
- **Auth**: Custom middleware (`authMiddleware`) for authenticating socket connections
- **Events**:
  - `join-room`: User joins a room (checks membership, emits success/error, notifies others)
  - `leave-room`: User leaves a room (checks membership, emits success/error, notifies others)
- **Room Logic**: Only authenticated users who are members of a room can join/leave
- **DB**: Uses Prisma ORM via `@repo/db` for room and membership checks
- **Status**: Room join/leave logic fully implemented with robust error handling

### apps/web (Full-Stack App)
- **Framework**: Next.js 15, React 19
- **UI**: Uses local UI package (`@repo/ui`)
- **API**: Integrated Next.js API routes for all backend functionality
- **Features**: 
  - Complete room management (create, join, leave, delete)
  - Member management (kick, promote, demote)
  - Room sharing functionality
  - Messages and shapes handling
  - Responsive UI with custom components
- **Status**: Active development - full-stack application with integrated API

### packages/schemas
- **Validation**: Zod for schema validation
- **Schemas**: `UserSignupSchema`, `UserLoginSchema`, `CreateRoomSchema`
- **Types**: Exports TypeScript types inferred from Zod schemas

### packages/db
- **ORM**: Prisma
- **Schema**: User, Room, RoomMember models
- **Migrations**: Multiple migration files for evolving DB structure

### packages/ui
- **Components**: Button, Card, Code (React components)
- **Shared**: Used by both web and (potentially) other apps

### packages/config, typescript-config, eslint-config
- **Config**: Shared configuration for API, WS, and web apps
- **TypeScript**: Centralized tsconfig for all packages/apps
- **ESLint**: Centralized linting rules

---

## Setup & Development

- Local repository set up and pushed to GitHub: https://github.com/hit-7624/squad-draw.git
- All branches and progress are tracked in this monorepo.
