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
    // Basic Information
    name: '',
    type: '',
    breed: '',
    colouring: '',
    gender: '',
    dateOfBirth: '',
    age: '',
    weight: 0,
    spayedNeutered: '',
    microchipNumber: '',
    rabiesTagNumber: '',
    insuranceDetails: '',
    
    // Medical Information
    vetBusinessName: '',
    vetDoctorName: '',
    vetAddress: '',
    vetPhoneNumber: '',
    currentOnVaccines: '',
    onAnyMedication: '',
    vaccinations: '',
    medications: '',
    allergies: '',
    
    // Care Information
    personalityPhobiasPreferences: '',
    typeOfFood: '',
    dietFoodWaterInstructions: '',
    anyHistoryOfBiting: '',
    locationOfStoredPetFood: '',
    litterBoxLocation: '',
    locationOfPetCarrier: '',
    feedingSchedule: '',
    exerciseRequirements: '',
    anyAdditionalInfo: '',
    
    // Other
    dietaryRestrictions: '',
    behaviorNotes: '',
    emergencyContact: '',
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
      // Step 1: Create FormData for basic pet information with photo
      const formDataToSend = new FormData();
      
      // Add basic pet fields only
      formDataToSend.append('name', formData.name);
      if (formData.type) formDataToSend.append('type', formData.type);
      if (formData.breed) formDataToSend.append('breed', formData.breed);
      if (formData.colouring) formDataToSend.append('colouring', formData.colouring);
      if (formData.gender) formDataToSend.append('gender', formData.gender);
      if (formData.dateOfBirth) formDataToSend.append('dateOfBirth', formData.dateOfBirth);
      if (formData.age) formDataToSend.append('age', formData.age);
      if (formData.weight) formDataToSend.append('weight', formData.weight.toString());
      if (formData.spayedNeutered) formDataToSend.append('spayedNeutered', formData.spayedNeutered);
      if (formData.microchipNumber) formDataToSend.append('microchipNumber', formData.microchipNumber);
      if (formData.rabiesTagNumber) formDataToSend.append('rabiesTagNumber', formData.rabiesTagNumber);
      if (formData.insuranceDetails) formDataToSend.append('insuranceDetails', formData.insuranceDetails);
      if (formData.vaccinations) formDataToSend.append('vaccinations', formData.vaccinations);
      if (formData.medications) formDataToSend.append('medications', formData.medications);
      if (formData.allergies) formDataToSend.append('allergies', formData.allergies);
      if (formData.dietaryRestrictions) formDataToSend.append('dietaryRestrictions', formData.dietaryRestrictions);
      if (formData.behaviorNotes) formDataToSend.append('behaviorNotes', formData.behaviorNotes);
      if (formData.emergencyContact) formDataToSend.append('emergencyContact', formData.emergencyContact);
      if (formData.careInstructions) formDataToSend.append('careInstructions', formData.careInstructions);
      if (formData.info) formDataToSend.append('info', formData.info);
      
      // Add photo file if provided
      if (photoFile) {
        formDataToSend.append('petImage', photoFile);
      }

      // Step 1: Create the pet with basic information
      const token = localStorage.getItem('token');
      const baseURL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');
      const petResponse = await fetch(`${baseURL}/pets`, {
        method: 'POST',
        body: formDataToSend,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!petResponse.ok) {
        const responseText = await petResponse.text();
        console.error('Response status:', petResponse.status);
        console.error('Response text:', responseText);
        
        let errorMessage = 'Failed to add pet';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = responseText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const petResult = await petResponse.json();
      const petId = petResult._id || petResult.id;
      
      if (!petId) {
        throw new Error('Pet created but ID not returned from server');
      }

      console.log('Pet created successfully with ID:', petId);

      // Step 2: Add medical information if any medical fields are filled
      const hasMedicalData = 
        formData.vetBusinessName || 
        formData.vetDoctorName || 
        formData.vetAddress || 
        formData.vetPhoneNumber || 
        formData.currentOnVaccines || 
        formData.onAnyMedication;

      if (hasMedicalData) {
        const medicalData: any = {};
        if (formData.vetBusinessName) medicalData.vetBusinessName = formData.vetBusinessName;
        if (formData.vetDoctorName) medicalData.vetDoctorName = formData.vetDoctorName;
        if (formData.vetAddress) medicalData.vetAddress = formData.vetAddress;
        if (formData.vetPhoneNumber) medicalData.vetPhoneNumber = formData.vetPhoneNumber;
        if (formData.currentOnVaccines) medicalData.currentOnVaccines = formData.currentOnVaccines;
        if (formData.onAnyMedication) medicalData.onAnyMedication = formData.onAnyMedication;

        const medicalResponse = await api.put(`/pets/${petId}/medical`, medicalData);
        console.log('Medical data added successfully:', medicalResponse.data);
      }

      // Step 3: Add care information if any care fields are filled
      const hasCareData = 
        formData.personalityPhobiasPreferences || 
        formData.typeOfFood || 
        formData.dietFoodWaterInstructions || 
        formData.anyHistoryOfBiting || 
        formData.locationOfStoredPetFood || 
        formData.litterBoxLocation || 
        formData.locationOfPetCarrier || 
        formData.feedingSchedule || 
        formData.exerciseRequirements || 
        formData.anyAdditionalInfo;

      if (hasCareData) {
        const careData: any = {};
        if (formData.personalityPhobiasPreferences) careData.personalityPhobiasPreferences = formData.personalityPhobiasPreferences;
        if (formData.typeOfFood) careData.typeOfFood = formData.typeOfFood;
        if (formData.dietFoodWaterInstructions) careData.dietFoodWaterInstructions = formData.dietFoodWaterInstructions;
        if (formData.anyHistoryOfBiting) careData.anyHistoryOfBiting = formData.anyHistoryOfBiting;
        if (formData.locationOfStoredPetFood) careData.locationOfStoredPetFood = formData.locationOfStoredPetFood;
        if (formData.litterBoxLocation) careData.litterBoxLocation = formData.litterBoxLocation;
        if (formData.locationOfPetCarrier) careData.locationOfPetCarrier = formData.locationOfPetCarrier;
        if (formData.feedingSchedule) careData.feedingSchedule = formData.feedingSchedule;
        if (formData.exerciseRequirements) careData.exerciseRequirements = formData.exerciseRequirements;
        if (formData.anyAdditionalInfo) careData.anyAdditionalInfo = formData.anyAdditionalInfo;

        const careResponse = await api.put(`/pets/${petId}/care`, careData);
        console.log('Care data added successfully:', careResponse.data);
      }

      setSuccess('Pet added successfully with all details!');
      
      // Reset form
      setFormData({
        name: '',
        type: '',
        breed: '',
        colouring: '',
        gender: '',
        dateOfBirth: '',
        age: '',
        weight: 0,
        spayedNeutered: '',
        microchipNumber: '',
        rabiesTagNumber: '',
        insuranceDetails: '',
        vetBusinessName: '',
        vetDoctorName: '',
        vetAddress: '',
        vetPhoneNumber: '',
        currentOnVaccines: '',
        onAnyMedication: '',
        vaccinations: '',
        medications: '',
        allergies: '',
        personalityPhobiasPreferences: '',
        typeOfFood: '',
        dietFoodWaterInstructions: '',
        anyHistoryOfBiting: '',
        locationOfStoredPetFood: '',
        litterBoxLocation: '',
        locationOfPetCarrier: '',
        feedingSchedule: '',
        exerciseRequirements: '',
        anyAdditionalInfo: '',
        dietaryRestrictions: '',
        behaviorNotes: '',
        emergencyContact: '',
        careInstructions: '',
        info: '',
      });
      setPhotoFile(null);
      setPhotoPreview('');
      
      setTimeout(() => {
        router.push('/pets');
      }, 2000);
      
    } catch (error: any) {
      setError(error.message || 'Failed to add pet');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Pet Information</CardTitle>
            <CardDescription>
              Add your pet's details and a photo for our sitters to familiarize themselves.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* BASIC INFORMATION SECTION */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                
                {/* Row 1: Name, Type, Breed */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                      className="w-full border rounded-md px-3 py-2 bg-white text-sm"
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
                    <Label htmlFor="breed">Breed *</Label>
                    <Input
                      id="breed"
                      name="breed"
                      type="text"
                      placeholder="e.g., Golden Retriever"
                      value={formData.breed}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Row 2: Colouring, Gender, Date of Birth */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="colouring">Colouring *</Label>
                    <Input
                      id="colouring"
                      name="colouring"
                      type="text"
                      placeholder="e.g., Brown and white"
                      value={formData.colouring}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleSelectChange}
                      required
                      className="w-full border rounded-md px-3 py-2 bg-white text-sm"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Row 3: Age, Weight, Spayed/Neutered */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                      placeholder="0"
                      value={formData.weight}
                      onChange={handleInputChange}
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="spayedNeutered">Spayed/Neutered *</Label>
                    <select
                      id="spayedNeutered"
                      name="spayedNeutered"
                      value={formData.spayedNeutered}
                      onChange={handleSelectChange}
                      required
                      className="w-full border rounded-md px-3 py-2 bg-white text-sm"
                    >
                      <option value="">Select status</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>

                {/* Row 4: Microchip Number, Rabies Tag Number */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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

                  <div className="space-y-2">
                    <Label htmlFor="rabiesTagNumber">Rabies Tag Number</Label>
                    <Input
                      id="rabiesTagNumber"
                      name="rabiesTagNumber"
                      type="text"
                      placeholder="e.g., ABC123456"
                      value={formData.rabiesTagNumber}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Row 5: Insurance Details (full width) */}
                <div className="space-y-2">
                  <Label htmlFor="insuranceDetails">Insurance Details</Label>
                  <Textarea
                    id="insuranceDetails"
                    name="insuranceDetails"
                    placeholder="Pet insurance provider, policy number, coverage details"
                    value={formData.insuranceDetails}
                    onChange={handleInputChange}
                    rows={2}
                  />
                </div>
              </div>

              {/* MEDICAL INFORMATION SECTION */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-blue-700 mb-4">Medical Information</h3>
                
                {/* Row 1: Vet Business Name, Vet Doctor Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="vetBusinessName">Vet Business Name *</Label>
                    <Input
                      id="vetBusinessName"
                      name="vetBusinessName"
                      type="text"
                      placeholder="e.g., Happy Paws Veterinary Clinic"
                      value={formData.vetBusinessName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vetDoctorName">Vet Doctor Name</Label>
                    <Input
                      id="vetDoctorName"
                      name="vetDoctorName"
                      type="text"
                      placeholder="e.g., Dr. Sarah Johnson"
                      value={formData.vetDoctorName}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Row 2: Vet Address */}
                <div className="space-y-2 mb-4">
                  <Label htmlFor="vetAddress">Vet Address *</Label>
                  <Textarea
                    id="vetAddress"
                    name="vetAddress"
                    placeholder="Full address of the veterinary clinic"
                    value={formData.vetAddress}
                    onChange={handleInputChange}
                    rows={2}
                    required
                  />
                </div>

                {/* Row 3: Vet Phone Number, Current on Vaccines */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="vetPhoneNumber">Vet Phone Number *</Label>
                    <Input
                      id="vetPhoneNumber"
                      name="vetPhoneNumber"
                      type="tel"
                      placeholder="e.g., (555) 123-4567"
                      value={formData.vetPhoneNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentOnVaccines">Current on Vaccines *</Label>
                    <select
                      id="currentOnVaccines"
                      name="currentOnVaccines"
                      value={formData.currentOnVaccines}
                      onChange={handleSelectChange}
                      required
                      className="w-full border rounded-md px-3 py-2 bg-white text-sm"
                    >
                      <option value="">Select status</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                      <option value="Partial">Partial</option>
                    </select>
                  </div>
                </div>

                {/* Row 4: Vaccinations & Status */}
                <div className="space-y-2 mb-4">
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

                {/* Row 5: Current Medications */}
                <div className="space-y-2 mb-4">
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

                {/* Row 6: On Any Medication */}
                <div className="space-y-2 mb-4">
                  <Label htmlFor="onAnyMedication">On Any Medication Details</Label>
                  <Textarea
                    id="onAnyMedication"
                    name="onAnyMedication"
                    placeholder="Detailed information about current medications and administration instructions"
                    value={formData.onAnyMedication}
                    onChange={handleInputChange}
                    rows={2}
                  />
                </div>

                {/* Row 7: Allergies & Sensitivities */}
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
              </div>

              {/* CARE INFORMATION SECTION */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-green-700 mb-4">Care Information</h3>
                
                {/* Row 1: Personality, Phobias & Preferences */}
                <div className="space-y-2 mb-4">
                  <Label htmlFor="personalityPhobiasPreferences">Personality, Phobias & Preferences *</Label>
                  <Textarea
                    id="personalityPhobiasPreferences"
                    name="personalityPhobiasPreferences"
                    placeholder="Describe your pet's personality, any phobias, likes and dislikes"
                    value={formData.personalityPhobiasPreferences}
                    onChange={handleInputChange}
                    rows={3}
                    required
                  />
                </div>

                {/* Row 2: Type of Food, Any History of Biting */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="typeOfFood">Type of Food *</Label>
                    <Input
                      id="typeOfFood"
                      name="typeOfFood"
                      type="text"
                      placeholder="e.g., Royal Canin Adult Dry Food"
                      value={formData.typeOfFood}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="anyHistoryOfBiting">Any History of Biting *</Label>
                    <select
                      id="anyHistoryOfBiting"
                      name="anyHistoryOfBiting"
                      value={formData.anyHistoryOfBiting}
                      onChange={handleSelectChange}
                      required
                      className="w-full border rounded-md px-3 py-2 bg-white text-sm"
                    >
                      <option value="">Select option</option>
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                </div>

                {/* Row 3: Diet, Food & Water Instructions */}
                <div className="space-y-2 mb-4">
                  <Label htmlFor="dietFoodWaterInstructions">Diet, Food & Water Instructions *</Label>
                  <Textarea
                    id="dietFoodWaterInstructions"
                    name="dietFoodWaterInstructions"
                    placeholder="Detailed feeding instructions, portion sizes, meal times, water requirements"
                    value={formData.dietFoodWaterInstructions}
                    onChange={handleInputChange}
                    rows={3}
                    required
                  />
                </div>

                {/* Row 4: Feeding Schedule, Exercise Requirements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="feedingSchedule">Feeding Schedule</Label>
                    <Textarea
                      id="feedingSchedule"
                      name="feedingSchedule"
                      placeholder="e.g., 8:00 AM - 1 cup, 6:00 PM - 1 cup"
                      value={formData.feedingSchedule}
                      onChange={handleInputChange}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="exerciseRequirements">Exercise Requirements</Label>
                    <Textarea
                      id="exerciseRequirements"
                      name="exerciseRequirements"
                      placeholder="e.g., 30 minutes walk twice daily"
                      value={formData.exerciseRequirements}
                      onChange={handleInputChange}
                      rows={2}
                    />
                  </div>
                </div>

                {/* Row 5: Location of Stored Pet Food, Litter Box Location, Pet Carrier Location */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="locationOfStoredPetFood">Location of Stored Pet Food *</Label>
                    <Input
                      id="locationOfStoredPetFood"
                      name="locationOfStoredPetFood"
                      type="text"
                      placeholder="e.g., Kitchen pantry, top shelf"
                      value={formData.locationOfStoredPetFood}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="litterBoxLocation">Litter Box Location *</Label>
                    <Input
                      id="litterBoxLocation"
                      name="litterBoxLocation"
                      type="text"
                      placeholder="e.g., Bathroom, under sink"
                      value={formData.litterBoxLocation}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="locationOfPetCarrier">Location of Pet Carrier *</Label>
                    <Input
                      id="locationOfPetCarrier"
                      name="locationOfPetCarrier"
                      type="text"
                      placeholder="e.g., Garage, top shelf"
                      value={formData.locationOfPetCarrier}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Row 6: Additional Care Info */}
                <div className="space-y-2">
                  <Label htmlFor="anyAdditionalInfo">Additional Care Info</Label>
                  <Textarea
                    id="anyAdditionalInfo"
                    name="anyAdditionalInfo"
                    placeholder="Any other important care information for sitters"
                    value={formData.anyAdditionalInfo}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
              </div>

              {/* OTHER INFORMATION SECTION */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Other Information</h3>
                
                <div className="space-y-2 mb-4">
                  <Label htmlFor="dietaryRestrictions">Dietary Restrictions</Label>
                  <Textarea
                    id="dietaryRestrictions"
                    name="dietaryRestrictions"
                    placeholder="Special diet requirements, treats allowed/not allowed"
                    value={formData.dietaryRestrictions}
                    onChange={handleInputChange}
                    rows={2}
                  />
                </div>

                <div className="space-y-2 mb-4">
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

                <div className="space-y-2 mb-4">
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

                <div className="space-y-2 mb-4">
                  <Label htmlFor="careInstructions">Care Instructions</Label>
                  <Textarea
                    id="careInstructions"
                    name="careInstructions"
                    placeholder="General care instructions for your pet"
                    value={formData.careInstructions}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="info">General Info / Special Needs *</Label>
                  <Textarea
                    id="info"
                    name="info"
                    placeholder="General pet information, special needs, or notes for sitters"
                    value={formData.info}
                    onChange={handleInputChange}
                    rows={3}
                    required
                  />
                </div>
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
                          <span className="text-primary hover:text-primary/80 font-medium">Upload a photo</span>
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
                  onClick={() => router.push('/pets')}
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
