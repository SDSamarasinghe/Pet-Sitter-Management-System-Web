"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { isAuthenticated, getUserFromToken } from "@/lib/auth";
import { useToast } from '@/hooks/use-toast';
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
  // Removed inline message state; using Sonner toast instead
  const router = useRouter();
  const { toast } = useToast();

  // Key Security state (client only)
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
  // Removed standalone key security update button/state (integrated with profile save)

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

        // Fetch Key Security if client
        if (userData.role === 'client') {
          try {
            const keySecRes = await api.get(`/key-security/client/${userData._id}`);
            if (keySecRes.data) {
              const ks = keySecRes.data;
              setLockboxCode(ks.lockboxCode || "");
              setLockboxLocation(ks.lockboxLocation || "");
              setAlarmCompanyName(ks.alarmCompanyName || "");
              setAlarmCompanyPhone(ks.alarmCompanyPhone || "");
              setAlarmCodeToEnter(ks.alarmCodeToEnter || "");
              setAlarmCodeToExit(ks.alarmCodeToExit || "");
              setAdditionalComments(ks.additionalComments || "");
              setHomeAccessList(ks.homeAccessList || "");
              if (ks.accessPermissions) {
                setAccessPermissions(prev => ({ ...prev, ...ks.accessPermissions }));
              }
            }
          } catch (err) {
            // no key security yet; ignore
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({ variant: 'destructive', title: 'Failed to load profile data' });
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
    // Clear any previous notifications handled via toast (no state)

    try {
      // Comprehensive validation for all required fields
      
      // Basic Information validation
      if (!formData.firstName.trim()) {
        toast({ variant: 'destructive', title: 'First Name required', description: 'Please enter your first name.' });
        setIsSaving(false);
        return;
      }
      if (!formData.lastName.trim()) {
        toast({ variant: 'destructive', title: 'Last Name required', description: 'Please enter your last name.' });
        setIsSaving(false);
        return;
      }
      if (!formData.email.trim()) {
        toast({ variant: 'destructive', title: 'Email required', description: 'Please enter your email address.' });
        setIsSaving(false);
        return;
      }
      if (!formData.cellPhoneNumber.trim()) {
        toast({ variant: 'destructive', title: 'Cell Phone required', description: 'Please enter your cell phone number.' });
        setIsSaving(false);
        return;
      }
      if (!formData.homePhoneNumber.trim()) {
        toast({ variant: 'destructive', title: 'Home Phone required', description: 'Please enter your home phone number.' });
        setIsSaving(false);
        return;
      }
      if (!formData.address.trim()) {
        toast({ variant: 'destructive', title: 'Address required', description: 'Please enter your address.' });
        setIsSaving(false);
        return;
      }
      if (!formData.zipCode.trim()) {
        toast({ variant: 'destructive', title: 'ZIP/Postal Code required', description: 'Please enter your ZIP or postal code.' });
        setIsSaving(false);
        return;
      }

      // Client-specific validation
      if (user?.role === 'client') {
        // Emergency Contact validation
        if (!formData.emergencyContactFirstName.trim()) {
          toast({ variant: 'destructive', title: 'Emergency Contact First Name required', description: 'Please enter emergency contact first name.' });
          setIsSaving(false);
          return;
        }
        if (!formData.emergencyContactLastName.trim()) {
          toast({ variant: 'destructive', title: 'Emergency Contact Last Name required', description: 'Please enter emergency contact last name.' });
          setIsSaving(false);
          return;
        }
        if (!formData.emergencyContactCellPhone.trim()) {
          toast({ variant: 'destructive', title: 'Emergency Contact Cell Phone required', description: 'Please enter emergency contact cell phone.' });
          setIsSaving(false);
          return;
        }

        // Key Handling validation
        if (!formData.keyHandlingMethod || formData.keyHandlingMethod === '') {
          toast({ variant: 'destructive', title: 'Key Handling Method required', description: 'Please select a key handling method.' });
          setIsSaving(false);
          return;
        }

        // Home Care Info validation
        if (!formData.parkingForSitter.trim()) {
          toast({ variant: 'destructive', title: 'Parking Information required', description: 'Please provide parking information for sitters.' });
          setIsSaving(false);
          return;
        }
        if (!formData.videoSurveillance.trim()) {
          toast({ variant: 'destructive', title: 'Video Surveillance required', description: 'Please provide video surveillance information.' });
          setIsSaving(false);
          return;
        }
        if (!formData.outOfBoundAreas.trim()) {
          toast({ variant: 'destructive', title: 'Out of Bound Areas required', description: 'Please specify out of bound areas (enter "None" if not applicable).' });
          setIsSaving(false);
          return;
        }
        if (!formData.cleaningSupplyLocation.trim()) {
          toast({ variant: 'destructive', title: 'Cleaning Supply Location required', description: 'Please specify cleaning supply location.' });
          setIsSaving(false);
          return;
        }
        if (!formData.broomDustpanLocation.trim()) {
          toast({ variant: 'destructive', title: 'Broom/Dustpan Location required', description: 'Please specify broom and dustpan location.' });
          setIsSaving(false);
          return;
        }

        // Key Security validation
        if (!lockboxCode.trim()) {
          toast({ variant: 'destructive', title: 'Lockbox Code required', description: 'Please enter a lockbox code in the Key Security section.' });
          setIsSaving(false);
          return;
        }
        
        // Validate at least one access permission is selected
        const hasAccessPermission = Object.values(accessPermissions).some(val => val === true);
        if (!hasAccessPermission) {
          toast({ variant: 'destructive', title: 'Access Permission required', description: 'Please select who else has access to your home in Key Security section.' });
          setIsSaving(false);
          return;
        }
      }

      // Use the new /users/profile endpoint for updates
      const response = await api.put("/users/profile", formData);
      setUser(response.data);
      // Also update Key Security info if client
      if (response.data.role === 'client') {
        try {
          const keySecurityPayload = {
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
          await api.post(`/key-security/client/${response.data._id}`, keySecurityPayload);
          toast({ title: 'Key security updated', description: 'Key security details saved.' });
        } catch (ksErr: any) {
          console.error('Error updating key security during profile save:', ksErr);
          toast({ variant: 'destructive', title: 'Key security update failed', description: ksErr.response?.data?.message || 'Profile saved, but key security failed.' });
        }
      }
      setIsEditing(false);
      toast({ title: 'Profile updated successfully!' });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      const errorMessage = error.response?.data?.message || "Failed to update profile. Please try again.";
      toast({ variant: 'destructive', title: 'Update failed', description: errorMessage });
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
    // No inline message to clear
    setProfilePicturePreview(null);
    setProfilePictureFile(null);

    // Reset Key Security to existing (do not clear user entries unintentionally)
    // (Keeping current state; could refetch if needed)
  };

  // Key Security helpers
  const handleAccessPermissionChange = (permission: string, checked: boolean) => {
    if (permission === 'none' && checked) {
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
      return;
    }
    if (permission !== 'none' && checked) {
      setAccessPermissions(prev => ({ ...prev, [permission]: true, none: false }));
      return;
    }
    setAccessPermissions(prev => ({ ...prev, [permission]: checked }));
  };

  // Removed handleUpdateKeySecurity; key security is saved within handleSave

  // Profile Picture Functions
  const handleProfilePictureSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ variant: 'destructive', title: 'Invalid file', description: 'Please select a valid image file' });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: 'destructive', title: 'Image too large', description: 'Image size should be less than 5MB' });
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
      toast({ title: 'Profile picture updated successfully!' });
      setShowPreviewModal(false);
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      const errorMessage = error.response?.data?.message || 'Failed to upload profile picture';
      toast({ variant: 'destructive', title: 'Upload failed', description: errorMessage });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveProfilePicture = async () => {
    try {
      await api.delete('/users/profile/picture');
      setUser(prev => prev ? { ...prev, profilePicture: undefined } : null);
      toast({ title: 'Profile picture removed successfully!' });
    } catch (error: any) {
      console.error('Error removing profile picture:', error);
      const errorMessage = error.response?.data?.message || 'Failed to remove profile picture';
      toast({ variant: 'destructive', title: 'Removal failed', description: errorMessage });
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
    <div className="min-h-screen bg-gray-50 pb-20 sm:pb-8">
      {/* Header/Nav */}

      <main className="max-w-4xl mx-auto py-6 sm:py-10 px-4 sm:px-6">
        
        {/* Heading + Edit Controls */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Profile Settings</h1>
            <p className="text-sm sm:text-base text-gray-600">Manage your account information and preferences</p>
          </div>
          {!isEditing ? (
            <Button
              type="button"
              onClick={() => setIsEditing(true)}
              className="w-full sm:w-auto shadow-sm h-11 sm:h-10 text-base sm:text-sm"
            >
              Edit Profile
            </Button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="w-full sm:w-auto h-11 sm:h-10 text-base sm:text-sm"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => handleSave()}
                disabled={isSaving}
                className="w-full sm:w-auto h-11 sm:h-10 text-base sm:text-sm"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>

        {/* Inline success/error message box removed; using Sonner toast notifications */}

        <form onSubmit={handleSave}>
          <Card className="shadow-sm">
            <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
              <CardTitle className="text-xl sm:text-2xl">Personal Information</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Update your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-6">
            {/* Profile Picture Section */}
            <div className="border-b pb-4 sm:pb-6">
              <Label className="text-sm sm:text-base font-medium mb-3 sm:mb-4 block">Profile Picture</Label>
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                {/* Current Profile Picture */}
                <div className="relative">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
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
                <div className="flex-1 w-full sm:w-auto">
                  <div className="space-y-2 sm:space-y-3">
                    {profilePictureFile ? (
                      // Show upload/cancel options when file is selected
                      <div className="space-y-2">
                        <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">Selected: {profilePictureFile.name}</p>
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                          <Button 
                            size="sm"
                            onClick={handleProfilePictureUpload}
                            disabled={isUploadingImage}
                            className="w-full sm:w-auto h-10 sm:h-9 text-sm"
                          >
                            {isUploadingImage ? "Uploading..." : "Upload Picture"}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="w-full sm:w-auto h-10 sm:h-9 text-sm"
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
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                          <Button 
                            type="button"
                            size="sm" 
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full sm:w-auto h-10 sm:h-9 text-sm"
                          >
                            Choose Picture
                          </Button>
                          {user?.profilePicture && (
                            <Button 
                              type="button"
                              size="sm" 
                              variant="outline"
                              onClick={handleRemoveProfilePicture}
                              className="w-full sm:w-auto h-10 sm:h-9 text-sm text-red-600 hover:text-red-700"
                            >
                              Remove Picture
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 text-center sm:text-left">
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
                <ModalContent className="max-w-[95vw] sm:max-w-lg">
                  <ModalHeader className="px-4 sm:px-6">
                    <ModalTitle className="text-lg sm:text-xl">Preview Profile Picture</ModalTitle>
                    <ModalDescription className="text-sm">Review the image before uploading. This modal is responsive on mobile and desktop.</ModalDescription>
                  </ModalHeader>
                  <div className="mt-4 flex justify-center px-4 sm:px-6">
                    {profilePicturePreview && (
                      <img src={profilePicturePreview} alt="Profile preview" className="max-h-[40vh] sm:max-h-[48vh] w-auto rounded-lg object-contain" />
                    )}
                  </div>
                  <ModalFooter className="flex-col sm:flex-row gap-2 px-4 sm:px-6">
                    <Button onClick={handleProfilePictureUpload} disabled={isUploadingImage} className="w-full sm:w-auto h-11 sm:h-10 text-base sm:text-sm">
                      {isUploadingImage ? 'Uploading...' : 'Upload Picture'}
                    </Button>
                    <Button variant="outline" className="w-full sm:w-auto h-11 sm:h-10 text-base sm:text-sm" onClick={() => {
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
          <Card className="mt-4 sm:mt-6 shadow-sm">
            <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
              <CardTitle className="text-xl sm:text-2xl">Emergency Contact Information</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Provide emergency contact details in case we need to reach someone on your behalf
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-6">
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
          <Card className="mt-4 sm:mt-6 shadow-sm">
            <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
              <CardTitle className="text-xl sm:text-2xl">Key Handling</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Please select how you would like us to handle your keys
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-6">
              <div>
                <Label htmlFor="keyHandlingMethod">Key Handling Method <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.keyHandlingMethod}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, keyHandlingMethod: value }))}
                  disabled={!isEditing}
                  required
                >
                  <SelectTrigger className="mt-1 w-full bg-white">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Concierge">1. Concierge</SelectItem>
                    <SelectItem value="Lockbox">2. Lockbox</SelectItem>
                    <SelectItem value="Keycafe">3. Keycafe</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-600 mt-2">
                  Keys can be handled via &quot;Concierge&quot; with your keys with your Concierge in an envelope or the sitter to pick up. Keys can also be handled via &quot;Lockbox&quot; provided by us or yourself or you can. If you select the Lockbox option please ensure that your building allows for lockbox set up. Some buildings do not allow lockboxes. &quot;Keycafe&quot; you can rent one of your keys at your local Keycafe for the sitter to pick up (look up www.keycafe.com for more info).
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
          <Card className="mt-4 sm:mt-6 shadow-sm">
            <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
              <CardTitle className="text-xl sm:text-2xl">My Home Care Info</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Provide detailed information about your home for pet sitters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-6">
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

        {/* Key Security Section - Only for Clients */}
        {user?.role === 'client' && (
          <Card className="mt-4 sm:mt-6 shadow-sm">
            <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
              <CardTitle className="text-xl sm:text-2xl">Key Security</CardTitle>
              <CardDescription className="text-sm sm:text-base">Manage access and security information for your home</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-6">
              <div className="space-y-4">
                {/* Lockbox Code */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <Label className="text-sm font-medium">Lockbox Code <span className="text-red-500">*</span></Label>
                  <div className="md:col-span-2">
                    <Input
                      value={lockboxCode}
                      onChange={e => setLockboxCode(e.target.value)}
                      disabled={!isEditing}
                      required
                      placeholder="Enter lockbox code"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">If key is with concierge enter: &quot;Key with concierge in envelope C/O Pet Sitter Management&quot; plus sitter name.</p>
                  </div>
                </div>
                {/* Lockbox Location */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <Label className="text-sm font-medium">Lockbox Location</Label>
                  <div className="md:col-span-2">
                    <Input
                      value={lockboxLocation}
                      onChange={e => setLockboxLocation(e.target.value)}
                      disabled={!isEditing}
                      placeholder="Describe lockbox location"
                      className="mt-1"
                    />
                  </div>
                </div>
                {/* Alarm Company Name */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <Label className="text-sm font-medium">Alarm Company Name</Label>
                  <div className="md:col-span-2">
                    <Input
                      value={alarmCompanyName}
                      onChange={e => setAlarmCompanyName(e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter alarm company name"
                      className="mt-1"
                    />
                  </div>
                </div>
                {/* Alarm Company Phone */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <Label className="text-sm font-medium">Alarm Company Phone</Label>
                  <div className="md:col-span-2">
                    <Input
                      value={alarmCompanyPhone}
                      onChange={e => setAlarmCompanyPhone(e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter phone number"
                      className="mt-1"
                    />
                  </div>
                </div>
                {/* Alarm Code Enter */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <Label className="text-sm font-medium">Alarm Code to Enter</Label>
                  <div className="md:col-span-2">
                    <Input
                      type="password"
                      value={alarmCodeToEnter}
                      onChange={e => setAlarmCodeToEnter(e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter alarm code"
                      className="mt-1"
                    />
                  </div>
                </div>
                {/* Alarm Code Exit */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <Label className="text-sm font-medium">Alarm Code to Exit</Label>
                  <div className="md:col-span-2">
                    <Input
                      type="password"
                      value={alarmCodeToExit}
                      onChange={e => setAlarmCodeToExit(e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter exit code"
                      className="mt-1"
                    />
                  </div>
                </div>
                {/* Additional Comments */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                  <Label className="text-sm font-medium">Additional Comments</Label>
                  <div className="md:col-span-2">
                    <Textarea
                      value={additionalComments}
                      onChange={e => setAdditionalComments(e.target.value)}
                      disabled={!isEditing}
                      rows={3}
                      placeholder="Any extra key, concierge or alarm info"
                      className="mt-1"
                    />
                  </div>
                </div>
                {/* Access Permissions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                  <Label className="text-sm font-medium">Who Else Has Access <span className="text-red-500">*</span></Label>
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
                    ].map(opt => (
                      <label key={opt.key} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          disabled={!isEditing}
                          checked={accessPermissions[opt.key as keyof typeof accessPermissions]}
                          onChange={e => handleAccessPermissionChange(opt.key, e.target.checked)}
                          className="w-4 h-4 text-primary border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {/* Home Access List */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                  <Label className="text-sm font-medium">Names & Phones of Those With Access</Label>
                  <div className="md:col-span-2">
                    <Textarea
                      value={homeAccessList}
                      onChange={e => setHomeAccessList(e.target.value)}
                      disabled={!isEditing}
                      rows={3}
                      placeholder="Eg. Rhoda Smith - 416-123-4567"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
              {/* Standalone update button removed; Save Changes now persists key security */}
            </CardContent>
          </Card>
        )}

        {/* Account Information */}
        <Card className="mt-4 sm:mt-6 mb-6 shadow-sm">
          <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
            <CardTitle className="text-xl sm:text-2xl">Account Information</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Read-only account details
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-6">
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
