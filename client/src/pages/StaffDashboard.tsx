import { useState } from "react";
import { AppLayout } from "@/components/ui/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Activity,
  UserCheck,
  Clock,
  Award
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { ChurnPrediction } from "@/pages/ChurnPrediction";
import { LoyaltyCampaigns } from "@/pages/LoyaltyCampaigns";

export function StaffDashboard() {
  const [activeTab, setActiveTab] = useState("churn-prediction");

  const renderContent = () => {
    switch (activeTab) {
      case "loyalty-campaigns":
        return <LoyaltyCampaigns />;
      case "member-analytics":
        return <MemberAnalytics />;
      default:
        return <ChurnPrediction />;
    }
  };

  return (
    <AppLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      userRole="staff"
    >
      {renderContent()}
    </AppLayout>
  );
}

function MemberAnalytics() {
  // Mock analytics data
  const membershipGrowth = [
    { month: 'Jan', newMembers: 45, churnedMembers: 12, totalMembers: 450 },
    { month: 'Feb', newMembers: 52, churnedMembers: 8, totalMembers: 494 },
    { month: 'Mar', newMembers: 38, churnedMembers: 15, totalMembers: 517 },
    { month: 'Apr', newMembers: 61, churnedMembers: 10, totalMembers: 568 },
    { month: 'May', newMembers: 44, churnedMembers: 7, totalMembers: 605 },
    { month: 'Jun', newMembers: 49, churnedMembers: 13, totalMembers: 641 }
  ];

  const membershipTypes = [
    { name: 'Premium', value: 315, color: '#3b82f6', revenue: 24885 },
    { name: 'Basic', value: 248, color: '#10b981', revenue: 7192 },
    { name: 'Student', value: 78, color: '#f59e0b', revenue: 1482 }
  ];

  const peakHours = [
    { time: '6 AM', members: 45 },
    { time: '7 AM', members: 78 },
    { time: '8 AM', members: 95 },
    { time: '9 AM', members: 62 },
    { time: '10 AM', members: 34 },
    { time: '11 AM', members: 28 },
    { time: '12 PM', members: 52 },
    { time: '1 PM', members: 48 },
    { time: '2 PM', members: 31 },
    { time: '3 PM', members: 29 },
    { time: '4 PM', members: 41 },
    { time: '5 PM', members: 89 },
    { time: '6 PM', members: 124 },
    { time: '7 PM', members: 98 },
    { time: '8 PM', members: 67 },
    { time: '9 PM', members: 43 }
  ];

  const totalMembers = 641;
  const monthlyRevenue = 33559;
  const avgVisitsPerMember = 8.4;
  const memberRetentionRate = 92;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Member Analytics</h1>
        <p className="text-gray-600">Comprehensive insights into member behavior and club performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">{totalMembers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="text-blue-600 h-6 w-6" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600 font-medium">+7.6% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${monthlyRevenue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="text-green-600 h-6 w-6" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600 font-medium">+12.3% vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Visits/Member</p>
                <p className="text-2xl font-bold text-gray-900">{avgVisitsPerMember}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Activity className="text-purple-600 h-6 w-6" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-gray-600">per month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Retention Rate</p>
                <p className="text-2xl font-bold text-gray-900">{memberRetentionRate}%</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <UserCheck className="text-orange-600 h-6 w-6" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Award className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-gray-600">Industry leading</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Membership Growth Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={membershipGrowth}>
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="totalMembers"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.1}
                  />
                  <Line
                    type="monotone"
                    dataKey="totalMembers"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Peak Hours Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peakHours}>
                  <XAxis 
                    dataKey="time" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <Bar 
                    dataKey="members" 
                    fill="hsl(var(--primary))" 
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Membership Breakdown */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 Membership Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={membershipTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {membershipTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {membershipTypes.map((type, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: type.color }}
                    />
                    <span className="text-sm font-medium">
                      {type.name === 'Premium' ? '⭐ ' : type.name === 'Basic' ? '🌱 ' : '🎓 '}
                      {type.name}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">{type.value} members</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              💰 Revenue by Membership Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {membershipTypes.map((type, index) => {
                const revenuePercentage = (type.revenue / monthlyRevenue) * 100;
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{type.name} (${type.revenue.toLocaleString()})</span>
                      <span className="text-gray-600">{Math.round(revenuePercentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="h-3 rounded-full transition-all duration-300" 
                        style={{ 
                          width: `${revenuePercentage}%`,
                          backgroundColor: type.color 
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
