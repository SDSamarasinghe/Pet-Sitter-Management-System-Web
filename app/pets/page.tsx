"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { isAuthenticated, getUserFromToken } from "@/lib/auth";
import { 
  PlusCircle, 
  Edit, 
  Trash2, 
  Download, 
  Eye, 
  Heart, 
  Calendar, 
  MapPin, 
  Phone, 
  User,
  FileText,
  Activity
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface Pet {
  _id: string;
  name: string;
  type: string;
  breed?: string;
  age?: string;
  weight?: string;
  species?: string;
  photo?: string;
  info?: string;
  microchipNumber?: string;
  vaccinations?: string;
  medications?: string;
  allergies?: string;
  dietaryRestrictions?: string;
  behaviorNotes?: string;
  emergencyContact?: string;
  veterinarianInfo?: string;
  careInstructions?: string;
}

interface Whiskarz {
  _id?: string;
  petId: string;
  careInstructions?: string;
  feedingSchedule?: string;
  exerciseRequirements?: string;
}

interface PetMedical {
  _id?: string;
  petId: string;
  vetBusinessName?: string;
  vetDoctorName?: string;
  vetAddress?: string;
  vetPhoneNumber?: string;
  currentOnVaccines?: string;
}

interface PetWithDetails {
  pet: Pet;
  care: Whiskarz | null;
  medical: PetMedical | null;
}

export default function MyPetsPage() {
  const [pets, setPets] = useState<PetWithDetails[]>([]);
  const [selectedPet, setSelectedPet] = useState<PetWithDetails | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState<{
    pet: Partial<Pet>;
    care: Partial<Whiskarz>;
    medical: Partial<PetMedical>;
  }>({
    pet: {},
    care: {},
    medical: {}
  });

  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    fetchPetsWithDetails();
  }, [router]);

  const fetchPetsWithDetails = async () => {
    try {
      const user = getUserFromToken();
      if (!user) {
        console.log('No user found in token');
        return;
      }
      
      console.log('Fetching pets for user:', user.userId);
      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
      
      // Check if token exists
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      
      // Use the basic pets endpoint that we know works
      const response = await api.get(`/pets/user/${user.userId}`);
      
      console.log('Pets API response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        // Transform the API response to match the expected format
        const transformedData = response.data.map((pet: any) => ({
          pet: {
            _id: pet._id,
            name: pet.name,
            type: pet.type,
            breed: pet.breed,
            age: pet.age,
            weight: pet.weight,
            photo: pet.photo,
            microchipNumber: pet.microchipNumber,
            medications: pet.medications,
            allergies: pet.allergies,
            dietaryRestrictions: pet.dietaryRestrictions,
            behaviorNotes: pet.behaviorNotes,
            emergencyContact: pet.emergencyContact,
            veterinarianInfo: pet.veterinarianInfo,
            careInstructions: pet.careInstructions,
            info: pet.info
          },
          care: pet.careData ? {
            _id: pet.careData._id,
            petId: pet.careData.petId,
            careInstructions: pet.careData.careInstructions,
            feedingSchedule: pet.careData.feedingSchedule,
            exerciseRequirements: pet.careData.exerciseRequirements
          } : null,
          medical: pet.medicalData ? {
            _id: pet.medicalData._id,
            petId: pet.medicalData.petId,
            vetBusinessName: pet.medicalData.vetBusinessName,
            vetDoctorName: pet.medicalData.vetDoctorName,
            vetAddress: pet.medicalData.vetAddress,
            vetPhoneNumber: pet.medicalData.vetPhoneNumber,
            currentOnVaccines: pet.medicalData.currentOnVaccines
          } : null
        }));
        
        console.log('Transformed pets data:', transformedData);
        setPets(transformedData);
      } else {
        console.warn('Unexpected pets response format:', response.data);
        setPets([]);
      }
    } catch (error: any) {
      console.error('Error fetching pets:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      toast({
        title: "Error",
        description: `Failed to load pets: ${error.response?.data?.message || error.message}`,
        variant: "destructive",
      });
      setPets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPet = (petWithDetails: PetWithDetails) => {
    setSelectedPet(petWithDetails);
    
    // Clean the care data - remove _id and petId
    const cleanCareData: any = petWithDetails.care ? { ...petWithDetails.care } : {};
    if (cleanCareData._id) delete cleanCareData._id;
    if (cleanCareData.petId) delete cleanCareData.petId;
    
    // Clean the medical data - remove _id and petId
    const cleanMedicalData: any = petWithDetails.medical ? { ...petWithDetails.medical } : {};
    if (cleanMedicalData._id) delete cleanMedicalData._id;
    if (cleanMedicalData.petId) delete cleanMedicalData.petId;
    
    setEditData({
      pet: { ...petWithDetails.pet },
      care: cleanCareData,
      medical: cleanMedicalData
    });
    setIsEditDialogOpen(true);
  };

  const handleViewPet = (petWithDetails: PetWithDetails) => {
    setSelectedPet(petWithDetails);
    setIsViewDialogOpen(true);
  };

  const handleSaveChanges = async () => {
    if (!selectedPet) return;
    
    setIsSaving(true);
    try {
      // Update pet basic information
      if (Object.keys(editData.pet).length > 0) {
        await api.put(`/pets/${selectedPet.pet._id}`, editData.pet);
      }

      // Update or create care information
      if (Object.keys(editData.care).length > 0) {
        // Clean care data - remove _id and petId for API calls
        const cleanCareData: any = { ...editData.care };
        if (cleanCareData._id) delete cleanCareData._id;
        if (cleanCareData.petId) delete cleanCareData.petId;
        
        if (selectedPet.care?._id) {
          // Update existing care data
          await api.put(`/pets/${selectedPet.pet._id}/care`, cleanCareData);
        } else {
          // Create new care data - backend will handle petId
          await api.put(`/pets/${selectedPet.pet._id}/care`, cleanCareData);
        }
      }

      // Update or create medical information
      if (Object.keys(editData.medical).length > 0) {
        // Clean medical data - remove _id and petId for API calls
        const cleanMedicalData: any = { ...editData.medical };
        if (cleanMedicalData._id) delete cleanMedicalData._id;
        if (cleanMedicalData.petId) delete cleanMedicalData.petId;
        
        if (selectedPet.medical?._id) {
          // Update existing medical data
          await api.put(`/pets/${selectedPet.pet._id}/medical`, cleanMedicalData);
        } else {
          // Create new medical data - backend will handle petId
          await api.put(`/pets/${selectedPet.pet._id}/medical`, cleanMedicalData);
        }
      }

      toast({
        title: "Success",
        description: "Pet information updated successfully",
      });

      setIsEditDialogOpen(false);
      fetchPetsWithDetails(); // Refresh the list
      
      // Notify other tabs/windows that pet data has been updated
      window.dispatchEvent(new CustomEvent('petDataUpdated', {
        detail: {
          action: 'update',
          petId: selectedPet.pet._id,
          petName: selectedPet.pet.name,
          timestamp: new Date().toISOString()
        }
      }));
      
    } catch (error: any) {
      console.error('Error updating pet:', error);
      console.error('Error details:', error.response?.data);
      toast({
        title: "Error",
        description: `Failed to update pet information: ${error.response?.data?.message || error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePet = async (petId: string, petName: string) => {
    if (!confirm(`Are you sure you want to delete ${petName}? This will also delete all medical and care information.`)) {
      return;
    }

    try {
      await api.delete(`/pets/${petId}`);
      toast({
        title: "Success",
        description: `${petName} has been deleted successfully`,
      });
      fetchPetsWithDetails(); // Refresh the list
      
      // Notify other tabs/windows that pet data has been updated
      window.dispatchEvent(new CustomEvent('petDataUpdated', {
        detail: {
          action: 'delete',
          petId: petId,
          petName: petName,
          timestamp: new Date().toISOString()
        }
      }));
      
    } catch (error) {
      console.error('Error deleting pet:', error);
      toast({
        title: "Error",
        description: "Failed to delete pet",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = async (petId: string, petName: string) => {
    try {
      const response = await api.get(`/pets/${petId}/pdf`, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `pet-profile-${petName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast({
        title: "Success",
        description: `Pet profile PDF downloaded successfully`,
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: "Error",
        description: "Failed to download PDF",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
          <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Pets</h1>
          <p className="text-gray-600 mt-2">Manage your pets and their care information</p>
        </div>
        <Button 
          onClick={() => router.push('/pets/add')}
          className="bg-primary hover:bg-primary/90"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Add New Pet
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pets.map((petWithDetails) => {
          const { pet, care, medical } = petWithDetails;
          return (
            <Card key={pet._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    {pet.photo ? (
                      <img 
                        src={pet.photo} 
                        alt={pet.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <Heart className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg">{pet.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {pet.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  {pet.breed && (
                    <div className="flex items-center">
                      <span className="font-medium">Breed:</span>
                      <span className="ml-2">{pet.breed}</span>
                    </div>
                  )}
                  {pet.age && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{pet.age} years old</span>
                    </div>
                  )}
                  {pet.weight && (
                    <div className="flex items-center">
                      <Activity className="w-4 h-4 mr-1" />
                      <span>{pet.weight}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditPet(petWithDetails)}
                    className="flex items-center justify-center gap-1 text-xs"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeletePet(pet._id, pet.name)}
                    className="text-red-600 hover:text-red-700 flex items-center justify-center gap-1 text-xs"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewPet(petWithDetails)}
                    className="flex items-center justify-center gap-1 text-xs"
                  >
                    <Eye className="w-4 h-4" />
                    Profile Preview
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadPDF(pet._id, pet.name)}
                    className="flex items-center justify-center gap-1 text-xs"
                  >
                    <FileText className="w-4 h-4" />
                    PDF Info Sheet
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {pets.length === 0 && (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pets registered</h3>
          <p className="text-gray-500 mb-6">Get started by adding your first pet.</p>
          <Button onClick={() => router.push('/pets/add')}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Your First Pet
          </Button>
        </div>
      )}

      {/* View Pet Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              {selectedPet?.pet.name} - Complete Profile
            </DialogTitle>
          </DialogHeader>
          
          {selectedPet && (
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="medical">Medical</TabsTrigger>
                <TabsTrigger value="care">Care</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-medium">Name</Label>
                    <p className="text-sm text-gray-600">{selectedPet.pet.name}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Type</Label>
                    <p className="text-sm text-gray-600">{selectedPet.pet.type}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Breed</Label>
                    <p className="text-sm text-gray-600">{selectedPet.pet.breed || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Age</Label>
                    <p className="text-sm text-gray-600">{selectedPet.pet.age || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Weight</Label>
                    <p className="text-sm text-gray-600">{selectedPet.pet.weight || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Microchip</Label>
                    <p className="text-sm text-gray-600">{selectedPet.pet.microchipNumber || 'N/A'}</p>
                  </div>
                </div>
                {selectedPet.pet.info && (
                  <div>
                    <Label className="font-medium">Information</Label>
                    <p className="text-sm text-gray-600 mt-1">{selectedPet.pet.info}</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="medical" className="space-y-4">
                {selectedPet.medical ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-medium">Vet Business</Label>
                      <p className="text-sm text-gray-600">{selectedPet.medical.vetBusinessName || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Vet Doctor</Label>
                      <p className="text-sm text-gray-600">{selectedPet.medical.vetDoctorName || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Vet Address</Label>
                      <p className="text-sm text-gray-600">{selectedPet.medical.vetAddress || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Vet Phone</Label>
                      <p className="text-sm text-gray-600">{selectedPet.medical.vetPhoneNumber || 'N/A'}</p>
                    </div>
                    <div className="col-span-2">
                      <Label className="font-medium">Vaccination Status</Label>
                      <p className="text-sm text-gray-600">{selectedPet.medical.currentOnVaccines || 'N/A'}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No medical information available</p>
                )}
              </TabsContent>
              
              <TabsContent value="care" className="space-y-4">
                {selectedPet.care ? (
                  <div className="space-y-4">
                    <div>
                      <Label className="font-medium">Care Instructions</Label>
                      <p className="text-sm text-gray-600 mt-1">{selectedPet.care.careInstructions || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Feeding Schedule</Label>
                      <p className="text-sm text-gray-600 mt-1">{selectedPet.care.feedingSchedule || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Exercise Requirements</Label>
                      <p className="text-sm text-gray-600 mt-1">{selectedPet.care.exerciseRequirements || 'N/A'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label className="font-medium">Care Instructions (from Basic Info)</Label>
                      <p className="text-sm text-gray-600 mt-1">{selectedPet.pet.careInstructions || 'N/A'}</p>
                    </div>
                    <p className="text-gray-500 text-center py-4">No additional care information available</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Pet Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Edit className="w-5 h-5 mr-2" />
              Edit {selectedPet?.pet.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedPet && (
            <div>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="medical">Medical</TabsTrigger>
                  <TabsTrigger value="care">Care</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={editData.pet.name || ''}
                        onChange={(e) => setEditData(prev => ({
                          ...prev,
                          pet: { ...prev.pet, name: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="breed">Breed</Label>
                      <Input
                        id="breed"
                        value={editData.pet.breed || ''}
                        onChange={(e) => setEditData(prev => ({
                          ...prev,
                          pet: { ...prev.pet, breed: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        value={editData.pet.age || ''}
                        onChange={(e) => setEditData(prev => ({
                          ...prev,
                          pet: { ...prev.pet, age: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="weight">Weight</Label>
                      <Input
                        id="weight"
                        value={editData.pet.weight || ''}
                        onChange={(e) => setEditData(prev => ({
                          ...prev,
                          pet: { ...prev.pet, weight: e.target.value }
                        }))}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="microchip">Microchip Number</Label>
                      <Input
                        id="microchip"
                        value={editData.pet.microchipNumber || ''}
                        onChange={(e) => setEditData(prev => ({
                          ...prev,
                          pet: { ...prev.pet, microchipNumber: e.target.value }
                        }))}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="info">Information</Label>
                      <Textarea
                        id="info"
                        value={editData.pet.info || ''}
                        onChange={(e) => setEditData(prev => ({
                          ...prev,
                          pet: { ...prev.pet, info: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="medical" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="vetBusiness">Vet Business Name</Label>
                      <Input
                        id="vetBusiness"
                        value={editData.medical.vetBusinessName || ''}
                        onChange={(e) => setEditData(prev => ({
                          ...prev,
                          medical: { ...prev.medical, vetBusinessName: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="vetDoctor">Vet Doctor Name</Label>
                      <Input
                        id="vetDoctor"
                        value={editData.medical.vetDoctorName || ''}
                        onChange={(e) => setEditData(prev => ({
                          ...prev,
                          medical: { ...prev.medical, vetDoctorName: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="vetAddress">Vet Address</Label>
                      <Input
                        id="vetAddress"
                        value={editData.medical.vetAddress || ''}
                        onChange={(e) => setEditData(prev => ({
                          ...prev,
                          medical: { ...prev.medical, vetAddress: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="vetPhone">Vet Phone Number</Label>
                      <Input
                        id="vetPhone"
                        value={editData.medical.vetPhoneNumber || ''}
                        onChange={(e) => setEditData(prev => ({
                          ...prev,
                          medical: { ...prev.medical, vetPhoneNumber: e.target.value }
                        }))}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="vaccines">Vaccination Status</Label>
                      <Input
                        id="vaccines"
                        value={editData.medical.currentOnVaccines || ''}
                        onChange={(e) => setEditData(prev => ({
                          ...prev,
                          medical: { ...prev.medical, currentOnVaccines: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="care" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="careInstructions">Care Instructions</Label>
                      <Textarea
                        id="careInstructions"
                        value={editData.care.careInstructions || ''}
                        onChange={(e) => setEditData(prev => ({
                          ...prev,
                          care: { ...prev.care, careInstructions: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="feedingSchedule">Feeding Schedule</Label>
                      <Textarea
                        id="feedingSchedule"
                        value={editData.care.feedingSchedule || ''}
                        onChange={(e) => setEditData(prev => ({
                          ...prev,
                          care: { ...prev.care, feedingSchedule: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="exerciseRequirements">Exercise Requirements</Label>
                      <Textarea
                        id="exerciseRequirements"
                        value={editData.care.exerciseRequirements || ''}
                        onChange={(e) => setEditData(prev => ({
                          ...prev,
                          care: { ...prev.care, exerciseRequirements: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
