import { Navigate, Outlet } from "react-router-dom";
import Loading from "../ui/loading";
import { useStore } from "@/stores/store";

export function AuthLayout() {
  const user = useStore((state) => state.user);
  const isCheckingSession = useStore((state) => state.isCheckingSession);

  if (isCheckingSession) {
    return <Loading />;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

export function GuestLayout() {
  const user = useStore((state) => state.user);
  const isCheckingSession = useStore((state) => state.isCheckingSession);

  if (isCheckingSession) {
    return <Loading />;
  }
  if (user) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
