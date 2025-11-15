"use client";

import { useState, useEffect } from "react";
import type { AuditLog } from "@prisma/client";

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchLogs = async () => {
      const res = await fetch(`/api/admin/audit-log?page=${page}&limit=10`);
      const data = await res.json();
      setLogs(data.auditLogs);
      setTotalPages(data.totalPages);
    };
    fetchLogs();
  }, [page]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Audit Log</h1>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Timestamp</th>
            <th className="py-2 px-4 border-b">User ID</th>
            <th className="py-2 px-4 border-b">Action</th>
            <th className="py-2 px-4 border-b">Details</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td className="py-2 px-4 border-b">
                {new Date(log.timestamp).toLocaleString()}
              </td>
              <td className="py-2 px-4 border-b">{log.userId}</td>
              <td className="py-2 px-4 border-b">{log.action}</td>
              <td className="py-2 px-4 border-b">
                <pre>{JSON.stringify(log.details, null, 2)}</pre>
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
