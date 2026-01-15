import { InviteUserForm } from '@/components/admin/invite-user-form';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { UserPlus } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';

export const metadata = {
  title: 'Invite User',
  description: 'Invite a new user to the platform'
};

export default async function InviteUserPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/auth/sign-in');
  }

  // Role check removed: All logged-in users are trusted

  return (
    <PageContainer>
      <div className='flex h-full flex-1 flex-col space-y-8'>
        <div className='flex items-center justify-between space-y-2'>
          <div>
            <div className='flex items-center gap-2'>
              <UserPlus className='h-8 w-8' />
              <h2 className='text-3xl font-bold tracking-tight'>Invite User</h2>
            </div>
            <p className='text-muted-foreground mt-2'>
              Send an invitation email to add a new user to your organization.
            </p>
          </div>
        </div>

        <div className='max-w-2xl'>
          <InviteUserForm />
        </div>
      </div>
    </PageContainer>
  );
}
