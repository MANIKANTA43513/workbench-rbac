# Workbench RBAC System

Role and permission builder for Workbench teams — SDE Intern assignment.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll land on the dashboard.

## What's included

- **Dashboard** — overview of roles, users, and permission resources
- **Roles** — create, edit, and delete custom roles using the permission matrix
- **Users** — assign/unassign roles to team members, inspect effective permissions

## Seed data

Four users and five roles are pre-loaded on first run:

| User | Roles |
|---|---|
| Aria Patel | Owner |
| Marcus Chen | Admin + Contractor (two roles) |
| Sofia Reyes | Member |
| James Okafor | Viewer |

| Role | Type |
|---|---|
| Owner | System |
| Admin | System |
| Member | System |
| Viewer | System |
| Contractor | Custom (can be edited/deleted) |

## API endpoints

```
GET    /api/permissions
GET    /api/roles
POST   /api/roles
PATCH  /api/roles/:id
DELETE /api/roles/:id
GET    /api/users
POST   /api/users/:id/roles/:roleId
DELETE /api/users/:id/roles/:roleId
GET    /api/users/:id/permissions
```

## Tech stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zustand
- Radix UI primitives

See [Architecture.md](./Architecture.md) for design decisions and permission resolution logic.
