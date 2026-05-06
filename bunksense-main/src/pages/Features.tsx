import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Calculator, LineChart, Sparkles, Shield, Zap, Bell, Lock, Smartphone, Moon, BarChart3 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Calculator, title: "Smart bunk math", body: "Know the exact number of classes you can miss without dropping below your required threshold. No more napkin math." },
  { icon: Shield, title: "Recovery plans", body: "Behind on attendance? See exactly how many consecutive classes you need to attend to climb back to safety." },
  { icon: Zap, title: "Bunk simulator", body: "Try 'what-if' scenarios. Move a slider, watch your % update in real time before you decide to skip." },
  { icon: Calendar, title: "Editable weekly planner", body: "Map your real timetable: pick periods per day, assign subjects, and get a color-coded 4-week outlook." },
  { icon: LineChart, title: "Rich analytics", body: "Per-subject attendance bars, safe-vs-risky pie charts, and weekly trend lines — all in one dashboard." },
  { icon: Sparkles, title: "Smart suggestions", body: "'Skip English today, attend Math.' Daily, personalised insights based on your real numbers." },
  { icon: BarChart3, title: "Per-subject thresholds", body: "Different subjects, different rules. Set 75% for one and 85% for another — we'll respect both." },
  { icon: Moon, title: "Dark mode", body: "A calm, Notion-inspired dark theme that won't fry your eyes during a 2am study session." },
  { icon: Lock, title: "Private by default", body: "Your data is tied to your account with row-level security. Only you can see your attendance." },
  { icon: Smartphone, title: "Works everywhere", body: "Fully responsive — track attendance from your phone between classes or your laptop in the library." },
  { icon: Bell, title: "Status badges", body: "Instant visual cues — Safe, Warning, or Shortage — so you know where every subject stands at a glance." },
  { icon: ArrowRight, title: "Built to be fast", body: "Optimistic updates, instant feedback, and an interface that respects your time as much as your attendance." },
];

const Features = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 bs-grid-bg opacity-30 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="container relative py-20 md:py-28 text-center max-w-3xl">
        <div className="text-xs uppercase tracking-wider text-primary mb-3">Features</div>
        <h1 className="font-display text-5xl md:text-6xl text-balance leading-[1.05]">
          Everything you need to <span className="italic text-primary">survive</span> the semester.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground text-balance">
          BunkSense isn't just an attendance tracker. It's a complete planning system built for students who'd rather strategise than stress.
        </p>
      </div>
    </section>

    <section className="py-20">
      <div className="container">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div key={f.title} className="bs-card p-6 hover:border-foreground/20 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-accent text-accent-foreground grid place-items-center mb-4">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold mb-1.5 tracking-tight">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="py-20 border-t border-border">
      <div className="container max-w-2xl text-center">
        <h2 className="font-display text-4xl md:text-5xl text-balance">Ready to take control?</h2>
        <p className="mt-4 text-muted-foreground">Set up your subjects in 30 seconds.</p>
        <div className="mt-8">
          <Button asChild size="lg" className="gap-2">
            <Link to="/auth?mode=signup">Get started free <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </section>
  </div>
);

export default Features;
