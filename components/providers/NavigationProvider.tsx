'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated, getUserRole } from '@/lib/auth';

interface NavigationItem {
  name: string;
  href: string;
  show: 'always' | 'authenticated' | 'guest' | 'admin' | 'sitter' | 'client';
}

interface NavigationContextType {
  navigationItems: NavigationItem[];
  currentPath: string;
  userRole: string | null;
  isLoggedIn: boolean;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

// Define navigation items based on user roles
const getNavigationItems = (userRole: string | null, isLoggedIn: boolean): NavigationItem[] => {
  const items: NavigationItem[] = [
  { name: 'Home', href: '/', show: 'always' },
  { name: 'Service Inquiry', href: '/service-inquiry', show: 'always' },
    { name: 'Services', href: '/services', show: 'always' },
  ];

  if (isLoggedIn) {
    items.push(
      // Admins should also land on the unified /dashboard route
      { name: 'Dashboard', href: '/dashboard', show: 'authenticated' },
      { name: 'Bookings', href: '/bookings', show: 'authenticated' },
      // { name: 'Profile', href: '/profile', show: 'authenticated' }
    );

    if (userRole === 'admin') {
      items.push(
        { name: 'Reports', href: '/reports', show: 'admin' }
      );
    }

    // if (userRole === 'sitter') {
    //   items.push(
    //     { name: 'My Clients', href: '/dashboard?tab=users', show: 'sitter' }
    //   );
    // }
  }

  return items;
};

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const currentPath = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setIsLoggedIn(authenticated);
      
      if (authenticated) {
        const role = getUserRole();
        setUserRole(role);
      } else {
        setUserRole(null);
      }
    };

    checkAuth();
    
    // Listen for auth changes
    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, []);

  const navigationItems = getNavigationItems(userRole, isLoggedIn);

  return (
    <NavigationContext.Provider value={{
      navigationItems,
      currentPath,
      userRole,
      isLoggedIn
    }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
