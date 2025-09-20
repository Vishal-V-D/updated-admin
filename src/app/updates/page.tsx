'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Edit, Eye, MessageCircle, BarChart2, Plus, Trash2, FileText, ImageIcon, Table, List, Clock, AlertCircle, X } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

// Component to handle dynamic form based on content type
const RichTextEditor = ({
    content,
    setContent,
    onTemplateSelect,
}: {
    content: any[];
    setContent: (val: any[]) => void;
    onTemplateSelect: (template: string) => void;
}) => {
    const selectedTemplate = content.length > 0 ? content[0].type : 'text';

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = content.map((item, index) =>
            index === 0 ? { ...item, value: e.target.value } : item
        );
        setContent(newContent);
    };

    const handleTableCellChange = (e: React.ChangeEvent<HTMLInputElement>, rowIndex: number, colIndex: number) => {
        const newContent = content.map(item => {
            if (item.type === 'table') {
                const newTable = item.value.map((row: string[], rIdx: number) => {
                    if (rIdx === rowIndex) {
                        return row.map((cell: string, cIdx: number) => cIdx === colIndex ? e.target.value : cell);
                    }
                    return row;
                });
                return { ...item, value: newTable };
            }
            return item;
        });
        setContent(newContent);
    };

    const addTableRow = () => {
        const tableContent = content.find(item => item.type === 'table');
        if (tableContent) {
            const newRows = [...tableContent.value, Array(tableContent.value[0].length).fill('')];
            setContent(content.map(item => item.type === 'table' ? { ...item, value: newRows } : item));
        }
    };

    const removeTableRow = (rowIndex: number) => {
        const tableContent = content.find(item => item.type === 'table');
        if (tableContent && tableContent.value.length > 1) {
            const newRows = tableContent.value.filter((_: any, index: number) => index !== rowIndex);
            setContent(content.map(item => item.type === 'table' ? { ...item, value: newRows } : item));
        }
    };

    const addTableColumn = () => {
        const tableContent = content.find(item => item.type === 'table');
        if (tableContent) {
            const newRows = tableContent.value.map((row: string[]) => [...row, '']);
            setContent(content.map(item => item.type === 'table' ? { ...item, value: newRows } : item));
        }
    };

    const removeTableColumn = (colIndex: number) => {
        const tableContent = content.find(item => item.type === 'table');
        if (tableContent && tableContent.value[0].length > 1) {
            const newRows = tableContent.value.map((row: string[]) => row.filter((_: any, index: number) => index !== colIndex));
            setContent(content.map(item => item.type === 'table' ? { ...item, value: newRows } : item));
        }
    };

    const handleListInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newItems = e.target.value.split('\n');
        setContent([{ type: 'bulleted-list', value: newItems }]);
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Choose a Template:</label>
                <div className="flex gap-2 flex-wrap">
                    <Badge
                        variant={selectedTemplate === 'text' ? 'default' : 'secondary'}
                        className="cursor-pointer transition-colors"
                        onClick={() => onTemplateSelect('text')}
                    >
                        <ImageIcon className="w-4 h-4 mr-1" /> Text
                    </Badge>
                    <Badge
                        variant={selectedTemplate === 'table' ? 'default' : 'secondary'}
                        className="cursor-pointer transition-colors"
                        onClick={() => onTemplateSelect('table')}
                    >
                        <Table className="w-4 h-4 mr-1" /> Table
                    </Badge>
                    <Badge
                        variant={selectedTemplate === 'bulleted-list' ? 'default' : 'secondary'}
                        className="cursor-pointer transition-colors"
                        onClick={() => onTemplateSelect('bulleted-list')}
                    >
                        <List className="w-4 h-4 mr-1" /> Bulleted List
                    </Badge>
                </div>
            </div>

            {selectedTemplate === 'text' && (
                <Textarea
                    placeholder="Enter announcement content here..."
                    value={content[0]?.value || ''}
                    onChange={handleTextChange}
                    rows={8}
                    className="focus-visible:ring-indigo-500 transition-all duration-300 rounded-lg"
                />
            )}

            {selectedTemplate === 'table' && (
                <div className="space-y-2">
                    <p className="text-sm text-gray-500">Dynamically create your table.</p>
                    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-700">
                                    {content[0].value[0]?.map((_: any, colIndex: number) => (
                                        <th key={colIndex} className="p-2 w-1/4">
                                            <Button onClick={() => removeTableColumn(colIndex)} type="button" variant="ghost" size="sm" className="w-full text-xs text-red-500 hover:bg-transparent">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </th>
                                    ))}
                                    <th className="p-2 w-1/4">
                                        <Button onClick={addTableColumn} type="button" variant="ghost" size="sm" className="w-full text-xs text-blue-500 hover:bg-transparent">
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {content[0].value.map((row: string[], rowIndex: number) => (
                                    <tr key={rowIndex}>
                                        {row.map((cell: string, colIndex: number) => (
                                            <td key={colIndex} className="px-2 py-1">
                                                <Input
                                                    value={cell}
                                                    onChange={(e) => handleTableCellChange(e, rowIndex, colIndex)}
                                                    className="w-full text-sm rounded-md"
                                                />
                                            </td>
                                        ))}
                                        <td className="px-2 py-1">
                                            <Button onClick={() => removeTableRow(rowIndex)} type="button" variant="ghost" size="sm" className="text-xs text-red-500 hover:bg-transparent">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex space-x-2 mt-2">
                        <Button onClick={addTableRow} type="button" variant="outline" size="sm">Add Row</Button>
                        <Button onClick={addTableColumn} type="button" variant="outline" size="sm">Add Column</Button>
                    </div>
                </div>
            )}

            {selectedTemplate === 'bulleted-list' && (
                <div className="space-y-2">
                    <p className="text-sm text-gray-500">Enter each list item on a new line.</p>
                    <Textarea
                        placeholder="First item\nSecond item\nThird item"
                        value={content[0]?.value ? content[0].value.join('\n') : ''}
                        onChange={handleListInput}
                        rows={5}
                        className="focus-visible:ring-indigo-500 rounded-lg"
                    />
                </div>
            )}
        </div>
    );
};

const getAnnouncementContent = (announcement: any) => {
    if (announcement.data_json) {
        try {
            const parsed = JSON.parse(announcement.data_json);
            return Array.isArray(parsed) ? parsed : [{ type: 'text', value: JSON.stringify(parsed) }];
        } catch (e) {
            console.error("Failed to parse data_json:", e);
            return [{ type: 'text', value: announcement.content || 'No content found.' }];
        }
    }
    const contentArray: any[] = [];
    if (announcement.content) {
        contentArray.push({ type: 'text', value: announcement.content });
    }
    if (announcement.image_url) {
        contentArray.push({ type: 'image', value: announcement.image_url });
    }
    return contentArray;
};

const renderAnnouncementCard = (a: any, startEdit: (a: any) => void, handleDelete: (id: string) => void) => {
    const announcementContent = getAnnouncementContent(a);
    const getTableContent = (data: any) => {
        if (!Array.isArray(data) || data.length === 0) return null;
        return (
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-700">
                            {data[0]?.map((header: string, index: number) => (
                                <th key={index} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {data.slice(1).map((row: string[], rowIndex: number) => (
                            <tr key={rowIndex}>
                                {row.map((cell: string, cellIndex: number) => (
                                    <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };
    const getListContent = (data: any) => {
        if (!Array.isArray(data) || data.length === 0) return null;
        return (
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                {data.map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        );
    };

    return (
        <Card key={a.id} className="relative bg-white dark:bg-gray-800 shadow-lg rounded-2xl transition-transform transform hover:scale-[1.02] hover:shadow-xl">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">{a.title}</CardTitle>
                    {a.priority === 'Urgent' && (
                        <Badge variant="destructive" className="flex items-center space-x-1">
                            <AlertCircle className="h-4 w-4" />
                            <span>Urgent</span>
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {announcementContent.map((item: any, index: number) => {
                    if (item.type === 'image') {
                        return (
                            <img
                                key={index}
                                src={item.value}
                                alt={a.title}
                                className="w-full max-h-48 object-cover rounded-xl shadow-md"
                            />
                        );
                    }
                    if (item.type === 'file') {
                        return (
                            <div key={index} className="flex items-center space-x-2 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <FileText className="w-6 h-6 text-indigo-500" />
                                <a href={item.value} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                                    View Document
                                </a>
                            </div>
                        );
                    }
                    if (item.type === 'text') {
                        return <p key={index} className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{item.value}</p>;
                    }
                    if (item.type === 'table') {
                        return getTableContent(item.value);
                    }
                    if (item.type === 'bulleted-list') {
                        return getListContent(item.value);
                    }
                    return null;
                })}
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-2 space-x-4">
                    <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1 text-indigo-400" />
                        <span>{a.views || 0} views</span>
                    </div>
                    <div className="flex items-center">
                        <MessageCircle className="w-4 h-4 mr-1 text-purple-400" />
                        <span>{a.interactions || 0} interactions</span>
                    </div>
                    {a.scheduled_at && (
                        <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1 text-green-400" />
                            <span>Scheduled for: {new Date(a.scheduled_at).toLocaleString()}</span>
                        </div>
                    )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Posted on: {new Date(a.created_at).toLocaleString()}
                </p>
                <div className="flex space-x-2 mt-4">
                    <Button
                        onClick={() => startEdit(a)}
                        variant="outline"
                        size="sm"
                        className="flex-1 rounded-lg border-indigo-500 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-all duration-300"
                    >
                        <Edit className="w-4 h-4 mr-2" />
                        Update
                    </Button>
                    <Button
                        onClick={() => handleDelete(a.id)}
                        variant="outline"
                        size="sm"
                        className="flex-1 rounded-lg border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-gray-700 transition-all duration-300"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default function AnnouncementsPage() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState<any[]>([]);
    const [priority, setPriority] = useState<string>('Normal');
    const [scheduledAt, setScheduledAt] = useState<Date | undefined>(undefined);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<any | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [filterPriority, setFilterPriority] = useState<string>('All');

    const fetchAnnouncements = async () => {
        try {
            const res = await fetch('https://josaa-admin-backend-1.onrender.com/api/announcements');
            if (!res.ok) throw new Error('Failed to fetch announcements');
            const data = await res.json();
            setAnnouncements(data);
        } catch (err) {
            console.error('Failed to fetch announcements:', err);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const handleTemplateSelect = (template: string) => {
        if (template === 'table') {
            setContent([{ type: 'table', value: [['Header 1', 'Header 2'], ['Row 1 Col 1', 'Row 1 Col 2']] }]);
        } else if (template === 'bulleted-list') {
            setContent([{ type: 'bulleted-list', value: [''] }]);
        } else {
            setContent([{ type: 'text', value: '' }]);
        }
    };

    const loadPresetTemplate = (templateName: string) => {
        setIsEditMode(false);
        setEditingAnnouncement(null);
        setIsDialogOpen(true);

        if (templateName === 'exam-announcement') {
            setTitle('Exam Schedule & Instructions');
            setContent([
                { type: 'text', value: 'Dear Students,\n\nPlease find the official schedule and instructions for the upcoming exams below.' },
                { type: 'table', value: [['Subject', 'Date', 'Time'], ['Mathematics', '2025-10-25', '10:00 AM'], ['Physics', '2025-10-27', '02:00 PM']] }
            ]);
            setPriority('Urgent');
        } else if (templateName === 'college-schedule') {
            setTitle('College Event Calendar');
            setContent([
                { type: 'bulleted-list', value: ['2025-11-05: Annual Sports Day', '2025-11-12: Cultural Fest Registration Deadline', '2025-11-20: Parent-Teacher Meeting'] }
            ]);
            setPriority('Normal');
        } else {
            setTitle('');
            setContent([{ type: 'text', value: '' }]);
            setPriority('Normal');
        }
        setScheduledAt(undefined);
        setFile(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        let image_base64: string | null = null;

        try {
            if (file) {
                console.log("📄 Processing file:", file.name);
                image_base64 = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
                console.log("✅ File converted to base64.");
            }

            const payload: any = {
                title,
                data_json: content,
                priority,
                scheduled_at: scheduledAt ? scheduledAt.toISOString() : null,
                image_base64,
            };

            console.log("🚀 Sending payload to backend:", payload);

            const method = isEditMode ? 'PUT' : 'POST';
            const url = isEditMode
                ? `https://josaa-admin-backend-1.onrender.com/api/announcements/${editingAnnouncement.id}`
                : 'https://josaa-admin-backend-1.onrender.com/api/announcements';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error('❌ Failed to create/update announcement:', errorData);
                throw new Error(`Failed to ${isEditMode ? 'update' : 'create'} announcement: ${errorData.details || res.statusText}`);
            }

            console.log("✨ Announcement created/updated successfully.");
            setTitle('');
            setContent([]);
            setPriority('Normal');
            setScheduledAt(undefined);
            setFile(null);
            setIsEditMode(false);
            setEditingAnnouncement(null);
            setIsDialogOpen(false);
            fetchAnnouncements();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this announcement?")) {
            return;
        }
        try {
            const res = await fetch(`https://josaa-admin-backend-1.onrender.com/api/announcements/${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete announcement');
            fetchAnnouncements();
        } catch (err) {
            console.error('Failed to delete announcement:', err);
        }
    };

    const startEdit = (announcement: any) => {
        setEditingAnnouncement(announcement);
        setIsEditMode(true);
        setTitle(announcement.title);
        setPriority(announcement.priority || 'Normal');
        setScheduledAt(announcement.scheduled_at ? new Date(announcement.scheduled_at) : undefined);
        setContent(getAnnouncementContent(announcement));
        setFile(null);
        setIsDialogOpen(true);
    };

    const filteredAnnouncements = announcements.filter(a => {
        if (filterPriority === 'All') {
            return true;
        }
        return a.priority === filterPriority;
    });

    return (
        <PageContainer>
            <div className="flex-1 space-y-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-800 dark:text-gray-100">
                        Announcements
                    </h1>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => {
                                setIsEditMode(false);
                                setEditingAnnouncement(null);
                                setTitle('');
                                setContent([]);
                                setFile(null);
                                setPriority('Normal');
                                setScheduledAt(undefined);
                            }} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transition-transform transform hover:scale-105 rounded-full px-6 py-3">
                                <Plus className="w-5 h-5 mr-2" />
                                Create New
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[800px] p-8 bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="text-3xl font-bold text-center text-indigo-600 dark:text-indigo-400">
                                    {isEditMode ? 'Update Announcement' : 'Create New Announcement'}
                                </DialogTitle>
                                <DialogDescription className="text-center text-gray-500 dark:text-gray-400">
                                    {isEditMode ? 'Make changes to your announcement here.' : 'Create a new announcement for your users.'}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                                <Input
                                    placeholder="Title (Mandatory)"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    className="rounded-lg border-gray-300 dark:border-gray-700 focus-visible:ring-indigo-500"
                                />
                                <RichTextEditor content={content} setContent={setContent} onTemplateSelect={handleTemplateSelect} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Priority:</label>
                                        <Select value={priority} onValueChange={setPriority}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select priority" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Normal">Normal</SelectItem>
                                                <SelectItem value="Urgent">Urgent</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Schedule Post:</label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className="w-full justify-start text-left font-normal"
                                                >
                                                    <Clock className="mr-2 h-4 w-4" />
                                                    {scheduledAt ? format(scheduledAt, "PPP HH:mm") : <span>Pick a date and time</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={scheduledAt}
                                                    onSelect={setScheduledAt}
                                                    initialFocus
                                                />
                                                <div className="p-2 border-t">
                                                    <Input
                                                        type="time"
                                                        value={scheduledAt ? format(scheduledAt, 'HH:mm') : ''}
                                                        onChange={(e) => {
                                                            if (scheduledAt) {
                                                                const [hours, minutes] = e.target.value.split(':').map(Number);
                                                                const newDate = new Date(scheduledAt);
                                                                newDate.setHours(hours);
                                                                newDate.setMinutes(minutes);
                                                                setScheduledAt(newDate);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">File Upload (Optional):</label>
                                    <Input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                                        className="rounded-lg border-gray-300 dark:border-gray-700 focus-visible:ring-indigo-500"
                                    />
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {file && (
                                            <Badge variant="secondary" className="flex items-center space-x-1">
                                                <span>{file.name}</span>
                                                <X className="w-3 h-3 cursor-pointer" onClick={() => setFile(null)} />
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-transform transform hover:scale-105">
                                        {loading ? 'Processing...' : (isEditMode ? 'Update Announcement' : 'Post Announcement')}
                                    </Button>
                                    {isEditMode && (
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setIsEditMode(false);
                                                setEditingAnnouncement(null);
                                                setTitle('');
                                                setContent([]);
                                                setFile(null);
                                                setPriority('Normal');
                                                setScheduledAt(undefined);
                                                setIsDialogOpen(false);
                                            }}
                                            className="rounded-lg border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Separator className="bg-gray-300 dark:bg-gray-700 h-px" />

                {/* Analytics Section */}
                <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg rounded-2xl transition-all duration-300 hover:shadow-xl">
                    <CardTitle className="text-xl font-semibold mb-4 flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                        <BarChart2 className="w-6 h-6" /> Analytics
                    </CardTitle>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="p-4 bg-indigo-50 dark:bg-gray-700 rounded-xl shadow-sm transition-transform transform hover:scale-105">
                            <p className="text-3xl font-bold text-indigo-700 dark:text-white">150</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Views</p>
                        </div>
                        <div className="p-4 bg-indigo-50 dark:bg-gray-700 rounded-xl shadow-sm transition-transform transform hover:scale-105">
                            <p className="text-3xl font-bold text-indigo-700 dark:text-white">45</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Interactions</p>
                        </div>
                        <div className="p-4 bg-indigo-50 dark:bg-gray-700 rounded-xl shadow-sm transition-transform transform hover:scale-105">
                            <p className="text-3xl font-bold text-indigo-700 dark:text-white">5</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">New in Last 24h</p>
                        </div>
                        <div className="p-4 bg-indigo-50 dark:bg-gray-700 rounded-xl shadow-sm transition-transform transform hover:scale-105">
                            <p className="text-3xl font-bold text-indigo-700 dark:text-white">75%</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Engagement Rate</p>
                        </div>
                    </div>
                </Card>

                {/* Templates Section */}
                <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg rounded-2xl transition-all duration-300 hover:shadow-xl">
                    <CardTitle className="text-xl font-semibold mb-4 flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                        <List className="w-6 h-6" /> Ready-to-use Templates
                    </CardTitle>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Card onClick={() => loadPresetTemplate('exam-announcement')} className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-lg">Exam Announcement</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Create an announcement with exam dates and times.</p>
                            </CardContent>
                        </Card>
                        <Card onClick={() => loadPresetTemplate('college-schedule')} className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-lg">College Schedule</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Share important dates for college events and deadlines.</p>
                            </CardContent>
                        </Card>
                    </div>
                </Card>

                <Separator className="bg-gray-300 dark:bg-gray-700 h-px" />

                {/* Announcements List */}
                <h2 className="text-2xl font-bold tracking-tight text-gray-800 dark:text-gray-100 mb-4">All Announcements</h2>
                <div className="flex items-center space-x-4 mb-4">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Priority:</label>
                    <Select value={filterPriority} onValueChange={setFilterPriority}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All</SelectItem>
                            <SelectItem value="Normal">Normal</SelectItem>
                            <SelectItem value="Urgent">Urgent</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="h-[600px] overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAnnouncements.map((a) => renderAnnouncementCard(a, startEdit, handleDelete))}
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}
