# API Documentation

**Base URL:** `http://localhost:5000/api` (configurable via the frontend's `VITE_API_URL`).

**Auth:** protected routes require a header `Authorization: Bearer <token>`. Tokens are issued
by register/login and expire after 30 days. A `401` response clears the client session.

**Roles:** `customer`, `provider`, `admin`. Role-restricted routes return `403` otherwise.

Errors are returned as `{ "message": "..." }` with an appropriate status code.

---

## Auth — `/auth`

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| POST | `/auth/register` | – | `{ name, email, password, role }` | `{ _id, name, email, role, avatar, token }` |
| POST | `/auth/login` | – | `{ email, password }` | `{ _id, name, email, role, avatar, token }` |
| GET | `/auth/me` | any | – | `{ user, providerProfile }` |
| PUT | `/auth/profile` | any | `{ name?, email?, avatar? }` | updated user |

> Note the shape difference: register/login return user fields **flat** alongside `token`,
> while `/auth/me` nests them under `user`.

## Image upload — `/upload`

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| POST | `/upload?folder=<name>` | any | `multipart/form-data`, field `image` (≤5 MB, image types) | `{ url }` |

## Providers — `/providers`

| Method | Path | Auth | Body / Query | Response |
|--------|------|------|--------------|----------|
| GET | `/providers` | – | `?search`, `?skill` | `[ ServiceProvider (user populated) ]` |
| GET | `/providers/stats` | provider | – | `{ totalProjects, activeProjects, completedProjects, earningsTotal, pendingRequests, reviewsCount, averageRating }` |
| GET | `/providers/:id` | – | `:id` = User id | `{ provider, services }` |
| PUT | `/providers/profile` | provider | `{ bio?, skills?, experience?, pricing? }` | updated profile |
| POST | `/providers/portfolio` | provider | `{ title, description, image, link }` | updated profile |
| DELETE | `/providers/portfolio/:itemId` | provider | – | updated profile |

## Services — `/services`

| Method | Path | Auth | Body / Query | Response |
|--------|------|------|--------------|----------|
| GET | `/services` | – | `?search`, `?category`, `?sort` (`price`/`-price`/`deliveryTime`/`-deliveryTime`/`createdAt`/`-createdAt`), `?page`, `?limit` | `{ services, page, pages, total }` |
| GET | `/services/my` | provider | – | `[ services ]` (own) |
| GET | `/services/:id` | – | – | service |
| POST | `/services` | provider | `{ title, description, category, price, deliveryTime, images? }` | created service |
| PUT | `/services/:id` | provider (owner) | partial service fields | updated service |
| DELETE | `/services/:id` | provider (owner) | – | `{ message }` |

## Service requests — `/requests`

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| GET | `/requests` | any | – | **Role-dispatched:** providers get received requests, others get their own — each item includes `projectId` |
| GET | `/requests/:id` | party/admin | – | request (populated) |
| POST | `/requests` | customer | `{ service, requirements, budget, deadline }` | created request (also creates a linked Project) |
| PUT | `/requests/:id/status` | provider (accept/reject) | `{ status }` | updated request |

## Projects — `/projects`

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| GET | `/projects` | any | – | `[ projects ]` where you are customer or provider |
| GET | `/projects/:id` | party/admin | – | project (service, request, customer, provider, updates populated) |
| PUT | `/projects/:id/status` | role per transition | `{ status }` | updated project |
| POST | `/projects/:id/updates` | party | `{ text }` | project with new update |

**Status transitions** (enforced server-side):
`pending→accepted`, `accepted→in-progress`, `in-progress→completed` (provider);
`completed→delivered` (customer). Any other transition returns `400`.

## Reviews — `/reviews`

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| GET | `/reviews/provider/:providerId` | – | – | `[ reviews ]` |
| GET | `/reviews/my` | any | – | `[ reviews ]` (as customer) |
| POST | `/reviews` | customer | `{ provider, service, request, rating (1–5), feedback }` | created review (recomputes provider average) |

## Admin — `/admin` (all require `admin`)

| Method | Path | Response |
|--------|------|----------|
| GET | `/admin/users?page&limit` | `{ users, page, pages, total }` |
| GET | `/admin/stats` | `{ userCounts, serviceCounts, requestCounts, projectCounts, recentUsers, recentRequests }` |
| GET | `/admin/user-stats` | `{ totalUsers, customers, providers, admins }` |
| GET | `/admin/service-stats` | `{ totalServices, activeServices, inactiveServices, categories:[{_id,count}] }` |
| GET | `/admin/request-stats` | `{ totalRequests, pending, accepted, rejected, completed }` |
| GET | `/admin/project-stats` | `{ totalProjects, pending, accepted, inProgress, completed, delivered }` |

## Health

| Method | Path | Response |
|--------|------|----------|
| GET | `/health` | `{ status: "ok" }` |
