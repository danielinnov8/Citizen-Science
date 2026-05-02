import React from "react";
import { TrendingUp, Award, CalendarDays, Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { storage } from "@/lib/storage";
import { CATEGORIES } from "@/lib/categories";

export function ProgressPage() {
  const started = storage.getStartedExperiments();
  const completedSteps = storage.getCompletedSteps();
  const notebooks = storage.getNotebookEntries();
  const categoriesExplored = new Set(notebooks.map(n => n.categorySlug)).size;

  // Generate fake heatmap data based on recent notebooks
  const today = new Date();
  const weeks = 12;
  const heatmap = Array.from({ length: 7 }, () => Array.from({ length: weeks }, () => 0));
  
  notebooks.forEach(n => {
    const d = new Date(n.date);
    const diffTime = Math.abs(today.getTime() - d.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < weeks * 7) {
      const col = weeks - 1 - Math.floor(diffDays / 7);
      const row = d.getDay();
      heatmap[row][col] += 1;
    }
  });

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto w-full animate-in fade-in duration-500">
      <div className="mb-10">
        <h1 className="text-3xl font-serif tracking-tight mb-2">Learning Progress</h1>
        <p className="text-[#64748B]">Track your scientific journey across disciplines.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <Card className="shadow-sm border-[#E2E8F0]">
          <CardContent className="p-5 flex flex-col items-center text-center">
            <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-[#0F172A]">{started.length}</div>
            <div className="text-xs text-[#64748B] font-medium">Experiments Started</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-[#E2E8F0]">
          <CardContent className="p-5 flex flex-col items-center text-center">
            <div className="h-10 w-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-3">
              <Award className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-[#0F172A]">{completedSteps.length}</div>
            <div className="text-xs text-[#64748B] font-medium">Steps Completed</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-[#E2E8F0]">
          <CardContent className="p-5 flex flex-col items-center text-center">
            <div className="h-10 w-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-3">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-[#0F172A]">{notebooks.length}</div>
            <div className="text-xs text-[#64748B] font-medium">Observations Logged</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-[#E2E8F0]">
          <CardContent className="p-5 flex flex-col items-center text-center">
            <div className="h-10 w-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-3">
              <Flame className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-[#0F172A]">1</div>
            <div className="text-xs text-[#64748B] font-medium">Day Streak</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="shadow-sm border-[#E2E8F0]">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-6">Activity (Last 12 Weeks)</h3>
            <div className="flex gap-1 justify-between overflow-x-auto">
              {heatmap[0].map((_, colIndex) => (
                <div key={colIndex} className="flex flex-col gap-1">
                  {heatmap.map((row, rowIndex) => {
                    const count = row[colIndex];
                    let bg = "bg-slate-100";
                    if (count === 1) bg = "bg-blue-200";
                    if (count === 2) bg = "bg-blue-400";
                    if (count >= 3) bg = "bg-blue-600";
                    return (
                      <div key={`${rowIndex}-${colIndex}`} className={`w-4 h-4 rounded-sm ${bg}`} title={`${count} observations`} />
                    );
                  })}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-[#E2E8F0]">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-6">Category Breakdown</h3>
            <div className="space-y-5">
              {CATEGORIES.map(cat => {
                // mock progress based on notebooks
                const obsForCat = notebooks.filter(n => n.categorySlug === cat.slug).length;
                const progress = Math.min(100, obsForCat * 20);
                return (
                  <div key={cat.slug}>
                    <div className="flex justify-between text-sm mb-1.5 font-medium">
                      <span>{cat.name}</span>
                      <span className="text-[#64748B]">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
