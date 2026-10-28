"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ShieldCheck, User, LogOut, CheckSquare, Search, Award } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 bg-[#181410] border-b border-[#2e261f] text-[#f4e8d7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-[#e7c6a0] flex items-center justify-center text-[#181410] font-bold text-lg font-serif">
            S
          </div>
          <div>
            <span className="font-serif font-bold text-xl tracking-tight text-[#f4e8d7] group-hover:text-[#e7c6a0] transition-colors">
              SETUVA
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs text-[#9d8a72] uppercase tracking-wider font-semibold">
              Official Scheme Companion
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-4 text-sm font-medium">
          <Link
            href="/services"
            className={`px-3 py-1.5 rounded-md transition-colors ${
              pathname.startsWith("/services")
                ? "bg-[#2e261f] text-[#e7c6a0]"
                : "text-[#f4e8d7]/80 hover:text-[#f4e8d7] hover:bg-[#2e261f]/50"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Search className="w-4 h-4" />
              Catalogue
            </span>
          </Link>

          {user && (
            <Link
              href="/dashboard"
              className={`px-3 py-1.5 rounded-md transition-colors ${
                pathname.startsWith("/dashboard")
                  ? "bg-[#2e261f] text-[#e7c6a0]"
                  : "text-[#f4e8d7]/80 hover:text-[#f4e8d7] hover:bg-[#2e261f]/50"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4" />
                Dashboard
              </span>
            </Link>
          )}

          {user && (user.role === "admin" || user.role === "content_reviewer" || user.role === "publisher") && (
            <Link
              href="/admin"
              className={`px-3 py-1.5 rounded-md transition-colors ${
                pathname.startsWith("/admin")
                  ? "bg-[#2e261f] text-[#f3a878]"
                  : "text-[#f3a878]/80 hover:text-[#f3a878] hover:bg-[#2e261f]/50"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Admin
              </span>
            </Link>
          )}

          <div className="h-5 w-px bg-[#2e261f] mx-1" />

          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#9d8a72] hidden md:inline">
                    {user.name} ({user.role})
                  </span>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-md text-[#f4e8d7]/70 hover:text-[#f4e8d7] hover:bg-[#2e261f] transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/sign-in"
                    className="px-3 py-1.5 rounded-md text-sm text-[#f4e8d7] hover:bg-[#2e261f] transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#e7c6a0] text-[#181410] hover:bg-[#f4e8d7] transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
