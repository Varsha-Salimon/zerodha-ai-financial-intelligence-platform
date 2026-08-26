"use client";

import { useEffect, useState } from "react";

import {
  getAIExecutions,
  getMCPExecutions,
} from "@/lib/api";

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

interface MCPExecution {
  execution_id: string;
  tool_name: string;
  status: string;
  duration_ms: number;
  error_message?: string | null;
  input_source: string;
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const passed =
    status === "SUCCESS" ||
    status === "PASSED";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        passed
          ? "bg-green-50 text-green-700"
          : "bg-red-50 text-red-700"
      }`}
    >
      {status}
    </span>
  );
}

function ValidationCard({
  label,
  passed,
}: {
  label: string;
  passed: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
            passed
              ? "bg-green-50 text-green-600"
              : "bg-red-50 text-red-600"
          }`}
        >
          {passed ? "✓" : "!"}
        </div>

        <span className="text-sm font-medium text-slate-700">
          {label}
        </span>
      </div>

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

  const [mcpExecutions, setMCPExecutions] =
    useState<MCPExecution[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadComplianceData() {
      try {
        setLoading(true);
        setError("");

        const [
          aiData,
          mcpData,
        ] = await Promise.all([
          getAIExecutions(),
          getMCPExecutions(),
        ]);

        if (aiData.length > 0) {
          setExecution(aiData[0]);
        }

        setMCPExecutions(mcpData);

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

    loadComplianceData();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-7xl">
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
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        </div>
      </main>
    );
  }

  if (!execution) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-7xl">

          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              Compliance
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              AI Governance & Compliance
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Validation, governance, and audit status
              for AI-generated portfolio analysis.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="font-semibold text-slate-900">
              No AI execution records available
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Run an AI portfolio analysis to create
              governance and audit records.
            </p>
          </div>

        </div>
      </main>
    );
  }

  const validation =
    execution.validation_details;

  const issues =
    validation?.issues ?? [];

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Compliance
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            AI Governance & Compliance
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Validation, governance, and audit status
            for AI-generated portfolio analysis.
          </p>
        </div>

        {/* Overall validation */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Overall Validation
              </p>

              <h2 className="mt-1 text-xl font-semibold text-slate-900">
                {validation?.valid
                  ? "AI analysis validation passed"
                  : "AI analysis validation failed"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                The generated analysis was checked for
                schema validity, grounding, and policy
                compliance.
              </p>
            </div>

            <span
              className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${
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

        </section>

        {/* Validation checks */}

        <section className="mt-6">

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

        </section>

        {/* AI execution details */}

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Latest AI Execution
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Audit information for the latest AI
                portfolio analysis workflow.
              </p>
            </div>

            <StatusBadge
              status={execution.status}
            />

          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">

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
                Validation Status
              </p>

              <div className="mt-1">
                <StatusBadge
                  status={execution.validation_status}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Input Source
              </p>

              <p className="mt-1 text-sm font-medium text-slate-700">
                {execution.input_source}
              </p>
            </div>

          </div>

        </section>

        {/* Validation issues */}

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="text-lg font-semibold text-slate-900">
            Validation Issues
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Issues detected during AI output validation.
          </p>

          {issues.length === 0 ? (
            <div className="mt-4 rounded-xl border border-green-100 bg-green-50 p-4">
              <p className="text-sm font-medium text-green-700">
                ✓ No validation issues detected.
              </p>

              <p className="mt-1 text-xs text-green-600">
                The latest AI output passed all configured
                validation checks.
              </p>
            </div>
          ) : (
            <ul className="mt-4 space-y-2">
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

        </section>

        {/* MCP audit */}

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 p-6">

            <h2 className="text-lg font-semibold text-slate-900">
              MCP Execution Audit
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Read-only MCP tool executions used during
              the AI analysis workflow.
            </p>

          </div>

          {mcpExecutions.length === 0 ? (
            <div className="p-6 text-sm text-slate-500">
              No MCP execution records available.
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-left text-sm">

                <thead className="border-b border-slate-100 bg-slate-50">

                  <tr>

                    <th className="px-6 py-4 font-semibold text-slate-600">
                      MCP Tool
                    </th>

                    <th className="px-6 py-4 font-semibold text-slate-600">
                      Status
                    </th>

                    <th className="px-6 py-4 font-semibold text-slate-600">
                      Duration
                    </th>

                    <th className="px-6 py-4 font-semibold text-slate-600">
                      Source
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {mcpExecutions.map(
                    (record, index) => (
                      <tr
                        key={`${record.execution_id}-${record.tool_name}-${index}`}
                        className="border-b border-slate-100 last:border-0"
                      >

                        <td className="px-6 py-4 font-medium text-slate-900">
                          {record.tool_name}
                        </td>

                        <td className="px-6 py-4">
                          <StatusBadge
                            status={record.status}
                          />
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          {record.duration_ms.toFixed(2)} ms
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          {record.input_source}
                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </section>

        {/* Governance explanation */}

        <section className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-6">

          <h2 className="text-lg font-semibold text-slate-900">
            Governance Controls
          </h2>

          <div className="mt-4 grid gap-4 md:grid-cols-3">

            <div className="rounded-xl bg-white p-4">

              <p className="font-semibold text-slate-900">
                Grounded Analysis
              </p>

              <p className="mt-1 text-sm leading-5 text-slate-500">
                AI analysis is constrained to portfolio,
                analytics, market, and approved news
                context retrieved through MCP.
              </p>

            </div>

            <div className="rounded-xl bg-white p-4">

              <p className="font-semibold text-slate-900">
                Structured Output
              </p>

              <p className="mt-1 text-sm leading-5 text-slate-500">
                AI responses are validated against the
                application&apos;s defined response schema.
              </p>

            </div>

            <div className="rounded-xl bg-white p-4">

              <p className="font-semibold text-slate-900">
                Auditability
              </p>

              <p className="mt-1 text-sm leading-5 text-slate-500">
                AI and MCP executions are recorded with
                status, validation results, and execution
                metadata.
              </p>

            </div>

          </div>

        </section>

        {/* Disclaimer */}

        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">

          <p className="text-xs leading-5 text-slate-500">
            Governance information is provided for
            monitoring and audit purposes. AI-generated
            analysis is informational only and does not
            constitute financial, investment, or trading
            advice.
          </p>

        </div>

      </div>
    </main>
  );
}