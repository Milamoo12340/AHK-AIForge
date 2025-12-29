import { Link, useLocation } from "wouter";
import { Terminal, Library, Settings, Disc, Box } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Generator", icon: Terminal, href: "/" },
  { label: "Library", icon: Library, href: "/library" },
  { label: "Recorder", icon: Disc, href: "/recorder" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export function Navigation() {
  const [location] = useLocation();

  return (
    <div className="w-64 h-screen bg-card border-r border-border flex flex-col hidden md:flex">
      <div className="p-6 flex items-center gap-3 border-b border-border/50">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <Box className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight">AHK Forge</h1>
          <p className="text-xs text-muted-foreground">AI Script Engine</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/50">
        <div className="bg-secondary/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Status</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium">System Online</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MobileNav() {
  const [location] = useLocation();
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden z-50">
      <div className="flex justify-around items-center p-2">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
               <div className={cn(
                 "flex flex-col items-center gap-1 p-2 rounded-lg cursor-pointer",
                 isActive ? "text-primary" : "text-muted-foreground"
               )}>
                 <item.icon className="w-5 h-5" />
                 <span className="text-[10px] font-medium">{item.label}</span>
               </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
