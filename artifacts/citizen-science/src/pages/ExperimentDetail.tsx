import React, { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { ChevronRight, Clock, CheckCircle2, Circle, AlertTriangle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { EXPERIMENTS } from "@/lib/experiments";
import { storage } from "@/lib/storage";

export function ExperimentDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const exp = EXPERIMENTS.find(e => e.id === id);

  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [obsText, setObsText] = useState("");

  useEffect(() => {
    if (exp) {
      storage.startExperiment(exp.id);
      const steps = storage.getCompletedSteps().filter(s => s.experimentId === exp.id).map(s => s.stepIndex);
      setCompletedSteps(steps);
    }
  }, [exp]);

  if (!exp) return <div className="p-10">Experiment not found</div>;

  const toggleStep = (index: number) => {
    const isDone = completedSteps.includes(index);
    if (!isDone) {
      storage.markStepComplete(exp.id, index);
      setCompletedSteps(prev => [...prev, index]);
      const newProgress = Math.round(((completedSteps.length + 1) / exp.steps.length) * 100);
      storage.updateExperimentProgress(exp.id, newProgress);
    }
  };

  const saveObservation = () => {
    if (!obsText.trim()) return;
    storage.addNotebookEntry({
      experimentId: exp.id,
      date: new Date().toISOString(),
      observation: obsText,
      categorySlug: exp.categoryId
    });
    setObsText("");
    toast({
      title: "Observation saved",
      description: "Added to your personal notebook."
    });
  };

  const progress = Math.round((completedSteps.length / exp.steps.length) * 100);

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto w-full animate-in fade-in duration-500 pb-32">
      <div className="flex items-center text-sm font-medium text-[#64748B] mb-8">
        <Link href="/experiments" className="hover:text-[#0F172A]">Experiments</Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-[#0F172A]">{exp.title}</span>
      </div>

      <div className="bg-white rounded-2xl p-8 border border-[#E2E8F0] shadow-sm mb-8">
        <div className="flex items-center gap-3 mb-4 text-xs font-bold uppercase tracking-wider text-[#64748B]">
          <span>{exp.categoryId.replace("-", " ")}</span>
          <span>•</span>
          <span className="text-blue-600">{exp.difficulty}</span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-serif tracking-tight mb-6">{exp.title}</h1>
        
        <div className="flex items-center gap-6 mb-8 text-sm">
          <div className="flex items-center gap-2 text-[#64748B]">
            <Clock className="h-4 w-4" />
            <span>Est. time: {exp.estimatedTime}</span>
          </div>
          <div className="flex-1 max-w-xs flex items-center gap-4">
            <Progress value={progress} className="h-2 flex-1" />
            <span className="font-semibold text-blue-700 w-10 text-right">{progress}%</span>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800 text-sm mb-8">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <div>Read all steps before beginning. Ensure you have adult supervision if required. Clean your workspace after.</div>
        </div>

        <div className="mb-8">
          <h3 className="font-semibold mb-3">Materials Needed</h3>
          <ul className="list-disc pl-5 text-[#64748B] space-y-1">
            {exp.materials.map((mat, i) => (
              <li key={i}>{mat}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="space-y-4 mb-12">
        <h2 className="text-2xl font-serif tracking-tight mb-6">Procedure</h2>
        {exp.steps.map((step, i) => {
          const isDone = completedSteps.includes(i);
          return (
            <div 
              key={i} 
              onClick={() => toggleStep(i)}
              className={`flex gap-4 p-5 rounded-xl border transition-colors cursor-pointer ${
                isDone ? 'bg-green-50/50 border-green-200' : 'bg-white border-[#E2E8F0] hover:border-blue-300'
              }`}
            >
              <div className="mt-0.5">
                {isDone ? <CheckCircle2 className="h-6 w-6 text-green-500" /> : <Circle className="h-6 w-6 text-[#cbd5e1]" />}
              </div>
              <div>
                <div className="text-sm font-semibold text-[#64748B] mb-1">Step {i + 1}</div>
                <p className={`text-base ${isDone ? 'text-green-900' : 'text-[#0F172A]'}`}>{step.text}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-6 lg:p-8">
        <h3 className="text-xl font-semibold mb-2">Log Observation</h3>
        <p className="text-sm text-[#64748B] mb-6">Record what you see, measure, or notice. This will be saved to your notebook.</p>
        <Textarea 
          placeholder="What happened? Did the color change? Did the plant grow?"
          className="min-h-[120px] bg-white mb-4"
          value={obsText}
          onChange={e => setObsText(e.target.value)}
        />
        <div className="flex justify-end">
          <Button onClick={saveObservation} disabled={!obsText.trim()} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Save className="mr-2 h-4 w-4" /> Save to Notebook
          </Button>
        </div>
      </div>
    </div>
  );
}
