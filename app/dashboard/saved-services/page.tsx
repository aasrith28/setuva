import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db/prisma";
import { verifySessionToken } from "@/lib/auth/session";
import { Bookmark, ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SavedServicesPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("setuva_session")?.value || cookieStore.get("applyright_session")?.value;

  if (!token) {
    redirect("/sign-in");
  }

  const session = await verifySessionToken(token);
  if (!session) {
    redirect("/sign-in");
  }

  const saved = await prisma.savedService.findMany({
    where: { userId: session.userId },
    include: {
      service: {
        include: {
          _count: { select: { rules: true, documents: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

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

      <div className="mb-10 pb-6 border-b border-[#2e261f]">
        <h1 className="font-serif font-bold text-3xl text-[#f4e8d7] flex items-center gap-2">
          <Bookmark className="w-6 h-6 text-[#e7c6a0]" />
          <span>Saved Government Schemes</span>
        </h1>
        <p className="text-xs text-[#9d8a72] mt-1">
          Quickly access and check criteria for your bookmarked welfare programs.
        </p>
      </div>

      {saved.length === 0 ? (
        <div className="bg-[#1c1713] border border-[#2e261f] rounded-xl p-10 text-center max-w-md mx-auto">
          <p className="text-sm text-[#9d8a72] mb-4">You have not saved any schemes yet.</p>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#e7c6a0] text-[#181410] text-xs font-semibold uppercase tracking-wider hover:bg-[#f4e8d7] transition-colors"
          >
            <span>Explore Scheme Catalogue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {saved.map((item) => (
            <div
              key={item.id}
              className="bg-[#1c1713] border border-[#2e261f] rounded-xl p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#2e261f] text-[#e7c6a0]">
                    {item.service.category}
                  </span>
                  <span className="text-xs text-[#9d8a72]">
                    Saved {item.createdAt.toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-lg text-[#f4e8d7] mb-2">
                  {item.service.name}
                </h3>
                <p className="text-xs text-[#9d8a72] line-clamp-2 mb-4 leading-relaxed">
                  {item.service.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#2e261f]">
                <Link
                  href={`/services/${item.service.slug}`}
                  className="text-xs font-semibold uppercase tracking-wider text-[#e7c6a0] hover:text-[#f4e8d7] inline-flex items-center gap-1"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <a
                  href={item.service.officialApplicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded text-[#9d8a72] hover:text-[#e7c6a0]"
                  title="Official Portal"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
