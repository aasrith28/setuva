import prisma from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import EligibilityWizard from "@/components/eligibility-wizard";
import SourceCitation from "@/components/source-citation";
import { ShieldCheck, ExternalLink, FileText, ArrowLeft, Bookmark, CheckSquare } from "lucide-react";

export const dynamic = "force-dynamic";

interface ServiceDetailPageProps {
  params: {
    slug: string;
  };
}

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const { slug } = params;

  const service = await prisma.service.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
    },
    include: {
      rules: {
        orderBy: { createdAt: "asc" },
      },
      documents: {
        orderBy: { isMandatory: "desc" },
      },
      sources: {
        where: { verificationStatus: { in: ["verified", "pending_review"] } },
        orderBy: { lastCheckedDate: "desc" },
      },
    },
  });

  if (!service) {
    notFound();
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="mb-6">
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#9d8a72] hover:text-[#e7c6a0] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Catalogue</span>
        </Link>
      </div>

      {/* Scheme Header */}
      <div className="bg-[#1c1713] border border-[#2e261f] rounded-2xl p-6 sm:p-10 mb-10">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-[#2e261f] text-[#e7c6a0]">
            {service.category}
          </span>
          <span className="text-xs font-medium text-[#9d8a72] px-3 py-1 rounded-full bg-[#181410] border border-[#2e261f]">
            📍 {service.jurisdiction}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="capitalize">{service.status} Version {service.currentVersion}</span>
          </span>
        </div>

        <h1 className="font-serif font-bold text-3xl sm:text-5xl text-[#f4e8d7] mb-4 tracking-tight">
          {service.name}
        </h1>

        <p className="text-base text-[#9d8a72] max-w-4xl leading-relaxed mb-8">
          {service.description}
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-[#2e261f]">
          <a
            href={service.officialApplicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#e7c6a0] hover:bg-[#f4e8d7] text-[#181410] font-semibold text-xs uppercase tracking-wider transition-colors"
          >
            <span>Open Official Portal</span>
            <ExternalLink className="w-4 h-4" />
          </a>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2e261f] hover:bg-[#2e261f]/80 text-[#f4e8d7] font-semibold text-xs uppercase tracking-wider transition-colors border border-[#e7c6a0]/30"
          >
            <CheckSquare className="w-4 h-4 text-[#e7c6a0]" />
            <span>Track in Dashboard</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Left Column: Eligibility Wizard */}
        <div className="lg:col-span-2 space-y-8">
          <EligibilityWizard
            serviceId={service.id}
            serviceName={service.name}
            rules={service.rules}
          />

          {/* Required Documents Section */}
          <div className="bg-[#1c1713] border border-[#2e261f] rounded-xl p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-2 text-[#e7c6a0] text-xs font-semibold uppercase tracking-wider">
              <FileText className="w-4 h-4" />
              <span>Mandatory Preparation Material</span>
            </div>
            <h3 className="font-serif font-bold text-xl text-[#f4e8d7] mb-6">
              Required Documents & Evidences
            </h3>

            <div className="space-y-4">
              {service.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-lg bg-[#181410] border border-[#2e261f]"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <h4 className="text-sm font-semibold text-[#f4e8d7]">{doc.name}</h4>
                    {doc.isMandatory ? (
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-900">
                        Mandatory
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#2e261f] text-[#9d8a72]">
                        Optional
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#9d8a72] leading-relaxed">{doc.guidance}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Verified Sources & Citations */}
        <div className="space-y-6">
          <div className="bg-[#1c1713] border border-[#2e261f] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2 text-[#e7c6a0] text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Source Provenance</span>
            </div>
            <h3 className="font-serif font-bold text-lg text-[#f4e8d7] mb-2">
              Verified Official Citations
            </h3>
            <p className="text-xs text-[#9d8a72] mb-4 leading-relaxed">
              Every requirement listed above is extracted directly from the verified government documents
              and portals below:
            </p>

            <div className="space-y-4">
              {service.sources.map((src) => (
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

          <div className="bg-[#181410] border border-[#2e261f] p-4 rounded-xl text-xs text-[#9d8a72] leading-relaxed">
            <span className="font-semibold text-[#f4e8d7]">Notice:</span> If you identify an outdated rule
            or conflicting guideline, our administrative reviewers verify amendments against current state
            gazette notifications.
          </div>
        </div>
      </div>
    </div>
  );
}
