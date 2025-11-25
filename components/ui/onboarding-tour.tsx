"use client";

import { useState, useEffect } from 'react';
import { Button } from './button';

interface TourStep {
  target: string;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingTourProps {
  steps: TourStep[];
  onComplete: () => void;
  onSkip: () => void;
  isOpen: boolean;
}

export function OnboardingTour({ steps, onComplete, onSkip, isOpen }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Open mobile sidebar when tour starts on mobile for navigation steps
  useEffect(() => {
    if (!isOpen || !isMobile) return;

    const step = steps[currentStep];
    const isNavigationStep = step.target.includes('-nav');
    
    if (isNavigationStep) {
      // Open mobile sidebar for navigation steps
      window.dispatchEvent(new Event('tour:openSidebar'));
    } else {
      // Close mobile sidebar for non-navigation steps
      window.dispatchEvent(new Event('tour:closeSidebar'));
    }
  }, [currentStep, steps, isOpen, isMobile]);

  useEffect(() => {
    if (!isOpen || currentStep >= steps.length) return;

    const step = steps[currentStep];
    const element = document.querySelector(step.target) as HTMLElement;
    
    if (element) {
      setTargetElement(element);
      
      // Scroll element into view
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Highlight the element
      element.style.position = 'relative';
      element.style.zIndex = '9999';
      
      // Calculate position for tooltip
      const updatePosition = () => {
        const rect = element.getBoundingClientRect();
        const isMobile = window.innerWidth < 1024; // lg breakpoint
        const isNavigationStep = step.target.includes('-nav');
        
        // On mobile with sidebar open (navigation steps), adjust for sidebar width
        const sidebarWidth = isMobile && isNavigationStep ? 256 : 0; // w-64 = 256px
        const tooltipWidth = isMobile ? window.innerWidth - 32 : 400;
        const tooltipHeight = isMobile ? 'auto' : 250;
        
        let top = rect.bottom + 20;
        let left = 16;
        
        // For mobile, position to the right of sidebar when it's open
        if (isMobile) {
          if (isNavigationStep) {
            // Sidebar is open, position tooltip to not overlap
            left = Math.max(16, rect.right + 20);
            // If there's not enough space, position below
            if (left + tooltipWidth > window.innerWidth - 16) {
              left = 16;
              top = rect.bottom + 20;
            }
          } else {
            // Sidebar is closed, center the tooltip
            left = 16;
          }
        } else {
          // Desktop positioning
          left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
          
          // Adjust if tooltip goes off screen on desktop
          if (left < 20) left = 20;
          if (left + tooltipWidth > window.innerWidth - 20) {
            left = window.innerWidth - tooltipWidth - 20;
          }
        }
        
        // Adjust vertical position if tooltip goes off screen
        if (typeof tooltipHeight === 'number' && top + tooltipHeight > window.innerHeight - 20) {
          top = rect.top - tooltipHeight - 20;
          // If still off screen, position at bottom with some padding
          if (top < 20) {
            top = window.innerHeight - tooltipHeight - 20;
          }
        }
        
        // On mobile, ensure tooltip is visible
        if (isMobile) {
          const maxTop = window.innerHeight - 320; // Estimate height with some buffer
          if (top > maxTop) {
            top = maxTop;
          }
          if (top < 80) { // Keep below header
            top = 80;
          }
        }
        
        setPosition({ top, left });
      };

      setTimeout(updatePosition, 100);
      
      // Update position on resize
      window.addEventListener('resize', updatePosition);
      window.addEventListener('orientationchange', updatePosition);
      
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('orientationchange', updatePosition);
        if (element) {
          element.style.position = '';
          element.style.zIndex = '';
        }
      };
    }
  }, [currentStep, steps, isOpen]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    if (targetElement) {
      targetElement.style.position = '';
      targetElement.style.zIndex = '';
    }
    // Close mobile sidebar when tour completes
    if (isMobile) {
      window.dispatchEvent(new Event('tour:closeSidebar'));
    }
    onComplete();
  };

  const handleSkip = () => {
    if (targetElement) {
      targetElement.style.position = '';
      targetElement.style.zIndex = '';
    }
    // Close mobile sidebar when tour is skipped
    if (isMobile) {
      window.dispatchEvent(new Event('tour:closeSidebar'));
    }
    onSkip();
  };

  if (!isOpen || currentStep >= steps.length) return null;

  const step = steps[currentStep];

  return (
    <>
      {/* Backdrop overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-60 z-[9998]" onClick={handleSkip} />
      
      {/* Spotlight effect on target element */}
      {targetElement && (
        <div 
          className="fixed z-[9999] pointer-events-none"
          style={{
            top: targetElement.getBoundingClientRect().top - 8,
            left: targetElement.getBoundingClientRect().left - 8,
            width: targetElement.getBoundingClientRect().width + 16,
            height: targetElement.getBoundingClientRect().height + 16,
            boxShadow: '0 0 0 4px rgba(14, 116, 144, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.6)',
            borderRadius: '12px',
            transition: 'all 0.3s ease'
          }}
        />
      )}

      {/* Tour tooltip */}
      <div
        className="fixed z-[10000] bg-white rounded-xl shadow-2xl border-2 border-primary w-[calc(100vw-32px)] sm:w-[400px] max-w-[400px] animate-fadeIn"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        {/* Header */}
        <div className="bg-primary text-white p-3 sm:p-4 rounded-t-lg">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-base sm:text-lg font-bold pr-2">{step.title}</h3>
            <button
              onClick={handleSkip}
              className="text-white hover:bg-white/20 rounded-full p-1 transition-colors flex-shrink-0"
              aria-label="Skip tour"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-1">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 sm:h-1.5 flex-1 rounded-full transition-all ${
                  idx === currentStep
                    ? 'bg-white'
                    : idx < currentStep
                    ? 'bg-white/60'
                    : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5">
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-3 sm:mb-4">{step.description}</p>
          
          <div className="flex items-center justify-between pt-3 border-t gap-3">
            <div className="text-xs sm:text-sm text-gray-500 flex-shrink-0">
              {currentStep + 1}/{steps.length}
            </div>
            
            <div className="flex gap-2 flex-wrap justify-end">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  className="text-xs sm:text-sm h-8 sm:h-9 px-3"
                >
                  Previous
                </Button>
              )}
              
              {currentStep < steps.length - 1 ? (
                <Button
                  size="sm"
                  onClick={handleNext}
                  className="bg-primary hover:bg-primary/90 text-xs sm:text-sm h-8 sm:h-9 px-3"
                >
                  Next
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleComplete}
                  className="bg-primary hover:bg-primary/90 text-xs sm:text-sm h-8 sm:h-9 px-3 whitespace-nowrap"
                >
                  Get Started!
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
