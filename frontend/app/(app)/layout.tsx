"use client";

import {
  useEffect,
} from "react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

import {
  useAuth,
} from "@/context/AuthContext";


const ADMIN_ONLY_ROUTES = [
  "/operations",
  "/compliance",
];


export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const router = useRouter();

  const pathname =
    usePathname();

  const {
    user,
    isAuthenticated,
    isLoading,
  } = useAuth();


  /* =======================================================
     ROUTE PROTECTION
     ======================================================= */

  useEffect(() => {

    /*
     * Wait until authentication state
     * has been restored.
     */
    if (isLoading) {
      return;
    }


    /*
     * No valid session
     */
    if (!isAuthenticated) {

      router.replace(
        "/login"
      );

      return;
    }


    /*
     * Check administrator-only routes
     */
    const isAdminRoute =
      ADMIN_ONLY_ROUTES.some(
        (route) =>
          pathname === route ||
          pathname.startsWith(
            `${route}/`
          )
      );


    /*
     * Normal USER attempting to access
     * an ADMIN-only page.
     */
    if (
      isAdminRoute &&
      user?.role !== "ADMIN"
    ) {

      router.replace(
        "/dashboard"
      );

      return;
    }

  }, [
    isLoading,
    isAuthenticated,
    user?.role,
    pathname,
    router,
  ]);


  /* =======================================================
     AUTHENTICATION LOADING
     ======================================================= */

  /*
   * Don't render the protected application
   * while authentication is being checked.
   */
  if (isLoading) {
    return null;
  }


  /* =======================================================
     UNAUTHENTICATED
     ======================================================= */

  /*
   * The effect above will redirect to /login.
   *
   * Returning null prevents protected content
   * from appearing before redirect.
   */
  if (!isAuthenticated) {
    return null;
  }


  /* =======================================================
     ADMIN ROUTE PROTECTION
     ======================================================= */

  const isAdminRoute =
    ADMIN_ONLY_ROUTES.some(
      (route) =>
        pathname === route ||
        pathname.startsWith(
          `${route}/`
        )
    );


  /*
   * Prevent normal users from briefly
   * seeing administrator pages.
   */
  if (
    isAdminRoute &&
    user?.role !== "ADMIN"
  ) {
    return null;
  }


  /* =======================================================
     APPLICATION LAYOUT
     ======================================================= */

  return (
    <div className="flex min-h-screen bg-gray-100">

      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">

        <Navbar />

        <main className="flex-1 p-8">
          {children}
        </main>

      </div>

    </div>
  );
}