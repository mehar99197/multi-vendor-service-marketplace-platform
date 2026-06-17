# Database Schema

MongoDB (via Mongoose). Six collections. All `_id` fields are MongoDB `ObjectId`. Timestamps
are stored as `createdAt` (`Date`, default now).

## Entity relationships

```
User (1) ───────< Service (provider)
  │  │
  │  └─(role=provider, 1:1)─ ServiceProvider
  │
  ├─(customer)─< ServiceRequest >─(service)─ Service
  │                   │
  │                   └─(1:1)─ Project ──< updates[]
  │
  └─(customer)─< Review >─(provider / service / request)
```

- Registering with `role: "provider"` auto-creates a `ServiceProvider` profile (1:1 with `User`).
- Creating a `ServiceRequest` auto-creates a linked `Project` (1:1).
- A `Review` references the customer, provider, service, and the originating request.

---

## User
| Field | Type | Notes |
|-------|------|-------|
| `name` | String | required |
| `email` | String | required, unique, lowercased |
| `password` | String | required, min 6, **bcrypt-hashed** on save |
| `role` | String | enum `customer` \| `provider` \| `admin` (default `customer`) |
| `avatar` | String | Cloudinary URL (default `""`) |
| `createdAt` | Date | |

Instance method `matchPassword(plain)` compares against the hash.

## ServiceProvider
| Field | Type | Notes |
|-------|------|-------|
| `user` | ObjectId → User | required, unique (1:1) |
| `bio` | String | |
| `skills` | [String] | |
| `experience` | [{ title, company, from, to, current, description }] | |
| `pricing` | { startingFrom: Number, currency: String=`USD` } | |
| `portfolio` | [{ title, description, image, link }] | `image` = Cloudinary URL |
| `rating` | Number | average rating (default 0) |
| `numReviews` | Number | default 0 |
| `createdAt` | Date | |

## Service
| Field | Type | Notes |
|-------|------|-------|
| `provider` | ObjectId → User | required |
| `title` | String | required |
| `description` | String | required |
| `category` | String | required, enum (Web Development, Graphic Design, Content Writing, Digital Marketing, Logo Design, Social Media Management, Video Editing, Mobile Development, SEO, Other) |
| `price` | Number | required |
| `deliveryTime` | Number | required (days) |
| `images` | [String] | Cloudinary URLs |
| `status` | String | enum `active` \| `inactive` (default `active`) |
| `createdAt` | Date | |

## ServiceRequest
| Field | Type | Notes |
|-------|------|-------|
| `customer` | ObjectId → User | required |
| `service` | ObjectId → Service | required |
| `provider` | ObjectId → User | required |
| `requirements` | String | required |
| `budget` | Number | required |
| `deadline` | Date | required |
| `status` | String | enum `pending` \| `accepted` \| `rejected` \| `completed` (default `pending`) |
| `createdAt` | Date | |

## Project
| Field | Type | Notes |
|-------|------|-------|
| `request` | ObjectId → ServiceRequest | required |
| `customer` | ObjectId → User | required |
| `provider` | ObjectId → User | required |
| `service` | ObjectId → Service | required |
| `status` | String | enum `pending` \| `accepted` \| `in-progress` \| `completed` \| `delivered` (default `pending`) |
| `updates` | [{ text: String, addedBy: ObjectId → User, createdAt: Date }] | progress timeline |
| `createdAt` | Date | |

**Transitions:** pending→accepted→in-progress→completed (provider) → delivered (customer).

## Review
| Field | Type | Notes |
|-------|------|-------|
| `customer` | ObjectId → User | required |
| `provider` | ObjectId → User | required |
| `service` | ObjectId → Service | required |
| `request` | ObjectId → ServiceRequest | required |
| `rating` | Number | required, 1–5 |
| `feedback` | String | default `""` |
| `createdAt` | Date | |

On create, the provider's `ServiceProvider.rating` and `numReviews` are recomputed across all
their reviews. One review per (request, customer) is enforced in the controller.
