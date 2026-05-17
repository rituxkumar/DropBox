# CloudVault — Secure File Sharing Platform

A modern, production-ready file sharing web application built with Next.js, Express.js, MongoDB, and Cloudinary.

## Features

- 🔐 JWT Authentication (Register, Login, Protected Routes)
- 📁 Drag & Drop File Upload with Progress Bar
- 🖼️ File Preview (Images, Videos, PDFs)
- 🔍 Search, Filter, and Sort Files
- 🔗 Shareable Public Links
- 📊 Dashboard with Storage Analytics
- 🌙 Dark Glassmorphism UI
- 📱 Fully Responsive (Mobile, Tablet, Desktop)
- ♾️ Infinite Scroll Pagination
- ☁️ Cloudinary Cloud Storage

## Tech Stack

### Frontend
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Axios
- React Icons
- React Dropzone
- React Hot Toast

### Backend
- Express.js
- Node.js
- MongoDB + Mongoose
- Multer (File Upload)
- Cloudinary (Cloud Storage)
- JWT + Bcrypt (Auth)

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Cloudinary account

### 1. Clone & Install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment

**Server** — Copy `server/.env.example` to `server/.env` and fill in:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Client** — Copy `client/.env.example` to `client/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Run Development Servers

```bash
# Terminal 1 — Backend (port 5000)
cd server
npm run dev

# Terminal 2 — Frontend (port 3000)
cd client
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment

### Frontend → Vercel
- Set `NEXT_PUBLIC_API_URL` to your Render backend URL

### Backend → Render
- Set all environment variables
- Start command: `node server.js`

### Database → MongoDB Atlas
- Create M0 free cluster
- Whitelist IPs

## Project Structure

```
├── client/               # Next.js Frontend
│   └── src/
│       ├── app/          # Pages & Layouts
│       ├── components/   # Reusable UI Components
│       ├── context/      # React Context (Auth)
│       ├── hooks/        # Custom Hooks
│       ├── lib/          # Axios Instance
│       ├── services/     # API Service Layer
│       └── utils/        # Utility Functions
│
└── server/               # Express Backend
    ├── config/           # DB & Cloudinary Config
    ├── controllers/      # Route Handlers
    ├── middleware/        # Auth, Upload, Error
    ├── models/           # Mongoose Schemas
    ├── routes/           # API Routes
    └── utils/            # Token & Upload Utils
```

## API Endpoints

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | /api/auth/register | Register user | ❌ |
| POST | /api/auth/login | Login user | ❌ |
| GET | /api/auth/me | Get current user | ✅ |
| POST | /api/files/upload | Upload files | ✅ |
| GET | /api/files | List user files | ✅ |
| GET | /api/files/:id | Get file details | ✅ |
| PUT | /api/files/:id | Update file | ✅ |
| DELETE | /api/files/:id | Delete file | ✅ |
| GET | /api/files/download/:id | Download file | ✅ |
| GET | /api/files/shared/:token | Get shared file | ❌ |
