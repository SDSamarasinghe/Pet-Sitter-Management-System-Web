'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { setToken, isAuthenticated } from '@/lib/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token } = response.data;
      setToken(access_token);
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col">
      {/* Header/Nav */}
      <header className="w-full flex items-center justify-between px-8 py-4 bg-white rounded-b-xl border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xl tracking-tight flex items-center gap-2">
            <span className="inline-block w-6 h-6 bg-black rounded-full mr-1" /> PetPal
          </span>
        </div>
        <nav className="flex items-center gap-4">
          <button className="text-gray-700 hover:text-black text-sm font-medium" onClick={() => router.push('/find-care')}>Find Care</button>
          <button className="text-gray-700 hover:text-black text-sm font-medium" onClick={() => router.push('/service-inquiry')}>Become a Sitter</button>
          <button className="bg-[#5b9cf6] text-white px-5 py-2 rounded-xl font-semibold text-sm shadow hover:bg-[#357ae8]" onClick={() => router.push('/login')}>Log in</button>
          <button className="bg-[#f5f6fa] text-gray-900 px-5 py-2 rounded-xl font-semibold text-sm shadow hover:bg-gray-200" onClick={() => router.push('/signup')}>Sign up</button>
        </nav>
      </header>
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
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5b9cf6] text-base"
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
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5b9cf6] text-base"
              />
            </div>
            <div className="flex justify-start items-center">
              <a href="/forgot-password" className="text-[#5b9cf6] text-sm hover:underline">Forgot password?</a>
            </div>
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}
            <button 
              type="submit" 
              className="w-full bg-[#5b9cf6] hover:bg-[#357ae8] text-white font-semibold rounded-xl py-3 text-base transition-colors"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Log in'}
            </button>
          </form>
          <div className="text-center mt-6">
            <a href="/signup" className="text-sm text-gray-700 hover:underline">Don't have an account? <span className="text-[#5b9cf6]">Sign up</span></a>
          </div>
        </div>
      </main>
    </div>
  );
}
