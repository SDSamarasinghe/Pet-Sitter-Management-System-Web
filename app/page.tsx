"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import BannerSlider from "../components/ui/BannerSlider";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-bg-50 via-white to-navy-blue-50">
      {/* Promotional Banner */}
      <div className="bg-gradient-to-r from-primary via-secondary to-accent text-white py-3 shadow-md">
        <div className="container-modern">
          <div className="flex items-center justify-center gap-4 text-center">
            <svg className="w-5 h-5 flex-shrink-0 hidden sm:block" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm sm:text-base font-medium">
              🎉 New Customer Special: <span className="font-bold">15% OFF</span> your first booking! Use code: <span className="font-bold bg-white/20 px-2 py-1 rounded">NEWPET15</span>
            </p>
            <svg className="w-5 h-5 flex-shrink-0 hidden sm:block" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container-modern">
          <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
            <h1 className="text-responsive-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight">
              Professional Pet Care You Can Trust
            </h1>
            <p className="text-responsive-lg text-muted-foreground mb-6 max-w-2xl mx-auto leading-relaxed">
              Toronto&apos;s most trusted in-home pet care service. Professional, experienced, and insured pet sitters who will love your pets like their own.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                size="lg" 
                onClick={() => router.push('/services')} 
                className="px-8 py-4 text-lg"
              >
                Explore Our Services
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => router.push('/service-inquiry')} 
                className="px-8 py-4 text-lg"
              >
                Get a Quote
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Banner Slide View Section - Full Width */}
      <section className="w-full py-0">
        <BannerSlider />
      </section>

      {/* Services Preview Section */}
      <section className="py-10 sm:py-12 lg:py-16 bg-muted/30">
        <div className="container-modern">
          <div className="text-center mb-10 animate-fade-in-up">
            <h2 className="text-responsive-3xl font-bold mb-4 text-foreground">
              Complete Pet Care Services
            </h2>
            <p className="text-responsive-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              From daily walks to extended stays, we provide comprehensive care tailored to your pet&apos;s unique needs.
            </p>
          </div>

          <div className="mobile-grid animate-stagger">
            {[
              {
                name: "Dog Walking",
                image: "/dog-walking.jpg",
                description: "Daily exercise and socialization"
              },
              {
                name: "Pet Sitting",
                image: "/pet-sitting.jpg",
                description: "In-home care and companionship"
              },
              {
                name: "Cat Care",
                image: "/cat-care.jpg",
                description: "Specialized feline attention"
              },
              {
                name: "Specialized Care",
                image: "/exotic-pets.jpg",
                description: "Birds, rabbits, and exotic pets"
              }
            ].map((service, index) => (
              <div
                key={service.name}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-primary/50"
              >
                {/* Image Container */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Gradient Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                {/* Content */}
                <div className="p-5 text-center">
                  <h3 className="text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-colors duration-300">
                    {service.name}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button 
              onClick={() => router.push('/services')} 
              className="px-8 py-3 text-lg"
            >
              View All Services
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
