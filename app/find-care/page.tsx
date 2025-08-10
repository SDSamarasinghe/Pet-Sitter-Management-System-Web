'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function FindCarePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col">
      
      <main className="flex-1 container mx-auto max-w-4xl py-8 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Pet Care</h1>
          <p className="text-xl text-gray-600">
            Browse our professional pet care services and book the perfect sitter for your furry friends.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Pet Sitting</CardTitle>
              <CardDescription>
                In-home pet sitting services while you're away
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Our experienced sitters will care for your pets in the comfort of your own home.
              </p>
              <Button 
                className="w-full" 
                onClick={() => router.push('/service-inquiry')}
              >
                Book Now
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Dog Walking</CardTitle>
              <CardDescription>
                Regular dog walking services for busy pet owners
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Daily walks to keep your dog healthy, happy, and well-exercised.
              </p>
              <Button 
                className="w-full" 
                onClick={() => router.push('/service-inquiry')}
              >
                Book Now
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Pet Visits</CardTitle>
              <CardDescription>
                Quick check-ins for feeding and companionship
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Perfect for pets who prefer to stay home but need regular care and attention.
              </p>
              <Button 
                className="w-full" 
                onClick={() => router.push('/service-inquiry')}
              >
                Book Now
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Overnight Care</CardTitle>
              <CardDescription>
                24/7 care with overnight stays
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Full-time care with our sitters staying overnight at your home.
              </p>
              <Button 
                className="w-full" 
                onClick={() => router.push('/service-inquiry')}
              >
                Book Now
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Emergency Care</CardTitle>
              <CardDescription>
                Last-minute and emergency pet care services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Available for urgent situations when you need immediate pet care.
              </p>
              <Button 
                className="w-full" 
                onClick={() => router.push('/service-inquiry')}
              >
                Book Now
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Special Needs</CardTitle>
              <CardDescription>
                Specialized care for pets with medical needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Trained sitters for pets requiring medication or special attention.
              </p>
              <Button 
                className="w-full" 
                onClick={() => router.push('/service-inquiry')}
              >
                Book Now
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-6">
            Contact us today to discuss your pet care needs and find the perfect sitter.
          </p>
          <Button 
            size="lg" 
            onClick={() => router.push('/service-inquiry')}
            className="px-8 py-3"
          >
            Request Service Inquiry
          </Button>
        </div>
      </main>
    </div>
  );
}
