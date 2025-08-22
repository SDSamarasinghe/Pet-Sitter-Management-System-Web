"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function DogSittingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              🐕 Dog Sitting Services
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
              Premium in-home dog sitting service offering comfort and care in familiar surroundings.
              Your furry friend stays happy and relaxed in their own environment.
            </p>
          </div>
          
          {/* Hero Image */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-gray-100 rounded-lg overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=800&q=80" 
                alt="Happy dog" 
                className="w-full h-80 object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Service Features */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            What's Included in Our Dog Sitting Service
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Feeding & Fresh Water", icon: "🍽️", description: "Regular meals and fresh water according to your schedule" },
              { title: "Exercise & Playtime", icon: "🎾", description: "Active play sessions and exercise to keep your dog happy" },
              { title: "Bathroom Breaks", icon: "🚪", description: "Regular potty breaks and outdoor time" },
              { title: "Medication Administration", icon: "💊", description: "Safe and reliable medication administration if needed" },
              { title: "Lots of Love & Attention", icon: "❤️", description: "Cuddles, pets, and companionship throughout the day" },
              { title: "Daily Updates", icon: "📱", description: "Photos and updates so you know your dog is happy" }
            ].map((feature, idx) => (
              <div key={idx} className="text-center p-6 bg-white rounded-lg shadow-sm">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">Dog Sitting Pricing</h2>
          
          <Card className="max-w-md mx-auto">
            <CardHeader className="bg-primary text-white">
              <CardTitle className="text-2xl">Full Day Dog Sitting</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="text-4xl font-bold text-primary mb-4">Starting at $80</div>
              <p className="text-gray-600 mb-6">Full day in-home care for your dog</p>
              <ul className="text-left text-sm text-gray-600 space-y-2 mb-6">
                <li>✓ 8-10 hours of care</li>
                <li>✓ Multiple walks and potty breaks</li>
                <li>✓ Feeding and fresh water</li>
                <li>✓ Exercise and playtime</li>
                <li>✓ Medication if needed</li>
                <li>✓ Daily photo updates</li>
              </ul>
              <Button 
                className="w-full bg-primary hover:bg-gold-600"
                onClick={() => router.push('/service-inquiry')}
              >
                Book Dog Sitting Service
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Trust Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Why Choose Flying Duchess for Your Dog?
            </h2>
            <p className="text-gray-600">Professional care with the personal touch your dog deserves</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Experienced Dog Care</h4>
                  <p className="text-sm text-gray-600">Our sitters are experienced with dogs of all sizes, ages, and temperaments. We understand dog behavior and provide appropriate care.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Home Environment</h4>
                  <p className="text-sm text-gray-600">Your dog stays comfortable in their familiar environment, reducing stress and anxiety while you're away.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Fully Insured & Bonded</h4>
                  <p className="text-sm text-gray-600">Complete insurance coverage and bonded sitters for your peace of mind and protection.</p>
                </div>
              </div>
            </div>
            <div className="text-center">
              <img 
                src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80" 
                alt="Happy dog with owner" 
                className="w-full max-w-md mx-auto rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
