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
const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!RAW_API_URL) {
  console.error(
    "ERROR: NEXT_PUBLIC_API_URL is not set. " +
    "Create .env.local with NEXT_PUBLIC_API_URL=http://127.0.0.1:8001"
  );
}

// Ensure no trailing slash
const API_BASE_URL = (RAW_API_URL || "").replace(/\/$/, "");

/**
 * Safely parse JSON, handling non-JSON responses (HTML error pages).
 * Returns parsed JSON or throws a descriptive error.
 */
async function safeJson(res: Response): Promise<any> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `HTTP ${res.status}: ${res.statusText}. ` +
      (text.length < 200 ? text : text.substring(0, 200) + "...")
    );
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await res.text();
    console.error(
      "Expected JSON but got content-type:",
      contentType,
      "Response:",
      text.substring(0, 300)
    );
    throw new Error(
      `Expected JSON response but got ${contentType || "unknown content type"}. ` +
      "Check that NEXT_PUBLIC_API_URL points to the running backend API."
    );
  }

  try {
    return await res.json();
  } catch (e) {
    const text = await res.text().catch(() => "");
    console.error("JSON parse error:", e, "Response text:", text.substring(0, 300));
    throw new Error("Failed to parse JSON response. The API may be returning HTML (is the backend running?)");
  }
}

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
      credentials: "include", // Required for HTTP-only cookies
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
  password: string,
  rememberMe: boolean = false
): Promise<string | null> {
  try {
    if (!API_BASE_URL) {
      toast.error("API URL not configured");
      return null;
    }

    const res = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password, remember_me: rememberMe }),
      credentials: "include", // Required for HTTP-only cookies
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("Login failed:", res.status, text.substring(0, 200));
      toast.error("Invalid credentials");
      return null;
    }

    const data = await safeJson(res);

    if (!data.access_token) {
      toast.error("Invalid credentials");
      return null;
    }

    // Store access token in localStorage for API calls
    localStorage.setItem("auth_token", data.access_token);
    toast.success("Access granted");

    // If "Remember Me" is checked, the backend sets an HTTP-only cookie
    // The browser will automatically send it with future requests
    if (rememberMe) {
      localStorage.setItem("remember_me", "true");
    }

    return data.access_token;
  } catch (error) {
    toast.error("Backend unavailable");
    console.error("Login error:", error);
    return null;
  }
}


/**
 * Check if user has a valid session via HTTP-only cookie
 */
export async function checkSession(): Promise<boolean> {
  try {
    if (!API_BASE_URL) return false;

    const res = await fetch(`${API_BASE_URL}/verify-session`, {
      method: "GET",
      credentials: "include", // Send cookies
    });

    if (res.ok) {
      const data = await safeJson(res);
      if (data.valid && data.username) {
        // If session valid but no access token, user needs to re-login
        if (!localStorage.getItem("auth_token")) {
          return false;
        }
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}


/**
 * Logout: clear local storage and backend cookie
 */
export async function logoutServer(): Promise<void> {
  try {
    if (API_BASE_URL) {
      await fetch(`${API_BASE_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });
    }
  } catch {
    // Ignore errors for logout
  } finally {
    logout(false);
    localStorage.removeItem("remember_me");
  }
}

/**
 * GET ALL INCIDENTS
 */
export async function getIncidents(): Promise<Incident[]> {
  try {
    if (!API_BASE_URL) {
      console.error("getIncidents: NEXT_PUBLIC_API_URL is not set");
      return [];
    }

    const res = await authFetch(`${API_BASE_URL}/incidents`, {
      cache: "no-store",
    });

    const json = await safeJson(res);
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
    if (!API_BASE_URL) return null;

    const res = await authFetch(`${API_BASE_URL}/incidents/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) return null;

    const json = await safeJson(res);
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
    if (!API_BASE_URL) return false;

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
