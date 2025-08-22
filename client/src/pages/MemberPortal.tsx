import { useState } from "react";
import { AppLayout } from "@/components/ui/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Flame, 
  Star, 
  Brain, 
  Gift,
  TrendingUp
} from "lucide-react";
import { WorkoutPlanner } from "@/pages/WorkoutPlanner";
import { LoyaltyRewards } from "@/pages/LoyaltyRewards";
import { useAuthContext } from "@/contexts/AuthContext";

export function MemberPortal() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user } = useAuthContext();

  const renderContent = () => {
    switch (activeTab) {
      case "workout-planner":
        return <WorkoutPlanner />;
      case "loyalty-rewards":
        return <LoyaltyRewards />;
      case "profile":
        return <ProfilePage />;
      default:
        return <MemberDashboard onTabChange={setActiveTab} />;
    }
  };

  return (
    <AppLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      userRole="member"
    >
      {renderContent()}
    </AppLayout>
  );
}

function MemberDashboard({ onTabChange }: { onTabChange: (tab: string) => void }) {
  const { user } = useAuthContext();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, <span data-testid="text-user-first-name">{user?.firstName}</span>!
        </h1>
        <p className="text-gray-600">Ready to crush your fitness goals today?</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Stats */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Calendar className="text-blue-600 h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">This Month</h3>
                <p className="text-2xl font-bold text-gray-900" data-testid="text-monthly-visits">12</p>
                <p className="text-sm text-gray-600">gym visits</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Flame className="text-green-600 h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Streak</h3>
                <p className="text-2xl font-bold text-gray-900" data-testid="text-current-streak">7</p>
                <p className="text-sm text-gray-600">days active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Star className="text-primary h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Points Available</h3>
                <p className="text-2xl font-bold text-gray-900" data-testid="text-available-points">
                  {user?.loyaltyPoints}
                </p>
                <p className="text-sm text-gray-600">loyalty points</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-primary to-primary/90 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">AI Workout Planner</h3>
                <p className="text-primary-foreground/80">Get a personalized workout plan</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Brain className="text-white h-6 w-6" />
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={() => onTabChange("workout-planner")}
              className="bg-white text-primary hover:bg-gray-50"
              data-testid="button-create-plan"
            >
              Create Plan
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">Loyalty Rewards</h3>
                <p className="text-blue-100">Redeem your points for rewards</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Gift className="text-white h-6 w-6" />
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={() => onTabChange("loyalty-rewards")}
              className="bg-white text-blue-600 hover:bg-gray-50"
              data-testid="button-view-rewards"
            >
              View Rewards
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ProfilePage() {
  const { user } = useAuthContext();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
        <p className="text-gray-600">Manage your account information and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <div className="p-3 bg-gray-50 rounded-lg text-gray-900" data-testid="text-profile-first-name">
                {user?.firstName}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <div className="p-3 bg-gray-50 rounded-lg text-gray-900" data-testid="text-profile-last-name">
                {user?.lastName}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="p-3 bg-gray-50 rounded-lg text-gray-900" data-testid="text-profile-email">
                {user?.email}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Membership Type</label>
              <div className="p-3 bg-gray-50 rounded-lg text-gray-900 capitalize" data-testid="text-profile-membership">
                {user?.membershipType}
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Loyalty Points</h3>
                <p className="text-gray-600">Your current reward balance</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary" data-testid="text-profile-points">
                  {user?.loyaltyPoints}
                </p>
                <p className="text-sm text-gray-600">points</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
