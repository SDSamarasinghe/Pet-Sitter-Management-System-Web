'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';
import api from '@/lib/api';
import { setToken, isAuthenticated, getUserRole } from '@/lib/auth';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated()) {
      const userRole = getUserRole();
      if (userRole === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token } = response.data;
      setToken(access_token);
      toast({
        title: "Login successful!",
        description: "Welcome back to your dashboard.",
      });
      // Redirect based on user role and force reload to update header state
      const userRole = getUserRole();
      if (typeof window !== 'undefined') {
        if (userRole === 'admin') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/dashboard';
        }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center section-padding">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your PetCare account</p>
        </div>

        {/* Login Form */}
        <div className="card-modern p-8 animate-slideUp">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-modern w-full"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-modern w-full"
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
                  Forgot password?
                </a>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full btn-primary py-3 text-base font-medium"
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

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
              </div>
            </div>

            <div className="mt-4 text-center">
              <Button
                variant="outline"
                onClick={() => router.push('/signup')}
                className="w-full btn-outline py-3 text-base font-medium"
                disabled={isLoading}
              >
                Create Account
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          By signing in, you agree to our{' '}
          <a href="/terms" className="text-blue-600 hover:text-blue-500 transition-colors duration-200">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-blue-600 hover:text-blue-500 transition-colors duration-200">
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
}
