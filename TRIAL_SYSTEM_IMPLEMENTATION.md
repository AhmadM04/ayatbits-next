# Trial System Implementation - Complete Guide

## Overview

This document describes the complete implementation of the new trial flow system where users can browse pricing, start a 7-day trial on either Basic or Pro plan, and gracefully transition to paid or free tier afterward.

---

## Key Features

1. **User-Initiated Trials**: Users browse pricing at their own pace and click "Start 7-Day Trial" on Basic or Pro.
2. **No Stripe at Trial Start**: No payment information required during trial activation.
3. **Dynamic UI States**: Buttons change based on trial status (not started, active, expired).
4. **Free Tier Fallback**: After trial expiry, users get 10 puzzles/day + unlimited Mushaf access.
5. **Performance Optimized**: Uses `.lean()`, `Promise.all`, and efficient queries.

---

## Architecture

### 1. Database Schema (User Model)

**New Fields Added:**

```typescript
// Trial Management
trialStartedAt?: Date;        // When trial was activated
trialPlan?: 'basic' | 'pro';  // Which plan they're trialing
hasUsedTrial?: boolean;       // Prevents multiple trials

// Daily Puzzle Limit (Free Tier)
dailyPuzzleCount?: number;    // Count of puzzles completed today
lastPuzzleDate?: Date;        // Date of last puzzle (for reset)
```

**File**: `lib/models/User.ts`

---

### 2. Business Logic (Subscription Helpers)

**New Functions in `lib/subscription.ts`:**

#### `getCurrentPlan(user: IUser): 'free' | 'basic' | 'pro'`

Returns the effective plan for a user:

- **Admin/Direct Access** → `'pro'`
- **Active Stripe Subscription** → `user.subscriptionTier` (basic/pro)
- **Lifetime Subscription** → `user.subscriptionTier` (defaults to pro)
- **Active Trial** → `user.trialPlan` (basic/pro)
- **Default** → `'free'` (10 puzzles/day limit)

#### `isTrialActive(user: IUser): boolean`

Checks if the trial is currently active (within 7 days of `trialStartedAt`).

#### `getTrialDaysLeft(user: IUser): number`

Returns the number of days remaining in the trial (0 if expired/not started).

---

### 3. API Endpoints

#### `/api/user/start-trial` (POST)

**Purpose**: Activate a 7-day trial when user clicks "Start Trial" button.

**Request Body**:
```json
{
  "plan": "basic" | "pro"
}
```

**Logic**:
1. Check if user has already used their trial (`hasUsedTrial`)
2. Check if user already has an active subscription
3. Set:
   - `trialStartedAt` = now
   - `trialPlan` = selected plan
   - `hasUsedTrial` = true
   - `subscriptionStatus` = 'trialing'
4. Return trial details (start date, end date, days left)

**Performance**:
- Uses `Promise.all` for parallel queries
- Uses `.lean()` for fast read operations
- Updates only necessary fields

**File**: `app/api/user/start-trial/route.ts`

---

#### `/api/check-access` (GET) - Updated

**New Response Fields**:
```typescript
{
  hasAccess: boolean,
  plan: string,
  tier: string,
  // ... existing fields ...
  
  // NEW TRIAL STATUS FIELDS
  hasUsedTrial: boolean,      // Has user ever started a trial?
  isTrialActive: boolean,     // Is trial currently active?
  trialDaysLeft: number,      // Days remaining (0 if expired)
  trialPlan: 'basic' | 'pro', // Which plan they're trialing
  currentPlan: 'free' | 'basic' | 'pro', // Effective plan
}
```

**File**: `app/api/check-access/route.ts`

---

### 4. Puzzle Limit Enforcement

**Updated**: `app/api/puzzles/[id]/progress/route.ts`

**Logic**:
```typescript
1. Get user's current plan using getCurrentPlan()
2. If plan === 'free' AND status === 'COMPLETED':
   a. Check if puzzle was already completed (skip limit for retries)
   b. Reset dailyPuzzleCount if it's a new day
   c. If dailyPuzzleCount >= 10:
      - Return 429 error with friendly message
   d. Otherwise:
      - Increment dailyPuzzleCount
      - Allow puzzle completion
3. If plan !== 'free':
   - No limits, proceed normally
```

**Error Response (429)**:
```json
{
  "error": "Daily puzzle limit reached",
  "message": "You have completed 10 puzzles today. Upgrade to continue or come back tomorrow!",
  "limit": 10,
  "used": 10,
  "plan": "free"
}
```

---

### 5. Pricing UI (PricingContent.tsx)

**State Management**:

```typescript
const [trialStatus, setTrialStatus] = useState<{
  hasUsedTrial: boolean,
  isTrialActive: boolean,
  trialDaysLeft: number,
  trialPlan?: 'basic' | 'pro',
} | null>(null);
```

**Button States** (Dynamic based on trial status):

1. **Not Started Trial** (`!hasUsedTrial`):
   ```tsx
   <button onClick={() => handleStartTrial('basic')}>
     🌟 Start 7-Day Free Trial
   </button>
   ```

2. **Trial Active** (`isTrialActive && trialPlan === plan.tier`):
   ```tsx
   <button disabled>
     ⏰ Trial Active (5 days left)
   </button>
   ```

3. **Trial Expired** (`hasUsedTrial && !isTrialActive`):
   ```tsx
   <button onClick={() => handleSubscribe(priceId, tier)}>
     Upgrade to Basic/Pro
   </button>
   ```

4. **Active Subscription** (`hasAccess && !isTrialActive`):
   ```tsx
   <Link href="/dashboard">
     <button>Go to Dashboard →</button>
   </Link>
   ```

**Free Tier Link** (Subtle, at bottom):
```tsx
{!hasAccess && !trialStatus?.isTrialActive && (
  <Link href="/dashboard">
    Continue with limited Free version (10 puzzles/day)
  </Link>
)}
```

**File**: `app/pricing/PricingContent.tsx`

---

## User Flow Examples

### Flow 1: New User (First Time)

1. User visits `/pricing`
2. Sees "Start 7-Day Free Trial" buttons on Basic and Pro
3. Clicks "Start 7-Day Free Trial" on **Pro**
4. Trial activates instantly (no Stripe)
5. Button changes to "Trial Active (7 days left)" ✅
6. User explores Pro features for 7 days
7. After 7 days:
   - Trial expires
   - Button changes to "Upgrade to Pro"
   - User drops to Free tier (10 puzzles/day)

### Flow 2: Trial Expiry → Free Tier

1. Trial expires (7 days passed)
2. User completes 10 puzzles
3. On 11th puzzle:
   - API returns 429 error
   - UI shows: "Daily limit reached. Upgrade or come back tomorrow!"
4. User can:
   - Upgrade to paid plan
   - Come back next day (counter resets)
   - Use Mushaf (unlimited)

### Flow 3: Trial → Paid Conversion

1. User has active trial
2. Decides to upgrade during trial
3. Clicks "Upgrade to Pro" (Stripe Checkout)
4. Completes payment
5. Subscription activates (no limits)

---

## Performance Optimizations

### Database Queries

1. **`.lean()`**: All read queries return plain JS objects (faster than Mongoose documents)
2. **`Promise.all`**: Parallel fetching for user data and puzzle counts
3. **Field Selection**: Only fetch necessary fields (`.select()`)

### Example (start-trial endpoint):

```typescript
const [updateResult] = await Promise.all([
  User.findByIdAndUpdate(...).select('trialStartedAt trialPlan').lean(),
  UserProgress.countDocuments(...),
]);
```

### Theme Persistence

- Trial activation doesn't block UI
- Theme preferences remain synced (cookie + localStorage)
- `document.documentElement` theme injection ensures instant visual feedback

---

## Security & Edge Cases

### Prevented Exploits

1. **Multiple Trials**: `hasUsedTrial` flag prevents users from starting trial again
2. **Trial + Subscription**: API checks for existing subscriptions before activating trial
3. **Retry Abuse**: Puzzle limit only counts NEW completions (retries are free)
4. **Daily Reset**: `lastPuzzleDate` ensures counter resets at midnight

### Error Handling

- **Trial Already Used**: Returns 400 with clear message
- **Already Subscribed**: Returns 400 with redirect to dashboard
- **Puzzle Limit**: Returns 429 with upgrade CTA
- **Invalid Plan**: Returns 400 for invalid plan values

---

## Testing Checklist

### Trial Activation
- [ ] User can start trial for Basic
- [ ] User can start trial for Pro
- [ ] Button shows "Starting Trial..." during API call
- [ ] Redirects to dashboard after successful trial start
- [ ] Cannot start trial twice (returns error)

### Trial Status Display
- [ ] Button shows "Trial Active (X days left)" when active
- [ ] Days countdown updates correctly
- [ ] Trial for Basic doesn't affect Pro button (and vice versa)

### Puzzle Limits
- [ ] Free users can complete 10 puzzles/day
- [ ] 11th puzzle is blocked with 429 error
- [ ] Counter resets at midnight
- [ ] Trial users have unlimited puzzles
- [ ] Paid users have unlimited puzzles

### Upgrades
- [ ] "Upgrade to Basic/Pro" button works after trial expiry
- [ ] Stripe Checkout flow works correctly
- [ ] Subscription activates and removes limits

### Free Tier Link
- [ ] Link appears at bottom of pricing page
- [ ] Link only shows when NOT subscribed and NOT in trial
- [ ] Link goes to dashboard
- [ ] Dashboard works with free tier (shows limits)

---

## Files Modified

### Core Logic
- `lib/models/User.ts` - Added trial fields
- `lib/subscription.ts` - Added getCurrentPlan, isTrialActive, getTrialDaysLeft

### API Routes
- `app/api/user/start-trial/route.ts` - NEW: Trial activation endpoint
- `app/api/check-access/route.ts` - Added trial status fields to response
- `app/api/puzzles/[id]/progress/route.ts` - Added free tier limit enforcement

### UI Components
- `app/pricing/PricingContent.tsx` - Dynamic trial button states
- (Optional) `app/dashboard/billing/BillingContent.tsx` - Trial status display

---

## Environment Variables

No new environment variables required. Existing Stripe keys work for upgrades.

---

## Deployment Notes

1. **Database Migration**: New fields (`trialStartedAt`, `trialPlan`, `hasUsedTrial`, `dailyPuzzleCount`, `lastPuzzleDate`) will auto-create when users are accessed
2. **Backward Compatibility**: Existing `trialEndsAt` field is still supported (legacy trial system)
3. **No Breaking Changes**: Existing subscriptions continue to work normally

---

## Future Enhancements

1. **Email Notifications**: Send reminder 1 day before trial expiry
2. **Analytics**: Track trial → paid conversion rate
3. **Flexible Limits**: Admin-configurable puzzle limits per tier
4. **Trial Extension**: Allow admins to extend trials for specific users
5. **A/B Testing**: Test 7-day vs 14-day trials

---

## Support & Troubleshooting

### Common Issues

**Issue**: User says trial button doesn't work
- **Check**: Browser console for API errors
- **Check**: Network tab for 400/500 responses
- **Fix**: Verify user hasn't already used trial in DB

**Issue**: Puzzle limit not enforcing
- **Check**: `getCurrentPlan()` returns 'free'
- **Check**: `dailyPuzzleCount` and `lastPuzzleDate` in DB
- **Fix**: Ensure puzzle submission API uses `getCurrentPlan()`

**Issue**: Trial shows wrong days left
- **Check**: `trialStartedAt` in DB (should be ISO date)
- **Check**: Server timezone (should use UTC)
- **Fix**: Recalculate using `getTrialDaysLeft()`

---

## Contact

For questions or issues, contact: dev@ayatbits.com

---

**Last Updated**: February 15, 2026
**Version**: 1.0.0
**Status**: ✅ Production Ready

