# PostgreSQL Setup Guide for Windows

Choose the method that works best for you. **Option 1 (Docker)** is recommended for easiest setup.

---

## ✅ **Option 1: Docker Desktop (Recommended - Easiest)**

### Step 1: Install Docker Desktop

1. **Download Docker Desktop for Windows**
   - Visit: https://www.docker.com/products/docker-desktop/
   - Click "Download for Windows"
   - Download size: ~500MB

2. **Install Docker Desktop**
   - Run the installer (`Docker Desktop Installer.exe`)
   - Accept the terms
   - Use recommended settings (WSL 2 backend)
   - Click "Install"
   - **Restart your computer** when prompted

3. **Start Docker Desktop**
   - Launch Docker Desktop from Start menu
   - Wait for Docker to start (whale icon in system tray should be steady)
   - First start may take 2-3 minutes

### Step 2: Start PostgreSQL Container

Open PowerShell or Terminal in the project folder and run:

```powershell
cd C:\Users\ganes\.gemini\antigravity\scratch\the-looms-aura
docker compose up -d
```

You should see:
```
[+] Running 2/2
 ✔ Network the-looms-aura_default  Created
 ✔ Container the-looms-aura-db-1   Started
```

### Step 3: Verify PostgreSQL is Running

```powershell
docker compose ps
```

You should see the database container running.

### Step 4: Seed the Database

```powershell
cd server
npm run seed
```

✅ **Done!** PostgreSQL is now running and seeded with data.

---

## ✅ **Option 2: Install PostgreSQL Locally**

### Step 1: Download PostgreSQL

1. Visit: https://www.postgresql.org/download/windows/
2. Click "Download the installer"
3. Download PostgreSQL 15 or 16 (recommended)
4. Download size: ~250MB

### Step 2: Install PostgreSQL

1. **Run the installer**
2. **Installation Directory**: Use default (`C:\Program Files\PostgreSQL\15`)
3. **Components**: Select all (PostgreSQL Server, pgAdmin 4, Command Line Tools)
4. **Data Directory**: Use default
5. **Password**: Set a password for the `postgres` superuser
   - ⚠️ **Remember this password!** You'll need it later
   - Example: `postgres123`
6. **Port**: Use default `5432`
7. **Locale**: Use default
8. Click "Next" and wait for installation (2-3 minutes)

### Step 3: Create Database

**Option A: Using pgAdmin (GUI)**

1. Open **pgAdmin 4** from Start menu
2. Connect to PostgreSQL (enter your password)
3. Right-click "Databases" → "Create" → "Database"
4. Database name: `looms_aura`
5. Owner: `postgres`
6. Click "Save"

**Option B: Using Command Line**

```powershell
# Add PostgreSQL to PATH (temporary - for current session)
$env:Path += ";C:\Program Files\PostgreSQL\15\bin"

# Connect to PostgreSQL
psql -U postgres

# Enter your password when prompted
# Then run these SQL commands:
CREATE DATABASE looms_aura;
\q
```

### Step 4: Update Environment Configuration

Edit `server/.env` file:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD_HERE@localhost:5432/looms_aura
ADMIN_USERNAME=admin
ADMIN_PASSWORD=secret
JWT_SECRET=supersecretkey123456
```

Replace `YOUR_PASSWORD_HERE` with the password you set during installation.

### Step 5: Seed the Database

```powershell
cd C:\Users\ganes\.gemini\antigravity\scratch\the-looms-aura\server
npm run seed
```

✅ **Done!** PostgreSQL is installed and ready.

---

## ✅ **Option 3: Cloud PostgreSQL (Fastest - No Installation)**

Perfect for quick testing without installing anything!

### Using Supabase (Free)

1. **Create Account**
   - Visit: https://supabase.com/
   - Click "Start your project"
   - Sign up with GitHub or email

2. **Create New Project**
   - Click "New Project"
   - Project name: `looms-aura`
   - Database password: Create a strong password (save it!)
   - Region: Select closest to you
   - Click "Create new project" (takes 1-2 minutes)

3. **Get Connection String**
   - Go to Project Settings → Database
   - Under "Connection String" → "URI"
   - Copy the connection string (looks like):
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
     ```

4. **Update `.env` File**
   
   Edit `server/.env`:
   ```env
   PORT=5000
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=secret
   JWT_SECRET=supersecretkey123456
   ```

5. **Seed the Database**
   ```powershell
   cd C:\Users\ganes\.gemini\antigravity\scratch\the-looms-aura\server
   npm run seed
   ```

### Alternative: Neon (Free)

1. Visit: https://neon.tech/
2. Sign up and create new project
3. Copy connection string
4. Update `.env` file
5. Run seed script

### Alternative: ElephantSQL (Free)

1. Visit: https://www.elephantsql.com/
2. Create free "Tiny Turtle" plan
3. Copy connection URL
4. Update `.env` file
5. Run seed script

✅ **Done!** Your cloud database is ready.

---

## 🚀 After Setup - Running the Application

Once PostgreSQL is set up using **any** of the above methods:

### Terminal 1 - Start Backend
```powershell
cd C:\Users\ganes\.gemini\antigravity\scratch\the-looms-aura\server
npm start
```

Should show:
```
Connected to PostgreSQL database
Server running on http://localhost:5000
```

### Terminal 2 - Start Frontend
```powershell
cd C:\Users\ganes\.gemini\antigravity\scratch\the-looms-aura\client
npm run dev
```

Should show:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### Open Browser
Visit: **http://localhost:5173**

---

## 🔧 Troubleshooting

### "Connection refused" error
- **Docker**: Make sure Docker Desktop is running
- **Local**: Make sure PostgreSQL service is started
  - Open Services (Win+R → `services.msc`)
  - Find "postgresql-x64-15" service
  - Right-click → Start
- **Cloud**: Check your internet connection

### "Authentication failed" error
- Double-check your password in `.env` file
- Make sure there are no extra spaces
- Password should not have quotes around it

### "Database does not exist" error
- Run the seed script again: `npm run seed`
- Make sure you created the `looms_aura` database

### Port 5432 already in use
- Another PostgreSQL is running
- Change the port in `docker-compose.yaml` (e.g., `5433:5432`)
- Update `.env` to use the new port

---

## 📊 Verify Database Contents

After seeding, you can verify data was created:

### Using Docker
```powershell
docker exec -it the-looms-aura-db-1 psql -U admin -d looms_aura -c "SELECT COUNT(*) FROM products;"
```

### Using Local PostgreSQL (pgAdmin)
1. Open pgAdmin
2. Navigate to: Servers → PostgreSQL 15 → Databases → looms_aura → Schemas → public → Tables
3. Right-click "products" → View/Edit Data → All Rows

### Using Cloud Provider
Use their web-based SQL editor to run:
```sql
SELECT COUNT(*) FROM products;
SELECT * FROM collections;
```

---

## 🎯 Quick Recommendation

**For Beginners**: Use **Option 3 (Cloud - Supabase)** ← 5 minutes, no installation  
**For Development**: Use **Option 1 (Docker)** ← Clean, isolated, easy to reset  
**For Production**: Use **Option 2 (Local)** or managed cloud service

---

## ✅ Success Checklist

- [ ] PostgreSQL is running (Docker/Local/Cloud)
- [ ] Database `looms_aura` exists
- [ ] Tables created (collections, subcollections, products)
- [ ] Seed data inserted (15 products)
- [ ] Backend server starts without errors
- [ ] Frontend runs on http://localhost:5173
- [ ] Can view collections in browser
- [ ] Can login as admin (admin/secret)

---

## 💡 Tips

- **Docker**: Best for keeping your system clean. Stop with `docker compose down`
- **Local Install**: PostgreSQL runs as Windows service (always on). Stop via Services app if needed
- **Cloud**: Free tiers usually have limits (500MB-1GB). Perfect for testing!

Need help? Check the error message and match it to the troubleshooting section above!
