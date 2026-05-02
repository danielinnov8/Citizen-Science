import React from "react";
import { Atom, Beaker, Leaf, Droplet, FlaskConical, HeartPulse, Microscope, UtensilsCrossed, Sprout, Brain, CloudSun, Telescope, Layers, Globe2, ArrowRight, Check, Sparkles, Activity, BookOpen, PenTool, BookMarked, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const CATEGORIES = [
  { icon: Microscope, name: "Biology", desc: "Study of living organisms", diff: "Beginner", exp: "Extract strawberry DNA" },
  { icon: Leaf, name: "Plant Science", desc: "Botany and plant physiology", diff: "Beginner", exp: "Light vs. shade growth" },
  { icon: Globe2, name: "Environmental Science", desc: "Ecosystems and sustainability", diff: "Intermediate", exp: "Local air particulate monitoring" },
  { icon: Droplet, name: "Water Quality", desc: "Hydrology and purification", diff: "Beginner", exp: "Tap vs. filtered water pH" },
  { icon: FlaskConical, name: "Chemistry", desc: "Matter and interactions", diff: "Advanced", exp: "Electrolysis of water" },
  { icon: Atom, name: "Physics", desc: "Matter, energy and force", diff: "Intermediate", exp: "Pendulum period calculation" },
  { icon: HeartPulse, name: "Human Health", desc: "Wellness and physiology", diff: "Beginner", exp: "Sleep vs. screen exposure" },
  { icon: Beaker, name: "Microbiology", desc: "Microscopic organisms", diff: "Advanced", exp: "Culturing yeast populations" },
  { icon: UtensilsCrossed, name: "Food Science", desc: "Culinary chemistry", diff: "Intermediate", exp: "Fermentation rates in bread" },
  { icon: Sprout, name: "Agriculture", desc: "Farming and cultivation", diff: "Beginner", exp: "Soil moisture retention" },
  { icon: Brain, name: "Neuroscience", desc: "Nervous system and brain", diff: "Intermediate", exp: "Reaction time mapping" },
  { icon: CloudSun, name: "Climate Science", desc: "Weather and climate", diff: "Beginner", exp: "Temperature tracking over time" },
  { icon: Telescope, name: "Astronomy", desc: "Stars and universe", diff: "Beginner", exp: "Moon phase observation" },
  { icon: Layers, name: "Materials Science", desc: "Properties of matter", diff: "Intermediate", exp: "Tensile strength testing" },
];

const TOOLS = [
  { icon: Sprout, name: "Plant Growth Planner", desc: "Simulate and track plant development." },
  { icon: Droplet, name: "Water Quality Tracker", desc: "Log pH and clarity measurements." },
  { icon: FlaskConical, name: "pH Experiment Planner", desc: "Structure your acidity tests." },
  { icon: HeartPulse, name: "Sleep & Wellness Logger", desc: "Correlate habits with rest." },
  { icon: Leaf, name: "Soil Health Calculator", desc: "Estimate nutrient density." },
  { icon: Microscope, name: "Microbial Growth Simulator", desc: "Model population expansion." },
  { icon: Brain, name: "Reaction Time Tester", desc: "Measure cognitive reflexes." },
  { icon: Globe2, name: "Carbon Footprint Estimator", desc: "Calculate daily emissions." },
  { icon: CloudSun, name: "Sky Observation Journal", desc: "Record meteorological data." },
  { icon: PenTool, name: "DIY Lab Notebook", desc: "Free-form experiment logging." },
];

export function Landing() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans selection:bg-blue-100 selection:text-blue-900">
      <header className="sticky top-0 z-50 w-full border-b border-[#E2E8F0] bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-2 font-semibold text-lg tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
              <Atom className="h-5 w-5" />
            </div>
            <span>Citizen Science</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#64748B]">
            <a href="#" className="transition-colors hover:text-[#0F172A]">Categories</a>
            <a href="#" className="transition-colors hover:text-[#0F172A]">Tools</a>
            <a href="#" className="transition-colors hover:text-[#0F172A]">Safety</a>
            <a href="#" className="transition-colors hover:text-[#0F172A]">Sign in</a>
          </nav>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6">
            Start Exploring
          </Button>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-24 pb-32 lg:pt-32 lg:pb-40">
          {/* Background Gradients */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-30 pointer-events-none blur-[100px]">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply animate-pulse" />
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply animate-pulse delay-1000" />
            <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-violet-400 rounded-full mix-blend-multiply animate-pulse delay-700" />
          </div>

          <div className="container mx-auto max-w-7xl px-4 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
              <div className="max-w-2xl">
                <Badge variant="outline" className="rounded-full bg-blue-50/50 text-blue-700 border-blue-200 mb-6 px-3 py-1 text-xs font-medium">
                  <Sparkles className="h-3 w-3 mr-1 inline" /> Premium Science Learning Platform
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-[#0F172A] leading-[1.1] mb-6">
                  Run Your Own Experiments. <br className="hidden lg:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">
                    Learn Science by Doing.
                  </span>
                </h1>
                <p className="text-lg text-[#64748B] mb-8 leading-relaxed">
                  Citizen Science helps curious people explore biology, ecology, health, chemistry, physics, agriculture, environmental science, and more through guided tutorials, interactive simulations, and personal experiment tracking.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full text-base h-12 px-8">
                    Start Exploring <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline" className="rounded-full text-base h-12 px-8 border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#0F172A]">
                    View Experiment Categories
                  </Button>
                </div>
              </div>

              {/* DASHBOARD MOCKUP */}
              <div className="relative mx-auto w-full max-w-[540px]">
                <div className="relative rounded-2xl border border-[#E2E8F0] bg-white shadow-2xl shadow-blue-900/5 overflow-hidden">
                  <div className="h-10 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center px-4 gap-2">
                    <div className="flex gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-red-400" />
                      <div className="h-3 w-3 rounded-full bg-amber-400" />
                      <div className="h-3 w-3 rounded-full bg-green-400" />
                    </div>
                  </div>
                  <div className="p-6 bg-[#FAFAF9]">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="font-semibold text-sm">Continue learning</h3>
                        <p className="text-xs text-[#64748B]">Plant Science</p>
                      </div>
                      <div className="h-10 w-10 rounded-full border-4 border-blue-100 border-t-blue-600 flex items-center justify-center text-xs font-bold text-blue-700">
                        62%
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
                        <div className="text-xs text-[#64748B] mb-1">Days Active</div>
                        <div className="text-xl font-bold">14</div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
                        <div className="text-xs text-[#64748B] mb-1">Observations</div>
                        <div className="text-xl font-bold">8</div>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm mb-6">
                      <div className="text-xs font-semibold mb-3">Growth Curve (cm)</div>
                      <svg viewBox="0 0 200 60" className="w-full h-12 overflow-visible">
                        <path d="M0,50 Q40,45 80,30 T160,10 T200,5" fill="none" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" className="drop-shadow-sm" />
                        <circle cx="80" cy="30" r="4" fill="#2563EB" />
                        <circle cx="160" cy="10" r="4" fill="#2563EB" />
                      </svg>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100">Light</Badge>
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">Water</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PROBLEM SECTION */}
        <section className="py-24 bg-white border-y border-[#E2E8F0]">
          <div className="container mx-auto max-w-5xl px-4 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-12">Science Shouldn't Stay Locked in Labs.</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
              {[
                { title: "Passive Education", desc: "Reading about science isn't the same as doing it." },
                { title: "Inaccessible Tools", desc: "Real labs are expensive and hard to access." },
                { title: "Fragmented Data", desc: "Notes scattered across paper and digital apps." },
                { title: "Hard to Structure", desc: "Beginners struggle to plan safe, valid experiments." }
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <div className="h-10 w-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4 font-bold">
                    0{i + 1}
                  </div>
                  <h4 className="font-semibold mb-2">{item.title}</h4>
                  <p className="text-sm text-[#64748B] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SOLUTION / WORKFLOW */}
        <section className="py-32 bg-[#F8FAFC]">
          <div className="container mx-auto max-w-7xl px-4 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4">A Guided Science Lab for Everyone.</h2>
              <p className="text-[#64748B]">Follow a proven scientific method designed for home exploration.</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              {[
                { icon: BookOpen, label: "Learn concept" },
                { icon: Activity, label: "Run simulation" },
                { icon: PenTool, label: "Plan experiment" },
                { icon: BookMarked, label: "Track observations" },
                { icon: Save, label: "Save results" },
                { icon: Layers, label: "Build portfolio" }
              ].map((step, i) => (
                <div key={i} className="relative flex flex-col items-center p-6 text-center">
                  <div className="h-16 w-16 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm flex items-center justify-center text-blue-600 mb-4 z-10">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <div className="text-sm font-medium">{step.label}</div>
                  {i < 5 && <div className="hidden lg:block absolute top-14 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-blue-200 to-transparent" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CATEGORY GRID */}
        <section className="py-32 bg-white">
          <div className="container mx-auto max-w-7xl px-4 lg:px-8">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-bold mb-4">Explore Fields of Science</h2>
                <p className="text-[#64748B]">Choose a discipline to start your journey.</p>
              </div>
              <Button variant="ghost" className="hidden sm:flex text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                View all fields <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {CATEGORIES.map((cat, i) => (
                <Card key={i} className="border-[#E2E8F0] shadow-none hover:shadow-md transition-shadow group cursor-pointer">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <cat.icon className="h-5 w-5" />
                      </div>
                      <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-wider
                        ${cat.diff === 'Beginner' ? 'text-green-600 bg-green-50 border-green-200' : ''}
                        ${cat.diff === 'Intermediate' ? 'text-amber-600 bg-amber-50 border-amber-200' : ''}
                        ${cat.diff === 'Advanced' ? 'text-purple-600 bg-purple-50 border-purple-200' : ''}
                      `}>
                        {cat.diff}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{cat.name}</CardTitle>
                    <CardDescription className="text-xs">{cat.desc}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4 pt-0">
                    <div className="text-xs text-[#64748B] flex items-center gap-2 bg-[#F8FAFC] p-2 rounded-md">
                      <FlaskConical className="h-3 w-3" />
                      <span className="truncate">{cat.exp}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-32 bg-[#F8FAFC] border-y border-[#E2E8F0]">
          <div className="container mx-auto max-w-5xl px-4 lg:px-8">
            <h2 className="text-3xl font-bold mb-16 text-center">How It Works</h2>
            <div className="space-y-12">
              {[
                { num: "01", title: "Choose a field", desc: "Select from dozens of scientific disciplines, from botany to physics. We provide the foundational knowledge." },
                { num: "02", title: "Learn the basics", desc: "Read guided tutorials that explain core concepts, terminology, and standard measurement techniques." },
                { num: "03", title: "Use a simulator", desc: "Test hypotheses virtually before trying them in the real world. Adjust variables and see instant results." },
                { num: "04", title: "Track your results", desc: "Set up a physical experiment and use your digital notebook to log daily observations, photos, and data points." },
              ].map((step, i) => (
                <div key={i} className="flex flex-col sm:flex-row gap-6 sm:gap-12 items-start">
                  <div className="text-5xl font-light text-blue-200">{step.num}</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-[#64748B] leading-relaxed max-w-2xl">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURED TOOLS */}
        <section className="py-32 bg-white">
          <div className="container mx-auto max-w-7xl px-4 lg:px-8">
            <h2 className="text-3xl font-bold mb-12 text-center">Featured Interactive Tools</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {TOOLS.map((tool, i) => (
                <div key={i} className="p-5 rounded-xl border border-[#E2E8F0] hover:border-blue-200 hover:bg-blue-50/50 transition-colors group cursor-pointer">
                  <tool.icon className="h-6 w-6 text-[#64748B] group-hover:text-blue-600 mb-4" />
                  <h4 className="font-medium text-sm mb-2 leading-tight">{tool.name}</h4>
                  <p className="text-xs text-[#64748B] line-clamp-2 mb-4">{tool.desc}</p>
                  <div className="text-xs font-semibold text-blue-600 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    Open tool <ArrowRight className="ml-1 h-3 w-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SAFETY */}
        <section className="py-24 bg-[#F8FAFC]">
          <div className="container mx-auto max-w-4xl px-4 lg:px-8">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 lg:p-12 text-center shadow-sm">
              <div className="h-12 w-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-amber-900">Safety First</h3>
              <p className="text-amber-800 leading-relaxed max-w-2xl mx-auto">
                Citizen Science is designed for education, simulation, observation, and safe at-home experimentation. We do not encourage hazardous, medical, biological, or chemical procedures without proper training, supervision, and safety standards.
              </p>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-32 bg-white text-center">
          <div className="container mx-auto max-w-3xl px-4 lg:px-8">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">Start Building Your Personal Science Lab.</h2>
            <p className="text-[#64748B] text-lg mb-10">Join thousands of curious minds exploring the world around them.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 h-12">
                Create Free Account
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8 h-12 border-[#E2E8F0]">
                Explore Categories
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#0F172A] text-[#64748B] py-12">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-semibold text-white">
            <Atom className="h-5 w-5" />
            <span>Citizen Science</span>
          </div>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-white transition-colors">Categories</a>
            <a href="#" className="hover:text-white transition-colors">Tools</a>
            <a href="#" className="hover:text-white transition-colors">Safety</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
          <div className="text-sm">
            &copy; {new Date().getFullYear()} Citizen Science.
          </div>
        </div>
      </footer>
    </div>
  );
}