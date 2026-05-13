import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DetectionProvider } from "@/hooks/use-detection-data";
import { UserProvider, useUser } from "@/context/user-context";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import { useEffect } from "react";

function AuthGuard() {
  const { user } = useUser();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!user && location !== "/") {
      setLocation("/");
    } else if (user && location === "/") {
      setLocation("/dashboard");
    }
  }, [user, location, setLocation]);

  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <DetectionProvider>
          <TooltipProvider>
            <div className="dark">
              <Toaster />
              <AuthGuard />
            </div>
          </TooltipProvider>
        </DetectionProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
