"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "../lib/api";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const user = getUser();
    router.replace(user ? "/dashboard" : "/login");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
    </div>
  );
}
