"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, User, Loader2, AlertCircle, ShieldCheck } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-[#1c1713] border border-[#2e261f] rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-[#e7c6a0] flex items-center justify-center text-[#181410] font-serif font-bold text-2xl mx-auto mb-3">
            S
          </div>
          <h2 className="font-serif font-bold text-2xl text-[#f4e8d7]">Create Your Account</h2>
          <p className="text-xs text-[#9d8a72] mt-1">
            Personalize your scheme preparation checklists with privacy-first data handling.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#9d8a72] mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aravind Kumar"
                className="w-full bg-[#181410] border border-[#2e261f] focus:border-[#e7c6a0] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#f4e8d7] placeholder-[#9d8a72]/40 outline-none"
              />
              <User className="w-4 h-4 text-[#9d8a72] absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#9d8a72] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aravind@example.com"
                className="w-full bg-[#181410] border border-[#2e261f] focus:border-[#e7c6a0] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#f4e8d7] placeholder-[#9d8a72]/40 outline-none"
              />
              <Mail className="w-4 h-4 text-[#9d8a72] absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#9d8a72] mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                className="w-full bg-[#181410] border border-[#2e261f] focus:border-[#e7c6a0] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#f4e8d7] placeholder-[#9d8a72]/40 outline-none"
              />
              <Lock className="w-4 h-4 text-[#9d8a72] absolute left-3.5 top-3" />
            </div>
          </div>

          <div className="p-3 bg-[#181410] rounded-lg border border-[#2e261f] text-[11px] text-[#9d8a72] flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              SETUVA enforces data minimization. We will never ask for your bank passwords, Aadhaar OTPs,
              or original document scans.
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#e7c6a0] hover:bg-[#f4e8d7] text-[#181410] font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Register Account"
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#2e261f] text-center text-xs text-[#9d8a72]">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-[#e7c6a0] hover:underline font-semibold">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
