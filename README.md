# AyatBits - Gamified Quranic Study App

A Next.js application for learning and memorizing Quranic verses through interactive puzzles.

## Features

- 🎮 **Gamified Learning**: Interactive word-ordering puzzles
- 📚 **Juz & Surah Selection**: Browse by Juz (1-30) or specific Surah
- 📊 **Progress Tracking**: Track your completion across puzzles
- ❤️ **Favorites**: Save your favorite ayahs
- 🔥 **Streaks**: Build daily learning habits
- 🏆 **Achievements**: Unlock trophies as you progress
- 🌍 **18+ Translations**: Learn with your preferred translation
- 💳 **Subscription**: Stripe integration with 7-day free trial

## Tech Stack

- **Framework**: Next.js 16 (App Router + Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB (via Mongoose)
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
   Create `.env.local` with:
   ```env
   MONGODB_URL="mongodb+srv://..."
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
   CLERK_SECRET_KEY=your_clerk_secret
   STRIPE_SECRET_KEY=your_stripe_secret
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)** in your browser.

## Scripts

- `npm run dev` - Start development server (Turbopack)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript check

## License

Private - All rights reserved
