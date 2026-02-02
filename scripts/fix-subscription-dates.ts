import 'dotenv/config';
import Stripe from 'stripe';
import { connectDB, User } from '../lib/db';
import { logger } from '../lib/logger';

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ Error: STRIPE_SECRET_KEY environment variable is not set');
  console.error('   Please ensure your .env or .env.local file is configured correctly');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-11-17.clover' as any,
});

async function fixSubscriptionDates() {
  await connectDB();
  
  console.log('🔍 Searching for users with missing subscription end dates...\n');
  
  // Find users with active/trialing status but no subscriptionEndDate
  const usersToFix = await User.find({
    subscriptionStatus: { $in: ['active', 'trialing'] },
    stripeCustomerId: { $exists: true, $ne: null },
    $or: [
      { subscriptionEndDate: { $exists: false } },
      { subscriptionEndDate: null }
    ]
  });

  console.log(`📋 Found ${usersToFix.length} users to fix\n`);

  if (usersToFix.length === 0) {
    console.log('✅ All users have valid subscription end dates!');
    process.exit(0);
  }

  let fixed = 0;
  let errors = 0;

  for (const user of usersToFix) {
    try {
      console.log(`\n👤 Processing: ${user.email}`);
      console.log(`   Clerk IDs: ${user.clerkIds?.join(', ') || 'none'}`);
      
      // Get their subscriptions from Stripe
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId!,
        status: 'all',
        limit: 10
      });

      if (subscriptions.data.length === 0) {
        console.log(`   ⚠️  No Stripe subscription found - may need manual review`);
        errors++;
        continue;
      }

      // Find active or trialing subscription
      const activeSubscription = subscriptions.data.find(
        sub => sub.status === 'active' || sub.status === 'trialing'
      );

      if (!activeSubscription) {
        console.log(`   ⚠️  No active/trialing subscription in Stripe`);
        console.log(`   📊 Subscriptions found: ${subscriptions.data.map(s => s.status).join(', ')}`);
        errors++;
        continue;
      }

      // @ts-ignore - Stripe SDK type issue
      const endDate = new Date((activeSubscription.current_period_end as number) * 1000);
      
      // @ts-ignore - Stripe SDK type issue
      const status = activeSubscription.status === 'trialing' ? 'trialing' : 'active';
      
      const interval = activeSubscription.items.data[0]?.plan?.interval;
      const plan = interval === 'year' ? 'yearly' : 'monthly';

      await User.findByIdAndUpdate(user._id, {
        subscriptionEndDate: endDate,
        subscriptionStatus: status,
        subscriptionPlan: plan
      });

      console.log(`   ✅ FIXED!`);
      console.log(`      Status: ${status}`);
      console.log(`      Plan: ${plan}`);
      console.log(`      End Date: ${endDate.toISOString()}`);
      console.log(`      Days remaining: ${Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))}`);
      
      fixed++;
    } catch (error: any) {
      console.error(`   ❌ Error: ${error.message}`);
      errors++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Fixed: ${fixed}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`   📋 Total: ${usersToFix.length}`);
  console.log('\n✅ Done!\n');
  
  process.exit(0);
}

fixSubscriptionDates().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

