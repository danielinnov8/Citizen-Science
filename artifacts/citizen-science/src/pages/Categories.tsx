import React, { useState } from "react";
import { Link } from "wouter";
import { Search, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CATEGORIES, getCategoryIcon } from "@/lib/categories";

export function Categories() {
  const [search, setSearch] = useState("");
  const [diffFilter, setDiffFilter] = useState<string>("All");

  const filtered = CATEGORIES.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
    const matchesDiff = diffFilter === "All" || c.difficulty === diffFilter;
    return matchesSearch && matchesDiff;
  });

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto w-full animate-in fade-in duration-500">
      <div className="mb-10">
        <h1 className="text-3xl font-serif tracking-tight mb-2">Explore Categories</h1>
        <p className="text-[#64748B]">Find a field of science that sparks your curiosity.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
          <Input 
            placeholder="Search fields, tools, or concepts..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {["All", "Beginner", "Intermediate", "Advanced"].map(f => (
            <Badge 
              key={f} 
              variant={diffFilter === f ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => setDiffFilter(f)}
            >
              {f}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((cat) => {
          const Icon = getCategoryIcon(cat.icon);
          return (
          <Link key={cat.slug} href={`/category/${cat.slug}`}>
            <Card className="border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow group cursor-pointer h-full flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="icon-tile-metal h-10 w-10 rounded-lg bg-blue-50 text-blue-600 group-hover:text-white flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-wider
                    ${cat.difficulty === 'Beginner' ? 'text-green-600 bg-green-50 border-green-200' : ''}
                    ${cat.difficulty === 'Intermediate' ? 'text-amber-600 bg-amber-50 border-amber-200' : ''}
                    ${cat.difficulty === 'Advanced' ? 'text-purple-600 bg-purple-50 border-purple-200' : ''}
                  `}>
                    {cat.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{cat.name}</CardTitle>
                <CardDescription className="text-xs line-clamp-3">{cat.description}</CardDescription>
              </CardHeader>
              <CardContent className="pb-4 pt-0 mt-auto">
                <div className="text-xs font-semibold text-blue-600 flex items-center opacity-0 group-hover:opacity-100 transition-opacity mt-4">
                  Explore {cat.name} <ArrowRight className="ml-1 h-3 w-3" />
                </div>
              </CardContent>
            </Card>
          </Link>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-[#64748B]">
            No categories found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
}
