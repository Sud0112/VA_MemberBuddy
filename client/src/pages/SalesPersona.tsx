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

interface EmailServiceStatus {
  provider: string;
  configured: boolean;
  description: string;
}

export function SalesPersona() {
  const [crmData, setCrmData] = useState<Prospect[]>([]);
  const [socialPersonas, setSocialPersonas] = useState<SocialPersonas>({});
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [generatedEmails, setGeneratedEmails] = useState<GeneratedEmail[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sendingEmails, setSendingEmails] = useState<Set<number>>(new Set());
  const [emailServiceStatus, setEmailServiceStatus] =
    useState<EmailServiceStatus | null>(null);
  const { toast } = useToast();

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

  // Deploy Agent function
  const deployAgent = async () => {
    setIsDeploying(true);
    addToActivityLog("🚀 Agent deployment started...", "info");

    try {
      // Step 1: Filter for new leads
      const newLeads = crmData.filter((prospect) => prospect.status === "New");

      if (newLeads.length === 0) {
        addToActivityLog("No new leads to process.", "warning");
        return;
      }

      addToActivityLog(
        `Found ${newLeads.length} new leads to process`,
        "success",
      );

      // Step 3: Process each new lead
      for (const lead of newLeads) {
        addToActivityLog(`Processing ${lead.name}...`, "info");

        // Look up interests from social personas
        const persona = socialPersonas[lead.socialMediaHandle];
        if (!persona) {
          addToActivityLog(
            `No social persona found for ${lead.socialMediaHandle}`,
            "warning",
          );
          continue;
        }

        // Generate personalized email using Gemini API
        const systemInstruction =
          "You are an expert sales copywriter for 'Virgin Active', a premium gym operating in London, UK. Your tone is encouraging, knowledgeable, and not pushy. Write a short, personalized outreach email. The goal is to get the prospect to click a virtual tour link and book a free trial session.";

        const userPrompt = `Generate an email for a prospect named ${lead.name}. Their social media persona suggests they are interested in: ${persona.interests.join(", ")}. Make sure to include placeholders like [Virgin Active Virtual Tour Link] and mention the free trial.`;

        try {
          const emailContent = await callGeminiAPI(
            userPrompt,
            systemInstruction,
          );

          // Store the generated email
          const newEmail: GeneratedEmail = {
            id: Date.now(),
            prospectName: lead.name,
            subject: `Transform Your Fitness Journey with Virgin Active`,
            content: emailContent,
            timestamp: new Date().toLocaleTimeString(),
          };
          setGeneratedEmails((prev) => [newEmail, ...prev]);

          addToActivityLog(
            `✉️ Email generated and sent to ${lead.name}`,
            "success",
          );

          // Update prospect status to 'Contacted'
          setCrmData((prev) =>
            prev.map((prospect) =>
              prospect.id === lead.id
                ? { ...prospect, status: "Contacted" as const }
                : prospect,
            ),
          );

          addToActivityLog(
            `📊 Updated ${lead.name}'s status to 'Contacted'`,
            "success",
          );
        } catch (error) {
          addToActivityLog(
            `❌ Failed to process ${lead.name}: ${error}`,
            "warning",
          );
        }

        // 2-second delay between processing leads
        if (lead !== newLeads[newLeads.length - 1]) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }

      // Step 4: Completion message
      addToActivityLog("✅ Agent has completed all tasks.", "success");
      toast({
        title: "Success",
        description: `Agent processed ${newLeads.length} leads successfully.`,
      });
    } catch (error) {
      console.error("Agent deployment error:", error);
      addToActivityLog(`❌ Agent deployment failed: ${error}`, "warning");
      toast({
        title: "Error",
        description: "Agent deployment failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeploying(false);
    }
  };

  // Send email function
  const sendEmail = async (email: GeneratedEmail) => {
    // Find the prospect to get their email address
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

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Virgin Active Header */}
      <div className="mb-12">
        <div className="max-w-6xl mx-auto text-center">
          <span className="inline-block px-4 py-2 bg-red-600 text-white text-sm font-bold uppercase tracking-wider rounded-full mb-4">
            Sales Operations
          </span>
          <h1 className="text-4xl lg:text-6xl font-black tracking-tight text-gray-900 leading-tight mb-6">
            SALES <span className="text-red-600 block">PERSONA AI</span>
          </h1>
          <p className="text-xl text-gray-700 leading-relaxed mb-8 max-w-2xl mx-auto">
            AI-powered lead outreach and automated sales email generation
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Panel 1: CRM Prospects */}
        <Card className="border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="p-6 bg-gradient-to-r from-red-50 to-pink-50">
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Users className="h-5 w-5 text-red-600" />
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
                    className="border border-slate-100 rounded-lg p-4 hover:border-red-200 transition-colors bg-white"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-red-600" />
                        <span className="font-semibold text-gray-900">
                          {prospect.name}
                        </span>
                      </div>
                      {getStatusBadge(prospect.status)}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="h-4 w-4" />
                        {prospect.email}
                      </div>
                      {prospect.phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <span className="text-xs">📞</span>
                          {prospect.phone}
                        </div>
                      )}
                      {prospect.location && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <span className="text-xs">📍</span>
                          {prospect.location}
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-xs text-gray-500">
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
                <p className="text-gray-500 text-center py-8">
                  No prospects found
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Panel 2: AI Agent Control */}
        <Card className="border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Rocket className="h-5 w-5 text-blue-600" />
              AI Agent Control
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-6 space-y-6">
              {/* Deploy Button */}
              <Button
                onClick={deployAgent}
                disabled={isDeploying}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                size="lg"
              >
                {isDeploying ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Deploying Agent...
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4 mr-2" />
                    Deploy Agent
                  </>
                )}
              </Button>

              <Separator />

              {/* Agent Activity Log */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Agent Activity Log
                </h3>
                <Card className="border-slate-200">
                  <CardContent className="p-0">
                    <ScrollArea className="h-[400px] w-full">
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
                                    <Clock className="h-3 w-3 text-gray-400" />
                                    <span className="text-xs text-gray-500">
                                      {log.timestamp}
                                    </span>
                                  </div>
                                  <p className="text-gray-900">{log.message}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-8">
                            No activity yet. Deploy the agent to start
                            processing leads.
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Panel 3: Email Preview */}
        <Card className="border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="p-6 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Mail className="h-5 w-5 text-green-600" />
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
                      Deploy the agent to start generating personalized emails
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
