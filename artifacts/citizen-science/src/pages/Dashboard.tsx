import React from "react";
import { Link } from "wouter";
import { Clock, Flame, Leaf, Droplet, HeartPulse, ChevronRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/auth";
import { storage } from "@/lib/storage";
import { EXPERIMENTS } from "@/lib/experiments";

export function Dashboard() {
  const { user } = useAuth();
  
  const started = storage.getStartedExperiments();
  const notebooks = storage.getNotebookEntries();
  const completed = storage.getCompletedSteps();

  const getActiveExperiments = () => {
    if (started.length === 0) {
      return EXPERIMENTS.slice(0, 3).map(exp => ({
        id: exp.id,
        title: exp.title,
        cat: exp.categoryId,
        progress: 0,
        updated: "Not started"
      }));
    }
    return started.map(s => {
      const exp = EXPERIMENTS.find(e => e.id === s.id);
      return {
        id: s.id,
        title: exp?.title || "Unknown",
        cat: exp?.categoryId || "unknown",
        progress: s.progress,
        updated: new Date(s.startedAt).toLocaleDateString()
      };
    }).slice(0, 3);
  };

  const activeExps = getActiveExperiments();
  const recentNotes = notebooks.slice(0, 4);

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto w-full animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-serif tracking-tight mb-2">Welcome back, {user?.name.split(" ")[0]}.</h1>
          <p className="text-[#64748B]">Continue your experiments and explore new fields.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-[#E2E8F0] shadow-sm">
          <Flame className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-medium text-orange-700">1 day streak</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <Card className="shadow-sm border-[#E2E8F0]">
          <CardContent className="p-4 flex flex-col gap-2">
            <div className="text-xs text-[#64748B] font-medium">Experiments started</div>
            <div className="text-2xl font-bold text-[#0F172A]">{started.length}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-[#E2E8F0]">
          <CardContent className="p-4 flex flex-col gap-2">
            <div className="text-xs text-[#64748B] font-medium">Steps completed</div>
            <div className="text-2xl font-bold text-[#0F172A]">{completed.length}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-[#E2E8F0]">
          <CardContent className="p-4 flex flex-col gap-2">
            <div className="text-xs text-[#64748B] font-medium">Observations</div>
            <div className="text-2xl font-bold text-[#0F172A]">{notebooks.length}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-[#E2E8F0]">
          <CardContent className="p-4 flex flex-col gap-2">
            <div className="text-xs text-[#64748B] font-medium">Categories</div>
            <div className="text-2xl font-bold text-[#0F172A]">{new Set(notebooks.map(n => n.categorySlug)).size}</div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold tracking-tight">Continue learning</h2>
          <Link href="/experiments" className="text-sm font-medium text-blue-600 hover:text-blue-700">View all</Link>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {activeExps.map((exp, i) => (
            <Card key={i} className="shadow-sm border-[#E2E8F0] hover:shadow-md transition-shadow group flex flex-col">
              <CardHeader className="p-5 pb-0 flex-1">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">{exp.cat.replace("-", " ")}</span>
                </div>
                <CardTitle className="text-base leading-tight mb-4">{exp.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0 mt-auto">
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-[#64748B]">Progress</span>
                  <span>{exp.progress}%</span>
                </div>
                <Progress value={exp.progress} className="h-1.5 mb-4" />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#64748B] flex items-center gap-1"><Clock className="h-3 w-3" /> {exp.updated}</span>
                  <Link href={`/experiments/${exp.id}`}>
                    <Button size="sm" className="h-8 text-xs bg-white bg-none shadow-none text-blue-700 border border-blue-200 hover:bg-blue-50">Continue</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        <div className="col-span-2">
          <h2 className="text-xl font-semibold tracking-tight mb-4">Recommended for you</h2>
          <div className="space-y-3">
            {EXPERIMENTS.slice(3, 7).map((rec, i) => (
              <Link key={i} href={`/experiments/${rec.id}`}>
                <div className="group flex items-center justify-between p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-sm hover:border-blue-200 transition-colors cursor-pointer">
                  <div className="pr-4">
                    <h4 className="font-medium text-sm mb-1 group-hover:text-blue-700 transition-colors">{rec.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-[#64748B]">
                      <span className="font-medium text-[#0F172A] capitalize">{rec.categoryId.replace("-", " ")}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {rec.estimatedTime}</span>
                      <Badge variant="outline" className="text-[9px] h-4 px-1.5 font-semibold bg-[#F8FAFC]">{rec.difficulty}</Badge>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#cbd5e1] group-hover:text-blue-600 flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold tracking-tight">Recent Notes</h2>
            <Link href="/notebook">
              <Button variant="ghost" size="sm" className="h-8 px-2 text-[#64748B]">View all</Button>
            </Link>
          </div>
          <Card className="shadow-sm border-[#E2E8F0] bg-white overflow-hidden">
            <div className="divide-y divide-[#E2E8F0]">
              {recentNotes.length > 0 ? (
                recentNotes.map((note, i) => (
                  <div key={i} className="p-4 hover:bg-[#F8FAFC] transition-colors">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-[10px] font-bold uppercase text-[#64748B]">{new Date(note.date).toLocaleDateString()}</span>
                      <span className="text-xs font-medium bg-gray-100 px-1.5 rounded">{note.categorySlug}</span>
                    </div>
                    <p className="text-sm text-[#0F172A] line-clamp-2 leading-relaxed">{note.observation}</p>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-sm text-[#64748B]">
                  No notebook entries yet. Start an experiment to add one!
                </div>
              )}
            </div>
            <div className="bg-[#F8FAFC] p-3 text-center border-t border-[#E2E8F0]">
              <Link href="/notebook" className="text-xs font-medium text-blue-600 hover:text-blue-700">Open Notebook →</Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
