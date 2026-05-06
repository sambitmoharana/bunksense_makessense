import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, ArrowRight, Lightbulb, TrendingUp, AlertTriangle, BookOpen, ShieldCheck } from "lucide-react";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { Button } from "@/components/ui/button";
import { useSubjects } from "@/hooks/useSubjects";
import { percent, safeBunks, recoveryNeeded, status } from "@/lib/attendance";
import { StatusBadge } from "@/components/StatusBadge";
import { SubjectDialog } from "@/components/SubjectDialog";
import { useAuth } from "@/hooks/useAuth";

const StatCard = ({ icon: Icon, label, value, hint, tone = "default" }: any) => (
  <div className="bs-card p-5">
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className={
        tone === "danger" ? "h-8 w-8 rounded-lg grid place-items-center bg-danger-muted text-danger" :
        tone === "success" ? "h-8 w-8 rounded-lg grid place-items-center bg-success-muted text-success" :
        tone === "warning" ? "h-8 w-8 rounded-lg grid place-items-center bg-warning-muted text-warning-foreground" :
        "h-8 w-8 rounded-lg grid place-items-center bg-accent text-accent-foreground"
      }>
        <Icon className="h-4 w-4" />
      </div>
    </div>
    <div className={`font-display text-3xl ${tone === "warning" ? "text-danger" : ""}`}>{value}</div>
    {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
  </div>
);

const Dashboard = () => {
  const { data: subjects = [], isLoading } = useSubjects();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const summary = useMemo(() => {
    const totalC = subjects.reduce((a, s) => a + s.total_classes, 0);
    const attC = subjects.reduce((a, s) => a + s.attended_classes, 0);
    const overall = percent(attC, totalC);
    const stats = subjects.map((s) => ({
      s,
      st: status({ attended: s.attended_classes, total: s.total_classes, required: Number(s.required_percentage) }),
      bunks: safeBunks({ attended: s.attended_classes, total: s.total_classes, required: Number(s.required_percentage) }),
      need: recoveryNeeded({ attended: s.attended_classes, total: s.total_classes, required: Number(s.required_percentage) }),
    }));
    const risky = stats.filter((x) => x.st === "shortage").length;
    const safeBunksTotal = stats.reduce((a, x) => a + (Number.isFinite(x.bunks) ? x.bunks : 0), 0);
    const recoveryTotal = stats.reduce((a, x) => a + (Number.isFinite(x.need) ? x.need : 0), 0);
    return { overall, totalSubjects: subjects.length, risky, safeBunksTotal, recoveryTotal, stats };
  }, [subjects]);

  const suggestions = useMemo(() => {
    const out: { tone: "good" | "bad" | "info"; text: string }[] = [];
    if (subjects.length === 0) return out;
    const safest = [...summary.stats].filter((x) => Number.isFinite(x.bunks)).sort((a, b) => b.bunks - a.bunks)[0];
    const worst = [...summary.stats].sort((a, b) => percent(a.s.attended_classes, a.s.total_classes) - percent(b.s.attended_classes, b.s.total_classes))[0];
    const needsRecovery = summary.stats.filter((x) => x.need > 0).sort((a, b) => b.need - a.need)[0];
    if (safest && safest.bunks > 0) out.push({ tone: "good", text: `You can safely miss ${safest.bunks} ${safest.s.subject_name} class${safest.bunks > 1 ? "es" : ""}.` });
    if (needsRecovery) out.push({ tone: "bad", text: `${needsRecovery.s.subject_name} needs ${needsRecovery.need} consecutive class${needsRecovery.need > 1 ? "es" : ""} to recover.` });
    if (worst) out.push({ tone: "info", text: `Most risky subject: ${worst.s.subject_name} (${percent(worst.s.attended_classes, worst.s.total_classes).toFixed(1)}%).` });
    if (safest && safest.bunks > 0) out.push({ tone: "info", text: `Best subject to skip today: ${safest.s.subject_name}.` });
    return out;
  }, [summary, subjects]);

  return (
    <ProtectedLayout>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-sm text-muted-foreground font-bold">Hi {user?.user_metadata?.display_name ?? user?.email?.split("@")[0]} 👋</p>
          <h1 className="font-display text-4xl mt-1">Your attendance, at a glance.</h1>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Add subject</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
        <StatCard icon={TrendingUp} label="Overall" value={`${summary.overall.toFixed(1)}%`} hint="Across all subjects" />
        <StatCard icon={BookOpen} label="Subjects" value={summary.totalSubjects} hint="Tracked" />
        <StatCard icon={ShieldCheck} label="Safe bunks" value={summary.safeBunksTotal} hint="Total available" tone="success" />
        <StatCard icon={AlertTriangle} label="Risky subjects" value={summary.risky} hint="Below threshold" tone="danger" />
        <StatCard icon={Lightbulb} label="To recover" value={summary.recoveryTotal} hint="Classes needed" tone="warning" />
      </div>

      {/* Subjects + suggestions */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Subjects</h2>
            <Link to="/app/subjects" className="text-sm text-primary inline-flex items-center gap-1 hover:underline">
              Manage <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {isLoading && <div className="bs-card p-8 text-sm text-muted-foreground text-center">Loading…</div>}
          {!isLoading && subjects.length === 0 && (
            <div className="bs-card p-12 text-center">
              <div className="font-display text-2xl mb-2">No subjects yet</div>
              <p className="text-sm text-muted-foreground mb-5">Add your first subject to start tracking attendance.</p>
              <Button onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Add subject</Button>
            </div>
          )}
          {summary.stats.map(({ s, st, bunks, need }) => {
            const p = percent(s.attended_classes, s.total_classes);
            return (
              <div key={s.id} className="bs-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{s.subject_name}</h3>
                      <StatusBadge status={st} />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {s.attended_classes}/{s.total_classes} attended · target {Number(s.required_percentage).toFixed(0)}%
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-display text-3xl leading-none">{p.toFixed(1)}<span className="text-lg text-muted-foreground font-normal">%</span></div>
                  </div>
                </div>
                <div className="mt-4 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={
                      st === "safe" ? "h-full bg-success" :
                      st === "warning" ? "h-full bg-warning" : "h-full bg-danger"
                    }
                    style={{ width: `${Math.min(100, p)}%` }}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                  <span><span className="text-success">{Number.isFinite(bunks) ? bunks : "∞"}</span> safe bunks</span>
                  <span><span className="text-danger">{Number.isFinite(need) ? need : "—"}</span> to recover</span>
                </div>
              </div>
            );
          })}
        </div>

        <aside className="space-y-3">
          <h2 className="font-semibold">Smart suggestions</h2>
          {suggestions.length === 0 ? (
            <div className="bs-card p-5 text-sm text-muted-foreground">Add subjects to unlock personalised insights.</div>
          ) : suggestions.map((sg, i) => (
            <div key={i} className="bs-card p-4 flex gap-3 items-start">
              <div className={
                sg.tone === "good" ? "h-7 w-7 rounded-md bg-success-muted text-success grid place-items-center shrink-0" :
                sg.tone === "bad" ? "h-7 w-7 rounded-md bg-danger-muted text-danger grid place-items-center shrink-0" :
                "h-7 w-7 rounded-md bg-accent text-accent-foreground grid place-items-center shrink-0"
              }>
                <Lightbulb className="h-3.5 w-3.5" />
              </div>
              <p className="text-sm leading-snug">{sg.text}</p>
            </div>
          ))}
        </aside>
      </div>

      <SubjectDialog open={open} onOpenChange={setOpen} />
    </ProtectedLayout>
  );
};

export default Dashboard;
