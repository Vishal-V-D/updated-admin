'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { IconLoader, IconPlus } from '@tabler/icons-react';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';

// Helper renderer for editable fields
const renderEditable = (
  label: string,
  value: any,
  onChange: (val: any) => void
) => {
  if (typeof value === 'string') {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <Textarea value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    );
  }
  if (Array.isArray(value)) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <ul className="space-y-2">
          {value.map((item, idx) => (
            <li key={idx}>
              <Input
                value={item}
                onChange={(e) => {
                  const copy = [...value];
                  copy[idx] = e.target.value;
                  onChange(copy);
                }}
              />
            </li>
          ))}
        </ul>
      </div>
    );
  }
  if (typeof value === 'object' && value !== null) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="grid grid-cols-1 gap-2">
          {Object.entries(value).map(([k, v]) => (
            <div key={k} className="space-y-1">
              <Label className="text-sm">{k}</Label>
              <Textarea
                value={typeof v === 'string' ? v : JSON.stringify(v, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    onChange({ ...value, [k]: parsed });
                  } catch {
                    onChange({ ...value, [k]: e.target.value });
                  }
                }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// Initial state for a new college
const initialBasicData = {
  Name: '',
  Type: '',
  Tier: '',
  Website: '',
  'NIRF 2024': null,
  'B.Tech Seats': null,
  'B.Tech Programmes': '',
  Establishment: null,
};

const initialFullData = {
  about: {
    description: '',
    established: null,
    contact: '',
    address: '',
    campus_area: '',
  },
  admission: {
    eligibility_criteria: '',
    selection_process: '',
  },
  placements: {
    top_recruiters: [],
    highest_salary: '',
    average_salary: '',
  },
};

export default function AddCollegePage() {
  const router = useRouter();
  const [basicData, setBasicData] = useState(initialBasicData);
  const [fullData, setFullData] = useState(initialFullData);
  const [isAdding, setIsAdding] = useState(false);

  const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type: inputType } = e.target;
    setBasicData((prev) => {
      let newValue: any = value;
      if (inputType === 'number') newValue = parseFloat(value);
      else if (name === 'B.Tech Programmes') newValue = value.split(',').map((s) => s.trim());
      return { ...prev, [name]: newValue };
    });
  };

  const handleAdd = async () => {
    if (!basicData.Name || !basicData.Type) {
      alert('College Name and Type are required.');
      return;
    }

    setIsAdding(true);
    try {
      // ✅ Change the URL to the correct endpoint
      const response = await fetch(`http://localhost:8000/api/add-college`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          college_name: basicData.Name,
          type: basicData.Type,
          full_data: fullData,
          basic_data: basicData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to add college.');
      }

      alert('College added successfully!');
      router.push('/admin/colleges');
    } catch (err: any) {
      alert(`Failed to add college: ${err.message}`);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <PageContainer>
      <div className="space-y-8 p-4">
        <h1 className="text-3xl font-bold">Add New College</h1>
        <Separator />

        {/* Basic Data */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(initialBasicData).map(([k, v]) => (
              <div key={k} className="space-y-1">
                <Label>{k}</Label>
                <Input
                  name={k}
                  value={basicData[k as keyof typeof initialBasicData] ?? ''}
                  onChange={handleBasicChange}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Full Data - Re-added to the form */}
        <Card>
          <CardHeader>
            <CardTitle>Full Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(fullData).map(([section, val]) => (
              <div key={section}>
                {renderEditable(section, val, (updated) =>
                  setFullData((prev) => (prev ? { ...prev, [section]: updated } : prev))
                )}
              </div>
            ))}
          </CardContent>
        </Card>
        
        {/* Actions */}
        <div className="flex justify-end space-x-2">
          <Link href="/admin/colleges">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button onClick={handleAdd} disabled={isAdding}>
            {isAdding ? <IconLoader className="h-4 w-4 animate-spin mr-2" /> : <IconPlus className="h-4 w-4 mr-2" />}
            {isAdding ? 'Adding...' : 'Add College'}
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}