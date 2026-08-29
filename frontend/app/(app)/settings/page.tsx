export default function SettingsPage() {
  return (
    <main className="space-y-8">

      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Settings
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          Platform Settings
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Configuration and preferences for the AI financial
          intelligence platform.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <h2 className="text-lg font-semibold text-slate-900">
          AI Configuration
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          AI analysis and recommendation settings.
        </p>

        <div className="mt-5 space-y-4">

          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
            <div>
              <p className="font-medium text-slate-900">
                AI Portfolio Analysis
              </p>

              <p className="text-sm text-slate-500">
                Generate explainable portfolio insights.
              </p>
            </div>

            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
              Enabled
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
            <div>
              <p className="font-medium text-slate-900">
                Deterministic Recommendations
              </p>

              <p className="text-sm text-slate-500">
                Generate recommendations from portfolio analytics.
              </p>
            </div>

            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
              Enabled
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
            <div>
              <p className="font-medium text-slate-900">
                AI Validation
              </p>

              <p className="text-sm text-slate-500">
                Schema, grounding, and policy validation.
              </p>
            </div>

            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
              Enabled
            </span>
          </div>

        </div>

      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <h2 className="text-lg font-semibold text-slate-900">
          Data & Governance
        </h2>

        <div className="mt-5 grid gap-4 md:grid-cols-3">

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="font-semibold text-slate-900">
              MCP
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Controlled data access through MCP tools.
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="font-semibold text-slate-900">
              Audit Logging
            </p>

            <p className="mt-1 text-sm text-slate-500">
              AI and MCP execution records are retained.
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="font-semibold text-slate-900">
              Read-only Analysis
            </p>

            <p className="mt-1 text-sm text-slate-500">
              The platform does not automatically execute trades.
            </p>
          </div>

        </div>

      </section>

    </main>
  );
}