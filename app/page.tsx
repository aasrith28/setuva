import Link from "next/link";
import prisma from "@/lib/db/prisma";
import ServiceCard from "@/components/service-card";
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileSearch,
  ClipboardCheck,
  Brain,
  ExternalLink,
  Lock,
  Scale,
  Zap,
} from "lucide-react";

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
      {/* ═══════════════════════════════════════════
          HERO — Aceternity Spotlight + Magic UI shimmer
          ═══════════════════════════════════════════ */}
      <section className="hero-spotlight relative min-h-[90vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Dot grid background */}
        <div className="absolute inset-0 dot-grid-bg opacity-50" />

        {/* Radial glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-[#e7c6a0]/[0.03] blur-[120px] animate-[float-slow_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-[#f3a878]/[0.03] blur-[100px] animate-[float-slow_10s_ease-in-out_infinite_2s]" />

        {/* Meteor lines */}
        <div className="meteor-effect absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="meteor absolute"
              style={{
                left: `${15 + i * 14}%`,
                ["--duration" as any]: `${4 + i * 1.5}s`,
                ["--delay" as any]: `${i * 0.8}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Animated badge */}
          <div className="animate-fade-up opacity-0 inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-gold badge-glow text-[#e7c6a0] text-xs font-semibold uppercase tracking-widest mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Government Scheme Companion</span>
          </div>

          {/* Main headline with shimmer */}
          <h1 className="animate-fade-up opacity-0 delay-100 font-serif font-bold text-5xl sm:text-7xl lg:text-8xl tracking-tight leading-[1.05] mb-8">
            <span className="block text-[#f4e8d7]">Navigate Schemes</span>
            <span className="block text-shimmer mt-2">with Clarity</span>
          </h1>

          {/* Sub-headline */}
          <p className="animate-fade-up opacity-0 delay-200 text-base sm:text-xl text-[#71717a] max-w-2xl mx-auto mb-12 leading-relaxed">
            SETUVA transforms official government gazettes and welfare portal requirements
            into transparent, source-cited preparation checklists—with deterministic eligibility
            checks and zero identity data collection.
          </p>

          {/* CTA buttons */}
          <div className="animate-fade-up opacity-0 delay-300 flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/services" className="btn-primary">
              <span>Explore Schemes</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/about" className="btn-secondary">
              <span>How It Works</span>
              <ShieldCheck className="w-4 h-4" />
            </Link>
          </div>

          {/* Stats bar */}
          <div className="animate-fade-up opacity-0 delay-400">
            <div className="divider-gradient mb-8" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {[
                { value: "100%", label: "Source Grounded" },
                { value: "Deterministic", label: "Rule Evaluation" },
                { value: "Zero", label: "Identity Copies" },
                { value: "Karnataka", label: "Initial Coverage" },
              ].map((stat, i) => (
                <div key={i} className="stat-card text-center">
                  <div className="font-serif font-bold text-xl text-gradient">{stat.value}</div>
                  <div className="text-[11px] text-[#71717a] uppercase tracking-wider mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0b] to-transparent" />
      </section>

      {/* ═══════════════════════════════════════════
          MARQUEE TRUST BAR — Magic UI infinite scroll
          ═══════════════════════════════════════════ */}
      <section className="py-6 border-y border-[#1f1f23] bg-[#0a0a0b]">
        <div className="marquee-container">
          <div className="marquee-track">
            {[...Array(2)].map((_, setIdx) => (
              <div key={setIdx} className="flex items-center gap-8 shrink-0">
                {[
                  "SSP Karnataka",
                  "ePASS Vidyasiri",
                  "Yuva Nidhi",
                  "Seva Sindhu",
                  "Nadakacheri Portal",
                  "Social Welfare Dept",
                  "Backward Classes Dept",
                  "Skill Development Dept",
                ].map((name) => (
                  <div
                    key={`${setIdx}-${name}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg glass text-xs text-[#71717a] whitespace-nowrap"
                  >
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    <span>{name}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          BENTO GRID — How SETUVA Works (Magic UI style)
          ═══════════════════════════════════════════ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative">
        <div className="absolute inset-0 grid-lines-bg opacity-40 pointer-events-none" />

        <div className="relative text-center max-w-2xl mx-auto mb-16">
          <div className="text-xs font-semibold uppercase tracking-widest text-[#e7c6a0] mb-3">
            The SETUVA Process
          </div>
          <h2 className="font-serif font-bold text-3xl sm:text-5xl text-[#f4e8d7] mb-4">
            Built for <span className="text-gradient">Trust & Transparency</span>
          </h2>
          <p className="text-sm text-[#71717a] leading-relaxed">
            A disciplined, source-backed pipeline that prevents missed deadlines, incomplete
            submissions, and fabricated eligibility claims.
          </p>
        </div>

        <div className="relative bento-grid">
          {/* Card 1 — Wide: Discover */}
          <div className="bento-item-wide glow-card p-8 group">
            <div className="flex items-start gap-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#e7c6a0]/10 to-[#e7c6a0]/5 border border-[#e7c6a0]/10 flex items-center justify-center shrink-0">
                <FileSearch className="w-6 h-6 text-[#e7c6a0]" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#e7c6a0] mb-2">
                  Step 01
                </div>
                <h3 className="font-serif font-bold text-xl text-[#f4e8d7] mb-3">
                  Discover Verified Government Schemes
                </h3>
                <p className="text-sm text-[#71717a] leading-relaxed">
                  Browse a curated catalogue where every rule, deadline, and document requirement
                  is cross-referenced against official Karnataka government portals and gazette
                  notifications. No invented conditions.
                </p>
              </div>
            </div>
            {/* Decorative gradient bar */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#e7c6a0]/20 to-transparent" />
          </div>

          {/* Card 2 — Standard: Assess */}
          <div className="glow-card p-8 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#f3a878]/10 to-[#f3a878]/5 border border-[#f3a878]/10 flex items-center justify-center mb-5">
              <Scale className="w-6 h-6 text-[#f3a878]" />
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#f3a878] mb-2">
              Step 02
            </div>
            <h3 className="font-serif font-bold text-xl text-[#f4e8d7] mb-3">
              Transparent Assessment
            </h3>
            <p className="text-sm text-[#71717a] leading-relaxed">
              Answer structured criteria and receive a deterministic evaluation. Every result
              shows exactly which rules passed, failed, or remain unknown—never a fabricated "guaranteed" outcome.
            </p>
          </div>

          {/* Card 3 — Standard: Track */}
          <div className="glow-card p-8 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/10 flex items-center justify-center mb-5">
              <ClipboardCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-2">
              Step 03
            </div>
            <h3 className="font-serif font-bold text-xl text-[#f4e8d7] mb-3">
              Checklist & Track Progress
            </h3>
            <p className="text-sm text-[#71717a] leading-relaxed">
              Auto-generate a personalized document and task checklist, track your preparation,
              and set reminders before lodging your application on the official portal.
            </p>
          </div>

          {/* Card 4 — Wide: AI Assistant */}
          <div className="bento-item-wide glow-card p-8 group">
            <div className="flex items-start gap-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/10 flex items-center justify-center shrink-0">
                <Brain className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-bold uppercase tracking-widest text-purple-400 mb-2">
                  AI Assistant
                </div>
                <h3 className="font-serif font-bold text-xl text-[#f4e8d7] mb-3">
                  Source-Grounded Explanations
                </h3>
                <p className="text-sm text-[#71717a] leading-relaxed">
                  Ask questions and get answers grounded strictly in verified official records—with
                  linked citations, verification dates, and uncertainty disclosures. The AI cannot
                  invent eligibility rules, deadlines, or fake official links.
                </p>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FEATURED SCHEMES — Glowing cards
          ═══════════════════════════════════════════ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-[#e7c6a0] mb-2">
              Verified Welfare Catalogue
            </div>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#f4e8d7]">
              Featured Karnataka Schemes
            </h2>
          </div>
          <Link
            href="/services"
            className="btn-secondary text-xs"
          >
            <span>Browse All</span>
            <ArrowRight className="w-3.5 h-3.5" />
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

      {/* ═══════════════════════════════════════════
          SECURITY PILLARS — Glass morphism cards
          ═══════════════════════════════════════════ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 dot-grid-bg opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#e7c6a0]/[0.02] blur-[120px]" />

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-3">
              Security Architecture
            </div>
            <h2 className="font-serif font-bold text-3xl sm:text-5xl text-[#f4e8d7] mb-4">
              Privacy by <span className="text-gradient">Design</span>
            </h2>
            <p className="text-sm text-[#71717a]">
              Built with OWASP standards, CERT-In alignment, and strict data minimization.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: <Lock className="w-5 h-5" />,
                color: "text-emerald-400",
                bg: "from-emerald-500/10 to-emerald-500/5",
                border: "border-emerald-500/10",
                title: "Zero Identity Copies",
                desc: "No Aadhaar, bank passwords, OTPs, or document scans ever collected.",
              },
              {
                icon: <ShieldCheck className="w-5 h-5" />,
                color: "text-[#e7c6a0]",
                bg: "from-[#e7c6a0]/10 to-[#e7c6a0]/5",
                border: "border-[#e7c6a0]/10",
                title: "SSRF & Injection Defense",
                desc: "Blocks private IPs, cloud metadata, and validates all official URLs.",
              },
              {
                icon: <Brain className="w-5 h-5" />,
                color: "text-purple-400",
                bg: "from-purple-500/10 to-purple-500/5",
                border: "border-purple-500/10",
                title: "Prompt Injection Guard",
                desc: "AI cannot override rules, reveal secrets, or fabricate official criteria.",
              },
              {
                icon: <Zap className="w-5 h-5" />,
                color: "text-[#f3a878]",
                bg: "from-[#f3a878]/10 to-[#f3a878]/5",
                border: "border-[#f3a878]/10",
                title: "Rate-Limited APIs",
                desc: "Throttled auth, eligibility, and AI endpoints prevent abuse and cost attacks.",
              },
            ].map((item, i) => (
              <div key={i} className="glow-card p-6 text-center group">
                <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${item.bg} border ${item.border} flex items-center justify-center mb-4 ${item.color}`}>
                  {item.icon}
                </div>
                <h4 className="font-semibold text-sm text-[#f4e8d7] mb-2">{item.title}</h4>
                <p className="text-xs text-[#71717a] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FINAL CTA — Gradient spotlight
          ═══════════════════════════════════════════ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0b] via-[#111113] to-[#0a0a0b]" />
        <div className="absolute top-0 left-0 right-0 divider-gradient" />

        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="font-serif font-bold text-3xl sm:text-5xl text-[#f4e8d7] mb-6">
            Ready to Begin Your <span className="text-shimmer">Application Journey</span>?
          </h2>
          <p className="text-base text-[#71717a] mb-10 leading-relaxed">
            Explore verified government schemes, check your eligibility transparently,
            and prepare your documents with confidence.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/services" className="btn-primary">
              <span>Browse Scheme Catalogue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/register" className="btn-secondary">
              <span>Create Free Account</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
