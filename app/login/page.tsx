'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
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
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col">
      {/* Login Form */}
      <main className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 mt-4 text-gray-900">Welcome back</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-base font-medium text-gray-800">Email</label>
              <input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 "
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="block text-base font-medium text-gray-800">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 rounded border"
              />
            </div>
            <div className="flex justify-start items-center">
              <a href="/forgot-password" className="text-[#5b9cf6] text-sm hover:underline">Forgot password?</a>
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Logging in...
                </>
              ) : (
                'Log in'
              )}
            </Button>
          </form>
          <div className="text-center mt-6">
            <a href="/signup" className="text-sm text-gray-700 hover:underline">Don't have an account? <span className="text-[#5b9cf6]">Sign up</span></a>
          </div>
        </div>
      </main>
    </div>
  );
}
