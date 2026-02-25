# ClubZen Cash Flow Management System (CFMS)

**CSE412 Software Engineering Project - Group 19 - Spring 2026**

## Project Overview

A web-based Cash Flow Management System for tracking income and expenses with financial summaries.

### Technology Stack

> **Note:** The database schema was recently extended with `income_type` on the
> `income` table and `payment_method` on `expense`.  Developers must run the
> corresponding migration or re-import `src/supabase/schema.sql` before
> executing tests or starting the app, otherwise inserts will fail with unknown
> column errors.


- **Language:** TypeScript
- **Frontend:** React 18
- **Backend:** Node.js
- **Testing:** Jest

### Features (Planned)

- Add transactions (Income/Expense).
- View transaction list.
- Monthly financial summary.
- Category-wise breakdown.
- Overall profit/loss calculation.
- Due Management.
- Staff Role with only add permissions.

## Project Structure

```
clubzen-cfms/
├── src/
│   ├── domain/           # Domain layer
│   ├── services/         # Service layer (business logic)
│   ├── controllers/      # Controller layer
│   ├── data/             # Data layer
│   └── ui/               # UI components (React)
│   └── data_access/      # Data Access Layer 
├── tests/                # Unit tests
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

