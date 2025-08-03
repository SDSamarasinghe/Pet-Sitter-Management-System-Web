
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { isAuthenticated, getUserFromToken, removeToken } from "@/lib/auth";
import api from "@/lib/api";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  homeCareInfo?: string;
}

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  photoUrl?: string;
  careInstructions: string;
}

interface Booking {
  id: string;
  date: string;
  serviceType: string;
  status: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    const fetchDashboardData = async () => {
      try {
        const userToken = getUserFromToken();
        if (!userToken) {
          router.push("/login");
          return;
        }
        // Fetch user profile first
        const profileResponse = await api.get("/users/profile");
        const userId = profileResponse.data._id;
        const userRole = profileResponse.data.role;
        let petsResponse;
        if (userRole === 'admin') {
          petsResponse = await api.get('/pets');
          setPets(petsResponse?.data ?? []);
        } else {
          petsResponse = await api.get(`/pets/user/${userId}`);
          setPets(petsResponse?.data ?? []);
        }
       
        // Fetch bookings as before
        let bookingsResponse;
        if (userRole === 'admin') {
          bookingsResponse = await api.get('/bookings');
        } else if (userRole === 'sitter') {
          bookingsResponse = await api.get(`/bookings/sitter/${userId}`);
        } else {
          bookingsResponse = await api.get(`/bookings/user/${userId}`);
        }
        setUser(profileResponse.data);
        setBookings(bookingsResponse.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [router]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    removeToken();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  // Images for cards (replace with real images or URLs as needed)
  const petImg = "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=400&q=80";
  const bookingImg = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80";
  const serviceImg = "https://images.unsplash.com/photo-1518715308788-300e1e1bdfb0?auto=format&fit=crop&w=400&q=80";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Nav */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg"> <span className="mr-2"> <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#111"/><path d="M7 7h10v10H7V7z" fill="#fff"/></svg></span>PetPal</span>
            {user?.email && (
              <span className="ml-4 text-sm text-gray-600">{user.email}</span>
            )}
          </div>
          <nav className="hidden md:flex gap-8 text-sm text-gray-700">
            <a href="/dashboard" className="hover:underline font-semibold">Dashboard</a>
            <a href="/services" className="hover:underline">Services</a>
            <a href="/bookings" className="hover:underline">Bookings</a>
            <a href="/service-inquiry" className="hover:underline">Service Inquiry</a>
            <a href="/messages" className="hover:underline">Messages</a>
          </nav>
          <div className="flex items-center gap-4">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
              >
                <span className="text-xs font-bold text-gray-600">{user?.firstName?.[0]}</span>
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
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
                    onClick={() => {
                      handleLogout();
                      setIsDropdownOpen(false);
                    }}
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
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto py-10 px-4">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, {user?.firstName ? user?.firstName : user?.email || "User"}</h1>

        {/* Quick Actions */}
        <section className="mb-8">
          <h2 className="font-semibold text-lg mb-2">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Button className="rounded-full bg-blue-100 text-blue-900 px-4 py-2 shadow-none" onClick={() => router.push('/service-inquiry')}>New Service Inquiry</Button>
            {user?.role !== 'sitter' && (
              <>
                <Button className="rounded-full bg-gray-100 text-gray-900 px-4 py-2 shadow-none" onClick={() => router.push('/pets/add')}>Add New Pet</Button>
                <Button className="rounded-full bg-gray-100 text-gray-900 px-4 py-2 shadow-none" onClick={() => router.push('/bookings')}>Book Service</Button>
              </>
            )}
            <Button className="rounded-full bg-gray-100 text-gray-900 px-4 py-2 shadow-none" onClick={() => router.push('/reports')}>View Reports</Button>
          </div>
        </section>

        {/* Overview */}
        <section className="mb-8">
          <h2 className="font-semibold text-lg mb-4">Overview</h2>
          <div className="space-y-6">
            {/* Pets Card */}
            <Card className="flex flex-row items-center p-4 rounded-xl bg-white shadow-sm border">
              <div className="flex-1">
                <div className="font-semibold">Pets</div>
                <div className="text-sm text-gray-500 mb-2">You have {pets.length} pet{pets.length !== 1 ? "s" : ""} registered</div>
                <Button variant="outline" className="rounded-full text-sm px-4" onClick={() => router.push('/pets')}>View Pets &rarr;</Button>
              </div>
              <img src={petImg} alt="Pets" className="w-40 h-24 object-cover rounded-lg ml-6" />
            </Card>

            {/* Bookings Card */}
            <Card className="flex flex-row items-center p-4 rounded-xl bg-white shadow-sm border">
              <div className="flex-1">
                <div className="font-semibold">Bookings</div>
                <div className="text-sm text-gray-500 mb-2">You have {bookings.length} bookings</div>
                <Button variant="outline" className="rounded-full text-sm px-4" onClick={() => router.push('/bookings')}>View Bookings &rarr;</Button>
              </div>
              <img src={bookingImg} alt="Bookings" className="w-40 h-24 object-cover rounded-lg ml-6" />
            </Card>

            {/* Upcoming Services Card */}
            <Card className="flex flex-row items-center p-4 rounded-xl bg-white shadow-sm border">
              <div className="flex-1">
                <div className="font-semibold">Upcoming Services</div>
                <div className="text-sm text-gray-500 mb-2">You have 3 upcoming services</div>
                <Button variant="outline" className="rounded-full text-sm px-4" onClick={() => router.push('/services')}>View Services &rarr;</Button>
              </div>
              <img src={serviceImg} alt="Upcoming Services" className="w-40 h-24 object-cover rounded-lg ml-6" />
            </Card>
          </div>
        </section>

        {/* Service Areas */}
        <section className="mb-8">
          <h2 className="font-semibold text-lg mb-4">Service Areas</h2>
          <div className="rounded-xl overflow-hidden border bg-white">
            <img src="https://maps.googleapis.com/maps/api/staticmap?center=Toronto,ON&zoom=12&size=800x400&maptype=roadmap&key=YOUR_GOOGLE_MAPS_API_KEY" alt="Service Area Map" className="w-full h-80 object-cover" />
          </div>
        </section>
      </main>
    </div>
  );
}
