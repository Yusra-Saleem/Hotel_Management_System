"use client";

import { useState, useEffect } from "react";
import type { HousekeepingTask, Room, User, HousekeepingStatus } from "@prisma/client";

interface HousekeepingTaskWithDetails extends HousekeepingTask {
  room: Room;
  assignedToStaff: User | null;
}

export default function HousekeepingPage() {
  const [tasks, setTasks] = useState<HousekeepingTaskWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [staff, setStaff] = useState<User[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  const fetchTasks = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/housekeeping");
      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }
      const data = await res.json();
      setTasks(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffAndRooms = async () => {
    try {
      const [staffRes, roomsRes] = await Promise.all([
        fetch("/api/admin/users"), // Assuming this API exists and can filter by role
        fetch("/api/rooms"), // Assuming this API exists
      ]);

      const staffData = await staffRes.json();
      const roomsData = await roomsRes.json();

      setStaff(staffData.users.filter((user: User) => user.role === "HOUSEKEEPING")); // Filter for housekeeping staff
      setRooms(roomsData.rooms);
    } catch (err: any) {
      console.error("Failed to fetch staff or rooms:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchStaffAndRooms();
  }, []);

  const handleStatusChange = async (taskId: string, newStatus: HousekeepingStatus) => {
    try {
      const res = await fetch(`/api/housekeeping/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || `Error: ${res.status}`);
      }
      fetchTasks(); // Refresh the list
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAssignStaff = async (taskId: string, staffId: string) => {
    try {
      const res = await fetch(`/api/housekeeping/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedToStaffId: staffId === "unassign" ? null : staffId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || `Error: ${res.status}`);
      }
      fetchTasks(); // Refresh the list
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCreateTask = async (roomId: string, assignedToStaffId: string | null, notes: string) => {
    try {
      const res = await fetch("/api/housekeeping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, assignedToStaffId, notes }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || `Error: ${res.status}`);
      }
      fetchTasks(); // Refresh the list
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading housekeeping tasks...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Housekeeping Management</h1>

      {/* Create New Task Form */}
      <div className="mb-8 p-4 border rounded shadow">
        <h2 className="text-xl font-bold mb-2">Create New Housekeeping Task</h2>
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const roomId = formData.get("roomId") as string;
          const assignedToStaffId = formData.get("assignedToStaffId") as string;
          const notes = formData.get("notes") as string;
          handleCreateTask(roomId, assignedToStaffId === "unassigned" ? null : assignedToStaffId, notes);
        }}>
          <div className="mb-2">
            <label className="block text-gray-700">Room</label>
            <select name="roomId" className="w-full px-3 py-2 border rounded" required>
              <option value="">Select Room</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.room_number} ({room.roomType?.name || "N/A"})
                </option>
              ))}
            </select>
          </div>
          <div className="mb-2">
            <label className="block text-gray-700">Assign To</label>
            <select name="assignedToStaffId" className="w-full px-3 py-2 border rounded">
              <option value="unassigned">Unassigned</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Notes</label>
            <textarea name="notes" className="w-full px-3 py-2 border rounded"></textarea>
          </div>
          <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Create Task
          </button>
        </form>
      </div>

      {/* Housekeeping Tasks List */}
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Room</th>
            <th className="py-2 px-4 border-b">Assigned To</th>
            <th className="py-2 px-4 border-b">Status</th>
            <th className="py-2 px-4 border-b">Notes</th>
            <th className="py-2 px-4 border-b">Timestamp</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td className="py-2 px-4 border-b">
                {task.room.room_number} ({task.room.roomType?.name || "N/A"})
              </td>
              <td className="py-2 px-4 border-b">
                <select
                  value={task.assignedToStaffId || "unassign"}
                  onChange={(e) => handleAssignStaff(task.id, e.target.value)}
                  className="px-2 py-1 border rounded"
                >
                  <option value="unassign">Unassigned</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </td>
              <td className="py-2 px-4 border-b">
                <select
                  value={task.status}
                  onChange={(e) =>
                    handleStatusChange(task.id, e.target.value as HousekeepingStatus)
                  }
                  className="px-2 py-1 border rounded"
                >
                  {Object.values(HousekeepingStatus).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </td>
              <td className="py-2 px-4 border-b">{task.notes}</td>
              <td className="py-2 px-4 border-b">
                {new Date(task.timestamp).toLocaleString()}
              </td>
              <td className="py-2 px-4 border-b">
                <button
                  onClick={() => handleDelete(task.id)}
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
