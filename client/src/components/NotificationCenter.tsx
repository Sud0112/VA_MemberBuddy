import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  CheckCircle
} from "lucide-react";

interface Notification {
  id: string;
  type: 'achievement' | 'alert' | 'reward' | 'milestone';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  urgent?: boolean;
}

interface NotificationCenterProps {
  userRole: 'member' | 'staff';
}

export function NotificationCenter({ userRole }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    // Mock notifications based on user role
    if (userRole === 'member') {
      return [
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
      ];
    } else {
      return [
        {
          id: '1',
          type: 'alert',
          title: 'Member At Risk',
          message: 'Sarah Wilson has not visited in 6 days. Consider outreach.',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          read: false,
          urgent: true
        },
        {
          id: '2',
          type: 'milestone',
          title: 'Revenue Milestone',
          message: 'Monthly revenue target exceeded by 12%! Great work team.',
          timestamp: new Date(Date.now() - 60 * 60 * 1000),
          read: false
        },
        {
          id: '3',
          type: 'alert',
          title: 'Peak Hour Alert',
          message: 'Gym capacity at 85% during 6-7 PM slot today.',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
          read: false
        }
      ];
    }
  });

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
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
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
                      className="text-xs"
                    >
                      Mark all read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
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
                      onClick={() => markAsRead(notification.id)}
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
                          className="flex-shrink-0 p-1 h-6 w-6"
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