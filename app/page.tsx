"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-bg-50 via-white to-navy-blue-50">
      {/* Hero Section */}
      <section className="section-padding">
        <div className="container-modern">
          <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
            <h1 className="text-responsive-4xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight">
              Professional Pet Care You Can Trust
            </h1>
            <p className="text-responsive-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Toronto's most trusted in-home pet care service. Professional, experienced, and insured pet sitters who will love your pets like their own.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
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

      {/* Features Section */}
      <section className="py-16 sm:py-20">
        <div className="container-modern">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 animate-stagger">
            <div className="card-modern spacing-lg text-center group">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 transition-colors duration-300 group-hover:bg-primary/90">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">Trusted & Insured</h3>
              <p className="text-muted-foreground leading-relaxed">All our sitters are fully insured, bonded, and background checked for your peace of mind.</p>
            </div>
            
            <div className="card-modern spacing-lg text-center group">
              <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 transition-colors duration-300 group-hover:bg-secondary/90">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">Experienced Care</h3>
              <p className="text-muted-foreground leading-relaxed">Professional pet sitters with years of experience caring for all types of pets with love and dedication.</p>
            </div>
            
            <div className="card-modern spacing-lg text-center group">
              <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-6 transition-colors duration-300 group-hover:bg-accent/90">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">24/7 Support</h3>
              <p className="text-muted-foreground leading-relaxed">Always available for questions, updates, and emergency support whenever you need us.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview Section */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="container-modern">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-responsive-3xl font-bold mb-6 text-foreground">
              Complete Pet Care Services
            </h2>
            <p className="text-responsive-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              From daily walks to extended stays, we provide comprehensive care tailored to your pet's unique needs.
            </p>
          </div>

          <div className="mobile-grid animate-stagger">
            {[
              { name: "Dog Walking", icon: "🐕", description: "Daily exercise and socialization" },
              { name: "Pet Sitting", icon: "🏠", description: "In-home care and companionship" },
              { name: "Cat Care", icon: "🐱", description: "Specialized feline attention" },
              { name: "Specialized Care", icon: "🐦", description: "Birds, rabbits, and exotic pets" }
            ].map((service, index) => (
              <div key={service.name} className="card-modern spacing-md transition-all duration-200 hover:border-primary/20">
                <div className="text-3xl mb-4">{service.icon}</div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">{service.name}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button 
              onClick={() => router.push('/services')} 
              className="px-8 py-3 text-lg"
            >
              View All Services
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20">
        <div className="container-modern">
          <div className="card-modern spacing-xl text-center rounded-3xl">
            <h2 className="text-responsive-2xl font-bold mb-6 text-foreground">
              Ready to Give Your Pet the Best Care?
            </h2>
            <p className="text-responsive-base text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Join hundreds of satisfied pet owners who trust us with their beloved companions. Get started today with a personalized care plan.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => router.push('/service-inquiry')} 
                className="px-8 py-4 text-lg"
              >
                Book Your Service
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => router.push('/signup')} 
                className="px-8 py-4 text-lg"
              >
                Become a Sitter
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
