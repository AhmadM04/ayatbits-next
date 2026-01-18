import 'dotenv/config';
import { connectDB, User } from '@/lib/db';

/**
 * Set a user as admin by email
 * Run with: npx tsx scripts/set-admin.ts
 */
async function setAdmin() {
  const email = 'muhhamedsin@gmail.com';
  
  try {
    await connectDB();
    
    const user = await User.findOneAndUpdate(
      { email: { $regex: new RegExp(`^${email}$`, 'i') } },
      { $set: { isAdmin: true } },
      { new: true }
    );
    
    if (user) {
      console.log('✅ User updated to admin:', {
        email: user.email,
        isAdmin: user.isAdmin,
        clerkIds: user.clerkIds,
      });
    } else {
      console.log('❌ User not found with email:', email);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed:', error);
    process.exit(1);
  }
}

setAdmin();

