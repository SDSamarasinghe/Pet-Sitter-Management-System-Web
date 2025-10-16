"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  isAuthenticated, 
  removeToken, 
  getUserFromToken, 
  getUserRole 
} from "@/lib/auth";
import { useNavigation } from "./providers/NavigationProvider";
import api from "@/lib/api";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  profilePicture?: string;
}

const CentralizedHeader: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { navigationItems } = useNavigation();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userToken = getUserFromToken();
    if (userToken) {
      setUser(userToken);
      // Fetch full user profile to get profile picture
      fetchUserProfile();
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      setUser(prev => ({
        ...prev,
        ...response.data,
        id: response.data._id || response.data.id
      }));
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleLogout = () => {
    removeToken();
    setUser(null);
    setDropdownOpen(false);
    router.push("/");
  };

  const handleNavigation = (href: string) => {
    router.push(href);
    setIsOpen(false); // Close mobile menu
  };

  const isCurrentPath = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const getUserDisplayName = (user: User) => {
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return user.email;
  };

  const getRoleBadge = (role: string) => {
    const roleColors = {
      admin: 'bg-destructive/10 text-destructive',
      sitter: 'bg-secondary/10 text-secondary', 
      client: 'bg-primary/10 text-primary'
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'}`}>
        {role}
      </span>
    );
  };

  return (
    <header className="glass sticky top-0 z-50 w-full border-b border-gray-200/20 backdrop-blur-xl bg-white/95">
      <div className="container-modern">
        <div className="flex h-16 lg:h-20 items-center justify-between">
          {/* Logo - Left aligned */}
          <div 
            className="flex items-center space-x-2 cursor-pointer hover:scale-105 transition-transform duration-200 flex-shrink-0" 
            onClick={() => handleNavigation("/")}
          >
            <img 
              src="/w-logo.png" 
              alt="Whiskarz Logo" 
              className="h-10 lg:h-12 w-auto"
            />
            <span className="text-xl lg:text-2xl font-bold tracking-wide text-primary select-none hidden sm:inline">WHISKARZ</span>
          </div>

          {/* Desktop Navigation - Center */}
          <nav className="hidden lg:flex items-center space-x-1 flex-1 justify-center">
            {navigationItems.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                onClick={() => handleNavigation(item.href)}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  isCurrentPath(item.href)
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                }`}
              >
                {item.name}
              </Button>
            ))}
          </nav>

          {/* Right side - Auth section - Right aligned */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            {isAuthenticated() && user ? (
              <div className="relative" ref={dropdownRef}>
                <Button
                  variant="ghost"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full overflow-hidden bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
                    {user?.profilePicture ? (
                      <img 
                        src={user.profilePicture} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-semibold text-sm lg:text-base">
                        {getUserDisplayName(user).charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="hidden lg:block text-left">
                    <div className="text-sm font-semibold text-gray-900">
                      {getUserDisplayName(user)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {getRoleBadge(user.role)}
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 transition-transform duration-200" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-200/20 py-2 animate-scaleIn">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="text-sm font-semibold text-gray-900">
                        {getUserDisplayName(user)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {user.email}
                      </div>
                      <div className="mt-2">
                        {getRoleBadge(user.role)}
                      </div>
                    </div>
                    
                    <div className="py-2">
                      <button
                        onClick={() => { setDropdownOpen(false); handleNavigation('/dashboard'); }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors duration-150"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        Dashboard
                      </button>
                      
                      <button
                        onClick={() => { setDropdownOpen(false); handleNavigation('/profile'); }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors duration-150"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                      </button>
                      
                      {user.role === 'client' && (
                        <button
                          onClick={() => { setDropdownOpen(false); handleNavigation('/pets'); }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors duration-150"
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          My Pets
                        </button>
                      )}
                    </div>

                    <div className="border-t border-gray-100 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden lg:flex lg:items-center lg:space-x-3">
                <Button 
                  variant="ghost" 
                  onClick={() => handleNavigation("/login")}
                  className="px-6 py-2 rounded-xl font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => handleNavigation("/signup")}
                  className="btn-primary px-6 py-2"
                >
                  Join As Sitter
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              className="lg:hidden p-2 rounded-xl hover:bg-gray-50"
              onClick={() => setIsOpen(!isOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="lg:hidden border-t border-gray-200/20 py-4 animate-slideUp">
            <nav className="flex flex-col space-y-2">
              {navigationItems.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  onClick={() => handleNavigation(item.href)}
                  className={`justify-start px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isCurrentPath(item.href)
                      ? 'bg-primary/10 text-primary shadow-sm'
                      : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  {item.name}
                </Button>
              ))}

              {!isAuthenticated() && (
                <>
                  <div className="border-t border-gray-200/50 pt-4 mt-4">
                    <Button 
                      variant="ghost" 
                      onClick={() => handleNavigation("/login")}
                      className="w-full justify-start px-4 py-3 rounded-xl font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200"
                    >
                      Sign In
                    </Button>
                    <Button 
                      onClick={() => handleNavigation("/signup")}
                      className="w-full mt-2 btn-primary py-3"
                    >
                      Join As Sitter
                    </Button>
                  </div>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default CentralizedHeader;
