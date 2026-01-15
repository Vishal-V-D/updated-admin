import { UserManagementTable } from '@/components/admin/user-management-table';
import { getAllUsers } from '@/app/actions/user-management';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Users, UserPlus } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';

export const metadata = {
  title: 'User Management',
  description: 'Manage user accounts and permissions'
};

export default async function UserManagementPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/auth/sign-in');
  }

  // Role check removed: All logged-in users are trusted

  const result = await getAllUsers();

  if (!result.success) {
    return (
      <PageContainer>
        <div className='flex h-full items-center justify-center'>
          <Card className='w-full max-w-md'>
            <CardHeader>
              <CardTitle className='text-destructive'>Error</CardTitle>
              <CardDescription>{result.error}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className='flex h-full flex-1 flex-col space-y-8'>
        <div className='flex items-center justify-between space-y-2'>
          <div>
            <div className='flex items-center gap-2'>
              <Users className='h-8 w-8' />
              <h2 className='text-3xl font-bold tracking-tight'>
                User Management
              </h2>
            </div>
            <p className='text-muted-foreground mt-2'>
              Manage user accounts, roles, and permissions
            </p>
          </div>
          <div className='flex items-center space-x-2'>
            <Link href='/dashboard/users/invite'>
              <Button>
                <UserPlus className='mr-2 h-4 w-4' />
                Invite User
              </Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users ({result.users?.length || 0})</CardTitle>
            <CardDescription>
              View and manage all registered users and pending invitations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserManagementTable users={result.users || []} />
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
