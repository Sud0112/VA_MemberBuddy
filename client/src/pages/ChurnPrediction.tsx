import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  AlertTriangle, 
  TrendingDown, 
  Phone,
  Sparkles,
  FileText
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuthContext } from "@/contexts/AuthContext";
import type { User, OutreachAction } from "@shared/schema";

export function ChurnPrediction() {
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [retentionStrategies, setRetentionStrategies] = useState<string>("");
  const [actionType, setActionType] = useState("call");
  const [actionNotes, setActionNotes] = useState("");
  const { user: currentUser } = useAuthContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/staff/metrics"],
    retry: false,
  });

  const { data: atRiskMembers = [], isLoading: membersLoading } = useQuery({
    queryKey: ["/api/staff/at-risk-members"],
    retry: false,
  });

  const { data: outreachHistory = [] } = useQuery({
    queryKey: ["/api/staff/member", selectedMember?.id, "outreach-history"],
    enabled: !!selectedMember?.id,
    retry: false,
  });

  const generateStrategiesMutation = useMutation({
    mutationFn: async (memberProfile: any) => {
      const response = await apiRequest("POST", "/api/ai/retention-strategies", {
        memberProfile,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setRetentionStrategies(data.strategies);
      toast({
        title: "Strategies Generated",
        description: "AI has created personalized retention strategies.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to generate retention strategies.",
        variant: "destructive",
      });
    },
  });

  const logActionMutation = useMutation({
    mutationFn: async (actionData: any) => {
      const response = await apiRequest("POST", "/api/staff/outreach-action", actionData);
      return await response.json();
    },
    onSuccess: () => {
      setActionNotes("");
      queryClient.invalidateQueries({ 
        queryKey: ["/api/staff/member", selectedMember?.id, "outreach-history"] 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/staff/metrics"] });
      toast({
        title: "Action Logged",
        description: "Outreach action has been recorded.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to log outreach action.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateStrategies = () => {
    if (!selectedMember) return;

    const memberProfile = {
      name: `${selectedMember.firstName} ${selectedMember.lastName}`,
      membershipType: selectedMember.membershipType,
      joinDate: selectedMember.joinDate ? new Date(selectedMember.joinDate).toLocaleDateString() : "Unknown",
      lastVisit: selectedMember.lastVisit ? new Date(selectedMember.lastVisit).toLocaleDateString() : "Never",
      avgVisits: Math.floor(Math.random() * 15) + 5, // Mock data for demo
      churnRisk: "89%", // Mock data for demo
      feedback: "Finds it too crowded", // Mock data for demo
    };

    generateStrategiesMutation.mutate(memberProfile);
  };

  const handleLogAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || !actionNotes.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a member and enter action notes.",
        variant: "destructive",
      });
      return;
    }

    logActionMutation.mutate({
      memberId: selectedMember.id,
      actionType,
      notes: actionNotes.trim(),
    });
  };

  const getRiskLevel = (member: User) => {
    if (!member.lastVisit) return { level: "high", color: "bg-red-500", percentage: 95 };
    
    const daysSinceLastVisit = Math.floor(
      (Date.now() - new Date(member.lastVisit).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceLastVisit > 10) return { level: "high", color: "bg-red-500", percentage: 89 };
    if (daysSinceLastVisit > 7) return { level: "medium", color: "bg-orange-500", percentage: 76 };
    return { level: "low", color: "bg-yellow-500", percentage: 65 };
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case "call": return "📞";
      case "email": return "📧";
      case "in-person": return "👥";
      case "offer": return "🎁";
      default: return "📝";
    }
  };

  if (metricsLoading || membersLoading) {
    return (
      <div className="p-8">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 mb-3">Churn Prediction Dashboard</h1>
        <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-2xl">Identify and retain at-risk members with AI-powered insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card className="border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="text-blue-600 h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Members</h3>
                <p className="text-3xl font-bold text-slate-900" data-testid="text-total-members">
                  {(metrics as any)?.totalMembers || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="text-orange-600 h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">At-Risk Members</h3>
                <p className="text-3xl font-bold text-orange-600" data-testid="text-at-risk-members">
                  {(metrics as any)?.atRiskMembers || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <TrendingDown className="text-red-600 h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Churn Rate</h3>
                <p className="text-3xl font-bold text-red-600" data-testid="text-churn-rate">
                  {(metrics as any)?.churnRate || "0%"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Phone className="text-green-600 h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Outreach Today</h3>
                <p className="text-3xl font-bold text-green-600" data-testid="text-outreach-today">
                  {(metrics as any)?.outreachToday || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* At-Risk Members List */}
        <div className="lg:col-span-1">
          <Card className="border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-slate-900">High-Risk Members</CardTitle>
              <p className="text-slate-600 text-sm leading-relaxed">Sorted by churn probability</p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {(atRiskMembers as User[]).length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No at-risk members found</p>
                  </div>
                ) : (
                  (atRiskMembers as User[]).map((member: User, index: number) => {
                    const risk = getRiskLevel(member);
                    const isSelected = selectedMember?.id === member.id;
                    
                    return (
                      <div
                        key={member.id}
                        onClick={() => setSelectedMember(member)}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                        data-testid={`member-${index}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {member.firstName} {member.lastName}
                            </h3>
                            <p className="text-sm text-gray-600 capitalize">
                              {member.membershipType} Member • {
                                member.joinDate 
                                  ? Math.floor((Date.now() - new Date(member.joinDate).getTime()) / (1000 * 60 * 60 * 24 * 30))
                                  : 0
                              } months
                            </p>
                            <p className="text-xs text-orange-600 mt-1">
                              Risk: {risk.percentage}% • Last visit: {
                                member.lastVisit 
                                  ? Math.floor((Date.now() - new Date(member.lastVisit).getTime()) / (1000 * 60 * 60 * 24)) + " days ago"
                                  : "Never"
                              }
                            </p>
                          </div>
                          <div className={`w-3 h-3 ${risk.color} rounded-full`}></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Member Details & Actions */}
        <div className="lg:col-span-2">
          <Card>
            {selectedMember ? (
              <>
                {/* Selected Member Profile */}
                <CardHeader className="border-b">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-semibold text-xl">
                      {selectedMember.firstName?.[0]}{selectedMember.lastName?.[0]}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">
                        {selectedMember.firstName} {selectedMember.lastName}
                      </CardTitle>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">
                            Membership: <span className="font-medium text-gray-900 capitalize">
                              {selectedMember.membershipType}
                            </span>
                          </p>
                          <p className="text-gray-600">
                            Member since: <span className="font-medium text-gray-900">
                              {selectedMember.joinDate ? new Date(selectedMember.joinDate).toLocaleDateString() : "Unknown"}
                            </span>
                          </p>
                          <p className="text-gray-600">
                            Last visit: <span className="font-medium text-gray-900">
                              {selectedMember.lastVisit 
                                ? Math.floor((Date.now() - new Date(selectedMember.lastVisit).getTime()) / (1000 * 60 * 60 * 24)) + " days ago"
                                : "Never"
                              }
                            </span>
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">
                            Churn risk: <span className="font-medium text-red-600">
                              {getRiskLevel(selectedMember).percentage}%
                            </span>
                          </p>
                          <p className="text-gray-600">
                            Loyalty points: <span className="font-medium text-gray-900">
                              {selectedMember.loyaltyPoints}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  {/* AI Retention Strategies */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">AI Retention Strategies</h3>
                      <Button
                        onClick={handleGenerateStrategies}
                        disabled={generateStrategiesMutation.isPending}
                        className="flex items-center gap-2"
                        data-testid="button-generate-strategies"
                      >
                        <Sparkles className="h-4 w-4" />
                        {generateStrategiesMutation.isPending ? "Generating..." : "Generate Strategies"}
                      </Button>
                    </div>

                    {generateStrategiesMutation.isPending ? (
                      <div className="p-4 bg-gray-50 rounded-lg text-center">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary mb-2"></div>
                        <p className="text-sm text-gray-600">AI is analyzing member profile and generating strategies...</p>
                      </div>
                    ) : retentionStrategies ? (
                      <div 
                        className="bg-gray-50 rounded-lg p-4 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: retentionStrategies.replace(/\n/g, '<br>') }}
                        data-testid="retention-strategies-content"
                      />
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
                        Click "Generate Strategies" to get AI-powered retention recommendations
                      </div>
                    )}
                  </div>

                  {/* Staff Action Logging */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">✍️ Log Staff Outreach</h3>
                      <form onSubmit={handleLogAction} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Action Type</label>
                          <Select value={actionType} onValueChange={setActionType}>
                            <SelectTrigger data-testid="select-action-type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="call">Phone Call</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="in-person">In-Person Meeting</SelectItem>
                              <SelectItem value="offer">Special Offer</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                          <Textarea
                            placeholder="Describe the action taken and member response..."
                            value={actionNotes}
                            onChange={(e) => setActionNotes(e.target.value)}
                            className="h-24"
                            data-testid="textarea-action-notes"
                          />
                        </div>
                        <Button
                          type="submit"
                          disabled={logActionMutation.isPending || !actionNotes.trim()}
                          className="w-full bg-green-600 hover:bg-green-700"
                          data-testid="button-log-action"
                        >
                          {logActionMutation.isPending ? "Logging..." : "Log Action"}
                        </Button>
                      </form>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">📜 Outreach History</h3>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {(outreachHistory as OutreachAction[]).length === 0 ? (
                          <div className="text-center text-gray-500 py-4">
                            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No outreach history found</p>
                          </div>
                        ) : (
                          (outreachHistory as (OutreachAction & { staffName?: string })[]).map((action: OutreachAction & { staffName?: string }, index: number) => (
                            <div key={action.id} className="bg-gray-50 p-3 rounded-lg" data-testid={`outreach-${index}`}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-900">
                                  {getActionIcon(action.actionType)} {action.actionType.charAt(0).toUpperCase() + action.actionType.slice(1)}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {action.createdAt ? new Date(action.createdAt).toLocaleDateString() : "Unknown"}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">{action.notes}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                by {action.staffName || currentUser?.firstName + ' ' + currentUser?.lastName || 'Staff'}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="p-8 text-center">
                <div className="text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Select a Member</h3>
                  <p>Choose a member from the at-risk list to view details and manage retention efforts.</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
