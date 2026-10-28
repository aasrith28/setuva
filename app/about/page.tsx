import { ShieldCheck, BookOpen, Lock, Scale, Sparkles } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2e261f] border border-[#e7c6a0]/30 text-[#e7c6a0] text-xs font-semibold uppercase tracking-wider mb-4">
          <BookOpen className="w-3.5 h-3.5" />
          <span>About SETUVA</span>
        </div>
        <h1 className="font-serif font-bold text-4xl sm:text-5xl text-[#f4e8d7] mb-6 tracking-tight">
          Trustworthy, Grounded Guidance for Public Services
        </h1>
        <p className="text-base text-[#9d8a72] max-w-2xl mx-auto leading-relaxed">
          SETUVA is an AI-powered government application companion built to demystify complex welfare
          requirements for students and residents in Karnataka, India.
        </p>
      </div>

      <div className="space-y-12">
        {/* Core Principles */}
        <section className="bg-[#1c1713] border border-[#2e261f] rounded-2xl p-8">
          <h2 className="font-serif font-bold text-2xl text-[#f4e8d7] mb-6">
            Our Architectural & Security Principles
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-[#9d8a72]">
            <div className="p-4 rounded-xl bg-[#181410] border border-[#2e261f]">
              <div className="flex items-center gap-2 text-[#e7c6a0] font-semibold text-sm mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>1. Official Sources First</span>
              </div>
              <p className="leading-relaxed">
                Every listed requirement, deadline, and eligibility criterion must link to a reviewed official
                government portal, gazette notification, or official department order.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#181410] border border-[#2e261f]">
              <div className="flex items-center gap-2 text-[#e7c6a0] font-semibold text-sm mb-2">
                <Scale className="w-4 h-4 text-amber-400" />
                <span>2. Rules Before Generative AI</span>
              </div>
              <p className="leading-relaxed">
                Eligibility is evaluated deterministically using structured, auditable rule models. The AI
                assistant serves strictly to explain published guidance, not to guess or invent criteria.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#181410] border border-[#2e261f]">
              <div className="flex items-center gap-2 text-[#e7c6a0] font-semibold text-sm mb-2">
                <Sparkles className="w-4 h-4 text-[#f3a878]" />
                <span>3. Transparent Uncertainty</span>
              </div>
              <p className="leading-relaxed">
                When official requirements are missing, conflicting, or stale, SETUVA explicitly states
                uncertainty rather than fabricating a confident but misleading result.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#181410] border border-[#2e261f]">
              <div className="flex items-center gap-2 text-[#e7c6a0] font-semibold text-sm mb-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>4. Strict Data Minimization</span>
              </div>
              <p className="leading-relaxed">
                We do not collect Aadhaar numbers, bank account passwords, OTPs, or copies of sensitive
                identity documents. You manage task progress without exposing your private credentials.
              </p>
            </div>
          </div>
        </section>

        {/* Source Lifecycle */}
        <section className="bg-[#1c1713] border border-[#2e261f] rounded-2xl p-8">
          <h2 className="font-serif font-bold text-2xl text-[#f4e8d7] mb-4">
            The Content Verification Lifecycle
          </h2>
          <p className="text-xs text-[#9d8a72] leading-relaxed mb-6">
            To ensure users never rely on outdated rules, SETUVA enforces a strict administrative verification
            workflow:
          </p>

          <ol className="list-decimal list-inside space-y-3 text-xs text-[#9d8a72]">
            <li>
              <strong className="text-[#f4e8d7]">Discovery & Link Extraction:</strong> Official government portals
              are catalogued under strict HTTPS and domain verification.
            </li>
            <li>
              <strong className="text-[#f4e8d7]">Human Review:</strong> Content reviewers extract eligibility
              rules and document requirements with exact official quotes.
            </li>
            <li>
              <strong className="text-[#f4e8d7]">Verification & Publishing:</strong> Only authorized publishers
              can transition a scheme to verified status after peer review.
            </li>
            <li>
              <strong className="text-[#f4e8d7]">Continuous Freshness Checks:</strong> When a deadline passes
              or a scheme policy changes, records transition to stale/conflicting pending re-verification.
            </li>
          </ol>
        </section>
      </div>
    </div>
  );
}
