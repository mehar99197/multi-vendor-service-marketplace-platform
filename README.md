# Multi-Vendor Service Marketplace Platform

A full-stack service marketplace (Fiverr/Upwork style) where **customers** browse and hire
**service providers**, submit service requests, track project progress through a defined
workflow, and leave reviews — with an **admin** dashboard for platform oversight.

Built for the **TEYZIX CORE Internship (June Batch)** — Task **FSWD-1**.

- **Frontend:** React 19, Vite, Tailwind CSS v4, React Router, Axios
- **Backend:** Node.js, Express, Mongoose (ESM)
- **Database:** MongoDB (Atlas)
- **Auth:** JWT (30-day tokens) + bcrypt password hashing
- **Image upload:** Cloudinary

---

## Features (Task requirements)

| # | Module | What it does |
|---|--------|--------------|
| 1 | **Auth & Authorization** | Register / login / logout, bcrypt hashing, JWT, role-based access (`customer`, `provider`, `admin`) |
| 2 | **Provider profiles** | Bio, skills, experience, starting price, portfolio items, **profile-picture upload** (Cloudinary) |
| 3 | **Service listings** | Providers create / edit / delete listings (title, description, category, price, delivery time, images) |
| 4 | **Service requests** | Customers browse, search, filter by category, and submit requests (requirements, budget, deadline) |
| 5 | **Project tracking** | Linear workflow **Pending → Accepted → In Progress → Completed → Delivered** with an updates timeline |
| 6 | **Reviews & ratings** | Customers rate providers 1–5 with feedback; average rating is stored and displayed |
| 7 | **Dashboards** | Customer (active requests, completed projects, profile), Provider (earnings, active projects, pending requests), Admin (user/service/project statistics) |
| 8 | **Responsive design** | Mobile / tablet / desktop layouts (Tailwind), mobile hamburger nav |

### Project status workflow & roles

```
pending ──(provider: Accept)──▶ accepted ──(provider: Start Work)──▶ in-progress
        ──(provider: Mark Completed)──▶ completed ──(customer: Confirm Delivery)──▶ delivered
```

The provider drives the work forward; the customer confirms final delivery. A provider may
also **reject** a pending request. The linked `ServiceRequest` lifecycle stays in step with
the project (accepted → accepted, delivered → completed).

---

## Project structure

```
Multi-Vendor Service Marketplace Platform/
├── backend/            # Express API (routes → controllers → models)
│   ├── config/         # db + cloudinary
│   ├── controllers/
│   ├── middleware/     # auth (protect/authorize), multer upload
│   ├── models/         # User, ServiceProvider, Service, ServiceRequest, Project, Review
│   ├── routes/
│   └── server.js
├── frontend/           # React + Vite app
│   └── src/
│       ├── api/        # axios instance + upload helper
│       ├── components/
│       ├── context/    # AuthContext
│       └── pages/
├── API.md              # API documentation
├── DATABASE_SCHEMA.md  # Database schema
├── DEPLOYMENT.md       # Deployment guide
└── screenshots/        # UI screenshots
```

The two packages are **independent** (each has its own `package.json`); there is no root
package manager. Both are pure ESM (`"type": "module"`). Target runtime: **Node 22**.

---

## Getting started (local)

### Prerequisites
- Node.js 22+
- A MongoDB connection string (MongoDB Atlas free tier works)
- A Cloudinary account (cloud name + API key/secret)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env     # then fill in the values
npm run dev              # starts on http://localhost:5000 (auto-reload)
```

Required `backend/.env` values (see [.env.example](backend/.env.example)):

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret used to sign JWTs |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Image uploads |
| `CLIENT_URL` | Allowed CORS origin (defaults to `http://localhost:5173`) |
| `PORT` | API port (defaults to `5000`) |

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env     # optional; defaults to http://localhost:5000/api
npm run dev              # starts on http://localhost:5173
```

Set `VITE_API_URL` to point the frontend at a deployed backend (include the `/api` suffix).

### Scripts

**Backend:** `npm run dev` (watch) · `npm start`
**Frontend:** `npm run dev` · `npm run build` · `npm run preview` · `npm run lint`

> No automated test suite is configured in either package.

---

## Documentation

- **[API.md](API.md)** — every endpoint, method, auth requirement, and request/response shape
- **[DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)** — all six collections, fields, and relations
- **[DEPLOYMENT.md](DEPLOYMENT.md)** — deploying the API (Render) and the frontend (Vercel/Netlify)

## CRM features

Layered on top of the marketplace to manage the customer ↔ provider relationship:

| Feature | What it does |
|---------|--------------|
| **In-app messaging** | Project-scoped 1:1 chat between customer and provider, on the project page (light polling, no WebSockets needed) |
| **Notifications** | A navbar bell with unread count + dropdown; auto-generated on new requests, status changes, new messages, and new reviews |
| **Follow-up tasks** | Private to-do reminders with due dates on a project; open/overdue tasks surface on the dashboard |
| **Contact notes & tags** | Private CRM notes and tags you keep about the other party — only the author can ever see them |

## Bonus features implemented
- **Dark mode** UI by default
- **Activity log / project updates** timeline on each project

## Notes
- Image uploads stream through the backend to Cloudinary via `POST /api/upload` (multipart, field `image`).
- Admin accounts are created by registering and then setting `role: "admin"` directly in the database (registration only exposes `customer`/`provider`).
