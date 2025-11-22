"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { isAuthenticated, getUserFromToken } from "@/lib/auth";
import { Loading } from '@/components/ui/loading';
import api from "@/lib/api";
import { Modal, ModalContent, ModalHeader, ModalFooter, ModalTitle, ModalDescription } from '@/components/ui/modal';

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phoneNumber?: string;
  cellPhoneNumber?: string;
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
  profilePicture?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    cellPhoneNumber: "",
    homePhoneNumber: "",
    address: "",
    zipCode: "",
    emergencyContact: "",
    emergencyContactFirstName: "",
    emergencyContactLastName: "",
    emergencyContactCellPhone: "",
    emergencyContactHomePhone: "",
    homeCareInfo: "",
    parkingForSitter: "",
    garbageCollectionDay: "",
    fuseBoxLocation: "",
    outOfBoundAreas: "",
    videoSurveillance: "",
    cleaningSupplyLocation: "",
    broomDustpanLocation: "",
    mailPickUp: "",
    waterIndoorPlants: "",
    additionalHomeCareInfo: "",
    keyHandlingMethod: "Concierge",
    superintendentContact: "",
    friendNeighbourContact: ""
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

      const fetchProfile = async () => {
      try {
        const response = await api.get("/users/profile");
        const userData = response.data;
        setUser(userData);
        setFormData({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || "",
          phoneNumber: userData.phoneNumber || "",
          cellPhoneNumber: userData.cellPhoneNumber || "",
          homePhoneNumber: userData.homePhoneNumber || "",
          address: userData.address || "",
          zipCode: userData.zipCode || "",
          emergencyContact: userData.emergencyContact || "",
          emergencyContactFirstName: userData.emergencyContactFirstName || "",
          emergencyContactLastName: userData.emergencyContactLastName || "",
          emergencyContactCellPhone: userData.emergencyContactCellPhone || "",
          emergencyContactHomePhone: userData.emergencyContactHomePhone || "",
        homeCareInfo: userData.homeCareInfo || "",
        parkingForSitter: userData.parkingForSitter || "",
        garbageCollectionDay: userData.garbageCollectionDay || "",
        fuseBoxLocation: userData.fuseBoxLocation || "",
        outOfBoundAreas: userData.outOfBoundAreas || "",
        videoSurveillance: userData.videoSurveillance || "",
        cleaningSupplyLocation: userData.cleaningSupplyLocation || "",
        broomDustpanLocation: userData.broomDustpanLocation || "",
        mailPickUp: userData.mailPickUp || "",
        waterIndoorPlants: userData.waterIndoorPlants || "",
        additionalHomeCareInfo: userData.additionalHomeCareInfo || "",
        keyHandlingMethod: userData.keyHandlingMethod || "Concierge",
        superintendentContact: userData.superintendentContact || "",
        friendNeighbourContact: userData.friendNeighbourContact || ""
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        setMessage({ type: "error", text: "Failed to load profile data" });
      } finally {
        setIsLoading(false);
      }
    };    fetchProfile();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    try {
      // Use the new /users/profile endpoint for updates
      const response = await api.put("/users/profile", formData);
      setUser(response.data);
      setIsEditing(false);
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      const errorMessage = error.response?.data?.message || "Failed to update profile. Please try again.";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        cellPhoneNumber: user.cellPhoneNumber || "",
        homePhoneNumber: user.homePhoneNumber || "",
        address: user.address || "",
        zipCode: user.zipCode || "",
        emergencyContact: user.emergencyContact || "",
        emergencyContactFirstName: user.emergencyContactFirstName || "",
        emergencyContactLastName: user.emergencyContactLastName || "",
        emergencyContactCellPhone: user.emergencyContactCellPhone || "",
        emergencyContactHomePhone: user.emergencyContactHomePhone || "",
        homeCareInfo: user.homeCareInfo || "",
        parkingForSitter: user.parkingForSitter || "",
        garbageCollectionDay: user.garbageCollectionDay || "",
        fuseBoxLocation: user.fuseBoxLocation || "",
        outOfBoundAreas: user.outOfBoundAreas || "",
        videoSurveillance: user.videoSurveillance || "",
        cleaningSupplyLocation: user.cleaningSupplyLocation || "",
        broomDustpanLocation: user.broomDustpanLocation || "",
        mailPickUp: user.mailPickUp || "",
        waterIndoorPlants: user.waterIndoorPlants || "",
        additionalHomeCareInfo: user.additionalHomeCareInfo || "",
        keyHandlingMethod: user.keyHandlingMethod || "Concierge",
        superintendentContact: user.superintendentContact || "",
        friendNeighbourContact: user.friendNeighbourContact || ""
      });
    }
    setIsEditing(false);
    setMessage({ type: "", text: "" });
    setProfilePicturePreview(null);
    setProfilePictureFile(null);
  };

  // Profile Picture Functions
  const handleProfilePictureSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: "error", text: "Please select a valid image file" });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image size should be less than 5MB" });
      return;
    }

    setProfilePictureFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setProfilePicturePreview(e.target?.result as string);
      setShowPreviewModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleProfilePictureUpload = async () => {
    if (!profilePictureFile) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('profilePicture', profilePictureFile);

      const response = await api.post('/users/profile/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update user state with new profile picture URL
      setUser(prev => prev ? { ...prev, profilePicture: response.data.profilePicture } : null);
      setProfilePicturePreview(null);
      setProfilePictureFile(null);
      setMessage({ type: "success", text: "Profile picture updated successfully!" });
      setShowPreviewModal(false);
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      const errorMessage = error.response?.data?.message || 'Failed to upload profile picture';
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveProfilePicture = async () => {
    try {
      await api.delete('/users/profile/picture');
      setUser(prev => prev ? { ...prev, profilePicture: undefined } : null);
      setMessage({ type: "success", text: "Profile picture removed successfully!" });
    } catch (error: any) {
      console.error('Error removing profile picture:', error);
      const errorMessage = error.response?.data?.message || 'Failed to remove profile picture';
      setMessage({ type: "error", text: errorMessage });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading message="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Nav */}

      <main className="max-w-4xl mx-auto py-10 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : 
            "bg-red-50 text-red-800 border border-red-200"
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave}>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details and contact information
                  </CardDescription>
                </div>
                {!isEditing ? (
                  <Button type="button" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
            {/* Profile Picture Section */}
            <div className="border-b pb-6">
              <Label className="text-base font-medium mb-4 block">Profile Picture</Label>
              <div className="flex items-center space-x-6">
                {/* Current Profile Picture */}
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
                    {profilePicturePreview ? (
                      <img 
                        src={profilePicturePreview} 
                        alt="Profile Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : user?.profilePicture ? (
                      <img 
                        src={user.profilePicture} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-400 text-2xl font-semibold">
                        {user?.firstName?.charAt(0)?.toUpperCase()}{user?.lastName?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload Controls */}
                <div className="flex-1">
                  <div className="space-y-3">
                    {profilePictureFile ? (
                      // Show upload/cancel options when file is selected
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">Selected: {profilePictureFile.name}</p>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm"
                            onClick={handleProfilePictureUpload}
                            disabled={isUploadingImage}
                          >
                            {isUploadingImage ? "Uploading..." : "Upload Picture"}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setProfilePictureFile(null);
                              setProfilePicturePreview(null);
                              if (fileInputRef.current) {
                                fileInputRef.current.value = '';
                              }
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // Show choose file option when no file is selected
                      <div className="space-y-2">
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            Choose Picture
                          </Button>
                          {user?.profilePicture && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={handleRemoveProfilePicture}
                              className="text-red-600 hover:text-red-700"
                            >
                              Remove Picture
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          JPG, PNG or GIF. Max size 5MB.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePictureSelect}
                className="hidden"
              />
              {/* Preview Modal shown when a file is selected */}
              <Modal open={showPreviewModal} onOpenChange={(open) => setShowPreviewModal(open)}>
                <ModalContent>
                  <ModalHeader>
                    <ModalTitle>Preview Profile Picture</ModalTitle>
                    <ModalDescription>Review the image before uploading. This modal is responsive on mobile and desktop.</ModalDescription>
                  </ModalHeader>
                  <div className="mt-4 flex justify-center">
                    {profilePicturePreview && (
                      <img src={profilePicturePreview} alt="Profile preview" className="max-h-[48vh] w-auto rounded-lg object-contain" />
                    )}
                  </div>
                  <ModalFooter>
                    <Button onClick={handleProfilePictureUpload} disabled={isUploadingImage}>
                      {isUploadingImage ? 'Uploading...' : 'Upload Picture'}
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setProfilePictureFile(null);
                      setProfilePicturePreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                      setShowPreviewModal(false);
                    }}>
                      Cancel
                    </Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                required
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cellPhoneNumber">Cell Phone Number <span className="text-red-500">*</span></Label>
                <Input
                  id="cellPhoneNumber"
                  name="cellPhoneNumber"
                  type="tel"
                  value={formData.cellPhoneNumber}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                  placeholder="(416) 555-0123"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="homePhoneNumber">Home Phone Number <span className="text-red-500">*</span></Label>
                <Input
                  id="homePhoneNumber"
                  name="homePhoneNumber"
                  type="tel"
                  value={formData.homePhoneNumber}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                  placeholder="(416) 555-0123"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="address">Address <span className="text-red-500">*</span></Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                  placeholder="Your full address"
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="zipCode">ZIP / Postal Code <span className="text-red-500">*</span></Label>
                <Input
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                  placeholder="M4B 1B3"
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact Section - Only for Clients */}
        {user?.role === 'client' && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Emergency Contact Information</CardTitle>
              <CardDescription>
                Provide emergency contact details in case we need to reach someone on your behalf
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergencyContactFirstName">First Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="emergencyContactFirstName"
                    name="emergencyContactFirstName"
                    value={formData.emergencyContactFirstName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    required
                    placeholder="Emergency contact first name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyContactLastName">Last Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="emergencyContactLastName"
                    name="emergencyContactLastName"
                    value={formData.emergencyContactLastName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    required
                    placeholder="Emergency contact last name"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergencyContactCellPhone">Cell Phone Number <span className="text-red-500">*</span></Label>
                  <Input
                    id="emergencyContactCellPhone"
                    name="emergencyContactCellPhone"
                    type="tel"
                    value={formData.emergencyContactCellPhone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    required
                    placeholder="(416) 555-0123"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyContactHomePhone">Home Phone Number</Label>
                  <Input
                    id="emergencyContactHomePhone"
                    name="emergencyContactHomePhone"
                    type="tel"
                    value={formData.emergencyContactHomePhone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="(416) 555-0123"
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Handling Section - Only for Clients */}
        {user?.role === 'client' && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Key Handling</CardTitle>
              <CardDescription>
                Please select how you would like us to handle your keys
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="keyHandlingMethod">Key Handling Method <span className="text-red-500">*</span></Label>
                <select
                  id="keyHandlingMethod"
                  name="keyHandlingMethod"
                  value={formData.keyHandlingMethod}
                  onChange={(e) => setFormData(prev => ({ ...prev, keyHandlingMethod: e.target.value }))}
                  disabled={!isEditing}
                  required
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Select an option</option>
                  <option value="Concierge">1. Concierge</option>
                  <option value="Lockbox">2. Lockbox</option>
                  <option value="Keycafe">3. Keycafe</option>
                </select>
                <p className="text-sm text-gray-600 mt-2">
                  Keys can be handled via "Concierge" with your keys with your Concierge in an envelope or the sitter to pick up. Keys can also be handled via "Lockbox" provided by us or yourself or you can. If you select the Lockbox option please ensure that your building allows for lockbox set up. Some buildings do not allow lockboxes. "Keycafe" you can rent one of your keys at your local Keycafe for the sitter to pick up (look up www.keycafe.com for more info).
                </p>
              </div>

              <div>
                <Label htmlFor="superintendentContact">Contact for Superintendent / Building Management or Landlord</Label>
                <Textarea
                  id="superintendentContact"
                  name="superintendentContact"
                  value={formData.superintendentContact}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Name and contact information"
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="friendNeighbourContact">Name and contact of Friend or Neighbour if they have access to your home</Label>
                <Textarea
                  id="friendNeighbourContact"
                  name="friendNeighbourContact"
                  value={formData.friendNeighbourContact}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Name and contact information"
                  className="mt-1"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Home Care Information Section - Only for Clients */}
        {user?.role === 'client' && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>My Home Care Info</CardTitle>
              <CardDescription>
                Provide detailed information about your home for pet sitters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="parkingForSitter">Parking for Sitter <span className="text-red-500">*</span></Label>
                  <Input
                    id="parkingForSitter"
                    name="parkingForSitter"
                    value={formData.parkingForSitter}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    required
                    placeholder="e.g., Driveway available"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="garbageCollectionDay">Garbage Collection Day</Label>
                  <Input
                    id="garbageCollectionDay"
                    name="garbageCollectionDay"
                    value={formData.garbageCollectionDay}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="e.g., Thursday"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fuseBoxLocation">Location of Fuse Box/Circuit Breaker</Label>
                  <Input
                    id="fuseBoxLocation"
                    name="fuseBoxLocation"
                    value={formData.fuseBoxLocation}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="e.g., Basement family room"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="videoSurveillance">Video Surveillance <span className="text-red-500">*</span></Label>
                  <Input
                    id="videoSurveillance"
                    name="videoSurveillance"
                    value={formData.videoSurveillance}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    required
                    placeholder="e.g., Front porch"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="outOfBoundAreas">Out of Bound Areas <span className="text-red-500">*</span></Label>
                <Textarea
                  id="outOfBoundAreas"
                  name="outOfBoundAreas"
                  value={formData.outOfBoundAreas}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                  placeholder="Indicate any areas of the home that you do not wish sitter or pets to enter"
                  className="mt-1"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cleaningSupplyLocation">Cleaning Supply Location <span className="text-red-500">*</span></Label>
                  <Input
                    id="cleaningSupplyLocation"
                    name="cleaningSupplyLocation"
                    value={formData.cleaningSupplyLocation}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    required
                    placeholder="e.g., Basement"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="broomDustpanLocation">Broom Dustpan Location <span className="text-red-500">*</span></Label>
                  <Input
                    id="broomDustpanLocation"
                    name="broomDustpanLocation"
                    value={formData.broomDustpanLocation}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    required
                    placeholder="e.g., Basement"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mailPickUp">Mail Pick Up</Label>
                  <Input
                    id="mailPickUp"
                    name="mailPickUp"
                    value={formData.mailPickUp}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="e.g., No or Yes"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="waterIndoorPlants">Water Indoor Plants</Label>
                  <Input
                    id="waterIndoorPlants"
                    name="waterIndoorPlants"
                    value={formData.waterIndoorPlants}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="e.g., No or Yes"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="additionalHomeCareInfo">Any Additional Info</Label>
                <Textarea
                  id="additionalHomeCareInfo"
                  name="additionalHomeCareInfo"
                  value={formData.additionalHomeCareInfo}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Any other important information for pet sitters (alarm codes, special instructions, etc.)"
                  className="mt-1"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Account Information */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Read-only account details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Account Type</Label>
                <div className="mt-1 p-2 bg-gray-50 rounded border">
                  {user?.role || "User"}
                </div>
              </div>
              <div>
                <Label>User ID</Label>
                <div className="mt-1 p-2 bg-gray-50 rounded border font-mono text-sm">
                  {user?._id}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        </form>
      </main>
    </div>
  );
}
