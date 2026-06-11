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
import { SignOut } from "@/pages/SignOut";
import { Directory } from "@/pages/Directory";
import { ProfileDetail } from "@/pages/ProfileDetail";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Brand from "@/pages/Brand";
import Pricing from "@/pages/Pricing";
import Monetize from "@/pages/Monetize";
import Incorporation from "@/pages/Incorporation";
import CapTable from "@/pages/CapTable";
import Risk from "@/pages/Risk";
import PreExisting from "@/pages/PreExisting";
import { Xprize } from "@/pages/Xprize";
import { Admin } from "@/pages/Admin";
import { Architecture } from "@/pages/Architecture";
import ApiDirectory from "@/pages/ApiDirectory";
import { CitizenX } from "@/pages/CitizenX";
import { CitizenXOrganize } from "@/pages/CitizenXOrganize";
import { CitizenXHost } from "@/pages/CitizenXHost";
import { CitizenXEventDetail } from "@/pages/CitizenXEventDetail";
import { CitizenXPublish } from "@/pages/CitizenXPublish";
import { CitizenXExperiments } from "@/pages/CitizenXExperiments";
import { CitizenXExperimentDetail } from "@/pages/CitizenXExperimentDetail";

import { AppShell } from "@/components/AppShell";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";
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
      <Route path="/sign-out" component={SignOut} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/brand" component={Brand} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/monetize" component={Monetize} />
      <Route path="/monitize" component={Monetize} />
      <Route path="/incorporation" component={Incorporation} />
      <Route path="/cap-table" component={CapTable} />
      <Route path="/risk" component={Risk} />
      <Route path="/pre-existing" component={PreExisting} />
      <Route path="/architecture" component={Architecture} />
      <Route path="/api" component={ApiDirectory} />
      <Route path="/apis" component={ApiDirectory} />
      {import.meta.env.DEV && <Route path="/xprize" component={Xprize} />}

      {/* CitizenX program */}
      <Route path="/citizenx">
        <AppShell><CitizenX /></AppShell>
      </Route>
      <Route path="/citizenx/experiments">
        <AppShell><CitizenXExperiments /></AppShell>
      </Route>
      <Route path="/citizenx/experiments/:slug">
        <AppShell><CitizenXExperimentDetail /></AppShell>
      </Route>
      <Route path="/citizenx/events/:slug">
        <AppShell><CitizenXEventDetail /></AppShell>
      </Route>
      <Route path="/citizenx/organize">
        <ProtectedRoute><AppShell><CitizenXOrganize /></AppShell></ProtectedRoute>
      </Route>
      <Route path="/citizenx/host">
        <ProtectedRoute><AppShell><CitizenXHost /></AppShell></ProtectedRoute>
      </Route>
      <Route path="/citizenx/publish">
        <ProtectedRoute><AppShell><CitizenXPublish /></AppShell></ProtectedRoute>
      </Route>
      
      {/* Protected Routes */}
      <Route path="/onboarding">
        <ProtectedRoute><Onboarding /></ProtectedRoute>
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute><AppShell><Dashboard /></AppShell></ProtectedRoute>
      </Route>
      <Route path="/agent">
        <AppShell><Agent /></AppShell>
      </Route>
      <Route path="/categories">
        <AppShell><Categories /></AppShell>
      </Route>
      <Route path="/category/:slug">
        <AppShell><Category /></AppShell>
      </Route>
      <Route path="/experiments">
        <AppShell><Experiments /></AppShell>
      </Route>
      <Route path="/experiments/:id">
        <AppShell><ExperimentDetail /></AppShell>
      </Route>
      <Route path="/directory">
        <AppShell><Directory /></AppShell>
      </Route>
      <Route path="/directory/:slug">
        <AppShell><ProfileDetail /></AppShell>
      </Route>
      <Route path="/notebook">
        <ProtectedRoute><AppShell><Notebook /></AppShell></ProtectedRoute>
      </Route>
      <Route path="/progress">
        <ProtectedRoute><AppShell><ProgressPage /></AppShell></ProtectedRoute>
      </Route>
      <Route path="/profile">
        <AppShell><Profile /></AppShell>
      </Route>
      <Route path="/admin">
        <AdminRoute><AppShell><Admin /></AppShell></AdminRoute>
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
