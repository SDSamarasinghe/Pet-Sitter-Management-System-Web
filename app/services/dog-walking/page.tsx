"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

const dogWalkOptions = [
  {
    title: "Quick Stride",
    price: "$25",
    duration: "30min",
    description: [
      "Mid Day Weekly Ongoing",
      "A brief private walk.",
      "Potty Break",
      "Ideal for smaller or older dogs, or those less social.",
      "Additional Dog $5"
    ],
    image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=400&q=80"
  },
  {
    title: "Easy Jaunt",
    price: "$29",
    duration: "45min",
    description: [
      "Mid Day Weekly Ongoing",
      "A longer, more exercise-oriented private walk.",
      "Potty Break",
      "Best for normal adult dogs.",
      "Additional Dog $5"
    ],
    image: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=400&q=80"
  },
  {
    title: "Leisure Stroll",
    price: "$33",
    duration: "60min",
    description: [
      "Mid Day Weekly Ongoing",
      "Long Private Walk with a visit to the park.",
      "Potty Break",
      "Ideal for dogs looking for a healthy dose of exercise, socialization, reinforcement, feeding and playtime.",
      "Additional Dog $5"
    ],
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=400&q=80",
    top: true
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
    image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=400&q=80"
  }
];

  const walkServices = [
  {
    title: "Meet & Greet",
    image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=300&q=80",
    bgColor: "bg-green-50"
  },
  {
    title: "Leash & Outfitting as Needed",
    image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=300&q=80",
    bgColor: "bg-green-50"
  },
  {
    title: "Walk/Exercise/Play",
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=300&q=80",
    bgColor: "bg-green-50"
  },
  {
    title: "Potty Break & Clean Up",
    image: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=300&q=80",
    bgColor: "bg-green-50"
  },
  {
    title: "Fresh Water",
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=300&q=80",
    bgColor: "bg-green-50"
  },
  {
    title: "Love & Attention",
    image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=300&q=80",
    bgColor: "bg-green-50"
  }
];

export default function DogWalkingPage() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gray-50">
        {/* Flying Duchess Logo */}
       
        
        <div className="text-center py-12 px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">Private Dog Walks</h1>
          <p className="text-lg text-gray-700 mb-6 max-w-3xl mx-auto leading-relaxed">
            We provide weekly and occasional, Private Dog Walks to our loyal clients throughout
            the neighbourhoods of Toronto. Choose from a range of services that would fit you and your Dog's needs.
          </p>
          
          {/* Dog Image */}
          <div className="mb-6">
            <img 
              src="https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=400&q=80" 
              alt="Dachshund Dog" 
              className="mx-auto w-64 h-48 object-cover rounded-lg"
            />
          </div>
          
          <p className="italic text-gray-500 mb-8 text-lg">
            ~Think of us as your very own dog chauffeur and dog butler all rolled into one~
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Button className="bg-primary hover:bg-gold-600 text-white px-6 py-3 rounded">
              READ MORE →
            </Button>
            <Button className="bg-primary hover:bg-gold-600 text-white px-6 py-3 rounded">
              READ MORE →
            </Button>
            <Button className="bg-primary hover:bg-gold-600 text-white px-6 py-3 rounded">
              READ MORE →
            </Button>
          </div>
          
          <div className="text-center mb-8">
            <h3 className="text-sm text-gray-500 mb-2">Check out our Prices</h3>
            <h3 className="text-sm text-gray-500 mb-2">What is Included in Every Visit</h3>
            <h3 className="text-sm text-gray-500">Listen to a Sample of our Daily Reports</h3>
          </div>
        </div>
      </div>

      {/* Service Options */}
      <div className="bg-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">
            Choose A Service Option
          </h2>
          <p className="text-center text-gray-600 mb-8">That meets your dog's needs</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dogWalkOptions.map((option, idx) => (
              <Card key={option.title} className="relative overflow-hidden shadow-lg border-0">
                {option.top && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full z-10 font-bold">
                    Top
                  </div>
                )}
                
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
                    <span className="bg-gold-600 text-white px-3 py-1 rounded text-sm font-bold">
                      {option.price}
                    </span>
                    <span className="bg-gold-600 text-white px-3 py-1 rounded text-sm font-bold">
                      {option.duration}
                    </span>
                  </div>
                </CardHeader>
                
                <CardContent className="bg-green-50 text-gray-800 text-sm py-4">
                  <ul className="space-y-1 mb-4">
                    {option.description.map((desc, i) => (
                      <li key={i} className="text-xs leading-relaxed">{desc}</li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full bg-primary hover:bg-gold-600 text-white rounded py-2"
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
      <div className="relative">
        <div className="bg-green-100 py-16 px-4">
          <div className="max-w-4xl mx-auto flex items-center gap-8">
            <div className="flex-1">
              <h3 className="text-3xl font-bold mb-4 text-gray-800">
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
            </div>
            <div className="flex-1">
              <img 
                src="https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=400&q=80" 
                alt="Dog Portrait" 
                className="w-full max-w-sm mx-auto rounded-lg"
              />
              <div className="text-center mt-4 font-bold text-gray-800 tracking-wide">
                FLYING DUCHESS ©
              </div>
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {walkServices.map((service, idx) => (
              <div key={service.title} className={`text-center p-6 rounded-lg ${service.bgColor}`}>
                <img 
                  src={service.image} 
                  alt={service.title}
                  className="w-32 h-24 object-cover mx-auto mb-4 rounded-lg"
                />
                <h3 className="font-bold text-primary text-lg">{service.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trust Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Toronto's Most Trusted In Home Pet Sitting Service
            </h2>
            <p className="text-gray-600">Professional Service and Added Security for Your Peace of Mind</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Comprehensive Insurance Coverage</h4>
                  <p className="text-sm text-gray-600">
                    Insurance and Liability coverage for your pets, home and property for the duration of our walk-ins or in-home Canadian. We provide full local our clients have placed in us for over 20 years with their most valuable possessions.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Professional Delivery</h4>
                  <p className="text-sm text-gray-600">
                    We treat our clients, their pets, and home, with a standard of professionalism and care that is extraordinary to continuously working set the bar high for pet sitting standards in our industry.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Certified/Certified</h4>
                  <p className="text-sm text-gray-600">
                    Pet First Aid Certified Instructors. With emergency contingencies in place to handle any emergency situations that may arise our way.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <img 
                src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=400&q=80" 
                alt="Pet Care" 
                className="w-full max-w-md mx-auto rounded-lg shadow-lg"
              />
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                  4
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Accredited</h4>
                  <p className="text-sm text-gray-600">
                    Accredited by the governing bodies of the industry NAPPS – National Association of Professional Pet Sitters Member IIAPSG NAPPS Membership ASPCA Membership OSPGA as affiliated and being open to honest feedback from our clients that allows. We honestly recognize that we can always do feel through mutual feedback and communication.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                  5
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Honesty & Openness</h4>
                  <p className="text-sm text-gray-600">
                    We conduct our service with honesty and truthfulness, professional integrity, which builds trust between clients and being open to honest feedback from our clients in return. We honestly recognize that we can always do feel through mutual feedback and communication.
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
