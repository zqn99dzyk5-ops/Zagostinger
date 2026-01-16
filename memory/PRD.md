# Continental Academy - PRD

## Original Problem Statement
Build a premium online academy website called Continental Academy for content monetization education. Features include:
- Homepage with hero video, programs, results gallery, FAQ, Discord CTA
- Shop for TikTok/YouTube/Facebook accounts
- User dashboard with course access
- Admin panel for full CMS control
- Dark luxury theme, Bosnian language primary

## User Choices
- Stripe: Test keys (already available)
- Video hosting: MUX (placeholder for API keys)
- Auth: Custom JWT
- Analytics: Standard (no Google Analytics)
- Everything configurable via Admin panel

## Architecture
- **Backend**: FastAPI + MongoDB
- **Frontend**: React + Tailwind CSS + Shadcn UI
- **Payments**: Stripe (emergentintegrations library)
- **Video**: MUX (placeholder, needs API keys)
- **Auth**: JWT tokens with bcrypt password hashing

## User Personas
1. **Content Creator** - Wants to learn monetization, purchases programs
2. **Account Buyer** - Purchases pre-made social media accounts
3. **Admin** - Manages all content, users, settings

## Core Requirements
- [x] Premium dark luxury design
- [x] Bosnian language content
- [x] Subscription programs (Stripe)
- [x] Shop marketplace
- [x] User dashboard
- [x] Admin panel with full CMS
- [x] JWT authentication
- [x] Mobile responsive
- [x] Analytics tracking

## What's Been Implemented (January 15, 2026)
### Backend (server.py)
- Auth: register, login, me endpoints
- Programs CRUD (admin)
- Courses, Modules, Videos CRUD (admin)
- Shop Products CRUD (admin)
- FAQs CRUD (admin)
- Results gallery (admin)
- Site settings (admin)
- Analytics events tracking
- User management (admin)
- Stripe payment integration (subscriptions & products)

### Frontend
- Homepage: Hero, Programs, Results Gallery, Why Us, FAQ, Discord CTA
- Auth: Login, Register pages
- Dashboard: User subscriptions and courses
- Course Viewer: Video player with module sidebar
- Shop: Product categories, purchase flow
- Admin Panel: Overview, Users, Programs, Shop, Content, Settings tabs

### Design
- Dark luxury theme with muted gold (#D4AF37) accents
- Playfair Display (headings) + DM Sans (body) fonts
- Glass-morphism cards, smooth animations

## Prioritized Backlog
### P0 (Critical)
- [x] Core homepage and navigation
- [x] User authentication
- [x] Program subscriptions
- [x] Admin content management

### P1 (High)
- [ ] MUX video integration (needs API keys)
- [ ] Email notifications
- [ ] Multi-language support (EN, DE)
- [ ] Payment webhook improvements

### P2 (Medium)
- [ ] Course progress tracking
- [ ] Certificate generation
- [ ] Social media login
- [ ] Advanced analytics dashboard

## Test Credentials
- Admin: admin@test.com / admin123

## Next Tasks
1. Configure MUX API keys for video hosting
2. Add real Discord invite link
3. Implement multi-language support
4. Add email notifications for purchases
5. Create actual course content

---

## Update (January 16, 2026) - Course & Lesson Management

### New Features Added:
1. **Kursevi (Courses) tab** in Admin Panel
   - Create/Edit/Delete courses
   - Set course duration (hours)
   - Link courses to subscription programs
   - Expandable accordion to view lessons

2. **Lekcije (Lessons) system**
   - Add lessons to each course
   - Each lesson has: title, description, video URL, duration, order
   - Support for YouTube, Vimeo, and direct video URLs
   - MUX Playback ID support (for MUX hosted videos)
   - "Besplatno" (Free) flag for preview lessons

3. **User Course Assignment**
   - "Kursevi" button for each user in Admin > Korisnici
   - Toggle switch to grant/revoke course access
   - Works independently from subscription programs

### Backend Endpoints Added:
- GET /api/admin/courses - List all courses with lesson count
- POST/PUT/DELETE /api/admin/courses - CRUD operations
- GET /api/lessons/{course_id} - Get lessons for a course  
- POST/PUT/DELETE /api/admin/lessons - CRUD operations
- PUT /api/admin/lessons/reorder - Reorder lessons
- GET/PUT /api/admin/users/{id}/courses - Manage user course access
- POST /api/admin/users/{id}/courses/add - Add single course
- POST /api/admin/users/{id}/courses/remove - Remove single course

### Test Data:
- Course: "TikTok za početnike" (3 lessons, 10h)
- Student: student@test.com / student123
