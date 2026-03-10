# Student Performance & Article Analytics Dashboard

A full-stack MERN application for tracking student reading progress and analytics.

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs

### Frontend
- **Framework**: React with Vite
- **Styling**: Tailwind CSS
- **UI Components**: Custom components + Radix UI
- **Charts**: Recharts

---

## Project Structure

```
Project without Docker AWS Recharts/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── config/         # Database & env configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Auth & error handling
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── types/         # TypeScript interfaces
│   │   └── utils/         # Helpers, JWT, seed data
│   └── package.json
│
├── src/                    # React frontend (Vite)
│   ├── app/
│   │   ├── api/           # API client functions
│   │   ├── components/    # React components
│   │   ├── config/        # Frontend config
│   │   ├── context/       # React contexts
│   │   ├── data/          # Mock data
│   │   ├── hooks/         # Custom React hooks
│   │   ├── layouts/       # Page layouts
│   │   ├── pages/         # Page components
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Helpers & constants
│   └── styles/            # CSS files
│
├── public/                 # Static assets
├── package.json            # Root scripts
└── vite.config.ts         # Vite configuration
```

---

## Database

### MongoDB Collections

| Collection | Description |
|--------------|---------------------------------------------------|
| `users`      | User accounts (teachers & students)               |
| `articles`   | Educational articles with content blocks          |
| `analytics`  | Reading tracking data (views, duration, lastRead) |
| `highlights` | Student highlights and notes |

### Database Configuration
- Set `MONGO_URI` in `backend/.env`
- Default: `mongodb://localhost:27017/your_database_name`

---

## Seed Data

### Users
| Name              | Email                     | Role    | Password    |
|-------------------|---------------------------|---------|-------------|
| Dr. Sarah Johnson | sarah.teacher@example.com | teacher | password123 |
| John Smith        | john.student@example.com  | student | password123 |

### Running Seed
```bash
cd backend
npm run seed
```

---

## Backend API

### Routes

| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| POST   | `/api/auth/register`      | Register new user        |
| POST   | `/api/auth/login`         | Login user               |
| GET    | `/api/articles`           | Get all articles         |
| POST   | `/api/articles`           | Create article (teacher) |
| GET    | `/api/analytics`          | Get analytics (teacher)  |
| POST   | `/api/tracking`           | Track article reading    |
| GET    | `/api/student/highlights` | Get student highlights   |

### Authentication
- JWT-based authentication
- Token stored in localStorage
- Protected routes require `Authorization: Bearer <token>` header

---

## Frontend Features

### Teacher Features
- Dashboard with analytics overview
- Create/manage articles
- View student engagement metrics
- Analytics charts and reports

### Student Features
- Browse and read articles
- Track reading progress
- Create highlights and notes
- View reading history

### Pages
| Role    | Pages                                   |
|---------|-----------------------------------------|
| Teacher | Dashboard, Articles, Analytics          |
| Student | Dashboard, Article List, Article Reader |

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Install Backend Dependencies**
```bash
cd backend
npm install
```

2. **Install Frontend Dependencies**
```bash
npm install
```

3. **Configure Environment**

Create `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/analytics_dashboard
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

4. **Run Development Servers**

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
npm run dev
```

---

## Scripts

### Root
- `npm run dev` - Start frontend dev server
- `npm run build` - Build frontend for production

### Backend
- `cd backend && npm run dev` - Start backend server
- `cd backend && npm run seed` - Seed database
- `cd backend && npm run build` - Build backend

---

## License

MIT
