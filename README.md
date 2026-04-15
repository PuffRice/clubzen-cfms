# ClubZen Cash Flow Management System (CFMS)

**CSE412 Software Engineering Project - Group 19 - Spring 2026**

## Project Overview

A web-based Cash Flow Management System for tracking income and expenses with financial summaries.

### Technology Stack

- **Language:** TypeScript
- **Frontend:** React 18 + React Router + Tailwind CSS
- **Backend:** Node.js + Supabase (PostgreSQL)
- **Testing:** Vitest
- **UI Components:** Radix UI + shadcn/ui
- **Build Tool:** Vite
- **Database:** Supabase (PostgreSQL)
- **Reports:** jsPDF, html2canvas, XLSX

> **Note:** The database schema includes `income_type` on the `income` table and `payment_method` on `expense`. Developers must run the corresponding migration or re-import `src/supabase/schema.sql` before executing tests or starting the app.

### Features

- **Transaction Management:** Add, edit, and delete income/expense transactions
- **Exchange Rates:** Multi-currency support with automatic currency conversion
- **Reports:** Generate monthly and daily financial reports (PDF, Excel)
- **Financial Summaries:** Monthly and daily financial overviews
- **Category Management:** Organize transactions by categories
- **Loan Management:** Track loans and repayments with automatic tracking
- **Role-Based Access:** Admin and Staff roles with different permission levels
- **Support Tickets:** Integrated support ticket system
- **System Administration:** Super admin panel for system management

## Project Structure

```
clubzen-cfms/
├── src/
│   ├── app/
│   │   ├── pages/                # Page components (Dashboard, Reports, etc.)
│   │   ├── components/           # Reusable UI components
│   │   │   └── ui/               # shadcn/ui base components
│   │   ├── App.tsx               # Main App component
│   │   ├── routes.ts             # Route definitions
│   │   ├── services.ts           # DI container (service instances)
│   │   ├── CurrencyContext.tsx    # Currency context provider
│   │   └── styles/               # Global styles (CSS, Tailwind)
│   ├── controller/               # Controller layer (API handlers)
│   ├── service/                  # Business logic services
│   ├── repository/               # Data access (Supabase repositories)
│   ├── domain/                   # Domain models and entities
│   ├── types/                    # TypeScript type definitions
│   ├── utils/                    # Utility functions
│   ├── styles/                   # Global stylesheets
│   ├── supabase/                 # Supabase configuration and migrations
│   ├── main.tsx                  # Application entry point
│   └── vite-env.d.ts             # Vite environment types
├── tests/                        # Unit and integration tests
├── package.json
├── tsconfig.json
├── vite.config.ts                # Vite configuration
├── vitest.config.ts              # Vitest configuration
└── README.md
```

## Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)
- Supabase account and project

### Step 1: Create Environment Variables

Create a `.env` file in the project root directory with your Supabase credentials:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can get these values from your Supabase project settings.

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including React, TypeScript, Tailwind CSS, Radix UI, and testing dependencies.

### Step 3: Run Development Server

```bash
npm run dev
```

The application will start at `http://localhost:5173` (Vite default port).

### Additional Commands

- **Build for production:** `npm run build`
- **Run tests:** `npm test`

