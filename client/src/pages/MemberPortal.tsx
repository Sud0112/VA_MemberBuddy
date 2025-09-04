import { useState } from "react";
import { AppLayout } from "@/components/ui/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
// Progress component implemented inline
import { 
  Calendar, 
  Flame, 
  Star, 
  Brain, 
  Gift,
  TrendingUp,
  Target,
  Activity,
  Trophy,
  Clock,
  BarChart3
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Tooltip as RechartsTooltip } from "recharts";
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
      case "workout-history":
        return <WorkoutHistory />;
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

  // Mock progress data for demonstration
  const weeklyActivity = [
    { day: 'Mon', visits: 1, goal: 1 },
    { day: 'Tue', visits: 1, goal: 1 },
    { day: 'Wed', visits: 0, goal: 1 },
    { day: 'Thu', visits: 1, goal: 1 },
    { day: 'Fri', visits: 1, goal: 1 },
    { day: 'Sat', visits: 1, goal: 1 },
    { day: 'Sun', visits: 0, goal: 1 }
  ];

  const monthlyProgress = [
    { week: 'Week 1', visits: 5 },
    { week: 'Week 2', visits: 4 },
    { week: 'Week 3', visits: 6 },
    { week: 'Week 4', visits: 3 }
  ];

  const workoutTypes = [
    { name: 'Cardio', value: 45, color: '#8b5cf6' },
    { name: 'Strength', value: 35, color: '#06b6d4' },
    { name: 'Flexibility', value: 20, color: '#f97316' }
  ];

  const currentStreak = 3;
  const monthlyGoal = 20;
  const currentVisits = 8;
  const goalProgress = (currentVisits / monthlyGoal) * 100;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Virgin Active Style Hero Banner */}
      <div className="mb-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-500 to-red-700 opacity-5"></div>
        
        {/* Main Content */}
        <div className="relative p-8 lg:p-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="mb-6">
                  <span className="inline-block px-4 py-2 bg-red-600 text-white text-sm font-bold uppercase tracking-wider rounded-full mb-4">
                    Premium Member
                  </span>
                  <h1 className="text-4xl lg:text-6xl font-black tracking-tight text-gray-900 leading-tight mb-6">
                    WELCOME TO{" "}
                    <span className="text-red-600 block">REAL WELLNESS</span>
                  </h1>
                  <p className="text-xl text-gray-700 leading-relaxed mb-8 max-w-lg">
                    Ready to get back on track? We've got some great offers to help you reach your goals.
                  </p>
                </div>
                
                {/* Member Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-black text-red-600">{user?.loyaltyPoints || 0}</div>
                    <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Loyalty Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-gray-900">{new Date().getFullYear() - (user?.joinDate ? new Date(user.joinDate).getFullYear() : new Date().getFullYear() - 2)}Y</div>
                    <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Member Since</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-gray-900">{user?.membershipType || 'Premium'}</div>
                    <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Plan</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-gray-900">Active</div>
                    <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Status</div>
                  </div>
                </div>
              </div>
              
              {/* Right Side - Member Photo Placeholder */}
              <div className="hidden lg:block">
                <div className="relative">
                  <div className="w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-white text-2xl font-bold">{user?.firstName?.charAt(0) || 'M'}</span>
                      </div>
                      <p className="text-gray-600 font-semibold">{user?.firstName || 'Member'} - {user?.membershipType || 'Premium'} Member</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real Wellness Features Section */}
      <div className="mb-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-12 text-center">
            Your membership. Endless possibilities.
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Gift className="text-white h-8 w-8" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Real rewards</h3>
              <p className="text-sm text-gray-600 leading-relaxed">instant goodies & partner discounts for staying active</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Activity className="text-white h-8 w-8" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Real endorphins</h3>
              <p className="text-sm text-gray-600 leading-relaxed">spacious gym floors & unlimited exercise classes</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="text-white h-8 w-8" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Real progress</h3>
              <p className="text-sm text-gray-600 leading-relaxed">personal training & nutrition coaching</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Brain className="text-white h-8 w-8" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Real relaxation</h3>
              <p className="text-sm text-gray-600 leading-relaxed">pools, saunas & steam rooms</p>
            </div>
          </div>
        </div>
      </div>

      {/* Your Progress Dashboard */}
      <div className="mb-16">
        <h2 className="text-2xl lg:text-3xl font-black text-gray-900 mb-8">Your progress dashboard</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-0 bg-white shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center">
                <Calendar className="text-white h-6 w-6" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-gray-900" data-testid="text-monthly-visits">{currentVisits}</p>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">of {monthlyGoal} visits</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-900 font-bold">Monthly Goal</span>
                <span className="text-sm font-black text-red-600">{Math.round(goalProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-red-600 h-3 rounded-full transition-all duration-500" 
                  style={{ width: `${goalProgress}%` }}
                />
              </div>
              {goalProgress < 50 && (
                <div className="text-xs text-gray-900 font-bold">
                  You've got this! Let's reach that goal!
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-0 bg-white shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center">
                <Flame className="text-white h-6 w-6" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-gray-900" data-testid="text-current-streak">{currentStreak}</p>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Day Streak</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-900 font-bold">Keep the momentum!</div>
              <div className="text-xs text-gray-600">
                Visit today to maintain your streak
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-0 bg-white shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center">
                <Trophy className="text-white h-6 w-6" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-gray-900">Gold</p>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Member Status</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-900 font-bold">Premium Benefits Active</div>
              <div className="text-xs text-gray-600">
                Personal Trainer Included
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-0 bg-white shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center">
                <Clock className="text-white h-6 w-6" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-gray-900">2.5</p>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Avg Hours/Visit</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-900 font-bold">Great consistency!</div>
              <div className="text-xs text-gray-600">
                Optimal workout duration
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>

      {/* Progress Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card className="border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-slate-600" />
              Weekly Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyActivity} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <XAxis 
                    dataKey="day" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#6b7280' }}
                    domain={[0, 'dataMax + 0.5']}
                  />
                  <RechartsTooltip 
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '12px'
                    }}
                    formatter={(value) => [`${value} visit${value !== 1 ? 's' : ''}`, 'Daily Activity']}
                  />
                  <Bar 
                    dataKey="visits" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                    stroke="hsl(var(--primary))"
                    strokeWidth={1}
                  >
                    {weeklyActivity.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.visits > 0 ? 'hsl(var(--primary))' : '#e5e7eb'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 bg-gradient-to-r from-white to-gray-50 px-3 py-2 rounded-lg shadow-md border">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span className="text-gray-900 font-semibold">Workout completed</span>
              </div>
              <div className="flex items-center gap-2 bg-gradient-to-r from-white to-gray-50 px-3 py-2 rounded-lg shadow-md border">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span className="text-gray-900 font-semibold">Rest day</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Target className="h-5 w-5 text-slate-600" />
              Workout Focus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={workoutTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="white"
                    strokeWidth={2}
                  >
                    {workoutTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '12px'
                    }}
                    formatter={(value) => [`${value}%`, 'Workout Time']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6">
              {workoutTypes.map((type, index) => (
                <div key={index} className="text-center bg-gradient-to-br from-white to-blue-50 p-3 rounded-lg shadow-md border">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-300 shadow-sm" 
                      style={{ backgroundColor: type.color }}
                    />
                    <span className="text-sm font-bold text-gray-900">{type.name}</span>
                  </div>
                  <div className="text-xl font-bold text-gray-900">{type.value}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-blue-50/80 to-cyan-50/60 text-gray-900 relative overflow-hidden hover:shadow-lg transition-all duration-300 border border-slate-200/60 shadow-sm hover:border-blue-300/60">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                  🤖 AI Workout Planner
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">Get a personalized workout plan tailored to your goals</p>
              </div>
              <div className="w-12 h-12 bg-white/40 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Brain className="text-primary h-6 w-6" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    onClick={() => onTabChange("workout-planner")}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 font-semibold shadow-md"
                    data-testid="button-create-plan"
                  >
                    Create Plan ✨
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>🤖 Let AI design the perfect workout just for you!</p>
                </TooltipContent>
              </Tooltip>
              <div className="text-xs text-gray-700 font-medium bg-primary/5 border border-primary/20 px-2 py-1 rounded">
                AI-powered recommendations
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50/80 to-blue-50/60 text-gray-900 relative overflow-hidden hover:shadow-lg transition-all duration-300 border border-slate-200/60 shadow-sm hover:border-indigo-300/60">
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 -translate-x-8"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                  🎁 Loyalty Rewards
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">Redeem your {user?.loyaltyPoints} points for exclusive rewards</p>
              </div>
              <div className="w-12 h-12 bg-white/40 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Gift className="text-blue-600 h-6 w-6" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    onClick={() => onTabChange("loyalty-rewards")}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 font-semibold shadow-md"
                    data-testid="button-view-rewards"
                  >
                    View Rewards 🏆
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>🎁 Discover amazing perks you've earned!</p>
                </TooltipContent>
              </Tooltip>
              <div className="text-xs text-gray-700 font-medium bg-blue-50 border border-blue-200 px-2 py-1 rounded">
                8 rewards available
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Quick Access to Workout History */}
      <div className="mt-8">
        <Card className="bg-gradient-to-br from-green-50/80 to-emerald-50/60 text-gray-900 relative overflow-hidden hover:shadow-lg transition-all duration-300 border border-slate-200/60 shadow-sm hover:border-green-300/60">
          <div className="absolute top-0 left-1/2 w-24 h-24 bg-white/10 rounded-full -translate-y-12 -translate-x-12"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                  📊 Workout History
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">Track your progress and view past workouts</p>
              </div>
              <div className="w-12 h-12 bg-white/60 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <BarChart3 className="text-green-600 h-6 w-6" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    onClick={() => onTabChange("workout-history")}
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 font-semibold shadow-md"
                    data-testid="button-view-history"
                  >
                    View History 📈
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>📊 See your incredible fitness journey progress!</p>
                </TooltipContent>
              </Tooltip>
              <div className="text-xs text-gray-700 font-medium bg-green-50 border border-green-200 px-2 py-1 rounded">
                {currentVisits} workouts this month
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function WorkoutHistory() {
  // Mock workout history data
  const workoutHistory = [
    {
      id: 1,
      date: "2024-08-20",
      type: "Upper Body Strength",
      duration: 75,
      exercises: 8,
      caloriesBurned: 420,
      notes: "Great session! Increased bench press weight."
    },
    {
      id: 2,
      date: "2024-08-18", 
      type: "Cardio & Core",
      duration: 45,
      exercises: 6,
      caloriesBurned: 380,
      notes: "Feeling stronger on planks"
    },
    {
      id: 3,
      date: "2024-08-16",
      type: "Lower Body Strength",
      duration: 80,
      exercises: 7,
      caloriesBurned: 450,
      notes: "New PR on squats! 🎉"
    },
    {
      id: 4,
      date: "2024-08-14",
      type: "Full Body HIIT",
      duration: 50,
      exercises: 10,
      caloriesBurned: 520,
      notes: "Intense session, feeling accomplished"
    },
    {
      id: 5,
      date: "2024-08-12",
      type: "Yoga & Flexibility",
      duration: 60,
      exercises: 12,
      caloriesBurned: 180,
      notes: "Much needed recovery session"
    }
  ];

  const weeklyProgress = [
    { week: 'Week 1', workouts: 3, avgDuration: 60, totalCalories: 1200 },
    { week: 'Week 2', workouts: 4, avgDuration: 65, totalCalories: 1450 },
    { week: 'Week 3', workouts: 5, avgDuration: 58, totalCalories: 1580 },
    { week: 'Week 4', workouts: 4, avgDuration: 70, totalCalories: 1380 }
  ];

  const totalWorkouts = workoutHistory.length;
  const totalHours = Math.round(workoutHistory.reduce((sum, w) => sum + w.duration, 0) / 60);
  const avgDuration = Math.round(workoutHistory.reduce((sum, w) => sum + w.duration, 0) / totalWorkouts);
  const totalCalories = workoutHistory.reduce((sum, w) => sum + w.caloriesBurned, 0);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🏋️ Workout History</h1>
        <p className="text-gray-600">Track your fitness journey and celebrate your progress 🎯</p>
      </div>

      {/* Progress Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Workouts</p>
                <p className="text-2xl font-bold text-gray-900">{totalWorkouts}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Activity className="text-blue-600 h-6 w-6" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold text-gray-900">{totalHours}h</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Clock className="text-green-600 h-6 w-6" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Time invested</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                <p className="text-2xl font-bold text-gray-900">{avgDuration}min</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Target className="text-purple-600 h-6 w-6" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Per session</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Calories Burned</p>
                <p className="text-2xl font-bold text-gray-900">{totalCalories.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Flame className="text-orange-600 h-6 w-6" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Total burned</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Chart */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📈 Weekly Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyProgress}>
                  <XAxis 
                    dataKey="week" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="workouts"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔥 Calories Burned Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyProgress}>
                  <XAxis 
                    dataKey="week" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <Bar 
                    dataKey="totalCalories" 
                    fill="#10b981" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workout History List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🏆 Recent Workouts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workoutHistory.map((workout, index) => (
              <div key={workout.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      {workout.type.includes('Cardio') ? <span className="text-lg">🏃</span> : 
                       workout.type.includes('Strength') ? <span className="text-lg">💪</span> :
                       workout.type.includes('HIIT') ? <span className="text-lg">⚡</span> :
                       workout.type.includes('Yoga') ? <span className="text-lg">🧘</span> :
                       <span className="text-primary font-semibold text-sm">#{totalWorkouts - index}</span>}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{workout.type}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(workout.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{workout.duration} min</p>
                    <p className="text-xs text-gray-600">{workout.caloriesBurned} calories</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-600">{workout.duration} minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-600">{workout.exercises} exercises</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-600">{workout.caloriesBurned} calories</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-600">+{Math.round(workout.caloriesBurned / 10)} points</span>
                  </div>
                </div>

                {workout.notes && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700">{workout.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
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
