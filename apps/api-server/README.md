# API Server Overview

## Current Progress

- **Framework**: Express
- **Endpoints**:
  - `POST /signup`: Registers a new user (expects `email`, `password`, `name` in body; creates user in DB)
  - `POST /login`: Authenticates a user (expects `email`, `password`; returns JWT if credentials are valid)
- **Auth**: JWT-based (token issued on login)
- **DB**: Uses Prisma ORM via `@repo/db`
- **Status**: Basic user authentication and registration implemented

--- 