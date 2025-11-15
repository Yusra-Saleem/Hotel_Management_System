"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { RatePlan, RoomType } from "@prisma/client";

interface RatePlanWithRoomType extends RatePlan {
  roomType: RoomType;
}

export default function RatePlansPage() {
  const [ratePlans, setRatePlans] = useState<RatePlanWithRoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRatePlans = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/rate-plans");
      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }
      const data = await res.json();
      setRatePlans(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatePlans();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this rate plan?")) {
      try {
        const res = await fetch(`/api/rate-plans/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          throw new Error(`Error: ${res.status}`);
        }
        fetchRatePlans(); // Refresh the list
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  if (loading) return <div>Loading rate plans...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Rate Plans Management</h1>
        <Link
          href="/admin/rate-plans/create"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Create Rate Plan
        </Link>
      </div>

      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Room Type</th>
            <th className="py-2 px-4 border-b">Refundable</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {ratePlans.map((ratePlan) => (
            <tr key={ratePlan.id}>
              <td className="py-2 px-4 border-b">{ratePlan.name}</td>
              <td className="py-2 px-4 border-b">{ratePlan.roomType.name}</td>
              <td className="py-2 px-4 border-b">
                {ratePlan.refundable ? "Yes" : "No"}
              </td>
              <td className="py-2 px-4 border-b">
                <Link
                  href={`/admin/rate-plans/${ratePlan.id}`}
                  className="text-blue-500 hover:underline mr-2"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(ratePlan.id)}
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
