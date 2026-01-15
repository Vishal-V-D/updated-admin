'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
  deleteUser,
  resendInvitation,
  updateUserRole
} from '@/app/actions/user-management';
import { formatDistance } from 'date-fns';
import { Mail, MoreHorizontal, Shield, Trash2, UserCog } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { User } from '@/app/actions/user-management';

interface UserManagementTableProps {
  users: User[];
}

export function UserManagementTable({ users }: UserManagementTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ... (keep handlers same) ...

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setIsDeleting(true);
    try {
      // For invited users, we might need a different delete action (revoke invitation)
      // But for now assuming deleteUser handles both or we clarify
      const result = await deleteUser(selectedUser.id);

      if (result.success) {
        toast.success('User deleted successfully');
        setDeleteDialogOpen(false);
      } else {
        toast.error('Failed to delete user', {
          description: result.error
        });
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsDeleting(false);
      setSelectedUser(null);
    }
  };

  // Explicitly re-declare handlers to ensure scope access if we were doing partial replace,
  // but since we are replacing the whole component logic mostly, we'll keep it simple.
  // Actually, to keep it clean, let's reuse the existing handlers but update the JSX.

  const handleResendInvitation = async (email: string) => {
    try {
      const result = await resendInvitation(email);
      if (result.success) {
        toast.success('Invitation resent successfully', {
          description: `Invitation email sent to ${email}`
        });
      } else {
        toast.error('Failed to resend invitation', {
          description: result.error
        });
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const result = await updateUserRole(userId, newRole);
      if (result.success) {
        toast.success('User role updated successfully');
      } else {
        toast.error('Failed to update user role', {
          description: result.error
        });
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'destructive';
      case 'moderator':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    return status === 'active' ? 'outline' : 'secondary';
  };

  const getInitials = (name: string) => {
    if (name === 'Pending Acceptance') return 'PA';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Sign In</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className='text-muted-foreground text-center'
                >
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className='flex items-center gap-3'>
                      <Avatar className='h-8 w-8'>
                        <AvatarImage src={user.imageUrl} alt={user.fullName} />
                        <AvatarFallback>
                          {getInitials(user.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <span className='font-medium'>{user.fullName}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusBadgeVariant(user.status)}
                      className='capitalize'
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatDistance(new Date(user.createdAt), new Date(), {
                      addSuffix: true
                    })}
                  </TableCell>
                  <TableCell>
                    {user.lastSignInAt
                      ? formatDistance(
                          new Date(user.lastSignInAt),
                          new Date(),
                          {
                            addSuffix: true
                          }
                        )
                      : 'Never'}
                  </TableCell>
                  <TableCell className='text-right'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' className='h-8 w-8 p-0'>
                          <span className='sr-only'>Open menu</span>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        {user.status === 'invited' && (
                          <DropdownMenuItem
                            onClick={() => handleResendInvitation(user.email)}
                          >
                            <Mail className='mr-2 h-4 w-4' />
                            Resend Invitation
                          </DropdownMenuItem>
                        )}

                        {user.status === 'active' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleUpdateRole(user.id, 'user')}
                              disabled={user.role === 'user'}
                            >
                              <UserCog className='mr-2 h-4 w-4' />
                              Set as User
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateRole(user.id, 'moderator')
                              }
                              disabled={user.role === 'moderator'}
                            >
                              <Shield className='mr-2 h-4 w-4' />
                              Set as Moderator
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleUpdateRole(user.id, 'admin')}
                              disabled={user.role === 'admin'}
                            >
                              <Shield className='mr-2 h-4 w-4' />
                              Set as Admin
                            </DropdownMenuItem>
                          </>
                        )}

                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className='text-destructive focus:text-destructive'
                          onClick={() => {
                            setSelectedUser(user);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className='mr-2 h-4 w-4' />
                          {user.status === 'invited'
                            ? 'Revoke Invite'
                            : 'Delete User'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{' '}
              <span className='font-semibold'>{selectedUser?.fullName}</span> (
              {selectedUser?.email}). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={isDeleting}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {isDeleting ? 'Deleting...' : 'Delete User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
