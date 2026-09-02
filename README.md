## Tech Stack

* **Next.js** — App Router and API route handlers
* **React + TypeScript**
* **SQLite** — local persistence using Node's built-in `node:sqlite`
* **Zod** — request and AI response validation
* **TanStack Query** — client-side server state management
* **React Hook Form** — form handling
* **Vitest** — automated tests
* **Mock AI Provider** — deterministic AI implementation for local development and testing

## Features
* Create and list work items
* Filter work items by status
* View individual work items and their analysis
* Analyse received work items using an AI provider
* Retry failed AI analysis
* Complete work items after review
* Enforce valid status transitions
* Prevent duplicate `externalId` values at the database level
* Validate AI responses before persisting them
* Handle AI failures without leaving items stuck in an intermediate state
* Paginate the work item list
* Automated tests for core business logic

## Workflow
Work items move through the following states:

```text
RECEIVED
    ↓
ANALYSING
    ↓
READY_FOR_REVIEW
    ↓
COMPLETED
ANALYSING → FAILED
FAILED → ANALYSING
```

Invalid transitions are rejected by the backend.
For example:
* `RECEIVED → COMPLETED` is not allowed
* `READY_FOR_REVIEW → ANALYSING` is not allowed
* `COMPLETED → RECEIVED` is not allowed

The state transition rules are kept separate from the API layer so that they can be tested independently.

## Architecture
The application is intentionally kept small and uses a simple layered structure:

```text
Frontend
   │
   │ HTTP
   ▼
API Route Handlers
   │
   ▼
Controllers
   │
   ▼
Services
   ├── Work Item Service
   └── Analysis Service
          │
          ▼
      AI Provider
   │
   ▼
SQLite
```

## Database

The application uses SQLite with the following main table:

work_items
├── id
├── external_id
├── title
├── description
├── status
├── category
├── priority
├── summary
├── recommended_action
├── created_at
└── updated_at


`external_id` has a database-level `UNIQUE` constraint.

This is intentional: duplicate work items can potentially be submitted concurrently, so checking for duplicates only in application code would not be sufficient.

SQLite also uses WAL mode to provide better read/write concurrency for the local application.

## Getting Started

### Requirements

* Node.js 22.5+
* npm

The project uses Node's built-in `node:sqlite`, so no native SQLite package or separate database server is required.

### Install dependencies
npm install

### Seed sample data
npm run seed

This creates a set of work items across the different workflow states so the UI can be tested quickly.

### Start the development server

npm run dev

### Run tests

npm test


## Design Decisions & Trade-offs

### 1. SQLite instead of a separate database

SQLite keeps the assessment easy to run locally and removes the need for PostgreSQL or another external service.

For a production system with multiple application instances and higher write concurrency, I would use PostgreSQL instead.

### 2. Single Next.js application

The frontend and backend are kept in the same application using Next.js API route handlers.

For this scope, a separate Express/NestJS service would add deployment and infrastructure overhead without providing much benefit.

If the system grew significantly, the API could be extracted into a separate service without changing the core domain/service structure.

### 3. Mock AI provider

The AI provider is intentionally abstracted and currently uses a deterministic mock implementation.

This keeps development and testing reliable and avoids requiring API keys or network access.

In production, the same interface could be implemented using an external AI provider with appropriate timeout, retry, logging, and monitoring behaviour.

