"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

const dogSittingOptions = [
  {
    title: "Standard Day Sitting",
    price: "$80",
    duration: "8-10 hrs",
    description: [
      "Full day in-home care",
      "Multiple potty breaks",
      "Feeding & fresh water",
      "Exercise & playtime",
      "Medication if needed"
    ],
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80",
    color: "bg-primary"
  },
  {
    title: "Premium Day Care",
    price: "$120",
    duration: "Full day",
    description: [
      "Extended care 10-12 hours",
      "Multiple walks",
      "Interactive play sessions",
      "Photo & video updates",
      "Special dietary needs"
    ],
    image: "https://images.unsplash.com/photo-1568572933382-74d440642117?w=400&q=80",
    color: "bg-primary",
    special: "top"
  },
  {
    title: "Overnight Sitting",
    price: "$150",
    duration: "24 hrs",
    description: [
      "Overnight care in your home",
      "Evening & morning routines",
      "Constant companionship",
      "Home security checks",
      "Plant & mail service"
    ],
    image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&q=80",
    color: "bg-primary"
  }
];

export default function DogSittingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/10">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary/5 to-secondary/10">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Dog Sitting Services
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Premium in-home dog sitting service offering comfort and care in familiar surroundings.
              Your furry friend stays happy and relaxed in their own environment.
            </p>
          </div>
          
          {/* Hero Image */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-gray-100 rounded-lg overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80" 
                alt="Happy dog" 
                className="w-full h-80 object-cover"
              />
            </div>
          </div>
          
          <p className="text-center text-gray-500 italic mb-8 max-w-2xl mx-auto">
            ~Your dog stays comfortable in their familiar home environment, reducing stress and anxiety while you&apos;re away~
          </p>
        </div>
      </div>

      {/* Service Options */}
      <div className="bg-gradient-to-b from-secondary/5 to-background py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">
            Choose A Service Option
          </h2>
          <p className="text-center text-gray-600 mb-8">That meets your dog&apos;s needs</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dogSittingOptions.map((option) => (
              <Card key={option.title} className="relative overflow-hidden shadow-lg border-0">
                {option.special === 'top' && (
                  <div className="absolute top-2 right-2 bg-accent text-white px-3 py-1 rounded-full text-xs font-bold z-10">
                    POPULAR
                  </div>
                )}
                
                <div className="relative">
                  <img 
                    src={option.image} 
                    alt={option.title} 
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent h-16"></div>
                </div>
                
                <CardHeader className={`${option.color} text-white text-center py-4`}>
                  <CardTitle className="text-xl font-bold mb-2">{option.title}</CardTitle>
                  <div className="flex justify-center gap-2">
                    <span className="bg-accent text-white px-3 py-1 rounded text-sm font-bold">
                      {option.price}
                    </span>
                    <span className="bg-accent text-white px-3 py-1 rounded text-sm font-bold">
                      {option.duration}
                    </span>
                  </div>
                </CardHeader>
                
                <CardContent className="bg-green-50 text-gray-800 py-4">
                  <ul className="space-y-1 text-xs mb-4">
                    {option.description.map((desc, i) => (
                      <li key={i} className="leading-relaxed">✓ {desc}</li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-white py-2"
                    onClick={() => router.push('/service-inquiry')}
                  >
                    Book Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Every Dog Sitting Visit Section */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-800">
            Every Dog Sitting Visit
          </h2>
          <p className="text-center text-gray-600 mb-12">will include the following services</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {[
              { title: "Fresh Food & Water", image: "https://images.unsplash.com/photo-1589883661923-6476cb0ae9f2?w=300&q=80" },
              { title: "Exercise & Play", image: "https://images.unsplash.com/photo-1568572933382-74d440642117?w=300&q=80" },
              { title: "Potty Breaks", image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&q=80" },
              { title: "Medication if Needed", image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&q=80" },
              { title: "Lots of Love", image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=300&q=80" },
              { title: "Daily Photo Updates", image: "https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?w=300&q=80" }
            ].map((service, idx) => (
              <div key={idx} className="text-center bg-green-50 p-6 rounded-lg">
                <div className="mb-4">
                  <img 
                    src={service.image} 
                    alt={service.title} 
                    className="w-24 h-20 object-cover mx-auto rounded-lg"
                  />
                </div>
                <h3 className="font-bold text-primary text-sm">{service.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Trust & Banner Section */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
            <div className="flex-1">
              <h3 className="text-3xl font-bold text-primary leading-relaxed mb-4">
                Your dog deserves the best care while you&apos;re away.
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Our experienced pet sitters provide loving, personalized care in the comfort of your own home. 
                Your dog maintains their routine, stays in their familiar environment, and receives one-on-one attention 
                throughout the day. We provide that much needed companionship and care your dog deserves.
              </p>
              <div className="font-bold text-gray-800 mt-4 text-lg">WHISKARZ ©</div>
            </div>
            <div className="flex-1 text-center">
              <img 
                src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&q=80" 
                alt="Happy dog" 
                className="w-full max-w-sm mx-auto rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Trust Section */}
      <div className="bg-gradient-to-t from-primary/5 to-secondary/10 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Toronto&apos;s Most Trusted In Home Pet Sitting Service
            </h2>
            <p className="text-gray-600">Professional Service and Added Security for Your Peace of Mind</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">1</div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Comprehensive Insurance Coverage</h4>
                  <p className="text-sm text-gray-600">Insurance and liability coverage for your pets, home and property. We honor the trust our clients have placed in us for over 20 years.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">2</div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Professional Excellence</h4>
                  <p className="text-sm text-gray-600">We treat our clients, their pets, and homes with exceptional professionalism and care, continuously setting high standards.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">3</div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Pet First Aid Certified</h4>
                  <p className="text-sm text-gray-600">Our sitters are Pet First Aid certified with emergency protocols in place to handle any situation that may arise.</p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">4</div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Industry Accredited</h4>
                  <p className="text-sm text-gray-600">Accredited by NAPPS (National Association of Professional Pet Sitters) and affiliated with industry governing bodies.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">5</div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Honesty & Transparency</h4>
                  <p className="text-sm text-gray-600">We conduct our service with honesty, integrity, and openness to feedback, always striving to improve through communication.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
