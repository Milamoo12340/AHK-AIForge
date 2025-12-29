import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation, MobileNav } from "@/components/Navigation";
import NotFound from "@/pages/not-found";
import Generator from "@/pages/Generator";
import Library from "@/pages/Library";
import Recorder from "@/pages/Recorder";
import Settings from "@/pages/Settings";

function Router() {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Navigation />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <Switch>
            <Route path="/" component={Generator} />
            <Route path="/library" component={Library} />
            <Route path="/recorder" component={Recorder} />
            <Route path="/settings" component={Settings} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
