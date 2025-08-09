'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import api from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { uploadToCloudinary, testCloudinaryConnection } from '@/lib/cloudinary';
import { isAuthenticated } from '@/lib/auth';

export default function AddPetPage() {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    photo: '',
    breed: '',
    age: '',
    species: '',
    weight: '',
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
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  // Check authentication on component mount
  useState(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  });

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
      let photo = '';
      // Upload photo to Cloudinary if provided
      if (photoFile) {
        photo = await uploadToCloudinary(photoFile);
      }

      // Prepare pet data according to DTO
      const petData = {
        name: formData.name,
        type: formData.type || undefined,
        photo: photo || undefined,
        breed: formData.breed || undefined,
        age: formData.age || undefined,
        species: formData.species || undefined,
        weight: formData.weight ? Number(formData.weight) : undefined,
        microchipNumber: formData.microchipNumber || undefined,
        vaccinations: formData.vaccinations || undefined,
        medications: formData.medications || undefined,
        allergies: formData.allergies || undefined,
        dietaryRestrictions: formData.dietaryRestrictions || undefined,
        behaviorNotes: formData.behaviorNotes || undefined,
        emergencyContact: formData.emergencyContact || undefined,
        veterinarianInfo: formData.veterinarianInfo || undefined,
        careInstructions: formData.careInstructions || undefined,
        info: formData.info || undefined,
      };

      await api.post('/pets', petData);
      setSuccess('Pet added successfully!');
      // Reset form
      setFormData({
        name: '',
        type: '',
        photo: '',
        breed: '',
        age: '',
        species: '',
        weight: '',
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
      setError(error.response?.data?.message || 'Failed to add pet');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Add New Pet</h1>
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    name="age"
                    type="text"
                    placeholder="e.g., 3"
                    value={formData.age}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Additional Pet Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="space-y-2">
                <Label htmlFor="photo">Pet Photo</Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                {photoPreview && (
                  <div className="mt-2">
                    <img 
                      src={photoPreview} 
                      alt="Pet preview" 
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
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
                  variant="secondary"
                  onClick={async () => {
                    console.log('Testing Cloudinary connection...');
                    await testCloudinaryConnection();
                  }}
                >
                  Test Cloudinary
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
