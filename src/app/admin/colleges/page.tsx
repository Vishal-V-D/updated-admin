'use client';

import React, { useState, useEffect } from 'react';
import PageContainer from '@/components/layout/page-container';
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
import {
  IconEye,
  IconBuilding,
  IconPencil,
  IconTrash,
  IconSearch,
  IconChevronLeft,
  IconChevronRight,
  IconLoader,
  IconGripVertical
} from '@tabler/icons-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

// --- Interfaces ---
interface CollegeData {
  id: string;
  sort_order?: number;
  data: {
    'Type': string;
    'InstituteName': string;
    'Institute Code': string;
    'Name': string;
    'Establishment': number;
    'Tier': string;
    'NIRF 2024': number;
    'B.Tech Seats': number;
    'B.Tech Programmes': number;
    'Website': string;
  };
}

interface CollegeDisplay {
  id: string;
  sort_order: number;
  name: string;
  type: string;
  tier: string | number;
  nirf_2024: number | string;
  btech_seats: number | string;
  btech_programmes: number | string;
  establishment: number | string;
  city: string;
  state: string;
  
}

const apiMap = {
  'IIT': 'iit',
  'IIIT': 'iiit',
  'NIT': 'nit',
  'GFTI': 'gfti',
};

// --- Sortable Row Component ---
function SortableCollegeRow({
  college,
  isDraggable,
  onDelete
}: {
  college: CollegeDisplay;
  isDraggable: boolean;
  onDelete: (id: string, name: string, type: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: college.id, disabled: !isDraggable });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    position: 'relative',
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style} className={isDragging ? "bg-muted/80 shadow-md" : ""}>
      <TableCell className="w-[50px]">
        {isDraggable ? (
          <div {...listeners} {...attributes} className="cursor-grab touch-none p-2 hover:bg-gray-100 rounded">
            <IconGripVertical size={18} className="text-gray-400" />
          </div>
        ) : (
          <div className="w-[18px]" />
        )}
      </TableCell>
      <TableCell className="font-medium w-[300px] whitespace-normal">
        <div className="flex items-center space-x-2">
          <IconBuilding className="h-5 w-5 text-gray-500" />
          <span>{college.name}</span>
        </div>
      </TableCell>
      <TableCell className="w-[100px] whitespace-normal">
        <Badge variant="secondary">{college.type}</Badge>
      </TableCell>
      <TableCell className="w-[100px] whitespace-normal">{college.tier}</TableCell>
      <TableCell className="w-[120px] whitespace-normal">{college.nirf_2024}</TableCell>
      <TableCell className="w-[100px] whitespace-normal">{college.establishment}</TableCell>
      <TableCell className="w-[150px] whitespace-normal">{college.btech_seats}</TableCell>
      <TableCell className="w-[150px] whitespace-normal">{college.btech_programmes}</TableCell>
     
        <div className="flex justify-end space-x-2">
          <Link href={`/admin/colleges/${college.id}/${college.type}`}>
         
          </Link>
          <Link href={`/admin/colleges/${college.id}/edit/${college.type}`}>
            <Button variant="ghost" size="icon"><IconPencil className="h-4 w-4" /></Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => { e.stopPropagation(); onDelete(college.id, college.name, college.type); }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <IconTrash className="h-4 w-4" />
          </Button>
        </div>
    
    </TableRow>
  );
}

export default function CollegesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All ');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [customRows, setCustomRows] = useState('');
  const [colleges, setColleges] = useState<CollegeDisplay[]>([]);
  const [allCollegesCache, setAllCollegesCache] = useState<CollegeDisplay[]>([]);
  const [cache, setCache] = useState<Record<string, CollegeDisplay[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  // --- Helper Functions ---
  const formatData = (data: CollegeData[], type: string): CollegeDisplay[] => {
    return data.map((item, index) => ({
      id: item.id,
      sort_order: item.sort_order ?? (index + 9999),
      name: item.data.Name,
      type: type,
      tier: item.data.Tier || 'N/A',
      nirf_2024: item.data['NIRF 2024'] || 'N/A',
      btech_seats: item.data['B.Tech Seats'] || 'N/A',
      btech_programmes: item.data['B.Tech Programmes'] || 'N/A',
      establishment: item.data.Establishment || 'N/A',
      city: 'N/A',
      state: 'N/A',
    
    }));
  };

  const sortColleges = (list: CollegeDisplay[]) => {
    return [...list].sort((a, b) => a.sort_order - b.sort_order);
  };

  // --- Backend Sync Logic ---
  const updateSortOrder = async (fullList: CollegeDisplay[]) => {
    if (selectedType !== 'All ') {
      const itemsToUpdate = fullList.map((item, index) => ({
        id: item.id,
        sort_order: index + 1
      }));
      await sendUpdate(selectedType, itemsToUpdate);
    } else {
      // Split updates by type for "All" tab
      const typeGroups: Record<string, any[]> = {};
      const counters: Record<string, number> = {};

      fullList.forEach((item) => {
        const type = item.type;
        if (!typeGroups[type]) {
          typeGroups[type] = [];
          counters[type] = 1;
        }
        typeGroups[type].push({
          id: item.id,
          sort_order: counters[type]++
        });
      });

      for (const type of Object.keys(typeGroups)) {
        await sendUpdate(type, typeGroups[type]);
      }
    }
  };

  const sendUpdate = async (category: string, items: any[]) => {
    try {
      await fetch('https://josaa-admin-backend-1.onrender.com/api/update-college-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, items }),
      });
      console.log(`Updated order for ${category}`);
    } catch (err) {
      console.error(`Failed to save sort order for ${category}`, err);
    }
  };

  // --- Fetching Logic ---
  const fetchAllColleges = async () => {
    setLoading(true);
    setError(null);
    try {
      let allFetchedColleges: CollegeDisplay[] = [];
      const types = ['IIT', 'IIIT', 'NIT', 'GFTI'];
      const newCache = { ...cache };

      for (const type of types) {
        const endpoint = apiMap[type as keyof typeof apiMap];
        const url = `https://josaa-admin-backend-1.onrender.com/api/${endpoint}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch ${type}`);

        const data: CollegeData[] = await response.json();
        const formattedData = formatData(data, type);

        allFetchedColleges = [...allFetchedColleges, ...formattedData];
        newCache[type] = sortColleges(formattedData);
      }

      const sortedAll = sortColleges(allFetchedColleges);
      setColleges(sortedAll);
      setAllCollegesCache(sortedAll);
      setCache(newCache);
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch college data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCollegesByType = async (type: string) => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = apiMap[type as keyof typeof apiMap];
      const url = `https://josaa-admin-backend-1.onrender.com/api/${endpoint}`;
      const response = await fetch(url);
      const data: CollegeData[] = await response.json();

      const formattedData = formatData(data, type);
      const sortedData = sortColleges(formattedData);

      setColleges(sortedData);
      setCache(prev => ({ ...prev, [type]: sortedData }));
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCollege = async (id: string, name: string, type: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    try {
      await fetch(`https://josaa-admin-backend-1.onrender.com/api/college/${id}/${type}`, { method: 'DELETE' });
      if (selectedType === 'All ') fetchAllColleges();
      else {
        const newColleges = colleges.filter(c => c.id !== id);
        setColleges(newColleges);
        setCache(prev => ({ ...prev, [type]: newColleges }));
      }
      alert('Deleted');
    } catch (e) { alert('Error deleting'); }
  };

  useEffect(() => {
    fetchAllColleges();
  }, []);

  // --- Pagination & Filtering Logic ---
  const handleRowsPerPageChange = (value: string) => {
    const newRows = parseInt(value, 10);
    if (!isNaN(newRows) && newRows > 0) {
      setRowsPerPage(newRows);
      setCurrentPage(1); // Reset to page 1
    }
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const filteredColleges = colleges.filter(college =>
    (college.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (college.type || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const allFilteredCount = filteredColleges.length;
  const indexOfLastCollege = currentPage * rowsPerPage;
  const indexOfFirstCollege = indexOfLastCollege - rowsPerPage;
  const currentColleges = filteredColleges.slice(indexOfFirstCollege, indexOfLastCollege);
  const totalPages = Math.ceil(allFilteredCount / rowsPerPage);

  const institutionCounts = allCollegesCache.reduce((acc: Record<string, number>, college) => {
    const type = college.type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  // --- DnD Handler ---
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = currentColleges.findIndex((item) => item.id === active.id);
    const newIndex = currentColleges.findIndex((item) => item.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      // 1. Calculate slice
      const newSlice = arrayMove(currentColleges, oldIndex, newIndex);

      // 2. Update Main Array
      const newFullList = [...filteredColleges];
      newFullList.splice(indexOfFirstCollege, rowsPerPage, ...newSlice);

      // 3. Update State
      setColleges(newFullList);
      if (selectedType !== 'All ') {
        setCache(prev => ({ ...prev, [selectedType]: newFullList }));
      } else {
        setAllCollegesCache(newFullList);
      }

      // 4. Send Update
      updateSortOrder(newFullList);
    }
  };

  const handleTypeClick = (type: string) => {
    if (type === 'All ') {
      setColleges(sortColleges(allCollegesCache));
    } else {
      fetchCollegesByType(type);
    }
    setSelectedType(type);
    setSearchTerm('');
    setCurrentPage(1);
  };

  const collegeTypes = ['IIT', 'IIIT', 'NIT', 'GFTI'];

  const cardColors: Record<string, string> = {
    'All ': 'bg-gradient-to-br from-indigo-500 to-purple-600',
    'IIT': 'bg-gradient-to-br from-cyan-500 to-blue-500',
    'NIT': 'bg-gradient-to-br from-green-500 to-emerald-500',
    'IIIT': 'bg-gradient-to-br from-orange-500 to-red-500',
    'GFTI': 'bg-gradient-to-br from-pink-500 to-rose-500',
  };

  return (
    <PageContainer>
      <div className="flex-1 flex-col space-y-6 min-h-screen">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">College Management</h1>
          <Link href="/admin/colleges/add">
            <Button>Add New College</Button>
          </Link>
        </div>

        <Separator />

        {/* Type Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card
            className={`cursor-pointer transition-all ${cardColors['All ']} ${selectedType === 'All ' ? 'ring-2 ring-primary scale-[1.02]' : ''}`}
            onClick={() => handleTypeClick('All ')}
          >
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between space-x-2 text-white">
                <div className="flex items-center space-x-2">
                  <IconBuilding className="h-5 w-5" />
                  <span>All </span>
                </div>
                <Badge className="bg-white/20 text-white border-white/30">
                  {allCollegesCache.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white/90">View all colleges</p>
            </CardContent>
          </Card>
          {collegeTypes.map(type => (
            <Card
              key={type}
              className={`cursor-pointer transition-all ${cardColors[type]} ${selectedType === type ? 'ring-2 ring-primary scale-[1.02]' : ''}`}
              onClick={() => handleTypeClick(type)}
            >
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between space-x-2 text-white">
                  <div className="flex items-center space-x-2">
                    <IconBuilding className="h-5 w-5" />
                    <span>{type}</span>
                  </div>
                  <Badge className="bg-white/20 text-white border-white/30">
                    {institutionCounts[type] || 0}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-white/90">View {type} colleges</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Area */}
        {loading && (
          <div className="flex justify-center items-center h-48">
            <IconLoader className="h-8 w-8 animate-spin text-gray-500" />
            <p className="ml-2">Loading colleges...</p>
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex justify-between items-center space-x-4">
              <h2 className="text-2xl font-bold tracking-tight">
                {selectedType ? `${selectedType} Colleges` : 'All '}
              </h2>
              <div className="relative w-full max-w-sm">
                <Input
                  type="text"
                  placeholder="Search colleges..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-8"
                />
                <IconSearch className="h-4 w-4 absolute top-1/2 left-2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Table */}
            <div className="w-full overflow-x-auto rounded-lg border">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead className="w-[300px]">College Name</TableHead>
                      <TableHead className="w-[100px]">Type</TableHead>
                      <TableHead className="w-[100px]">Tier</TableHead>
                      <TableHead className="w-[120px]">NIRF 2024</TableHead>
                      <TableHead className="w-[100px]">Est.</TableHead>
                      <TableHead className="w-[150px]">B.Tech Seats</TableHead>
                      <TableHead className="w-[100px]">B.Tech Progs.</TableHead>
                   
                      <TableHead className="text-right  w-[150px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <SortableContext items={currentColleges.map(c => c.id)} strategy={verticalListSortingStrategy}>
                    <TableBody>
                      {currentColleges.length > 0 ? (
                        currentColleges.map((college) => (
                          <SortableCollegeRow
                            key={college.id}
                            college={college}
                            isDraggable={true}
                            onDelete={handleDeleteCollege}
                          />
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={10} className="h-24 text-center">No colleges found.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </SortableContext>
                </Table>
              </DndContext>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pb-8 mb-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span className="hidden sm:inline">Rows per page:</span>
                <Select
                  value={String(rowsPerPage)}
                  onValueChange={(value) => handleRowsPerPageChange(value)}
                >
                  <SelectTrigger className="w-[70px]">
                    <SelectValue placeholder={rowsPerPage} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="30">30</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="ml-2">or enter custom:</span>
                <Input
                  type="number"
                  placeholder="e.g., 25"
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
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <IconChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages || filteredColleges.length === 0}
                >
                  <IconChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

          </div>
        )}
      </div>
    </PageContainer>
  );
}
