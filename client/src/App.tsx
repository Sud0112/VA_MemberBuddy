import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { CookieConsent } from "@/components/CookieConsent";
import { LandingPage } from "@/pages/LandingPage";
import { Login } from "@/pages/Login";
import { MemberPortal } from "@/pages/MemberPortal";
import { StaffDashboard } from "@/pages/StaffDashboard";
import { SalesPersona } from "@/pages/SalesPersona";
import { CustomerChurnAnalysis } from "@/pages/CustomerChurnAnalysis";
import VirtualTour from "@/pages/VirtualTour";
import { useAuthContext } from "@/contexts/AuthContext";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuthContext();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={isAuthenticated ? ((user as any)?.role === 'staff' ? StaffDashboard : MemberPortal) : LandingPage} />

      {/* Protected member routes */}
      <Route path="/portal">
        <ProtectedRoute requiredRole="member">
          <MemberPortal />
        </ProtectedRoute>
      </Route>

      {/* Protected staff routes */}
      <Route path="/staff">
        <ProtectedRoute requiredRole="staff">
          <StaffDashboard />
        </ProtectedRoute>
      </Route>

      <Route path="/sales">
        <ProtectedRoute requiredRole="staff">
          <SalesPersona />
        </ProtectedRoute>
      </Route>

      <Route path="/churn-analysis">
        <ProtectedRoute requiredRole="staff">
          <CustomerChurnAnalysis />
        </ProtectedRoute>
      </Route>

      {/* Login route */}
      <Route path="/login" component={Login} />

      {/* Virtual Tour route (public for email links) */}
      <Route path="/virtual-tour" component={VirtualTour} />

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
          <CookieConsent />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;