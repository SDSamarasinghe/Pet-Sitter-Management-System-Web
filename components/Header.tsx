'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { isAuthenticated, getUserFromToken, getUserRole, removeToken } from '@/lib/auth';

interface HeaderProps {
  showAuthButtons?: boolean;
}

export default function Header({ showAuthButtons = true }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    if (isAuthenticated()) {
      const userToken = getUserFromToken();
      if (userToken) {
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
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    removeToken();
    setUser(null);
    setIsDropdownOpen(false);
    router.push('/login');
  };

  const handleDashboardNavigation = () => {
    const userRole = getUserRole();
    if (userRole === 'admin') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
    setIsDropdownOpen(false);
  };

  return (
    <header className="w-full flex items-center justify-between px-8 py-4 bg-white rounded-b-xl border-b border-gray-200">
      <div className="flex items-center gap-2">
        <button 
          onClick={() => router.push('/')}
          className="font-bold text-xl tracking-tight flex items-center gap-2 hover:opacity-80"
        >
          <span className="inline-block w-6 h-6 bg-black rounded-full mr-1" /> PetPal
        </button>
      </div>
      
      <nav className="flex items-center gap-4">
        {/* Always show these navigation links */}
        <button 
          className="text-gray-700 hover:text-black text-sm font-medium" 
          onClick={() => router.push('/find-care')}
        >
          Find Care
        </button>
        <button 
          className="text-gray-700 hover:text-black text-sm font-medium" 
          onClick={() => router.push('/service-inquiry')}
        >
          Service Inquiry
        </button>

        {showAuthButtons && (
          <>
            {user ? (
              /* Authenticated User Dropdown */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-black focus:outline-none"
                >
                  <span className="text-sm font-medium">Hello, {user.firstName}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                    <button
                      onClick={() => {
                        router.push('/profile');
                        setIsDropdownOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile
                    </button>
                    <button
                      onClick={handleDashboardNavigation}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      </svg>
                      {getUserRole() === 'admin' ? 'Admin Panel' : 'Dashboard'}
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Not Authenticated - Show Login/Signup buttons */
              <>
                <Button 
                  className="bg-[#5b9cf6] text-white px-5 py-2 rounded-xl font-semibold text-sm shadow hover:bg-[#357ae8]" 
                  onClick={() => router.push('/login')}
                >
                  Log in
                </Button>
                <Button 
                  className="bg-[#f5f6fa] text-gray-900 px-5 py-2 rounded-xl font-semibold text-sm shadow hover:bg-gray-200" 
                  onClick={() => router.push('/signup')}
                >
                  Sign up
                </Button>
              </>
            )}
          </>
        )}
      </nav>
    </header>
  );
}
