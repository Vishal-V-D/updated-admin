'use client';

import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { IconArrowLeft, IconGauge, IconEdit, IconTrash, IconPlus, IconReplace, IconGripVertical } from '@tabler/icons-react';
import PageContainer from '@/components/layout/page-container';
import { toast } from 'sonner';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Define TypeScript Interfaces for a more robust data structure
interface SectionContentItem {
  type: 'paragraph' | 'points' | 'table';
  text?: string;
  list?: string[];
  data?: any[];
}

interface Section {
  id: string;
  key: string;
  content: any;
}

interface FetchedExamData {
  id: string;
  uuid: string;
  [key: string]: any;
}

// Draggable Item Component
// Fixed SortableItem Component
function SortableItem({ section, handleEdit, handleDelete, editSectionKey, tempSectionContent, setTempSectionContent, handleSave, handleCancel, highlightText }: {
  section: Section,
  handleEdit: (key: string) => void,
  handleDelete: (key: string) => void,
  editSectionKey: string | null,
  tempSectionContent: any,
  setTempSectionContent: (content: any) => void,
  handleSave: () => void,
  handleCancel: () => void,
  highlightText: (text: string) => React.ReactNode,

}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
  };

  const isEditingThisSection = editSectionKey === section.key;
  
  console.log('Rendering SortableItem for:', section.key);
  console.log('Is editing this section:', isEditingThisSection);
  console.log('Section content:', section.content);

  if (isEditingThisSection) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="p-4 bg-secondary rounded-lg my-4 border border-primary relative"
      >
        <div className="absolute top-2 right-2 cursor-grab text-muted-foreground" {...listeners} {...attributes}>
          <IconGripVertical size={20} />
        </div>
        <h4 className="text-md font-semibold text-secondary-foreground mb-2">Editing: {section.key}</h4>
        <Textarea
          className="w-full h-64 p-4 border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary bg-muted text-foreground"
          value={tempSectionContent || ''}
          onChange={(e) => setTempSectionContent(e.target.value)}
        />
        <div className="flex justify-end space-x-2 mt-4">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    );
  }

  const sectionData = section.content;
  console.log('Processing section data:', sectionData);

  // Helper function to render array content
  const renderArrayContent = (content: any[]) => {
    return (
      <div className="mt-2 space-y-4">
        {content.map((item: any, itemIndex: number) => (
          <div key={itemIndex}>
            {/* Handle different item structures */}
            {typeof item === 'string' && (
              <p className="text-muted-foreground leading-relaxed">
                {highlightText(item)}
              </p>
            )}
            {typeof item === 'object' && item !== null && (
              <>
                {item.type === "paragraph" && item.text && (
                  <p className="text-muted-foreground leading-relaxed">
                    {highlightText(item.text)}
                  </p>
                )}
                {item.type === "points" && Array.isArray(item.list) && (
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    {item.list.map((point: string, pIndex: number) => (
                      <li key={pIndex} className="leading-relaxed">
                        {highlightText(point)}
                      </li>
                    ))}
                  </ul>
                )}
                {item.type === "table" && Array.isArray(item.data) && item.data.length > 0 && (
                  <div className="overflow-x-auto mt-4 rounded-lg border border-border">
                    <table className="w-full text-sm text-left text-muted-foreground">
                      <thead className="text-xs text-secondary-foreground uppercase bg-secondary">
                        <tr>
                          {Object.keys(item.data[0]).map((header, hIndex) => (
                            <th key={hIndex} scope="col" className="px-6 py-3">{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {item.data.map((row: Record<string, any>, rIndex: number) => (
                          <tr key={rIndex} className="bg-background border-b border-border hover:bg-secondary transition-colors">
                            {Object.keys(row).map((header, cIndex) => (
                              <td key={cIndex} className="px-6 py-4">{highlightText(row[header])}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {/* Handle plain objects (like table data without type wrapper) */}
                {!item.type && typeof item === 'object' && (
                  <div className="text-muted-foreground leading-relaxed">
                    <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                      {JSON.stringify(item, null, 2)}
                    </pre>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Handle direct array content (this is likely your case)
  if (Array.isArray(sectionData)) {
    console.log('Section data is a direct array, rendering...');
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`p-4 bg-secondary rounded-lg my-4 flex justify-between items-start relative ${isDragging ? 'opacity-50' : ''}`}
      >
        <div className="absolute top-2 right-2 cursor-grab text-muted-foreground" {...listeners} {...attributes}>
          <IconGripVertical size={20} />
        </div>
        <div className="flex-1 pr-10">
          <h4 className="text-md font-semibold text-secondary-foreground">{highlightText(section.key)}</h4>
          {renderArrayContent(sectionData)}
        </div>
        <div className="flex space-x-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={() => handleEdit(section.key)}>
            <IconEdit size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(section.key)}>
            <IconTrash size={16} className="text-destructive" />
          </Button>
        </div>
      </div>
    );
  }

  // Handle the specific case of a paragraph with a nested table
  if (sectionData.type === 'paragraph' && sectionData.data?.type === 'table') {
    const paragraphText = sectionData.content;
    const tableContent = sectionData.data.data;
    
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`p-4 bg-secondary rounded-lg my-4 flex justify-between items-start relative ${isDragging ? 'opacity-50' : ''}`}
      >
        <div className="absolute top-2 right-2 cursor-grab text-muted-foreground" {...listeners} {...attributes}>
          <IconGripVertical size={20} />
        </div>
        <div className="flex-1 pr-10">
          <h4 className="text-md font-semibold text-secondary-foreground">{highlightText(section.key)}</h4>
          <p className="text-muted-foreground mt-2 leading-relaxed">
            {highlightText(paragraphText)}
          </p>
          {Array.isArray(tableContent) && tableContent.length > 0 && (
            <div className="overflow-x-auto mt-4 rounded-lg border border-border">
              <table className="w-full text-sm text-left text-muted-foreground">
                <thead className="text-xs text-secondary-foreground uppercase bg-secondary">
                  <tr>
                    {Object.keys(tableContent[0]).map((header, hIndex) => (
                      <th key={hIndex} scope="col" className="px-6 py-3">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableContent.map((row: Record<string, any>, rIndex: number) => (
                    <tr key={rIndex} className="bg-background border-b border-border hover:bg-secondary transition-colors">
                      {Object.keys(row).map((header, cIndex) => (
                        <td key={cIndex} className="px-6 py-4">{highlightText(row[header])}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="flex space-x-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={() => handleEdit(section.key)}>
            <IconEdit size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(section.key)}>
            <IconTrash size={16} className="text-destructive" />
          </Button>
        </div>
      </div>
    );
  }

  // Handle the new, simple data structure with type and content
  if (typeof sectionData === 'object' && sectionData.type) {
    const { type, content } = sectionData;
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`p-4 bg-secondary rounded-lg my-4 flex justify-between items-start relative ${isDragging ? 'opacity-50' : ''}`}
      >
        <div className="absolute top-2 right-2 cursor-grab text-muted-foreground" {...listeners} {...attributes}>
          <IconGripVertical size={20} />
        </div>
        <div className="flex-1 pr-10">
          <h4 className="text-md font-semibold text-secondary-foreground">{highlightText(section.key)}</h4>
          {type === 'paragraph' && content && (
            <p className="text-muted-foreground mt-2 leading-relaxed">
              {highlightText(content)}
            </p>
          )}
          {type === 'points' && Array.isArray(content) && (
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-2">
              {content.map((point: string, pIndex: number) => (
                <li key={pIndex} className="leading-relaxed">
                  {highlightText(point)}
                </li>
              ))}
            </ul>
          )}
          {type === 'table' && Array.isArray(content) && content.length > 0 && (
            <div className="overflow-x-auto mt-4 rounded-lg border border-border">
              <table className="w-full text-sm text-left text-muted-foreground">
                <thead className="text-xs text-secondary-foreground uppercase bg-secondary">
                  <tr>
                    {Object.keys(content[0]).map((header, hIndex) => (
                      <th key={hIndex} scope="col" className="px-6 py-3">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {content.map((row: Record<string, any>, rIndex: number) => (
                    <tr key={rIndex} className="bg-background border-b border-border hover:bg-secondary transition-colors">
                      {Object.keys(row).map((header, cIndex) => (
                        <td key={cIndex} className="px-6 py-4">{highlightText(row[header])}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="flex space-x-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={() => handleEdit(section.key)}>
            <IconEdit size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(section.key)}>
            <IconTrash size={16} className="text-destructive" />
          </Button>
        </div>
      </div>
    );
  }
  
  // Handle nested object structure (like {mainKey: [array of items]})
  if (typeof sectionData === 'object' && sectionData !== null) {
    console.log("Section data is a nested object. Processing...");
    const mainKey = Object.keys(sectionData)[0];
    const mainContent = sectionData[mainKey];

    if (Array.isArray(mainContent)) {
      return (
        <div
          ref={setNodeRef}
          style={style}
          className={`p-4 bg-secondary rounded-lg my-4 flex justify-between items-start relative ${isDragging ? 'opacity-50' : ''}`}
        >
          <div className="absolute top-2 right-2 cursor-grab text-muted-foreground" {...listeners} {...attributes}>
            <IconGripVertical size={20} />
          </div>
          <div className="flex-1 pr-10">
            <h4 className="text-md font-semibold text-secondary-foreground">{highlightText(section.key)}</h4>
            <h5 className="text-sm font-medium text-secondary-foreground mt-2">{highlightText(mainKey)}</h5>
            {renderArrayContent(mainContent)}
          </div>
          <div className="flex space-x-2 shrink-0">
            <Button variant="ghost" size="sm" onClick={() => handleEdit(section.key)}>
              <IconEdit size={16} />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleDelete(section.key)}>
              <IconTrash size={16} className="text-destructive" />
            </Button>
          </div>
        </div>
      );
    }

    // Handle non-array nested content
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`p-4 bg-secondary rounded-lg my-4 flex justify-between items-start relative ${isDragging ? 'opacity-50' : ''}`}
      >
        <div className="absolute top-2 right-2 cursor-grab text-muted-foreground" {...listeners} {...attributes}>
          <IconGripVertical size={20} />
        </div>
        <div className="flex-1 pr-10">
          <h4 className="text-md font-semibold text-secondary-foreground">{highlightText(section.key)}</h4>
          <div className="text-muted-foreground mt-2">
            <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
              {JSON.stringify(sectionData, null, 2)}
            </pre>
          </div>
        </div>
        <div className="flex space-x-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={() => handleEdit(section.key)}>
            <IconEdit size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(section.key)}>
            <IconTrash size={16} className="text-destructive" />
          </Button>
        </div>
      </div>
    );
  }

  // Fallback for any other structure - show as JSON instead of returning null
  console.log("Fallback render for section:", section.key, "with content:", sectionData);
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 bg-secondary rounded-lg my-4 flex justify-between items-start relative ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="absolute top-2 right-2 cursor-grab text-muted-foreground" {...listeners} {...attributes}>
        <IconGripVertical size={20} />
      </div>
      <div className="flex-1 pr-10">
        <h4 className="text-md font-semibold text-secondary-foreground">{highlightText(section.key)}</h4>
        <div className="text-muted-foreground mt-2">
          <p className="text-sm text-yellow-600 mb-2">Unknown data structure - showing raw content:</p>
          <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
            {JSON.stringify(sectionData, null, 2)}
          </pre>
        </div>
      </div>
      <div className="flex space-x-2 shrink-0">
        <Button variant="ghost" size="sm" onClick={() => handleEdit(section.key)}>
          <IconEdit size={16} />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => handleDelete(section.key)}>
          <IconTrash size={16} className="text-destructive" />
        </Button>
      </div>
    </div>
  );
}

// Main Page Component
export default function EditExamPage() {
  const router = useRouter();
  const params = useParams();
  const uuid = params?.uuid as string;

  const [initialLoading, setInitialLoading] = useState(true);
  const [examData, setExamData] = useState<FetchedExamData | null>(null);
  const [activeTab, setActiveTab] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editSectionKey, setEditSectionKey] = useState<string | null>(null);
  const [tempSectionContent, setTempSectionContent] = useState<any>(null);

  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [wordCount, setWordCount] = useState(0);

  // New state for adding sections
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionType, setNewSectionType] = useState('paragraph');
  const [newSectionContent, setNewSectionContent] = useState('');
  const [showAddSectionForm, setShowAddSectionForm] = useState(false);
  
  // New state for sectionsArray to be the source of truth for rendering
  const [sectionsArray, setSectionsArray] = useState<Section[]>([]);


  // Drag and Drop state
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // List of fields to show in the "Basic Details" card
  const basicDetailsFields = ['id', 'uuid', 'Name', 'Exam Code', 'Exam Type', 'Category', 'Mode of Exam', 'Official Website', 'Organizing Body', 'Applylink', 'Application Period', 'Seats', 'Fee', 'State/Region', 'InstituteName'];

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchExamData = async () => {
      console.log('Step 1: Fetching exam data for UUID:', uuid);
      if (!uuid) {
        setInitialLoading(false);
        return;
      }
      setInitialLoading(true);

      try {
        const response = await fetch(`https://josaa-admin-backend-1.onrender.com/exams/${uuid}`);
        if (!response.ok) throw new Error('Failed to fetch exam data');

        const exam = await response.json();
        console.log('Step 2: Fetched exam data successfully:', exam);
        setExamData(exam.data);
        
        // Set initial tab to the first content-rich tab
        const firstTab = Object.keys(exam.data).find(key => !basicDetailsFields.includes(key));
        if (firstTab) {
          console.log('Step 3: Setting initial active tab:', firstTab);
          setActiveTab(firstTab);
          // The sectionsArray will be populated by the next useEffect, which is triggered by this state change.
        }
      } catch (error) {
        console.error('Error fetching exam data:', error);
        toast.error('Failed to load exam data');
        setError('Failed to load exam data.');
        router.push('/admin/exams');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchExamData();
  }, [uuid, router]);
  
  // This useEffect updates sectionsArray whenever a new tab is selected or the exam data is fetched
  useEffect(() => {
    console.log('Step 4: activeTab or examData changed. Updating sectionsArray.');
    console.log('Current activeTab:', activeTab);
    console.log('examData[activeTab]:', examData && examData[activeTab]);

    if (examData && examData[activeTab]) {
      const fetchedContent = examData[activeTab];
      
      // Check if the content is a simple object with a single key (e.g., {"Pattern": [...]})
      if (typeof fetchedContent === 'object' && Object.keys(fetchedContent).length === 1) {
          console.log('Step 4.1: Found a single-keyed object structure. Treating it as a single section.');
          const sectionsAsArray = Object.entries(fetchedContent).map(([key, content]) => ({
              id: key, 
              key: key,
              content: content
          }));
          setSectionsArray(sectionsAsArray);
          setShowAddSectionForm(sectionsAsArray.length === 0);
      } else {
          // Fallback for other structures (e.g., multiple key-value pairs at the top level)
          const sectionsAsArray = Object.entries(fetchedContent).map(([key, content]) => ({
              id: key, // Using key as a unique ID for dnd-kit
              key: key,
              content: content
          }));
          console.log('Step 4.2: Found a multi-keyed object structure. Populating sectionsArray:', sectionsAsArray);
          setSectionsArray(sectionsAsArray);
          setShowAddSectionForm(sectionsAsArray.length === 0);
      }
    } else {
        console.log('Step 4.3: No content found for the active tab. Clearing sectionsArray.');
        setSectionsArray([]);
        // We do not want to automatically show the form anymore. The user can toggle it.
    }
  }, [examData, activeTab]);

  useEffect(() => {
    if (findText.length > 0 && examData && examData[activeTab]) {
      const contentString = JSON.stringify(examData[activeTab]);
      const regex = new RegExp(findText, 'gi');
      const matches = contentString.match(regex);
      setWordCount(matches ? matches.length : 0);
      console.log('Find/Replace: Found', wordCount, 'matches for text:', findText);
    } else {
      setWordCount(0);
    }
  }, [findText, examData, activeTab, wordCount]);

  const handleChange = (field: string, value: any) => {
    console.log('Updating basic detail field:', field, 'with value:', value);
    setExamData(prev => prev ? ({ ...prev, [field]: value }) : null);
  };
  
  const handleContentChange = (tab: string, content: any) => {
    console.log(`Updated content for tab '${tab}':`, content);
  };
  
  const handleReplaceAll = () => {
    console.log('Initiating Replace All:', findText, '->', replaceText);
    if (!findText || !replaceText) {
      toast.error('Please enter both "Find" and "Replace" text.');
      return;
    }

    const dataCopy = JSON.parse(JSON.stringify(examData));
    
    const replaceInObject = (obj: any) => {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          obj[key] = obj[key].replace(new RegExp(findText, 'gi'), replaceText);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          replaceInObject(obj[key]);
        }
      }
    };

    replaceInObject(dataCopy);
    setExamData(dataCopy);
    setFindText('');
    setReplaceText('');
    toast.success(`Successfully replaced all occurrences of "${findText}".`);
    console.log('Replace All complete. New examData state:', dataCopy);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting form. Current examData state:', examData);
    if (!examData) return;
    
    // Convert the current sectionsArray to an object to be saved
    interface Section {
  key: string;
  content: string[]; // adjust type if content is not string[]
}

const reorderedTabContent = sectionsArray.reduce<Record<string, string[]>>(
  (acc, current) => {
    acc[current.key] = current.content;
    return acc;
  },
  {} // now typed as Record<string, string[]>
);

console.log('Reordered tab content for active tab:', reorderedTabContent);


    const updatedExamData = {
        ...examData,
        [activeTab]: reorderedTabContent
    };

    // Separate basic details and content details
    const basic_data: Record<string, any> = {};
    const full_details: Record<string, any> = {};
    
    for (const key in updatedExamData) {
      if (basicDetailsFields.includes(key)) {
        basic_data[key] = updatedExamData[key];
      } else {
        full_details[key] = updatedExamData[key];
      }
    }
    
    // Construct the payload as expected by the backend
    const dataToSubmit = {
      basic_data,
      full_details,
    };
    console.log('Payload to be submitted:', dataToSubmit);

    try {
      const response = await fetch(`https://josaa-admin-backend-1.onrender.com/exams/${uuid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSubmit),
      });
      if (!response.ok) throw new Error('Failed to update exam');
      toast.success('Exam updated successfully!');
      
      console.log('Update successful!');
    } catch (error) {
      console.error('Error updating exam:', error);
      toast.error('Failed to update exam. Please try again.');
    }
  };

  const handleEditSection = (key: string) => {
    console.log('Editing section with key:', key);
    const sectionToEdit = sectionsArray.find(s => s.key === key);
    if (sectionToEdit) {
      setEditSectionKey(key);
      setTempSectionContent(JSON.stringify(sectionToEdit.content, null, 2));
      console.log('Populated edit form with content:', JSON.stringify(sectionToEdit.content, null, 2));
    }
  };
  
  const handleSaveSection = () => {
    console.log('Saving section edit for key:', editSectionKey);
    if (!editSectionKey) return;
    try {
      const newSectionContent = JSON.parse(tempSectionContent);
      console.log('Parsed new content:', newSectionContent);
      
      const updatedSectionsArray = sectionsArray.map(section => {
          if(section.key === editSectionKey) {
              return { ...section, content: newSectionContent };
          }
          return section;
      });

      setSectionsArray(updatedSectionsArray);

      setEditSectionKey(null);
      setTempSectionContent(null);
      toast.success('Section updated successfully! Please click "Update All Content" to save changes.');
      console.log('Section state updated in component. New sectionsArray:', updatedSectionsArray);
    } catch (err) {
      console.error('JSON parsing error:', err);
      toast.error('Invalid JSON format. Please correct and try again.');
    }
  };

  const handleCancelEdit = () => {
    console.log('Canceling section edit.');
    setEditSectionKey(null);
    setTempSectionContent(null);
  };
  
  const handleDeleteSection = (key: string) => {
    console.log('Attempting to delete section with key:', key);
    if (window.confirm('Are you sure you want to delete this section?')) {
      const newSectionsArray = sectionsArray.filter(section => section.key !== key);
      setSectionsArray(newSectionsArray);
      
      toast.success('Section deleted successfully! Please click "Update All Content" to save changes.');
      console.log('Section deleted from state. New sectionsArray:', newSectionsArray);
    }
  };
  
  const parseSimpleTable = (text: string) => {
    console.log('Parsing simple table from text:', text);
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const data: any[] = [];
    
    if (lines.length === 0) return data;

    // Use a more robust split regex that handles tabs and multiple spaces
    const headers = lines[0].split(/\t|\s{2,}/).map(p => p.trim()).filter(p => p.length > 0);
    if (headers.length === 0) return data;
    
    // Parse the remaining lines as data
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const parts = line.split(/\t|\s{2,}/).map(p => p.trim()).filter(p => p.length > 0);
        if (parts.length === headers.length) {
            const row: Record<string, any> = {};
            parts.forEach((part, index) => {
                row[headers[index]] = part;
            });
            data.push(row);
        } else {
            console.warn(`Skipping line due to column mismatch: "${line}"`);
        }
    }
    console.log('Parsed table data:', data);
    return data;
  };

  const handleAddSection = () => {
    console.log('Adding new section with title:', newSectionTitle, 'and type:', newSectionType);
    if (!newSectionTitle || !newSectionContent) {
      toast.error('Please enter a title and content for the new section.');
      return;
    }

    let newContent: any;

    if (newSectionType === 'paragraph') {
      newContent = newSectionContent;
    } else if (newSectionType === 'points') {
      newContent = newSectionContent.split('\n').map(line => line.trim());
    } else { // Handle 'table' type
      let parsedData;
      try {
        parsedData = JSON.parse(newSectionContent);
        if (!Array.isArray(parsedData) || (parsedData.length > 0 && typeof parsedData[0] !== 'object')) {
          throw new Error('Table content must be a JSON array of objects.');
        }
      } catch (jsonErr) {
        parsedData = parseSimpleTable(newSectionContent);
        if (!parsedData || parsedData.length === 0) {
          toast.error('Invalid content format. Please enter valid JSON or a simple text table, with headers on the first line and each row on a new line.');
          return;
        }
      }
      newContent = parsedData;
    }
    
    // Create the new section with type and content at the top level
    const newSection = {
      id: newSectionTitle, // Use the title as the ID
      key: newSectionTitle,
      content: {
        type: newSectionType,
        content: newContent,
      }
    };
    
    // Add new section to the sectionsArray
    setSectionsArray(prev => [...prev, newSection]);
    
    // Clear form fields and hide the form
    setNewSectionTitle('');
    setNewSectionType('paragraph');
    setNewSectionContent('');
    setShowAddSectionForm(false);
    toast.success('New section added successfully! Please click "Update All Content" to save changes.');
    console.log('New section added to state. Current sectionsArray:', [...sectionsArray, newSection]);
  };

  const highlightText = (text: string) => {
    if (!findText || typeof text !== 'string') return text;
    const parts = text.split(new RegExp(`(${findText})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === findText.toLowerCase() ? (
        <span key={index} className="bg-yellow-200">{part}</span>
      ) : (
        part
      )
    );
  };
  
  const handleDragEnd = (event: any) => {
    console.log('Drag ended. Active ID:', event.active.id, 'Over ID:', event.over.id);
    const { active, over } = event;
    if (active.id !== over.id) {
      setSectionsArray((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newArray = arrayMove(items, oldIndex, newIndex);
        console.log('Array reordered:', newArray);
        return newArray;
      });
    }
  };

  const renderSectionContent = () => {
    console.log('Rendering section content. sectionsArray length:', sectionsArray.length);
    if (initialLoading) {
        return (
            <div className="flex justify-center items-center py-16">
                <svg
                    className="animate-spin h-10 w-10 text-primary"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                    ></path>
                </svg>
            </div>
        );
    }
    if (error) {
        return <div className="p-8 text-center text-destructive">{error}</div>;
    }
    
    if (sectionsArray.length === 0) {
      console.log('No sections to display. Prompting user to add one.');
      return (
          <div className="p-8 text-center text-muted-foreground">
              No content found for this section. Click "Add New Section" to get started.
          </div>
      );
    }
    
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sectionsArray.map(s => s.id)}>
          <section id="dynamic-content" className="mb-8 space-y-6">
            {sectionsArray.map((section) => (
              <SortableItem
                key={section.id}
                section={section}
                handleEdit={handleEditSection}
                handleDelete={handleDeleteSection}
                editSectionKey={editSectionKey}
                tempSectionContent={tempSectionContent}
                setTempSectionContent={setTempSectionContent}
                handleSave={handleSaveSection}
                handleCancel={handleCancelEdit}
                highlightText={highlightText}
              />
            ))}
          </section>
        </SortableContext>
      </DndContext>
    );
  };
  
  // This is the key change to ensure tabs are always visible
  const getTabs = () => {
    // Hardcoded list of default tabs
    const defaultTabs = [
      'About',
      'Exam Dates',
      'Eligibility Criteria',
      'Exam Pattern & Syllabus',
      'Yearly Cutoff',
      'Application Fee',
      'Resources',
    ];

    if (!examData) return defaultTabs;
    
    const allKeys = Object.keys(examData);
    const contentKeys = allKeys.filter(key => !basicDetailsFields.includes(key));
    
    // Combine the default tabs with any other content keys that might exist
    const combinedTabs = Array.from(new Set([...defaultTabs, ...contentKeys]));
    
    console.log('Available tabs:', combinedTabs);
    return combinedTabs;
  };

  const tabs = getTabs();
  
  // Set the default tab to the first one in the new combined list if none is active
  useEffect(() => {
    if (!activeTab && tabs.length > 0) {
      setActiveTab(tabs[0]);
    }
  }, [tabs, activeTab]);

  return (
    <PageContainer>
      <div className="space-y-6 w-full">
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="text-lg">
            <IconArrowLeft className="mr-2" /> Back
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-primary">Edit Exam: {examData?.Name || 'Loading...'}</h1>
          <div className="w-20"></div>
        </div>

        {/* New "Replace All" Card */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center">
              <IconReplace className="mr-2" />
              Replace All
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="find-text">Find</Label>
                <Input
                  id="find-text"
                  placeholder="Enter word to find"
                  value={findText}
                  onChange={(e) => setFindText(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="replace-text">Replace with</Label>
                <Input
                  id="replace-text"
                  placeholder="Enter replacement word"
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Found: <span className="font-semibold text-foreground">{wordCount}</span> instances
              </span>
              <Button onClick={handleReplaceAll} disabled={!findText}>
                Replace All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Basic Exam Details section */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Basic Exam Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {examData && basicDetailsFields.filter(f => f !== 'id' && f !== 'uuid').map(field => {
                const value = examData[field];
                if (typeof value === 'object' && value !== null) {
                  return null;
                }
                return (
                  <div key={field}>
                    <Label htmlFor={field}>{field}</Label>
                    <Input
                      id={field}
                      value={value || ''}
                      onChange={(e) => handleChange(field, e.target.value)}
                      placeholder={`Enter ${field}`}
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit">
              <IconGauge size={16} className="mr-2" />
              Update Basic Details
            </Button>
          </div>
        </form>

        {/* Preview of Content section */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Preview of Content</CardTitle>
          </CardHeader>
          <CardContent>
           <div className="flex justify-between items-center border-b border-border mb-4">
              <ul className="flex space-x-2 sm:space-x-6 overflow-x-auto h-16 items-center">
                {tabs.map(tab => (
                  <li
                    key={tab}
                    className={`font-bold pb-2 cursor-pointer whitespace-nowrap ${
                      activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => {
                      console.log('Tab clicked:', tab);
                      setActiveTab(tab);
                      setEditSectionKey(null);
                    }}
                  >
                    {tab}
                  </li>
                ))}
              </ul>
              {sectionsArray.length > 0 && (
                  <Button onClick={handleSubmit}>
                      <IconGauge size={16} className="mr-2" />
                      Update All Content
                  </Button>
              )}
            </div>
            
            {renderSectionContent()}
            
            <div className="mt-4 flex justify-end">
                <Button onClick={() => setShowAddSectionForm(!showAddSectionForm)} variant="secondary">
                  <IconPlus size={16} className="mr-2" />
                  {showAddSectionForm ? 'Cancel Add Section' : 'Add New Section'}
                </Button>
            </div>
            
            {showAddSectionForm && (
                <Card className="mt-4 mb-8">
                  <CardHeader>
                    <CardTitle>Add New Section</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="new-section-title">Section Title</Label>
                      <Input
                        id="new-section-title"
                        value={newSectionTitle}
                        onChange={(e) => setNewSectionTitle(e.target.value)}
                        placeholder="e.g., Exam Pattern"
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-section-type">Section Type</Label>
                      <select
                        id="new-section-type"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={newSectionType}
                        onChange={(e) => setNewSectionType(e.target.value)}
                      >
                        <option value="paragraph">Paragraph</option>
                        <option value="points">Points List</option>
                        <option value="table">Table</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="new-section-content">
                        Content
                        <span className="text-muted-foreground">
                          {newSectionType === 'points' && ' (one item per line)'}
                          {newSectionType === 'table' && ' (Enter table data with headers. Use tabs or multiple spaces to separate columns.)'}
                        </span>
                      </Label>
                      <Textarea
                        id="new-section-content"
                        value={newSectionContent}
                        onChange={(e) => setNewSectionContent(e.target.value)}
                        placeholder={
                          newSectionType === 'paragraph'
                            ? 'Enter the paragraph content here.'
                            : newSectionType === 'points'
                            ? 'Enter each point on a new line.'
                            : 'First line: Description Column1 Column2\\nSecond line: Up to 3 subjects\\t₹1000/-\\t₹900/-'
                        }
                      />
                    </div>
                    <Button onClick={handleAddSection}>
                      <IconPlus size={16} className="mr-2" />
                      Add New Section
                    </Button>
                  </CardContent>
                </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}