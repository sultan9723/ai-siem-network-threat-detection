"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function useAuth() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      router.replace("/login");
    } else {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, [router]);

  return { isAuthenticated, loading };
}