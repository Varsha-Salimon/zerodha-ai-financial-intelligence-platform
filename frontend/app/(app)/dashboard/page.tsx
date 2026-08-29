"use client";

import AdminDashboard from "@/components/AdminDashboard";
import UserDashboard from "@/components/UserDashboard";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();

  /*
   * Authentication is handled by the application layout.
   * If authentication has not been restored yet, render
   * nothing rather than accidentally loading user data.
   */
  if (!isAuthenticated || !user) {
    return null;
  }

  /*
   * Administrators receive the administrative workspace.
   */
  if (user.role === "ADMIN") {
    return <AdminDashboard />;
  }

  /*
   * Normal users receive the existing portfolio dashboard.
   */
  return <UserDashboard />;
}