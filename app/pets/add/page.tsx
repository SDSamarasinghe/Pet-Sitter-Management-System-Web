'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import api from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { isAuthenticated } from '@/lib/auth';

export default function AddPetPage() {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    photo: '',
    breed: '',
    age: '',
    species: '',
    weight: 0,
    microchipNumber: '',
    vaccinations: '',
    medications: '',
    allergies: '',
    dietaryRestrictions: '',
    behaviorNotes: '',
    emergencyContact: '',
    veterinarianInfo: '',
    careInstructions: '',
    info: '',
  });``
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  // Check authentication on component mount
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Create FormData for multipart/form-data request
      const formDataToSend = new FormData();
      
      // Add all text fields
      formDataToSend.append('name', formData.name);
      if (formData.type) formDataToSend.append('type', formData.type);
      if (formData.breed) formDataToSend.append('breed', formData.breed);
      if (formData.age) formDataToSend.append('age', formData.age);
      if (formData.species) formDataToSend.append('species', formData.species);
      if (formData.weight) formDataToSend.append('weight', formData.weight.toString());
      if (formData.microchipNumber) formDataToSend.append('microchipNumber', formData.microchipNumber);
      if (formData.vaccinations) formDataToSend.append('vaccinations', formData.vaccinations);
      if (formData.medications) formDataToSend.append('medications', formData.medications);
      if (formData.allergies) formDataToSend.append('allergies', formData.allergies);
      if (formData.dietaryRestrictions) formDataToSend.append('dietaryRestrictions', formData.dietaryRestrictions);
      if (formData.behaviorNotes) formDataToSend.append('behaviorNotes', formData.behaviorNotes);
      if (formData.emergencyContact) formDataToSend.append('emergencyContact', formData.emergencyContact);
      if (formData.veterinarianInfo) formDataToSend.append('veterinarianInfo', formData.veterinarianInfo);
      if (formData.careInstructions) formDataToSend.append('careInstructions', formData.careInstructions);
      if (formData.info) formDataToSend.append('info', formData.info);
      
      // Add photo file if provided
      if (photoFile) {
        formDataToSend.append('petImage', photoFile);
      }

      // Send multipart/form-data request to backend API
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/pets`, {
        method: 'POST',
        body: formDataToSend,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Log the response for debugging
        const responseText = await response.text();
        console.error('Response status:', response.status);
        console.error('Response text:', responseText);
        
        // Try to parse as JSON, fallback to text
        let errorMessage = 'Failed to add pet';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = responseText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      setSuccess('Pet added successfully!');
      
      // Reset form
      setFormData({
        name: '',
        type: '',
        photo: '',
        breed: '',
        age: '',
        species: '',
        weight: 0,
        microchipNumber: '',
        vaccinations: '',
        medications: '',
        allergies: '',
        dietaryRestrictions: '',
        behaviorNotes: '',
        emergencyContact: '',
        veterinarianInfo: '',
        careInstructions: '',
        info: '',
      });
      setPhotoFile(null);
      setPhotoPreview('');
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
      
    } catch (error: any) {
      setError(error.message || 'Failed to add pet');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Pet Information</CardTitle>
            <CardDescription>
              Add your pet's details and a photo for our sitters to familiarize themselves.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information - 3 columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Pet Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="e.g., Buddy"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleSelectChange}
                    required
                    className="w-full border rounded px-3 py-2 bg-white"
                  >
                    <option value="">Select type</option>
                    <option value="Cat(s)">Cat(s)</option>
                    <option value="Dog(s)">Dog(s)</option>
                    <option value="Rabbit(s)">Rabbit(s)</option>
                    <option value="Bird(s)">Bird(s)</option>
                    <option value="Guinea pig(s)">Guinea pig(s)</option>
                    <option value="Ferret(s)">Ferret(s)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="breed">Breed</Label>
                  <Input
                    id="breed"
                    name="breed"
                    type="text"
                    placeholder="e.g., Golden Retriever"
                    value={formData.breed}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Physical Details - 3 columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    name="age"
                    type="text"
                    placeholder="e.g., 3 years"
                    value={formData.age}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (lbs)</Label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    placeholder="e.g., 25"
                    value={formData.weight}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="microchipNumber">Microchip Number</Label>
                  <Input
                    id="microchipNumber"
                    name="microchipNumber"
                    type="text"
                    placeholder="e.g., 123456789012345"
                    value={formData.microchipNumber}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vaccinations">Vaccinations & Status</Label>
                <Textarea
                  id="vaccinations"
                  name="vaccinations"
                  placeholder="List current vaccinations and dates (e.g., Rabies 2024-01-15, DHPP 2024-02-10)"
                  value={formData.vaccinations}
                  onChange={handleInputChange}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medications">Current Medications</Label>
                <Textarea
                  id="medications"
                  name="medications"
                  placeholder="List any medications, dosages, and schedules"
                  value={formData.medications}
                  onChange={handleInputChange}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies & Sensitivities</Label>
                <Textarea
                  id="allergies"
                  name="allergies"
                  placeholder="List any known allergies or sensitivities"
                  value={formData.allergies}
                  onChange={handleInputChange}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dietaryRestrictions">Dietary Restrictions</Label>
                <Textarea
                  id="dietaryRestrictions"
                  name="dietaryRestrictions"
                  placeholder="Special diet requirements, feeding schedule, treats allowed/not allowed"
                  value={formData.dietaryRestrictions}
                  onChange={handleInputChange}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="behaviorNotes">Behavior Notes</Label>
                <Textarea
                  id="behaviorNotes"
                  name="behaviorNotes"
                  placeholder="Temperament, behavior with strangers, other pets, children, etc."
                  value={formData.behaviorNotes}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Textarea
                  id="emergencyContact"
                  name="emergencyContact"
                  placeholder="Emergency contact name and phone number"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="veterinarianInfo">Veterinarian Information</Label>
                <Textarea
                  id="veterinarianInfo"
                  name="veterinarianInfo"
                  placeholder="Veterinarian name, clinic, address, and phone number"
                  value={formData.veterinarianInfo}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>

              {/* Pet Photo Upload Section */}
              <div className="space-y-4">
                <Label htmlFor="photo">Pet Photo</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  {photoPreview ? (
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <img 
                          src={photoPreview} 
                          alt="Pet preview" 
                          className="w-40 h-40 object-cover rounded-lg shadow-md"
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">Photo uploaded successfully!</p>
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoFile(null);
                            setPhotoPreview('');
                          }}
                          className="text-sm text-red-600 hover:text-red-800 underline"
                        >
                          Remove photo
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="mx-auto w-16 h-16 text-gray-400">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <label htmlFor="photo" className="cursor-pointer">
                          <span className="text-blue-600 hover:text-blue-800 font-medium">Upload a photo</span>
                          <span className="text-gray-600"> or drag and drop</span>
                        </label>
                        <p className="text-sm text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    </div>
                  )}
                  <input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="careInstructions">Care Instructions</Label>
                <Textarea
                  id="careInstructions"
                  name="careInstructions"
                  placeholder="Provide detailed care instructions for your pet (feeding schedule, medications, special needs, etc.)"
                  value={formData.careInstructions}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="info">General Info / Special Needs</Label>
                <Textarea
                  id="info"
                  name="info"
                  placeholder="General pet information, special needs, or notes for sitters"
                  value={formData.info}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert className="border-green-400 bg-green-50 text-green-800">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  className="flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Adding Pet...
                    </>
                  ) : (
                    'Add Pet'
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
