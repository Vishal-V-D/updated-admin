'use server';

import { auth, clerkClient } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

/**
 * Check if the current user is an admin
 */
async function isAdmin() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return false;
  }

  // Check if user has admin role in public metadata
  // CHANGED: As per request, strict role check is disabled. Any logged-in user is trusted.
  // const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
  // return role === 'admin';
  return true;
}

/**
 * Get all users from Clerk
 */
export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  createdAt: number;
  lastSignInAt: number | null;
  imageUrl?: string;
  status: 'active' | 'invited';
};

/**
 * Get all users and invitations from Clerk
 */
export async function getAllUsers() {
  try {
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return { success: false, error: 'Unauthorized: Admin access required' };
    }

    const client = await clerkClient();

    // Fetch users only (no invitations since we create users directly)
    const usersResponse = await client.users.getUserList({
      limit: 100,
      orderBy: '-created_at'
    });

    const users: User[] = usersResponse.data.map((user) => ({
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      fullName:
        `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A',
      role: (user.publicMetadata?.role as string) || 'user',
      createdAt: user.createdAt,
      lastSignInAt: user.lastSignInAt,
      imageUrl: user.imageUrl,
      status: 'active'
    }));

    // Filter to only show admins
    const adminUsers = users
      .filter((user) => user.role === 'admin')
      .sort((a, b) => b.createdAt - a.createdAt);

    return { success: true, users: adminUsers };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { success: false, error: 'Failed to fetch users' };
  }
}

/**
 * Create a new user and send invitation email
 */
export async function createUser(data: {
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
}) {
  try {
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return { success: false, error: 'Unauthorized: Admin access required' };
    }

    const client = await clerkClient();

    // 1. Check if user already exists
    const existingUsers = await client.users.getUserList({
      emailAddress: [data.email]
    });
    if (existingUsers.data.length > 0) {
      return { success: false, error: 'User with this email already exists.' };
    }

    // 2. Create user directly (Clerk will auto-send password setup email)
    const user = await client.users.createUser({
      emailAddress: [data.email],
      firstName: data.firstName,
      lastName: data.lastName,
      publicMetadata: {
        role: data.role || 'admin'
      },
      skipPasswordRequirement: true, // User will receive "set password" email from Clerk
      skipPasswordChecks: true
    });

    revalidatePath('/dashboard/users');

    return {
      success: true,
      message:
        'User created successfully. They will receive an email to set their password.',
      user: {
        id: user.id,
        email: data.email,
        name: `${data.firstName} ${data.lastName}`
      }
    };
  } catch (error: any) {
    console.error('Error creating user:', JSON.stringify(error, null, 2));

    // Extract precise Clerk error message
    const clerkError =
      error?.errors?.[0]?.message || error.message || 'Failed to create user';

    return { success: false, error: clerkError };
  }
}

/**
 * Delete a user
 */
export async function deleteUser(userId: string) {
  try {
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return { success: false, error: 'Unauthorized: Admin access required' };
    }

    const { userId: currentUserId } = await auth();

    // Prevent deleting yourself
    if (userId === currentUserId) {
      return { success: false, error: 'Cannot delete your own account' };
    }

    const client = await clerkClient();
    await client.users.deleteUser(userId);

    revalidatePath('/dashboard/users');

    return { success: true, message: 'User deleted successfully' };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: 'Failed to delete user' };
  }
}

/**
 * Update user role
 */
export async function updateUserRole(userId: string, role: string) {
  try {
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return { success: false, error: 'Unauthorized: Admin access required' };
    }

    const client = await clerkClient();
    await client.users.updateUser(userId, {
      publicMetadata: {
        role: role
      }
    });

    revalidatePath('/dashboard/users');

    return { success: true, message: 'User role updated successfully' };
  } catch (error) {
    console.error('Error updating user role:', error);
    return { success: false, error: 'Failed to update user role' };
  }
}

/**
 * Resend password setup email to a user
 */
export async function resendInvitation(email: string) {
  try {
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return { success: false, error: 'Unauthorized: Admin access required' };
    }

    // Note: Clerk automatically sends password setup email on user creation
    // For resending, user should use "Forgot Password" on sign-in page

    return {
      success: true,
      message:
        'User should use "Forgot Password" on the sign-in page to reset their password.'
    };
  } catch (error) {
    console.error('Error resending password setup email:', error);
    return { success: false, error: 'Failed to resend password setup email' };
  }
}
