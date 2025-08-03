'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

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

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    // Validate profilePicture as URL if provided
    if (formData.profilePicture && !/^https?:\/\/.+\..+/.test(formData.profilePicture)) {
      setError('Profile picture must be a valid URL');
      return false;
    }
    // Validate petTypesServiced
    const allowedPetTypes = ['Cat', 'Dog', 'Bird', 'Rabbit'];
    if (formData.petTypesServiced.some((type: string) => !allowedPetTypes.includes(type))) {
      setError('Each value in Pet Types Serviced must be one of: Cat, Dog, Bird, Rabbit');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const { confirmPassword, areasCovered, ...rest } = formData;
      const submitData = {
        ...rest,
        areasCovered: areasCovered.split(',').map(a => a.trim()).filter(Boolean),
        petTypesServiced: formData.petTypesServiced,
      };
      await api.post('/users', submitData);
      setSuccess('Registration successful! Your application is pending approval. You will be notified once approved.');
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
    } catch (error: any) {
      setError(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col">
      {/* Header/Nav */}
      <header className="w-full flex items-center justify-between px-8 py-4 bg-white rounded-b-xl border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xl tracking-tight flex items-center gap-2">
            <span className="inline-block w-6 h-6 bg-black rounded-full mr-1" /> PetPal
          </span>
        </div>
        <nav className="flex items-center gap-4">
          <button className="text-gray-700 hover:text-black text-sm font-medium" onClick={() => router.push('/find-care')}>Find Care</button>
          <button className="text-gray-700 hover:text-black text-sm font-medium" onClick={() => router.push('/service-inquiry')}>Service Inquiry</button>
          <button className="bg-[#5b9cf6] text-white px-5 py-2 rounded-xl font-semibold text-sm shadow hover:bg-[#357ae8]" onClick={() => router.push('/login')}>Log in</button>
          <button className="bg-[#f5f6fa] text-gray-900 px-5 py-2 rounded-xl font-semibold text-sm shadow hover:bg-gray-200" onClick={() => router.push('/signup')}>Sign up</button>
        </nav>
      </header>

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
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert className="mb-4 border-green-400 bg-green-50 text-green-800">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

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
                    <Label htmlFor="profilePicture">Profile Picture URL</Label>
                    <Input id="profilePicture" name="profilePicture" type="text" value={formData.profilePicture} onChange={handleInputChange} placeholder="Cloudinary URL" />
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
                  className="w-full bg-[#5b9cf6] hover:bg-[#357ae8]"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Create Sitter Account'}
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
