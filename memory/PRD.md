# Continental Academy - Product Requirements Document

## Original Problem Statement

Build a modern, premium online academy website called Continental Academy with:
- Main language: Bosnian (with support for English and German)
- Design: Minimalist, luxury dark theme with soft accents
- Homepage: Hero section with video, Education Programs, Student Results, "Why Us", FAQ, Discord CTA
- Shop: Digital products (TikTok/YouTube/Facebook accounts)
- User Dashboard: View subscriptions, access courses, video lessons
- Admin Panel: Full management capabilities
- Payments: Stripe integration
- Original: Python/FastAPI → **Migrated to Node.js/Express**

## Tech Stack

### Current (Migrated - January 2025)
- **Backend**: Node.js, Express.js, MongoDB, JWT Authentication
- **Frontend**: React, TailwindCSS, Framer Motion, Shadcn/UI
- **Database**: MongoDB (Local for dev, Atlas for production)
- **Payments**: Stripe
- **Deployment**: Docker, Docker Compose (ready for Dokploy VPS)

### Previous (Deprecated)
- Python/FastAPI (completely removed)

## What's Been Implemented ✅

### Backend (Node.js/Express)
- [x] Express.js server with MongoDB connection
- [x] JWT authentication (register, login, get current user)
- [x] Admin middleware for protected routes
- [x] User management (CRUD, role assignment, course assignment)
- [x] Programs management (CRUD)
- [x] Courses management (CRUD with lessons)
- [x] Lessons management (CRUD, reordering)
- [x] Shop products management (CRUD)
- [x] FAQs management (CRUD)
- [x] Results/Gallery management (CRUD)
- [x] Site settings management
- [x] Analytics tracking
- [x] Stripe payment integration (subscriptions & one-time)
- [x] Default admin/student user creation on startup

### Frontend (React)
- [x] Homepage with all sections (Hero, Programs, Results, FAQ, Discord)
- [x] Login/Register pages
- [x] User Dashboard with course access
- [x] Course View with video lessons
- [x] Shop page with category filters
- [x] Comprehensive Admin Panel:
  - Overview with analytics
  - Users management
  - Courses & Lessons management
  - Programs management
  - Shop products management
  - Content (FAQs, Results) management
  - Settings (branding, theme, social links, section visibility)
- [x] Theme switching (4 themes)
- [x] Toast notifications

### Deployment Ready
- [x] Docker files for backend and frontend
- [x] Docker Compose configuration
- [x] Environment variable templates (.env.example)
- [x] README with deployment instructions

## Database Schema

### Users
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'user' | 'admin',
  subscriptions: [String], // program IDs
  courses: [String], // directly assigned course IDs
  created_at: Date
}
```

### Programs
```javascript
{
  name: String,
  description: String,
  price: Number,
  currency: String,
  features: [String],
  is_active: Boolean,
  stripe_price_id: String
}
```

### Courses
```javascript
{
  title: String,
  description: String,
  program_id: String,
  thumbnail_url: String,
  duration_hours: Number,
  order: Number,
  is_active: Boolean
}
```

### Lessons
```javascript
{
  title: String,
  description: String,
  course_id: String,
  video_url: String,
  mux_playback_id: String,
  duration_minutes: Number,
  order: Number,
  is_free: Boolean
}
```

### Settings
```javascript
{
  type: 'site',
  site_name: String,
  logo_url: String,
  favicon_url: String,
  hero_headline: String,
  hero_subheadline: String,
  hero_video_url: String,
  discord_invite_url: String,
  theme: String,
  social_links: Object,
  contact_email: String,
  contact_phone: String,
  footer_text: String,
  show_results_section: Boolean,
  show_faq_section: Boolean,
  currency: String
}
```

## API Endpoints

### Public
- `GET /api/health` - Health check
- `GET /api/programs` - List active programs
- `GET /api/courses` - List active courses
- `GET /api/settings` - Get site settings
- `GET /api/faqs` - List FAQs
- `GET /api/results` - List student results
- `GET /api/shop/products` - List shop products
- `POST /api/analytics/event` - Track analytics event

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Protected User Routes
- `GET /api/courses/:id` - Get course with lessons (access check)
- `GET /api/lesson/:id` - Get lesson (access check)

### Admin Routes (all protected)
- Users: `GET /api/admin/users`, `PUT /api/admin/users/:id/role`
- User Courses: `GET/PUT/POST /api/admin/users/:id/courses/*`
- Programs: CRUD at `/api/admin/programs`
- Courses: CRUD at `/api/admin/courses`
- Lessons: CRUD at `/api/admin/lessons`
- Shop: CRUD at `/api/admin/shop/products`
- FAQs: CRUD at `/api/admin/faqs`
- Results: CRUD at `/api/admin/results`
- Settings: `GET/PUT /api/admin/settings`
- Analytics: `GET /api/admin/analytics`

### Payments
- `POST /api/payments/checkout/subscription`
- `POST /api/payments/checkout/product`
- `GET /api/payments/status/:sessionId`
- `POST /api/payments/webhook`

## Test Credentials

- **Admin**: admin@test.com / admin123
- **Student**: student@test.com / student123

## Testing Status

All tests passed (36/36):
- Backend API tests: 100%
- Frontend integration: 100%
- See `/app/test_reports/iteration_2.json`

## Remaining Tasks (P2)

### Internationalization (i18n)
- [ ] Add react-i18next
- [ ] Create translation files (bs, en, de)
- [ ] Language switcher in UI

### Video Hosting Integration
- [ ] MUX video upload integration
- [ ] Video progress tracking

### Enhanced Features
- [ ] Email notifications (welcome, payment confirmation)
- [ ] Course completion certificates
- [ ] Progress tracking for lessons
- [ ] Student reviews/ratings

## Deployment Notes

### MongoDB Atlas Setup
1. Create cluster on MongoDB Atlas
2. Add database user with password
3. Configure Network Access (whitelist VPS IP)
4. Get connection string

### Dokploy VPS Deployment
1. Push to GitHub
2. Connect repo to Dokploy
3. Set environment variables:
   - `MONGO_URL` - Atlas connection string
   - `DB_NAME` - Database name
   - `JWT_SECRET` - Strong secret key
   - `STRIPE_API_KEY` - Live Stripe key
   - `REACT_APP_BACKEND_URL` - API URL
4. Deploy!

## File Structure

```
/app/
├── backend/
│   ├── models/          # Mongoose models
│   ├── routes/          # Express routes
│   ├── middleware/      # Auth middleware
│   ├── server.js        # Main entry point
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # React pages
│   │   └── lib/         # Utilities, API, contexts
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .env.example
├── docker-compose.yml
└── README.md
```

---
*Last updated: January 19, 2025*
*Backend migrated from Python/FastAPI to Node.js/Express*
