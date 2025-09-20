'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { IconLoader, IconCheck, IconX } from '@tabler/icons-react';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';

interface CollegeEditPageProps {
  params: Promise<{ id: string; type: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

// ... other interfaces and helper functions ...
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
  about: any;
  admission: any;
  banner_section: any;
  nirf: any;
  placements: any;
  seat_matrix?: any;
  ranking?: any;
  Name?: string;
  overview?: string;
  course_fees_eligibility?: any[];
  btech_institute_fee_breakdown_per_semester?: any;
  hostel_fees_breakdown_per_semester?: any;
  fee_waivers_and_scholarships?: any;
}

interface BackendResponse {
  full_data: FullData;
  basic_data: CollegeData;
}

// Helper renderer for editable content (for Basic and other sections)
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

// New function to dynamically render the display-only sections
const renderDisplay = (key: string, value: any) => {
  if (!value) return null;

  const renderContent = () => {
    switch (key) {
      case 'overview':
        return <p>{value}</p>;
      case 'course_fees_eligibility':
        return (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Eligibility</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fees</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {value.map((item: any, index: number) => (
                <tr key={index}>
                  <td className="px-4 py-2 whitespace-nowrap">{item.course}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{item.eligibility}</td>
                  <td className="px-4 py-2 whitespace-now-wrap">{item.fees_1st_year || item.total_fees}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 'btech_institute_fee_breakdown_per_semester':
      case 'hostel_fees_breakdown_per_semester':
        return (
          <ul className="space-y-2">
            {Object.entries(value).map(([subKey, subValue]: [string, any]) => (
              <li key={subKey}>
                <strong>{subKey.replace(/_/g, ' ')}:</strong> {subValue}
              </li>
            ))}
          </ul>
        );
      case 'fee_waivers_and_scholarships':
        return (
          <div className="space-y-4">
            {value.fee_waivers && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Fee Waivers</h3>
                <ul className="list-disc list-inside space-y-1">
                  {value.fee_waivers.map((waiver: string, idx: number) => (
                    <li key={idx}>{waiver}</li>
                  ))}
                </ul>
              </div>
            )}
            {value.research_assistance && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Research Assistance</h3>
                <p><strong>Eligibility:</strong> {value.research_assistance.eligibility}</p>
                <h4 className="font-medium mt-2">Stipend Details:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {value.research_assistance.stipend_details.map((stipend: string, idx: number) => (
                    <li key={idx}>{stipend}</li>
                  ))}
                </ul>
              </div>
            )}
            {value.alumni_and_corporate_scholarships && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Alumni & Corporate Scholarships</h3>
                <ul className="space-y-2">
                  {value.alumni_and_corporate_scholarships.map((scholarship: any, idx: number) => (
                    <li key={idx}>
                      <strong>{scholarship.name}:</strong> {scholarship.eligibility}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      default:
        // This is a catch-all for any other sections not explicitly handled
        if (typeof value === 'object' && value !== null) {
          return (
            <ul className="space-y-2">
              {Object.entries(value).map(([subKey, subValue]: [string, any]) => (
                <li key={subKey}>
                  <strong>{subKey.replace(/_/g, ' ')}:</strong> {JSON.stringify(subValue)}
                </li>
              ))}
            </ul>
          );
        }
        return <p>{value}</p>;
    }
  };

  return (
    <Card key={key}>
      <CardHeader>
        <CardTitle className="capitalize">{key.replace(/_/g, ' ')}</CardTitle>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default function CollegeEditPage({ params }: CollegeEditPageProps) {
  const router = useRouter();
  const [resolvedParams, setResolvedParams] = useState<{ id: string; type: string } | null>(null);
  const [fullData, setFullData] = useState<FullData | null>(null);
  const [basicData, setBasicData] = useState<CollegeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Resolve params Promise
  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolved = await params;
        setResolvedParams(resolved);
      } catch (err) {
        setError('Failed to load page parameters');
        setLoading(false);
      }
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!resolvedParams) return;
    
    const fetchCollegeData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://josaa-admin-backend-1.onrender.com/api/college/${resolvedParams.id}/${resolvedParams.type}`);
        if (!response.ok) throw new Error('Failed to fetch college data.');
        const data: BackendResponse = await response.json();
        setFullData(data.full_data);
        setBasicData(data.basic_data);
      } catch (err: any) {
        setError("Failed to load college data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCollegeData();
  }, [resolvedParams]);

  const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type: inputType } = e.target;
    setBasicData(prev => {
      if (!prev) return null;
      let newValue: any = value;
      if (inputType === 'number') newValue = parseFloat(value);
      else if (name === 'B.Tech Programmes') newValue = value.split(',').map(s => s.trim());
      return { ...prev, [name]: newValue };
    });
  };

  const handleUpdate = async () => {
    if (!fullData || !basicData || !resolvedParams) return;
    setIsUpdating(true);
    try {
      const updatePayload = {
        college_name: basicData.Name,
        full_data: fullData,
        basic_data: basicData,
      };

      const response = await fetch(`https://josaa-admin-backend-1.onrender.com/api/college/${resolvedParams.id}/${resolvedParams.type}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update college data.');
      }

      alert('College updated successfully!');
      router.push('/admin/colleges');
    } catch (err: any) {
      alert(`Failed to update college. ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <IconLoader className="w-10 h-10 animate-spin text-gray-500" />
          <p className="mt-4">Loading college data...</p>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
          <IconX className="w-10 h-10 text-red-500" />
          <p className="mt-4">{error}</p>
        </div>
      </PageContainer>
    );
  }

  if (!fullData || !basicData) {
    return (
      <PageContainer>
        <p>No college data found.</p>
      </PageContainer>
    );
  }

  // Determine sections to display
  const displayableSections = Object.entries(fullData).filter(([key]) =>
    ['overview', 'course_fees_eligibility', 'btech_institute_fee_breakdown_per_semester', 'hostel_fees_breakdown_per_semester', 'fee_waivers_and_scholarships'].includes(key)
  );
  
  // Determine sections to edit (all other sections)
  const editableSections = Object.entries(fullData).filter(([key]) =>
    !['overview', 'course_fees_eligibility', 'btech_institute_fee_breakdown_per_semester', 'hostel_fees_breakdown_per_semester', 'fee_waivers_and_scholarships'].includes(key)
  );

  return (
    <PageContainer>
      <div className="space-y-8 p-4">
        <h1 className="text-3xl font-bold">Edit College</h1>
        <Separator />

        {/* Basic Data */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(basicData).map(([k, v]) => (
              <div key={k} className="space-y-1">
                <Label>{k}</Label>
                <Input
                  name={k}
                  value={Array.isArray(v) ? v.join(', ') : v ?? ''}
                  onChange={handleBasicChange}
                />
              </div>
            ))}
          </CardContent>
        </Card>
        
        {/* Dynamic Display Sections */}
        {displayableSections.length > 0 && (
          <div className="space-y-4">
            {displayableSections.map(([key, value]) => renderDisplay(key, value))}
          </div>
        )}

        {/* Editable Full Data Sections */}
        {editableSections.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Other Data (Editable)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {editableSections.map(([section, val]) => (
                <div key={section}>{renderEditable(section, val, (updated) => setFullData(prev => prev ? { ...prev, [section]: updated } : prev))}</div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-2">
          <Link href="/admin/colleges">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button onClick={handleUpdate} disabled={isUpdating}>
            {isUpdating ? <IconLoader className="h-4 w-4 animate-spin mr-2" /> : <IconCheck className="h-4 w-4 mr-2" />}
            {isUpdating ? 'Updating...' : 'Update College'}
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
