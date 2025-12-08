
"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { isAuthenticated, getUserFromToken, getUserRole, removeToken } from "@/lib/auth";
import { Loading } from '@/components/ui/loading';
import api from "@/lib/api";
import { format } from "date-fns";
import { CalendarIcon, ChevronDownIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { formatDateTimeTZ, formatTimeRangeTZ, getUserTimeZone, APP_TIMEZONE } from "@/lib/utils";
import { OnboardingTour } from "@/components/ui/onboarding-tour";

const ClientWithPetsRow: React.FC<{ client: User }> = ({ client }) => {
  const [expanded, setExpanded] = useState(false);
  const [petTabs, setPetTabs] = useState<{[key: string]: string}>({});
  const [showModal, setShowModal] = useState(false);
  const [petsWithDetails, setPetsWithDetails] = useState<any[]>([]);
  const [loadingPets, setLoadingPets] = useState(false);

  // Fetch pet details when expanded
  useEffect(() => {
    const fetchPetDetails = async () => {
      if (expanded && client.pets && client.pets.length > 0 && petsWithDetails.length === 0) {
        setLoadingPets(true);
        try {
          const petsData = await Promise.all(
            client.pets.map(async (pet: any) => {
              const petId = pet._id || pet.id;
              console.log(`Fetching details for pet ${pet.name} with ID:`, petId);
              
              let careData = null;
              let medicalData = null;
              
              // Fetch care data
              try {
                const careResponse = await api.get(`/pets/${petId}/care`);
                careData = careResponse.data;
                console.log(`Care data for ${pet.name}:`, careData);
              } catch (error: any) {
                console.log(`No care data for pet ${pet.name}:`, error.response?.status);
              }
              
              // Fetch medical data
              try {
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
          console.log('All pets with details:', petsData);
          setPetsWithDetails(petsData);
        } catch (error) {
          console.error('Error fetching pet details:', error);
        } finally {
          setLoadingPets(false);
        }
      }
    };
    
    fetchPetDetails();
  }, [expanded, client.pets, petsWithDetails.length]);

  const displayPets = petsWithDetails.length > 0 ? petsWithDetails : client.pets || [];

  return (
    <div className="border-b pb-2">
      <div className="flex justify-between items-center py-2">
        <div>
          <span className="font-semibold">{client.firstName} {client.lastName}</span>
          <span className="ml-2 text-red-600">Note to Self</span>
          <div
            className="text-green-700 text-sm cursor-pointer mt-1"
            onClick={() => setExpanded((prev) => !prev)}
          >
            {expanded ? "- Hide" : "+ View Pets"}
          </div>
        </div>
        <div>
          <Button size="sm" variant="outline" className="mr-2" onClick={() => setShowModal(true)}>View Details</Button>
        </div>
      </div>
      {expanded && displayPets && displayPets.length > 0 && (
        <div className="bg-gray-50 rounded p-4 mt-2">
          {loadingPets ? (
            <div className="text-center py-4 text-gray-600">Loading pet details...</div>
          ) : (
            displayPets.map((pet) => {
              const petId = pet._id || pet.id;
              const currentTab = petTabs[petId] || "basic";
              return (
              <div key={petId} className="mb-6 bg-white rounded-lg p-4 border">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-lg">{pet.name}</h4>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">+ Add Note</Button>
                    <Button size="sm" variant="outline">Profile Preview</Button>
                    <Button size="sm" variant="outline">PDF Info Sheet</Button>
                  </div>
                </div>
                
                {/* Tab Navigation for Pet Details */}
                <div className="border-b border-gray-200 mb-4">
                  <nav className="flex space-x-4">
                    <button
                      onClick={() => setPetTabs(prev => ({...prev, [petId]: "basic"}))}
                      className={`py-2 px-4 border-b-2 font-medium text-sm ${
                        currentTab === "basic"
                          ? "border-primary text-primary"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Basic
                    </button>
                    <button
                      onClick={() => setPetTabs(prev => ({...prev, [petId]: "care"}))}
                      className={`py-2 px-4 border-b-2 font-medium text-sm ${
                        currentTab === "care"
                          ? "border-primary text-primary"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Care
                    </button>
                    <button
                      onClick={() => setPetTabs(prev => ({...prev, [petId]: "medical"}))}
                      className={`py-2 px-4 border-b-2 font-medium text-sm ${
                        currentTab === "medical"
                          ? "border-primary text-primary"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Medical
                    </button>
                    <button
                      onClick={() => setPetTabs(prev => ({...prev, [petId]: "insurance"}))}
                      className={`py-2 px-4 border-b-2 font-medium text-sm ${
                        currentTab === "insurance"
                          ? "border-primary text-primary"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Insurance
                    </button>
                  </nav>
                </div>

                {/* Tab Content */}
                {currentTab === "basic" && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Type:</span>
                      <div>{pet.species || pet.type || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Breed:</span>
                      <div>{pet.breed || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Colouring:</span>
                      <div>{pet.colouring || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Gender:</span>
                      <div>{pet.gender || 'Not specified'}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Age:</span>
                      <div>{pet.age ? `${pet.age} years old` : 'N/A'}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Date of Birth:</span>
                      <div>{pet.dateOfBirth || 'Not specified'}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Weight:</span>
                      <div>{pet.weight || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Spayed/Neutered:</span>
                      <div>{pet.spayedNeutered || 'Not specified'}</div>
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium text-gray-600">Microchip Number:</span>
                      <div className="font-mono text-xs">{pet.microchipNumber || 'N/A'}</div>
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium text-gray-600">Rabies Tag Number:</span>
                      <div className="font-mono text-xs">{pet.rabiesTagNumber || 'N/A'}</div>
                    </div>
                    {pet.allergies && (
                      <div className="col-span-2">
                        <span className="font-medium text-gray-600">Allergies:</span>
                        <div className="mt-1 whitespace-pre-wrap">{pet.allergies}</div>
                      </div>
                    )}
                    {pet.medications && (
                      <div className="col-span-2">
                        <span className="font-medium text-gray-600">Medications:</span>
                        <div className="mt-1 whitespace-pre-wrap">{pet.medications}</div>
                      </div>
                    )}
                    {pet.behaviorNotes && (
                      <div className="col-span-2">
                        <span className="font-medium text-gray-600">Behavior Notes:</span>
                        <div className="mt-1 whitespace-pre-wrap">{pet.behaviorNotes}</div>
                      </div>
                    )}
                    {pet.info && (
                      <div className="col-span-2">
                        <span className="font-medium text-gray-600">Additional Info:</span>
                        <div className="mt-1 whitespace-pre-wrap">{pet.info}</div>
                      </div>
                    )}
                  </div>
                )}

                {currentTab === "care" && (
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
                        {!pet.careData.personalityPhobiasPreferences && !pet.careData.typeOfFood && 
                         !pet.careData.dietFoodWaterInstructions && !pet.careData.careInstructions && 
                         !pet.careData.feedingSchedule && !pet.careData.exerciseRequirements && (
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

                {currentTab === "medical" && (
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
                          {pet.currentOnVaccines && (
                            <div className="col-span-2">
                              <span className="font-medium text-gray-600">Vaccinations:</span>
                              <div>{pet.currentOnVaccines}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-500 text-center py-4">No medical information available</div>
                    )}
                  </div>
                )}

                {currentTab === "insurance" && (
                  <div className="text-sm space-y-3">
                    {pet.insuranceDetails ? (
                      <div>
                        <span className="font-medium text-gray-600">Insurance Details:</span>
                        <div className="mt-1 whitespace-pre-wrap">{pet.insuranceDetails}</div>
                      </div>
                    ) : (
                      <div className="text-center py-2">
                        <p className="text-gray-500">No insurance information available</p>
                      </div>
                    )}
                    {pet.emergencyContact && (
                      <div>
                        <span className="font-medium text-gray-600">Pet Emergency Contact:</span>
                        <div className="mt-1 whitespace-pre-wrap">{pet.emergencyContact}</div>
                      </div>
                    )}
                    {pet.veterinarianInfo && (
                      <div>
                        <span className="font-medium text-gray-600">Veterinarian Info:</span>
                        <div className="mt-1 whitespace-pre-wrap">{pet.veterinarianInfo}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              );
            })
          )}
        </div>
      )}
      {expanded && (!client.pets || client.pets.length === 0) && (
        <div className="bg-gray-50 rounded p-3 mt-2 text-gray-500">No pets found for this client.</div>
      )}

      {/* Client Details Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="rounded-t-lg px-8 py-6 flex justify-between items-center" style={{ background: '#0a3d91', color: '#fff' }}>
              <h2 className="text-2xl font-bold">Client Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:text-gray-200 text-2xl"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="space-y-4 p-6">
              {/* Basic Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">First Name</label>
                    <p className="text-gray-900">{client.firstName || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Last Name</label>
                    <p className="text-gray-900">{client.lastName || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900 break-all">{client.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Phone</label>
                    <p className="text-gray-900">{client.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Cell Phone</label>
                    <p className="text-gray-900">{client.cellPhone || client.cellPhoneNumber || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Home Phone</label>
                    <p className="text-gray-900">{client.homePhone || client.homePhoneNumber || 'Not provided'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600">Address</label>
                    <p className="text-gray-900 break-words">{client.address || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">ZIP / Postal Code</label>
                    <p className="text-gray-900">{client.zipCode || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-red-800">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(client.emergencyContactFirstName || client.emergencyContactLastName) && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">First Name</label>
                        <p className="text-gray-900">{client.emergencyContactFirstName || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Last Name</label>
                        <p className="text-gray-900">{client.emergencyContactLastName || 'Not provided'}</p>
                      </div>
                    </>
                  )}
                  {client.emergencyContactCellPhone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Cell Phone</label>
                      <p className="text-gray-900">{client.emergencyContactCellPhone}</p>
                    </div>
                  )}
                  {client.emergencyContactHomePhone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Home Phone</label>
                      <p className="text-gray-900">{client.emergencyContactHomePhone}</p>
                    </div>
                  )}
                  {client.emergencyContact && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-600">Contact Info</label>
                      <p className="text-gray-900 break-words">{client.emergencyContact}</p>
                    </div>
                  )}
                  {!client.emergencyContactFirstName && !client.emergencyContactLastName && !client.emergencyContactCellPhone && !client.emergencyContactHomePhone && !client.emergencyContact && (
                    <div className="md:col-span-2">
                      <p className="text-gray-600">No emergency contact information provided</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Key Handling */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-blue-800">Key Handling</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Key Handling Method</label>
                    <p className="text-gray-900 font-medium">{client.keyHandlingMethod || 'Not provided'}</p>
                  </div>
                  {client.superintendentContact && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Superintendent / Building Management Contact</label>
                      <p className="text-gray-900 whitespace-pre-line">{client.superintendentContact}</p>
                    </div>
                  )}
                  {client.friendNeighbourContact && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Friend / Neighbour Contact</label>
                      <p className="text-gray-900 whitespace-pre-line">{client.friendNeighbourContact}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Home Care Information */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-green-800">Home Care Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Parking for Sitter</label>
                    <p className="text-gray-900">{client.parkingForSitter || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Garbage Collection Day</label>
                    <p className="text-gray-900">{client.garbageCollectionDay || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Fuse Box Location</label>
                    <p className="text-gray-900">{client.fuseBoxLocation || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Video Surveillance</label>
                    <p className="text-gray-900">{client.videoSurveillance || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Cleaning Supply Location</label>
                    <p className="text-gray-900">{client.cleaningSupplyLocation || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Broom/Dustpan Location</label>
                    <p className="text-gray-900">{client.broomDustpanLocation || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Mail Pick Up</label>
                    <p className="text-gray-900">{client.mailPickUp || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Water Indoor Plants</label>
                    <p className="text-gray-900">{client.waterIndoorPlants || 'Not provided'}</p>
                  </div>
                  {client.outOfBoundAreas && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-600">Out of Bound Areas</label>
                      <p className="text-gray-900 whitespace-pre-line">{client.outOfBoundAreas}</p>
                    </div>
                  )}
                  {client.additionalHomeCareInfo && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-600">Additional Home Care Info</label>
                      <p className="text-gray-900 whitespace-pre-line">{client.additionalHomeCareInfo}</p>
                    </div>
                  )}
                  {client.homeCareInfo && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-600">Legacy Home Care Info</label>
                      <p className="text-gray-900 whitespace-pre-line">{client.homeCareInfo}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Pet Summary */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-purple-800">Pet Summary</h3>
                {client.pets && client.pets.length > 0 ? (
                  <div className="space-y-2">
                    {client.pets.map((pet) => (
                      <div key={pet.id} className="flex justify-between items-center bg-white p-3 rounded shadow-sm">
                        <span className="font-medium">{pet.name}</span>
                        <span className="text-sm text-gray-600">{pet.species} • {pet.breed} • {pet.age} years</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No pets registered</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Close
              </Button>
              <Button>
                Contact Client
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface User {
    formStatus?: string;
  id: string;
  _id?: string; // MongoDB ID
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  cellPhone?: string;
  cellPhoneNumber?: string;
  homePhone?: string;
  homePhoneNumber?: string;
  address?: string;
  zipCode?: string;
  emergencyContact?: string;
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
  pets?: Pet[];
  status?: 'pending' | 'approved' | 'rejected'; // Add status for user approval
  createdAt?: string;
  profilePicture?: string;
  firstTimeLogin?: boolean; // Track if user is logging in for the first time
}

interface Pet {
  id: string;
  _id?: string;
  name: string;
  type?: string;
  species: string;
  breed?: string;
  colouring?: string;
  gender?: string;
  dateOfBirth?: string;
  spayedNeutered?: string;
  age: number | string;
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
}

interface Booking {
  id: string;
  date: string;
  serviceType: string;
  status: string;
}

// UserAvatar component for consistent avatar display
interface UserAvatarProps {
  user: any;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-lg'
  };

  const displayName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user?.firstName || user?.lastName || user?.email || 'User';
  
  const initials = displayName.split(' ').map((n: string) => n.charAt(0)).join('').toUpperCase().slice(0, 2);

  // Only show image if profilePicture is a non-empty string and not a default/sample image
  const isValidProfilePicture =
    user?.profilePicture &&
    typeof user.profilePicture === 'string' &&
    user.profilePicture.trim() !== '' &&
    !user.profilePicture.includes('test-avatar.jpg') &&
    !user.profilePicture.includes('default-avatar') &&
    !user.profilePicture.includes('sample');

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 ${className}`}>
      {isValidProfilePicture ? (
        <img 
          src={user.profilePicture} 
          alt={displayName}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-white font-medium">
          {initials}
        </span>
      )}
    </div>
  );
};

// Dashboard content component that uses search params
function DashboardContent() {
  const router = useRouter();
  const { toast } = useToast();
  
  // Helper to check if sitter is actually assigned (not just showing in UI)
  const isSitterAssigned = (booking: any) => {
    const s = booking?.sitterId;
    if (!s) return false;
    if (typeof s === 'string') return s.trim() !== '';
    if (typeof s === 'object') return Boolean(s._id || s.id || s.firstName || s.lastName);
    return false;
  };

  // Use Toronto timezone consistently across the app
  const userTimeZone = APP_TIMEZONE;
  const formatDateTime = (value?: string | number | Date) => formatDateTimeTZ(value, APP_TIMEZONE);

  // Image modal state for chat images
  const [modalImage, setModalImage] = useState<string | null>(null);
  const closeModal = () => setModalImage(null);
  
  // Sitter approval modal state
  const [isSitterDialogOpen, setIsSitterDialogOpen] = useState(false);
  const [selectedSitter, setSelectedSitter] = useState<any>(null);
  const [sitterActionType, setSitterActionType] = useState<'approve' | 'reject'>('approve');
  const [sitterForm, setSitterForm] = useState({ password: '', confirmPassword: '', notes: '' });
  const [sitterError, setSitterError] = useState('');
  const [sitterLoading, setSitterLoading] = useState(false);

  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userActionType, setUserActionType] = useState<'approve' | 'reject'>('approve');
  const [userForm, setUserForm] = useState({ password: '', confirmPassword: '', notes: '' });
  const [userError, setUserError] = useState('');
  const [userLoading, setUserLoading] = useState(false);

  // Delete confirmation states
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [isDeleteSitterDialogOpen, setIsDeleteSitterDialogOpen] = useState(false);
  const [sitterToDelete, setSitterToDelete] = useState<any>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [isDeletingSitter, setIsDeletingSitter] = useState(false);
  // Booking delete confirmation states
  const [isDeleteBookingDialogOpen, setIsDeleteBookingDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<any>(null);
  const [isDeletingBooking, setIsDeletingBooking] = useState(false);

  // User details modal states
  const [isUserDetailsModalOpen, setIsUserDetailsModalOpen] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState<any>(null);
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);
  const [userPets, setUserPets] = useState<any[]>([]);
  const [userKeySecurityData, setUserKeySecurityData] = useState<any>(null);
  const [petTabStates, setPetTabStates] = useState<{ [key: string]: string }>({});
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const [userServiceInquiries, setUserServiceInquiries] = useState<any[]>([]);

  // Sitter details modal states
  const [isSitterDetailsModalOpen, setIsSitterDetailsModalOpen] = useState(false);
  const [selectedSitterForDetails, setSelectedSitterForDetails] = useState<any>(null);
  const [sitterDetailsLoading, setSitterDetailsLoading] = useState(false);

  const openDeleteUserDialog = (user: any) => {
    setUserToDelete(user);
    setIsDeleteUserDialogOpen(true);
  };

  const openDeleteSitterDialog = (sitter: any) => {
    setSitterToDelete(sitter);
    setIsDeleteSitterDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete?._id && !userToDelete?.id) return;
    setIsDeletingUser(true);
    try {
      const userId = userToDelete._id || userToDelete.id;
      await api.delete(`/users/clients/${userId}`);
      toast({ 
        title: 'Client deleted', 
        description: `${userToDelete.firstName} ${userToDelete.lastName} has been successfully removed from the system.` 
      });
      // Refresh users list
      const res = await api.get('/users/admin/clients');
      setAdminUsers(res.data ?? []);
      setIsDeleteUserDialogOpen(false);
      setUserToDelete(null);
    } catch (err: any) {
      toast({ 
        title: 'Error', 
        description: err.response?.data?.message || 'Failed to delete client.',
        variant: 'destructive'
      });
    } finally {
      setIsDeletingUser(false);
    }
  };

  const handleDeleteSitter = async () => {
    if (!sitterToDelete?._id && !sitterToDelete?.id) return;
    setIsDeletingSitter(true);
    try {
      const sitterId = sitterToDelete._id || sitterToDelete.id;
      await api.delete(`/users/sitters/${sitterId}`);
      toast({ 
        title: 'Sitter deleted', 
        description: `${sitterToDelete.firstName} ${sitterToDelete.lastName} has been successfully removed from the system.` 
      });
      // Refresh sitters list
      const res = await api.get('/users/admin/sitters');
      setAdminSitters(res.data ?? []);
      setIsDeleteSitterDialogOpen(false);
      setSitterToDelete(null);
    } catch (err: any) {
      toast({ 
        title: 'Error', 
        description: err.response?.data?.message || 'Failed to delete sitter.',
        variant: 'destructive'
      });
    } finally {
      setIsDeletingSitter(false);
    }
  };

  const openUserDetailsModal = async (user: any) => {
    setSelectedUserDetails(user);
    setIsUserDetailsModalOpen(true);
    setUserDetailsLoading(true);
    
    try {
      const userId = user._id || user.id;
      
      // Fetch user's pets with care and medical data
      try {
        const petsResponse = await api.get(`/pets/user/${userId}`);
        const pets = Array.isArray(petsResponse.data) ? petsResponse.data : [petsResponse.data];
        
        // Fetch care and medical data for each pet
        const petsWithDetails = await Promise.all(
          pets.map(async (pet: any) => {
            let careData = null;
            let medicalData = null;
            
            // Fetch care data
            try {
              const careResponse = await api.get(`/pets/${pet._id}/care`);
              careData = careResponse.data;
            } catch (error: any) {
              console.log(`No care data for pet ${pet.name}`);
            }
            
            // Fetch medical data
            try {
              const medicalResponse = await api.get(`/pets/${pet._id}/medical`);
              medicalData = medicalResponse.data;
            } catch (error: any) {
              console.log(`No medical data for pet ${pet.name}`);
            }
            
            return {
              ...pet,
              careData,
              medicalData
            };
          })
        );
        
        setUserPets(petsWithDetails);
      } catch (error) {
        console.error('Error fetching user pets:', error);
        setUserPets([]);
      }
      
      // Fetch key security data
      try {
        const keySecurityResponse = await api.get(`/key-security/client/${userId}`);
        setUserKeySecurityData(keySecurityResponse.data);
      } catch (error) {
        console.error('Error fetching key security:', error);
        setUserKeySecurityData(null);
      }
      
      // Fetch user's bookings
      try {
        const bookingsResponse = await api.get(`/bookings/user/${userId}`);
        setUserBookings(Array.isArray(bookingsResponse.data) ? bookingsResponse.data : []);
      } catch (error) {
        console.error('Error fetching user bookings:', error);
        setUserBookings([]);
      }
      
      // Fetch user's service inquiries
      // try {
      //   const inquiriesResponse = await api.get(`/service-inquiries/user/${userId}`);
      //   setUserServiceInquiries(Array.isArray(inquiriesResponse.data) ? inquiriesResponse.data : []);
      // } catch (error) {
      //   console.error('Error fetching service inquiries:', error);
      //   setUserServiceInquiries([]);
      // }
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setUserDetailsLoading(false);
    }
  };

  const openSitterDetailsModal = async (sitter: any) => {
    setSelectedSitterForDetails(sitter);
    setIsSitterDetailsModalOpen(true);
    setSitterDetailsLoading(false);
  };

  const openSitterDialog = (sitter: any, action: 'approve' | 'reject') => {
    setSelectedSitter(sitter);
    setSitterActionType(action);
    setSitterForm({ password: '', confirmPassword: '', notes: '' });
    setSitterError('');
    setIsSitterDialogOpen(true);
  };

  const handleSitterAction = async () => {
    if (!selectedSitter?._id) return;
    setSitterLoading(true);
    setSitterError('');
    if (sitterActionType === 'approve') {
      if (sitterForm.password.length < 6) {
        setSitterError('Password must be at least 6 characters long');
        setSitterLoading(false);
        return;
      }
      if (sitterForm.password !== sitterForm.confirmPassword) {
        setSitterError('Passwords do not match');
        setSitterLoading(false);
        return;
      }
    }
    try {
      if (sitterActionType === 'approve') {
        await api.put(`/users/${selectedSitter._id}/approve`, {
          password: sitterForm.password,
          confirmPassword: sitterForm.confirmPassword,
          notes: sitterForm.notes
        });
        toast({ title: 'Sitter approved', description: `${selectedSitter.firstName} ${selectedSitter.lastName} approved.` });
      } else {
        await api.put(`/users/${selectedSitter._id}/reject`, { notes: sitterForm.notes });
        toast({ title: 'Sitter rejected', description: `${selectedSitter.firstName} ${selectedSitter.lastName} rejected.` });
      }
      const res = await api.get('/users/admin/sitters');
      setAdminSitters(res.data ?? []);
      setIsSitterDialogOpen(false);
      setSelectedSitter(null);
    } catch (err: any) {
      setSitterError(err.response?.data?.message || 'Failed to update sitter.');
    } finally {
      setSitterLoading(false);
    }
  };

  const openUserDialog = (user: any, action: 'approve' | 'reject') => {
    setSelectedUser(user);
    setUserActionType(action);
    setUserForm({ password: '', confirmPassword: '', notes: '' });
    setUserError('');
    setIsUserDialogOpen(true);
  };

  const handleUserAction = async () => {
    if (!selectedUser?._id && !selectedUser?.id) return;
    setUserLoading(true);
    setUserError('');
    if (userActionType === 'approve') {
      if (userForm.password.length < 6) {
        setUserError('Password must be at least 6 characters long');
        setUserLoading(false);
        return;
      }
      if (userForm.password !== userForm.confirmPassword) {
        setUserError('Passwords do not match');
        setUserLoading(false);
        return;
      }
    }
    try {
      const userId = selectedUser._id || selectedUser.id;
      if (userActionType === 'approve') {
        await api.put(`/users/${userId}/approve`, {
          password: userForm.password,
          confirmPassword: userForm.confirmPassword,
        });
        toast({ title: 'User approved', description: `${selectedUser.firstName} ${selectedUser.lastName} approved.` });
      } else {
        await api.put(`/users/${userId}/reject`, { notes: userForm.notes });
        toast({ title: 'User rejected', description: `${selectedUser.firstName} ${selectedUser.lastName} rejected.` });
      }
      // Refresh users
      const res = await api.get('/users/admin/clients');
      setAdminUsers(res.data ?? []);
      setIsUserDialogOpen(false);
      setSelectedUser(null);
    } catch (err: any) {
      setUserError(err.response?.data?.message || 'Failed to update user.');
    } finally {
      setUserLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-accent/10 text-accent">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-green-100 text-primary">In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getFormStatusBadge = (formStatus: string) => {
    if (formStatus === 'form complete') {
      return (
        <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5">Form Complete</span>
      );
    }
    return (
      <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5">Not Complete</span>
    );
  };


  const assignSitter = async (bookingId: string, sitterId: string) => {
    if (!bookingId || !sitterId) return;
    try {
      await api.put(`/bookings/${bookingId}/assign-sitter`, { sitterId });
      toast({ title: 'Sitter assigned', description: 'Sitter assigned successfully.' });
      const res = await api.get('/bookings');
      setAdminBookings(res.data ?? []);
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.message || 'Failed to assign sitter.' });
    }
  };

  const unassignSitter = async (bookingId: string) => {
    if (!bookingId) return;
    try {
      await api.delete(`/bookings/${bookingId}/assign-sitter`);
      toast({ title: 'Sitter unassigned', description: 'Sitter unassigned successfully.' });
      const res = await api.get('/bookings');
      setAdminBookings(res.data ?? []);
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.message || 'Failed to unassign sitter.' });
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    if (!bookingId || !status) return;
    try {
      await api.put(`/bookings/${bookingId}`, { status });
      toast({ title: 'Status updated', description: `Booking status changed to ${status}` });
      const res = await api.get('/bookings');
      setAdminBookings(res.data ?? []);
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.message || 'Failed to update status.' });
    }
  };

  // Handler to delete a booking (admin only)
  const deleteBooking = async (id: string) => {
    // Legacy direct deletion kept for reuse (not used in UI after modal added)
    try {
      await api.delete(`/bookings/admin/${id}`);
      toast({ title: 'Booking deleted', description: 'Booking deleted successfully.' });
      const res = await api.get('/bookings');
      setAdminBookings(res.data ?? []);
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.message || 'Failed to delete booking.' });
    }
  };

  const openDeleteBookingDialog = (booking: any) => {
    setBookingToDelete(booking);
    setIsDeleteBookingDialogOpen(true);
  };

  // Handle booking checkbox selection
  const handleBookingCheckboxChange = (bookingId: string) => {
    const newSelected = new Set(selectedBookingIds);
    if (newSelected.has(bookingId)) {
      newSelected.delete(bookingId);
    } else {
      newSelected.add(bookingId);
    }
    setSelectedBookingIds(newSelected);
  };

  // Handle select all bookings checkbox
  const handleSelectAllBookings = () => {
    if (selectedBookingIds.size === adminBookings.length && adminBookings.length > 0) {
      setSelectedBookingIds(new Set());
    } else {
      setSelectedBookingIds(new Set(adminBookings.map(b => b._id)));
    }
  };

  // Delete selected bookings
  const deleteSelectedBookings = async () => {
    if (selectedBookingIds.size === 0) {
      toast({ title: 'Error', description: 'Please select at least one booking to delete.' });
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedBookingIds.size} booking(s)? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      setIsDeletingSelectedBookings(true);

      // Delete each selected booking
      const deletePromises = Array.from(selectedBookingIds).map(bookingId =>
        api.delete(`/bookings/${bookingId}`)
      );

      await Promise.all(deletePromises);

      toast({
        title: 'Success',
        description: `Successfully deleted ${selectedBookingIds.size} booking(s)`,
      });

      setSelectedBookingIds(new Set());
      // Refresh bookings
      const res = await api.get('/bookings');
      setAdminBookings(res.data ?? []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete bookings',
      });
    } finally {
      setIsDeletingSelectedBookings(false);
    }
  };

  const handleConfirmDeleteBooking = async () => {
    if (!bookingToDelete?._id) return;
    setIsDeletingBooking(true);
    try {
      await api.delete(`/bookings/admin/${bookingToDelete._id}`);
      toast({ title: 'Booking deleted', description: 'Booking deleted successfully.' });
      const res = await api.get('/bookings');
      setAdminBookings(res.data ?? []);
      setIsDeleteBookingDialogOpen(false);
      setBookingToDelete(null);
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.message || 'Failed to delete booking.' });
    } finally {
      setIsDeletingBooking(false);
    }
  };

  const handleCancelDeleteBooking = () => {
    setIsDeleteBookingDialogOpen(false);
    setBookingToDelete(null);
  };
  
  const [user, setUser] = useState<User | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const searchParams = useSearchParams();
  const activeTab = searchParams?.get('tab') || (user?.role === 'sitter' ? 'dashboard' : user?.role === 'client' ? 'profile' : 'communication');
  
  const [clientSearch, setClientSearch] = useState("");
    const [petSearch, setPetSearch] = useState("");
  const [usersSearch, setUsersSearch] = useState("");
  const [sittersSearch, setSittersSearch] = useState("");
  const [bookingsSearch, setBookingsSearch] = useState("");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>(() => {
    // Initialize with today's date as default
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return {
      from: today,
      to: undefined,
    };
  });
  const [petTabs, setPetTabs] = useState<{ [petId: string]: string }>({});
  const [selectedClient, setSelectedClient] = useState("");
  const [noteText, setNoteText] = useState("");
  const [notes, setNotes] = useState<any[]>([]);
  const [replyingNoteId, setReplyingNoteId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [filterByUser, setFilterByUser] = useState<string>("");
  const [showAllInvoices, setShowAllInvoices] = useState(false);
  
  const [noteImages, setNoteImages] = useState<File[]>([]);
  const [noteImagePreviews, setNoteImagePreviews] = useState<string[]>([]);
  const [isUpdatingKeySecurity, setIsUpdatingKeySecurity] = useState(false);
  const [replyImages, setReplyImages] = useState<File[]>([]);
  const [replyImagePreviews, setReplyImagePreviews] = useState<string[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const noteImageInputRef = useRef<HTMLInputElement>(null);
  const replyImageInputRef = useRef<HTMLInputElement>(null);
  
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [adminSitters, setAdminSitters] = useState<any[]>([]);
  const [adminBookings, setAdminBookings] = useState<any[]>([]);
  const [selectedBookingIds, setSelectedBookingIds] = useState<Set<string>>(new Set());
  const [isDeletingSelectedBookings, setIsDeletingSelectedBookings] = useState(false);
  const [adminPets, setAdminPets] = useState<any[]>([]);
  const [addressChanges, setAddressChanges] = useState<any[]>([]);
  
  const [assignedSitters, setAssignedSitters] = useState<any[]>([]);
  
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityResults, setAvailabilityResults] = useState<any[]>([]);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [bookingFormData, setBookingFormData] = useState({
    service: 'Once A Day Pet Sitting 30min - C$28',
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '09:30'
  });
  
  const [timeDurationError, setTimeDurationError] = useState<string>('');
  const [isAddonModalOpen, setIsAddonModalOpen] = useState(false);
  const [selectedAddonSitter, setSelectedAddonSitter] = useState('');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  // Booking confirmation modal state
  const [showBookingConfirmModal, setShowBookingConfirmModal] = useState(false);
  const [selectedSitterForBooking, setSelectedSitterForBooking] = useState<any>(null);
  const [isConfirmingBooking, setIsConfirmingBooking] = useState(false);
  
  // Onboarding Tour state
  const [showTour, setShowTour] = useState(false);
  
  useEffect(() => {
    // Check if user is a client and it's their first time logging in (from backend)
    if (user && user.role === 'client' && !isLoading) {
      // Use firstTimeLogin from backend - more reliable than localStorage
      if (user.firstTimeLogin === true) {
        // Small delay to ensure elements are rendered
        setTimeout(() => setShowTour(true), 1000);
      }
    }
  }, [user, isLoading]);
  
  const handleTourComplete = async () => {
    setShowTour(false);
    // Update backend to mark user has completed onboarding
    try {
      await api.put('/users/profile/first-time-login');
      // Update local user state to reflect the change
      if (user) {
        setUser({ ...user, firstTimeLogin: false });
      }
      toast({
        title: "Welcome aboard! 🎉",
        description: "You've completed the onboarding tour. Enjoy using the platform!",
      });
    } catch (error) {
      console.error('Error updating firstTimeLogin status:', error);
      toast({
        title: "Tour completed",
        description: "However, we couldn't update your tour status. Please contact support if this persists.",
        variant: "destructive"
      });
    }
  };
  
  const handleTourSkip = async () => {
    setShowTour(false);
    // Update backend to mark user has skipped onboarding
    try {
      await api.put('/users/profile/first-time-login');
      // Update local user state to reflect the change
      if (user) {
        setUser({ ...user, firstTimeLogin: false });
      }
    } catch (error) {
      console.error('Error updating firstTimeLogin status:', error);
    }
  };
  
  const tourSteps = [
    {
      target: '[data-tour="profile-section"]',
      title: '👋 Welcome to Pet Sitter Management!',
      description: 'This is your profile overview. Here you can see your basic information and quickly access profile settings by clicking "Edit Profile".'
    },
    {
      target: '[data-tour="my-profile-nav"]',
      title: '📝 My Profile',
      description: 'Navigate here to manage your personal information, emergency contacts, home care details, and key security settings. Keep your profile up-to-date for better service!'
    },
    {
      target: '[data-tour="my-pets-nav"]',
      title: '🐾 My Pets',
      description: 'View and manage all your beloved pets here. Add new pets, update their information, medical records, care preferences, and keep everything organized in one place.'
    },
    {
      target: '[data-tour="communication-nav"]',
      title: '💬 Communication Hub',
      description: 'Stay connected with your pet sitters and the admin team. View notes, messages, and important updates about your pets here.'
    },
    {
      target: '[data-tour="key-security-nav"]',
      title: '🔐 Key Security',
      description: 'Manage your home access information securely. Add lockbox codes, alarm details, and specify who has access to your home for safe pet sitting services.'
    },
    {
      target: '[data-tour="book-now-nav"]',
      title: '📅 Book Now',
      description: 'Ready to book a pet sitter? Click here to check sitter availability, select your preferred dates and times, and create new booking requests.'
    },
    {
      target: '[data-tour="invoices-nav"]',
      title: '💳 Invoices',
      description: 'View and manage all your invoices and payment history. Keep track of your pet sitting expenses in one convenient place.'
    }
  ];
  
  // Key Security form state
  const [lockboxCode, setLockboxCode] = useState("");
  const [lockboxLocation, setLockboxLocation] = useState("");
  const [alarmCompanyName, setAlarmCompanyName] = useState("");
  const [alarmCompanyPhone, setAlarmCompanyPhone] = useState("");
  const [alarmCodeToEnter, setAlarmCodeToEnter] = useState("");
  const [alarmCodeToExit, setAlarmCodeToExit] = useState("");
  const [additionalComments, setAdditionalComments] = useState("");
  const [homeAccessList, setHomeAccessList] = useState("");
  const [accessPermissions, setAccessPermissions] = useState({
    landlord: false,
    buildingManagement: false,
    superintendent: false,
    housekeeper: false,
    neighbour: false,
    friend: false,
    family: false,
    none: true
  });
  // Removed lockboxCodeError state
  
  // Helper function to format date without timezone issues
  const formatDateLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Function to refresh pets data
  const refreshPetsData = async () => {
    try {
      const userToken = getUserFromToken();
      if (!userToken) {
        return;
      }
      
      const profileResponse = await api.get("/users/profile");
      const userId = profileResponse.data._id;

      // Fetch user's pets with care and medical information
      const petsResponse = await api.get(`/pets/user/${userId}/with-details`);
      const petsWithDetails = petsResponse?.data ?? [];
      
      // Transform to match the expected format for dashboard
      const transformedPets = petsWithDetails.map((item: any) => ({
        id: item.pet._id,
        _id: item.pet._id,
        name: item.pet.name,
        species: item.pet.type || item.pet.species,
        breed: item.pet.breed,
        age: item.pet.age,
        weight: item.pet.weight,
        photo: item.pet.photo,
        photoUrl: item.pet.photo,
        careInstructions: item.care?.careInstructions || '',
        feedingSchedule: item.care?.feedingSchedule || '',
        exerciseRequirements: item.care?.exerciseRequirements || '',
        vetName: item.medical?.vetBusinessName || '',
        vetAddress: item.medical?.vetAddress || '',
        vetPhone: item.medical?.vetPhoneNumber || '',
        vaccines: item.medical?.currentOnVaccines || ''
      }));
      
      setPets(transformedPets);
    } catch (error) {
      console.error('Error refreshing pets data:', error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const userToken = getUserFromToken();
        if (!userToken) {
          router.push("/login");
          return;
        }
        // Fetch user profile first
        const profileResponse = await api.get("/users/profile");
        const userId = profileResponse.data._id;
        const userRole = profileResponse.data.role;

        // Fetch user's pets with care and medical information
        const petsResponse = await api.get(`/pets/user/${userId}/with-details`);
        const petsWithDetails = petsResponse?.data ?? [];
        
        // Transform to match the expected format for dashboard
        const transformedPets = petsWithDetails.map((item: any) => ({
          id: item.pet._id,
          _id: item.pet._id,
          name: item.pet.name,
          species: item.pet.type || item.pet.species,
          breed: item.pet.breed,
          age: item.pet.age,
          weight: item.pet.weight,
          photo: item.pet.photo,
          photoUrl: item.pet.photo,
          careInstructions: item.care?.careInstructions || '',
          feedingSchedule: item.care?.feedingSchedule || '',
          exerciseRequirements: item.care?.exerciseRequirements || '',
          vetName: item.medical?.vetBusinessName || '',
          vetAddress: item.medical?.vetAddress || '',
          vetPhone: item.medical?.vetPhoneNumber || '',
          vaccines: item.medical?.currentOnVaccines || ''
        }));
        
        setPets(transformedPets);

        // Fetch bookings based on user role
        let bookingsResponse;
        if (userRole === 'sitter') {
          bookingsResponse = await api.get(`/bookings/sitter/${userId}`);
          // Fetch all clients with their pets for sitters
          const clientsResponse = await api.get('/users/admin/clients-with-pets');
          setClients(clientsResponse.data ?? []);
        } else {
          bookingsResponse = await api.get(`/bookings/user/${userId}`);
          // Fetch assigned sitters for this client
          if (userRole === 'client') {
            try {
              const assignedSittersResponse = await api.get(`/bookings/user/${userId}/assigned-sitters`);
              setAssignedSitters(assignedSittersResponse.data ?? []);
            } catch (error) {
              console.error("Error fetching assigned sitters:", error);
              setAssignedSitters([]);
            }
          }
        }
        setUser(profileResponse.data);
        setBookings(bookingsResponse.data);

        // Fetch available users and recent notes for communication
        if (userRole === 'sitter' || userRole === 'client' || userRole === 'admin') {
          try {
            // Fetch available users for dropdown
            const usersResponse = await api.get('/notes/users/available');
            setAvailableUsers(usersResponse.data ?? []);

            // Fetch recent notes
            const notesResponse = await api.get('/notes/recent/20');
            setNotes(notesResponse.data ?? []);
          } catch (error) {
            setAvailableUsers([]);
            setNotes([]);
          }
        }

        // Fetch Key Security data for this user
        try {
          const keySecurityRes = await api.get(`/key-security/client/${userId}`);
          if (keySecurityRes.data) {
            const d = keySecurityRes.data;
            setLockboxCode(d.lockboxCode || "");
            setLockboxLocation(d.lockboxLocation || "");
            setAlarmCompanyName(d.alarmCompanyName || "");
            setAlarmCompanyPhone(d.alarmCompanyPhone || "");
            setAlarmCodeToEnter(d.alarmCodeToEnter || "");
            setAlarmCodeToExit(d.alarmCodeToExit || "");
            setAdditionalComments(d.additionalComments || "");
            setHomeAccessList(d.homeAccessList || "");
            setAccessPermissions(d.accessPermissions || {
              landlord: false,
              buildingManagement: false,
              superintendent: false,
              housekeeper: false,
              neighbour: false,
              friend: false,
              family: false,
              none: true
            });
          }
        } catch (err) {
          // No key security data yet, ignore
        }

        // Fetch admin-specific data if user is admin
        if (userRole === 'admin') {
          try {
            const [adminClientsRes, adminSittersRes, adminBookingsRes, adminPetsRes] = await Promise.all([
              api.get('/users/admin/clients'),
              api.get('/users/admin/sitters'),
              api.get('/bookings'),
              api.get('/pets')
            ]);
            
            setAdminUsers(adminClientsRes.data ?? []);
            setAdminSitters(adminSittersRes.data ?? []);
            setAdminBookings(adminBookingsRes.data ?? []);
            setAdminPets(adminPetsRes.data ?? []);
            
            // TODO: Add address changes API when available
            setAddressChanges([]);
          } catch (error) {
            console.error("Error fetching admin data:", error);
          }
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();

    // Add window focus event listener to refresh data when user returns to tab
    const handleFocus = () => {
      if (isAuthenticated()) {
        refreshPetsData();
      }
    };

    // Add event listener for pet data updates
    const handlePetDataUpdated = () => {
      refreshPetsData();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('petDataUpdated', handlePetDataUpdated);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('petDataUpdated', handlePetDataUpdated);
    };
  }, [router]);

  // Redirect sitters, clients, and admins to their default tab if no tab is specified
  useEffect(() => {
    if (user?.role === 'sitter' && !searchParams?.get('tab')) {
      router.replace('/dashboard?tab=dashboard');
    }
    if (user?.role === 'client' && !searchParams?.get('tab')) {
      router.replace('/dashboard?tab=profile');
    }
    if (user?.role === 'admin' && !searchParams?.get('tab')) {
      router.replace('/dashboard?tab=users');
    }
  }, [user, searchParams, router]);

  const handleLogout = () => {
    removeToken();
    router.push("/login");
  };

  // Image upload handlers for notes
  const handleNoteImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Only image files are allowed",
          variant: "destructive"
        });
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: `${file.name} is larger than 5MB`,
          variant: "destructive"
        });
        return false;
      }
      return true;
    });

    // Add to existing images (allow multiple)
    setNoteImages(prev => [...prev, ...validFiles]);

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNoteImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleReplyImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Only image files are allowed",
          variant: "destructive"
        });
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: `${file.name} is larger than 5MB`,
          variant: "destructive"
        });
        return false;
      }
      return true;
    });

    // Add to existing images
    setReplyImages(prev => [...prev, ...validFiles]);

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setReplyImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeNoteImage = (index: number) => {
    setNoteImages(prev => prev.filter((_, i) => i !== index));
    setNoteImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeReplyImage = (index: number) => {
    setReplyImages(prev => prev.filter((_, i) => i !== index));
    setReplyImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (images: File[]): Promise<any[]> => {
    const uploadPromises = images.map(async (image) => {
      const formData = new FormData();
      formData.append('file', image);

      const response = await api.post('/upload/note-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        type: 'image',
        url: response.data.url,
        filename: response.data.originalName,
      };
    });

    return Promise.all(uploadPromises);
  };

  const handleAddNote = async () => {
    if (!selectedClient || !noteText.trim() || isSubmittingNote) return;
    
    setIsSubmittingNote(true);
    try {
      let attachments: any[] = [];
      
      // Upload images if any
      if (noteImages.length > 0) {
        setIsUploadingImages(true);
        try {
          attachments = await uploadImages(noteImages);
        } catch (error) {
          console.error("Error uploading images:", error);
          toast({
            title: "Image upload failed",
            description: "Failed to upload images. Note will be created without images.",
            variant: "destructive"
          });
        } finally {
          setIsUploadingImages(false);
        }
      }
      
      const noteData = {
        recipientId: selectedClient,
        text: noteText,
        attachments: attachments
      };
      
      const response = await api.post('/notes', noteData);
      
      // Clear form
      setNoteText("");
      setSelectedClient("");
      setNoteImages([]);
      setNoteImagePreviews([]);
      
      // Refresh notes to get the latest data
      await refreshNotes();
      
      toast({
        title: "Note added successfully",
        description: attachments.length > 0 ? `Note with ${attachments.length} image(s) added` : "Note added"
      });
    } catch (error) {
      console.error("Error creating note:", error);
      toast({
        title: "Error creating note",
        description: "Failed to create note. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleReply = async (noteId: string) => {
    if (!replyText.trim() || isSubmittingReply) return;
    
    setIsSubmittingReply(true);
    try {
      let attachments: any[] = [];
      
      // Upload images if any
      if (replyImages.length > 0) {
        setIsUploadingImages(true);
        try {
          attachments = await uploadImages(replyImages);
        } catch (error) {
          console.error("Error uploading images:", error);
          toast({
            title: "Image upload failed",
            description: "Failed to upload images. Reply will be created without images.",
            variant: "destructive"
          });
        } finally {
          setIsUploadingImages(false);
        }
      }
      
      const replyData = {
        text: replyText,
        attachments: attachments
      };
      
      const response = await api.post(`/notes/${noteId}/replies`, replyData);
      
      // Clear reply form
      setReplyText("");
      setReplyingNoteId(null);
      setReplyImages([]);
      setReplyImagePreviews([]);
      
      // Refresh notes to get the updated data
      await refreshNotes();
      
      toast({
        title: "Reply added successfully",
        description: attachments.length > 0 ? `Reply with ${attachments.length} image(s) added` : "Reply added"
      });
    } catch (error) {
      console.error("Error adding reply:", error);
      toast({
        title: "Error adding reply",
        description: "Failed to add reply. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const refreshNotes = async () => {
    try {
      let endpoint = '/notes/recent/20';
      const response = await api.get(endpoint);
      let fetchedNotes = response.data.notes || response.data || [];
      
      // Log all notes with their sender/recipient info
      fetchedNotes.forEach((note: any, index: number) => {
        console.log(`Note ${index + 1}:`, {
          senderId: note.senderId?._id || note.senderId?.id || note.senderId,
          senderName: note.senderId?.firstName + ' ' + note.senderId?.lastName,
          recipientId: note.recipientId?._id || note.recipientId?.id || note.recipientId,
          recipientName: note.recipientId?.firstName + ' ' + note.recipientId?.lastName,
          text: note.text?.substring(0, 50)
        });
      });
      
      // Client-side filtering if filterByUser is set
      if (filterByUser && fetchedNotes.length > 0) {
        console.log('Applying filter...');
        fetchedNotes = fetchedNotes.filter((note: any) => {
          // For clients, filter by sender (who wrote the note to them)
          // For sitters/admin, filter by recipient (who the note is about)
          if (user?.role === 'client') {
            const senderId = note.senderId?._id || note.senderId?.id || note.senderId;
            const matches = senderId === filterByUser;
            // if (!matches) {
            //   console.log('Filtered out - senderId:', senderId, 'does not match filterByUser:', filterByUser);
            // }
            return matches;
          } else {
            const recipientId = note.recipientId?._id || note.recipientId?.id || note.recipientId;
            const matches = recipientId === filterByUser;
            // if (!matches) {
            //   console.log('Filtered out - recipientId:', recipientId, 'does not match filterByUser:', filterByUser);
            // }
            return matches;
          }
        });
      }
          
      // Sort notes by creation date (newest first)
      fetchedNotes.sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt || a.timestamp || 0).getTime();
        const dateB = new Date(b.createdAt || b.timestamp || 0).getTime();
        return dateB - dateA;
      });
      
      setNotes(fetchedNotes);
    } catch (error) {
      console.error("Error refreshing notes:", error);
    }
  };

  // Extract service duration in minutes from service string
  const getServiceDurationInMinutes = (serviceString: string): number => {
    if (serviceString.includes('30min')) return 30;
    if (serviceString.includes('45min')) return 45;
    if (serviceString.includes('1hr')) return 60;
    return 30; // default
  };

  // Validate time duration matches service duration
  const validateTimeDuration = (startTime: string, endTime: string, service: string): string => {
    if (!startTime || !endTime) return '';
    
    const expectedDuration = getServiceDurationInMinutes(service);
    
    // Parse times
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    // Calculate actual duration in minutes
    const startInMinutes = startHour * 60 + startMin;
    const endInMinutes = endHour * 60 + endMin;
    const actualDuration = endInMinutes - startInMinutes;
    
    if (actualDuration !== expectedDuration) {
      return `Time duration must be exactly ${expectedDuration} minutes to match the selected service (${service.includes('30min') ? '30min' : service.includes('45min') ? '45min' : '1hr'})`;
    }
    
    return '';
  };

  // Handle time change with validation
  const handleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    const newFormData = { ...bookingFormData, [field]: value };
    setBookingFormData(newFormData);
    
    // Validate time duration
    const error = validateTimeDuration(
      field === 'startTime' ? value : bookingFormData.startTime,
      field === 'endTime' ? value : bookingFormData.endTime,
      bookingFormData.service
    );
    setTimeDurationError(error);
  };

  // Handle service change and auto-adjust end time
  const handleServiceChange = (newService: string) => {
    const duration = getServiceDurationInMinutes(newService);
    
    // Auto-adjust end time based on current start time and new service duration
    if (bookingFormData.startTime) {
      const [startHour, startMin] = bookingFormData.startTime.split(':').map(Number);
      const startInMinutes = startHour * 60 + startMin;
      const endInMinutes = startInMinutes + duration;
      
      const endHour = Math.floor(endInMinutes / 60);
      const endMin = endInMinutes % 60;
      const newEndTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;
      
      setBookingFormData(prev => ({
        ...prev,
        service: newService,
        endTime: newEndTime
      }));
      
      // Clear any previous error since we auto-adjusted
      setTimeDurationError('');
    } else {
      setBookingFormData(prev => ({ ...prev, service: newService }));
    }
  };

  // Booking confirmation function
  const confirmBooking = (sitterData: any) => {
    setSelectedSitterForBooking(sitterData);
    setShowBookingConfirmModal(true);
    // Close the availability modal when opening booking confirmation
    setShowAvailabilityModal(false);
  };

  const handleConfirmBookingSubmit = async () => {
    if (selectedSitterForBooking) {
      setIsConfirmingBooking(true);
      await createBooking(selectedSitterForBooking);
      // Modal will be closed in createBooking on success
      setIsConfirmingBooking(false);
    }
  };

  const handleCancelBookingConfirm = () => {
    setShowBookingConfirmModal(false);
    setSelectedSitterForBooking(null);
  };

  // Create actual booking function
  const createBooking = async (sitterData: any) => {
    try {
      // Validate required fields
      if (!bookingFormData.startDate || !bookingFormData.endDate || !bookingFormData.startTime || !bookingFormData.endTime) {
        toast({
          variant: "destructive",
          title: "Missing Information",
          description: "Please fill in all required booking fields.",
        });
        return;
      }

      // Validate time duration matches service duration
      const durationError = validateTimeDuration(
        bookingFormData.startTime,
        bookingFormData.endTime,
        bookingFormData.service
      );
      if (durationError) {
        toast({
          variant: "destructive",
          title: "Invalid Time Duration",
          description: durationError,
        });
        return;
      }

      if (!user?.id) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please log in to create a booking.",
        });
        return;
      }

      setIsCheckingAvailability(true);
      
      // Get service type mapping
      const serviceTypeMap: { [key: string]: string } = {
          'Pet Sitting 30min - CAD 28': 'pet-sitting',
          'Pet Sitting 30min Holiday - CAD 35': 'pet-sitting',
          'Pet Sitting 45min - CAD 32': 'pet-sitting',
          'Pet Sitting 45min Holiday - CAD 40': 'pet-sitting',
          'Pet Sitting 1hr - CAD 35': 'pet-sitting',
          'Pet Sitting 1hr Holiday - CAD 46': 'pet-sitting',
          'Dog Walking 30min - CAD 28': 'dog-walking',
          'Dog Walking 30min Holiday - CAD 35': 'dog-walking',
          'Dog Walking 45min - CAD 32': 'dog-walking',
          'Dog Walking 45min Holiday - CAD 40': 'dog-walking',
          'Dog Walking 1hr - CAD 35': 'dog-walking',
          'Dog Walking 1hr Holiday - CAD 46': 'dog-walking'
      };
      
      // Extract price from service string
      const priceMatch = bookingFormData.service.match(/C\$(\d+)/);
      const totalAmount = priceMatch ? parseInt(priceMatch[1]) : 28;
      
      // Map pet species to the enum values expected by the backend
      const mapPetTypeToEnum = (species: string): string => {
        const speciesMap: { [key: string]: string } = {
          'cat': 'Cat(s)',
          'dog': 'Dog(s)', 
          'rabbit': 'Rabbit(s)',
          'bird': 'Bird(s)',
          'guinea pig': 'Guinea pig(s)',
          'ferret': 'Ferret(s)',
          // Add more mappings as needed
        };
        return speciesMap[species.toLowerCase()] || 'Other';
      };

      // Create proper local datetime strings without forcing UTC
      const startDateTime = new Date(`${bookingFormData.startDate}T${bookingFormData.startTime}:00`);
      const endDateTime = new Date(`${bookingFormData.endDate}T${bookingFormData.endTime}:00`);

      const payload = {
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        serviceType: serviceTypeMap[bookingFormData.service] || 'pet-sitting',
        numberOfPets: pets.length || 1,
        petTypes: pets.length > 0 
          ? pets.map(pet => mapPetTypeToEnum(pet.species)).filter(Boolean)
          : ['Dog(s)'], // Default to Dog(s) if no pets
        notes: `Booking created from dashboard availability check.`,
        sitterId: sitterData._id || sitterData.id, // Changed from preferredSitterId to sitterId
        totalAmount: totalAmount,
        clientNotes: `Preferred sitter: ${sitterData.firstName} ${sitterData.lastName}. Selected based on availability check.`,
        specialInstructions: `Service: ${bookingFormData.service}. Time: ${bookingFormData.startTime} - ${bookingFormData.endTime}`
      };

      console.log('Creating booking with payload:', payload);

      const response = await api.post('/bookings', payload);
      
      console.log('Booking creation response:', response.data);
      
      // Assign the sitter to the booking immediately after creation
      const bookingId = response.data._id || response.data.id;
      const sitterId = sitterData._id || sitterData.id;
      
      if (bookingId && sitterId) {
        try {
          await api.put(`/bookings/${bookingId}/assign-sitter`, { sitterId });
          console.log('Sitter assigned to booking successfully');
        } catch (assignError) {
          console.error('Error assigning sitter to booking:', assignError);
          // Don't fail the entire booking process if sitter assignment fails
          // The booking is already created, just log the error
        }
      }
      
      toast({
        title: "Booking Created Successfully! 🎉",
        description: `Your booking with ${sitterData.firstName} ${sitterData.lastName} has been created with status "pending" and the sitter has been assigned. An admin will review and approve your booking soon.`,
      });
      
      setShowAvailabilityModal(false);
      setAvailabilityResults([]);
      
      // Close the confirmation modal on success
      setShowBookingConfirmModal(false);
      setSelectedSitterForBooking(null);
      
      // Reset form
      setBookingFormData({
        service: 'Once A Day Pet Sitting 30min - C$28',
        startDate: '',
        endDate: '',
        startTime: '09:00',
        endTime: '09:45'
      });
      
      // Refresh dashboard data to show the new booking
      if (user?.role === 'admin') {
        const updatedBookingsResponse = await api.get('/bookings');
        setBookings(updatedBookingsResponse.data);
        setAdminBookings(updatedBookingsResponse.data); // Also update admin bookings
      } else if (user?.role === 'client') {
        const updatedBookingsResponse = await api.get(`/bookings/user/${user.id}`);
        setBookings(updatedBookingsResponse.data);
      }
      
    } catch (error: any) {
      console.error('Error creating booking:', error);
      
      // Handle specific error messages from the backend
      let errorMessage = 'Failed to create booking. Please try again.';
      
      if (error.response?.data?.message) {
        if (error.response.data.message.includes('conflicts with existing bookings')) {
          errorMessage = 'The selected time slot conflicts with existing bookings. Please choose a different time.';
        } else if (Array.isArray(error.response.data.message)) {
          errorMessage = error.response.data.message.join(', ');
        } else {
          errorMessage = error.response.data.message;
        }
      }
      
      toast({
        variant: "destructive",
        title: "Booking Creation Failed",
        description: errorMessage,
      });
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  // Check availability for assigned sitters
  const checkSitterAvailability = async () => {
    // Check if user has completed their profile forms
    if (user && user.formStatus && user.formStatus !== 'form complete') {
      toast({
        title: "Profile Incomplete",
        description: "Please complete your profile information before booking. Go to 'My Profile' tab to fill in all required details.",
        variant: "destructive"
      });
      return;
    }

    if (!bookingFormData.startDate || !bookingFormData.endDate) {
      toast({
        title: "Missing Information",
        description: "Please select both start and end dates",
        variant: "destructive"
      });
      return;
    }

    if (!assignedSitters || assignedSitters.length === 0) {
      toast({
        title: "No Sitters Available",
        description: "You don't have any assigned sitters yet",
        variant: "destructive"
      });
      return;
    }

    setIsCheckingAvailability(true);
    const results: any[] = [];

    try {
      // Check each assigned sitter's availability
      for (const sitter of assignedSitters) {
        try {
          const sitterId = sitter._id || sitter.id;
          
          // Prepare query parameters for GET request
          const queryParams = {
            startDate: bookingFormData.startDate, // Already in YYYY-MM-DD format
            endDate: bookingFormData.endDate,     // Already in YYYY-MM-DD format
            ...(bookingFormData.startTime && { startTime: bookingFormData.startTime }),
            ...(bookingFormData.endTime && { endTime: bookingFormData.endTime })
          };

          const response = await api.get(`/api/availability/check/${sitterId}`, {
            params: queryParams
          });

          // Handle the backend response structure
          const responseData = response.data.data || response.data;
          
          results.push({
            sitter: sitter,
            availability: {
              isAvailable: responseData.isAvailable,
              availableSlots: responseData.availableSlots || [],
              workingHours: responseData.workingHours,
              remainingBookings: responseData.remainingBookings,
              reason: responseData.conflicts && responseData.conflicts.length > 0 
                ? responseData.conflicts.join(', ') 
                : undefined
            },
            status: responseData.isAvailable ? 'available' : 'busy'
          });
        } catch (error: any) {
          console.error(`Error checking availability for sitter ${sitter.firstName}:`, error);
          
          // Extract error message from response
          let errorMessage = 'Failed to check availability';
          if (error?.response?.data?.message) {
            errorMessage = Array.isArray(error.response.data.message) 
              ? error.response.data.message.join(', ')
              : error.response.data.message;
          }
          
          results.push({
            sitter: sitter,
            availability: null,
            status: 'error',
            error: errorMessage
          });
        }
      }

      setAvailabilityResults(results);
      setShowAvailabilityModal(true);
    } catch (error) {
      console.error('Error checking sitter availability:', error);
      toast({
        title: "Error",
        description: "Failed to check sitter availability",
        variant: "destructive"
      });
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  // Refresh notes when filter changes
  useEffect(() => {
    if (user) {
      refreshNotes();
    }
  }, [filterByUser, user]);

  const handleUpdateKeySecurity = async () => {
    setIsUpdatingKeySecurity(true);
    try {
      if (!user || !user.id) {
        toast({
          title: 'User not loaded',
          description: 'Please try again.',
          variant: 'destructive',
        });
        setIsUpdatingKeySecurity(false);
        return;
      }
      const securityData = {
        lockboxCode,
        lockboxLocation,
        alarmCompanyName,
        alarmCompanyPhone,
        alarmCodeToEnter,
        alarmCodeToExit,
        additionalComments,
        homeAccessList,
        accessPermissions
      };
      await api.post(`/key-security/client/${user.id}`, securityData);
      toast({
        title: 'Key Security Updated',
        description: 'Your key security information was saved successfully.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error updating security information:', error);
      toast({
        title: 'Failed to update key security',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingKeySecurity(false);
    }
  };

  const handleAccessPermissionChange = (permission: string, checked: boolean) => {
    if (permission === 'none' && checked) {
      // If "None" is selected, uncheck all others
      setAccessPermissions({
        landlord: false,
        buildingManagement: false,
        superintendent: false,
        housekeeper: false,
        neighbour: false,
        friend: false,
        family: false,
        none: true
      });
    } else if (permission !== 'none' && checked) {
      // If any other option is selected, uncheck "None"
      setAccessPermissions(prev => ({
        ...prev,
        [permission]: checked,
        none: false
      }));
    } else {
      setAccessPermissions(prev => ({
        ...prev,
        [permission]: checked
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading message="Loading dashboard..." />
      </div>
    );
  }

  // Images for cards (replace with real images or URLs as needed)
  const petImg = "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=400&q=80";
  const bookingImg = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80";
  const serviceImg = "https://images.unsplash.com/photo-1518715308788-300e1e1bdfb0?auto=format&fit=crop&w=400&q=80";

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white h-full overflow-y-auto">
      {/* Onboarding Tour */}
      {user?.role === 'client' && (
        <OnboardingTour
          steps={tourSteps}
          isOpen={showTour}
          onComplete={handleTourComplete}
          onSkip={handleTourSkip}
        />
      )}
      
      <main className="container-modern section-padding pb-8 min-h-full">
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-responsive-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName ? user?.firstName : user?.email || "User"}
          </h1>
          <p className="text-gray-600">
            {user?.role === 'admin' ? 'Manage your pet care business' : 
             user?.role === 'sitter' ? 'Manage your clients and bookings' : 
             'Manage your pets and bookings'}
          </p>
        </div>

        {/* Tab Content - Navigation now handled by sidebar */}
        <section className="animate-fadeIn">
          {activeTab === "communication" && (
            <div className="space-y-6 max-h-[70vh] overflow-y-auto scrollbar-modern min-h-0">
              {/* Add Note Section (not for clients) */}
              {user?.role !== 'client' && (
                <div className="card-modern p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900">ADD NOTE</h2>
                  {/* Client Selection Dropdown */}
                  <div className="mb-4">
                    <div className="relative">
                      <select
                        value={selectedClient}
                        onChange={(e) => setSelectedClient(e.target.value)}
                        className="input-modern w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 cursor-pointer hover:border-gray-300"
                      >
                        <option value="" className="text-gray-500">Select the person to add note</option>
                        {availableUsers.map((user) => (
                          <option key={user._id || user.id} value={user._id || user.id} className="text-gray-900">
                            {user.firstName} {user.lastName} ({user.role === 'admin' ? 'Admin' : user.role})
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  {/* Note Text Area */}
                  <div className="mb-4">
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Write your note here..."
                      className="input-modern w-full resize-none"
                      rows={4}
                    />
                  </div>

                  {/* Image Previews */}
                  {noteImagePreviews.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Attached Images:</h4>
                      <div className="flex flex-wrap gap-2">
                        {noteImagePreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-20 h-20 object-cover rounded border"
                            />
                            <button
                              type="button"
                              onClick={() => removeNoteImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hidden File Input */}
                  <input
                    ref={noteImageInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleNoteImageSelect}
                    className="hidden"
                  />

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center">
                    <Button 
                      variant="outline" 
                      className="flex items-center space-x-2"
                      onClick={() => noteImageInputRef.current?.click()}
                      disabled={isUploadingImages}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <span>{isUploadingImages ? 'Uploading...' : 'Attach Images'}</span>
                    </Button>
                    <Button 
                      onClick={handleAddNote}
                      disabled={!selectedClient || !noteText.trim() || isSubmittingNote || isUploadingImages}
                      className="bg-primary text-white px-6 py-2 rounded-md font-semibold shadow hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmittingNote ? 'Adding...' : 'Add Note'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Recent Notes Section */}
              <div className="card-modern p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Notes</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Filter by user</span>
                    <div className="relative">
                      <select
                        value={filterByUser}
                        onChange={(e) => setFilterByUser(e.target.value)}
                        className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2 pr-10 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 cursor-pointer hover:border-gray-300 min-w-[140px]"
                      >
                        <option value="" className="text-gray-500">All Users</option>
                        {availableUsers.map((user) => (
                          <option key={user._id || user.id} value={user._id || user.id} className="text-gray-900">
                            {user.firstName} {user.lastName}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Notes List */}
                <div className="space-y-4 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-2">
                  {notes.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      No notes yet. Add your first note above!
                    </div>
                  ) : (
                    notes.map((note) => (
                      <div key={note._id || note.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <div className="flex items-start space-x-3">
                          {/* User Avatar */}
                          <UserAvatar user={note.senderId} size="md" />
                          {/* Note Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-gray-900">
                                {note.senderId?._id === user?._id || note.senderId?.id === user?.id ? 'You' : (note.senderId?.firstName ? `${note.senderId.firstName} ${note.senderId.lastName}${note.senderId.role === 'admin' ? ' (Admin)' : ''}` : note.author)}
                              </span>
                              <span className="text-sm text-gray-500">added a note for</span>
                              <span className="font-medium text-primary">
                                {note.recipientId?._id === user?._id || note.recipientId?.id === user?.id ? 'You' : (note.recipientId?.firstName ? `${note.recipientId.firstName} ${note.recipientId.lastName}${note.recipientId.role === 'admin' ? ' (Admin)' : ''}` : note.clientName)}
                              </span>
                              <span className="text-sm text-gray-400">
                                {formatDateTimeTZ(note.createdAt || note.timestamp, APP_TIMEZONE)}
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed">{note.text}</p>
                            {/* Note Images (if any) */}
                            {note.attachments && note.attachments.length > 0 && (
                              <div className="mt-3">
                                <div className="flex space-x-2">
                                  {note.attachments.filter((att: any) => att.type === 'image').map((attachment: any, index: number) => (
                                    <img
                                      key={index}
                                      src={attachment.url}
                                      alt={attachment.filename}
                                      className="w-32 h-32 object-cover rounded-lg border cursor-pointer"
                                      onClick={() => setModalImage(attachment.url)}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                            {/* Legacy image support */}
                            {note.images && note.images.length > 0 && (
                              <div className="mt-3">
                                <div className="flex space-x-2">
                                  {note.images.map((image: string, index: number) => (
                                    <img
                                      key={index}
                                      src={image}
                                      alt={`Note attachment ${index + 1}`}
                                      className="w-32 h-32 object-cover rounded-lg border cursor-pointer"
                                      onClick={() => setModalImage(image)}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                            {/* Replies */}
                            {note.replies && note.replies.length > 0 && (
                              <div className="mt-4 space-y-2">
                                {note.replies.map((reply: any) => (
                                  <div key={reply._id || reply.id} className="border-t pt-2">
                                    <div className="flex items-start space-x-2">
                                      {/* Reply Avatar */}
                                      <UserAvatar user={reply.senderId} size="sm" />
                                      <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-1">
                                          <span className="font-medium text-gray-900">
                                            {reply.senderId?._id === user?._id || reply.senderId?.id === user?.id ? 'You' : (reply.senderId?.firstName ? `${reply.senderId.firstName} ${reply.senderId.lastName}${reply.senderId.role === 'admin' ? ' (Admin)' : ''}` : reply.author)}
                                          </span>
                                          <span className="text-sm text-gray-400">
                                            {formatDateTimeTZ(reply.createdAt || reply.timestamp, APP_TIMEZONE)}
                                          </span>
                                        </div>
                                        {/* Reply Text/Body */}
                                        <p className="text-gray-700 text-sm leading-relaxed mb-2">{reply.text}</p>
                                        {/* Reply Images (if any) */}
                                        {reply.attachments && reply.attachments.length > 0 && (
                                          <div className="mt-2">
                                            <div className="flex space-x-2">
                                              {reply.attachments.filter((att: any) => att.type === 'image').map((attachment: any, index: number) => (
                                                <img
                                                  key={index}
                                                  src={attachment.url}
                                                  alt={attachment.filename}
                                                  className="w-24 h-24 object-cover rounded border cursor-pointer"
                                                  onClick={() => setModalImage(attachment.url)}
                                                />
                                              ))}
    {/* Image Popup Modal for chat images */}
    {modalImage && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
        onClick={closeModal}
      >
        <div className="relative" onClick={e => e.stopPropagation()}>
          <img
            src={modalImage}
            alt="Chat Attachment"
            className="max-w-full max-h-[80vh] rounded-lg shadow-xl"
          />
          <button
            className="absolute top-2 right-2 bg-white bg-opacity-80 rounded-full p-2 text-gray-700 hover:bg-opacity-100"
            onClick={closeModal}
          >
            <span className="material-icons">close</span>
          </button>
        </div>
      </div>
    )}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            {/* Note Actions */}
                            <div className="mt-4">
                              {replyingNoteId === (note._id || note.id) ? (
                                <div className="space-y-2">
                                  <textarea
                                    value={replyText}
                                    onChange={e => setReplyText(e.target.value)}
                                    placeholder="Add Reply"
                                    className="input-modern w-full resize-none"
                                    rows={2}
                                  />
                                  
                                  {/* Reply Image Previews */}
                                  {replyImagePreviews.length > 0 && (
                                    <div className="mb-2">
                                      <h5 className="text-xs font-medium text-gray-600 mb-1">Attached Images:</h5>
                                      <div className="flex flex-wrap gap-1">
                                        {replyImagePreviews.map((preview, index) => (
                                          <div key={index} className="relative">
                                            <img
                                              src={preview}
                                              alt={`Reply preview ${index + 1}`}
                                              className="w-16 h-16 object-cover rounded border"
                                            />
                                            <button
                                              type="button"
                                              onClick={() => removeReplyImage(index)}
                                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-red-600"
                                            >
                                              ×
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Hidden File Input for Reply */}
                                  <input
                                    ref={replyImageInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleReplyImageSelect}
                                    className="hidden"
                                  />
                                  
                                  <div className="flex gap-2">
                                    <Button 
                                      variant="outline" 
                                      className="flex items-center space-x-2"
                                      onClick={() => replyImageInputRef.current?.click()}
                                      disabled={isUploadingImages}
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                      </svg>
                                      <span>{isUploadingImages ? 'Uploading...' : 'Attach Images'}</span>
                                    </Button>
                                    <Button
                                      className="bg-primary text-white px-4 py-2 rounded-md font-semibold shadow hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                      onClick={() => handleReply(note._id || note.id)}
                                      disabled={!replyText.trim() || isSubmittingReply || isUploadingImages}
                                    >
                                      {isSubmittingReply ? 'Submitting...' : 'Submit'}
                                    </Button>
                                    <Button variant="ghost" onClick={() => { 
                                      setReplyingNoteId(null); 
                                      setReplyText(""); 
                                      setReplyImages([]);
                                      setReplyImagePreviews([]);
                                    }}>
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 p-0" onClick={() => setReplyingNoteId(note._id || note.id)}>
                                  + Add Reply
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Admin: Users Tab */}
          {user?.role === "admin" && activeTab === "users" && (
            <Card>
              <CardHeader>
                <CardTitle>All Users ({adminUsers.length})</CardTitle>
                <CardDescription>
                  View all clients registered in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search Input */}
                <div className="mb-6">
                  <input
                    type="text"
                    placeholder="Search users by name, email, phone, or address..."
                    value={usersSearch}
                    onChange={(e) => setUsersSearch(e.target.value)}
                    className="input-modern w-full"
                  />
                </div>
                <div className="rounded-lg border bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow>
                          <TableHead className="bg-primary/10 text-primary font-bold text-base">Name</TableHead>
                          <TableHead className="bg-primary/10 text-primary font-bold text-base">Email</TableHead>
                          <TableHead className="bg-primary/10 text-primary font-bold text-base">Phone</TableHead>
                          <TableHead className="bg-primary/10 text-primary font-bold text-base">Role</TableHead>
                          <TableHead className="bg-primary/10 text-primary font-bold text-base">Status</TableHead>
                          <TableHead className="bg-primary/10 text-primary font-bold text-base" style={{ minWidth: '120px' }}>Form Status</TableHead>
                          <TableHead className="bg-primary/10 text-primary font-bold text-base">Address</TableHead>
                          <TableHead className="bg-primary/10 text-primary font-bold text-base">Emergency Contact</TableHead>
                          <TableHead className="bg-primary/10 text-primary font-bold text-base">Created At</TableHead>
                          <TableHead className="bg-primary/10 text-primary font-bold text-base text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminUsers.length > 0 ? (
                        adminUsers
                          .filter(user => {
                            const searchTerm = usersSearch.toLowerCase();
                            if (!searchTerm) return true;
                            return (
                              `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().includes(searchTerm) ||
                              (user.email || '').toLowerCase().includes(searchTerm) ||
                              (user.phone || '').toLowerCase().includes(searchTerm) ||
                              (user.address || '').toLowerCase().includes(searchTerm)
                            );
                          })
                          .sort((a, b) => {
                            const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                            const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                            return bDate - aDate;
                          })
                          .map((user, index) => (
                          <TableRow key={user._id || user.id || `user-${index}`}>
                            <TableCell className="font-medium whitespace-nowrap">
                              {user.firstName} {user.lastName}
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell className="whitespace-nowrap">{user.cellPhone || user.cellPhoneNumber || user.phone || user.homePhone || user.homePhoneNumber || 'N/A'}</TableCell>
                            <TableCell className="capitalize">{user.role}</TableCell>
                            <TableCell>{getStatusBadge(user.status || 'pending')}</TableCell>
                            <TableCell>{getFormStatusBadge(user.formStatus || 'not complete')}</TableCell>
                            <TableCell>{user.address || 'N/A'}</TableCell>
                            <TableCell>{user.emergencyContact || 'N/A'}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              {(user as any).createdAt ? formatDateTime((user as any).createdAt) : 'N/A'}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {user.status === 'pending' && (
                                  <>
                                    <Button size="sm" onClick={() => openUserDialog(user, 'approve')} className="bg-green-600 hover:bg-green-700">Approve</Button>
                                    <Button size="sm" variant="destructive" onClick={() => openUserDialog(user, 'reject')}>Reject</Button>
                                  </>
                                )}
                                <Button size="sm" variant="outline" onClick={() => openUserDetailsModal(user)}>View Details</Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive" 
                                  onClick={() => openDeleteUserDialog(user)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                            No users found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Admin: Sitters Tab */}
          {user?.role === "admin" && activeTab === "sitters" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Sitter Applications ({adminSitters.length})</CardTitle>
                  <CardDescription>
                    Manage pending sitter applications and view all registered sitters
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Search Input */}
                  <div className="mb-6">
                    <input
                      type="text"
                      placeholder="Search sitters by name, email, phone, or status..."
                      value={sittersSearch}
                      onChange={(e) => setSittersSearch(e.target.value)}
                      className="input-modern w-full"
                    />
                  </div>
                  <div className="rounded-lg border bg-white">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="bg-primary/10 text-primary font-bold text-base">Name</TableHead>
                          <TableHead className="bg-primary/10 text-primary font-bold text-base">Email</TableHead>
                          <TableHead className="bg-primary/10 text-primary font-bold text-base">Phone</TableHead>
                          <TableHead className="bg-primary/10 text-primary font-bold text-base">Status</TableHead>
                          <TableHead className="bg-primary/10 text-primary font-bold text-base">Applied Date</TableHead>
                          <TableHead className="bg-primary/10 text-primary font-bold text-base text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {adminSitters.length > 0 ? (
                          adminSitters
                            .filter(sitter => {
                              const searchTerm = sittersSearch.toLowerCase();
                              if (!searchTerm) return true;
                              return (
                                `${sitter.firstName || ''} ${sitter.lastName || ''}`.toLowerCase().includes(searchTerm) ||
                                (sitter.email || '').toLowerCase().includes(searchTerm) ||
                                (sitter.phone || '').toLowerCase().includes(searchTerm) ||
                                (sitter.status || '').toLowerCase().includes(searchTerm)
                              );
                            })
                            .map((sitter, index) => (
                            <TableRow key={sitter._id || sitter.id || `sitter-${index}`}>
                              <TableCell className="font-medium whitespace-nowrap">{sitter.firstName} {sitter.lastName}</TableCell>
                              <TableCell>{sitter.email}</TableCell>
                              <TableCell className="whitespace-nowrap">{sitter.phone ? sitter.phone : sitter.emergencyContact || 'N/A'}</TableCell>
                              <TableCell>{getStatusBadge ? getStatusBadge(sitter.status) : sitter.status}</TableCell>
                              <TableCell className="whitespace-nowrap">{sitter.createdAt ? formatDateTime(sitter.createdAt) : 'N/A'}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  {sitter.status === 'pending' && (
                                    <>
                                      <Button size="sm" onClick={() => openSitterDialog(sitter, 'approve')} className="bg-green-600 hover:bg-green-700">Approve</Button>
                                      <Button size="sm" variant="destructive" onClick={() => openSitterDialog(sitter, 'reject')}>Reject</Button>
                                    </>
                                  )}
                                  <Button size="sm" variant="outline" onClick={() => openSitterDetailsModal(sitter)}>View Details</Button>
                                  <Button 
                                    size="sm" 
                                    variant="destructive" 
                                    onClick={() => openDeleteSitterDialog(sitter)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No sitters found</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Sitter Approve/Reject Modal */}
              {isSitterDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-8 relative animate-fadeIn">
                    <h2 className="text-2xl font-bold mb-1">{sitterActionType === 'approve' ? 'Approve' : 'Reject'} Sitter Application</h2>
                    <p className="mb-4 text-gray-600">
                      {sitterActionType === 'approve'
                        ? `Approve ${selectedSitter?.firstName} ${selectedSitter?.lastName} as a sitter. A temporary password will be set for their account.`
                        : `Reject ${selectedSitter?.firstName} ${selectedSitter?.lastName}'s sitter application.`}
                    </p>
                    {sitterActionType === 'approve' && (
                      <>
                        <div className="mb-4">
                          <label className="block font-medium mb-1">Temporary Password *</label>
                          <input
                            type="password"
                            className="input-modern w-full"
                            placeholder="Enter temporary password"
                            value={sitterForm.password}
                            onChange={e => setSitterForm(f => ({ ...f, password: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block font-medium mb-1">Confirm Password *</label>
                          <input
                            type="password"
                            className="input-modern w-full"
                            placeholder="Confirm temporary password"
                            value={sitterForm.confirmPassword}
                            onChange={e => setSitterForm(f => ({ ...f, confirmPassword: e.target.value }))}
                            required
                          />
                        </div>
                      </>
                    )}

                    {sitterError && <div className="text-red-600 mb-3">{sitterError}</div>}
                    <div className="flex justify-end gap-3 mt-6">
                      <Button variant="outline" onClick={() => setIsSitterDialogOpen(false)} disabled={sitterLoading}>Cancel</Button>
                      <Button onClick={handleSitterAction} disabled={sitterLoading} className={sitterActionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''} variant={sitterActionType === 'reject' ? 'destructive' : 'default'}>
                        {sitterLoading ? (sitterActionType === 'approve' ? 'Approving...' : 'Rejecting...') : (sitterActionType === 'approve' ? 'Approve Sitter' : 'Reject Sitter')}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Delete Sitter Confirmation Modal */}
              {isDeleteSitterDialogOpen && sitterToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-8 relative animate-fadeIn">
                    <h2 className="text-2xl font-bold mb-2 text-red-600">Delete Sitter</h2>
                    <p className="mb-4 text-gray-700">
                      Are you sure you want to delete <strong>{sitterToDelete.firstName} {sitterToDelete.lastName}</strong>?
                    </p>
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700 font-semibold">
                            Warning: This action cannot be undone!
                          </p>
                          <p className="text-sm text-red-600 mt-1">
                            This will permanently remove the sitter from the system.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setIsDeleteSitterDialogOpen(false);
                          setSitterToDelete(null);
                        }} 
                        disabled={isDeletingSitter}
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={handleDeleteSitter} 
                        disabled={isDeletingSitter}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {isDeletingSitter ? 'Deleting...' : 'Delete Sitter'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Sitter Details Modal */}
              {isSitterDetailsModalOpen && selectedSitterForDetails && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4">
                  <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden animate-fadeIn flex flex-col">
                    {/* Modal Header */}
                    <div className="bg-gradient-to-r from-primary to-accent text-white p-4 sm:p-6 flex justify-between items-center flex-shrink-0">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold">Sitter Details</h2>
                        <p className="text-xs sm:text-sm opacity-90 mt-1">{selectedSitterForDetails.firstName} {selectedSitterForDetails.lastName}</p>
                      </div>
                      <button
                        onClick={() => {
                          setIsSitterDetailsModalOpen(false);
                          setSelectedSitterForDetails(null);
                        }}
                        className="text-white hover:bg-white/20 rounded-full p-2 transition-colors flex-shrink-0"
                      >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Modal Content */}
                    <div className="p-4 sm:p-6 overflow-y-auto flex-1 scrollbar-modern">
                      {sitterDetailsLoading ? (
                        <div className="flex justify-center items-center py-12">
                          <Loading message="Loading sitter details..." />
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {/* Basic Information */}
                          <div className="bg-gray-50 rounded-lg p-3 sm:p-5 border border-gray-200">
                            <h3 className="text-base sm:text-lg font-semibold text-primary mb-3 sm:mb-4 flex items-center">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              Basic Information
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">First Name</label>
                                <p className="text-sm sm:text-base text-gray-900 bg-white p-2 rounded border break-words">{selectedSitterForDetails.firstName || 'Not provided'}</p>
                              </div>
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Last Name</label>
                                <p className="text-sm sm:text-base text-gray-900 bg-white p-2 rounded border break-words">{selectedSitterForDetails.lastName || 'Not provided'}</p>
                              </div>
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Email</label>
                                <p className="text-sm sm:text-base text-gray-900 bg-white p-2 rounded border break-all">{selectedSitterForDetails.email || 'Not provided'}</p>
                              </div>
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Phone</label>
                                <p className="text-sm sm:text-base text-gray-900 bg-white p-2 rounded border">{selectedSitterForDetails.phone || selectedSitterForDetails.emergencyContact || 'Not provided'}</p>
                              </div>
                              <div className="sm:col-span-2">
                                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Address</label>
                                <p className="text-sm sm:text-base text-gray-900 bg-white p-2 rounded border break-words">{selectedSitterForDetails.address || 'Not provided'}</p>
                              </div>
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Role</label>
                                <p className="text-sm sm:text-base text-gray-900 bg-white p-2 rounded border capitalize">{selectedSitterForDetails.role || 'Not provided'}</p>
                              </div>
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Status</label>
                                <div className="bg-white p-2 rounded border">
                                  {getStatusBadge(selectedSitterForDetails.status || 'pending')}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Emergency Contact */}
                          <div className="bg-red-50 rounded-lg p-3 sm:p-5 border border-red-200">
                            <h3 className="text-base sm:text-lg font-semibold text-red-800 mb-3 sm:mb-4 flex items-center">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              Emergency Contact
                            </h3>
                            <p className="text-sm sm:text-base text-gray-900 bg-white p-2 sm:p-3 rounded border whitespace-pre-wrap break-words">{selectedSitterForDetails.emergencyContact || 'Not provided'}</p>
                          </div>

                          {/* Experience & Qualifications */}
                          {selectedSitterForDetails.homeCareInfo && (
                            <div className="bg-blue-50 rounded-lg p-3 sm:p-5 border border-blue-200">
                              <h3 className="text-base sm:text-lg font-semibold text-blue-800 mb-3 sm:mb-4 flex items-center">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Experience & Qualifications
                              </h3>
                              <p className="text-sm sm:text-base text-gray-900 bg-white p-2 sm:p-3 rounded border whitespace-pre-wrap break-words">{selectedSitterForDetails.homeCareInfo}</p>
                            </div>
                          )}

                          {/* Account Information */}
                          <div className="bg-gray-50 rounded-lg p-3 sm:p-5 border border-gray-200">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Account Information
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Applied/Created At</label>
                                <p className="text-sm sm:text-base text-gray-900 bg-white p-2 rounded border break-words">
                                  {selectedSitterForDetails.createdAt ? formatDateTime(selectedSitterForDetails.createdAt) : 'N/A'}
                                </p>
                              </div>
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Sitter ID</label>
                                <p className="text-gray-900 bg-white p-2 rounded border font-mono text-xs sm:text-sm break-all">
                                  {selectedSitterForDetails._id || selectedSitterForDetails.id || 'N/A'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Modal Footer */}
                    <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 border-t flex-shrink-0">
                      <Button 
                        variant="outline" 
                        className="w-full sm:w-auto order-2 sm:order-1"
                        onClick={() => {
                          setIsSitterDetailsModalOpen(false);
                          setSelectedSitterForDetails(null);
                        }}
                      >
                        Close
                      </Button>
                      <Button 
                        className="bg-primary hover:bg-primary/90 w-full sm:w-auto order-1 sm:order-2"
                        onClick={() => {
                          window.location.href = `mailto:${selectedSitterForDetails.email}`;
                        }}
                      >
                        <svg className="w-4 h-4 mr-2 sm:inline hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Contact Sitter
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* User Approve/Reject Modal */}
          {isUserDialogOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-8 relative animate-fadeIn">
                <h2 className="text-2xl font-bold mb-1">{userActionType === 'approve' ? 'Approve' : 'Reject'} User Account</h2>
                <p className="mb-4 text-gray-600">
                  {userActionType === 'approve'
                    ? `Approve ${selectedUser?.firstName} ${selectedUser?.lastName} as a user. A temporary password will be set for their account.`
                    : `Reject ${selectedUser?.firstName} ${selectedUser?.lastName}'s user account.`}
                </p>
                {userActionType === 'approve' && (
                  <>
                    <div className="mb-4">
                      <label className="block font-medium mb-1">Temporary Password *</label>
                      <input
                        type="password"
                        className="input-modern w-full"
                        placeholder="Enter temporary password"
                        value={userForm.password}
                        onChange={e => setUserForm(f => ({ ...f, password: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block font-medium mb-1">Confirm Password *</label>
                      <input
                        type="password"
                        className="input-modern w-full"
                        placeholder="Confirm temporary password"
                        value={userForm.confirmPassword}
                        onChange={e => setUserForm(f => ({ ...f, confirmPassword: e.target.value }))}
                        required
                      />
                    </div>
                  </>
                )}
               
                {userError && <div className="text-red-600 mb-3">{userError}</div>}
                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline" onClick={() => setIsUserDialogOpen(false)} disabled={userLoading}>Cancel</Button>
                  <Button onClick={handleUserAction} disabled={userLoading} className={userActionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''} variant={userActionType === 'reject' ? 'destructive' : 'default'}>
                    {userLoading ? (userActionType === 'approve' ? 'Approving...' : 'Rejecting...') : (userActionType === 'approve' ? 'Approve User' : 'Reject User')}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Delete User Confirmation Modal */}
          {isDeleteUserDialogOpen && userToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-8 relative animate-fadeIn">
                <h2 className="text-2xl font-bold mb-2 text-red-600">Delete Client</h2>
                <p className="mb-4 text-gray-700">
                  Are you sure you want to delete <strong>{userToDelete.firstName} {userToDelete.lastName}</strong>?
                </p>
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700 font-semibold">
                        Warning: This action cannot be undone!
                      </p>
                      <p className="text-sm text-red-600 mt-1">
                        This will permanently remove the client and all associated data (pets, pet care records, pet medical records) from the system.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsDeleteUserDialogOpen(false);
                      setUserToDelete(null);
                    }} 
                    disabled={isDeletingUser}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteUser} 
                    disabled={isDeletingUser}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isDeletingUser ? 'Deleting...' : 'Delete Client'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* User Details Modal */}
          {isUserDetailsModalOpen && selectedUserDetails && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4">
              <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden animate-fadeIn flex flex-col">
                {/* Modal Header */}
                <div className="bg-primary text-white p-4 sm:p-6 flex justify-between items-center flex-shrink-0">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold">Client Details</h2>
                    <p className="text-xs sm:text-sm opacity-90 mt-1">{selectedUserDetails.firstName} {selectedUserDetails.lastName}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsUserDetailsModalOpen(false);
                      setSelectedUserDetails(null);
                      setUserPets([]);
                      setUserKeySecurityData(null);
                      setPetTabStates({});
                      setUserBookings([]);
                      setUserServiceInquiries([]);
                    }}
                    className="text-white hover:bg-white/20 rounded-full p-2 transition-colors flex-shrink-0"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-4 sm:p-6 overflow-y-auto flex-1 scrollbar-modern">
                  {userDetailsLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <Loading message="Loading client details..." />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Basic Information */}
                      <div className="bg-gray-50 rounded-lg p-3 sm:p-5 border border-gray-200">
                        <h3 className="text-base sm:text-lg font-semibold text-primary mb-3 sm:mb-4 flex items-center">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Basic Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">First Name</label>
                            <p className="text-sm sm:text-base text-gray-900 bg-white p-2 rounded border break-words">{selectedUserDetails.firstName || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Last Name</label>
                            <p className="text-sm sm:text-base text-gray-900 bg-white p-2 rounded border break-words">{selectedUserDetails.lastName || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Email</label>
                            <p className="text-sm sm:text-base text-gray-900 bg-white p-2 rounded border break-all">{selectedUserDetails.email || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Phone</label>
                            <p className="text-sm sm:text-base text-gray-900 bg-white p-2 rounded border">{selectedUserDetails.phone || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Cell Phone</label>
                            <p className="text-sm sm:text-base text-gray-900 bg-white p-2 rounded border">{selectedUserDetails.cellPhone || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Home Phone</label>
                            <p className="text-sm sm:text-base text-gray-900 bg-white p-2 rounded border">{selectedUserDetails.homePhone || 'Not provided'}</p>
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Address</label>
                            <p className="text-sm sm:text-base text-gray-900 bg-white p-2 rounded border break-words">{selectedUserDetails.address || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">ZIP / Postal Code</label>
                            <p className="text-sm sm:text-base text-gray-900 bg-white p-2 rounded border">{selectedUserDetails.zipCode || selectedUserDetails.zip || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Role</label>
                            <p className="text-sm sm:text-base text-gray-900 bg-white p-2 rounded border capitalize">{selectedUserDetails.role || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Status</label>
                            <div className="bg-white p-2 rounded border">
                              {getStatusBadge(selectedUserDetails.status || 'pending')}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Emergency Contact */}
                      <div className="bg-gray-50 rounded-lg p-3 sm:p-5 border border-gray-200">
                        <h3 className="text-base sm:text-lg font-semibold text-primary mb-3 sm:mb-4 flex items-center">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          Emergency Contact
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          {(selectedUserDetails.emergencyContactFirstName || selectedUserDetails.emergencyContactLastName) && (
                            <>
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">First Name</label>
                                <p className="text-sm sm:text-base text-gray-900 bg-white p-2 rounded border">{selectedUserDetails.emergencyContactFirstName || 'Not provided'}</p>
                              </div>
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Last Name</label>
                                <p className="text-sm sm:text-base text-gray-900 bg-white p-2 rounded border">{selectedUserDetails.emergencyContactLastName || 'Not provided'}</p>
                              </div>
                            </>
                          )}
                          {selectedUserDetails.emergencyContact && (
                            <div className={selectedUserDetails.emergencyContactFirstName ? 'sm:col-span-2' : ''}>
                              <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Contact Info</label>
                              <p className="text-sm sm:text-base text-gray-900 bg-white p-2 rounded border break-words">{selectedUserDetails.emergencyContact}</p>
                            </div>
                          )}
                          {selectedUserDetails.emergencyContactCellPhone && (
                            <div>
                              <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Cell Phone</label>
                              <p className="text-sm sm:text-base text-gray-900 bg-white p-2 rounded border">{selectedUserDetails.emergencyContactCellPhone}</p>
                            </div>
                          )}
                          {selectedUserDetails.emergencyContactHomePhone && (
                            <div>
                              <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Home Phone</label>
                              <p className="text-sm sm:text-base text-gray-900 bg-white p-2 rounded border">{selectedUserDetails.emergencyContactHomePhone}</p>
                            </div>
                          )}
                          {selectedUserDetails.emergencyContactRelationship && (
                            <div className="sm:col-span-2">
                              <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Relationship</label>
                              <p className="text-sm sm:text-base text-gray-900 bg-white p-2 rounded border">{selectedUserDetails.emergencyContactRelationship}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Key Security Information */}
                      {userKeySecurityData && (
                        <div className="bg-gray-50 rounded-lg p-3 sm:p-5 border border-gray-200">
                          <h3 className="text-base sm:text-lg font-semibold text-primary mb-3 sm:mb-4 flex items-center">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                            Key & Security Information
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div>
                              <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Lockbox Code</label>
                              <p className="text-sm sm:text-base text-gray-900 bg-white p-2 rounded border font-mono break-all">{userKeySecurityData.lockboxCode || 'Not provided'}</p>
                            </div>
                            <div>
                              <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Lockbox Location</label>
                              <p className="text-sm sm:text-base text-gray-900 bg-white p-2 rounded border break-words">{userKeySecurityData.lockboxLocation || 'Not provided'}</p>
                            </div>
                            <div>
                              <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Alarm Code (Enter)</label>
                              <p className="text-sm sm:text-base text-gray-900 bg-white p-2 rounded border font-mono break-all">{userKeySecurityData.alarmCodeToEnter || 'Not provided'}</p>
                            </div>
                            <div>
                              <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Alarm Code (Exit)</label>
                              <p className="text-sm sm:text-base text-gray-900 bg-white p-2 rounded border font-mono break-all">{userKeySecurityData.alarmCodeToExit || 'Not provided'}</p>
                            </div>
                            <div>
                              <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Alarm Company</label>
                              <p className="text-sm sm:text-base text-gray-900 bg-white p-2 rounded border break-words">{userKeySecurityData.alarmCompanyName || 'Not provided'}</p>
                            </div>
                            <div>
                              <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Alarm Company Phone</label>
                              <p className="text-sm sm:text-base text-gray-900 bg-white p-2 rounded border">{userKeySecurityData.alarmCompanyPhone || 'Not provided'}</p>
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Home Access List</label>
                              <p className="text-sm sm:text-base text-gray-900 bg-white p-2 rounded border whitespace-pre-wrap break-words">{userKeySecurityData.homeAccessList || 'Not provided'}</p>
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Additional Comments</label>
                              <p className="text-sm sm:text-base text-gray-900 bg-white p-2 rounded border whitespace-pre-wrap break-words">{userKeySecurityData.additionalComments || 'Not provided'}</p>
                            </div>
                            {userKeySecurityData.accessPermissions && (
                              <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-600 mb-2">Access Permissions</label>
                                <div className="bg-white p-3 rounded border">
                                  <div className="flex flex-wrap gap-2">
                                    {Object.entries(userKeySecurityData.accessPermissions)
                                      .filter(([_, value]) => value)
                                      .map(([key]) => (
                                        <span key={key} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                          </svg>
                                          {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                                        </span>
                                      ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Pets Information */}
                      <div className="bg-gray-50 rounded-lg p-3 sm:p-5 border border-gray-200">
                        <h3 className="text-base sm:text-lg font-semibold text-primary mb-3 sm:mb-4 flex items-center">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                          </svg>
                          Registered Pets ({userPets.length})
                        </h3>
                        {userPets.length > 0 ? (
                          <div className="space-y-3 sm:space-y-4">
                            {userPets.map((pet, index) => {
                              const petId = pet._id || pet.id || `pet-${index}`;
                              const currentTab = petTabStates[petId] || 'basic';
                              
                              return (
                                <div key={petId} className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
                                  {/* Pet Header */}
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center">
                                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg mr-2 sm:mr-3 flex-shrink-0">
                                        {pet.name?.charAt(0).toUpperCase() || 'P'}
                                      </div>
                                      <div className="min-w-0">
                                        <h4 className="font-bold text-base sm:text-lg text-gray-900 break-words">{pet.name || 'Unnamed Pet'}</h4>
                                        <p className="text-xs sm:text-sm text-gray-600 break-words">{pet.species || pet.type || 'Unknown'} • {pet.breed || 'Unknown breed'}</p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Tabs */}
                                  <div className="border-b border-gray-200 mb-3">
                                    <div className="flex space-x-4 text-sm">
                                      <button
                                        onClick={() => setPetTabStates(prev => ({ ...prev, [petId]: 'basic' }))}
                                        className={`pb-2 px-1 border-b-2 transition-colors ${
                                          currentTab === 'basic'
                                            ? 'border-primary text-primary font-medium'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                      >
                                        Basic
                                      </button>
                                      <button
                                        onClick={() => setPetTabStates(prev => ({ ...prev, [petId]: 'care' }))}
                                        className={`pb-2 px-1 border-b-2 transition-colors ${
                                          currentTab === 'care'
                                            ? 'border-primary text-primary font-medium'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                      >
                                        Care
                                      </button>
                                      <button
                                        onClick={() => setPetTabStates(prev => ({ ...prev, [petId]: 'medical' }))}
                                        className={`pb-2 px-1 border-b-2 transition-colors ${
                                          currentTab === 'medical'
                                            ? 'border-primary text-primary font-medium'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                      >
                                        Medical
                                      </button>
                                      <button
                                        onClick={() => setPetTabStates(prev => ({ ...prev, [petId]: 'insurance' }))}
                                        className={`pb-2 px-1 border-b-2 transition-colors ${
                                          currentTab === 'insurance'
                                            ? 'border-primary text-primary font-medium'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                      >
                                        Insurance
                                      </button>
                                    </div>
                                  </div>
                                  
                                  {/* Tab Content */}
                                  {currentTab === 'basic' && (
                                    <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                                      <div>
                                        <span className="text-gray-600 font-medium">Type:</span>
                                        <p className="text-gray-900">{pet.type || pet.species || 'N/A'}</p>
                                      </div>
                                      <div>
                                        <span className="text-gray-600 font-medium">Breed:</span>
                                        <p className="text-gray-900 break-words">{pet.breed || 'N/A'}</p>
                                      </div>
                                      <div>
                                        <span className="text-gray-600 font-medium">Colouring:</span>
                                        <p className="text-gray-900">{pet.colouring || 'N/A'}</p>
                                      </div>
                                      <div>
                                        <span className="text-gray-600 font-medium">Gender:</span>
                                        <p className="text-gray-900">{pet.gender || 'Not specified'}</p>
                                      </div>
                                      <div>
                                        <span className="text-gray-600 font-medium">Age:</span>
                                        <p className="text-gray-900">{pet.age ? `${pet.age} years old` : 'N/A'}</p>
                                      </div>
                                      <div>
                                        <span className="text-gray-600 font-medium">Date of Birth:</span>
                                        <p className="text-gray-900">{pet.dateOfBirth || 'Not specified'}</p>
                                      </div>
                                      <div>
                                        <span className="text-gray-600 font-medium">Weight:</span>
                                        <p className="text-gray-900 break-words">{pet.weight || 'N/A'}</p>
                                      </div>
                                      <div>
                                        <span className="text-gray-600 font-medium">Spayed/Neutered:</span>
                                        <p className="text-gray-900">{pet.spayedNeutered || 'Not specified'}</p>
                                      </div>
                                      <div className="col-span-2">
                                        <span className="text-gray-600 font-medium">Microchip Number:</span>
                                        <p className="text-gray-900 font-mono text-xs break-all">{pet.microchipNumber || 'N/A'}</p>
                                      </div>
                                      <div className="col-span-2">
                                        <span className="text-gray-600 font-medium">Rabies Tag Number:</span>
                                        <p className="text-gray-900 font-mono text-xs break-all">{pet.rabiesTagNumber || 'N/A'}</p>
                                      </div>
                                      {pet.allergies && (
                                        <div className="col-span-2">
                                          <span className="text-gray-600 font-medium">Allergies:</span>
                                          <p className="text-gray-900 whitespace-pre-wrap">{pet.allergies}</p>
                                        </div>
                                      )}
                                      {pet.medications && (
                                        <div className="col-span-2">
                                          <span className="text-gray-600 font-medium">Medications:</span>
                                          <p className="text-gray-900 whitespace-pre-wrap">{pet.medications}</p>
                                        </div>
                                      )}
                                      {pet.behaviorNotes && (
                                        <div className="col-span-2">
                                          <span className="text-gray-600 font-medium">Behavior Notes:</span>
                                          <p className="text-gray-900 whitespace-pre-wrap">{pet.behaviorNotes}</p>
                                        </div>
                                      )}
                                      {pet.info && (
                                        <div className="col-span-2">
                                          <span className="text-gray-600 font-medium">Additional Info:</span>
                                          <p className="text-gray-900 whitespace-pre-wrap">{pet.info}</p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  
                                  {currentTab === 'care' && (
                                    <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                                      {pet.careData ? (
                                        <>
                                          {pet.careData.personalityPhobiasPreferences && (
                                            <div>
                                              <span className="text-gray-600 font-medium">Personality, Phobias & Preferences:</span>
                                              <p className="text-gray-900 mt-1 whitespace-pre-wrap break-words">{pet.careData.personalityPhobiasPreferences}</p>
                                            </div>
                                          )}
                                          {pet.careData.typeOfFood && (
                                            <div>
                                              <span className="text-gray-600 font-medium">Type of Food:</span>
                                              <p className="text-gray-900 mt-1 whitespace-pre-wrap break-words">{pet.careData.typeOfFood}</p>
                                            </div>
                                          )}
                                          {pet.careData.dietFoodWaterInstructions && (
                                            <div>
                                              <span className="text-gray-600 font-medium">Diet, Food & Water Instructions:</span>
                                              <p className="text-gray-900 mt-1 whitespace-pre-wrap break-words">{pet.careData.dietFoodWaterInstructions}</p>
                                            </div>
                                          )}
                                          {pet.careData.anyHistoryOfBiting && (
                                            <div>
                                              <span className="text-gray-600 font-medium">History of Biting:</span>
                                              <p className="text-gray-900 mt-1">{pet.careData.anyHistoryOfBiting}</p>
                                            </div>
                                          )}
                                          {pet.careData.locationOfStoredPetFood && (
                                            <div>
                                              <span className="text-gray-600 font-medium">Location of Stored Pet Food:</span>
                                              <p className="text-gray-900 mt-1 whitespace-pre-wrap break-words">{pet.careData.locationOfStoredPetFood}</p>
                                            </div>
                                          )}
                                          {pet.careData.litterBoxLocation && (
                                            <div>
                                              <span className="text-gray-600 font-medium">Litter Box Location:</span>
                                              <p className="text-gray-900 mt-1 whitespace-pre-wrap break-words">{pet.careData.litterBoxLocation}</p>
                                            </div>
                                          )}
                                          {pet.careData.locationOfPetCarrier && (
                                            <div>
                                              <span className="text-gray-600 font-medium">Location of Pet Carrier:</span>
                                              <p className="text-gray-900 mt-1 whitespace-pre-wrap break-words">{pet.careData.locationOfPetCarrier}</p>
                                            </div>
                                          )}
                                          {pet.careData.careInstructions && (
                                            <div>
                                              <span className="text-gray-600 font-medium">Care Instructions:</span>
                                              <p className="text-gray-900 mt-1 whitespace-pre-wrap break-words">{pet.careData.careInstructions}</p>
                                            </div>
                                          )}
                                          {pet.careData.feedingSchedule && (
                                            <div>
                                              <span className="text-gray-600 font-medium">Feeding Schedule:</span>
                                              <p className="text-gray-900 mt-1 whitespace-pre-wrap break-words">{pet.careData.feedingSchedule}</p>
                                            </div>
                                          )}
                                          {pet.careData.exerciseRequirements && (
                                            <div>
                                              <span className="text-gray-600 font-medium">Exercise Requirements:</span>
                                              <p className="text-gray-900 mt-1 whitespace-pre-wrap break-words">{pet.careData.exerciseRequirements}</p>
                                            </div>
                                          )}
                                          {pet.careData.anyAdditionalInfo && (
                                            <div>
                                              <span className="text-gray-600 font-medium">Additional Care Info:</span>
                                              <p className="text-gray-900 mt-1 whitespace-pre-wrap break-words">{pet.careData.anyAdditionalInfo}</p>
                                            </div>
                                          )}
                                          {!pet.careData.personalityPhobiasPreferences && !pet.careData.typeOfFood && 
                                           !pet.careData.dietFoodWaterInstructions && !pet.careData.careInstructions && 
                                           !pet.careData.feedingSchedule && !pet.careData.exerciseRequirements && (
                                            <p className="text-gray-500 text-center py-4">No care information available</p>
                                          )}
                                        </>
                                      ) : (
                                        <>
                                          {pet.careInstructions && (
                                            <div>
                                              <span className="text-gray-600 font-medium">Care Instructions:</span>
                                              <p className="text-gray-900 mt-1 whitespace-pre-wrap break-words">{pet.careInstructions}</p>
                                            </div>
                                          )}
                                          {pet.feedingSchedule && (
                                            <div>
                                              <span className="text-gray-600 font-medium">Feeding Schedule:</span>
                                              <p className="text-gray-900 mt-1 whitespace-pre-wrap break-words">{pet.feedingSchedule}</p>
                                            </div>
                                          )}
                                          {pet.exerciseRequirements && (
                                            <div>
                                              <span className="text-gray-600 font-medium">Exercise Requirements:</span>
                                              <p className="text-gray-900 mt-1 whitespace-pre-wrap break-words">{pet.exerciseRequirements}</p>
                                            </div>
                                          )}
                                          {pet.dietaryRestrictions && (
                                            <div>
                                              <span className="text-gray-600 font-medium">Dietary Restrictions:</span>
                                              <p className="text-gray-900 mt-1 whitespace-pre-wrap break-words">{pet.dietaryRestrictions}</p>
                                            </div>
                                          )}
                                          {!pet.careInstructions && !pet.feedingSchedule && !pet.exerciseRequirements && !pet.dietaryRestrictions && (
                                            <p className="text-gray-500 text-center py-4">No care information available</p>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  )}
                                  
                                  {currentTab === 'medical' && (
                                    <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                                      {pet.medicalData ? (
                                        <div className="space-y-3">
                                          <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                            <div>
                                              <span className="text-gray-600 font-medium">Vet Business Name:</span>
                                              <p className="text-gray-900">{pet.medicalData.vetBusinessName || 'N/A'}</p>
                                            </div>
                                            <div>
                                              <span className="text-gray-600 font-medium">Vet Doctor Name:</span>
                                              <p className="text-gray-900">{pet.medicalData.vetDoctorName || 'N/A'}</p>
                                            </div>
                                            <div className="col-span-2">
                                              <span className="text-gray-600 font-medium">Vet Address:</span>
                                              <p className="text-gray-900 break-words whitespace-pre-wrap">{pet.medicalData.vetAddress || 'N/A'}</p>
                                            </div>
                                            <div>
                                              <span className="text-gray-600 font-medium">Vet Phone Number:</span>
                                              <p className="text-gray-900">{pet.medicalData.vetPhoneNumber || 'N/A'}</p>
                                            </div>
                                            <div>
                                              <span className="text-gray-600 font-medium">Current on Vaccines:</span>
                                              <p className="text-gray-900">{pet.medicalData.currentOnVaccines || 'N/A'}</p>
                                            </div>
                                            {pet.medicalData.onAnyMedication && (
                                              <div className="col-span-2">
                                                <span className="text-gray-600 font-medium">On Any Medication:</span>
                                                <p className="text-gray-900 whitespace-pre-wrap">{pet.medicalData.onAnyMedication}</p>
                                              </div>
                                            )}
                                            {pet.medicalData.rabiesTagNumber && (
                                              <div className="col-span-2">
                                                <span className="text-gray-600 font-medium">Rabies Tag Number:</span>
                                                <p className="text-gray-900 font-mono text-xs">{pet.medicalData.rabiesTagNumber}</p>
                                              </div>
                                            )}
                                          </div>
                                          {pet.vaccinations && (
                                            <div>
                                              <span className="text-gray-600 font-medium">Vaccinations:</span>
                                              <p className="text-gray-900 mt-1 whitespace-pre-wrap">{pet.vaccinations}</p>
                                            </div>
                                          )}
                                        </div>
                                      ) : pet.vetBusinessName || pet.vetDoctorName || pet.currentOnVaccines ? (
                                        <div className="space-y-3">
                                          <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                            {pet.vetBusinessName && (
                                              <div>
                                                <span className="text-gray-600 font-medium">Vet Business:</span>
                                                <p className="text-gray-900">{pet.vetBusinessName}</p>
                                              </div>
                                            )}
                                            {pet.vetDoctorName && (
                                              <div>
                                                <span className="text-gray-600 font-medium">Vet Doctor:</span>
                                                <p className="text-gray-900">{pet.vetDoctorName}</p>
                                              </div>
                                            )}
                                            {pet.currentOnVaccines && (
                                              <div className="col-span-2">
                                                <span className="text-gray-600 font-medium">Vaccinations:</span>
                                                <p className="text-gray-900">{pet.currentOnVaccines}</p>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      ) : (
                                        <p className="text-gray-500 text-center py-4">No medical information available</p>
                                      )}
                                    </div>
                                  )}
                                  
                                  {currentTab === 'insurance' && (
                                    <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                                      {pet.insuranceDetails ? (
                                        <div>
                                          <span className="text-gray-600 font-medium">Insurance Details:</span>
                                          <p className="text-gray-900 mt-1 whitespace-pre-wrap break-words">{pet.insuranceDetails}</p>
                                        </div>
                                      ) : (
                                        <div className="text-center py-4">
                                          <p className="text-gray-500">No insurance information available</p>
                                        </div>
                                      )}
                                      {pet.emergencyContact && (
                                        <div>
                                          <span className="text-gray-600 font-medium">Pet Emergency Contact:</span>
                                          <p className="text-gray-900 mt-1 whitespace-pre-wrap break-words">{pet.emergencyContact}</p>
                                        </div>
                                      )}
                                      {pet.veterinarianInfo && (
                                        <div>
                                          <span className="text-gray-600 font-medium">Veterinarian Info:</span>
                                          <p className="text-gray-900 mt-1 whitespace-pre-wrap break-words">{pet.veterinarianInfo}</p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-8 bg-white rounded-lg border border-dashed border-gray-300">
                            <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <p className="text-gray-600 font-medium">No pets registered</p>
                            <p className="text-gray-500 text-sm mt-1">This client hasn&apos;t added any pets yet</p>
                          </div>
                        )}
                      </div>

                      {/* Key Handling */}
                      {(selectedUserDetails.keyHandlingMethod || selectedUserDetails.superintendentContact || selectedUserDetails.friendNeighbourContact) && (
                        <div className="bg-gray-50 rounded-lg p-3 sm:p-5 border border-gray-200">
                          <h3 className="text-base sm:text-lg font-semibold text-primary mb-3 sm:mb-4 flex items-center">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                            Key Handling
                          </h3>
                          <div className="space-y-3 sm:space-y-4">
                            {selectedUserDetails.keyHandlingMethod && (
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Key Handling Method</label>
                                <p className="text-sm sm:text-base text-gray-900 bg-white p-2 rounded border">{selectedUserDetails.keyHandlingMethod}</p>
                              </div>
                            )}
                            {selectedUserDetails.superintendentContact && (
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Superintendent / Building Management Contact</label>
                                <p className="text-sm sm:text-base text-gray-900 bg-white p-2 rounded border break-words whitespace-pre-wrap">{selectedUserDetails.superintendentContact}</p>
                              </div>
                            )}
                            {selectedUserDetails.friendNeighbourContact && (
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Friend / Neighbour Contact</label>
                                <p className="text-sm sm:text-base text-gray-900 bg-white p-2 rounded border break-words whitespace-pre-wrap">{selectedUserDetails.friendNeighbourContact}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Home Care Information */}
                      {(selectedUserDetails.parkingForSitter || selectedUserDetails.garbageCollectionDay || selectedUserDetails.fuseBoxLocation || 
                        selectedUserDetails.videoSurveillance || selectedUserDetails.cleaningSupplyLocation || selectedUserDetails.broomDustpanLocation || 
                        selectedUserDetails.mailPickUp || selectedUserDetails.waterIndoorPlants || selectedUserDetails.outOfBoundAreas || 
                        selectedUserDetails.additionalHomeCareInfo || selectedUserDetails.homeCareInfo) && (
                        <div className="bg-gray-50 rounded-lg p-3 sm:p-5 border border-gray-200">
                          <h3 className="text-base sm:text-lg font-semibold text-primary mb-3 sm:mb-4 flex items-center">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Home Care Information
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            {selectedUserDetails.parkingForSitter && (
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Parking for Sitter</label>
                                <p className="text-sm sm:text-base text-gray-900 bg-white p-2 rounded border break-words">{selectedUserDetails.parkingForSitter}</p>
                              </div>
                            )}
                            {selectedUserDetails.garbageCollectionDay && (
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Garbage Collection Day</label>
                                <p className="text-sm sm:text-base text-gray-900 bg-white p-2 rounded border">{selectedUserDetails.garbageCollectionDay}</p>
                              </div>
                            )}
                            {selectedUserDetails.fuseBoxLocation && (
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Fuse Box Location</label>
                                <p className="text-sm sm:text-base text-gray-900 bg-white p-2 rounded border break-words">{selectedUserDetails.fuseBoxLocation}</p>
                              </div>
                            )}
                            {selectedUserDetails.videoSurveillance && (
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Video Surveillance</label>
                                <p className="text-sm sm:text-base text-gray-900 bg-white p-2 rounded border">{selectedUserDetails.videoSurveillance}</p>
                              </div>
                            )}
                            {selectedUserDetails.cleaningSupplyLocation && (
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Cleaning Supply Location</label>
                                <p className="text-sm sm:text-base text-gray-900 bg-white p-2 rounded border break-words">{selectedUserDetails.cleaningSupplyLocation}</p>
                              </div>
                            )}
                            {selectedUserDetails.broomDustpanLocation && (
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Broom/Dustpan Location</label>
                                <p className="text-sm sm:text-base text-gray-900 bg-white p-2 rounded border break-words">{selectedUserDetails.broomDustpanLocation}</p>
                              </div>
                            )}
                            {selectedUserDetails.mailPickUp && (
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Mail Pick Up</label>
                                <p className="text-sm sm:text-base text-gray-900 bg-white p-2 rounded border break-words">{selectedUserDetails.mailPickUp}</p>
                              </div>
                            )}
                            {selectedUserDetails.waterIndoorPlants && (
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Water Indoor Plants</label>
                                <p className="text-sm sm:text-base text-gray-900 bg-white p-2 rounded border break-words">{selectedUserDetails.waterIndoorPlants}</p>
                              </div>
                            )}
                            {selectedUserDetails.outOfBoundAreas && (
                              <div className="sm:col-span-2">
                                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Out of Bound Areas</label>
                                <p className="text-sm sm:text-base text-gray-900 bg-white p-2 rounded border break-words whitespace-pre-wrap">{selectedUserDetails.outOfBoundAreas}</p>
                              </div>
                            )}
                            {selectedUserDetails.additionalHomeCareInfo && (
                              <div className="sm:col-span-2">
                                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Additional Home Care Info</label>
                                <p className="text-sm sm:text-base text-gray-900 bg-white p-2 rounded border break-words whitespace-pre-wrap">{selectedUserDetails.additionalHomeCareInfo}</p>
                              </div>
                            )}
                            {selectedUserDetails.homeCareInfo && (
                              <div className="sm:col-span-2">
                                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Legacy Home Care Info</label>
                                <p className="text-sm sm:text-base text-gray-900 bg-white p-2 rounded border break-words whitespace-pre-wrap">{selectedUserDetails.homeCareInfo}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Bookings */}
                      <div className="bg-gray-50 rounded-lg p-3 sm:p-5 border border-gray-200">
                        <h3 className="text-base sm:text-lg font-semibold text-primary mb-3 sm:mb-4 flex items-center">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Bookings ({userBookings.length})
                        </h3>
                        {userBookings.length > 0 ? (
                          <div className="space-y-3">
                            {userBookings.map((booking, idx) => (
                              <div key={booking._id || idx} className="bg-white p-3 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900">{booking.serviceType || 'Service'}</p>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {formatDateTime(booking.startDate)} - {formatDateTime(booking.endDate)}
                                    </p>
                                  </div>
                                  <div className="ml-2">
                                    {getStatusBadge(booking.status || 'pending')}
                                  </div>
                                </div>
                                {booking.sitterId && (
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">Sitter:</span> {typeof booking.sitterId === 'object' ? `${booking.sitterId.firstName} ${booking.sitterId.lastName}` : 'Assigned'}
                                  </p>
                                )}
                                {/* {booking.totalAmount && (
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">Total:</span> ${booking.totalAmount}
                                  </p>
                                )} */}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 bg-white rounded-lg border border-dashed border-gray-300">
                            <svg className="w-10 h-10 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-gray-600 text-sm">No bookings found</p>
                          </div>
                        )}
                      </div>

                      {/* Service Inquiries */}
                      {/* <div className="bg-gray-50 rounded-lg p-3 sm:p-5 border border-gray-200">
                        <h3 className="text-base sm:text-lg font-semibold text-primary mb-3 sm:mb-4 flex items-center">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Service Inquiries ({userServiceInquiries.length})
                        </h3>
                        {userServiceInquiries.length > 0 ? (
                          <div className="space-y-3">
                            {userServiceInquiries.map((inquiry, idx) => (
                              <div key={inquiry._id || idx} className="bg-white p-3 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900">{inquiry.serviceType || 'General Inquiry'}</p>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {inquiry.createdAt ? formatDateTime(inquiry.createdAt) : 'Date not available'}
                                    </p>
                                  </div>
                                  <div className="ml-2">
                                    {getStatusBadge(inquiry.status || 'pending')}
                                  </div>
                                </div>
                                {inquiry.message && (
                                  <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap break-words">
                                    {inquiry.message.length > 150 ? `${inquiry.message.substring(0, 150)}...` : inquiry.message}
                                  </p>
                                )}
                                {inquiry.petTypes && inquiry.petTypes.length > 0 && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    <span className="font-medium">Pets:</span> {inquiry.petTypes.join(', ')}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 bg-white rounded-lg border border-dashed border-gray-300">
                            <svg className="w-10 h-10 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-gray-600 text-sm">No service inquiries found</p>
                          </div>
                        )}
                      </div> */}

                      {/* Legacy Home Care Information */}
                      {selectedUserDetails.homeCareInfo && (
                        <div className="bg-gray-50 rounded-lg p-3 sm:p-5 border border-gray-200">
                          <h3 className="text-base sm:text-lg font-semibold text-primary mb-3 sm:mb-4 flex items-center">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Home Care Information
                          </h3>
                          <p className="text-sm sm:text-base text-gray-900 bg-white p-2 sm:p-3 rounded border whitespace-pre-wrap break-words">{selectedUserDetails.homeCareInfo}</p>
                        </div>
                      )}

                      {/* Account Information */}
                      <div className="bg-gray-50 rounded-lg p-3 sm:p-5 border border-gray-200">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Account Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Created At</label>
                            <p className="text-sm sm:text-base text-gray-900 bg-white p-2 rounded border break-words">
                              {selectedUserDetails.createdAt ? formatDateTime(selectedUserDetails.createdAt) : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">User ID</label>
                            <p className="text-gray-900 bg-white p-2 rounded border font-mono text-xs sm:text-sm break-all">
                              {selectedUserDetails._id || selectedUserDetails.id || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 border-t flex-shrink-0">
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto order-2 sm:order-1"
                    onClick={() => {
                      setIsUserDetailsModalOpen(false);
                      setSelectedUserDetails(null);
                      setUserPets([]);
                      setUserKeySecurityData(null);
                      setPetTabStates({});
                      setUserBookings([]);
                      setUserServiceInquiries([]);
                    }}
                  >
                    Close
                  </Button>
                  <Button 
                    className="bg-primary hover:bg-primary/90 w-full sm:w-auto order-1 sm:order-2"
                    onClick={() => {
                      // Could add functionality to email or contact the client
                      window.location.href = `mailto:${selectedUserDetails.email}`;
                    }}
                  >
                    <svg className="w-4 h-4 mr-2 sm:inline hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Contact Client
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Admin: Bookings Tab */}
          {user?.role === "admin" && activeTab === "bookings" && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>All Bookings ({adminBookings.length})</CardTitle>
                    <CardDescription>
                      View all bookings in the system. All times displayed in Toronto timezone (EST/EDT).
                    </CardDescription>
                  </div>
                  {selectedBookingIds.size > 0 && (
                    <Button
                      variant="destructive"
                      onClick={deleteSelectedBookings}
                      disabled={isDeletingSelectedBookings}
                      className="flex items-center gap-2"
                    >
                      {isDeletingSelectedBookings ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Deleting...
                        </>
                      ) : (
                        <>🗑️ Delete Selected ({selectedBookingIds.size})</>
                      )}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {/* Select All Checkbox */}
                {adminBookings.length > 0 && (
                  <div className="mb-4 flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <input
                      type="checkbox"
                      id="select-all-bookings"
                      checked={selectedBookingIds.size === adminBookings.length && adminBookings.length > 0}
                      onChange={handleSelectAllBookings}
                      className="h-4 w-4 rounded border-gray-300 cursor-pointer"
                    />
                    <label htmlFor="select-all-bookings" className="cursor-pointer text-sm font-medium">
                      Select All ({adminBookings.length} bookings)
                    </label>
                  </div>
                )}

                {/* Search Input */}
                <div className="mb-6">
                  <input
                    type="text"
                    placeholder="Search bookings by client name, service type, status, or sitter..."
                    value={bookingsSearch}
                    onChange={(e) => setBookingsSearch(e.target.value)}
                    className="input-modern w-full"
                  />
                </div>
                <div className="rounded-lg border bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow>
                          <TableHead className="bg-primary/10 text-primary font-bold text-base w-12">
                            <input
                              type="checkbox"
                              checked={selectedBookingIds.size === adminBookings.length && adminBookings.length > 0}
                              onChange={handleSelectAllBookings}
                              className="h-4 w-4 rounded border-gray-300 cursor-pointer"
                            />
                          </TableHead>
                          <TableHead className="bg-primary/10 text-primary font-bold text-base">Client</TableHead>
                          <TableHead className="bg-primary/10 text-primary font-bold text-base">Sitter</TableHead>
                          <TableHead className="bg-primary/10 text-primary font-bold text-base">Service Type</TableHead>
                          <TableHead className="bg-primary/10 text-primary font-bold text-base">Start Date</TableHead>
                          <TableHead className="bg-primary/10 text-primary font-bold text-base">End Date</TableHead>
                          <TableHead className="bg-primary/10 text-primary font-bold text-base">Duration</TableHead>
                          <TableHead className="bg-primary/10 text-primary font-bold text-base">Sitter Payment</TableHead>
                          <TableHead className="bg-primary/10 text-primary font-bold text-base">Status</TableHead>
                          <TableHead className="bg-primary/10 text-primary font-bold text-base">Created At</TableHead>
                          {/* <TableHead className="bg-primary/10 text-primary font-bold text-base">Pets</TableHead> */}
                          <TableHead className="bg-primary/10 text-primary font-bold text-base text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminBookings.length > 0 ? (
                        adminBookings
                          .filter(booking => {
                            const searchTerm = bookingsSearch.toLowerCase();
                            if (!searchTerm) return true;
                            return (
                              `${booking.userId?.firstName || ''} ${booking.userId?.lastName || ''}`.toLowerCase().includes(searchTerm) ||
                              `${booking.sitterId?.firstName || ''} ${booking.sitterId?.lastName || ''}`.toLowerCase().includes(searchTerm) ||
                              (booking.serviceType || '').toLowerCase().includes(searchTerm) ||
                              (booking.status || '').toLowerCase().includes(searchTerm) ||
                              (booking.pets && booking.pets.some((pet: any) => pet.name?.toLowerCase().includes(searchTerm)))
                            );
                          })
                          .sort((a, b) => {
                            const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                            const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                            return bDate - aDate;
                          })
                          .map((booking, index) => (
                          <TableRow key={booking._id || booking.id || `booking-${index}`} className={selectedBookingIds.has(booking._id) ? 'bg-blue-50' : ''}>
                            <TableCell className="w-12">
                              <input
                                type="checkbox"
                                checked={selectedBookingIds.has(booking._id)}
                                onChange={() => handleBookingCheckboxChange(booking._id)}
                                className="h-4 w-4 rounded border-gray-300 cursor-pointer"
                              />
                            </TableCell>
                            <TableCell className="whitespace-nowrap">{booking.userId?.firstName} {booking.userId?.lastName}</TableCell>
                            <TableCell className="whitespace-nowrap">{booking.sitterId?.firstName} {booking.sitterId?.lastName}</TableCell>
                            <TableCell>{booking.serviceType || 'N/A'}</TableCell>
                            <TableCell className="whitespace-nowrap">{booking.startDate ? formatDateTime(booking.startDate) : 'N/A'}</TableCell>
                            <TableCell className="whitespace-nowrap">{booking.endDate ? formatDateTime(booking.endDate) : 'N/A'}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              {booking.startDate && booking.endDate ? (() => {
                                const start = new Date(booking.startDate);
                                const end = new Date(booking.endDate);
                                const diffMs = end.getTime() - start.getTime();
                                const diffHours = diffMs / (1000 * 60 * 60);
                                const diffDays = Math.floor(diffHours / 24);
                                const remainingHours = Math.floor(diffHours % 24);
                                const diffMinutes = Math.floor((diffMs / (1000 * 60)) % 60);
                                
                                if (diffDays > 0) {
                                  return `${diffDays}d ${remainingHours}h ${diffMinutes}m`;
                                } else if (remainingHours > 0) {
                                  return `${remainingHours}h ${diffMinutes}m`;
                                } else {
                                  return `${diffMinutes}m`;
                                }
                              })() : 'N/A'}
                            </TableCell>
                            <TableCell className="whitespace-nowrap font-semibold text-green-700">
                              {booking.startDate && booking.endDate ? (() => {
                                const start = new Date(booking.startDate);
                                const end = new Date(booking.endDate);
                                const diffMs = Math.abs(end.getTime() - start.getTime());
                                const diffMinutes = Math.floor(diffMs / (1000 * 60));
                                
                                console.log(`Admin booking payment calculation: ${diffMinutes} minutes`);
                                
                                if (diffMinutes <= 30) {
                                  return '$20';
                                } else if (diffMinutes <= 45) {
                                  return '$24';
                                } else if (diffMinutes <= 60) {
                                  return '$27';
                                } else {
                                  // For longer durations, calculate hourly rate
                                  const additionalMinutes = diffMinutes - 60;
                                  const additionalHours = Math.ceil(additionalMinutes / 60);
                                  const totalPayment = 27 + (additionalHours * 27);
                                  return `$${totalPayment}`;
                                }
                              })() : 'N/A'}
                            </TableCell>
                            <TableCell>{getStatusBadge ? getStatusBadge(booking.status) : booking.status}</TableCell>
                            <TableCell className="whitespace-nowrap">{booking.createdAt ? formatDateTime(booking.createdAt) : 'N/A'}</TableCell>
                            {/* <TableCell>{booking.pets && booking.pets.length > 0 ? booking.pets.map((pet: any) => pet.name).join(', ') : 'N/A'}</TableCell> */}
                            <TableCell className="text-right">
                              <div className="flex flex-col space-y-2 min-w-[160px]">
                                <div className="flex justify-end gap-2">
                                  {/* Assign sitter dropdown if no sitter assigned or booking is pending */}
                                  {!isSitterAssigned(booking) && adminSitters.length > 0 && (
                                    <div className="relative">
                                      <select 
                                        onChange={e => assignSitter(booking._id, e.target.value)} 
                                        className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 cursor-pointer hover:border-gray-300 min-w-[140px]" 
                                        value={isSitterAssigned(booking) ? (booking.sitterId?._id || booking.sitterId) : ""}
                                      >
                                        <option value="" className="text-gray-500">Select Sitter</option>
                                        {adminSitters.map((sitter) => (
                                          <option key={sitter._id} value={sitter._id} className="text-gray-900">{sitter.firstName} {sitter.lastName}</option>
                                        ))}
                                      </select>
                                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                      </div>
                                    </div>
                                  )}
                                  {/* Unassign button if sitter assigned */}
                                  {isSitterAssigned(booking) && (
                                    <Button variant="outline" size="sm" onClick={() => unassignSitter(booking._id)} className="text-red-600 hover:text-red-700">Unassign Sitter</Button>
                                  )}
                                   {/* Delete Booking button for admin */}
                                   <Button
                                     variant="destructive"
                                     size="sm"
                                     onClick={() => openDeleteBookingDialog(booking)}
                                    //  className="text-red-600 hover:text-red-700 px-4 py-2 font-semibold rounded-lg"
                                   >
                                     Delete
                                   </Button>
                                </div>
                                {/* Status dropdown */}
                                <label className="text-xs text-muted-foreground font-medium mt-1 mb-0.5" htmlFor={`booking-status-${booking._id}`}>Booking Status</label>
                                <div className="relative">
                                  <select 
                                    id={`booking-status-${booking._id}`} 
                                    value={booking.status} 
                                    onChange={e => updateBookingStatus(booking._id, e.target.value)} 
                                    className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 cursor-pointer hover:border-gray-300 w-full"
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                  </select>
                                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </div>
                                </div>
                                {/* Payment status dropdown */}
                                <label className="text-xs text-muted-foreground font-medium mt-2 mb-0.5" htmlFor={`payment-status-${booking._id}`}>Payment Status</label>
                                <div className="relative">
                                  <select 
                                    id={`payment-status-${booking._id}`} 
                                    value={booking.paymentStatus || 'pending'} 
                                    onChange={async e => {
                                      const newStatus = e.target.value;
                                      try {
                                        await api.put(`/bookings/${booking._id}/payment-status`, { paymentStatus: newStatus });
                                        toast({ title: 'Payment status updated', description: `Payment status changed to ${newStatus}` });
                                        // Refresh bookings
                                        const res = await api.get('/bookings');
                                        setAdminBookings(res.data ?? []);
                                      } catch (err: any) {
                                        toast({ title: 'Error', description: err.response?.data?.message || 'Failed to update payment status.' });
                                      }
                                    }} 
                                    className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 cursor-pointer hover:border-gray-300 w-full"
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="partial">Partial</option>
                                    <option value="paid">Paid</option>
                                    <option value="refunded">Refunded</option>
                                  </select>
                                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">No bookings found</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Delete Booking Confirmation Modal */}
          {isDeleteBookingDialogOpen && bookingToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-8 relative animate-fadeIn">
                <h2 className="text-2xl font-bold mb-2 text-red-600">Delete Booking</h2>
                <p className="mb-4 text-gray-700">
                  Are you sure you want to delete this booking?
                </p>
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700 font-semibold">
                        Warning: This action cannot be undone!
                      </p>
                      <p className="text-sm text-red-600 mt-1">
                        This will permanently remove the booking record and its associated scheduling data.
                      </p>
                      <p className="text-sm text-red-600 mt-1">
                        <strong>Service:</strong> {bookingToDelete.service || bookingToDelete.serviceType || 'N/A'}
                      </p>
                      <p className="text-sm text-red-600 mt-1">
                        <strong>Date Range:</strong> {bookingToDelete.startDate || 'N/A'} - {bookingToDelete.endDate || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button 
                    variant="outline" 
                    onClick={handleCancelDeleteBooking} 
                    disabled={isDeletingBooking}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleConfirmDeleteBooking} 
                    disabled={isDeletingBooking}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isDeletingBooking ? 'Deleting...' : 'Delete Booking'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Admin: Address Changes Tab */}
          {user?.role === "admin" && activeTab === "address-changes" && (
            <Card>
              <CardHeader>
                <CardTitle>Address Change Requests ({addressChanges.length})</CardTitle>
                <CardDescription>
                  Review and manage address change requests from clients
                </CardDescription>
              </CardHeader>
              <CardContent>
                {addressChanges.length > 0 ? (
                  <div className="rounded-lg border bg-card">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Client</TableHead>
                          <TableHead>Current Address</TableHead>
                          <TableHead>New Address</TableHead>
                          <TableHead>Requested Date</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {addressChanges.map((change, index) => (
                          <TableRow key={change._id || change.id || `change-${index}`}>
                            <TableCell className="whitespace-nowrap">{change.client?.name}</TableCell>
                            <TableCell>{change.currentAddress}</TableCell>
                            <TableCell>{change.newAddress}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              {change.createdAt ? formatDateTime(change.createdAt) : 'N/A'}
                            </TableCell>
                            <TableCell className="capitalize">{change.status}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-foreground mb-2">No pending address changes</h3>
                    <p className="text-muted-foreground">All address change requests have been processed.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Admin: Pets Tab */}
          {user?.role === "admin" && activeTab === "pets" && (
            <Card>
              <CardHeader>
                <CardTitle>All Pets ({adminPets.length})</CardTitle>
                <CardDescription>
                  View all pets registered in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search Input for Admin Pets Table */}
                <div className="mb-6">
                  <input
                    type="text"
                    placeholder="Search pets by name, type, breed, age, or owner..."
                    value={petSearch}
                    onChange={e => setPetSearch(e.target.value)}
                    className="input-modern w-full"
                  />
                </div>
                <div className="rounded-lg border bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow>
                          <TableHead className="bg-primary/10 text-primary font-bold text-base">Name</TableHead>
                          <TableHead className="bg-primary/10 text-primary font-bold text-base">Type</TableHead>
                          <TableHead className="bg-primary/10 text-primary font-bold text-base">Breed</TableHead>
                          <TableHead className="bg-primary/10 text-primary font-bold text-base">Age</TableHead>
                          <TableHead className="bg-primary/10 text-primary font-bold text-base">Owner</TableHead>
                          <TableHead className="bg-primary/10 text-primary font-bold text-base">Emergency Contact</TableHead>
                          <TableHead className="bg-primary/10 text-primary font-bold text-base">Created At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminPets.length > 0 ? (
                        adminPets
                          .filter(pet => {
                            const searchTerm = (petSearch || "").toLowerCase();
                            if (!searchTerm) return true;
                            return (
                              (pet.name || "").toLowerCase().includes(searchTerm) ||
                              (pet.type || pet.species || "").toLowerCase().includes(searchTerm) ||
                              (pet.breed || "").toLowerCase().includes(searchTerm) ||
                              (pet.age !== undefined && String(pet.age).toLowerCase().includes(searchTerm)) ||
                              (pet.userId?.firstName || "").toLowerCase().includes(searchTerm) ||
                              (pet.userId?.lastName || "").toLowerCase().includes(searchTerm) ||
                              (pet.userId?.email || "").toLowerCase().includes(searchTerm)
                            );
                          })
                          .map((pet, index) => (
                            <TableRow key={pet._id || pet.id || `pet-${index}`}> 
                              <TableCell className="font-medium">{pet.name || 'N/A'}</TableCell>
                              <TableCell>{pet.type || pet.species || 'N/A'}</TableCell>
                              <TableCell>{pet.breed || 'N/A'}</TableCell>
                              <TableCell>{pet.age || 'N/A'}</TableCell>
                              <TableCell>
                                {pet.userId?.firstName} {pet.userId?.lastName} ({pet.userId?.email})
                              </TableCell>
                              <TableCell>{pet.emergencyContact || 'N/A'}</TableCell>
                              <TableCell className="whitespace-nowrap">
                                {pet.createdAt ? formatDateTime(pet.createdAt) : 'N/A'}
                              </TableCell>
                            </TableRow>
                          ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No pets found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sitter: My Users Tab */}
          {user?.role === "sitter" && activeTab === "users" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">My Users</h2>
              <div className="bg-white p-6 rounded-lg border">
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  className="input-modern mb-4 w-full" 
                  value={clientSearch}
                  onChange={e => setClientSearch(e.target.value)}
                />
                <div className="space-y-2">
                  {(clients.filter(c =>
                    c.firstName?.toLowerCase().includes(clientSearch.toLowerCase()) ||
                    c.lastName?.toLowerCase().includes(clientSearch.toLowerCase()) ||
                    c.email?.toLowerCase().includes(clientSearch.toLowerCase())
                  )).map((client) => (
                    <ClientWithPetsRow key={client.id} client={client} />
                  ))}
                </div>
                {clients.length === 0 && (
                  <div className="text-center text-gray-500 py-6">No clients found.</div>
                )}
              </div>
            </div>
          )}

          {/* Sitter: Scheduling Tab */}
          {user?.role === "sitter" && activeTab === "scheduling" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Scheduling</h2>
                <Button onClick={() => router.push('/scheduling')}>
                  Open Full Schedule
                </Button>
              </div>
              <div className="bg-white p-6 rounded-lg border">
                <p className="text-gray-600 mb-4">
                  Manage your schedule and availability here. Click &quot;Open Full Schedule&quot; for the complete calendar view.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    onClick={() => router.push('/scheduling')}
                    className="flex items-center justify-center space-x-2 p-4 h-20"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>My Schedule</span>
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/scheduling')}
                    className="flex items-center justify-center space-x-2 p-4 h-20"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>My Availability</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
          {/* Sitter: Dashboard Bookings Table */}
          {user?.role === "sitter" && activeTab === "dashboard" && (
            <div className="bg-white p-6 rounded-xl border mb-8 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-foreground">My Bookings</h3>
                <Button variant="outline" size="sm" onClick={() => router.push('/bookings')}>View All Bookings</Button>
              </div>
              
              {/* Search and Filter Section */}
              <div className="mb-6 space-y-4">
                {/* Search Input */}
                <input
                  type="text"
                  placeholder="Search bookings by client, location, service, or status..."
                  value={bookingsSearch}
                  onChange={e => setBookingsSearch(e.target.value)}
                  className="input-modern w-full"
                />
                
                {/* Date Range Filter */}
                  <div className="flex items-center gap-4 flex-wrap">
                    {/* From Date Picker - Native Input */}
                    <div className="flex flex-col gap-2 w-48">
                      <Label htmlFor="from-date" className="text-sm font-medium text-gray-700">
                        From Date
                      </Label>
                      <div className="relative">
                        <input
                          type="date"
                          id="from-date"
                          className="input-modern w-full pr-8"
                          value={dateRange.from ? `${dateRange.from.getFullYear()}-${String(dateRange.from.getMonth()+1).padStart(2,'0')}-${String(dateRange.from.getDate()).padStart(2,'0')}` : ""}
                          onChange={e => {
                            if (!e.target.value) {
                              setDateRange(prev => ({ ...prev, from: undefined }));
                              return;
                            }
                            const [y, m, d] = e.target.value.split('-').map(Number);
                            const localDate = new Date(y, (m || 1) - 1, d || 1);
                            localDate.setHours(0, 0, 0, 0);
                            setDateRange(prev => ({ ...prev, from: localDate }));
                          }}
                          min="1900-01-01"
                          max={dateRange.to ? `${dateRange.to.getFullYear()}-${String(dateRange.to.getMonth()+1).padStart(2,'0')}-${String(dateRange.to.getDate()).padStart(2,'0')}` : undefined}
                        />
                        {/* Only calendar icon remains, dropdown chevron removed */}
                      </div>
                    </div>

                    {/* To Date Picker - Native Input */}
                    <div className="flex flex-col gap-2 w-48">
                      <Label htmlFor="to-date" className="text-sm font-medium text-gray-700">
                        To Date
                      </Label>
                      <div className="relative">
                        <input
                          type="date"
                          id="to-date"
                          className="input-modern w-full pr-8"
                          value={dateRange.to ? `${dateRange.to.getFullYear()}-${String(dateRange.to.getMonth()+1).padStart(2,'0')}-${String(dateRange.to.getDate()).padStart(2,'0')}` : ""}
                          onChange={e => {
                            if (!e.target.value) {
                              setDateRange(prev => ({ ...prev, to: undefined }));
                              return;
                            }
                            const [y, m, d] = e.target.value.split('-').map(Number);
                            const localDate = new Date(y, (m || 1) - 1, d || 1);
                            localDate.setHours(23, 59, 59, 999);
                            setDateRange(prev => ({ ...prev, to: localDate }));
                          }}
                          min={dateRange.from ? `${dateRange.from.getFullYear()}-${String(dateRange.from.getMonth()+1).padStart(2,'0')}-${String(dateRange.from.getDate()).padStart(2,'0')}` : "1900-01-01"}
                        />
                        <span className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      setDateRange({ from: today, to: undefined });
                    }}
                    className="h-8 px-2 lg:px-3 text-xs"
                  >
                    Today
                  </Button>
                  
                  {dateRange.to && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        setDateRange({ from: today, to: undefined });
                      }}
                      className="h-8 px-2 lg:px-3 text-xs"
                    >
                      Clear Range
                    </Button>
                  )}
                </div>
              </div>

              <div className="rounded-lg border bg-white">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Sitter Payment</TableHead>
                      <TableHead>Status</TableHead>
                      {/* <TableHead className="text-right">Total</TableHead> */}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      // Filter bookings
                      const filteredBookings = bookings.filter((booking: any) => {
                        // Text search filter
                        const searchTerm = (bookingsSearch || "").toLowerCase();
                        const matchesSearch = !searchTerm || (
                          (booking.userId?.firstName || "").toLowerCase().includes(searchTerm) ||
                          (booking.userId?.lastName || "").toLowerCase().includes(searchTerm) ||
                          (booking.address || booking.userId?.address || "").toLowerCase().includes(searchTerm) ||
                          (booking.serviceType || "").toLowerCase().includes(searchTerm) ||
                          (booking.paymentStatus || "").toLowerCase().includes(searchTerm) ||
                          (booking.notes || "").toLowerCase().includes(searchTerm)
                        );

                        // Date range filter - show only today's bookings if no range is set
                        const matchesDateRange = (() => {
                          if (!booking.startDate) return false;
                          const bookingDate = new Date(booking.startDate);
                          bookingDate.setHours(0, 0, 0, 0);
                          // If both dateRange.from and dateRange.to are set, use range
                          if (dateRange.from && dateRange.to) {
                            const from = new Date(dateRange.from);
                            from.setHours(0, 0, 0, 0);
                            const to = new Date(dateRange.to);
                            to.setHours(23, 59, 59, 999);
                            return bookingDate >= from && bookingDate <= to;
                          }
                          // If only from is set, show bookings for that day only
                          if (dateRange.from && !dateRange.to) {
                            const from = new Date(dateRange.from);
                            from.setHours(0, 0, 0, 0);
                            const to = new Date(from);
                            to.setDate(to.getDate() + 1);
                            to.setHours(0, 0, 0, 0);
                            return bookingDate >= from && bookingDate < to;
                          }
                          // If only to is set, show bookings for that day only
                          if (!dateRange.from && dateRange.to) {
                            const to = new Date(dateRange.to);
                            to.setHours(0, 0, 0, 0);
                            const from = new Date(to);
                            from.setDate(from.getDate() - 1);
                            from.setHours(0, 0, 0, 0);
                            return bookingDate >= from && bookingDate < to;
                          }
                          // If no range, show only today's bookings
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const tomorrow = new Date(today);
                          tomorrow.setDate(tomorrow.getDate() + 1);
                          tomorrow.setHours(0, 0, 0, 0);
                          return bookingDate >= today && bookingDate < tomorrow;
                        })();

                        return matchesSearch && matchesDateRange;
                      });

                      return filteredBookings.length > 0 ? (
                        filteredBookings
                        .sort((a: any, b: any) => {
                          // Sort by booking startDate
                          const aDate = new Date(a.startDate).getTime();
                          const bDate = new Date(b.startDate).getTime();
                          return aDate - bDate;
                        })
                        .map((booking: any) => (
                          <TableRow key={booking._id || booking.id}>
                            <TableCell className="whitespace-nowrap font-medium">{booking.userId?.firstName} {booking.userId?.lastName}</TableCell>
                            <TableCell className="whitespace-nowrap">{booking.address || booking.userId?.address || 'N/A'}</TableCell>
                            <TableCell>
                              <div className="font-semibold text-foreground">{booking.startDate ? formatDateTime(booking.startDate) : 'N/A'}</div>
                              <div className="font-medium text-sm">{booking.serviceType}</div>
                              {booking.notes && <div className="italic text-xs text-muted-foreground mt-1">{booking.notes}</div>}
                              {booking.startDate && booking.endDate && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {formatTimeRangeTZ(booking.startDate, booking.endDate, APP_TIMEZONE)}
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {booking.startDate && booking.endDate ? (() => {
                                const start = new Date(booking.startDate);
                                const end = new Date(booking.endDate);
                                const diffMs = end.getTime() - start.getTime();
                                const diffHours = diffMs / (1000 * 60 * 60);
                                const diffDays = Math.floor(diffHours / 24);
                                const remainingHours = Math.floor(diffHours % 24);
                                const diffMinutes = Math.floor((diffMs / (1000 * 60)) % 60);
                                
                                if (diffDays > 0) {
                                  return `${diffDays}d ${remainingHours}h ${diffMinutes}m`;
                                } else if (remainingHours > 0) {
                                  return `${remainingHours}h ${diffMinutes}m`;
                                } else {
                                  return `${diffMinutes}m`;
                                }
                              })() : 'N/A'}
                            </TableCell>
                            <TableCell className="whitespace-nowrap font-semibold text-green-700">
                              {booking.startDate && booking.endDate ? (() => {
                                const start = new Date(booking.startDate);
                                const end = new Date(booking.endDate);
                                const diffMs = Math.abs(end.getTime() - start.getTime());
                                const diffMinutes = Math.floor(diffMs / (1000 * 60));

                                console.log(`Booking payment calculation: ${diffMinutes} minutes`);
                                
                                if (diffMinutes <= 30) return '$20';
                                if (diffMinutes <= 45) return '$24';
                                if (diffMinutes <= 60) return '$27';

                                // For longer durations, calculate hourly rate
                                const additionalMinutes = diffMinutes - 60;
                                const additionalHours = Math.ceil(additionalMinutes / 60);
                                const totalPayment = 27 + (additionalHours * 27);
                                return `$${totalPayment}`;
                              })() : 'N/A'}
                            </TableCell>
                            <TableCell>
                              {booking.status === 'completed' ? (
                                <Badge variant="default" className="bg-green-600 text-white hover:bg-green-600">Completed</Badge>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={async () => {
                                    try {
                                      await api.put(`/bookings/${booking._id || booking.id}`, {
                                        status: 'completed'
                                      });
                                      toast({
                                        title: 'Success',
                                        description: 'Booking marked as completed',
                                      });
                                      // Refresh bookings
                                      const response = await api.get(`/bookings/sitter/${user?.id}`);
                                      setBookings(response.data || []);
                                    } catch (error) {
                                      console.error('Error completing booking:', error);
                                      toast({
                                        title: 'Error',
                                        description: 'Failed to complete booking',
                                        variant: 'destructive',
                                      });
                                    }
                                  }}
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  Complete
                                </Button>
                              )}
                            </TableCell>
                            {/* <TableCell className="text-right font-mono font-medium">${booking.totalAmount ? booking.totalAmount.toFixed(2) : '--'}</TableCell> */}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <div className="flex flex-col items-center justify-center space-y-3">
                              <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <div className="text-gray-500 font-medium">
                                {bookingsSearch || dateRange.from || dateRange.to 
                                  ? "No bookings found matching your filters." 
                                  : "You don't have any sittings scheduled for today."}
                              </div>
                              {!bookingsSearch && !dateRange.from && !dateRange.to && (
                                <p className="text-sm text-gray-400">Use the date filters above to view bookings from other days.</p>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })()}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          
       

          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="card-modern p-8" data-tour="profile-section">
                <div className="flex items-center space-x-6 mb-6">
                  {/* Use UserAvatar for profile picture */}
                  <UserAvatar user={user} size="lg" className="w-20 h-20 rounded-2xl shadow-lg" />
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-1">{user?.firstName} {user?.lastName}</h3>
                    <p className="text-gray-600 mb-2">{user?.email}</p>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary capitalize">
                      {user?.role}
                    </span>
                  </div>
                </div>
                <Button onClick={() => router.push('/profile')} className="btn-primary">
                  Edit Profile
                </Button>
              </div>
            </div>
          )}

          {activeTab === "pets" && (
            <div className="space-y-8">
                {/* Search Input for Pets */}
                {/* <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search pets by name, species, breed, or age..."
                    value={petSearch}
                    onChange={e => setPetSearch(e.target.value)}
                    className="input-modern w-full"
                  />
                </div> */}
                {pets.length === 0 ? (
                  <div className="text-gray-500">No pets found. <Button onClick={() => router.push('/pets/add')} className="font-semibold">Add Pet</Button></div>
                ) : (
                  pets
                    .filter(pet => {
                      const searchTerm = (petSearch || "").toLowerCase();
                      if (!searchTerm) return true;
                      return (
                        (pet.name || "").toLowerCase().includes(searchTerm) ||
                        (pet.species || "").toLowerCase().includes(searchTerm) ||
                        (pet.breed || "").toLowerCase().includes(searchTerm) ||
                        (pet.age !== undefined && String(pet.age).toLowerCase().includes(searchTerm))
                      );
                    })
                    .map((pet, petIndex) => {
                      const petKey = pet.id || (pet as any)?._id || `pet-${petIndex}`;
                      const tab = petTabs[petKey] || "basic";
                      return (
                        <div key={petKey} className="mb-12">
                      <h2 className="text-5xl font-light mb-8 mt-2">{pet.name}</h2>
                      <div className="border-b border-gray-200 mb-6">
                        <nav className="flex space-x-8">
                          <button
                            onClick={() => setPetTabs((prev) => ({ ...prev, [petKey]: "basic" }))}
                            className={`py-3 px-1 border-b-2 font-medium text-sm ${
                              tab === "basic"
                                ? "border-primary text-primary"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                          >
                            Basic
                          </button>
                          <button
                            onClick={() => setPetTabs((prev) => ({ ...prev, [petKey]: "care" }))}
                            className={`py-3 px-1 border-b-2 font-medium text-sm ${
                              tab === "care"
                                ? "border-primary text-primary"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                          >
                            Care
                          </button>
                          <button
                            onClick={() => setPetTabs((prev) => ({ ...prev, [petKey]: "medical" }))}
                            className={`py-3 px-1 border-b-2 font-medium text-sm ${
                              tab === "medical"
                                ? "border-primary text-primary"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                          >
                            Medical
                          </button>
                        </nav>
                      </div>
                      <div className="bg-white rounded-lg border shadow-sm">
                        {tab === "basic" && (
                          <div className="p-6">
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <div className="text-gray-900">{pet.species || 'N/A'}</div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
                                <div className="text-gray-900">{pet.breed || 'N/A'}</div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                                <div className="text-gray-900">{pet.age ? `${pet.age} years old` : 'N/A'}</div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                                <div className="text-gray-900">{(pet as any)?.weight || 'N/A'}</div>
                              </div>
                            </div>
                          </div>
                        )}
                        {tab === "care" && (
                          <div className="p-6">
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Care Instructions</label>
                                <div className="text-gray-900 bg-gray-50 p-3 rounded-md">
                                  {(pet as any)?.careData?.careInstructions || pet.careInstructions || 'No care instructions available.'}
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Feeding Schedule</label>
                                <div className="text-gray-900 bg-gray-50 p-3 rounded-md">
                                  {(pet as any)?.careData?.feedingSchedule || 'No feeding schedule available.'}
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Exercise Requirements</label>
                                <div className="text-gray-900 bg-gray-50 p-3 rounded-md">
                                  {(pet as any)?.careData?.exerciseRequirements || 'No exercise requirements specified.'}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        {tab === "medical" && (
                          <div className="p-0">
                            <div className="overflow-x-auto">
                              <table className="min-w-full text-left">
                                <tbody className="divide-y divide-gray-200">
                                  <tr className="hover:bg-gray-50">
                                    <td className="py-4 px-6 text-sm font-medium text-gray-700">Vet Business Name</td>
                                    <td className="py-4 px-6 text-sm text-gray-900">{(pet as any)?.medicalData?.vetBusinessName || "Not specified"}</td>
                                  </tr>
                                  <tr className="hover:bg-gray-50">
                                    <td className="py-4 px-6 text-sm font-medium text-gray-700">Vet Doctor Name</td>
                                    <td className="py-4 px-6 text-sm text-gray-900">{(pet as any)?.medicalData?.vetDoctorName || "Not specified"}</td>
                                  </tr>
                                  <tr className="hover:bg-gray-50">
                                    <td className="py-4 px-6 text-sm font-medium text-gray-700">Vet Address</td>
                                    <td className="py-4 px-6 text-sm text-gray-900">{(pet as any)?.medicalData?.vetAddress || "Not specified"}</td>
                                  </tr>
                                  <tr className="hover:bg-gray-50">
                                    <td className="py-4 px-6 text-sm font-medium text-gray-700">Vet Phone Number</td>
                                    <td className="py-4 px-6 text-sm text-gray-900">{(pet as any)?.medicalData?.vetPhoneNumber || "Not specified"}</td>
                                  </tr>
                                  <tr className="hover:bg-gray-50">
                                    <td className="py-4 px-6 text-sm font-medium text-gray-700">Current on Vaccines</td>
                                    <td className="py-4 px-6 text-sm text-gray-900">
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        {(pet as any)?.medicalData?.currentOnVaccines || "Not specified"}
                                      </span>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-gray-200">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push('/pets')}
                          className="px-4 py-2 text-sm font-medium border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={async () => {
                            const petId = (pet as any)?._id || pet.id;
                            if (confirm(`Are you sure you want to delete ${pet.name}? This will also delete all medical and care information.`)) {
                              try {
                                await api.delete(`/pets/${petId}`);
                                toast({
                                  title: "Success",
                                  description: `${pet.name} has been deleted successfully`,
                                });
                                // Refresh the pets data immediately
                                await refreshPetsData();
                              } catch (error) {
                                console.error('Error deleting pet:', error);
                                toast({
                                  title: "Error",
                                  description: "Failed to delete pet",
                                  variant: "destructive",
                                });
                              }
                            }
                          }}
                          className="px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={async () => {
                            const petId = (pet as any)?._id || pet.id;
                            try {
                              const response = await api.get(`/pets/${petId}/profile`);
                              // Create a modal or redirect to view the complete profile
                              alert(`Complete Profile for ${pet.name}:\n\n${JSON.stringify(response.data, null, 2)}`);
                            } catch (error) {
                              console.error('Error fetching pet profile:', error);
                              toast({
                                title: "Error", 
                                description: "Failed to load pet profile",
                                variant: "destructive",
                              });
                            }
                          }}
                          className="px-4 py-2 text-sm font-medium border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Profile Preview
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={async () => {
                            const petId = (pet as any)?._id || pet.id;
                            try {
                              const response = await api.get(`/pets/${petId}/pdf`, {
                                responseType: 'blob'
                              });
                              
                              // Create blob link to download
                              const url = window.URL.createObjectURL(new Blob([response.data]));
                              const link = document.createElement('a');
                              link.href = url;
                              link.setAttribute('download', `pet-profile-${pet.name}.pdf`);
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
                          }}
                          className="px-4 py-2 text-sm font-medium border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          PDF Info Sheet
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
              <Button onClick={() => router.push('/pets/add')} variant="outline" className="mt-4 font-semibold text-lg">Add Pet</Button>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Key Security
                </h2>
                <p className="text-gray-600 mt-2">
                  Manage your home access and security information
                </p>
              </div>
              
              {/* Key Access Section */}
              <Card className="card-modern">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Key Access
                  </CardTitle>
                  <CardDescription>
                    Provide secure access information for your pet sitter
                  </CardDescription>
                </CardHeader>
                <CardContent>
                
                <div className="space-y-4">
                  {/* Lockbox Code */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <label className="text-sm font-medium text-gray-700">
                      Lockbox Code <span className="text-red-500">*</span>
                    </label>
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        value={lockboxCode}
                        onChange={(e) => setLockboxCode(e.target.value)}
                        className="input-modern w-full"
                        placeholder="Enter lockbox code"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        If key is handed via concierge please enter &apos;Key will be with concierge in an envelope C/O Pet Sitter Management&apos; along with sitter name.
                      </p>
                    </div>
                  </div>

                  {/* Lockbox Location */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <label className="text-sm font-medium text-gray-700">Lockbox Location</label>
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        value={lockboxLocation}
                        onChange={(e) => setLockboxLocation(e.target.value)}
                        className="input-modern w-full"
                        placeholder="Describe lockbox location"
                      />
                    </div>
                  </div>

                  {/* Alarm Company Name */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <label className="text-sm font-medium text-gray-700">Alarm Company Name</label>
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        value={alarmCompanyName}
                        onChange={(e) => setAlarmCompanyName(e.target.value)}
                        className="input-modern w-full"
                        placeholder="Enter alarm company name"
                      />
                    </div>
                  </div>

                  {/* Alarm Company Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <label className="text-sm font-medium text-gray-700">Alarm Company Phone</label>
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        value={alarmCompanyPhone}
                        onChange={(e) => setAlarmCompanyPhone(e.target.value)}
                        className="input-modern w-full"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  {/* Alarm Code to Enter */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <label className="text-sm font-medium text-gray-700">Alarm Code to Enter</label>
                    <div className="md:col-span-2">
                      <input
                        type="password"
                        value={alarmCodeToEnter}
                        onChange={(e) => setAlarmCodeToEnter(e.target.value)}
                        className="input-modern w-full"
                        placeholder="Enter alarm code"
                      />
                    </div>
                  </div>

                  {/* Alarm Code to Exit */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <label className="text-sm font-medium text-gray-700">Alarm Code to Exit</label>
                    <div className="md:col-span-2">
                      <input
                        type="password"
                        value={alarmCodeToExit}
                        onChange={(e) => setAlarmCodeToExit(e.target.value)}
                        className="input-modern w-full"
                        placeholder="Enter exit code"
                      />
                    </div>
                  </div>

                  {/* Additional Comments */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    <label className="text-sm font-medium text-gray-700">
                      Additional Comments about key, concierge or alarm.
                    </label>
                    <div className="md:col-span-2">
                      <textarea
                        value={additionalComments}
                        onChange={(e) => setAdditionalComments(e.target.value)}
                        rows={4}
                        className="input-modern w-full resize-none"
                        placeholder="Enter any additional comments..."
                      />
                    </div>
                  </div>
                </div>
                </CardContent>
              </Card>

              {/* Others Who Have Access Section */}
              <Card className="card-modern">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Others Who Have Access To Your Home
                  </CardTitle>
                  <CardDescription>
                    Specify who else has access to your home for emergencies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                
                <div className="space-y-4">
                  {/* Access Checkboxes */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="text-sm font-medium text-gray-700">
                      Please Check Any Or All Who Have Access To Your Home <span className="text-red-500">*</span>
                    </label>
                    <div className="md:col-span-2 space-y-2">
                      {[
                        { key: 'landlord', label: 'Landlord' },
                        { key: 'buildingManagement', label: 'Building Management' },
                        { key: 'superintendent', label: 'Superintendent' },
                        { key: 'housekeeper', label: 'Housekeeper / Cleaner' },
                        { key: 'neighbour', label: 'Neighbour' },
                        { key: 'friend', label: 'Friend' },
                        { key: 'family', label: 'Family' },
                        { key: 'none', label: 'None' }
                      ].map((option) => (
                        <label key={option.key} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={accessPermissions[option.key as keyof typeof accessPermissions]}
                            onChange={(e) => handleAccessPermissionChange(option.key, e.target.checked)}
                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                          />
                          <span className="text-sm text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Home Access List */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    <label className="text-sm font-medium text-gray-700">
                      Please List Name and Phone Number of All Who Have Access to Your Home
                    </label>
                    <div className="md:col-span-2">
                      <textarea
                        value={homeAccessList}
                        onChange={(e) => setHomeAccessList(e.target.value)}
                        rows={4}
                        className="input-modern w-full resize-none"
                        placeholder="Eg. My Mum (Rhoda Smith) - 416-123-4567"
                      />
                    </div>
                  </div>
                </div>
                </CardContent>

                {/* Update Button */}
                <div className="mt-6 flex justify-start px-6 pb-6">
                  <Button
                    onClick={handleUpdateKeySecurity}
                    size="lg"
                    className="button-modern"
                  >
                    Update
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {activeTab === "booking" && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Book Now
                </h2>
                <p className="text-gray-600 mt-2">
                  Schedule your pet care services quickly and easily
                </p>
              </div>

              {/* Profile Incomplete Warning Banner */}
              {user && user.formStatus && user.formStatus !== 'form complete' && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-lg animate-fadeIn">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Profile Incomplete
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          Your profile is not complete. Please fill in all required information in the &quot;My Profile&quot; tab before making a booking.
                        </p>
                      </div>
                      <div className="mt-4">
                        <Button
                          size="sm"
                          className="bg-yellow-600 hover:bg-yellow-700 text-white"
                          onClick={() => router.push('/dashboard?tab=profile')}
                        >
                          Complete Profile Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Addon Booking Section */}
              <Card className="card-modern relative">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add-on Services
                  </CardTitle>
                  <CardDescription>
                    Book additional services like consultations or key management
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    To book Add-ons only, e.g. consultation, key pickup/dropoff, purchase a lockbox, click here:
                  </p>
                  <Button 
                    className="button-modern"
                    onClick={() => setIsAddonModalOpen(true)}
                    disabled
                  >
                    Book Add-on Only
                  </Button>
                </CardContent>

                {/* Coming Soon Overlay */}
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Coming Soon</h3>
                    <p className="text-sm text-gray-600 max-w-md mx-auto">
                      This feature is currently under development and will be available shortly.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Main Booking Section */}
              <Card className="card-modern">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 10V9m6 8V9m0 0a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V9z" />
                    </svg>
                    Pet Care Services
                  </CardTitle>
                  <CardDescription>
                    Book your regular pet visit services
                  </CardDescription>
                </CardHeader>
                <CardContent>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {/* Service Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Service</label>
                    <p className="text-xs text-gray-500 mb-2">Select from drop down</p>
                    <div className="relative">
                      <select 
                        value={bookingFormData.service}
                        onChange={(e) => handleServiceChange(e.target.value)}
                        className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 w-full focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 cursor-pointer hover:border-gray-300"
                      >
                        <option>Pet Sitting 30min - CAD 28</option>
                        <option>Pet Sitting 30min Holiday - CAD 35</option>
                        <option>Pet Sitting 45min - CAD 32</option>
                        <option>Pet Sitting 45min Holiday - CAD 40</option>
                        <option>Pet Sitting 1hr - CAD 35</option>
                        <option>Pet Sitting 1hr Holiday - CAD 46</option>
                        <option>Dog Walking 30min - CAD 28</option>
                        <option>Dog Walking 30min Holiday - CAD 35</option>
                        <option>Dog Walking 45min - CAD 32</option>
                        <option>Dog Walking 45min Holiday - CAD 40</option>
                        <option>Dog Walking 1hr - CAD 35</option>
                        <option>Dog Walking 1hr Holiday - CAD 46</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <p className="text-xs text-gray-500 mb-2">Select Date from drop down</p>
                    <input
                      type="date"
                      value={bookingFormData.startDate}
                      onChange={(e) => setBookingFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="input-modern w-full"
                      min={formatDateLocal(new Date())}
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <p className="text-xs text-gray-500 mb-2">Select Date from drop down</p>
                    <input
                      type="date"
                      value={bookingFormData.endDate}
                      onChange={(e) => setBookingFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="input-modern w-full"
                      min={bookingFormData.startDate || formatDateLocal(new Date())}
                    />
                  </div>
                </div>

                {/* Time Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                    <input
                      type="time"
                      value={bookingFormData.startTime}
                      onChange={(e) => handleTimeChange('startTime', e.target.value)}
                      className="input-modern w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                    <input
                      type="time"
                      value={bookingFormData.endTime}
                      onChange={(e) => handleTimeChange('endTime', e.target.value)}
                      className="input-modern w-full"
                    />
                  </div>
                </div>

                {/* Time Duration Error Message */}
                {timeDurationError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600 font-medium">⚠️ {timeDurationError}</p>
                  </div>
                )}

                <Button 
                  className="button-modern"
                  onClick={checkSitterAvailability}
                  disabled={isCheckingAvailability || !bookingFormData.startDate || !bookingFormData.endDate || !!timeDurationError}
                >
                  {isCheckingAvailability ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Checking Availability...
                    </>
                  ) : (
                    'Check Availability'
                  )}
                </Button>
                </CardContent>
              </Card>

              {/* Other Payments Section */}
              <Card className="card-modern relative">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Other Payments
                  </CardTitle>
                  <CardDescription>
                    Make payments for late bookings, booking changes, etc
                  </CardDescription>
                </CardHeader>
                <CardContent>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="input-modern w-full"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      rows={3}
                      className="input-modern w-full resize-none"
                      disabled
                    />
                  </div>
                </div>

                <Button className="button-modern" disabled>
                  Other Payments
                </Button>
                </CardContent>

                {/* Coming Soon Overlay */}
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Coming Soon</h3>
                    <p className="text-sm text-gray-600 max-w-md mx-auto">
                      This feature is currently under development and will be available shortly.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Assigned Sitters Section */}
              <Card className="card-modern">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    Assigned Sitters
                  </CardTitle>
                  <CardDescription>
                    View and manage your assigned pet care specialists
                  </CardDescription>
                </CardHeader>
                <CardContent>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 text-sm font-medium text-gray-700">Name</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-700">Email</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-700">Phone</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-700">Active Bookings</th>
                        <th className="text-right py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignedSitters.length > 0 ? (
                        assignedSitters.map((sitter, index) => (
                          <tr key={sitter._id || sitter.id || `sitter-${index}`} className="border-b hover:bg-gray-50">
                            <td className="py-3">
                              <div className="flex items-center space-x-3">
                                <UserAvatar user={sitter} size="sm" />
                                <span className="text-green-600 font-medium">
                                  {sitter.firstName} {sitter.lastName}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 text-sm text-gray-600">
                              {sitter.email}
                            </td>
                            <td className="py-3 text-sm text-gray-600">
                              {sitter.phone || sitter.emergencyContact || 'N/A'}
                            </td>
                            <td className="py-3">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                {sitter.activeBookingsCount || 0} booking(s)
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-xs px-3 py-1"
                                  onClick={() => {
                                    setSelectedSitterForDetails(sitter);
                                    setIsSitterDetailsModalOpen(true);
                                  }}
                                >
                                  View Details
                                </Button>
                                <Button 
                                  className="bg-primary text-white text-xs px-3 py-1"
                                  onClick={() => {
                                    setSelectedClient(sitter._id || sitter.id);
                                    setNoteText('');
                                  }}
                                >
                                  Add Note
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-gray-500">
                            No sitters assigned to your bookings yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                </CardContent>
              </Card>

              {/* Add-on Booking Modal */}
              {isAddonModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative animate-fadeIn">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold">Book Add-on Only</h2>
                      <button
                        onClick={() => {
                          setIsAddonModalOpen(false);
                          setSelectedAddonSitter('');
                          setSelectedAddons([]);
                          setAgreedToTerms(false);
                        }}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                      >
                        ×
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Select Sitter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Sitter
                        </label>
                        <div className="relative">
                          <select
                            value={selectedAddonSitter}
                            onChange={(e) => setSelectedAddonSitter(e.target.value)}
                            className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 w-full focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 cursor-pointer hover:border-gray-300"
                          >
                            <option value="">CarolC</option>
                            {assignedSitters.map((sitter) => (
                              <option key={sitter._id || sitter.id} value={sitter._id || sitter.id}>
                                {sitter.firstName} {sitter.lastName}
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Add-ons */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Add-ons
                        </label>
                        <div className="space-y-2">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={selectedAddons.includes('virtual-consultation')}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedAddons([...selectedAddons, 'virtual-consultation']);
                                } else {
                                  setSelectedAddons(selectedAddons.filter(addon => addon !== 'virtual-consultation'));
                                }
                              }}
                              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <span className="text-sm text-gray-700">Virtual Consultation - C$25</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={selectedAddons.includes('in-home-consultation')}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedAddons([...selectedAddons, 'in-home-consultation']);
                                } else {
                                  setSelectedAddons(selectedAddons.filter(addon => addon !== 'in-home-consultation'));
                                }
                              }}
                              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <span className="text-sm text-gray-700">In Home Consultation - C$30</span>
                          </label>
                        </div>
                      </div>

                      {/* Terms and Conditions */}
                      <div>
                        <label className="flex items-start space-x-2">
                          <input
                            type="checkbox"
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary mt-0.5"
                          />
                          <span className="text-sm text-gray-700">
                            I have read and agree to the{' '}
                            <a href="#" className="text-primary underline">
                              Whiskarz Pet Sitters Policies, Terms and Conditions
                            </a>
                          </span>
                        </label>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end space-x-3 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsAddonModalOpen(false);
                            setSelectedAddonSitter('');
                            setSelectedAddons([]);
                            setAgreedToTerms(false);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          disabled={selectedAddons.length === 0 || !agreedToTerms}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => {
                            // Handle checkout logic here
                            console.log('Checkout:', {
                              sitter: selectedAddonSitter,
                              addons: selectedAddons,
                              agreedToTerms
                            });
                            toast({
                              title: "Add-on services booked!",
                              description: `Selected ${selectedAddons.length} service(s)`
                            });
                            setIsAddonModalOpen(false);
                            setSelectedAddonSitter('');
                            setSelectedAddons([]);
                            setAgreedToTerms(false);
                          }}
                        >
                          Checkout
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sitter Availability Results Modal */}
              {showAvailabilityModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 relative animate-fadeIn max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Sitter Availability Results</h2>
                        <p className="text-gray-600 mt-1">
                          Availability for {bookingFormData.service} on {formatDateTime(bookingFormData.startDate)}
                          {bookingFormData.startDate !== bookingFormData.endDate && ` to ${formatDateTime(bookingFormData.endDate)}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          Time: {bookingFormData.startTime} - {bookingFormData.endTime}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setShowAvailabilityModal(false);
                          setAvailabilityResults([]);
                        }}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                      >
                        ×
                      </button>
                    </div>

                    <div className="space-y-4">
                      {availabilityResults.map((result, index) => (
                        <div 
                          key={result.sitter._id || result.sitter.id || index}
                          className={`border rounded-lg p-4 ${
                            result.status === 'available' 
                              ? 'border-green-200 bg-green-50' 
                              : result.status === 'busy' 
                                ? 'border-red-200 bg-red-50'
                                : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              {/* Sitter Avatar */}
                              <UserAvatar user={result.sitter} size="lg" />
                              
                              {/* Sitter Info */}
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {result.sitter.firstName} {result.sitter.lastName}
                                </h3>
                                {/* <p className="text-sm text-gray-600">
                                  {result.sitter.email} • {result.sitter.phone || result.sitter.emergencyContact || 'No phone'}
                                </p> */}
                              </div>
                            </div>

                            {/* Status Badge */}
                            <div className="flex items-center space-x-3">
                              {result.status === 'available' ? (
                                <div className="flex items-center space-x-2">
                                  <div className="flex items-center">
                                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-green-700 font-semibold">Available</span>
                                  </div>
                                  <Button 
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    disabled={isCheckingAvailability}
                                    onClick={() => confirmBooking(result.sitter)}
                                  >
                                    {isCheckingAvailability ? 'Creating...' : 'Book Now'}
                                  </Button>
                                </div>
                              ) : result.status === 'busy' ? (
                                <div className="flex items-center">
                                  <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  <span className="text-red-700 font-semibold">Busy</span>
                                </div>
                              ) : (
                                <div className="flex items-center">
                                  <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                  </svg>
                                  <span className="text-gray-700 font-semibold">Error</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Availability Details */}
                          {result.availability && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              {result.status === 'available' ? (
                                <div className="space-y-2">
                                  <p className="text-sm text-green-700">
                                    ✓ Available for the requested time slot
                                  </p>
                                  {result.availability.workingHours && (
                                    <p className="text-sm text-gray-600">
                                      Working hours: {result.availability.workingHours.startTime} - {result.availability.workingHours.endTime}
                                    </p>
                                  )}
                                  {result.availability.remainingBookings !== undefined && (
                                    <p className="text-sm text-gray-600">
                                      Can take {result.availability.remainingBookings} more booking(s) today
                                    </p>
                                  )}
                                  {result.availability.availableSlots && result.availability.availableSlots.length > 0 && (
                                    <div className="mt-2">
                                      <p className="text-sm text-gray-600 mb-1">Other available time slots:</p>
                                      <div className="flex flex-wrap gap-2">
                                        {result.availability.availableSlots.slice(0, 3).map((slot: any, slotIndex: number) => (
                                          <span 
                                            key={slotIndex}
                                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                          >
                                            {slot.startTime} - {slot.endTime}
                                          </span>
                                        ))}
                                        {result.availability.availableSlots.length > 3 && (
                                          <span className="text-xs text-gray-500">+{result.availability.availableSlots.length - 3} more</span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : result.status === 'busy' && result.availability ? (
                                <div className="space-y-2">
                                  <p className="text-sm text-red-700">
                                    ✗ {result.availability.reason || 'Not available for the requested time'}
                                  </p>
                                  {result.availability.availableSlots && result.availability.availableSlots.length > 0 && (
                                    <div className="mt-2">
                                      <p className="text-sm text-gray-600 mb-1">Available alternative time slots:</p>
                                      <div className="flex flex-wrap gap-2">
                                        {result.availability.availableSlots.slice(0, 3).map((slot: any, slotIndex: number) => (
                                          <span 
                                            key={slotIndex}
                                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                                          >
                                            {slot.startTime} - {slot.endTime}
                                          </span>
                                        ))}
                                        {result.availability.availableSlots.length > 3 && (
                                          <span className="text-xs text-gray-500">+{result.availability.availableSlots.length - 3} more</span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  {result.availability.workingHours && (
                                    <p className="text-sm text-gray-600">
                                      Working hours: {result.availability.workingHours.startTime} - {result.availability.workingHours.endTime}
                                    </p>
                                  )}
                                </div>
                              ) : result.error && (
                                <p className="text-sm text-gray-600">{result.error}</p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}

                      {availabilityResults.length === 0 && (
                        <div className="text-center py-8">
                          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-gray-600">No availability results to show</p>
                        </div>
                      )}
                    </div>

                    {/* Summary */}
                    {availabilityResults.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex space-x-4">
                            <span className="flex items-center">
                              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                              {availabilityResults.filter(r => r.status === 'available').length} Available
                            </span>
                            <span className="flex items-center">
                              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                              {availabilityResults.filter(r => r.status === 'busy').length} Busy
                            </span>
                            <span className="flex items-center">
                              <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
                              {availabilityResults.filter(r => r.status === 'error').length} Error
                            </span>
                          </div>
                          <Button 
                            variant="outline"
                            onClick={() => {
                              setShowAvailabilityModal(false);
                              setAvailabilityResults([]);
                            }}
                          >
                            Close
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Booking Confirmation Modal */}
              {showBookingConfirmModal && selectedSitterForBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                  <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                    {/* Modal Header */}
                    <div className="bg-white border-b border-gray-200 px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 10V9m6 8V9m0 0a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V9z" />
                            </svg>
                          </div>
                          <div>
                            <h2 className="text-xl font-semibold text-gray-900">Confirm Booking</h2>
                            <p className="text-sm text-gray-500">Review your booking details</p>
                          </div>
                        </div>
                        <button
                          onClick={handleCancelBookingConfirm}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Modal Content */}
                    <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-180px)]">
                      {/* Sitter Information */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Pet Sitter</h3>
                        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <UserAvatar user={selectedSitterForBooking} size="lg" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {selectedSitterForBooking.firstName} {selectedSitterForBooking.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{selectedSitterForBooking.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Booking Details */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Booking Details</h3>
                        <div className="bg-gray-50 rounded-lg border border-gray-200 divide-y divide-gray-200">
                          <div className="px-4 py-3 flex justify-between">
                            <span className="text-sm text-gray-600">Service</span>
                            <span className="text-sm font-medium text-gray-900">{bookingFormData.service}</span>
                          </div>
                          <div className="px-4 py-3 flex justify-between">
                            <span className="text-sm text-gray-600">Date</span>
                            <span className="text-sm font-medium text-gray-900">
                              {formatDateTime(bookingFormData.startDate)} to {formatDateTime(bookingFormData.endDate)}
                            </span>
                          </div>
                          <div className="px-4 py-3 flex justify-between">
                            <span className="text-sm text-gray-600">Time</span>
                            <span className="text-sm font-medium text-gray-900">
                              {bookingFormData.startTime} - {bookingFormData.endTime}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Payment Information */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Payment Information</h3>
                        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
                          <p className="text-sm text-gray-700 mb-3">
                            Please send your e-transfer payment to:
                          </p>
                          <div className="bg-white rounded-lg border-2 border-green-500 p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">E-transfer Email</p>
                                  <p className="text-base font-semibold text-green-700">pets@whiskarz.com</p>
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText('pets@whiskarz.com');
                                  toast({
                                    title: 'Copied!',
                                    description: 'Email address copied to clipboard'
                                  });
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                              >
                                Copy
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 mt-3">
                            Payment is required to confirm your booking. Your booking will be pending until payment is received and approved.
                          </p>
                        </div>
                      </div>

                      {/* Important Notes */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Important Information</h3>
                        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                          <ul className="space-y-2 text-sm text-gray-700">
                            <li className="flex items-start">
                              <svg className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span>This will create a new booking with &quot;PENDING&quot; status</span>
                            </li>
                            <li className="flex items-start">
                              <svg className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span>The booking will appear in the admin dashboard for approval</span>
                            </li>
                            <li className="flex items-start">
                              <svg className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span>You will be notified once the booking is approved</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
                      <Button
                        variant="outline"
                        onClick={handleCancelBookingConfirm}
                        className="px-6"
                        disabled={isConfirmingBooking}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleConfirmBookingSubmit}
                        className="bg-primary hover:bg-primary/90 text-white px-6"
                        disabled={isConfirmingBooking}
                      >
                        {isConfirmingBooking ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creating Booking...
                          </>
                        ) : (
                          'Confirm Booking'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "invoices" && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Invoices
                </h2>
                <p className="text-gray-600 mt-2">
                  View and manage your payment history
                </p>
              </div>
              <Card className="card-modern">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Payment History
                  </CardTitle>
                  <CardDescription>
                    Your service booking invoices and payment status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                {user?.role === 'client' ? (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 text-left font-semibold">S.no</th>
                            <th className="px-4 py-2 text-left font-semibold">Visit Date & Time</th>
                            <th className="px-4 py-2 text-left font-semibold">Service</th>
                            <th className="px-4 py-2 text-left font-semibold">Amount</th>
                            <th className="px-4 py-2 text-left font-semibold">Payment Status</th>
                            <th className="px-4 py-2 text-left font-semibold">Payment Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bookings.length > 0 ? (
                            bookings.slice(0, showAllInvoices ? bookings.length : 1).map((booking, idx) => {
                              // Use only available fields from Booking interface
                              const visitDate = booking.date ? new Date(booking.date) : null;
                              const formatDate = (date: Date | null) => date ? date.toLocaleDateString('en-CA', { month: 'short', day: '2-digit', year: 'numeric', timeZone: APP_TIMEZONE }) : 'N/A';
                              const formatDateTime = (date: Date | null) => date ? formatDateTimeTZ(date, APP_TIMEZONE) : '--';
                              // Payment status
                              const paymentStatus = (booking as any).paymentStatus || booking.status || '';
                              const isCompleted = paymentStatus.toLowerCase() === 'completed' || paymentStatus.toLowerCase() === 'complete';
                              // Amount
                              const amount = (booking as any).totalAmount !== undefined ? (booking as any).totalAmount : undefined;
                              // Payment date fallback: use booking.date if no paymentDate
                              const paymentDate = (booking as any).paymentDate ? new Date((booking as any).paymentDate) : (visitDate || null);
                              return (
                                <tr key={booking.id || idx} className="border-b hover:bg-gray-50">
                                  <td className="px-4 py-2 whitespace-nowrap">{booking.id || idx + 1}</td>
                                  <td className="px-4 py-2 whitespace-nowrap">
                                    {visitDate ? formatDate(visitDate) : 'N/A'}
                                  </td>
                                  <td className="px-4 py-2">
                                    {booking.serviceType || 'N/A'}
                                  </td>
                                  <td className="px-4 py-2 font-mono">{amount !== undefined ? `C$${Number(amount).toFixed(2)}` : '--'}</td>
                                  <td className="px-4 py-2">
                                    <span className={`inline-block px-3 py-1 rounded font-semibold ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                      {isCompleted ? 'Completed' : (paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1))}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2">{paymentDate ? formatDateTime(paymentDate) : '--'}</td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={6} className="text-center py-8 text-gray-500">No invoices found.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    {bookings.length > 1 && !showAllInvoices && (
                      <Button onClick={() => setShowAllInvoices(true)} variant="outline" className="mt-4">Load More</Button>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-gray-600 mb-4">Manage your invoices and payments</p>
                    <div className="space-y-3">
                      <Button onClick={() => router.push('/invoices')} className="w-full sm:w-auto">
                        View All Invoices
                      </Button>
                      <Button onClick={() => router.push('/reports')} variant="outline" className="w-full sm:w-auto">
                        View Reports
                      </Button>
                    </div>
                  </>
                )}
                </CardContent>
              </Card>
            </div>
          )}
        </section>

        {/* Overview */}
       
      </main>
    </div>
  );
}

// Main export with Suspense wrapper
export default function DashboardPage() {
  return (
    <Suspense fallback={<Loading message="Loading dashboard..." />}>
      <DashboardContent />
    </Suspense>
  );
}
