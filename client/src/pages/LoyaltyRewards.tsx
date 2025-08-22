import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { LoyaltyOffer, OfferRedemption } from "@shared/schema";

export function LoyaltyRewards() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: offers = [], isLoading: offersLoading } = useQuery({
    queryKey: ["/api/loyalty-offers"],
    retry: false,
  });

  const { data: redemptions = [] } = useQuery({
    queryKey: ["/api/user/redemptions"],
    retry: false,
  });

  const redeemOfferMutation = useMutation({
    mutationFn: async (offerId: string) => {
      const response = await apiRequest("POST", `/api/offers/${offerId}/redeem`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/redemptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Offer Redeemed!",
        description: "Your points have been deducted and your reward is being processed.",
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
      
      const errorMessage = error.message.includes("400:")
        ? error.message.split("400: ")[1]
        : "Failed to redeem offer. Please try again.";
      
      toast({
        title: "Redemption Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const getOfferStatus = (offer: LoyaltyOffer) => {
    const isRedeemed = (redemptions as OfferRedemption[]).some((r: OfferRedemption) => r.offerId === offer.id);
    const canAfford = user && (user.loyaltyPoints || 0) >= offer.points;
    
    if (isRedeemed) return "redeemed";
    if (!canAfford) return "insufficient";
    return "available";
  };

  const getOfferButtonText = (status: string) => {
    switch (status) {
      case "redeemed": return "Redeemed";
      case "insufficient": return "Insufficient Points";
      default: return "Redeem";
    }
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

  if (offersLoading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4 w-2/3"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Loyalty Rewards</h1>
            <p className="text-gray-600">Redeem your points for exclusive rewards and perks</p>
          </div>
          <Card className="bg-gradient-to-br from-primary to-primary/90 text-white">
            <CardContent className="px-6 py-4">
              <p className="text-sm text-primary-foreground/80">Available Points</p>
              <p className="text-2xl font-bold" data-testid="text-user-points">
                {user?.loyaltyPoints}
              </p>
            </CardContent>
          </Card>
        </div>

        {(offers as LoyaltyOffer[]).length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-gray-500">
              <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Rewards Available</h3>
              <p>Check back later for new loyalty offers!</p>
            </div>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {(offers as LoyaltyOffer[]).map((offer: LoyaltyOffer) => {
              const status = getOfferStatus(offer);
              const isDisabled = status !== "available" || redeemOfferMutation.isPending;
              
              return (
                <Card
                  key={offer.id}
                  className={`overflow-hidden transition-all duration-300 ${
                    status === "redeemed" 
                      ? "opacity-60 bg-gray-50" 
                      : "hover:shadow-lg"
                  }`}
                  data-testid={`offer-${offer.id}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {offer.title}
                        </h3>
                        <p className="text-gray-600 text-sm">{offer.description}</p>
                      </div>
                      <Badge className={getCategoryColor(offer.category)}>
                        {offer.category}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-primary">
                        <Star className="h-4 w-4" />
                        <span className="font-semibold">{offer.points} points</span>
                      </div>
                      <Button
                        onClick={() => redeemOfferMutation.mutate(offer.id)}
                        disabled={isDisabled}
                        variant={status === "available" ? "default" : "secondary"}
                        size="sm"
                        data-testid={`button-redeem-${offer.id}`}
                      >
                        {getOfferButtonText(status)}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
