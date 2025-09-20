'use client';

import React, { useState, useMemo } from 'react';
import { notFound, useParams } from 'next/navigation';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

// Charting components
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- Mock Data Interfaces and Data ---

interface ActivityViews {
  colleges: number;
  exams: number;
  predictor: number;
}

interface MostViewedCollege {
  name: string;
  views: number;
  status: 'admitted' | 'rejected' | 'pending';
}

interface UserAnalytics extends User {
  lastLogin: string;
  loginType: string;
  totalLogins: number;
  activityViews: ActivityViews;
  totalExports: number;
  examsAttempted: string[];
  collegePredictionScore: number | null;
  mostViewedColleges: MostViewedCollege[];
  mostViewedExams: { name: string; views: number }[];
  lastExports: { name: string; date: string }[];
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'guest';
  createdAt: string;
}

const MOCK_USERS_ANALYTICS: UserAnalytics[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'admin',
    createdAt: '2025-01-15',
    lastLogin: '2025-08-28',
    loginType: 'Email',
    totalLogins: 55,
    activityViews: { colleges: 80, exams: 25, predictor: 15 },
    totalExports: 5,
    examsAttempted: ['JEE Main', 'NEET UG'],
    collegePredictionScore: 850,
    mostViewedColleges: [
      { name: 'IIT Bombay', views: 45, status: 'pending' },
      { name: 'NIT Trichy', views: 22, status: 'admitted' },
    ],
    mostViewedExams: [
      { name: 'JEE Main', views: 20 },
      { name: 'NEET UG', views: 5 },
    ],
    lastExports: [
      { name: 'IIT College List', date: '2025-08-25' },
          { name: 'Prediction Report', date: '2025-08-20' },
      { name: 'NEET Result Analysis', date: '2025-08-20' },
          { name: 'Choice List', date: '2025-06-24' },
    ]
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    role: 'user',
    createdAt: '2025-02-20',
    lastLogin: '2025-08-29',
    loginType: 'Google',
    totalLogins: 12,
    activityViews: { colleges: 30, exams: 10, predictor: 5 },
    totalExports: 2,
    examsAttempted: ['KCET'],
    collegePredictionScore: 780,
    mostViewedColleges: [
      { name: 'RV College of Engineering', views: 20, status: 'admitted' },
      { name: 'BMS College of Engineering', views: 8, status: 'rejected' },
    ],
    mostViewedExams: [
      { name: 'KCET', views: 10 },
    ],
    lastExports: [
      { name: 'Karnataka College List', date: '2025-08-29' },
      { name: 'KCET Rank Predictor', date: '2025-08-28' },
    ]
  },
  // ... (more mock users can be added here)
];

// Mock data for the activity chart
const chartData = [
  { date: "2025-08-15", colleges: 2, exams: 5, predictor: 0 },
  { date: "2025-08-16", colleges: 4, exams: 3, predictor: 1 },
  { date: "2025-08-17", colleges: 8, exams: 2, predictor: 0 },
  { date: "2025-08-18", colleges: 10, exams: 7, predictor: 2 },
  { date: "2025-08-19", colleges: 5, exams: 4, predictor: 1 },
  { date: "2025-08-20", colleges: 15, exams: 10, predictor: 3 },
  { date: "2025-08-21", colleges: 12, exams: 6, predictor: 1 },
  { date: "2025-08-22", colleges: 9, exams: 8, predictor: 0 },
  { date: "2025-08-23", colleges: 6, exams: 5, predictor: 0 },
  { date: "2025-08-24", colleges: 11, exams: 9, predictor: 2 },
  { date: "2025-08-25", colleges: 7, exams: 7, predictor: 1 },
  { date: "2025-08-26", colleges: 14, exams: 11, predictor: 3 },
  { date: "2025-08-27", colleges: 18, exams: 15, predictor: 4 },
  { date: "2025-08-28", colleges: 20, exams: 18, predictor: 5 },
  { date: "2025-08-29", colleges: 16, exams: 13, predictor: 2 },
];

const chartConfig = {
  colleges: { label: "Colleges", color: "hsl(35 90% 60%)" }, // Cool Cyan
  exams: { label: "Exams", color: "hsl(210 90% 60%)" }, // Rich Purple
  predictor: { label: "Predictor", color: "hsl(250 70% 55%)" }, // Warm Orange
} satisfies ChartConfig;

// --- UserAnalyticsPage Component ---

export default function UserAnalyticsPage() {
  const params = useParams();
  const userId = params.userId as string;

  const user = MOCK_USERS_ANALYTICS.find(u => u.id === userId);

  if (!user) {
    notFound();
  }

  const [timeRange, setTimeRange] = useState("30d");

  const filteredData = useMemo(() => {
    let daysToSubtract = 30; // Default
    if (timeRange === "90d") {
      daysToSubtract = 90;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }

    const today = new Date("2025-08-29"); // Mock current date
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - daysToSubtract);
    
    return chartData.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate;
    });
  }, [timeRange]);

  return (
    <PageContainer>
      <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            User Analytics: {user.name}
          </h1>
          <Link href="/users/all" passHref>
            <Button variant="outline">Back to Users</Button>
          </Link>
        </div>
        <Separator />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Expanded User Details & Recent Exports */}
          <div className="col-span-1 lg:col-span-1 space-y-6">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>User Details</CardTitle>
                <CardDescription>Comprehensive information about the user.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">User ID</p>
                    <p className="text-base font-semibold">{user.id}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-sm text-muted-foreground">Joined On</p>
                    <p className="text-base font-semibold">{user.createdAt}</p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <p className="text-sm text-muted-foreground">Email Address</p>
                    <p className="text-base font-semibold">{user.email}</p>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <h3 className="text-lg font-semibold">Sign-in Information</h3>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Last Login</p>
                      <p className="text-base font-semibold">{user.lastLogin}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-sm text-muted-foreground">Login Type</p>
                      <Badge variant="secondary">{user.loginType}</Badge>
                    </div>
                  </div>
                </div>

              

                <div className="space-y-2 pt-2">
                  <h3 className="text-lg font-semibold">Academic Profile</h3>
                  <Separator />
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Exams Attempted</p>
                    <div className="flex flex-wrap gap-2">
                      {user.examsAttempted.length > 0 ? (
                        user.examsAttempted.map(exam => (
                          <Badge key={exam} variant="secondary">{exam}</Badge>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-sm italic">No exams recorded.</p>
                      )}
                    </div>
                  </div>
                  {user.collegePredictionScore && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">College Prediction Score</p>
                      <p className="text-2xl font-bold">{user.collegePredictionScore}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Exports Card - Moved here */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Exports & Downloads</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {user.lastExports.length > 0 ? (
                    user.lastExports.map((item, index) => (
                      <li key={index} className="flex justify-between items-center">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.date}</p>
                      </li>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No recent exports.</p>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Right-hand side content */}
          <div className="col-span-1 lg:col-span-2 space-y-6">

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Logins</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user.totalLogins}</div>
                  <p className="text-xs text-muted-foreground">
                    Lifetime
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user.activityViews.colleges + user.activityViews.exams + user.activityViews.predictor}</div>
                  <p className="text-xs text-muted-foreground">
                    All-time content views
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Exports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user.totalExports}</div>
                  <p className="text-xs text-muted-foreground">
                    Total exported lists or reports.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Visual Activity Chart */}
            <Card className="pt-0">
              <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                <div className="grid flex-1 gap-1">
                  <CardTitle>User Activity Trends</CardTitle>
                  <CardDescription>
                    Activity across key application areas.
                  </CardDescription>
                </div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger
                    className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
                    aria-label="Select a value"
                  >
                    <SelectValue placeholder="Last 30 days" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="30d" className="rounded-lg">
                      Last 30 days
                    </SelectItem>
                    <SelectItem value="7d" className="rounded-lg">
                      Last 7 days
                    </SelectItem>
                    <SelectItem value="90d" className="rounded-lg">
                      Last 90 days
                    </SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer
                  config={chartConfig}
                  className="aspect-auto h-[250px] w-full"
                >
                  <AreaChart data={filteredData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      minTickGap={32}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                      }}
                    />
                    <YAxis
                       tickFormatter={(value) => `${value}`}
                       axisLine={false}
                       tickLine={false}
                       minTickGap={10}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          labelFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          indicator="dot"
                        />
                      }
                    />
                    <Area
                      dataKey="colleges"
                      type="natural"
                      fill="var(--color-colleges)"
                      stroke="var(--color-colleges)"
                      stackId="a"
                    />
                    <Area
                      dataKey="exams"
                      type="natural"
                      fill="var(--color-exams)"
                      stroke="var(--color-exams)"
                      stackId="a"
                    />
                    <Area
                      dataKey="predictor"
                      type="natural"
                      fill="var(--color-predictor)"
                      stroke="var(--color-predictor)"
                      stackId="a"
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Most Viewed Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Most Viewed Colleges</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {user.mostViewedColleges.length > 0 ? (
                      user.mostViewedColleges.map((college, index) => (
                        <li key={index} className="flex justify-between items-center">
                          <p className="font-semibold">{college.name}</p>
                          <Badge variant="secondary">{college.views} views</Badge>
                        </li>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No college views recorded.</p>
                    )}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Most Viewed Exams</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {user.mostViewedExams.length > 0 ? (
                      user.mostViewedExams.map((exam, index) => (
                        <li key={index} className="flex justify-between items-center">
                          <p className="font-semibold">{exam.name}</p>
                          <Badge variant="secondary">{exam.views} views</Badge>
                        </li>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No exam views recorded.</p>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}