'use client';

import React, { useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  IconUsers,
  IconClipboardList,
  IconGauge,
  IconEye,
  IconReportAnalytics,
  IconChartLine,
} from '@tabler/icons-react';
import { LineChart, CartesianGrid, XAxis, Line, LabelList, RadialBarChart, RadialBar } from "recharts";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { TrendingUp, TrendingDown, Clock, CheckCircle } from "lucide-react"; // Added new icons

// --- Mock Data ---
const josaaKeyMetrics = [
  {
    title: 'Total Predictor Users',
    value: '5.2K',
    icon: <IconUsers className="h-5 w-5 text-gray-500" />,
  },
  {
    title: 'Total Predictions Made',
    value: '18.5K',
    icon: <IconClipboardList className="h-5 w-5 text-gray-500" />,
  },
  {
    title: 'Current Predictor Status',
    value: 'Operational',
    icon: <IconGauge className="h-5 w-5 text-gray-500" />,
  },
];

const josaaPredictionResults = [
  { id: '1', user: 'User101', jeeMainPercentile: '99.85', jeeAdvRank: '850', college: 'IIT Madras', branch: 'Computer Science', status: 'Predicted' },
  { id: '2', user: 'User102', jeeMainPercentile: '99.12', jeeAdvRank: '1500', college: 'IIT Delhi', branch: 'Mechanical Engineering', status: 'Predicted' },
  { id: '3', user: 'User103', jeeMainPercentile: '95.50', jeeAdvRank: '-', college: 'NIT Trichy', branch: 'Civil Engineering', status: 'Predicted' },
  { id: '4', user: 'User104', jeeMainPercentile: '99.95', jeeAdvRank: '350', college: 'IIT Bombay', branch: 'Electrical Engineering', status: 'Predicted' },
  { id: '5', user: 'User105', jeeMainPercentile: '97.20', jeeAdvRank: '7800', college: 'IIIT Hyderabad', branch: 'Information Technology', status: 'Predicted' },
];

const josaaCollegeRanks = [
  { id: '1', college: 'IIT Madras', course: 'Computer Science', currentClosingRank: '750' },
  { id: '2', college: 'IIT Delhi', course: 'Mechanical Engineering', currentClosingRank: '1350' },
  { id: '3', college: 'NIT Trichy', course: 'Civil Engineering', currentClosingRank: '11500' },
  { id: '4', college: 'IIT Bombay', course: 'Electrical Engineering', currentClosingRank: '300' },
  { id: '5', college: 'IIIT Hyderabad', course: 'Information Technology', currentClosingRank: '7500' },
];

const josaaPredictionData = [
  { date: "2024-08-15", predictions: 50 },
  { date: "2024-08-16", predictions: 65 },
  { date: "2024-08-17", predictions: 80 },
  { date: "2024-08-18", predictions: 75 },
  { date: "2024-08-19", predictions: 90 },
  { date: "2024-08-20", predictions: 110 },
  { date: "2024-08-21", predictions: 105 },
];

const chartConfig = {
  predictions: {
    label: "Predictions",
    color: "hsl(250 80% 55%)",
  },
} as const;

// New Data for the Accuracy Radial Chart
const accuracyChartData = [
  { name: "Accuracy", value: 97, fill: "hsl(250 80% 55%)" }, // Using primary color from theme
];

const accuracyChartConfig = {
  value: {
    label: "Accuracy",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

// Mock data for 2025 JEE Ranks
const jee2025Ranks = {
  jeeAdvanced: {
    highestRank: '1 (AIR 1)',
    lowestRank: '15,000+ (for specific categories and institutes)',
    date: 'August 25, 2025',
  },
  jeeMain: {
    highestRank: '1 (100 Percentile)',
    lowestRank: '~1,000,000 (for specific categories and institutes)',
    date: 'August 26, 2025',
  },
};

export default function JosaaPredictionsPage() {
  const [minRank, setMinRank] = useState(8000);
  const [maxRank, setMaxRank] = useState(150000);
  const [status, setStatus] = useState('operational');
  const [message, setMessage] = useState('Predictor is running smoothly.');

  // New states for advanced tuning
  const [accuracyLevel, setAccuracyLevel] = useState(95);
  const [predictionTemperature, setPredictionTemperature] = useState(0.8);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.7);
  const [modelParameters, setModelParameters] = useState(`{"jee_main_weight": 0.6, "jee_adv_weight": 0.4}`);

  const handleUpdatePredictor = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Predictor values updated successfully.');
  };

  // Calculate average daily predictions
  const totalPredictions = josaaPredictionData.reduce((sum, entry) => sum + entry.predictions, 0);
  const averageDailyPredictions = (totalPredictions / josaaPredictionData.length).toFixed(0);
  const peakPredictionDay = josaaPredictionData.reduce((max, entry) => (entry.predictions > max.predictions ? entry : max), josaaPredictionData[0]);

  return (
    <PageContainer>
      <div className="flex-1 flex-col space-y-6 min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
            JOSAA Predictor Admin Dashboard
          </h1>
          <Button onClick={() => toast.info('Refreshed data')}>Refresh Data</Button>
        </div>
        <Separator />

        {/* Highlighted Ranks Section */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                2025 JEE Advanced Ranks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-ellipsis overflow-hidden whitespace-nowrap">Highest Rank: {jee2025Ranks.jeeAdvanced.highestRank}</p>
                <p className="text-2xl font-bold text-ellipsis overflow-hidden whitespace-nowrap">Lowest Rank: {jee2025Ranks.jeeAdvanced.lowestRank}</p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">Last Updated:</span> {jee2025Ranks.jeeAdvanced.date}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                2025 JEE Main Ranks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-ellipsis overflow-hidden whitespace-nowrap">Highest Rank: {jee2025Ranks.jeeMain.highestRank}</p>
                <p className="text-2xl font-bold text-ellipsis overflow-hidden whitespace-nowrap">Lowest Rank: {jee2025Ranks.jeeMain.lowestRank}</p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">Last Updated:</span> {jee2025Ranks.jeeMain.date}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Metrics and Accuracy Section - Compact Layout with better content density */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Key Metric Card 1: Combined Users and Predictions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Predictor Usage
              </CardTitle>
              <IconUsers className="h-5 w-5 text-gray-500" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold">5.2K</div>
              <p className="text-xs text-muted-foreground">Total Users</p>
              <div className="text-xl font-bold mt-2">18.5K</div>
              <p className="text-xs text-muted-foreground">Total Predictions</p>
            </CardContent>
          </Card>

          {/* Key Metric Card 2: Status */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Predictor Status
              </CardTitle>
              <IconGauge className="h-5 w-5 text-gray-500" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold text-green-500">Operational</div>
              <p className="text-sm text-muted-foreground mt-2">
                System is running smoothly and making accurate predictions.
              </p>
            </CardContent>
          </Card>

          {/* Accuracy Radial Chart Card - Larger and more prominent with more detail */}
          <Card className="flex flex-col sm:col-span-2">
            <CardHeader className="items-center pb-0">
              <CardTitle>Prediction Accuracy</CardTitle>
              <CardDescription>Overall model performance and confidence</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center items-center pb-0">
              <ChartContainer
                config={accuracyChartConfig}
                className="w-full aspect-square max-h-[150px] sm:max-h-[180px] md:max-h-[200px]"
              >
                <RadialBarChart
                  data={accuracyChartData}
                  innerRadius={50}
                  outerRadius={70}
                  endAngle={360 * (accuracyChartData[0].value / 100)}
                >
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel nameKey="name" />}
                  />
                  <RadialBar dataKey="value" fill="var(--color-value)" background />
                  <LabelList
                    dataKey="value"
                    position="center"
                    className="fill-foreground text-3xl font-bold"
                    formatter={(value: number) => `${value}%`}
                  />
                </RadialBarChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 text-sm pt-0">
              <div className="flex w-full justify-between items-center leading-none">
                <div className="flex items-center gap-2 font-medium">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Accuracy Trend: <span className="text-green-500">Up by 2%</span>
                </div>
                <div className="flex items-center gap-2 font-medium text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  Confidence Level: 99%
                </div>
              </div>
              <div className="text-muted-foreground leading-none">
                Based on recent validation data and historical performance.
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Main Content: New Two-Column Layout for Tuning and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Advanced Predictor Tuning - Left Column */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Advanced Predictor Tuning</CardTitle>
              <CardDescription>
                Adjust key parameters for the JOSAA rank predictor algorithm.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePredictor} className="space-y-4">
                <div className="grid w-full items-center gap-4">
                  <Label htmlFor="accuracy-level">Accuracy Level (%)</Label>
                  <Input id="accuracy-level" type="number" value={accuracyLevel} onChange={(e) => setAccuracyLevel(Number(e.target.value))} />
                </div>
                <div className="grid w-full items-center gap-4">
                  <Label htmlFor="prediction-temp">Prediction Temperature</Label>
                  <Input id="prediction-temp" type="number" step="0.1" value={predictionTemperature} onChange={(e) => setPredictionTemperature(Number(e.target.value))} />
                </div>
                <div className="grid w-full items-center gap-4">
                  <Label htmlFor="confidence-threshold">Confidence Threshold (%)</Label>
                  <Input id="confidence-threshold" type="number" value={confidenceThreshold} onChange={(e) => setConfidenceThreshold(Number(e.target.value))} />
                </div>
                <div className="grid w-full items-center gap-4">
                  <Label htmlFor="model-params">Model Parameters (JSON)</Label>
                  <Textarea id="model-params" value={modelParameters} onChange={(e) => setModelParameters(e.target.value)} />
                </div>
                <div className="grid w-full items-center gap-4">
                  <Label htmlFor="status">Predictor Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operational">Operational</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid w-full items-center gap-4">
                  <Label htmlFor="message">Status Message</Label>
                  <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} />
                </div>
                <Button type="submit" className="w-full">Update Predictor</Button>
              </form>
            </CardContent>
          </Card>

          {/* Prediction Analytics Chart - Right Column with more details */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>JOSAA Predictions Over Time</CardTitle>
              <CardDescription>
                Daily count of predictions made by users over the last 7 days.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={chartConfig}
                className="aspect-video w-full"
              >
                <LineChart
                  data={josaaPredictionData}
                  margin={{
                    top: 20,
                    left: 12,
                    right: 12,
                  }}
                >
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
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <Line
                    dataKey="predictions"
                    type="natural"
                    stroke="var(--color-predictions)"
                    strokeWidth={2}
                    dot={{
                      fill: "var(--color-predictions)",
                    }}
                    activeDot={{
                      r: 6,
                    }}
                  >
                    <LabelList
                      position="top"
                      offset={12}
                      className="fill-foreground"
                      fontSize={12}
                    />
                  </Line>
                </LineChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
              <div className="flex items-center gap-2 font-medium leading-none">
                <IconChartLine className="h-4 w-4 text-primary" />
                Average Daily Predictions: <span className="font-bold">{averageDailyPredictions}</span>
              </div>
              <div className="flex items-center gap-2 font-medium leading-none text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Peak Day: {peakPredictionDay.date} with {peakPredictionDay.predictions} predictions
              </div>
            </CardFooter>
          </Card>
        </ div>
        
        {/* Expanded JOSAA Predicted Results Table with More Details */}
        <Card>
          <CardHeader>
            <CardTitle>Recent User Prediction Results</CardTitle>
            <CardDescription>
              Detailed insights into recent JOSAA prediction requests, including a comparison of predicted vs. actual outcomes and additional user data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>JEE Main %ile</TableHead>
                    <TableHead>JEE Adv. Rank</TableHead>
                    <TableHead>Predicted College & Branch</TableHead>
                    <TableHead>Predicted vs. Actual</TableHead>
                    <TableHead>Prediction Status</TableHead>
                    <TableHead className="text-right">View Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {josaaPredictionResults.map((pred) => (
                    <TableRow key={pred.id}>
                      <TableCell className="font-medium">{pred.user}</TableCell>
                      <TableCell>{pred.jeeMainPercentile}</TableCell>
                      <TableCell>{pred.jeeAdvRank}</TableCell>
                      <TableCell className="w-[200px]">{pred.college}, {pred.branch}</TableCell>
                      <TableCell>
                        <span className="font-semibold">Predicted:</span> IIT Bombay (CSE) <br />
                        <span className="font-semibold">Actual:</span> IIT Bombay (EE)
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Successful
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" aria-label={`View details for ${pred.user}`}>
                                <IconEye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View full user history</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Current Ranks Table */}
        <Card>
          <CardHeader>
            <CardTitle>Current College Opening/Closing Ranks</CardTitle>
            <CardDescription>
              A view of the latest closing ranks for top colleges for your reference.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>College</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Current Closing Rank</TableHead>
                    <TableHead className="text-right">View</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {josaaCollegeRanks.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.college}</TableCell>
                      <TableCell>{item.course}</TableCell>
                      <TableCell>{item.currentClosingRank}</TableCell>
                      <TableCell className="text-right">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" aria-label={`View details for ${item.college}`}>
                                <IconEye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View detailed stats</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}