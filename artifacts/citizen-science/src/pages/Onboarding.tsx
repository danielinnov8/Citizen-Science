import React, { useState } from "react";
import { useLocation } from "wouter";
import { Atom, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { EXPERIMENTS } from "@/lib/experiments";

const Q1_OPTIONS = ["Plants and growing things", "Human performance and wellness", "Water and the environment", "Chemistry and materials", "Physics and motion", "Food/fermentation/nutrition", "Climate and ecology", "Space and sky observation"];
const Q2_OPTIONS = ["Beginner", "Curious hobbyist", "Student", "Teacher", "Advanced learner"];
const Q3_OPTIONS = ["Learn concepts", "Run safe home experiments", "Use simulations", "Track observations", "Build a science portfolio"];
const Q4_OPTIONS = ["5 minutes", "15 minutes", "30 minutes", "Multi-day observations"];

export function Onboarding() {
  const [, setLocation] = useLocation();
  const { completeOnboarding } = useAuth();
  
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<{
    interests: string[];
    experience: string;
    goals: string[];
    time: string;
  }>({
    interests: [],
    experience: "",
    goals: [],
    time: ""
  });

  const canProceed = () => {
    if (step === 1) return answers.interests.length > 0;
    if (step === 2) return !!answers.experience;
    if (step === 3) return answers.goals.length > 0;
    if (step === 4) return !!answers.time;
    return true;
  };

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem("cs_preferences", JSON.stringify(answers));
    completeOnboarding();
    setLocation("/dashboard");
  };

  const toggleInterest = (opt: string) => {
    setAnswers(prev => ({
      ...prev,
      interests: prev.interests.includes(opt) ? prev.interests.filter(i => i !== opt) : [...prev.interests, opt]
    }));
  };

  const toggleGoal = (opt: string) => {
    setAnswers(prev => ({
      ...prev,
      goals: prev.goals.includes(opt) ? prev.goals.filter(i => i !== opt) : [...prev.goals, opt]
    }));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center p-4 pt-12 lg:pt-24">
      <div className="flex items-center gap-2 font-semibold text-lg tracking-tight mb-12">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
          <Atom className="h-5 w-5" />
        </div>
        <span>Citizen Science</span>
      </div>

      <div className="w-full max-w-xl">
        <Progress value={(step / 5) * 100} className="h-1.5 mb-8" />

        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-serif mb-2 tracking-tight">What kind of science are you most interested in?</h2>
            <p className="text-[#64748B] mb-8">Select all that apply.</p>
            <div className="flex flex-wrap gap-3">
              {Q1_OPTIONS.map(opt => (
                <button
                  key={opt}
                  onClick={() => toggleInterest(opt)}
                  className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left ${
                    answers.interests.includes(opt)
                      ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                      : "border-[#E2E8F0] bg-white hover:border-blue-300 hover:bg-[#F8FAFC]"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-serif mb-2 tracking-tight">What is your experience level?</h2>
            <p className="text-[#64748B] mb-8">This helps us recommend the right difficulty.</p>
            <div className="grid gap-3">
              {Q2_OPTIONS.map(opt => (
                <button
                  key={opt}
                  onClick={() => setAnswers(prev => ({ ...prev, experience: opt }))}
                  className={`px-4 py-4 rounded-xl border text-base font-medium transition-all text-left ${
                    answers.experience === opt
                      ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                      : "border-[#E2E8F0] bg-white hover:border-blue-300 hover:bg-[#F8FAFC]"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-serif mb-2 tracking-tight">What do you want to do?</h2>
            <p className="text-[#64748B] mb-8">Select all that apply.</p>
            <div className="grid gap-3">
              {Q3_OPTIONS.map(opt => (
                <button
                  key={opt}
                  onClick={() => toggleGoal(opt)}
                  className={`px-4 py-4 rounded-xl border text-base font-medium transition-all flex items-center justify-between ${
                    answers.goals.includes(opt)
                      ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                      : "border-[#E2E8F0] bg-white hover:border-blue-300 hover:bg-[#F8FAFC]"
                  }`}
                >
                  <span>{opt}</span>
                  {answers.goals.includes(opt) && <Check className="h-5 w-5" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-serif mb-2 tracking-tight">How much time per experiment?</h2>
            <p className="text-[#64748B] mb-8">We'll filter recommendations based on this.</p>
            <div className="grid gap-3">
              {Q4_OPTIONS.map(opt => (
                <button
                  key={opt}
                  onClick={() => setAnswers(prev => ({ ...prev, time: opt }))}
                  className={`px-4 py-4 rounded-xl border text-base font-medium transition-all text-left ${
                    answers.time === opt
                      ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                      : "border-[#E2E8F0] bg-white hover:border-blue-300 hover:bg-[#F8FAFC]"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="animate-in fade-in zoom-in-95 duration-700 text-center">
            <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-serif mb-4 tracking-tight">Your lab is ready</h2>
            <p className="text-[#64748B] mb-8">Based on your interests, we've prepared a few starter experiments for you.</p>
            
            <div className="space-y-3 mb-10 text-left">
              {EXPERIMENTS.slice(0, 3).map((exp, i) => (
                <Card key={i} className="p-4 shadow-sm border-[#E2E8F0]">
                  <h4 className="font-medium text-sm mb-1">{exp.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-[#64748B]">
                    <span className="font-medium">{exp.categoryId.replace("-", " ")}</span>
                    <Badge variant="outline" className="text-[9px] h-4 px-1.5 font-semibold bg-[#F8FAFC]">{exp.difficulty}</Badge>
                  </div>
                </Card>
              ))}
            </div>

            <Button size="lg" className="w-full bg-blue-600 rounded-full h-12" onClick={handleComplete}>
              Enter Dashboard <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {step < 5 && (
          <div className="mt-12 flex justify-end border-t border-[#E2E8F0] pt-6">
            <Button size="lg" disabled={!canProceed()} onClick={handleNext} className="rounded-full px-8">
              Continue
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
