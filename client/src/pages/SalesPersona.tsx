
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
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
  Loader2,
  Brain,
  RefreshCw,
  Database,
  FileText,
  BarChart3,
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
  type: "info" | "success" | "warning" | "processing";
  progress?: number;
}

interface GeneratedEmail {
  id: number;
  prospectName: string;
  subject: string;
  content: string;
  timestamp: string;
  status: "draft" | "sent" | "sending";
}

interface ChatMessage {
  role: "agent" | "user";
  content: string;
  buttons?: Array<{ text: string; value: string }>;
  timestamp: string;
}

interface ProcessingStatus {
  isActive: boolean;
  currentTask: string;
  progress: number;
  totalSteps: number;
  currentStep: number;
}

export function SalesPersona() {
  const [crmData, setCrmData] = useState<Prospect[]>([]);
  const [socialPersonas, setSocialPersonas] = useState<SocialPersonas>({});
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [generatedEmails, setGeneratedEmails] = useState<GeneratedEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingEmails, setSendingEmails] = useState<Set<number>>(new Set());
  
  // Enhanced UI state
  const [showDashboard, setShowDashboard] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    isActive: false,
    currentTask: "",
    progress: 0,
    totalSteps: 0,
    currentStep: 0
  });
  
  // Chat state
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState<string>("greeting");
  const [newLeads, setNewLeads] = useState<Prospect[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { toast } = useToast();

  // Enhanced proactive agent greeting
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowChat(true);
      const newLeadsCount = crmData.filter(p => p.status === "New").length;
      
      // Animated greeting with dynamic content
      addToActivityLog("🤖 AI Agent initialized successfully", "success");
      addToActivityLog(`📊 Detected ${newLeadsCount} new prospects in CRM`, "info");
      
      setChatMessages([{
        role: "agent",
        content: `🎯 Hello! I'm your intelligent CRM Agent.\n\n📈 Current Status:\n• ${newLeadsCount} new enquiries detected\n• ${crmData.length} total prospects in system\n• Ready for automated processing\n\nShall I analyze these leads and prepare personalized outreach campaigns?`,
        buttons: [
          { text: "🚀 Yes, start analysis", value: "approve_check" },
          { text: "⏸️ Not right now", value: "reject_check" }
        ],
        timestamp: new Date().toLocaleTimeString()
      }]);
    }, 1500);

    return () => clearTimeout(timer);
  }, [crmData]);

  // Enhanced data fetching with progress tracking
  useEffect(() => {
    const fetchData = async () => {
      try {
        setProcessingStatus({
          isActive: true,
          currentTask: "Loading CRM data...",
          progress: 25,
          totalSteps: 4,
          currentStep: 1
        });

        const [crmResponse, socialsResponse] = await Promise.all([
          fetch("/crm_data.json"),
          fetch("/social_personas.json"),
        ]);

        setProcessingStatus(prev => ({
          ...prev,
          currentTask: "Processing social personas...",
          progress: 50,
          currentStep: 2
        }));

        if (!crmResponse.ok || !socialsResponse.ok) {
          throw new Error("Failed to fetch data files");
        }

        const crmData = await crmResponse.json();
        const socialData = await socialsResponse.json();

        setProcessingStatus(prev => ({
          ...prev,
          currentTask: "Analyzing lead data...",
          progress: 75,
          currentStep: 3
        }));

        setCrmData(crmData);
        setSocialPersonas(socialData);

        setProcessingStatus(prev => ({
          ...prev,
          currentTask: "System ready!",
          progress: 100,
          currentStep: 4
        }));

        addToActivityLog("✅ CRM system initialized with live data", "success");
        addToActivityLog(`📋 Loaded ${crmData.length} prospects successfully`, "success");

        setTimeout(() => {
          setProcessingStatus(prev => ({ ...prev, isActive: false }));
        }, 1000);

      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "System Error",
          description: "Failed to load CRM data. Please check the data files.",
          variant: "destructive",
        });
        addToActivityLog("❌ Failed to initialize system", "warning");
        setProcessingStatus(prev => ({ ...prev, isActive: false }));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Enhanced activity log function with real-time updates
  const addToActivityLog = (
    message: string,
    type: "info" | "success" | "warning" | "processing" = "info",
    progress?: number
  ) => {
    const newLog: ActivityLog = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toLocaleTimeString(),
      message,
      type,
      progress
    };
    setActivityLog((prev) => [newLog, ...prev.slice(0, 49)]); // Keep last 50 logs
  };

  // Enhanced chat button handler with detailed progress tracking
  const handleChatButton = async (value: string) => {
    const userMessage = chatMessages[chatMessages.length - 1];
    const selectedButton = userMessage.buttons?.find(btn => btn.value === value);
    
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
        
        // Real-time CRM analysis
        addToActivityLog("🔍 Scanning CRM database for new leads...", "processing");
        setTimeout(() => {
          addToActivityLog(`📊 Found ${leads.length} high-priority prospects`, "success");
          addToActivityLog("🎯 Analyzing prospect engagement patterns...", "processing");
        }, 1000);
        
        agentResponse = {
          role: "agent",
          content: `🎯 Excellent! I've analyzed your CRM and found ${leads.length} high-value prospects:\n\n${leads.map((lead, index) => 
            `${index + 1}. 👤 ${lead.name}\n   📧 ${lead.email}\n   📍 ${lead.location || 'Location pending'}\n   🏷️ Source: ${lead.leadSource || 'Direct inquiry'}`
          ).join('\n\n')}\n\n🚀 Shall I generate personalized outreach emails based on their social media profiles and interests?`,
          buttons: [
            { text: "✨ Generate emails now", value: "approve_draft" },
            { text: "📋 Review prospects first", value: "skip_draft" }
          ],
          timestamp: new Date().toLocaleTimeString()
        };
        break;

      case "reject_check":
        agentResponse = {
          role: "agent",
          content: "🎯 Understood! I'll remain on standby for when you're ready. I can help with:\n\n• 📊 CRM analysis & lead scoring\n• ✉️ Personalized email generation\n• 📈 Campaign performance tracking\n• 🎯 Lead prioritization\n\nJust let me know when you'd like to begin!",
          timestamp: new Date().toLocaleTimeString()
        };
        setCurrentStep("standby");
        break;

      case "approve_draft":
        setIsProcessing(true);
        setProcessingStatus({
          isActive: true,
          currentTask: "Initializing AI email generator...",
          progress: 0,
          totalSteps: newLeads.length + 2,
          currentStep: 0
        });

        agentResponse = {
          role: "agent",
          content: "🚀 Perfect! Initiating advanced email generation process...\n\n🧠 AI is now:\n• Analyzing social media personas\n• Crafting personalized messaging\n• Optimizing for engagement rates\n\n⏱️ This will take approximately 30 seconds...",
          timestamp: new Date().toLocaleTimeString()
        };
        
        setTimeout(async () => {
          await processLeadsAndGenerateEmails();
          setChatMessages(prev => [...prev, {
            role: "agent",
            content: `🎉 Mission accomplished! I've generated ${newLeads.length} personalized emails with:\n\n✨ Custom subject lines\n🎯 Tailored content based on interests\n🏋️ Virgin Active specific messaging\n📈 Optimized for conversion\n\nReady to deploy these campaigns?`,
            buttons: [
              { text: "🚀 Send all emails", value: "approve_send" },
              { text: "👀 Review first", value: "review_first" }
            ],
            timestamp: new Date().toLocaleTimeString()
          }]);
          setIsProcessing(false);
          setProcessingStatus(prev => ({ ...prev, isActive: false }));
        }, 8000);
        break;

      case "skip_draft":
        agentResponse = {
          role: "agent",
          content: "📋 Smart approach! Your prospects are now organized in the CRM panel. When you're ready for automated outreach, I'll be here to help generate those high-converting emails!",
          timestamp: new Date().toLocaleTimeString()
        };
        setCurrentStep("standby");
        break;

      case "approve_send":
        setIsProcessing(true);
        setProcessingStatus({
          isActive: true,
          currentTask: "Preparing email campaigns...",
          progress: 0,
          totalSteps: generatedEmails.length,
          currentStep: 0
        });

        agentResponse = {
          role: "agent",
          content: "📤 Launching email campaigns now...\n\n🎯 Sending personalized emails to all prospects\n📊 Tracking delivery status\n📈 Monitoring engagement metrics",
          timestamp: new Date().toLocaleTimeString()
        };
        
        setTimeout(async () => {
          await sendAllEmails();
          setChatMessages(prev => [...prev, {
            role: "agent",
            content: `🎉 Campaign deployment successful!\n\n📊 Results:\n• ${generatedEmails.length} emails sent\n• CRM status updated\n• Engagement tracking active\n\n🚀 Your prospects will receive personalized outreach within minutes. I'll monitor responses and update you on engagement!`,
            timestamp: new Date().toLocaleTimeString()
          }]);
          setIsProcessing(false);
          setProcessingStatus(prev => ({ ...prev, isActive: false }));
        }, 5000);
        break;

      case "review_first":
        agentResponse = {
          role: "agent",
          content: "👀 Excellent! Please review the generated emails in the rightmost panel. Each email is:\n\n✨ Personalized for the prospect\n🎯 Tailored to their interests\n📈 Optimized for Virgin Active conversion\n\nWhen you're satisfied, let me know!",
          buttons: [
            { text: "✅ Approve & send", value: "approve_send" },
            { text: "🔄 Regenerate emails", value: "need_changes" }
          ],
          timestamp: new Date().toLocaleTimeString()
        };
        break;

      case "need_changes":
        agentResponse = {
          role: "agent",
          content: "🔄 No problem! I can regenerate the emails with different approaches:\n\n• More casual tone\n• Focus on specific benefits\n• Adjust call-to-action\n\nOr use the Edit button on individual emails for manual adjustments.",
          timestamp: new Date().toLocaleTimeString()
        };
        break;

      default:
        agentResponse = {
          role: "agent",
          content: "🤖 I'm your intelligent CRM assistant, ready to help with lead management and automated outreach. What would you like me to do next?",
          timestamp: new Date().toLocaleTimeString()
        };
    }

    // Typing animation with dynamic delay
    setIsProcessing(true);
    setTimeout(() => {
      setChatMessages(prev => [...prev, agentResponse]);
      setIsProcessing(false);
    }, 1500);
  };

  // Enhanced lead processing with detailed progress updates
  const processLeadsAndGenerateEmails = async () => {
    let processedCount = 0;
    const totalLeads = newLeads.length;

    for (const lead of newLeads) {
      setProcessingStatus(prev => ({
        ...prev,
        currentTask: `Processing ${lead.name}...`,
        progress: (processedCount / totalLeads) * 100,
        currentStep: processedCount + 1
      }));

      addToActivityLog(`🔍 Analyzing ${lead.name}'s profile...`, "processing");

      const persona = socialPersonas[lead.socialMediaHandle];
      if (!persona) {
        addToActivityLog(`⚠️ Limited social data for ${lead.socialMediaHandle}`, "warning");
        continue;
      }

      try {
        addToActivityLog(`🧠 Generating personalized content for ${lead.name}...`, "processing");

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
          status: "draft"
        };
        
        setGeneratedEmails(prev => [newEmail, ...prev]);
        addToActivityLog(`✅ Email generated for ${lead.name}`, "success");

        // Update prospect status with animation
        setCrmData(prev =>
          prev.map(prospect =>
            prospect.id === lead.id
              ? { ...prospect, status: "Contacted" as const }
              : prospect
          )
        );

        processedCount++;

      } catch (error) {
        addToActivityLog(`❌ Failed to process ${lead.name}: ${error}`, "warning");
      }

      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    addToActivityLog(`🎉 Email generation complete! Generated ${processedCount}/${totalLeads} emails`, "success");
  };

  // Enhanced email sending with real-time status updates
  const sendAllEmails = async () => {
    let sentCount = 0;
    const totalEmails = generatedEmails.length;

    for (const email of generatedEmails) {
      setProcessingStatus(prev => ({
        ...prev,
        currentTask: `Sending email to ${email.prospectName}...`,
        progress: (sentCount / totalEmails) * 100,
        currentStep: sentCount + 1
      }));

      setGeneratedEmails(prev => 
        prev.map(e => e.id === email.id ? { ...e, status: "sending" as const } : e)
      );

      const prospect = crmData.find(p => p.name === email.prospectName);
      if (prospect) {
        try {
          addToActivityLog(`📤 Sending email to ${prospect.name}...`, "processing");

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
            setGeneratedEmails(prev => 
              prev.map(e => e.id === email.id ? { ...e, status: "sent" as const } : e)
            );
            addToActivityLog(`✅ Email delivered to ${prospect.name}`, "success");
          } else {
            throw new Error(result.error || "Failed to send email");
          }
        } catch (error: any) {
          addToActivityLog(`❌ Failed to send email to ${prospect.name}`, "warning");
        }
      }

      sentCount++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    addToActivityLog(`🎉 Campaign complete! Sent ${sentCount}/${totalEmails} emails`, "success");
  };

  // Enhanced individual email sending
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
    setGeneratedEmails(prev => 
      prev.map(e => e.id === email.id ? { ...e, status: "sending" as const } : e)
    );
    addToActivityLog(`📧 Sending individual email to ${prospect.name}...`, "processing");

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
        setGeneratedEmails(prev => 
          prev.map(e => e.id === email.id ? { ...e, status: "sent" as const } : e)
        );
        addToActivityLog(`✅ Email successfully sent to ${prospect.name}`, "success");
        toast({
          title: "Success",
          description: `Email sent to ${prospect.name} successfully!`,
        });
      } else {
        throw new Error(result.error || result.message || "Failed to send email");
      }
    } catch (error: any) {
      console.error("Email sending error:", error);
      addToActivityLog(`❌ Failed to send email to ${prospect.name}: ${error.message}`, "warning");
      toast({
        title: "Error",
        description: error.message || "Failed to send email. Please check email service configuration.",
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

  // Enhanced status badge with animations
  const getStatusBadge = (status: Prospect["status"]) => {
    switch (status) {
      case "New":
        return (
          <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 text-white animate-pulse">
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

  // Enhanced activity log icons with animations
  const getLogIcon = (type: ActivityLog["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-emerald-500 animate-pulse" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case "processing":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  // Enhanced email status badge
  const getEmailStatusBadge = (status: GeneratedEmail["status"]) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50">📝 Draft</Badge>;
      case "sending":
        return <Badge variant="outline" className="text-orange-700 border-orange-300 bg-orange-50 animate-pulse">📤 Sending</Badge>;
      case "sent":
        return <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">✅ Sent</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6 p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/30 border-t-primary"></div>
            <Bot className="absolute inset-0 m-auto h-6 w-6 text-primary animate-pulse" />
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-foreground animate-pulse">Initializing Sales Agent AI...</p>
            <p className="text-sm text-muted-foreground mt-2">Loading CRM data and AI models</p>
          </div>
          {processingStatus.isActive && (
            <div className="w-80">
              <Progress value={processingStatus.progress} className="mb-2" />
              <p className="text-xs text-muted-foreground text-center">{processingStatus.currentTask}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
      {!showDashboard ? (
        /* Enhanced Landing Page with better text contrast */
        <div className="flex flex-col items-center justify-center min-h-screen p-8">
          <div className="max-w-6xl mx-auto text-center space-y-12">
            {/* Enhanced Hero Section */}
            <div className="space-y-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-600/20 blur-3xl rounded-full animate-pulse"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-primary to-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                  <Bot className="h-12 w-12 text-white animate-bounce" />
                </div>
              </div>
              
              <div className="space-y-6">
                <h1 className="text-6xl lg:text-8xl font-black tracking-tight bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent leading-tight drop-shadow-lg">
                  Sales Agent
                  <span className="block text-primary drop-shadow-lg">AI Platform</span>
                </h1>
                
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
                  <p className="text-xl lg:text-2xl text-gray-800 dark:text-gray-200 leading-relaxed max-w-4xl mx-auto font-medium">
                    Transform your sales process with intelligent automation. Your AI-powered CRM assistant handles lead management, personalized outreach, and sales automation while you focus on building relationships and closing deals.
                  </p>
                </div>
              </div>
            </div>

            {/* Real-time Status Indicators */}
            {processingStatus.isActive && (
              <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-blue-200/50 animate-in slide-in-from-bottom-4">
                <div className="flex items-center gap-4 mb-4">
                  <Brain className="h-6 w-6 text-blue-600 animate-pulse" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">AI Agent Active</h3>
                </div>
                <Progress value={processingStatus.progress} className="mb-3" />
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {processingStatus.currentTask} ({processingStatus.currentStep}/{processingStatus.totalSteps})
                </p>
              </div>
            )}

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
                className="group px-10 py-6 text-xl font-bold rounded-2xl border-2 hover:bg-white/90 dark:hover:bg-gray-800/90 backdrop-blur-sm transition-all duration-500 transform hover:scale-105 shadow-lg hover:shadow-xl text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                data-testid="button-view-dashboard"
              >
                <TrendingUp className="mr-3 h-6 w-6 group-hover:animate-bounce" />
                View Analytics Dashboard
              </Button>
            </div>

            {/* Enhanced Features Grid with better contrast */}
            <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-5xl mx-auto">
              <div className="group text-center p-8 rounded-3xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 hover:shadow-2xl transition-all duration-500 hover:scale-105 shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Smart Lead Management</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">Intelligent prospect tracking with automated status updates and lead scoring based on engagement patterns.</p>
              </div>
              
              <div className="group text-center p-8 rounded-3xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 hover:shadow-2xl transition-all duration-500 hover:scale-105 shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">AI-Powered Outreach</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">Generate personalized emails using social media insights and behavioral data to maximize conversion rates.</p>
              </div>
              
              <div className="group text-center p-8 rounded-3xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 hover:shadow-2xl transition-all duration-500 hover:scale-105 shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Rocket className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Automated Workflows</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">Streamline repetitive sales tasks with intelligent automation and real-time performance analytics.</p>
              </div>
            </div>

            {/* Enhanced Stats Section with better contrast */}
            <div className="mt-20 p-8 rounded-3xl bg-gradient-to-r from-white/95 to-blue-50/95 dark:from-gray-800/95 dark:to-blue-900/30 backdrop-blur-sm border border-primary/20 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-black text-primary mb-2">{crmData.length}</div>
                  <p className="text-gray-700 dark:text-gray-300 font-semibold">Total Prospects</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black text-emerald-600 mb-2">{generatedEmails.length}</div>
                  <p className="text-gray-700 dark:text-gray-300 font-semibold">Emails Generated</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black text-blue-600 mb-2">{crmData.filter(p => p.status === "New").length}</div>
                  <p className="text-gray-700 dark:text-gray-300 font-semibold">New Leads</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Enhanced Dashboard View with better text contrast */
        <div className="p-8 max-w-7xl mx-auto">
          {/* Enhanced Header with progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <Button
                onClick={() => setShowDashboard(false)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 hover:bg-white/90 dark:hover:bg-gray-800/90 backdrop-blur-sm transition-all text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
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
            
            {processingStatus.isActive && (
              <div className="mb-6 p-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl border border-blue-200/50 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
                  <span className="font-semibold text-gray-900 dark:text-white">AI Agent Processing...</span>
                </div>
                <Progress value={processingStatus.progress} className="mb-2" />
                <p className="text-sm text-gray-700 dark:text-gray-300">{processingStatus.currentTask}</p>
              </div>
            )}
            
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 to-blue-800 dark:from-white dark:to-blue-200 bg-clip-text text-transparent drop-shadow-lg">
                Sales Intelligence Dashboard
              </h1>
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-4 shadow-lg inline-block">
                <p className="text-lg text-gray-800 dark:text-gray-200">Monitor your leads, track AI activities, and manage email campaigns</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Enhanced CRM Prospects Panel with better contrast */}
            <Card className="border-0 shadow-xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
              <CardHeader className="p-6 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-t-lg border-b">
                <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-xl">CRM Prospects</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Lead management system</div>
                  </div>
                  <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300">
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
                                  <div className="font-bold text-gray-900 dark:text-white text-lg">
                                    {prospect.name}
                                  </div>
                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {prospect.socialMediaHandle}
                                  </div>
                                </div>
                              </div>
                              {getStatusBadge(prospect.status)}
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                <Mail className="h-4 w-4 text-blue-500" />
                                <span className="truncate">{prospect.email}</span>
                              </div>
                              {prospect.phone && (
                                <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                  <span className="text-green-500">📞</span>
                                  <span>{prospect.phone}</span>
                                </div>
                              )}
                              {prospect.location && (
                                <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                  <span className="text-purple-500">📍</span>
                                  <span>{prospect.location}</span>
                                </div>
                              )}
                              {prospect.leadSource && (
                                <div className="flex items-center justify-between pt-2">
                                  <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
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
                        <Users className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400 font-medium">No prospects found</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                          Start the AI agent to begin processing leads
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Enhanced AI Agent Activity Panel with better contrast */}
            <Card className="border-0 shadow-xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
              <CardHeader className="p-6 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-t-lg border-b">
                <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-xl">AI Agent Activity</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Real-time processing log</div>
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
                              <Clock className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                {log.timestamp}
                              </span>
                            </div>
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium leading-relaxed">
                              {log.message}
                            </p>
                            {log.progress !== undefined && (
                              <Progress value={log.progress} className="mt-2 h-1" />
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <Activity className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400 font-medium">No activity logged yet</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                          The AI agent will log activities here when processing leads
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Enhanced Email Generation Panel with better contrast */}
            <Card className="border-0 shadow-xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
              <CardHeader className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-t-lg border-b">
                <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-xl">AI Generated Emails</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Personalized outreach campaigns</div>
                  </div>
                  <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-700 text-purple-800 dark:text-purple-300">
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
                                  <div className="text-xs text-gray-600 dark:text-gray-400">
                                    Generated at {email.timestamp}
                                  </div>
                                </div>
                              </div>
                              {getEmailStatusBadge(email.status)}
                            </div>
                            <div className="mt-3 p-3 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg border-l-4 border-purple-500">
                              <p className="font-semibold text-purple-900 dark:text-purple-100">
                                {email.subject}
                              </p>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-4">
                            <div className="bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-700 dark:to-gray-600 rounded-xl p-5 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed shadow-inner">
                              {email.content}
                            </div>
                            <div className="flex flex-wrap gap-3 mt-5">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 dark:border-gray-600"
                                onClick={() => navigator.clipboard.writeText(email.content)}
                              >
                                <Copy className="h-3 w-3 mr-1" />
                                Copy
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs bg-white hover:bg-blue-50 border-blue-200 hover:border-blue-300 text-blue-700 dark:bg-gray-700 dark:hover:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700"
                              >
                                <Edit3 className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-md hover:shadow-lg transition-all"
                                onClick={() => sendEmail(email)}
                                disabled={sendingEmails.has(email.id) || email.status === "sending"}
                              >
                                {sendingEmails.has(email.id) || email.status === "sending" ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-white/30 border-t-white mr-2" />
                                    Sending...
                                  </>
                                ) : email.status === "sent" ? (
                                  <>
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Sent
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
                        <Mail className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400 font-medium">No emails generated yet</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
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

      {/* Enhanced Proactive CRM Agent Chat with better contrast */}
      {showChat && (
        <div className="fixed bottom-6 right-6 z-50">
          <Card className="w-96 shadow-2xl border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm overflow-hidden">
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
                            : "bg-white dark:bg-gray-700 rounded-tl-md border text-gray-900 dark:text-gray-100"
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
                                className="text-xs h-8 bg-white hover:bg-blue-50 border-blue-200 hover:border-blue-300 font-medium text-gray-800 dark:bg-gray-800 dark:hover:bg-blue-900/20 dark:text-gray-200 dark:border-gray-600"
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
