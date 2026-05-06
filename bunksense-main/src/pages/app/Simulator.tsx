import { useMemo, useState } from "react";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { useSubjects } from "@/hooks/useSubjects";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { simulate, percent, safeBunks, recoveryNeeded, status } from "@/lib/attendance";
import { StatusBadge } from "@/components/StatusBadge";
import { ArrowRight } from "lucide-react";

const Simulator = () => {
  const { data: subjects = [] } = useSubjects();
  const [sid, setSid] = useState<string>("");
  const [miss, setMiss] = useState(0);
  const [attend, setAttend] = useState(0);

  const subj = useMemo(() => subjects.find((s) => s.id === sid) ?? subjects[0], [subjects, sid]);

  const before = subj && {
    attended: subj.attended_classes,
    total: subj.total_classes,
    required: Number(subj.required_percentage),
  };
  const after = before && simulate(before, miss, attend);

  return (
    <ProtectedLayout>
      <div className="mb-6">
        <h1 className="font-display text-4xl">Simulator</h1>
        <p className="text-sm text-muted-foreground mt-1">Try "what-if" scenarios before you skip.</p>
      </div>

      {subjects.length === 0 ? (
        <div className="bs-card p-12 text-center">
          <div className="font-display text-2xl mb-2">No subjects yet</div>
          <p className="text-sm text-muted-foreground">Add a subject first to use the simulator.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bs-card p-6 space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Subject</label>
              <Select value={subj?.id} onValueChange={setSid}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.subject_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Miss next classes</label>
                <span className="font-display text-2xl text-danger">{miss}</span>
              </div>
              <Slider value={[miss]} max={20} step={1} onValueChange={(v) => setMiss(v[0])} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Attend next classes</label>
                <span className="font-display text-2xl text-success">{attend}</span>
              </div>
              <Slider value={[attend]} max={30} step={1} onValueChange={(v) => setAttend(v[0])} />
            </div>

            <Button variant="outline" onClick={() => { setMiss(0); setAttend(0); }}>Reset</Button>
          </div>

          {before && after && (
            <div className="bs-card p-6">
              <div className="grid grid-cols-2 gap-4 items-stretch">
                <div className="rounded-lg border border-border p-5">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Now</div>
                  <div className="font-display text-4xl mt-2">{percent(before.attended, before.total).toFixed(1)}<span className="text-xl text-muted-foreground">%</span></div>
                  <div className="text-xs text-muted-foreground mt-1">{before.attended}/{before.total}</div>
                  <div className="mt-3"><StatusBadge status={status(before)} /></div>
                </div>
                <div className="rounded-lg border border-primary/40 bg-primary-muted/20 p-5 relative">
                  <ArrowRight className="absolute -left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-primary bg-card rounded-full p-0.5 border border-border hidden md:block" />
                  <div className="text-xs uppercase tracking-wider text-primary">After</div>
                  <div className="font-display text-4xl mt-2">{percent(after.attended, after.total).toFixed(1)}<span className="text-xl text-muted-foreground">%</span></div>
                  <div className="text-xs text-muted-foreground mt-1">{after.attended}/{after.total}</div>
                  <div className="mt-3"><StatusBadge status={status(after)} /></div>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 text-center">
                <div className="rounded-lg border border-border p-3">
                  <div className="text-xs text-muted-foreground">Safe bunks after</div>
                  <div className="font-semibold text-lg text-success">{Number.isFinite(safeBunks(after)) ? safeBunks(after) : "∞"}</div>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <div className="text-xs text-muted-foreground">To recover after</div>
                  <div className="font-semibold text-lg text-danger">{Number.isFinite(recoveryNeeded(after)) ? recoveryNeeded(after) : "—"}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </ProtectedLayout>
  );
};

export default Simulator;
