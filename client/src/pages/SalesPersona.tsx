
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Rocket,
  Users,
  Activity,
  Mail,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Bot,
  MessageCircle,
  X,
  Sparkles,
  ArrowRight,
  Send,
  Edit3,
  Copy,
  Zap,
  Target,
  TrendingUp,
} from "lucide-react";

interface Prospect {
  id: number;
  name: string;
  email: string;
  status: "New" | "Contacted" | "Interested";
  socialMediaHandle: string;
  phone?: string;
  location?: string;
  leadSource?: string;
}

interface SocialPersonas {
  [handle: string]: {
    interests: string[];
  };
}

interface ActivityLog {
  id: number;
  timestamp: string;
  message: string;
  type: "info" | "success" | "warning";
}

interface GeneratedEmail {
  id: number;
  prospectName: string;
  subject: string;
  content: string;
  timestamp: string;
}

interface ChatMessage {
  role: "agent" | "user";
  content: string;
  buttons?: Array<{ text: string; value: string }>;
  timestamp: string;
}

export function SalesPersona() {
  const [crmData, setCrmData] = useState<Prospect[]>([]);
  const [socialPersonas, setSocialPersonas] = useState<SocialPersonas>({});
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [generatedEmails, setGeneratedEmails] = useState<GeneratedEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingEmails, setSendingEmails] = useState<Set<number>>(new Set());
  
  // UI state - dashboard hidden by default
  const [showDashboard, setShowDashboard] = useState(false);
  
  // Chat state
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState<string>("greeting");
  const [newLeads, setNewLeads] = useState<Prospect[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { toast } = useToast();

  // Show proactive agent greeting when page loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowChat(true);
      const newLeadsCount = crmData.filter(p => p.status === "New").length;
      setChatMessages([{
        role: "agent",
        content: `Hello! I'm your CRM Agent. I've detected ${newLeadsCount} new enquiries in the system. Would you like me to check the CRM for details?`,
        buttons: [
          { text: "✅ Yes, check CRM", value: "approve_check" },
          { text: "❌ Not now", value: "reject_check" }
        ],
        timestamp: new Date().toLocaleTimeString()
      }]);
    }, 1000);

    return () => clearTimeout(timer);
  }, [crmData]);

  // Fetch data from JSON files on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [crmResponse, socialsResponse] = await Promise.all([
          fetch("/crm_data.json"),
          fetch("/social_personas.json"),
        ]);

        if (!crmResponse.ok || !socialsResponse.ok) {
          throw new Error("Failed to fetch data files");
        }

        const crmData = await crmResponse.json();
        const socialData = await socialsResponse.json();

        setCrmData(crmData);
        setSocialPersonas(socialData);

        addToActivityLog("System initialized successfully", "success");
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load CRM data. Please check the data files.",
          variant: "destructive",
        });
        addToActivityLog("Failed to initialize system", "warning");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper function to add activity log entries
  const addToActivityLog = (
    message: string,
    type: "info" | "success" | "warning" = "info",
  ) => {
    const newLog: ActivityLog = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      message,
      type,
    };
    setActivityLog((prev) => [newLog, ...prev]);
  };

  // Handle chat button clicks
  const handleChatButton = async (value: string) => {
    const userMessage = chatMessages[chatMessages.length - 1];
    const selectedButton = userMessage.buttons?.find(btn => btn.value === value);
    
    // Add user response
    setChatMessages(prev => [...prev, {
      role: "user",
      content: selectedButton?.text || value,
      timestamp: new Date().toLocaleTimeString()
    }]);

    let agentResponse: ChatMessage;

    switch (value) {
      case "approve_check":
        const leads = crmData.filter(prospect => prospect.status === "New");
        setNewLeads(leads);
        setCurrentStep("show_leads");
        
        agentResponse = {
          role: "agent",
          content: `Perfect! I found ${leads.length} new leads:\n\n${leads.map(lead => 
            `• ${lead.name} (${lead.email}) - ${lead.location || 'Unknown location'}`
          ).join('\n')}\n\nWould you like me to draft personalized outreach emails for these prospects?`,
          buttons: [
            { text: "✅ Draft emails", value: "approve_draft" },
            { text: "❌ Skip for now", value: "skip_draft" }
          ],
          timestamp: new Date().toLocaleTimeString()
        };
        break;

      case "reject_check":
        agentResponse = {
          role: "agent",
          content: "No problem! I'll stay on standby. Feel free to ask me anytime if you need help with CRM tasks or lead outreach.",
          timestamp: new Date().toLocaleTimeString()
        };
        setCurrentStep("standby");
        break;

      case "approve_draft":
        setIsProcessing(true);
        agentResponse = {
          role: "agent",
          content: "Great! I'm now drafting personalized emails for each lead based on their profile and social media interests. This will take a moment...",
          timestamp: new Date().toLocaleTimeString()
        };
        
        // Process leads and generate emails
        setTimeout(async () => {
          await processLeadsAndGenerateEmails();
          setChatMessages(prev => [...prev, {
            role: "agent",
            content: `I've drafted ${newLeads.length} personalized emails! Please review them in the emails panel. Would you like me to send them out?`,
            buttons: [
              { text: "✅ Send emails", value: "approve_send" },
              { text: "📝 Review first", value: "review_first" }
            ],
            timestamp: new Date().toLocaleTimeString()
          }]);
          setIsProcessing(false);
        }, 3000);
        break;

      case "skip_draft":
        agentResponse = {
          role: "agent",
          content: "Understood. The leads are available in your CRM panel whenever you're ready to reach out to them.",
          timestamp: new Date().toLocaleTimeString()
        };
        setCurrentStep("standby");
        break;

      case "approve_send":
        setIsProcessing(true);
        agentResponse = {
          role: "agent",
          content: "Sending all drafted emails now...",
          timestamp: new Date().toLocaleTimeString()
        };
        
        setTimeout(async () => {
          await sendAllEmails();
          setChatMessages(prev => [...prev, {
            role: "agent",
            content: "All emails have been sent successfully! I've updated the CRM status for each lead. Is there anything else you'd like me to help with?",
            timestamp: new Date().toLocaleTimeString()
          }]);
          setIsProcessing(false);
        }, 2000);
        break;

      case "review_first":
        agentResponse = {
          role: "agent",
          content: "Good idea! Please review the emails in the panel on the right. Let me know when you're ready to send them.",
          buttons: [
            { text: "✅ Send now", value: "approve_send" },
            { text: "🔄 Need changes", value: "need_changes" }
          ],
          timestamp: new Date().toLocaleTimeString()
        };
        break;

      case "need_changes":
        agentResponse = {
          role: "agent",
          content: "No problem! You can edit any email using the Edit button, or let me know what changes you'd like and I can regenerate them.",
          timestamp: new Date().toLocaleTimeString()
        };
        break;

      default:
        agentResponse = {
          role: "agent",
          content: "I'm here to help with CRM management and lead outreach. What would you like me to do?",
          timestamp: new Date().toLocaleTimeString()
        };
    }

    // Show typing indicator then add agent response after a delay
    setIsProcessing(true);
    setTimeout(() => {
      setChatMessages(prev => [...prev, agentResponse]);
      setIsProcessing(false);
    }, 1000);
  };

  // Process leads and generate emails (same logic as original deployAgent)
  const processLeadsAndGenerateEmails = async () => {
    for (const lead of newLeads) {
      addToActivityLog(`Processing ${lead.name}...`, "info");

      const persona = socialPersonas[lead.socialMediaHandle];
      if (!persona) {
        addToActivityLog(`No social persona found for ${lead.socialMediaHandle}`, "warning");
        continue;
      }

      try {
        const systemInstruction = "You are an expert sales copywriter for 'Virgin Active', a premium gym operating in London, UK. Your tone is encouraging, knowledgeable, and not pushy. Write a short, personalized outreach email. The goal is to get the prospect to click a virtual tour link and book a free trial session.";
        const userPrompt = `Generate an email for a prospect named ${lead.name}. Their social media persona suggests they are interested in: ${persona.interests.join(", ")}. Make sure to include placeholders like [Virgin Active Virtual Tour Link] and mention the free trial.`;

        const response = await fetch("/api/ai/sales-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: userPrompt, systemInstruction })
        });

        const data = await response.json();
        const emailContent = data.content || "Email generated successfully";

        const newEmail: GeneratedEmail = {
          id: Date.now() + Math.random(),
          prospectName: lead.name,
          subject: `Transform Your Fitness Journey with Virgin Active`,
          content: emailContent,
          timestamp: new Date().toLocaleTimeString(),
        };
        
        setGeneratedEmails(prev => [newEmail, ...prev]);
        addToActivityLog(`✉️ Email generated for ${lead.name}`, "success");

        // Update prospect status to 'Contacted'
        setCrmData(prev =>
          prev.map(prospect =>
            prospect.id === lead.id
              ? { ...prospect, status: "Contacted" as const }
              : prospect
          )
        );

      } catch (error) {
        addToActivityLog(`❌ Failed to process ${lead.name}: ${error}`, "warning");
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  // Send all generated emails
  const sendAllEmails = async () => {
    for (const email of generatedEmails) {
      const prospect = crmData.find(p => p.name === email.prospectName);
      if (prospect) {
        try {
          const response = await fetch("/api/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: prospect.email,
              subject: email.subject,
              content: email.content,
              prospectName: email.prospectName,
            }),
          });

          const result = await response.json();
          if (response.ok && result.success) {
            addToActivityLog(`✅ Email sent to ${prospect.name}`, "success");
          } else {
            throw new Error(result.error || "Failed to send email");
          }
        } catch (error: any) {
          addToActivityLog(`❌ Failed to send email to ${prospect.name}`, "warning");
        }
      }
    }
  };

  // Helper function to call Gemini API
  const callGeminiAPI = async (
    prompt: string,
    systemInstruction: string,
  ): Promise<string> => {
    try {
      const response = await fetch("/api/ai/sales-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          systemInstruction,
          model: "gemini-2.5-flash-preview-05-20",
        }),
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }

      const data = await response.json();
      return data.content || "Email generated successfully";
    } catch (error) {
      console.error("Gemini API error:", error);
      throw error;
    }
  };

  // Send individual email function
  const sendEmail = async (email: GeneratedEmail) => {
    const prospect = crmData.find((p) => p.name === email.prospectName);
    if (!prospect) {
      toast({
        title: "Error",
        description: "Prospect not found",
        variant: "destructive",
      });
      return;
    }

    setSendingEmails((prev) => new Set(prev).add(email.id));
    addToActivityLog(`📧 Sending email to ${prospect.name}...`, "info");

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: prospect.email,
          subject: email.subject,
          content: email.content,
          prospectName: email.prospectName,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        addToActivityLog(
          `✅ Email successfully sent to ${prospect.name}`,
          "success",
        );
        toast({
          title: "Success",
          description: `Email sent to ${prospect.name} successfully!`,
        });
      } else {
        throw new Error(
          result.error || result.message || "Failed to send email",
        );
      }
    } catch (error: any) {
      console.error("Email sending error:", error);
      addToActivityLog(
        `❌ Failed to send email to ${prospect.name}: ${error.message}`,
        "warning",
      );
      toast({
        title: "Error",
        description:
          error.message ||
          "Failed to send email. Please check email service configuration.",
        variant: "destructive",
      });
    } finally {
      setSendingEmails((prev) => {
        const newSet = new Set(prev);
        newSet.delete(email.id);
        return newSet;
      });
    }
  };

  // Get status badge variant
  const getStatusBadge = (status: Prospect["status"]) => {
    switch (status) {
      case "New":
        return (
          <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 text-white">
            <Sparkles className="h-3 w-3 mr-1" />
            New
          </Badge>
        );
      case "Contacted":
        return (
          <Badge variant="secondary" className="bg-blue-500 text-white hover:bg-blue-600">
            <Mail className="h-3 w-3 mr-1" />
            Contacted
          </Badge>
        );
      case "Interested":
        return (
          <Badge variant="default" className="bg-amber-500 hover:bg-amber-600 text-white">
            <Target className="h-3 w-3 mr-1" />
            Interested
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get activity log icon
  const getLogIcon = (type: ActivityLog["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/30 border-t-primary"></div>
          <p className="text-muted-foreground animate-pulse">Initializing Sales Agent AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
      {!showDashboard ? (
        /* Enhanced Landing Page */
        <div className="flex flex-col items-center justify-center min-h-screen p-8">
          <div className="max-w-6xl mx-auto text-center space-y-12">
            {/* Animated Hero Section */}
            <div className="space-y-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-600/20 blur-3xl rounded-full animate-pulse"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-primary to-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                  <Bot className="h-12 w-12 text-white animate-bounce" />
                </div>
              </div>
              
              <div className="space-y-6">
                <h1 className="text-6xl lg:text-8xl font-black tracking-tight bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent leading-tight">
                  Sales Agent
                  <span className="block text-primary">AI Platform</span>
                </h1>
                
                <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-4xl mx-auto font-medium">
                  Transform your sales process with intelligent automation. Your AI-powered CRM assistant handles lead management, personalized outreach, and sales automation while you focus on building relationships and closing deals.
                </p>
              </div>
            </div>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button
                onClick={() => setShowChat(true)}
                className="group px-10 py-6 text-xl font-bold bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105"
                data-testid="button-start-sales-chat"
              >
                <MessageCircle className="mr-3 h-6 w-6 group-hover:animate-pulse" />
                Start AI Conversation
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button
                onClick={() => setShowDashboard(true)}
                variant="outline"
                className="group px-10 py-6 text-xl font-bold rounded-2xl border-2 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 dark:hover:from-gray-800 dark:hover:to-blue-900/20 transition-all duration-500 transform hover:scale-105 shadow-lg hover:shadow-xl"
                data-testid="button-view-dashboard"
              >
                <TrendingUp className="mr-3 h-6 w-6 group-hover:animate-bounce" />
                View Analytics Dashboard
              </Button>
            </div>

            {/* Enhanced Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-5xl mx-auto">
              <div className="group text-center p-8 rounded-3xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:bg-white dark:hover:bg-gray-800">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Smart Lead Management</h3>
                <p className="text-muted-foreground leading-relaxed">Intelligent prospect tracking with automated status updates and lead scoring based on engagement patterns.</p>
              </div>
              
              <div className="group text-center p-8 rounded-3xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:bg-white dark:hover:bg-gray-800">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">AI-Powered Outreach</h3>
                <p className="text-muted-foreground leading-relaxed">Generate personalized emails using social media insights and behavioral data to maximize conversion rates.</p>
              </div>
              
              <div className="group text-center p-8 rounded-3xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:bg-white dark:hover:bg-gray-800">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Rocket className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Automated Workflows</h3>
                <p className="text-muted-foreground leading-relaxed">Streamline repetitive sales tasks with intelligent automation and real-time performance analytics.</p>
              </div>
            </div>

            {/* Stats Section */}
            <div className="mt-20 p-8 rounded-3xl bg-gradient-to-r from-primary/10 to-blue-600/10 border border-primary/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-black text-primary mb-2">{crmData.length}</div>
                  <p className="text-muted-foreground font-semibold">Total Prospects</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black text-emerald-600 mb-2">{generatedEmails.length}</div>
                  <p className="text-muted-foreground font-semibold">Emails Generated</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black text-blue-600 mb-2">{crmData.filter(p => p.status === "New").length}</div>
                  <p className="text-muted-foreground font-semibold">New Leads</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Enhanced Dashboard View */
        <div className="p-8 max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <Button
                onClick={() => setShowDashboard(false)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 hover:bg-gradient-to-r hover:from-slate-100 hover:to-blue-50 transition-all"
                data-testid="button-back-to-landing"
              >
                <X className="h-4 w-4" />
                Back to AI Agent
              </Button>
              
              <Button
                onClick={() => setShowChat(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg hover:shadow-xl transition-all"
                data-testid="button-open-sales-chat"
              >
                <MessageCircle className="h-4 w-4" />
                Open Sales Chat
              </Button>
            </div>
            
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 to-blue-800 dark:from-white dark:to-blue-200 bg-clip-text text-transparent">
                Sales Intelligence Dashboard
              </h1>
              <p className="text-lg text-muted-foreground">Monitor your leads, track AI activities, and manage email campaigns</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Enhanced CRM Prospects Panel */}
            <Card className="card-readable border-0 shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-gray-900 dark:to-gray-800">
              <CardHeader className="p-6 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-t-lg border-b">
                <CardTitle className="flex items-center gap-3 text-foreground">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-xl">CRM Prospects</div>
                    <div className="text-sm text-muted-foreground">Lead management system</div>
                  </div>
                  <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-800">
                    {crmData.length} total
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {crmData.length > 0 ? (
                      crmData.map((prospect) => (
                        <Card
                          key={prospect.id}
                          className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-800 hover:scale-[1.02]"
                        >
                          <CardContent className="p-5">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                  <User className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <div className="font-bold text-foreground text-lg">
                                    {prospect.name}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {prospect.socialMediaHandle}
                                  </div>
                                </div>
                              </div>
                              {getStatusBadge(prospect.status)}
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-center gap-3 text-sm text-muted-foreground bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                <Mail className="h-4 w-4 text-blue-500" />
                                <span className="truncate">{prospect.email}</span>
                              </div>
                              {prospect.phone && (
                                <div className="flex items-center gap-3 text-sm text-muted-foreground bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                  <span className="text-green-500">📞</span>
                                  <span>{prospect.phone}</span>
                                </div>
                              )}
                              {prospect.location && (
                                <div className="flex items-center gap-3 text-sm text-muted-foreground bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                  <span className="text-purple-500">📍</span>
                                  <span>{prospect.location}</span>
                                </div>
                              )}
                              {prospect.leadSource && (
                                <div className="flex items-center justify-between pt-2">
                                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                    {prospect.leadSource}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <Users className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                        <p className="text-muted-foreground font-medium">No prospects found</p>
                        <p className="text-sm text-muted-foreground/70 mt-2">
                          Start the AI agent to begin processing leads
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Enhanced AI Agent Activity Panel */}
            <Card className="card-readable border-0 shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-gray-900 dark:to-gray-800">
              <CardHeader className="p-6 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-t-lg border-b">
                <CardTitle className="flex items-center gap-3 text-foreground">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-xl">AI Agent Activity</div>
                    <div className="text-sm text-muted-foreground">Real-time processing log</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {activityLog.length > 0 ? (
                      activityLog.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-gray-700 border hover:shadow-md transition-all"
                        >
                          <div className="flex-shrink-0 mt-1">
                            {getLogIcon(log.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground font-medium">
                                {log.timestamp}
                              </span>
                            </div>
                            <p className="text-sm text-foreground font-medium leading-relaxed">
                              {log.message}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <Activity className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                        <p className="text-muted-foreground font-medium">No activity logged yet</p>
                        <p className="text-sm text-muted-foreground/70 mt-2">
                          The AI agent will log activities here when processing leads
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Enhanced Email Generation Panel */}
            <Card className="card-readable border-0 shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-gray-900 dark:to-gray-800">
              <CardHeader className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-t-lg border-b">
                <CardTitle className="flex items-center gap-3 text-foreground">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-xl">AI Generated Emails</div>
                    <div className="text-sm text-muted-foreground">Personalized outreach campaigns</div>
                  </div>
                  <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-800">
                    {generatedEmails.length} emails
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ScrollArea className="h-[600px]">
                  <div className="space-y-6">
                    {generatedEmails.length > 0 ? (
                      generatedEmails.map((email) => (
                        <Card
                          key={email.id}
                          className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-800 dark:to-purple-900/10"
                        >
                          <CardHeader className="pb-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                                  <Mail className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                  <div className="font-bold text-gray-900 dark:text-white">
                                    {email.prospectName}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Generated at {email.timestamp}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="mt-3 p-3 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg border-l-4 border-purple-500">
                              <p className="font-semibold text-purple-900 dark:text-purple-100">
                                {email.subject}
                              </p>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-4">
                            <div className="bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-700 dark:to-gray-600 rounded-xl p-5 text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed shadow-inner">
                              {email.content}
                            </div>
                            <div className="flex flex-wrap gap-3 mt-5">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300"
                                onClick={() => navigator.clipboard.writeText(email.content)}
                              >
                                <Copy className="h-3 w-3 mr-1" />
                                Copy
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs bg-white hover:bg-blue-50 border-blue-200 hover:border-blue-300 text-blue-700"
                              >
                                <Edit3 className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-md hover:shadow-lg transition-all"
                                onClick={() => sendEmail(email)}
                                disabled={sendingEmails.has(email.id)}
                              >
                                {sendingEmails.has(email.id) ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-white/30 border-t-white mr-2" />
                                    Sending...
                                  </>
                                ) : (
                                  <>
                                    <Send className="h-3 w-3 mr-1" />
                                    Send Email
                                  </>
                                )}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <Mail className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                        <p className="text-muted-foreground font-medium">No emails generated yet</p>
                        <p className="text-sm text-muted-foreground/70 mt-2">
                          Interact with the CRM Agent to start generating personalized emails
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Enhanced Proactive CRM Agent Chat */}
      {showChat && (
        <div className="fixed bottom-6 right-6 z-50">
          <Card className="w-96 shadow-2xl border-0 bg-white dark:bg-gray-900 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Bot className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">CRM Agent AI</h4>
                  <p className="text-xs text-blue-100 font-medium">
                    {isProcessing ? (
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        Online now
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowChat(false)}
                className="text-white/80 hover:text-white hover:bg-white/20 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="p-0 bg-gradient-to-b from-slate-50 to-white dark:from-gray-800 dark:to-gray-900">
              <ScrollArea className="h-80 p-5">
                <div className="space-y-4">
                  {chatMessages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 ${
                        message.role === "user" ? "justify-end" : ""
                      }`}
                    >
                      {message.role === "agent" && (
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <div
                        className={`rounded-2xl p-4 max-w-72 shadow-md ${
                          message.role === "user"
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-md"
                            : "bg-white dark:bg-gray-700 rounded-tl-md border"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-line leading-relaxed font-medium">{message.content}</p>
                        <p className="text-xs opacity-70 mt-2 font-medium">{message.timestamp}</p>
                        {message.buttons && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {message.buttons.map((button, btnIndex) => (
                              <Button
                                key={btnIndex}
                                size="sm"
                                variant="outline"
                                className="text-xs h-8 bg-white hover:bg-blue-50 border-blue-200 hover:border-blue-300 font-medium"
                                onClick={() => handleChatButton(button.value)}
                                disabled={isProcessing}
                              >
                                {button.text}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                      {message.role === "user" && (
                        <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isProcessing && (
                    <div className="flex gap-3" data-testid="crm-typing-indicator">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-tl-md p-4 shadow-md border">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
