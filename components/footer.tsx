import Link from "next/link";
import { ShieldAlert, BookOpen, Lock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#120f0d] text-[#9d8a72] border-t border-[#2e261f] text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-serif font-bold text-lg text-[#f4e8d7]">SETUVA</span>
              <span className="text-xs bg-[#2e261f] text-[#e7c6a0] px-2 py-0.5 rounded">
                MVP Karnataka
              </span>
            </div>
            <p className="text-xs leading-relaxed text-[#9d8a72]">
              An AI-assisted government scheme navigation and application companion. We empower students
              and citizens to discover verified public welfare benefits with grounded official citations.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#f4e8d7] mb-3">
              Transparency & Security
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about" className="hover:text-[#e7c6a0] transition-colors">
                  Methodology & Source Verification
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#e7c6a0] transition-colors">
                  Data Minimization & Privacy Notice
                </Link>
              </li>
              <li>
                <span className="inline-flex items-center gap-1 text-[#f3a878]">
                  <Lock className="w-3 h-3" /> No identity document copies or OTPs stored
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#f4e8d7] mb-3">
              Official Disclaimer
            </h4>
            <div className="bg-[#1c1713] p-3 rounded-lg border border-[#2e261f] text-xs text-[#9d8a72] leading-relaxed">
              <div className="flex items-start gap-1.5 text-[#e7c6a0] font-medium mb-1">
                <ShieldAlert className="w-4 h-4 shrink-0 text-[#f3a878]" />
                <span>Not a Government Authority</span>
              </div>
              SETUVA is an independent informational guidance tool. We do not approve, process, or guarantee
              benefits. All applications must be officially lodged on authorized government portals.
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-[#2e261f] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} SETUVA. Informational guidance only.</p>
          <p className="text-center sm:text-right">
            Designed for students and residents in Karnataka, India.
          </p>
        </div>
      </div>
    </footer>
  );
}
