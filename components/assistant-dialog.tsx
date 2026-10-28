"use client";

import { useState } from "react";
import { Sparkles, Send, X, ExternalLink, ShieldCheck, Loader2, HelpCircle } from "lucide-react";

interface AssistantDialogProps {
  serviceId?: string;
  serviceName?: string;
}

export default function AssistantDialog({ serviceId, serviceName }: AssistantDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/assistant/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, serviceId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to get assistance");
      }
      setResponse(data);
    } catch (err: any) {
      setError(err.message || "Failed to reach AI companion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-[#e7c6a0] hover:bg-[#f4e8d7] text-[#181410] font-semibold text-xs uppercase tracking-wider shadow-xl transition-all hover:scale-105"
      >
        <Sparkles className="w-4 h-4 text-[#181410]" />
        <span>Ask Official AI Assistant</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#1c1713] border border-[#2e261f] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between p-4 bg-[#181410] border-b border-[#2e261f]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#e7c6a0] flex items-center justify-center text-[#181410]">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#f4e8d7]">
                    SETUVA Scheme Assistant
                  </h4>
                  <p className="text-[11px] text-[#9d8a72]">
                    {serviceName ? `Context: ${serviceName}` : "Grounded in Official Sources"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-[#9d8a72] hover:text-[#f4e8d7] hover:bg-[#2e261f]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs">
              <div className="p-3 bg-[#181410] rounded-lg border border-[#2e261f] text-[#9d8a72] leading-relaxed">
                👋 Hello! Ask any question about published eligibility requirements, application steps, or
                mandatory documents. All answers are grounded strictly in reviewed official sources.
              </div>

              {response && (
                <div className="space-y-3">
                  <div className="p-4 bg-[#181410] rounded-xl border border-[#2e261f] text-[#f4e8d7] leading-relaxed whitespace-pre-line">
                    {response.answer}
                  </div>

                  {response.citations && response.citations.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <div className="font-semibold uppercase tracking-wider text-[10px] text-[#e7c6a0] flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span>Verified Source Citations</span>
                      </div>
                      {response.citations.map((c: any) => (
                        <div
                          key={c.sourceId}
                          className="p-2.5 rounded-lg bg-[#120f0d] border border-[#2e261f] flex items-center justify-between gap-2"
                        >
                          <div>
                            <div className="text-[#f4e8d7] font-medium">{c.authority}</div>
                            <div className="text-[10px] text-[#9d8a72]">
                              Checked: {c.lastCheckedDate}
                            </div>
                          </div>
                          <a
                            href={c.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-[#e7c6a0] hover:text-[#f4e8d7]"
                            title="Verify at Official Source"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="text-[10px] italic text-[#9d8a72] border-t border-[#2e261f] pt-2">
                    {response.disclaimer}
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-300">
                  {error}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-3 bg-[#181410] border-t border-[#2e261f] flex gap-2">
              <input
                type="text"
                placeholder="Ask about eligibility, documents, or procedures..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="flex-1 bg-[#120f0d] border border-[#2e261f] focus:border-[#e7c6a0] rounded-xl px-3.5 py-2 text-xs text-[#f4e8d7] placeholder-[#9d8a72]/50 outline-none"
              />
              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="p-2.5 rounded-xl bg-[#e7c6a0] hover:bg-[#f4e8d7] text-[#181410] disabled:opacity-50 transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
