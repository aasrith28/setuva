import Link from "next/link";
import prisma from "@/lib/db/prisma";
import ObraCTA from "@/components/obra-cta";
import ServiceCard from "@/components/service-card";
import { ShieldCheck, BookOpen, CheckSquare, Sparkles, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const schemes = await prisma.service.findMany({
    where: { status: "verified" },
    include: {
      _count: {
        select: {
          rules: true,
          documents: true,
        },
      },
    },
    take: 3,
  });

  return (
    <div className="flex flex-col">
      {/* Hero Section with custom Obra CTA */}
      <section className="relative overflow-hidden py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-[#2e261f] bg-gradient-to-b from-[#181410] via-[#1c1713] to-[#181410]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2e261f] border border-[#e7c6a0]/30 text-[#e7c6a0] text-xs font-semibold uppercase tracking-wider mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Assisted Government Application Companion</span>
          </div>

          <h1 className="font-serif font-bold text-4xl sm:text-6xl text-[#f4e8d7] tracking-tight leading-[1.15] mb-6">
            Navigate Government Schemes with{" "}
            <span className="text-[#e7c6a0] italic">Uncertainty-Aware Clarity</span>
          </h1>

          <p className="text-base sm:text-lg text-[#9d8a72] max-w-2xl mx-auto mb-10 leading-relaxed font-sans">
            SETUVA turns published government welfare criteria and gazettes into transparent,
            source-cited preparation checklists. Verified rules, grounded AI explanations, and zero identity data bloat.
          </p>

          <div className="flex justify-center mb-12">
            <Link href="/services">
              <ObraCTA
                label="Explore Government Schemes"
                hint="your next step starts here"
              />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-8 border-t border-[#2e261f] text-xs text-[#9d8a72]">
            <div>
              <div className="font-serif font-bold text-lg text-[#f4e8d7]">100%</div>
              <div>Official Source Grounded</div>
            </div>
            <div>
              <div className="font-serif font-bold text-lg text-[#f4e8d7]">Deterministic</div>
              <div>Eligibility Evaluation</div>
            </div>
            <div>
              <div className="font-serif font-bold text-lg text-[#f4e8d7]">Zero Bloat</div>
              <div>No Identity Copies Stored</div>
            </div>
            <div>
              <div className="font-serif font-bold text-lg text-[#f4e8d7]">Karnataka</div>
              <div>Focused Initial Coverage</div>
            </div>
          </div>
        </div>
      </section>

      {/* Curated Verified Schemes Catalogue */}
      <section id="services" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#e7c6a0] mb-2">
              Curated Welfare Catalogue
            </div>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#f4e8d7]">
              Featured Karnataka Schemes
            </h2>
          </div>
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#e7c6a0] hover:text-[#f4e8d7] transition-colors"
          >
            <span>Browse All Schemes</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {schemes.map((scheme) => (
            <ServiceCard
              key={scheme.id}
              id={scheme.id}
              slug={scheme.slug}
              name={scheme.name}
              category={scheme.category}
              jurisdiction={scheme.jurisdiction}
              description={scheme.description}
              officialApplicationUrl={scheme.officialApplicationUrl}
              status={scheme.status}
              currentVersion={scheme.currentVersion}
              ruleCount={scheme._count.rules}
              documentCount={scheme._count.documents}
            />
          ))}
        </div>
      </section>

      {/* How SETUVA Works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-[#2e261f] bg-[#120f0d]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h3 className="font-serif font-bold text-2xl sm:text-3xl text-[#f4e8d7] mb-3">
              How SETUVA Empowers Your Application
            </h3>
            <p className="text-sm text-[#9d8a72]">
              A disciplined, source-backed process designed to prevent missed deadlines and incomplete submissions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="bg-[#181410] border border-[#2e261f] p-6 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-[#2e261f] text-[#e7c6a0] flex items-center justify-center font-bold font-serif mb-4">
                1
              </div>
              <h4 className="font-serif font-bold text-lg text-[#f4e8d7] mb-2">
                Discover Verified Rules
              </h4>
              <p className="text-xs text-[#9d8a72] leading-relaxed">
                Browse official schemes where every rule is cross-referenced with authorized state portals,
                gazette notifications, and official guidelines.
              </p>
            </div>

            <div className="bg-[#181410] border border-[#2e261f] p-6 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-[#2e261f] text-[#e7c6a0] flex items-center justify-center font-bold font-serif mb-4">
                2
              </div>
              <h4 className="font-serif font-bold text-lg text-[#f4e8d7] mb-2">
                Explainable Assessment
              </h4>
              <p className="text-xs text-[#9d8a72] leading-relaxed">
                Answer structured criteria to see whether you appear potentially eligible, missing data, or if
                official re-verification is required. We never promise guaranteed approvals.
              </p>
            </div>

            <div className="bg-[#181410] border border-[#2e261f] p-6 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-[#2e261f] text-[#e7c6a0] flex items-center justify-center font-bold font-serif mb-4">
                3
              </div>
              <h4 className="font-serif font-bold text-lg text-[#f4e8d7] mb-2">
                Checklist & Official Portal
              </h4>
              <p className="text-xs text-[#9d8a72] leading-relaxed">
                Gather required documents using customized task lists and set reminders before lodging your
                application securely on the official government website.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
