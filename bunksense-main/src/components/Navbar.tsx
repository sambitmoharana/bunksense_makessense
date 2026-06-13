import { Link, useLocation, useNavigate } from "react-router-dom";
import { Moon, Sun, LogOut, Sparkles, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useState } from "react";

const Logo = () => (
  <Link to="/" className="flex items-center gap-2 group">
    <img src={logo} alt="BunkSense logo" className="w-8 h-8 rounded-lg object-cover" />
    <span className="font-semibold tracking-tight text-[15px]">BunkSense</span>
  </Link>
);

export const Navbar = () => {
  const { theme, toggle } = useTheme();
  const { user, signOut } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const onApp = loc.pathname.startsWith("/app");
  const [isOpen, setIsOpen] = useState(false);

  const links = onApp
    ? [
        { to: "/app", label: "Dashboard", end: true },
        { to: "/app/subjects", label: "Subjects" },
        { to: "/app/simulator", label: "Simulator" },
        { to: "/app/planner", label: "Planner" },
        { to: "/app/analytics", label: "Analytics" },
        { to: "/app/advisor", label: "AI Advisor" },
      ]
    : [
        { to: "/features", label: "Features" },
        { to: "/how-it-works", label: "How it works" },
        { to: "/faq", label: "FAQ" },
      ];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border">
      <div className="container flex h-14 items-center justify-between gap-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => {
              const active = l.end ? loc.pathname === l.to : loc.pathname.startsWith(l.to);
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors",
                    active && "text-foreground bg-secondary",
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                {!onApp && (
                  <Button size="sm" onClick={() => nav("/app")}>Open app</Button>
                )}
                <Button variant="ghost" size="icon" onClick={async () => { await signOut(); nav("/"); }} aria-label="Sign out">
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => nav("/auth")}>Sign in</Button>
                <Button size="sm" onClick={() => nav("/auth?mode=signup")} className="gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> Get started
                </Button>
              </>
            )}
          </div>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80vw] sm:w-[350px]">
              <SheetHeader className="mb-4 text-left">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-2">
                {links.map((l) => {
                  const active = l.end ? loc.pathname === l.to : loc.pathname.startsWith(l.to);
                  return (
                    <Link
                      key={l.to}
                      to={l.to}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        active 
                          ? "bg-secondary text-foreground" 
                          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                      )}
                    >
                      {l.label}
                    </Link>
                  );
                })}
              </nav>
              
              <div className="mt-8 pt-6 border-t flex flex-col gap-3">
                {user ? (
                  <>
                    {!onApp && (
                      <Button onClick={() => { setIsOpen(false); nav("/app"); }} className="w-full">
                        Open app
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      onClick={async () => { setIsOpen(false); await signOut(); nav("/"); }}
                      className="w-full gap-2"
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => { setIsOpen(false); nav("/auth"); }} className="w-full">
                      Sign in
                    </Button>
                    <Button onClick={() => { setIsOpen(false); nav("/auth?mode=signup"); }} className="w-full gap-2">
                      <Sparkles className="h-4 w-4" /> Get started
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
