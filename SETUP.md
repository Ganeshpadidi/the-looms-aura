# Quick Setup Guide for The Looms Aura

## Current Status
✅ Project structure created  
✅ Dependencies installed  
⚠️ PostgreSQL database needs to be set up

## Next Steps

### Option 1: Install Docker Desktop (Recommended)
1. Download and install Docker Desktop: https://www.docker.com/products/docker-desktop/
2. Start Docker Desktop
3. Run in project root:
   ```bash
   docker compose up -d
   ```
4. Seed the database:
   ```bash
   cd server
   npm run seed
   ```

### Option 2: Install PostgreSQL Locally
1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Install with default settings (remember your password!)
3. Create database:
   ```sql
   CREATE DATABASE looms_aura;
   ```
4. Update `server/.env` with your PostgreSQL credentials
5. Seed the database:
   ```bash
   cd server
   npm run seed
   ```

### Option 3: Use Online PostgreSQL (Quick Test)
Use a free PostgreSQL service like:
- ElephantSQL: https://www.elephantsql.com/
- Supabase: https://supabase.com/
- Neon: https://neon.tech/

Then update `server/.env` with the connection string and run:
```bash
cd server
npm run seed
```

## Running the Application

Once PostgreSQL is set up and seeded:

### Terminal 1 - Backend
```bash
cd server
npm start
```

### Terminal 2 - Frontend
```bash
cd client
npm run dev
```

Then visit: http://localhost:5173

## Admin Login
- Username: `admin`
- Password: `secret`

## Features Implemented
✅ React frontend with React Router  
✅ Node.js/Express backend  
✅ PostgreSQL with binary image storage (BYTEA)  
✅ Admin authentication with JWT  
✅ Product image upload via web interface  
✅ REST API endpoints  
✅ Premium dark mode UI design  
✅ Sample seed data  
✅ Comprehensive README  

All images are stored as binary data in the PostgreSQL database and served via the `/api/products/:id/image` endpoint.
