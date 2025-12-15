# The Looms Aura

A full-stack e-commerce website for "The Looms Aura" - premium ethnic wear collections.

## Features

### Public Features
- **Home Page**: Beautiful landing page with hero section and feature highlights
- **Collections**: Browse main collections (Sarees, Kurtis, Salwar Suits)
- **Subcollections**: View subcategories within each collection
- **Products**: Product grid displaying image, name, and price

### Admin Features
- **Admin Login**: Secure authentication with JWT tokens
- **Product Upload**: Add new products via web interface with image upload
- **Image Storage**: Product images stored as binary data (BYTEA) in PostgreSQL database

## Tech Stack

### Frontend
- **React 18** with Vite
- **React Router** for navigation
- **Axios** for API calls
- **Vanilla CSS** with premium design system

### Backend
- **Node.js** with Express
- **PostgreSQL** database with image binary storage
- **JWT** authentication for admin
- **Multer** for multipart file uploads
- **CORS** enabled

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v15 or higher)
- Docker (optional, for PostgreSQL via docker-compose)

## Setup Instructions

### 1. Database Setup

#### Option A: Using Docker (Recommended)
```bash
docker-compose up -d
```

#### Option B: Local PostgreSQL
Install PostgreSQL and create a database:
```sql
CREATE DATABASE looms_aura;
CREATE USER admin WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE looms_aura TO admin;
```

### 2. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Environment Variables

The `server/.env` file contains:
```env
PORT=5000
DATABASE_URL=postgresql://admin:password@localhost:5432/looms_aura
ADMIN_USERNAME=admin
ADMIN_PASSWORD=secret
JWT_SECRET=supersecretkey123456
```

Update these values if needed, especially if not using the default PostgreSQL credentials.

### 4. Seed Database

Run the seed script to create tables and populate with sample data:

```bash
cd server
npm run seed
```

This will create:
- 3 Collections (Sarees, Kurtis, Salwar Suits)
- 7 Subcollections
- 15 Sample Products with placeholder images

### 5. Start the Application

#### Start Backend (Terminal 1)
```bash
cd server
npm start
```
Server runs on `http://localhost:5000`

#### Start Frontend (Terminal 2)
```bash
cd client
npm run dev
```
Frontend runs on `http://localhost:5173`

## Usage

### Public Access
1. Visit `http://localhost:5173`
2. Browse collections and products
3. No login required for viewing

### Admin Access
1. Navigate to `http://localhost:5173/admin/login`
2. Login with credentials:
   - **Username**: `admin`
   - **Password**: `secret`
3. Upload new products with images
4. Images are automatically stored in the PostgreSQL database as binary data

## API Endpoints

### Public Endpoints
- `GET /api/collections` - List all collections
- `GET /api/collections/:id/subcollections` - Get subcollections for a collection
- `GET /api/products/subcollection/:id` - Get products in a subcollection
- `GET /api/products/:id/image` - Serve product image from database

### Admin Endpoints (Require JWT Token)
- `POST /api/auth/login` - Admin login
- `POST /api/products` - Create new product (with image upload)
- `GET /api/products/subcollections/all` - Get all subcollections for dropdown

## Database Schema

### Collections
- id (SERIAL PRIMARY KEY)
- name (VARCHAR)
- description (TEXT)
- created_at (TIMESTAMP)

### Subcollections
- id (SERIAL PRIMARY KEY)
- collection_id (INTEGER, references collections)
- name (VARCHAR)
- description (TEXT)
- created_at (TIMESTAMP)

### Products
- id (SERIAL PRIMARY KEY)
- subcollection_id (INTEGER, references subcollections)
- name (VARCHAR)
- price (DECIMAL)
- description (TEXT)
- **image (BYTEA)** - Binary image data
- **image_mime_type (VARCHAR)** - Image content type
- created_at (TIMESTAMP)

## Design Features

- **Dark Mode Theme**: Premium dark color scheme
- **Vibrant Gradients**: Eye-catching color combinations
- **Glassmorphism**: Modern backdrop-blur effects
- **Smooth Animations**: Fade-ins, hover effects, and transitions
- **Google Fonts**: Playfair Display (headings) + Inter (body)
- **Responsive Design**: Mobile-friendly layouts
- **Custom Scrollbar**: Branded scrollbar styling

## Project Structure

```
the-looms-aura/
├── server/
│   ├── src/
│   │   ├── db/
│   │   │   ├── index.js       # PostgreSQL connection
│   │   │   └── schema.js      # Database schema
│   │   ├── routes/
│   │   │   ├── auth.js        # Authentication routes
│   │   │   ├── collections.js # Collection routes
│   │   │   └── products.js    # Product routes + image serving
│   │   ├── seed.js            # Database seeding script
│   │   └── server.js          # Express server setup
│   ├── .env
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Collections.jsx
│   │   │   ├── Subcollections.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── AdminLogin.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css          # Design system
│   ├── index.html
│   └── package.json
├── docker-compose.yaml
└── README.md
```

## Notes

- Product images are stored as binary data in PostgreSQL (BYTEA column)
- Images are served via REST endpoint: `GET /api/products/:id/image`
- Image uploads are limited to 5MB
- JWT tokens expire after 24 hours
- All passwords should be changed before production deployment

## Development

```bash
# Backend with auto-reload
cd server
npm run dev

# Frontend with hot module replacement
cd client
npm run dev
```

## License

MIT
