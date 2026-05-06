import { useState } from "react";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpsertSubject, type Subject } from "@/hooks/useSubjects";

const schema = z.object({
  subject_name: z.string().trim().min(1, "Required").max(80),
  total_classes: z.number().int().min(0).max(10000),
  attended_classes: z.number().int().min(0).max(10000),
  required_percentage: z.number().min(0).max(100),
}).refine((v) => v.attended_classes <= v.total_classes, { message: "Attended cannot exceed total", path: ["attended_classes"] });

export const SubjectDialog = ({
  open, onOpenChange, subject,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  subject?: Subject | null;
}) => {
  const upsert = useUpsertSubject();
  const [form, setForm] = useState({
    subject_name: subject?.subject_name ?? "",
    total_classes: subject?.total_classes ?? 0,
    attended_classes: subject?.attended_classes ?? 0,
    required_percentage: subject?.required_percentage ?? 75,
  });

  // Reset form when subject changes
  useState(() => {
    setForm({
      subject_name: subject?.subject_name ?? "",
      total_classes: subject?.total_classes ?? 0,
      attended_classes: subject?.attended_classes ?? 0,
      required_percentage: subject?.required_percentage ?? 75,
    });
  });

  const submit = async () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message ?? "Invalid input";
      const { toast } = await import("sonner");
      toast.error(msg);
      return;
    }
    await upsert.mutateAsync({ id: subject?.id, ...parsed.data, subject_name: parsed.data.subject_name });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>{subject ? "Edit subject" : "Add subject"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={form.subject_name} onChange={(e) => setForm({ ...form, subject_name: e.target.value })} placeholder="Mathematics" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Total classes</Label>
              <Input type="number" min={0} value={form.total_classes} onChange={(e) => setForm({ ...form, total_classes: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label>Attended</Label>
              <Input type="number" min={0} value={form.attended_classes} onChange={(e) => setForm({ ...form, attended_classes: Number(e.target.value) })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Required %</Label>
            <Input type="number" min={0} max={100} value={form.required_percentage} onChange={(e) => setForm({ ...form, required_percentage: Number(e.target.value) })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={upsert.isPending}>{upsert.isPending ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
