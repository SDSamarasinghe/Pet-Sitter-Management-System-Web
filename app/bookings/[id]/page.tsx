'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import api from '@/lib/api';
import { isAuthenticated, getUserFromToken } from '@/lib/auth';
import { ArrowLeft, Calendar, Clock, MapPin, PawPrint, User, MessageCircle, Send, Edit, Trash2 } from 'lucide-react';

interface Pet {
  _id: string;
  name: string;
  type?: string;
  species: string;
  breed?: string;
  colouring?: string;
  gender?: string;
  dateOfBirth?: string;
  spayedNeutered?: string;
  age?: number | string;
  weight?: string;
  microchipNumber?: string;
  rabiesTagNumber?: string;
  insuranceDetails?: string;
  vaccinations?: string;
  medications?: string;
  allergies?: string;
  dietaryRestrictions?: string;
  behaviorNotes?: string;
  emergencyContact?: string;
  veterinarianInfo?: string;
  photo?: string;
  photoUrl?: string;
  careInstructions?: string;
  info?: string;
  // Care details
  personalityPhobiasPreferences?: string;
  typeOfFood?: string;
  dietFoodWaterInstructions?: string;
  anyHistoryOfBiting?: string;
  locationOfStoredPetFood?: string;
  litterBoxLocation?: string;
  locationOfPetCarrier?: string;
  anyAdditionalInfo?: string;
  feedingSchedule?: string;
  exerciseRequirements?: string;
  // Medical details
  vetBusinessName?: string;
  vetDoctorName?: string;
  vetAddress?: string;
  vetPhoneNumber?: string;
  currentOnVaccines?: string;
  onAnyMedication?: string;
  // Merged care and medical data from separate endpoints
  careData?: {
    personalityPhobiasPreferences?: string;
    typeOfFood?: string;
    dietFoodWaterInstructions?: string;
    anyHistoryOfBiting?: string;
    locationOfStoredPetFood?: string;
    litterBoxLocation?: string;
    locationOfPetCarrier?: string;
    anyAdditionalInfo?: string;
    careInstructions?: string;
    feedingSchedule?: string;
    exerciseRequirements?: string;
  };
  medicalData?: {
    vetBusinessName?: string;
    vetDoctorName?: string;
    vetAddress?: string;
    vetPhoneNumber?: string;
    vaccinationStatus?: string;
    medications?: string;
    allergies?: string;
    medicalConditions?: string;
    microchipNumber?: string;
    lastVetVisitDate?: string;
  };
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  cellPhoneNumber?: string;
  homePhoneNumber?: string;
  address?: string | {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  zipCode?: string;
  emergencyContact?: string | {
    name: string;
    phone: string;
  };
  emergencyContactFirstName?: string;
  emergencyContactLastName?: string;
  emergencyContactCellPhone?: string;
  emergencyContactHomePhone?: string;
  homeCareInfo?: string;
  parkingForSitter?: string;
  garbageCollectionDay?: string;
  fuseBoxLocation?: string;
  outOfBoundAreas?: string;
  videoSurveillance?: string;
  cleaningSupplyLocation?: string;
  broomDustpanLocation?: string;
  mailPickUp?: string;
  waterIndoorPlants?: string;
  additionalHomeCareInfo?: string;
  keyHandlingMethod?: string;
  superintendentContact?: string;
  friendNeighbourContact?: string;
  keyAccess?: {
    hasKey: boolean;
    keyLocation?: string;
    accessInstructions?: string;
  };
  profilePicture?: string;
}

interface Booking {
  _id: string;
  startDate: string;
  endDate: string;
  serviceType: string;
  status: string;
  notes?: string;
  pets?: Pet[] | string[]; // Can be populated Pet objects or just IDs
  petIds?: string[]; // Alternative field name
  userId?: User;
  sitterId?: User;
  specialInstructions?: string;
  emergencyInstructions?: string;
  veterinarianInfo?: {
    name: string;
    phone: string;
    address: string;
  };
  createdAt: string;
  updatedAt: string;
  totalAmount?: number;
  paidAmount?: number;
  paymentStatus?: string;
}

interface Comment {
  _id: string;
  bookingId: string;
  addedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  body: string;
  role: string;
  attachments: any[];
  isInternal: boolean;
  readBy: Array<{
    user: string;
    readAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface CommentsResponse {
  comments: Comment[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalComments: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export default function BookingDetailPage() {
  // ...existing code...
  const [petsWithDetails, setPetsWithDetails] = useState<any[]>([]);
  const [loadingPets, setLoadingPets] = useState(false);

  // Restore context for rest of component
  // ...existing hooks and logic...
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [clientDetails, setClientDetails] = useState<User | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [keyAccess, setKeyAccess] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [petTabs, setPetTabs] = useState<{ [petId: string]: string }>({});

  const bookingId = params.id as string;

  // Utility: Format date/time for booking
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  // Comments fetcher
  const fetchCommentsData = async () => {
    try {
      setIsLoadingComments(true);
      const response = await api.get(`/comments/booking/${bookingId}`);
      const data: CommentsResponse = response.data;
      setComments(data.comments);
    } catch (error: any) {
      console.error('Error fetching comments:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch comments',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingComments(false);
    }
  };

  // Comments submit
  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    try {
      setIsSubmittingComment(true);
      const response = await api.post('/comments', {
        bookingId,
        body: newComment.trim(),
        isInternal: false,
      });
      setComments(prev => [response.data, ...prev]);
      setNewComment('');
      toast({
        title: 'Success',
        description: 'Comment added successfully',
      });
    } catch (error: any) {
      console.error('Error submitting comment:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to submit comment',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Comments edit
  const handleEditComment = async (commentId: string) => {
    if (!editCommentText.trim()) return;
    try {
      const response = await api.put(`/comments/${commentId}`, {
        body: editCommentText.trim(),
      });
      setComments(prev => prev.map(comment =>
        comment._id === commentId ? response.data : comment
      ));
      setEditingComment(null);
      setEditCommentText('');
      toast({
        title: 'Success',
        description: 'Comment updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating comment:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update comment',
        variant: 'destructive',
      });
    }
  };

  // Comments delete
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      await api.delete(`/comments/${commentId}`);
      setComments(prev => prev.filter(comment => comment._id !== commentId));
      toast({
        title: 'Success',
        description: 'Comment deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete comment',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const user = getUserFromToken();
    setCurrentUser(user);
    if (user?.role === 'sitter') {
      fetchSitterBookingDetails(user.userId);
    } else {
      fetchBookingDetails();
    }
    fetchCommentsData();
  }, [bookingId]);

  const fetchPetsByClientId = async (clientId: string) => {
    try {
      setLoadingPets(true);
      const response = await api.get(`/pets/user/${clientId}`);
      const petData = response.data;
      const petsArray = Array.isArray(petData) ? petData : [petData];
      setPets(petsArray);
      // Fetch care and medical details for each pet from separate endpoints
      const petsDetails = await Promise.all(
        petsArray.map(async (pet: any) => {
          const petId = pet._id || pet.id;
          let careData = null;
          let medicalData = null;
          
          try {
            console.log(`Fetching care data for pet ${pet.name} with ID:`, petId);
            const careResponse = await api.get(`/pets/${petId}/care`);
            careData = careResponse.data;
            console.log(`Care data for ${pet.name}:`, careData);
          } catch (error: any) {
            console.log(`No care data for pet ${pet.name}:`, error.response?.status);
          }
          
          try {
            console.log(`Fetching medical data for pet ${pet.name} with ID:`, petId);
            const medicalResponse = await api.get(`/pets/${petId}/medical`);
            medicalData = medicalResponse.data;
            console.log(`Medical data for ${pet.name}:`, medicalData);
          } catch (error: any) {
            console.log(`No medical data for pet ${pet.name}:`, error.response?.status);
          }
          
          return {
            ...pet,
            careData,
            medicalData
          };
        })
      );
      console.log('All pets with details:', petsDetails);
      setPetsWithDetails(petsDetails);
    } catch (error: any) {
      console.error('Error fetching pet details:', error);
      toast({
        title: 'Warning',
        description: 'Failed to fetch complete pet details',
        variant: 'destructive',
      });
    } finally {
      setLoadingPets(false);
    }
  };

  const fetchClientDetails = async (clientId: string) => {
    try {
      console.log('Fetching complete client details for:', clientId);
      const response = await api.get(`/users/${clientId}`);
      const clientData = response.data;
      console.log('Fetched client details:', clientData);
      setClientDetails(clientData);
    } catch (error: any) {
      console.error('Error fetching client details:', error);
      toast({
        title: 'Warning',
        description: 'Failed to fetch complete client details',
        variant: 'destructive',
      });
    }
  };

  const fetchKeySecurityDetails = async (clientId: string) => {
    try {
      const response = await api.get(`/key-security/client/${clientId}`);
      console.log('Key security data received:', response.data);
      setKeyAccess(response.data);
    } catch (error: any) {
      console.error('Error fetching key security:', error);
    }
  };

  const fetchBookingDetails = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/bookings/${bookingId}`);
      const bookingData = response.data;
      console.log('Booking data received:', bookingData);
      console.log('Client ID:', bookingData.userId?._id);
      setBooking(bookingData);
      
      if (bookingData.userId?._id) {
        // Fetch complete client details separately
        await fetchClientDetails(bookingData.userId._id);
        // Fetch pets
        await fetchPetsByClientId(bookingData.userId._id);
      } else {
        console.log('No client ID found in booking data');
      }
      
      if (currentUser?.role === 'sitter' && bookingData.userId?._id) {
        await fetchKeySecurityDetails(bookingData.userId._id);
      }
    } catch (error: any) {
      console.error('Error fetching booking:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch booking details',
        variant: 'destructive',
      });
      if (error.response?.status === 404) {
        router.push('/bookings');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch booking for sitter by sitterId
  const fetchSitterBookingDetails = async (sitterId: string) => {
    try {
      setIsLoading(true);
      const response = await api.get(`/bookings/sitter/${sitterId}`);
      // If the API returns an array, find the booking with the current bookingId
      let bookingData = response.data;
      if (Array.isArray(bookingData)) {
        bookingData = bookingData.find((b: any) => b._id === bookingId);
      }
      console.log('Sitter booking data received:', bookingData);
      console.log('Client ID:', bookingData?.userId?._id);
      setBooking(bookingData || null);
      
      // Fetch complete client details and pets for this client
      if (bookingData?.userId?._id) {
        // Fetch complete client details separately
        await fetchClientDetails(bookingData.userId._id);
        // Fetch all pets
        await fetchPetsByClientId(bookingData.userId._id);
      } else {
        console.log('No client ID found in booking data');
      }
      
      // Fetch key security if we have a client
      if (bookingData?.userId?._id) {
        await fetchKeySecurityDetails(bookingData.userId._id);
      }
    } catch (error: any) {
      console.error('Error fetching sitter booking:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch sitter booking details',
        variant: 'destructive',
      });
      if (error.response?.status === 404) {
        router.push('/bookings');
      }
    } finally {
      setIsLoading(false);
    }
  };

            {petsWithDetails && petsWithDetails.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PawPrint className="h-5 w-5" />
                    Pet Details ({petsWithDetails.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingPets ? (
                    <div className="text-center py-4 text-gray-600">Loading pet details...</div>
                  ) : (
                    <div className="space-y-6">
                      {petsWithDetails.map((pet, index) => {
                        const currentTab = petTabs[pet._id] || 'basic';
                        return (
                          <div key={pet._id} className={index > 0 ? 'pt-6 border-t-2 border-gray-200' : ''}>
                            {/* Pet Header */}
                            <div className="flex items-start justify-between gap-4 mb-4">
                              <div className="flex items-start gap-4">
                                {(pet.photo || pet.photoUrl) ? (
                                  <img 
                                    src={pet.photo || pet.photoUrl} 
                                    alt={pet.name}
                                    className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200"
                                  />
                                ) : (
                                  <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xl border-2 border-gray-200">
                                    {pet.name?.[0] || '?'}
                                  </div>
                                )}
                                <div>
                                  <div className="font-bold text-lg">{pet.name}</div>
                                  <div className="text-sm text-gray-600">{pet.species || pet.type || 'N/A'}</div>
                                </div>
                              </div>
                            </div>
                            {/* Tab Navigation */}
                            <div className="flex gap-4 border-b border-gray-200 mb-4">
                              <button
                                onClick={() => setPetTabs(prev => ({ ...prev, [pet._id]: 'basic' }))}
                                className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                                  currentTab === 'basic'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                              >
                                Basic
                              </button>
                              <button
                                onClick={() => setPetTabs(prev => ({ ...prev, [pet._id]: 'care' }))}
                                className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                                  currentTab === 'care'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                              >
                                Care
                              </button>
                              <button
                                onClick={() => setPetTabs(prev => ({ ...prev, [pet._id]: 'medical' }))}
                                className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                                  currentTab === 'medical'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                              >
                                Medical
                              </button>
                              <button
                                onClick={() => setPetTabs(prev => ({ ...prev, [pet._id]: 'insurance' }))}
                                className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                                  currentTab === 'insurance'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                              >
                                Insurance
                              </button>
                            </div>
                            {/* Tab Content */}
                            <div className="bg-gray-50 rounded-lg p-4">
                              {currentTab === 'basic' && (
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div><span className="font-medium text-gray-600">Type:</span><div>{pet.species || pet.type || 'N/A'}</div></div>
                                  <div><span className="font-medium text-gray-600">Breed:</span><div>{pet.breed || 'N/A'}</div></div>
                                  <div><span className="font-medium text-gray-600">Colouring:</span><div>{pet.colouring || 'N/A'}</div></div>
                                  <div><span className="font-medium text-gray-600">Gender:</span><div>{pet.gender || 'Not specified'}</div></div>
                                  <div><span className="font-medium text-gray-600">Age:</span><div>{pet.age ? `${pet.age} years old` : 'N/A'}</div></div>
                                  <div><span className="font-medium text-gray-600">Date of Birth:</span><div>{pet.dateOfBirth || 'Not specified'}</div></div>
                                  <div><span className="font-medium text-gray-600">Weight:</span><div>{pet.weight || 'N/A'}</div></div>
                                  <div><span className="font-medium text-gray-600">Spayed/Neutered:</span><div>{pet.spayedNeutered || 'Not specified'}</div></div>
                                  <div className="col-span-2"><span className="font-medium text-gray-600">Microchip Number:</span><div className="font-mono text-xs">{pet.microchipNumber || 'N/A'}</div></div>
                                  <div className="col-span-2"><span className="font-medium text-gray-600">Rabies Tag Number:</span><div className="font-mono text-xs">{pet.rabiesTagNumber || 'N/A'}</div></div>
                                  {pet.allergies && (<div className="col-span-2"><span className="font-medium text-gray-600">Allergies:</span><div className="mt-1 whitespace-pre-wrap">{pet.allergies}</div></div>)}
                                  {pet.medications && (<div className="col-span-2"><span className="font-medium text-gray-600">Medications:</span><div className="mt-1 whitespace-pre-wrap">{pet.medications}</div></div>)}
                                  {pet.behaviorNotes && (<div className="col-span-2"><span className="font-medium text-gray-600">Behavior Notes:</span><div className="mt-1 whitespace-pre-wrap">{pet.behaviorNotes}</div></div>)}
                                  {pet.info && (<div className="col-span-2"><span className="font-medium text-gray-600">Additional Info:</span><div className="mt-1 whitespace-pre-wrap">{pet.info}</div></div>)}
                                </div>
                              )}
                              {currentTab === 'care' && (
                                <div className="text-sm space-y-3">
                                  {pet.careData ? (
                                    <>
                                      {pet.careData.personalityPhobiasPreferences && (<div><span className="font-medium text-gray-600">Personality, Phobias & Preferences:</span><div className="mt-1 whitespace-pre-wrap">{pet.careData.personalityPhobiasPreferences}</div></div>)}
                                      {pet.careData.typeOfFood && (<div><span className="font-medium text-gray-600">Type of Food:</span><div className="mt-1 whitespace-pre-wrap">{pet.careData.typeOfFood}</div></div>)}
                                      {pet.careData.dietFoodWaterInstructions && (<div><span className="font-medium text-gray-600">Diet, Food & Water Instructions:</span><div className="mt-1 whitespace-pre-wrap">{pet.careData.dietFoodWaterInstructions}</div></div>)}
                                      {pet.careData.anyHistoryOfBiting && (<div><span className="font-medium text-gray-600">History of Biting:</span><div className="mt-1">{pet.careData.anyHistoryOfBiting}</div></div>)}
                                      {pet.careData.locationOfStoredPetFood && (<div><span className="font-medium text-gray-600">Location of Stored Pet Food:</span><div className="mt-1 whitespace-pre-wrap">{pet.careData.locationOfStoredPetFood}</div></div>)}
                                      {pet.careData.litterBoxLocation && (<div><span className="font-medium text-gray-600">Litter Box Location:</span><div className="mt-1 whitespace-pre-wrap">{pet.careData.litterBoxLocation}</div></div>)}
                                      {pet.careData.locationOfPetCarrier && (<div><span className="font-medium text-gray-600">Location of Pet Carrier:</span><div className="mt-1 whitespace-pre-wrap">{pet.careData.locationOfPetCarrier}</div></div>)}
                                      {pet.careData.careInstructions && (<div><span className="font-medium text-gray-600">Care Instructions:</span><div className="mt-1 whitespace-pre-wrap">{pet.careData.careInstructions}</div></div>)}
                                      {pet.careData.feedingSchedule && (<div><span className="font-medium text-gray-600">Feeding Schedule:</span><div className="mt-1 whitespace-pre-wrap">{pet.careData.feedingSchedule}</div></div>)}
                                      {pet.careData.exerciseRequirements && (<div><span className="font-medium text-gray-600">Exercise Requirements:</span><div className="mt-1 whitespace-pre-wrap">{pet.careData.exerciseRequirements}</div></div>)}
                                      {pet.careData.anyAdditionalInfo && (<div><span className="font-medium text-gray-600">Additional Care Info:</span><div className="mt-1 whitespace-pre-wrap">{pet.careData.anyAdditionalInfo}</div></div>)}
                                      {!pet.careData.personalityPhobiasPreferences && !pet.careData.typeOfFood && !pet.careData.dietFoodWaterInstructions && !pet.careData.careInstructions && !pet.careData.feedingSchedule && !pet.careData.exerciseRequirements && (<div className="text-gray-500 text-center py-4">No care information available</div>)}
                                    </>
                                  ) : (
                                    <>
                                      {pet.careInstructions && (<div><span className="font-medium text-gray-600">Care Instructions:</span><div className="mt-1 whitespace-pre-wrap">{pet.careInstructions}</div></div>)}
                                      {pet.feedingSchedule && (<div><span className="font-medium text-gray-600">Feeding Schedule:</span><div className="mt-1 whitespace-pre-wrap">{pet.feedingSchedule}</div></div>)}
                                      {pet.exerciseRequirements && (<div><span className="font-medium text-gray-600">Exercise Requirements:</span><div className="mt-1 whitespace-pre-wrap">{pet.exerciseRequirements}</div></div>)}
                                      {pet.dietaryRestrictions && (<div><span className="font-medium text-gray-600">Dietary Restrictions:</span><div className="mt-1 whitespace-pre-wrap">{pet.dietaryRestrictions}</div></div>)}
                                      {!pet.careInstructions && !pet.feedingSchedule && !pet.exerciseRequirements && !pet.dietaryRestrictions && (<div className="text-gray-500 text-center py-4">No care information available</div>)}
                                    </>
                                  )}
                                </div>
                              )}
                              {currentTab === 'medical' && (
                                <div className="text-sm">
                                  {pet.medicalData ? (
                                    <div className="space-y-3">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div><span className="font-medium text-gray-600">Vet Business Name:</span><div>{pet.medicalData.vetBusinessName || 'N/A'}</div></div>
                                        <div><span className="font-medium text-gray-600">Vet Doctor Name:</span><div>{pet.medicalData.vetDoctorName || 'N/A'}</div></div>
                                        <div className="col-span-2"><span className="font-medium text-gray-600">Vet Address:</span><div className="whitespace-pre-wrap">{pet.medicalData.vetAddress || 'N/A'}</div></div>
                                        <div><span className="font-medium text-gray-600">Vet Phone Number:</span><div>{pet.medicalData.vetPhoneNumber || 'N/A'}</div></div>
                                        <div><span className="font-medium text-gray-600">Current on Vaccines:</span><div>{pet.medicalData.currentOnVaccines || 'N/A'}</div></div>
                                        {pet.medicalData.onAnyMedication && (<div className="col-span-2"><span className="font-medium text-gray-600">On Any Medication:</span><div className="mt-1 whitespace-pre-wrap">{pet.medicalData.onAnyMedication}</div></div>)}
                                      </div>
                                      {pet.vaccinations && (<div><span className="font-medium text-gray-600">Vaccinations:</span><div className="mt-1 whitespace-pre-wrap">{pet.vaccinations}</div></div>)}
                                    </div>
                                  ) : pet.vetBusinessName || pet.vetDoctorName || pet.currentOnVaccines ? (
                                    <div className="space-y-3">
                                      <div className="grid grid-cols-2 gap-4">
                                        {pet.vetBusinessName && (<div><span className="font-medium text-gray-600">Vet Business:</span><div>{pet.vetBusinessName}</div></div>)}
                                        {pet.vetDoctorName && (<div><span className="font-medium text-gray-600">Vet Doctor:</span><div>{pet.vetDoctorName}</div></div>)}
                                        {pet.currentOnVaccines && (<div className="col-span-2"><span className="font-medium text-gray-600">Vaccinations:</span><div>{pet.currentOnVaccines}</div></div>)}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-gray-500 text-center py-4">No medical information available</div>
                                  )}
                                </div>
                              )}
                              {currentTab === 'insurance' && (
                                <div className="text-sm space-y-3">
                                  {pet.insuranceDetails ? (<div><span className="font-medium text-gray-600">Insurance Details:</span><div className="mt-1 whitespace-pre-wrap">{pet.insuranceDetails}</div></div>) : (<div className="text-center py-2"><p className="text-gray-500">No insurance information available</p></div>)}
                                  {pet.emergencyContact && (<div><span className="font-medium text-gray-600">Pet Emergency Contact:</span><div className="mt-1 whitespace-pre-wrap">{pet.emergencyContact}</div></div>)}
                                  {pet.veterinarianInfo && (<div><span className="font-medium text-gray-600">Veterinarian Info:</span><div className="mt-1 whitespace-pre-wrap">{pet.veterinarianInfo}</div></div>)}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            {/* Fallback to pets if petsWithDetails is empty */}
            {petsWithDetails.length === 0 && pets && pets.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PawPrint className="h-5 w-5" />
                    Pet Details ({pets.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {pets.map((pet, index) => {
                      const currentTab = petTabs[pet._id] || 'basic';
                      return (
                        <div key={pet._id} className={index > 0 ? 'pt-6 border-t-2 border-gray-200' : ''}>
                          {/* Pet Header */}
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex items-start gap-4">
                              {(pet.photo || pet.photoUrl) ? (
                                <img 
                                  src={pet.photo || pet.photoUrl} 
                                  alt={pet.name}
                                  className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200"
                                />
                              ) : (
                                <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xl border-2 border-gray-200">
                                  {pet.name?.[0] || '?'}
                                </div>
                              )}
                              <div>
                                <div className="font-bold text-lg">{pet.name}</div>
                                <div className="text-sm text-gray-600">{pet.species || pet.type || 'N/A'}</div>
                              </div>
                            </div>
                          </div>
                          {/* Tab Navigation */}
                          <div className="flex gap-4 border-b border-gray-200 mb-4">
                            <button
                              onClick={() => setPetTabs(prev => ({ ...prev, [pet._id]: 'basic' }))}
                              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                                currentTab === 'basic'
                                  ? 'border-primary text-primary'
                                  : 'border-transparent text-gray-500 hover:text-gray-700'
                              }`}
                            >
                              Basic
                            </button>
                            <button
                              onClick={() => setPetTabs(prev => ({ ...prev, [pet._id]: 'care' }))}
                              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                                currentTab === 'care'
                                  ? 'border-primary text-primary'
                                  : 'border-transparent text-gray-500 hover:text-gray-700'
                              }`}
                            >
                              Care
                            </button>
                            <button
                              onClick={() => setPetTabs(prev => ({ ...prev, [pet._id]: 'medical' }))}
                              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                                currentTab === 'medical'
                                  ? 'border-primary text-primary'
                                  : 'border-transparent text-gray-500 hover:text-gray-700'
                              }`}
                            >
                              Medical
                            </button>
                            <button
                              onClick={() => setPetTabs(prev => ({ ...prev, [pet._id]: 'insurance' }))}
                              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                                currentTab === 'insurance'
                                  ? 'border-primary text-primary'
                                  : 'border-transparent text-gray-500 hover:text-gray-700'
                              }`}
                            >
                              Insurance
                            </button>
                          </div>
                          {/* Tab Content */}
                          <div className="bg-gray-50 rounded-lg p-4">
                            {/* Basic, Care, Medical, Insurance fallback rendering as before */}
                            {/* ...existing code for fallback... */}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
        // ...existing code...

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'sitter':
        return 'bg-green-100 text-green-800';
      case 'client':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Always render header and layout, show spinner if not authenticated
  const authenticated = isAuthenticated();
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Alert>
            <AlertDescription>
              Booking not found or you don't have permission to view it.
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  const startDateTime = formatDateTime(booking.startDate);
  const endDateTime = formatDateTime(booking.endDate);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/bookings')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Bookings
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {booking.serviceType}
              </h1>
              <p className="text-gray-600 mt-1">
                Booking ID: {booking._id}
              </p>
            </div>
            <Badge className={getStatusColor(booking.status)}>
              {booking.status}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Booking Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pets - Comprehensive Information */}
            {(petsWithDetails.length > 0 ? petsWithDetails : pets)?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PawPrint className="h-5 w-5" />
                    Pet Details ({petsWithDetails.length > 0 ? petsWithDetails.length : pets.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {(petsWithDetails.length > 0 ? petsWithDetails : pets).map((pet, index) => {
                      const currentTab = petTabs[pet._id] || 'basic';
                      return (
                        <div key={pet._id} className={index > 0 ? 'pt-6 border-t-2 border-gray-200' : ''}>
                          {/* Pet Header */}
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex items-start gap-4">
                              {(pet.photo || pet.photoUrl) ? (
                                <img 
                                  src={pet.photo || pet.photoUrl} 
                                  alt={pet.name}
                                  className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200"
                                />
                              ) : (
                                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-gray-200">
                                  <PawPrint className="h-8 w-8 text-gray-400" />
                                </div>
                              )}
                              <div>
                                <h3 className="font-bold text-xl text-gray-900">{pet.name}</h3>
                                <p className="text-sm text-gray-600">
                                  {pet.type || pet.species} {pet.breed && `• ${pet.breed}`}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Tab Navigation */}
                          <div className="flex gap-4 border-b border-gray-200 mb-4">
                            <button
                              onClick={() => setPetTabs(prev => ({ ...prev, [pet._id]: 'basic' }))}
                              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                                currentTab === 'basic'
                                  ? 'border-primary text-primary'
                                  : 'border-transparent text-gray-500 hover:text-gray-700'
                              }`}
                            >
                              Basic
                            </button>
                            <button
                              onClick={() => setPetTabs(prev => ({ ...prev, [pet._id]: 'care' }))}
                              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                                currentTab === 'care'
                                  ? 'border-primary text-primary'
                                  : 'border-transparent text-gray-500 hover:text-gray-700'
                              }`}
                            >
                              Care
                            </button>
                            <button
                              onClick={() => setPetTabs(prev => ({ ...prev, [pet._id]: 'medical' }))}
                              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                                currentTab === 'medical'
                                  ? 'border-primary text-primary'
                                  : 'border-transparent text-gray-500 hover:text-gray-700'
                              }`}
                            >
                              Medical
                            </button>
                            <button
                              onClick={() => setPetTabs(prev => ({ ...prev, [pet._id]: 'insurance' }))}
                              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                                currentTab === 'insurance'
                                  ? 'border-primary text-primary'
                                  : 'border-transparent text-gray-500 hover:text-gray-700'
                              }`}
                            >
                              Insurance
                            </button>
                          </div>

                          {/* Tab Content */}
                          <div className="bg-gray-50 rounded-lg p-4">
                            {currentTab === 'basic' && (
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                {/* Core Identity */}
                                <div>
                                  <span className="text-gray-600 font-medium">Type:</span>
                                  <p className="text-gray-900">{pet.type || pet.species || 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600 font-medium">Breed:</span>
                                  <p className="text-gray-900">{pet.breed || 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600 font-medium">Colouring:</span>
                                  <p className="text-gray-900">{pet.colouring || 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600 font-medium">Gender:</span>
                                  <p className="text-gray-900">{pet.gender || 'N/A'}</p>
                                </div>
                                {/* Age / DOB / Weight */}
                                <div>
                                  <span className="text-gray-600 font-medium">Age:</span>
                                  <p className="text-gray-900">{pet.age ? `${pet.age}${typeof pet.age === 'number' ? ' years old' : ''}` : 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600 font-medium">Date of Birth:</span>
                                  <p className="text-gray-900">{pet.dateOfBirth ? new Date(pet.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600 font-medium">Weight:</span>
                                  <p className="text-gray-900">{pet.weight || 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600 font-medium">Spayed/Neutered:</span>
                                  <p className="text-gray-900">{pet.spayedNeutered || 'N/A'}</p>
                                </div>
                                {/* Identifiers */}
                                <div>
                                  <span className="text-gray-600 font-medium">Microchip Number:</span>
                                  <p className="text-gray-900 font-mono text-xs">{pet.microchipNumber || 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600 font-medium">Rabies Tag Number:</span>
                                  <p className="text-gray-900 font-mono text-xs">{pet.rabiesTagNumber || 'N/A'}</p>
                                </div>
                                {/* Health Snapshot */}
                                <div className="col-span-2">
                                  <span className="text-gray-600 font-medium">Vaccinations:</span>
                                  <p className="text-gray-900 mt-1 whitespace-pre-wrap">{pet.vaccinations || pet.currentOnVaccines || 'N/A'}</p>
                                </div>
                                <div className="col-span-2">
                                  <span className="text-gray-600 font-medium">Medications:</span>
                                  <p className="text-gray-900 mt-1 whitespace-pre-wrap">{pet.medications || pet.onAnyMedication || 'N/A'}</p>
                                </div>
                                <div className="col-span-2">
                                  <span className="text-gray-600 font-medium">Allergies:</span>
                                  <p className="text-gray-900 mt-1 whitespace-pre-wrap">{pet.allergies || 'N/A'}</p>
                                </div>
                                <div className="col-span-2">
                                  <span className="text-gray-600 font-medium">Dietary Restrictions:</span>
                                  <p className="text-gray-900 mt-1 whitespace-pre-wrap">{pet.dietaryRestrictions || 'N/A'}</p>
                                </div>
                                <div className="col-span-2">
                                  <span className="text-gray-600 font-medium">Behavior Notes:</span>
                                  <p className="text-gray-900 mt-1 whitespace-pre-wrap">{pet.behaviorNotes || 'N/A'}</p>
                                </div>
                                <div className="col-span-2">
                                  <span className="text-gray-600 font-medium">Care Instructions:</span>
                                  <p className="text-gray-900 mt-1 whitespace-pre-wrap">{pet.careInstructions || 'N/A'}</p>
                                </div>
                                <div className="col-span-2">
                                  <span className="text-gray-600 font-medium">Emergency Contact:</span>
                                  <p className="text-gray-900 mt-1 whitespace-pre-wrap">{pet.emergencyContact || 'N/A'}</p>
                                </div>
                                {/* Additional Info */}
                                <div className="col-span-2">
                                  <span className="text-gray-600 font-medium">Additional Info:</span>
                                  <p className="text-gray-900 mt-1 whitespace-pre-wrap">{pet.info || pet.anyAdditionalInfo || 'N/A'}</p>
                                </div>
                              </div>
                            )}

                            {currentTab === 'care' && (
                                <div className="text-sm space-y-3">
                                  {pet.careData ? (
                                    <>
                                      {pet.careData.personalityPhobiasPreferences && (
                                        <div>
                                          <span className="font-medium text-gray-600">Personality, Phobias & Preferences:</span>
                                          <div className="mt-1 whitespace-pre-wrap">{pet.careData.personalityPhobiasPreferences}</div>
                                        </div>
                                      )}
                                      {pet.careData.typeOfFood && (
                                        <div>
                                          <span className="font-medium text-gray-600">Type of Food:</span>
                                          <div className="mt-1 whitespace-pre-wrap">{pet.careData.typeOfFood}</div>
                                        </div>
                                      )}
                                      {pet.careData.dietFoodWaterInstructions && (
                                        <div>
                                          <span className="font-medium text-gray-600">Diet, Food & Water Instructions:</span>
                                          <div className="mt-1 whitespace-pre-wrap">{pet.careData.dietFoodWaterInstructions}</div>
                                        </div>
                                      )}
                                      {pet.careData.anyHistoryOfBiting && (
                                        <div>
                                          <span className="font-medium text-gray-600">History of Biting:</span>
                                          <div className="mt-1">{pet.careData.anyHistoryOfBiting}</div>
                                        </div>
                                      )}
                                      {pet.careData.locationOfStoredPetFood && (
                                        <div>
                                          <span className="font-medium text-gray-600">Location of Stored Pet Food:</span>
                                          <div className="mt-1 whitespace-pre-wrap">{pet.careData.locationOfStoredPetFood}</div>
                                        </div>
                                      )}
                                      {pet.careData.litterBoxLocation && (
                                        <div>
                                          <span className="font-medium text-gray-600">Litter Box Location:</span>
                                          <div className="mt-1 whitespace-pre-wrap">{pet.careData.litterBoxLocation}</div>
                                        </div>
                                      )}
                                      {pet.careData.locationOfPetCarrier && (
                                        <div>
                                          <span className="font-medium text-gray-600">Location of Pet Carrier:</span>
                                          <div className="mt-1 whitespace-pre-wrap">{pet.careData.locationOfPetCarrier}</div>
                                        </div>
                                      )}
                                      {pet.careData.careInstructions && (
                                        <div>
                                          <span className="font-medium text-gray-600">Care Instructions:</span>
                                          <div className="mt-1 whitespace-pre-wrap">{pet.careData.careInstructions}</div>
                                        </div>
                                      )}
                                      {pet.careData.feedingSchedule && (
                                        <div>
                                          <span className="font-medium text-gray-600">Feeding Schedule:</span>
                                          <div className="mt-1 whitespace-pre-wrap">{pet.careData.feedingSchedule}</div>
                                        </div>
                                      )}
                                      {pet.careData.exerciseRequirements && (
                                        <div>
                                          <span className="font-medium text-gray-600">Exercise Requirements:</span>
                                          <div className="mt-1 whitespace-pre-wrap">{pet.careData.exerciseRequirements}</div>
                                        </div>
                                      )}
                                      {pet.careData.anyAdditionalInfo && (
                                        <div>
                                          <span className="font-medium text-gray-600">Additional Care Info:</span>
                                          <div className="mt-1 whitespace-pre-wrap">{pet.careData.anyAdditionalInfo}</div>
                                        </div>
                                      )}
                                      {!pet.careData.personalityPhobiasPreferences && !pet.careData.typeOfFood && !pet.careData.dietFoodWaterInstructions && !pet.careData.careInstructions && !pet.careData.feedingSchedule && !pet.careData.exerciseRequirements && (
                                        <div className="text-gray-500 text-center py-4">No care information available</div>
                                      )}
                                    </>
                                  ) : (
                                    <>
                                      {pet.careInstructions && (
                                        <div>
                                          <span className="font-medium text-gray-600">Care Instructions:</span>
                                          <div className="mt-1 whitespace-pre-wrap">{pet.careInstructions}</div>
                                        </div>
                                      )}
                                      {pet.feedingSchedule && (
                                        <div>
                                          <span className="font-medium text-gray-600">Feeding Schedule:</span>
                                          <div className="mt-1 whitespace-pre-wrap">{pet.feedingSchedule}</div>
                                        </div>
                                      )}
                                      {pet.exerciseRequirements && (
                                        <div>
                                          <span className="font-medium text-gray-600">Exercise Requirements:</span>
                                          <div className="mt-1 whitespace-pre-wrap">{pet.exerciseRequirements}</div>
                                        </div>
                                      )}
                                      {pet.dietaryRestrictions && (
                                        <div>
                                          <span className="font-medium text-gray-600">Dietary Restrictions:</span>
                                          <div className="mt-1 whitespace-pre-wrap">{pet.dietaryRestrictions}</div>
                                        </div>
                                      )}
                                      {!pet.careInstructions && !pet.feedingSchedule && !pet.exerciseRequirements && !pet.dietaryRestrictions && (
                                        <div className="text-gray-500 text-center py-4">No care information available</div>
                                      )}
                                    </>
                                  )}
                                </div>
                            )}

                            {currentTab === 'medical' && (
                                <div className="text-sm">
                                  {pet.medicalData ? (
                                    <div className="space-y-3">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <span className="font-medium text-gray-600">Vet Business Name:</span>
                                          <div>{pet.medicalData.vetBusinessName || 'N/A'}</div>
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-600">Vet Doctor Name:</span>
                                          <div>{pet.medicalData.vetDoctorName || 'N/A'}</div>
                                        </div>
                                        <div className="col-span-2">
                                          <span className="font-medium text-gray-600">Vet Address:</span>
                                          <div className="whitespace-pre-wrap">{pet.medicalData.vetAddress || 'N/A'}</div>
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-600">Vet Phone Number:</span>
                                          <div>{pet.medicalData.vetPhoneNumber || 'N/A'}</div>
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-600">Current on Vaccines:</span>
                                          <div>{pet.medicalData.currentOnVaccines || 'N/A'}</div>
                                        </div>
                                        {pet.medicalData.onAnyMedication && (
                                          <div className="col-span-2">
                                            <span className="font-medium text-gray-600">On Any Medication:</span>
                                            <div className="mt-1 whitespace-pre-wrap">{pet.medicalData.onAnyMedication}</div>
                                          </div>
                                        )}
                                      </div>
                                      {pet.vaccinations && (
                                        <div>
                                          <span className="font-medium text-gray-600">Vaccinations:</span>
                                          <div className="mt-1 whitespace-pre-wrap">{pet.vaccinations}</div>
                                        </div>
                                      )}
                                      {pet.medicalData.medications && (
                                        <div>
                                          <span className="font-medium text-gray-600">Medications:</span>
                                          <div className="mt-1 whitespace-pre-wrap">{pet.medicalData.medications}</div>
                                        </div>
                                      )}
                                      {pet.medicalData.allergies && (
                                        <div>
                                          <span className="font-medium text-red-600">Allergies:</span>
                                          <div className="mt-1 text-red-700 font-medium whitespace-pre-wrap">{pet.medicalData.allergies}</div>
                                        </div>
                                      )}
                                      {pet.medicalData.medicalConditions && (
                                        <div>
                                          <span className="font-medium text-gray-600">Medical Conditions:</span>
                                          <div className="mt-1 whitespace-pre-wrap">{pet.medicalData.medicalConditions}</div>
                                        </div>
                                      )}
                                      {pet.medicalData.microchipNumber && (
                                        <div>
                                          <span className="font-medium text-gray-600">Microchip Number:</span>
                                          <div className="font-mono text-xs">{pet.medicalData.microchipNumber}</div>
                                        </div>
                                      )}
                                      {pet.medicalData.lastVetVisitDate && (
                                        <div>
                                          <span className="font-medium text-gray-600">Last Vet Visit Date:</span>
                                          <div>{new Date(pet.medicalData.lastVetVisitDate).toLocaleDateString()}</div>
                                        </div>
                                      )}
                                    </div>
                                  ) : pet.vetBusinessName || pet.vetDoctorName || pet.currentOnVaccines ? (
                                    <div className="space-y-3">
                                      <div className="grid grid-cols-2 gap-4">
                                        {pet.vetBusinessName && (
                                          <div>
                                            <span className="font-medium text-gray-600">Vet Business:</span>
                                            <div>{pet.vetBusinessName}</div>
                                          </div>
                                        )}
                                        {pet.vetDoctorName && (
                                          <div>
                                            <span className="font-medium text-gray-600">Vet Doctor:</span>
                                            <div>{pet.vetDoctorName}</div>
                                          </div>
                                        )}
                                        {pet.vetAddress && (
                                          <div className="col-span-2">
                                            <span className="font-medium text-gray-600">Vet Address:</span>
                                            <div className="whitespace-pre-wrap">{pet.vetAddress}</div>
                                          </div>
                                        )}
                                        {pet.vetPhoneNumber && (
                                          <div>
                                            <span className="font-medium text-gray-600">Vet Phone Number:</span>
                                            <div>{pet.vetPhoneNumber}</div>
                                          </div>
                                        )}
                                        {(pet.currentOnVaccines || pet.vaccinations) && (
                                          <div>
                                            <span className="font-medium text-gray-600">Vaccinations:</span>
                                            <div className="whitespace-pre-wrap">{pet.currentOnVaccines || pet.vaccinations}</div>
                                          </div>
                                        )}
                                      </div>
                                      {pet.medications && (
                                        <div>
                                          <span className="font-medium text-gray-600">Medications:</span>
                                          <div className="mt-1 whitespace-pre-wrap">{pet.medications}</div>
                                        </div>
                                      )}
                                      {pet.onAnyMedication && (
                                        <div>
                                          <span className="font-medium text-gray-600">On Any Medication:</span>
                                          <div className="mt-1 whitespace-pre-wrap">{pet.onAnyMedication}</div>
                                        </div>
                                      )}
                                      {pet.allergies && (
                                        <div>
                                          <span className="font-medium text-red-600">Allergies:</span>
                                          <div className="mt-1 text-red-700 font-medium whitespace-pre-wrap">{pet.allergies}</div>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="text-gray-500 text-center py-4">No medical information available</div>
                                  )}
                                </div>
                            )}

                            {currentTab === 'insurance' && (
                                <div className="space-y-4 text-sm">
                                  <div>
                                    <span className="text-gray-600 font-medium">Insurance Details:</span>
                                    <p className="text-gray-900 mt-1 whitespace-pre-wrap">{pet.insuranceDetails || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-600 font-medium">Pet Emergency Contact:</span>
                                    <p className="text-gray-900 mt-1 whitespace-pre-wrap">{pet.emergencyContact || 'N/A'}</p>
                                  </div>
                                </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Details - Hidden for Sitters */}
            {currentUser?.role !== 'sitter' && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Total Amount:</span>
                      <span className="text-gray-900">${booking.totalAmount?.toFixed(2) ?? '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Paid Amount:</span>
                      <span className="text-gray-900">${booking.paidAmount?.toFixed(2) ?? '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Payment Status:</span>
                      <span className="text-gray-900">{booking.paymentStatus ?? 'pending'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes & Instructions */}
            {(booking.notes || booking.specialInstructions || booking.emergencyInstructions) && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes & Instructions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {booking.notes && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">General Notes</h4>
                      <p className="text-gray-700">{booking.notes}</p>
                    </div>
                  )}
                  {booking.specialInstructions && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Special Instructions</h4>
                      <p className="text-gray-700">{booking.specialInstructions}</p>
                    </div>
                  )}
                  {booking.emergencyInstructions && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Emergency Instructions</h4>
                      <p className="text-gray-700">{booking.emergencyInstructions}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Client Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Client Header */}
                <div className="flex items-center gap-3 pb-4 border-b">
                  <Avatar className="h-12 w-12">
                    {clientDetails?.profilePicture ? (
                      <AvatarImage src={clientDetails.profilePicture} alt={`${clientDetails.firstName} ${clientDetails.lastName}`} />
                    ) : null}
                    <AvatarFallback>
                      {clientDetails?.firstName?.[0] || booking.userId?.firstName?.[0] || 'U'}{clientDetails?.lastName?.[0] || booking.userId?.lastName?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">
                      {clientDetails?.firstName || booking.userId?.firstName || 'Unknown'} {clientDetails?.lastName || booking.userId?.lastName || 'User'}
                    </p>
                    <p className="text-sm text-gray-600">{clientDetails?.email || booking.userId?.email || 'No email provided'}</p>
                  </div>
                </div>

                {/* Basic Information */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-3">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">First Name</label>
                      <p className="text-sm text-gray-900">{clientDetails?.firstName || booking.userId?.firstName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Last Name</label>
                      <p className="text-sm text-gray-900">{clientDetails?.lastName || booking.userId?.lastName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                      <p className="text-sm text-gray-900">{clientDetails?.email || booking.userId?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Cell Phone</label>
                      <p className="text-sm text-gray-900">{clientDetails?.cellPhoneNumber || clientDetails?.phone || booking.userId?.cellPhoneNumber || booking.userId?.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Home Phone</label>
                      <p className="text-sm text-gray-900">{clientDetails?.homePhoneNumber || booking.userId?.homePhoneNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">ZIP / Postal Code</label>
                      <p className="text-sm text-gray-900">{clientDetails?.zipCode || booking.userId?.zipCode || 'N/A'}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
                      <p className="text-sm text-gray-900">
                        {clientDetails?.address ? (
                          typeof clientDetails.address === 'string' ? (
                            clientDetails.address
                          ) : (
                            `${clientDetails.address.street}, ${clientDetails.address.city}, ${clientDetails.address.state} ${clientDetails.address.zipCode}`
                          )
                        ) : booking.userId?.address ? (
                          typeof booking.userId.address === 'string' ? (
                            booking.userId.address
                          ) : (
                            `${booking.userId.address.street}, ${booking.userId.address.city}, ${booking.userId.address.state} ${booking.userId.address.zipCode}`
                          )
                        ) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                {(booking.userId?.emergencyContact || booking.userId?.emergencyContactFirstName || booking.userId?.emergencyContactCellPhone) && (
                  <div className="rounded-lg p-4">
                    <h3 className="text-base font-semibold text-red-900 mb-3">Emergency Contact</h3>
                    {typeof booking.userId.emergencyContact === 'string' ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Legacy Emergency Contact</label>
                        <p className="text-sm text-gray-900">{booking.userId.emergencyContact}</p>
                      </div>
                    ) : booking.userId.emergencyContact ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
                          <p className="text-sm text-gray-900">{booking.userId.emergencyContact.name}</p>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                          <p className="text-sm text-gray-900">{booking.userId.emergencyContact.phone}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        {(clientDetails?.emergencyContactFirstName || clientDetails?.emergencyContactLastName) && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-600 mb-1">First Name</label>
                              <p className="text-sm text-gray-900">{clientDetails?.emergencyContactFirstName || 'N/A'}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-600 mb-1">Last Name</label>
                              <p className="text-sm text-gray-900">{clientDetails?.emergencyContactLastName || 'N/A'}</p>
                            </div>
                          </>
                        )}
                        {clientDetails?.emergencyContactCellPhone && (
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Cell Phone</label>
                            <p className="text-sm text-gray-900">{clientDetails.emergencyContactCellPhone}</p>
                          </div>
                        )}
                        {clientDetails?.emergencyContactHomePhone && (
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Home Phone</label>
                            <p className="text-sm text-gray-900">{clientDetails.emergencyContactHomePhone}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Key Handling */}
                {(clientDetails?.keyHandlingMethod || clientDetails?.superintendentContact || clientDetails?.friendNeighbourContact) && (
                  <div className="rounded-lg p-4">
                    <h3 className="text-base font-semibold text-blue-900 mb-3">Key Handling</h3>
                    <div className="space-y-3">
                      {clientDetails.keyHandlingMethod && (
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Key Handling Method</label>
                          <p className="text-sm text-gray-900">{clientDetails.keyHandlingMethod}</p>
                        </div>
                      )}
                      {clientDetails.superintendentContact && (
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Superintendent / Building Management Contact</label>
                          <p className="text-sm text-gray-900">{clientDetails.superintendentContact}</p>
                        </div>
                      )}
                      {clientDetails.friendNeighbourContact && (
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Friend / Neighbour Contact</label>
                          <p className="text-sm text-gray-900">{clientDetails.friendNeighbourContact}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Home Care Information */}
                {(clientDetails?.parkingForSitter || clientDetails?.garbageCollectionDay || clientDetails?.fuseBoxLocation || 
                  clientDetails?.videoSurveillance || clientDetails?.cleaningSupplyLocation || clientDetails?.broomDustpanLocation || 
                  clientDetails?.mailPickUp || clientDetails?.waterIndoorPlants || clientDetails?.outOfBoundAreas || 
                  clientDetails?.additionalHomeCareInfo || clientDetails?.homeCareInfo) && (
                  <div className="rounded-lg p-4">
                    <h3 className="text-base font-semibold text-green-900 mb-3">Home Care Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {clientDetails.parkingForSitter && (
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Parking for Sitter</label>
                          <p className="text-sm text-gray-900">{clientDetails.parkingForSitter}</p>
                        </div>
                      )}
                      {clientDetails.garbageCollectionDay && (
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Garbage Collection Day</label>
                          <p className="text-sm text-gray-900">{clientDetails.garbageCollectionDay}</p>
                        </div>
                      )}
                      {clientDetails.fuseBoxLocation && (
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Fuse Box Location</label>
                          <p className="text-sm text-gray-900">{clientDetails.fuseBoxLocation}</p>
                        </div>
                      )}
                      {clientDetails.videoSurveillance && (
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Video Surveillance</label>
                          <p className="text-sm text-gray-900">{clientDetails.videoSurveillance}</p>
                        </div>
                      )}
                      {clientDetails.cleaningSupplyLocation && (
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Cleaning Supply Location</label>
                          <p className="text-sm text-gray-900">{clientDetails.cleaningSupplyLocation}</p>
                        </div>
                      )}
                      {clientDetails.broomDustpanLocation && (
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Broom/Dustpan Location</label>
                          <p className="text-sm text-gray-900">{clientDetails.broomDustpanLocation}</p>
                        </div>
                      )}
                      {clientDetails.mailPickUp && (
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Mail Pick Up</label>
                          <p className="text-sm text-gray-900 break-words">{clientDetails.mailPickUp}</p>
                        </div>
                      )}
                      {clientDetails.waterIndoorPlants && (
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Water Indoor Plants</label>
                          <p className="text-sm text-gray-900">{clientDetails.waterIndoorPlants}</p>
                        </div>
                      )}
                      {clientDetails.outOfBoundAreas && (
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-600 mb-1">Out of Bound Areas</label>
                          <p className="text-sm text-gray-900">{clientDetails.outOfBoundAreas}</p>
                        </div>
                      )}
                      {clientDetails.additionalHomeCareInfo && (
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-600 mb-1">Additional Home Care Info</label>
                          <p className="text-sm text-gray-900 whitespace-pre-wrap">{clientDetails.additionalHomeCareInfo}</p>
                        </div>
                      )}
                      {clientDetails.homeCareInfo && (
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-600 mb-1">Legacy Home Care Info</label>
                          <p className="text-sm text-gray-900 whitespace-pre-wrap">{clientDetails.homeCareInfo}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Key Security & Access - For Sitters */}
            {currentUser?.role === 'sitter' && keyAccess && (
              <Card>
                <CardHeader>
                  <CardTitle>Key & Access Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Lockbox Information */}
                    {keyAccess.lockboxCode && (
                      <div className="rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-3 text-sm">Lockbox Details</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">Code:</span>{' '}
                            <span className="text-gray-900 font-mono">{keyAccess.lockboxCode}</span>
                          </div>
                          {keyAccess.lockboxLocation && (
                            <div>
                              <span className="font-medium text-gray-600">Location:</span>{' '}
                              <span className="text-gray-900">{keyAccess.lockboxLocation}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Alarm Information */}
                    {(keyAccess.alarmCodeToEnter || keyAccess.alarmCodeToExit || keyAccess.alarmCompanyName) && (
                      <div className="rounded-lg p-4">
                        <h4 className="font-semibold text-red-900 mb-3 text-sm">Alarm System</h4>
                        <div className="space-y-2 text-sm">
                          {keyAccess.alarmCodeToEnter && (
                            <div>
                              <span className="font-medium text-gray-600">Code to Enter:</span>{' '}
                              <span className="text-gray-900 font-mono">{keyAccess.alarmCodeToEnter}</span>
                            </div>
                          )}
                          {keyAccess.alarmCodeToExit && (
                            <div>
                              <span className="font-medium text-gray-600">Code to Exit:</span>{' '}
                              <span className="text-gray-900 font-mono">{keyAccess.alarmCodeToExit}</span>
                            </div>
                          )}
                          {keyAccess.alarmCompanyName && (
                            <div>
                              <span className="font-medium text-gray-600">Company:</span>{' '}
                              <span className="text-gray-900">{keyAccess.alarmCompanyName}</span>
                            </div>
                          )}
                          {keyAccess.alarmCompanyPhone && (
                            <div>
                              <span className="font-medium text-gray-600">Phone:</span>{' '}
                              <span className="text-gray-900">{keyAccess.alarmCompanyPhone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Access Permissions */}
                    {keyAccess.accessPermissions && (
                      <div className="rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-3 text-sm">Access Permissions</h4>
                        <div className="flex flex-wrap gap-2">
                          {keyAccess.accessPermissions.landlord && (
                            <span className="px-3 py-1 bg-white border border-green-300 text-green-900 rounded text-xs font-medium">Landlord</span>
                          )}
                          {keyAccess.accessPermissions.buildingManagement && (
                            <span className="px-3 py-1 bg-white border border-green-300 text-green-900 rounded text-xs font-medium">Building Management</span>
                          )}
                          {keyAccess.accessPermissions.superintendent && (
                            <span className="px-3 py-1 bg-white border border-green-300 text-green-900 rounded text-xs font-medium">Superintendent</span>
                          )}
                          {keyAccess.accessPermissions.housekeeper && (
                            <span className="px-3 py-1 bg-white border border-green-300 text-green-900 rounded text-xs font-medium">Housekeeper</span>
                          )}
                          {keyAccess.accessPermissions.neighbour && (
                            <span className="px-3 py-1 bg-white border border-green-300 text-green-900 rounded text-xs font-medium">Neighbour</span>
                          )}
                          {keyAccess.accessPermissions.friend && (
                            <span className="px-3 py-1 bg-white border border-green-300 text-green-900 rounded text-xs font-medium">Friend</span>
                          )}
                          {keyAccess.accessPermissions.family && (
                            <span className="px-3 py-1 bg-white border border-green-300 text-green-900 rounded text-xs font-medium">Family</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Home Access List */}
                    {keyAccess.homeAccessList && (
                      <div className="rounded-lg p-4">
                        <h4 className="font-semibold text-purple-900 mb-2 text-sm">Home Access List</h4>
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">{keyAccess.homeAccessList}</p>
                      </div>
                    )}
                    
                    {/* Additional Comments */}
                    {keyAccess.additionalComments && (
                      <div className="rounded-lg p-4">
                        <h4 className="font-semibold text-amber-900 mb-2 text-sm">Additional Comments</h4>
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">{keyAccess.additionalComments}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sitter Information */}
            {booking.sitterId && (
              <Card>
                <CardHeader>
                  <CardTitle>Assigned Sitter</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {booking.sitterId?.firstName?.[0] || 'S'}{booking.sitterId?.lastName?.[0] || 'S'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900">
                        {booking.sitterId?.firstName || 'Unknown'} {booking.sitterId?.lastName || 'Sitter'}
                      </p>
                      <p className="text-sm text-gray-600">{booking.sitterId?.email || 'No email provided'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Veterinarian Info */}
            {booking.veterinarianInfo && (
              <Card>
                <CardHeader>
                  <CardTitle>Veterinarian</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium text-gray-900">{booking.veterinarianInfo?.name || 'Not provided'}</p>
                    <p className="text-sm text-gray-600">{booking.veterinarianInfo?.phone || 'No phone provided'}</p>
                    <p className="text-sm text-gray-700">{booking.veterinarianInfo?.address || 'No address provided'}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Comments ({comments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add Comment */}
            <div className="mb-6">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="mb-3"
                rows={3}
              />
              <Button 
                onClick={handleSubmitComment}
                disabled={isSubmittingComment || !newComment.trim()}
                className="w-full sm:w-auto"
              >
                {isSubmittingComment ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Post Comment
                  </>
                )}
              </Button>
            </div>

            {/* Comments List */}
            {isLoadingComments ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size="lg" />
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No comments yet. Be the first to comment!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment._id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {comment.addedBy.firstName[0]}{comment.addedBy.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">
                              {comment.addedBy.firstName} {comment.addedBy.lastName}
                            </p>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getRoleBadgeColor(comment.role)}`}
                            >
                              {comment.role}
                            </Badge>
                            {comment.isInternal && (
                              <Badge variant="outline" className="text-xs bg-red-100 text-red-800">
                                Internal
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleString()}
                            {comment.updatedAt !== comment.createdAt && ' (edited)'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Edit/Delete buttons for comment author */}
                      {currentUser && comment.addedBy._id === currentUser.userId && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingComment(comment._id);
                              setEditCommentText(comment.body);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteComment(comment._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {editingComment === comment._id ? (
                      <div className="space-y-3">
                        <Textarea
                          value={editCommentText}
                          onChange={(e) => setEditCommentText(e.target.value)}
                          className="w-full"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button 
                            size="sm"
                            onClick={() => handleEditComment(comment._id)}
                          >
                            Save
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setEditingComment(null);
                              setEditCommentText('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-700 whitespace-pre-wrap">{comment.body}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
