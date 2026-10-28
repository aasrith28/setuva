import { ShieldCheck, ExternalLink, Calendar, Building2 } from "lucide-react";

interface SourceCitationProps {
  authority: string;
  url: string;
  verificationStatus: string;
  lastCheckedDate: string;
  excerpt?: string;
  sourceType?: string;
}

export default function SourceCitation({
  authority,
  url,
  verificationStatus,
  lastCheckedDate,
  excerpt,
  sourceType = "Official Portal",
}: SourceCitationProps) {
  return (
    <div className="bg-[#181410] border border-[#2e261f] rounded-lg p-4 text-xs text-[#9d8a72]">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-[#2e261f]">
        <div className="flex items-center gap-1.5 font-semibold text-[#e7c6a0]">
          <Building2 className="w-3.5 h-3.5" />
          <span>{authority}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-medium">
            <ShieldCheck className="w-3 h-3" />
            <span className="capitalize">{verificationStatus}</span>
          </span>
          <span className="inline-flex items-center gap-1 text-[#9d8a72]">
            <Calendar className="w-3 h-3" />
            <span>Checked: {lastCheckedDate}</span>
          </span>
        </div>
      </div>

      {excerpt && (
        <blockquote className="italic mb-3 pl-3 border-l-2 border-[#e7c6a0]/40 text-[#f4e8d7]/90 leading-relaxed">
          &ldquo;{excerpt}&rdquo;
        </blockquote>
      )}

      <div className="flex items-center justify-between">
        <span className="uppercase tracking-wider text-[10px] text-[#9d8a72]/80">
          Source: {sourceType}
        </span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[#e7c6a0] hover:underline font-medium"
        >
          <span>Verify at Official Portal</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
