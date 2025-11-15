"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-4 text-center text-3xl font-bold">
          Hotel Management System
        </h1>
        {session ? (
          <div className="text-center">
            <p className="mb-4">
              Welcome, {session.user?.name} ({session.user?.role})
            </p>
            {session.user?.role === "ADMIN" && (
              <Link
                href="/admin"
                className="mb-4 inline-block rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-700"
              >
                Admin Dashboard
              </Link>
            )}
            <button
              onClick={() => signOut()}
              className="rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-700"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="mb-4">You are not signed in.</p>
            <Link
              href="/auth/login"
              className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
            >
              Sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
