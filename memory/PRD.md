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
