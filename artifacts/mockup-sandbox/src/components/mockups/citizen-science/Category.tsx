import React, { useState } from "react";
import { Topbar } from "./_shared/Topbar";
import { ChevronRight, Leaf, Clock, AlertTriangle, BookOpen, Calculator, Sprout, ShieldAlert, CheckCircle2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export function Category() {
  const [lightHours, setLightHours] = useState([8]);
  const [plantType, setPlantType] = useState("tomato");
  const [waterFreq, setWaterFreq] = useState("daily");
  const [hasFertilizer, setHasFertilizer] = useState(false);

  // Simple plausible formula for predicted growth
  const getGrowth = () => {
    let base = plantType === "basil" ? 3 : plantType === "tomato" ? 5 : plantType === "lettuce" ? 4 : 6;
    let lightMult = lightHours[0] < 4 ? 0.2 : lightHours[0] > 12 ? 0.8 : 1.2;
    let waterMult = waterFreq === "daily" ? 1.1 : waterFreq === "every-2-days" ? 1.0 : 0.6;
    let fertAdd = hasFertilizer ? 2 : 0;
    return Math.max(0.5, Math.round((base * lightMult * waterMult + fertAdd) * 10) / 10);
  };

  const growthRate = getGrowth();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans pb-32 selection:bg-green-100 selection:text-green-900">
      <Topbar />

      {/* Breadcrumb */}
      <div className="container mx-auto max-w-5xl px-4 lg:px-8 py-6">
        <div className="flex items-center text-sm font-medium text-[#64748B] mb-8">
          <a href="#" className="hover:text-[#0F172A]">Categories</a>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-[#0F172A]">Plant Science</span>
        </div>

        {/* Hero */}
        <div className="bg-white rounded-3xl p-8 lg:p-12 border border-[#E2E8F0] shadow-sm mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-400 opacity-10 rounded-full blur-[80px] pointer-events-none translate-x-1/2 -translate-y-1/2" />
          
          <div className="flex items-start gap-6 relative z-10">
            <div className="h-16 w-16 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0 shadow-sm border border-green-200">
              <Leaf className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-4">Plant Science</h1>
              <p className="text-lg text-[#64748B] max-w-2xl mb-6 leading-relaxed">
                Explore the biology of plants, from cellular processes to ecosystem dynamics. Learn how light, water, nutrients, and soil composition affect growth and development.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
                <div className="flex items-center gap-1.5 bg-[#F8FAFC] px-3 py-1.5 rounded-lg border border-[#E2E8F0]">
                  <span className="text-[#64748B]">Difficulty:</span>
                  <span className="text-green-700">Beginner–Intermediate</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#F8FAFC] px-3 py-1.5 rounded-lg border border-[#E2E8F0]">
                  <BookOpen className="h-4 w-4 text-[#64748B]" />
                  <span>8 tutorials</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#F8FAFC] px-3 py-1.5 rounded-lg border border-[#E2E8F0]">
                  <Calculator className="h-4 w-4 text-[#64748B]" />
                  <span>4 tools</span>
                </div>
                <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200 text-green-800">
                  <ShieldAlert className="h-4 w-4" />
                  <span>Safety: Low</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Beginner Tutorial */}
            <Card className="border-[#E2E8F0] shadow-sm overflow-hidden">
              <CardHeader className="bg-[#FAFAF9] border-b border-[#E2E8F0] pb-6">
                <div className="flex justify-between items-center mb-2">
                  <Badge variant="outline" className="bg-white font-semibold">Beginner Tutorial</Badge>
                  <span className="text-xs font-semibold text-[#64748B]">2/6 complete</span>
                </div>
                <CardTitle className="text-2xl">Introduction to Botany</CardTitle>
                <CardDescription>Master the fundamentals before starting your first experiment.</CardDescription>
                <Progress value={33} className="h-1.5 mt-4" />
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-[#E2E8F0]">
                  {[
                    { title: "What this field studies", status: "done" },
                    { title: "Why it matters", status: "done" },
                    { title: "Key concepts (Photosynthesis & Respiration)", status: "active" },
                    { title: "Simple example experiment", status: "locked" },
                    { title: "Safety considerations", status: "locked" },
                    { title: "What you can measure at home", status: "locked" },
                  ].map((section, i) => (
                    <div key={i} className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${section.status === 'active' ? 'bg-blue-50/50' : 'hover:bg-[#F8FAFC]'}`}>
                      <div className="flex items-center gap-3 font-medium">
                        {section.status === 'done' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                        {section.status === 'active' && <div className="h-5 w-5 rounded-full border-2 border-blue-500 flex items-center justify-center"><div className="h-2 w-2 rounded-full bg-blue-500"/></div>}
                        {section.status === 'locked' && <div className="h-5 w-5 rounded-full border-2 border-[#E2E8F0]" />}
                        <span className={section.status === 'locked' ? 'text-[#64748B]' : 'text-[#0F172A]'}>{section.title}</span>
                      </div>
                      {section.status === 'active' && <ChevronDown className="h-4 w-4 text-blue-500" />}
                    </div>
                  ))}
                </div>
              </CardContent>
              <div className="p-4 bg-white border-t border-[#E2E8F0]">
                <Button className="w-full bg-[#0F172A] hover:bg-[#1E293B] text-white">Continue Tutorial</Button>
              </div>
            </Card>

            {/* Interactive Tool */}
            <Card className="border border-green-200 shadow-sm bg-gradient-to-br from-white to-green-50/30">
              <CardHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Sprout className="h-5 w-5 text-green-600" />
                  <CardTitle>Plant Growth Planner</CardTitle>
                </div>
                <CardDescription>Simulate how environmental factors affect your plant's growth rate.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Inputs */}
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="plant-type" className="text-xs font-bold uppercase text-[#64748B]">Plant Type</Label>
                      <Select value={plantType} onValueChange={setPlantType}>
                        <SelectTrigger id="plant-type" className="bg-white">
                          <SelectValue placeholder="Select plant" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basil">Sweet Basil</SelectItem>
                          <SelectItem value="tomato">Cherry Tomato</SelectItem>
                          <SelectItem value="lettuce">Butterhead Lettuce</SelectItem>
                          <SelectItem value="sunflower">Sunflower</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs font-bold uppercase text-[#64748B]">Light exposure</Label>
                        <span className="text-sm font-medium">{lightHours[0]} hours/day</span>
                      </div>
                      <Slider 
                        value={lightHours} 
                        onValueChange={setLightHours} 
                        max={16} 
                        step={1} 
                        className="py-2"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-xs font-bold uppercase text-[#64748B]">Watering Frequency</Label>
                      <Select value={waterFreq} onValueChange={setWaterFreq}>
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="every-2-days">Every 2 Days</SelectItem>
                          <SelectItem value="weekly">Once a Week</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-[#E2E8F0]">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-semibold">Add Fertilizer</Label>
                        <div className="text-xs text-[#64748B]">Weekly NPK supplement</div>
                      </div>
                      <Switch checked={hasFertilizer} onCheckedChange={setHasFertilizer} />
                    </div>
                  </div>

                  {/* Outputs */}
                  <div className="bg-white p-5 rounded-xl border border-green-200 shadow-sm flex flex-col">
                    <div className="text-center mb-6">
                      <div className="text-sm font-semibold text-[#64748B] mb-1">Predicted Growth Rate</div>
                      <div className="text-4xl font-bold text-green-700">{growthRate.toFixed(1)} <span className="text-lg text-green-600/70 font-medium">cm/week</span></div>
                    </div>

                    <div className="mb-6 flex-1">
                      <div className="text-xs font-bold uppercase text-[#64748B] mb-3">Growth Curve (4 weeks)</div>
                      <div className="bg-[#F8FAFC] rounded-lg p-4 h-32 border border-[#E2E8F0] flex items-end pt-8">
                        <svg viewBox="0 0 200 100" className="w-full h-full overflow-visible">
                          <path 
                            d={`M 0,100 Q 50,${100 - growthRate*3} 100,${100 - growthRate*7} T 200,${Math.max(10, 100 - growthRate*12)}`} 
                            fill="none" 
                            stroke="#16A34A" 
                            strokeWidth="4" 
                            strokeLinecap="round" 
                            className="transition-all duration-500 ease-out"
                          />
                          <circle cx="100" cy={100 - growthRate*7} r="5" fill="#16A34A" className="transition-all duration-500 ease-out" />
                          <circle cx="200" cy={Math.max(10, 100 - growthRate*12)} r="5" fill="#16A34A" className="transition-all duration-500 ease-out" />
                        </svg>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-bold uppercase text-[#64748B] mb-2">Observation Checklist</div>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2"><div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5" /> Measure stem height every Sunday</li>
                        <li className="flex items-start gap-2"><div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5" /> Count number of true leaves</li>
                        <li className="flex items-start gap-2"><div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5" /> Note leaf color (yellowing = nitrogen deficiency)</li>
                        <li className="flex items-start gap-2"><div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5" /> Photograph setup weekly</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <h3 className="text-xl font-bold tracking-tight">Starter Experiments</h3>
            <div className="space-y-4">
              {[
                { title: "Light vs. Shade Growth", time: "3 weeks", diff: "Beginner", steps: "Plant 2 seeds. Place one in window, one in dark box. Measure daily." },
                { title: "Water Frequency Impact", time: "4 weeks", diff: "Beginner", steps: "Water group A daily, group B weekly. Compare wilt and height." },
                { title: "Soil Type Comparison", time: "6 weeks", diff: "Intermediate", steps: "Use potting soil, sand, and backyard dirt. Track germination rates." },
              ].map((exp, i) => (
                <Card key={i} className="border-[#E2E8F0] shadow-sm hover:border-blue-200 transition-colors">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base">{exp.title}</CardTitle>
                    <div className="flex items-center gap-3 text-xs text-[#64748B] mt-1">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {exp.time}</span>
                      <span>•</span>
                      <span className="font-medium">{exp.diff}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <p className="text-sm text-[#64748B] mb-4">{exp.steps}</p>
                    <Button variant="outline" size="sm" className="w-full text-xs font-semibold">Use Template</Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Progress Strip */}
            <div className="bg-[#1E293B] rounded-xl p-5 text-white">
              <h4 className="font-semibold text-sm mb-4">Your Category Progress</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1.5 text-slate-300">
                    <span>Tutorials</span>
                    <span>33%</span>
                  </div>
                  <Progress value={33} className="h-1.5 bg-slate-700 [&>div]:bg-green-400" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5 text-slate-300">
                    <span>Tools Used</span>
                    <span>25%</span>
                  </div>
                  <Progress value={25} className="h-1.5 bg-slate-700 [&>div]:bg-green-400" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5 text-slate-300">
                    <span>Experiments Completed</span>
                    <span>0%</span>
                  </div>
                  <Progress value={0} className="h-1.5 bg-slate-700 [&>div]:bg-green-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}