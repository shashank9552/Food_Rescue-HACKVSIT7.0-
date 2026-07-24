import { useState } from 'react';

// TODO: Integrate Firebase Authentication listener (onAuthStateChanged)
// This hook will track the logged-in user state and handle login/logout triggers.
export function useAuth() {
  const [user, setUser] = useState({
    uid: "mock-user-123",
    email: "volunteer@foodrescue.org",
    role: "volunteer" // Can be "restaurant" | "ngo" | "volunteer" | "admin"
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    console.log(`[useAuth] Mock login for ${email}`);
    setUser({ uid: "mock-user-123", email, role: "volunteer" });
  };

  const logout = async () => {
    console.log("[useAuth] Mock logout");
    setUser(null);
  };

  return {
    user,
    loading,
    login,
    logout
  };
}
