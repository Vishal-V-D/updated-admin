'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { createUser } from '@/app/actions/user-management';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Send } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

const userFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  role: z.enum(['admin', 'user', 'moderator'])
});

type UserFormValues = z.infer<typeof userFormSchema>;

export function InviteUserForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      role: 'admin' // Default to admin per request
    }
  });

  async function onSubmit(data: UserFormValues) {
    setIsLoading(true);
    try {
      const result = await createUser(data);

      if (result.success) {
        toast.success('User Created Successfully!', {
          description: `${data.email} can now sign in using their email. They'll receive a login link in their inbox.`
        });
        router.push('/dashboard/users');
        router.refresh();
      } else {
        toast.error('Failed to send invitation', {
          description: result.error
        });
      }
    } catch (error) {
      toast.error('An error occurred', {
        description: 'Please try again later'
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invitation Details</CardTitle>
        <CardDescription>
          Enter the details of the new Admin. They will receive an email to set
          up their password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='colleague@example.com'
                      type='email'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    We'll send an invitation link to this email.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='firstName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input placeholder='John' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='lastName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input placeholder='Doe' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Hidden Role Field - Forces Admin Role */}
            <div className='hidden'>
              <FormField
                control={form.control}
                name='role'
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} value='admin' />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className='flex justify-end gap-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isLoading}>
                {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {isLoading ? 'Sending Invitation...' : 'Send Invitation'}
                {!isLoading && <Send className='ml-2 h-4 w-4' />}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
