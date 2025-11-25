"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function MultiplePetTypesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Multiple Pet Visits</h1>
            <p className="text-lg text-gray-600 mb-4">We provide pet care to households that have a multiple variety of pets types</p>
            <p className="text-lg text-gray-600 mb-8">Choose from a range of services that would fit you and your pets needs.</p>
            
            {/* Hero Image */}
            <div className="mb-8">
              <img 
                src="https://images.unsplash.com/photo-1518715308788-300e1e1e2d4c?w=800&q=80" 
                alt="Multiple pets together" 
                className="w-full max-w-2xl mx-auto h-64 object-cover rounded-lg shadow-lg"
              />
            </div>
            
            <div className="bg-primary/10 rounded-2xl p-6 mb-8">
              <p className="text-gray-700 italic text-lg leading-relaxed">
                &quot;Variety is the spice of life. So whether its two cats and a dog or the other way around or a Bunny, Turtle and Budgie Flying 
                Duchess can sit them all.&quot;
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Button className="bg-primary hover:bg-primary text-white px-6 py-3 rounded-full font-semibold">
                Click Here to Request a Quote
              </Button>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 px-6 py-3 rounded-full font-semibold">
                The Whiskarz Difference
              </Button>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 px-6 py-3 rounded-full font-semibold">
                Listen to a Sample of our Daily Reports
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Booking Request Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Submit Your Booking Request Below</h2>
            <p className="text-lg text-gray-600">And we will get back to you with a quote</p>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
            <p className="text-sm text-gray-700 text-center leading-relaxed">
              Whiskarz is committed to respecting the privacy of individuals and recognizes a need for the appropriate management and protection of any personal information that you agree to provide to us. We will not share 
              your information with any third party outside of our organization, nor will we cross-reference, sell, or otherwise use your information for other purposes.
            </p>
          </div>
          
          <div className="bg-primary/10 rounded-2xl p-8 text-center border border-primary">
            <h3 className="text-2xl font-bold text-primary mb-6">Click Here for our Secure Signup Form</h3>
            <Button 
              className="bg-primary hover:bg-primary text-white px-12 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              onClick={() => router.push('/service-inquiry')}
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
