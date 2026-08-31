"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  Activity,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Database,
  FileCheck2,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import PageHeader from "@/components/PageHeader";
import KPICard from "@/components/KPICard";

import { useAuth } from "@/context/AuthContext";

import {
  getAdminSummary,
  getSystemHealth,
} from "@/lib/api";


/* =========================================================
   TYPES
   ========================================================= */

interface AdminSummary {
  total_users: number;
  total_ai_executions: number;
  successful_ai_executions: number;
  failed_ai_executions: number;
  total_mcp_executions: number;
  failed_mcp_executions: number;
  total_recommendations: number;
}


interface ServiceHealth {
  status: string;
  message?: string;
}


interface SystemHealth {
  overall: ServiceHealth;
  backend: ServiceHealth;
  database: ServiceHealth;
  mcp: ServiceHealth;
  governance: ServiceHealth;
}


/* =========================================================
   STATUS HELPERS
   ========================================================= */

function getStatusClasses(
  status: string
) {
  const normalizedStatus =
    status.toUpperCase();

  if (
    normalizedStatus === "ONLINE" ||
    normalizedStatus === "CONNECTED" ||
    normalizedStatus === "ACTIVE" ||
    normalizedStatus === "ENABLED"
  ) {
    return {
      text: "text-green-600",
      background: "bg-green-100",
      icon: "text-green-600",
    };
  }


  if (
    normalizedStatus === "CONFIGURED"
  ) {
    return {
      text: "text-blue-600",
      background: "bg-blue-100",
      icon: "text-blue-600",
    };
  }


  if (
    normalizedStatus === "CHECKING"
  ) {
    return {
      text: "text-amber-600",
      background: "bg-amber-100",
      icon: "text-amber-600",
    };
  }


  return {
    text: "text-red-600",
    background: "bg-red-100",
    icon: "text-red-600",
  };
}


/* =========================================================
   OVERALL STATUS
   ========================================================= */

function getOverallStatusClasses(
  status: string
) {
  const normalizedStatus =
    status.toUpperCase();

  if (
    normalizedStatus === "HEALTHY"
  ) {
    return {
      text: "text-green-600",
      background: "bg-green-100",
      border: "border-green-200",
    };
  }


  if (
    normalizedStatus === "CHECKING"
  ) {
    return {
      text: "text-amber-600",
      background: "bg-amber-100",
      border: "border-amber-200",
    };
  }


  return {
    text: "text-red-600",
    background: "bg-red-100",
    border: "border-red-200",
  };
}


/* =========================================================
   SERVICE STATUS CARD
   ========================================================= */

function ServiceStatusCard({
  title,
  description,
  status,
  icon,
}: {
  title: string;
  description: string;
  status: string;
  icon: React.ReactNode;
}) {

  const classes =
    getStatusClasses(status);


  const healthyStatuses = [
    "ONLINE",
    "CONNECTED",
    "ACTIVE",
    "ENABLED",
    "CONFIGURED",
  ];


  const isHealthy =
    healthyStatuses.includes(
      status.toUpperCase()
    );


  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

      <div className="flex items-center justify-between">

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${classes.background}`}
        >
          <div
            className={classes.icon}
          >
            {icon}
          </div>
        </div>


        <span
          className={`text-xs font-semibold ${classes.text}`}
        >
          {status}
        </span>

      </div>


      <h3 className="mt-4 font-semibold text-slate-900">
        {title}
      </h3>


      <div className="mt-1 flex items-center gap-1.5">

        {isHealthy ? (
          <CheckCircle2
            size={13}
            className="text-green-500"
          />
        ) : (
          <AlertCircle
            size={13}
            className="text-amber-500"
          />
        )}


        <p className="text-xs text-slate-500">
          {description}
        </p>

      </div>

    </div>
  );
}


/* =========================================================
   ADMIN DASHBOARD
   ========================================================= */

export default function AdminDashboard() {

  const {
    user,
  } = useAuth();


  /* =======================================================
     STATE
     ======================================================= */

  const [
    summary,
    setSummary,
  ] = useState<
    AdminSummary | null
  >(null);


  const [
    health,
    setHealth,
  ] = useState<
    SystemHealth | null
  >(null);


  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);


  const [
    isRefreshing,
    setIsRefreshing,
  ] = useState(false);


  /* =======================================================
     INITIAL DATA LOAD
     ======================================================= */

  useEffect(() => {

    let cancelled = false;


    async function load() {

      try {

        const [
          summaryData,
          healthData,
        ] = await Promise.all([
          getAdminSummary(),
          getSystemHealth(),
        ]);


        if (cancelled) {
          return;
        }


        setSummary(
          summaryData
        );


        setHealth(
          healthData
        );


        setError(null);

      } catch (err) {

        if (cancelled) {
          return;
        }


        console.error(
          "Failed to load admin dashboard:",
          err
        );


        setError(
          err instanceof Error
            ? err.message
            : "Failed to load admin dashboard data."
        );

      }

    }


    load();


    return () => {
      cancelled = true;
    };

  }, []);


  /* =======================================================
     REFRESH
     ======================================================= */

  async function handleRefresh() {

    try {

      setIsRefreshing(true);
      setError(null);


      const [
        summaryData,
        healthData,
      ] = await Promise.all([
        getAdminSummary(),
        getSystemHealth(),
      ]);


      setSummary(
        summaryData
      );


      setHealth(
        healthData
      );

    } catch (err) {

      console.error(
        "Failed to refresh admin dashboard:",
        err
      );


      setError(
        err instanceof Error
          ? err.message
          : "Failed to refresh admin dashboard."
      );

    } finally {

      setIsRefreshing(false);

    }

  }


  /* =======================================================
     LOADING STATE
     ======================================================= */

  const isLoading =
    summary === null ||
    health === null;


  /* =======================================================
     SYSTEM STATUS
     ======================================================= */

  const overallStatus =
    health?.overall?.status ??
    "CHECKING";


  const overallClasses =
    getOverallStatusClasses(
      overallStatus
    );


  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <main className="space-y-8">


      {/* ===================================================
          HEADER
      =================================================== */}

      <PageHeader
        title="Admin Dashboard"
        subtitle="Monitor AI workflows, platform operations, compliance, and system health."
      />


      {/* ===================================================
          ADMIN IDENTITY
      =================================================== */}

      <section className="overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 text-white shadow-sm">

        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15">

              <ShieldCheck
                size={25}
                strokeWidth={2}
              />

            </div>


            <div>

              <p className="text-xs font-semibold uppercase tracking-wider text-blue-100">
                Administrator Workspace
              </p>


              <h2 className="mt-1 text-2xl font-bold">
                Welcome,{" "}
                {user?.name ?? "Admin"}
              </h2>


              <p className="mt-1 text-sm text-blue-100">
                Manage platform intelligence, AI execution,
                and governance controls.
              </p>

            </div>

          </div>


          <div className="rounded-xl bg-white/10 px-4 py-3">

            <p className="text-xs text-blue-100">
              Access Level
            </p>


            <p className="mt-1 font-semibold">
              ADMIN
            </p>

          </div>

        </div>

      </section>


      {/* ===================================================
          ERROR MESSAGE
      =================================================== */}

      {error && (

        <section className="rounded-xl border border-red-200 bg-red-50 p-4">

          <div className="flex items-start gap-3">

            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0 text-red-600"
            />


            <div className="flex-1">

              <p className="font-semibold text-red-800">
                Unable to load admin dashboard data
              </p>


              <p className="mt-1 text-sm text-red-700">
                {error}
              </p>


              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >

                <RefreshIcon
                  spinning={isRefreshing}
                />

                {isRefreshing
                  ? "Retrying..."
                  : "Retry"}

              </button>

            </div>

          </div>

        </section>

      )}


      {/* ===================================================
          KPI CARDS
      =================================================== */}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">

        <KPICard
          title="Total Users"
          value={
            isLoading
              ? "..."
              : String(
                  summary?.total_users ??
                  0
                )
          }
          valueColor="text-blue-600"
        />


        <KPICard
          title="AI Executions"
          value={
            isLoading
              ? "..."
              : String(
                  summary?.total_ai_executions ??
                  0
                )
          }
          valueColor="text-indigo-600"
        />


        <KPICard
          title="MCP Executions"
          value={
            isLoading
              ? "..."
              : String(
                  summary?.total_mcp_executions ??
                  0
                )
          }
          valueColor="text-purple-600"
        />


        <KPICard
          title="Recommendations"
          value={
            isLoading
              ? "..."
              : String(
                  summary?.total_recommendations ??
                  0
                )
          }
          valueColor="text-green-600"
        />

      </div>


      {/* ===================================================
          EXECUTION SUMMARY
      =================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="mb-6">

          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
            Execution Summary
          </p>


          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            AI & MCP Activity
          </h2>


          <p className="mt-1 text-sm text-slate-500">
            Current execution statistics from the platform
            audit records.
          </p>

        </div>


        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">


          {/* -------------------------------------------------
             SUCCESSFUL AI
          ------------------------------------------------- */}

          <div className="rounded-xl border border-green-100 bg-green-50 p-5">

            <div className="flex items-center justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">

                <CheckCircle2
                  size={20}
                  className="text-green-600"
                />

              </div>


              <span className="text-xs font-semibold text-green-600">
                SUCCESS
              </span>

            </div>


            <p className="mt-4 text-sm text-slate-500">
              Successful AI Executions
            </p>


            <p className="mt-1 text-2xl font-bold text-slate-900">

              {isLoading
                ? "..."
                : summary?.successful_ai_executions ??
                  0}

            </p>

          </div>


          {/* -------------------------------------------------
             FAILED AI
          ------------------------------------------------- */}

          <div className="rounded-xl border border-red-100 bg-red-50 p-5">

            <div className="flex items-center justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">

                <AlertCircle
                  size={20}
                  className="text-red-600"
                />

              </div>


              <span className="text-xs font-semibold text-red-600">
                FAILED
              </span>

            </div>


            <p className="mt-4 text-sm text-slate-500">
              Failed AI Executions
            </p>


            <p className="mt-1 text-2xl font-bold text-slate-900">

              {isLoading
                ? "..."
                : summary?.failed_ai_executions ??
                  0}

            </p>

          </div>


          {/* -------------------------------------------------
             FAILED MCP
          ------------------------------------------------- */}

          <div
            className={`rounded-xl border p-5 ${(summary?.failed_mcp_executions ?? 0) > 0
              ? "border-amber-100 bg-amber-50"
              : "border-green-100 bg-green-50"}`}
          >

            <div className="flex items-center justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">

                <AlertCircle
                  size={20}
                  className={(summary?.failed_mcp_executions ?? 0) > 0
                    ? "text-amber-600"
                    : "text-green-600"}
                />

              </div>


              <span
                className={`text-xs font-semibold ${(summary?.failed_mcp_executions ?? 0) > 0
                  ? "text-amber-600"
                  : "text-green-600"}`}
              >
                {(summary?.failed_mcp_executions ?? 0) > 0
                  ? "ATTENTION"
                  : "HEALTHY"}
              </span>

            </div>


            <p className="mt-4 text-sm text-slate-500">
              Failed MCP Executions
            </p>


            <p className="mt-1 text-2xl font-bold text-slate-900">

              {isLoading
                ? "..."
                : summary?.failed_mcp_executions ??
                  0}

            </p>

          </div>

        </div>

      </section>


      {/* ===================================================
          PLATFORM OVERVIEW
      =================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="mb-6">

          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
            Platform Overview
          </p>


          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            AI Financial Intelligence Controls
          </h2>


          <p className="mt-1 text-sm text-slate-500">
            Access operational, compliance, and AI governance
            capabilities from one workspace.
          </p>

        </div>


        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">


          {/* -------------------------------------------------
             AI OPERATIONS
          ------------------------------------------------- */}

          <Link
            href="/operations"
            className="group rounded-2xl border border-blue-100 bg-blue-50/60 p-5 transition hover:border-blue-200 hover:bg-blue-50 hover:shadow-sm"
          >

            <div className="flex items-start justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">

                <Activity
                  size={21}
                />

              </div>


              <ArrowRight
                size={19}
                className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600"
              />

            </div>


            <h3 className="mt-5 text-lg font-semibold text-slate-900">
              AI Operations
            </h3>


            <p className="mt-2 text-sm leading-6 text-slate-500">
              Monitor AI workflow executions, MCP activity,
              validation status, and execution telemetry.
            </p>

          </Link>


          {/* -------------------------------------------------
             COMPLIANCE
          ------------------------------------------------- */}

          <Link
            href="/compliance"
            className="group rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5 transition hover:border-indigo-200 hover:bg-indigo-50 hover:shadow-sm"
          >

            <div className="flex items-start justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white">

                <ClipboardCheck
                  size={21}
                />

              </div>


              <ArrowRight
                size={19}
                className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-indigo-600"
              />

            </div>


            <h3 className="mt-5 text-lg font-semibold text-slate-900">
              Compliance & Audit
            </h3>


            <p className="mt-2 text-sm leading-6 text-slate-500">
              Review AI governance, audit records, validation
              information, and compliance controls.
            </p>

          </Link>

        </div>

      </section>


      {/* ===================================================
          SYSTEM HEALTH
      =================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

          <div>

            <p className="text-xs font-semibold uppercase tracking-wide text-green-600">
              System Health
            </p>


            <h2 className="mt-1 text-xl font-semibold text-slate-900">
              Platform Services
            </h2>


            <p className="mt-1 text-sm text-slate-500">
              High-level status of the platform intelligence
              infrastructure.
            </p>

          </div>


          <div
            className={`inline-flex items-center gap-2 self-start rounded-xl border px-4 py-2 ${overallClasses.background} ${overallClasses.border}`}
          >

            {overallStatus === "HEALTHY" ? (

              <CheckCircle2
                size={17}
                className="text-green-600"
              />

            ) : (

              <AlertCircle
                size={17}
                className="text-amber-600"
              />

            )}


            <span
              className={`text-sm font-semibold ${overallClasses.text}`}
            >
              System{" "}
              {overallStatus}

            </span>

          </div>

        </div>


        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">


          {/* -------------------------------------------------
             BACKEND
          ------------------------------------------------- */}

          <ServiceStatusCard
            title="Backend API"
            description="FastAPI service"
            status={
              health?.backend?.status ??
              "CHECKING"
            }
            icon={
              <Activity
                size={19}
              />
            }
          />


          {/* -------------------------------------------------
             DATABASE
          ------------------------------------------------- */}

          <ServiceStatusCard
            title="Database"
            description="PostgreSQL"
            status={
              health?.database?.status ??
              "CHECKING"
            }
            icon={
              <Database
                size={19}
              />
            }
          />


          {/* -------------------------------------------------
             MCP
          ------------------------------------------------- */}

          <ServiceStatusCard
            title="MCP Server"
            description="Tool orchestration"
            status={
              health?.mcp?.status ??
              "CHECKING"
            }
            icon={
              <Sparkles
                size={19}
              />
            }
          />


          {/* -------------------------------------------------
             GOVERNANCE
          ------------------------------------------------- */}

          <ServiceStatusCard
            title="Governance"
            description="AI validation & audit"
            status={
              health?.governance?.status ??
              "CHECKING"
            }
            icon={
              <FileCheck2
                size={19}
              />
            }
          />

        </div>

      </section>


      {/* ===================================================
          ADMIN CAPABILITIES
      =================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="mb-6">

          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
            Administration
          </p>


          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            Platform Capabilities
          </h2>

        </div>


        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">


          {/* -------------------------------------------------
             USER ACCESS
          ------------------------------------------------- */}

          <div className="rounded-xl border border-slate-200 p-5">

            <Users
              size={21}
              className="text-blue-600"
            />


            <h3 className="mt-4 font-semibold text-slate-900">
              User Access
            </h3>


            <p className="mt-2 text-sm leading-5 text-slate-500">
              Role-based access controls separate user and
              administrator capabilities.
            </p>

          </div>


          {/* -------------------------------------------------
             AI MONITORING
          ------------------------------------------------- */}

          <div className="rounded-xl border border-slate-200 p-5">

            <Activity
              size={21}
              className="text-indigo-600"
            />


            <h3 className="mt-4 font-semibold text-slate-900">
              AI Monitoring
            </h3>


            <p className="mt-2 text-sm leading-5 text-slate-500">
              Monitor AI and MCP execution activity through
              the operations workspace.
            </p>

          </div>


          {/* -------------------------------------------------
             GOVERNANCE
          ------------------------------------------------- */}

          <div className="rounded-xl border border-slate-200 p-5">

            <ShieldCheck
              size={21}
              className="text-green-600"
            />


            <h3 className="mt-4 font-semibold text-slate-900">
              Governance
            </h3>


            <p className="mt-2 text-sm leading-5 text-slate-500">
              Maintain traceability and governance around
              AI-generated financial intelligence.
            </p>

          </div>

        </div>

      </section>


      {/* ===================================================
          QUICK ACTIONS
      =================================================== */}

      <section className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-indigo-50 p-6 shadow-sm">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">

            <Sparkles
              size={19}
            />

          </div>


          <div>

            <h2 className="font-semibold text-slate-900">
              Administrative Quick Actions
            </h2>


            <p className="text-sm text-slate-500">
              Navigate directly to the platform governance
              workspaces.
            </p>

          </div>

        </div>


        <div className="mt-5 flex flex-col gap-3 sm:flex-row">

          <Link
            href="/operations"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Open AI Operations

            <ArrowRight
              size={16}
            />

          </Link>


          <Link
            href="/compliance"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
          >
            Open Compliance

            <ArrowRight
              size={16}
            />

          </Link>

        </div>

      </section>


      {/* ===================================================
          GOVERNANCE NOTE
      =================================================== */}

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

        <p className="text-xs leading-5 text-slate-500">
          Administrative access is restricted to authorized
          administrators. Platform monitoring and governance
          information is intended for internal operational use.
        </p>

      </div>

    </main>
  );
}


/* =========================================================
   REFRESH ICON
   ========================================================= */

function RefreshIcon({
  spinning,
}: {
  spinning: boolean;
}) {

  return (
    <svg
      className={
        spinning
          ? "h-4 w-4 animate-spin"
          : "h-4 w-4"
      }
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 4v5h5"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 20v-5h-5"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.5 15a8 8 0 0 0 13.9 1.5L20 15"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18.5 9a8 8 0 0 0-13.9-1.5L4 9"
      />

    </svg>
  );
}