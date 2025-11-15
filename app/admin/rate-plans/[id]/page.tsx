"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import type { RatePlan, RoomType } from "@prisma/client";

export default function EditRatePlanPage() {
  const [ratePlan, setRatePlan] = useState<RatePlan | null>(null);
  const [name, setName] = useState("");
  const [roomTypeId, setRoomTypeId] = useState("");
  const [refundable, setRefundable] = useState(false);
  const [seasonalRates, setSeasonalRates] = useState<
    { startDate: string; endDate: string; price: number }[]
  >([]);
  const [extraBedPolicy, setExtraBedPolicy] = useState({ price: 0, max_beds: 0 });
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [error, setError] = useState("");
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      const fetchRatePlan = async () => {
        const res = await fetch(`/api/rate-plans/${id}`);
        if (res.ok) {
          const data = await res.json();
          setRatePlan(data);
          setName(data.name || "");
          setRoomTypeId(data.roomTypeId);
          setRefundable(data.refundable);
          setSeasonalRates(data.seasonal_rate || []);
          setExtraBedPolicy(data.extra_bed_policy || { price: 0, max_beds: 0 });
        } else {
          setError("Rate plan not found.");
        }
      };
      fetchRatePlan();
    }
  }, [id]);

  useEffect(() => {
    const fetchRoomTypes = async () => {
      const res = await fetch("/api/room-types");
      const data = await res.json();
      setRoomTypes(data);
    };
    fetchRoomTypes();
  }, []);

  const handleAddSeasonalRate = () => {
    setSeasonalRates([
      ...seasonalRates,
      { startDate: "", endDate: "", price: 0 },
    ]);
  };

  const handleSeasonalRateChange = (
    index: number,
    field: string,
    value: any
  ) => {
    const newSeasonalRates = [...seasonalRates];
    (newSeasonalRates[index] as any)[field] = value;
    setSeasonalRates(newSeasonalRates);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch(`/api/rate-plans/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        roomTypeId,
        refundable,
        seasonal_rate: seasonalRates,
        extra_bed_policy: extraBedPolicy,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message);
    } else {
      router.push("/admin/rate-plans");
    }
  };

  if (!ratePlan) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Rate Plan</h1>
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
          <label className="block text-gray-700">Room Type</label>
          <select
            value={roomTypeId}
            onChange={(e) => setRoomTypeId(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          >
            {roomTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={refundable}
              onChange={(e) => setRefundable(e.target.checked)}
              className="mr-2"
            />
            Refundable
          </label>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-bold mb-2">Seasonal Rates</h2>
          {seasonalRates.map((rate, index) => (
            <div key={index} className="border p-4 mb-2 rounded">
              <div className="mb-2">
                <label className="block text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={rate.startDate}
                  onChange={(e) =>
                    handleSeasonalRateChange(index, "startDate", e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="mb-2">
                <label className="block text-gray-700">End Date</label>
                <input
                  type="date"
                  value={rate.endDate}
                  onChange={(e) =>
                    handleSeasonalRateChange(index, "endDate", e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="mb-2">
                <label className="block text-gray-700">Price</label>
                <input
                  type="number"
                  value={rate.price}
                  onChange={(e) =>
                    handleSeasonalRateChange(
                      index,
                      "price",
                      parseFloat(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border rounded"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddSeasonalRate}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Add Seasonal Rate
          </button>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-bold mb-2">Extra Bed Policy</h2>
          <div className="mb-2">
            <label className="block text-gray-700">Price</label>
            <input
              type="number"
              value={extraBedPolicy.price}
              onChange={(e) =>
                setExtraBedPolicy({ ...extraBedPolicy, price: parseFloat(e.target.value) })
              }
              className="w-full px-3 py-2 border rounded"
              min="0"
              step="0.01"
            />
          </div>
          <div className="mb-2">
            <label className="block text-gray-700">Max Beds</label>
            <input
              type="number"
              value={extraBedPolicy.max_beds}
              onChange={(e) =>
                setExtraBedPolicy({ ...extraBedPolicy, max_beds: parseInt(e.target.value) })
              }
              className="w-full px-3 py-2 border rounded"
              min="0"
            />
          </div>
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
