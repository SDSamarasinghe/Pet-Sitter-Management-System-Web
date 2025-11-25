'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import api, { authApi } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        variant: "destructive",
        title: "Email required",
        description: "Please enter your email address.",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await authApi.forgotPassword(email.trim());
      
      // Always show success message for security reasons
      setIsSubmitted(true);
      toast({
        title: "Reset link sent!",
        description: "If your email exists, you'll receive a reset link shortly.",
      });
    } catch (error: any) {
      // Still show success message even on error for security
      setIsSubmitted(true);
      toast({
        title: "Reset link sent!",
        description: "If your email exists, you'll receive a reset link shortly.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-gold-50 flex items-center justify-center section-padding">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8 animate-fadeIn">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-gold-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Check Your Email</h1>
            <p className="text-gray-600">We&apos;ve sent a password reset link to your email address</p>
          </div>

          {/* Success Card */}
          <div className="card-modern p-8 animate-slideUp">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Reset Link Sent</h2>
                <p className="text-gray-600 mb-4">
                  If an account with email <strong>{email}</strong> exists, you&apos;ll receive a password reset link shortly.
                </p>
                <p className="text-sm text-gray-500">
                  Don&apos;t see the email? Check your spam folder or try again.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => router.push('/login')}
                  className="w-full btn-primary py-3 text-base font-medium"
                >
                  Back to Login
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail('');
                  }}
                  className="w-full btn-outline py-3 text-base font-medium"
                >
                  Try Different Email
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-gold-50 flex items-center justify-center section-padding">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-gold-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
          <p className="text-gray-600">Enter your email address and we&apos;ll send you a reset link</p>
        </div>

        {/* Forgot Password Form */}
        <div className="card-modern p-8 animate-slideUp">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-modern w-full"
                disabled={isLoading}
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                We&apos;ll send a password reset link to this email address
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full btn-primary py-3 text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Sending Reset Link...
                </>
              ) : (
                'Send Reset Link'
              )}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Remember your password?</span>
              </div>
            </div>

            <div className="mt-4 text-center">
              <Button
                variant="outline"
                onClick={() => router.push('/login')}
                className="w-full btn-outline py-3 text-base font-medium"
                disabled={isLoading}
              >
                Back to Login
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          Need help?{' '}
          <a href="/contact" className="text-primary hover:text-gold-600 transition-colors duration-200">
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
