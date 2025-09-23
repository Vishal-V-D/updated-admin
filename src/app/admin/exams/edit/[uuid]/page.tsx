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
import { IconArrowLeft, IconGauge, IconEdit,IconFolderPlus, IconTrash, IconPlus, IconReplace, IconGripVertical, IconLoader } from '@tabler/icons-react';
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

interface MultipleSection {
  id: string;
  mainTitle: string;
  subsections: {
    id: string;
    subtitle?: string; // Made optional
    type: string;
    content: string;
  }[];
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

  // Helper function to render text with line breaks
  const renderTextWithLineBreaks = (text: string) => {
    if (!text || typeof text !== 'string') return text;
    
    const lines = text.split('\n');
    
    return lines.map((line, index) => (
      <React.Fragment key={index}>
        {highlightText(line)}
        {index < lines.length - 1 && <br />}
      </React.Fragment>
    ));
  };

  // Enhanced edit form with line break support
  if (isEditingThisSection) {
    // Helper function to get formatting hints
    const getFormatHints = () => {
      if (section.content?.type === 'paragraph' || typeof section.content === 'string') {
        return (
          <div className="text-xs text-muted-foreground mb-2 p-2 bg-muted rounded">
            <strong>Formatting Tips:</strong>
            <br />• Press Enter once to create a line break
            <br />• Press Enter twice to create paragraph spacing
            <br />• Line breaks will be preserved in display
          </div>
        );
      } else if (section.content?.type === 'points') {
        return (
          <div className="text-xs text-muted-foreground mb-2 p-2 bg-muted rounded">
            <strong>Points Format:</strong>
            <br />• Each line becomes a bullet point
            <br />• Empty lines will be ignored
            <br />• No need to add bullet symbols
          </div>
        );
      }
      return null;
    };

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
        
        {getFormatHints()}
        
        <Textarea
          className="w-full h-64 p-4 border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground font-mono text-sm leading-relaxed"
          value={tempSectionContent || ''}
          onChange={(e) => setTempSectionContent(e.target.value)}
          placeholder="Enter your content here. Press Enter for line breaks, double Enter for paragraph spacing."
          style={{
            whiteSpace: 'pre-wrap', // This is KEY - preserves whitespace and line breaks
            wordWrap: 'break-word'
          }}
        />
        
        <div className="flex justify-between items-center mt-4">
          <div className="text-xs text-muted-foreground">
            Characters: {tempSectionContent?.length || 0} | Lines: {tempSectionContent?.split('\n').length || 1}
          </div>
          
          <div className="flex space-x-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave}>
              Save Changes
            </Button>
          </div>
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
              <div className="text-muted-foreground leading-relaxed">
                {renderTextWithLineBreaks(item)}
              </div>
            )}
            {typeof item === 'object' && item !== null && (
              <>
                {item.type === "paragraph" && item.text && (
                  <div className="text-muted-foreground leading-relaxed">
                    {renderTextWithLineBreaks(item.text)}
                  </div>
                )}
                {item.type === "points" && Array.isArray(item.list) && (
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    {item.list.map((point: string, pIndex: number) => (
                      <li key={pIndex} className="leading-relaxed">
                        {renderTextWithLineBreaks(point)}
                      </li>
                    ))}
                  </ul>
                )}
              
                {item.type === "table" &&
                  Array.isArray(item.content) &&
                  item.content.length > 0 && (
                    <div className="overflow-x-auto mt-4 rounded-lg border border-border">
                      <table className="w-full text-sm text-left text-muted-foreground">
                        {/* Header (first row) */}
                        <thead className="text-xs text-secondary-foreground uppercase bg-secondary">
                          <tr>
                            {item.content[0].map((header: string, hIndex: number) => (
                              <th key={hIndex} scope="col" className="px-6 py-3">
                                {highlightText(header)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        {/* Body (remaining rows) */}
                        <tbody>
                          {item.content.slice(1).map((row: string[], rIndex: number) => (
                            <tr
                              key={rIndex}
                              className="bg-background border-b border-border hover:bg-secondary transition-colors"
                            >
                              {row.map((cell: string, cIndex: number) => (
                                <td key={cIndex} className="px-6 py-4 whitespace-pre-line">
                                  {renderTextWithLineBreaks(cell)}
                                </td>
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
          <div className="text-muted-foreground mt-2 leading-relaxed">
            {renderTextWithLineBreaks(paragraphText)}
          </div>
          {Array.isArray(tableContent) && tableContent.length > 0 && (
            <div className="overflow-x-auto mt-4 rounded-lg border border-border">
              <table className="w-full text-sm text-left text-muted-foreground">
                <thead className="text-xs text-secondary-foreground uppercase bg-secondary">
                  <tr>
                    {Object.keys(tableContent[0]).map((header: string, hIndex: number) => (
                      <th key={hIndex} scope="col" className="px-6 py-3">{highlightText(header)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableContent.map((row: Record<string, any>, rIndex: number) => (
                    <tr key={rIndex} className="bg-background border-b border-border hover:bg-secondary transition-colors">
                      {Object.keys(row).map((header: string, cIndex: number) => (
                        <td key={cIndex} className="px-6 py-4">
                          {renderTextWithLineBreaks(row[header])}
                        </td>
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
            <div className="text-muted-foreground mt-2 leading-relaxed">
              {renderTextWithLineBreaks(content)}
            </div>
          )}
          {type === 'points' && Array.isArray(content) && (
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-2">
              {content.map((point: string, pIndex: number) => (
                <li key={pIndex} className="leading-relaxed">
                  {renderTextWithLineBreaks(point)}
                </li>
              ))}
            </ul>
          )}
          {type === 'table' && Array.isArray(content) && content.length > 0 && (
            <div className="overflow-x-auto mt-4 rounded-lg border border-border">
              <table className="w-full text-sm text-left text-muted-foreground">
                <thead className="text-xs text-secondary-foreground uppercase bg-secondary">
                  <tr>
                    {/* Use the first row of the content array as headers */}
                    {content[0].map((header: string, hIndex: number) => (
                      <th key={hIndex} scope="col" className="px-6 py-3">{highlightText(header)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Iterate over the rest of the rows for the table body */}
                  {content.slice(1).map((row: string[], rIndex: number) => (
                    <tr key={rIndex} className="bg-background border-b border-border hover:bg-secondary transition-colors">
                      {row.map((cell: string, cIndex: number) => (
                        <td key={cIndex} className="px-6 py-4">
                          {renderTextWithLineBreaks(cell)}
                        </td>
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
  
  // Handle multiple sections structure (NEW - for your JSON format)
  if (typeof sectionData === 'object' && sectionData !== null) {
    console.log("Checking if this is a multiple sections structure...");
    
    // Check if this looks like a multiple sections structure
    const keys = Object.keys(sectionData);
    const hasMultipleSectionStructure = keys.length > 0 && keys.every(key => 
      Array.isArray(sectionData[key]) && 
      sectionData[key].length > 0 && 
      sectionData[key].every((item: any) => item && typeof item === 'object' && item.type && item.content !== undefined)
    );

    if (hasMultipleSectionStructure) {
      console.log("This is a multiple sections structure. Rendering...");
      
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
            <h4 className="text-lg font-bold text-secondary-foreground mb-4">{highlightText(section.key)}</h4>
            
            {/* Render each subsection */}
            <div className="space-y-6">
              {keys.map((subsectionKey, subsectionIndex) => {
                const subsectionArray = sectionData[subsectionKey];
                const isAutoGeneratedKey = /^Section \d+$/.test(subsectionKey);
                
                return (
                  <div key={subsectionIndex} className="border-l-4 border-primary/30 pl-4">
                    {/* Only show subtitle if it's not auto-generated */}
                    {!isAutoGeneratedKey && (
                      <h5 className="text-md font-semibold text-secondary-foreground mb-3">
                        {highlightText(subsectionKey)}
                      </h5>
                    )}
                    
                    {/* Render content for each item in the subsection array */}
                    {subsectionArray.map((item: any, itemIndex: number) => (
                      <div key={itemIndex} className="mb-4">
                        {/* Handle paragraph type */}
                        {item.type === 'paragraph' && typeof item.content === 'string' && (
                          <div className="text-muted-foreground leading-relaxed">
                            {renderTextWithLineBreaks(item.content)}
                          </div>
                        )}
                        
                        {/* Handle points type */}
                        {item.type === 'points' && Array.isArray(item.content) && (
                          <ul className="list-disc list-inside text-muted-foreground space-y-2">
                            {item.content.map((point: string, pIndex: number) => (
                              <li key={pIndex} className="leading-relaxed">
                                {renderTextWithLineBreaks(point)}
                              </li>
                            ))}
                          </ul>
                        )}
                        
                        {/* Handle table type */}
                        {item.type === 'table' && Array.isArray(item.content) && item.content.length > 0 && (
                          <div className="overflow-x-auto mt-4 rounded-lg border border-border">
                            <table className="w-full text-sm text-left text-muted-foreground">
                              {/* Check if we have proper table structure */}
                              {item.content.length > 1 && Array.isArray(item.content[0]) ? (
                                <>
                                  {/* Header (first row) */}
                                  <thead className="text-xs text-secondary-foreground uppercase bg-secondary">
                                    <tr>
                                      {item.content[0].map((header: string, hIndex: number) => (
                                        <th key={hIndex} scope="col" className="px-6 py-3">
                                          {highlightText(header)}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  {/* Body (remaining rows) */}
                                  <tbody>
                                    {item.content.slice(1).map((row: string[], rIndex: number) => {
                                      // Skip rows that don't have the same structure as header
                                      if (!Array.isArray(row) || row.length !== item.content[0].length) {
                                        return (
                                          <tr key={rIndex} className="bg-background border-b border-border">
                                            <td colSpan={item.content[0].length} className="px-6 py-4 text-center font-medium">
                                              {renderTextWithLineBreaks(row[0] || row.toString())}
                                            </td>
                                          </tr>
                                        );
                                      }
                                      return (
                                        <tr key={rIndex} className="bg-background border-b border-border hover:bg-secondary transition-colors">
                                          {row.map((cell: string, cIndex: number) => (
                                            <td key={cIndex} className="px-6 py-4 whitespace-pre-line">
                                              {renderTextWithLineBreaks(cell)}
                                            </td>
                                          ))}
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </>
                              ) : (
                                /* Fallback for malformed table data */
                                <tbody>
                                  <tr className="bg-background border-b border-border">
                                    <td className="px-6 py-4">
                                      <pre className="text-xs text-muted-foreground">
                                        {JSON.stringify(item.content, null, 2)}
                                      </pre>
                                    </td>
                                  </tr>
                                </tbody>
                              )}
                            </table>
                          </div>
                        )}
                        
                        {/* Handle unknown item types */}
                        {!['paragraph', 'points', 'table'].includes(item.type) && (
                          <div className="bg-muted p-3 rounded text-xs">
                            <p className="text-yellow-600 mb-2">Unknown subsection type: {item.type}</p>
                            <pre className="overflow-x-auto">
                              {JSON.stringify(item, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
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
    
    // Continue with existing nested object handling for other structures
    console.log("Not a multiple sections structure, checking for other nested object patterns...");
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
  const [isParsing, setIsParsing] = useState(false);
  
  // New state for sectionsArray to be the source of truth for rendering
  const [sectionsArray, setSectionsArray] = useState<Section[]>([]);
const [showAddMultipleSectionsForm, setShowAddMultipleSectionsForm] = useState(false);
const [multipleSectionData, setMultipleSectionData] = useState<MultipleSection>({
  id: '',
  mainTitle: '',
  subsections: []
});

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
    
    // Enhanced content handling for better text editing
    let editableContent = '';
    
    if (typeof sectionToEdit.content === 'string') {
      // Direct string content - keep as is
      editableContent = sectionToEdit.content;
    } else if (sectionToEdit.content?.type === 'paragraph' && sectionToEdit.content?.content) {
      // Paragraph type with content - extract the text content
      editableContent = sectionToEdit.content.content;
    } else if (sectionToEdit.content?.type === 'points' && Array.isArray(sectionToEdit.content?.content)) {
      // Points list - convert to line-separated text
      editableContent = sectionToEdit.content.content.join('\n');
    } else if (Array.isArray(sectionToEdit.content)) {
      // Handle array content - extract text from each item
      editableContent = sectionToEdit.content.map(item => {
        if (typeof item === 'string') return item;
        if (item?.text) return item.text;
        if (item?.type === 'paragraph' && item?.text) return item.text;
        return JSON.stringify(item, null, 2);
      }).join('\n\n'); // Double line break between items
    } else {
      // Fallback to JSON for complex structures
      editableContent = JSON.stringify(sectionToEdit.content, null, 2);
    }
    
    setTempSectionContent(editableContent);
    console.log('Populated edit form with content:', editableContent);
  }
};
  
const handleSaveSection = () => {
  console.log('Saving section edit for key:', editSectionKey);
  if (!editSectionKey) return;

  const sectionToUpdate = sectionsArray.find((s) => s.key === editSectionKey);
  if (!sectionToUpdate) return;

  try {
    let newSectionContent: any;
    const originalContent = sectionToUpdate.content;

    if (typeof originalContent === 'string') {
      // Direct string content - preserve as string with line breaks
      newSectionContent = tempSectionContent;
    } else if (originalContent?.type === 'paragraph') {
      // Paragraph type - update content but preserve structure
      newSectionContent = {
        ...originalContent,
        content: tempSectionContent, // Keep line breaks as they are
      };
    } else if (originalContent?.type === 'points') {
      // Points list - convert back to array, splitting by newlines
      const pointsArray = tempSectionContent
        .split('\n')
        .map((line: string) => line.trim()) // ✅ typed
        .filter((line: string) => line.length > 0);

      newSectionContent = {
        ...originalContent,
        content: pointsArray,
      };
    } else if (Array.isArray(originalContent)) {
      // Handle array content - split by double line breaks for paragraphs
      const paragraphs = tempSectionContent
        .split('\n\n')
        .map((para: string) => para.trim()) // ✅ typed
        .filter((para: string) => para.length > 0);

      // Try to match original structure
      if (originalContent.every((item: any) => typeof item === 'string')) {
        newSectionContent = paragraphs;
      } else {
        // Convert to paragraph objects with preserved line breaks
        newSectionContent = paragraphs.map((para: string) => ({
          type: 'paragraph',
          text: para,
        }));
      }
    } else {
      // Complex structure - try to parse as JSON first, fallback to text
      try {
        newSectionContent = JSON.parse(tempSectionContent);
      } catch {
        newSectionContent = {
          type: 'paragraph',
          content: tempSectionContent,
        };
      }
    }

    const updatedSectionsArray = sectionsArray.map((section) => {
      if (section.key === editSectionKey) {
        return { ...section, content: newSectionContent };
      }
      return section;
    });

    setSectionsArray(updatedSectionsArray);
    setEditSectionKey(null);
    setTempSectionContent(null);
    toast.success(
      'Section updated successfully! Please click "Update All Content" to save changes.'
    );
  } catch (err) {
    console.error('Error saving section:', err);
    toast.error('Error saving section. Please check your formatting.');
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
  
  const handleAddSection = async () => {
    console.log('Adding new section with title:', newSectionTitle, 'and type:', newSectionType);
    if (!newSectionTitle || !newSectionContent) {
      toast.error('Please enter a title and content for the new section.');
      return;
    }

    let newContent: any;
    
    // Set loading state
    setIsParsing(true);

    try {
        if (newSectionType === 'paragraph') {
    newContent = newSectionContent;
  } else if (newSectionType === 'points') {
    newContent = newSectionContent
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0); // This is the new line
  } else { // Handle 'table' type
            const response = await fetch('https://josaa-admin-backend-1.onrender.com/api/parse-table', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: newSectionContent }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to parse table from backend.');
            }
            const data = await response.json();
            newContent = data.content;
            if (!Array.isArray(newContent) || newContent.length === 0) {
              throw new Error('Backend returned invalid or empty table data.');
            }
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

    } catch (error: any) {
        console.error('Error adding new section:', error);
        toast.error(`Error: ${error.message}`);
    } finally {
        // Clear loading state
        setIsParsing(false);
    }
  };

  const parseMarkdownText = (text: string): React.ReactNode => {
  if (typeof text !== 'string') return text;
  
  // Split text by markdown patterns while preserving the delimiters
  const parts = text.split(/(\*\*.*?\*\*|\*(?!\*).*?\*(?!\*)|__.*?__|_(?!_).*?_(?!_))/g);
  
  return parts.map((part, index) => {
    // Handle bold with **text**
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    // Handle bold with __text__
    if (part.startsWith('__') && part.endsWith('__') && part.length > 4) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    // Handle italic with *text* (but not **text**)
    if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**') && part.length > 2) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    // Handle italic with _text_ (but not __text__)
    if (part.startsWith('_') && part.endsWith('_') && !part.startsWith('__') && part.length > 2) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    // Return plain text
    return part;
  });
};


const highlightText = (text: string) => {
  if (!text || typeof text !== 'string') return text;
  
  // First parse markdown
  const markdownParsed = parseMarkdownText(text);
  
  // If no find text, return the markdown parsed version
  if (!findText) {
    return markdownParsed;
  }
  
  // For highlighting with search, we need to handle both markdown and highlighting
  // This is more complex because we need to preserve React elements
  const parts = text.split(new RegExp(`(${findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  
  return parts.map((part, index) => {
    const isHighlight = part.toLowerCase() === findText.toLowerCase();
    const parsedPart = parseMarkdownText(part);
    
    if (isHighlight) {
      return (
        <span key={index} className="bg-yellow-200">
          {parsedPart}
        </span>
      );
    }
    
    return <React.Fragment key={index}>{parsedPart}</React.Fragment>;
  });
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

  const handleAddSubsection = () => {
  const newSubsection = {
    id: Date.now().toString(),
    subtitle: '',
    type: 'paragraph',
    content: ''
  };
  setMultipleSectionData(prev => ({
    ...prev,
    subsections: [...prev.subsections, newSubsection]
  }));
};

const handleDeleteSubsection = (subsectionId: string) => {
  setMultipleSectionData(prev => ({
    ...prev,
    subsections: prev.subsections.filter(sub => sub.id !== subsectionId)
  }));
};

const handleSubsectionChange = (subsectionId: string, field: string, value: string) => {
  setMultipleSectionData(prev => ({
    ...prev,
    subsections: prev.subsections.map(sub => 
      sub.id === subsectionId ? { ...sub, [field]: value } : sub
    )
  }));
};

const handleAddMultipleSections = async () => {
  console.log('Adding multiple sections:', multipleSectionData);
  if (!multipleSectionData.mainTitle || multipleSectionData.subsections.length === 0) {
    toast.error('Please enter a main title and at least one subsection.');
    return;
  }

  // Validate that all subsections have content (subtitle is optional)
 const invalidSubsections = multipleSectionData.subsections.filter(sub => !sub.content || !sub.content.trim());
if (invalidSubsections.length > 0) {
  toast.error('Please fill in all content fields for subsections.');
  return;
}

  setIsParsing(true);

  try {
    // Process each subsection
    const processedSubsections = await Promise.all(
      multipleSectionData.subsections.map(async (subsection) => {
        let processedContent: any;

        if (subsection.type === 'paragraph') {
          processedContent = subsection.content;
        } else if (subsection.type === 'points') {
          processedContent = subsection.content
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
        } else { // table
          const response = await fetch('http://127.0.0.1:8000/api/parse-table', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: subsection.content }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to parse table for "${subsection.subtitle || 'Unnamed subsection'}": ${errorData.detail}`);
          }
          const data = await response.json();
          processedContent = data.content;
        }

        return {
          type: subsection.type,
          content: processedContent
        };
      })
    );

    // Create the main section structure - handle optional subtitles
    const mainSectionContent = processedSubsections.reduce((acc, subsection, index) => {
      const subtitle = multipleSectionData.subsections[index].subtitle;
      
      // If subtitle exists, use it as the key, otherwise use a generic key with index
      const sectionKey = subtitle || `Section ${index + 1}`;
      acc[sectionKey] = [subsection];
      return acc;
    }, {} as Record<string, any>);

    // Add to sectionsArray
    const newSection = {
      id: multipleSectionData.mainTitle,
      key: multipleSectionData.mainTitle,
      content: mainSectionContent
    };

    setSectionsArray(prev => [...prev, newSection]);

    // Reset form
    setMultipleSectionData({
      id: '',
      mainTitle: '',
      subsections: []
    });
    setShowAddMultipleSectionsForm(false);

    toast.success('Multiple sections added successfully! Please click "Update All Content" to save changes.');
    console.log('Multiple sections added to state:', newSection);

  } catch (error: any) {
    console.error('Error adding multiple sections:', error);
    toast.error(`Error: ${error.message}`);
  } finally {
    setIsParsing(false);
  }
};

// Updated form section in the JSX
{showAddMultipleSectionsForm && (
  <Card className="mt-4 mb-8">
    <CardHeader>
      <CardTitle>Add Multiple Sections</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <Label htmlFor="main-title">Main Title</Label>
        <Input
          id="main-title"
          value={multipleSectionData.mainTitle}
          onChange={(e) => setMultipleSectionData(prev => ({ ...prev, mainTitle: e.target.value }))}
          placeholder="e.g., Exam Pattern & Syllabus"
        />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Subsections</Label>
          <Button type="button" variant="outline" size="sm" onClick={handleAddSubsection}>
            <IconPlus size={14} className="mr-1" />
            Add Subsection
          </Button>
        </div>

        {multipleSectionData.subsections.map((subsection, index) => (
          <div key={subsection.id} className="border rounded-lg p-4 space-y-3 bg-muted/30">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Subsection {index + 1}</h4>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => handleDeleteSubsection(subsection.id)}
                className="text-destructive hover:text-destructive"
              >
                <IconTrash size={14} />
              </Button>
            </div>

            <div>
              <Label>
                Subtitle 
                <span className="text-muted-foreground text-sm ml-1">(optional)</span>
              </Label>
              <Input
                value={subsection.subtitle || ''}
                onChange={(e) => handleSubsectionChange(subsection.id, 'subtitle', e.target.value)}
                placeholder="e.g., Exam Pattern (leave empty for no subtitle)"
              />
              <p className="text-xs text-muted-foreground mt-1">
                If left empty, this subsection will be displayed without a subtitle
              </p>
            </div>

            <div>
              <Label>Type</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={subsection.type}
                onChange={(e) => handleSubsectionChange(subsection.id, 'type', e.target.value)}
              >
                <option value="paragraph">Paragraph</option>
                <option value="points">Points List</option>
                <option value="table">Table</option>
              </select>
            </div>

            <div>
              <Label>
                Content <span className="text-red-500">*</span>
                <span className="text-muted-foreground">
                  {subsection.type === 'points' && ' (one item per line)'}
                  {subsection.type === 'table' && ' (Enter table data with headers. Use tabs or multiple spaces to separate columns.)'}
                </span>
              </Label>
              <Textarea
                value={subsection.content}
                onChange={(e) => handleSubsectionChange(subsection.id, 'content', e.target.value)}
                placeholder={
                  subsection.type === 'paragraph'
                    ? 'Enter the paragraph content here.'
                    : subsection.type === 'points'
                    ? 'Enter each point on a new line.'
                    : 'First line: Description Column1 Column2\\nSecond line: Up to 3 subjects\\t₹1000/-\\t₹900/-'
                }
                className="min-h-[100px]"
              />
            </div>
          </div>
        ))}

        {multipleSectionData.subsections.length === 0 && (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
            No subsections added yet. Click "Add Subsection" to get started.
          </div>
        )}
      </div>

      <Button onClick={handleAddMultipleSections} disabled={isParsing || !multipleSectionData.mainTitle || multipleSectionData.subsections.length === 0}>
        {isParsing ? (
          <>
            <IconLoader size={16} className="mr-2 animate-spin" />
            Processing Sections...
          </>
        ) : (
          <>
            <IconFolderPlus size={16} className="mr-2" />
            Add All Sections
          </>
        )}
      </Button>
    </CardContent>
  </Card>
)}
// Updated form section in the JSX
{showAddMultipleSectionsForm && (
  <Card className="mt-4 mb-8">
    <CardHeader>
      <CardTitle>Add Multiple Sections</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <Label htmlFor="main-title">Main Title</Label>
        <Input
          id="main-title"
          value={multipleSectionData.mainTitle}
          onChange={(e) => setMultipleSectionData(prev => ({ ...prev, mainTitle: e.target.value }))}
          placeholder="e.g., Exam Pattern & Syllabus"
        />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Subsections</Label>
          <Button type="button" variant="outline" size="sm" onClick={handleAddSubsection}>
            <IconPlus size={14} className="mr-1" />
            Add Subsection
          </Button>
        </div>

        {multipleSectionData.subsections.map((subsection, index) => (
          <div key={subsection.id} className="border rounded-lg p-4 space-y-3 bg-muted/30">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Subsection {index + 1}</h4>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => handleDeleteSubsection(subsection.id)}
                className="text-destructive hover:text-destructive"
              >
                <IconTrash size={14} />
              </Button>
            </div>

            <div>
              <Label>
                Subtitle 
                <span className="text-muted-foreground text-sm ml-1">(optional)</span>
              </Label>
              <Input
                value={subsection.subtitle || ''}
                onChange={(e) => handleSubsectionChange(subsection.id, 'subtitle', e.target.value)}
                placeholder="e.g., Exam Pattern (leave empty for no subtitle)"
              />
              <p className="text-xs text-muted-foreground mt-1">
                If left empty, this subsection will be displayed without a subtitle
              </p>
            </div>

            <div>
              <Label>Type</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={subsection.type}
                onChange={(e) => handleSubsectionChange(subsection.id, 'type', e.target.value)}
              >
                <option value="paragraph">Paragraph</option>
                <option value="points">Points List</option>
                <option value="table">Table</option>
              </select>
            </div>

            <div>
              <Label>
                Content <span className="text-red-500">*</span>
                <span className="text-muted-foreground">
                  {subsection.type === 'points' && ' (one item per line)'}
                  {subsection.type === 'table' && ' (Enter table data with headers. Use tabs or multiple spaces to separate columns.)'}
                </span>
              </Label>
              <Textarea
                value={subsection.content}
                onChange={(e) => handleSubsectionChange(subsection.id, 'content', e.target.value)}
                placeholder={
                  subsection.type === 'paragraph'
                    ? 'Enter the paragraph content here.'
                    : subsection.type === 'points'
                    ? 'Enter each point on a new line.'
                    : 'First line: Description Column1 Column2\\nSecond line: Up to 3 subjects\\t₹1000/-\\t₹900/-'
                }
                className="min-h-[100px]"
              />
            </div>
          </div>
        ))}

        {multipleSectionData.subsections.length === 0 && (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
            No subsections added yet. Click "Add Subsection" to get started.
          </div>
        )}
      </div>

      <Button onClick={handleAddMultipleSections} disabled={isParsing || !multipleSectionData.mainTitle || multipleSectionData.subsections.length === 0}>
        {isParsing ? (
          <>
            <IconLoader size={16} className="mr-2 animate-spin" />
            Processing Sections...
          </>
        ) : (
          <>
            <IconFolderPlus size={16} className="mr-2" />
            Add All Sections
          </>
        )}
      </Button>
    </CardContent>
  </Card>
)}
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
            
             <div className="mt-4 flex justify-end space-x-2">
                <Button onClick={() => setShowAddSectionForm(!showAddSectionForm)} variant="secondary">
                  <IconPlus size={16} className="mr-2" />
                  {showAddSectionForm ? 'Cancel Add Section' : 'Add New Section'}
                </Button>
                <Button onClick={() => setShowAddMultipleSectionsForm(!showAddMultipleSectionsForm)} variant="secondary">
                  <IconFolderPlus size={16} className="mr-2" />
                  {showAddMultipleSectionsForm ? 'Cancel Multiple Sections' : 'Add Multiple Sections'}
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
                    <Button onClick={handleAddSection} disabled={isParsing}>
                      {isParsing ? (
                        <>
                          <IconLoader size={16} className="mr-2 animate-spin" />
                          Parsing Table...
                        </>
                      ) : (
                        <>
                          <IconPlus size={16} className="mr-2" />
                          Add New Section
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
            )}
              {showAddMultipleSectionsForm && (
                <Card className="mt-4 mb-8">
                  <CardHeader>
                    <CardTitle>Add Multiple Sections</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="main-title">Main Title</Label>
                      <Input
                        id="main-title"
                        value={multipleSectionData.mainTitle}
                        onChange={(e) => setMultipleSectionData(prev => ({ ...prev, mainTitle: e.target.value }))}
                        placeholder="e.g., Exam Pattern & Syllabus"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label>Subsections</Label>
                        <Button type="button" variant="outline" size="sm" onClick={handleAddSubsection}>
                          <IconPlus size={14} className="mr-1" />
                          Add Subsection
                        </Button>
                      </div>

                      {multipleSectionData.subsections.map((subsection, index) => (
                        <div key={subsection.id} className="border rounded-lg p-4 space-y-3 bg-muted/30">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">Subsection {index + 1}</h4>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDeleteSubsection(subsection.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <IconTrash size={14} />
                            </Button>
                          </div>

                          <div>
                            <Label>Subtitle</Label>
                            <Input
                              value={subsection.subtitle}
                              onChange={(e) => handleSubsectionChange(subsection.id, 'subtitle', e.target.value)}
                              placeholder="e.g., Exam Pattern"
                            />
                          </div>

                          <div>
                            <Label>Type</Label>
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              value={subsection.type}
                              onChange={(e) => handleSubsectionChange(subsection.id, 'type', e.target.value)}
                            >
                              <option value="paragraph">Paragraph</option>
                              <option value="points">Points List</option>
                              <option value="table">Table</option>
                            </select>
                          </div>

                          <div>
                            <Label>
                              Content
                              <span className="text-muted-foreground">
                                {subsection.type === 'points' && ' (one item per line)'}
                                {subsection.type === 'table' && ' (Enter table data with headers. Use tabs or multiple spaces to separate columns.)'}
                              </span>
                            </Label>
                            <Textarea
                              value={subsection.content}
                              onChange={(e) => handleSubsectionChange(subsection.id, 'content', e.target.value)}
                              placeholder={
                                subsection.type === 'paragraph'
                                  ? 'Enter the paragraph content here.'
                                  : subsection.type === 'points'
                                  ? 'Enter each point on a new line.'
                                  : 'First line: Description Column1 Column2\\nSecond line: Up to 3 subjects\\tâ‚¹1000/-\\tâ‚¹900/-'
                              }
                              className="min-h-[100px]"
                            />
                          </div>
                        </div>
                      ))}

                      {multipleSectionData.subsections.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                          No subsections added yet. Click "Add Subsection" to get started.
                        </div>
                      )}
                    </div>

                    <Button onClick={handleAddMultipleSections} disabled={isParsing || !multipleSectionData.mainTitle || multipleSectionData.subsections.length === 0}>
                      {isParsing ? (
                        <>
                          <IconLoader size={16} className="mr-2 animate-spin" />
                          Processing Sections...
                        </>
                      ) : (
                        <>
                          <IconFolderPlus size={16} className="mr-2" />
                          Add All Sections
                        </>
                      )}
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
