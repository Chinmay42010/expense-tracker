# Expense Tracker & Group Split App

A full-stack expense tracking application with group bill-splitting and automatic debt settlement. Track personal expenses by category, split shared costs with friends, and let the app calculate exactly who owes whom.

**Live app:** https://expense-tracker-xi-hazel-90.vercel.app/
**Backend API:** https://expense-tracker-6cjv.onrender.com

> Note: the backend runs on Render's free tier, which spins down after periods of inactivity. The first request after idle time may take 30-60 seconds to respond while it wakes up.

## Features

- **Authentication** — secure signup/login via Supabase, with expenses isolated per user
- **Personal expense tracking** — add, categorize (Food, Travel, Medical, Shopping, Entertainment, Bills, Other), and filter expenses
- **Spending visualization** — pie chart breakdown of spending by category (Recharts)
- **Group expense splitting** — create groups, log shared expenses, and view real-time balances
- **Settlement algorithm** — automatically calculates net balances and reduces group debts to the minimum number of payments needed to settle up
- **Custom UI** — dark "ledger" theme built around CSS variables for a distinctive, cohesive look

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for a data-flow diagram showing how the frontend, backend, and database interact.

## Tech Stack

**Frontend:** React (Vite), Axios, Recharts, Supabase JS client
**Backend:** Node.js, Express, Mongoose
**Database:** MongoDB Atlas
**Auth:** Supabase
**Deployment:** Vercel (frontend), Render (backend)

## Project Structure

```
expense-tracker/
├── client/          # React frontend
│   ├── src/
│   │   ├── App.jsx
│   │   ├── Auth.jsx
│   │   ├── Groups.jsx
│   │   ├── GroupDetail.jsx
│   │   ├── SpendingChart.jsx
│   │   ├── api.js
│   │   └── supabaseClient.js
│   └── .env         # Supabase keys (not committed)
└── server/          # Express backend
    ├── models/       # Mongoose schemas (Expense, Group, GroupExpense)
    ├── routes/        # API routes
    ├── index.js
    └── .env          # MongoDB URI (not committed)
```

## Getting Started (Run Locally)

### Prerequisites

- Node.js installed
- A MongoDB Atlas account (free tier works)
- A Supabase account (free tier works)

### 1. Clone the repo

```bash
git clone https://github.com/Chinmay42010/expense-tracker.git
cd expense-tracker
```

### 2. Backend setup

```bash
cd server
npm install
```

Create a `.env` file inside `server/`:

```
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

Start the backend:

```bash
npm run dev
```

The API will run at `http://localhost:5000`.

### 3. Frontend setup

Open a new terminal:

```bash
cd client
npm install
```

Create a `.env` file inside `client/`:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_publishable_key
```

Start the frontend:

```bash
npm run dev
```

The app will run at `http://localhost:5173`.

### 4. Point the frontend at your local backend

In `client/src/api.js`, make sure `baseURL` points to your local server:

```js
baseURL: 'http://localhost:5000/api'
```

(Change this back to the deployed Render URL before pushing/deploying.)

## API Overview

| Method | Endpoint                          | Description                          |
|--------|------------------------------------|---------------------------------------|
| GET    | `/api/expenses`                   | Get expenses (filter by `userId`, `category`) |
| POST   | `/api/expenses`                   | Create a new expense                  |
| PUT    | `/api/expenses/:id`                | Update an expense                     |
| DELETE | `/api/expenses/:id`                | Delete an expense                     |
| POST   | `/api/groups`                      | Create a group                        |
| GET    | `/api/groups`                      | List groups for a user                |
| POST   | `/api/group-expenses/:groupId`     | Add a group expense                   |
| GET    | `/api/group-expenses/:groupId`     | Get group expenses, balances, and settlements |

## License

This project is for personal/portfolio use.
