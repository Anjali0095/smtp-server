"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUser, logout } from "../lib/api";

export default function Navbar() {
  const router = useRouter();
  const user = getUser();

  const onLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 6l9 6 9-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="white" strokeWidth="2"/>
            </svg>
          </span>
          SMTP Manager
        </Link>

        <div className="flex items-center gap-4">
          {user && (
            <span className="hidden text-sm text-slate-500 sm:inline">
              {user.name}
            </span>
          )}
          <button onClick={onLogout} className="btn-secondary !py-2 !px-3.5 text-sm">
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
