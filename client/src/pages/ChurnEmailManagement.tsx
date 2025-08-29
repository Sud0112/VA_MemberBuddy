import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  CheckCircle, 
  XCircle, 
  Send, 
  Clock, 
  User,
  Calendar,
  Eye,
  EyeOff
} from "lucide-react";

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

export function ChurnEmailManagement() {
  const [emails, setEmails] = useState<ChurnEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<ChurnEmail | null>(null);
  const [expandedContent, setExpandedContent] = useState<string | null>(null);

  useEffect(() => {
    fetchChurnEmails();
  }, []);

  const fetchChurnEmails = async () => {
    try {
      const response = await fetch('/api/staff/churn-emails', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setEmails(data);
      }
    } catch (error) {
      console.error("Error fetching churn emails:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (emailId: string) => {
    try {
      const response = await fetch(`/api/staff/churn-emails/${emailId}/approve`, {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        await fetchChurnEmails(); // Refresh the list
      }
    } catch (error) {
      console.error("Error approving email:", error);
    }
  };

  const handleReject = async (emailId: string) => {
    try {
      const response = await fetch(`/api/staff/churn-emails/${emailId}/reject`, {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        await fetchChurnEmails(); // Refresh the list
      }
    } catch (error) {
      console.error("Error rejecting email:", error);
    }
  };

  const handleMarkSent = async (emailId: string) => {
    try {
      const response = await fetch(`/api/staff/churn-emails/${emailId}/send`, {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        await fetchChurnEmails(); // Refresh the list
      }
    } catch (error) {
      console.error("Error marking email as sent:", error);
    }
  };

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'bg-red-600 hover:bg-red-700 text-white shadow-sm';
      case 'medium': return 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm';
      case 'low': return 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-sm';
      default: return 'bg-gray-500 hover:bg-gray-600 text-white shadow-sm';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm';
      case 'approved': return 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm';
      case 'rejected': return 'bg-red-600 hover:bg-red-700 text-white shadow-sm';
      case 'sent': return 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm';
      default: return 'bg-gray-500 hover:bg-gray-600 text-white shadow-sm';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-slate-600 text-lg">Loading churn emails...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="p-8 space-y-8">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Churn Prevention Emails</h1>
              <p className="text-slate-600 text-lg">Review and approve AI-generated emails to prevent member churn</p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {emails.filter(e => e.status === 'pending').length}
                </div>
                <div className="text-sm text-slate-500">Pending Approval</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  {emails.filter(e => e.status === 'approved').length}
                </div>
                <div className="text-sm text-slate-500">Approved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {emails.filter(e => e.status === 'sent').length}
                </div>
                <div className="text-sm text-slate-500">Sent</div>
              </div>
            </div>
          </div>
        </div>

      {emails.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No churn prevention emails generated yet</p>
              <p className="text-sm text-gray-400 mt-2">
                Emails are automatically generated when members move between risk bands
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {emails.map((email) => (
            <Card key={email.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{email.subject}</h3>
                      <Badge className={`${getRiskBadgeColor(email.riskLevel)} text-white text-xs`}>
                        {email.riskLevel.toUpperCase()} RISK
                      </Badge>
                      <Badge className={`${getStatusBadgeColor(email.status)} text-white text-xs`}>
                        {email.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{email.memberName || `${email.memberProfile.firstName} ${email.memberProfile.lastName}`}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Mail className="h-4 w-4" />
                        <span>{email.memberEmail || email.memberProfile.email}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(email.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {email.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(email.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(email.id)}
                          className="border-red-600 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    
                    {email.status === 'approved' && (
                      <Button
                        size="sm"
                        onClick={() => handleMarkSent(email.id)}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Mark Sent
                      </Button>
                    )}
                    
                    {email.status === 'sent' && (
                      <div className="flex items-center text-green-600 text-sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Sent
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="border-t pt-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {expandedContent === email.id 
                          ? email.content 
                          : truncateContent(email.content)
                        }
                      </p>
                      
                      {email.content.length > 150 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setExpandedContent(
                            expandedContent === email.id ? null : email.id
                          )}
                          className="mt-2 p-0 h-auto text-blue-600 hover:text-blue-800"
                        >
                          {expandedContent === email.id ? (
                            <>
                              <EyeOff className="h-4 w-4 mr-1" />
                              Show less
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-1" />
                              Show full email
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t bg-gray-50 -mx-6 px-6 py-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-600">
                      <div>
                        <span className="font-medium">Membership:</span><br />
                        {email.memberMembershipType || email.memberProfile.membershipType}
                      </div>
                      <div>
                        <span className="font-medium">Risk Band:</span><br />
                        {email.currentRiskBand}
                      </div>
                      <div>
                        <span className="font-medium">Last Visit:</span><br />
                        {email.memberProfile.lastVisit 
                          ? Math.floor((Date.now() - new Date(email.memberProfile.lastVisit).getTime()) / (1000 * 60 * 60 * 24)) + " days ago"
                          : "Never"
                        }
                      </div>
                      <div>
                        <span className="font-medium">Loyalty Points:</span><br />
                        {email.memberProfile.loyaltyPoints}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}