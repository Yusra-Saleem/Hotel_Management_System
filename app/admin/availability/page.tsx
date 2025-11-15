"use client";

import { useState, useEffect } from "react";
import type { Room, RoomType } from "@prisma/client";

export default function AvailabilityPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [roomTypeId, setRoomTypeId] = useState("");
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRoomTypes = async () => {
      const res = await fetch("/api/room-types");
      const data = await res.json();
      setRoomTypes(data);
    };
    fetchRoomTypes();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams();
      query.set("startDate", startDate);
      query.set("endDate", endDate);
      if (roomTypeId) query.set("roomTypeId", roomTypeId);

      const res = await fetch(`/api/availability?${query.toString()}`);
      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }
      const data = await res.json();
      setAvailableRooms(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Availability Calendar</h1>

      <div className="mb-4 flex space-x-4">
        <div>
          <label className="block text-gray-700">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-gray-700">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-gray-700">Room Type</label>
          <select
            value={roomTypeId}
            onChange={(e) => setRoomTypeId(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="">All Room Types</option>
            {roomTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleSearch}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded self-end"
        >
          Search
        </button>
      </div>

      {loading && <div>Loading availability...</div>}
      {error && <div>Error: {error}</div>}

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Available Rooms</h2>
        {availableRooms.length === 0 && !loading && !error && (
          <p>No rooms available for the selected criteria.</p>
        )}
        <div className="grid grid-cols-4 gap-4">
          {availableRooms.map((room) => (
            <div key={room.id} className="border p-4 rounded shadow">
              <p className="font-bold">Room {room.room_number}</p>
              <p>Type: {room.roomType.name}</p>
              <p>Status: {room.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
