"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import CentralizedHeader from '@/components/CentralizedHeader';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import { getUserRole } from '@/lib/auth';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'sitter' | 'client'>('client');

  useEffect(() => {
    const role = getUserRole();
    if (role) {
      setUserRole(role as 'admin' | 'sitter' | 'client');
    }
  }, []);

  // Pages that should not show sidebar
  const noSidebarPages = [
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/',
  ];

  // Pages that SHOULD show footer (whitelist approach)
  const showFooterPages = [
    '/',
    '/login',
    '/service-inquiry',
  ];
  
  // Check if current path should show footer
  const shouldShowFooter = () => {
    if (!pathname) return false;
    
    // Check exact matches
    if (showFooterPages.includes(pathname)) return true;
    
    // Check if path starts with /services
    if (pathname.startsWith('/services')) return true;
    
    return false;
  };

  const showSidebar = pathname?.startsWith('/dashboard') && !noSidebarPages.some(page => pathname === page);
  const showFooter = shouldShowFooter();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header - Always visible */}
      <CentralizedHeader />

      {/* Main Content Area with Footer */}
      <div className="flex flex-1 pt-16 lg:pt-20">
        {/* Sidebar - Conditional */}
        {showSidebar && (
          <>
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
              <Sidebar 
                userRole={userRole}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              />
            </div>

            {/* Mobile Sidebar - Drawer Style */}
            <div className="lg:hidden">
              {/* Mobile sidebar would go here - can be implemented as a drawer */}
            </div>
          </>
        )}

        {/* Scrollable Container for Main Content + Footer */}
        <div 
          className={`
            flex-1 
            ${showSidebar ? (isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64') : ''}
            transition-all duration-300
            overflow-y-auto
            h-[calc(100vh-4rem)]
            lg:h-[calc(100vh-5rem)]
            flex flex-col
          `}
        >
          {/* Main Content */}
          <main className="flex-1 min-h-0">
            {children}
          </main>

          {/* Footer - Inside scrollable area */}
          {showFooter && <Footer />}
        </div>
      </div>
    </div>
  );
};
