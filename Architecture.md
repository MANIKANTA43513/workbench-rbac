# Architecture.md — Workbench RBAC System

## Stack choices

### Frontend — Next.js 14 (App Router)

Next.js with the App Router was chosen for three concrete reasons:

1. **Colocation of API and UI.** The API routes live inside the same project (`src/app/api/`). There's no separate server to spin up, no CORS config, no monorepo overhead — just `next dev` and both sides are running.

2. **React Server Components.** Pages that don't need client interactivity can stream HTML from the server with zero JS. In this project the pages are intentionally client components (because of Zustand subscriptions), but the infrastructure is in place.

3. **File-system routing.** `/roles` → `src/app/roles/page.tsx`. No router config, clear mental model.

### State management — Zustand

Redux is too ceremonial for a prototype. React Query adds a dependency and abstraction layer we don't need since there's no caching requirement. Zustand gives us:

- A single `create()` call per slice (roles, users, permissions, toasts)
- Direct async actions inside the store — no middleware
- Zero boilerplate for reading state in components

### UI — Tailwind CSS + Radix UI primitives

Tailwind enforces a consistent spacing/color scale. Radix provides accessible headless primitives (Dialog, Checkbox, Label) that we style ourselves. This avoids the "shadcn copy-paste" approach that often brings in 40+ files of generated code; here every component is hand-written and typed.

### Backend — Next.js Route Handlers + In-memory store

Route handlers (`GET`, `POST`, `PATCH`, `DELETE`) in `src/app/api/` implement a REST-ish API:

```
GET    /api/permissions              → all resource groups
GET    /api/roles                    → list all roles
POST   /api/roles                    → create a role
GET    /api/roles/:id                → get one role
PATCH  /api/roles/:id                → update a role
DELETE /api/roles/:id                → delete (non-system) role
GET    /api/users                    → list all users
POST   /api/users/:id/roles/:roleId  → assign role to user
DELETE /api/users/:id/roles/:roleId  → unassign role from user
GET    /api/users/:id/permissions    → effective permissions
```

The `Store` class in `src/lib/store.ts` is a singleton (`let globalStore`) that survives across hot reloads in development. It's reset when the Node.js process restarts. A database would replace the `Map` backing with SQL queries — the API surface doesn't change.

---

## Permission resolution — Union logic

**Decision: a user's effective permissions are the union of all permissions across all their assigned roles.**

### Why union?

The alternative is intersection (a user only gets permissions that *every* role grants). Intersection is the safer default for multi-tenancy but actively hostile to usability when combining roles:

- Marcus is an **Admin** and a **Contractor**.
- Admin has 17 permissions including full project and task access.
- Contractor has 5 permissions (view projects, view/create/edit/assign tasks).
- Under intersection, Marcus would have only the 5 permissions that appear in *both* roles — effectively the Contractor role wins and his Admin powers vanish.
- Under union, Marcus has all 17 Admin permissions *plus* the Contractor permissions that aren't already covered.

**Union is additive: each role grants extra capabilities, never removes them.** This matches how every mainstream SaaS (GitHub, Linear, Notion) implements multi-role systems. If you need to restrict a user, you simply don't assign them the permissive role.

### Implementation

```ts
getEffectivePermissions(userId: string): string[] {
  const user = this.users.get(userId);
  if (!user) return [];
  const permSet = new Set<string>();
  for (const roleId of user.roleIds) {
    const role = this.roles.get(roleId);
    if (role) role.permissions.forEach((p) => permSet.add(p));
  }
  return Array.from(permSet);
}
```

A `Set` deduplicates naturally. Order doesn't matter. The result is stable regardless of role assignment order.

---

## Folder structure

```
workbench/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── permissions/route.ts
│   │   │   ├── roles/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   └── users/
│   │   │       ├── route.ts
│   │   │       ├── [id]/
│   │   │       │   ├── permissions/route.ts
│   │   │       │   └── roles/[roleId]/route.ts
│   │   ├── dashboard/page.tsx
│   │   ├── roles/page.tsx
│   │   ├── users/page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx            ← redirects to /dashboard
│   ├── components/
│   │   ├── layout/
│   │   │   └── sidebar.tsx
│   │   ├── permissions/
│   │   │   ├── permission-matrix.tsx
│   │   │   └── effective-permissions-card.tsx
│   │   ├── roles/
│   │   │   ├── role-card.tsx
│   │   │   └── role-form-dialog.tsx
│   │   ├── users/
│   │   │   └── user-card.tsx
│   │   └── ui/
│   │       ├── avatar.tsx
│   │       ├── button.tsx
│   │       ├── primitives.tsx  ← Badge, Input, Textarea, Label, Checkbox, Dialog, Separator
│   │       └── toaster.tsx
│   ├── lib/
│   │   ├── store.ts            ← in-memory data + seed data
│   │   └── utils.ts
│   ├── store/
│   │   └── index.ts            ← Zustand stores
│   └── types/
│       └── index.ts
├── Architecture.md
├── README.md
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

---

## Trade-offs

| Decision | Trade-off accepted |
|---|---|
| In-memory store | Data resets on server restart — acceptable for a prototype |
| Union permission logic | Roles can only add permissions, never restrict — intentional for team use |
| No auth | Out of scope per assignment spec |
| No tests | Out of scope per assignment spec |
| Singleton store | Works in single-process Node.js; not suitable for multi-instance deployment without Redis/DB |
