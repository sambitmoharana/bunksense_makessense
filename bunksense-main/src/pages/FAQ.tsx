import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const sections = [
  {
    title: "General",
    items: [
      { q: "What is BunkSense?", a: "BunkSense is a smart attendance and class-bunk planner for college students. It tells you exactly how many classes you can safely skip, how to recover from shortages, and helps you plan your week with real numbers — not guesses." },
      { q: "Is BunkSense free?", a: "Yes. BunkSense is fully free for students, with no credit card required and no hidden tiers. Every feature is unlocked by default." },
      { q: "Who is this built for?", a: "College and university students who have a minimum attendance requirement (typically 75%) and want a calmer, smarter way to manage it." },
    ],
  },
  {
    title: "Calculations",
    items: [
      { q: "How is 'safe bunks' calculated?", a: "We solve for the largest integer k such that attended / (total + k) is still greater than or equal to your required percentage. That k is the number of upcoming classes you can miss while staying compliant." },
      { q: "How is 'recovery needed' calculated?", a: "If you're below your threshold, we find the smallest k such that (attended + k) / (total + k) ≥ required. That's how many consecutive classes you must attend to climb back to safety." },
      { q: "Can I set different percentages per subject?", a: "Yes. Each subject has its own required percentage (default 75%), so you can mirror your university's actual rules — including stricter labs or lenient electives." },
      { q: "What does the simulator do?", a: "The Bunk Simulator lets you preview the impact of skipping or attending the next N classes for any subject — your percentage, status badge, and safe-bunk count update live." },
    ],
  },
  {
    title: "Planner & timetable",
    items: [
      { q: "Can I edit the weekly planner?", a: "Yes. Open the Planner page, click 'Edit timetable', set your number of periods per day and active days, and assign subjects to slots. Your real schedule drives the 4-week color-coded outlook." },
      { q: "What do the planner colors mean?", a: "Red = must attend (you're in shortage or recovery). Blue = recommended (your margin is thin). Green = safe to skip if you must. Colors update automatically as your attendance changes." },
      { q: "What if I haven't set up a timetable?", a: "BunkSense falls back to a synthesized rotation across your subjects so you still get a useful outlook. Setting your real timetable simply makes it more accurate." },
    ],
  },
  {
    title: "Privacy & data",
    items: [
      { q: "Is my data private?", a: "Yes. Every subject, attendance entry, and timetable slot is tied to your account and protected with row-level security at the database layer. Other users can never see your data." },
      { q: "Can I delete my account or data?", a: "Yes — you can delete subjects individually at any time. To delete your account entirely, contact us and we'll wipe your data within 30 days." },
      { q: "Do you share data with anyone?", a: "No. BunkSense does not sell or share student data with third parties. Period." },
    ],
  },
  {
    title: "Account & access",
    items: [
      { q: "How do I sign in?", a: "Use email + password or 'Continue with Google' on the auth page. Both options sync to the same account if the email matches." },
      { q: "Does it work on mobile?", a: "Yes. The interface is fully responsive — you can update attendance from your phone between classes and use the planner on a laptop later." },
      { q: "I found a bug or have a feature request.", a: "Awesome — that's exactly the feedback we want. Reach out via the published app's support channel and we'll take a look." },
    ],
  },
];

const FAQ = () => (
  <div className="min-h-screen bg-background">
    <Navbar />

    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 bs-grid-bg opacity-30 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="container relative py-20 md:py-28 text-center max-w-3xl">
        <div className="text-xs uppercase tracking-wider text-primary mb-3">FAQ</div>
        <h1 className="font-display text-5xl md:text-6xl text-balance leading-[1.05]">
          Questions, <span className="italic text-primary">answered</span>.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground text-balance">
          Everything you might want to know about BunkSense before signing up — or while using it.
        </p>
      </div>
    </section>

    <section className="py-20">
      <div className="container max-w-3xl space-y-12">
        {sections.map((sec) => (
          <div key={sec.title}>
            <h2 className="font-display text-2xl mb-4 tracking-tight">{sec.title}</h2>
            <Accordion type="single" collapsible className="space-y-2">
              {sec.items.map((f, i) => (
                <AccordionItem key={i} value={`${sec.title}-${i}`} className="bs-card px-5 border">
                  <AccordionTrigger className="text-left hover:no-underline">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>
    </section>

    <section className="py-20 border-t border-border bg-surface/40">
      <div className="container max-w-2xl text-center">
        <h2 className="font-display text-4xl md:text-5xl text-balance">Still curious?</h2>
        <p className="mt-4 text-muted-foreground">The best way to understand BunkSense is to try it.</p>
        <div className="mt-8">
          <Button asChild size="lg" className="gap-2">
            <Link to="/auth?mode=signup">Get started free <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </section>
  </div>
);

export default FAQ;
