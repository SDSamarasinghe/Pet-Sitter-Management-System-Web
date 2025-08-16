'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePetTypeChange = (petType: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      petTypesServiced: checked 
        ? [...prev.petTypesServiced, petType]
        : prev.petTypesServiced.filter(type => type !== petType)
    }));
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
    <div className="min-h-screen bg-gray-50 py-8">
      <main className="container mx-auto max-w-4xl px-4">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Join as a Pet Sitter</h1>
            <p className="text-gray-600">Create your account to start providing pet care services</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Personal Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name *</Label>
                  <Input 
                    id="firstName" 
                    name="firstName" 
                    type="text" 
                    value={formData.firstName} 
                    onChange={handleInputChange} 
                    required 
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name *</Label>
                  <Input 
                    id="lastName" 
                    name="lastName" 
                    type="text" 
                    value={formData.lastName} 
                    onChange={handleInputChange} 
                    required 
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profilePicture" className="text-sm font-medium text-gray-700">Profile Picture</Label>
                  <div className="space-y-2">
                    <input
                      id="profilePicture"
                      name="profilePicture"
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleFileChange}
                      className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
                    />
                    <p className="text-xs text-gray-500">Supported formats: JPEG, PNG, GIF, WebP (max 5MB)</p>
                    {!selectedFile && <p className="text-xs text-gray-400">No file chosen</p>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email *</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    required 
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="extension" className="text-sm font-medium text-gray-700">Extension Number</Label>
                  <Input 
                    id="extension" 
                    name="extension" 
                    type="text" 
                    value={formData.extension} 
                    onChange={handleInputChange} 
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password *</Label>
                  <Input 
                    id="password" 
                    name="password" 
                    type="password" 
                    value={formData.password} 
                    onChange={handleInputChange} 
                    required 
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password *</Label>
                  <Input 
                    id="confirmPassword" 
                    name="confirmPassword" 
                    type="password" 
                    value={formData.confirmPassword} 
                    onChange={handleInputChange} 
                    required 
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Contact Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">Phone Number *</Label>
                  <Input 
                    id="phoneNumber" 
                    name="phoneNumber" 
                    type="tel" 
                    value={formData.phoneNumber} 
                    onChange={handleInputChange} 
                    required 
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cellPhoneNumber" className="text-sm font-medium text-gray-700">Cell Phone Number</Label>
                  <Input 
                    id="cellPhoneNumber" 
                    name="cellPhoneNumber" 
                    type="tel" 
                    value={formData.cellPhoneNumber} 
                    onChange={handleInputChange} 
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="homePhoneNumber" className="text-sm font-medium text-gray-700">Home Phone Number</Label>
                  <Input 
                    id="homePhoneNumber" 
                    name="homePhoneNumber" 
                    type="tel" 
                    value={formData.homePhoneNumber} 
                    onChange={handleInputChange} 
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium text-gray-700">Address *</Label>
                  <Textarea 
                    id="address" 
                    name="address" 
                    value={formData.address} 
                    onChange={handleInputChange} 
                    placeholder="Enter your full address" 
                    required 
                    className="w-full"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode" className="text-sm font-medium text-gray-700">ZIP/Postal Code</Label>
                  <Input 
                    id="zipCode" 
                    name="zipCode" 
                    type="text" 
                    value={formData.zipCode} 
                    onChange={handleInputChange} 
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="areasCovered" className="text-sm font-medium text-gray-700">Areas Covered (ZIP codes, comma separated)</Label>
                  <Input 
                    id="areasCovered" 
                    name="areasCovered" 
                    type="text" 
                    value={formData.areasCovered} 
                    onChange={handleInputChange} 
                    placeholder="e.g. 12345, 67890" 
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact" className="text-sm font-medium text-gray-700">Emergency Contact *</Label>
                  <Input 
                    id="emergencyContact" 
                    name="emergencyContact" 
                    type="text" 
                    value={formData.emergencyContact} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="Name and phone number" 
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Service Information */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Service Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Pet Types Serviced</Label>
                  <div className="space-y-3">
                    {['Cat', 'Dog', 'Bird', 'Rabbit'].map((petType) => (
                      <div key={petType} className="flex items-center space-x-2">
                        <Checkbox
                          id={petType}
                          checked={formData.petTypesServiced.includes(petType)}
                          onCheckedChange={(checked) => handlePetTypeChange(petType, checked as boolean)}
                        />
                        <Label htmlFor={petType} className="text-sm font-normal">{petType}</Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">Hold Ctrl (Windows) or Command (Mac) to select multiple</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="about" className="text-sm font-medium text-gray-700">About</Label>
                  <Textarea 
                    id="about" 
                    name="about" 
                    value={formData.about} 
                    onChange={handleInputChange} 
                    placeholder="Tell us about yourself as a sitter" 
                    className="w-full"
                    rows={4}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="homeCareInfo" className="text-sm font-medium text-gray-700">Home Care Experience & Services *</Label>
                  <Textarea 
                    id="homeCareInfo" 
                    name="homeCareInfo" 
                    value={formData.homeCareInfo} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="Describe your experience with pet care, types of pets you're comfortable with, and services you offer..." 
                    rows={4} 
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerType" className="text-sm font-medium text-gray-700">Customer Type</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, customerType: value }))}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="New" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="existing">Existing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-6">
              <Button 
                type="submit" 
                className="w-full max-w-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
            </div>
          </form>

          <div className="text-center mt-6">
            <span className="text-sm text-gray-700">
              Already have an account?{' '}
              <button 
                onClick={() => router.push('/login')}
                className="text-blue-600 hover:underline font-medium"
              >
                Log in
              </button>
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
