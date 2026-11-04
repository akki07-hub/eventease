# EventEase — College Event Management System

A full-stack MERN web application built for college campus event organization, student registrations, seat capacity management, and participant roster tracking.

---

## Technologies Used

- **Frontend:** React.js, React Router v6, Axios, Lucide React, HTML5, CSS3, Vite
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose ODM
- **API Testing:** Postman (`EventEase.postman_collection.json`)
- **Database Management:** MongoDB Compass or MongoDB Atlas

---

## Project Structure

```text
EventEase/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── EmptyState.jsx
│   │   │   ├── EventCard.jsx
│   │   │   ├── FormField.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Notification.jsx
│   │   │   └── StatCard.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── EventForm.jsx
│   │   │   ├── EventsList.jsx
│   │   │   ├── Participants.jsx
│   │   │   └── StudentRegistration.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── dashboardController.js
│   │   ├── eventController.js
│   │   ├── registrationController.js
│   │   └── studentController.js
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   └── validate.js
│   ├── models/
│   │   ├── Event.js
│   │   ├── Registration.js
│   │   └── Student.js
│   ├── routes/
│   │   ├── dashboardRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── registrationRoutes.js
│   │   └── studentRoutes.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── EventEase.postman_collection.json
├── .gitignore
└── README.md
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) installed locally or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cloud URI.

---

## Environment Configuration

### Backend (`backend/.env`)
Create or review `backend/.env` (matches `backend/.env.example`):
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/eventease
```
*If using MongoDB Atlas, replace `MONGODB_URI` with your connection string:*
`mongodb+srv://<username>:<password>@cluster.mongodb.net/eventease?retryWrites=true&w=majority`

### Frontend (`frontend/.env`)
Create or review `frontend/.env` (matches `frontend/.env.example`):
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Installation & Setup

### 1. Start MongoDB
- **Local MongoDB service on Windows:**
  ```powershell
  net start MongoDB
  ```
  *or run `mongod` directly in a terminal if configured.*
- **MongoDB Atlas:** No local service needed; verify connection string in `backend/.env`.

---

### 2. Run the Backend Server

Open **Terminal 1**:
```powershell
cd C:\Users\user\Desktop\EventEase\backend
npm install
npm run dev
```
The backend starts at `http://localhost:5000`.
Health check: `http://localhost:5000/api/health`

---

### 3. Run the Frontend Client

Open **Terminal 2**:
```powershell
cd C:\Users\user\Desktop\EventEase\frontend
npm install
npm run dev
```
The frontend opens at `http://localhost:3000`.

---

## Main Frontend Pages

1. **Dashboard (`/`):** Summary statistics (Total Events, Upcoming Events, Registered Students, Active Registrations), quick actions, upcoming events spotlight, and recent enrollments.
2. **Events List (`/events`):** Displays events with search by title/venue/organizer, category filter, sorting, capacity progress bars, details view, edit, and safe delete.
3. **Create & Edit Event (`/events/create`, `/events/edit/:id`):** Validated form for title, description, category, venue, date, time slots, student capacity, and organizer.
4. **Student Registration (`/register`):** Register students for any selected event. Allows selecting existing students or creating a new student profile on the fly. Enforces seat capacity and prevents duplicate enrollments.
5. **Participants Roster (`/participants`):** Event-specific participant table with search, status filtering, one-click cancellation / re-activation, and registration removal.

---

## REST API Endpoints

### Events (`/api/events`)
- `POST   /api/events` — Create a new event
- `GET    /api/events` — Get all events (supports `?category=`, `?search=`, `?sortBy=`)
- `GET    /api/events/:id` — Get single event by ID with enrollment count
- `PUT    /api/events/:id` — Update event details and capacity
- `DELETE /api/events/:id` — Safely delete an event and its registrations

### Students (`/api/students`)
- `POST   /api/students` — Register a student (validates unique rollNo & email)
- `GET    /api/students` — List students (supports `?search=`, `?branch=`, `?year=`)
- `GET    /api/students/:id` — Get student profile and registered events
- `PUT    /api/students/:id` — Update student details
- `DELETE /api/students/:id` — Delete student and cancel their registrations

### Registrations (`/api/registrations`)
- `POST   /api/registrations` — Register student for an event (verifies capacity & uniqueness)
- `GET    /api/registrations` — List all registrations (supports `?status=`, `?eventId=`)
- `GET    /api/registrations/event/:eventId` — List participants for a specific event
- `GET    /api/registrations/:id` — Get single registration details
- `PUT    /api/registrations/:id` — Update registration status (`Registered` / `Cancelled`)
- `DELETE /api/registrations/:id` — Remove registration and release seat

### Dashboard (`/api/dashboard`)
- `GET    /api/dashboard/stats` — Aggregate metrics and category breakdowns

### System Health
- `GET    /api/health` — Server health status check

---

## How to Import the Postman Collection

1. Open **Postman**.
2. Click **Import** (top left).
3. Select `EventEase.postman_collection.json` from the root of the project directory.
4. The collection will import with 4 organized folders (`Events`, `Students`, `Registrations`, `Dashboard`) and the `Health Check`.
5. Ensure the collection variable `baseUrl` is set to `http://localhost:5000`.
6. Start testing the endpoints!
