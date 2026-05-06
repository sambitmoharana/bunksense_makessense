import { Link } from "react-router-dom";
import { ArrowRight, UserPlus, BookOpen, Calculator, Calendar, LineChart } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";

const steps = [
  {
    n: "01",
    icon: UserPlus,
    title: "Create your account",
    body: "Sign up with email or Google in seconds. Your data is private to you, secured with row-level access.",
    detail: "No credit card. No fluff. Just a clean dashboard ready to go.",
  },
  {
    n: "02",
    icon: BookOpen,
    title: "Add your subjects",
    body: "Drop in subject names, total classes held so far, classes you've attended, and your required percentage (default 75%).",
    detail: "You can edit any subject anytime — useful when your university posts the official count.",
  },
  {
    n: "03",
    icon: Calculator,
    title: "Let BunkSense do the math",
    body: "We instantly compute safe bunks, recovery requirements, and risk levels. Each subject gets a Safe / Warning / Shortage badge.",
    detail: "Algorithm: solve the largest k where attended / (total + k) ≥ required. No guessing involved.",
  },
  {
    n: "04",
    icon: Calendar,
    title: "Build your weekly timetable",
    body: "Open the Planner, set periods per day and active days, then assign subjects to slots. Get a 4-week color-coded outlook.",
    detail: "Slots turn red (must attend), blue (recommended), or green (safe to skip) based on real attendance math.",
  },
  {
    n: "05",
    icon: LineChart,
    title: "Plan with the simulator",
    body: "Before you skip anything, open the Bunk Simulator. Pick a subject, slide 'miss next N' or 'attend next N', and see your % update live.",
    detail: "Use Analytics for the bigger picture — bars, pies, and weekly trend lines across every subject.",
  },
];

const HowItWorks = () => (
  <div className="min-h-screen bg-background">
    <Navbar />

    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 bs-grid-bg opacity-30 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="container relative py-20 md:py-28 text-center max-w-3xl">
        <div className="text-xs uppercase tracking-wider text-primary mb-3">How it works</div>
        <h1 className="font-display text-5xl md:text-6xl text-balance leading-[1.05]">
          From chaos to <span className="italic text-primary">clarity</span> in five steps.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground text-balance">
          A walkthrough of how BunkSense turns a messy attendance situation into a calm, confident plan.
        </p>
      </div>
    </section>

    <section className="py-20">
      <div className="container max-w-4xl space-y-6">
        {steps.map((s) => (
          <div key={s.n} className="bs-card p-8 flex flex-col md:flex-row gap-6">
            <div className="shrink-0 flex md:flex-col items-center md:items-start gap-4 md:gap-6 md:w-32">
              <div className="font-display text-5xl text-primary leading-none">{s.n}</div>
              <div className="w-12 h-12 rounded-lg bg-accent text-accent-foreground grid place-items-center">
                <s.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-xl mb-2 tracking-tight">{s.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{s.body}</p>
              <p className="mt-3 text-sm text-muted-foreground/80 italic">{s.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </section>

    <section className="py-20 border-t border-border bg-surface/40">
      <div className="container max-w-2xl text-center">
        <h2 className="font-display text-4xl md:text-5xl text-balance">That's literally it.</h2>
        <p className="mt-4 text-muted-foreground">Sign up and you'll be tracking inside a minute.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="gap-2">
            <Link to="/auth?mode=signup">Start free <ArrowRight className="h-4 w-4" /></Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/features">See all features</Link>
          </Button>
        </div>
      </div>
    </section>
  </div>
);

export default HowItWorks;
