import { ShieldCheck, Lock, EyeOff, Trash2 } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2e261f] border border-[#e7c6a0]/30 text-[#e7c6a0] text-xs font-semibold uppercase tracking-wider mb-4">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Privacy & Data Protection</span>
        </div>
        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#f4e8d7] mb-4">
          Privacy Notice & Data Minimization
        </h1>
        <p className="text-sm text-[#9d8a72] leading-relaxed">
          SETUVA is designed around privacy-by-design principles compliant with CERT-In and NIST guidelines.
        </p>
      </div>

      <div className="space-y-8 text-xs text-[#9d8a72] leading-relaxed">
        <section className="bg-[#1c1713] border border-[#2e261f] p-6 rounded-xl">
          <h2 className="font-serif font-bold text-lg text-[#f4e8d7] mb-3 flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#e7c6a0]" />
            <span>1. What We DO NOT Collect</span>
          </h2>
          <p className="mb-3">
            In accordance with our strict MVP data minimization policy (SECURITY.md Section 7), SETUVA
            actively prohibits and excludes the collection of:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-[#f4e8d7]/90">
            <li>Aadhaar numbers or UIDAI biometric data</li>
            <li>Bank account numbers, IFSC codes, or passwords</li>
            <li>Government portal login passwords or OTPs</li>
            <li>Scanned copies or uploads of personal identity documents (PAN, Voter ID, Caste certificates)</li>
          </ul>
        </section>

        <section className="bg-[#1c1713] border border-[#2e261f] p-6 rounded-xl">
          <h2 className="font-serif font-bold text-lg text-[#f4e8d7] mb-3 flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-[#e7c6a0]" />
            <span>2. What We Collect and Store</span>
          </h2>
          <p className="mb-2">We store only the minimum data required to provide personal tracking:</p>
          <ul className="list-disc list-inside space-y-1.5">
            <li>Account identity: Name, email address, securely hashed password (bcrypt rounds: 12)</li>
            <li>Preparation progress: Checked items in your private checklist, user notes</li>
            <li>Reminders: Date, timezone, and reminder message</li>
            <li>Operational telemetry: Anonymous request metrics without passwords or sensitive answers</li>
          </ul>
        </section>

        <section className="bg-[#1c1713] border border-[#2e261f] p-6 rounded-xl">
          <h2 className="font-serif font-bold text-lg text-[#f4e8d7] mb-3 flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-[#e7c6a0]" />
            <span>3. Data Retention & Deletion</span>
          </h2>
          <p>
            Users can delete their saved trackers and reminders at any time from their personal dashboard.
            All user-owned data is strictly isolated using server-side ownership checks to prevent unauthorized
            access.
          </p>
        </section>
      </div>
    </div>
  );
}
