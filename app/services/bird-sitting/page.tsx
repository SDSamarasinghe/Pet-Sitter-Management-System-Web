"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function BirdSittingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Bird Visits
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
              We provide daily Bird Sitting to our loyal clients throughout the neighbourhoods of Toronto.
              Choose from a range of services that would fit you and your Bird's needs.
            </p>
          </div>
          {/* Hero Image */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-gray-100 rounded-lg overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1544640101-69405652b5dc?auto=format&fit=crop&w=800&q=80" 
                alt="Bird" 
                className="w-full h-80 object-cover"
              />
            </div>
            <p className="text-center text-gray-500 mt-4 italic">
              ~A little birdie once told me that Bird Watching never got quite so many rave reviews except when Whiskarz did it, tweet -tweet ~
            </p>
          </div>
          {/* Info Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Button className="bg-primary hover:bg-primary text-white px-6 py-2 rounded font-bold">
              READ MORE ←
            </Button>
            <Button className="bg-primary hover:bg-primary text-white px-6 py-2 rounded font-bold">
              READ MORE +
            </Button>
            <Button className="bg-primary hover:bg-primary text-white px-6 py-2 rounded font-bold">
              READ MORE +
            </Button>
          </div>
        </div>
      </div>

      {/* Service Options */}
      <div className="bg-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">
            Choose A Service Option
          </h2>
          <p className="text-center text-gray-600 mb-8">That meets your bird's needs</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Tweet!",
                price: "$32.3",
                duration: "45min",
                description: ["Daily 45 min - Bird Visits", "Up to 2 birds", "✗ Meds"],
                image: "https://images.unsplash.com/photo-1544640101-69405652b5dc?auto=format&fit=crop&w=400&q=80",
                color: "bg-primary"
              },
              {
                title: "Chirp!",
                price: "$34",
                duration: "60min",
                description: ["Daily 60 min - Bird Visits", "Up to 3 birds", "✔ Meds"],
                image: "https://images.unsplash.com/photo-1544640101-69405652b5dc?auto=format&fit=crop&w=400&q=80",
                color: "bg-primary",
                top: true
              },
              {
                title: "Songbird",
                price: "$64.6",
                duration: "AM & PM",
                description: ["AM & PM Twice a Day - Bird Visits", "Up to 2 birds", "✔ Meds"],
                image: "https://images.unsplash.com/photo-1544640101-69405652b5dc?auto=format&fit=crop&w=400&q=80",
                color: "bg-primary"
              },
              {
                title: "Storybird",
                price: "$38",
                duration: "60min",
                description: ["2hr Cage Free + Cage Cleaning - Bird Visit", "Up to 5 birds", "✔ Meds"],
                image: "https://images.unsplash.com/photo-1544640101-69405652b5dc?auto=format&fit=crop&w=400&q=80",
                color: "bg-primary"
              }
            ].map((option, idx) => (
              <Card key={option.title} className={`relative overflow-hidden shadow-lg border-0 ${option.color} text-white`}>
                {option.top && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full z-10 font-bold">
                    Top
                  </div>
                )}
                <div className="text-center py-3 px-2">
                  <h3 className="font-bold text-white text-sm">{option.title}</h3>
                </div>
                <div className="text-center py-4">
                  <div className="text-3xl font-bold text-white mb-1">{option.price}</div>
                  <div className="text-sm text-white/80">{option.duration}</div>
                </div>
                <div className="px-4 pb-4">
                  <img 
                    src={option.image} 
                    alt={option.title} 
                    className="w-full h-24 object-cover rounded-lg"
                  />
                </div>
                <div className="px-4 pb-4">
                  <ul className="space-y-1 text-xs text-white">
                    {option.description.map((desc, i) => (
                      <li key={i}>{desc}</li>
                    ))}
                  </ul>
                </div>
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
                Any Bird Lover knows that it is not the fine feathers that makes their bird so special. Birds are intelligent, talented, inquisitive, affectionate & playful.<br />
                These feathered friends bring such joy to our lives that our sitters are always happy to have the chance to return the favour.
              </h3>
              <div className="font-bold text-gray-800 mt-4 text-lg">Whiskarz ©</div>
            </div>
            <div className="flex-1 text-center">
              <img 
                src="https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=400&q=80" 
                alt="Bird Banner" 
                className="w-full max-w-sm mx-auto rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Every Bird Visit Section */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-800">
            Every Bird Visit
          </h2>
          <p className="text-center text-gray-600 mb-12">will include the following services</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { title: "Meet & Greet", image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=300&q=80" },
              { title: "Fresh Water", image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=300&q=80" },
              { title: "Fresh Food", image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=300&q=80" },
              { title: "Changing tray/cage liner", image: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=300&q=80" },
              { title: "Bring in Mail", image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=300&q=80" },
              { title: "Some Play & Interaction", image: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=300&q=80" }
            ].map((service, idx) => (
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
                  src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=300&q=80" 
                  alt="And Daily Reports" 
                  className="w-24 h-20 object-cover mx-auto rounded-lg"
                />
              </div>
              <h3 className="font-bold text-primary text-sm">And Daily Reports</h3>
            </div>
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
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Comprehensive Insurance Coverage</h4>
                  <p className="text-sm text-gray-600">Insurance and Liability coverage for your pets, home and property for the duration of our visits up to 21 million Canadian. We respect the trust our clients have placed in us to care for their most valuable possessions.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Professional Delivery</h4>
                  <p className="text-sm text-gray-600">We treat our clients, their pets, and home with a standard of professionalism and care that is unrivaled in our industry. Whiskarz is continually working to set the bar high for pet sitting standards in our industry.</p>
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
                  <p className="text-sm text-gray-600">Accredited by the governing bodies of the industry NAPPS – National Association of Professional Pet Sitters Member 2017-2019 NAPPS Membership Benefits Committee on the membership committee. PSI – Pet Sitters International Member.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">5</div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Humility & Openness</h4>
                  <p className="text-sm text-gray-600">We conduct our service with honesty and truthfulness, providing our clients with honest feedback, and being open to honest feedback from our clients in return. We humbly recognize that we can always do better through mutual feedback and communication.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
