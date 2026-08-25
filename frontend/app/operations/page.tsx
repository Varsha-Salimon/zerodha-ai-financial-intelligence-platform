"use client";

import { useEffect, useState } from "react";
import { getAIExecutions } from "@/lib/api";

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

export default function OperationsPage() {
  const [executions, setExecutions] = useState<AIExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadExecutions() {
      try {
        const data = await getAIExecutions();
        setExecutions(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load executions"
        );
      } finally {
        setLoading(false);
      }
    }

    loadExecutions();
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

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Operations
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            AI Operations
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Monitor AI workflow executions, model status,
            and validation outcomes.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-5 md:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Executions
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

        </div>

        {/* Execution table */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Recent AI Executions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              AI workflow execution history.
            </p>
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

          {!loading && !error && executions.length === 0 && (
            <div className="p-6 text-sm text-slate-500">
              No AI executions recorded yet.
            </div>
          )}

          {!loading && !error && executions.length > 0 && (
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
                  {executions.map((execution) => (
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
                            execution.status === "SUCCESS"
                              ? "bg-green-50 text-green-700"
                              : execution.status === "FAILED"
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
                            execution.validation_status === "PASSED"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {execution.validation_status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {execution.input_source}
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}