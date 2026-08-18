# Architecture & Data Flow

This diagram maps how data flows through the expense tracker — from the React frontend, through the Express API, into MongoDB Atlas, and back.

```mermaid
flowchart LR
  subgraph Browser["Browser — React 19 + Vite (client/src)"]
    Auth["Auth.jsx<br/>signup / login"]
    App["App.jsx<br/>user + expenses state, view switching"]
    API["api.js<br/>shared axios instance<br/>baseURL = /api"]
    Views["Views<br/>Expenses / Groups / GroupDetail / Budgets"]
    Chart["SpendingChart.jsx<br/>category pie chart"]
    Modals["Modals<br/>AddExpense / GroupExpense / SetBudget / Confirm"]
  end

  subgraph Supa["Supabase (external)"]
    SBAuth["Supabase Auth<br/>email/password → session"]
  end

  subgraph Server["Express 5 server (server/)"]
    MW["index.js middleware<br/>cors() → express.json()"]
    R1["routes/expenses.js<br/>GET/POST/PUT/DELETE /api/expenses<br/>GET /export/csv, /recurring/due"]
    R2["routes/groups.js<br/>GET/POST/DELETE /api/groups"]
    R3["routes/groupExpenses.js<br/>GET/POST/DELETE /api/group-expenses/:groupId"]
    R4["routes/budgets.js<br/>GET/POST/DELETE /api/budgets"]
    Calc["Computed on the fly<br/>balances + settlements (group expenses)<br/>spent + percentUsed (budgets)"]
  end

  subgraph Mongo["MongoDB Atlas (via Mongoose)"]
    M1[("Expense<br/>expenses")]
    M2[("Group<br/>groups")]
    M3[("GroupExpense<br/>groupexpenses")]
    M4[("Budget<br/>budgets")]
  end

  Auth -- "credentials" --> SBAuth
  SBAuth -- "session + user.id" --> App

  App -- "GET /expenses?userId=" --> API
  Modals -- "onSubmit callbacks" --> App
  App -- "reloadKey bump → re-fetch" --> Views

  API -- "HTTP JSON" --> MW
  MW --> R1 & R2 & R3 & R4

  R1 -- "queries/creates" --> M1
  R2 -- "queries/creates/cascades delete" --> M2
  R3 -- "queries/creates" --> M3
  R4 -- "upserts/queries + spends" --> M4
  M2 -- "groupId ref" --> M3

  M1 --> Calc
  M3 --> Calc
  M4 --> Calc
  Calc -- "JSON response" --> API
  API -- "setState" --> App
  App --> Views
  App --> Chart
  Views -- "props + callbacks" --> Modals

  classDef browser fill:#1e3a5f,stroke:#2b6cb0,color:#fff;
  classDef server fill:#4a2f1e,stroke:#b7791f,color:#fff;
  classDef mongo fill:#0f3d2e,stroke:#2f855a,color:#fff;
  classDef supa fill:#3d2f4a,stroke:#6b46c1,color:#fff;
  class Auth,App,API,Views,Chart,Modals browser;
  class MW,R1,R2,R3,R4,Calc server;
  class M1,M2,M3,M4 mongo;
  class SBAuth supa;
```

## How to read it

1. **Auth** — `Auth.jsx` talks only to Supabase; the backend never sees credentials. The resulting `user.id` is passed to the API as `?userId=` query param / body field (trust-based, no JWT on the server).
2. **Requests** — every component call goes through the single axios instance in `api.js`, which hits `index.js`. Two middleware run: CORS and JSON body parsing.
3. **Routing** — the request lands on one of four routers, which build/run Mongoose queries against MongoDB Atlas.
4. **Computed data** — group balances/settlements and budget `spent`/`percentUsed` are computed per-request in route handlers, never stored.
5. **Responses** — JSON flows back to `App.jsx` state and down to views/charts via props.
6. **Mutations** — modals collect data → `App` calls the API → bumps a `reloadKey` → the affected view re-fetches.