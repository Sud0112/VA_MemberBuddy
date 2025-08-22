import { Sidebar, SidebarContent, SidebarProvider, SidebarInset, SidebarHeader } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Dumbbell, 
  LayoutDashboard, 
  Gift, 
  User, 
  LogOut,
  TrendingUp,
  Megaphone,
  Users,
  Shield
} from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: "member" | "staff";
}

export function AppLayout({ children, activeTab, onTabChange, userRole }: LayoutProps) {
  const { user } = useAuthContext();

  const handleSignOut = () => {
    window.location.href = "/api/logout";
  };

  const memberTabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "workout-planner", label: "AI Workout Planner", icon: Dumbbell },
    { id: "loyalty-rewards", label: "Loyalty Rewards", icon: Gift },
    { id: "profile", label: "Profile", icon: User },
  ];

  const staffTabs = [
    { id: "churn-prediction", label: "Churn Prediction", icon: TrendingUp },
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
            <span className="text-xl font-bold text-gray-900">ClubPulse AI</span>
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
