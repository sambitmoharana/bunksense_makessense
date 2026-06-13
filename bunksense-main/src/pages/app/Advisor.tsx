import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { useSubjects } from "@/hooks/useSubjects";
import { useTimetable } from "@/hooks/useTimetable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  Send,
  Calendar,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  BrainCircuit,
  MessageSquare,
  Zap,
  ChevronRight,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  HelpCircle as QuestionIcon
} from "lucide-react";
import { toast } from "sonner";

// Chat Message structure matching backend handler
type ChatMessage = {
  role: "user" | "model";
  content: string;
};

// Response metadata structure
type ResponseMeta = {
  overallPercent: number;
  totalBunkBudget: number;
  shortageCount: number;
  riskLevel: "low" | "medium" | "high";
  timetableAnalysis: {
    day: string;
    risk: "free" | "safe" | "warning" | "danger";
    classes: string[];
  }[];
};

export default function Advisor() {
  const { data: subjects = [], isLoading: loadingSubjects } = useSubjects();
  const { data: timetable = [], isLoading: loadingTimetable } = useTimetable();

  const [activeTab, setActiveTab] = useState<string>("insights");
  
  // Weekly Insights states
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsText, setInsightsText] = useState("");
  const [insightsMeta, setInsightsMeta] = useState<ResponseMeta | null>(null);
  const [insightsSource, setInsightsSource] = useState<"gemini" | "local-rules" | null>(null);

  // Chat states
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSource, setChatSource] = useState<"gemini" | "local-rules" | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load Weekly Insights on mount or when subjects are loaded
  useEffect(() => {
    if (subjects.length > 0 && !loadingSubjects && !loadingTimetable) {
      fetchWeeklyInsights();
    }
  }, [subjects.length, loadingSubjects, loadingTimetable]);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatLoading]);

  // Call backend for Weekly Insights
  const fetchWeeklyInsights = async () => {
    setInsightsLoading(true);
    try {
      const response = await fetch("/api/advisor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "insights",
          context: {
            subjects,
            timetable,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to load insights from backend.");
      }

      const data = await response.json();
      if (data.success) {
        setInsightsText(data.text);
        setInsightsMeta(data.meta);
        setInsightsSource(data.source);
      } else {
        throw new Error(data.error || "Unknown error generating insights.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Error loading weekly insights. Running locally.");
    } finally {
      setInsightsLoading(false);
    }
  };

  // Call backend for Chat response
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    if (!textToSend) {
      setInputValue("");
    }

    const updatedMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(updatedMessages);
    setChatLoading(true);

    try {
      const response = await fetch("/api/advisor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "chat",
          messages: updatedMessages,
          context: {
            subjects,
            timetable,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get chat response from server.");
      }

      const data = await response.json();
      if (data.success) {
        setMessages((prev) => [...prev, { role: "model", content: data.text }]);
        setChatSource(data.source);
      } else {
        throw new Error(data.error || "Unknown error generating response.");
      }
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: "Sorry, I had trouble communicating with the server. Please check your connection and try again.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSuggestClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  // Simple Markdown Formatter for rendering server text
  const parseBoldText = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="font-semibold text-foreground">{part}</strong>;
      }
      return part;
    });
  };

  const formatMarkdown = (text: string) => {
    if (!text) return null;
    return text.split("\n").map((line, i) => {
      const cleanLine = line.trim();
      if (cleanLine.startsWith("### ")) {
        return <h4 key={i} className="text-base font-semibold mt-4 mb-1.5 text-foreground">{cleanLine.slice(4)}</h4>;
      }
      if (cleanLine.startsWith("## ")) {
        return <h3 key={i} className="text-lg font-bold mt-5 mb-2.5 text-foreground">{cleanLine.slice(3)}</h3>;
      }
      if (cleanLine.startsWith("# ")) {
        return <h2 key={i} className="text-xl font-bold mt-6 mb-3 text-foreground">{cleanLine.slice(2)}</h2>;
      }
      if (cleanLine.startsWith("* ") || cleanLine.startsWith("- ")) {
        return (
          <li key={i} className="ml-5 list-disc text-sm text-muted-foreground my-1.5">
            {parseBoldText(cleanLine.slice(2))}
          </li>
        );
      }
      if (cleanLine === "") {
        return <div key={i} className="h-2" />;
      }
      return <p key={i} className="text-sm text-muted-foreground leading-relaxed my-1.5">{parseBoldText(line)}</p>;
    });
  };

  // Helper for status styles
  const getRiskDetails = (risk: string) => {
    switch (risk) {
      case "high":
      case "danger":
        return {
          bg: "bg-danger-muted/30 border-danger/30 text-danger",
          label: "High Risk",
          glow: "shadow-[0_0_15px_-3px_rgba(239,68,68,0.2)]",
        };
      case "medium":
      case "warning":
        return {
          bg: "bg-warning-muted/40 border-warning/30 text-warning-foreground",
          label: "Warning",
          glow: "shadow-[0_0_15px_-3px_rgba(245,158,11,0.2)]",
        };
      case "safe":
        return {
          bg: "bg-success-muted/40 border-success/30 text-success",
          label: "Safe",
          glow: "shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)]",
        };
      default:
        return {
          bg: "bg-muted/30 border-border/40 text-muted-foreground",
          label: "Free",
          glow: "",
        };
    }
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case "high": return "destructive";
      case "medium": return "secondary";
      default: return "default";
    }
  };

  // UI rendering if no subjects are configured
  if (!loadingSubjects && subjects.length === 0) {
    return (
      <ProtectedLayout>
        <div className="max-w-2xl mx-auto py-12 text-center">
          <div className="h-16 w-16 bg-accent rounded-2xl grid place-items-center mx-auto mb-6">
            <BrainCircuit className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl mb-3">Activate your AI Advisor</h1>
          <p className="text-muted-foreground mb-6">
            The AI Advisor requires subjects to analyze. Add subjects to start tracking attendance, planning classes, and receiving strategic weekly insights.
          </p>
          <Button asChild size="lg">
            <Link to="/app" className="gap-2">
              Go to Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-4xl">AI Advisor</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Personalized skip limits, recover plans, and schedule risks compiled by AI.
          </p>
        </div>
        
        {/* Source connection status badge */}
        <div className="flex items-center gap-2">
          {activeTab === "insights" && insightsSource && (
            <Badge variant="outline" className={insightsSource === "gemini" ? "text-success border-success/30 bg-success-muted/10" : "text-primary border-primary/30 bg-primary-muted/10"}>
              {insightsSource === "gemini" ? (
                <span className="flex items-center gap-1"><Zap className="h-3 w-3 fill-current" /> AI Active</span>
              ) : (
                <span className="flex items-center gap-1"><BrainCircuit className="h-3 w-3" /> Heuristics Active</span>
              )}
            </Badge>
          )}
          {activeTab === "chat" && chatSource && (
            <Badge variant="outline" className={chatSource === "gemini" ? "text-success border-success/30 bg-success-muted/10" : "text-primary border-primary/30 bg-primary-muted/10"}>
              {chatSource === "gemini" ? (
                <span className="flex items-center gap-1"><Zap className="h-3 w-3 fill-current" /> AI Active</span>
              ) : (
                <span className="flex items-center gap-1"><BrainCircuit className="h-3 w-3" /> Heuristics Active</span>
              )}
            </Badge>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="insights" className="gap-1.5">
            <Calendar className="h-4 w-4" /> Weekly Insights
          </TabsTrigger>
          <TabsTrigger value="chat" className="gap-1.5">
            <MessageSquare className="h-4 w-4" /> Advisor Chat
          </TabsTrigger>
        </TabsList>

        {/* -------------------- WEEKLY INSIGHTS TAB -------------------- */}
        <TabsContent value="insights" className="space-y-6 animate-in-up">
          {insightsLoading ? (
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <Card className="h-[380px] animate-pulse">
                  <CardHeader className="space-y-2">
                    <div className="h-6 bg-secondary rounded w-1/4" />
                    <div className="h-4 bg-secondary rounded w-1/2" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="h-4 bg-secondary rounded" />
                    <div className="h-4 bg-secondary rounded w-11/12" />
                    <div className="h-4 bg-secondary rounded w-10/12" />
                    <div className="h-4 bg-secondary rounded w-11/12" />
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-4">
                <Card className="h-[380px] animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-secondary rounded w-1/2" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="h-10 bg-secondary rounded" />
                    <div className="h-10 bg-secondary rounded" />
                    <div className="h-10 bg-secondary rounded" />
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {/* Left Column: AI Briefing Card */}
              <div className="md:col-span-2 space-y-6">
                <Card className="bs-card-elevated overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-primary-muted/20 to-transparent border-b border-border/40 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 grid place-items-center text-primary">
                        <Sparkles className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Your Weekly BunkSense Briefing</CardTitle>
                        <CardDescription className="text-[11px]">AI-synthesized report card & strategic outlook</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 pb-6 pr-6 pl-6 text-foreground/90">
                    {insightsText ? (
                      <div className="space-y-1 prose prose-sm dark:prose-invert">
                        {formatMarkdown(insightsText)}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-6">
                        No briefing generated. Check if your subjects are updated.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Risk Scorecard Grid */}
                {insightsMeta && (
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="bs-card p-4 flex flex-col justify-between h-[110px]">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Bunk Budget</span>
                      <div className="flex items-baseline gap-1.5 mt-2">
                        <span className="font-display text-4xl text-success font-semibold">
                          {insightsMeta.totalBunkBudget}
                        </span>
                        <span className="text-xs text-muted-foreground">periods</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground leading-none">missable this week</span>
                    </Card>

                    <Card className="bs-card p-4 flex flex-col justify-between h-[110px]">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Shortages</span>
                      <div className="flex items-baseline gap-1.5 mt-2">
                        <span className="font-display text-4xl text-danger font-semibold">
                          {insightsMeta.shortageCount}
                        </span>
                        <span className="text-xs text-muted-foreground">subjects</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground leading-none">below threshold</span>
                    </Card>

                    <Card className="bs-card p-4 flex flex-col justify-between h-[110px]">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Risk Level</span>
                      <div className="mt-2">
                        <Badge
                          variant={getRiskBadgeColor(insightsMeta.riskLevel)}
                          className="capitalize px-3 py-1 font-semibold text-xs tracking-wide"
                        >
                          {insightsMeta.riskLevel}
                        </Badge>
                      </div>
                      <span className="text-[10px] text-muted-foreground leading-none mt-1">overall schedule safety</span>
                    </Card>
                  </div>
                )}
              </div>

              {/* Right Column: Timetable Heatmap */}
              <div className="space-y-6">
                <Card className="bs-card h-full flex flex-col">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-md flex items-center gap-1.5 font-semibold">
                      <Calendar className="h-4.5 w-4.5 text-muted-foreground" /> Daily Risk Heatmap
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Bunk safety assessments mapped to your scheduled days
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    {insightsMeta?.timetableAnalysis && insightsMeta.timetableAnalysis.length > 0 ? (
                      <div className="space-y-2.5">
                        {insightsMeta.timetableAnalysis.map((d) => {
                          const r = getRiskDetails(d.risk);
                          return (
                            <div
                              key={d.day}
                              className={`flex items-center justify-between p-3 rounded-lg border text-sm transition-all duration-300 ${r.bg} ${r.glow}`}
                            >
                              <div className="min-w-0 pr-2">
                                <div className="font-semibold text-foreground">{d.day}</div>
                                <div className="text-xs text-muted-foreground truncate max-w-[170px] mt-0.5">
                                  {d.classes.length > 0 ? d.classes.join(", ") : "No classes scheduled"}
                                </div>
                              </div>
                              <Badge variant="outline" className={`shrink-0 text-[10px] font-bold py-0.5 px-2 border-current/25 bg-background/50`}>
                                {r.label}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground text-xs flex flex-col items-center justify-center h-full">
                        <AlertTriangle className="h-6 w-6 text-muted-foreground/60 mb-2" />
                        No schedule entries found.
                        <Link to="/app/planner" className="text-primary hover:underline font-semibold mt-2 inline-flex items-center gap-1">
                          Set up Timetable <ChevronRight className="h-3 w-3" />
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>

        {/* -------------------- ADVISOR CHATBOT TAB -------------------- */}
        <TabsContent value="chat" className="animate-in-up">
          <Card className="bs-card h-[620px] flex flex-col overflow-hidden">
            <CardHeader className="bg-secondary/40 border-b border-border/40 py-3 flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="text-md font-semibold flex items-center gap-2">
                  <BrainCircuit className="h-4.5 w-4.5 text-primary" /> BunkSense AI Advisor
                </CardTitle>
                <CardDescription className="text-xs">
                  Ask attendance queries, strategy blueprints, or skip viability reports.
                </CardDescription>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMessages([])}
                className="text-xs text-muted-foreground hover:text-foreground h-8"
              >
                Clear History
              </Button>
            </CardHeader>

            {/* Chat message display */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {/* Initial Advisor Message */}
                <div className="flex gap-3 max-w-[80%] items-start">
                  <div className="h-8 w-8 rounded-lg bg-primary grid place-items-center text-primary-foreground shrink-0 shadow-sm">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="bg-muted p-3.5 rounded-2xl rounded-tl-sm text-sm text-foreground shadow-sm">
                    <p className="leading-relaxed">
                      Hello! I am your **BunkSense AI Academic Advisor**. I analyze your current subjects attendance rates and weekly schedule.
                    </p>
                    <p className="leading-relaxed mt-2">
                      Ask me questions about when it is safe to skip a class, how to recover from an attendance shortage, or to generate a study strategy for you.
                    </p>
                  </div>
                </div>

                {/* Chat History */}
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 max-w-[80%] items-start ${m.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`h-8 w-8 rounded-lg grid place-items-center shrink-0 shadow-sm ${
                        m.role === "user" ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"
                      }`}
                    >
                      {m.role === "user" ? <UserIcon /> : <Sparkles className="h-4 w-4" />}
                    </div>
                    <div
                      className={`p-3.5 rounded-2xl text-sm shadow-sm leading-relaxed ${
                        m.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-muted text-foreground rounded-tl-sm"
                      }`}
                    >
                      <div className="space-y-1 prose prose-sm dark:prose-invert">
                        {m.role === "user" ? m.content : formatMarkdown(m.content)}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {chatLoading && (
                  <div className="flex gap-3 max-w-[80%] items-start">
                    <div className="h-8 w-8 rounded-lg bg-primary grid place-items-center text-primary-foreground shrink-0 animate-pulse">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="bg-muted p-4 rounded-2xl rounded-tl-sm text-sm shadow-sm flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>
            </ScrollArea>

            {/* suggestion chips */}
            {messages.length === 0 && !chatLoading && (
              <div className="px-4 py-2 border-t border-border/40 bg-secondary/10">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-2 font-medium">Suggested Questions</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleSuggestClick("Can I skip any classes today?")}
                    className="text-xs bg-card hover:bg-secondary border border-border text-foreground px-3 py-1.5 rounded-full transition-colors font-medium shadow-sm flex items-center gap-1"
                  >
                    <QuestionIcon className="h-3 w-3 text-muted-foreground" /> Can I skip any classes today?
                  </button>
                  <button
                    onClick={() => handleSuggestClick("How can I recover my attendance?")}
                    className="text-xs bg-card hover:bg-secondary border border-border text-foreground px-3 py-1.5 rounded-full transition-colors font-medium shadow-sm flex items-center gap-1"
                  >
                    <QuestionIcon className="h-3 w-3 text-muted-foreground" /> How do I recover my attendance?
                  </button>
                  <button
                    onClick={() => handleSuggestClick("What is my riskiest subject and how to fix it?")}
                    className="text-xs bg-card hover:bg-secondary border border-border text-foreground px-3 py-1.5 rounded-full transition-colors font-medium shadow-sm flex items-center gap-1"
                  >
                    <QuestionIcon className="h-3 w-3 text-muted-foreground" /> Which subject is most at risk?
                  </button>
                  <button
                    onClick={() => handleSuggestClick("Give me a weekly schedule risk analysis")}
                    className="text-xs bg-card hover:bg-secondary border border-border text-foreground px-3 py-1.5 rounded-full transition-colors font-medium shadow-sm flex items-center gap-1"
                  >
                    <QuestionIcon className="h-3 w-3 text-muted-foreground" /> Show my schedule risk analysis
                  </button>
                </div>
              </div>
            )}

            {/* Input field */}
            <div className="p-3.5 border-t border-border bg-card">
              <div className="flex gap-2">
                <Textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask BunkSense Advisor about attendance limits or recovery plans..."
                  className="min-h-[44px] h-[44px] max-h-[100px] resize-none pr-12 pt-3 pb-3 focus-visible:ring-1"
                  disabled={chatLoading}
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={chatLoading || !inputValue.trim()}
                  size="icon"
                  className="h-[44px] w-[44px] shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </ProtectedLayout>
  );
}

// Minimal user avatar icon
function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
