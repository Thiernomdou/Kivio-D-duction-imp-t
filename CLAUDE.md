# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kivio is a French tax optimization web application that helps users calculate potential tax deductions related to financial transfers (specifically case 6GU - alimony/family support deductions in French tax returns).

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Supabase (Auth + PostgreSQL), Framer Motion

## Commands

```bash
npm run dev      # Development server on http://localhost:3000
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint checks
```

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anon key

## Architecture

### User Flow States (in `/src/app/page.tsx`)

The main page manages three states:
1. **hero** - Landing page with marketing CTA
2. **audit** - 6-step tax questionnaire (`SmartAudit.tsx`)
3. **result** - Tax calculation results (`AuditResult.tsx`)

### Core Business Logic

**Tax Calculator** (`/src/lib/tax-calculator.ts`):
- Implements 2024 French tax brackets (0%, 11%, 30%, 41%, 45%)
- Calculates fiscal parts (quotient familial) based on marital status and children
- Returns: tax gain, marginal tax rate (TMI), tax before/after, annual deduction

```typescript
calculateTaxGain(monthlySent, annualIncome, isMarried, childrenCount)
```

### Data Layer

**Supabase modules** (`/src/lib/supabase/`):
- `client.ts` - Browser-side Supabase client (singleton)
- `server.ts` - Server-side client with cookies
- `simulations.ts` - CRUD for tax_simulations table
- `fiscal-profile.ts` - CRUD for profiles fiscal data
- `types.ts` - Database schema TypeScript types

**Database tables** (all RLS-protected):
- `profiles` - User fiscal data, auto-created on signup via trigger
- `tax_simulations` - Saved tax calculations
- `documents` - Receipt/proof file metadata for OCR

### Data Persistence Strategy

Three-tier approach:
1. **sessionStorage** - Session ID
2. **localStorage** - Pending simulation data (24h expiry, auto-cleared after DB save)
3. **Supabase** - Permanent storage for authenticated users

### Context Providers

- `AuthContext` (`/src/contexts/AuthContext.tsx`) - User session, profile, sign up/in/out
- `DashboardContext` (`/src/contexts/DashboardContext.tsx`) - Dashboard data, simulations, documents

### Protected Routes

Dashboard area (`/src/app/dashboard/`) requires authentication:
- `/dashboard` - Tax recovery overview
- `/dashboard/documents` - Document management
- `/dashboard/settings` - User profile settings

## Key Patterns

- Path alias: `@/*` maps to `./src/*`
- All database operations use Row Level Security
- Auth callback handled at `/auth/callback/route.ts`
- French language throughout UI (comments and code may mix French/English)
