"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useToast } from '@/hooks/use-toast';
import { isAuthenticated, getUserFromToken } from "@/lib/auth";
import { Loading } from '@/components/ui/loading';
import api from "@/lib/api";

// Import tab content components
import { CommunicationTab } from "./tabs/CommunicationTab";
import { ProfileTab } from "./tabs/ProfileTab";
import { KeySecurityTab } from "./tabs/KeySecurityTab";
import { BookingTab } from "./tabs/BookingTab";
import { InvoicesTab } from "./tabs/InvoicesTab";
import { AdminUsersTab } from "./tabs/AdminUsersTab";
import { AdminSittersTab } from "./tabs/AdminSittersTab";
import { AdminBookingsTab } from "./tabs/AdminBookingsTab";
import { AdminPetsTab } from "./tabs/AdminPetsTab";
import { AdminAddressChangesTab } from "./tabs/AdminAddressChangesTab";
import { SitterClientsTab } from "./tabs/SitterClientsTab";
import { SitterSchedulingTab } from "./tabs/SitterSchedulingTab";

interface User {
  id: string;
  _id?: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  homeCareInfo?: string;
  profilePicture?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get active tab from URL or default to 'communication'
  const activeTab = searchParams?.get('tab') || 'communication';

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    const fetchUserData = async () => {
      try {
        const userToken = getUserFromToken();
        if (!userToken) {
          router.push("/login");
          return;
        }

        // Fetch user profile
        const profileResponse = await api.get("/users/profile");
        setUser(profileResponse.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [router, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading message="Loading dashboard..." />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Render appropriate tab content based on activeTab and user role
  const renderTabContent = () => {
    // Admin tabs
    if (user.role === 'admin') {
      switch (activeTab) {
        case 'communication':
          return <CommunicationTab user={user} />;
        case 'users':
          return <AdminUsersTab user={user} />;
        case 'sitters':
          return <AdminSittersTab user={user} />;
        case 'bookings':
          return <AdminBookingsTab user={user} />;
        case 'pets':
          return <AdminPetsTab user={user} />;
        case 'address-changes':
          return <AdminAddressChangesTab user={user} />;
        default:
          return <CommunicationTab user={user} />;
      }
    }

    // Sitter tabs
    if (user.role === 'sitter') {
      switch (activeTab) {
        case 'communication':
          return <CommunicationTab user={user} />;
        case 'users':
          return <SitterClientsTab user={user} />;
        case 'scheduling':
          return <SitterSchedulingTab user={user} />;
        case 'profile':
          return <ProfileTab user={user} />;
        default:
          return <CommunicationTab user={user} />;
      }
    }

    // Client tabs
    switch (activeTab) {
      case 'communication':
        return <CommunicationTab user={user} />;
      case 'profile':
        return <ProfileTab user={user} />;
      case 'security':
        return <KeySecurityTab user={user} />;
      case 'booking':
        return <BookingTab user={user} />;
      case 'invoices':
        return <InvoicesTab user={user} />;
      default:
        return <CommunicationTab user={user} />;
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-5rem)] bg-gradient-to-br from-gray-50 to-white">
      <div className="container-modern section-padding">
        {/* Dashboard Header */}
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-responsive-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName || user?.email || "User"}
          </h1>
          <p className="text-gray-600">
            {user?.role === 'admin' ? 'Manage your pet care business' : 
             user?.role === 'sitter' ? 'Manage your clients and bookings' : 
             'Manage your pets and bookings'}
          </p>
        </div>

        {/* Tab Content */}
        <div className="animate-fadeIn">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
