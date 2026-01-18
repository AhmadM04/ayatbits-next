import { connectDB, User } from '@/lib/db';
import { IUser } from '@/lib/models/User';

/**
 * Find a user by any of their Clerk IDs (supports multiple environments)
 * @param clerkId - The Clerk ID to search for
 * @returns The user document or null if not found
 */
export async function findUserByAnyClerkId(clerkId: string): Promise<IUser | null> {
  await connectDB();
  // MongoDB automatically searches arrays when using this syntax
  return await User.findOne({ clerkIds: clerkId });
}

/**
 * Find a user by email (case-insensitive)
 * @param email - The email address to search for
 * @returns The user document or null if not found
 */
export async function getUserByEmail(email: string): Promise<IUser | null> {
  await connectDB();
  const emailLower = email.toLowerCase();
  return await User.findOne({ email: { $regex: new RegExp(`^${emailLower}$`, 'i') } });
}

/**
 * Add a Clerk ID to a user's clerkIds array if not already present
 * @param userId - The MongoDB user ID or email
 * @param clerkId - The Clerk ID to add
 * @returns The updated user document or null if user not found
 */
export async function addClerkIdToUser(
  userId: string,
  clerkId: string
): Promise<IUser | null> {
  await connectDB();
  
  // Try to find by MongoDB _id first, then by email
  let user: IUser | null = await User.findById(userId);
  if (!user) {
    const userByEmail = await getUserByEmail(userId);
    user = userByEmail;
  }
  
  if (!user) {
    return null;
  }

  // Initialize clerkIds array if it doesn't exist
  if (!user.clerkIds) {
    user.clerkIds = [];
  }

  // Add clerkId if not already present
  if (!user.clerkIds.includes(clerkId)) {
    user.clerkIds.push(clerkId);
    await user.save();
  }

  return user;
}

/**
 * Find or create a user by Clerk ID and email
 * This handles the case where a user might exist by email but not by clerkId
 * @param clerkId - The Clerk ID
 * @param email - The user's email
 * @param userData - Additional user data for creation
 * @returns The user document
 */
export async function findOrCreateUserByClerkId(
  clerkId: string,
  email: string,
  userData?: {
    firstName?: string;
    lastName?: string;
    name?: string;
    imageUrl?: string;
  }
): Promise<IUser> {
  await connectDB();

  // Try to find by clerkId first
  let user = await findUserByAnyClerkId(clerkId);

  if (!user) {
    // Try to find by email
    user = await getUserByEmail(email);

    if (user) {
      // User exists by email, add the new clerkId
      if (!user.clerkIds) {
        user.clerkIds = [];
      }
      if (!user.clerkIds.includes(clerkId)) {
        user.clerkIds.push(clerkId);
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        clerkIds: [clerkId],
        email: email.toLowerCase(),
        ...userData,
      });
    }
  }

  return user;
}

/**
 * Check if a user has any of the given Clerk IDs
 * @param user - The user document
 * @param clerkIds - Array of Clerk IDs to check
 * @returns True if user has any of the Clerk IDs
 */
export function userHasAnyClerkId(user: IUser, clerkIds: string[]): boolean {
  if (!user.clerkIds || user.clerkIds.length === 0) {
    return false;
  }
  return clerkIds.some(id => user.clerkIds?.includes(id));
}

/**
 * Get all Clerk IDs for a user
 * @param email - The user's email
 * @returns Array of Clerk IDs or empty array if user not found
 */
export async function getAllClerkIdsForUser(email: string): Promise<string[]> {
  const user = await getUserByEmail(email);
  return user?.clerkIds || [];
}

