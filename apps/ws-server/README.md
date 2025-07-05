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

--- 