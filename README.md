# 🏠 Domus – Smart Co-Living Platform

A Progressive Web Application (PWA) for shared household management, enabling roommates to coordinate tasks, track shared expenses, and communicate through shared notes.

> **Academic Project:** This project is developed in fulfilment of the requirements for course **DLMCSPSE01 – Project: Software Engineering** in the **Master of Science in Computer Science** program at the **International University of Applied Sciences (IU)**.

---

## Problem

Shared households face recurring challenges: uneven chore distribution, inconsistent expense tracking, and communication gaps. Existing tools address only a single aspect, forcing users to juggle multiple disconnected apps.

Domus solves this by centralizing household coordination into a single platform.

## Features

- **Task Management** – Create, assign, and track shared chores with deadlines
- **Expense Tracking** – Record shared costs with automatic balance calculation
- **Shared Notes** – Leave reminders and messages for all household members
- **Dashboard** – At-a-glance overview of tasks, balances, and recent activity
- **Role-Based Access Control** – Admin and member roles with appropriate permissions
- **PWA Support** – Installable on mobile/desktop with offline capability

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js (TypeScript), TailwindCSS |
| Backend | NestJS (Node.js, TypeScript) |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | JWT + bcrypt |
| Deployment | Vercel (frontend), Render (backend), Supabase (database) |

## Project Structure

```
Domus/
├── frontend/          # Next.js PWA (App Router, TailwindCSS)
├── backend/           # NestJS REST API (Prisma, JWT auth)
├── docs/              # Project specifications (not tracked in git)
└── README.md
```

## Getting Started

### Prerequisites

- Node.js v18+
- npm
- PostgreSQL database (or Supabase account)

### Backend Setup

```bash
cd backend
npm install
# Add your database connection string to .env
npx prisma migrate dev
npm run start:dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Development Methodology

This project follows an **Agile, Scrum-inspired iterative development** methodology, structured into weekly sprints with incremental feature delivery.

## License

This project is developed for academic purposes.
