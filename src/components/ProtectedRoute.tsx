import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";

function ProtectedRoute() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const token = Cookies.get("token");

      if (!token) {
        setAuthorized(false);
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/admin/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setAuthorized(response.ok);
      } catch {
        setAuthorized(false);
      }
    }

    checkAuth();
  }, []);

  if (authorized === null) {
    return <p>Проверка авторизации...</p>;
  }

  return authorized ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;