# 🏠 Domus – Smart Co-Living Platform

Domus is a Progressive Web Application (PWA) for shared household management. It helps roommates coordinate chores, track shared expenses, and communicate through shared notes in one place.

> **Academic Project:** This project was developed in fulfilment of the requirements for course **DLMCSPSE01 – Project: Software Engineering** in the **Master of Science in Computer Science** program at the **International University of Applied Sciences (IU)**.

---

## Overview

Shared households often struggle with uneven chore distribution, inconsistent expense tracking, and communication gaps. Existing tools usually solve only one of those problems at a time, which forces users to switch between multiple apps.

Domus centralizes those workflows into a single platform.

### Core Features

- **Task Management** – Create, assign, and track shared chores with deadlines
- **Expense Tracking** – Record paid or planned shared costs with balance calculation
- **Shared Notes** – Leave reminders and messages for all household members
- **Dashboard** – View pending tasks, overdue items, balances, and recent activity
- **Role-Based Access Control** – Support different permissions for household members
- **PWA Support** – Installable on mobile and desktop

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript |
| Backend | NestJS, TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | JWT + bcrypt |
| Containerization | Docker + Docker Compose |

---

## Project Structure

```text
Domus/
├── frontend/              # Next.js app
├── backend/               # NestJS API + Prisma schema/migrations
├── docker-compose.yml     # Full multi-service local stack
├── README.md
└── docs/                  # Project docs used during development
```

---

## Quick Start With Docker

This is the recommended setup for assessors, tutors, and anyone who wants the app running with the fewest manual steps.

### Prerequisites

- Docker Desktop or Docker Engine with Docker Compose support

### Run the Full Stack

From the project root:

```bash
docker compose up --build
```

This starts:

- `frontend` on [http://localhost:3000](http://localhost:3000)
- `backend` on [http://localhost:3001](http://localhost:3001)
- `postgres` on port `5432`

### What Happens Automatically

- The backend container runs `prisma migrate deploy` on startup
- The database schema is created/updated before the NestJS server starts
- The frontend is built with `NEXT_PUBLIC_API_URL=http://localhost:3001`

### Stop the Stack

```bash
docker compose down
```

To also remove the database volume:

```bash
docker compose down -v
```

### Rebuild After Code Changes

```bash
docker compose up --build
```

---

## Professor Quick Start

If you only want to run and assess the project:

1. Install Docker.
2. Open a terminal in the project root.
3. Run:

```bash
docker compose up --build
```

4. Open [http://localhost:3000](http://localhost:3000).

The backend API will be available at [http://localhost:3001](http://localhost:3001).

If you want to stop everything:

```bash
docker compose down
```

---

## Local Development Without Docker

Use this only if you want to run the services manually.

### Prerequisites

- Node.js 20+
- npm
- PostgreSQL

### 1. Configure Environment Variables

Copy the example files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Update the database credentials in `backend/.env` if your local PostgreSQL setup differs from the defaults.

### 2. Install Dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 3. Run Database Migrations

```bash
cd backend
npx prisma migrate deploy
```

If you are actively iterating on the schema during development, you can also use:

```bash
npx prisma migrate dev
```

### 4. Start the Backend

```bash
cd backend
npm run start:dev
```

The API will run on `http://localhost:3001`.

### 5. Start the Frontend

In a second terminal:

```bash
cd frontend
npm run dev
```

The app will run on `http://localhost:3000`.

---

## Environment Variables

### Backend

See `backend/.env.example`.

- `PORT` – backend port, defaults to `3001`
- `CORS_ORIGIN` – allowed frontend origin
- `DATABASE_URL` – main PostgreSQL connection used by the app
- `DIRECT_URL` – direct PostgreSQL connection used for Prisma migrations

### Frontend

See `frontend/.env.example`.

- `NEXT_PUBLIC_API_URL` – public backend base URL used by the browser

---

## Useful Commands

### Backend

```bash
cd backend
npm run start:dev
npm run build
npm run test:unit
npm run test:e2e
```

### Frontend

```bash
cd frontend
npm run dev
npm run build
npm test -- --runInBand
```

### Docker

```bash
docker compose up --build
docker compose down
docker compose down -v
```

---

## Notes

- Planned expenses are stored in the app but do not affect balances until they are marked as paid.
- The backend must be migrated whenever the Prisma schema changes.
- If the frontend shows API errors after a schema change, the first thing to verify is whether the latest Prisma migration has been applied.

---

## Development Methodology

This project followed an **Agile, Scrum-inspired iterative development** approach with short sprints and iterative refinement based on testing and user feedback.

## License

This project is developed for academic purposes.
