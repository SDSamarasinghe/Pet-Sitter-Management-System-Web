'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { isAuthenticated, getUserRole } from '@/lib/auth';
import api from '@/lib/api';

export default function SignupPage() {
  type FormDataType = {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    cellPhoneNumber: string;
    homePhoneNumber: string;
    address: string;
    zipCode: string;
    areasCovered: string;
    petTypesServiced: string[];
    about: string;
    profilePicture: string;
    extension: string;
    emergencyContact: string;
    homeCareInfo: string;
    customerType: string;
    role: string;
  };

  const [formData, setFormData] = useState<FormDataType>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    cellPhoneNumber: '',
    homePhoneNumber: '',
    address: '',
    zipCode: '',
    areasCovered: '',
    petTypesServiced: [],
    about: '',
    profilePicture: '',
    extension: '',
    emergencyContact: '',
    homeCareInfo: '',
    customerType: 'new',
    role: 'sitter'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated()) {
      const userRole = getUserRole();
      if (userRole === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (name === 'petTypesServiced' && type === 'select-multiple') {
      const options = (e.target as HTMLSelectElement).options;
      const selected: string[] = [];
      for (let i = 0; i < options.length; i++) {
        if (options[i].selected) selected.push(options[i].value);
      }
      setFormData(prev => ({ ...prev, petTypesServiced: selected }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please select a JPEG, PNG, GIF, or WebP image",
        });
        return;
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please select an image smaller than 5MB",
        });
        return;
      }

      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProfilePicture = async (): Promise<string | null> => {
    if (!selectedFile) return null;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      console.log('Uploading to:', `${process.env.NEXT_PUBLIC_API_URL}/upload/profile-picture`);
      
      const response = await api.post('/upload/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Upload response:', response.data);

      if (response.data.success) {
        return response.data.url;
      } else {
        throw new Error('Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.response?.data?.message || 'Failed to upload profile picture',
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Passwords do not match",
      });
      return false;
    }
    if (formData.password.length < 6) {
      toast({
        variant: "destructive",
        title: "Validation Error", 
        description: "Password must be at least 6 characters long",
      });
      return false;
    }
    // Validate petTypesServiced
    const allowedPetTypes = ['Cat', 'Dog', 'Bird', 'Rabbit'];
    if (formData.petTypesServiced.some((type: string) => !allowedPetTypes.includes(type))) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Each value in Pet Types Serviced must be one of: Cat, Dog, Bird, Rabbit",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      // Upload profile picture first if selected
      let profilePictureUrl = '';
      if (selectedFile) {
        console.log('Uploading profile picture...', selectedFile.name);
        profilePictureUrl = await uploadProfilePicture() || '';
        console.log('Profile picture uploaded:', profilePictureUrl);
      }

      const { confirmPassword, areasCovered, ...rest } = formData;
      const submitData = {
        ...rest,
        profilePicture: profilePictureUrl,
        areasCovered: areasCovered.split(',').map(a => a.trim()).filter(Boolean),
        petTypesServiced: formData.petTypesServiced,
      };
      
      console.log('Submitting registration data:', {
        ...submitData,
        password: '[HIDDEN]' // Don't log password
      });
      
      await api.post('/users', submitData);
      
      toast({
        title: "Registration successful!",
        description: "Your application is pending approval. You will be notified once approved.",
      });
      
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        cellPhoneNumber: '',
        homePhoneNumber: '',
        address: '',
        zipCode: '',
        areasCovered: '',
        petTypesServiced: [],
        about: '',
        profilePicture: '',
        extension: '',
        emergencyContact: '',
        homeCareInfo: '',
        customerType: 'new',
        role: 'sitter'
      });
      setSelectedFile(null);
      setPreviewUrl('');
    } catch (error: any) {
      toast({
        variant: "destructive", 
        title: "Registration failed",
        description: error.response?.data?.message || 'Registration failed',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col">

      {/* Signup Form */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center">Join as a Pet Sitter</CardTitle>
              <CardDescription className="text-center">
                Create your account to start providing pet care services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input id="firstName" name="firstName" type="text" value={formData.firstName} onChange={handleInputChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input id="lastName" name="lastName" type="text" value={formData.lastName} onChange={handleInputChange} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <Input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profilePicture">Profile Picture</Label>
                    <div className="space-y-3">
                      <input
                        id="profilePicture"
                        name="profilePicture"
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleFileChange}
                        className="w-full p-3 border border-gray-300 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {previewUrl && (
                        <div className="relative w-32 h-32">
                          <img
                            src={previewUrl}
                            alt="Profile preview"
                            className="w-full h-full object-cover rounded-md border"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedFile(null);
                              setPreviewUrl('');
                              // Reset file input
                              const fileInput = document.getElementById('profilePicture') as HTMLInputElement;
                              if (fileInput) fileInput.value = '';
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      )}
                      <p className="text-sm text-gray-500">
                        Supported formats: JPEG, PNG, GIF, WebP (max 5MB)
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="extension">Extension Number</Label>
                    <Input id="extension" name="extension" type="text" value={formData.extension} onChange={handleInputChange} />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Contact Information</h3>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input id="phoneNumber" name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cellPhoneNumber">Cell Phone Number</Label>
                    <Input id="cellPhoneNumber" name="cellPhoneNumber" type="tel" value={formData.cellPhoneNumber} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="homePhoneNumber">Home Phone Number</Label>
                    <Input id="homePhoneNumber" name="homePhoneNumber" type="tel" value={formData.homePhoneNumber} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Textarea id="address" name="address" value={formData.address} onChange={handleInputChange} placeholder="Enter your full address" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                    <Input id="zipCode" name="zipCode" type="text" value={formData.zipCode} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="areasCovered">Areas Covered (ZIP codes, comma separated)</Label>
                    <Input id="areasCovered" name="areasCovered" type="text" value={formData.areasCovered} onChange={handleInputChange} placeholder="e.g. 12345, 67890" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Emergency Contact *</Label>
                    <Input id="emergencyContact" name="emergencyContact" type="text" value={formData.emergencyContact} onChange={handleInputChange} required placeholder="Name and phone number" />
                  </div>
                </div>

                {/* Sitter Service Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Service Information</h3>
                  <div className="space-y-2">
                    <Label htmlFor="petTypesServiced">Pet Types Serviced</Label>
                    <select
                      id="petTypesServiced"
                      name="petTypesServiced"
                      multiple
                      value={formData.petTypesServiced}
                      onChange={handleInputChange}
                      className="w-full border rounded px-2 py-2"
                    >
                      <option value="Cat">Cat</option>
                      <option value="Dog">Dog</option>
                      <option value="Bird">Bird</option>
                      <option value="Rabbit">Rabbit</option>
                    </select>
                    <span className="text-xs text-gray-500">Hold Ctrl (Windows) or Command (Mac) to select multiple</span>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="about">About</Label>
                    <Textarea id="about" name="about" value={formData.about} onChange={handleInputChange} placeholder="About you as a sitter" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="homeCareInfo">Home Care Experience & Services *</Label>
                    <Textarea id="homeCareInfo" name="homeCareInfo" value={formData.homeCareInfo} onChange={handleInputChange} required placeholder="Describe your experience with pet care, types of pets you're comfortable with, and services you offer..." rows={4} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerType">Customer Type</Label>
                    <select id="customerType" name="customerType" value={formData.customerType} onChange={handleInputChange} className="w-full border rounded px-2 py-2">
                      <option value="new">New</option>
                      <option value="existing">Existing</option>
                    </select>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-[#5b9cf6] hover:bg-[#357ae8] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  disabled={isLoading || isUploading}
                >
                  {isLoading ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      {isUploading ? 'Uploading Image...' : 'Creating Account...'}
                    </>
                  ) : (
                    'Create Sitter Account'
                  )}
                </Button>
              </form>

              <div className="text-center mt-6">
                <span className="text-sm text-gray-700">
                  Already have an account?{' '}
                  <button 
                    onClick={() => router.push('/login')}
                    className="text-[#5b9cf6] hover:underline font-medium"
                  >
                    Log in
                  </button>
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
