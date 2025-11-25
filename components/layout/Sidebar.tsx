"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  MessageSquare, 
  Users, 
  Calendar, 
  PawPrint, 
  FileText, 
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  UserCircle,
  Shield,
  BookOpen,
  CreditCard,
  MapPin
} from 'lucide-react';

interface SidebarProps {
  userRole?: 'admin' | 'sitter' | 'client';
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: string[];
  badge?: number;
  tab?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  userRole = 'client',
  isCollapsed = false,
  onToggleCollapse
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams?.get('tab');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Listen for tour events to control mobile sidebar
  useEffect(() => {
    const handleOpenSidebar = () => setIsMobileOpen(true);
    const handleCloseSidebar = () => setIsMobileOpen(false);
    
    window.addEventListener('tour:openSidebar', handleOpenSidebar);
    window.addEventListener('tour:closeSidebar', handleCloseSidebar);
    
    return () => {
      window.removeEventListener('tour:openSidebar', handleOpenSidebar);
      window.removeEventListener('tour:closeSidebar', handleCloseSidebar);
    };
  }, []);

  // Define navigation items based on user roles
  // Define navigation items based on user roles
  const navItems: NavItem[] = [
    // Sitter specific items - Dashboard first for sitters
    {
      label: 'Dashboard',
      href: '/dashboard?tab=dashboard',
      tab: 'dashboard',
      icon: <Home className="w-5 h-5" />,
      roles: ['sitter'],
    },
    {
      label: 'Communication',
      href: '/dashboard?tab=communication',
      tab: 'communication',
      icon: <MessageSquare className="w-5 h-5" />,
      roles: ['admin', 'sitter', 'client'],
    },
    {
      label: 'My Clients',
      href: '/dashboard?tab=users',
      tab: 'users',
      icon: <Users className="w-5 h-5" />,
      roles: ['sitter'],
    },
    {
      label: 'Scheduling',
      href: '/dashboard?tab=scheduling',
      tab: 'scheduling',
      icon: <Calendar className="w-5 h-5" />,
      roles: ['sitter'],
    },
    {
      label: 'My Profile',
      href: '/dashboard?tab=profile',
      tab: 'profile',
      icon: <UserCircle className="w-5 h-5" />,
      roles: ['sitter'],
    },
    // Admin specific items
    {
      label: 'Users',
      href: '/dashboard?tab=users',
      tab: 'users',
      icon: <Users className="w-5 h-5" />,
      roles: ['admin'],
    },
    {
      label: 'Sitters',
      href: '/dashboard?tab=sitters',
      tab: 'sitters',
      icon: <Users className="w-5 h-5" />,
      roles: ['admin'],
    },
    {
      label: 'Bookings',
      href: '/dashboard?tab=bookings',
      tab: 'bookings',
      icon: <Calendar className="w-5 h-5" />,
      roles: ['admin'],
    },
    {
      label: 'Pets',
      href: '/dashboard?tab=pets',
      tab: 'pets',
      icon: <PawPrint className="w-5 h-5" />,
      roles: ['admin'],
    },
    // Client specific items - My Profile first for clients
    {
      label: 'My Profile',
      href: '/dashboard?tab=profile',
      tab: 'profile',
      icon: <UserCircle className="w-5 h-5" />,
      roles: ['client'],
    },
    {
      label: 'My Pets',
      href: '/dashboard?tab=pets',
      tab: 'pets',
      icon: <PawPrint className="w-5 h-5" />,
      roles: ['client'],
    },
    {
      label: 'Key Security',
      href: '/dashboard?tab=security',
      tab: 'security',
      icon: <Shield className="w-5 h-5" />,
      roles: ['client'],
    },
    {
      label: 'Book Now',
      href: '/dashboard?tab=booking',
      tab: 'booking',
      icon: <Calendar className="w-5 h-5" />,
      roles: ['client'],
    },
    {
      label: 'Invoices',
      href: '/dashboard?tab=invoices',
      tab: 'invoices',
      icon: <CreditCard className="w-5 h-5" />,
      roles: ['client'],
    },
  ];

  // Filter items based on user role
  let filteredNavItems = navItems.filter(item => item.roles.includes(userRole));
  // Move My Profile to top for clients
  if (userRole === 'client') {
    const profileIdx = filteredNavItems.findIndex(item => item.tab === 'profile');
    if (profileIdx > 0) {
      const [profileItem] = filteredNavItems.splice(profileIdx, 1);
      filteredNavItems = [profileItem, ...filteredNavItems];
    }
  }
  // Move Users to top for admins
  if (userRole === 'admin') {
    const usersIdx = filteredNavItems.findIndex(item => item.tab === 'users');
    if (usersIdx > 0) {
      const [usersItem] = filteredNavItems.splice(usersIdx, 1);
      filteredNavItems = [usersItem, ...filteredNavItems];
    }
  }

  const isActive = (item: NavItem) => {
    if (pathname !== '/dashboard') return false;
    
    // If no tab param, determine default based on user role
    if (!currentTab) {
      if (userRole === 'sitter') {
        return item.tab === 'dashboard';
      } else if (userRole === 'client') {
        return item.tab === 'profile';
      } else if (userRole === 'admin') {
        return item.tab === 'users';
      } else {
        return item.tab === 'communication';
      }
    }
    
    return currentTab === item.tab;
  };

  const handleNavigation = (href: string) => {
    router.push(href);
    setIsMobileOpen(false); // Close mobile menu after navigation
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        data-tour="mobile-menu-trigger"
        className="lg:hidden fixed left-4 top-24 z-50 p-3 rounded-xl bg-primary text-white shadow-lg hover:bg-primary/90 transition-all duration-200 hover:scale-105"
        aria-label="Toggle menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isMobileOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30 top-16 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-16 lg:top-20 bottom-0 z-40
          bg-white border-r border-gray-200/50
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-64
          flex flex-col
          shadow-2xl lg:shadow-none
        `}
      >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold text-gray-900">
            {(() => {
              // Find the active item and show its label
              const activeItem = filteredNavItems.find(isActive);
              return activeItem ? activeItem.label : 'Menu';
            })()}
          </h2>
        )}
        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </Button>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 p-3 space-y-1 min-h-0">
        {filteredNavItems.map((item) => {
          // Determine data-tour attribute for client navigation items
          let dataTour = '';
          if (userRole === 'client') {
            if (item.tab === 'profile') dataTour = 'my-profile-nav';
            else if (item.tab === 'pets') dataTour = 'my-pets-nav';
            else if (item.tab === 'communication') dataTour = 'communication-nav';
            else if (item.tab === 'security') dataTour = 'key-security-nav';
            else if (item.tab === 'booking') dataTour = 'book-now-nav';
            else if (item.tab === 'invoices') dataTour = 'invoices-nav';
          }
          
          return (
            <button
              key={item.href}
              onClick={() => handleNavigation(item.href)}
              data-tour={dataTour || undefined}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                text-sm font-medium transition-all duration-200
                ${isActive(item)
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-primary'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? item.label : undefined}
            >
              {item.icon}
              {!isCollapsed && (
                <span className="flex-1 text-left">{item.label}</span>
              )}
              {!isCollapsed && item.badge && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold rounded-full bg-red-100 text-red-600">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-gray-200">
        <Button
          variant="ghost"
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
            text-sm font-medium text-gray-700
            hover:bg-red-50 hover:text-red-600
            transition-all duration-200
            ${isCollapsed ? 'justify-center' : ''}
          `}
          title={isCollapsed ? 'Settings' : undefined}
        >
          <Settings className="w-5 h-5" />
          {!isCollapsed && <span>Settings</span>}
        </Button>
      </div>
    </aside>
    </>
  );
};
