'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Icons
import {
  IconLoader, IconCheck, IconX, IconEdit, IconSearch, IconReplace,
  IconPlus, IconTrash, IconTable, IconList, IconAlignLeft,
  IconFolder, IconDotsVertical, IconArrowUp, IconArrowDown,
  IconGripVertical, IconUpload, IconPencil, IconFilter, IconKey
} from '@tabler/icons-react';
import {
  MaximizeIcon, MinimizeIcon, BarChart2
} from 'lucide-react';

// --- DnD Kit Imports ---
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable // Added for column DndContext
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy, // Added for column sorting
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Types ---

interface CollegeEditPageProps {
  params: Promise<{ id: string; type: string }>;
}

interface CollegeData {
  Name: string;
  Type: string;
  Tier: string;
  Website: string;
  'NIRF 2024': number | null;
  'B.Tech Seats': number | null;
  'B.Tech Programmes': string | string[] | null;
  Establishment: number | null;
  id?: string;
}

interface FullData {
  [key: string]: any;
}

interface BackendResponse {
  full_data: FullData;
  basic_data: CollegeData;
}

// --- File Helper Function ---
const uploadFile = async (file: File, filterName?: string): Promise<any[]> => {
  const formData = new FormData();
  formData.append('file', file);

  // Construct URL with filter if present
  // CRITICAL FIX: Added .trim() to remove leading spaces that cause filter mismatches
  let url = 'https://josaa-admin-backend-1.onrender.com/api/convert-csv';
  if (filterName && filterName.trim()) {
    url += `?filter_name=${encodeURIComponent(filterName.trim())}`;
  }

  // Using the localhost endpoint defined in your python backend
  const res = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Failed to upload file");
  }
  return await res.json();
};

// --- NIRF LOGIC START ---

interface Abbreviation {
  Abbreviation: string;
  "Full Form": string;
  "User-friendly Explanation": string;
}

const nirfAbbreviations: Abbreviation[] = [
  { Abbreviation: "SS", "Full Form": "Student Strength", "User-friendly Explanation": "Total number of students, including those from other countries, enrolled in the college." },
  { Abbreviation: "FSR", "Full Form": "Faculty-Student Ratio", "User-friendly Explanation": "Ratio of teaching staff to the number of students. A lower number indicates more individual attention for students." },
  { Abbreviation: "FQE", "Full Form": "Faculty Qualification & Experience", "User-friendly Explanation": "Indicates the quality of the teaching staff, including the percentage with PhDs and their experience." },
  { Abbreviation: "FRU", "Full Form": "Financial Resources & their Utilization", "User-friendly Explanation": "How well the college uses its funds for academic purposes, like labs, library, and other student facilities." },
  { Abbreviation: "PU", "Full Form": "Publications", "User-friendly Explanation": "The number of research papers published by the faculty in quality journals and conferences." },
  { Abbreviation: "QP", "Full Form": "Quality of Publications", "User-friendly Explanation": "The impact and citation count of the research papers, indicating their quality and influence." },
  { Abbreviation: "IPR", "Full Form": "Intellectual Property Rights", "User-friendly Explanation": "The number of patents filed, granted, and published by the college, showcasing innovation." },
  { Abbreviation: "FPPP", "Full Form": "Footprint of Projects & Professional Practice", "User-friendly Explanation": "The amount of funding the college receives from research projects, consultancy work, and industry." },
  { Abbreviation: "GPH", "Full Form": "Graduation Outcomes - Higher Studies", "User-friendly Explanation": "The percentage of students who successfully get admission for higher studies after graduating." },
  { Abbreviation: "GUE", "Full Form": "Graduation Outcomes - University Exams", "User-friendly Explanation": "The pass percentage and performance of students in their final year university exams." },
  { Abbreviation: "MS", "Full Form": "Median Salary", "User-friendly Explanation": "The middle-most salary of the students who get placed through campus recruitment." },
  { Abbreviation: "GPHD", "Full Form": "Graduating Students opting for Ph.D.", "User-friendly Explanation": "The number of graduating students who choose to pursue a Ph.D. degree." },
  { Abbreviation: "RD", "Full Form": "Research Degree Students", "User-friendly Explanation": "Data related to the students enrolled in M.Tech, M.Phil, or Ph.D. programs." },
  { Abbreviation: "WD", "Full Form": "Women Diversity", "User-friendly Explanation": "The percentage of female students and faculty in the college." },
  { Abbreviation: "ESCS", "Full Form": "Economically & Socially Challenged Students", "User-friendly Explanation": "The representation of students from underprivileged backgrounds and the support they receive." },
  { Abbreviation: "PCS", "Full Form": "Perception", "User-friendly Explanation": "The college's reputation based on surveys of employers, peers, and academic experts." },
  { Abbreviation: "PR", "Full Form": "Public Perception", "User-friendly Explanation": "A measure of the college's public image and brand reputation." },
];

const getCaseInsensitiveData = (row: any, key: string) => {
  if (!row) return '';
  if (row[key] !== undefined && row[key] !== null) return row[key];
  const lowerKey = key.toLowerCase();
  const foundKey = Object.keys(row).find(k => k.toLowerCase() === lowerKey);
  if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) return row[foundKey];
  return '';
};

// --- NIRF VIEW COMPONENTS ---

const FullScreenNirfTable: React.FC<{
  nirfData: any[];
  groupedHeaders: { title: string; keys: string[] }[];
  nirfAbbreviations: Abbreviation[];
  toggleFullScreen: () => void;
}> = ({ nirfData, groupedHeaders, nirfAbbreviations, toggleFullScreen }) => {
  const fullScreenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (fullScreenRef.current && fullScreenRef.current.requestFullscreen) {
      fullScreenRef.current.requestFullscreen();
    }
  }, []);

  const renderCell = (row: any, key: string) => {
    if (key === 'PDF') {
      const val = getCaseInsensitiveData(row, key);
      if (val && val !== 'N/A') {
        return (
          <a href={val} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center space-x-2">
            <span>View</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6" /><path d="M10 14L21 3" /><path d="M7 21H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4" /><path d="M12 12v6h6" /></svg>
          </a>
        );
      }
    }
    if (key === 'Image') {
      const val = getCaseInsensitiveData(row, key);
      if (val && val !== 'N/A') {
        return (
          <a href={val} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center space-x-2">
            <span>Graph</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6" /><path d="M10 14L21 3" /><path d="M7 21H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4" /><path d="M12 12v6h6" /></svg>
          </a>
        );
      }
    }
    return getCaseInsensitiveData(row, key);
  };

  return (
    <div ref={fullScreenRef} className="fixed inset-0 z-[9999] bg-background flex flex-col overflow text-foreground">
      <div className="flex justify-between items-center bg-secondary p-4 shadow-md sticky top-0 z-10">
        <h2 className="text-2xl font-bold">NIRF Ranking Data</h2>
        <button
          onClick={toggleFullScreen}
          className="text-foreground text-3xl hover:text-primary transition-colors"
          aria-label="Exit Full Screen"
        >
          <MinimizeIcon size={32} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-modern bg-background">
        <div className="w-full overflow-x-auto rounded-lg border border-border mt-4">
          <table className="min-w-full text-sm text-left text-muted-foreground table-fixed border-collapse">
            <thead className="bg-secondary sticky top-0">
              <tr>
                {groupedHeaders.map((group, index) => (
                  <th
                    key={index}
                    colSpan={group.keys.length}
                    className={`text-center px-6 py-2 border-b-2 border-border text-foreground font-semibold ${index < groupedHeaders.length - 1 ? 'border-r' : ''
                      }`}
                  >
                    {group.title}
                  </th>
                ))}
              </tr>
              <tr>
                {groupedHeaders.flatMap(group => group.keys).map((key, hIndex) => (
                  <th
                    key={hIndex}
                    scope="col"
                    className={`px-6 py-3 whitespace-nowrap text-foreground bg-secondary/50 ${groupedHeaders.some((g, gIndex) => gIndex < groupedHeaders.length - 1 && g.keys[g.keys.length - 1] === key) ? 'border-r border-border' : ''
                      }`}
                  >
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {nirfData.map((row, rIndex) => (
                <tr key={rIndex} className="bg-card border-b border-border hover:bg-accent/10 transition-colors">
                  {groupedHeaders.flatMap(group => group.keys).map((key, cIndex) => (
                    <td
                      key={cIndex}
                      className={`px-6 py-4 whitespace-nowrap text-foreground ${groupedHeaders.some((g, gIndex) => gIndex < groupedHeaders.length - 1 && g.keys[g.keys.length - 1] === key) ? 'border-r border-border' : ''
                        }`}
                    >
                      {renderCell(row, key)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const SCROLL_OFFSET_TOP = 80;

const NirfSection: React.FC<{ nirfData: any }> = ({ nirfData }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const analyticsRef = useRef<HTMLDivElement>(null);

  const toggleFullScreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      setIsFullScreen(true);
    }
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullScreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  const formattedNirfData = useMemo(() => {
    if (!nirfData) return [];
    let dataToProcess = nirfData;
    if (nirfData.nirf_data_from_csv) {
      dataToProcess = nirfData.nirf_data_from_csv;
    }
    if (typeof dataToProcess !== 'object') return [];
    const dataWithYear = Object.entries(dataToProcess).map(([year, data]: [string, any]) => ({
      ...data,
      Year: year,
    }));
    return dataWithYear.reverse();
  }, [nirfData]);

  const groupedHeaders = useMemo(() => {
    return [
      { title: "", keys: ["Year"] },
      { title: "NIRF Parameters", keys: ["Score"] },
      { title: "TLR", keys: ["SS", "FSR", "FQE", "FRU"] },
      { title: "RP", keys: ["PU", "QP", "IPR", "FPPP"] },
      { title: "GO", keys: ["GPH", "GUE", "MS", "GPHD"] },
      { title: "OI", keys: ["RD", "WD", "ESCS", "PCS"] },
      { title: "PR", keys: ["PR"] },
      { title: "Additional Info", keys: ["PDF", "Image"] },
    ];
  }, []);

  if (!formattedNirfData || formattedNirfData.length === 0) {
    return (
      <section id="nirf" className="animate-fade-in p-6 bg-background rounded-xl shadow-lg border border-border">
        <h2 className="text-3xl font-bold text-foreground mb-6">NIRF Rankings</h2>
        <div className="p-8 text-center text-muted-foreground italic bg-card rounded-xl">
          No NIRF ranking data available.
        </div>
      </section>
    );
  }

  const renderCell = (row: any, key: string) => {
    if (key === 'PDF') {
      const val = getCaseInsensitiveData(row, key);
      if (val && val !== 'N/A') {
        return (
          <a href={val} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center space-x-2">
            <span>View PDF</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6" /><path d="M10 14L21 3" /><path d="M7 21H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4" /><path d="M12 12v6h6" /></svg>
          </a>
        );
      }
    }
    if (key === 'Image') {
      const val = getCaseInsensitiveData(row, key);
      if (val && val !== 'N/A') {
        return (
          <a href={val} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center space-x-2">
            <span>View Graph</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6" /><path d="M10 14L21 3" /><path d="M7 21H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4" /><path d="M12 12v6h6" /></svg>
          </a>
        );
      }
    }
    return getCaseInsensitiveData(row, key);
  };

  return (
    <>
      <style>
        {`
          .scrollbar-modern::-webkit-scrollbar { height: 8px; width: 8px; }
          .scrollbar-modern::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
          .scrollbar-modern::-webkit-scrollbar-thumb { background-color: #888; border-radius: 10px; border: 2px solid #f1f1f1; }
          .scrollbar-modern::-webkit-scrollbar-thumb:hover { background-color: #555; }
          .scrollbar-modern { scrollbar-width: thin; scrollbar-color: #888 #f1f1f1; }
        `}
      </style>
      <section id="nirf" className="animate-fade-in p-6 bg-background rounded-xl shadow-lg border border-border">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-foreground">NIRF Rankings</h2>
          <div className="flex items-center space-x-4">
            <button onClick={toggleFullScreen} className="flex items-center space-x-2 text-primary hover:text-primary-dark">
              {isFullScreen ? <MinimizeIcon size={18} /> : <MaximizeIcon size={18} />}
              <span>{isFullScreen ? 'Exit Full Screen' : 'Full Screen'}</span>
            </button>
          </div>
        </div>
        <div className={`overflow-x-auto rounded-lg shadow-md border border-border ${isFullScreen ? 'hidden' : ''} scrollbar-modern`}>
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-secondary">
              <tr>
                {groupedHeaders.map((group, index) => (
                  <th key={index} colSpan={group.keys.length} className={`text-center px-3 py-2 text-foreground font-semibold text-sm border-b border-border ${index < groupedHeaders.length - 1 ? 'border-r border-border' : ''}`}>
                    {group.title}
                  </th>
                ))}
              </tr>
              <tr>
                {groupedHeaders.flatMap(group => group.keys).map((key, hIndex) => {
                  const isLastKeyInGroup = groupedHeaders.some((g, gIndex) => gIndex < groupedHeaders.length - 1 && g.keys[g.keys.length - 1] === key);
                  return (
                    <th key={hIndex} className={`px-3 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider ${isLastKeyInGroup ? 'border-r border-border' : ''}`}>
                      {key}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border text-foreground">
              {formattedNirfData.map((row, rIndex) => (
                <tr key={rIndex}>
                  {groupedHeaders.flatMap(group => group.keys).map((key, cIndex) => {
                    const isLastKeyInGroup = groupedHeaders.some((g, gIndex) => gIndex < groupedHeaders.length - 1 && g.keys[g.keys.length - 1] === key);
                    return (
                      <td key={cIndex} className={`px-3 py-4 whitespace-nowrap text-sm text-muted-foreground ${isLastKeyInGroup ? 'border-r border-border' : ''}`}>
                        {renderCell(row, key)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <hr className="my-12 border-t-2 border-dashed border-border" />
      <div ref={analyticsRef}>
        <div className="p-4 bg-muted/20 border rounded text-center text-muted-foreground">Analytics Component Placeholder</div>
      </div>

      {isFullScreen && (
        <FullScreenNirfTable
          nirfData={formattedNirfData}
          groupedHeaders={groupedHeaders}
          nirfAbbreviations={nirfAbbreviations}
          toggleFullScreen={toggleFullScreen}
        />
      )}
    </>
  );
};

// --- NIRF EDITOR COMPONENT ---

const NirfEditor = ({ data, onChange }: { data: any, onChange: (newData: any) => void }) => {
  const hasCsvWrapper = data && typeof data === 'object' && 'nirf_data_from_csv' in data;
  const rawData = hasCsvWrapper ? data.nirf_data_from_csv : data;

  const [rows, setRows] = useState<any[]>(() => {
    if (!rawData || typeof rawData !== 'object') return [];
    return Object.entries(rawData).map(([year, values]: [string, any]) => ({
      ...values,
      Year: year,
    })).sort((a, b) => Number(b.Year) - Number(a.Year));
  });

  const groupedHeaders = [
    { title: "", keys: ["Year"] },
    { title: "NIRF Parameters", keys: ["Score"] },
    { title: "TLR", keys: ["SS", "FSR", "FQE", "FRU"] },
    { title: "RP", keys: ["PU", "QP", "IPR", "FPPP"] },
    { title: "GO", keys: ["GPH", "GUE", "MS", "GPHD"] },
    { title: "OI", keys: ["RD", "WD", "ESCS", "PCS"] },
    { title: "PR", keys: ["PR"] },
    { title: "Additional Info", keys: ["PDF", "Image"] },
  ];

  const updateParent = (newRows: any[]) => {
    const newObject: any = {};
    // Ensure the new rows are stored by year, and most recent year first (or user's current sort order)
    newRows.forEach(row => {
      const { Year, ...rest } = row;
      if (Year) {
        newObject[Year] = rest;
      }
    });

    if (hasCsvWrapper) {
      onChange({ ...data, nirf_data_from_csv: newObject });
    } else {
      onChange(newObject);
    }
  };

  const handleChange = (index: number, key: string, value: string) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [key]: value };
    setRows(newRows);
    updateParent(newRows);
  };

  const addRow = () => {
    const currentYear = new Date().getFullYear();
    // Use the maximum year + 1 for the new entry's year
    const maxYear = rows.length > 0 ? Math.max(...rows.map(row => Number(row.Year)).filter(y => !isNaN(y))) : currentYear - 1;
    const newYear = (maxYear + 1).toString();

    const newRow = {
      Year: newYear, Score: "", SS: "", FSR: "", FQE: "", FRU: "", PU: "", QP: "", IPR: "", FPPP: "",
      GPH: "", GUE: "", MS: "", GPHD: "", RD: "", WD: "", ESCS: "", PCS: "", PR: "", PDF: "", Image: ""
    };

    // New row is inserted at the start, then sorted by Year desc
    const newRows = [newRow, ...rows].sort((a, b) => Number(b.Year) - Number(a.Year));
    setRows(newRows);
    updateParent(newRows);
  };

  const deleteRow = (index: number) => {
    if (confirm("Are you sure you want to delete this year's data?")) {
      const newRows = rows.filter((_, i) => i !== index);
      setRows(newRows);
      updateParent(newRows);
    }
  };

  return (
    <div className="space-y-4 overflow-hidden">
      <div className="flex justify-end mb-2">
        <Button size="sm" onClick={addRow} variant="outline">
          <IconPlus className="h-4 w-4 mr-2" /> Add Year (Newest First)
        </Button>
      </div>

      <div className="w-full overflow-x-auto rounded-lg border border-border scrollbar-modern">
        <table className="w-full table-fixed divide-y divide-border">

          <thead className="bg-secondary">
            <tr>
              <th className="w-10 px-2 bg-secondary sticky left-0 z-10"></th>
              {groupedHeaders.map((group, index) => (
                <th key={index} colSpan={group.keys.length} className={`text-center px-3 py-2 text-foreground font-semibold text-sm border-b border-border ${index < groupedHeaders.length - 1 ? 'border-r border-border' : ''}`}>
                  {group.title}
                </th>
              ))}
              <th className="w-10 px-2 border-b border-border"></th>
            </tr>
            <tr>
              <th className="w-10 px-2 bg-secondary sticky left-0 z-10"></th>
              {groupedHeaders.flatMap(group => group.keys).map((key, hIndex) => {
                const isLastKeyInGroup = groupedHeaders.some((g, gIndex) => gIndex < groupedHeaders.length - 1 && g.keys[g.keys.length - 1] === key);
                return (
                  <th key={hIndex} className={`px-2 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider min-w-[100px] ${isLastKeyInGroup ? 'border-r border-border' : ''}`}>
                    {key}
                  </th>
                );
              })}
              <th className="w-10 px-2"></th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border text-foreground">
            {rows.map((row, rIndex) => (
              <tr key={rIndex} className="hover:bg-muted/50">
                <td className="px-2 py-2 text-center text-xs text-muted-foreground bg-card sticky left-0 z-10 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  {rIndex + 1}
                </td>
                {groupedHeaders.flatMap(group => group.keys).map((key, cIndex) => {
                  const isLastKeyInGroup = groupedHeaders.some((g, gIndex) => gIndex < groupedHeaders.length - 1 && g.keys[g.keys.length - 1] === key);
                  // Find the value using case insensitive helper logic for initial render
                  const val = getCaseInsensitiveData(row, key);

                  return (
                    <td key={cIndex} className={`px-1 py-1 ${isLastKeyInGroup ? 'border-r border-border' : ''}`}>
                      <Input
                        value={val}
                        onChange={(e) => handleChange(rIndex, key, e.target.value)}
                        className="h-8 text-xs min-w-[80px] border-transparent hover:border-input focus:border-primary bg-transparent"
                        placeholder="-"
                      />
                    </td>
                  );
                })}
                <td className="px-2 py-2">
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-700" onClick={() => deleteRow(rIndex)}>
                    <IconTrash className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground mt-2">* Changes are synced. Click 'Save Changes' at the top of the page to persist.</p>
    </div>
  );
};

// --- SORTABLE HEADER COMPONENT (NEW) ---

interface SortableHeaderProps {
  colKey: string;
  deleteColumn: (colKey: string) => void;
}

const SortableHeader = ({ colKey, deleteColumn }: SortableHeaderProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: colKey });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    cursor: 'grab',
    position: 'relative' as const, // Ensure TH respects its position during drag
  };

  return (
    <TableHead
      ref={setNodeRef}
      style={style}
      className="whitespace-nowrap min-w-[200px] bg-muted/50 p-2"
    >
      <div className="flex items-center justify-between gap-2">
        {/* Combine listeners and attributes on a single div for drag handle */}
        <div {...attributes} {...listeners} className="flex items-center gap-2 h-full py-1">
            <IconGripVertical className="h-4 w-4 text-muted-foreground" />
            <span className="capitalize">
                {colKey.replace(/_/g, ' ')}
            </span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => deleteColumn(colKey)}>
          <IconTrash className="h-3 w-3 text-red-500" />
        </Button>
      </div>
    </TableHead>
  );
};

// --- SORTABLE ROW COMPONENT ---

interface SortableRowProps {
  row: any;
  rowIndex: number;
  id: string; // DnD required ID
  columns: string[];
  updateCell: (rowIndex: number, colKey: string, value: string) => void;
  deleteRow: (rowIndex: number) => void;
  addRow: (index: number) => void;
}

const SortableRow = ({ row, rowIndex, id, columns, updateCell, deleteRow, addRow }: SortableRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1, // Ensure dragged item is on top
    position: isDragging ? 'relative' as const : undefined,
    opacity: isDragging ? 0.6 : 1,
    background: isDragging ? 'hsl(var(--muted))' : undefined
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      {/* Drag Handle Column */}
      <TableCell className="w-[50px] whitespace-nowrap bg-muted/20 p-2 text-center cursor-grab touch-none sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" >
        <div {...attributes} {...listeners} className="flex justify-center items-center h-full text-muted-foreground hover:text-foreground">
          <IconGripVertical className="h-4 w-4" />
        </div>
      </TableCell>

      {/* Index Number */}
      <TableCell className="text-muted-foreground text-xs whitespace-nowrap w-[40px]">
        {rowIndex + 1}
      </TableCell>

      {/* Data Columns */}
      {columns.map(col => (
        <TableCell key={`${rowIndex}-${col}`} className="whitespace-nowrap p-2">
          <Input
            // Ensure we use the value for the *current* column key
            value={typeof row[col] === 'object' ? JSON.stringify(row[col]) : row[col] ?? ''}
            onChange={(e) => updateCell(rowIndex, col, e.target.value)}
            className="h-9 min-w-[180px]"
          />
        </TableCell>
      ))}

      {/* Actions */}
      <TableCell className="whitespace-nowrap">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <IconDotsVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => addRow(rowIndex)}>
              <IconArrowUp className="mr-2 h-4 w-4" /> Insert Above
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addRow(rowIndex + 1)}>
              <IconArrowDown className="mr-2 h-4 w-4" /> Insert Below
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => deleteRow(rowIndex)} className="text-red-600">
              <IconTrash className="mr-2 h-4 w-4" /> Delete Row
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

// --- Editable Table Component (Updated with DnD for Rows & Columns) ---

const EditableTable = ({ data, onChange }: { data: any[], onChange: (newData: any[]) => void }) => {
  // CRITICAL HYDRATION FIX: State to track if component is mounted client-side
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="text-center p-4 border border-dashed rounded-md">
        <p className="text-muted-foreground mb-2">Empty Table</p>
        <Button variant="outline" size="sm" onClick={() => onChange([{ "New Column": "" }])}>
          <IconPlus className="h-4 w-4 mr-2" /> Initialize Table
        </Button>
      </div>
    );
  }

  const isStandardTable = typeof data[0] === 'object' && data[0] !== null && !Array.isArray(data[0]) && !('cells' in data[0]);

  if (!isStandardTable) {
    return (
      <div className="p-4 border rounded-md bg-yellow-50 text-yellow-800">
        <p>Complex table format detected. Editing is limited to raw JSON for safety.</p>
        <Textarea
          value={JSON.stringify(data, null, 2)}
          onChange={(e) => {
            try {
              onChange(JSON.parse(e.target.value));
            } catch { }
          }}
          className="mt-2 font-mono text-xs min-h-[200px]"
        />
      </div>
    );
  }

  // State to manage column order
  const initialColumns = useMemo(() => Object.keys(data[0]), [data]);
  const [columns, setColumns] = useState<string[]>(initialColumns);

  // Sync columns state when external data prop changes (e.g., adding a new column via prompt/CSV)
  // This ensures new columns appear in the local state, but preserves the current order for existing ones.
  useEffect(() => {
      const currentDataKeys = Object.keys(data[0]);
      const currentSet = new Set(columns);
      const newKeys = currentDataKeys.filter(key => !currentSet.has(key));

      if (newKeys.length > 0 || currentDataKeys.length !== columns.length) {
          // If there are new keys, append them to the current order
          // If a column was deleted externally, filter it out.
          const filteredColumns = columns.filter(col => currentDataKeys.includes(col));
          setColumns([...filteredColumns, ...newKeys]);
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);


  // --- DnD Setup ---
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Prevent accidental drags
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const rowItems = useMemo(() => data.map((_, index) => `row-${index}`), [data]);
  const columnItems = useMemo(() => columns, [columns]);

  const handleRowDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = rowItems.indexOf(active.id as string);
      const newIndex = rowItems.indexOf(over.id as string);

      if (oldIndex !== -1 && newIndex !== -1) {
        onChange(arrayMove(data, oldIndex, newIndex));
      }
    }
  };

  const handleColumnDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = columnItems.indexOf(active.id as string);
      const newIndex = columnItems.indexOf(over.id as string);

      if (oldIndex !== -1 && newIndex !== -1) {
        // 1. Update the local column order state
        const newColumnOrder = arrayMove(columns, oldIndex, newIndex);
        setColumns(newColumnOrder);

        // 2. CRITICAL FIX: Recreate the data objects to ensure column order is reflected
        const newData = data.map(row => {
          const newRow: any = {};
          newColumnOrder.forEach(colKey => {
            // Use the value from the old row for the current column key
            newRow[colKey] = row[colKey];
          });
          return newRow;
        });

        // 3. Update parent state
        onChange(newData);
      }
    }
  };

  const updateCell = (rowIndex: number, colKey: string, value: string) => {
    const newData = [...data];
    newData[rowIndex] = { ...newData[rowIndex], [colKey]: value };
    onChange(newData);
  };

  const addRow = (index?: number) => {
    const newRow: any = {};
    // Use the current column order when creating a new row
    columns.forEach(col => newRow[col] = "");
    const newData = [...data];
    if (typeof index === 'number') {
      newData.splice(index, 0, newRow);
    } else {
      // **NEW ROW AT TOP**
      newData.splice(0, 0, newRow);
    }
    onChange(newData);
  };

  const deleteRow = (rowIndex: number) => {
    const newData = data.filter((_, i) => i !== rowIndex);
    onChange(newData);
  };

  const addColumn = () => {
    const name = prompt("Enter new column name:");
    if (name) {
      const newColKey = name.trim().replace(/\s+/g, '_');
      if (columns.includes(newColKey)) {
        alert("A column with this key already exists. Please choose a different name.");
        return;
      }
      
      // Update data structure first
      const newData = data.map(row => ({ ...row, [newColKey]: "" }));

      // Add to local columns state (to show in table immediately)
      setColumns([...columns, newColKey]);

      // Update parent data (This will trigger the useEffect to resync columns if needed)
      onChange(newData);
    }
  };

  const deleteColumn = (colKey: string) => {
    if (confirm(`Delete column "${colKey}"? This action cannot be undone.`)) {
      // 1. Remove from local column state
      setColumns(cols => cols.filter(c => c !== colKey));

      // 2. Remove the key from all rows in the data
      const newData = data.map(row => {
        const newRow = { ...row };
        delete newRow[colKey];
        return newRow;
      });
      // 3. Update parent data
      onChange(newData);
    }
  };
  
  // Render nothing or a fallback until client-side mount to prevent hydration error
  if (!isClient) {
    return (
        <div className="p-4 border rounded-md bg-muted/20 w-full text-muted-foreground flex items-center">
            <IconLoader className="animate-spin mr-2 h-4 w-4" /> Loading Table Editor...
        </div>
    );
  }

  return (
    <div className="space-y-2 w-full max-w-full">
      <div className="flex space-x-2 mb-2">
        <Button variant="outline" size="sm" onClick={() => addRow()}><IconPlus className="h-4 w-4 mr-2" /> Add Row (Top)</Button>
        <Button variant="outline" size="sm" onClick={addColumn}><IconTable className="h-4 w-4 mr-2" /> Add Column</Button>
      </div>

      <div className="w-full max-w-[85vw] md:max-w-[calc(100vw-250px)] overflow-x-auto rounded-lg border shadow-sm scrollbar-modern">
        <Table className="min-w-full w-max">
            {/* COLUMN DND CONTEXT */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleColumnDragEnd}
            >
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        {/* Static Columns */}
                        <TableHead className="w-[50px] whitespace-nowrap bg-muted/50 sticky left-0 z-20"></TableHead> {/* Drag Handle Header */}
                        <TableHead className="w-[50px] whitespace-nowrap bg-muted/50">#</TableHead>

                        {/* Sortable Columns */}
                        <SortableContext
                            items={columnItems}
                            strategy={horizontalListSortingStrategy}
                        >
                            {columns.map((col) => (
                                <SortableHeader
                                    key={col}
                                    colKey={col}
                                    deleteColumn={deleteColumn}
                                />
                            ))}
                        </SortableContext>
                        <TableHead className="w-[50px] whitespace-nowrap bg-muted/50"></TableHead> {/* Actions Header */}
                    </TableRow>
                </TableHeader>
            </DndContext>

            {/* ROW DND CONTEXT */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleRowDragEnd}
            >
                <TableBody>
                    <SortableContext
                        items={rowItems}
                        strategy={verticalListSortingStrategy}
                    >
                        {data.map((row, rowIndex) => (
                            <SortableRow
                                key={`row-${rowIndex}`}
                                id={`row-${rowIndex}`}
                                row={row}
                                rowIndex={rowIndex}
                                columns={columns} // Use the locally sorted column state
                                updateCell={updateCell}
                                deleteRow={deleteRow}
                                addRow={addRow}
                            />
                        ))}
                    </SortableContext>
                </TableBody>
            </DndContext>
        </Table>
      </div>
    </div>
  );
};

// --- Rich Editor Component ---
// MODIFIED to include Add Key and Delete Key for generic objects
const RichEditor = ({ data, onChange }: { data: any, onChange: (newData: any) => void }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [addKeyDialogOpen, setAddKeyDialogOpen] = useState(false);


  // This allows CSV upload inside existing tables, preserving the existing behavior
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const jsonData = await uploadFile(file);
      if (confirm(`This will replace the current content with data from ${file.name}. Continue?`)) {
        onChange(jsonData);
      }
    } catch (err: any) {
      alert(`Error processing file: ${err.message}`);
      console.error(err);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteKey = (keyToDelete: string) => {
    if (confirm(`Are you sure you want to delete the field "${keyToDelete}"?`)) {
        if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
            const newObject = { ...data };
            delete newObject[keyToDelete];
            onChange(newObject);
        }
    }
  };
  
  const handleAddKey = () => {
    if (!newKey.trim()) {
        alert("Key name is required.");
        return;
    }
    const finalKey = newKey.trim().toLowerCase().replace(/\s+/g, '_');
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
        if (data[finalKey]) {
            alert(`Key "${finalKey}" already exists.`);
            return;
        }

        let parsedValue: any = newValue;
        try {
            parsedValue = JSON.parse(newValue);
        } catch (e) {
            // Assume simple string if JSON parsing fails
            parsedValue = newValue; 
        }

        const newObject = {
            [finalKey]: parsedValue, // Add new key at the top
            ...data
        };
        onChange(newObject);
        setNewKey("");
        setNewValue("");
        setAddKeyDialogOpen(false);
    }
  };
  

  if (typeof data === 'string' || typeof data === 'number' || data === null) {
    return (
      <Textarea
        value={String(data ?? '')}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[100px]"
      />
    );
  }

  if (Array.isArray(data)) {
    const isTable = data.length > 0 && typeof data[0] === 'object' && data[0] !== null;

    if (isTable) {
      return (
        <div className="space-y-2">
          <div className="flex justify-end">
            <input type="file" accept=".csv, .xlsx" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
            <Button
              variant="outline"
              size="sm"
              className="text-green-600 border-green-200 hover:bg-green-50"
              onClick={() => fileInputRef.current?.click()}
            >
              <IconUpload className="h-4 w-4 mr-2" /> Replace with CSV/XLSX
            </Button>
          </div>
          <EditableTable data={data} onChange={onChange} />
        </div>
      );
    }

    // List Editor
    return (
      <div className="space-y-2">
        {data.map((item, idx) => (
          <div key={idx} className="flex gap-2 items-start">
            {typeof item === 'object' ? (
              <Textarea
                value={JSON.stringify(item, null, 2)}
                onChange={(e) => {
                  try {
                    const newData = [...data];
                    newData[idx] = JSON.parse(e.target.value);
                    onChange(newData);
                  } catch { }
                }}
                className="min-h-[60px] font-mono text-xs flex-1"
              />
            ) : (
              <Input
                value={String(item)}
                onChange={(e) => {
                  const newData = [...data];
                  newData[idx] = e.target.value;
                  onChange(newData);
                }}
                className="flex-1"
              />
            )}
            <Button variant="ghost" size="icon" onClick={() => {
              const newData = data.filter((_, i) => i !== idx);
              onChange(newData);
            }} className="mt-2 shrink-0">
              <IconTrash className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => onChange([...data, ""])}>
          <IconPlus className="h-4 w-4 mr-2" /> Add Item
        </Button>
      </div>
    );
  }

  // Object Editor (Used for Basic Info and generic nested objects)
  if (typeof data === 'object') {
    return (
      <div className="space-y-4 pl-4 border-l-2 border-muted">
        <Dialog open={addKeyDialogOpen} onOpenChange={setAddKeyDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full justify-start border-dashed">
                    <IconPlus className="h-4 w-4 mr-2" /> Add New Key-Value Field
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Field</DialogTitle>
                    <DialogDescription>
                        Add a new key-value pair to this group.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="newKey">Key Name (e.g., median_salary)</Label>
                        <Input id="newKey" value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="e.g., student_strength" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="newValue">Initial Value (Text or JSON)</Label>
                        <Textarea id="newValue" value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder="e.g., 1200 or [1, 2, 3]" className="min-h-[100px] font-mono text-xs" />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleAddKey}>Add Field</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="space-y-2 border p-3 rounded-md bg-background relative group">
            <div className="flex justify-between items-center mb-1">
              <Label className="capitalize font-semibold text-sm flex items-center">
                <IconKey className="h-3 w-3 mr-1 text-muted-foreground"/> {key.replace(/_/g, ' ')}
              </Label>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleDeleteKey(key)} 
                className="h-6 w-6 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <IconTrash className="h-3 w-3" />
              </Button>
            </div>
            <RichEditor
              data={value}
              onChange={(newValue) => onChange({ ...data, [key]: newValue })}
            />
          </div>
        ))}
      </div>
    );
  }

  return <div>Unsupported Data Type</div>;
};

// --- Helper Components ---

const Highlighter = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!highlight || !highlight.trim()) {
    return <span>{text}</span>;
  }
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? <mark key={i} className="bg-yellow-200 rounded px-0.5">{part}</mark> : part
      )}
    </span>
  );
};

// --- Render Display Component ---

const RenderDisplay = ({ data, highlight }: { data: any; highlight: string }) => {
  if (data === null || data === undefined) return null;

  try {
    if (typeof data === 'string' || typeof data === 'number') {
      return <p className="text-sm leading-relaxed"><Highlighter text={String(data)} highlight={highlight} /></p>;
    }

    if (Array.isArray(data)) {
      const isPlacementsFormat = data.length === 2 &&
        Array.isArray(data[0]) &&
        Array.isArray(data[1]) &&
        data[1].length > 0 &&
        'cells' in data[1][0];

      if (isPlacementsFormat) {
        const headers = data[0];
        const rows = data[1];

        return (
          <div className="w-full max-w-[85vw] md:max-w-[calc(100vw-250px)] overflow-x-auto rounded-lg border my-2">
            <Table className="min-w-full w-max">
              <TableHeader>
                <TableRow>
                  {headers.map((h: any, i: number) => (
                    <TableHead key={i} className="whitespace-nowrap font-bold">
                      <Highlighter text={String(h)} highlight={highlight} />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row: any, i: number) => (
                  <TableRow key={i}>
                    {row.cells && Array.isArray(row.cells) && row.cells.map((cell: any, j: number) => (
                      <TableCell key={j} className="whitespace-nowrap">
                        <Highlighter text={String(cell.text || '')} highlight={highlight} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );
      }

      const isTable = data.length > 0 && typeof data[0] === 'object' && !Array.isArray(data[0]);
      if (isTable) {
        const headers = Object.keys(data[0]);
        return (
          <div className="w-full max-w-[85vw] md:max-w-[calc(100vw-250px)] overflow-x-auto rounded-lg border my-2">
            <Table className="min-w-full w-max">
              <TableHeader>
                <TableRow>
                  {headers.map(h => <TableHead key={h} className="capitalize whitespace-nowrap"><Highlighter text={h.replace(/_/g, ' ')} highlight={highlight} /></TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, i) => (
                  <TableRow key={i}>
                    {headers.map(h => (
                      <TableCell key={`${i}-${h}`} className="whitespace-nowrap">
                        {typeof row[h] === 'object' ? JSON.stringify(row[h]) : <Highlighter text={String(row[h])} highlight={highlight} />}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );
      }

      return (
        <ul className="list-disc list-inside space-y-1 pl-2">
          {data.map((item, i) => (
            <li key={i}><Highlighter text={String(item)} highlight={highlight} /></li>
          ))}
        </ul>
      );
    }

    if (typeof data === 'object') {
      return (
        <div className="flex flex-col space-y-4 w-full max-w-full">
          {Object.entries(data).map(([k, v]) => (
            <Card key={k} className="w-full max-w-full overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium capitalize text-muted-foreground">
                  <Highlighter text={k.replace(/_/g, ' ')} highlight={highlight} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RenderDisplay data={v} highlight={highlight} />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }
  } catch (e) {
    return null;
  }
  return null;
};

// --- Section Creator & CsvSectionUploader ---

// FIX 4: Updated CsvSectionUploader prop type definition
const CsvSectionUploader = ({ onUpload, defaultFilter, tabName }: { onUpload: (parentKey: string, sectionTitle: string, data: any) => void, defaultFilter?: string, tabName: string }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filterName, setFilterName] = useState(defaultFilter || "");

  // Update local state if prop changes
  useEffect(() => {
    if (defaultFilter) setFilterName(defaultFilter);
  }, [defaultFilter]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // 1. Upload to backend with Filter
      const jsonData = await uploadFile(file, filterName);

      // 2. Prompt for a section title (the key)
      const defaultTitle = file.name.replace(/\.(csv|xlsx?)$/i, '').replace(/\s+/g, '_').toLowerCase();
      const title = prompt("Enter a Title for this new Table Section:", defaultTitle);

      if (title && title.trim()) {
        // We now pass both the tab name and the section title
        onUpload(tabName, title.trim().toLowerCase().replace(/\s+/g, '_'), jsonData);
      }
    } catch (err: any) {
      alert(`Error uploading file: ${err.message}`);
      console.error(err);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="mb-6 p-4 border-2 border-dashed border-primary/20 rounded-lg bg-primary/5 flex flex-col items-center justify-center gap-4">
      <div className="text-center">
        <h3 className="font-semibold text-primary">Import Data Table</h3>
        <p className="text-sm text-muted-foreground">Upload a CSV or XLSX to create a new section.</p>
      </div>

      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input
          type="text"
          placeholder="Filter by Institute Name (Optional)"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          className="bg-background"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="gap-2 shrink-0"
        >
          <IconUpload className="h-4 w-4" /> Upload
        </Button>
      </div>

      <input
        type="file"
        accept=".csv, .xlsx"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

// FIX 1: Updated SectionCreator prop type definition
const SectionCreator = ({ onAdd, tabName }: { onAdd: (parentKey: string, sectionTitle: string, type: 'text' | 'list' | 'table' | 'group', content: any) => void, tabName: string }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<'text' | 'list' | 'table' | 'group'>("text");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (type === 'text') setContent("");
    if (type === 'list') setContent('[]');
    if (type === 'table') setContent('[{"col1": ""}]');
    if (type === 'group') setContent('{"new_field": ""}');
  }, [type]);

  const handleAdd = () => {
    if (!title.trim()) {
      alert("Section Title is required");
      return;
    }

    let parsedContent: any = content;
    try {
      if (type !== 'text') {
        parsedContent = JSON.parse(content);
      }
    } catch (e) {
      alert("Invalid JSON format for content");
      return;
    }

    // Pass the tab name as the potential parent key and the title as the section key
    onAdd(tabName, title.trim().toLowerCase().replace(/\s+/g, '_'), type, parsedContent);
    setOpen(false);
    setTitle("");
    setType("text");
    setContent("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full border-dashed">
          <IconPlus className="h-4 w-4 mr-2" /> Add New Section Manually
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Section</DialogTitle>
          <DialogDescription>Create a new content block in this tab.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Section Title <span className="text-red-500">*</span></Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Campus Life" />
          </div>
          <div className="space-y-2">
            <Label>Content Type</Label>
            <Select value={type} onValueChange={(v: any) => setType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text"><div className="flex items-center"><IconAlignLeft className="mr-2 h-4 w-4" /> Paragraph</div></SelectItem>
                <SelectItem value="list"><div className="flex items-center"><IconList className="mr-2 h-4 w-4" /> List</div></SelectItem>
                <SelectItem value="table"><div className="flex items-center"><IconTable className="mr-2 h-4 w-4" /> Table</div></SelectItem>
                <SelectItem value="group"><div className="flex items-center"><IconFolder className="mr-2 h-4 w-4" /> Key-Value Group (Try to merge into parent)</div></SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Initial Content {type !== 'text' && '(JSON)'}</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="font-mono text-xs min-h-[100px]"
              placeholder={type === 'text' ? "Enter text content..." : "Enter JSON structure..."}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleAdd}>Create Section</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const EditableSection = ({
  title,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onRename, // New prop for renaming title
  children,
  editComponent
}: {
  title?: string,
  isEditing: boolean,
  onEdit: () => void,
  onSave: () => void,
  onCancel: () => void,
  onDelete?: () => void,
  onRename?: (newTitle: string) => void,
  children: React.ReactNode,
  editComponent: React.ReactNode
}) => {
  const handleRenameClick = () => {
    if (onRename && title) {
      const newTitle = prompt("Rename Section Title:", title);
      if (newTitle && newTitle !== title) {
        onRename(newTitle.trim().replace(/\s+/g, '_'));
      }
    }
  };

  return (
    <div className="relative group mb-6 w-full max-w-full overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {title && <h3 className="text-lg font-semibold capitalize">{title.replace(/_/g, ' ')}</h3>}
          {onRename && !isEditing && (
            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground" onClick={handleRenameClick} title="Rename Section">
              <IconPencil className="h-3 w-3" />
            </Button>
          )}
        </div>
        {!isEditing ? (
          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <IconEdit className="h-4 w-4 mr-2" /> Edit
            </Button>
            {onDelete && (
              <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-500 hover:text-red-700">
                <IconTrash className="h-4 w-4 mr-2" /> Delete
              </Button>
            )}
          </div>
        ) : (
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <IconX className="h-4 w-4 mr-2" /> Cancel
            </Button>
            <Button variant="default" size="sm" onClick={onSave}>
              <IconCheck className="h-4 w-4 mr-2" /> Save
            </Button>
          </div>
        )}
      </div>
      {isEditing ? (
        <div className="p-4 border rounded-md bg-muted/20 w-full max-w-full overflow-hidden">
          {editComponent}
        </div>
      ) : (
        <div className="w-full max-w-full overflow-hidden">
          {children}
        </div>
      )}
    </div>
  );
};

// --- Main Page Component ---

export default function CollegeEditPage({ params }: CollegeEditPageProps) {
  const router = useRouter();
  const [resolvedParams, setResolvedParams] = useState<{ id: string; type: string } | null>(null);
  const [fullData, setFullData] = useState<FullData | null>(null);
  const [basicData, setBasicData] = useState<CollegeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');

  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [tempData, setTempData] = useState<any>(null);

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setResolvedParams(resolved);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!resolvedParams) return;
    const fetchData = async () => {
      try {
        const res = await fetch(`https://josaa-admin-backend-1.onrender.com/api/college/${resolvedParams.id}/${resolvedParams.type}`);
        if (!res.ok) throw new Error("Failed");
        const data: BackendResponse = await res.json();
        console.log("data added newly", data);
        setFullData(data.full_data);
        setBasicData(data.basic_data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [resolvedParams]);

  const handleUpdate = async () => {
    if (!fullData || !basicData || !resolvedParams) return;
    setIsUpdating(true);
    try {
      await fetch(`https://josaa-admin-backend-1.onrender.com/api/college/${resolvedParams.id}/${resolvedParams.type}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ college_name: basicData.Name, full_data: fullData, basic_data: basicData })
      });
      alert("Data Updated Successfully!");
    } catch (e) {
      alert("Error saving");
    } finally {
      setIsUpdating(false);
    }
  };

  const recursiveReplace = (obj: any, search: string, replace: string): any => {
    if (typeof obj === 'string') return obj.replaceAll(search, replace);
    if (Array.isArray(obj)) return obj.map(item => recursiveReplace(item, search, replace));
    if (typeof obj === 'object' && obj !== null) {
      const newObj: any = {};
      for (const key in obj) newObj[key] = recursiveReplace(obj[key], search, replace);
      return newObj;
    }
    return obj;
  };

  const handleReplaceAll = () => {
    if (!searchTerm || !fullData || !basicData) return;
    if (confirm(`Replace all "${searchTerm}" with "${replaceTerm}"?`)) {
      setFullData(recursiveReplace(fullData, searchTerm, replaceTerm));
      setBasicData(recursiveReplace(basicData, searchTerm, replaceTerm));
    }
  };

  const startEditing = (section: string, data: any) => {
    setEditingSection(section);
    // Use deep copy to prevent direct state modification before saving
    setTempData(JSON.parse(JSON.stringify(data)));
  };

  const saveEditing = (section: string) => {
    // Check if section is a nested key (e.g., "about/banner_section")
    if (section.includes('/')) {
        const [parentKey, nestedKey] = section.split('/');
        setFullData(prev => {
            if (!prev) return prev;
            // Merge the saved data back into the parent object
            const newParentData = { ...prev[parentKey], [nestedKey]: tempData };
            return { ...prev, [parentKey]: newParentData };
        });
    }
    // Handle top-level and basic data
    else if (section === 'basic') setBasicData(tempData);
    else setFullData(prev => prev ? ({ ...prev, [section]: tempData }) : prev);
    
    setEditingSection(null);
    setTempData(null);
  };

  const handleDeleteSection = (key: string) => {
    if (confirm(`Are you sure you want to delete the section "${key}"? This action cannot be undone.`)) {
      // Handle nested deletion (e.g., delete 'banner_section' from 'about')
      if (key.includes('/')) {
          const [parentKey, nestedKey] = key.split('/');
          setFullData(prev => {
              if (!prev || !prev[parentKey]) return prev;
              const newParentData = { ...prev[parentKey] };
              delete newParentData[nestedKey];
              return { ...prev, [parentKey]: newParentData };
          });
      } else {
        // Handle top-level deletion
        setFullData(prev => {
          if (!prev) return null;
          const newData = { ...prev };
          delete newData[key];
          return newData;
        });
      }
    }
  };

  // Logic to rename a section key (Title)
  const handleRenameSection = (oldKey: string, newKey: string) => {
    if (oldKey === newKey) return;
    
    // Handle nested rename (e.g., rename 'testing' inside 'seat_matrix')
    if (oldKey.includes('/')) {
        const [parentKey, oldNestedKey] = oldKey.split('/');
        const newNestedKey = newKey; // newKey is the clean title provided by the prompt/rename function
        
        setFullData(prev => {
            if (!prev || !prev[parentKey] || prev[parentKey][newNestedKey]) {
                if (prev && prev[parentKey] && prev[parentKey][newNestedKey]) {
                    alert("A nested field with this new name already exists.");
                }
                return prev;
            }

            const parentData = prev[parentKey];
            // Ensure data structure order is maintained by modifying keys within the parent object
            const entries: [string, any][] = Object.entries(parentData);
            const index = entries.findIndex(([k]) => k === oldNestedKey);
            if (index === -1) return prev;

            entries[index] = [newNestedKey, parentData[oldNestedKey]]; 
            const newParentData = Object.fromEntries(entries);
            return { ...prev, [parentKey]: newParentData };
        });
        return; 
    }

    // Handle top-level rename
    setFullData(prev => {
      if (!prev) return null;
      if (prev[newKey]) {
        alert("A section with this name already exists.");
        return prev;
      }
      
      const entries: [string, any][] = Object.entries(prev) as [string, any][];
      const index = entries.findIndex(([k]) => k === oldKey);
      if (index === -1) return prev;

      entries[index] = [newKey, prev[oldKey]]; 
      return Object.fromEntries(entries);
    });
  };

  // UPDATED: Handle manually added sections
  const handleAddSection = (parentKey: string, sectionTitle: string, type: 'text' | 'list' | 'table' | 'group', content: any) => {
    setFullData(prev => {
      if (!prev) return { [parentKey]: { [sectionTitle]: content } };

      let currentFullData = { ...prev }; // Copy full data

      // 1. Check if the parent key is a TAB name that should act as an object container
      const isTabContainer = ['about', 'courses', 'seat_matrix', 'ranking'].includes(parentKey);

      if (isTabContainer) {
          // Ensure the parent key exists and is an object, or initialize it as an empty object
          if (typeof currentFullData[parentKey] !== 'object' || currentFullData[parentKey] === null || Array.isArray(currentFullData[parentKey])) {
              currentFullData[parentKey] = {};
          }
          
          // New data should be prepended as a sub-key within the parent object (tab container)
          const existingChildren = currentFullData[parentKey] || {};
          const newParentValue = { 
              [sectionTitle]: content, 
              ...existingChildren 
          };

          return {
              ...currentFullData,
              [parentKey]: newParentValue
          };
      }
      
      // Fallback: Create a new scoped top-level key (e.g., 'courses_new_section')
      const newKey = `${parentKey}_${sectionTitle}`;
      const entries: [string, any][] = Object.entries(currentFullData) as [string, any][];
      const parentIndex = entries.findIndex(([k]) => k === parentKey);
      
      const newEntries = [...entries];
      const newContentEntry: [string, any] = [newKey, content];
      
      // Insert after the tab's primary content if it exists, otherwise just push to the end/start.
      if (parentIndex !== -1) {
          newEntries.splice(parentIndex + 1, 0, newContentEntry);
      } else {
          newEntries.push(newContentEntry);
      }

      return Object.fromEntries(newEntries);
    });
  };

  // UPDATED: Handle CSV uploads
  const handleCsvSectionAdd = (parentKey: string, sectionTitle: string, data: any) => {
    setFullData(prev => {
      if (!prev) return { [parentKey]: { [sectionTitle]: data } };

      let currentFullData = { ...prev }; // Copy full data

      // 1. Check if the parent key is a TAB name that should act as an object container
      const isTabContainer = ['about', 'courses', 'seat_matrix', 'ranking'].includes(parentKey);

      if (isTabContainer) {
          // Ensure the parent key exists and is an object, or initialize it as an empty object
          if (typeof currentFullData[parentKey] !== 'object' || currentFullData[parentKey] === null || Array.isArray(currentFullData[parentKey])) {
              currentFullData[parentKey] = {};
          }
          
          // New data should be prepended as a sub-key within the parent object (tab container)
          const existingChildren = currentFullData[parentKey] || {};
          const newParentValue = { 
              [sectionTitle]: data, 
              ...existingChildren
          };

          return {
              ...currentFullData,
              [parentKey]: newParentValue
          };
      }
      
      // Fallback: Create a new scoped top-level key, and prepend it.
      const newKey = `${parentKey}_${sectionTitle}`;
      
      if (currentFullData[newKey]) {
        // If key exists, append a timestamp and prepend it.
        const timestampedKey = `${newKey}_${Date.now()}`;
        return { [timestampedKey]: data, ...currentFullData };
      }
      
      // Prepend new data to show first in the list
      return { [newKey]: data, ...currentFullData };
    });
  };

  if (loading || !fullData || !basicData) return <PageContainer><IconLoader className="animate-spin" /></PageContainer>;

  return (
    <PageContainer>
      <div className="flex-1 flex-col space-y-6 flex-1 flex-col space-y-6 min-h-screen  overflow-hidden">
        <div className="flex min-w-0 md:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Edit College: {basicData.Name}</h1>
          </div>
          <div className="flex space-x-2">
            <Link href="/admin/colleges"><Button variant="outline">Cancel</Button></Link>
            <Button onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating ? <IconLoader className="animate-spin mr-2" /> : <IconCheck className="mr-2" />} Save Changes
            </Button>
          </div>
        </div>
        <Separator />

        <Card className="bg-muted/30">
          <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-end">
            <div className="grid w-full max-w-sm gap-1.5">
              <Label>Search</Label>
              <div className="relative"><IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-8" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
            </div>
            <div className="grid w-full max-w-sm gap-1.5">
              <Label>Replace</Label>
              <div className="relative"><IconReplace className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-8" value={replaceTerm} onChange={e => setReplaceTerm(e.target.value)} /></div>
            </div>
            <Button onClick={handleReplaceAll} disabled={!searchTerm}>Replace All</Button>
          </CardContent>
        </Card>

        <EditableSection
          title="Basic Information"
          isEditing={editingSection === 'basic'}
          onEdit={() => startEditing('basic', basicData)}
          onSave={() => saveEditing('basic')}
          onCancel={() => setEditingSection(null)}
          editComponent={<RichEditor data={tempData} onChange={setTempData} />}
        >
          <Card>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(basicData).map(([k, v]) => (
                <div key={k}>
                  <Label className="text-xs text-muted-foreground uppercase">{k}</Label>
                  <div className="font-medium"><Highlighter text={String(v)} highlight={searchTerm} /></div>
                </div>
              ))}
            </CardContent>
          </Card>
        </EditableSection>

        <div className="w-full max-w-full">
          <Tabs defaultValue="about" className="w-full">
            <div className="overflow-x-auto pb-2 w-full">
              <TabsList className="w-full min-w-[400px] grid grid-cols-5">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="courses">Courses</TabsTrigger>
                <TabsTrigger value="seat_matrix">Seat Matrix</TabsTrigger>
                <TabsTrigger value="ranking">Ranking</TabsTrigger>
                <TabsTrigger value="nirf">NIRF</TabsTrigger>
              </TabsList>
            </div>

            {['about', 'courses', 'seat_matrix', 'ranking', 'nirf'].map(tab => {
              
              const relevantKeys = Object.keys(fullData).filter(key => 
                key === tab || key.startsWith(`${tab}_`)
              );

              // Determines if the primary key for the tab (e.g., 'about', 'ranking') is a container object
              const isTabContainer = ['about', 'courses', 'seat_matrix', 'ranking'].includes(tab) && 
                                     fullData[tab] && 
                                     typeof fullData[tab] === 'object' && 
                                     !Array.isArray(fullData[tab]); 
              
              const isNirfTab = tab === 'nirf';
              const nirfData = fullData['nirf'];

              let sectionsToRender: { key: string; value: any; isNested: boolean; parentKey?: string; }[] = [];

              if (isTabContainer) {
                // Case 1: The primary tab key is an object container. Break out its children.
                Object.entries(fullData[tab]).forEach(([nestedKey, nestedValue]) => {
                  sectionsToRender.push({
                    key: `${tab}/${nestedKey}`, // Composite key
                    value: nestedValue,
                    isNested: true,
                    parentKey: tab,
                  });
                });
              }

              // Case 2: Other relevant keys (custom sections)
              relevantKeys.forEach(key => {
                // Skip the primary container key if we just broke it out (Case 1)
                if (key === tab && isTabContainer) return; 
                
                // Skip the primary NIRF key if it's the NIRF tab (handled separately below)
                if (key === 'nirf' && isNirfTab) return;

                sectionsToRender.push({
                  key: key,
                  value: fullData[key],
                  isNested: false,
                });
              });


              return (
                <TabsContent key={tab} value={tab} className="space-y-4 mt-4 w-full max-w-full">

                  {/* --- CSV UPLOADER --- */}
                  <CsvSectionUploader onUpload={handleCsvSectionAdd} defaultFilter={basicData.Name} tabName={tab} />

                  {/* --- RENDER NIRF SECTION (Special Case) --- */}
                  {isNirfTab && nirfData && (
                    <EditableSection
                      key={'nirf'}
                      title={'NIRF'}
                      isEditing={editingSection === 'nirf'}
                      onEdit={() => startEditing('nirf', nirfData)}
                      onSave={() => saveEditing('nirf')}
                      onCancel={() => setEditingSection(null)}
                      onDelete={() => handleDeleteSection('nirf')}
                      onRename={(newTitle: string) => handleRenameSection('nirf', newTitle)} 
                      editComponent={<NirfEditor data={tempData} onChange={setTempData} />}
                    >
                      <NirfSection nirfData={nirfData} />
                    </EditableSection>
                  )}


                  {/* --- RENDER ALL OTHER SECTIONS (Including Broken-Out Sub-Keys) --- */}
                  {sectionsToRender.map(section => {
                    const displayTitle = section.isNested ? section.key.split('/')[1] : 
                                         section.key.startsWith(`${tab}_`) ? section.key.replace(`${tab}_`, '') : 
                                         section.key;
                    
                    return (
                      <EditableSection
                        key={section.key}
                        title={displayTitle}
                        isEditing={editingSection === section.key}
                        onEdit={() => startEditing(section.key, section.value)}
                        onSave={() => saveEditing(section.key)}
                        onCancel={() => setEditingSection(null)}
                        onDelete={() => handleDeleteSection(section.key)}
                        onRename={(newTitle: string) => handleRenameSection(section.key, newTitle)} 
                        editComponent={<RichEditor data={tempData} onChange={setTempData} />}
                      >
                        <RenderDisplay data={section.value} highlight={searchTerm} />
                      </EditableSection>
                    );
                  })}

                  <Separator className="my-4" />
                  <SectionCreator onAdd={handleAddSection} tabName={tab} />
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </div>
    </PageContainer>
  );
}
