import toast from "react-hot-toast";

export interface Incident {
  id: string;
  source_ip: string;
  risk_score: number;
  status: string;
  event_count: number;
  last_seen: string;
  analysis?: {
    threat_type: string;
    severity: string;
    explanation: string;
    recommended_action: string;
  };
}

// ✅ TASK 7: Strict environment-driven API URL
// Removed hardcoded fallback for production security
const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL!;

// Ensure no trailing slash
const API_BASE_URL = (RAW_API_URL || "").replace(/\/$/, "");

/**
 * Safely retrieves auth token
 */
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

/**
 * Logout helper
 */
export function logout(sessionExpired = false) {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
    if (sessionExpired) {
      toast.error("Session expired");
      window.location.href = "/login";
    }
  }
}

/**
 * Authenticated fetch wrapper
 * ✅ TASK 5: Auto logout handling for 401
 */
async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAuthToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      logout(true);
      throw new Error("Unauthorized");
    }

    return res;
  } catch (error) {
    if (error instanceof Error && error.message !== "Unauthorized") {
      console.error("Fetch error:", error);
    }
    throw error;
  }
}

/**
 * ✅ TASK 4: Real API Health Check
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/`, { method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * LOGIN
 */
export async function login(
  username: string,
  password: string
): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok || !data.access_token) {
      toast.error("Invalid credentials");
      return null;
    }

    localStorage.setItem("auth_token", data.access_token);
    toast.success("Access granted");

    return data.access_token;
  } catch (error) {
    toast.error("Backend unavailable");
    console.error("Login error:", error);
    return null;
  }
}

/**
 * GET ALL INCIDENTS
 */
export async function getIncidents(): Promise<Incident[]> {
  try {
    const res = await authFetch(`${API_BASE_URL}/incidents`, {
      cache: "no-store",
    });

    const json = await res.json();
    const data = json?.data ?? json;

    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("getIncidents error:", error);
    return [];
  }
}

/**
 * GET SINGLE INCIDENT
 */
export async function getIncident(id: string): Promise<Incident | null> {
  try {
    const res = await authFetch(`${API_BASE_URL}/incidents/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) return null;

    const json = await res.json();
    return json?.data ?? json;
  } catch (error) {
    console.error("getIncident error:", error);
    return null;
  }
}

/**
 * UPDATE INCIDENT STATUS
 */
export async function updateIncident(
  id: string,
  status: string
): Promise<boolean> {
  try {
    const res = await authFetch(`${API_BASE_URL}/incidents/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      toast.success(`Incident ${status}`);
    } else {
      toast.error("Action failed");
    }

    return res.ok;
  } catch (error) {
    toast.error("Backend unavailable");
    console.error("updateIncident error:", error);
    return false;
  }
}
