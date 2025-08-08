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
import Header from '@/components/Header';
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

      // Submit service inquiry
      const response = await api.post('/service-inquiries', {
        ...formData,
        petTypes: formData.petTypes.join(', ')
      });

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
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col">
      
      <main className="flex-1 container mx-auto max-w-2xl py-8 px-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Pet Service Inquiry
            </CardTitle>
            <CardDescription className="text-gray-600">
              After you fill out this service request, we will contact you to go over details and availability. 
              Thank you for considering Flying Duchess for your pets!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Customer Type */}
              <div className="space-y-2">
                <Label htmlFor="customerType">Are you a new or existing customer? *</Label>
                <Select onValueChange={(value: string) => handleSelectChange('customerType', value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">I am a new customer</SelectItem>
                    <SelectItem value="existing">I am an existing customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Address including unit number and postal code *</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="123 Main St, Unit 4B, Toronto ON M5V 3A1"
                  required
                />
              </div>

              {/* Number of Pets */}
              <div className="space-y-2">
                <Label htmlFor="numberOfPets">Number of pets *</Label>
                <Select onValueChange={(value) => handleSelectChange('numberOfPets', value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select number of pets" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one">One</SelectItem>
                    <SelectItem value="two">Two</SelectItem>
                    <SelectItem value="three-or-more">Three or more</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Pet Types */}
              <div className="space-y-2">
                <Label>Select type of pets *</Label>
                <div className="grid grid-cols-2 gap-2">
                  {petTypeOptions.map((petType) => (
                    <div key={petType} className="flex items-center space-x-2">
                      <Checkbox
                        id={petType}
                        checked={formData.petTypes.includes(petType)}
                        onCheckedChange={(checked) => handlePetTypeChange(petType, checked as boolean)}
                      />
                      <Label htmlFor={petType} className="text-sm">{petType}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Service Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start date of your service *</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End date of your service *</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone number *</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="(416) 555-0123"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              {/* Additional Details */}
              <div className="space-y-2">
                <Label htmlFor="additionalDetails">
                  Additional details such as medication schedules, special care instructions, etc.
                </Label>
                <Textarea
                  id="additionalDetails"
                  name="additionalDetails"
                  rows={4}
                  value={formData.additionalDetails}
                  onChange={handleInputChange}
                  placeholder="Please provide any special care instructions, medication schedules, feeding requirements, or other important details about your pets..."
                />
              </div>



              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  className="flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
