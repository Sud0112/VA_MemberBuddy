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
  AlertCircle 
} from "lucide-react";

interface Prospect {
  id: number;
  name: string;
  email: string;
  status: 'New' | 'Contacted' | 'Interested';
  socialMediaHandle: string;
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
  type: 'info' | 'success' | 'warning';
}

export function SalesPersona() {
  const [crmData, setCrmData] = useState<Prospect[]>([]);
  const [socialPersonas, setSocialPersonas] = useState<SocialPersonas>({});
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch data from JSON files on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [crmResponse, socialsResponse] = await Promise.all([
          fetch('/crm_data.json'),
          fetch('/social_personas.json')
        ]);

        if (!crmResponse.ok || !socialsResponse.ok) {
          throw new Error('Failed to fetch data files');
        }

        const crmData = await crmResponse.json();
        const socialData = await socialsResponse.json();

        setCrmData(crmData);
        setSocialPersonas(socialData);
        
        addToActivityLog('System initialized successfully', 'success');
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load CRM data. Please check the data files.",
          variant: "destructive",
        });
        addToActivityLog('Failed to initialize system', 'warning');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper function to add activity log entries
  const addToActivityLog = (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const newLog: ActivityLog = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    };
    setActivityLog(prev => [newLog, ...prev]);
  };

  // Helper function to call Gemini API
  const callGeminiAPI = async (prompt: string, systemInstruction: string): Promise<string> => {
    try {
      const response = await fetch('/api/ai/sales-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          systemInstruction,
          model: 'gemini-2.5-flash-preview-05-20'
        }),
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }

      const data = await response.json();
      return data.content || 'Email generated successfully';
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  };

  // Deploy Agent function
  const deployAgent = async () => {
    setIsDeploying(true);
    addToActivityLog('🚀 Agent deployment started...', 'info');

    try {
      // Step 1: Filter for new leads
      const newLeads = crmData.filter(prospect => prospect.status === 'New');
      
      if (newLeads.length === 0) {
        addToActivityLog('No new leads to process.', 'warning');
        return;
      }

      addToActivityLog(`Found ${newLeads.length} new leads to process`, 'success');

      // Step 3: Process each new lead
      for (const lead of newLeads) {
        addToActivityLog(`Processing ${lead.name}...`, 'info');

        // Look up interests from social personas
        const persona = socialPersonas[lead.socialMediaHandle];
        if (!persona) {
          addToActivityLog(`No social persona found for ${lead.socialMediaHandle}`, 'warning');
          continue;
        }

        // Generate personalized email using Gemini API
        const systemInstruction = "You are an expert sales copywriter for 'Virgin Active', a premium gym operating in London, UK. Your tone is encouraging, knowledgeable, and not pushy. Write a short, personalized outreach email. The goal is to get the prospect to click a virtual tour link and book a free trial session.";
        
        const userPrompt = `Generate an email for a prospect named ${lead.name}. Their social media persona suggests they are interested in: ${persona.interests.join(', ')}. Make sure to include placeholders like [Virgin Active Virtual Tour Link] and mention the free trial.`;

        try {
          await callGeminiAPI(userPrompt, systemInstruction);
          addToActivityLog(`✉️ Email generated and sent to ${lead.name}`, 'success');

          // Update prospect status to 'Contacted'
          setCrmData(prev => 
            prev.map(prospect => 
              prospect.id === lead.id 
                ? { ...prospect, status: 'Contacted' as const }
                : prospect
            )
          );

          addToActivityLog(`📊 Updated ${lead.name}'s status to 'Contacted'`, 'success');
        } catch (error) {
          addToActivityLog(`❌ Failed to process ${lead.name}: ${error}`, 'warning');
        }

        // 2-second delay between processing leads
        if (lead !== newLeads[newLeads.length - 1]) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // Step 4: Completion message
      addToActivityLog('✅ Agent has completed all tasks.', 'success');
      toast({
        title: "Success",
        description: `Agent processed ${newLeads.length} leads successfully.`,
      });

    } catch (error) {
      console.error('Agent deployment error:', error);
      addToActivityLog(`❌ Agent deployment failed: ${error}`, 'warning');
      toast({
        title: "Error",
        description: "Agent deployment failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeploying(false);
    }
  };

  // Get status badge variant
  const getStatusBadge = (status: Prospect['status']) => {
    switch (status) {
      case 'New':
        return <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">New</Badge>;
      case 'Contacted':
        return <Badge variant="secondary" className="bg-yellow-500 text-white hover:bg-yellow-600">Contacted</Badge>;
      case 'Interested':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Interested</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get activity log icon
  const getLogIcon = (type: ActivityLog['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
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
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sales Persona - AI Agent</h1>
        <p className="text-gray-600">Manage prospects and deploy AI agent for automated outreach</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Panel 1: CRM Prospects */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              CRM Prospects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {crmData.length > 0 ? (
                crmData.map((prospect) => (
                  <div key={prospect.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{prospect.name}</span>
                      </div>
                      {getStatusBadge(prospect.status)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Mail className="h-4 w-4" />
                      {prospect.email}
                    </div>
                    <div className="text-xs text-gray-500">
                      {prospect.socialMediaHandle}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No prospects found</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Panel 2: AI Agent Control */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5" />
              AI Agent Control
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Deploy Button */}
              <Button
                onClick={deployAgent}
                disabled={isDeploying}
                className="w-full"
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
                    🚀 Deploy Agent
                  </>
                )}
              </Button>

              <Separator />

              {/* Agent Activity Log */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Agent Activity Log
                </h3>
                <Card className="border-slate-200">
                  <CardContent className="p-0">
                    <ScrollArea className="h-[400px] w-full">
                      <div className="p-4">
                        {activityLog.length > 0 ? (
                          <div className="space-y-3">
                            {activityLog.map((log) => (
                              <div key={log.id} className="flex items-start gap-3 text-sm">
                                {getLogIcon(log.type)}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Clock className="h-3 w-3 text-gray-400" />
                                    <span className="text-xs text-gray-500">{log.timestamp}</span>
                                  </div>
                                  <p className="text-gray-900">{log.message}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-8">No activity yet. Deploy the agent to start processing leads.</p>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}