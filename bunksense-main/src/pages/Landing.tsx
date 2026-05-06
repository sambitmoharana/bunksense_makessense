import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Calculator, LineChart, Sparkles, Shield, Zap, Check } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { StatusBadge } from "@/components/StatusBadge";

const Feature = ({ icon: Icon, title, body }: { icon: any; title: string; body: string }) => (
  <div className="bs-card p-6 hover:border-foreground/20 transition-colors">
    <div className="w-10 h-10 rounded-lg bg-accent text-accent-foreground grid place-items-center mb-4">
      <Icon className="h-5 w-5" />
    </div>
    <h3 className="font-semibold mb-1.5 tracking-tight">{title}</h3>
    <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
  </div>
);

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bs-grid-bg opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <div className="absolute inset-0 bs-radial-glow" />
        <div className="container relative pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface text-xs text-muted-foreground mb-6 animate-in-up">
              <Sparkles className="h-3 w-3 text-primary" />
              Smart attendance, zero panic
            </div>
            <h1 className="font-display text-5xl md:text-7xl leading-[1.05] text-balance animate-in-up">
              Never panic about <span className="italic text-primary">attendance</span> again.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto text-balance animate-in-up">
              Track classes, know exactly how many you can safely skip, and recover shortages with a plan — not a prayer.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 animate-in-up">
              <Button asChild size="lg" className="gap-2">
                <Link to="/auth?mode=signup">Get started free <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/auth">Live demo</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Free forever for students · No credit card</p>
          </div>

          {/* Hero preview card */}
          <div className="mt-16 max-w-4xl mx-auto animate-in-up">
            <div className="bs-card-elevated p-2 rounded-2xl">
              <div className="rounded-xl bg-surface-elevated border border-border p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Overall</div>
                    <div className="font-display text-4xl mt-1">82.4<span className="text-muted-foreground text-2xl">%</span></div>
                  </div>
                  <StatusBadge status="safe" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { name: "Mathematics", pct: 88, status: "safe" as const, bunks: 4 },
                    { name: "Physics", pct: 72, status: "warning" as const, bunks: 0 },
                    { name: "Chemistry", pct: 64, status: "shortage" as const, bunks: 0 },
                  ].map((s) => (
                    <div key={s.name} className="rounded-lg border border-border p-4 bg-card">
                      <div className="text-xs text-muted-foreground">{s.name}</div>
                      <div className="font-semibold text-2xl mt-1">{s.pct}%</div>
                      <div className="mt-3 flex items-center justify-between">
                        <StatusBadge status={s.status} />
                        <span className="text-xs text-muted-foreground">{s.bunks} bunks</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 border-t border-border">
        <div className="container">
          <div className="max-w-2xl mb-12">
            <div className="text-xs uppercase tracking-wider text-primary mb-3">Features</div>
            <h2 className="font-display text-4xl md:text-5xl text-balance">Everything you need to survive the semester.</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Feature icon={Calculator} title="Smart bunk math" body="Know the exact number of classes you can miss without dropping below the threshold." />
            <Feature icon={Shield} title="Recovery plans" body="See how many consecutive classes you need to attend to climb back to safety." />
            <Feature icon={Zap} title="Bunk simulator" body="Try 'what-if' scenarios. See your % update in real time before you skip." />
            <Feature icon={Calendar} title="Weekly planner" body="Visual calendar of safe days, risky days, and must-attend classes." />
            <Feature icon={LineChart} title="Analytics" body="Per-subject bars, safe-vs-risky pie, and weekly trend lines." />
            <Feature icon={Sparkles} title="Smart suggestions" body="'Skip English today, attend Math.' Personalised insights every day." />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-24 border-t border-border bg-surface/40">
        <div className="container max-w-4xl">
          <div className="text-xs uppercase tracking-wider text-primary mb-3">How it works</div>
          <h2 className="font-display text-4xl md:text-5xl mb-12 text-balance">Three steps. That's it.</h2>
          <div className="space-y-4">
            {[
              { n: "01", t: "Add your subjects", b: "Drop in your subject names, total classes so far, and how many you've attended." },
              { n: "02", t: "We do the math", b: "BunkSense computes safe bunks, recovery requirements, and risk levels per subject." },
              { n: "03", t: "Plan with confidence", b: "Use the simulator and weekly planner to make smart calls, not anxious guesses." },
            ].map((s) => (
              <div key={s.n} className="bs-card p-6 flex gap-6 items-start">
                <div className="font-display text-3xl text-primary shrink-0">{s.n}</div>
                <div>
                  <h3 className="font-semibold mb-1">{s.t}</h3>
                  <p className="text-sm text-muted-foreground">{s.b}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 border-t border-border">
        <div className="container">
          <h2 className="font-display text-4xl md:text-5xl mb-12 max-w-2xl text-balance">Students stopped guessing.</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { q: "Used to spreadsheet this every Sunday. Now I just open BunkSense.", n: "Aarav S.", r: "CS, IIT Bombay" },
              { q: "The recovery counter saved my Physics grade. Brutally honest in a good way.", n: "Meera K.", r: "Mech, NIT Trichy" },
              { q: "The simulator is the killer feature. I check it before every Friday.", n: "Daniel O.", r: "EE, BITS Pilani" },
            ].map((t) => (
              <div key={t.n} className="bs-card p-6">
                <p className="text-[15px] leading-relaxed">"{t.q}"</p>
                <div className="mt-6 pt-4 border-t border-border">
                  <div className="text-sm font-medium">{t.n}</div>
                  <div className="text-xs text-muted-foreground">{t.r}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 border-t border-border bg-surface/40">
        <div className="container max-w-3xl">
          <h2 className="font-display text-4xl md:text-5xl mb-10 text-balance">Questions, answered.</h2>
          <Accordion type="single" collapsible className="space-y-2">
            {[
              { q: "Is BunkSense free?", a: "Yes — fully free for students. No card required." },
              { q: "How is 'safe bunks' calculated?", a: "We solve for the largest k where attended / (total + k) is still ≥ your required percentage." },
              { q: "Can I change the required percentage per subject?", a: "Absolutely — each subject has its own threshold (default 75%)." },
              { q: "Is my data private?", a: "Your subjects and attendance are tied to your account with row-level security. Only you can see them." },
            ].map((f, i) => (
              <AccordionItem key={i} value={`f-${i}`} className="bs-card px-5 border">
                <AccordionTrigger className="text-left hover:no-underline">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-border">
        <div className="container max-w-3xl text-center">
          <h2 className="font-display text-5xl md:text-6xl text-balance">Stop guessing. Start <span className="italic text-primary">planning</span>.</h2>
          <div className="mt-8 flex justify-center gap-3">
            <Button asChild size="lg" className="gap-2">
              <Link to="/auth?mode=signup">Create your free account <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
          <ul className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            {["Free forever", "No credit card", "Setup in 30s"].map((x) => (
              <li key={x} className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /> {x}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-10">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-foreground text-background grid place-items-center font-bold text-[10px]">B</div>
            <span>BunkSense © {new Date().getFullYear()}</span>
          </div>
          <div>Built for students who'd rather plan than panic.</div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
