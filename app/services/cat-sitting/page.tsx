"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

const catVisitOptions = [
  {
    title: "Domestic",
    price: "$32.5",
    duration: "30 min",
    description: [
      "Once-a-day 30min Cat Visits",
      "Up to 2 Cats",
      "★ Kids"
    ],
    image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=300&q=80",
    color: "bg-primary"
  },
  {
    title: "Outdoor",
    price: "$39",
    duration: "45 min",
    description: [
      "Once-a-day 45min Cat Visits",
      "Up to 3 Cats",
      "★★ Kids & Older Cats"
    ],
    image: "https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?auto=format&fit=crop&w=300&q=80",
    color: "bg-primary"
  },
  {
    title: "AristoCat",
    price: "$38",
    duration: "60 min",
    description: [
      "Once-a-day 60min Cat Visits",
      "Up to 3 Cats",
      "★ Meds mixed in with food only"
    ],
    image: "https://images.unsplash.com/photo-1487300023790-ffbb8016a78b?auto=format&fit=crop&w=300&q=80",
    color: "bg-primary",
    special: "top"
  },
  {
    title: "Med Visits - Needles & IV Fluids",
    price: "$41",
    duration: "per visit",
    description: [
      "Insulin Needles, Sub-Q, Omnimed,",
      "Oral Pills Administration",
      "Once-a-day (AM/PM visit)",
      "★ Needles (Insulin BDP Suit-Q)"
    ],
    image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=300&q=80",
    color: "bg-primary"
  },
  {
    title: "Therapeutic",
    price: "$52",
    duration: "1 hr",
    description: [
      "Once-a-day 1hr Cat Visits",
      "Elderly Cats & Special Needs",
      "★★★ Medical Care"
    ],
    image: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=300&q=80",
    color: "bg-primary"
  }
];

const catVisitServices = [
  { title: "Fresh Food", image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=300&q=80" },
  { title: "Fresh Water", image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=300&q=80" },
  { title: "Some Playtime", image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=300&q=80" },
  { title: "Scoop Litter", image: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=300&q=80" },
  { title: "Bring in Mail", image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=300&q=80" },
  { title: "Some Loving", image: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=300&q=80" },
  { title: "And Daily Reports", image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=300&q=80" }
];

export default function CatSittingPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/10">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary/5 to-secondary/10">
        {/* Navigation breadcrumb style header */}
       
        
        <div className="text-center py-12 px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Daily Cat Visits</h1>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            We provide daily cat visits to our loyal clients throughout the neighbourhoods of Toronto.<br />
            Choose from a range of services that would fit you and your cat's needs.
          </p>
          
          {/* Main cat image */}
          <div className="mb-6 bg-gray-100 rounded-lg max-w-4xl mx-auto">
            <img 
              src="https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=800&q=80" 
              alt="Tabby cat lying down" 
              className="w-full h-80 object-cover rounded-lg"
            />
          </div>
          
          <p className="italic text-gray-500 mb-8 text-lg">
            "Our Cat Visits Are Legendary. We Have Won Over The Most Finickiest Of Felines"
          </p>
          
          {/* Three action buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Button className="bg-primary hover:bg-primary text-white px-8 py-3 text-sm font-bold">
              CHECK OUT OUR PRICES →
            </Button>
            <Button className="bg-primary hover:bg-primary text-white px-8 py-3 text-sm font-bold">
              WHAT IS INCLUDED IN EVERY VISIT →
            </Button>
            <Button className="bg-primary hover:bg-primary text-white px-8 py-3 text-sm font-bold">
              THE Whiskarz DIFFERENCE →
            </Button>
          </div>
        </div>
      </div>

      {/* Service Options */}
      <div className="bg-gradient-to-b from-secondary/5 to-background py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">
            Choose A Service Option
          </h2>
          <p className="text-center text-gray-600 mb-12">That meets your cat's needs</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {catVisitOptions.map((option, idx) => (
              <Card key={option.title} className={`relative overflow-hidden shadow-lg border-0 ${option.color} text-white`}>
                {option.special === "top" && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full z-10 font-bold">
                    TOP
                  </div>
                )}
                
                {/* Header with title */}
                <div className="text-center py-3 px-2">
                  <h3 className="font-bold text-white text-sm">{option.title}</h3>
                </div>
                
                {/* Price display */}
                <div className="text-center py-4">
                  <div className="text-3xl font-bold text-white mb-1">{option.price}</div>
                  <div className="text-sm text-white/80">{option.duration}</div>
                </div>
                
                {/* Cat image */}
                <div className="px-4 pb-4">
                  <img 
                    src={option.image} 
                    alt={option.title} 
                    className="w-full h-24 object-cover rounded-lg"
                  />
                </div>
                
                {/* Description */}
                <div className="px-4 pb-4">
                  <ul className="space-y-1 text-xs text-white">
                    {option.description.map((desc, i) => (
                      <li key={i}>{desc}</li>
                    ))}
                  </ul>
                </div>
                
                {/* Book Now Button */}
                <div className="px-4 pb-4">
                  <Button 
                    className="w-full bg-white text-gray-800 hover:bg-gray-100 py-2 text-sm font-bold"
                    onClick={() => router.push('/service-inquiry')}
                  >
                    Book Now
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Banner Section */}
      <div className="relative bg-primary/10 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-8">
            <div className="flex-1">
              <h3 className="text-2xl md:text-3xl font-bold text-primary leading-relaxed">
                We provide that much needed bright spot in your pet's day, while you are away ~ And being able to do that makes our day!
              </h3>
              <div className="font-bold text-gray-800 mt-4 text-lg">Whiskarz ©</div>
            </div>
            <div className="flex-1 text-center">
              <img 
                src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80" 
                alt="Black cat with green eyes" 
                className="w-full max-w-sm mx-auto rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Every Cat Visit Section */}
      <div className="bg-gradient-to-r from-primary/5 to-accent/10 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-800">
            Every Cat Visit
          </h2>
          <p className="text-center text-gray-600 mb-12">will include the following services</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {catVisitServices.slice(0, 6).map((service, idx) => (
              <div key={service.title} className="text-center">
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
          
          {/* Center the 7th item */}
          <div className="text-center mt-8">
            <div className="inline-block">
              <div className="mb-4">
                <img 
                  src={catVisitServices[6].image} 
                  alt={catVisitServices[6].title} 
                  className="w-24 h-20 object-cover mx-auto rounded-lg"
                />
              </div>
              <h3 className="font-bold text-primary text-sm">{catVisitServices[6].title}</h3>
            </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Comprehensive Insurance Coverage</h4>
                  <p className="text-sm text-gray-600">Insurance and Liability coverage for your pets, home and property for the duration of our walk-ins or in-home Canadian. We provide full local our clients have placed in us for over 20 years with their most valuable possessions.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Professional Delivery</h4>
                  <p className="text-sm text-gray-600">We treat our clients, their pets, and home, with a standard of professionalism and care that is extraordinary to continuously working set the bar high for pet sitting standards in our industry.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Certified/Certified</h4>
                  <p className="text-sm text-gray-600">Pet First Aid Certified Instructors. With emergency contingencies in place to handle any emergency situations that may arise our way.</p>
                </div>
              </div>
            </div>
            <div className="text-center">
              <img src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=400&q=80" alt="Pet Care" className="w-full max-w-md mx-auto rounded-lg shadow-lg" />
            </div>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">4</div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Accredited</h4>
                  <p className="text-sm text-gray-600">Accredited by the governing bodies of the industry NAPPS – National Association of Professional Pet Sitters Member IIAPSG NAPPS Membership ASPCA Membership OSPGA as affiliated and being open to honest feedback from our clients that allows. We honestly recognize that we can always do feel through mutual feedback and communication.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">5</div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Honesty & Openness</h4>
                  <p className="text-sm text-gray-600">We conduct our service with honesty and truthfulness, professional integrity, which builds trust between clients and being open to honest feedback from our clients in return. We honestly recognize that we can always do feel through mutual feedback and communication.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
       
      </div>
    </div>
  );
}
