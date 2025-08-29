import { Sidebar, SidebarContent, SidebarProvider, SidebarInset, SidebarHeader } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Dumbbell, 
  LayoutDashboard, 
  Gift, 
  User, 
  LogOut,
  TrendingUp,
  Megaphone,
  Users,
  Mail,
  Shield,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { NotificationCenter } from "@/components/NotificationCenter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: "member" | "staff";
}

export function AppLayout({ children, activeTab, onTabChange, userRole }: LayoutProps) {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleSignOut = () => {
    window.location.href = "/api/logout";
  };

  const toggleRoleMutation = useMutation({
    mutationFn: async () => {
      const newRole = user?.role === 'staff' ? 'member' : 'staff';
      const response = await apiRequest('POST', '/api/user/toggle-role', { role: newRole });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: 'Role Updated',
        description: `Switched to ${user?.role === 'staff' ? 'Member' : 'Staff'} mode. Page will reload.`,
      });
      // Reload to update the interface
      setTimeout(() => window.location.reload(), 1000);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to toggle role. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const memberTabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "workout-planner", label: "AI Workout Planner", icon: Dumbbell },
    { id: "loyalty-rewards", label: "Loyalty Rewards", icon: Gift },
    { id: "profile", label: "Profile", icon: User },
  ];

  const staffTabs = [
    { id: "churn-prediction", label: "Churn Prediction", icon: TrendingUp },
    { id: "churn-emails", label: "Churn Emails", icon: Mail },
    { id: "loyalty-campaigns", label: "Loyalty Campaigns", icon: Megaphone },
    { id: "member-analytics", label: "Member Analytics", icon: Users },
  ];

  const tabs = userRole === "staff" ? staffTabs : memberTabs;
  const primaryColor = userRole === "staff" ? "text-blue-600 bg-blue-50" : "text-primary bg-primary/10";
  const roleDisplayName = userRole === "staff" ? "Staff Member" : `${user?.membershipType || "Basic"} Member`;

  return (
    <SidebarProvider>
      <Sidebar className="w-64">
        <SidebarHeader className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
              <Dumbbell className="text-white h-4 w-4" />
            </div>
            <span className="text-xl font-bold text-gray-900">Member Buddy</span>
          </div>

          {/* User Profile */}
          <div className={`bg-gradient-to-br ${userRole === "staff" ? "from-blue-50 to-purple-50" : "from-primary/5 to-blue-50"} p-4 rounded-xl mb-6`}>
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className={userRole === "staff" ? "bg-blue-600 text-white" : "bg-primary text-white"}>
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-gray-900" data-testid="text-user-name">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-sm text-gray-600">{roleDisplayName}</p>
              </div>
            </div>
            {userRole === "member" && (
              <div className="flex items-center gap-2 text-sm text-primary">
                <Shield className="h-4 w-4" />
                <span data-testid="text-loyalty-points">{user?.loyaltyPoints}</span>
                <span>points</span>
              </div>
            )}
            {userRole === "staff" && (
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <Shield className="h-4 w-4" />
                <span>Member Relations</span>
              </div>
            )}
            
            {/* Role Toggle for Testing - Development Only */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Persona Testing:</span>
                <Badge variant={userRole === "staff" ? "default" : "secondary"} className="text-xs">
                  {userRole === "staff" ? "Staff" : "Member"}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2 text-xs justify-start gap-2 text-gray-600 hover:text-gray-900"
                onClick={() => toggleRoleMutation.mutate()}
                disabled={toggleRoleMutation.isPending}
                data-testid="button-toggle-role"
              >
                {user?.role === 'staff' ? <ToggleRight className="h-3 w-3" /> : <ToggleLeft className="h-3 w-3" />}
                <span>
                  {toggleRoleMutation.isPending ? 'Switching...' : 
                   `Switch to ${user?.role === 'staff' ? 'Member' : 'Staff'}`}
                </span>
              </Button>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-6">
          {/* Navigation */}
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant="ghost"
                className={`w-full justify-start gap-3 ${
                  activeTab === tab.id ? primaryColor : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
                onClick={() => onTabChange(tab.id)}
                data-testid={`nav-${tab.id}`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </Button>
            ))}
          </nav>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-gray-600 hover:text-red-600"
              onClick={handleSignOut}
              data-testid="button-sign-out"
            >
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </Button>
          </div>
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="flex-1">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
