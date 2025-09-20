'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import PageContainer from '@/components/layout/page-container';

export default function AddExamPage() {
  // -------------------------
  // Basic Details State
  // -------------------------
  const [basicData, setBasicData] = useState({
    Fee: '',
    Name: '',
    Seats: '',
    Category: '',
    'Exam Code': '',
    'Exam Type': '',
    'Exam Dates': '',
    Eligibility: '',
    'Mode of Exam': '',
    'State/Region': '',
    'Organizing Body': '',
    'Official Website': '',
    'Application Period': '',
  });

  // -------------------------
  // Full Details State
  // -------------------------
  const [examName, setExamName] = useState('');
  const [rawContent, setRawContent] = useState('');
  const [jsonOutput, setJsonOutput] = useState<string>('{}');
  const [loading, setLoading] = useState(false);
  const [jsonLoading, setJsonLoading] = useState(false);

  const handleBasicChange = (field: string, value: string) => {
    setBasicData((prev) => ({ ...prev, [field]: value }));
  };

  // -------------------------
  // Call Gemini Backend for Full Details
  // -------------------------
  const handleGenerateJson = async () => {
    if (!examName || !rawContent) {
      toast.error('⚠️ Please enter both exam name and raw content.');
      return;
    }

    setJsonLoading(true);
    try {
      const response = await fetch('http://localhost:5005/generate-json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exam_name: examName, raw_content: rawContent }),
      });

      if (!response.ok) throw new Error('Failed to generate JSON');

      const data = await response.json();
      setJsonOutput(JSON.stringify(data, null, 2));
      toast.success('✅ Full details JSON generated!');
    } catch (err: any) {
      toast.error(`❌ Error: ${err.message}`);
    } finally {
      setJsonLoading(false);
    }
  };

  // -------------------------
  // Save Exam (POST to backend)
  // -------------------------
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          basic_data: basicData,
          full_details: JSON.parse(jsonOutput || '{}'),
        }),
      });

      if (!response.ok) throw new Error('Failed to save exam');
      toast.success('✅ Exam saved successfully!');

      // Reset form
      setBasicData({
        Fee: '',
        Name: '',
        Seats: '',
        Category: '',
        'Exam Code': '',
        'Exam Type': '',
        'Exam Dates': '',
        Eligibility: '',
        'Mode of Exam': '',
        'State/Region': '',
        'Organizing Body': '',
        'Official Website': '',
        'Application Period': '',
      });
      setExamName('');
      setRawContent('');
      setJsonOutput('{}');
    } catch (err: any) {
      toast.error(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">➕ Add New Exam</h1>

      {/* Basic Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.keys(basicData).map((field) => (
            <div key={field}>
              <label className="block font-medium">{field}</label>
              <Input
                value={basicData[field as keyof typeof basicData]}
                onChange={(e) => handleBasicChange(field, e.target.value)}
                placeholder={`Enter ${field}`}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Full Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Full Details (Generated JSON)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block font-medium">Exam Name</label>
            <Input
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              placeholder="Enter Exam Name for AI generation"
            />
          </div>
          <div>
            <label className="block font-medium">Raw Content</label>
            <Textarea
              rows={6}
              value={rawContent}
              onChange={(e) => setRawContent(e.target.value)}
              placeholder="Paste raw exam content..."
            />
          </div>
          <Button onClick={handleGenerateJson} disabled={jsonLoading}>
            {jsonLoading ? '⏳ Generating JSON...' : '🚀 Generate JSON'}
          </Button>

          {jsonOutput && (
            <div>
              <label className="block font-medium">Generated JSON</label>
              <Textarea
                rows={12}
                value={jsonOutput}
                onChange={(e) => setJsonOutput(e.target.value)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? '⏳ Saving...' : '💾 Save Exam'}
        </Button>
      </div>
    </div>
    </PageContainer>
  );
}
