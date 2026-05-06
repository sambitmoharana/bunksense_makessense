import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export type Subject = {
  id: string;
  user_id: string;
  subject_name: string;
  total_classes: number;
  attended_classes: number;
  required_percentage: number;
  color: string;
  created_at: string;
};

export const useSubjects = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["subjects", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Subject[]> => {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Subject[];
    },
  });
};

export const useUpsertSubject = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (s: Partial<Subject> & { subject_name: string }) => {
      if (!user) throw new Error("Not signed in");
      if (s.id) {
        const { error } = await supabase.from("subjects").update({
          subject_name: s.subject_name,
          total_classes: s.total_classes ?? 0,
          attended_classes: s.attended_classes ?? 0,
          required_percentage: s.required_percentage ?? 75,
          color: s.color ?? "blue",
        }).eq("id", s.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("subjects").insert({
          user_id: user.id,
          subject_name: s.subject_name,
          total_classes: s.total_classes ?? 0,
          attended_classes: s.attended_classes ?? 0,
          required_percentage: s.required_percentage ?? 75,
          color: s.color ?? "blue",
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subjects"] });
      toast.success("Saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useDeleteSubject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("subjects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subjects"] });
      toast.success("Subject deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useUpdateAttendance = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, attended_delta, total_delta }: { id: string; attended_delta: number; total_delta: number }) => {
      const { data: cur, error: e1 } = await supabase.from("subjects").select("*").eq("id", id).single();
      if (e1) throw e1;
      const next_total = Math.max(0, (cur.total_classes ?? 0) + total_delta);
      const next_att = Math.min(next_total, Math.max(0, (cur.attended_classes ?? 0) + attended_delta));
      const { error } = await supabase.from("subjects").update({
        total_classes: next_total,
        attended_classes: next_att,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subjects"] }),
    onError: (e: Error) => toast.error(e.message),
  });
};
