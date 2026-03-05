"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
          <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight">
            WebScope
          </span>
        </Link>

        {/* Desktop right side */}
        <div className="hidden sm:flex items-center gap-3">
          <ThemeToggle />
          {session ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/compare"
                className="text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                Compare
              </Link>
              <Link
                href="/metadata"
                className="text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                Metadata
              </Link>
              <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
              <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono truncate max-w-[120px]">
                {session.user?.name || session.user?.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="px-3 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors duration-200"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile right side */}
        <div className="flex sm:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            className="p-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors duration-150"
          >
            {mobileOpen ? (
              <svg className="w-4 h-4 text-zinc-600 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-zinc-600 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md animate-fade-in">
          <div className="px-4 py-3 space-y-3">
            {session ? (
              <>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono truncate">
                  {session.user?.name || session.user?.email}
                </p>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-indigo-500 transition-colors py-1"
                >
                  Dashboard
                </Link>
                <Link
                  href="/compare"
                  onClick={() => setMobileOpen(false)}
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-indigo-500 transition-colors py-1"
                >
                  Compare
                </Link>
                <Link
                  href="/metadata"
                  onClick={() => setMobileOpen(false)}
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-indigo-500 transition-colors py-1"
                >
                  Metadata
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="block text-sm text-zinc-500 dark:text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors py-1"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-indigo-500 transition-colors py-1"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileOpen(false)}
                  className="block text-sm font-medium text-indigo-500 hover:text-indigo-400 transition-colors py-1"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
