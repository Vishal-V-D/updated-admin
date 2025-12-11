
"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
    Upload, X, Download, Search, Filter, BarChart3, PieChart, LineChart,
    Table2, Trash2, Plus, ChevronDown, ArrowUpDown, SlidersHorizontal,
    Settings2, FileSpreadsheet, Check, Maximize2, Minimize2,
    Calculator, Activity, TrendingUp, Split, AreaChart as AreaIcon,
    ScatterChart as ScatterIcon, LayoutGrid
} from 'lucide-react';
import {
    BarChart, Bar, LineChart as RechartsLine, Line, PieChart as RechartsPie,
    Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area, ScatterChart, Scatter, Treemap
} from 'recharts';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import PageContainer from '@/components/layout/page-container';

// --- Theme & UI Components ---


const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`rounded-xl border border-border bg-card text-card-foreground shadow-sm ${className}`}>
        {children}
    </div>
);

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'default' | 'sm' | 'icon';

const Button = ({ children, onClick, variant = 'primary', size = 'default', className = "", disabled = false, title = "" }: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: ButtonVariant;
    size?: ButtonSize;
    className?: string;
    disabled?: boolean;
    title?: string;
}) => {
    const base = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    const variants: Record<ButtonVariant, string> = {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    };

    const sizes: Record<ButtonSize, string> = {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        icon: "h-10 w-10",
    };

    return (
        <button onClick={onClick} disabled={disabled} title={title} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>
            {children}
        </button>
    );
};

// Custom Range Slider Component
const RangeSlider = ({ min, max, value, onChange }: {
    min: number;
    max: number;
    value: [number, number] | null;
    onChange: (val: [number, number]) => void;
}) => {
    const [minVal, maxVal] = value || [min, max];
    const range = max - min;
    const getPercent = (value: number) => range === 0 ? 0 : Math.round(((value - min) / range) * 100);

    return (
        <div className="pt-4 pb-2 px-3 relative">
            <div className="flex justify-between text-xs text-muted-foreground mb-2 font-mono">
                <span>{minVal}</span>
                <span>{maxVal}</span>
            </div>
            <div className="relative h-2 rounded-full bg-secondary">
                {/* Active range highlight */}
                <div
                    className="absolute h-full bg-primary rounded-full opacity-50"
                    style={{
                        left: `${getPercent(minVal)}%`,
                        right: `${100 - getPercent(maxVal)}%`
                    }}
                />

                {/* Min value slider */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={minVal}
                    onChange={(e) => {
                        const v = Math.min(Number(e.target.value), maxVal - 1);
                        onChange([v, maxVal]);
                    }}
                    className="absolute w-full h-full opacity-0 cursor-pointer pointer-events-none z-20 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:appearance-none [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:appearance-none"
                />

                {/* Max value slider */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={maxVal}
                    onChange={(e) => {
                        const v = Math.max(Number(e.target.value), minVal + 1);
                        onChange([minVal, v]);
                    }}
                    className="absolute w-full h-full opacity-0 cursor-pointer pointer-events-none z-20 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:appearance-none [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:appearance-none"
                />

                {/* Min thumb visualization - REMOVED transition-all for instant drag response */}
                <div
                    className="absolute w-4 h-4 bg-primary rounded-full -top-1 shadow-lg border-2 border-background pointer-events-none z-10"
                    style={{ left: `calc(${getPercent(minVal)}% - 8px)` }}
                />

                {/* Max thumb visualization - REMOVED transition-all for instant drag response */}
                <div
                    className="absolute w-4 h-4 bg-primary rounded-full -top-1 shadow-lg border-2 border-background pointer-events-none z-10"
                    style={{ left: `calc(${getPercent(maxVal)}% - 8px)` }}
                />
            </div>
        </div>
    );
};

const Modal = ({ isOpen, onClose, title, children, size = "md" }: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'md' | 'lg';
}) => {
    if (!isOpen) return null;
    const maxWidth = size === 'lg' ? 'max-w-4xl' : 'max-w-lg';
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
            <div className={`relative w-full ${maxWidth} bg-card text-card-foreground border border-border shadow-2xl rounded-xl flex flex-col max-h-[90vh] animate-in zoom-in-95`}>
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h2 className="text-xl font-bold tracking-tight">{title}</h2>
                    <button onClick={onClose} className="opacity-70 hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-secondary">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

// --- Filter Builder Component ---

const FilterBuilder = ({ headers, data, onAddFilter, onCancel }: {
    headers: string[];
    data: any[];
    onAddFilter: (type: string, col: string, val: string, val2: string) => void;
    onCancel: () => void;
}) => {
    const [selectedColumn, setSelectedColumn] = useState(headers[0] || '');
    const [selectedType, setSelectedType] = useState('contains');
    const [value1, setValue1] = useState('');
    const [value2, setValue2] = useState('');

    const filterTypes = [
        {
            category: 'Text Filters',
            types: [
                { v: 'contains', l: 'Contains', needsValue: true },
                { v: 'notcontains', l: 'Does Not Contain', needsValue: true },
                { v: 'eq', l: 'Equals', needsValue: true },
                { v: 'neq', l: 'Not Equals', needsValue: true },
                { v: 'starts', l: 'Starts With', needsValue: true },
                { v: 'ends', l: 'Ends With', needsValue: true },
                { v: 'regex', l: 'Regex Pattern', needsValue: true },
                { v: 'in', l: 'Is In List (comma-separated)', needsValue: true },
            ]
        },
        {
            category: 'Number Filters',
            types: [
                { v: 'gt', l: 'Greater Than (>)', needsValue: true },
                { v: 'lt', l: 'Less Than (<)', needsValue: true },
                { v: 'range', l: 'Between (Range)', needsValue: 'range' },
            ]
        },
        {
            category: 'Data Quality',
            types: [
                { v: 'empty', l: 'Is Empty', needsValue: false },
                { v: 'notempty', l: 'Not Empty', needsValue: false },
            ]
        }
    ];

    // Get unique values for the selected column (for suggestions)
    const uniqueValues = useMemo(() => {
        if (!selectedColumn || !data.length) return [];
        const values = Array.from(new Set(data.map(row => String(row[selectedColumn] || ''))));
        return values.filter(v => v.trim()).slice(0, 50);
    }, [selectedColumn, data]);

    const currentFilterType = filterTypes
        .flatMap(cat => cat.types)
        .find(t => t.v === selectedType);

    const handleAdd = () => {
        if (!selectedColumn) return;

        // For filters that don't need values
        if (currentFilterType?.needsValue === false) {
            onAddFilter(selectedType, selectedColumn, '', '');
            return;
        }

        // For range filters
        if (currentFilterType?.needsValue === 'range') {
            if (!value1 || !value2) {
                alert('Please enter both min and max values for range filter');
                return;
            }
            onAddFilter(selectedType, selectedColumn, value1, value2);
            return;
        }

        // For regular filters
        if (!value1) {
            alert('Please enter a filter value');
            return;
        }

        onAddFilter(selectedType, selectedColumn, value1, value2);
    };

    return (
        <div className="space-y-6">
            {/* Step 1: Select Column */}
            <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                    Select Column to Filter
                </label>
                <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={selectedColumn}
                    onChange={(e) => setSelectedColumn(e.target.value)}
                >
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
            </div>

            {/* Step 2: Select Filter Type */}
            <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                    Select Filter Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {filterTypes.map((category, idx) => (
                        <div key={idx} className="space-y-2">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase border-b border-border pb-1">
                                {category.category}
                            </h4>
                            <div className="space-y-1">
                                {category.types.map(type => (
                                    <button
                                        key={type.v}
                                        onClick={() => setSelectedType(type.v)}
                                        className={`w-full text-left text-sm px-3 py-2 rounded-md transition-all ${selectedType === type.v
                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                            : 'bg-secondary/50 hover:bg-secondary'
                                            }`}
                                    >
                                        {type.l}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Step 3: Enter Value(s) */}
            {currentFilterType?.needsValue !== false && (
                <div className="space-y-2">
                    <label className="text-sm font-semibold flex items-center gap-2">
                        <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                        Enter Filter Value{currentFilterType?.needsValue === 'range' ? 's' : ''}
                    </label>

                    {currentFilterType?.needsValue === 'range' ? (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-muted-foreground mb-1 block">Min Value</label>
                                <input
                                    type="text"
                                    placeholder="Minimum"
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={value1}
                                    onChange={(e) => setValue1(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground mb-1 block">Max Value</label>
                                <input
                                    type="text"
                                    placeholder="Maximum"
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={value2}
                                    onChange={(e) => setValue2(e.target.value)}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <input
                                type="text"
                                placeholder={`Enter value to filter ${selectedColumn}...`}
                                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                value={value1}
                                onChange={(e) => setValue1(e.target.value)}
                                list={`values-${selectedColumn}`}
                            />

                            {/* Suggestions */}
                            {uniqueValues.length > 0 && (
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Suggestions (click to use):</p>
                                    <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                                        {uniqueValues.slice(0, 20).map((val, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setValue1(val)}
                                                className="text-xs px-2 py-1 bg-secondary hover:bg-secondary/80 rounded border border-border"
                                            >
                                                {val}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-border">
                <Button variant="outline" onClick={onCancel} className="flex-1">
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleAdd} className="flex-1">
                    <Check className="w-4 h-4 mr-2" />
                    Add Filter
                </Button>
            </div>
        </div>
    );
};

// --- Main Application ---

export default function DataFilterApp() {
    // --- State ---
    const [data, setData] = useState<any[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [fileName, setFileName] = useState('');
    const [filters, setFilters] = useState<any[]>([]);
    const [sorting, setSorting] = useState<any[]>([]);
    const [searchText, setSearchText] = useState('');
    const [activeTab, setActiveTab] = useState('upload');

    // Layout State
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    const [isAdvancedFilterModalOpen, setIsAdvancedFilterModalOpen] = useState(false);

    // Visualization State
    const [chartType, setChartType] = useState('bar');
    const [chartColumn, setChartColumn] = useState('');
    const [chartValueColumn, setChartValueColumn] = useState('');

    // Comparison State
    const [compareCol, setCompareCol] = useState('');
    const [compareVal1, setCompareVal1] = useState('');
    const [compareVal2, setCompareVal2] = useState('');

    // Second Dataset State
    const [data2, setData2] = useState<Record<string, unknown>[]>([]);
    const [headers2, setHeaders2] = useState<string[]>([]);
    const [fileName2, setFileName2] = useState('');
    const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});

    // Row Range State (min and max rows to display)
    const [rowRange, setRowRange] = useState<[number, number]>([0, 100]);
    const [colRange, setColRange] = useState<[number, number]>([0, 10]);

    // Compare View Mode State
    const [compareViewMode, setCompareViewMode] = useState<'table' | 'chart' | 'both'>('both');
    const [showDifferencesOnly, setShowDifferencesOnly] = useState(false);
    const [compareChartType, setCompareChartType] = useState<'bar' | 'line'>('bar');

    // Basic Filter Panel State
    const [isBasicFilterOpen, setIsBasicFilterOpen] = useState(false);
    const [basicFilterValues, setBasicFilterValues] = useState<Record<string, { value: string; min: string; max: string; strict: boolean }>>({});

    // Helper: Detect if column is numeric
    const isNumericColumn = (colName: string) => {
        if (data.length === 0) return false;
        const sample = data.slice(0, 50).map(r => r[colName]);
        const numericCount = sample.filter(v => v !== null && v !== undefined && v !== '' && !isNaN(Number(v))).length;
        return numericCount > sample.length * 0.7; // 70%+ numeric = numeric column
    };

    useEffect(() => {
        if (data.length > 0 && activeTab === 'upload') setActiveTab('analyze');
    }, [data]);

    // --- Data Processing (Header Detection) ---
    const processData = (rawData: any[]) => {
        if (!rawData || rawData.length === 0) return;
        let rows = rawData;
        if (!Array.isArray(rawData[0])) {
            const keys = Object.keys(rawData[0]);
            if (keys.some((k: string) => k.startsWith('__EMPTY'))) rows = rawData.map((obj: Record<string, unknown>) => Object.values(obj));
            else { setHeaders(keys); setData(rawData); initDefaults(keys); return; }
        }
        let headerIdx = 0;
        for (let i = 0; i < Math.min(rows.length, 10); i++) {
            const row = Object.values(rows[i]);
            const filled = row.filter((c: unknown) => c && String(c).trim().length > 0).length;
            if (filled > row.length / 2) { headerIdx = i; break; }
        }
        const headerRow = Object.values(rows[headerIdx]).map((h: unknown) => String(h).trim());
        const dataRows = rows.slice(headerIdx + 1).map((row: Record<string, unknown> | unknown[]) => {
            const rowObj: Record<string, unknown> = {};
            const vals = Array.isArray(row) ? row : Object.values(row);
            headerRow.forEach((h: string, i: number) => rowObj[h] = vals[i]);
            return rowObj;
        });
        setHeaders(headerRow);
        setData(dataRows);
        setColRange([0, headerRow.length]);
        initDefaults(headerRow);
    };

    const initDefaults = (heads: string[]) => {
        if (heads.length) {
            setChartColumn(heads[0]);
            setChartValueColumn(heads[1] || heads[0]);
            setCompareCol(heads[0]);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (evt: ProgressEvent<FileReader>) => {
            const bstr = evt.target?.result as string;
            if (file.name.endsWith('.csv')) {
                Papa.parse(bstr, { skipEmptyLines: true, complete: (res) => processData(res.data as any[]) });
            } else {
                const wb = XLSX.read(bstr, { type: 'binary' });
                const ws = wb.Sheets[wb.SheetNames[0]];
                processData(XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[]);
            }
        };
        file.name.endsWith('.csv') ? reader.readAsText(file) : reader.readAsBinaryString(file);
    };

    // --- Filtering Logic ---
    const addFilter = (type: string, col: string = headers[0], val: string = '', val2: string = '') => {
        setFilters([...filters, { id: Date.now(), type, column: col, value: val, value2: val2 }]);
    };
    const removeFilter = (id: number) => setFilters(prev => prev.filter(f => f.id !== id));
    const updateFilter = (id: number, field: string, val: string) => setFilters(prev => prev.map(f => f.id === id ? { ...f, [field]: val } : f));
    const toggleSort = (column: string) => {
        setSorting(prev => {
            const existing = prev.find(s => s.column === column);
            if (existing && existing.direction === 'asc') return prev.map(s => s.column === column ? { ...s, direction: 'desc' as const } : s);
            if (existing && existing.direction === 'desc') return prev.filter(s => s.column !== column);
            return [...prev, { column, direction: 'asc' as const }];
        });
    };

    const processedData = useMemo(() => {
        let res = [...data];
        if (searchText) {
            const lower = searchText.toLowerCase();
            res = res.filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(lower)));
        }

        // Apply basic filter values (dynamic/live filtering)
        Object.entries(basicFilterValues).forEach(([col, filterVal]) => {
            const isNumeric = isNumericColumn(col);

            if (isNumeric) {
                // Numeric column: use min/max inputs
                const hasMin = filterVal.min !== '' && filterVal.min !== undefined;
                const hasMax = filterVal.max !== '' && filterVal.max !== undefined;

                if (hasMin && hasMax) {
                    // Between mode - both values provided
                    res = res.filter(row => {
                        const val = parseFloat(row[col]);
                        if (isNaN(val)) return false;
                        return val >= parseFloat(filterVal.min) && val <= parseFloat(filterVal.max);
                    });
                } else if (hasMin) {
                    // Only min provided - equals this value
                    res = res.filter(row => {
                        const val = parseFloat(row[col]);
                        if (isNaN(val)) return false;
                        return val === parseFloat(filterVal.min);
                    });
                } else if (hasMax) {
                    // Only max provided - equals this value
                    res = res.filter(row => {
                        const val = parseFloat(row[col]);
                        if (isNaN(val)) return false;
                        return val === parseFloat(filterVal.max);
                    });
                }
            } else if (filterVal.value) {
                // Text column: use value input with strict option
                const searchVal = filterVal.value.toLowerCase();
                if (filterVal.strict) {
                    // Strict = exact match
                    res = res.filter(row => String(row[col] ?? '').toLowerCase() === searchVal);
                } else {
                    // Not strict = contains
                    res = res.filter(row => String(row[col] ?? '').toLowerCase().includes(searchVal));
                }
            }
        });

        // Apply advanced filters
        filters.forEach(f => {
            res = res.filter(row => {
                const val = row[f.column];
                const num = (v: unknown): number => parseFloat(String(v));
                const str = (v: unknown): string => String(v ?? '').toLowerCase();
                const tVal = String(f.value).toLowerCase();
                try {
                    switch (f.type) {
                        case 'eq': return row[f.column] == f.value;
                        case 'neq': return row[f.column] != f.value;
                        case 'gt': return num(val) > num(f.value);
                        case 'lt': return num(val) < num(f.value);
                        case 'range': return num(val) >= num(f.value) && num(val) <= num(f.value2);
                        case 'contains': return str(val).includes(tVal);
                        case 'notcontains': return !str(val).includes(tVal);
                        case 'starts': return str(val).startsWith(tVal);
                        case 'ends': return str(val).endsWith(tVal);
                        case 'regex': return new RegExp(f.value, 'i').test(String(val));
                        case 'empty': return !val || val === '';
                        case 'notempty': return val && val !== '';
                        case 'in': return f.value.split(',').map((s: string) => s.trim().toLowerCase()).includes(str(val));
                        default: return true;
                    }
                } catch (e) { return true; }
            });
        });
        if (sorting.length > 0) {
            res.sort((a, b) => {
                for (const sort of sorting) {
                    const valA = a[sort.column];
                    const valB = b[sort.column];
                    if (valA === valB) continue;
                    const isNum = !isNaN(parseFloat(valA)) && !isNaN(parseFloat(valB));
                    let comparison = isNum ? parseFloat(valA) - parseFloat(valB) : String(valA).localeCompare(String(valB));
                    return sort.direction === 'asc' ? comparison : -comparison;
                }
                return 0;
            });
        }
        return res;
    }, [data, searchText, filters, sorting, basicFilterValues]);

    // --- Statistics Calculation ---
    const stats = useMemo(() => {
        if (processedData.length === 0) return null;
        const numericHeaders = headers.filter(h => processedData.some(r => !isNaN(parseFloat(r[h]))));
        return numericHeaders.map(h => {
            const values = processedData.map(r => parseFloat(r[h])).filter(v => !isNaN(v));
            const sum = values.reduce((a, b) => a + b, 0);
            return {
                column: h,
                count: values.length,
                sum: sum.toFixed(2),
                mean: (sum / values.length).toFixed(2),
                min: Math.min(...values),
                max: Math.max(...values)
            };
        });
    }, [processedData, headers]);

    // --- Visualization Data ---
    interface ChartDataItem { name: string; value: number; total: number; }

    const getChartData = (sourceData: Record<string, unknown>[], groupCol: string, valCol: string): ChartDataItem[] => {
        if (!groupCol || sourceData.length === 0) return [];
        const grouped: Record<string, ChartDataItem> = {};
        sourceData.forEach((row: Record<string, unknown>) => {
            const k = String(row[groupCol] || 'Unknown');
            if (!grouped[k]) grouped[k] = { name: k, value: 0, total: 0 };
            grouped[k].value += 1;
            if (valCol) {
                const v = parseFloat(String(row[valCol]));
                if (!isNaN(v)) grouped[k].total += v;
            }
        });
        return Object.values(grouped)
            .sort((a, b) => (valCol ? b.total - a.total : b.value - a.value))
            .slice(0, 20);
    };

    const mainChartData = useMemo(() => getChartData(processedData, chartColumn, chartValueColumn), [processedData, chartColumn, chartValueColumn]);

    // Comparison Data
    const comparisonData = useMemo(() => {
        if (!compareCol || !compareVal1 || !compareVal2) return null;
        const set1 = data.filter(r => String(r[compareCol]) === compareVal1);
        const set2 = data.filter(r => String(r[compareCol]) === compareVal2);

        // Aggregate by Chart Column (reuse existing state or add new)
        const data1 = getChartData(set1, chartColumn, chartValueColumn);
        const data2 = getChartData(set2, chartColumn, chartValueColumn);

        // Merge for chart
        const merged: Record<string, unknown>[] = [];
        const allKeys = Array.from(new Set([...data1.map(d => d.name), ...data2.map(d => d.name)]));
        allKeys.forEach(k => {
            const d1 = data1.find(d => d.name === k);
            const d2 = data2.find(d => d.name === k);
            merged.push({
                name: k,
                [compareVal1]: d1 ? (chartValueColumn ? d1.total : d1.value) : 0,
                [compareVal2]: d2 ? (chartValueColumn ? d2.total : d2.value) : 0,
            });
        });
        return merged.sort((a, b) => (b[compareVal1] as number) - (a[compareVal1] as number)).slice(0, 15);
    }, [data, compareCol, compareVal1, compareVal2, chartColumn, chartValueColumn]);

    const COLORS = ['var(--color-chart-1)', 'var(--color-chart-2)', 'var(--color-chart-3)', 'var(--color-chart-4)', 'var(--color-chart-5)', '#3b82f6', '#8b5cf6', '#ec4899'];

    const exportCSV = () => {
        const csv = Papa.unparse(processedData);
        const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
        const a = document.createElement('a');
        a.href = url; a.download = 'filtered_data.csv'; a.click();
    };

    // --- Render Sections ---

    const renderUpload = () => (
        <div className="flex-1 flex items-center justify-center animate-in fade-in zoom-in-95 duration-500 p-6">
            <Card className="w-full max-w-2xl p-10 text-center border-dashed border-2 hover:border-primary/50 transition-all bg-card/50">
                <div className="mx-auto bg-primary/10 p-6 rounded-full w-24 h-24 flex items-center justify-center mb-8 ring-1 ring-primary/20">
                    <Upload className="w-12 h-12 text-primary" />
                </div>
                <h2 className="text-3xl font-bold mb-4 tracking-tight">Upload Your Data</h2>
                <p className="text-muted-foreground mb-10 text-lg">Drag & drop CSV, Excel (.xlsx, .xls) files here to unlock powerful insights.</p>
                <label className="cursor-pointer inline-flex h-12 px-8 items-center justify-center rounded-lg text-base font-medium transition-all bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1">
                    Select Data File
                    <input type="file" className="hidden" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} />
                </label>
            </Card>
        </div>
    );

    const renderAnalyze = () => (
        <div className="flex flex-1 gap-4 min-h-0 pt-2 overflow-hidden w-full max-w-full">
            {/* Dynamic Table Area */}
            <div className="flex flex-col gap-4 min-w-0 overflow-hidden w-full max-w-full">

                {/* Toolbar */}
                <Card className="p-4 flex-shrink-0 space-y-4">
                    {/* Quick Filters - Sliders */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4 border-b border-border">
                        {/* Row Range Slider */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase text-muted-foreground flex items-center justify-between">
                                <span>Row Range</span>
                                <span className="text-primary font-mono text-xs">{rowRange[0]} - {rowRange[1]}</span>
                            </label>
                            <RangeSlider
                                min={0}
                                max={Math.min(processedData.length, 1000)}
                                value={rowRange}
                                onChange={(range: [number, number]) => setRowRange(range)}
                            />
                        </div>

                        {/* Column Range Slider */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase text-muted-foreground flex items-center justify-between">
                                <span>Column Range</span>
                                <span className="text-primary font-mono text-xs">
                                    {colRange[0] + 1} - {Math.min(colRange[1], headers.length)}
                                </span>
                            </label>
                            <RangeSlider
                                min={0}
                                max={headers.length}
                                value={colRange}
                                onChange={(range: [number, number]) => setColRange(range)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                            <Search className="w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search table..."
                                className="flex-1 bg-transparent outline-none text-sm"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                        </div>
                        <Button
                            variant={isBasicFilterOpen ? "primary" : "outline"}
                            onClick={() => setIsBasicFilterOpen(!isBasicFilterOpen)}
                        >
                            <Filter className={`w-4 h-4 mr-2 ${isBasicFilterOpen ? 'text-primary-foreground' : ''}`} />
                            Basic Filter
                            <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${isBasicFilterOpen ? 'rotate-180' : ''}`} />
                        </Button>
                        <Button variant="outline" onClick={() => setIsStatsModalOpen(true)}>
                            <Calculator className="w-4 h-4 mr-2" /> Stats
                        </Button>
                        <Button variant="outline" onClick={() => setIsAdvancedFilterModalOpen(true)}>
                            <Settings2 className="w-4 h-4 mr-2" /> Advanced
                        </Button>
                        <Button variant="secondary" onClick={exportCSV}>
                            <Download className="w-4 h-4 mr-2" /> Export
                        </Button>
                    </div>

                    {/* Basic Filter Panel - Inline Collapsible */}
                    {isBasicFilterOpen && (
                        <div className="filter-panel animate-in slide-in-from-top-2 duration-300 mt-3">
                            <div className="filter-panel-container">
                                {/* Header */}
                                <div className="filter-panel-header">
                                    <div className="filter-panel-title">
                                        <div className="filter-panel-icon">
                                            <Filter className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-foreground tracking-tight">Quick Column Filters</h4>
                                            <span className="text-xs text-muted-foreground">Filters apply as you type</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setBasicFilterValues({})}
                                        className="filter-clear-btn"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                        <span>Clear All</span>
                                    </button>
                                </div>

                                {/* Active Filters Status */}
                                {Object.values(basicFilterValues).some(f => f.value || f.min || f.max) && (
                                    <div className="filter-status-badge">
                                        <Activity className="w-3.5 h-3.5 animate-pulse" />
                                        <span>
                                            {Object.values(basicFilterValues).filter(f => f.value || f.min || f.max).length} active filter(s)
                                        </span>
                                        <span className="text-muted-foreground mx-1">•</span>
                                        <span className="text-muted-foreground">
                                            {processedData.length} results
                                        </span>
                                    </div>
                                )}

                                {/* Filters Grid */}
                                <div className="filter-grid">
                                    {headers.map(col => {
                                        const isNumeric = isNumericColumn(col);
                                        const filterVal = basicFilterValues[col] || { value: '', min: '', max: '', strict: false };
                                        const hasValue = isNumeric
                                            ? (filterVal.min !== '' || filterVal.max !== '')
                                            : filterVal.value !== '';

                                        return (
                                            <div
                                                key={col}
                                                className={`filter-card ${hasValue ? 'active' : ''}`}
                                            >
                                                <label className="filter-label" title={col}>
                                                    {hasValue && <span className="filter-active-dot" />}
                                                    {col}
                                                </label>

                                                {isNumeric ? (
                                                    <div className="filter-input-dual">
                                                        <input
                                                            type="number"
                                                            placeholder="Min"
                                                            className="filter-input"
                                                            value={filterVal.min}
                                                            onChange={(e) => setBasicFilterValues(prev => ({
                                                                ...prev,
                                                                [col]: { ...filterVal, min: e.target.value }
                                                            }))}
                                                        />
                                                        <input
                                                            type="number"
                                                            placeholder="Max"
                                                            className="filter-input"
                                                            value={filterVal.max}
                                                            onChange={(e) => setBasicFilterValues(prev => ({
                                                                ...prev,
                                                                [col]: { ...filterVal, max: e.target.value }
                                                            }))}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Search..."
                                                            className="filter-input"
                                                            value={filterVal.value}
                                                            onChange={(e) => setBasicFilterValues(prev => ({
                                                                ...prev,
                                                                [col]: { ...filterVal, value: e.target.value }
                                                            }))}
                                                        />
                                                        <label className="filter-checkbox-wrapper">
                                                            <div className={`filter-checkbox ${filterVal.strict ? 'checked' : ''}`}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={filterVal.strict}
                                                                    onChange={(e) => setBasicFilterValues(prev => ({
                                                                        ...prev,
                                                                        [col]: { ...filterVal, strict: e.target.checked }
                                                                    }))}
                                                                    className="absolute opacity-0 w-full h-full cursor-pointer"
                                                                />
                                                                {filterVal.strict && (
                                                                    <Check className="w-2.5 h-2.5 text-primary-foreground" />
                                                                )}
                                                            </div>
                                                            <span className="font-medium">Exact match</span>
                                                        </label>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Global Search */}
                                <div className="filter-global-search">
                                    <div className="filter-global-search-container">
                                        <div className="filter-global-search-icon">
                                            <Search className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 max-w-lg">
                                            <label className="text-xs font-semibold text-foreground/80 block mb-1.5 uppercase tracking-wide">
                                                Global Search
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Search across all columns..."
                                                className="filter-global-input"
                                                value={searchText}
                                                onChange={(e) => setSearchText(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Filter Chips */}
                    {(filters.length > 0 || sorting.length > 0) && (
                        <div className="flex flex-wrap gap-2 px-1 mt-4">
                            {filters.map(f => (
                                <div key={f.id} className="inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded-full text-xs font-medium animate-in fade-in zoom-in">
                                    <span>{f.column}</span>
                                    <span className="opacity-50">•</span>
                                    <span>{f.type}</span>
                                    <span className="opacity-50">:</span>
                                    <span className="font-bold">{f.value}</span>
                                    <X className="w-3 h-3 cursor-pointer hover:bg-primary/20 rounded-full ml-1" onClick={() => removeFilter(f.id)} />
                                </div>
                            ))}
                            {sorting.map(s => (
                                <div key={s.column} className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground border border-border px-2 py-1 rounded-full text-xs font-medium">
                                    <ArrowUpDown className="w-3 h-3" />
                                    <span>{s.column}</span>
                                    <span className="opacity-50">•</span>
                                    <span>{s.direction}</span>
                                    <X className="w-3 h-3 cursor-pointer hover:bg-destructive/20 rounded-full ml-1" onClick={() => toggleSort(s.column)} />
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Data Table */}
                <Card className="flex-1 flex flex-col min-h-0 overflow-hidden w-full max-w-full">
                    <div className="flex-1 overflow-x-auto overflow-y-auto">
                        <table className="w-full text-sm min-w-max">
                            <thead className="bg-muted/50 sticky top-0 z-10">
                                <tr>
                                    {headers.slice(colRange[0], colRange[1]).map(h => (
                                        <th key={h} className="p-4 text-left font-semibold border-b cursor-pointer hover:bg-muted transition-colors group whitespace-nowrap" onClick={() => toggleSort(h)}>
                                            <div className="flex items-center gap-2">
                                                <span>{h}</span>
                                                <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {processedData.slice(rowRange[0], rowRange[1]).map((row, i) => (
                                    <tr key={i} className="border-b hover:bg-muted/50">
                                        {headers.slice(colRange[0], colRange[1]).map(h => (
                                            <td key={h} className="p-4 whitespace-nowrap max-w-[200px] truncate">
                                                {String(row[h] ?? '')}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {processedData.length === 0 && <div className="h-40 flex items-center justify-center text-muted-foreground">No data found</div>}
                    </div>
                    <div className="p-4 border-t text-xs text-muted-foreground flex justify-between items-center flex-shrink-0">
                        <span>Showing rows {rowRange[0]} to {Math.min(rowRange[1], processedData.length)} ({Math.min(rowRange[1] - rowRange[0], processedData.length - rowRange[0])} rows)</span>
                        <span>Total: {processedData.length} rows</span>
                    </div>
                </Card>
            </div>


        </div>
    );

    const renderVisualize = () => (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full animate-in fade-in pb-10">
            <Card className="lg:col-span-1 p-6 space-y-8 h-fit">
                <div>
                    <h3 className="text-sm font-bold text-muted-foreground uppercase mb-4 flex items-center gap-2">
                        <LayoutGrid className="w-4 h-4" /> Chart Type
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { id: 'bar', icon: BarChart3, label: 'Bar' },
                            { id: 'line', icon: LineChart, label: 'Line' },
                            { id: 'area', icon: AreaIcon, label: 'Area' },
                            { id: 'pie', icon: PieChart, label: 'Pie' },
                            { id: 'scatter', icon: ScatterIcon, label: 'Scatter' },
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => setChartType(t.id)}
                                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all hover:bg-accent ${chartType === t.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-input'
                                    }`}
                                title={t.label}
                            >
                                <t.icon className="w-5 h-5 mb-1" />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold">X-Axis (Category)</label>
                        <select
                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={chartColumn} onChange={(e) => setChartColumn(e.target.value)}
                        >
                            {headers.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold">Y-Axis (Value)</label>
                        <select
                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={chartValueColumn} onChange={(e) => setChartValueColumn(e.target.value)}
                        >
                            <option value="">Count of Rows</option>
                            {headers.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                    </div>
                </div>
            </Card>

            <Card className="lg:col-span-3 p-6 flex flex-col shadow-lg border-border/60">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" /> Visual Analysis
                    </h2>
                    <span className="text-xs text-muted-foreground">{mainChartData.length} data points</span>
                </div>
                {/* Dynamic height: base 400px + 20px per data point (max 800px) */}
                <div className="flex-1 w-full" style={{ minHeight: Math.min(400 + mainChartData.length * 15, 800) }}>
                    <ResponsiveContainer width="100%" height="100%">
                        {chartType === 'bar' ? (
                            <BarChart data={mainChartData} margin={{ top: 20, right: 30, left: 40, bottom: 100 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                                <XAxis dataKey="name" angle={-45} textAnchor="end" tick={{ fill: 'currentColor', fontSize: 11 }} interval={0} height={80} />
                                <YAxis tick={{ fill: 'currentColor', fontSize: 12 }} />
                                <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                                <Bar dataKey={chartValueColumn ? 'total' : 'value'} fill="var(--color-chart-1)" radius={[4, 4, 0, 0]}>
                                    {mainChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Bar>
                            </BarChart>
                        ) : chartType === 'area' ? (
                            <AreaChart data={mainChartData} margin={{ top: 20, right: 30, left: 40, bottom: 100 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                                <XAxis dataKey="name" angle={-45} textAnchor="end" tick={{ fill: 'currentColor', fontSize: 11 }} interval={0} height={80} />
                                <YAxis tick={{ fill: 'currentColor', fontSize: 12 }} />
                                <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', borderRadius: '8px' }} />
                                <Area type="monotone" dataKey={chartValueColumn ? 'total' : 'value'} stroke="var(--color-chart-2)" fill="var(--color-chart-2)" fillOpacity={0.3} />
                            </AreaChart>
                        ) : chartType === 'line' ? (
                            <RechartsLine data={mainChartData} margin={{ top: 20, right: 30, left: 40, bottom: 100 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                                <XAxis dataKey="name" angle={-45} textAnchor="end" tick={{ fill: 'currentColor', fontSize: 11 }} interval={0} height={80} />
                                <YAxis tick={{ fill: 'currentColor', fontSize: 12 }} />
                                <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', borderRadius: '8px' }} />
                                <Line type="monotone" dataKey={chartValueColumn ? 'total' : 'value'} stroke="var(--color-chart-3)" strokeWidth={3} dot={{ r: 4 }} />
                            </RechartsLine>
                        ) : chartType === 'pie' ? (
                            <RechartsPie>
                                <Pie data={mainChartData} dataKey={chartValueColumn ? 'total' : 'value'} cx="50%" cy="50%" innerRadius={80} outerRadius={160} paddingAngle={2}>
                                    {mainChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </RechartsPie>
                        ) : (
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid />
                                <XAxis type="category" dataKey="name" name="Category" />
                                <YAxis type="number" dataKey={chartValueColumn ? 'total' : 'value'} name="Value" />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: 'var(--color-card)', borderRadius: '8px' }} />
                                <Scatter name="Data" data={mainChartData} fill="var(--color-chart-5)" />
                            </ScatterChart>
                        )}
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    );

    const renderCompare = () => {
        // Handle second dataset upload
        const handleSecondDatasetUpload = (e: any) => {
            const file = e.target.files[0];
            if (!file) return;
            setFileName2(file.name);
            const reader = new FileReader();
            reader.onload = (evt: any) => {
                const bstr = evt.target.result;
                if (file.name.endsWith('.csv')) {
                    Papa.parse(bstr, { skipEmptyLines: true, complete: (res: any) => processSecondDataset(res.data) });
                } else {
                    const wb = XLSX.read(bstr, { type: 'binary' });
                    const ws = wb.Sheets[wb.SheetNames[0]];
                    processSecondDataset(XLSX.utils.sheet_to_json(ws, { header: 1 }));
                }
            };
            file.name.endsWith('.csv') ? reader.readAsText(file) : reader.readAsBinaryString(file);
        };

        const processSecondDataset = (rawData: any) => {
            if (!rawData || rawData.length === 0) return;
            let rows = rawData;
            if (!Array.isArray(rawData[0])) {
                const keys = Object.keys(rawData[0]);
                if (keys.some((k: string) => k.startsWith('__EMPTY'))) rows = rawData.map((obj: any) => Object.values(obj));
                else { setHeaders2(keys); setData2(rawData); return; }
            }
            let headerIdx = 0;
            for (let i = 0; i < Math.min(rows.length, 10); i++) {
                const row = Object.values(rows[i]);
                const filled = row.filter((c: any) => c && String(c).trim().length > 0).length;
                if (filled > row.length / 2) { headerIdx = i; break; }
            }
            const headerRow = Object.values(rows[headerIdx]).map((h: any) => String(h).trim());
            const dataRows = rows.slice(headerIdx + 1).map((row: any) => {
                const rowObj: any = {};
                const vals = Array.isArray(row) ? row : Object.values(row);
                headerRow.forEach((h: any, i: number) => rowObj[h] = vals[i]);
                return rowObj;
            });
            setHeaders2(headerRow);
            setData2(dataRows);
        };

        return (
            <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4">
                {/* Dataset Upload Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Dataset 1 Info */}
                    <Card className="p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <FileSpreadsheet className="w-5 h-5 text-primary" /> Dataset 1
                        </h3>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                                <span className="font-semibold">File:</span> {fileName || 'No file loaded'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                <span className="font-semibold">Rows:</span> {data.length.toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                <span className="font-semibold">Columns:</span> {headers.length}
                            </p>
                        </div>
                    </Card>

                    {/* Dataset 2 Upload */}
                    <Card className="p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <FileSpreadsheet className="w-5 h-5 text-secondary" /> Dataset 2
                        </h3>
                        {data2.length === 0 ? (
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">Upload a second dataset to compare</p>
                                <label className="cursor-pointer inline-flex h-10 px-4 items-center justify-center rounded-md text-sm font-medium transition-all bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                    <Upload className="w-4 h-4 mr-2" /> Upload Dataset 2
                                    <input type="file" className="hidden" accept=".csv,.xlsx,.xls" onChange={handleSecondDatasetUpload} />
                                </label>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-semibold">File:</span> {fileName2}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-semibold">Rows:</span> {data2.length.toLocaleString()}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-semibold">Columns:</span> {headers2.length}
                                </p>
                                <Button variant="outline" size="sm" onClick={() => { setData2([]); setHeaders2([]); setFileName2(''); }}>
                                    <X className="w-4 h-4 mr-2" /> Clear Dataset 2
                                </Button>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Comparison Options */}
                {data2.length > 0 ? (
                    <>
                        <Card className="p-6">
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                                <h3 className="text-lg font-bold flex items-center gap-2"><Split className="w-5 h-5" /> Comparison Setup</h3>

                                {/* View Mode Toggle */}
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">View:</span>
                                    <div className="flex rounded-lg border border-input overflow-hidden">
                                        {(['table', 'chart', 'both'] as const).map(mode => (
                                            <button
                                                key={mode}
                                                onClick={() => setCompareViewMode(mode)}
                                                className={`px-3 py-1.5 text-xs font-medium transition-colors ${compareViewMode === mode
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-background hover:bg-secondary'
                                                    }`}
                                            >
                                                {mode === 'table' ? <Table2 className="w-3.5 h-3.5" /> : mode === 'chart' ? <BarChart3 className="w-3.5 h-3.5" /> : 'Both'}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Show Differences Only Toggle */}
                                    <label className="flex items-center gap-2 ml-4 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={showDifferencesOnly}
                                            onChange={(e) => setShowDifferencesOnly(e.target.checked)}
                                            className="rounded border-input"
                                        />
                                        <span className="text-xs text-muted-foreground">Show differences only</span>
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div>
                                    <label className="text-xs font-bold uppercase text-muted-foreground block mb-2">Dataset 1 Column</label>
                                    <select className="w-full p-2 rounded border bg-background" value={compareCol} onChange={(e) => setCompareCol(e.target.value)}>
                                        {headers.map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase text-muted-foreground block mb-2">Dataset 2 Column</label>
                                    <select className="w-full p-2 rounded border bg-background" value={columnMapping[compareCol] || headers2[0]} onChange={(e) => setColumnMapping({ ...columnMapping, [compareCol]: e.target.value })}>
                                        {headers2.map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase text-muted-foreground block mb-2">Comparison Metric</label>
                                    <select className="w-full p-2 rounded border bg-background" value={chartValueColumn} onChange={(e) => setChartValueColumn(e.target.value)}>
                                        <option value="">Count of Rows</option>
                                        {headers.map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase text-muted-foreground block mb-2">Chart Type</label>
                                    <select className="w-full p-2 rounded border bg-background" value={compareChartType} onChange={(e) => setCompareChartType(e.target.value as 'bar' | 'line')}>
                                        <option value="bar">Bar Chart</option>
                                        <option value="line">Line Chart</option>
                                    </select>
                                </div>
                            </div>
                        </Card>

                        {/* Table Comparison View */}
                        {(compareViewMode === 'table' || compareViewMode === 'both') && (
                            <Card className="p-6">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <Table2 className="w-5 h-5" /> Table Comparison
                                    <span className="ml-auto text-xs font-normal text-muted-foreground">
                                        <span className="inline-block w-3 h-3 rounded bg-green-500/30 mr-1"></span> Match
                                        <span className="inline-block w-3 h-3 rounded bg-red-500/30 ml-3 mr-1"></span> Different
                                        <span className="inline-block w-3 h-3 rounded bg-yellow-500/30 ml-3 mr-1"></span> Only in one
                                    </span>
                                </h3>

                                {(() => {
                                    // Find common columns
                                    const commonCols = headers.filter(h => headers2.includes(h));
                                    const keyCol = compareCol || headers[0];
                                    const keyCol2 = columnMapping[keyCol] || headers2[0];

                                    // Build comparison rows
                                    const data1Keys = new Set(data.map(r => String(r[keyCol])));
                                    const data2Keys = new Set(data2.map(r => String(r[keyCol2])));
                                    const allKeys = Array.from(new Set([...Array.from(data1Keys), ...Array.from(data2Keys)])).slice(0, 50);

                                    let matchCount = 0;
                                    let diffCount = 0;

                                    const comparisonRows = allKeys.map(key => {
                                        const row1 = data.find(r => String(r[keyCol]) === key);
                                        const row2 = data2.find(r => String(r[keyCol2]) === key);
                                        const inBoth = row1 && row2;

                                        const cells: any = { _key: key, _inBoth: inBoth, _onlyIn1: row1 && !row2, _onlyIn2: !row1 && row2 };

                                        commonCols.forEach(col => {
                                            const val1 = row1 ? String(row1[col] ?? '') : '';
                                            const val2 = row2 ? String(row2[col] ?? '') : '';
                                            const match = val1 === val2;
                                            if (inBoth) {
                                                if (match) matchCount++;
                                                else diffCount++;
                                            }
                                            cells[col] = { val1, val2, match, inBoth };
                                        });

                                        return cells;
                                    });

                                    const filteredRows = showDifferencesOnly
                                        ? comparisonRows.filter(r => !r._inBoth || commonCols.some(c => !r[c].match))
                                        : comparisonRows;

                                    const similarity = matchCount + diffCount > 0
                                        ? Math.round((matchCount / (matchCount + diffCount)) * 100)
                                        : 0;

                                    return (
                                        <>
                                            {/* Statistics */}
                                            <div className="flex gap-4 mb-4 text-sm">
                                                <span className="px-3 py-1 rounded bg-green-500/20 text-green-400">{matchCount} matches</span>
                                                <span className="px-3 py-1 rounded bg-red-500/20 text-red-400">{diffCount} differences</span>
                                                <span className="px-3 py-1 rounded bg-primary/20 text-primary">{similarity}% similarity</span>
                                                <span className="px-3 py-1 rounded bg-secondary">{commonCols.length} common columns</span>
                                            </div>

                                            {/* Table */}
                                            <div className="overflow-x-auto max-h-[500px] overflow-y-auto border rounded-lg">
                                                <table className="w-full text-sm border-collapse">
                                                    <thead className="bg-muted/80 sticky top-0 z-10">
                                                        <tr>
                                                            <th className="p-3 text-left border-b font-bold" rowSpan={2}>{keyCol}</th>
                                                            <th className="p-2 text-center border-b border-l font-bold text-xs uppercase tracking-wide text-muted-foreground" rowSpan={2}>Source</th>
                                                            {commonCols.filter(c => c !== keyCol).map(col => (
                                                                <th key={col} className="p-2 text-center border-b border-l font-bold whitespace-nowrap">{col}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {filteredRows.map((row, i) => (
                                                            <React.Fragment key={i}>
                                                                {/* Dataset 1 Row */}
                                                                <tr className={`${row._onlyIn1 ? 'bg-blue-500/5' : row._onlyIn2 ? 'opacity-40' : ''}`}>
                                                                    <td className="p-2 font-semibold border-b bg-muted/30" rowSpan={2}>
                                                                        <div className="flex flex-col">
                                                                            <span>{row._key}</span>
                                                                            {row._onlyIn1 && <span className="text-[10px] text-blue-500 font-medium mt-0.5">Only in D1</span>}
                                                                            {row._onlyIn2 && <span className="text-[10px] text-orange-500 font-medium mt-0.5">Only in D2</span>}
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-2 border-b border-l text-center">
                                                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400">
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                                            D1
                                                                        </span>
                                                                    </td>
                                                                    {commonCols.filter(c => c !== keyCol).map(col => {
                                                                        const cell = row[col];
                                                                        const bgClass = !cell.inBoth
                                                                            ? (row._onlyIn1 ? 'bg-blue-500/10' : 'bg-muted/30')
                                                                            : cell.match
                                                                                ? 'bg-green-500/10'
                                                                                : 'bg-red-500/15';
                                                                        return (
                                                                            <td key={col} className={`p-2 border-b border-l text-xs ${bgClass}`}>
                                                                                {cell.val1 || <span className="text-muted-foreground">—</span>}
                                                                            </td>
                                                                        );
                                                                    })}
                                                                </tr>
                                                                {/* Dataset 2 Row */}
                                                                <tr className={`border-b-2 border-border/50 ${row._onlyIn2 ? 'bg-orange-500/5' : row._onlyIn1 ? 'opacity-40' : ''}`}>
                                                                    <td className="p-2 border-l text-center">
                                                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/15 text-orange-600 dark:text-orange-400">
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                                                            D2
                                                                        </span>
                                                                    </td>
                                                                    {commonCols.filter(c => c !== keyCol).map(col => {
                                                                        const cell = row[col];
                                                                        const bgClass = !cell.inBoth
                                                                            ? (row._onlyIn2 ? 'bg-orange-500/10' : 'bg-muted/30')
                                                                            : cell.match
                                                                                ? 'bg-green-500/10'
                                                                                : 'bg-red-500/15';
                                                                        return (
                                                                            <td key={col} className={`p-2 border-l text-xs ${bgClass}`}>
                                                                                {cell.val2 || <span className="text-muted-foreground">—</span>}
                                                                            </td>
                                                                        );
                                                                    })}
                                                                </tr>
                                                            </React.Fragment>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </>
                                    );
                                })()}
                            </Card>
                        )}

                        {/* Chart Comparison Visualization */}
                        {(compareViewMode === 'chart' || compareViewMode === 'both') && (
                            <Card className="p-6 min-h-[500px]">
                                <h3 className="text-xl font-bold mb-6 text-center">Dataset Comparison: {fileName} vs {fileName2}</h3>
                                <ResponsiveContainer width="100%" height={450}>
                                    {compareChartType === 'bar' ? (
                                        <BarChart data={(() => {
                                            const col1 = compareCol || headers[0];
                                            const col2 = columnMapping[col1] || headers2[0];
                                            const data1Map = getChartData(data as Record<string, unknown>[], col1, chartValueColumn);
                                            const data2Map = getChartData(data2 as Record<string, unknown>[], col2, chartValueColumn);
                                            const allKeys = Array.from(new Set([...data1Map.map(d => d.name), ...data2Map.map(d => d.name)]));
                                            const merged: any[] = [];
                                            allKeys.forEach(k => {
                                                const d1 = data1Map.find(d => d.name === k);
                                                const d2 = data2Map.find(d => d.name === k);
                                                merged.push({
                                                    name: k,
                                                    [fileName || 'Dataset 1']: d1 ? (chartValueColumn ? d1.total : d1.value) : 0,
                                                    [fileName2 || 'Dataset 2']: d2 ? (chartValueColumn ? d2.total : d2.value) : 0,
                                                });
                                            });
                                            return merged.sort((a, b) => b[fileName || 'Dataset 1'] - a[fileName || 'Dataset 1']).slice(0, 15);
                                        })()} margin={{ top: 20, right: 30, left: 40, bottom: 100 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={80} />
                                            <YAxis />
                                            <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', borderRadius: '8px' }} />
                                            <Legend verticalAlign="top" height={36} />
                                            <Bar dataKey={fileName || 'Dataset 1'} fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey={fileName2 || 'Dataset 2'} fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    ) : (
                                        <RechartsLine data={(() => {
                                            const col1 = compareCol || headers[0];
                                            const col2 = columnMapping[col1] || headers2[0];
                                            const data1Map = getChartData(data, col1, chartValueColumn);
                                            const data2Map = getChartData(data2, col2, chartValueColumn);
                                            const allKeys = Array.from(new Set([...data1Map.map(d => d.name), ...data2Map.map(d => d.name)]));
                                            const merged: any[] = [];
                                            allKeys.forEach(k => {
                                                const d1 = data1Map.find(d => d.name === k);
                                                const d2 = data2Map.find(d => d.name === k);
                                                merged.push({
                                                    name: k,
                                                    [fileName || 'Dataset 1']: d1 ? (chartValueColumn ? d1.total : d1.value) : 0,
                                                    [fileName2 || 'Dataset 2']: d2 ? (chartValueColumn ? d2.total : d2.value) : 0,
                                                });
                                            });
                                            return merged.sort((a, b) => b[fileName || 'Dataset 1'] - a[fileName || 'Dataset 1']).slice(0, 15);
                                        })()} margin={{ top: 20, right: 30, left: 40, bottom: 100 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={80} />
                                            <YAxis />
                                            <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', borderRadius: '8px' }} />
                                            <Legend verticalAlign="top" height={36} />
                                            <Line type="monotone" dataKey={fileName || 'Dataset 1'} stroke="var(--color-chart-1)" strokeWidth={2} dot={{ r: 4 }} />
                                            <Line type="monotone" dataKey={fileName2 || 'Dataset 2'} stroke="var(--color-chart-2)" strokeWidth={2} dot={{ r: 4 }} />
                                        </RechartsLine>
                                    )}
                                </ResponsiveContainer>
                            </Card>
                        )}
                    </>
                ) : (
                    <Card className="p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Split className="w-5 h-5" /> Single Dataset Comparison</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="text-xs font-bold uppercase text-muted-foreground block mb-2">1. Split By Column</label>
                                <select className="w-full p-2 rounded border bg-background" value={compareCol} onChange={(e) => setCompareCol(e.target.value)}>
                                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-muted-foreground block mb-2">2. Group A</label>
                                <select className="w-full p-2 rounded border bg-background" value={compareVal1} onChange={(e) => setCompareVal1(e.target.value)}>
                                    <option value="">Select Value...</option>
                                    {Array.from(new Set(data.map(d => String(d[compareCol])))).slice(0, 50).map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-muted-foreground block mb-2">3. Group B</label>
                                <select className="w-full p-2 rounded border bg-background" value={compareVal2} onChange={(e) => setCompareVal2(e.target.value)}>
                                    <option value="">Select Value...</option>
                                    {Array.from(new Set(data.map(d => String(d[compareCol])))).slice(0, 50).map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                            </div>
                        </div>

                        {comparisonData && (
                            <div className="mt-6">
                                <h3 className="text-xl font-bold mb-6 text-center">Comparing {compareVal1} vs {compareVal2} (Metric: {chartColumn})</h3>
                                <ResponsiveContainer width="100%" height={450}>
                                    <BarChart data={comparisonData} margin={{ top: 20, bottom: 60 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', borderRadius: '8px' }} />
                                        <Legend verticalAlign="top" height={36} />
                                        <Bar dataKey={compareVal1} fill="var(--color-chart-1)" name={compareVal1} radius={[4, 4, 0, 0]} />
                                        <Bar dataKey={compareVal2} fill="var(--color-chart-2)" name={compareVal2} radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                        {!comparisonData && (
                            <div className="h-64 flex items-center justify-center text-muted-foreground bg-secondary/20 rounded-xl border border-dashed border-border mt-6">
                                Select a column and two values above to generate a comparison.
                            </div>
                        )}
                    </Card>
                )}
            </div>
        );
    };

    return (
        <div className="h-[calc(100dvh-30px)] overflow-y-auto overflow-x-hidden">
            <div className="flex flex-1 p-4 md:px-6">
                <div className="flex-1 flex-col space-y-6 w-full max-w-full">
                    <div className="w-full max-w-full p-4 sm:p-6 lg:p-8 flex flex-col">
                        {/* Navbar */}
                        <header className="mb-6">
                            <div className="flex items-center justify-between mb-4">

                                {fileName && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <FileSpreadsheet className="w-4 h-4" />
                                        <span className="font-medium">{fileName}</span>
                                    </div>
                                )}
                            </div>

                            {/* Tabs */}
                            <nav className="flex gap-1 bg-muted/30 p-1 rounded-lg w-fit">
                                {[
                                    { id: 'upload', label: 'Upload', icon: Upload },
                                    { id: 'analyze', label: 'Analyze', icon: Table2 },
                                    { id: 'visualize', label: 'Visualize', icon: Activity },
                                    { id: 'compare', label: 'Compare', icon: TrendingUp },
                                ].map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setActiveTab(t.id)}
                                        disabled={data.length === 0 && t.id !== 'upload'}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === t.id
                                            ? 'bg-background text-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                                            }`}
                                    >
                                        <t.icon className="w-4 h-4" /> {t.label}
                                    </button>
                                ))}
                            </nav>
                        </header>

                        {/* Content */}
                        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
                            {activeTab === 'upload' && renderUpload()}
                            {activeTab === 'analyze' && renderAnalyze()}
                            {activeTab === 'visualize' && renderVisualize()}
                            {activeTab === 'compare' && renderCompare()}
                        </main>
                    </div>
                </div>

                {/* --- Modals --- */}

                {/* 1. Stats Modal */}
                <Modal isOpen={isStatsModalOpen} onClose={() => setIsStatsModalOpen(false)} title="Data Statistics">
                    {stats && (
                        <div className=" grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {stats.map(s => (
                                <div key={s.column} className="p-4 bg-secondary/30 rounded-lg border border-border">
                                    <h4 className="font-bold text-sm text-primary mb-2">{s.column}</h4>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                        <span className="text-muted-foreground">Sum:</span> <span className="font-mono text-right">{s.sum}</span>
                                        <span className="text-muted-foreground">Mean:</span> <span className="font-mono text-right">{s.mean}</span>
                                        <span className="text-muted-foreground">Min:</span> <span className="font-mono text-right">{s.min}</span>
                                        <span className="text-muted-foreground">Max:</span> <span className="font-mono text-right">{s.max}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {!stats && <p>No numeric columns detected.</p>}
                </Modal>

                {/* 2. Advanced Filters Modal - Filter Builder */}
                <Modal isOpen={isAdvancedFilterModalOpen} onClose={() => setIsAdvancedFilterModalOpen(false)} title="Add Filter" size="lg">
                    <FilterBuilder
                        headers={headers}
                        data={data}
                        onAddFilter={(type, col, val, val2) => {
                            addFilter(type, col, val, val2);
                            setIsAdvancedFilterModalOpen(false);
                        }}
                        onCancel={() => setIsAdvancedFilterModalOpen(false)}
                    />
                </Modal>

            </div>
        </div>
    );
}
