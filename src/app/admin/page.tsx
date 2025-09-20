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
import { cn } from '@/lib/utils'; // Import the utility to concatenate class names

// --- Consolidated and New Mock Data ---
const keyMetrics = [
  {
    title: 'Total Users',
    value: '1.2K',
    change: '+15% from last month',
    icon: <IconUsers className="h-5 w-5 text-gray-500" />,
    link: '/admin/users/all',
  },
  {
    title: 'JOSAA Predictions',
    value: '5.2K',
    change: '+10% from last month',
    icon: <IconClipboardList className="h-5 w-5 text-gray-500" />,
    link: '/admin/predictions/josaa',
  },
  {
    title: 'TNEA Predictions',
    value: '2.6K',
    change: '+30% from last month',
    icon: <IconClipboardList className="h-5 w-5 text-gray-500" />,
    link: '/admin/predictions/tnea',
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


// Removed the 'isSidebarOpen' prop from the function signature
export default function AdminDashboardPage() {
  const allExams = exams.filter(exam => exam.type === 'All India');
  const collegeSpecificExams = exams.filter(exam => exam.type === 'College Specific');
  const [timeRange, setTimeRange] = useState("all");

  const filteredData = useMemo(() => {
    let daysToSubtract = 365; // Default to 'all'
    if (timeRange === "90d") {
      daysToSubtract = 90;
    } else if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }

    const today = new Date("2025-08-29"); // Mock current date
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - daysToSubtract);

    if (timeRange === "all") {
        return userActivityTrendsData;
    }

    return userActivityTrendsData.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate;
    });
  }, [timeRange]);

  return (
    <PageContainer>
      {/* Removed the 'cn' utility logic and hardcoded full width */}
      <div className="flex-1 flex-col space-y-6 min-h-screen max-w-none mx-0">
        {/* Main Dashboard Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
            Welcome, Buddy! 👋
          </h1>
          <Button>Customize Dashboard</Button>
        </div>
        <Separator />

        {/* Key Metrics Section - Top-level stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {keyMetrics.map((metric) => (
            <Link href={metric.link} key={metric.title} passHref>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                  {metric.icon}
                </CardHeader>
                <CardContent>
                  <div className="pb-1 text-2xl font-bold">{metric.value}</div>
                  <p className="text-muted-foreground text-xs">{metric.change}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <TooltipProvider>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left Column: Predictions, Tasks & Recent Activity */}
            <div className="grid grid-cols-1 gap-4 lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Predictions</CardTitle>
                  <CardDescription>Latest user-submitted rank predictions.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {recentPredictions.map((pred) => (
                      <li key={pred.id} className="text-sm">
                        <div className="font-medium">
                          <span className="text-primary">{pred.user}</span> predicted {pred.rank} for {pred.exam}.
                        </div>
                        <div className="text-muted-foreground text-xs">
                          Target College: {pred.college}
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Top Colleges by Views</CardTitle>
                  <CardDescription>Most viewed college profiles this month.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {collegeViewData.slice(0, 3).map((college) => (
                      <li key={college.name} className="flex items-center justify-between text-sm">
                        <div className="font-medium">{college.name}</div>
                        <div className="text-muted-foreground text-xs">
                          {college.views} views
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest system-wide and user actions.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {recentActivity.map((activity) => (
                      <li key={activity.id} className="flex items-start space-x-3">
                        <div className="rounded-full bg-gray-100 p-2 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                          {activity.icon}
                        </div>
                        <div className="flex-grow">
                          <p className="text-sm">{activity.text}</p>
                          <p className="text-muted-foreground text-xs">
                            {activity.time}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <Link href="/admin/logs">
                    <Button variant="link" className="text-primary">
                      View All Logs <IconArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    Upcoming Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {upcomingTasks.map((task) => (
                      <li key={task.id} className="text-sm">
                        <div className="font-medium">{task.name}</div>
                        <div className="text-muted-foreground text-xs">
                          Due: {task.dueDate} ({task.type})
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Center Column: Charts */}
            <div className="grid grid-cols-1 gap-4 lg:col-span-1">
              {/* Student Activity Chart (New Stacked Bar Chart) */}
              <Card>
                <CardHeader>
                  <CardTitle>Student Activity: JOSAA & TNEA</CardTitle>
                  <CardDescription>Activity from different student types.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfigStacked}>
                    <BarChart accessibilityLayer data={studentActivityData}>
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                      />
                      <ChartTooltip
                        content={<ChartTooltipContent hideLabel />}
                        cursor={false}
                        defaultIndex={1}
                      />
                      <Bar
                        dataKey="school"
                        stackId="a"
                        fill="var(--color-school)"
                        radius={[0, 0, 4, 4]}
                      />
                      <Bar
                        dataKey="college"
                        stackId="a"
                        fill="var(--color-college)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Prediction Success Rate (Radial Chart) */}
              <Card>
                <CardHeader className="items-center pb-0">
                  <CardTitle>Prediction Success Rate</CardTitle>
                  <CardDescription>Based on user-submitted data</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0">
                  <ChartContainer
                    config={chartConfigRadial}
                    className="mx-auto aspect-square max-h-[250px]"
                  >
                    <RadialBarChart
                      data={predictionSuccessRate}
                      endAngle={100}
                      innerRadius={80}
                      outerRadius={140}
                    >
                      <PolarGrid
                        gridType="circle"
                        radialLines={false}
                        stroke="none"
                        className="first:fill-muted last:fill-background"
                        polarRadius={[86, 74]}
                      />
                      <RadialBar dataKey="value" background />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dot" />}
                      />
                      <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                >
                                  <tspan
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    className="fill-foreground text-4xl font-bold"
                                  >
                                    {predictionSuccessRate[0].value}%
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 24}
                                    className="fill-muted-foreground"
                                  >
                                    Success
                                  </tspan>
                                </text>
                              );
                            }
                          }}
                        />
                      </PolarRadiusAxis>
                    </RadialBarChart>
                  </ChartContainer>
                </CardContent>
                <CardFooter className="flex-col items-start gap-2 text-sm">
                  <div className="flex gap-2 leading-none font-medium">
                    Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                  </div>
                  <div className="text-muted-foreground leading-none">
                    Success rate of rank predictions.
                  </div>
                </CardFooter>
              </Card>
            </div>

            {/* Right Column: Exams & Suspicious Activity */}
            <div className="grid grid-cols-1 gap-4 lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Exams</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-md font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      All India Exams
                    </h3>
                    <ul className="space-y-2">
                      {allExams.map((exam) => (
                        <li key={exam.name} className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <IconFileText className="h-4 w-4 text-gray-500" />
                            <span>{exam.name}</span>
                          </div>
                          <span className="text-muted-foreground">{exam.count} users</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="text-md font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      College Specific Exams
                    </h3>
                    <ul className="space-y-2">
                      {collegeSpecificExams.map((exam) => (
                        <li key={exam.name} className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <IconBuilding className="h-4 w-4 text-gray-500" />
                            <span>{exam.name}</span>
                          </div>
                          <span className="text-muted-foreground">{exam.count} users</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href="/admin/exams/list">
                    <Button variant="link" className="text-primary">
                      View All Exams <IconArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Suspicious Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {suspiciousActivityData.map((activity) => (
                      <li key={activity.id} className="flex items-start space-x-3">
                        <div className="rounded-full bg-red-100 p-2 text-red-700 dark:bg-red-800 dark:text-red-300">
                          <IconAlertTriangle className="h-4 w-4" />
                        </div>
                        <div className="flex-grow">
                          <p className="text-sm font-semibold">{activity.user}</p>
                          <p className="text-sm">{activity.activity}</p>
                          <p className="text-muted-foreground text-xs">
                            {activity.time}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="flex justify-end pt-0">
                  <Link href="/admin/logs/suspicious">
                    <Button variant="link" className="text-primary">
                      View All <IconArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>

          {/* Final Super Card - User Activity Over Time */}
          <Card className="mt-6 lg:col-span-3">
            <CardHeader className="flex flex-col items-stretch border-b py-5 sm:flex-row">
              <div className="grid flex-1 gap-1">
                <CardTitle>User Activity Over Time</CardTitle>
                <CardDescription>
                  Shows activity trends across key application areas.
                </CardDescription>
              </div>
              <div className="flex space-x-2 mt-4 sm:mt-0">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[160px] rounded-lg" aria-label="Select a value">
                    <SelectValue placeholder="All Time" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all" className="rounded-lg">All Time</SelectItem>
                    <SelectItem value="90d" className="rounded-lg">Last 90 days</SelectItem>
                    <SelectItem value="30d" className="rounded-lg">Last 30 days</SelectItem>
                    <SelectItem value="7d" className="rounded-lg">Last 7 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-2 sm:p-6">
              <ChartContainer
                config={chartConfigActivity}
                className="aspect-auto h-[250px] w-full"
              >
                <AreaChart data={filteredData}>
                  <defs>
                    {Object.keys(chartConfigActivity).map((key) => {
                      const color = chartConfigActivity[key as keyof typeof chartConfigActivity].color;
                      return (
                        <linearGradient key={`fill${key}`} id={`fill${key}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                          <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                        </linearGradient>
                      );
                    })}
                  </defs>
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
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        labelFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        indicator="dot"
                      />
                    }
                  />
                  {Object.keys(chartConfigActivity).map((key) => (
                    <Area
                      key={key}
                      dataKey={key}
                      type="natural"
                      fill={`url(#fill${key})`}
                      stroke={chartConfigActivity[key as keyof typeof chartConfigActivity].color}
                      stackId="a"
                    />
                  ))}
                  <ChartLegend content={<ChartLegendContent />} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TooltipProvider>
      </div>
    </PageContainer>
  );
}