"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { isAuthenticated, getUserFromToken, removeToken } from "@/lib/auth";

const services = [
  {
    id: 1,
    title: "Daily Cat Visits",
    description: "We offer a vast variety of cat visits. You can choose from a daily 30, 45, 60min, or a twice daily service option.",
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80",
    category: "Cats",
    duration: "30-60 min",
    price: "Starting at $35"
  },
  {
    id: 2,
    title: "Private Dog Walks",
    description: "This premium in home dog sitting service offers your canine companions all the comforts of being at home.",
    image: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80",
    category: "Dogs",
    duration: "30-60 min",
    price: "Starting at $40"
  },
  {
    id: 3,
    title: "In Home Dog Sitting",
    description: "Comprehensive in-home care for your dogs while you're away, ensuring they stay comfortable in their familiar environment.",
    image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=400&q=80",
    category: "Dogs",
    duration: "Full day",
    price: "Starting at $80"
  },
  {
    id: 4,
    title: "Bird Sitting",
    description: "We provide daily Bird Sitting to our loyal clients throughout the neighbourhoods of Toronto. Choose from a range of services.",
    image: "https://images.unsplash.com/photo-1544640101-69405652b5dc?auto=format&fit=crop&w=400&q=80",
    category: "Birds",
    duration: "30-45 min",
    price: "Starting at $30"
  },
  {
    id: 5,
    title: "Daily Bunny Visits",
    description: "Whether its your Holland Lop, English Spot, Netherland Dwarf, or other exotic breed or just your garden variety rabbit.",
    image: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=400&q=80",
    category: "Rabbits",
    duration: "30-45 min",
    price: "Starting at $30"
  },
  {
    id: 6,
    title: "Overnight & Live-in Services",
    description: "We can provide a combination overnight and/or live-in service for your pets when you need extended care.",
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=400&q=80",
    category: "All Pets",
    duration: "Overnight",
    price: "Starting at $120"
  },
  {
    id: 7,
    title: "AM & PM Visits",
    description: "Perfect for pets that need multiple check-ins throughout the day. Morning and evening care to maintain routine.",
    image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=400&q=80",
    category: "All Pets",
    duration: "2 visits/day",
    price: "Starting at $65"
  },
  {
    id: 8,
    title: "Multiple Pet Households",
    description: "Variety is the spice of life. Whether it's two cats and a dog or the other way around, we've got you covered.",
    image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=400&q=80",
    category: "Multiple Pets",
    duration: "Variable",
    price: "Custom pricing"
  },
  {
    id: 9,
    title: "Pocket Pet Sitting",
    description: "From sugar gliders to hamsters, guinea pigs to chinchillas our experienced sitters will make a big impression on your pocket pets.",
    image: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?auto=format&fit=crop&w=400&q=80",
    category: "Small Pets",
    duration: "30 min",
    price: "Starting at $25"
  }
];

const features = [
  "★ Experienced",
  "★ Insured", 
  "★ Bonded",
  "★ Licensed",
  "★ Certified",
  "★ Pet First Aid Certified"
];

export default function ServicesPage() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    if (isAuthenticated()) {
      const userToken = getUserFromToken();
      if (userToken) {
        // In a real app, you'd fetch user data here
        setUser({ firstName: userToken.firstName || "User" });
      }
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    removeToken();
    setUser(null);
    setIsDropdownOpen(false);
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Nav */}
  

      <main className="max-w-7xl mx-auto py-10 px-4">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
           Pet Services
          </h1>
          <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            Toronto's most trusted in-home pet care service. Professional, insured, and experienced pet sitters who will love your pets like their own.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {features.map((feature, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                {feature}
              </span>
            ))}
          </div>
          <Button size="lg" onClick={() => router.push('/service-inquiry')} className="rounded-full px-8 py-3">
            Book Your Pet Visits Today
          </Button>
        </div>

        {/* Services Grid */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card key={service.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                    <span className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded">
                      {service.category}
                    </span>
                  </div>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-600">Duration: {service.duration}</span>
                    <span className="font-semibold text-green-600">{service.price}</span>
                  </div>
                  <Button 
                    className="w-full rounded-full" 
                    onClick={() => router.push('/service-inquiry')}
                  >
                    Book This Service
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="mb-16 bg-white rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-center mb-8">Why Choose Flying Duchess?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Trusted & Insured</h3>
              <p className="text-gray-600">All our sitters are fully insured, bonded, and background checked for your peace of mind.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Experienced Care</h3>
              <p className="text-gray-600">Our experienced sitters will play, pet, and chat with your companions, providing love and attention.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
              <p className="text-gray-600">We're always available for questions, updates, and emergency support when you need us.</p>
            </div>
          </div>
        </section>

        {/* New Client Section */}
        <section className="bg-blue-50 rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">New Clients Welcome!</h2>
          <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
            Your service includes a complimentary comprehensive in-home consultation prior to starting service. 
            The next time you need to book, the process is painless and easy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => router.push('/service-inquiry')} className="rounded-full px-8">
              Schedule Free Consultation
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push('/feedback')} className="rounded-full px-8">
              Read Client Reviews
            </Button>
          </div>
        </section>

        {/* Contact Section */}
        <section className="mt-16 text-center">
          <h2 className="text-3xl font-bold mb-6">Contact Us</h2>
          <div className="flex flex-col md:flex-row justify-center items-center gap-6 text-lg">
            <div>
              <strong>Phone:</strong> (647) 238-2697
            </div>
            <div>
              <strong>Toll Free:</strong> (855) FLY-DUCH
            </div>
            <div>
              <strong>Location:</strong> Toronto, ONT M6J 1C4
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
