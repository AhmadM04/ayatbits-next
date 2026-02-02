import 'dotenv/config';
import { connectDB, User } from '../lib/db';
import { SubscriptionStatusEnum } from '../lib/models/User';

// Change this to your email
const EMAIL = 'muhhamedsin@gmail.com';
const DURATION_DAYS = 30; // 30 days of access

async function grantAccess() {
  await connectDB();
  
  console.log(`\n🔍 Looking for user: ${EMAIL}\n`);
  
  const user = await User.findOne({ 
    email: { $regex: new RegExp(`^${EMAIL}$`, 'i') } 
  });

  if (!user) {
    console.error(`❌ User not found: ${EMAIL}`);
    process.exit(1);
  }

  console.log(`✅ Found user:`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Clerk IDs: ${user.clerkIds?.join(', ') || 'none'}`);
  console.log(`   Current Status: ${user.subscriptionStatus}`);
  console.log(`   Current Plan: ${user.subscriptionPlan || 'none'}`);
  console.log(`   Has Direct Access: ${user.hasDirectAccess || false}`);
  console.log(`   Subscription End Date: ${user.subscriptionEndDate || 'none'}`);

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + DURATION_DAYS);

  await User.findByIdAndUpdate(user._id, {
    subscriptionStatus: SubscriptionStatusEnum.ACTIVE,
    subscriptionPlan: 'monthly',
    subscriptionTier: 'pro',
    subscriptionEndDate: endDate,
    hasDirectAccess: true,
  });

  console.log(`\n✅ Access granted!`);
  console.log(`   New Status: active`);
  console.log(`   New Plan: monthly (Pro tier)`);
  console.log(`   End Date: ${endDate.toISOString()}`);
  console.log(`   Days: ${DURATION_DAYS}`);
  console.log(`   Has Direct Access: true`);
  console.log(`\n🎉 You should now be able to access the dashboard!\n`);

  process.exit(0);
}

grantAccess().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

