
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { isAuthenticated, getUserFromToken, getUserRole, removeToken } from "@/lib/auth";
import { Loading } from '@/components/ui/loading';
import api from "@/lib/api";

// Client row component with expandable pets
const ClientWithPetsRow: React.FC<{ client: User }> = ({ client }) => {
  const [expanded, setExpanded] = useState(false);
  const [petTabs, setPetTabs] = useState<{[key: string]: string}>({});
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="border-b pb-2">
      <div className="flex justify-between items-center py-2">
        <div>
          <span className="font-semibold">{client.firstName} {client.lastName}</span>
          <span className="ml-2 text-red-600">Note to Self</span>
          <div
            className="text-green-700 text-sm cursor-pointer mt-1"
            onClick={() => setExpanded((prev) => !prev)}
          >
            {expanded ? "- Hide" : "+ View Pets"}
          </div>
        </div>
        <div>
          <Button size="sm" variant="outline" className="mr-2" onClick={() => setShowModal(true)}>View Details</Button>
          <Button size="sm" variant="outline">Add Note</Button>
        </div>
      </div>
      {expanded && client.pets && client.pets.length > 0 && (
        <div className="bg-gray-50 rounded p-4 mt-2">
          {client.pets.map((pet) => {
            const currentTab = petTabs[pet.id] || "basic";
            return (
            <div key={pet.id} className="mb-6 bg-white rounded-lg p-4 border">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-lg">{pet.name}</h4>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">+ Add Note</Button>
                  <Button size="sm" variant="outline">Profile Preview</Button>
                  <Button size="sm" variant="outline">PDF Info Sheet</Button>
                </div>
              </div>
              
              {/* Tab Navigation for Pet Details */}
              <div className="border-b border-gray-200 mb-4">
                <nav className="flex space-x-4">
                  <button
                    onClick={() => setPetTabs(prev => ({...prev, [pet.id]: "basic"}))}
                    className={`py-2 px-4 border-b-2 font-medium text-sm ${
                      currentTab === "basic"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Basic
                  </button>
                  <button
                    onClick={() => setPetTabs(prev => ({...prev, [pet.id]: "care"}))}
                    className={`py-2 px-4 border-b-2 font-medium text-sm ${
                      currentTab === "care"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Care
                  </button>
                  <button
                    onClick={() => setPetTabs(prev => ({...prev, [pet.id]: "medical"}))}
                    className={`py-2 px-4 border-b-2 font-medium text-sm ${
                      currentTab === "medical"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Medical
                  </button>
                  <button
                    onClick={() => setPetTabs(prev => ({...prev, [pet.id]: "insurance"}))}
                    className={`py-2 px-4 border-b-2 font-medium text-sm ${
                      currentTab === "insurance"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Insurance
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              {currentTab === "basic" && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Type:</span>
                    <div>{pet.species || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Breed:</span>
                    <div>{pet.breed || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Age:</span>
                    <div>{pet.age} years old</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Gender:</span>
                    <div>Not specified</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Date of Birth:</span>
                    <div>Not specified</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Spayed/Neutered:</span>
                    <div>Not specified</div>
                  </div>
                </div>
              )}

              {currentTab === "care" && (
                <div className="text-sm">
                  <div className="mb-2">
                    <span className="font-medium text-gray-600">Care Instructions:</span>
                    <div className="mt-1">{pet.careInstructions || 'No special care instructions provided.'}</div>
                  </div>
                </div>
              )}

              {currentTab === "medical" && (
                <div className="text-sm">
                  <div className="text-gray-500">Medical information not available.</div>
                </div>
              )}

              {currentTab === "insurance" && (
                <div className="text-sm">
                  <div className="text-gray-500">Insurance information not available.</div>
                </div>
              )}
            </div>
            );
          })}
        </div>
      )}
      {expanded && (!client.pets || client.pets.length === 0) && (
        <div className="bg-gray-50 rounded p-3 mt-2 text-gray-500">No pets found for this client.</div>
      )}

      {/* Client Details Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Client Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Basic Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">First Name</label>
                    <p className="text-gray-900">{client.firstName || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Last Name</label>
                    <p className="text-gray-900">{client.lastName || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900">{client.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Phone</label>
                    <p className="text-gray-900">{client.phone || 'Not provided'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600">Address</label>
                    <p className="text-gray-900">{client.address || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-red-800">Emergency Contact</h3>
                <p className="text-gray-900">{client.emergencyContact || 'Not provided'}</p>
              </div>

              {/* Home Care Information */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-blue-800">Home Care Information</h3>
                <p className="text-gray-900">{client.homeCareInfo || 'Not provided'}</p>
              </div>

              {/* Pet Summary */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-green-800">Pet Summary</h3>
                {client.pets && client.pets.length > 0 ? (
                  <div className="space-y-2">
                    {client.pets.map((pet) => (
                      <div key={pet.id} className="flex justify-between items-center bg-white p-2 rounded">
                        <span className="font-medium">{pet.name}</span>
                        <span className="text-sm text-gray-600">{pet.species} • {pet.breed} • {pet.age} years</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No pets registered</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Close
              </Button>
              <Button>
                Contact Client
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface User {
  id: string;
  _id?: string; // MongoDB ID
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  homeCareInfo?: string;
  pets?: Pet[];
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
  const [clients, setClients] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("communication");
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [noteText, setNoteText] = useState("");
  const [notes, setNotes] = useState<any[]>([]);
  const [replyingNoteId, setReplyingNoteId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [filterByUser, setFilterByUser] = useState<string>("");
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
          console.log("User is sitter, fetching clients...");
          bookingsResponse = await api.get(`/bookings/sitter/${userId}`);
          // Fetch all clients with their pets for sitters
          const clientsResponse = await api.get('/users/admin/clients-with-pets');
          console.log("🚀 ~ fetchDashboardData ~ clientsResponse:", clientsResponse)
          setClients(clientsResponse.data ?? []);
        } else {
          console.log("User is not sitter, role:", userRole);
          bookingsResponse = await api.get(`/bookings/user/${userId}`);
        }
        setUser(profileResponse.data);
        console.log("🚀 ~ User set:", profileResponse.data);
        setBookings(bookingsResponse.data);
        
        // Fetch available users and recent notes for communication
        if (userRole === 'sitter' || userRole === 'client') {
          try {
            // Fetch available users for dropdown
            const usersResponse = await api.get('/notes/users/available');
            setAvailableUsers(usersResponse.data ?? []);
            
            // Fetch recent notes
            const notesResponse = await api.get('/notes/recent/20');
            setNotes(notesResponse.data ?? []);
          } catch (error) {
            console.error("Error fetching communication data:", error);
            // Fallback to empty arrays
            setAvailableUsers([]);
            setNotes([]);
          }
        }
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

  const handleAddNote = async () => {
    if (!selectedClient || !noteText.trim() || isSubmittingNote) return;
    
    setIsSubmittingNote(true);
    try {
      const noteData = {
        recipientId: selectedClient,
        text: noteText,
        attachments: [] // TODO: Add image attachment functionality
      };
      
      const response = await api.post('/notes', noteData);
      
      // Clear form first
      setNoteText("");
      setSelectedClient("");
      
      // Refresh notes to get the latest data
      await refreshNotes();
    } catch (error) {
      console.error("Error creating note:", error);
      // You could add error handling/toast notification here
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleReply = async (noteId: string) => {
    if (!replyText.trim() || isSubmittingReply) return;
    
    setIsSubmittingReply(true);
    try {
      const replyData = {
        text: replyText,
        attachments: [] // TODO: Add image attachment functionality
      };
      
      const response = await api.post(`/notes/${noteId}/replies`, replyData);
      
      // Clear reply form first
      setReplyText("");
      setReplyingNoteId(null);
      
      // Refresh notes to get the updated data
      await refreshNotes();
    } catch (error) {
      console.error("Error adding reply:", error);
      // You could add error handling/toast notification here
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const refreshNotes = async () => {
    try {
      let endpoint = '/notes/recent/20';
      if (filterByUser) {
        endpoint = `/notes?recipientId=${filterByUser}&limit=20`;
      }
      const response = await api.get(endpoint);
      setNotes(response.data.notes || response.data || []);
    } catch (error) {
      console.error("Error refreshing notes:", error);
    }
  };

  // Refresh notes when filter changes
  useEffect(() => {
    if (user) {
      refreshNotes();
    }
  }, [filterByUser, user]);

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
            <div className="space-y-6">
              {/* Add Note Section */}
              <div className="bg-white p-6 rounded-lg border">
                <h2 className="text-xl font-semibold mb-4">ADD NOTE</h2>
                {/* Client Selection Dropdown */}
                <div className="mb-4">
                  <select
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-700"
                  >
                    <option value="">Select the person to add note</option>
                    {availableUsers.map((user) => (
                      <option key={user._id || user.id} value={user._id || user.id}>
                        {user.firstName} {user.lastName} ({user.role})
                      </option>
                    ))}
                  </select>
                </div>
                {/* Note Text Area */}
                <div className="mb-4">
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Write your note here..."
                    className="w-full p-3 border border-gray-300 rounded-md resize-none"
                    rows={4}
                  />
                </div>
                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                  <Button variant="outline" className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span>Attach Images</span>
                  </Button>
                  <Button 
                    onClick={handleAddNote}
                    disabled={!selectedClient || !noteText.trim() || isSubmittingNote}
                    className="bg-primary text-white px-6 py-2 rounded-md font-semibold shadow hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingNote ? 'Adding...' : 'Add Note'}
                  </Button>
                </div>
              </div>

              {/* Recent Notes Section */}
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Recent Notes</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Filter by user</span>
                    <select
                      value={filterByUser}
                      onChange={(e) => setFilterByUser(e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
                    >
                      <option value="">All</option>
                      {availableUsers.map((user) => (
                        <option key={user._id || user.id} value={user._id || user.id}>
                          {user.firstName} {user.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {/* Notes List */}
                <div className="space-y-4">
                  {notes.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      No notes yet. Add your first note above!
                    </div>
                  ) : (
                    notes.map((note) => (
                      <div key={note._id || note.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <div className="flex items-start space-x-3">
                          {/* User Avatar */}
                          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-gray-600">
                              {(note.senderId?.firstName || note.author || 'U').charAt(0).toUpperCase()}
                            </span>
                          </div>
                          {/* Note Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-gray-900">
                                {note.senderId?._id === user?._id || note.senderId?.id === user?.id ? 'You' : (note.senderId?.firstName ? `${note.senderId.firstName} ${note.senderId.lastName}` : note.author)}
                              </span>
                              <span className="text-sm text-gray-500">added a note for</span>
                              <span className="font-medium text-blue-600">
                                {note.recipientId?._id === user?._id || note.recipientId?.id === user?.id ? 'You' : (note.recipientId?.firstName ? `${note.recipientId.firstName} ${note.recipientId.lastName}` : note.clientName)}
                              </span>
                              <span className="text-sm text-gray-400">
                                {new Date(note.createdAt || note.timestamp).toLocaleDateString()} - {new Date(note.createdAt || note.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed">{note.text}</p>
                            {/* Note Images (if any) */}
                            {note.attachments && note.attachments.length > 0 && (
                              <div className="mt-3">
                                <div className="flex space-x-2">
                                  {note.attachments.filter((att: any) => att.type === 'image').map((attachment: any, index: number) => (
                                    <img
                                      key={index}
                                      src={attachment.url}
                                      alt={attachment.filename}
                                      className="w-32 h-32 object-cover rounded-lg border"
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                            {/* Legacy image support */}
                            {note.images && note.images.length > 0 && (
                              <div className="mt-3">
                                <div className="flex space-x-2">
                                  {note.images.map((image: string, index: number) => (
                                    <img
                                      key={index}
                                      src={image}
                                      alt={`Note attachment ${index + 1}`}
                                      className="w-32 h-32 object-cover rounded-lg border"
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                            {/* Replies */}
                            {note.replies && note.replies.length > 0 && (
                              <div className="mt-4 space-y-2">
                                {note.replies.map((reply: any) => (
                                  <div key={reply._id || reply.id} className="border-t pt-2">
                                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">
                        {reply.senderId?._id === user?._id || reply.senderId?.id === user?.id ? 'You' : (reply.senderId?.firstName ? `${reply.senderId.firstName} ${reply.senderId.lastName}` : reply.author)}
                      </span>
                                      <span className="text-sm text-gray-400">
                                        {new Date(reply.createdAt || reply.timestamp).toLocaleDateString()} - {new Date(reply.createdAt || reply.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                      </span>
                                    </div>
                                    <p className="text-gray-700 text-sm leading-relaxed">{reply.text}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                            {/* Note Actions */}
                            <div className="mt-4">
                              {replyingNoteId === (note._id || note.id) ? (
                                <div className="space-y-2">
                                  <textarea
                                    value={replyText}
                                    onChange={e => setReplyText(e.target.value)}
                                    placeholder="Add Reply"
                                    className="w-full p-2 border border-gray-300 rounded-md resize-none"
                                    rows={2}
                                  />
                                  <div className="flex gap-2">
                                    <Button variant="outline" className="flex items-center space-x-2">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                      </svg>
                                      <span>Attach Images</span>
                                    </Button>
                                    <Button
                                      className="bg-primary text-white px-4 py-2 rounded-md font-semibold shadow hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                      onClick={() => handleReply(note._id || note.id)}
                                      disabled={!replyText.trim() || isSubmittingReply}
                                    >
                                      {isSubmittingReply ? 'Submitting...' : 'Submit'}
                                    </Button>
                                    <Button variant="ghost" onClick={() => { setReplyingNoteId(null); setReplyText(""); }}>
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 p-0" onClick={() => setReplyingNoteId(note._id || note.id)}>
                                  + Add Reply
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Sitter: My Users Tab */}
          {user?.role === "sitter" && activeTab === "users" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">My Users</h2>
              <div className="bg-white p-6 rounded-lg border">
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  className="mb-4 w-full border rounded px-3 py-2" 
                  value={clientSearch}
                  onChange={e => setClientSearch(e.target.value)}
                />
                <div className="space-y-2">
                  {(clients.filter(c =>
                    c.firstName?.toLowerCase().includes(clientSearch.toLowerCase()) ||
                    c.lastName?.toLowerCase().includes(clientSearch.toLowerCase()) ||
                    c.email?.toLowerCase().includes(clientSearch.toLowerCase())
                  )).map((client) => (
                    <ClientWithPetsRow key={client.id} client={client} />
                  ))}
                </div>
                {clients.length === 0 && (
                  <div className="text-center text-gray-500 py-6">No clients found.</div>
                )}
              </div>
            </div>
          )}
          
          {/* Debug info - remove this after testing */}
          {user?.role === "sitter" && (
            <div className="bg-yellow-100 p-4 rounded mb-4">
              <p>Debug: User role: {user?.role}</p>
              <p>Active tab: {activeTab}</p>
              <p>Clients count: {clients.length}</p>
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
