import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db/prisma";
import { verifySessionToken } from "@/lib/auth/session";
import Checklist from "@/components/checklist";
import SourceCitation from "@/components/source-citation";
import { ArrowLeft, ExternalLink, Calendar, Plus, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

interface ApplicationDetailPageProps {
  params: {
    id: string;
  };
}

export default async function ApplicationDetailPage({ params }: ApplicationDetailPageProps) {
  const cookieStore = cookies();
  const token = cookieStore.get("applyright_session")?.value;

  if (!token) {
    redirect("/sign-in");
  }

  const session = await verifySessionToken(token);
  if (!session) {
    redirect("/sign-in");
  }

  const { id } = params;

  const tracker = await prisma.applicationTracker.findUnique({
    where: { id },
    include: {
      service: {
        include: {
          sources: {
            where: { verificationStatus: "verified" },
          },
        },
      },
      checklist: {
        orderBy: { createdAt: "asc" },
      },
      reminders: {
        where: { isCancelled: false },
        orderBy: { remindAt: "asc" },
      },
    },
  });

  if (!tracker) {
    notFound();
  }

  // Server-side ownership check (SECURITY.md Section 5 - Prevent IDOR)
  if (tracker.userId !== session.userId && session.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#9d8a72] hover:text-[#e7c6a0] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Tracker Header */}
      <div className="bg-[#1c1713] border border-[#2e261f] rounded-2xl p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#2e261f] text-[#e7c6a0] mr-2">
              {tracker.service.category}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#181410] border border-[#2e261f] text-emerald-400">
              Tracker: {tracker.status.replace("_", " ")}
            </span>
          </div>

          <a
            href={tracker.service.officialApplicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#e7c6a0] text-[#181410] font-semibold text-xs uppercase tracking-wider hover:bg-[#f4e8d7] transition-colors self-start sm:self-auto"
          >
            <span>Open Official Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#f4e8d7] mb-2">
          {tracker.service.name}
        </h1>
        <p className="text-sm text-[#9d8a72] leading-relaxed max-w-3xl">
          {tracker.service.description}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main: Interactive Checklist */}
        <div className="lg:col-span-2 space-y-8">
          <Checklist trackerId={tracker.id} items={tracker.checklist} />

          {/* Official Sources Citation for Scheme */}
          <div className="bg-[#1c1713] border border-[#2e261f] rounded-xl p-6">
            <h3 className="font-serif font-bold text-base text-[#f4e8d7] mb-4">
              Official Guidelines & Source Grounding
            </h3>
            <div className="space-y-4">
              {tracker.service.sources.map((src) => (
                <SourceCitation
                  key={src.id}
                  authority={src.issuingAuthority}
                  url={src.url}
                  verificationStatus={src.verificationStatus}
                  lastCheckedDate={src.lastCheckedDate.toISOString().split("T")[0]}
                  excerpt={src.excerpt}
                  sourceType={src.sourceType}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Reminders & Portal Advice */}
        <div className="space-y-6">
          <div className="bg-[#1c1713] border border-[#2e261f] rounded-xl p-6">
            <h3 className="font-serif font-bold text-base text-[#f4e8d7] flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-[#e7c6a0]" />
              <span>Reminders for this Scheme</span>
            </h3>

            {tracker.reminders.length === 0 ? (
              <p className="text-xs text-[#9d8a72] mb-4">No reminders set for this tracker yet.</p>
            ) : (
              <div className="space-y-2 mb-4">
                {tracker.reminders.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-lg bg-[#181410] border border-[#2e261f] text-xs"
                  >
                    <div className="text-[#f4e8d7] font-medium mb-1">{r.message}</div>
                    <div className="text-[10px] text-[#e7c6a0]">
                      {r.remindAt.toLocaleDateString()} at {r.remindAt.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#181410] border border-[#2e261f] p-5 rounded-xl text-xs text-[#9d8a72] leading-relaxed">
            <h4 className="font-serif font-bold text-sm text-[#e7c6a0] mb-2">
              Important Submission Reminder
            </h4>
            ApplyRight assists with gathering requirements and checking documents. Once your checklist
            reaches 100%, visit the official government portal directly to submit and preserve your application
            acknowledgement receipt.
          </div>
        </div>
      </div>
    </div>
  );
}
