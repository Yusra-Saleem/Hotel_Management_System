"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Role, User } from "@prisma/client";

export default function EditUserPage() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("GUEST");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      const fetchUser = async () => {
        const res = await fetch(`/api/admin/users/${id}`);
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          setName(data.name || "");
          setEmail(data.email || "");
          setRole(data.role);
          setIsActive(data.isActive);
        }
      };
      fetchUser();
    }
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, role, isActive }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.message);
    } else {
      router.push("/admin/users");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to deactivate this user?")) {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/admin/users");
      } else {
        const data = await res.json();
        setError(data.message);
      }
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit User</h1>
      <form onSubmit={handleUpdate} className="max-w-lg">
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
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="w-full px-3 py-2 border rounded"
          >
            {Object.values(Role).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="mr-2"
            />
            Active
          </label>
        </div>
        <div className="flex justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Deactivate User
          </button>
        </div>
      </form>
    </div>
  );
}
