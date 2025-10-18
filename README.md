# GT Store — Next.js Pages Router

Mobile-first marketplace for **Gadgets and Electronics**. Contact-first marketplace (no payments).

## Highlights
- Blue on white theme (Tailwind) with soft cards and carousels
- Header with title/key and **Pi login stub** on right
- Footer with About/Explore/Support/Pi Currency
- Landing page with a **segmented control** to switch between Gadgets and Electronics (flick through),
  plus dedicated routes (/gadgets, /electronics)
- Categories: Smartphones/Tablets/Laptops/Accessories/New Listings and Gaming/Home/Office/Wearables/New Listings
- Professional listing cards with all key details and **π pricing**
- Buttons everywhere needed: Create Listing, View, Back Home
- Contact Seller modal (no buy-now)
- **Database-driven** with Prisma ORM and SQLite
- **Environment-based configuration** for easy deployment

## Setup & Run

### 1. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env` and configure:
```bash
# Database
DATABASE_URL="file:./dev.db"

# Pi Network Configuration
NEXT_PUBLIC_PI_APP_ID="your_pi_app_id_here"
NEXT_PUBLIC_DEFAULT_USERNAME="pioneer_314"
NEXT_PUBLIC_DEFAULT_UID="pi-user-123"

# App Configuration
NEXT_PUBLIC_APP_NAME="GT Store"
NEXT_PUBLIC_APP_DESCRIPTION="Marketplace for Gadgets and Electronics"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed database with sample data
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```

## Database Management

- **Schema**: Defined in `prisma/schema.prisma`
- **Seed Data**: Located in `data/gadgets.json` and `data/electronics.json`
- **API Routes**: 
  - `/api/gadgets` - Gadgets CRUD
  - `/api/electronics` - Electronics CRUD
  - `/api/listings` - Combined listings endpoint

## Pi SDK Integration
Replace the stub in `components/PiLoginButton.js` with real Pi SDK calls using `NEXT_PUBLIC_PI_APP_ID`.

## Architecture
- **Frontend**: Next.js Pages Router with Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **Data**: JSON arrays stored as strings in database (SQLite limitation)
- **Environment**: Configurable via environment variables
