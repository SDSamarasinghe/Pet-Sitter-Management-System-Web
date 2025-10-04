"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { isAuthenticated, getUserFromToken, removeToken } from "@/lib/auth";

// Type definitions
interface Service {
  id: number;
  title: string;
  description: string;
  image: string;
  duration: string;
  price: string;
}

interface ServiceCategory {
  icon: string;
  description: string;
  services: Service[];
}

type ServiceCategories = {
  "Pet Sitting": ServiceCategory;
  "Dog Walking": ServiceCategory;
  "Extended Care": ServiceCategory;
};

// Organized service categories based on the wireframe
const serviceCategories: ServiceCategories = {
  "Pet Sitting": {
    icon: "",
    description: "In-home care for your beloved pets",
    services: [
      {
        id: 1,
        title: "Cat Sitting",
        description: "Daily visits for your feline friends. 30, 45, or 60-minute visits available.",
        image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80",
        duration: "30-60 min",
        price: "Starting at $28"
      },
      {
        id: 2,
        title: "Dog Sitting",
        description: "Premium in-home dog sitting service offering comfort and care in familiar surroundings.",
        image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=400&q=80",
        duration: "Full day",
        price: "Starting at $28"
      },
      {
        id: 3,
        title: "Rabbit Sitting",
        description: "Specialized care for bunnies of all breeds, from Holland Lops to English Spots.",
        image: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=400&q=80",
        duration: "30-45 min",
        price: "Starting at $28"
      },
      {
        id: 4,
        title: "Bird Sitting",
        description: "Professional care for your feathered companions with specialized knowledge.",
        image: "https://images.unsplash.com/photo-1544640101-69405652b5dc?auto=format&fit=crop&w=400&q=80",
        duration: "30-45 min",
        price: "Starting at $28"
      },
      {
        id: 5,
        title: "Pocket Pet Sitting",
        description: "Expert care for small pets including hamsters, guinea pigs, chinchillas, and sugar gliders.",
        image: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?auto=format&fit=crop&w=400&q=80",
        duration: "30 min",
        price: "Starting at $28"
      },
      {
        id: 6,
        title: "Multiple Pet Types",
        description: "Comprehensive care for households with various pet types and species.",
        image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=400&q=80",
        duration: "Variable",
        price: "Custom pricing"
      }
    ]
  },
  "Dog Walking": {
    icon: "",
    description: "Professional dog walking services",
    services: [
      {
        id: 7,
        title: "Private Dog Walks",
        description: "One-on-one walks tailored to your dog's pace and preferences.",
        image: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80",
        duration: "30-60 min",
        price: "Starting at $40"
      },
      {
        id: 8,
        title: "Group Dog Walks",
        description: "Socialized walks with other friendly dogs for exercise and companionship.",
        image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=400&q=80",
        duration: "45-60 min",
        price: "Starting at $30"
      },
      {
        id: 9,
        title: "Puppy Walks",
        description: "Gentle, short walks perfect for puppies and senior dogs with special needs.",
        image: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=400&q=80",
        duration: "15-30 min",
        price: "Starting at $25"
      }
    ]
  },
  "Extended Care": {
    icon: "",
    description: "Overnight and extended pet care services",
    services: [
      {
        id: 10,
        title: "Overnight Pet Sitting",
        description: "Overnight care in your pet's familiar environment while you're away.",
        image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=400&q=80",
        duration: "Overnight",
        price: "Starting at $120"
      },
      {
        id: 11,
        title: "Live-in Pet Care",
        description: "Full-time live-in care for extended periods, ensuring constant companionship.",
        image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=400&q=80",
        duration: "24/7 care",
        price: "Starting at $200/day"
      },
      {
        id: 12,
        title: "AM & PM Visits",
        description: "Morning and evening visits to maintain your pet's daily routine.",
        image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=400&q=80",
        duration: "2 visits/day",
        price: "Starting at $65"
      },
      {
        id: 13,
        title: "Holiday Pet Care",
        description: "Special holiday packages ensuring your pets are well-cared for during festive seasons.",
        image: "https://images.unsplash.com/photo-1512236393941-ef5c2b150d7b?auto=format&fit=crop&w=400&q=80",
        duration: "Custom schedule",
        price: "Holiday rates apply"
      }
    ]
  }
};

const features = [
  "★ Experienced",
  "★ Insured", 
  "★ Bonded",
  "★ Licensed",
  "★ Certified",
  "★ Pet First Aid Certified"
];

export default function ServicesPage() {
  const [activeCategory, setActiveCategory] = useState<keyof ServiceCategories>("Pet Sitting");
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
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/10">
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
              <span key={index} className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                {feature}
              </span>
            ))}
          </div>
          <Button size="lg" onClick={() => router.push('/service-inquiry')} className="rounded-full px-8 py-3">
            Book Your Pet Visits Today
          </Button>
        </div>

        {/* Services Categories and Grid */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Our Services</h2>
          
          {/* Category Navigation */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {Object.entries(serviceCategories).map(([categoryName, category]) => (
              <button
                key={categoryName}
                onClick={() => {
                  if (categoryName === "Dog Walking") {
                    router.push('/services/dog-walking');
                  } else if (categoryName === "Cat Sitting") {
                    router.push('/services/cat-sitting');
                  } else {
                    setActiveCategory(categoryName as keyof ServiceCategories);
                  }
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
                  activeCategory === categoryName
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-white text-muted-foreground hover:bg-primary/5 hover:text-primary border border-border'
                }`}
              >
                <span className="text-lg">{category.icon}</span>
                <span>{categoryName}</span>
              </button>
            ))}
          </div>

          {/* Active Category Description */}
          <div className="text-center mb-8">
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {serviceCategories[activeCategory].description}
            </p>
          </div>

          {/* Services Grid for Active Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceCategories[activeCategory].services.map((service: Service) => (
              <Card 
                key={service.id} 
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  // Navigate to specific service pages
                  if (service.title === "Cat Sitting") {
                    router.push('/services/cat-sitting');
                  } else if (service.title === "Dog Sitting") {
                    router.push('/services/dog-sitting');
                  } else if (service.title === "Rabbit Sitting") {
                    router.push('/services/rabbit-sitting');
                  } else if (service.title === "Bird Sitting") {
                    router.push('/services/bird-sitting');
                  } else if (service.title === "Pocket Pet Sitting") {
                    router.push('/services/pocket-pet-sitting');
                  } else if (service.title === "Multiple Pet Types") {
                    router.push('/services/multiple-pet-types');
                  } else {
                    // For other services, go to service inquiry
                    router.push('/service-inquiry');
                  }
                }}
              >
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
                    <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                      Pet Sitting
                    </span>
                  </div>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-600">Duration: {service.duration}</span>
                    <span className="font-semibold text-green-600">{service.price}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-primary font-medium">Click to view details →</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* View All Services Button */}
          <div className="text-center mt-8">
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                // Cycle through categories to show all services
                const categories = Object.keys(serviceCategories) as Array<keyof ServiceCategories>;
                const currentIndex = categories.indexOf(activeCategory);
                const nextIndex = (currentIndex + 1) % categories.length;
                setActiveCategory(categories[nextIndex]);
              }}
              className="rounded-full px-8"
            >
              Browse More Services
            </Button>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="mb-16 bg-card/50 rounded-2xl p-8 shadow-sm">
          <h2 className="text-3xl font-bold text-center mb-8">Why Choose Whiskarz?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <section className="bg-green-50 rounded-2xl p-8 text-center">
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

      </main>
    </div>
  );
}
