# Kanghan Valley Resort & Camping - Internal Management System

Internal management system for Kanghan Valley Resort & Camping.
All UI in Lao language, currency LAK.

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript)
- **Database:** MySQL + Prisma ORM 6
- **Auth:** NextAuth v5 (credentials, JWT)
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Music:** yt-dlp (YouTube audio extraction)

## Modules

1. **Room Booking** - CRUD room types/rooms, booking form, calendar view, double-booking prevention, invoice (A4 print/image export)
2. **Food/Banquet Billing** - Flexible item entry, banquet tables, same invoice format
3. **Music Player** - YouTube search via yt-dlp, queue management, playback controls
4. **Digital Menu** - Admin image upload, public flipbook at `menu.kanghan.site`

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your MySQL credentials

# 3. Push database schema
npm run db:push

# 4. Seed initial data
npm run db:seed

# 5. Start dev server (port 3009)
npm run dev
```

## Default Credentials

- **Admin:** admin / admin123
- **Staff:** staff / staff123

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on port 3009 |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed initial data |
| `npm run db:studio` | Open Prisma Studio |

## Subdomain Routing

- `app.kanghan.site` - Modules 1-3 (auth required)
- `menu.kanghan.site` - Module 4 (public digital menu)
- `localhost:3009` - Development (redirects to `/app/dashboard`)

## Project Structure

```
src/
  app/
    api/          # API routes (bookings, rooms, food-orders, settings, music, menu-pages)
    app/          # Authenticated pages (dashboard, bookings, rooms, food-orders, music, menu-admin, settings)
    menu/         # Public digital menu
  components/
    ui/           # Reusable UI (Button, Input, Modal, Toast)
    layout/       # Sidebar
    invoice/      # Invoice template + actions
  lib/            # Prisma client, auth, utils, constants, validators
  types/          # TypeScript type definitions
prisma/
  schema.prisma   # Database schema
  seed.ts         # Database seeder
```
