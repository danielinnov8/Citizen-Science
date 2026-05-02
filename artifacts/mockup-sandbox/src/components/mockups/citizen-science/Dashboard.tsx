import React from "react";
import { Topbar } from "./_shared/Topbar";
import { LayoutDashboard, Compass, Beaker, BookA, TrendingUp, User, ChevronRight, Activity, Clock, Flame, BookOpen, Leaf, Droplet, HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Compass, label: "Categories" },
  { icon: Beaker, label: "Experiments" },
  { icon: BookA, label: "Notebook" },
  { icon: TrendingUp, label: "Progress" },
  { icon: User, label: "Profile" },
];

const STATS = [
  { label: "Experiments started", value: "12", icon: Beaker },
  { label: "Experiments completed", value: "7", icon: CheckCircle },
  { label: "Observations logged", value: "43", icon: BookOpen },
  { label: "Categories explored", value: "6", icon: Compass },
  { label: "Current streak", value: "9 days", icon: Flame },
];

function CheckCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

export function Dashboard() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans flex flex-col selection:bg-blue-100 selection:text-blue-900">
      <Topbar />

      <div className="flex flex-1">
        {/* Left Rail */}
        <aside className="hidden lg:flex w-64 flex-col border-r border-[#E2E8F0] bg-white p-4">
          <div className="space-y-1">
            {NAV_ITEMS.map((item, i) => (
              <a
                key={i}
                href="#"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  item.active
                    ? "bg-blue-50 text-blue-700"
                    : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </a>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-10 max-w-6xl mx-auto w-full">
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back, Daniel.</h1>
              <p className="text-[#64748B]">Continue your experiments and explore new fields.</p>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-[#E2E8F0] shadow-sm">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium text-orange-700">9 day streak</span>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
            {STATS.map((stat, i) => (
              <Card key={i} className="shadow-sm border-[#E2E8F0]">
                <CardContent className="p-4 flex flex-col gap-2">
                  <div className="text-xs text-[#64748B] font-medium flex items-center justify-between">
                    {stat.label}
                    <stat.icon className="h-3.5 w-3.5 text-blue-500/70" />
                  </div>
                  <div className="text-2xl font-bold text-[#0F172A]">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Continue Learning */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold tracking-tight">Continue learning</h2>
              <Button variant="ghost" size="sm" className="text-blue-600">View all</Button>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { title: "Light vs. shade plant growth", cat: "Plant Science", icon: Leaf, progress: 62, updated: "2 hrs ago", color: "text-green-600", bg: "bg-green-50" },
                { title: "Local tap vs. filtered water pH", cat: "Water Quality", icon: Droplet, progress: 40, updated: "1 day ago", color: "text-blue-600", bg: "bg-blue-50" },
                { title: "Sleep quality vs. screen exposure", cat: "Wellness", icon: HeartPulse, progress: 18, updated: "3 days ago", color: "text-rose-600", bg: "bg-rose-50" },
              ].map((exp, i) => (
                <Card key={i} className="shadow-sm border-[#E2E8F0] hover:shadow-md transition-shadow group flex flex-col">
                  <CardHeader className="p-5 pb-0 flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <div className={`h-8 w-8 rounded-md flex items-center justify-center ${exp.bg} ${exp.color}`}>
                        <exp.icon className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">{exp.cat}</span>
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
                      <Button size="sm" className="h-8 text-xs bg-white text-blue-700 border border-blue-200 hover:bg-blue-50">Continue</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {/* Recommended Experiments */}
            <div className="col-span-2">
              <h2 className="text-xl font-semibold tracking-tight mb-4">Recommended for you</h2>
              <div className="space-y-3">
                {[
                  { title: "Track plant growth under different light conditions", cat: "Plant Science", time: "2-4 weeks", diff: "Beginner" },
                  { title: "Measure local water pH", cat: "Water Quality", time: "1 day", diff: "Beginner" },
                  { title: "Simulate microbial population growth", cat: "Microbiology", time: "1 hour", diff: "Intermediate" },
                  { title: "Log sleep quality vs. screen exposure", cat: "Wellness", time: "2 weeks", diff: "Beginner" },
                ].map((rec, i) => (
                  <div key={i} className="group flex items-center justify-between p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-sm hover:border-blue-200 transition-colors cursor-pointer">
                    <div className="pr-4">
                      <h4 className="font-medium text-sm mb-1 group-hover:text-blue-700 transition-colors">{rec.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-[#64748B]">
                        <span className="font-medium text-[#0F172A]">{rec.cat}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {rec.time}</span>
                        <Badge variant="outline" className="text-[9px] h-4 px-1.5 font-semibold bg-[#F8FAFC]">{rec.diff}</Badge>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#cbd5e1] group-hover:text-blue-600 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            {/* Notebook Preview */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold tracking-tight">Recent Notes</h2>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-[#64748B]">New note</Button>
              </div>
              <Card className="shadow-sm border-[#E2E8F0] bg-white overflow-hidden">
                <div className="divide-y divide-[#E2E8F0]">
                  {[
                    { date: "Today", exp: "Light vs. shade", note: "Seedling B is showing phototropism towards the window." },
                    { date: "Yesterday", exp: "Water pH", note: "Tap water sample reads pH 7.2, slightly alkaline." },
                    { date: "Oct 12", exp: "Light vs. shade", note: "First true leaves appearing on Seedling A." },
                    { date: "Oct 10", exp: "Sleep tracking", note: "Slept 7.5 hours after 2 hours of no screens." },
                  ].map((note, i) => (
                    <div key={i} className="p-4 hover:bg-[#F8FAFC] cursor-pointer transition-colors">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-[10px] font-bold uppercase text-[#64748B]">{note.date}</span>
                        <span className="text-xs font-medium bg-gray-100 px-1.5 rounded">{note.exp}</span>
                      </div>
                      <p className="text-sm text-[#0F172A] line-clamp-2 leading-relaxed">{note.note}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-[#F8FAFC] p-3 text-center border-t border-[#E2E8F0]">
                  <a href="#" className="text-xs font-medium text-blue-600 hover:text-blue-700">Open Notebook →</a>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}