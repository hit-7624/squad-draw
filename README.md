# Squad Draw Monorepo

## Project Overview

This monorepo contains a full-stack application with the following structure:

- **apps/web**: Next.js frontend app
- **apps/api-server**: Express REST API server
- **apps/ws-server**: WebSocket server (Socket.IO)
- **packages/**: Shared code (UI, config, db, schemas, TypeScript config, ESLint config)

---

## Current Progress

### apps/api-server (REST API)
- **Framework**: Express
- **Endpoints**:
  - `POST /signup`: Registers a new user (expects `email`, `password`, `name` in body; creates user in DB)
  - `POST /login`: Authenticates a user (expects `email`, `password`; returns JWT if credentials are valid)
- **Auth**: JWT-based (token issued on login)
- **DB**: Uses Prisma ORM via `@repo/db`
- **Status**: Basic user authentication and registration implemented

### apps/ws-server (WebSocket Server)
- **Framework**: Socket.IO (with HTTP server)
- **Auth**: Custom middleware (`authMiddleware`) for authenticating socket connections
- **Events**:
  - `join-room`: User joins a room (checks membership, emits success/error, notifies others)
  - `leave-room`: User leaves a room (checks membership, emits success/error, notifies others)
- **Room Logic**: Only authenticated users who are members of a room can join/leave
- **DB**: Uses Prisma ORM via `@repo/db` for room and membership checks
- **Status**: Room join/leave logic fully implemented with robust error handling

### apps/web (Frontend)
- **Framework**: Next.js 15, React 19
- **UI**: Uses local UI package (`@repo/ui`)
- **Features**: Basic landing page, shared Button component, custom font loading, responsive styles
- **Status**: Boilerplate Next.js app, ready for further feature development

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
