import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  AlertTriangle, 
  TrendingDown, 
  Phone,
  Sparkles,
  FileText,
  Mail,
  CheckCircle,
  XCircle,
  Send,
  User,
  Calendar,
  Eye,
  EyeOff,
  Bot,
  BarChart3,
  MessageCircle,
  ArrowLeft
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuthContext } from "@/contexts/AuthContext";
import type { User as UserType, OutreachAction } from "@shared/schema";

interface ChurnEmail {
  id: string;
  memberId: string;
  subject: string;
  content: string;
  riskLevel: string;
  currentRiskBand: string;
  previousRiskBand?: string;
  memberProfile: {
    firstName: string;
    lastName: string;
    email: string;
    membershipType: string;
    joinDate: string;
    lastVisit?: string;
    loyaltyPoints: number;
  };
  status: string;
  approvedBy?: string;
  approvedAt?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
  memberName?: string;
  memberEmail?: string;
  memberMembershipType?: string;
}

interface ChatMessage {
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

export function CustomerChurnAnalysis() {
  // UI State
  const [showDashboard, setShowDashboard] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Churn Prediction State
  const [selectedMember, setSelectedMember] = useState<UserType | null>(null);
  const [retentionStrategies, setRetentionStrategies] = useState<string>("");
  const [actionType, setActionType] = useState("call");
  const [actionNotes, setActionNotes] = useState("");

  // Email Management State
  const [emails, setEmails] = useState<ChurnEmail[]>([]);
  const [emailsLoading, setEmailsLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<ChurnEmail | null>(null);
  const [expandedContent, setExpandedContent] = useState<string | null>(null);

  const { user: currentUser } = useAuthContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch metrics and at-risk members
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

  // Fetch churn emails
  const fetchChurnEmails = async () => {
    setEmailsLoading(true);
    try {
      const response = await fetch("/api/staff/churn-emails", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setEmails(data);
      }
    } catch (error) {
      console.error("Error fetching churn emails:", error);
    } finally {
      setEmailsLoading(false);
    }
  };

  useEffect(() => {
    fetchChurnEmails();
  }, []);

  // AI Agent functionality
  const addMessage = (type: 'bot' | 'user', content: string) => {
    setMessages(prev => [...prev, { type, content, timestamp: new Date() }]);
  };

  const simulateTyping = async (duration = 2000) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, duration));
    setIsTyping(false);
  };

  const callGeminiAPI = async (prompt: string) => {
    try {
      const response = await apiRequest("POST", "/api/ai/chat", {
        message: prompt,
        context: "churn_analysis"
      });
      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      return "I'm having trouble accessing the AI service right now. Please try again later.";
    }
  };

  const handleUserMessage = async (message: string) => {
    addMessage('user', message);
    await simulateTyping();
    
    const response = await callGeminiAPI(`
      As a Customer Churn Analysis AI assistant, respond to: "${message}"
      
      Current customer metrics:
      - Total members: ${(metrics as any)?.totalMembers || 0}
      - At-risk members: ${(metrics as any)?.atRiskMembers || 0}
      - Churn rate: ${(metrics as any)?.churnRate || "0%"}
      - Pending emails: ${emails.filter(e => e.status === "pending").length}
      
      Provide actionable insights and recommendations for customer retention.
    `);
    
    addMessage('bot', response);
  };

  // Proactive AI messaging
  useEffect(() => {
    if (showChat && messages.length === 0) {
      const timer = setTimeout(async () => {
        await simulateTyping(1500);
        addMessage('bot', `👋 Hello! I'm your Customer Churn Analysis AI assistant. I've analyzed your customer database and found:

📊 **Current Status:**
• ${(metrics as any)?.atRiskMembers || 0} members at risk of churning
• ${emails.filter(e => e.status === "pending").length} pending email approvals
• ${(metrics as any)?.churnRate || "0%"} current churn rate

🎯 **I can help you:**
• Analyze at-risk customer patterns
• Generate retention strategies
• Review churn prevention emails
• Suggest proactive outreach actions

What would you like to focus on first?`);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [showChat, messages.length, metrics, emails]);

  // Mutations for churn prediction
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

  // Email management functions
  const handleApprove = async (emailId: string) => {
    try {
      const response = await fetch(
        `/api/staff/churn-emails/${emailId}/approve`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      if (response.ok) {
        await fetchChurnEmails();
        await handleUserMessage(`I just approved email ID ${emailId}. Please provide insights on this action.`);
      }
    } catch (error) {
      console.error("Error approving email:", error);
    }
  };

  const handleReject = async (emailId: string) => {
    try {
      const response = await fetch(
        `/api/staff/churn-emails/${emailId}/reject`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      if (response.ok) {
        await fetchChurnEmails();
        await handleUserMessage(`I just rejected email ID ${emailId}. What should I consider next?`);
      }
    } catch (error) {
      console.error("Error rejecting email:", error);
    }
  };

  const handleMarkSent = async (emailId: string) => {
    try {
      const response = await fetch(`/api/staff/churn-emails/${emailId}/send`, {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        await fetchChurnEmails();
        await handleUserMessage(`I just marked email ID ${emailId} as sent. What's the next step?`);
      }
    } catch (error) {
      console.error("Error marking email as sent:", error);
    }
  };

  // Helper functions
  const handleGenerateStrategies = () => {
    if (!selectedMember) return;

    const memberProfile = {
      name: `${selectedMember.firstName} ${selectedMember.lastName}`,
      membershipType: selectedMember.membershipType,
      joinDate: selectedMember.joinDate ? new Date(selectedMember.joinDate).toLocaleDateString() : "Unknown",
      lastVisit: selectedMember.lastVisit ? new Date(selectedMember.lastVisit).toLocaleDateString() : "Never",
      avgVisits: Math.floor(Math.random() * 15) + 5,
      churnRisk: "89%",
      feedback: "Finds it too crowded",
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

  const getRiskLevel = (member: UserType) => {
    if (!member.lastVisit) return { level: "high", color: "bg-red-500", percentage: 95 };
    
    const daysSinceLastVisit = Math.floor(
      (Date.now() - new Date(member.lastVisit).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceLastVisit > 10) return { level: "high", color: "bg-red-500", percentage: 89 };
    if (daysSinceLastVisit > 7) return { level: "medium", color: "bg-orange-500", percentage: 76 };
    return { level: "low", color: "bg-yellow-500", percentage: 65 };
  };

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "high":
        return "bg-red-600 hover:bg-red-700 text-white shadow-sm";
      case "medium":
        return "bg-amber-500 hover:bg-amber-600 text-white shadow-sm";
      case "low":
        return "bg-yellow-500 hover:bg-yellow-600 text-white shadow-sm";
      default:
        return "bg-gray-500 hover:bg-gray-600 text-white shadow-sm";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-blue-600 hover:bg-blue-700 text-white shadow-sm";
      case "approved":
        return "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm";
      case "rejected":
        return "bg-red-600 hover:bg-red-700 text-white shadow-sm";
      case "sent":
        return "bg-purple-600 hover:bg-purple-700 text-white shadow-sm";
      default:
        return "bg-gray-500 hover:bg-gray-600 text-white shadow-sm";
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  if (metricsLoading || membersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-slate-600 text-lg">
            Loading customer analysis...
          </div>
        </div>
      </div>
    );
  }

  // Landing Page View
  if (!showDashboard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
        {/* Header */}
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="w-full max-w-4xl mx-auto text-center">
            {/* Bot Icon */}
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-8 shadow-lg">
              <BarChart3 className="h-12 w-12 text-white" />
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              Customer Churn
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Analysis AI
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              AI-powered customer retention insights and automated churn prevention strategies
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button
                onClick={() => setShowChat(true)}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-full shadow-lg transition-all duration-200"
                data-testid="button-start-analysis"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Start Analysis Chat
              </Button>
              <Button
                onClick={() => setShowDashboard(true)}
                variant="outline"
                size="lg"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold px-8 py-4 rounded-full transition-all duration-200"
                data-testid="button-view-dashboard"
              >
                <BarChart3 className="mr-2 h-5 w-5" />
                View Dashboard
              </Button>
            </div>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Risk Detection</h3>
                <p className="text-gray-600">
                  Identify at-risk customers with AI-powered behavioral analysis and predictive modeling
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Automation</h3>
                <p className="text-gray-600">
                  Generate and manage personalized retention emails with AI-driven content optimization
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Sparkles className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Strategies</h3>
                <p className="text-gray-600">
                  Get AI-generated retention strategies tailored to each customer's unique profile and behavior
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        {showChat && (
          <div className="fixed bottom-4 right-4 w-96 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5" />
                <span className="font-semibold">Churn Analysis AI</span>
              </div>
              <Button
                onClick={() => setShowChat(false)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                data-testid="button-close-chat"
              >
                ×
              </Button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 max-w-[80%] p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Ask about customer retention..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const target = e.target as HTMLInputElement;
                      if (target.value.trim()) {
                        handleUserMessage(target.value.trim());
                        target.value = '';
                      }
                    }
                  }}
                  data-testid="input-chat-message"
                />
                <Button
                  onClick={(e) => {
                    const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                    if (input?.value.trim()) {
                      handleUserMessage(input.value.trim());
                      input.value = '';
                    }
                  }}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                  data-testid="button-send-message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Dashboard View
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="p-8">
        {/* Dashboard Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setShowDashboard(false)}
                variant="outline"
                size="sm"
                className="border-gray-300"
                data-testid="button-back-to-landing"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">
                  Customer Churn Analysis Dashboard
                </h1>
                <p className="text-slate-600 text-lg">
                  AI-powered insights and retention management
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setShowChat(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                data-testid="button-open-analysis-chat"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Open Analysis Chat
              </Button>
            </div>
          </div>
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
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Mail className="text-purple-600 h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pending Emails</h3>
                  <p className="text-3xl font-bold text-purple-600" data-testid="text-pending-emails">
                    {emails.filter(e => e.status === "pending").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
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
                  {(atRiskMembers as UserType[]).length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No at-risk members found</p>
                    </div>
                  ) : (
                    (atRiskMembers as UserType[]).map((member: UserType, index: number) => {
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
          <div className="lg:col-span-2 space-y-6">
            {/* Selected Member Profile */}
            <Card className="border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300">
              {selectedMember ? (
                <>
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

            {/* Churn Email Management */}
            <Card className="border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-slate-900">Churn Prevention Emails</CardTitle>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">
                      {emails.filter((e) => e.status === "pending").length}
                    </div>
                    <div className="text-xs text-slate-500">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-emerald-600">
                      {emails.filter((e) => e.status === "approved").length}
                    </div>
                    <div className="text-xs text-slate-500">Approved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-600">
                      {emails.filter((e) => e.status === "sent").length}
                    </div>
                    <div className="text-xs text-slate-500">Sent</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  {emailsLoading ? (
                    <div className="p-6 text-center">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary mb-2"></div>
                      <p className="text-sm text-gray-600">Loading emails...</p>
                    </div>
                  ) : emails.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No churn prevention emails generated yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3 p-4">
                      {emails.slice(0, 5).map((email) => (
                        <div
                          key={email.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="font-medium text-gray-900 text-sm">
                                  {email.subject}
                                </h4>
                                <Badge
                                  className={`${getRiskBadgeColor(email.riskLevel)} text-white text-xs`}
                                >
                                  {email.riskLevel.toUpperCase()}
                                </Badge>
                                <Badge
                                  className={`${getStatusBadgeColor(email.status)} text-white text-xs`}
                                >
                                  {email.status.toUpperCase()}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-600">
                                {email.memberName || `${email.memberProfile.firstName} ${email.memberProfile.lastName}`} • {formatDate(email.createdAt)}
                              </p>
                            </div>
                            <div className="flex items-center space-x-1">
                              {email.status === "pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleApprove(email.id)}
                                    className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1"
                                    data-testid={`button-approve-${email.id}`}
                                  >
                                    <CheckCircle className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleReject(email.id)}
                                    className="border-red-600 text-red-600 hover:bg-red-50 text-xs px-2 py-1"
                                    data-testid={`button-reject-${email.id}`}
                                  >
                                    <XCircle className="h-3 w-3" />
                                  </Button>
                                </>
                              )}
                              {email.status === "approved" && (
                                <Button
                                  size="sm"
                                  onClick={() => handleMarkSent(email.id)}
                                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-2 py-1"
                                  data-testid={`button-send-${email.id}`}
                                >
                                  <Send className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-gray-700 leading-relaxed">
                            {truncateContent(email.content, 100)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Chat Interface for Dashboard View */}
        {showChat && (
          <div className="fixed bottom-4 right-4 w-96 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5" />
                <span className="font-semibold">Churn Analysis AI</span>
              </div>
              <Button
                onClick={() => setShowChat(false)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                data-testid="button-close-chat-dashboard"
              >
                ×
              </Button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 max-w-[80%] p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Ask about customer retention..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const target = e.target as HTMLInputElement;
                      if (target.value.trim()) {
                        handleUserMessage(target.value.trim());
                        target.value = '';
                      }
                    }
                  }}
                  data-testid="input-chat-message-dashboard"
                />
                <Button
                  onClick={(e) => {
                    const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                    if (input?.value.trim()) {
                      handleUserMessage(input.value.trim());
                      input.value = '';
                    }
                  }}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                  data-testid="button-send-message-dashboard"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}