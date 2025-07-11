# WebSocket Server Overview

## Current Progress

- **Framework**: Socket.IO (with HTTP server)
- **Auth**: Custom middleware (`authMiddleware`) for authenticating socket connections
- **Events**:
  - `join-room`: User joins a room (checks membership, emits success/error, notifies others)
  - `leave-room`: User leaves a room (checks membership, emits success/error, notifies others)
- **Room Logic**: Only authenticated users who are members of a room can join/leave
- **DB**: Uses Prisma ORM via `@repo/db` for room and membership checks
- **Status**: Room join/leave logic fully implemented with robust error handling

## Integration Notes

- **Backend Migration**: REST API functionality has been moved from Express (`apps/api-server`) to Next.js API routes (`apps/web/app/api/`)
- **Authentication**: Will be updated to work with better-auth implementation in the Next.js app
- **Coordination**: WebSocket events work alongside the Next.js API routes for real-time functionality

--- 