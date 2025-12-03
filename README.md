# AyatBits - Gamified Quranic Study App

A Next.js application for learning and memorizing Quranic verses through interactive puzzles.

## Features

- 🎮 **Gamified Learning**: Interactive word-ordering puzzles
- 📚 **Juz & Surah Selection**: Browse by Juz (1-30) or specific Surah
- 📊 **Progress Tracking**: Track your completion across puzzles
- ❤️ **Favorites**: Save your favorite puzzles
- 💳 **Pro Subscription**: Stripe integration for premium features
- 🎨 **Beautiful UI**: Hybrid design combining Craft's clean layout with Duolingo's playful interactivity

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (via Prisma)
- **Authentication**: Clerk
- **Payments**: Stripe
- **Animations**: Framer Motion
- **Drag & Drop**: dnd-kit

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Copy `.env.example` to `.env` and fill in your values:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/ayatbits"
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
   CLERK_SECRET_KEY=your_clerk_secret
   STRIPE_SECRET_KEY=your_stripe_secret
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   ```

3. **Set up the database**:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   npm run db:seed
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)** in your browser.

## Project Structure

```
ayatbits-nextjs/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── puzzle/            # Puzzle pages
│   └── pricing/           # Pricing page
├── components/            # React components
│   ├── ui/               # UI components (Button, etc.)
│   └── WordPuzzle.tsx    # Main puzzle component
├── lib/                   # Utility functions
│   ├── puzzle-logic.ts   # Puzzle validation logic
│   ├── prisma.ts         # Prisma client
│   └── cloudinary.ts     # Cloudinary utilities
├── prisma/                # Prisma schema and migrations
│   └── seed.ts           # Database seeder
└── types/                 # TypeScript types
```

## Database Schema

- **User**: User accounts (linked to Clerk)
- **Juz**: The 30 Juzs of the Quran
- **Surah**: The 114 Surahs
- **Puzzle**: Individual puzzles (word ordering, fill blank, matching)
- **UserProgress**: Track user completion
- **LikedAyat**: User favorites
- **Trophy**: Achievements

## Puzzle Logic

The puzzle logic is ported from the original Expo app and handles:
- Arabic text tokenization
- Text normalization for comparison
- Word ordering validation
- Mistake tracking (3 mistakes max)

## Deployment

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**:
   - Connect your GitHub repository
   - Add environment variables
   - Deploy!

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:seed` - Seed the database
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

## License

Private - All rights reserved
