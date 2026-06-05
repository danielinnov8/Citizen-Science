import React, { useState, useEffect, useRef } from "react";
import { Link, useParams } from "wouter";
import { ChevronRight, Clock, BookOpen, Calculator, ShieldAlert, Beaker, Sprout, Droplet, Atom, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { CATEGORIES } from "@/lib/categories";
import { EXPERIMENTS } from "@/lib/experiments";
import { getTutorial } from "@/lib/tutorials";
import { TutorialModule } from "@/components/TutorialModule";

export function Category() {
  const { slug } = useParams();
  const category = CATEGORIES.find(c => c.slug === slug);
  const exps = EXPERIMENTS.filter(e => e.categoryId === slug);

  // Plant Growth Planner state
  const [lightHours, setLightHours] = useState([8]);
  const [plantType, setPlantType] = useState("tomato");
  const [waterFreq, setWaterFreq] = useState("daily");
  const [hasFertilizer, setHasFertilizer] = useState(false);

  // Water Quality state
  const [phLevel, setPhLevel] = useState([7]);
  const [turbidity, setTurbidity] = useState([1]);
  const [temp, setTemp] = useState([20]);

  // Physics state
  const [distance, setDistance] = useState([10]);
  const [time, setTime] = useState([2]);
  const [mass, setMass] = useState([5]);
  const [force, setForce] = useState([25]);

  if (!category) return <div className="p-10">Category not found</div>;

  const tutorial = getTutorial(slug);

  const getPlantGrowth = () => {
    let base = plantType === "basil" ? 3 : plantType === "tomato" ? 5 : plantType === "lettuce" ? 4 : 6;
    let lightMult = lightHours[0] < 4 ? 0.2 : lightHours[0] > 12 ? 0.8 : 1.2;
    let waterMult = waterFreq === "daily" ? 1.1 : waterFreq === "every-2-days" ? 1.0 : 0.6;
    let fertAdd = hasFertilizer ? 2 : 0;
    return Math.max(0.5, Math.round((base * lightMult * waterMult + fertAdd) * 10) / 10);
  };
  const growthRate = getPlantGrowth();

  const getWaterQuality = () => {
    let score = 100;
    if (phLevel[0] < 6 || phLevel[0] > 8) score -= Math.abs(7 - phLevel[0]) * 10;
    score -= turbidity[0] * 5;
    if (temp[0] > 25) score -= (temp[0] - 25) * 2;
    return Math.max(0, Math.round(score));
  };
  const waterScore = getWaterQuality();

  const getPhysics = () => {
    const speed = distance[0] / time[0];
    const accel = force[0] / mass[0];
    const momentum = mass[0] * speed;
    return { speed, accel, momentum };
  };
  const physicsData = getPhysics();

  const isPlantScience = slug === "plant-science";
  const isWaterQuality = slug === "water-quality";
  const isPhysics = slug === "physics";

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto w-full animate-in fade-in duration-500 pb-32">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm font-medium text-[#64748B] mb-8">
        <Link href="/categories" className="hover:text-[#0F172A]">Categories</Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-[#0F172A]">{category.name}</span>
      </div>

      {/* Hero */}
      <div className="bg-white rounded-3xl p-8 lg:p-12 border border-[#E2E8F0] shadow-sm mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10 rounded-full blur-[80px] pointer-events-none translate-x-1/2 -translate-y-1/2" style={{ backgroundColor: `var(--color-${category.accent}-400, #3b82f6)` }} />
        
        <div className="flex items-start gap-6 relative z-10">
          <div className="h-16 w-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border" style={{ backgroundColor: `var(--color-${category.accent}-50, #eff6ff)`, borderColor: `var(--color-${category.accent}-100, #dbeafe)`, color: `var(--color-${category.accent}-700, #1d4ed8)` }}>
            {slug === 'plant-science' ? <Sprout className="h-8 w-8" /> : slug === 'water-quality' ? <Droplet className="h-8 w-8" /> : slug === 'physics' ? <Atom className="h-8 w-8" /> : <Beaker className="h-8 w-8" />}
          </div>
          <div>
            <h1 className="text-4xl font-serif tracking-tight mb-4">{category.name}</h1>
            <p className="text-lg text-[#64748B] max-w-2xl mb-6 leading-relaxed">
              {category.description}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
              <div className="flex items-center gap-1.5 bg-[#F8FAFC] px-3 py-1.5 rounded-lg border border-[#E2E8F0]">
                <span className="text-[#64748B]">Difficulty:</span>
                <span className="text-blue-700">{category.difficulty}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#F8FAFC] px-3 py-1.5 rounded-lg border border-[#E2E8F0]">
                <BookOpen className="h-4 w-4 text-[#64748B]" />
                <span>{category.tutorialsCount} tutorials</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#F8FAFC] px-3 py-1.5 rounded-lg border border-[#E2E8F0]">
                <Calculator className="h-4 w-4 text-[#64748B]" />
                <span>{category.toolsCount} tools</span>
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${category.safety === 'Low' ? 'bg-green-50 border-green-200 text-green-800' : category.safety === 'Medium' ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                <ShieldAlert className="h-4 w-4" />
                <span>Safety: {category.safety}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Tutorial Section */}
          {tutorial ? (
            <TutorialModule key={tutorial.slug} tutorial={tutorial} />
          ) : (
            <Card className="border-[#E2E8F0] shadow-sm overflow-hidden">
              <CardHeader className="bg-[#FAFAF9] border-b border-[#E2E8F0] pb-6">
                <Badge variant="outline" className="bg-white font-semibold w-fit">Tutorial</Badge>
                <CardTitle className="text-2xl">Introduction to {category.name}</CardTitle>
                <CardDescription>A full tutorial for this module is coming soon.</CardDescription>
              </CardHeader>
            </Card>
          )}

          {/* Interactive Tool */}
          {isPlantScience ? (
            <Card className="border border-green-200 shadow-sm bg-gradient-to-br from-white to-green-50/30">
              <CardHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Sprout className="h-5 w-5 text-green-600" />
                  <CardTitle>{category.toolPreview.name}</CardTitle>
                </div>
                <CardDescription>{category.toolPreview.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
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
                      <Slider value={lightHours} onValueChange={setLightHours} max={16} step={1} className="py-2"/>
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

                  <div className="bg-white p-5 rounded-xl border border-green-200 shadow-sm flex flex-col">
                    <div className="text-center mb-6">
                      <div className="text-sm font-semibold text-[#64748B] mb-1">Predicted Growth Rate</div>
                      <div className="text-4xl font-bold text-green-700">{growthRate.toFixed(1)} <span className="text-lg text-green-600/70 font-medium">cm/week</span></div>
                    </div>
                    <div className="mb-6 flex-1">
                      <div className="text-xs font-bold uppercase text-[#64748B] mb-3">Growth Curve (4 weeks)</div>
                      <div className="bg-[#F8FAFC] rounded-lg p-4 h-32 border border-[#E2E8F0] flex items-end pt-8">
                        <svg viewBox="0 0 200 100" className="w-full h-full overflow-visible">
                          <path d={`M 0,100 Q 50,${100 - growthRate*3} 100,${100 - growthRate*7} T 200,${Math.max(10, 100 - growthRate*12)}`} fill="none" stroke="#16A34A" strokeWidth="4" strokeLinecap="round" className="transition-all duration-500 ease-out" />
                          <circle cx="100" cy={100 - growthRate*7} r="5" fill="#16A34A" className="transition-all duration-500 ease-out" />
                          <circle cx="200" cy={Math.max(10, 100 - growthRate*12)} r="5" fill="#16A34A" className="transition-all duration-500 ease-out" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : isWaterQuality ? (
            <Card className="border border-blue-200 shadow-sm bg-gradient-to-br from-white to-blue-50/30">
              <CardHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Droplet className="h-5 w-5 text-blue-600" />
                  <CardTitle>{category.toolPreview.name}</CardTitle>
                </div>
                <CardDescription>{category.toolPreview.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs font-bold uppercase text-[#64748B]">pH Level</Label>
                        <span className="text-sm font-medium">{phLevel[0]}</span>
                      </div>
                      <Slider value={phLevel} onValueChange={setPhLevel} max={14} min={0} step={0.1} className="py-2"/>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs font-bold uppercase text-[#64748B]">Turbidity (NTU)</Label>
                        <span className="text-sm font-medium">{turbidity[0]}</span>
                      </div>
                      <Slider value={turbidity} onValueChange={setTurbidity} max={10} min={0} step={0.5} className="py-2"/>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs font-bold uppercase text-[#64748B]">Temperature (°C)</Label>
                        <span className="text-sm font-medium">{temp[0]}°</span>
                      </div>
                      <Slider value={temp} onValueChange={setTemp} max={40} min={0} step={1} className="py-2"/>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-sm flex flex-col justify-center items-center text-center">
                    <div className="text-sm font-semibold text-[#64748B] mb-2">Water Quality Score</div>
                    <div className={`text-5xl font-bold mb-4 ${waterScore > 80 ? 'text-green-600' : waterScore > 50 ? 'text-amber-500' : 'text-red-500'}`}>
                      {waterScore}
                    </div>
                    <div className="w-full bg-[#F8FAFC] rounded-lg p-4 h-32 border border-[#E2E8F0] flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 opacity-20" style={{ backgroundColor: waterScore > 80 ? '#16A34A' : waterScore > 50 ? '#F59E0B' : '#EF4444' }} />
                      <div className="relative z-10 text-sm font-medium">
                        {waterScore > 80 ? 'Excellent - Safe for aquatic life' : waterScore > 50 ? 'Fair - Marginal conditions' : 'Poor - Potentially harmful'}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : isPhysics ? (
            <Card className="border border-indigo-200 shadow-sm bg-gradient-to-br from-white to-indigo-50/30">
              <CardHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Atom className="h-5 w-5 text-indigo-600" />
                  <CardTitle>{category.toolPreview.name}</CardTitle>
                </div>
                <CardDescription>{category.toolPreview.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs font-bold uppercase text-[#64748B]">Distance (m)</Label>
                        <span className="text-sm font-medium">{distance[0]}</span>
                      </div>
                      <Slider value={distance} onValueChange={setDistance} max={100} min={1} step={1} className="py-2"/>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs font-bold uppercase text-[#64748B]">Time (s)</Label>
                        <span className="text-sm font-medium">{time[0]}</span>
                      </div>
                      <Slider value={time} onValueChange={setTime} max={20} min={1} step={1} className="py-2"/>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs font-bold uppercase text-[#64748B]">Mass (kg)</Label>
                        <span className="text-sm font-medium">{mass[0]}</span>
                      </div>
                      <Slider value={mass} onValueChange={setMass} max={50} min={1} step={1} className="py-2"/>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs font-bold uppercase text-[#64748B]">Force (N)</Label>
                        <span className="text-sm font-medium">{force[0]}</span>
                      </div>
                      <Slider value={force} onValueChange={setForce} max={200} min={0} step={5} className="py-2"/>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-indigo-200 shadow-sm flex flex-col justify-center gap-4">
                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="text-sm text-[#64748B]">Velocity (v)</span>
                      <span className="font-bold text-indigo-700">{physicsData.speed.toFixed(2)} m/s</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="text-sm text-[#64748B]">Acceleration (a)</span>
                      <span className="font-bold text-indigo-700">{physicsData.accel.toFixed(2)} m/s²</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="text-sm text-[#64748B]">Momentum (p)</span>
                      <span className="font-bold text-indigo-700">{physicsData.momentum.toFixed(2)} kg·m/s</span>
                    </div>
                    <div className="w-full bg-[#F8FAFC] rounded-lg h-24 border border-[#E2E8F0] relative overflow-hidden mt-4">
                      <div 
                        className="absolute h-4 w-4 bg-indigo-600 rounded-full top-1/2 -translate-y-1/2" 
                        style={{ 
                          animation: `slide ${time[0]}s linear infinite`,
                        }} 
                      />
                      <style>{`
                        @keyframes slide {
                          0% { left: 0%; }
                          100% { left: 100%; }
                        }
                      `}</style>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-slate-200 shadow-sm bg-gradient-to-br from-white to-slate-50/30">
              <CardHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="h-5 w-5 text-slate-600" />
                  <CardTitle>{category.toolPreview.name}</CardTitle>
                </div>
                <CardDescription>{category.toolPreview.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6 opacity-60">
                    <div className="space-y-3">
                      <Label className="text-xs font-bold uppercase text-[#64748B]">Variable 1</Label>
                      <Input disabled placeholder="Value..." />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-xs font-bold uppercase text-[#64748B]">Variable 2</Label>
                      <Input disabled placeholder="Value..." />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-xs font-bold uppercase text-[#64748B]">Condition</Label>
                      <Select disabled>
                        <SelectTrigger className="bg-white"><SelectValue placeholder="Select..." /></SelectTrigger>
                        <SelectContent></SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6">
                      <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                        <Beaker className="h-6 w-6 text-slate-500" />
                      </div>
                      <h3 className="font-semibold text-sm mb-1">Tool coming soon</h3>
                      <p className="text-xs text-[#64748B] mb-4">We are building interactive simulators for all disciplines.</p>
                      <Link href="/category/plant-science">
                        <Button variant="outline" size="sm" className="h-8 text-xs">Try Plant Science Tool</Button>
                      </Link>
                    </div>
                    
                    <div className="w-full space-y-4 opacity-30">
                      <div className="h-8 bg-slate-100 rounded-md w-full" />
                      <div className="h-8 bg-slate-100 rounded-md w-full" />
                      <div className="h-24 bg-slate-100 rounded-md w-full" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-8">
          <h3 className="text-xl font-bold tracking-tight">Starter Experiments</h3>
          <div className="space-y-4">
            {exps.map((exp, i) => (
              <Card key={i} className="border-[#E2E8F0] shadow-sm hover:border-blue-200 transition-colors group">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base group-hover:text-blue-700 transition-colors">{exp.title}</CardTitle>
                  <div className="flex items-center gap-3 text-xs text-[#64748B] mt-1">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {exp.estimatedTime}</span>
                    <span>•</span>
                    <span className="font-medium">{exp.difficulty}</span>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <p className="text-sm text-[#64748B] mb-4 line-clamp-2">{exp.materials.join(", ")}</p>
                  <Link href={`/experiments/${exp.id}`}>
                    <Button variant="outline" size="sm" className="w-full text-xs font-semibold">Start Experiment</Button>
                  </Link>
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
                <Progress value={33} className="h-1.5 bg-slate-700 [&>div]:bg-blue-400" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5 text-slate-300">
                  <span>Tools Used</span>
                  <span>0%</span>
                </div>
                <Progress value={0} className="h-1.5 bg-slate-700 [&>div]:bg-blue-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
