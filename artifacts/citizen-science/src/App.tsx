import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { Landing } from "@/pages/Landing";
import { Login } from "@/pages/Login";
import { Onboarding } from "@/pages/Onboarding";
import { Dashboard } from "@/pages/Dashboard";
import { Agent } from "@/pages/Agent";
import { Categories } from "@/pages/Categories";
import { Category } from "@/pages/Category";
import { Experiments } from "@/pages/Experiments";
import { ExperimentDetail } from "@/pages/ExperimentDetail";
import { Notebook } from "@/pages/Notebook";
import { ProgressPage } from "@/pages/Progress";
import { Profile } from "@/pages/Profile";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Brand from "@/pages/Brand";

import { AppShell } from "@/components/AppShell";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthProvider } from "@/lib/auth";

const queryClient = new QueryClient();

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location]);
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/brand" component={Brand} />
      
      {/* Protected Routes */}
      <Route path="/onboarding">
        <ProtectedRoute><Onboarding /></ProtectedRoute>
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute><AppShell><Dashboard /></AppShell></ProtectedRoute>
      </Route>
      <Route path="/agent">
        <ProtectedRoute><AppShell><Agent /></AppShell></ProtectedRoute>
      </Route>
      <Route path="/categories">
        <ProtectedRoute><AppShell><Categories /></AppShell></ProtectedRoute>
      </Route>
      <Route path="/category/:slug">
        <ProtectedRoute><AppShell><Category /></AppShell></ProtectedRoute>
      </Route>
      <Route path="/experiments">
        <ProtectedRoute><AppShell><Experiments /></AppShell></ProtectedRoute>
      </Route>
      <Route path="/experiments/:id">
        <ProtectedRoute><AppShell><ExperimentDetail /></AppShell></ProtectedRoute>
      </Route>
      <Route path="/notebook">
        <ProtectedRoute><AppShell><Notebook /></AppShell></ProtectedRoute>
      </Route>
      <Route path="/progress">
        <ProtectedRoute><AppShell><ProgressPage /></AppShell></ProtectedRoute>
      </Route>
      <Route path="/profile">
        <ProtectedRoute><AppShell><Profile /></AppShell></ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <ScrollToTop />
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
