import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export type TimetableSlot = {
  id: string;
  user_id: string;
  day_of_week: number; // 0=Mon..6=Sun
  period: number;
  subject_id: string | null;
};

export const useTimetable = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["timetable", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<TimetableSlot[]> => {
      const { data, error } = await supabase
        .from("timetable_slots")
        .select("*")
        .order("day_of_week", { ascending: true })
        .order("period", { ascending: true });
      if (error) throw error;
      return data as TimetableSlot[];
    },
  });
};

export const useSetSlot = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({
      day_of_week,
      period,
      subject_id,
    }: {
      day_of_week: number;
      period: number;
      subject_id: string | null;
    }) => {
      if (!user) throw new Error("Not signed in");
      if (subject_id === null) {
        const { error } = await supabase
          .from("timetable_slots")
          .delete()
          .eq("user_id", user.id)
          .eq("day_of_week", day_of_week)
          .eq("period", period);
        if (error) throw error;
        return;
      }
      const { error } = await supabase
        .from("timetable_slots")
        .upsert(
          { user_id: user.id, day_of_week, period, subject_id },
          { onConflict: "user_id,day_of_week,period" },
        );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["timetable"] }),
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useClearTimetable = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase
        .from("timetable_slots")
        .delete()
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["timetable"] });
      toast.success("Timetable cleared");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};
