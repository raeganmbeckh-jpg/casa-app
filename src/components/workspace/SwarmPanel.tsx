"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Check, X, Loader2, Clock, ChevronRight, AlertCircle } from "lucide-react";

type AgentAction = {
  id: string;
  role: string;
  action_type: string;
  title: string;
  summary: string;
  payload: any;
  status: string;
  created_at: string;
  approved_at: string | null;
  completed_at: string | null;
  result: any;
  error: string | null;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  proposed: { label: "PROPOSED", color: "#92700C", bg: "rgba(249,217,106,0.2)" },
  approved: { label: "APPROVED", color: "#15803D", bg: "rgba(21,128,61,0.1)" },
  executing: { label: "EXECUTING", color: "#D97706", bg: "rgba(217,119,6,0.1)" },
  completed: { label: "COMPLETED", color: "#15803D", bg: "rgba(21,128,61,0.15)" },
  failed: { label: "FAILED", color: "#B91C1C", bg: "rgba(185,28,28,0.1)" },
  dismissed: { label: "DISMISSED", color: "rgba(120,113,108,1)", bg: "rgba(120,113,108,0.1)" },
};

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.proposed;
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium tracking-wider"
      style={{ backgroundColor: c.bg, color: c.color }}
    >
      {c.label}
    </span>
  );
}

function Timeline({ action }: { action: AgentAction }) {
  const steps = [
    { label: "Proposed", time: action.created_at, done: true },
    { label: "Approved", time: action.approved_at, done: !!action.approved_at },
    { label: "Completed", time: action.completed_at, done: action.status === "completed" },
  ];

  return (
    <div className="mt-3 flex items-center gap-1">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center gap-1">
          <div
            className="flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[9px] tracking-wider"
            style={{
              backgroundColor: step.done ? "rgba(21,128,61,0.1)" : "rgba(168,162,158,0.15)",
              color: step.done ? "#15803D" : "rgba(120,113,108,1)",
            }}
          >
            {step.done && <Check className="h-2.5 w-2.5" />}
            {step.label}
            {step.time && step.done && (
              <span className="ml-1 opacity-60">
                {new Date(step.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>
          {i < steps.length - 1 && (
            <ChevronRight className="h-3 w-3 text-stone-300" />
          )}
        </div>
      ))}
    </div>
  );
}

export function SwarmPanel({
  role,
  initialActions,
}: {
  role: string;
  initialActions: AgentAction[];
}) {
  const [actions, setActions] = useState<AgentAction[]>(initialActions);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runSwarm() {
    setRunning(true);
    setError(null);
    try {
      const res = await fetch("/api/swarm/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Swarm run failed");
      setActions((prev) => [...(data.actions || []), ...prev]);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setRunning(false);
    }
  }

  async function approveAction(id: string) {
    // Optimistic update
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "approved", approved_at: new Date().toISOString() } : a))
    );

    try {
      const res = await fetch("/api/actions/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Refetch to get final state
      setActions((prev) =>
        prev.map((a) => {
          if (a.id === id) {
            const exec = data.execution;
            return {
              ...a,
              status: exec?.status === "completed" ? "completed" : "approved",
              completed_at: exec?.status === "completed" ? new Date().toISOString() : null,
              result: exec?.result || null,
            };
          }
          return a;
        })
      );
    } catch (e: any) {
      setActions((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "failed", error: e.message } : a))
      );
    }
  }

  async function dismissAction(id: string) {
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "dismissed" } : a))
    );
    await fetch("/api/actions/dismiss", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }

  const active = actions.filter((a) => a.status !== "dismissed");

  return (
    <div className="rounded-[2.5rem] border border-stone-200 bg-[#fffdf8] shadow-sm shadow-stone-200/40">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4" style={{ color: "#F9D96A" }} />
          <p
            className="text-xs uppercase tracking-[0.22em] text-stone-500"
            style={{ fontFamily: "var(--font-geist-mono)" }}
          >
            SWARM INTELLIGENCE
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={runSwarm}
          disabled={running}
          className="inline-flex items-center gap-2 rounded-full bg-[#111111] px-4 py-2 text-sm font-medium text-[#FAFAF7] shadow-sm transition disabled:opacity-50"
        >
          {running ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing…
            </>
          ) : (
            <>
              Run swarm <ChevronRight className="h-3.5 w-3.5" />
            </>
          )}
        </motion.button>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-6 mb-3 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="px-4 pb-5">
        {active.length === 0 && !running && (
          <div className="rounded-[2rem] border border-dashed border-stone-200 bg-[#FAFAF7] p-8 text-center">
            <Zap className="mx-auto h-6 w-6 text-stone-300" />
            <p className="mt-3 text-sm text-stone-500">
              No agent proposals yet — run the swarm.
            </p>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {active.map((action) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mb-2 rounded-[2rem] border border-stone-200 bg-[#FAFAF7] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#111111]">
                      {action.title}
                    </span>
                    <StatusBadge status={action.status} />
                  </div>
                  <p className="mt-1 text-xs leading-5 text-stone-500">
                    {action.summary}
                  </p>

                  {/* Timeline for non-proposed actions */}
                  {action.status !== "proposed" && <Timeline action={action} />}

                  {/* Result display */}
                  {action.result && (
                    <div className="mt-2 rounded-xl bg-[rgba(21,128,61,0.06)] px-3 py-2 text-xs text-green-800">
                      <span className="font-medium">Result:</span>{" "}
                      {typeof action.result === "object"
                        ? Object.entries(action.result)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(" · ")
                        : String(action.result)}
                    </div>
                  )}

                  {/* Error display */}
                  {action.error && (
                    <div className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">
                      {action.error}
                    </div>
                  )}
                </div>

                {/* Action buttons — only for proposed */}
                {action.status === "proposed" && (
                  <div className="flex shrink-0 gap-1.5">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => approveAction(action.id)}
                      className="rounded-full bg-[#111111] p-2 text-[#FAFAF7] transition hover:bg-stone-800"
                      title="Approve"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => dismissAction(action.id)}
                      className="rounded-full border border-stone-200 bg-white p-2 text-stone-500 transition hover:border-stone-400"
                      title="Dismiss"
                    >
                      <X className="h-3.5 w-3.5" />
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
