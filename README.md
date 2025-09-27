# Preferio

A full-stack application combining Vite React, Next.js, and Python FastAPI.

## Project Structure

```
preferio/
├── frontend/          # Vite React application
├── nextjs-app/        # Next.js application
├── backend/           # Python FastAPI backend
├── package.json       # Root package.json for managing all services
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Python (v3.8 or higher)
- npm or yarn

### Installation

1. Install all dependencies:
```bash
npm run install:all
```

2. Install Python dependencies:
```bash
cd backend
pip install -r requirements.txt
```

### Development

Run all services in development mode:
```bash
npm run dev
```

This will start:
- Vite React frontend on http://localhost:5173
- Next.js application on http://localhost:3000
- Python FastAPI backend on http://localhost:8000

### Individual Services

#### Frontend (Vite React)
```bash
npm run dev:frontend
```

#### Next.js Application
```bash
npm run dev:nextjs
```

#### Python Backend
```bash
npm run dev:backend
```

### API Documentation

Once the backend is running, visit:
- API Documentation: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc

### Building for Production

```bash
npm run build
```

### Available Scripts

- `npm run dev` - Start all services in development mode
- `npm run build` - Build all applications
- `npm run install:all` - Install dependencies for all services
- `npm run start` - Start all services in production mode

## Services

### Frontend (Vite React)
- **Port**: 5173
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Features**: Fast development, HMR, TypeScript support

### Next.js Application
- **Port**: 3000
- **Framework**: Next.js with TypeScript
- **Features**: SSR, SSG, API routes, Tailwind CSS

### Python Backend (FastAPI)
- **Port**: 8000
- **Framework**: FastAPI
- **Features**: Automatic API documentation, type hints, async support
- **Endpoints**: CRUD operations for items

## Development Notes

- All services support hot reloading in development
- CORS is configured to allow communication between frontend and backend
- The backend includes a simple in-memory storage (replace with database for production)
- TypeScript is configured for both frontend applications
# preferio
