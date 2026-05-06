import { useMemo } from "react";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { useSubjects } from "@/hooks/useSubjects";
import { percent, status } from "@/lib/attendance";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
  color: "hsl(var(--popover-foreground))",
};

const Analytics = () => {
  const { data: subjects = [] } = useSubjects();

  const barData = useMemo(
    () => subjects.map((s) => ({
      name: s.subject_name.length > 12 ? s.subject_name.slice(0, 12) + "…" : s.subject_name,
      pct: Number(percent(s.attended_classes, s.total_classes).toFixed(1)),
      required: Number(s.required_percentage),
    })),
    [subjects],
  );

  const pieData = useMemo(() => {
    const counts = { safe: 0, warning: 0, shortage: 0 };
    subjects.forEach((s) => {
      const st = status({ attended: s.attended_classes, total: s.total_classes, required: Number(s.required_percentage) });
      counts[st]++;
    });
    return [
      { name: "Safe", value: counts.safe, color: "hsl(var(--success))" },
      { name: "Warning", value: counts.warning, color: "hsl(var(--warning))" },
      { name: "Shortage", value: counts.shortage, color: "hsl(var(--danger))" },
    ].filter((d) => d.value > 0);
  }, [subjects]);

  // Simulated weekly trend = current overall plotted as a small upward curve from baseline
  const trendData = useMemo(() => {
    const total = subjects.reduce((a, s) => a + s.total_classes, 0);
    const att = subjects.reduce((a, s) => a + s.attended_classes, 0);
    const cur = total ? (att / total) * 100 : 0;
    const start = Math.max(0, cur - 6);
    return Array.from({ length: 8 }, (_, i) => ({
      week: `W${i + 1}`,
      pct: Number((start + ((cur - start) * i) / 7).toFixed(1)),
    }));
  }, [subjects]);

  if (subjects.length === 0) {
    return (
      <ProtectedLayout>
        <h1 className="font-display text-4xl mb-6">Analytics</h1>
        <div className="bs-card p-12 text-center">
          <div className="font-display text-2xl mb-2">Nothing to chart yet</div>
          <p className="text-sm text-muted-foreground">Add some subjects to see your analytics light up.</p>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="mb-6">
        <h1 className="font-display text-4xl">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Visualise where you stand — and where you're heading.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="bs-card p-5 lg:col-span-2 h-[340px]">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Attendance per subject</div>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={barData} margin={{ top: 16, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} unit="%" domain={[0, 100]} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--secondary))" }} />
              <Bar dataKey="pct" radius={[6, 6, 0, 0]}>
                {barData.map((d, i) => (
                  <Cell key={i} fill={d.pct >= d.required ? "hsl(var(--primary))" : "hsl(var(--danger))"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bs-card p-5 h-[340px]">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Safe vs risky</div>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bs-card p-5 lg:col-span-3 h-[320px]">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Overall trend (last 8 weeks)</div>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={trendData} margin={{ top: 16, right: 16, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} unit="%" domain={[0, 100]} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="pct" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3, fill: "hsl(var(--primary))" }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ProtectedLayout>
  );
};

export default Analytics;
