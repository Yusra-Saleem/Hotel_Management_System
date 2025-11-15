"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { RoomType } from "@prisma/client";

export default function RoomTypesPage() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRoomTypes = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/room-types");
      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }
      const data = await res.json();
      setRoomTypes(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this room type?")) {
      try {
        const res = await fetch(`/api/room-types/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          throw new Error(`Error: ${res.status}`);
        }
        fetchRoomTypes(); // Refresh the list
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  if (loading) return <div>Loading room types...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Room Types Management</h1>
        <Link
          href="/admin/room-types/create"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Create Room Type
        </Link>
      </div>

      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Description</th>
            <th className="py-2 px-4 border-b">Base Rate</th>
            <th className="py-2 px-4 border-b">Max Occupancy</th>
            <th className="py-2 px-4 border-b">Amenities</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {roomTypes.map((roomType) => (
            <tr key={roomType.id}>
              <td className="py-2 px-4 border-b">{roomType.name}</td>
              <td className="py-2 px-4 border-b">{roomType.description}</td>
              <td className="py-2 px-4 border-b">{roomType.base_rate}</td>
              <td className="py-2 px-4 border-b">{roomType.max_occupancy}</td>
              <td className="py-2 px-4 border-b">
                {roomType.amenities.join(", ")}
              </td>
              <td className="py-2 px-4 border-b">
                <Link
                  href={`/admin/room-types/${roomType.id}`}
                  className="text-blue-500 hover:underline mr-2"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(roomType.id)}
                  className="text-red-500 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
