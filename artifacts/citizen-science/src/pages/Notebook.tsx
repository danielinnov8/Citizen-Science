import React, { useState } from "react";
import { format } from "date-fns";
import { BookA, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { storage } from "@/lib/storage";
import { EXPERIMENTS } from "@/lib/experiments";
import { CATEGORIES } from "@/lib/categories";

export function Notebook() {
  const [entries, setEntries] = useState(storage.getNotebookEntries());
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const [newObs, setNewObs] = useState("");
  const [newExpId, setNewExpId] = useState("");

  const filtered = entries.filter(e => e.observation.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = () => {
    if (!newObs.trim() || !newExpId) return;
    const exp = EXPERIMENTS.find(e => e.id === newExpId);
    
    storage.addNotebookEntry({
      experimentId: newExpId,
      date: new Date().toISOString(),
      observation: newObs,
      categorySlug: exp?.categoryId
    });
    
    setEntries(storage.getNotebookEntries());
    setOpen(false);
    setNewObs("");
    setNewExpId("");
    toast({ title: "Entry saved" });
  };

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto w-full animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-serif tracking-tight mb-2">Lab Notebook</h1>
          <p className="text-[#64748B]">All your observations and data points in one place.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="mr-2 h-4 w-4" /> New Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Observation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Experiment</Label>
                <Select value={newExpId} onValueChange={setNewExpId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select experiment" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPERIMENTS.map(e => (
                      <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Observation</Label>
                <Textarea 
                  placeholder="Record your findings..."
                  className="min-h-[150px]"
                  value={newObs}
                  onChange={e => setNewObs(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd} disabled={!newObs.trim() || !newExpId}>Save Entry</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {entries.length > 0 && (
        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
          <Input 
            placeholder="Search notes..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
      )}

      {entries.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] border-dashed rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-200 mb-6">
            <BookA className="h-10 w-10" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Your notebook is empty</h3>
          <p className="text-[#64748B] max-w-sm mb-6">Start an experiment and log your first observation to see it here.</p>
          <Button variant="outline" onClick={() => setOpen(true)}>Create Manual Entry</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((entry) => {
            const exp = EXPERIMENTS.find(e => e.id === entry.experimentId);
            const cat = CATEGORIES.find(c => c.slug === entry.categorySlug);
            return (
              <div key={entry.id} className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6">
                <div className="w-40 flex-shrink-0 flex flex-col gap-2">
                  <div className="text-sm font-semibold">{format(new Date(entry.date), "MMM d, yyyy")}</div>
                  <div className="text-xs text-[#64748B]">{format(new Date(entry.date), "h:mm a")}</div>
                  {cat && <Badge variant="outline" className="w-fit text-[10px] mt-2">{cat.name}</Badge>}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-blue-700 mb-2">{exp?.title || "Custom Entry"}</div>
                  <p className="text-[#0F172A] leading-relaxed">{entry.observation}</p>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-[#64748B]">No entries found matching "{search}".</div>
          )}
        </div>
      )}
    </div>
  );
}
