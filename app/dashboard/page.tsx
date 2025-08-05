
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { isAuthenticated, getUserFromToken, getUserRole, removeToken } from "@/lib/auth";
import { Loading } from '@/components/ui/loading';
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
  const [activeTab, setActiveTab] = useState("communication");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    // Redirect admin users to admin page
    const userRole = getUserRole();
    if (userRole === 'admin') {
      router.push('/admin');
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
        
        // Fetch user's pets
        const petsResponse = await api.get(`/pets/user/${userId}`);
        setPets(petsResponse?.data ?? []);
       
        // Fetch bookings based on user role
        let bookingsResponse;
        if (userRole === 'sitter') {
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
        <Loading message="Loading dashboard..." />
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

        {/* Tab Navigation */}
        <section className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 overflow-x-auto">
              <button
                onClick={() => setActiveTab("communication")}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === "communication"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Communication
              </button>
              {user?.role === "sitter" ? (
                <>
                  <button
                    onClick={() => setActiveTab("users")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === "users"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    My Users
                  </button>
                  <button
                    onClick={() => setActiveTab("scheduling")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === "scheduling"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Scheduling
                  </button>
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === "profile"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    My Profile
                  </button>
                  <button
                    onClick={() => setActiveTab("dashboard")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === "dashboard"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Dashboard
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === "profile"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    My Profile
                  </button>
                  <button
                    onClick={() => setActiveTab("pets")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === "pets"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    My Pets
                  </button>
                  <button
                    onClick={() => setActiveTab("security")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === "security"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Key Security
                  </button>
                  <button
                    onClick={() => setActiveTab("booking")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === "booking"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Book Now
                  </button>
                  <button
                    onClick={() => setActiveTab("invoices")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === "invoices"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Invoices
                  </button>
                </>
              )}
            </nav>
          </div>
        </section>

        {/* Tab Content */}
        <section className="mb-8">
          {activeTab === "communication" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Communication</h2>
              <div className="bg-white p-6 rounded-lg border">
                <p className="text-gray-600 mb-4">Manage your communications and messages</p>
                <div className="space-y-3">
                  <Button onClick={() => router.push('/messages')} className="w-full sm:w-auto">
                    View Messages
                  </Button>
                  <Button onClick={() => router.push('/service-inquiry')} variant="outline" className="w-full sm:w-auto">
                    New Service Inquiry
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Sitter: My Users Tab */}
          {user?.role === "sitter" && activeTab === "users" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">My Users</h2>
              <div className="bg-white p-6 rounded-lg border">
                {/* Search bar placeholder */}
                <input type="text" placeholder="Search users..." className="mb-4 w-full border rounded px-3 py-2" />
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left py-2 px-2 font-semibold">Name</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Example static client list, replace with real data */}
                    {["Adam Scarth","Adelaide Wong","Adrian Tsang","Adriana Peternel","Adriana Pullia","Ahrum Lee","Alana Campbell","Alexis Linkert","Alison Park"].map((name, idx) => (
                      <tr key={name} className="border-b">
                        <td className="py-2 px-2">
                          <span className="font-semibold">{name}</span>
                          <span className="ml-2 text-red-600">Note to Self</span>
                          <div className="text-green-700 text-sm cursor-pointer">+ View Pets</div>
                        </td>
                        <td className="py-2 px-2 text-right">
                          <Button size="sm" variant="outline" className="mr-2">View Details</Button>
                          <Button size="sm" variant="outline">Add Note</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">My Profile</h2>
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-600">{user?.firstName?.[0]}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{user?.firstName} {user?.lastName}</h3>
                    <p className="text-gray-600">{user?.email}</p>
                    <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
                  </div>
                </div>
                <Button onClick={() => router.push('/profile')} className="w-full sm:w-auto">
                  Edit Profile
                </Button>
              </div>
            </div>
          )}

          {activeTab === "pets" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">My Pets</h2>
              <div className="bg-white p-6 rounded-lg border">
                <p className="text-gray-600 mb-4">You have {pets.length} pet{pets.length !== 1 ? "s" : ""} registered</p>
                <div className="space-y-3">
                  <Button onClick={() => router.push('/pets')} className="w-full sm:w-auto">
                    View All Pets
                  </Button>
                  {user?.role !== 'sitter' && (
                    <Button onClick={() => router.push('/pets/add')} variant="outline" className="w-full sm:w-auto">
                      Add New Pet
                    </Button>
                  )}
                </div>
                {pets.length > 0 && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pets.slice(0, 3).map((pet) => (
                      <div key={pet.id} className="p-3 border rounded-lg">
                        <h4 className="font-medium">{pet.name}</h4>
                        <p className="text-sm text-gray-600">{pet.species} • {pet.breed}</p>
                        <p className="text-sm text-gray-500">{pet.age} years old</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Key Security</h2>
              <div className="bg-white p-6 rounded-lg border">
                <p className="text-gray-600 mb-4">Manage your account security settings</p>
                <div className="space-y-3">
                  <Button onClick={() => router.push('/security')} className="w-full sm:w-auto">
                    Security Settings
                  </Button>
                  <Button variant="outline" className="w-full sm:w-auto">
                    Change Password
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "booking" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Book Now</h2>
              <div className="bg-white p-6 rounded-lg border">
                <p className="text-gray-600 mb-4">You have {bookings.length} total bookings</p>
                <div className="space-y-3">
                  <Button onClick={() => router.push('/bookings')} className="w-full sm:w-auto">
                    View All Bookings
                  </Button>
                  {user?.role !== 'sitter' && (
                    <Button onClick={() => router.push('/bookings')} variant="outline" className="w-full sm:w-auto">
                      Book New Service
                    </Button>
                  )}
                </div>
                {bookings.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium">Recent Bookings:</h4>
                    {bookings.slice(0, 3).map((booking) => (
                      <div key={booking.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{booking.serviceType}</p>
                            <p className="text-sm text-gray-600">{new Date(booking.date).toLocaleDateString()}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "invoices" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Invoices</h2>
              <div className="bg-white p-6 rounded-lg border">
                <p className="text-gray-600 mb-4">Manage your invoices and payments</p>
                <div className="space-y-3">
                  <Button onClick={() => router.push('/invoices')} className="w-full sm:w-auto">
                    View All Invoices
                  </Button>
                  <Button onClick={() => router.push('/reports')} variant="outline" className="w-full sm:w-auto">
                    View Reports
                  </Button>
                </div>
              </div>
            </div>
          )}
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
