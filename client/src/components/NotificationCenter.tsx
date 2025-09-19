import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { 
  Bell, 
  X, 
  Trophy, 
  Star, 
  Target, 
  AlertTriangle, 
  Gift,
  TrendingUp,
  Users,
  CheckCircle,
  UserPlus
} from "lucide-react";

interface Notification {
  id: string;
  type: 'achievement' | 'alert' | 'reward' | 'milestone' | 'lead';
  title: string;
  message: string;
  timestamp: Date | string;
  read: boolean;
  urgent?: boolean;
  leadId?: string;
  memberId?: string;
}

interface NotificationCenterProps {
  userRole: 'member' | 'staff';
  onNavigateToSalesPersona?: (leadId?: string) => void;
}

export function NotificationCenter({ userRole, onNavigateToSalesPersona }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Fetch real notifications for staff, use mock data for members
  const { data: fetchedNotifications, isLoading } = useQuery({
    queryKey: ['/api/staff/notifications'],
    enabled: userRole === 'staff', // Only fetch for staff
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  // Use mock data for members, real data for staff
  const notifications: Notification[] = userRole === 'member' ? [
    {
      id: '1',
      type: 'achievement',
      title: 'Streak Milestone! 🎉',
      message: 'You have completed a 7-day workout streak! Keep it up!',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      read: false
    },
    {
      id: '2',
      type: 'reward',
      title: 'Points Earned',
      message: 'You earned 50 loyalty points from your last workout!',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false
    },
    {
      id: '3',
      type: 'milestone',
      title: 'Monthly Goal Achieved!',
      message: 'Congratulations! You have hit your monthly workout target of 20 sessions.',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      read: true
    }
  ] : (fetchedNotifications as Notification[] || []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'achievement':
        return <Trophy className="h-5 w-5 text-yellow-600" />;
      case 'reward':
        return <Gift className="h-5 w-5 text-blue-600" />;
      case 'milestone':
        return <Target className="h-5 w-5 text-green-600" />;
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'lead':
        return <UserPlus className="h-5 w-5 text-blue-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  // For now, these will be no-ops since we're using real-time data
  // In a full implementation, these would update the server state
  const markAsRead = (id: string) => {
    // TODO: Make API call to mark notification as read
    console.log('Mark as read:', id);
  };

  const markAllAsRead = () => {
    // TODO: Make API call to mark all notifications as read
    console.log('Mark all as read');
  };

  const removeNotification = (id: string) => {
    // TODO: Make API call to remove notification
    console.log('Remove notification:', id);
  };

  const formatTime = (timestamp: Date | string) => {
    const now = new Date();
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
        data-testid="button-notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-xl border border-gray-200 z-50">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {userRole === 'member' ? 'Your Achievements' : 'Staff Alerts'}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 hover:from-blue-200 hover:to-purple-200 hover:text-blue-800 font-medium"
                    >
                      Mark all read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="bg-gradient-to-r from-red-100 to-red-200 text-red-700 hover:from-red-200 hover:to-red-300 hover:text-red-800 font-medium"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border transition-all cursor-pointer ${
                        !notification.read 
                          ? notification.urgent 
                            ? 'bg-red-50 border-red-200' 
                            : 'bg-blue-50 border-blue-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                      onClick={() => {
                        markAsRead(notification.id);
                        if (notification.type === 'lead' && onNavigateToSalesPersona) {
                          setIsOpen(false); // Close notification panel
                          onNavigateToSalesPersona(notification.leadId);
                        }
                      }}
                      data-testid={`notification-${notification.id}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h4 className={`text-sm font-semibold ${
                              !notification.read ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </h4>
                            <div className="flex items-center gap-1 ml-2">
                              <span className="text-xs text-gray-500">
                                {formatTime(notification.timestamp)}
                              </span>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                          </div>
                          <p className={`text-xs mt-1 ${
                            !notification.read ? 'text-gray-700' : 'text-gray-600'
                          }`}>
                            {notification.message}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                          className="flex-shrink-0 p-1 h-6 w-6 bg-gradient-to-r from-red-100 to-red-200 text-red-600 hover:from-red-200 hover:to-red-300 hover:text-red-700"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}