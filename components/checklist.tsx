"use client";

import { useState } from "react";
import { CheckSquare, Square, FileText, CheckCircle2 } from "lucide-react";

interface ChecklistItem {
  id: string;
  title: string;
  isRequired: boolean;
  isCompleted: boolean;
  sourceReference?: string | null;
  note?: string | null;
}

interface ChecklistProps {
  trackerId: string;
  items: ChecklistItem[];
  onItemUpdated?: () => void;
}

export default function Checklist({ trackerId, items: initialItems, onItemUpdated }: ChecklistProps) {
  const [items, setItems] = useState<ChecklistItem[]>(initialItems);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const completedCount = items.filter((i) => i.isCompleted).length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const toggleItem = async (itemId: string, currentState: boolean) => {
    setUpdatingId(itemId);
    const newState = !currentState;

    // Optimistic UI update
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, isCompleted: newState } : item))
    );

    try {
      const res = await fetch(`/api/applications/${trackerId}/checklist/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: newState }),
      });

      if (!res.ok) {
        throw new Error("Update failed");
      }
      onItemUpdated?.();
    } catch {
      // Revert on error
      setItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, isCompleted: currentState } : item))
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="bg-[#1c1713] border border-[#2e261f] rounded-xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#2e261f]">
        <div>
          <h4 className="font-serif font-bold text-lg text-[#f4e8d7]">
            Preparation Checklist & Tasks
          </h4>
          <p className="text-xs text-[#9d8a72]">
            {completedCount} of {totalCount} items completed ({progressPercent}%)
          </p>
        </div>

        <div className="w-full sm:w-48">
          <div className="w-full h-2 rounded-full bg-[#181410] overflow-hidden border border-[#2e261f]">
            <div
              className="h-full bg-[#e7c6a0] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleItem(item.id, item.isCompleted)}
            className={`p-3.5 rounded-lg border transition-all cursor-pointer flex items-start gap-3 select-none ${
              item.isCompleted
                ? "bg-[#181410]/50 border-emerald-900/50 text-[#9d8a72]"
                : "bg-[#181410] border-[#2e261f] text-[#f4e8d7] hover:border-[#e7c6a0]/40"
            }`}
          >
            <button
              type="button"
              className="mt-0.5 text-[#e7c6a0] hover:text-[#f4e8d7] transition-colors"
              aria-label={item.isCompleted ? "Mark incomplete" : "Mark complete"}
            >
              {item.isCompleted ? (
                <CheckSquare className="w-5 h-5 text-emerald-400" />
              ) : (
                <Square className="w-5 h-5 text-[#9d8a72]" />
              )}
            </button>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-sm font-medium ${
                    item.isCompleted ? "line-through text-[#9d8a72]" : "text-[#f4e8d7]"
                  }`}
                >
                  {item.title}
                </span>
                {item.isRequired ? (
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-900">
                    Mandatory
                  </span>
                ) : (
                  <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#2e261f] text-[#9d8a72]">
                    Optional
                  </span>
                )}
              </div>

              {item.sourceReference && (
                <p className="text-xs text-[#9d8a72] leading-relaxed">
                  Guidance: {item.sourceReference}
                </p>
              )}

              {item.note && (
                <div className="mt-2 text-xs text-[#e7c6a0] bg-[#2e261f]/50 p-2 rounded border border-[#2e261f]">
                  Note: {item.note}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
