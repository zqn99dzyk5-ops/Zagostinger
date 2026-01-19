# Continental Academy

Modern online education platform built with Node.js/Express backend and React frontend.

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB, JWT Authentication
- **Frontend**: React, TailwindCSS, Framer Motion, Shadcn/UI
- **Payments**: Stripe (subscriptions & one-time payments)
- **Deployment**: Docker, Docker Compose

## Features

- 🔐 User Authentication (JWT-based)
- 👤 Admin Panel (Users, Courses, Programs, Shop, Settings)
- 📚 Course Management with Video Lessons
- 🛒 Digital Products Shop
- 💳 Stripe Payments Integration
- 🎨 Multiple Themes (Dark Luxury, Clean Light, Midnight Purple, Education Classic)
- 📊 Analytics Dashboard
- 🌐 Multi-language ready (Bosnian, English, German)

## Quick Start

### Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)
- Yarn

### Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your settings
yarn install
yarn start
```

### Frontend Setup

```bash
cd frontend
cp .env.example .env
# Edit .env with your backend URL
yarn install
yarn start
```

## Docker Deployment

### Using Docker Compose

1. Create a `.env` file in the root directory with production values:

```env
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net
DB_NAME=continental_academy
JWT_SECRET=your_production_secret
STRIPE_API_KEY=sk_live_your_stripe_key
REACT_APP_BACKEND_URL=https://api.yourdomain.com
```

2. Build and run:

```bash
docker-compose up -d --build
```

### Manual Docker Build

**Backend:**
```bash
cd backend
docker build -t continental-backend .
docker run -p 8001:8001 --env-file .env continental-backend
```

**Frontend:**
```bash
cd frontend
docker build -t continental-frontend \
  --build-arg REACT_APP_BACKEND_URL=https://api.yourdomain.com .
docker run -p 80:80 continental-frontend
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Public
- `GET /api/programs` - List programs
- `GET /api/courses` - List courses
- `GET /api/settings` - Get site settings
- `GET /api/faqs` - List FAQs
- `GET /api/results` - List student results

### Admin (requires admin role)
- `GET /api/admin/users` - List all users
- `POST/PUT/DELETE /api/admin/programs/:id` - CRUD programs
- `POST/PUT/DELETE /api/admin/courses/:id` - CRUD courses
- `POST/PUT/DELETE /api/admin/lessons/:id` - CRUD lessons
- `PUT /api/admin/settings` - Update site settings

### Payments
- `POST /api/payments/checkout/subscription` - Create subscription checkout
- `POST /api/payments/checkout/product` - Create product checkout
- `GET /api/payments/status/:sessionId` - Check payment status

## Test Credentials

- **Admin**: admin@test.com / admin123
- **Student**: student@test.com / student123

## Deployment to VPS (Dokploy)

1. Push code to GitHub
2. Connect GitHub repo to Dokploy
3. Set environment variables in Dokploy dashboard
4. Configure MongoDB Atlas with IP whitelist
5. Deploy!

### MongoDB Atlas IP Whitelist

Make sure to whitelist your VPS IP address in MongoDB Atlas:
1. Go to Atlas Dashboard → Network Access
2. Add your VPS public IP or `0.0.0.0/0` for testing (not recommended for production)

## License

MIT
