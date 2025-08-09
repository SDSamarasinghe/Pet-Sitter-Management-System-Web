"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { isAuthenticated, getUserFromToken } from "@/lib/auth";

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  careInstructions?: string;
  vetBusinessName?: string;
  vetAddress?: string;
  vetPhone?: string;
  vaccines?: string;
}

export default function MyPetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [activePetId, setActivePetId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<{ [petId: string]: string }>({});
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    const fetchPets = async () => {
      const user = getUserFromToken();
      if (!user) return;
      const res = await api.get(`/pets/user/${user.userId}`);
      setPets(res.data || []);
      if (res.data && res.data.length > 0) {
        setActivePetId(res.data[0].id);
      }
    };
    fetchPets();
  }, [router]);

  const handleTabChange = (petId: string, tab: string) => {
    setActiveTab((prev) => ({ ...prev, [petId]: tab }));
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">My Pets</h1>
      <div className="bg-white rounded-2xl border p-8 mb-8">
        <div className="text-lg text-gray-500 mb-6">You have {pets.length} pet{pets.length !== 1 ? 's' : ''} registered</div>
        <div className="flex gap-4 mb-8">
          <Button className="bg-[#3867f6] hover:bg-[#2451c6] text-white px-8 py-3 text-base font-semibold rounded-xl" onClick={() => {}}>
            View All Pets
          </Button>
          <Button variant="outline" className="px-8 py-3 text-base font-semibold rounded-xl" onClick={() => router.push('/pets/add')}>
            Add New Pet
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet) => (
            <div key={pet.id} className="rounded-xl border bg-white p-6 flex flex-col shadow-sm">
              <div className="font-bold text-lg mb-2 text-gray-900">{pet.name}</div>
              <div className="text-gray-700 text-sm mb-1">• {pet.careInstructions || pet.breed || pet.species || 'No details.'}</div>
              <div className="text-gray-400 text-sm">{pet.age ? `${pet.age} years old` : ''}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
