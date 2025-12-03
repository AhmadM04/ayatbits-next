import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin';

/**
 * Check if current user is admin
 * GET /api/admin/check
 */
export async function GET() {
  try {
    const userIsAdmin = await isAdmin();
    return NextResponse.json({ isAdmin: userIsAdmin });
  } catch (error: any) {
    console.error('Check admin error:', error);
    return NextResponse.json({ isAdmin: false });
  }
}


