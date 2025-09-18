
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Dumbbell } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login, logout } = useAuthContext();

  // Logout function for convenience
  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    setLocation("/");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Dummy credentials
    const validCredentials = [
      { email: "admin@virginactive.com", password: "admin123", role: "staff" },
      { email: "member@virginactive.com", password: "member123", role: "member" },
      { email: "demo@virginactive.com", password: "demo123", role: "member" }
    ];

    const user = validCredentials.find(
      cred => cred.email === email && cred.password === password
    );

    setTimeout(() => {
      if (user) {
        // Use AuthContext login function
        const userData = {
          id: Date.now().toString(),
          email: user.email,
          role: user.role,
          firstName: user.email.split("@")[0],
          lastName: "User"
        };
        
        login(userData as any);

        toast({
          title: "Login Successful",
          description: `Welcome back, ${user.email}!`,
        });

        // Redirect based on role
        if (user.role === "staff") {
          setLocation("/staff");
        } else {
          setLocation("/portal");
        }
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid email or password. Try: admin@virginactive.com / admin123",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
              <Dumbbell className="text-white h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Virgin Active Login
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Sign in to your account
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h4 className="font-semibold text-sm text-gray-700 mb-2">Demo Credentials:</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <div><strong>Staff:</strong> admin@virginactive.com / admin123</div>
              <div><strong>Member:</strong> member@virginactive.com / member123</div>
              <div><strong>Demo:</strong> demo@virginactive.com / demo123</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-3 text-xs"
              onClick={handleLogout}
            >
              Logout Current Session
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
