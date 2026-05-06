import { useMemo, useState } from "react";
import { Plus, Search, Pencil, Trash2, Minus } from "lucide-react";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSubjects, useDeleteSubject, useUpdateAttendance, type Subject } from "@/hooks/useSubjects";
import { percent, safeBunks, recoveryNeeded, status } from "@/lib/attendance";
import { StatusBadge } from "@/components/StatusBadge";
import { SubjectDialog } from "@/components/SubjectDialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Subjects = () => {
  const { data: subjects = [], isLoading } = useSubjects();
  const del = useDeleteSubject();
  const upd = useUpdateAttendance();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);

  const filtered = useMemo(
    () => subjects.filter((s) => s.subject_name.toLowerCase().includes(q.toLowerCase())),
    [subjects, q],
  );

  return (
    <ProtectedLayout>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-4xl">Subjects</h1>
          <p className="text-sm text-muted-foreground mt-1">Add, edit, and log attendance per subject.</p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Add subject
        </Button>
      </div>

      <div className="relative mb-5 max-w-sm">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search subjects…" className="pl-9" />
      </div>

      {isLoading && <div className="bs-card p-8 text-center text-sm text-muted-foreground">Loading…</div>}

      {!isLoading && filtered.length === 0 && (
        <div className="bs-card p-12 text-center">
          <div className="font-display text-2xl mb-2">{q ? "No matches" : "No subjects yet"}</div>
          <p className="text-sm text-muted-foreground mb-5">{q ? "Try a different search." : "Add your first subject to get started."}</p>
          {!q && <Button onClick={() => { setEditing(null); setOpen(true); }} className="gap-2"><Plus className="h-4 w-4" /> Add subject</Button>}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-3">
        {filtered.map((s) => {
          const stats = { attended: s.attended_classes, total: s.total_classes, required: Number(s.required_percentage) };
          const st = status(stats);
          const p = percent(s.attended_classes, s.total_classes);
          return (
            <div key={s.id} className="bs-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{s.subject_name}</h3>
                    <StatusBadge status={st} />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Target {Number(s.required_percentage).toFixed(0)}%
                  </div>
                </div>
                <div className="font-display text-3xl">{p.toFixed(1)}<span className="text-lg text-muted-foreground">%</span></div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                <div className="rounded-lg border border-border p-3">
                  <div className="text-xs text-muted-foreground">Safe bunks</div>
                  <div className="font-semibold text-lg text-success">
                    {Number.isFinite(safeBunks(stats)) ? safeBunks(stats) : "∞"}
                  </div>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <div className="text-xs text-muted-foreground">To recover</div>
                  <div className="font-semibold text-lg text-danger">
                    {Number.isFinite(recoveryNeeded(stats)) ? recoveryNeeded(stats) : "—"}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Button size="sm" variant="outline" onClick={() => upd.mutate({ id: s.id, attended_delta: 1, total_delta: 1 })}>
                    <Plus className="h-3 w-3 mr-1" /> Attended
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => upd.mutate({ id: s.id, attended_delta: 0, total_delta: 1 })}>
                    <Minus className="h-3 w-3 mr-1" /> Missed
                  </Button>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" onClick={() => { setEditing(s); setOpen(true); }} aria-label="Edit">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="ghost" aria-label="Delete"><Trash2 className="h-4 w-4 text-danger" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete {s.subject_name}?</AlertDialogTitle>
                        <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => del.mutate(s.id)} className="bg-danger text-danger-foreground hover:bg-danger/90">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <SubjectDialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }} subject={editing} key={editing?.id ?? "new"} />
    </ProtectedLayout>
  );
};

export default Subjects;
