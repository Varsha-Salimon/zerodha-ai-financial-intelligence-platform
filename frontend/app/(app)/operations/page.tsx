"use client";

import { useEffect, useMemo, useState } from "react";

import {
  getAIExecutions,
  getMCPExecutions,
} from "@/lib/api";

import Pagination from "@/components/Pagination";

interface AIExecution {
  execution_id: string;
  workflow: string;
  model: string;
  status: string;
  validation_status: string;
  input_source: string;

  output_summary?: {
    portfolio_overview?: string;
    observation_count?: number;
    performance_highlight_count?: number;
  };

  validation_details?: {
    valid?: boolean;
    schema_valid?: boolean;
    grounding_valid?: boolean;
    policy_valid?: boolean;
    issues?: string[];
  };
}

interface MCPExecution {
  execution_id: string;
  tool_name: string;
  status: string;
  duration_ms: number;
  error_message?: string | null;
  input_source: string;
}

const ITEMS_PER_PAGE = 5;

export default function OperationsPage() {
  const [executions, setExecutions] = useState<
    AIExecution[]
  >([]);

  const [mcpExecutions, setMcpExecutions] = useState<
    MCPExecution[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function loadOperations() {
      try {
        const [aiData, mcpData] =
          await Promise.all([
            getAIExecutions(),
            getMCPExecutions(),
          ]);

        setExecutions(aiData);
        setMcpExecutions(mcpData);

        // Always start from page 1
        // when fresh data is loaded.
        setCurrentPage(1);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load operations data"
        );
      } finally {
        setLoading(false);
      }
    }

    loadOperations();
  }, []);

  const successful = executions.filter(
    (item) => item.status === "SUCCESS"
  ).length;

  const failed = executions.filter(
    (item) => item.status === "FAILED"
  ).length;

  const rejected = executions.filter(
    (item) => item.status === "REJECTED"
  ).length;

  const mcpSuccessful = mcpExecutions.filter(
    (item) => item.status === "SUCCESS"
  ).length;

  const mcpFailed = mcpExecutions.filter(
    (item) => item.status !== "SUCCESS"
  ).length;

  const latestExecution = executions[0];

  const latestMCPExecutions = useMemo(() => {
    if (!latestExecution) {
      return [];
    }

    return mcpExecutions.filter(
      (item) =>
        item.execution_id ===
        latestExecution.execution_id
    );
  }, [executions, mcpExecutions]);

  // =========================================================
  // Pagination
  // =========================================================

  const totalPages = Math.max(
    1,
    Math.ceil(
      executions.length / ITEMS_PER_PAGE
    )
  );

  // Protect against an invalid page if
  // the number of records changes.
  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const paginatedExecutions = useMemo(() => {
    const startIndex =
      (safeCurrentPage - 1) *
      ITEMS_PER_PAGE;

    return executions.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );
  }, [
    executions,
    safeCurrentPage,
  ]);

  const startRecord =
    executions.length === 0
      ? 0
      : (safeCurrentPage - 1) *
          ITEMS_PER_PAGE +
        1;

  const endRecord = Math.min(
    safeCurrentPage * ITEMS_PER_PAGE,
    executions.length
  );

  const goToPreviousPage = () => {
    setCurrentPage((page) =>
      Math.max(1, page - 1)
    );
  };

  const goToNextPage = () => {
    setCurrentPage((page) =>
      Math.min(totalPages, page + 1)
    );
  };

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Operations
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            AI Workflow Monitoring
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Monitor AI workflows, MCP execution,
            model status, and validation outcomes.
          </p>
        </div>

        {/* =================================================
            KPI CARDS
        ================================================= */}

        <div className="grid gap-5 md:grid-cols-5">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              AI Executions
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {executions.length}
            </p>
          </div>

          <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Successful
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {successful}
            </p>
          </div>

          <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Failed
            </p>

            <p className="mt-2 text-3xl font-bold text-red-600">
              {failed}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Rejected
            </p>

            <p className="mt-2 text-3xl font-bold text-amber-600">
              {rejected}
            </p>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              MCP Calls
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {mcpExecutions.length}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {mcpSuccessful} successful ·{" "}
              {mcpFailed} failed
            </p>
          </div>

        </div>

        {/* =================================================
            LATEST EXECUTION
        ================================================= */}

        {latestExecution && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 p-6">

              <h2 className="text-lg font-semibold text-slate-900">
                Latest AI Execution
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                End-to-end execution trace.
              </p>

            </div>

            <div className="grid gap-6 p-6 md:grid-cols-4">

              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Execution ID
                </p>

                <p className="mt-2 break-all font-mono text-xs text-slate-700">
                  {latestExecution.execution_id}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Workflow
                </p>

                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {latestExecution.workflow}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Model
                </p>

                <p className="mt-2 text-sm text-slate-700">
                  {latestExecution.model}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Status
                </p>

                <div className="mt-2 flex gap-2">

                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                    {latestExecution.status}
                  </span>

                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {latestExecution.validation_status}
                  </span>

                </div>
              </div>

            </div>

            {/* =================================================
                VALIDATION
            ================================================= */}

            <div className="border-t border-slate-100 p-6">

              <h3 className="text-sm font-semibold text-slate-900">
                Validation
              </h3>

              <div className="mt-4 grid gap-3 md:grid-cols-3">

                {[
                  [
                    "Schema",
                    latestExecution.validation_details
                      ?.schema_valid,
                  ],
                  [
                    "Grounding",
                    latestExecution.validation_details
                      ?.grounding_valid,
                  ],
                  [
                    "Policy",
                    latestExecution.validation_details
                      ?.policy_valid,
                  ],
                ].map(([label, valid]) => (

                  <div
                    key={label as string}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                  >

                    <span className="text-sm text-slate-600">
                      {label as string} validation
                    </span>

                    <span
                      className={
                        valid
                          ? "font-semibold text-green-600"
                          : "font-semibold text-red-600"
                      }
                    >
                      {valid
                        ? "PASSED"
                        : "FAILED"}
                    </span>

                  </div>

                ))}

              </div>

            </div>

            {/* =================================================
                MCP TRACE
            ================================================= */}

            <div className="border-t border-slate-100 p-6">

              <h3 className="text-sm font-semibold text-slate-900">
                MCP Execution Trace
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                MCP operations associated with this AI
                execution.
              </p>

              {latestMCPExecutions.length === 0 ? (

                <p className="mt-4 text-sm text-slate-500">
                  No MCP execution records found for
                  this execution.
                </p>

              ) : (

                <div className="mt-4 overflow-x-auto">

                  <table className="w-full text-left text-sm">

                    <thead className="border-b border-slate-100">

                      <tr>

                        <th className="px-4 py-3 font-semibold text-slate-500">
                          Tool
                        </th>

                        <th className="px-4 py-3 font-semibold text-slate-500">
                          Status
                        </th>

                        <th className="px-4 py-3 font-semibold text-slate-500">
                          Latency
                        </th>

                        <th className="px-4 py-3 font-semibold text-slate-500">
                          Source
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {latestMCPExecutions.map(
                        (execution) => (

                          <tr
                            key={`${execution.execution_id}-${execution.tool_name}`}
                            className="border-b border-slate-50 last:border-0"
                          >

                            <td className="px-4 py-3 font-mono text-xs text-slate-700">
                              {execution.tool_name}
                            </td>

                            <td className="px-4 py-3">

                              <span
                                className={
                                  execution.status ===
                                  "SUCCESS"
                                    ? "rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700"
                                    : "rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700"
                                }
                              >
                                {execution.status}
                              </span>

                            </td>

                            <td className="px-4 py-3 text-slate-600">
                              {execution.duration_ms.toFixed(
                                2
                              )}{" "}
                              ms
                            </td>

                            <td className="px-4 py-3 text-slate-500">
                              {execution.input_source}
                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </div>

          </div>
        )}

        {/* =================================================
            RECENT AI EXECUTIONS
        ================================================= */}

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 p-6">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <h2 className="text-lg font-semibold text-slate-900">
                  Recent AI Executions
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  AI workflow execution history.
                </p>

              </div>

              {!loading &&
                !error &&
                executions.length > 0 && (

                  <span className="text-xs text-slate-500">
                    Showing {startRecord}–{endRecord} of{" "}
                    {executions.length}
                  </span>

                )}

            </div>

          </div>

          {loading && (

            <div className="p-6 text-sm text-slate-500">
              Loading execution records...
            </div>

          )}

          {error && (

            <div className="p-6 text-sm text-red-600">
              {error}
            </div>

          )}

          {!loading &&
            !error &&
            executions.length === 0 && (

              <div className="p-6 text-sm text-slate-500">
                No AI executions recorded yet.
              </div>

            )}

          {!loading &&
            !error &&
            executions.length > 0 && (

              <>

                <div className="overflow-x-auto">

                  <table className="w-full text-left text-sm">

                    <thead className="border-b border-slate-100 bg-slate-50">

                      <tr>

                        <th className="px-6 py-4 font-semibold text-slate-600">
                          Workflow
                        </th>

                        <th className="px-6 py-4 font-semibold text-slate-600">
                          Model
                        </th>

                        <th className="px-6 py-4 font-semibold text-slate-600">
                          Status
                        </th>

                        <th className="px-6 py-4 font-semibold text-slate-600">
                          Validation
                        </th>

                        <th className="px-6 py-4 font-semibold text-slate-600">
                          Input Source
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {paginatedExecutions.map(
                        (execution) => (

                          <tr
                            key={execution.execution_id}
                            className="border-b border-slate-100 last:border-0"
                          >

                            <td className="px-6 py-4 font-medium text-slate-900">
                              {execution.workflow}
                            </td>

                            <td className="px-6 py-4 text-slate-600">
                              {execution.model}
                            </td>

                            <td className="px-6 py-4">

                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                  execution.status ===
                                  "SUCCESS"
                                    ? "bg-green-50 text-green-700"
                                    : execution.status ===
                                      "FAILED"
                                    ? "bg-red-50 text-red-700"
                                    : "bg-amber-50 text-amber-700"
                                }`}
                              >
                                {execution.status}
                              </span>

                            </td>

                            <td className="px-6 py-4">

                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                  execution.validation_status ===
                                  "PASSED"
                                    ? "bg-blue-50 text-blue-700"
                                    : "bg-red-50 text-red-700"
                                }`}
                              >
                                {
                                  execution.validation_status
                                }
                              </span>

                            </td>

                            <td className="px-6 py-4 text-slate-600">
                              {execution.input_source}
                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

                {/* =================================================
                    COMPACT PAGINATION
                ================================================= */}

                <Pagination
                  currentPage={safeCurrentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />

              </>

            )}

        </div>

      </div>
    </main>
  );
}