# Srothas Ayurveda Room Management — Frontend

A clean, modern Next.js 14 frontend for the Srothas Ayurveda Panchakarma Healthcare room management system.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Axios** (with JWT interceptor)
- **FullCalendar** (booking calendar)
- **Lucide React** (icons)
- **React Hot Toast** (notifications)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

The `.env.local` file is already set:

```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Change this if your backend runs on a different host/port.

### 3. Run the development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 4. Build for production

```bash
npm run build
npm start
```

## Credentials

Default credentials (from backend):
- **Username:** `srothasayurveda`
- **Password:** `user123`

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Login page |
| `/dashboard` | Room dashboard with metrics and room grid |
| `/dashboard/rooms/[roomId]` | Room detail with calendar and booking list |

## Features

- JWT authentication with auto-redirect
- Dashboard with total/occupied/available/occupancy metrics
- Search and filter rooms
- Add/Delete rooms from Settings menu
- Room detail page with FullCalendar
- Booking calendar with blue event blocks and hover tooltips
- New booking modal (name, age, nationality, address, checkin, checkout)
- Change password modal
- Toast notifications for all actions
- Loading states throughout

## Project Structure

```
app/
  layout.tsx           # Root layout with fonts and Toaster
  globals.css          # Tailwind + FullCalendar overrides
  page.tsx             # Root redirect
  login/page.tsx       # Login page
  dashboard/
    page.tsx           # Dashboard
    rooms/[roomId]/
      page.tsx         # Room detail page

components/
  Navbar.tsx           # Top navigation with dropdowns
  RoomCard.tsx         # Room grid card
  RoomCalendar.tsx     # FullCalendar wrapper (dynamic import)
  BookingModal.tsx     # New booking form modal
  AddRoomModal.tsx     # Add room modal
  DeleteRoomModal.tsx  # Delete room modal
  ChangePasswordModal.tsx

lib/
  api.ts               # Axios instance with JWT interceptor
  auth.ts              # Token helpers

services/
  index.ts             # API service layer (auth, rooms, bookings)

types/
  index.ts             # TypeScript interfaces
```
