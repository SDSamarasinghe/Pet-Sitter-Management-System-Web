"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function PocketPetSittingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Daily Pocket Pet Sitting</h1>
            <p className="text-lg text-gray-600 mb-4">We provide daily Chinchilla & Ferret and other small pet visits to clients throughout Toronto.</p>
            <img src="/test-avatar.jpg" alt="Pocket Pet" className="mx-auto rounded-lg w-full max-w-md h-64 object-cover mb-4 shadow-lg" />
            <p className="text-gray-600 italic mb-8 max-w-2xl mx-auto">~From sugar gliders to hamsters, guinea pigs to chinchillas our experienced sitters will make a big impression on your pocket sized pets.~</p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold">
                Check out our Prices
              </Button>
              <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-full font-semibold">
                What is Included in Every Visit
              </Button>
              <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-full font-semibold">
                Listen to a Sample of our Daily Reports
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Service Options */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">Choose A Service Option</h2>
          <p className="text-center text-gray-600 mb-12">That meets your pocket pet's needs</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Sweet-pea",
                price: "$32.3",
                duration: "30min",
                description: ["Daily 30min Pocket Pet Visits", "Up to 3 pocket pets", "✗ Meds"],
                image: "/test-avatar.jpg"
              },
              {
                title: "Muffintop",
                price: "$33.3",
                duration: "45min",
                description: ["Daily 45min Pocket Pet Visits", "Up to 4 pocket pets", "✔ Meds"],
                image: "/test-avatar.jpg",
                top: true
              },
              {
                title: "Periwinkle",
                price: "$38.3",
                duration: "60min",
                description: ["Daily 60min Pocket Pet Visits", "Up to 5 pocket pets", "✔ Meds"],
                image: "/test-avatar.jpg"
              },
              {
                title: "Prof.Pipsqueak",
                price: "$67.5",
                duration: "AM/PM",
                description: ["AM/PM - Pocket Pet Visit", "Up to 6 pocket pets", "✔ Meds"],
                image: "/test-avatar.jpg"
              }
            ].map((option, idx) => (
              <Card key={option.title} className="relative overflow-hidden shadow-lg border-0 bg-white hover:shadow-xl transition-shadow">
                {option.top && (
                  <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs px-3 py-1 rounded-full z-10 font-semibold">Popular</div>
                )}
                <div className="bg-blue-600 text-white text-center py-4 px-2">
                  <h3 className="font-bold text-white text-lg">{option.title}</h3>
                  <div className="text-2xl font-bold text-white mt-2">{option.price}</div>
                  <div className="text-sm text-blue-100">{option.duration}</div>
                </div>
                <div className="p-4">
                  <img src={option.image} alt={option.title} className="w-full h-32 object-cover rounded-lg mb-4" />
                  <ul className="space-y-2 text-sm text-gray-600 mb-6">
                    {option.description.map((desc, i) => (<li key={i} className="flex items-start"><span className="mr-2">•</span>{desc}</li>))}
                  </ul>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold" onClick={() => router.push('/service-inquiry')}>Book Now</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Poetic Quote Section */}
      <div className="bg-blue-50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
            <div className="mb-6">
              <img src="/test-avatar.jpg" alt="Poetic Pocket Pet" className="w-32 h-32 object-cover rounded-full mx-auto mb-4" />
            </div>
            <p className="text-gray-700 text-lg leading-relaxed mb-4 italic">"Those of us who have fallen under their spell of a pocket pet, can wax poetic for hours about the joy these little furry friends bring to our lives."</p>
            <p className="text-gray-600 mb-6">With Flying Duchess aside from the basic needs, the daily visits, interaction, affection will make your time away as stress free as possible for your little pals.</p>
            <div className="font-bold text-blue-600 text-lg">FLYING DUCHESS ©</div>
          </div>
        </div>
      </div>

      {/* Every Pocket Pet Visit Section */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Every Pocket Pet Visit</h2>
            <p className="text-lg text-gray-600">Will include the following services</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Fresh Food",
                image: "/test-avatar.jpg",
                caption: "Fresh Food"
              },
              {
                title: "Fresh Water",
                image: "/test-avatar.jpg",
                caption: "Fresh Water"
              },
              {
                title: "Some Play & Interaction",
                image: "/test-avatar.jpg",
                caption: "Some Play & Interaction"
              },
              {
                title: "Fresh Fruit/Vegetables as Requested",
                image: "/test-avatar.jpg",
                caption: "Fresh Fruit/Vegetables as Requested"
              },
              {
                title: "Bring in Mail",
                image: "/test-avatar.jpg",
                caption: "Bring in Mail"
              },
              {
                title: "Spot Cleaning as Needed",
                image: "/test-avatar.jpg",
                caption: "Spot Cleaning as Needed"
              },
              {
                title: "A Daily Report",
                image: "/test-avatar.jpg",
                caption: "A Daily Report"
              }
            ].map((service, idx) => (
              <div key={service.title} className="text-center bg-gray-50 rounded-lg p-4 hover:bg-blue-50 transition-colors">
                <div className="mb-4">
                  <img src={service.image} alt={service.title} className="w-16 h-16 object-cover mx-auto rounded-lg shadow-md" />
                </div>
                <h3 className="font-semibold text-blue-600 text-sm">{service.caption}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trust Section */}
      <div className="bg-blue-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Toronto's Most Trusted In Home Pet Sitting Service</h2>
            <p className="text-lg text-gray-600">Professional Service and Added Security for Your Peace of Mind</p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">1</div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Comprehensive Insurance Coverage</h4>
                    <p className="text-sm text-gray-600">Insurance and Liability coverage for your pets, home and property for the duration of our visits up to 21 million. We respect the trust our clients have placed in us to care for their most valuable possessions.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">2</div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Professional Delivery</h4>
                    <p className="text-sm text-gray-600">We treat our clients and their pets with a standard of professionalism and care that is unparalleled in our industry. Flying Duchess is continually working to set the bar high for pet sitting standards in our industry.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">3</div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Certified</h4>
                    <p className="text-sm text-gray-600">PetTech – Pet First Aid Certified Instructor. With emergency contingencies in place to handle any emergency situation that may come our way.</p>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <img src="/test-avatar.jpg" alt="Pet Care" className="w-full max-w-sm mx-auto rounded-lg shadow-lg" />
              </div>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">4</div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Accredited</h4>
                    <p className="text-sm text-gray-600">Accredited by the governing bodies in the industry NAPPS – National Association of Professional Pet Sitters – Member 2015-2016 NAPPS Membership Benefits Committee on the membership committee. PSI – Pet Sitters International Member.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">5</div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Humility & Openness</h4>
                    <p className="text-sm text-gray-600">We conduct our service with honesty and truthfulness, providing our clients with honest feedback, and being open to honest feedback from our clients in return. We humbly accept that we can always do better through mutual feedback and communication.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
