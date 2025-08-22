import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-white to-gray-50 border-t border-gray-200 p-4 shadow-lg z-50">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-600">
          <p>
            We use cookies to enhance your experience and analyze our traffic.{" "}
            <a href="#" className="text-primary hover:underline">
              Learn more
            </a>
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="bg-gradient-to-r from-red-100 to-red-200 text-red-700 hover:from-red-200 hover:to-red-300 hover:text-red-800 font-medium"
            onClick={handleDecline}
            data-testid="button-decline-cookies"
          >
            Decline
          </Button>
          <Button
            size="sm"
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold shadow-md"
            onClick={handleAccept}
            data-testid="button-accept-cookies"
          >
            Accept All
          </Button>
        </div>
      </div>
    </div>
  );
}
