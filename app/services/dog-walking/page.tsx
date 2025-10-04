"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

const dogWalkOptions = [
  {
    title: "Quick Stride",
    price: "$28",
    duration: "30min",
    description: [
      "Mid Day Weekly Ongoing",
      "A brief private walk.",
      "Potty Break",
      "Ideal for smaller or older dogs, or those less social.",
      "Additional Dog $5",
      "Holiday Rate: $35"
    ],
    image: "https://images.unsplash.com/photo-1568572933382-74d440642117?w=400&q=80"
  },
  {
    title: "Easy Jaunt",
    price: "$32",
    duration: "45min",
    description: [
      "A moderate walk with some play time.",
      "Ideal for medium energy dogs.",
      "Includes basic training reinforcement.",
      "Water provided during walk.",
      "Additional Dog $5",
      "Holiday Rate: $40"
    ],
    image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&q=80"
  },
  {
    title: "Long Adventure",
    price: "$35",
    duration: "1hr",
    description: [
      "Extended walk with exercise and play.",
      "Perfect for high-energy dogs.",
      "Includes socialization opportunities.",
      "GPS tracking provided to owners.",
      "Additional Dog $8",
      "Holiday Rate: $46"
    ],
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80"
  },
  {
    title: "Random Rollick",
    price: "$33",
    duration: "60min",
    description: [
      "Anytime Occasional Walk",
      "Private Dog Walk.",
      "Booked occasionally when needed.",
      "Includes walk, exercise, potty break and playtime.",
      "Additional Dog $5"
    ],
    image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&q=80"
  }
];

  const walkServices = [
  {
    title: "Meet & Greet",
    image: "https://images.unsplash.com/photo-1568572933382-74d440642117?w=300&q=80",
    bgColor: "bg-green-50"
  },
  {
    title: "Leash & Outfitting as Needed",
    image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&q=80",
    bgColor: "bg-green-50"
  },
  {
    title: "Walk/Exercise/Play",
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&q=80",
    bgColor: "bg-green-50"
  },
  {
    title: "Potty Break & Clean Up",
    image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=300&q=80",
    bgColor: "bg-green-50"
  },
  {
    title: "Fresh Water",
    image: "https://images.unsplash.com/photo-1589883661923-6476cb0ae9f2?w=300&q=80",
    bgColor: "bg-green-50"
  },
  {
    title: "Love & Attention",
    image: "https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?w=300&q=80",
    bgColor: "bg-green-50"
  }
];

export default function DogWalkingPage() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/10">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary/5 to-secondary/10">
        <div className="text-center py-12 px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Private Dog Walks</h1>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            We provide weekly and occasional, Private Dog Walks to our loyal clients throughout
            the neighbourhoods of Toronto. Choose from a range of services that would fit you and your Dog's needs.
          </p>
          
          {/* Dog Image */}
          <div className="mb-6 max-w-4xl mx-auto">
            <div className="bg-gray-100 rounded-lg overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1568572933382-74d440642117?w=800&q=80" 
                alt="Dog Walking" 
                className="w-full h-80 object-cover"
              />
            </div>
          </div>
          
          <p className="italic text-gray-500 mb-8 max-w-2xl mx-auto">
            ~Think of us as your very own dog chauffeur and dog butler all rolled into one~
          </p>
        </div>
      </div>

      {/* Service Options */}
      <div className="bg-gradient-to-b from-secondary/5 to-background py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">
            Choose A Service Option
          </h2>
          <p className="text-center text-gray-600 mb-8">That meets your dog's needs</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dogWalkOptions.map((option) => (
              <Card key={option.title} className="relative overflow-hidden shadow-lg border-0">
                <div className="relative">
                  <img 
                    src={option.image} 
                    alt={option.title} 
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent h-16"></div>
                </div>
                
                <CardHeader className="bg-primary text-white text-center py-3">
                  <CardTitle className="text-lg font-bold mb-2">{option.title}</CardTitle>
                  <div className="flex justify-center gap-2">
                    <span className="bg-accent text-white px-3 py-1 rounded text-sm font-bold">
                      {option.price}
                    </span>
                    <span className="bg-accent text-white px-3 py-1 rounded text-sm font-bold">
                      {option.duration}
                    </span>
                  </div>
                </CardHeader>
                
                <CardContent className="bg-green-50 text-gray-800 text-sm py-4">
                  <ul className="space-y-1 mb-4">
                    {option.description.map((desc, i) => (
                      <li key={i} className="text-xs leading-relaxed">✓ {desc}</li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-white rounded py-2"
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

      {/* Banner Section */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h3 className="text-3xl font-bold mb-4 text-primary leading-relaxed">
                For dogs walking is a primal instinct.
              </h3>
              <div className="space-y-4 text-gray-700">
                <p>
                  Our private dog walks can provide your dog with a structured daily walk, where they receive individual attention, one-on-one interaction, positive reinforcement, and physical stimulation suited to their individual needs.
                </p>
                <p>
                  Meeting your dog's need to walk, on a regular & consistent basis will make for a happier dog & happier owners.
                </p>
              </div>
              <div className="font-bold text-gray-800 mt-4 text-lg">WHISKARZ ©</div>
            </div>
            <div className="flex-1 text-center">
              <img 
                src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80" 
                alt="Dog Portrait" 
                className="w-full max-w-sm mx-auto rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Every Private Dog Walk Section */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-800">
            Every Private Dog Walk
          </h2>
          <p className="text-center text-gray-600 mb-12">will include the following services</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {walkServices.map((service) => (
              <div key={service.title} className="text-center bg-green-50 p-6 rounded-lg">
                <img 
                  src={service.image} 
                  alt={service.title}
                  className="w-24 h-20 object-cover mx-auto mb-4 rounded-lg"
                />
                <h3 className="font-bold text-primary text-sm">{service.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trust Section */}
      <div className="bg-gradient-to-t from-primary/5 to-secondary/10 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Toronto's Most Trusted In Home Pet Sitting Service
            </h2>
            <p className="text-gray-600">Professional Service and Added Security for Your Peace of Mind</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Comprehensive Insurance Coverage</h4>
                  <p className="text-sm text-gray-600">
                    Insurance and liability coverage for your pets, home and property. We honor the trust our clients have placed in us for over 20 years.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Professional Excellence</h4>
                  <p className="text-sm text-gray-600">
                    We treat our clients, their pets, and homes with exceptional professionalism and care, continuously setting high standards in the industry.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Pet First Aid Certified</h4>
                  <p className="text-sm text-gray-600">
                    Our sitters are Pet First Aid certified with emergency protocols in place to handle any situation that may arise.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                  4
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Industry Accredited</h4>
                  <p className="text-sm text-gray-600">
                    Accredited by NAPPS (National Association of Professional Pet Sitters) and affiliated with industry governing bodies including ASPCA and OSPGA.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                  5
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Honesty & Transparency</h4>
                  <p className="text-sm text-gray-600">
                    We conduct our service with honesty, integrity, and openness to feedback, always striving to improve through mutual communication.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
