# EventHub — MERN Event Promotion & Discovery Platform

> A production-grade event promotion, discovery, and booking workflow built on the MERN stack with public discovery, strict Role-Based Access Control (RBAC), end-to-end input validation, responsive UI states, and fortified database credential protection.

---

## User Roles & Access Workflow

The platform provides an open discovery experience coupled with a strict **two-role access control model**:

| Capability | Public Guest (Unauthenticated) | User (`role='user'`) | Administrator (`role='admin'`) |
| :--- | :---: | :---: | :---: |
| Browse Discovery Catalog |  **Yes (Freely Accessible)** |  Yes |  Yes |
| Search, Filter & View Details |  **Yes (Freely Accessible)** |  Yes |  Yes |
| Account Registration |  Yes (Always `user`) |  N/A |  N/A |
| User Login (`/api/auth/login`) |  Yes |  Yes |  Blocked (Must use Admin portal) |
| Admin Login (`/api/auth/login/admin`) |  No |  Blocked (403 Forbidden) |  Yes |
| **Book Event Seat** |  **Triggers Auth Modal (Register/Learn More/Cancel)** |  **Yes (Instant Seat Reservation)** |  **Blocked (Admins cannot book)** |
| View My Bookings |  Redirects to Login |  Yes (`/my-bookings`) |  No |
| **Create Event** |  Redirects to Login |  **Blocked (403 Forbidden)** |  **Yes** |
| **Edit Event Details** |  Redirects to Login |  **Blocked (403 Forbidden)** |  **Yes** |
| **Delete Event** |  Redirects to Login |  **Blocked (403 Forbidden)** |  **Yes** |
| **Enable / Disable Event** |  Redirects to Login |  **Blocked (403 Forbidden)** |  **Yes** |

### Unauthenticated Booking Popup Workflow
If a guest browsing the discovery page or event details page attempts to book an event without being logged in, an interactive modal automatically pops up:
* **Register Button:** Redirects the guest to `/register` to create an attendee account.
* **Learn More Button:** Closes the popup, keeping the user on the event view.
* **Cancel Button / Close Icon:** Closes the popup immediately.

---

## Tech Stack

* **Backend:** Node.js, Express.js, MongoDB (Mongoose), JSON Web Tokens (`jsonwebtoken`), Password Hashing (`bcryptjs`), Schema Validation (`zod`), Logger (`morgan`).
* **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons, Axios (with Bearer token injector interceptors).
* **Testing:** Jest & Supertest (12 integration tests with 100% pass rate).

---

## Directory Structure

```
event-management/
├── ARCHITECTURE.md                  # Comprehensive architectural design & system specs
├── README.md                        # Setup guide, API reference & credentials
├── package.json                     # Root orchestrator scripts (dev, test, seed)
├── server/
│   ├── .env.example                 # Environment variable templates
│   ├── package.json                 # Backend dependencies & test scripts
│   ├── tests/
│   │   └── api.test.js              # Integration test suite (Supertest & Jest)
│   └── src/
│       ├── config/
│       │   └── db.js                # MongoDB connection with sanitized logging
│       ├── controllers/
│       │   ├── authController.js    # Register (user only), login, loginAdmin, getMe
│       │   └── eventController.js   # Event CRUD, bookEvent, toggleStatus, myBookings
│       ├── middleware/
│       │   ├── authMiddleware.js    # JWT verification & RBAC role guards
│       │   ├── errorMiddleware.js   # Centralized error handler (Zero credential leaks)
│       │   └── validateMiddleware.js# Zod schema validation middleware
│       ├── models/
│       │   ├── Event.js             # Event Schema with text indexes & bookings subdocs
│       │   └── User.js              # User Schema with bcrypt pre-save hooks
│       ├── routes/
│       │   ├── authRoutes.js        # /api/auth routes
│       │   └── eventRoutes.js       # /api/events routes
│       ├── utils/
│       │   ├── generateToken.js     # JWT signing helper
│       │   └── seed.js              # Database seeder (Admin, User & sample events)
│       ├── app.js                   # Express app config
│       └── server.js                # Server entry point
└── client/
    ├── package.json                 # Frontend dependencies
    ├── vite.config.js               # Vite config with /api proxy to backend
    ├── tailwind.config.js           # Tailwind CSS configuration
    └── src/
        ├── components/
        │   ├── AuthPromptModal.jsx  # Popup for guests clicking "Book Event" (Register/Learn More/Cancel)
        │   ├── EventCard.jsx        # Responsive card with format/category badges
        │   ├── Footer.jsx           # Clean application footer
        │   ├── Navbar.jsx           # Role-aware responsive navigation bar
        │   ├── ProtectedRoute.jsx   # Route guard enforcing authentication & admin role
        │   ├── ShareModal.jsx       # 1-Click "Copy link to clipboard" modal
        │   └── SkeletonCard.jsx     # Pulse loading skeleton cards
        ├── context/
        │   ├── AuthContext.jsx      # Authentication & role state management
        │   └── ToastContext.jsx     # Animated toast notification system
        ├── pages/
        │   ├── AdminDashboardPage.jsx # Admin management portal (CRUD, toggle, metrics)
        │   ├── CreateEditEventPage.jsx# Event publish & edit form with live validation
        │   ├── EventDetailsPage.jsx # Detailed event view, metadata, booking CTA
        │   ├── HomePage.jsx         # Event discovery with debounced search & filters (Public)
        │   ├── LoginPage.jsx        # Dual User & Admin portal tabs with 1-click demo fill
        │   ├── MyBookingsPage.jsx   # User's registered seats portal
        │   └── RegisterPage.jsx     # Public attendee registration
        └── services/
            └── api.js               # Axios instance with auth token interceptors
```

---

## Environment Variables

Create a `server/.env` file (copied from `server/.env.example`):

| Variable Name | Description | Example / Default |
| :--- | :--- | :--- |
| `PORT` | Backend server HTTP port | `5000` |
| `NODE_ENV` | Environment mode (`development`, `production`, `test`) | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/event-management` |
| `JWT_SECRET` | Secret key for signing HMAC-SHA256 JWTs | `super_secret_jwt_key_interview_assessment` |
| `JWT_EXPIRES_IN` | Token expiration lifespan | `7d` |
| `CLIENT_URL` | Allowed origin for CORS policy | `http://localhost:5173` |
| `ADMIN_REGISTRATION_SECRET` | Secret key required to register admin accounts via `/admin/register` | `admin_reg_secret_2026_change_in_prod` |

> **Security Guarantee:** Database credentials, secrets, or raw connection strings are **never logged to the console or returned in error payloads**. All error messages are sanitized before response delivery.

---

## Quickstart & Installation

### 1. Install Dependencies
From the repository root:
```bash
# Install root, backend, and frontend dependencies
npm run install:all
```

### 2. Configure Environment
Ensure `server/.env` is configured with your MongoDB URI:
```bash
cp server/.env.example server/.env
```

### 3. Seed Demo Data
Populate the database with demo users (`admin` and `user`) and 6 rich sample events:
```bash
npm run seed
```

### 4. Run Development Servers
Start both backend API (`http://localhost:5000`) and frontend Vite dev server (`http://localhost:5173`) concurrently:
```bash
npm run dev
```

---

## Demo Accounts (1-Click Fill in UI)

For seamless review and testing, the login page includes **1-Click Demo Fill buttons**:

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@eventhub.com` | `Password@123` | Full CRUD: Create, Edit, Delete, Enable/Disable events. Prohibited from booking. |
| **User (Attendee)** | `user@eventhub.com` | `Password@123` | Discover events, view details, reserve/book event seats, view "My Bookings". |

---

## Automated Test Suite

Run the backend integration test suite:
```bash
npm run test:server
```
Runs 12 automated test cases verifying:
* Public discovery endpoints accessibility without login.
* JWT authentication enforcement on sensitive mutation and booking routes.
* Strict rejection of unauthorized/unauthenticated operations.
* Input validation rules (Zod).
* Sanitization of error responses with zero credential leakage.
