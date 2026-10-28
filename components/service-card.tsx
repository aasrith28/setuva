import Link from "next/link";
import { CheckCircle2, FileText, ArrowRight, ExternalLink } from "lucide-react";

interface ServiceCardProps {
  id: string;
  slug: string;
  name: string;
  category: string;
  jurisdiction: string;
  description: string;
  officialApplicationUrl: string;
  status: string;
  currentVersion: string;
  ruleCount?: number;
  documentCount?: number;
}

export default function ServiceCard({
  slug,
  name,
  category,
  jurisdiction,
  description,
  officialApplicationUrl,
  status,
  ruleCount = 0,
  documentCount = 0,
}: ServiceCardProps) {
  return (
    <div className="bg-[#1c1713] border border-[#2e261f] hover:border-[#e7c6a0]/50 rounded-xl p-6 transition-all duration-200 flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#2e261f] text-[#e7c6a0]">
            {category}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="capitalize">{status}</span>
          </div>
        </div>

        <h3 className="font-serif font-bold text-lg text-[#f4e8d7] group-hover:text-[#e7c6a0] transition-colors mb-2">
          {name}
        </h3>

        <p className="text-sm text-[#9d8a72] line-clamp-3 mb-4 leading-relaxed">
          {description}
        </p>

        <div className="flex items-center gap-4 text-xs text-[#9d8a72] mb-6 pt-3 border-t border-[#2e261f]">
          <span>📍 {jurisdiction}</span>
          {ruleCount > 0 && <span>⚖️ {ruleCount} Verified Rules</span>}
          {documentCount > 0 && <span>📄 {documentCount} Required Documents</span>}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Link
          href={`/services/${slug}`}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#2e261f] hover:bg-[#e7c6a0] text-[#f4e8d7] hover:text-[#181410] text-xs font-semibold uppercase tracking-wider transition-colors"
        >
          <span>View Guidelines</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <a
          href={officialApplicationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg border border-[#2e261f] hover:border-[#e7c6a0] text-[#9d8a72] hover:text-[#e7c6a0] transition-colors"
          title="Open Official Portal"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
