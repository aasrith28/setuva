import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db/prisma";
import { verifySessionToken } from "@/lib/auth/session";
import { ShieldCheck, FileCheck, History, ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("setuva_session")?.value || cookieStore.get("applyright_session")?.value;

  if (!token) {
    redirect("/sign-in");
  }

  const session = await verifySessionToken(token);
  if (!session || (session.role !== "admin" && session.role !== "content_reviewer" && session.role !== "publisher")) {
    redirect("/dashboard");
  }

  const [services, auditLogs, userCount] = await Promise.all([
    prisma.service.findMany({
      include: {
        _count: {
          select: { rules: true, documents: true, sources: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.auditLog.findMany({
      include: {
        user: { select: { email: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.user.count(),
  ]);

  const verifiedCount = services.filter((s) => s.status === "verified" || s.status === "published").length;
  const draftCount = services.filter((s) => s.status === "draft" || s.status === "pending_review").length;

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="mb-10 pb-6 border-b border-[#2e261f]">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#f3a878] mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>SETUVA Governance & Scheme Verification</span>
        </div>
        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#f4e8d7]">
          Administrative Management
        </h1>
        <p className="text-xs text-[#9d8a72] mt-1">
          Logged in as <strong className="text-[#f4e8d7]">{session.name}</strong> ({session.role}).
          All material publications are audited.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <div className="bg-[#1c1713] border border-[#2e261f] p-5 rounded-xl">
          <div className="text-xs text-[#9d8a72] mb-1 uppercase tracking-wider">Total Schemes</div>
          <div className="font-serif font-bold text-2xl text-[#f4e8d7]">{services.length}</div>
        </div>
        <div className="bg-[#1c1713] border border-[#2e261f] p-5 rounded-xl">
          <div className="text-xs text-[#9d8a72] mb-1 uppercase tracking-wider">Published / Verified</div>
          <div className="font-serif font-bold text-2xl text-emerald-400">{verifiedCount}</div>
        </div>
        <div className="bg-[#1c1713] border border-[#2e261f] p-5 rounded-xl">
          <div className="text-xs text-[#9d8a72] mb-1 uppercase tracking-wider">Drafts / In Review</div>
          <div className="font-serif font-bold text-2xl text-amber-400">{draftCount}</div>
        </div>
        <div className="bg-[#1c1713] border border-[#2e261f] p-5 rounded-xl">
          <div className="text-xs text-[#9d8a72] mb-1 uppercase tracking-wider">Registered Accounts</div>
          <div className="font-serif font-bold text-2xl text-[#e7c6a0]">{userCount}</div>
        </div>
      </div>

      {/* Service Review Table */}
      <div className="bg-[#1c1713] border border-[#2e261f] rounded-xl p-6 mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif font-bold text-xl text-[#f4e8d7] flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-[#e7c6a0]" />
            <span>Scheme Catalog & Publication Status</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#9d8a72]">
            <thead className="bg-[#181410] border-b border-[#2e261f] uppercase tracking-wider text-[10px] text-[#f4e8d7]">
              <tr>
                <th className="p-3">Scheme Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Rules</th>
                <th className="p-3">Documents</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2e261f]">
              {services.map((svc) => (
                <tr key={svc.id} className="hover:bg-[#181410]/50">
                  <td className="p-3 font-medium text-[#f4e8d7]">{svc.name}</td>
                  <td className="p-3">{svc.category}</td>
                  <td className="p-3">{svc._count.rules}</td>
                  <td className="p-3">{svc._count.documents}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                        svc.status === "verified" || svc.status === "published"
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          : "bg-amber-950 text-amber-300 border border-amber-800"
                      }`}
                    >
                      {svc.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <Link
                      href={`/services/${svc.slug}`}
                      className="text-[#e7c6a0] hover:underline font-semibold"
                    >
                      Preview Guidelines →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log Trail */}
      <div className="bg-[#1c1713] border border-[#2e261f] rounded-xl p-6">
        <h2 className="font-serif font-bold text-xl text-[#f4e8d7] flex items-center gap-2 mb-6">
          <History className="w-5 h-5 text-[#f3a878]" />
          <span>Security & Publication Audit Trail</span>
        </h2>

        {auditLogs.length === 0 ? (
          <p className="text-xs text-[#9d8a72]">No audit logs recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-lg bg-[#181410] border border-[#2e261f] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <span className="font-mono text-[#f3a878] font-semibold mr-2">
                    {log.action}
                  </span>
                  <span className="text-[#f4e8d7] font-medium">{log.entityType}</span>
                  <span className="text-[#9d8a72] ml-2">by {log.user.name} ({log.actorRole})</span>
                </div>
                <div className="text-[10px] text-[#9d8a72]">
                  {log.createdAt.toLocaleDateString()} {log.createdAt.toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
