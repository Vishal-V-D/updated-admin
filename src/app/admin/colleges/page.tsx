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
import { IconEye, IconBuilding, IconPencil, IconTrash, IconSearch, IconChevronLeft, IconChevronRight, IconLoader } from '@tabler/icons-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from '@/components/ui/select';

interface CollegeData {
 id: string;
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
 id: string; // Add the UUID here
 name: string;
 type: string;
 tier: string | number;
 nirf_2024: number | string;
 btech_seats: number | string;
 btech_programmes: number | string;
 establishment: number | string;
 city: string;
 state: string;
 views: number;
}
const apiMap = {
 'IIT': 'iit',
 'IIIT': 'iiit',
 'NIT': 'nit',
 'GFTI': 'gfti', // Corrected from gfts
};

export default function CollegesPage() {
 const [searchTerm, setSearchTerm] = useState('');
 const [selectedType, setSelectedType] = useState<string | null>('All ');
 const [currentPage, setCurrentPage] = useState(1);
 const [rowsPerPage, setRowsPerPage] = useState(10);
 const [customRows, setCustomRows] = useState('');
 const [colleges, setColleges] = useState<CollegeDisplay[]>([]);
 const [allCollegesCache, setAllCollegesCache] = useState<CollegeDisplay[]>([]);
 const [cache, setCache] = useState<Record<string, CollegeDisplay[]>>({});
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 const formatData = (data: CollegeData[], type: string): CollegeDisplay[] => {
   return data.map(item => ({
     id: item.id,
     name: item.data.Name,
     type: type,
     tier: item.data.Tier || 'N/A',
     nirf_2024: item.data['NIRF 2024'] || 'N/A',
     btech_seats: item.data['B.Tech Seats'] || 'N/A',
     btech_programmes: item.data['B.Tech Programmes'] || 'N/A',
     establishment: item.data.Establishment || 'N/A',
     city: 'N/A',
     state: 'N/A',
     views: 0,
   }));
 };

 const fetchAllColleges = async () => {
   setLoading(true);
   setError(null);
   try {
     let allFetchedColleges: CollegeDisplay[] = [];
     const types = ['IIT', 'IIIT', 'NIT', 'GFTI'];
     const newCache = { ...cache };

     for (const type of types) {
       if (newCache[type]) {
         allFetchedColleges = [...allFetchedColleges, ...newCache[type]];
       } else {
         const endpoint = apiMap[type as keyof typeof apiMap];
         const url = `https://josaa-admin-backend-1.onrender.com/api/${endpoint}`;
         const response = await fetch(url);
         if (!response.ok) {
           throw new Error(`Failed to fetch data from ${url}`);
         }
         const data: CollegeData[] = await response.json();
         const formattedData = formatData(data, type);
         allFetchedColleges = [...allFetchedColleges, ...formattedData];
         newCache[type] = formattedData;
       }
     }
     setColleges(allFetchedColleges);
     setAllCollegesCache(allFetchedColleges);
     setCache(newCache);
   } catch (err: any) {
     console.error(err);
     setError("Failed to fetch college data. Please ensure the backend server is running.");
   } finally {
     setLoading(false);
   }
 };

 const fetchCollegesByType = async (type: string) => {
   setLoading(true);
   setError(null);
   if (cache[type]) {
     setColleges(cache[type]);
     setLoading(false);
     return;
   }
   
   try {
     const endpoint = apiMap[type as keyof typeof apiMap];
     const url = `https://josaa-admin-backend-1.onrender.com/api/${endpoint}`;
     const response = await fetch(url);
     if (!response.ok) {
       throw new Error(`Failed to fetch data for ${type}`);
     }
     const data: CollegeData[] = await response.json();
     const formattedData = formatData(data, type);
     setColleges(formattedData);
     setCache(prevCache => ({ ...prevCache, [type]: formattedData }));
   } catch (err: any) {
     console.error(err);
     setError("Failed to fetch college data for this type.");
   } finally {
     setLoading(false);
   }
 };
const handleDeleteCollege = async (
  collegeId: string,
  collegeName: string,
  collegeType: string
) => {
  if (!window.confirm(`Are you sure you want to delete the college "${collegeName}"?`)) {
    return;
  }

  try {
    const response = await fetch(
      `https://josaa-admin-backend-1.onrender.com/api/college/${collegeId}/${collegeType}`, // ✅ match backend route
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete college.');
    }

    fetchAllColleges(); // reload table
    alert(`College "${collegeName}" deleted successfully!`);
  } catch (error) {
    console.error('Error deleting college:', error);
    alert('Error deleting college. Please try again.');
  }
};


 useEffect(() => {
   fetchAllColleges();
 }, []);

 const handleRowsPerPageChange = (value: string) => {
   const newRows = parseInt(value, 10);
   if (!isNaN(newRows) && newRows > 0) {
     setRowsPerPage(newRows);
     setCurrentPage(1);
   }
 };

 const institutionCounts = allCollegesCache.reduce((acc: Record<string, number>, college) => {
   const type = college.type;
   acc[type] = (acc[type] || 0) + 1;
   return acc;
 }, {});
 
 const filteredColleges = colleges.filter(college => {
   const matchesSearch =
     (college.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
     (college.type || '').toLowerCase().includes(searchTerm.toLowerCase());
   return matchesSearch;
 });

 const allFilteredCount = filteredColleges.length;
 const indexOfLastCollege = currentPage * rowsPerPage;
 const indexOfFirstCollege = indexOfLastCollege - rowsPerPage;
 const currentColleges = filteredColleges.slice(indexOfFirstCollege, indexOfLastCollege);
 const totalPages = Math.ceil(allFilteredCount / rowsPerPage);

 const handleTypeClick = (type: string) => {
   if (type === 'All ') {
     setColleges(allCollegesCache);
   } else {
     fetchCollegesByType(type);
   }
   setSelectedType(type);
   setSearchTerm('');
   setCurrentPage(1);
 };

 const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

 const collegeTypes = ['IIT', 'IIIT', 'NIT', 'GFTI'];

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
       
       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
         <Card
           className={`cursor-pointer transition-all ${selectedType === 'All ' ? 'ring-2 ring-primary scale-[1.02]' : ''}`}
           onClick={() => handleTypeClick('All ')}
         >
           <CardHeader>
             <CardTitle className="text-lg flex items-center justify-between space-x-2">
               <div className="flex items-center space-x-2">
                 <IconBuilding className="h-5 w-5" />
                 <span>All </span>
               </div>
               <Badge className="bg-primary text-white">
                 {allCollegesCache.length}
               </Badge>
             </CardTitle>
           </CardHeader>
           <CardContent>
             <p className="text-sm text-muted-foreground">
               View all colleges
             </p>
           </CardContent>
         </Card>
         {collegeTypes.map(type => (
           <Card
             key={type}
             className={`cursor-pointer transition-all ${selectedType === type ? 'ring-2 ring-primary scale-[1.02]' : ''}`}
             onClick={() => handleTypeClick(type)}
           >
             <CardHeader>
               <CardTitle className="text-lg flex items-center justify-between space-x-2">
                 <div className="flex items-center space-x-2">
                   <IconBuilding className="h-5 w-5" />
                   <span>{type}</span>
                 </div>
                 <Badge className="bg-primary text-white">
                   {institutionCounts[type] || 0}
                 </Badge>
               </CardTitle>
             </CardHeader>
             <CardContent>
               <p className="text-sm text-muted-foreground">
                 View colleges of type {type}
               </p>
             </CardContent>
           </Card>
         ))}
       </div>
       
       {loading && (
         <div className="flex justify-center items-center h-48">
           <IconLoader className="h-8 w-8 animate-spin text-gray-500" />
           <p className="ml-2">Loading colleges...</p>
         </div>
       )}

       {error && (
         <div className="flex justify-center items-center h-48 text-red-500">
           <p>{error}</p>
         </div>
       )}

       {!loading && !error && (
         <div className="space-y-4">
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
           <div className="w-full overflow-x-auto rounded-lg border">
             <Table className="min-w-full">
               <TableHeader>
                 <TableRow>
                   <TableHead className="w-[300px]">College Name</TableHead>
                   <TableHead className="w-[100px]">Type</TableHead>
                   <TableHead className="w-[100px]">Tier</TableHead>
                   <TableHead className="w-[120px]">NIRF 2024</TableHead>
                   <TableHead className="w-[100px]">Est.</TableHead>
                   <TableHead className="w-[150px]">B.Tech Seats</TableHead>
                   <TableHead className="w-[150px]">B.Tech Progs.</TableHead>
                   <TableHead className="w-[100px]">Views</TableHead>
                   <TableHead className="text-right w-[150px]">Actions</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {currentColleges.length > 0 ? (
                   currentColleges.map((college) => (
                     <TableRow key={college.id}>
                       <TableCell className="font-medium w-[300px] whitespace-normal">
                         <div className="flex items-center space-x-2">
                           <IconBuilding className="h-5 w-5 text-gray-500" />
                           <span>{college.name}</span>
                         </div>
                       </TableCell>
                       <TableCell className="w-[100px] whitespace-normal">
                         <Badge variant="secondary">{college.type}</Badge>
                       </TableCell>
                       <TableCell className="w-[100px] whitespace-normal">
                         {college.tier}
                       </TableCell>
                       <TableCell className="w-[120px] whitespace-normal">
                         {college.nirf_2024}
                       </TableCell>
                       <TableCell className="w-[100px] whitespace-normal">
                         {college.establishment}
                       </TableCell>
                       <TableCell className="w-[150px] whitespace-normal">
                         {college.btech_seats}
                       </TableCell>
                       <TableCell className="w-[150px] whitespace-normal">
                         {college.btech_programmes}
                       </TableCell>
                       <TableCell className="w-[100px] whitespace-normal">
                         {college.views.toLocaleString()}
                       </TableCell>
                       <TableCell className="text-right w-[150px]">
                         <div className="flex justify-end space-x-2">
                           {/* Corrected Link to pass UUID */}
                           <Link href={`/admin/colleges/${college.id}/${college.type}`}>
                             <Button variant="ghost" size="icon">
                               <IconEye className="h-4 w-4" />
                             </Button>
                           </Link>
                           {/* Corrected Link to pass UUID */}
                           <Link href={`/admin/colleges/${college.id}/edit/${college.type}`}>
                             <Button variant="ghost" size="icon">
                               <IconPencil className="h-4 w-4" />
                             </Button>
                           </Link>
                           <Button variant="ghost" size="icon" onClick={() => handleDeleteCollege(college.id, college.name, college.type)}>
                             <IconTrash className="h-4 w-4" />
                           </Button>
                         </div>
                       </TableCell>
                     </TableRow>
                   ))
                 ) : (
                   <TableRow>
                     <TableCell colSpan={9} className="h-24 text-center">
                       No colleges found.
                     </TableCell>
                   </TableRow>
                 )}
               </TableBody>
             </Table>
           </div>
           <div className="flex items-center justify-between pb-8  mb-4">
             <div className="flex items-center space-x-2 text-sm text-muted-foreground">
               <span className="hidden sm:inline">Rows per page:</span>
               <Select
                 value={String(rowsPerPage)}
                 onValueChange={(value) => {
                   handleRowsPerPageChange(value);
                 }}
               >
                 <SelectTrigger className="w-[70px]">
                   <SelectValue placeholder={rowsPerPage} />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="5">5</SelectItem>
                   <SelectItem value="15">15</SelectItem>
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
