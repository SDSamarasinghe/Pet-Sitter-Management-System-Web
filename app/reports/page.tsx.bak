'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';
import { isAuthenticated, getUserRole } from '@/lib/auth';
import { Loading } from '@/components/ui/loading';

interface Report {
  id: string;
  date: string;
  sitterName: string;
  pets: Array<{ id: string; name: string; }>;
  activities: string;
  notes: string;
  photos: string[];
  feedingTime?: string;
  walkDuration?: string;
  medicationGiven?: boolean;
  emergencyContacted?: boolean;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    fetchReports();
  }, [router]);

  const fetchReports = async () => {
    try {
      const response = await api.get('/reports');
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading message="Loading reports..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Sitter Reports</h1>
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {reports.length > 0 ? (
          <div className="grid gap-6">
            {/* Reports List */}
            <div className="grid gap-4">
              {reports.map((report) => (
                <Card 
                  key={report.id} 
                  className={`cursor-pointer transition-all ${
                    selectedReport?.id === report.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedReport(selectedReport?.id === report.id ? null : report)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          Report - {new Date(report.date).toLocaleDateString()}
                        </CardTitle>
                        <CardDescription>
                          Sitter: {report.sitterName}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          Pets: {report.pets.map(pet => pet.name).join(', ')}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Click to {selectedReport?.id === report.id ? 'collapse' : 'expand'}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {selectedReport?.id === report.id && (
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {/* Activities */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Activities</h4>
                          <p className="text-gray-700">{report.activities}</p>
                        </div>

                        {/* Care Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {report.feedingTime && (
                            <div>
                              <h5 className="font-medium text-gray-800">Feeding Time</h5>
                              <p className="text-gray-600">{report.feedingTime}</p>
                            </div>
                          )}
                          
                          {report.walkDuration && (
                            <div>
                              <h5 className="font-medium text-gray-800">Walk Duration</h5>
                              <p className="text-gray-600">{report.walkDuration}</p>
                            </div>
                          )}
                          
                          {report.medicationGiven !== undefined && (
                            <div>
                              <h5 className="font-medium text-gray-800">Medication Given</h5>
                              <p className={`text-sm font-medium ${
                                report.medicationGiven ? 'text-green-600' : 'text-yellow-600'
                              }`}>
                                {report.medicationGiven ? 'Yes' : 'No'}
                              </p>
                            </div>
                          )}
                          
                          {report.emergencyContacted !== undefined && (
                            <div>
                              <h5 className="font-medium text-gray-800">Emergency Contact Used</h5>
                              <p className={`text-sm font-medium ${
                                report.emergencyContacted ? 'text-red-600' : 'text-green-600'
                              }`}>
                                {report.emergencyContacted ? 'Yes' : 'No'}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Notes */}
                        {report.notes && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Sitter Notes</h4>
                            <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{report.notes}</p>
                          </div>
                        )}

                        {/* Photos */}
                        {report.photos && report.photos.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Photos</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                              {report.photos.map((photo, index) => (
                                <div key={index} className="relative">
                                  <img
                                    src={photo}
                                    alt={`Report photo ${index + 1}`}
                                    className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => window.open(photo, '_blank')}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reports yet</h3>
              <p className="text-gray-500 mb-4">
                Reports will appear here after your sitter completes their visits.
              </p>
              <div className="space-x-4">
                <Button onClick={() => router.push('/bookings')}>
                  Book a Service
                </Button>
                <Button onClick={() => router.push('/dashboard')} variant="outline">
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
