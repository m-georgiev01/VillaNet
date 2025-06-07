import React from "react";
import { observer } from "mobx-react-lite";
import authStore from "../../stores/authStore";
import { Navigate, Outlet } from "react-router";

interface Props {
  requireRole?: "Admin" | "Owner" | "Customer";
}

export const ProtectedRoute: React.FC<Props> = observer(({ requireRole }) => {
  if (!authStore.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (
    (requireRole === "Admin" && !authStore.isAdmin) ||
    (requireRole === "Owner" && !authStore.isOwner) ||
    (requireRole === "Customer" && !authStore.isCustomer)
  ) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
});
