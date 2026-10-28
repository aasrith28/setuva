import prisma from "@/lib/db/prisma";
import ServiceCard from "@/components/service-card";
import { Search, Filter } from "lucide-react";

export const dynamic = "force-dynamic";

interface ServicesPageProps {
  searchParams: {
    category?: string;
    search?: string;
  };
}

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
  const { category, search } = searchParams;

  const where: any = {
    status: "verified",
  };

  if (category) {
    where.category = category;
  }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
      { category: { contains: search } },
    ];
  }

  const services = await prisma.service.findMany({
    where,
    include: {
      _count: {
        select: {
          rules: true,
          documents: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const categories = ["Scholarships", "Student Welfare", "Youth Employment"];

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="mb-10">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#e7c6a0] mb-2">
          Public Schemes
        </div>
        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#f4e8d7] mb-4">
          Government Service Catalogue
        </h1>
        <p className="text-sm text-[#9d8a72] max-w-2xl leading-relaxed">
          Browse verified schemes available for students and residents in Karnataka. Each listing is
          reviewed and linked directly to authorized government sources.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8 bg-[#1c1713] p-4 rounded-xl border border-[#2e261f]">
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/services"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
              !category
                ? "bg-[#e7c6a0] text-[#181410]"
                : "bg-[#181410] text-[#9d8a72] hover:text-[#f4e8d7] border border-[#2e261f]"
            }`}
          >
            All Categories
          </a>
          {categories.map((cat) => (
            <a
              key={cat}
              href={`/services?category=${encodeURIComponent(cat)}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                category === cat
                  ? "bg-[#e7c6a0] text-[#181410]"
                  : "bg-[#181410] text-[#9d8a72] hover:text-[#f4e8d7] border border-[#2e261f]"
              }`}
            >
              {cat}
            </a>
          ))}
        </div>

        <form method="GET" action="/services" className="relative flex-1 sm:max-w-xs">
          <input
            type="text"
            name="search"
            defaultValue={search || ""}
            placeholder="Search schemes..."
            className="w-full bg-[#181410] border border-[#2e261f] focus:border-[#e7c6a0] rounded-lg pl-9 pr-4 py-2 text-xs text-[#f4e8d7] placeholder-[#9d8a72]/50 outline-none"
          />
          <Search className="w-4 h-4 text-[#9d8a72] absolute left-3 top-2.5" />
        </form>
      </div>

      {/* Services Grid */}
      {services.length === 0 ? (
        <div className="text-center py-16 bg-[#1c1713] rounded-xl border border-[#2e261f] p-8">
          <p className="text-sm text-[#9d8a72] mb-4">
            No verified schemes matched your search criteria.
          </p>
          <a
            href="/services"
            className="px-4 py-2 rounded-lg bg-[#2e261f] text-[#e7c6a0] text-xs font-semibold uppercase tracking-wider hover:bg-[#e7c6a0] hover:text-[#181410] transition-colors"
          >
            Reset Filters
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((scheme) => (
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
      )}
    </div>
  );
}
