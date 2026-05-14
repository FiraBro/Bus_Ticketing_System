# Bus Ticketing System

A full-stack bus ticket booking platform that allows passengers to search trips, reserve seats, make payments, and receive tickets — while operators and admins manage routes, buses, and bookings.

---

## Project Overview

This system is designed as a **modular monolithic application** with:

- One backend service (Node.js + Express)
- One frontend application (React)
- PostgreSQL for persistent data
- Redis for seat locking and caching

The goal is to build a **real-world, scalable MVP** that can evolve into a distributed system later.

---

## User Roles

### Passenger

- Search for trips
- Select seats
- Book tickets
- Make payments
- View or cancel bookings

### Operator

- Manage routes
- Create trips
- Assign buses
- Configure seat layouts and pricing

### Admin

- Full system access
- Manage users & operators
- View bookings & reports
- Monitor system metrics

---

## Core Features

### Authentication & Authorization

- Email & password login
- JWT-based authentication
- Role-based access control (`passenger`, `operator`, `admin`)

---

### Route & Trip Management

- Create and manage routes
- Assign buses to trips
- Define schedules and pricing

---

### Bus & Seat Management

- Configurable bus types (AC, sleeper, seater)
- JSON-based seat layout
- Real-time seat availability

---

### Trip Search

- Search by origin, destination, and date
- Filter by price, bus type, and time

---

### Booking System

- Seat selection with locking mechanism
- Passenger detail entry
- Booking creation and tracking

---

### Seat Locking (Concurrency Control)

- Temporary seat lock (e.g., 5 minutes)
- Prevents double booking
- Redis-based implementation

---

### Payments

- Stripe integration (initial provider)
- Secure payment flow
- Webhook-based confirmation
- Handles failures & retries

---

### Ticketing

- Auto-generated tickets after payment
- Includes:
  - Ticket ID
  - Passenger info
  - Trip details
  - Seat number
  - QR/verification code

---

### Notifications

- Email confirmations
- Booking updates
- Trip reminders

---

### Admin Dashboard

- Manage routes, trips, buses
- View bookings
- Basic analytics:
  - Revenue
  - Total bookings
  - Occupancy rate

---

## Project Structure

- bus-ticketing-system/
  ├── client/ # React frontend
  ├── server/ # Node.js backend
  ├── infra/ # Docker & deployment configs
  ├── docs/ # Documentation
  ├── docker-compose.yml
  └── README.md

---

## Tech Stack

### Frontend

- React
- React Router
- Axios / Fetch API
- Tailwind CSS (optional)

### Backend

- Node.js
- Express.js
- PostgreSQL
- Redis

### DevOps

- Docker
- Docker Compose
- GitHub Actions (CI/CD)

### Integrations

- Stripe (payments)
- Email service (Gmail)

---

## Database Schema (Simplified)

- Users
- Routes
- Stops
- Buses
- Trips
- Seats
- SeatLocks
- Bookings
- Tickets
- Payments

---

## Core System Flows

### Booking Flow

- Search Trip → Select Seats → Lock Seats → Enter Details → Payment → Ticket Generation

---

### 🔓 Seat Lock Expiration

- Seat Lock Created → Timer (Redis/DB) → Auto Expire → Release Seats

---

## ⚠️ Business Rules

- ❌ A seat cannot be booked twice
- ⏳ Seat locks must expire automatically
- 💳 Booking is confirmed only after payment success
- 🎫 Tickets are generated only after confirmed payment
- 🔐 Admin routes must be protected

---

## 🔐 Security Considerations

- Password hashing (bcrypt)
- JWT authentication
- Role-based authorization
- Input validation
- Rate limiting
- HTTPS in production

---

## 📦 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/FiraBro/Bus-Ticketing-System.git
cd Bus-Ticketing-System
```

## Setup environment variables

- cp .env.example .env

## Run Docker

- docker-compose up --build

## Final Note

- This project focuses on correctness over complexity:

- Reliable booking system
- No double seat booking
- Secure payment handling
- Accurate ticket generation

## Author

Built with ❤️ by FiraBro
