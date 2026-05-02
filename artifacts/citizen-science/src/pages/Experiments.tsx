import React, { useState } from "react";
import { Link } from "wouter";
import { Search, Clock, Beaker } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EXPERIMENTS } from "@/lib/experiments";
import { CATEGORIES } from "@/lib/categories";

export function Experiments() {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<string>("All");

  const filtered = EXPERIMENTS.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase());
    const matchesCat = catFilter === "All" || e.categoryId === catFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto w-full animate-in fade-in duration-500">
      <div className="mb-10">
        <h1 className="text-3xl font-serif tracking-tight mb-2">Experiments</h1>
        <p className="text-[#64748B]">Browse starter templates to run your own experiments.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
          <Input 
            placeholder="Search experiments..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          <Badge 
            variant={catFilter === "All" ? "default" : "outline"}
            className="cursor-pointer whitespace-nowrap"
            onClick={() => setCatFilter("All")}
          >
            All Fields
          </Badge>
          {CATEGORIES.slice(0, 5).map(c => (
            <Badge 
              key={c.slug} 
              variant={catFilter === c.slug ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => setCatFilter(c.slug)}
            >
              {c.name}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((exp) => {
          const cat = CATEGORIES.find(c => c.slug === exp.categoryId);
          return (
            <Link key={exp.id} href={`/experiments/${exp.id}`}>
              <Card className="border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow group h-full flex flex-col">
                <CardHeader className="p-5 pb-3 flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">{cat?.name}</span>
                    <Badge variant="outline" className="text-[9px] font-semibold bg-[#F8FAFC]">{exp.difficulty}</Badge>
                  </div>
                  <CardTitle className="text-base leading-tight group-hover:text-blue-700 transition-colors">{exp.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-5 pt-0 mt-auto">
                  <div className="flex justify-between items-center text-xs text-[#64748B] mt-4">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {exp.estimatedTime}</span>
                    <span className="font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">Start →</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-[#64748B]">
            No experiments found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
}
