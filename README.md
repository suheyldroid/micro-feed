# Micro Feed

A modern social media feed application built with Next.js, Supabase, and TypeScript.

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ or [Bun](https://bun.sh/)
- [Supabase](https://supabase.com/) account

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
bun install
```

### 2. Database Setup

1. Create a new project on [Supabase](https://supabase.com/)
2. Go to SQL Editor and run the following schema:

```sql
-- auth.users is given
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  created_at timestamptz default now()
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references profiles(id) on delete cascade,
  content text not null check (char_length(content) <= 280),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists likes (
  post_id uuid references posts(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (post_id, user_id)
);

-- row level security
alter table profiles enable row level security;
alter table posts enable row level security;
alter table likes enable row level security;

-- profiles: read all, write self
create policy "read profiles" on profiles for select using (true);
create policy "upsert self profile" on profiles
for all using (auth.uid() = id) with check (auth.uid() = id);

-- posts: read all; insert/update/delete only own
create policy "read posts" on posts for select using (true);
create policy "insert own posts" on posts for insert with check (auth.uid() = author_id);
create policy "update own posts" on posts for update using (auth.uid() = author_id);
create policy "delete own posts" on posts for delete using (auth.uid() = author_id);

-- likes: read all; like/unlike as self
create policy "read likes" on likes for select using (true);
create policy "like" on likes for insert with check (auth.uid() = user_id);
create policy "unlike" on likes for delete using (auth.uid() = user_id);
```

### 3. Environment Variables

Create `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Get these values from: Project Settings → API → Project URL & anon/public key

### 4. Run the Development Server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Features

- 🔐 **Authentication**: Secure user signup/login with Supabase Auth
- 📝 **Post Creation**: Create, edit, and delete posts (280 character limit)
- ❤️ **Like System**: Like/unlike posts with optimistic updates
- 🔍 **Search & Filter**: Search posts and filter by All/Mine/Liked
- 🎨 **Theme Support**: Light, dark, and system theme modes
- 📱 **Responsive Design**: Mobile-first responsive UI
- ⚡ **Real-time Updates**: Optimistic UI with automatic rollback on failures
- 🔒 **Row Level Security**: Database-level security with Supabase RLS

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Styling**: Tailwind CSS
- **State Management**: TanStack React Query
- **Forms**: React Hook Form + Zod validation
- **UI Components**: Radix UI primitives
- **Animations**: Framer Motion
- **TypeScript**: Full type safety

## Design Notes

**Server Actions**: Chosen over API routes for type safety and eliminating duplicate validations. Server actions are validated client-side before execution.

**Error Handling**: Multi-layered approach with client-side form validation, mutation error callbacks, toast notifications, and server-side try/catch blocks with structured error responses.

**Optimistic Strategy**: Immediate UI updates for better UX with comprehensive rollback mechanisms. All filter views updated simultaneously with race condition prevention.

**RLS Assumptions**: Database-level security as primary boundary. Frontend trusts RLS policies for authorization, enabling simplified client logic while maintaining security.