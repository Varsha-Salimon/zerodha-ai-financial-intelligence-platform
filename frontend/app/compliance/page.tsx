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
  validation_details?: {
    valid?: boolean;
    schema_valid?: boolean;
    grounding_valid?: boolean;
    policy_valid?: boolean;
    issues?: string[];
  };
}

function ValidationCard({
  label,
  passed,
}: {
  label: string;
  passed: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
      <span className="text-sm font-medium text-slate-700">
        {label}
      </span>

      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${
          passed
            ? "bg-green-50 text-green-700"
            : "bg-red-50 text-red-700"
        }`}
      >
        {passed ? "PASSED" : "FAILED"}
      </span>
    </div>
  );
}

export default function CompliancePage() {
  const [execution, setExecution] =
    useState<AIExecution | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadExecution() {
      try {
        const data = await getAIExecutions();

        if (data.length > 0) {
          setExecution(data[0]);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load compliance data"
        );
      } finally {
        setLoading(false);
      }
    }

    loadExecution();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm text-slate-500">
            Loading compliance data...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm text-red-600">
            {error}
          </p>
        </div>
      </main>
    );
  }

  if (!execution) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold text-slate-900">
            AI Governance & Compliance
          </h1>

          <p className="mt-4 text-sm text-slate-500">
            No AI execution records are available.
          </p>
        </div>
      </main>
    );
  }

  const validation =
    execution.validation_details;

  const issues = validation?.issues ?? [];

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Compliance
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            AI Governance & Compliance
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Validation and governance status for AI-generated
            portfolio analysis.
          </p>
        </div>

        {/* Overall status */}
        <div className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Overall Validation
              </p>

              <h2 className="mt-1 text-xl font-semibold text-slate-900">
                {validation?.valid
                  ? "Validation Passed"
                  : "Validation Failed"}
              </h2>
            </div>

            <span
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                validation?.valid
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {validation?.valid
                ? "PASSED"
                : "FAILED"}
            </span>

          </div>
        </div>

        {/* Validation checks */}
        <div className="mt-6">

          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            Validation Checks
          </h2>

          <div className="grid gap-3 md:grid-cols-3">

            <ValidationCard
              label="Schema Validation"
              passed={
                validation?.schema_valid === true
              }
            />

            <ValidationCard
              label="Grounding Validation"
              passed={
                validation?.grounding_valid === true
              }
            />

            <ValidationCard
              label="Policy Validation"
              passed={
                validation?.policy_valid === true
              }
            />

          </div>
        </div>

        {/* Issues */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="text-lg font-semibold text-slate-900">
            Validation Issues
          </h2>

          {issues.length === 0 ? (
            <p className="mt-3 text-sm text-green-600">
              No validation issues detected.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {issues.map((issue, index) => (
                <li
                  key={index}
                  className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
                >
                  {issue}
                </li>
              ))}
            </ul>
          )}

        </div>

        {/* Execution details */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="text-lg font-semibold text-slate-900">
            Execution Details
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Execution ID
              </p>

              <p className="mt-1 break-all text-sm font-medium text-slate-700">
                {execution.execution_id}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Workflow
              </p>

              <p className="mt-1 text-sm font-medium text-slate-700">
                {execution.workflow}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Model
              </p>

              <p className="mt-1 text-sm font-medium text-slate-700">
                {execution.model}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Input Source
              </p>

              <p className="mt-1 text-sm font-medium text-slate-700">
                {execution.input_source}
              </p>
            </div>

          </div>

        </div>

      </div>
    </main>
  );
}