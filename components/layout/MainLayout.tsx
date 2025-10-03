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

  // Pages that should not show footer
  const noFooterPages = [
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
  ];

  const showSidebar = pathname?.startsWith('/dashboard') && !noSidebarPages.some(page => pathname === page);
  const showFooter = !noFooterPages.some(page => pathname === page);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header - Always visible */}
      <CentralizedHeader />

      {/* Main Content Area */}
      <div className="flex flex-1 relative">
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

        {/* Main Content */}
        <main 
          className={`
            flex-1 
            ${showSidebar ? (isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64') : ''}
            transition-all duration-300
          `}
        >
          <div className="min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-5rem)]">
            {children}
          </div>
        </main>
      </div>

      {/* Footer - Conditional */}
      {showFooter && <Footer />}
    </div>
  );
};
