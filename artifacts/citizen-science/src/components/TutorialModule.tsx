import React, { useState } from "react";
import { CheckCircle2, Clock, BookOpen, Lightbulb, AlertTriangle, Info, ListChecks } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { storage } from "@/lib/storage";
import type { ModuleTutorial, TutorialBlock } from "@/lib/tutorials";

function BlockRenderer({ block }: { block: TutorialBlock }) {
  switch (block.kind) {
    case "text":
      return <p className="text-[#475569] leading-relaxed">{block.text}</p>;
    case "list":
      return (
        <ul className="space-y-2">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[#475569] leading-relaxed">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "steps":
      return (
        <ol className="space-y-3">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-[#475569] leading-relaxed">
              <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <span className="pt-0.5">{item}</span>
            </li>
          ))}
        </ol>
      );
    case "terms":
      return (
        <dl className="space-y-3">
          {block.items.map((t, i) => (
            <div key={i} className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
              <dt className="font-semibold text-[#0F172A] text-sm mb-0.5">{t.term}</dt>
              <dd className="text-[#475569] text-sm leading-relaxed">{t.definition}</dd>
            </div>
          ))}
        </dl>
      );
    case "callout": {
      const tone = block.tone;
      const styles =
        tone === "warning"
          ? { wrap: "bg-amber-50 border-amber-200", icon: "text-amber-600", title: "text-amber-900", body: "text-amber-800", Icon: AlertTriangle }
          : tone === "tip"
            ? { wrap: "bg-emerald-50 border-emerald-200", icon: "text-emerald-600", title: "text-emerald-900", body: "text-emerald-800", Icon: Lightbulb }
            : { wrap: "bg-blue-50 border-blue-200", icon: "text-blue-600", title: "text-blue-900", body: "text-blue-800", Icon: Info };
      const Icon = styles.Icon;
      return (
        <div className={`rounded-xl border p-4 flex gap-3 ${styles.wrap}`}>
          <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${styles.icon}`} />
          <div>
            {block.title && <div className={`font-semibold text-sm mb-0.5 ${styles.title}`}>{block.title}</div>}
            <div className={`text-sm leading-relaxed ${styles.body}`}>{block.text}</div>
          </div>
        </div>
      );
    }
    default:
      return null;
  }
}

export function TutorialModule({ tutorial }: { tutorial: ModuleTutorial }) {
  const total = tutorial.sections.length;
  const [completed, setCompleted] = useState<number[]>(() =>
    storage.getTutorialSections(tutorial.slug).filter(i => i < total),
  );
  const [openItem, setOpenItem] = useState<string>("section-0");

  const doneCount = completed.length;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  const toggleComplete = (index: number) => {
    setCompleted(prev => {
      const next = prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index];
      storage.setTutorialSections(tutorial.slug, next);
      return next;
    });
  };

  const advance = (index: number) => {
    if (index + 1 < total) setOpenItem(`section-${index + 1}`);
  };

  return (
    <Card className="border-[#E2E8F0] shadow-sm overflow-hidden">
      <CardHeader className="bg-[#FAFAF9] border-b border-[#E2E8F0] pb-6">
        <div className="flex justify-between items-center mb-2">
          <Badge variant="outline" className="bg-white font-semibold">Tutorial</Badge>
          <div className="flex items-center gap-3 text-xs font-semibold text-[#64748B]">
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{tutorial.readingTime}</span>
            <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />{total} sections</span>
          </div>
        </div>
        <CardTitle className="text-2xl">{tutorial.title}</CardTitle>
        <CardDescription>{tutorial.subtitle}</CardDescription>
        <div className="flex items-center gap-3 mt-4">
          <Progress value={pct} className="h-1.5 flex-1" />
          <span className="text-xs font-semibold text-[#64748B] whitespace-nowrap">{doneCount}/{total} read</span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Accordion type="single" collapsible value={openItem} onValueChange={setOpenItem}>
          {tutorial.sections.map((section, i) => {
            const isDone = completed.includes(i);
            return (
              <AccordionItem key={i} value={`section-${i}`} className="border-[#E2E8F0] last:border-b-0">
                <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-[#F8FAFC] [&[data-state=open]]:bg-blue-50/40">
                  <div className="flex items-center gap-3 flex-1 min-w-0 pr-3">
                    {isDone ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-[#CBD5E1] flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-[#94A3B8]">
                        {i + 1}
                      </div>
                    )}
                    <div className="text-left min-w-0">
                      <div className="font-semibold text-[#0F172A] truncate">{section.title}</div>
                      <div className="text-xs text-[#94A3B8] font-normal truncate hidden sm:block">{section.summary}</div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-6 pt-1">
                  <div className="pl-8 space-y-4">
                    {section.body.map((block, bi) => (
                      <BlockRenderer key={bi} block={block} />
                    ))}
                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        variant={isDone ? "outline" : "ink"}
                        size="sm"
                        onClick={() => {
                          toggleComplete(i);
                          if (!isDone) advance(i);
                        }}
                      >
                        {isDone ? (
                          <><CheckCircle2 className="h-4 w-4 mr-1.5" />Completed</>
                        ) : (
                          <><ListChecks className="h-4 w-4 mr-1.5" />Mark as read</>
                        )}
                      </Button>
                      {!isDone && i + 1 < total && (
                        <button
                          onClick={() => advance(i)}
                          className="text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                          Skip to next →
                        </button>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}
