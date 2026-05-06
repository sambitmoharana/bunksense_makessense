import { useMemo, useState } from "react";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { useSubjects } from "@/hooks/useSubjects";
import { useTimetable, useSetSlot, useClearTimetable, TimetableSlot } from "@/hooks/useTimetable";
import { safeBunks, recoveryNeeded, status } from "@/lib/attendance";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Check, Trash2, Plus, Minus } from "lucide-react";
import { toast } from "sonner";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const FREE = "__free__";

const Planner = () => {
  const { data: subjects = [] } = useSubjects();
  const { data: slots = [] } = useTimetable();
  const setSlot = useSetSlot();
  const clearAll = useClearTimetable();

  const [editing, setEditing] = useState(false);
  const [periodsPerDay, setPeriodsPerDay] = useState(6);
  const [activeDays, setActiveDays] = useState(5); // Mon–Fri default

  const hasTimetable = slots.length > 0;

  // Map for quick lookup: `${day}-${period}` -> subject_id
  const slotMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const s of slots) {
      if (s.subject_id) m.set(`${s.day_of_week}-${s.period}`, s.subject_id);
    }
    return m;
  }, [slots]);

  // When user has a timetable, derive a 4-week outlook that respects it.
  // Each cell label depends on the SUBJECT placed there.
  const outlookGrid = useMemo(() => {
    if (!hasTimetable || subjects.length === 0) return null;
    return Array.from({ length: 4 }, (_, w) =>
      Array.from({ length: 7 }, (_, di) => {
        // Use the FIRST scheduled subject for that day as the day's headline
        const todays = slots
          .filter((s) => s.day_of_week === di && s.subject_id)
          .map((s) => subjects.find((sub) => sub.id === s.subject_id))
          .filter(Boolean) as typeof subjects;
        if (todays.length === 0)
          return { day: DAYS[di], week: w, label: "free" as const, subjects: [] };
        // Pick the riskiest subject for the day's badge color
        let label: "must" | "safe" | "recommend" = "recommend";
        for (const subj of todays) {
          const stats = {
            attended: subj.attended_classes,
            total: subj.total_classes,
            required: Number(subj.required_percentage),
          };
          const st = status(stats);
          const need = recoveryNeeded(stats);
          if (st === "shortage" || need > 0) {
            label = "must";
            break;
          }
          if (safeBunks(stats) > 2) label = "safe";
        }
        return { day: DAYS[di], week: w, label, subjects: todays };
      }),
    );
  }, [hasTimetable, slots, subjects]);

  // Fallback synthesised plan (original behaviour)
  const fallbackGrid = useMemo(() => {
    if (hasTimetable) return null;
    return Array.from({ length: 4 }, (_, w) =>
      DAYS.map((d, di) => {
        if (subjects.length === 0)
          return { day: d, week: w, label: "free" as const, subject: null as any };
        const subj = subjects[(w * 7 + di) % subjects.length];
        const stats = {
          attended: subj.attended_classes,
          total: subj.total_classes,
          required: Number(subj.required_percentage),
        };
        const st = status(stats);
        const bunks = safeBunks(stats);
        const need = recoveryNeeded(stats);
        let label: "must" | "safe" | "recommend" = "recommend";
        if (st === "shortage" || need > 0) label = "must";
        else if (bunks > 2 && (di === 4 || di === 5)) label = "safe";
        return { day: d, week: w, label, subject: subj };
      }),
    );
  }, [hasTimetable, subjects]);

  const handleSlotChange = (day: number, period: number, value: string) => {
    setSlot.mutate({
      day_of_week: day,
      period,
      subject_id: value === FREE ? null : value,
    });
  };

  const Legend = ({ color, label }: { color: string; label: string }) => (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className={cn("h-2.5 w-2.5 rounded", color)} /> {label}
    </div>
  );

  return (
    <ProtectedLayout>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">Weekly planner</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {editing
              ? "Build your real timetable — pick a subject for each period."
              : hasTimetable
                ? "Your timetable with smart day-level guidance for the next 4 weeks."
                : "A 4-week outlook based on your current attendance."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!editing && (
            <div className="flex flex-wrap gap-4 mr-2 self-center">
              <Legend color="bg-danger" label="Must attend" />
              <Legend color="bg-primary" label="Recommended" />
              <Legend color="bg-success" label="Safe day" />
            </div>
          )}
          {editing ? (
            <>
              {hasTimetable && (
                <Button
                  variant="outline"
                  onClick={() => {
                    if (confirm("Clear your entire timetable?")) clearAll.mutate();
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-1.5" /> Clear
                </Button>
              )}
              <Button onClick={() => { setEditing(false); toast.success("Timetable saved"); }}>
                <Check className="h-4 w-4 mr-1.5" /> Done
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setEditing(true)} disabled={subjects.length === 0}>
              <Pencil className="h-4 w-4 mr-1.5" /> Edit timetable
            </Button>
          )}
        </div>
      </div>

      {subjects.length === 0 ? (
        <div className="bs-card p-12 text-center">
          <div className="font-display text-2xl mb-2">No plan yet</div>
          <p className="text-sm text-muted-foreground">
            Add subjects first, then build your weekly timetable.
          </p>
        </div>
      ) : editing ? (
        <EditableTimetable
          subjects={subjects}
          slotMap={slotMap}
          periodsPerDay={periodsPerDay}
          activeDays={activeDays}
          onSlotChange={handleSlotChange}
          onPeriodsChange={setPeriodsPerDay}
          onActiveDaysChange={setActiveDays}
        />
      ) : hasTimetable ? (
        <TimetableView
          subjects={subjects}
          slots={slots}
          activeDays={activeDays}
          periodsPerDay={periodsPerDay}
          outlookGrid={outlookGrid}
        />
      ) : (
        <FallbackOutlook grid={fallbackGrid!} />
      )}
    </ProtectedLayout>
  );
};

/* ---------------- Editable timetable ---------------- */

const EditableTimetable = ({
  subjects,
  slotMap,
  periodsPerDay,
  activeDays,
  onSlotChange,
  onPeriodsChange,
  onActiveDaysChange,
}: {
  subjects: ReturnType<typeof useSubjects>["data"] extends infer T ? NonNullable<T> : never;
  slotMap: Map<string, string>;
  periodsPerDay: number;
  activeDays: number;
  onSlotChange: (day: number, period: number, value: string) => void;
  onPeriodsChange: (n: number) => void;
  onActiveDaysChange: (n: number) => void;
}) => {
  const days = DAYS.slice(0, activeDays);

  return (
    <div className="space-y-4">
      <div className="bs-card p-4 flex flex-wrap items-end gap-4">
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Periods / day</Label>
          <div className="flex items-center gap-1">
            <Button size="icon" variant="outline" className="h-8 w-8"
              onClick={() => onPeriodsChange(Math.max(1, periodsPerDay - 1))}>
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <Input
              className="h-8 w-14 text-center"
              type="number"
              min={1}
              max={12}
              value={periodsPerDay}
              onChange={(e) => onPeriodsChange(Math.min(12, Math.max(1, Number(e.target.value) || 1)))}
            />
            <Button size="icon" variant="outline" className="h-8 w-8"
              onClick={() => onPeriodsChange(Math.min(12, periodsPerDay + 1))}>
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Days / week</Label>
          <Select value={String(activeDays)} onValueChange={(v) => onActiveDaysChange(Number(v))}>
            <SelectTrigger className="h-8 w-20"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[5, 6, 7].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-muted-foreground ml-auto">
          Changes save automatically. Leave a slot as “Free” for breaks.
        </p>
      </div>

      <div className="bs-card p-4 md:p-6 overflow-x-auto">
        <div
          className="grid gap-2 min-w-[820px]"
          style={{ gridTemplateColumns: `80px repeat(${days.length}, minmax(140px, 1fr))` }}
        >
          <div></div>
          {days.map((d) => (
            <div key={d} className="text-xs uppercase tracking-wider text-muted-foreground text-center">
              {d}
            </div>
          ))}
          {Array.from({ length: periodsPerDay }, (_, p) => (
            <FragmentEditRow
              key={p}
              period={p}
              days={days}
              subjects={subjects}
              slotMap={slotMap}
              onSlotChange={onSlotChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const FragmentEditRow = ({
  period,
  days,
  subjects,
  slotMap,
  onSlotChange,
}: {
  period: number;
  days: string[];
  subjects: any[];
  slotMap: Map<string, string>;
  onSlotChange: (day: number, period: number, value: string) => void;
}) => (
  <>
    <div className="text-xs text-muted-foreground self-center">P{period + 1}</div>
    {days.map((_, di) => {
      const value = slotMap.get(`${di}-${period}`) ?? FREE;
      return (
        <Select
          key={di}
          value={value}
          onValueChange={(v) => onSlotChange(di, period, v)}
        >
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Free" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={FREE}>Free</SelectItem>
            {subjects.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.subject_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    })}
  </>
);

/* ---------------- Read-only timetable view ---------------- */

const TimetableView = ({
  subjects,
  slots,
  activeDays,
  periodsPerDay,
  outlookGrid,
}: {
  subjects: any[];
  slots: TimetableSlot[];
  activeDays: number;
  periodsPerDay: number;
  outlookGrid: any;
}) => {
  const days = DAYS.slice(0, activeDays);
  const subjectById = useMemo(
    () => new Map(subjects.map((s) => [s.id, s])),
    [subjects],
  );
  const maxPeriod = Math.max(
    periodsPerDay,
    ...slots.map((s) => s.period + 1),
    1,
  );

  return (
    <div className="space-y-6">
      <div className="bs-card p-4 md:p-6 overflow-x-auto">
        <div
          className="grid gap-2 min-w-[760px]"
          style={{ gridTemplateColumns: `60px repeat(${days.length}, minmax(130px, 1fr))` }}
        >
          <div></div>
          {days.map((d) => (
            <div key={d} className="text-xs uppercase tracking-wider text-muted-foreground text-center">
              {d}
            </div>
          ))}
          {Array.from({ length: maxPeriod }, (_, p) => (
            <>
              <div key={`p-${p}`} className="text-xs text-muted-foreground self-center">P{p + 1}</div>
              {days.map((_, di) => {
                const slot = slots.find((s) => s.day_of_week === di && s.period === p);
                const subj = slot?.subject_id ? subjectById.get(slot.subject_id) : null;
                if (!subj) {
                  return (
                    <div key={`${di}-${p}`} className="rounded-lg border border-dashed border-border/50 min-h-[64px] flex items-center justify-center text-xs text-muted-foreground/60">
                      Free
                    </div>
                  );
                }
                const stats = {
                  attended: subj.attended_classes,
                  total: subj.total_classes,
                  required: Number(subj.required_percentage),
                };
                const st = status(stats);
                const need = recoveryNeeded(stats);
                const tone =
                  st === "shortage" || need > 0
                    ? "border-danger/30 bg-danger-muted/40"
                    : safeBunks(stats) > 2
                      ? "border-success/30 bg-success-muted/40"
                      : "border-primary/30 bg-primary-muted/30";
                return (
                  <div key={`${di}-${p}`} className={cn("rounded-lg border p-2.5 min-h-[64px] flex flex-col justify-between", tone)}>
                    <div className="text-sm font-medium truncate">{subj.subject_name}</div>
                    <div className="text-[10px] uppercase tracking-wider opacity-70">
                      {st === "shortage" || need > 0 ? "Must attend" : safeBunks(stats) > 2 ? "Safe" : "Recommended"}
                    </div>
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>

      {outlookGrid && (
        <div>
          <h2 className="font-display text-2xl mb-3">4-week outlook</h2>
          <div className="bs-card p-4 md:p-6 overflow-x-auto">
            <div className="grid grid-cols-[60px_repeat(7,minmax(110px,1fr))] gap-2 min-w-[820px]">
              <div></div>
              {DAYS.map((d) => <div key={d} className="text-xs uppercase tracking-wider text-muted-foreground text-center">{d}</div>)}
              {outlookGrid.map((week: any[], wi: number) => (
                <FragmentOutlookRow key={wi} weekIdx={wi} cells={week} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FragmentOutlookRow = ({ weekIdx, cells }: { weekIdx: number; cells: any[] }) => (
  <>
    <div className="text-xs text-muted-foreground self-center">W{weekIdx + 1}</div>
    {cells.map((c, i) => (
      <div
        key={i}
        className={cn(
          "rounded-lg border p-3 min-h-[78px] flex flex-col justify-between transition-colors",
          c.label === "must" && "border-danger/30 bg-danger-muted/40",
          c.label === "recommend" && "border-primary/30 bg-primary-muted/30",
          c.label === "safe" && "border-success/30 bg-success-muted/40",
          c.label === "free" && "border-border/40 bg-transparent",
        )}
      >
        <div className="text-[10px] uppercase tracking-wider font-medium opacity-70">
          {c.label === "must" ? "Must attend" : c.label === "safe" ? "Safe" : c.label === "free" ? "Free" : "Recommended"}
        </div>
        <div className="text-sm font-medium truncate">
          {c.subjects?.length ? c.subjects.map((s: any) => s.subject_name).join(", ") : "—"}
        </div>
      </div>
    ))}
  </>
);

/* ---------------- Fallback (no timetable yet) ---------------- */

const FallbackOutlook = ({ grid }: { grid: any[][] }) => (
  <div className="bs-card p-4 md:p-6 overflow-x-auto">
    <div className="grid grid-cols-[60px_repeat(7,minmax(110px,1fr))] gap-2 min-w-[820px]">
      <div></div>
      {DAYS.map((d) => <div key={d} className="text-xs uppercase tracking-wider text-muted-foreground text-center">{d}</div>)}
      {grid.map((week, wi) => (
        <>
          <div key={`w-${wi}`} className="text-xs text-muted-foreground self-center">W{wi + 1}</div>
          {week.map((c, i) => (
            <div
              key={`${wi}-${i}`}
              className={cn(
                "rounded-lg border p-3 min-h-[78px] flex flex-col justify-between transition-colors",
                c.label === "must" && "border-danger/30 bg-danger-muted/40",
                c.label === "recommend" && "border-primary/30 bg-primary-muted/30",
                c.label === "safe" && "border-success/30 bg-success-muted/40",
              )}
            >
              <div className="text-[10px] uppercase tracking-wider font-medium opacity-70">
                {c.label === "must" ? "Must attend" : c.label === "safe" ? "Safe" : "Recommended"}
              </div>
              <div className="text-sm font-medium truncate">{c.subject?.subject_name}</div>
            </div>
          ))}
        </>
      ))}
    </div>
  </div>
);

export default Planner;
