
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
          <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
            New
          </Badge>
        );
      case "Contacted":
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-500 text-white hover:bg-yellow-600"
          >
            Contacted
          </Badge>
        );
      case "Interested":
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
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
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {!showDashboard ? (
        /* ChatGPT-style Landing Page */
        <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-br from-background to-muted/20">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Hero Section */}
            <div className="space-y-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-foreground leading-tight">
                Sales <span className="text-primary">Agent AI</span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Your intelligent CRM assistant for lead management, email outreach, and sales automation. Let AI handle your prospecting while you focus on closing deals.
              </p>
            </div>

            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={() => setShowChat(true)}
                className="px-8 py-4 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                data-testid="button-start-sales-chat"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Start Sales Chat
              </Button>
              
              <Button
                onClick={() => setShowDashboard(true)}
                variant="outline"
                className="px-8 py-4 text-lg font-semibold rounded-xl border-2 hover:bg-muted transition-all duration-300"
                data-testid="button-view-dashboard"
              >
                <Activity className="mr-2 h-5 w-5" />
                View Dashboard
              </Button>
            </div>

            {/* Features Preview */}
            <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-3xl mx-auto">
              <div className="text-center p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-shadow">
                <Users className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Lead Management</h3>
                <p className="text-sm text-muted-foreground">Track and organize prospects with intelligent CRM integration</p>
              </div>
              
              <div className="text-center p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-shadow">
                <Mail className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">AI Email Outreach</h3>
                <p className="text-sm text-muted-foreground">Generate personalized emails based on prospect data</p>
              </div>
              
              <div className="text-center p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-shadow">
                <Rocket className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Automated Workflows</h3>
                <p className="text-sm text-muted-foreground">Let AI handle repetitive sales tasks automatically</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Dashboard View */
        <div className="p-8 max-w-7xl mx-auto">
          {/* Header with Back Button */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setShowDashboard(false)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                data-testid="button-back-to-landing"
              >
                <X className="h-4 w-4" />
                Back to Agent
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Sales Dashboard</h1>
                <p className="text-muted-foreground">Manage your leads, emails, and sales activities</p>
              </div>
            </div>
            
            <Button
              onClick={() => setShowChat(true)}
              className="flex items-center gap-2"
              data-testid="button-open-sales-chat"
            >
              <MessageCircle className="h-4 w-4" />
              Open Sales Chat
            </Button>
          </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Panel 1: CRM Prospects */}
        <Card className="card-readable">
          <CardHeader className="p-6 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Users className="h-5 w-5 text-primary" />
              CRM Prospects
              <Badge variant="outline" className="ml-auto">
                {crmData.length} total
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 max-h-[600px] overflow-y-auto">
            <div className="space-y-3">
              {crmData.length > 0 ? (
                crmData.map((prospect) => (
                  <div
                    key={prospect.id}
                    className="border border-border rounded-lg p-4 hover:border-primary/30 transition-colors bg-card"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-foreground">
                          {prospect.name}
                        </span>
                      </div>
                      {getStatusBadge(prospect.status)}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {prospect.email}
                      </div>
                      {prospect.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span className="text-xs">📞</span>
                          {prospect.phone}
                        </div>
                      )}
                      {prospect.location && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span className="text-xs">📍</span>
                          {prospect.location}
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <span className="text-xs text-muted-foreground">
                          {prospect.socialMediaHandle}
                        </span>
                        {prospect.leadSource && (
                          <Badge variant="secondary" className="text-xs">
                            {prospect.leadSource}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No prospects found
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Panel 2: AI Agent Control & Activity */}
        <Card className="card-readable">
          <CardHeader className="p-6 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Rocket className="h-5 w-5 text-primary" />
              AI Agent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Agent Activity Log */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-foreground">
                <Activity className="h-5 w-5 text-primary" />
                Activity Log
              </h3>
              <Card className="border-border">
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px] w-full">
                    <div className="p-4">
                      {activityLog.length > 0 ? (
                        <div className="space-y-3">
                          {activityLog.map((log) => (
                            <div
                              key={log.id}
                              className="flex items-start gap-3 text-sm"
                            >
                              {getLogIcon(log.type)}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Clock className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">
                                    {log.timestamp}
                                  </span>
                                </div>
                                <p className="text-foreground">{log.message}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-8">
                          No activity yet. The agent will start processing when you interact with it.
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Panel 3: Email Preview */}
        <Card className="card-readable">
          <CardHeader className="p-6 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Mail className="h-5 w-5 text-primary" />
              Generated Emails
              <Badge variant="outline" className="ml-auto">
                {generatedEmails.length} emails
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] w-full">
              <div className="space-y-4">
                {generatedEmails.length > 0 ? (
                  generatedEmails.map((email) => (
                    <Card
                      key={email.id}
                      className="border border-slate-100 bg-white"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-green-600" />
                            <span className="font-semibold text-gray-900">
                              {email.prospectName}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {email.timestamp}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-800 border-l-4 border-red-600 pl-3">
                          {email.subject}
                        </p>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap">
                          {email.content}
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() =>
                              navigator.clipboard.writeText(email.content)
                            }
                          >
                            📋 Copy
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                          >
                            ✏️ Edit
                          </Button>
                          <Button
                            size="sm"
                            className="text-xs bg-red-600 hover:bg-red-700"
                            onClick={() => sendEmail(email)}
                            disabled={sendingEmails.has(email.id)}
                          >
                            {sendingEmails.has(email.id) ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1" />
                                Sending...
                              </>
                            ) : (
                              <>📧 Send Email</>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No emails generated yet</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Interact with the CRM Agent to start generating personalized emails
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Proactive CRM Agent Chat */}
      {showChat && (
        <div className="fixed bottom-6 right-6 z-50">
          <Card className="w-96 shadow-2xl border">
            <CardHeader className="bg-blue-600 text-white p-4 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-semibold">CRM Agent</h4>
                  <p className="text-xs text-blue-100">
                    {isProcessing ? "Processing..." : "Online now"}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowChat(false)}
                className="text-white/80 hover:text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="p-0">
              <ScrollArea className="h-80 p-4">
                <div className="space-y-4">
                  {chatMessages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 ${
                        message.role === "user" ? "justify-end" : ""
                      }`}
                    >
                      {message.role === "agent" && (
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-blue-600" />
                        </div>
                      )}
                      <div
                        className={`rounded-2xl p-3 max-w-72 ${
                          message.role === "user"
                            ? "bg-gray-600 text-white rounded-tr-md"
                            : "bg-gray-100 rounded-tl-md"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-line">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
                        {message.buttons && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {message.buttons.map((button, btnIndex) => (
                              <Button
                                key={btnIndex}
                                size="sm"
                                variant="outline"
                                className="text-xs h-8"
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
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isProcessing && (
                    <div className="flex gap-3" data-testid="crm-typing-indicator">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      <div className="bg-muted rounded-2xl rounded-tl-md p-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
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
        
        {/* Close Dashboard View */}
        </div>
      )}
    </div>
  );
}
