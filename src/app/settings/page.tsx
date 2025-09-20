'use client';

import React, { useState, useMemo } from 'react';
import PageContainer from '@/components/layout/page-container';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  IconUsers,
  IconClipboardList,
  IconBriefcase,
  IconBuilding,
  IconEye,
  IconArrowRight,
  IconUserPlus,
  IconBell,
  IconListCheck,
  IconFileText,
  IconUsersGroup,
  IconSchool,
  IconMessageCircle,
  IconAlertTriangle,
  IconCode,
  IconLock,
  IconPalette,
  IconShield,
  IconCloud,
  IconMail,
  IconBrandGoogle,
  IconBrandFacebook,
} from '@tabler/icons-react';
import { TrendingUp } from 'lucide-react';
import Link from 'next/link';
import {
  Area,
  AreaChart,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  Label,
} from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label as UiLabel } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// --- Consolidated and New Mock Data ---
const keyMetrics = [
  {
    title: 'Total Users',
    value: '1.2K',
    change: '+15% from last month',
    icon: <IconUsers className="h-5 w-5 text-gray-500" />,
    link: '/admin/users',
  },
  {
    title: 'JOSAA Predictions',
    value: '5.2K',
    change: '+10% from last month',
    icon: <IconClipboardList className="h-5 w-5 text-gray-500" />,
    link: '/admin/exams/josaa',
  },
  {
    title: 'TNEA Predictions',
    value: '2.6K',
    change: '+30% from last month',
    icon: <IconClipboardList className="h-5 w-5 text-gray-500" />,
    link: '/admin/exams/tnea',
  },
  {
    title: 'Total Colleges',
    value: '350',
    change: '+5% from last month',
    icon: <IconBuilding className="h-5 w-5 text-gray-500" />,
    link: '/admin/colleges',
  },
];

const collegeViewData = [
  { name: 'IIT Madras', views: 15200, predictions: 350 },
  { name: 'NIT Trichy', views: 9500, predictions: 210 },
  { name: 'Anna University', views: 12800, predictions: 280 },
  { name: 'VIT', views: 8900, predictions: 180 },
];

const recentActivity = [
  { id: '1', icon: <IconUserPlus className="h-4 w-4" />, text: 'New user "Alice" registered.', time: '2 hours ago' },
  { id: '2', icon: <IconClipboardList className="h-4 w-4" />, text: 'A user submitted a new TNEA rank prediction.', time: '4 hours ago' },
  { id: '3', icon: <IconBuilding className="h-4 w-4" />, text: 'Admin "John" added a new college entry.', time: '1 day ago' },
  { id: '4', icon: <IconBell className="h-4 w-4" />, text: 'New exam data for NEET was uploaded.', time: '2 days ago' },
];

const recentPredictions = [
  { id: 'pred-1', user: 'User123', exam: 'TNEA', rank: '2500', college: 'Anna University' },
  { id: 'pred-2', user: 'User456', exam: 'JOSAA', rank: '800', college: 'IIT Madras' },
  { id: 'pred-3', user: 'User789', exam: 'TNEA', rank: '12000', college: 'PSG Tech' },
];

const upcomingTasks = [
  { id: 'task-1', name: 'Review pending JOSAA predictions', type: 'JOSAA Predictions', dueDate: 'Nov 1' },
  { id: 'task-2', name: 'Approve new TNEA college entry', type: 'TNEA Colleges', dueDate: 'Oct 29' },
];

const exams = [
  { name: 'JEE Main', type: 'All India', count: '15.2K' },
  { name: 'JEE Advanced', type: 'All India', count: '2.5K' },
  { name: 'BITSAT', type: 'All India', count: '10.0K' },
  { name: 'TNEA', type: 'All India', count: '20.0K' },
  { name: 'VITEEE', type: 'College Specific', count: '12.0K' },
  { name: 'SRMJEE', type: 'College Specific', count: '8.5K' },
  { name: 'MET', type: 'College Specific', count: '6.0K' },
];

const studentActivityData = [
  { date: "Jul 15", school: 450, college: 300 },
  { date: "Jul 16", school: 380, college: 420 },
  { date: "Jul 17", school: 520, college: 120 },
  { date: "Jul 18", school: 140, college: 550 },
  { date: "Jul 19", school: 600, college: 350 },
  { date: "Jul 20", school: 480, college: 400 },
];

const predictionSuccessRate = [
  { name: 'Success', value: 85, fill: '#00c49f' },
  { name: 'Total', value: 100, fill: '#ef4444' },
];

// New, more volatile data for the final super card
const userActivityTrendsData = [
  { date: "2025-01-01", exams: 120, predictions: 80, colleges: 150, nlpChats: 40, others: 20 },
  { date: "2025-02-01", exams: 150, predictions: 90, colleges: 180, nlpChats: 50, others: 25 },
  { date: "2025-03-01", exams: 180, predictions: 110, colleges: 220, nlpChats: 60, others: 30 },
  { date: "2025-04-01", exams: 220, predictions: 130, colleges: 250, nlpChats: 70, others: 35 },
  { date: "2025-05-01", exams: 250, predictions: 150, colleges: 280, nlpChats: 80, others: 40 },
  { date: "2025-06-01", exams: 280, predictions: 170, colleges: 320, nlpChats: 90, others: 45 },
  { date: "2025-07-01", exams: 300, predictions: 180, colleges: 350, nlpChats: 100, others: 50 },
  { date: "2025-08-01", exams: 350, predictions: 200, colleges: 380, nlpChats: 120, others: 60 },
  { date: "2025-08-02", exams: 320, predictions: 190, colleges: 360, nlpChats: 110, others: 55 },
  { date: "2025-08-03", exams: 380, predictions: 220, colleges: 400, nlpChats: 130, others: 65 },
  { date: "2025-08-04", exams: 310, predictions: 180, colleges: 340, nlpChats: 105, others: 52 },
  { date: "2025-08-05", exams: 400, predictions: 240, colleges: 420, nlpChats: 140, others: 70 },
  { date: "2025-08-06", exams: 330, predictions: 195, colleges: 370, nlpChats: 115, others: 58 },
  { date: "2025-08-07", exams: 420, predictions: 250, colleges: 450, nlpChats: 150, others: 75 },
  { date: "2025-08-08", exams: 350, predictions: 210, colleges: 390, nlpChats: 125, others: 63 },
  { date: "2025-08-09", exams: 450, predictions: 270, colleges: 480, nlpChats: 160, others: 80 },
  { date: "2025-08-10", exams: 370, predictions: 220, colleges: 410, nlpChats: 130, others: 68 },
  { date: "2025-08-11", exams: 480, predictions: 290, colleges: 500, nlpChats: 170, others: 85 },
  { date: "2025-08-12", exams: 390, predictions: 230, colleges: 430, nlpChats: 140, others: 72 },
  { date: "2025-08-13", exams: 500, predictions: 300, colleges: 520, nlpChats: 180, others: 90 },
  { date: "2025-08-14", exams: 410, predictions: 240, colleges: 450, nlpChats: 150, others: 78 },
  { date: "2025-08-15", exams: 520, predictions: 320, colleges: 550, nlpChats: 190, others: 95 },
];


// --- Chart Configs ---
const chartConfigStacked = {
  school: {
    label: "School Students",
    color: "#ff7300", // Orange
    icon: IconSchool,
  },
  college: {
    label: "College Students",
    color: "#8884d8", // Purple
    icon: IconUsersGroup,
  },
} satisfies ChartConfig;

const chartConfigRadial = {
  success: { label: 'Success', color: '#00c49f' },
  total: { label: 'Total', color: '#ef4444' },
} satisfies ChartConfig;

const chartConfigActivity = {
  exams: {
    label: 'Exams',
    color: 'hsl(180 90% 50%)', // Cyan
  },
  predictions: {
    label: 'Predictions',
    color: 'hsl(35 90% 60%)', // Orange
  },
  colleges: {
    label: 'Colleges',
    color: 'hsl(250 80% 55%)', // Purple
  },
  nlpChats: {
    label: 'NLP Chats',
    color: 'hsl(140 90% 40%)', // Green
  },
  others: {
    label: 'Others',
    color: 'hsl(0 0% 50%)', // Gray
  },
} satisfies ChartConfig;

const suspiciousActivityData = [
  { id: '1', user: 'User987', activity: 'Multiple failed logins', time: '1 min ago' },
  { id: '2', user: 'BotFinder', activity: 'Unusual rapid form submissions', time: '10 min ago' },
  { id: '3', user: 'Guest123', activity: 'Suspicious IP address login', time: '30 min ago' },
];

export default function SettingsPage() {
  return (
    <PageContainer>
      <div className="flex-1 flex-col space-y-6 min-h-screen">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
            Admin Settings ⚙️
          </h1>
        </div>
        <Separator />
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
            <TabsTrigger value="general">
              <IconCode className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="security">
              <IconLock className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <IconPalette className="h-4 w-4 mr-2" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="access">
              <IconShield className="h-4 w-4 mr-2" />
              Access Control
            </TabsTrigger>
            <TabsTrigger value="integrations">
              <IconCloud className="h-4 w-4 mr-2" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <IconBell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* General Settings Tab */}
          <TabsContent value="general" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Platform Details</CardTitle>
                <CardDescription>
                  Update the core information about your application.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <UiLabel htmlFor="site-name">Site Name</UiLabel>
                  <Input id="site-name" placeholder="My Admin Dashboard" />
                </div>
                <div className="space-y-2">
                  <UiLabel htmlFor="description">Site Description</UiLabel>
                  <Textarea id="description" placeholder="A comprehensive dashboard for..." />
                </div>
                <div className="space-y-2">
                  <UiLabel htmlFor="contact-email">Contact Email</UiLabel>
                  <Input id="contact-email" type="email" placeholder="admin@example.com" />
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Security Settings Tab */}
          <TabsContent value="security" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Authentication & Security</CardTitle>
                <CardDescription>
                  Manage login methods, password policies, and security features.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <IconMail className="h-5 w-5 text-gray-500" />
                    <UiLabel htmlFor="email-auth">Email & Password Authentication</UiLabel>
                  </div>
                  <Switch id="email-auth" defaultChecked={true} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <IconBrandGoogle className="h-5 w-5 text-gray-500" />
                    <UiLabel htmlFor="google-auth">Google SSO</UiLabel>
                  </div>
                  <Switch id="google-auth" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <IconBrandFacebook className="h-5 w-5 text-gray-500" />
                    <UiLabel htmlFor="facebook-auth">Facebook SSO</UiLabel>
                  </div>
                  <Switch id="facebook-auth" />
                </div>
                <div className="space-y-2">
                  <UiLabel htmlFor="mfa">Multi-Factor Authentication (MFA)</UiLabel>
                  <Select>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Disabled" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="disabled">Disabled</SelectItem>
                      <SelectItem value="optional">Optional</SelectItem>
                      <SelectItem value="required">Required</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button>Update Security Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Appearance Settings Tab */}
          <TabsContent value="appearance" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>User Interface</CardTitle>
                <CardDescription>
                  Customize the look and feel of the platform.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <UiLabel htmlFor="theme">Default Theme</UiLabel>
                  <Select>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="System" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <UiLabel htmlFor="logo">Upload Logo</UiLabel>
                  <Input id="logo" type="file" />
                  <p className="text-sm text-muted-foreground">
                    Recommended size: 200x50 pixels.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button>Save Appearance Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Access Control Tab */}
          <TabsContent value="access" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Role Management</CardTitle>
                <CardDescription>
                  Define and manage user roles and permissions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <IconAlertTriangle className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    Modifying these settings can affect who has access to sensitive data.
                  </AlertDescription>
                </Alert>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Super Admin</TableCell>
                      <TableCell>Full access to all features.</TableCell>
                      <TableCell>
                        <Button variant="outline" disabled>Edit</Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Editor</TableCell>
                      <TableCell>Create & edit content, manage exams.</TableCell>
                      <TableCell>
                        <Button variant="outline">Edit</Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Moderator</TableCell>
                      <TableCell>Manage users & reviews.</TableCell>
                      <TableCell>
                        <Button variant="outline">Edit</Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button>Add New Role</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Third-Party Integrations</CardTitle>
                <CardDescription>
                  Connect your platform with external services.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <IconMail className="h-5 w-5 text-gray-500" />
                    <div>
                      <h4 className="font-medium">Mailchimp</h4>
                      <p className="text-sm text-muted-foreground">
                        Sync user data for marketing campaigns.
                      </p>
                    </div>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <IconMessageCircle className="h-5 w-5 text-gray-500" />
                    <div>
                      <h4 className="font-medium">Slack</h4>
                      <p className="text-sm text-muted-foreground">
                        Send notifications to a Slack channel.
                      </p>
                    </div>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button>Add New Integration</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Control when and how you receive notifications.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <UiLabel htmlFor="new-user-notifications">
                    Email me about new user registrations
                  </UiLabel>
                  <Switch id="new-user-notifications" defaultChecked={true} />
                </div>
                <div className="flex items-center justify-between">
                  <UiLabel htmlFor="suspicious-activity">
                    Email me about suspicious activity
                  </UiLabel>
                  <Switch id="suspicious-activity" defaultChecked={true} />
                </div>
                <div className="flex items-center justify-between">
                  <UiLabel htmlFor="low-disk-space">
                    Send alert for low disk space
                  </UiLabel>
                  <Switch id="low-disk-space" />
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button>Save Preferences</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}