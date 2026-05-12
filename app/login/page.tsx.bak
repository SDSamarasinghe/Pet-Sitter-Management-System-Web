'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';
import api, { authApi } from '@/lib/api';
import { setToken, isAuthenticated, getUserRole } from '@/lib/auth';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated()) {
      const userRole = getUserRole();
  // Regardless of role, authenticated users should land on the unified dashboard
  router.replace('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await authApi.login(email, password);
      const { access_token } = response.data;
      setToken(access_token);
      toast({
        title: "Login successful!",
        description: "Welcome back to your dashboard.",
      });
      // Redirect based on user role and force reload to update header state
      // Redirect all users to the unified dashboard after login to keep routes consistent
      if (typeof window !== 'undefined') {
        window.location.href = '/dashboard';
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.response?.data?.message || 'Invalid credentials',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-bg-50 via-white to-navy-blue-50 flex items-center justify-center section-padding">
      <div className="w-full max-w-md">
        {/* Header */}
        {/* <div className="text-center animate-fade-in-up">
            <img 
                src="/Petsitter-logo.png" 
                alt="Whiskarz Logo" 
                className="h-48 lg:h-56 xl:h-64 w-auto mx-auto"
              />
        </div> */}

        {/* Login Form */}
        <div className="card-modern spacing-lg animate-scale-in">
           <div className="text-center mb-12 animate-fade-in-up">
            <img 
                src="/w-logo.png" 
                alt="Whiskarz Logo" 
                className="h-24 lg:h-24 xl:h-24 w-auto mx-auto"
              />
           <span className="text-xl lg:text-2xl font-bold tracking-wide text-primary select-none hidden sm:inline">WHISKARZ</span>

        </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-modern w-full focus-ring"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-modern w-full pr-10 focus-ring"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-primary transition-colors duration-200"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-border rounded focus-ring"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-muted-foreground">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="/forgot-password" className="font-medium text-primary hover:text-accent transition-colors duration-200">
                  Forgot password?
                </a>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full btn-primary py-3 text-base font-medium touch-manipulation"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-muted-foreground">Don't have an account?</span>
              </div>
            </div>

            <div className="mt-4 text-center">
              <Button
                variant="outline"
                onClick={() => router.push('/signup')}
                className="w-full btn-outline py-3 text-base font-medium touch-manipulation"
                disabled={isLoading}
              >
                Create Account
              </Button>
            </div>
          </div> */}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground animate-fade-in-up">
          By signing in, you agree to our{' '}
          <a href="/terms" className="text-primary hover:text-accent transition-colors duration-200">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-primary hover:text-accent transition-colors duration-200">
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
}
