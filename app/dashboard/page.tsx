import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db/prisma";
import { verifySessionToken } from "@/lib/auth/session";
import { CheckSquare, Bookmark, Bell, ArrowRight, ExternalLink, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("applyright_session")?.value;

  if (!token) {
    redirect("/sign-in");
  }

  const session = await verifySessionToken(token);
  if (!session) {
    redirect("/sign-in");
  }

  const [trackers, savedServices, reminders] = await Promise.all([
    prisma.applicationTracker.findMany({
      where: { userId: session.userId },
      include: {
        service: true,
        checklist: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.savedService.findMany({
      where: { userId: session.userId },
      include: { service: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.reminder.findMany({
      where: { userId: session.userId, isCancelled: false },
      include: {
        tracker: {
          include: { service: true },
        },
      },
      orderBy: { remindAt: "asc" },
    }),
  ]);

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="mb-10 pb-6 border-b border-[#2e261f]">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#e7c6a0] mb-1">
          Personal Companion Dashboard
        </div>
        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#f4e8d7]">
          Welcome, {session.name}
        </h1>
        <p className="text-xs text-[#9d8a72] mt-1">
          Track preparation checklists, deadlines, and requirements without sharing sensitive identity records.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main 2 Cols: Active Application Trackers */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-xl text-[#f4e8d7] flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-[#e7c6a0]" />
              <span>Active Application Trackers</span>
            </h2>
            <Link
              href="/services"
              className="inline-flex items-center gap-1 text-xs text-[#e7c6a0] hover:underline font-semibold uppercase tracking-wider"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Track New Scheme</span>
            </Link>
          </div>

          {trackers.length === 0 ? (
            <div className="bg-[#1c1713] border border-[#2e261f] rounded-xl p-8 text-center">
              <p className="text-sm text-[#9d8a72] mb-4">
                You haven&apos;t started any application trackers yet.
              </p>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#e7c6a0] text-[#181410] text-xs font-semibold uppercase tracking-wider hover:bg-[#f4e8d7] transition-colors"
              >
                <span>Browse Scheme Catalogue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {trackers.map((t) => {
                const completed = t.checklist.filter((i) => i.isCompleted).length;
                const total = t.checklist.length;
                const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

                return (
                  <div
                    key={t.id}
                    className="bg-[#1c1713] border border-[#2e261f] hover:border-[#e7c6a0]/40 rounded-xl p-6 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#2e261f] text-[#e7c6a0] mr-2">
                          {t.service.category}
                        </span>
                        <h3 className="font-serif font-bold text-lg text-[#f4e8d7] inline-block">
                          {t.service.name}
                        </h3>
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#181410] border border-[#2e261f] text-[#e7c6a0] self-start sm:self-auto">
                        Status: {t.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-[#9d8a72] mb-1.5">
                        <span>Checklist Preparation Progress</span>
                        <span>{completed}/{total} ({percent}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#181410] overflow-hidden border border-[#2e261f]">
                        <div
                          className="h-full bg-[#e7c6a0] transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {t.notes && (
                      <div className="text-xs text-[#9d8a72] bg-[#181410] p-2.5 rounded-lg border border-[#2e261f] mb-4">
                        <span className="text-[#e7c6a0] font-medium">Notes:</span> {t.notes}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <Link
                        href={`/dashboard/applications/${t.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#e7c6a0] hover:text-[#f4e8d7]"
                      >
                        <span>Open Preparation Checklist</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      <a
                        href={t.service.officialApplicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-[#9d8a72] hover:text-[#e7c6a0]"
                      >
                        <span>Official Portal</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar: Reminders & Saved Services */}
        <div className="space-y-8">
          {/* Reminders Widget */}
          <div className="bg-[#1c1713] border border-[#2e261f] rounded-xl p-6">
            <h3 className="font-serif font-bold text-lg text-[#f4e8d7] flex items-center gap-2 mb-4">
              <Bell className="w-4 h-4 text-[#e7c6a0]" />
              <span>Upcoming Reminders</span>
            </h3>

            {reminders.length === 0 ? (
              <p className="text-xs text-[#9d8a72]">No active reminders scheduled.</p>
            ) : (
              <div className="space-y-3">
                {reminders.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-lg bg-[#181410] border border-[#2e261f] text-xs"
                  >
                    <div className="text-[#f4e8d7] font-medium mb-1">{r.message}</div>
                    <div className="text-[10px] text-[#e7c6a0]">
                      Due: {r.remindAt.toLocaleDateString()} {r.remindAt.toLocaleTimeString()} (
                      {r.timezone})
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Saved Services Widget */}
          <div className="bg-[#1c1713] border border-[#2e261f] rounded-xl p-6">
            <h3 className="font-serif font-bold text-lg text-[#f4e8d7] flex items-center gap-2 mb-4">
              <Bookmark className="w-4 h-4 text-[#e7c6a0]" />
              <span>Saved Schemes</span>
            </h3>

            {savedServices.length === 0 ? (
              <p className="text-xs text-[#9d8a72]">You haven&apos;t saved any schemes yet.</p>
            ) : (
              <div className="space-y-3">
                {savedServices.map((s) => (
                  <div
                    key={s.id}
                    className="p-3 rounded-lg bg-[#181410] border border-[#2e261f] flex items-center justify-between gap-2"
                  >
                    <div>
                      <Link
                        href={`/services/${s.service.slug}`}
                        className="text-xs font-medium text-[#f4e8d7] hover:text-[#e7c6a0] line-clamp-1"
                      >
                        {s.service.name}
                      </Link>
                      <span className="text-[10px] text-[#9d8a72] uppercase tracking-wider">
                        {s.service.category}
                      </span>
                    </div>
                    <Link
                      href={`/services/${s.service.slug}`}
                      className="text-xs text-[#e7c6a0] hover:underline shrink-0"
                    >
                      View →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
