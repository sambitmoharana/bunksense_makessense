import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowRight, Calendar, Calculator, LineChart, Sparkles, Shield, Zap, 
  Bell, Lock, Smartphone, Moon, BarChart3, Bot, Brain, Activity, 
  HelpCircle, MessageSquareCode, ShieldCheck, HeartHandshake, Play
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Bot, title: "AI Academic Advisor", body: "An interactive, conversational chatbot that builds personalized attendance recovery strategies and timetabling advice on the fly." },
  { icon: Brain, title: "AI Weekly Insights", body: "Get timetable-based risk heatmaps, overall attendance scorecards, and strategy briefings generated specifically for your week." },
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
];

const Features = () => {
  const [activeAi, setActiveAi] = useState<"advisor" | "insights">("advisor");
  const [activeTab, setActiveTab] = useState<"features" | "how" | "faq">("features");

  const aiDetails = {
    advisor: {
      title: "AI Academic Advisor",
      subtitle: "Your personal, witty attendance coach inside the app.",
      features: [
        { title: "Interactive Chat Guide", desc: "Ask 'How do I save my attendance?' and get a custom step-by-step breakdown based on your active subjects." },
        { title: "Timetable Assistant", desc: "Ask the Advisor if you can skip a class today, and it will check your schedule to suggest which periods are safe to skip and which are critical." },
        { title: "Daily Action Tips", desc: "Get snappy, realistic tips that keep you accountable and help you make smart choices." }
      ],
      how: [
        { step: "01", title: "Timetable Scan", desc: "We look at your subjects list, current percentages, and weekly schedule configuration from your active session." },
        { step: "02", title: "Secure Processing", desc: "This info is securely evaluated on our servers. We never ask for or save external keys on your device." },
        { step: "03", title: "Strategy Generation", desc: "Our server builds a custom strategy guide for you. If the server is offline, a built-in backup math engine answers instead." }
      ],
      faq: [
        { q: "Is my chat history saved?", a: "No. All messages are completely temporary. Tapping refresh or logging out deletes them permanently from memory." },
        { q: "Do I need to set up anything?", a: "No. Everything runs automatically on our secure servers. No setups or keys are needed from your side." },
        { q: "What happens if the system is offline?", a: "A backup attendance calculator steps in to compute exact recovery targets immediately so the advisor never stops working." }
      ]
    },
    insights: {
      title: "AI Weekly Insights",
      subtitle: "Timetable-based strategy briefs and heatmaps.",
      features: [
        { title: "Timetable Risk Heatmaps", desc: "Color-coded weekday slots highlighting critical and safe-to-skip periods based on your percentages." },
        { title: "Weekly Strategy Briefings", desc: "A simple report showing which classes need immediate attendance and how to manage your bunks." },
        { title: "Risk Rating Metric", desc: "Get a clean status rating (like 'Low Risk' or 'Shortage') showing where your attendance stands this week." }
      ],
      how: [
        { step: "01", title: "Schedule Analysis", desc: "We check your weekly timetable to see which classes fall on which days." },
        { step: "02", title: "Bunk Margin Calculation", desc: "Our server calculates your safe bunk allowances and alerts you of any upcoming risks." },
        { step: "03", title: "Dashboard Scorecard", desc: "We place a simple scorecard and risk planner on your screen, updating automatically as you record your attendance." }
      ],
      faq: [
        { q: "How is my weekly risk calculated?", a: "It is calculated based on your lowest attendance percentage and upcoming scheduled classes." },
        { q: "Can I share my weekly briefings?", a: "Yes, you can copy the strategy text or screenshot it to share with classmates." },
        { q: "How often do insights update?", a: "They update instantly the moment you log attendance, edit your timetable, or modify subjects." }
      ]
    }
  };

  const currentDetails = aiDetails[activeAi];

  return (
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

      {/* CORE FEATURES GRID */}
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

      {/* INTERACTIVE AI SHOWCASE */}
      <section className="py-20 border-t border-border bg-muted/20">
        <div className="container max-w-4xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs text-primary mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              Interactive Showcase
            </div>
            <h2 className="font-display text-4xl md:text-5xl text-balance">Inside the AI Copilot Suite</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Tap on each AI system and toggle the tabs to see how it operates, what features it unlocks, and security details.
            </p>
          </div>

          {/* AI Toggle Buttons */}
          <div className="flex justify-center gap-2 mb-8">
            <button
              onClick={() => setActiveAi("advisor")}
              className={`px-5 py-2.5 rounded-lg border transition-all flex items-center gap-2 text-sm font-medium ${
                activeAi === "advisor"
                  ? "bg-foreground text-background border-foreground shadow-sm"
                  : "bg-surface border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <Bot className="h-4 w-4" />
              AI Academic Advisor
            </button>
            <button
              onClick={() => setActiveAi("insights")}
              className={`px-5 py-2.5 rounded-lg border transition-all flex items-center gap-2 text-sm font-medium ${
                activeAi === "insights"
                  ? "bg-foreground text-background border-foreground shadow-sm"
                  : "bg-surface border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <Brain className="h-4 w-4" />
              AI Weekly Insights
            </button>
          </div>

          {/* Showcase Panel */}
          <div className="bs-card p-6 md:p-8 bg-surface border border-border rounded-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-border">
              <div>
                <h3 className="font-display text-2xl tracking-tight">{currentDetails.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{currentDetails.subtitle}</p>
              </div>
              
              {/* Section Tabs */}
              <div className="flex rounded-md border border-border p-1 bg-muted/40 w-full md:w-auto">
                <button
                  onClick={() => setActiveTab("features")}
                  className={`flex-1 md:flex-none px-3 py-1.5 rounded-sm text-xs font-medium transition-all ${
                    activeTab === "features" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Features
                </button>
                <button
                  onClick={() => setActiveTab("how")}
                  className={`flex-1 md:flex-none px-3 py-1.5 rounded-sm text-xs font-medium transition-all ${
                    activeTab === "how" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  How It Works
                </button>
                <button
                  onClick={() => setActiveTab("faq")}
                  className={`flex-1 md:flex-none px-3 py-1.5 rounded-sm text-xs font-medium transition-all ${
                    activeTab === "faq" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  FAQs
                </button>
              </div>
            </div>

            {/* Dynamic Content Panel */}
            <div className="pt-6 min-h-[260px] animate-in-up">
              {activeTab === "features" && (
                <div className="grid md:grid-cols-3 gap-6">
                  {currentDetails.features.map((item, i) => (
                    <div key={i} className="flex flex-col">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary grid place-items-center mb-3">
                        <Activity className="h-4 w-4" />
                      </div>
                      <h4 className="font-semibold text-[15px] mb-1.5 tracking-tight">{item.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "how" && (
                <div className="space-y-4">
                  {currentDetails.how.map((item, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-lg bg-muted/30 border border-border/60">
                      <div className="font-display text-2xl text-primary font-bold shrink-0">{item.step}</div>
                      <div>
                        <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "faq" && (
                <div className="space-y-4">
                  {currentDetails.faq.map((item, i) => (
                    <div key={i} className="rounded-lg border border-border p-4 bg-muted/20">
                      <h4 className="font-semibold text-sm flex items-center gap-2 text-foreground">
                        <HelpCircle className="h-3.5 w-3.5 text-primary" />
                        {item.q}
                      </h4>
                      <p className="mt-2 text-xs text-muted-foreground leading-relaxed pl-5">{item.a}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
};

export default Features;
