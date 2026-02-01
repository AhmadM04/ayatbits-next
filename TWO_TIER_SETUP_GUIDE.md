# Two-Tier Subscription System - Setup Guide

## ✅ Completed Implementation

All code changes have been implemented. This guide covers the final setup steps and testing.

## 🎯 What Was Implemented

### 1. Database Schema ✅
- Added `subscriptionTier` field to User model ('basic' | 'pro')
- Created `Voucher` model for promotional codes
- Created `VoucherRedemption` model to track redemptions
- Created `TafsirCache` model for pre-generated AI tafsir

### 2. Subscription Logic ✅
- `checkProAccess(user)` - checks if user has Pro tier
- `getUserTier(user)` - returns user's tier or null
- Pro tier includes: AI Tafsir + Word-by-Word Audio

### 3. Feature Gating ✅
- AI Tafsir API requires Pro tier
- Word-by-word audio setting requires Pro tier
- Settings API returns `hasProAccess` flag

### 4. Pricing & Checkout ✅
- New pricing page with 4 plans (Basic/Pro × Monthly/Yearly)
- EUR pricing: Basic (€5.99/€49.99), Pro (€11.99/€100)
- Voucher redemption interface
- Tier selector in pricing UI

### 5. Admin Features ✅
- Admin grants always give Pro tier
- Voucher management UI in admin panel
- Voucher creation, activation/deactivation

### 6. Scripts ✅
- `migrate-to-two-tier.ts` - Migrate existing users
- `pregenerate-tafsir.ts` - Pre-generate all tafsir (6,236 × languages)

### 7. AI Tafsir Optimization ✅
- Switched to `gemini-2.0-flash-exp` (cheaper, faster)
- Cache-first loading (instant if cached)
- Automatic caching after generation

## 🔧 Required Setup Steps

### Step 1: Create Stripe Products (Manual - Required)

You need to create 4 products in your Stripe Dashboard:

1. **Basic Monthly** - €5.99/month
   - Name: "AyatBits Basic - Monthly"
   - Description: "Access to all puzzles and basic features"
   - Price: €5.99 recurring monthly

2. **Basic Yearly** - €49.99/year  
   - Name: "AyatBits Basic - Yearly"
   - Description: "Access to all puzzles and basic features"
   - Price: €49.99 recurring yearly
   - Note: 30% savings from monthly (€71.88 → €49.99)

3. **Pro Monthly** - €11.99/month
   - Name: "AyatBits Pro - Monthly"
   - Description: "Full access with AI Tafsir and word-by-word audio"
   - Price: €11.99 recurring monthly

4. **Pro Yearly** - €100/year
   - Name: "AyatBits Pro - Yearly"
   - Description: "Full access with AI Tafsir and word-by-word audio"
   - Price: €100 recurring yearly
   - Note: 35% savings from monthly (€143.88 → €100)

After creating, add the price IDs to your `.env`:

```bash
NEXT_PUBLIC_STRIPE_BASIC_MONTHLY_PRICE_ID=price_xxx
NEXT_PUBLIC_STRIPE_BASIC_YEARLY_PRICE_ID=price_xxx
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID=price_xxx
NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID=price_xxx
```

### Step 2: Run Migration Script

Migrate existing users to the new tier system:

```bash
npx tsx -r dotenv/config scripts/migrate-to-two-tier.ts
```

This will:
- Set existing paid users to **Basic** tier
- Set admin/direct access users to **Pro** tier
- Skip inactive users (no tier assigned)

### Step 3: Pre-generate Tafsir (Optional but Recommended)

For instant loading, pre-generate tafsir for common languages:

```bash
npx tsx -r dotenv/config scripts/pregenerate-tafsir.ts
```

- Generates ~62,000 tafsir entries (6,236 ayahs × 10 languages)
- Cost estimate: ~$30-50 one-time with Gemini 2.0 Flash
- Takes ~2-4 hours depending on API rate limits
- Subsequent requests will load instantly from cache

**Priority languages**: English, Arabic, Russian, Turkish, Urdu, Indonesian, Malay, Bengali, Hindi, French

You can also let it generate on-demand (lazy loading). First request generates, subsequent requests are instant.

## 📊 Testing Checklist

### Basic Subscription Flow
- [ ] Sign up new user
- [ ] Select Basic Monthly plan
- [ ] Complete Stripe checkout (7-day trial)
- [ ] Verify user has Basic tier in database
- [ ] Access dashboard - confirm basic features work
- [ ] Attempt to enable word-by-word audio - should show upgrade prompt
- [ ] Attempt to use AI Tafsir - should show upgrade prompt

### Pro Subscription Flow
- [ ] Sign up new user
- [ ] Select Pro Monthly plan
- [ ] Complete Stripe checkout (7-day trial)
- [ ] Verify user has Pro tier in database
- [ ] Enable word-by-word audio - should work
- [ ] Use AI Tafsir - should work
- [ ] Verify tafsir caching works (second request instant)

### Yearly Plans
- [ ] Test Basic Yearly (€49.99) - verify 30% discount shown
- [ ] Test Pro Yearly (€100) - verify 35% discount shown

### Voucher System
- [ ] Admin creates voucher (e.g., RAMADAN2026)
  - Type: Ramadan
  - Tier: Pro
  - Duration: 1 month
  - Max redemptions: 1000
- [ ] User enters voucher code on pricing page
- [ ] Validate voucher shows details
- [ ] Redeem voucher (signed in)
- [ ] Verify user gets Pro access for specified duration
- [ ] Verify voucher redemption count increments
- [ ] Test expired voucher
- [ ] Test deactivated voucher
- [ ] Test max redemptions reached

### Admin Access Grants
- [ ] Admin grants lifetime access to user
- [ ] Verify user gets Pro tier
- [ ] Admin grants 1-month access to user
- [ ] Verify user gets Pro tier with 1-month expiry

### Feature Access
- [ ] Basic user cannot access AI Tafsir
- [ ] Basic user cannot enable word-by-word audio
- [ ] Pro user can access AI Tafsir
- [ ] Pro user can enable word-by-word audio
- [ ] Admin always has Pro access

### Webhook Handling
- [ ] Subscription created - tier stored correctly
- [ ] Subscription updated - status updates
- [ ] Subscription cancelled - user loses access
- [ ] User with admin access attempts checkout - subscription cancelled

## 🚀 Deployment Steps

1. **Update Environment Variables**
   - Add 4 Stripe price IDs
   - Ensure GEMINI_API_KEY is set

2. **Run Migration**
   ```bash
   npm run db:seed  # If needed
   npx tsx -r dotenv/config scripts/migrate-to-two-tier.ts
   ```

3. **Deploy Application**
   ```bash
   git add .
   git commit -m "Implement two-tier subscription system with Pro features"
   git push
   ```

4. **Optional: Pre-generate Tafsir**
   ```bash
   # Run in production or staging
   npx tsx -r dotenv/config scripts/pregenerate-tafsir.ts
   ```

5. **Verify Webhooks**
   - Test Stripe webhooks in dashboard
   - Ensure webhook secret is correct

## 📝 Key Changes Summary

### Pricing Structure
| Plan | Price | Features |
|------|-------|----------|
| Basic Monthly | €5.99/mo | All puzzles, translations, progress tracking, audio recitations |
| Basic Yearly | €49.99/yr | Same as Basic Monthly (30% off) |
| Pro Monthly | €11.99/mo | Basic features + AI Tafsir + Word-by-word audio |
| Pro Yearly | €100/yr | Same as Pro Monthly (35% off) |

### Feature Distribution
- **Basic Tier**: Everything except AI Tafsir and word-by-word audio
- **Pro Tier**: All features including AI Tafsir and word-by-word audio

### Admin & Voucher Access
- Admin-granted access → Always Pro tier
- Vouchers can grant Basic or Pro tier
- Ramadan vouchers default to Pro tier for 1 month

## 🔍 Monitoring & Analytics

Track these metrics after launch:
- Basic vs Pro subscription ratio
- Trial to paid conversion rate by tier
- Feature usage (AI Tafsir, word-by-word audio)
- Voucher redemption rates
- Upgrade rate from Basic to Pro

## ⚠️ Important Notes

1. **Existing Users**: Migration script assigns Basic tier to existing paid users. You may want to give them Pro tier for loyalty - just run the migration script with adjustments or use admin panel to upgrade them.

2. **Trial Period**: Both tiers include 7-day free trial. Users are charged after trial ends unless they cancel.

3. **Tier Changes**: Users cannot change tiers mid-subscription. They must cancel and resubscribe to change tiers.

4. **Gemini Costs**: Monitor Gemini API usage. Pre-generation is one-time cost. Ongoing costs are minimal with caching.

5. **Cache Management**: Tafsir cache stores indefinitely. If you improve prompts, regenerate by clearing cache or incrementing version.

## 📞 Support & Questions

- Voucher issues: Check admin panel for redemption counts and expiry
- Tier issues: Verify `subscriptionTier` field in user document
- Feature access issues: Check `checkProAccess()` logic
- Stripe sync issues: Review webhook logs

## 🎉 Launch Checklist

- [ ] Stripe products created
- [ ] Environment variables set
- [ ] Migration script run
- [ ] Test checkout flow (both tiers)
- [ ] Test voucher system
- [ ] Test feature gating
- [ ] Pre-generate tafsir (optional)
- [ ] Update marketing materials
- [ ] Announce new tiers to users
- [ ] Monitor first 24 hours closely

---

**Status**: ✅ Ready for testing and deployment
**Estimated Setup Time**: 30 minutes
**Estimated Pre-generation Time**: 2-4 hours (optional)

