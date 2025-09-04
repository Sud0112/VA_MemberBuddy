import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Target, Megaphone } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { LoyaltyOffer } from "@shared/schema";

interface GeneratedOffer {
  id: number;
  title: string;
  description: string;
  points: number;
  category: string;
}

export function LoyaltyCampaigns() {
  const [campaignCriteria, setCampaignCriteria] = useState("");
  const [generatedOffers, setGeneratedOffers] = useState<GeneratedOffer[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: activeOffers = [], isLoading: offersLoading } = useQuery({
    queryKey: ["/api/loyalty-offers"],
    retry: false,
  });

  const generateOffersMutation = useMutation({
    mutationFn: async (criteria: string) => {
      const response = await apiRequest("POST", "/api/ai/generate-loyalty-offers", {
        targetCriteria: criteria,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setGeneratedOffers(data.offers || []);
      toast({
        title: "Offers Generated",
        description: "AI has created targeted loyalty offers for your campaign.",
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
        description: "Failed to generate loyalty offers.",
        variant: "destructive",
      });
    },
  });

  const publishOfferMutation = useMutation({
    mutationFn: async (offer: GeneratedOffer) => {
      const response = await apiRequest("POST", "/api/loyalty-offers", {
        title: offer.title,
        description: offer.description,
        points: offer.points,
        category: offer.category,
        isActive: true,
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loyalty-offers"] });
      toast({
        title: "Offer Published",
        description: "The loyalty offer is now available to members.",
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
        description: "Failed to publish loyalty offer.",
        variant: "destructive",
      });
    },
  });

  const deactivateOfferMutation = useMutation({
    mutationFn: async (offerId: string) => {
      const response = await apiRequest("DELETE", `/api/loyalty-offers/${offerId}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loyalty-offers"] });
      toast({
        title: "Offer Deactivated",
        description: "The loyalty offer has been removed from the member portal.",
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
        description: "Failed to deactivate loyalty offer.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateOffers = () => {
    if (!campaignCriteria.trim()) {
      toast({
        title: "Criteria Required",
        description: "Please describe your target audience first.",
        variant: "destructive",
      });
      return;
    }
    generateOffersMutation.mutate(campaignCriteria.trim());
  };

  const handlePublishOffer = (offer: GeneratedOffer) => {
    publishOfferMutation.mutate(offer);
  };

  const handleDeactivateOffer = (offerId: string) => {
    deactivateOfferMutation.mutate(offerId);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      fitness: "bg-primary/10 text-primary",
      wellness: "bg-purple-100 text-purple-800",
      nutrition: "bg-blue-100 text-blue-800",
      social: "bg-orange-100 text-orange-800",
      classes: "bg-green-100 text-green-800",
    };
    return colors[category.toLowerCase() as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <div className="max-w-6xl mx-auto text-center">
            <span className="inline-block px-4 py-2 bg-red-600 text-white text-sm font-bold uppercase tracking-wider rounded-full mb-4">
              Marketing Tools
            </span>
            <h1 className="text-4xl lg:text-6xl font-black tracking-tight text-gray-900 leading-tight mb-6">
              LOYALTY{" "}
              <span className="text-red-600 block">CAMPAIGNS</span>
            </h1>
            <p className="text-xl text-gray-700 leading-relaxed mb-8 max-w-2xl mx-auto">
              Create and manage AI-powered loyalty offers for members
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Create New Campaign */}
          <Card className="border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Target className="h-5 w-5 text-slate-600" />
                Create New Campaign
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                <Textarea
                  placeholder="Example: Members who attend morning yoga classes and have been members for over 6 months"
                  value={campaignCriteria}
                  onChange={(e) => setCampaignCriteria(e.target.value)}
                  className="h-24"
                  data-testid="textarea-campaign-criteria"
                />
              </div>
              <Button
                onClick={handleGenerateOffers}
                disabled={generateOffersMutation.isPending || !campaignCriteria.trim()}
                className="w-full flex items-center gap-2"
                data-testid="button-generate-offers"
              >
                <Sparkles className="h-4 w-4" />
                {generateOffersMutation.isPending ? "Generating..." : "Generate AI Offers"}
              </Button>

              {/* Loading State */}
              {generateOffersMutation.isPending && (
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary mb-2"></div>
                  <p className="text-sm text-gray-600">AI is creating targeted loyalty offers...</p>
                </div>
              )}

              {/* Generated Offers */}
              {generatedOffers.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Generated Offers</h3>
                  {generatedOffers.map((offer) => (
                    <Card key={offer.id} className="bg-slate-50/50 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-slate-900">{offer.title}</h4>
                            <p className="text-sm text-slate-600 leading-relaxed">{offer.description}</p>
                          </div>
                          <Badge className={getCategoryColor(offer.category)}>
                            {offer.category}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-primary font-semibold">{offer.points} points</span>
                          <Button
                            onClick={() => handlePublishOffer(offer)}
                            disabled={publishOfferMutation.isPending}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            data-testid={`button-publish-${offer.id}`}
                          >
                            {publishOfferMutation.isPending ? "Publishing..." : "Publish"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Campaigns */}
          <Card className="border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-slate-600" />
                Active Campaigns
              </CardTitle>
            </CardHeader>
            <CardContent>
              {offersLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse border border-gray-200 rounded-lg p-4">
                      <div className="h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-3 w-2/3"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (activeOffers as LoyaltyOffer[]).length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No Active Campaigns</h3>
                  <p>Create your first campaign to start engaging members with targeted offers.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(activeOffers as LoyaltyOffer[]).map((offer: LoyaltyOffer) => (
                    <Card key={offer.id} className="border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-slate-900">{offer.title}</h4>
                            <p className="text-sm text-slate-600 leading-relaxed">{offer.description}</p>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Active
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4">
                            <span className="text-primary font-semibold">{offer.points} points</span>
                            <span className="text-gray-600">Category: {offer.category}</span>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeactivateOffer(offer.id)}
                            disabled={deactivateOfferMutation.isPending}
                            data-testid={`button-deactivate-${offer.id}`}
                          >
                            {deactivateOfferMutation.isPending ? "Deactivating..." : "Deactivate"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
