'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  IconPencil,
  IconTrash,
  IconSearch,
  IconWorld,
  IconChevronLeft,
  IconChevronRight,
  IconSchool,
  IconPlus,
  IconGripVertical,
} from '@tabler/icons-react';
import PageContainer from '@/components/layout/page-container';
import { toast } from 'sonner';

// --- DnD Imports ---
import {
  DndContext,
  closestCenter,
  useSensors,
  useSensor,
  MouseSensor,
  TouchSensor,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ... [Interfaces and SortableRow component remain unchanged] ...

interface ExamData {
  id: string;
  uuid: string;
  views?: number;
  sort_order: number;
  data: {
    Name?: string;
    Category?: string;
    'Exam Code'?: string;
    'Exam Type'?: string;
    'Official Website'?: string;
    'Application Period'?: string;
    'Organizing Body'?: string;
  };
}

type AllExamData = ExamData;

function SortableRow({ item }: { item: AllExamData }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.9 : 1,
    position: 'relative',
    willChange: 'transform',
  };

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

  const router = useRouter();
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeleteLoading(id);
    try {
      const endpoint = 'exams';
      const response = await fetch(`https://josaa-admin-backend-1.onrender.com/${endpoint}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete');
      }

      toast.success('Exam deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/exams/edit/${id}`);
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      key={item.id}
      className={`hover:bg-muted/50 ${isDragging ? 'shadow-2xl bg-primary/10' : ''}`}
    >
      <TableCell className="p-3 w-4 cursor-grab" {...listeners} {...attributes}>
        <IconGripVertical size={16} className="text-gray-500 hover:text-primary" />
      </TableCell>
      <TableCell className="font-medium p-3">
        <div className="flex items-center space-x-2">
          <IconSchool
            size={16}
            className="text-gray-500 flex-shrink-0"
          />
          <span
            className="truncate"
            title={item.data.Name}
          >
            {truncateText(item.data.Name, 40)}
          </span>
        </div>
      </TableCell>
      <TableCell className="p-3">
        <span
          className="truncate block"
          title={String(item.data['Exam Code'])}
        >
          {truncateText(item.data['Exam Code'])}
        </span>
      </TableCell>
      <TableCell className="p-3">
        <Badge
          variant="secondary"
          className="truncate max-w-full"
        >
          {truncateText(item.data['Exam Type'], 15)}
        </Badge>
      </TableCell>
      <TableCell className="p-3">
        <span
          className="truncate block"
          title={String(item.data['Application Period'])}
        >
          {truncateText(item.data['Application Period'])}
        </span>
      </TableCell>
      <TableCell className="p-3">
        <span
          className="truncate block"
          title={String(item.data['Organizing Body'])}
        >
          {truncateText(item.data['Organizing Body'], 20)}
        </span>
      </TableCell>
      <TableCell className="p-3">
        {item.data['Official Website'] && (
          <a
            href={item.data['Official Website']}
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
            onClick={() => handleEdit(item.id)}
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
                  This action cannot be undone. This will permanently delete the
                  exam and remove all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDelete(item.id)}
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
}

export default function ExamPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [examTypeFilter, setExamTypeFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [customRows, setCustomRows] = useState('');
  const [allData, setAllData] = useState<AllExamData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const fetchExams = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://josaa-admin-backend-1.onrender.com/exams`);

      if (!response.ok) throw new Error('Failed to fetch general exams');

      const examsResult = await response.json();

      const formattedExams: ExamData[] = examsResult.data.map((item: any, index: number) => ({
        ...item,
        views: item.views || 0,
        sort_order: item.sort_order ? Number(item.sort_order) : index + 1,
      }));

      const sortedData = formattedExams.sort(
        (a, b) => a.sort_order - b.sort_order
      );

      setAllData(sortedData);

    } catch (err: any) {
      console.error(err);
      setError(
        'Failed to fetch exam data. Please ensure the backend server is running and accessible.'
      );
    } finally {
      setLoading(false);
    }
  };

  const updateSortOrder = async (newOrder: AllExamData[]) => {
    const generalExamsUpdate = newOrder
      .map((item, index) => ({ id: item.id, sort_order: index + 1 }));

    try {
      const response = await fetch(`https://josaa-admin-backend-1.onrender.com/update-exam-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          general: generalExamsUpdate,
          college: [],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update sort order on server');
      }

      toast.success('Table order updated successfully!');
    } catch (error) {
      console.error('Order update error:', error);
      toast.error('Failed to save new order. Please try again.');
      fetchExams();
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = allData.findIndex((item) => item.id === active.id);
      const newIndex = allData.findIndex((item) => item.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(allData, oldIndex, newIndex).map(
          (item, index) => ({ ...item, sort_order: index + 1 })
        );
        setAllData(newOrder);
        await updateSortOrder(newOrder);
      }
    }
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

  const getFilteredData = useMemo(() => {
    let dataToFilter: AllExamData[] = [...allData];

    if (examTypeFilter === 'National Level') {
      dataToFilter = dataToFilter.filter(
        (exam) =>
          exam.data['Exam Type'] === 'National Level' ||
          exam.data['Exam Type']?.includes('National')
      );
    } else if (examTypeFilter === 'State Level') {
      dataToFilter = dataToFilter.filter(
        (exam) =>
          exam.data['Exam Type'] === 'State Level' ||
          exam.data['Exam Type']?.includes('State')
      );
    }

    const filteredBySearch = dataToFilter.filter((item) => {
      if (!searchQuery) return true;
      const lowerCaseQuery = searchQuery.toLowerCase();

      const searchableData = [
        item.data.Name,
        item.data['Exam Code'],
        item.data['Exam Type'],
        item.data['Organizing Body'],
      ].map((value) => String(value ?? '').toLowerCase())
        .join(' ');

      return searchableData.includes(lowerCaseQuery);
    });

    return filteredBySearch.sort((a, b) => a.sort_order - b.sort_order);

  }, [allData, examTypeFilter, searchQuery]);


  const filteredData = getFilteredData;
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const currentItemIds = currentItems.map(item => item.id);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const handleCategoryClick = (filter: string) => {
    setExamTypeFilter(filter);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const nationalLevelCount = allData.filter(
    (exam) =>
      exam.data['Exam Type'] === 'National Level' ||
      exam.data['Exam Type']?.includes('National')
  ).length;

  const stateLevelCount = allData.filter(
    (exam) =>
      exam.data['Exam Type'] === 'State Level' ||
      exam.data['Exam Type']?.includes('State')
  ).length;

  // ✨ UPDATED: Added 'color' property with your requested gradients
  const categoryCards = [
    {
      name: 'All Exams',
      icon: IconBuilding,
      count: allData.length,
      filter: 'All',
      color: 'bg-gradient-to-br from-indigo-500 to-purple-600',
    },
    {
      name: 'National Level Exams',
      icon: IconBuildingMonument,
      count: nationalLevelCount,
      filter: 'National Level',
      color: 'bg-gradient-to-br from-cyan-500 to-blue-500',
    },
    {
      name: 'State Level Exams',
      icon: IconBuildingEstate,
      count: stateLevelCount,
      filter: 'State Level',
      color: 'bg-gradient-to-br from-green-500 to-emerald-500',
    },
  ];

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
                  Add New Exam
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
                    // ✨ UPDATED: Applied dynamic background color and removed border
                    // Also changed ring color to white so it's visible against the dark gradient
                    className={`cursor-pointer transition-all hover:shadow-lg border-0 ${category.color} ${
                      examTypeFilter === category.filter
                        ? 'ring-2 ring-white scale-[1.02]'
                        : ''
                    }`}
                    onClick={() => handleCategoryClick(category.filter)}
                  >
                    <CardHeader className="pb-3">
                      {/* ✨ UPDATED: Made text white */}
                      <CardTitle className="text-lg flex items-center justify-between space-x-2 text-white">
                        <div className="flex items-center space-x-2">
                          {/* ✨ UPDATED: Made icon white */}
                          <IconComponent size={20} className="text-white" />
                          <span className="text-sm font-bold">{category.name}</span>
                        </div>
                        {/* ✨ UPDATED: Made badge translucent white */}
                        <Badge className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm">
                          {category.count}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {/* ✨ UPDATED: Made description text white with opacity */}
                      <p className="text-xs text-white/80 font-medium">
                        View {category.name.toLowerCase()}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
              {/* Invisible card to keep grid alignment if needed */}
              <Card className="hidden md:block opacity-0 pointer-events-none">
                <CardHeader className="pb-3"><CardTitle></CardTitle></CardHeader>
              </Card>
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
                      <col style={{ width: '4%' }} />
                      <col style={{ width: '21%' }} />
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
                        <TableHead className="font-semibold w-4"></TableHead>
                        <TableHead className="font-semibold">
                          Exam Name
                        </TableHead>
                        <TableHead className="font-semibold">
                          Exam Code
                        </TableHead>
                        <TableHead className="font-semibold">
                          Exam Type
                        </TableHead>
                        <TableHead className="font-semibold">
                          Application Period
                        </TableHead>
                        <TableHead className="font-semibold">
                          Organizing Body
                        </TableHead>
                        <TableHead className="font-semibold">Website</TableHead>
                        <TableHead className="font-semibold">Views</TableHead>
                        <TableHead className="font-semibold text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={currentItemIds}
                        strategy={verticalListSortingStrategy}
                      >
                        <TableBody>
                          {currentItems.length > 0 ? (
                            currentItems.map((item) => {
                              return (
                                <SortableRow
                                  key={item.id}
                                  item={item}
                                />
                              );
                            })
                          ) : (
                            <TableRow>
                              <TableCell colSpan={9} className="h-24 text-center">
                                No exams found.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </SortableContext>
                    </DndContext>
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
