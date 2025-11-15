"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Room, RoomType, RoomStatus } from "@prisma/client";

interface RoomWithRoomType extends Room {
  roomType: RoomType;
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<RoomWithRoomType[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<RoomStatus | "">("");
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    const fetchRooms = async () => {
      const query = new URLSearchParams();
      query.set("page", page.toString());
      query.set("limit", "10");
      if (search) query.set("search", search);
      if (statusFilter) query.set("status", statusFilter);
      if (typeFilter) query.set("typeId", typeFilter);

      const res = await fetch(`/api/rooms?${query.toString()}`);
      const data = await res.json();
      setRooms(data.rooms);
      setTotalPages(data.totalPages);
    };
    fetchRooms();
  }, [page, search, statusFilter, typeFilter]);

  useEffect(() => {
    const fetchRoomTypes = async () => {
      const res = await fetch("/api/room-types"); // Assuming this API exists
      const data = await res.json();
      setRoomTypes(data);
    };
    fetchRoomTypes();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Room Management</h1>
        <Link
          href="/admin/rooms/create"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Create Room
        </Link>
      </div>

      <div className="mb-4 flex space-x-4">
        <input
          type="text"
          placeholder="Search by room number or type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-1/3 px-3 py-2 border rounded"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as RoomStatus | "")}
          className="w-1/4 px-3 py-2 border rounded"
        >
          <option value="">All Statuses</option>
          {Object.values(RoomStatus).map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-1/4 px-3 py-2 border rounded"
        >
          <option value="">All Room Types</option>
          {roomTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Room Number</th>
            <th className="py-2 px-4 border-b">Room Type</th>
            <th className="py-2 px-4 border-b">Floor</th>
            <th className="py-2 px-4 border-b">Status</th>
            <th className="py-2 px-4 border-b">Max Occupancy</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr key={room.id}>
              <td className="py-2 px-4 border-b">{room.room_number}</td>
              <td className="py-2 px-4 border-b">{room.roomType.name}</td>
              <td className="py-2 px-4 border-b">{room.floor}</td>
              <td className="py-2 px-4 border-b">{room.status}</td>
              <td className="py-2 px-4 border-b">{room.max_occupancy}</td>
              <td className="py-2 px-4 border-b">
                <Link
                  href={`/admin/rooms/${room.id}`}
                  className="text-blue-500 hover:underline"
                >
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex justify-between">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l"
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r"
        >
          Next
        </button>
      </div>
    </div>
  );
}
