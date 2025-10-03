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

  // Define navigation items based on user roles
  const navItems: NavItem[] = [
    {
      label: 'Communication',
      href: '/dashboard?tab=communication',
      tab: 'communication',
      icon: <MessageSquare className="w-5 h-5" />,
      roles: ['admin', 'sitter', 'client'],
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
    {
      label: 'Address Changes',
      href: '/dashboard?tab=address-changes',
      tab: 'address-changes',
      icon: <MapPin className="w-5 h-5" />,
      roles: ['admin'],
    },
    // Sitter specific items
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
    {
      label: 'Dashboard',
      href: '/dashboard?tab=dashboard',
      tab: 'dashboard',
      icon: <Home className="w-5 h-5" />,
      roles: ['sitter'],
    },
    // Client specific items
    {
      label: 'My Profile',
      href: '/dashboard?tab=profile',
      tab: 'profile',
      icon: <UserCircle className="w-5 h-5" />,
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
  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(userRole)
  );

  const isActive = (item: NavItem) => {
    if (pathname !== '/dashboard') return false;
    
    // If no tab param, first item is active (communication)
    if (!currentTab) {
      return item.tab === 'communication';
    }
    
    return currentTab === item.tab;
  };

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  return (
    <aside
      className={`
        fixed left-0 top-16 lg:top-20 bottom-0 z-30
        bg-white border-r border-gray-200
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-16' : 'w-64'}
        flex flex-col
      `}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
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
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {filteredNavItems.map((item) => (
          <button
            key={item.href}
            onClick={() => handleNavigation(item.href)}
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
        ))}
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
  );
};
