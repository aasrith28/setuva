"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, HelpCircle, ShieldAlert, Sparkles, Loader2 } from "lucide-react";

interface Rule {
  id: string;
  field: string;
  operator: string;
  expectedValue: string;
  explanation: string;
  isMandatory: boolean;
}

interface EligibilityWizardProps {
  serviceId: string;
  serviceName: string;
  rules: Rule[];
  onStartTracking?: () => void;
}

export default function EligibilityWizard({
  serviceId,
  serviceName,
  rules,
  onStartTracking,
}: EligibilityWizardProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({
    state: "Karnataka",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  };

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/eligibility/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId, answers }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Assessment failed");
      }
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to evaluate eligibility");
    } finally {
      setLoading(false);
    }
  };

  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case "potentially_eligible":
        return {
          title: "Potentially Eligible",
          bg: "bg-emerald-950 border-emerald-700 text-emerald-300",
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
        };
      case "not_eligible":
        return {
          title: "Not Eligible Based on Current Rules",
          bg: "bg-red-950 border-red-700 text-red-300",
          icon: <XCircle className="w-5 h-5 text-red-400" />,
        };
      case "insufficient_information":
        return {
          title: "Additional Information Required",
          bg: "bg-amber-950 border-amber-700 text-amber-300",
          icon: <HelpCircle className="w-5 h-5 text-amber-400" />,
        };
      case "needs_official_verification":
      default:
        return {
          title: "Official Verification Required",
          bg: "bg-[#2e261f] border-[#9d8a72] text-[#f4e8d7]",
          icon: <ShieldAlert className="w-5 h-5 text-[#e7c6a0]" />,
        };
    }
  };

  return (
    <div className="bg-[#1c1713] border border-[#2e261f] rounded-xl p-6 sm:p-8">
      <div className="flex items-center gap-2 mb-2 text-[#e7c6a0] text-xs font-semibold uppercase tracking-wider">
        <Sparkles className="w-4 h-4" />
        <span>Transparent Eligibility Assessment</span>
      </div>
      <h3 className="font-serif font-bold text-xl text-[#f4e8d7] mb-4">
        Check Your Eligibility for {serviceName}
      </h3>
      <p className="text-sm text-[#9d8a72] mb-6 leading-relaxed">
        Answer the verified criteria below. Our engine deterministically evaluates published government
        rules without inventing conditions or storing sensitive identity copies.
      </p>

      {error && (
        <div className="p-3 mb-6 rounded-lg bg-red-950/80 border border-red-800 text-red-300 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleEvaluate} className="space-y-4">
        {rules.map((rule) => {
          const isBoolean = rule.operator === "boolean";
          const isNumeric = rule.operator === "lte" || rule.operator === "gte";

          return (
            <div key={rule.id} className="bg-[#181410] border border-[#2e261f] p-4 rounded-lg">
              <label className="block text-sm font-medium text-[#f4e8d7] mb-1">
                {rule.explanation}
              </label>
              <div className="text-[11px] text-[#9d8a72] mb-2">
                Published rule: <span className="font-mono text-[#e7c6a0]">{rule.field}</span> (
                {rule.operator} {rule.expectedValue})
              </div>

              {isBoolean ? (
                <div className="flex items-center gap-4 text-xs text-[#f4e8d7]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={rule.field}
                      value="true"
                      checked={answers[rule.field] === true || answers[rule.field] === "true"}
                      onChange={() => handleInputChange(rule.field, true)}
                      className="accent-[#e7c6a0]"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={rule.field}
                      value="false"
                      checked={answers[rule.field] === false || answers[rule.field] === "false"}
                      onChange={() => handleInputChange(rule.field, false)}
                      className="accent-[#e7c6a0]"
                    />
                    <span>No</span>
                  </label>
                </div>
              ) : isNumeric ? (
                <input
                  type="number"
                  placeholder={`Enter value (e.g. ₹${rule.expectedValue})`}
                  value={answers[rule.field] ?? ""}
                  onChange={(e) => handleInputChange(rule.field, e.target.value)}
                  className="w-full sm:w-72 bg-[#120f0d] border border-[#2e261f] focus:border-[#e7c6a0] rounded-md px-3 py-1.5 text-sm text-[#f4e8d7] placeholder-[#9d8a72]/50 outline-none"
                />
              ) : (
                <input
                  type="text"
                  placeholder={`Enter answer (e.g. ${rule.expectedValue})`}
                  value={answers[rule.field] ?? ""}
                  onChange={(e) => handleInputChange(rule.field, e.target.value)}
                  className="w-full sm:w-72 bg-[#120f0d] border border-[#2e261f] focus:border-[#e7c6a0] rounded-md px-3 py-1.5 text-sm text-[#f4e8d7] placeholder-[#9d8a72]/50 outline-none"
                />
              )}
            </div>
          );
        })}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#e7c6a0] hover:bg-[#f4e8d7] text-[#181410] font-semibold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Evaluating Criteria...
            </>
          ) : (
            "Evaluate Eligibility"
          )}
        </button>
      </form>

      {result && (
        <div className="mt-8 pt-6 border-t border-[#2e261f]">
          {(() => {
            const badge = getOutcomeBadge(result.outcome);
            return (
              <div className={`p-4 rounded-xl border ${badge.bg} mb-6`}>
                <div className="flex items-center gap-3 mb-2">
                  {badge.icon}
                  <h4 className="font-serif font-bold text-lg">{badge.title}</h4>
                </div>
                <p className="text-sm opacity-90 leading-relaxed mb-3">{result.summary}</p>
                <div className="text-[11px] opacity-75 italic border-t border-current/20 pt-2">
                  {result.notice}
                </div>
              </div>
            );
          })()}

          <h5 className="font-semibold text-xs uppercase tracking-wider text-[#9d8a72] mb-3">
            Criteria Breakdown ({result.criteria?.length || 0} evaluated)
          </h5>

          <div className="space-y-2 mb-6">
            {result.criteria?.map((item: any) => (
              <div
                key={item.ruleId}
                className="flex items-start justify-between gap-3 p-3 rounded-lg bg-[#181410] border border-[#2e261f] text-xs"
              >
                <div>
                  <div className="text-[#f4e8d7] font-medium mb-1">{item.criterion}</div>
                  <div className="text-[#9d8a72]">{item.explanation}</div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider shrink-0 ${
                    item.result === "pass"
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                      : item.result === "fail"
                      ? "bg-red-950 text-red-300 border border-red-800"
                      : "bg-amber-950 text-amber-300 border border-amber-800"
                  }`}
                >
                  {item.result}
                </span>
              </div>
            ))}
          </div>

          {onStartTracking && (
            <button
              onClick={onStartTracking}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#2e261f] hover:bg-[#e7c6a0] text-[#f4e8d7] hover:text-[#181410] text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              Start Application Checklist Tracker →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
