'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  IconBuilding,
  IconBuildingEstate,
  IconBuildingMonument,
  IconEye,
  IconPencil,
  IconTrash,
  IconSearch,
  IconWorld,
  IconChevronLeft,
  IconChevronRight,
  IconSchool,
  IconPlus,
} from '@tabler/icons-react';
import PageContainer from '@/components/layout/page-container';
import { toast } from 'sonner';

interface ExamData {
  id: string; // Changed type to string to be consistent with UUID
  uuid: string;
  data: {
    Name?: string;
    Category?: string;
    'Exam Code'?: string;
    'Exam Type'?: string;
    'Application Period'?: string;
    'Official Website'?: string;
    'Organizing Body'?: string;
    'Exam Dates'?: string;
    Eligibility?: string;
    'Mode of Exam'?: string;
    Fee?: string;
    Seats?: string;
    'State/Region'?: string;
  };
  views?: number;
}

interface CollegeData {
  id: string; // Changed type to string to be consistent with UUID
  uuid: string;
  data: {
    'InstituteName'?: string;
    'Website'?: string;
    'NIRF 2023'?: number;
    'S.No'?: number;
    'Establishment'?: number;
    'Tier'?: string;
    'B.Tech Seats'?: number;
    'B.Tech Programmes'?: string[];
  };
  views?: number;
}

const API_PORT = 8000;

export default function ExamPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [examTypeFilter, setExamTypeFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [customRows, setCustomRows] = useState('');
  const [allExams, setAllExams] = useState<ExamData[]>([]);
  const [collegeExams, setCollegeExams] = useState<CollegeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const fetchExams = async () => {
    setLoading(true);
    setError(null);
    try {
      const examsPromise = fetch(`https://admin-page-josaa.netlify.app/exams`).then(
        (res) => {
          if (!res.ok) throw new Error('Failed to fetch general exams');
          return res.json();
        }
      );
      const collegeExamsPromise = fetch(
        `https://josaa-admin-backend-1.onrender.com/college-exams`
      ).then((res) => {
        if (!res.ok) throw new Error('Failed to fetch college exams');
        return res.json();
      });

      const [examsResult, collegeExamsResult] = await Promise.all([
        examsPromise,
        collegeExamsPromise,
      ]);

      const formattedExams = examsResult.data.map((item: any) => ({
        ...item,
        views: item.views || 0,
      }));
      setAllExams(formattedExams);

      const formattedCollegeExams = collegeExamsResult.data.map((item: any) => ({
        ...item,
        views: item.views || 0,
      }));
      setCollegeExams(formattedCollegeExams);
    } catch (err: any) {
      console.error(err);
      setError(
        'Failed to fetch exam data. Please ensure the backend server is running and accessible.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, isCollegeExam: boolean) => {
    setDeleteLoading(id);
    try {
      const endpoint = isCollegeExam ? 'college-exams' : 'exams';
      const response = await fetch(`https://josaa-admin-backend-1.onrender.com/${endpoint}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete');
      }

      toast.success(`${isCollegeExam ? 'College exam' : 'Exam'} deleted successfully`);
      await fetchExams(); // Refresh the data
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEdit = (id: string, isCollegeExam: boolean) => {
    const editPath = isCollegeExam 
      ? `/admin/exams/edit/college/${id}` 
      : `/admin/exams/edit/${id}`;
    router.push(editPath);
  };

  const handleView = (id: string, isCollegeExam: boolean) => {
    const viewPath = isCollegeExam 
      ? `/admin/exams/view/college/${id}` 
      : `/admin/exams/view/${id}`;
    router.push(viewPath);
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleRowsPerPageChange = (value: string) => {
    const newRows = parseInt(value, 10);
    if (!isNaN(newRows) && newRows > 0) {
      setRowsPerPage(newRows);
      setCurrentPage(1);
    }
  };

  const nationalLevelCount = allExams.filter(
    (exam) =>
      exam.data['Exam Type'] === 'National Level' ||
      exam.data['Exam Type']?.includes('National')
  ).length;

  const stateLevelCount = allExams.filter(
    (exam) =>
      exam.data['Exam Type'] === 'State Level' ||
      exam.data['Exam Type']?.includes('State')
  ).length;

  const institutionalLevelCount = collegeExams.length;

  const categoryCards = [
    {
      name: 'All Exams',
      icon: IconBuilding,
      count: allExams.length + collegeExams.length,
      filter: 'All',
    },
    {
      name: 'National Level Exams',
      icon: IconBuildingMonument,
      count: nationalLevelCount,
      filter: 'National Level',
    },
    {
      name: 'State Level Exams',
      icon: IconBuildingEstate,
      count: stateLevelCount,
      filter: 'State Level',
    },
    {
      name: 'Institutional Level Exams',
      icon: IconSchool,
      count: institutionalLevelCount,
      filter: 'Institutional Level',
    },
  ];

  const getFilteredData = () => {
    let dataToFilter: (ExamData | CollegeData)[] = [];

    if (examTypeFilter === 'All') {
      dataToFilter = [...allExams, ...collegeExams];
    } else if (examTypeFilter === 'National Level') {
      dataToFilter = allExams.filter(
        (exam) =>
          exam.data['Exam Type'] === 'National Level' ||
          exam.data['Exam Type']?.includes('National')
      );
    } else if (examTypeFilter === 'State Level') {
      dataToFilter = allExams.filter(
        (exam) =>
          exam.data['Exam Type'] === 'State Level' ||
          exam.data['Exam Type']?.includes('State')
      );
    } else if (examTypeFilter === 'Institutional Level') {
      dataToFilter = collegeExams;
    } else {
      dataToFilter = allExams.filter(
        (exam) => exam.data['Exam Type'] === examTypeFilter
      );
    }

    const filteredBySearch = dataToFilter.filter((item) => {
      if (!searchQuery) return true;
      const lowerCaseQuery = searchQuery.toLowerCase();
      const searchableValues = Object.values(item.data).map((value) =>
        String(value).toLowerCase()
      );
      return searchableValues.some((value) => value.includes(lowerCaseQuery));
    });

    return filteredBySearch;
  };

  const filteredData = getFilteredData();
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const handleCategoryClick = (filter: string) => {
    setExamTypeFilter(filter);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const truncateText = (
    text: string | number | undefined,
    maxLength: number = 30
  ) => {
    if (!text) return '';
    const textStr = String(text);
    return textStr.length > maxLength
      ? textStr.substring(0, maxLength) + '...'
      : textStr;
  };

  const isCollegeExam = (item: ExamData | CollegeData): item is CollegeData => {
    return 'InstituteName' in item.data;
  };

  return (
    <PageContainer>
      <div className="w-full min-h-screen">
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight">
                Entrance Exam Management
              </h1>
              <div className="flex gap-2">
                <Button onClick={() => router.push('/admin/exams/add')}>
                  <IconPlus size={16} className="mr-2" />
                  Add General Exam
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/admin/exams/add/college')}
                >
                  <IconPlus size={16} className="mr-2" />
                  Add College Exam
                </Button>
              </div>
            </div>

            <Separator />

            {/* Category cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {categoryCards.map((category) => {
                const IconComponent = category.icon;
                return (
                  <Card
                    key={category.name}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      examTypeFilter === category.filter
                        ? 'ring-2 ring-primary scale-[1.02]'
                        : ''
                    }`}
                    onClick={() => handleCategoryClick(category.filter)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center justify-between space-x-2">
                        <div className="flex items-center space-x-2">
                          <IconComponent size={20} className="text-primary" />
                          <span className="text-sm">{category.name}</span>
                        </div>
                        <Badge className="bg-primary text-white">
                          {category.count}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-muted-foreground">
                        View {category.name.toLowerCase()}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Loading & Error */}
            {loading && (
              <div className="flex justify-center items-center h-48">
                <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>
                <p className="ml-2">Loading exams...</p>
              </div>
            )}

            {error && (
              <div className="flex justify-center items-center h-48 text-red-500">
                <p>{error}</p>
              </div>
            )}

            {/* Table + Pagination */}
            {!loading && !error && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <h2 className="text-2xl font-bold tracking-tight">
                    {examTypeFilter === 'All' ? 'All Exams' : examTypeFilter}
                  </h2>

                  <div className="relative w-full sm:w-[300px]">
                    <IconSearch
                      size={16}
                      className="absolute left-3 top-3 text-gray-400"
                    />
                    <Input
                      type="text"
                      placeholder="Search exams..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="w-full border rounded-lg overflow-x-auto">
                  <Table className="w-full table-fixed">
                    <colgroup>
                      <col style={{ width: '25%' }} />
                      <col style={{ width: '12%' }} />
                      <col style={{ width: '12%' }} />
                      <col style={{ width: '12%' }} />
                      <col style={{ width: '15%' }} />
                      <col style={{ width: '12%' }} />
                      <col style={{ width: '8%' }} />
                      <col style={{ width: '4%' }} />
                    </colgroup>
                    <TableHeader className="bg-muted/50 sticky top-0 z-10">
                      <TableRow>
                        <TableHead className="font-semibold">
                          {examTypeFilter === 'Institutional Level'
                            ? 'Institute Name'
                            : 'Exam Name'}
                        </TableHead>
                        <TableHead className="font-semibold">
                          {examTypeFilter === 'Institutional Level'
                            ? 'S.No'
                            : 'Exam Code'}
                        </TableHead>
                        <TableHead className="font-semibold">
                          {examTypeFilter === 'Institutional Level'
                            ? 'Tier'
                            : 'Exam Type'}
                        </TableHead>
                        <TableHead className="font-semibold">
                          {examTypeFilter === 'Institutional Level'
                            ? 'Establishment'
                            : 'Application Period'}
                        </TableHead>
                        <TableHead className="font-semibold">
                          {examTypeFilter === 'Institutional Level'
                            ? 'NIRF 2023'
                            : 'Organizing Body'}
                        </TableHead>
                        <TableHead className="font-semibold">Website</TableHead>
                        <TableHead className="font-semibold">Views</TableHead>
                        <TableHead className="font-semibold text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentItems.length > 0 ? (
                        currentItems.map((item) => {
                          const isCollege = isCollegeExam(item);
                          return (
                            <TableRow key={item.id} className="hover:bg-muted/50">
                              <TableCell className="font-medium p-3">
                                <div className="flex items-center space-x-2">
                                  <IconSchool
                                    size={16}
                                    className="text-gray-500 flex-shrink-0"
                                  />
                                  <span
                                    className="truncate"
                                    title={
                                      'Name' in item.data
                                        ? item.data.Name
                                        : 'InstituteName' in item.data
                                        ? item.data.InstituteName
                                        : ''
                                    }
                                  >
                                    {truncateText(
                                      'Name' in item.data
                                        ? item.data.Name
                                        : 'InstituteName' in item.data
                                        ? item.data.InstituteName
                                        : '',
                                      40
                                    )}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="p-3">
                                <span
                                  className="truncate block"
                                  title={String(
                                    'Exam Code' in item.data
                                      ? item.data['Exam Code']
                                      : 'S.No' in item.data
                                      ? item.data['S.No']
                                      : ''
                                  )}
                                >
                                  {truncateText(
                                    'Exam Code' in item.data
                                      ? item.data['Exam Code']
                                      : 'S.No' in item.data
                                      ? item.data['S.No']
                                      : ''
                                  )}
                                </span>
                              </TableCell>
                              <TableCell className="p-3">
                                <Badge
                                  variant="secondary"
                                  className="truncate max-w-full"
                                >
                                  {truncateText(
                                    'Exam Type' in item.data
                                      ? item.data['Exam Type']
                                      : 'Tier' in item.data
                                      ? (item as CollegeData).data['Tier']
                                      : '',
                                    15
                                  )}
                                </Badge>
                              </TableCell>
                              <TableCell className="p-3">
                                <span
                                  className="truncate block"
                                  title={String(
                                    'Application Period' in item.data
                                      ? item.data['Application Period']
                                      : 'Establishment' in item.data
                                      ? (item as CollegeData).data['Establishment']
                                      : ''
                                  )}
                                >
                                  {truncateText(
                                    'Application Period' in item.data
                                      ? item.data['Application Period']
                                      : 'Establishment' in item.data
                                      ? (item as CollegeData).data['Establishment']
                                      : ''
                                  )}
                                </span>
                              </TableCell>
                              <TableCell className="p-3">
                                <span
                                  className="truncate block"
                                  title={String(
                                    'Organizing Body' in item.data
                                      ? item.data['Organizing Body']
                                      : 'NIRF 2023' in item.data
                                      ? (item as CollegeData).data['NIRF 2023']
                                      : ''
                                  )}
                                >
                                  {truncateText(
                                    'Organizing Body' in item.data
                                      ? item.data['Organizing Body']
                                      : 'NIRF 2023' in item.data
                                      ? (item as CollegeData).data['NIRF 2023']
                                      : '',
                                    20
                                  )}
                                </span>
                              </TableCell>
                              <TableCell className="p-3">
                                {(('Official Website' in item.data && item.data['Official Website']) ||
                                  ('Website' in item.data && item.data['Website'])) && (
                                  <a
                                    href={
                                      'Official Website' in item.data
                                        ? item.data['Official Website']
                                        : 'Website' in item.data
                                        ? (item as CollegeData).data['Website']
                                        : '#'
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline flex items-center space-x-1"
                                  >
                                    <IconWorld size={16} />
                                    <span>Link</span>
                                  </a>
                                )}
                              </TableCell>
                              <TableCell className="p-3">
                                {item.views ? item.views.toLocaleString() : 'N/A'}
                              </TableCell>
                              <TableCell className="text-right p-3">
                                <div className="flex justify-end space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleView(item.id, isCollege)}
                                  >
                                    <IconEye size={14} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleEdit(item.id, isCollege)}
                                  >
                                    <IconPencil size={14} />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-red-500 hover:text-red-700"
                                        disabled={deleteLoading === item.id}
                                      >
                                        <IconTrash size={14} />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This action cannot be undone. This will permanently delete the{' '}
                                          {isCollege ? 'college exam' : 'exam'} and remove all associated data.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDelete(item.id, isCollege)}
                                          className="bg-red-500 hover:bg-red-600"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="h-24 text-center">
                            No exams found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 mt-4">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span>Rows per page:</span>
                    <Select
                      value={String(rowsPerPage)}
                      onValueChange={(value) => {
                        handleRowsPerPageChange(value);
                        setCustomRows('');
                      }}
                    >
                      <SelectTrigger className="w-[70px]">
                        <SelectValue placeholder={rowsPerPage} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="15">15</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="30">30</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                    <span>or custom:</span>
                    <Input
                      type="number"
                      placeholder="25"
                      value={customRows}
                      onChange={(e) => {
                        setCustomRows(e.target.value);
                        handleRowsPerPageChange(e.target.value);
                      }}
                      className="w-[80px]"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages} ({filteredData.length}{' '}
                      total)
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="h-8 w-8"
                    >
                      <IconChevronLeft size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => paginate(currentPage + 1)}
                      disabled={
                        currentPage === totalPages || filteredData.length === 0
                      }
                      className="h-8 w-8"
                    >
                      <IconChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
