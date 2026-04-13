import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";

export default function AuthGuard({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  // ✅ WAIT UNTIL AUTH CHECK IS DONE
  if (loading) {
    return (
      <div style={{ color: "white", padding: "20px" }}>
        Checking session...
      </div>
    );
  }

  // ❌ NOT LOGGED IN
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ❌ WRONG ROLE
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div style={{ color: "white", padding: "20px" }}>
        Access Denied
      </div>
    );
  }

  // ✅ ALLOWED
  return children;
}