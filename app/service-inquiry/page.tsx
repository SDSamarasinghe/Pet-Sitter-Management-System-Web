'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';

export default function ServiceInquiryPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    customerType: '',
    firstName: '',
    lastName: '',
    address: '',
    numberOfPets: '',
    petTypes: [] as string[],
    startDate: '',
    endDate: '',
    phoneNumber: '',
    email: '',
    additionalDetails: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  // Remove error/success state, use toast instead
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePetTypeChange = (petType: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      petTypes: checked 
        ? [...prev.petTypes, petType]
        : prev.petTypes.filter(type => type !== petType)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // No error/success state

    try {
      // Validate required fields
      if (!formData.customerType || !formData.firstName || !formData.lastName || 
          !formData.address || !formData.numberOfPets || formData.petTypes.length === 0 ||
          !formData.startDate || !formData.endDate || !formData.phoneNumber || !formData.email) {
        toast({
          variant: 'destructive',
          title: 'Validation Error',
          description: 'Please fill in all required fields',
        });
        setIsLoading(false);
        return;
      }

      // Prepare data for API
      const payload = {
        ...formData,
        numberOfPets: Number(formData.numberOfPets),
        petTypes: formData.petTypes, // already an array
      };

      const response = await api.post('/bookings/service-inquiry', payload);

      toast({
        title: 'Service inquiry submitted successfully!',
        description: 'We will contact you soon to discuss details and availability.',
      });
      
      // Reset form
      setFormData({
        customerType: '',
        firstName: '',
        lastName: '',
        address: '',
        numberOfPets: '',
        petTypes: [],
        startDate: '',
        endDate: '',
        phoneNumber: '',
        email: '',
        additionalDetails: '',
      });

    } catch (error: any) {
      console.error('Service inquiry error:', error);
      toast({
        variant: 'destructive',
        title: 'Service inquiry failed',
        description: error.response?.data?.message || error.message || 'Failed to submit service inquiry',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const petTypeOptions = [
    'Cat(s)',
    'Dog(s)',
    'Rabbit(s)',
    'Bird(s)',
    'Guinea pig(s)',
    'Ferret(s)',
    'Other'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <main className="container mx-auto max-w-4xl px-4">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Pet Service Inquiry</h1>
            <p className="text-gray-600">
              After you fill out this service request, we will contact you to go over details and availability. 
              Thank you for considering Whiskarz for your pets!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Customer Information */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Customer Information</h2>
              
              <div className="space-y-2">
                <Label htmlFor="customerType" className="text-sm font-medium text-gray-700">Are you a new or existing customer? *</Label>
                <Select onValueChange={(value: string) => handleSelectChange('customerType', value)} required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select customer type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">I am a new customer</SelectItem>
                    <SelectItem value="existing">I am an existing customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
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
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">Phone number *</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="(416) 555-0123"
                    required
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">E-mail *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    required
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium text-gray-700">Address including unit number and postal code *</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="123 Main St, Unit 4B, Toronto ON M5V 3A1"
                  required
                  className="w-full"
                />
              </div>
            </div>

            {/* Pet Information */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Pet Information</h2>
              
              <div className="space-y-2">
                <Label htmlFor="numberOfPets" className="text-sm font-medium text-gray-700">Number of pets *</Label>
                <Select onValueChange={(value) => handleSelectChange('numberOfPets', value)} required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select number of pets" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">One</SelectItem>
                    <SelectItem value="2">Two</SelectItem>
                    <SelectItem value="3">Three or more</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Select type of pets *</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {petTypeOptions.map((petType) => (
                    <div key={petType} className="flex items-center space-x-2">
                      <Checkbox
                        id={petType}
                        checked={formData.petTypes.includes(petType)}
                        onCheckedChange={(checked) => handlePetTypeChange(petType, checked as boolean)}
                      />
                      <Label htmlFor={petType} className="text-sm font-normal">{petType}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Service Information */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Service Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">Start date of your service *</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-sm font-medium text-gray-700">End date of your service *</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalDetails" className="text-sm font-medium text-gray-700">
                  Additional details such as medication schedules, special care instructions, etc.
                </Label>
                <Textarea
                  id="additionalDetails"
                  name="additionalDetails"
                  rows={4}
                  value={formData.additionalDetails}
                  onChange={handleInputChange}
                  placeholder="Please provide any special care instructions, medication schedules, feeding requirements, or other important details about your pets..."
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex gap-4 justify-center pt-6">
              <Button 
                type="submit" 
                className="w-full max-w-sm bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Submitting...
                  </>
                ) : (
                  'Submit Service Inquiry'
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => router.push('/dashboard')}
                disabled={isLoading}
                className="w-full max-w-sm"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>

        {/* Contact Information Footer */}
        <div className="mt-12 bg-gradient-to-r from-primary/5 to-secondary/10 rounded-xl p-8">
          <div className="text-center space-y-6">
            <h3 className="text-2xl font-bold text-primary">Contact Whiskarz Pet Sitters</h3>
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-2">Phone</h4>
                <p className="text-primary font-medium">+1 (647) 548-8025</p>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-2">Address</h4>
                <p className="text-gray-700">2191 Yonge Street<br />Toronto, ON M4S 3H8</p>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 shadow-sm max-w-md mx-auto">
              <h4 className="font-semibold text-gray-800 mb-2">Service Areas</h4>
              <p className="text-gray-700">Whiskarz, Oshawa, Ajax, Bowmanville & surrounding areas</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
