'use client';

import React, { useState, useMemo, useEffect } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  IconChartLine, 
  IconSearch, 
  IconArrowUp, 
  IconArrowDown, 
  IconArrowsSort // New import
} from '@tabler/icons-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

// Mock User Data (enlarged)
interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  createdAt: string;
  role: 'user';
}

const MOCK_USERS: User[] = [
  { id: '1', name: 'Liam Wilson', email: 'liam@example.com', mobile: '9876543210', createdAt: '2025-01-10', role: 'user' },
  { id: '2', name: 'Sophia Miller', email: 'sophia@example.com', mobile: '8765432109', createdAt: '2025-01-15', role: 'user' },
  { id: '3', name: 'Noah Davis', email: '7654321098', mobile: '9012345678', createdAt: '2025-01-22', role: 'user' },
  { id: '4', name: 'Olivia Martinez', email: 'olivia@example.com', mobile: '8901234567', createdAt: '2025-01-25', role: 'user' },
  { id: '5', name: 'Mason Garcia', email: 'mason@example.com', mobile: '7890123456', createdAt: '2025-02-01', role: 'user' },
  { id: '6', name: 'Isabella Rodriguez', email: 'isabella@example.com', mobile: '9988776655', createdAt: '2025-02-05', role: 'user' },
  { id: '7', name: 'James Evans', email: 'james@example.com', mobile: '8877665544', createdAt: '2025-02-10', role: 'user' },
  { id: '8', name: 'Ava Thompson', email: 'ava@example.com', mobile: '7766554433', createdAt: '2025-02-15', role: 'user' },
  { id: '9', name: 'William Hernandez', email: 'william@example.com', mobile: '6655443322', createdAt: '2025-02-20', role: 'user' },
  { id: '10', name: 'Mia Clark', email: 'mia@example.com', mobile: '5544332211', createdAt: '2025-02-25', role: 'user' },
  { id: '11', name: 'Benjamin Lewis', email: 'benjamin@example.com', mobile: '9988776655', createdAt: '2025-03-01', role: 'user' },
  { id: '12', name: 'Charlotte Walker', email: 'charlotte@example.com', mobile: '8877665544', createdAt: '2025-03-05', role: 'user' },
  { id: '13', name: 'Ethan Hall', email: 'ethan@example.com', mobile: '7766554433', createdAt: '2025-03-10', role: 'user' },
  { id: '14', name: 'Amelia Young', email: 'amelia@example.com', mobile: '6655443322', createdAt: '2025-03-15', role: 'user' },
  { id: '15', name: 'Alexander King', email: 'alexander@example.com', mobile: '5544332211', createdAt: '2025-03-20', role: 'user' },
  { id: '16', name: 'Harper Scott', email: 'harper@example.com', mobile: '9876543210', createdAt: '2025-03-25', role: 'user' },
  { id: '17', name: 'Daniel Green', email: 'daniel@example.com', mobile: '8765432109', createdAt: '2025-03-30', role: 'user' },
  { id: '18', name: 'Evelyn Adams', email: 'evelyn@example.com', mobile: '7654321098', createdAt: '2025-04-05', role: 'user' },
  { id: '19', name: 'Michael Baker', email: 'michael@example.com', mobile: '9012345678', createdAt: '2025-04-10', role: 'user' },
  { id: '20', name: 'Chloe Nelson', email: 'chloe@example.com', mobile: '8901234567', createdAt: '2025-04-15', role: 'user' },
  { id: '21', name: 'Jacob Carter', email: 'jacob@example.com', mobile: '7890123456', createdAt: '2025-04-20', role: 'user' },
  { id: '22', name: 'Grace Mitchell', email: 'grace@example.com', mobile: '9988776655', createdAt: '2025-04-25', role: 'user' },
  { id: '23', name: 'Samuel Perez', email: 'samuel@example.com', mobile: '8877665544', createdAt: '2025-05-01', role: 'user' },
  { id: '24', name: 'Lily Roberts', email: 'lily@example.com', mobile: '7766554433', createdAt: '2025-05-05', role: 'user' },
  { id: '25', name: 'Joseph Turner', email: 'joseph@example.com', mobile: '6655443322', createdAt: '2025-05-10', role: 'user' },
  { id: '26', name: 'Alice Johnson', email: 'alice@example.com', mobile: '9876543210', createdAt: '2025-01-15', role: 'user' },
  { id: '27', name: 'Bob Smith', email: 'bob@example.com', mobile: '8765432109', createdAt: '2025-02-20', role: 'user' },
  { id: '28', name: 'Charlie Brown', email: 'charlie@example.com', mobile: '7654321098', createdAt: '2025-03-01', role: 'user' },
  { id: '29', name: 'Diana Miller', email: 'diana@example.com', mobile: '9012345678', createdAt: '2025-03-05', role: 'user' },
  { id: '30', name: 'Ethan Davis', email: 'ethan@example.com', mobile: '8901234567', createdAt: '2025-03-10', role: 'user' },
  { id: '31', name: 'Fiona Garcia', email: 'fiona@example.com', mobile: '7890123456', createdAt: '2025-03-12', role: 'user' },
  { id: '32', name: 'George Wilson', email: 'george@example.com', mobile: '9988776655', createdAt: '2025-03-18', role: 'user' },
  { id: '33', name: 'Hannah Lewis', email: 'hannah@example.com', mobile: '8877665544', createdAt: '2025-03-25', role: 'user' },
  { id: '34', name: 'Ivy Thomas', email: 'ivy@example.com', mobile: '7766554433', createdAt: '2025-04-02', role: 'user' },
  { id: '35', name: 'Jack White', email: 'jack@example.com', mobile: '6655443322', createdAt: '2025-04-10', role: 'user' },
];

type SortKey = keyof User;

export default function UsersAllPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null);

  const totalUsers = MOCK_USERS.length;

  const filteredAndSortedUsers = useMemo(() => {
    let sortableUsers = [...MOCK_USERS];
    
    if (searchTerm) {
      sortableUsers = sortableUsers.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.mobile.includes(searchTerm)
      );
    }

    if (sortConfig !== null) {
      sortableUsers.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return sortableUsers;
  }, [searchTerm, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredAndSortedUsers.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const requestSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      // Show combined arrows by default for unsorted columns
      return <IconArrowsSort className="w-4 h-4 ml-2 text-gray-400" />;
    }
    
    // Show single arrow for the actively sorted column
    return sortConfig.direction === 'asc' 
      ? <IconArrowUp className="w-4 h-4 ml-2" /> 
      : <IconArrowDown className="w-4 h-4 ml-2" />;
  };

  return (
    <PageContainer>
      <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            User Management ({totalUsers} users)
          </h1>
        </div>
        <Separator />

        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Users List</CardTitle>
            <div className="flex items-center space-x-4">
                <div className="relative">
                    <Input
                        placeholder="Search by name, email or mobile..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-[300px]"
                    />
                    <IconSearch className="w-4 h-4 absolute top-1/2 left-2 transform -translate-y-1/2 text-gray-400" />
                </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No.</TableHead>
                  <TableHead>
                    <div className="flex items-center cursor-pointer" onClick={() => requestSort('name')}>
                      Name
                      {getSortIcon('name')}
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center cursor-pointer" onClick={() => requestSort('email')}>
                      Email
                      {getSortIcon('email')}
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center cursor-pointer" onClick={() => requestSort('mobile')}>
                      Mobile
                      {getSortIcon('mobile')}
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center cursor-pointer" onClick={() => requestSort('role')}>
                      Role
                      {getSortIcon('role')}
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center cursor-pointer" onClick={() => requestSort('createdAt')}>
                      Joined
                      {getSortIcon('createdAt')}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user, index) => (
                    <TableRow key={user.id} className="cursor-pointer">
                      <TableCell className="font-medium">
                        <Link href={`/admin/users/${user.id}/analytics`} passHref className="block">
                          {startIndex + index + 1}
                        </Link>
                      </TableCell>
                      <TableCell className="font-medium">
                        <Link href={`/admin/users/${user.id}/analytics`} passHref className="block">
                          {user.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/users/${user.id}/analytics`} passHref className="block">
                          {user.email}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/users/${user.id}/analytics`} passHref className="block">
                          {user.mobile}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/users/${user.id}/analytics`} passHref className="block">
                          <Badge>{user.role}</Badge>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/users/${user.id}/analytics`} passHref className="block">
                          {user.createdAt}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/admin/users/${user.id}/analytics`} passHref>
                          <Button variant="ghost" size="icon" title="View Analytics">
                            <IconChartLine className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <div className="flex flex-col sm:flex-row justify-between items-center mt-4 space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-2">
                <span>Rows per page:</span>
                <Select value={String(itemsPerPage)} onValueChange={(value) => setItemsPerPage(Number(value))}>
                  <SelectTrigger className="w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} variant="outline">
                  Previous
                </Button>
                <span>Page</span>
                <Input
                    type="number"
                    value={currentPage}
                    onChange={(e) => {
                        const page = Number(e.target.value);
                        if (!isNaN(page) && page > 0) {
                            setCurrentPage(page);
                        }
                    }}
                    onBlur={() => handlePageChange(currentPage)}
                    className="w-[60px] text-center"
                    min={1}
                    max={totalPages}
                />
                <span>of {totalPages}</span>
                <Button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} variant="outline">
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}