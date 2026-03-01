"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 dark:bg-gray-950/70 border-b border-gray-200/60 dark:border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md shadow-indigo-500/25">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            WebScope <span className="text-indigo-500">Pro</span>
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {session ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
              >
                Dashboard
              </Link>
              <div className="h-5 w-px bg-gray-200 dark:bg-white/10" />
              <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                {session.user?.name || session.user?.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
