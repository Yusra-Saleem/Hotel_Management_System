"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import type { RoomType } from "@prisma/client";

export default function EditRoomTypePage() {
  const [roomType, setRoomType] = useState<RoomType | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [baseRate, setBaseRate] = useState<number>(0);
  const [maxOccupancy, setMaxOccupancy] = useState<number>(1);
  const [amenities, setAmenities] = useState<string>("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      const fetchRoomType = async () => {
        const res = await fetch(`/api/room-types/${id}`);
        if (res.ok) {
          const data = await res.json();
          setRoomType(data);
          setName(data.name || "");
          setDescription(data.description || "");
          setBaseRate(data.base_rate);
          setMaxOccupancy(data.max_occupancy);
          setAmenities(data.amenities.join(", "));
        } else {
          setError("Room type not found.");
        }
      };
      fetchRoomType();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch(`/api/room-types/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        base_rate: parseFloat(baseRate.toString()),
        max_occupancy: parseInt(maxOccupancy.toString()),
        amenities: amenities.split(",").map((a) => a.trim()),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message);
    } else {
      router.push("/admin/room-types");
    }
  };

  if (!roomType) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Room Type</h1>
      <form onSubmit={handleSubmit} className="max-w-lg">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block text-gray-700">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Base Rate</label>
          <input
            type="number"
            value={baseRate}
            onChange={(e) => setBaseRate(parseFloat(e.target.value))}
            className="w-full px-3 py-2 border rounded"
            required
            min="0"
            step="0.01"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Max Occupancy</label>
          <input
            type="number"
            value={maxOccupancy}
            onChange={(e) => setMaxOccupancy(parseInt(e.target.value))}
            className="w-full px-3 py-2 border rounded"
            required
            min="1"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Amenities (comma-separated)</label>
          <input
            type="text"
            value={amenities}
            onChange={(e) => setAmenities(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            placeholder="e.g., WiFi, TV, Balcony"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
