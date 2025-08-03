"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { isAuthenticated, getUserFromToken } from "@/lib/auth";
import { Loading } from '@/components/ui/loading';
import api from "@/lib/api";

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  homeCareInfo?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    emergencyContact: "",
    homeCareInfo: ""
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await api.get("/users/profile");
        const userData = response.data;
        setUser(userData);
        setFormData({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || "",
          phone: userData.phone || "",
          address: userData.address || "",
          emergencyContact: userData.emergencyContact || "",
          homeCareInfo: userData.homeCareInfo || ""
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        setMessage({ type: "error", text: "Failed to load profile data" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await api.put("/users/profile", formData);
      setUser(response.data);
      setIsEditing(false);
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ type: "error", text: "Failed to update profile. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        emergencyContact: user.emergencyContact || "",
        homeCareInfo: user.homeCareInfo || ""
      });
    }
    setIsEditing(false);
    setMessage({ type: "", text: "" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading message="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Nav */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">
              <span className="mr-2">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <rect width="24" height="24" rx="6" fill="#111"/>
                  <path d="M7 7h10v10H7V7z" fill="#fff"/>
                </svg>
              </span>
              PetPal
            </span>
          </div>
          <nav className="hidden md:flex gap-8 text-sm text-gray-700">
            <a href="/dashboard" className="hover:underline">Dashboard</a>
            <a href="/services" className="hover:underline">Services</a>
            <a href="/bookings" className="hover:underline">Bookings</a>
            <a href="/messages" className="hover:underline">Messages</a>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-10 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : 
            "bg-red-50 text-red-800 border border-red-200"
          }`}>
            {message.text}
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and contact information
                </CardDescription>
              </div>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="(416) 555-0123"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Your full address"
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <Input
                id="emergencyContact"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Emergency contact name and phone"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="homeCareInfo">Home Care Instructions</Label>
              <Textarea
                id="homeCareInfo"
                name="homeCareInfo"
                value={formData.homeCareInfo}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Special instructions for pet sitters (alarm codes, feeding schedules, etc.)"
                className="mt-1"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Read-only account details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Account Type</Label>
                <div className="mt-1 p-2 bg-gray-50 rounded border">
                  {user?.role || "User"}
                </div>
              </div>
              <div>
                <Label>User ID</Label>
                <div className="mt-1 p-2 bg-gray-50 rounded border font-mono text-sm">
                  {user?._id}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
