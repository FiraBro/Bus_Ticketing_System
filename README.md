# Bus Ticketing System Monorepo

Enterprise-grade Bus Ticketing System built with a scalable monorepo architecture. 
Featuring TypeScript, Docker, Prisma, PostgreSQL, React, and Express.

## Project Structure

```txt
bus-ticketing-system/
├── apps/
│   ├── web/           # React + Vite frontend
│   └── api/           # Express + Prisma backend
├── packages/
│   └── types/         # Shared TypeScript interfaces & DTOs
└── docker/            # Nginx config and Docker files
```

## Running the Application

This project provides `docker-compose` setups for seamless development and production environments.

### Development Mode

Run the entire stack with hot-reloading:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

Alternatively, run locally without Docker:

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start services:
   ```bash
   npm run dev
   ```

### Production Mode

Run the production-grade multi-stage container build behind Nginx:

```bash
docker-compose up --build
```
- Maps port `80` to the frontend static Nginx server.
- The Nginx proxy handles routing `/api/*` directly to the `api` service.

## Tech Stack

### Frontend (`apps/web`)
- React 18, Vite
- TypeScript
- Tailwind CSS
- React Router
- React Query & Zustand
- Zod & React Hook Form
- Lucide React

### Backend (`apps/api`)
- Node.js & Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- Docker & Nginx
- Zod Validation
- JWT Authentication

## Modules Implemented

- **Monorepo setup**: NPM workspaces configured. Shared `@bus/types` package.
- **Dockerization**: Nginx reverse proxy, multi-stage production builds, hot-reloading dev environments.
- **Database Architecture**: Full Prisma Schema setup with `User`, `Bus`, `Trip`, `Booking`, and `Seat` relations.
- **RESTful API**: Global custom error handling, async middleware.
- **Modules**: Auth (Login/Register), generic Trip and Bus resources backend.
- **Web**: Modern Tailwind configured scalable React app implementation.
