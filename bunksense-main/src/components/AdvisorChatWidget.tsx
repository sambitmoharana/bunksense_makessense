import { useState, useEffect, useRef } from "react";
import { useSubjects } from "@/hooks/useSubjects";
import { useTimetable } from "@/hooks/useTimetable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  Send,
  BrainCircuit,
  Zap,
  X,
  MessageSquare,
  HelpCircle as QuestionIcon
} from "lucide-react";

type ChatMessage = {
  role: "user" | "model";
  content: string;
};

export function AdvisorChatWidget() {
  const { data: subjects = [] } = useSubjects();
  const { data: timetable = [] } = useTimetable();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<"gemini" | "local-rules" | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages or loading changes
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    if (subjects.length === 0) {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: textToSend || inputValue },
        {
          role: "model",
          content: "I'd love to help, but you haven't added any subjects yet! Please go to the Dashboard and add your classes first so I have data to work with.",
        },
      ]);
      setInputValue("");
      return;
    }

    const text = (textToSend || inputValue).trim();
    if (!text) return;

    if (!textToSend) {
      setInputValue("");
    }

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setLoading(true);

    try {
      const response = await fetch("/api/advisor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "chat",
          messages: nextMessages,
          context: {
            subjects,
            timetable,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to reach server");
      }

      const data = await response.json();
      if (data.success) {
        setMessages((prev) => [...prev, { role: "model", content: data.text }]);
        setSource(data.source);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: "Sorry, I had trouble reaching the advisor server. Please verify your connection.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestClick = (suggestion: string) => {
    handleSend(suggestion);
  };

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
        return <h4 key={i} className="text-xs font-semibold mt-3 mb-1 text-foreground">{cleanLine.slice(4)}</h4>;
      }
      if (cleanLine.startsWith("## ") || cleanLine.startsWith("# ")) {
        return <h4 key={i} className="text-xs font-bold mt-3 mb-1 text-foreground">{cleanLine.replace(/[#\s]/g, "")}</h4>;
      }
      if (cleanLine.startsWith("* ") || cleanLine.startsWith("- ")) {
        return (
          <li key={i} className="ml-4 list-disc text-xs text-muted-foreground my-1">
            {parseBoldText(cleanLine.slice(2))}
          </li>
        );
      }
      if (cleanLine === "") {
        return <div key={i} className="h-1.5" />;
      }
      return <p key={i} className="text-xs text-muted-foreground leading-relaxed my-1">{parseBoldText(line)}</p>;
    });
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-50 cursor-pointer group"
        aria-label="Toggle AI Advisor Chatbot"
      >
        {isOpen ? (
          <X className="h-6 w-6 transition-transform group-hover:rotate-90" />
        ) : (
          <div className="relative">
            <MessageSquare className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-success rounded-full border-2 border-primary flex items-center justify-center">
              <span className="h-1.5 w-1.5 bg-white rounded-full animate-ping" />
            </span>
          </div>
        )}
      </button>

      {/* Floating Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-[385px] max-w-[calc(100vw-2rem)] h-[520px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 animate-in-up">
          {/* Header */}
          <CardHeader className="bg-secondary/40 border-b border-border/40 py-3 pr-4 pl-4 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-primary grid place-items-center text-primary-foreground shrink-0 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  BunkSense AI Advisor
                </CardTitle>
                <CardDescription className="text-[10px]">
                  Ask when to bunk or how to recover
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {source && (
                <Badge variant="outline" className={`text-[9px] px-1 py-0 border-current/25 bg-background/50`}>
                  {source === "gemini" ? "AI Active" : "Heuristics"}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          {/* Chat Messages */}
          <ScrollArea className="flex-1 p-3.5">
            <div className="space-y-3.5">
              {/* Introduction bubble */}
              <div className="flex gap-2 max-w-[85%] items-start">
                <div className="h-7 w-7 rounded-lg bg-primary grid place-items-center text-primary-foreground shrink-0 shadow-sm">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div className="bg-muted p-3 rounded-xl rounded-tl-sm text-xs text-foreground shadow-sm leading-relaxed">
                  {subjects.length === 0 ? (
                    <>
                      Hi! I'm your **BunkSense AI Advisor**. It looks like you haven't added any subjects to your dashboard yet.
                      <p className="mt-1.5 font-medium text-[11px] text-primary">
                        Please add subjects on the Dashboard first so I have attendance data to advise you on!
                      </p>
                    </>
                  ) : (
                    <>
                      Hi! I'm your **BunkSense AI Advisor**. I analyze your subjects and schedule to answer:
                      <div className="mt-1 space-y-1">
                        <div>- *Can I skip Physics tomorrow?*</div>
                        <div>- *How can I recover my Chemistry attendance?*</div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Chat turns */}
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2 max-w-[85%] items-start ${m.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
                >
                  <div
                    className={`h-7 w-7 rounded-lg grid place-items-center shrink-0 shadow-sm ${
                      m.role === "user" ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {m.role === "user" ? (
                      <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    ) : (
                      <Sparkles className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <div
                    className={`p-3 rounded-xl text-xs shadow-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted text-foreground rounded-tl-sm"
                    }`}
                  >
                    {m.role === "user" ? m.content : formatMarkdown(m.content)}
                  </div>
                </div>
              ))}

              {/* Loader */}
              {loading && (
                <div className="flex gap-2 max-w-[85%] items-start">
                  <div className="h-7 w-7 rounded-lg bg-primary grid place-items-center text-primary-foreground shrink-0 animate-pulse">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <div className="bg-muted p-3 rounded-xl rounded-tl-sm text-xs shadow-sm flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Quick suggestions */}
          {messages.length === 0 && !loading && (
            <div className="px-3.5 py-2 border-t border-border/40 bg-secondary/15 flex flex-col gap-1.5">
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider block font-semibold">Suggested Questions</span>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => handleSuggestClick("Can I skip any classes today?")}
                  className="text-[11px] text-left hover:bg-secondary border border-border bg-card text-foreground px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-sm font-medium"
                >
                  <QuestionIcon className="h-3 w-3 text-muted-foreground shrink-0" /> Can I skip any classes today?
                </button>
                <button
                  onClick={() => handleSuggestClick("How can I recover my attendance?")}
                  className="text-[11px] text-left hover:bg-secondary border border-border bg-card text-foreground px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-sm font-medium"
                >
                  <QuestionIcon className="h-3 w-3 text-muted-foreground shrink-0" /> How do I recover my attendance?
                </button>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 border-t border-border bg-card">
            <div className="flex gap-2">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask AI Advisor..."
                className="min-h-[36px] h-[36px] max-h-[80px] resize-none pr-10 pt-2 pb-2 text-xs focus-visible:ring-1"
                disabled={loading}
              />
              <Button
                onClick={() => handleSend()}
                disabled={loading || !inputValue.trim()}
                size="icon"
                className="h-[36px] w-[36px] shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}
