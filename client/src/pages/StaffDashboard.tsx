import { useState } from "react";
import { AppLayout } from "@/components/ui/layout";
import { ChurnPrediction } from "@/pages/ChurnPrediction";
import { LoyaltyCampaigns } from "@/pages/LoyaltyCampaigns";

export function StaffDashboard() {
  const [activeTab, setActiveTab] = useState("churn-prediction");

  const renderContent = () => {
    switch (activeTab) {
      case "loyalty-campaigns":
        return <LoyaltyCampaigns />;
      case "member-analytics":
        return <MemberAnalytics />;
      default:
        return <ChurnPrediction />;
    }
  };

  return (
    <AppLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      userRole="staff"
    >
      {renderContent()}
    </AppLayout>
  );
}

function MemberAnalytics() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Member Analytics</h1>
        <p className="text-gray-600">Comprehensive insights into member behavior and engagement</p>
      </div>
      
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="text-gray-500">
          <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
          <p>Advanced analytics features coming soon...</p>
        </div>
      </div>
    </div>
  );
}
