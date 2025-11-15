import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-800 text-white">
        <div className="p-4">
          <h1 className="text-2xl font-bold">Admin</h1>
        </div>
        <nav>
          <ul>
            <li className="p-4 hover:bg-gray-700">
              <Link href="/admin">Dashboard</Link>
            </li>
            <li className="p-4 hover:bg-gray-700">
              <Link href="/admin/users">Users</Link>
            </li>
            <li className="p-4 hover:bg-gray-700">
              <Link href="/admin/audit-log">Audit Log</Link>
            </li>
            <li className="p-4 hover:bg-gray-700">
              <Link href="/admin/rooms">Rooms</Link>
            </li>
            <li className="p-4 hover:bg-gray-700">
              <Link href="/admin/room-types">Room Types</Link>
            </li>
            <li className="p-4 hover:bg-gray-700">
              <Link href="/admin/rate-plans">Rate Plans</Link>
            </li>
            <li className="p-4 hover:bg-gray-700">
              <Link href="/admin/availability">Availability Calendar</Link>
            </li>
            <li className="p-4 hover:bg-gray-700">
              <Link href="/admin/housekeeping">Housekeeping</Link>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
