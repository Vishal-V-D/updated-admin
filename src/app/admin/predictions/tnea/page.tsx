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
import {
  LineChart,
  CartesianGrid,
  XAxis,
  Line,
  LabelList,
  RadialBarChart,
  RadialBar,
} from 'recharts';
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
import { TrendingUp, CheckCircle } from 'lucide-react';

// --- TNEA-specific Mock Data ---
const tneaKeyMetrics = [
  {
    title: 'Total Predictor Users',
    value: '2.6K',
    icon: <IconUsers className="h-5 w-5 text-gray-500" />,
  },
  {
    title: 'Total Predictions Made',
    value: '12.1K',
    icon: <IconClipboardList className="h-5 w-5 text-gray-500" />,
  },
  {
    title: 'Current Predictor Status',
    value: 'Operational',
    icon: <IconGauge className="h-5 w-5 text-gray-500" />,
  },
];

const tneaPredictionResults = [
  {
    id: '1',
    user: 'User201',
    cutoff: '198.5',
    college: 'Anna University',
    branch: 'Computer Science',
    status: 'Predicted',
  },
  {
    id: '2',
    user: 'User202',
    cutoff: '195.2',
    college: 'PSG Tech',
    branch: 'Mechanical Engineering',
    status: 'Predicted',
  },
  {
    id: '3',
    user: 'User203',
    cutoff: '185.7',
    college: 'Thiagarajar College of Engineering',
    branch: 'Civil Engineering',
    status: 'Predicted',
  },
  {
    id: '4',
    user: 'User204',
    cutoff: '199.1',
    college: 'Anna University',
    branch: 'Electronics and Communication Engg.',
    status: 'Predicted',
  },
  {
    id: '5',
    user: 'User205',
    cutoff: '188.0',
    college: 'Coimbatore Institute of Technology',
    branch: 'Information Technology',
    status: 'Predicted',
  },
];

// Updated mock data with detailed round-wise info
const tneaRoundRanks = [
  {
    college: 'Anna University',
    course: 'Computer Science',
    rounds: [
      { round: 1, openingRank: 10, closingRank: 850, avgMarks: { math: 99, physics: 98, chem: 97 } },
      { round: 2, openingRank: 851, closingRank: 1200, avgMarks: { math: 98, physics: 96, chem: 95 } },
    ],
  },
  {
    college: 'PSG Tech',
    course: 'Mechanical Engineering',
    rounds: [
      { round: 1, openingRank: 500, closingRank: 1500, avgMarks: { math: 97, physics: 96, chem: 94 } },
      { round: 2, openingRank: 1501, closingRank: 2500, avgMarks: { math: 95, physics: 93, chem: 92 } },
      { round: 3, openingRank: 2501, closingRank: 4000, avgMarks: { math: 92, physics: 90, chem: 89 } },
    ],
  },
  {
    college: 'College of Engineering, Guindy',
    course: 'Electronics and Communication Engg.',
    rounds: [
      { round: 1, openingRank: 50, closingRank: 1200, avgMarks: { math: 98, physics: 97, chem: 96 } },
      { round: 2, openingRank: 1201, closingRank: 2000, avgMarks: { math: 96, physics: 94, chem: 93 } },
      { round: 3, openingRank: 2001, closingRank: 3500, avgMarks: { math: 93, physics: 91, chem: 90 } },
    ],
  },
  {
    college: 'SSN College of Engineering',
    course: 'Computer Science',
    rounds: [
      { round: 1, openingRank: 200, closingRank: 1800, avgMarks: { math: 98, physics: 95, chem: 94 } },
      { round: 2, openingRank: 1801, closingRank: 4500, avgMarks: { math: 94, physics: 91, chem: 90 } },
    ],
  },
];

const tneaPredictionData = [
  { date: '2025-09-01', predictions: 300 },
  { date: '2025-09-02', predictions: 450 },
  { date: '2025-09-03', predictions: 520 },
  { date: '2025-09-04', predictions: 480 },
  { date: '2025-09-05', predictions: 610 },
  { date: '2025-09-06', predictions: 580 },
  { date: '2025-09-07', predictions: 700 },
];

const chartConfig = {
  predictions: {
    label: 'Predictions',
    color: 'hsl(250 80% 55%)',
  },
} as const;

const accuracyChartData = [{ name: 'Accuracy', value: 92, fill: 'hsl(180 60% 50%)' }];
const accuracyChartConfig = {
  value: {
    label: 'Accuracy',
    color: 'hsl(180 60% 50%)',
  },
} satisfies ChartConfig;

const tneaCutoffData = {
  highestCutoff: '199.8',
  lowestCutoff: '77.5',
  date: 'September 5, 2025',
};

export default function TneaPredictionsPage() {
  const [status, setStatus] = useState('operational');
  const [message, setMessage] = useState('Predictor is running smoothly.');
  const [accuracyLevel, setAccuracyLevel] = useState(92);
  const [predictionTemperature, setPredictionTemperature] = useState(0.7);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.8);
  const [modelParameters, setModelParameters] = useState(`{"cutoff_weight": 0.7, "branch_preference": 0.3}`);

  const handleUpdatePredictor = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Predictor values updated successfully.');
  };

  const totalPredictions = tneaPredictionData.reduce(
    (sum, entry) => sum + entry.predictions,
    0
  );
  const averageDailyPredictions = (totalPredictions / tneaPredictionData.length).toFixed(0);
  const peakPredictionDay = tneaPredictionData.reduce(
    (max, entry) => (entry.predictions > max.predictions ? entry : max),
    tneaPredictionData[0]
  );

  return (
    <PageContainer>
      <div className="flex-1 flex-col space-y-6 min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
            TNEA Predictor Admin Dashboard
          </h1>
          <Button onClick={() => toast.info('Refreshed data')}>Refresh Data</Button>
        </div>
        <Separator />

        {/* Highlighted TNEA Cutoff Section */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">2025 TNEA Cutoff Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                  Highest Cutoff: {tneaCutoffData.highestCutoff}
                </p>
                <p className="text-2xl font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                  Lowest Cutoff: {tneaCutoffData.lowestCutoff}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">Last Updated:</span> {tneaCutoffData.date}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Average Marks in Key Subjects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                  Maths: 95/100
                </p>
                <p className="text-2xl font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                  Physics: 93/100
                </p>
                <p className="text-2xl font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                  Chemistry: 91/100
                </p>
                <p className="text-sm text-muted-foreground">
                  Based on predicted data of successful applicants.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Metrics and Accuracy Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Predictor Usage</CardTitle>
              <IconUsers className="h-5 w-5 text-gray-500" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold">2.6K</div>
              <p className="text-xs text-muted-foreground">Total Users</p>
              <div className="text-xl font-bold mt-2">12.1K</div>
              <p className="text-xs text-muted-foreground">Total Predictions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Predictor Status</CardTitle>
              <IconGauge className="h-5 w-5 text-gray-500" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold text-green-500">Operational</div>
              <p className="text-sm text-muted-foreground mt-2">
                System is running smoothly and making accurate predictions.
              </p>
            </CardContent>
          </Card>

          <Card className="flex flex-col sm:col-span-1">
            <CardHeader className="items-center pb-0">
              <CardTitle>Prediction Accuracy</CardTitle>
              <CardDescription>Overall model performance</CardDescription>
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
            <CardFooter className="flex-col gap-2 text-sm pt-0">
              <div className="flex w-full justify-between items-center leading-none">
                <div className="flex items-center gap-2 font-medium">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Trend: <span className="text-green-500">Up 1.5%</span>
                </div>
                <div className="flex items-center gap-2 font-medium text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  Confidence: 98%
                </div>
              </div>
              <div className="text-muted-foreground leading-none">
                Based on recent validation data.
              </div>
            </CardFooter>
          </Card>

          <Card className="flex flex-col sm:col-span-1">
            <CardHeader className="items-center pb-0">
              <CardTitle>Average Cutoff Analytics</CardTitle>
              <CardDescription>Predicted TNEA cutoffs based on user data</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center gap-4 py-4">
              <div className="flex items-center justify-between text-center">
                <div className="flex flex-col items-center flex-1">
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-50">~185.0</div>
                  <p className="text-xs text-muted-foreground">Average Cutoff</p>
                </div>
                <Separator orientation="vertical" className="h-10 mx-2" />
                <div className="flex flex-col items-center flex-1">
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-50">178.5</div>
                  <p className="text-xs text-muted-foreground">Median Cutoff</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm pt-0">
              <div className="text-muted-foreground leading-none">
                <span className="font-semibold">Top 1% Cutoff Range:</span> 198.5 - 200
              </div>
              <div className="text-muted-foreground leading-none">
                <span className="font-semibold">Total Data Points:</span> 12.1K Predictions
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Main Content: Two-Column Layout for Tuning and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Advanced Predictor Tuning - Left Column */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Advanced Predictor Tuning</CardTitle>
              <CardDescription>
                Adjust key parameters for the TNEA cutoff predictor algorithm.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePredictor} className="space-y-4">
                <div className="grid w-full items-center gap-4">
                  <Label htmlFor="accuracy-level">Accuracy Level (%)</Label>
                  <Input
                    id="accuracy-level"
                    type="number"
                    value={accuracyLevel}
                    onChange={(e) => setAccuracyLevel(Number(e.target.value))}
                  />
                </div>
                <div className="grid w-full items-center gap-4">
                  <Label htmlFor="prediction-temp">Prediction Temperature</Label>
                  <Input
                    id="prediction-temp"
                    type="number"
                    step="0.1"
                    value={predictionTemperature}
                    onChange={(e) => setPredictionTemperature(Number(e.target.value))}
                  />
                </div>
                <div className="grid w-full items-center gap-4">
                  <Label htmlFor="confidence-threshold">Confidence Threshold (%)</Label>
                  <Input
                    id="confidence-threshold"
                    type="number"
                    value={confidenceThreshold}
                    onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                  />
                </div>
                <div className="grid w-full items-center gap-4">
                  <Label htmlFor="model-params">Model Parameters (JSON)</Label>
                  <Textarea
                    id="model-params"
                    value={modelParameters}
                    onChange={(e) => setModelParameters(e.target.value)}
                  />
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
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Update Predictor
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Prediction Analytics Chart - Right Column */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>TNEA Predictions Over Time</CardTitle>
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
                  data={tneaPredictionData}
                  margin={{ top: 20, left: 12, right: 12 }}
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
                      return date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      });
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
                    dot={{ fill: 'var(--color-predictions)' }}
                    activeDot={{ r: 6 }}
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
        </div>

        {/* Expanded TNEA Predicted Results Table with More Details */}
        <Card>
          <CardHeader>
            <CardTitle>Recent User Prediction Results</CardTitle>
            <CardDescription>
              Detailed insights into recent TNEA prediction requests, including user cutoff, predicted college, and more.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>TNEA Cutoff</TableHead>
                    <TableHead>Predicted College & Branch</TableHead>
                    <TableHead>Prediction Status</TableHead>
                    <TableHead className="text-right">View Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tneaPredictionResults.map((pred) => (
                    <TableRow key={pred.id}>
                      <TableCell className="font-medium">{pred.user}</TableCell>
                      <TableCell>{pred.cutoff}</TableCell>
                      <TableCell className="w-[200px]">{pred.college}, {pred.branch}</TableCell>
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

        {/* Updated TNEA Round-wise Ranks & Marks Table */}
        <Card>
          <CardHeader>
            <CardTitle>TNEA Round-wise Ranks & Average Marks</CardTitle>
            <CardDescription>
              A reference of historical TNEA counseling data for top colleges across different rounds.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">College</TableHead>
                    <TableHead className="w-[150px]">Course</TableHead>
                    <TableHead>Round 1 Ranks</TableHead>
                    <TableHead>Round 2 Ranks</TableHead>
                    <TableHead>Round 3 Ranks</TableHead>
                    <TableHead className="text-right">Avg. Marks</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tneaRoundRanks.map((item) => (
                    <TableRow key={item.college}>
                      <TableCell className="font-medium">{item.college}</TableCell>
                      <TableCell>{item.course}</TableCell>
                      <TableCell>
                        {item.rounds.find((r) => r.round === 1) ? (
                          <>
                            <span className="font-semibold">Opening:</span>{' '}
                            {item.rounds.find((r) => r.round === 1)?.openingRank}
                            <br />
                            <span className="font-semibold">Closing:</span>{' '}
                            {item.rounds.find((r) => r.round === 1)?.closingRank}
                          </>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.rounds.find((r) => r.round === 2) ? (
                          <>
                            <span className="font-semibold">Opening:</span>{' '}
                            {item.rounds.find((r) => r.round === 2)?.openingRank}
                            <br />
                            <span className="font-semibold">Closing:</span>{' '}
                            {item.rounds.find((r) => r.round === 2)?.closingRank}
                          </>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.rounds.find((r) => r.round === 3) ? (
                          <>
                            <span className="font-semibold">Opening:</span>{' '}
                            {item.rounds.find((r) => r.round === 3)?.openingRank}
                            <br />
                            <span className="font-semibold">Closing:</span>{' '}
                            {item.rounds.find((r) => r.round === 3)?.closingRank}
                          </>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        M: {item.rounds[0].avgMarks.math}
                        <br />
                        P: {item.rounds[0].avgMarks.physics}
                        <br />
                        C: {item.rounds[0].avgMarks.chem}
                      </TableCell>
                      <TableCell className="text-right">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`View details for ${item.college}`}
                              >
                                <IconEye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View detailed stats for {item.college}</p>
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