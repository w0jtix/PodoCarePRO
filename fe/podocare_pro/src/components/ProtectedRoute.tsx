import { Navigate } from "react-router-dom";
import { useUser } from "./User/UserProvider";

interface ProtectedRouteProps {
  permissions: string[];
  children: JSX.Element;
}

export function ProtectedRoute({ permissions, children }: ProtectedRouteProps) {
  const { user } = useUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const hasAccess = permissions.every((perm) => user.roles.includes(perm as any));

  if (!hasAccess) {
    return <Navigate to="/no-access" replace />;
  }

  return children;
}
