import { useState } from "react";
import { AppLayout } from "@/components/ui/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Tooltip } from "recharts";
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
    { name: 'Cardio', value: 45, color: '#3b82f6' },
    { name: 'Strength', value: 35, color: '#10b981' },
    { name: 'Flexibility', value: 20, color: '#f59e0b' }
  ];

  const currentStreak = 7;
  const monthlyGoal = 20;
  const currentVisits = 12;
  const goalProgress = (currentVisits / monthlyGoal) * 100;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, <span data-testid="text-user-first-name">{user?.firstName}</span>!
        </h1>
        <p className="text-gray-600">You're crushing it! Keep up the momentum 🔥 💪</p>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="absolute -top-2 -right-2 w-20 h-20 bg-blue-200/30 rounded-full"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shadow-sm">
                <Calendar className="text-blue-600 h-6 w-6" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900" data-testid="text-monthly-visits">{currentVisits}</p>
                <p className="text-sm text-gray-600">of {monthlyGoal} visits</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 font-medium">Monthly Goal 🎯</span>
                <span className="font-bold text-blue-600">{Math.round(goalProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500 shadow-sm" 
                  style={{ width: `${goalProgress}%` }}
                />
              </div>
              {goalProgress >= 60 && (
                <div className="text-xs text-blue-600 font-semibold animate-pulse">
                  ✨ Excellent progress!
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-orange-200/30 rounded-full"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center shadow-sm animate-pulse">
                <Flame className="text-orange-600 h-6 w-6" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900" data-testid="text-current-streak">{currentStreak}</p>
                <p className="text-sm text-gray-600">day streak 🔥</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500 animate-bounce" />
              <span className="text-sm text-green-600 font-medium">Personal best! 🔥</span>
            </div>
            <div className="mt-3 text-xs text-orange-600 font-semibold">
              Keep it up! 💪
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="absolute -top-3 -right-1 w-12 h-12 bg-purple-200/30 rounded-full"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center shadow-sm">
                <Star className="text-purple-600 h-6 w-6" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900" data-testid="text-available-points">
                  {user?.loyaltyPoints?.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">loyalty points ⭐</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-gray-600">+150 this week ✨</span>
              </div>
              <div className="text-xs text-purple-600 font-semibold">
                VIP Status 🏆
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-green-100">
          <div className="absolute -bottom-1 -right-3 w-14 h-14 bg-green-200/30 rounded-full"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shadow-sm">
                <Activity className="text-green-600 h-6 w-6" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">2.5</p>
                <p className="text-sm text-gray-600">avg hours/visit ⏱️</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-600">Great consistency! 🎯</span>
              </div>
              <div className="text-xs text-green-600 font-semibold">
                Optimal! ✅
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
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
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '12px'
                    }}
                    formatter={(value: any) => [`${value} visit${value !== 1 ? 's' : ''}`, 'Daily Activity']}
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
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span>Workout completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <span>Rest day</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
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
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '12px'
                    }}
                    formatter={(value: any) => [`${value}%`, 'Workout Time']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6">
              {workoutTypes.map((type, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: type.color }}
                    />
                    <span className="text-xs font-medium text-gray-700">{type.name}</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">{type.value}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-primary to-primary/90 text-white relative overflow-hidden hover:shadow-lg transition-shadow">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  🤖 AI Workout Planner
                </h3>
                <p className="text-primary-foreground/80">Get a personalized workout plan tailored to your goals</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Brain className="text-white h-6 w-6" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Button
                variant="secondary"
                onClick={() => onTabChange("workout-planner")}
                className="bg-white text-primary hover:bg-gray-50 font-semibold shadow-md"
                data-testid="button-create-plan"
              >
                Create Plan ✨
              </Button>
              <div className="text-xs text-primary-foreground/60 font-medium">
                AI-powered recommendations
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white relative overflow-hidden hover:shadow-lg transition-shadow">
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 -translate-x-8"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  🎁 Loyalty Rewards
                </h3>
                <p className="text-blue-100">Redeem your {user?.loyaltyPoints} points for exclusive rewards</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Gift className="text-white h-6 w-6" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Button
                variant="secondary"
                onClick={() => onTabChange("loyalty-rewards")}
                className="bg-white text-blue-600 hover:bg-gray-50 font-semibold shadow-md"
                data-testid="button-view-rewards"
              >
                View Rewards 🏆
              </Button>
              <div className="text-xs text-blue-100 font-medium">
                8 rewards available
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Quick Access to Workout History */}
      <div className="mt-8">
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white relative overflow-hidden hover:shadow-lg transition-shadow">
          <div className="absolute top-0 left-1/2 w-24 h-24 bg-white/10 rounded-full -translate-y-12 -translate-x-12"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  📊 Workout History
                </h3>
                <p className="text-green-100">Track your progress and view past workouts</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <BarChart3 className="text-white h-6 w-6" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Button
                variant="secondary"
                onClick={() => onTabChange("workout-history")}
                className="bg-white text-green-600 hover:bg-gray-50 font-semibold shadow-md"
                data-testid="button-view-history"
              >
                View History 📈
              </Button>
              <div className="text-xs text-green-100 font-medium">
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
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{workout.duration} minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{workout.exercises} exercises</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{workout.caloriesBurned} calories</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-gray-400" />
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
