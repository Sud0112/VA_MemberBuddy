import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Star, Clock, MapPin, Package, Calendar, CheckCircle } from "lucide-react";
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
  const [collectionDialog, setCollectionDialog] = useState<{ isOpen: boolean; offer?: LoyaltyOffer | null }>({ isOpen: false, offer: null });

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
    onSuccess: (data, offerId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/redemptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      // Find the redeemed offer to show collection instructions
      const redeemedOffer = (offers as LoyaltyOffer[]).find(o => o.id === offerId);
      if (redeemedOffer) {
        setCollectionDialog({ isOpen: true, offer: redeemedOffer });
      }
      
      toast({
        title: "Offer Redeemed Successfully!",
        description: `${redeemedOffer?.title || 'Your reward'} has been added to your redemption history.`,
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

  const getCollectionInstructions = (offer: LoyaltyOffer) => {
    const category = offer.category.toLowerCase();
    
    if (category === 'merchandise') {
      return {
        title: 'Collection Required',
        description: 'Please collect your item from the front desk during business hours (6AM-10PM). Bring photo ID for verification.',
        location: 'Front Desk - Main Entrance',
        timeframe: 'Available for collection within 30 days'
      };
    } else if (category === 'nutrition') {
      return {
        title: 'Ready for Pickup',
        description: 'Your nutrition item is ready for collection at our smoothie bar.',
        location: 'Smoothie Bar - First Floor',
        timeframe: 'Collect within 7 days'
      };
    } else if (category === 'training' || category === 'classes') {
      return {
        title: 'Session Booking Required',
        description: 'Contact our training team to schedule your session at your convenience.',
        location: 'Call: (555) 123-4567 or visit Front Desk',
        timeframe: 'Book within 60 days'
      };
    } else if (category === 'wellness') {
      return {
        title: 'Appointment Booking',
        description: 'Schedule your wellness session with our reception team.',
        location: 'Reception - Second Floor',
        timeframe: 'Book within 90 days'
      };
    } else {
      return {
        title: 'Redemption Complete',
        description: 'Your reward has been processed and will be available shortly.',
        location: 'Check your member account for updates',
        timeframe: 'Processing within 24 hours'
      };
    }
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

  const redeemedOffers = (redemptions as OfferRedemption[])
    .map(redemption => {
      const offer = (offers as LoyaltyOffer[]).find(o => o.id === redemption.offerId);
      return offer ? { ...offer, redemption } : null;
    })
    .filter(Boolean)
    .reverse(); // Show most recent first

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

        <Tabs defaultValue="available" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="available">Available Offers</TabsTrigger>
            <TabsTrigger value="history">
              My Redemptions ({redeemedOffers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-6">
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
                            {offer.category === 'Food' ? '🍽️ ' : 
                             offer.category === 'Fitness' ? '💪 ' :
                             offer.category === 'Merchandise' ? '🎁 ' :
                             offer.category === 'Wellness' ? '🧘 ' :
                             offer.category === 'Training' ? '🎯 ' :
                             offer.category === 'Classes' ? '🏃 ' : ''}
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
                            className={status === "available" 
                              ? "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold shadow-md" 
                              : "bg-gradient-to-r from-gray-400 to-gray-500 text-white font-medium"}
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
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            {redeemedOffers.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No Redemptions Yet</h3>
                  <p>Your redeemed rewards will appear here</p>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {redeemedOffers.map((item: any) => {
                  const instructions = getCollectionInstructions(item);
                  return (
                    <Card key={`${item.id}-${item.redemption.id}`} className="overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                              <CheckCircle className="text-green-600 h-6 w-6" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {item.title}
                              </h3>
                              <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>
                                    Redeemed {new Date(item.redemption.redeemedAt).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4" />
                                  <span>{item.redemption.pointsSpent} points</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <Badge className={getCategoryColor(item.category)}>
                            {item.category === 'Food' ? '🍽️ ' : 
                             item.category === 'Fitness' ? '💪 ' :
                             item.category === 'Merchandise' ? '🎁 ' :
                             item.category === 'Wellness' ? '🧘 ' :
                             item.category === 'Training' ? '🎯 ' :
                             item.category === 'Classes' ? '🏃 ' : ''}
                            {item.category}
                          </Badge>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="font-semibold text-blue-900 mb-1">{instructions.title}</h4>
                              <p className="text-blue-800 text-sm mb-2">{instructions.description}</p>
                              <div className="space-y-1 text-sm">
                                <p className="text-blue-700"><strong>Location:</strong> {instructions.location}</p>
                                <p className="text-blue-700"><strong>Timeframe:</strong> {instructions.timeframe}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
        {/* Collection Instructions Dialog */}
        <AlertDialog open={collectionDialog.isOpen} onOpenChange={(open) => setCollectionDialog({ isOpen: open, offer: null })}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Reward Redeemed Successfully!
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-4">
                {collectionDialog.offer && (() => {
                  const instructions = getCollectionInstructions(collectionDialog.offer);
                  return (
                    <div className="text-left">
                      <div className="bg-green-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-2 text-green-800 mb-2">
                          <CheckCircle className="h-4 w-4" />
                          <span className="font-semibold">{collectionDialog.offer.title}</span>
                        </div>
                        <p className="text-green-700 text-sm">{collectionDialog.offer.description}</p>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900">{instructions.title}</h4>
                        <p className="text-gray-700 text-sm">{instructions.description}</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                            <span><strong>Location:</strong> {instructions.location}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Clock className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                            <span><strong>Timeframe:</strong> {instructions.timeframe}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction>Got it!</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </div>
  );
}
