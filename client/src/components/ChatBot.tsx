
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { apiRequest } from "@/lib/queryClient";

interface Message {
  role: "user" | "assistant";
  content: string;
  buttons?: Array<{ text: string; value: string }>;
}

interface UserData {
  language?: string;
  fitnessGoal?: string;
  frequency?: string;
  location?: string;
  name?: string;
  email?: string;
  phone?: string;
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [showProactiveGreeting, setShowProactiveGreeting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi there! Welcome to Virgin Active. Let's find the perfect fitness solution for you!",
      buttons: [
        { text: "English", value: "english" },
        { text: "Español", value: "spanish" },
        { text: "Français", value: "french" }
      ]
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random()}`);
  const [userData, setUserData] = useState<UserData>({});
  const [currentStep, setCurrentStep] = useState("language");

  // Show proactive greeting after a short delay when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowProactiveGreeting(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Hide proactive greeting when chat is opened
  useEffect(() => {
    if (isOpen) {
      setShowProactiveGreeting(false);
    }
  }, [isOpen]);

  const handleButtonClick = async (value: string) => {
    // Add user's choice to messages
    const buttonMessage = messages[messages.length - 1];
    const selectedButton = buttonMessage.buttons?.find(btn => btn.value === value);
    
    setMessages(prev => [...prev, { 
      role: "user", 
      content: selectedButton?.text || value 
    }]);

    // Update user data and determine next step
    let nextStep = "";
    let assistantResponse: Message = { role: "assistant", content: "" };

    switch (currentStep) {
      case "language":
        setUserData(prev => ({ ...prev, language: value }));
        nextStep = "fitnessGoal";
        assistantResponse = {
          role: "assistant",
          content: "Great choice! What's your main fitness goal?",
          buttons: [
            { text: "Weight Loss", value: "weight_loss" },
            { text: "Build Muscle", value: "build_muscle" },
            { text: "Improve Endurance", value: "improve_endurance" },
            { text: "General Fitness", value: "general_fitness" }
          ]
        };
        break;

      case "fitnessGoal":
        setUserData(prev => ({ ...prev, fitnessGoal: value }));
        nextStep = "frequency";
        assistantResponse = {
          role: "assistant",
          content: "Excellent! How often do you plan to visit the gym?",
          buttons: [
            { text: "1-2 times/week", value: "1-2" },
            { text: "3-4 times/week", value: "3-4" },
            { text: "5+ times/week", value: "5+" },
            { text: "Not sure yet", value: "unsure" }
          ]
        };
        break;

      case "frequency":
        setUserData(prev => ({ ...prev, frequency: value }));
        nextStep = "location";
        assistantResponse = {
          role: "assistant",
          content: "Perfect! Which area are you looking for a gym in?",
          buttons: [
            { text: "Central London", value: "central_london" },
            { text: "East London", value: "east_london" },
            { text: "West London", value: "west_london" },
            { text: "South London", value: "south_london" },
            { text: "North London", value: "north_london" }
          ]
        };
        break;

      case "location":
        setUserData(prev => ({ ...prev, location: value }));
        nextStep = "contact";
        assistantResponse = {
          role: "assistant",
          content: "Great! To help you get started, could you share your contact details?",
          buttons: [
            { text: "Yes, I'll share", value: "share_contact" },
            { text: "Just browsing", value: "browsing" }
          ]
        };
        break;

      case "contact":
        if (value === "share_contact") {
          nextStep = "name";
          assistantResponse = {
            role: "assistant",
            content: "Wonderful! What's your first name?"
          };
        } else {
          nextStep = "complete";
          assistantResponse = {
            role: "assistant",
            content: "No problem! Based on your interests, I'd recommend checking out our Premium membership. You can explore our facilities anytime. Thanks for chatting with us!"
          };
        }
        break;

      case "name":
        setUserData(prev => ({ ...prev, name: value }));
        nextStep = "email";
        assistantResponse = {
          role: "assistant",
          content: `Nice to meet you, ${value}! What's your email address?`
        };
        break;

      case "email":
        setUserData(prev => ({ ...prev, email: value }));
        nextStep = "phone";
        assistantResponse = {
          role: "assistant",
          content: "Great! And your phone number?"
        };
        break;

      case "phone":
        setUserData(prev => ({ ...prev, phone: value }));
        nextStep = "complete";
        
        // Save lead data
        try {
          await apiRequest("POST", "/api/leads", {
            ...userData,
            phone: value,
            sessionId
          });
        } catch (error) {
          console.error("Error saving lead:", error);
        }

        assistantResponse = {
          role: "assistant",
          content: `Thank you ${userData.name}! I've got all your details. Based on your goal of ${userData.fitnessGoal?.replace('_', ' ')} and visiting ${userData.frequency} times per week in ${userData.location?.replace('_', ' ')}, our Premium membership would be perfect for you. Someone from our team will contact you within 24 hours to arrange a tour and discuss membership options. Have a great day!`
        };
        break;

      default:
        assistantResponse = {
          role: "assistant",
          content: "Thanks for your interest! Someone from our team will be in touch soon."
        };
    }

    setCurrentStep(nextStep);
    
    // Add assistant response after a short delay
    setTimeout(() => {
      setMessages(prev => [...prev, assistantResponse]);
    }, 500);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");

    // Handle text input based on current step
    if (currentStep === "name" || currentStep === "email" || currentStep === "phone") {
      handleButtonClick(userMessage);
      return;
    }

    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/chat/message", {
        message: userMessage,
        sessionId,
        userData,
        currentStep
      });

      const data = await response.json();
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: data.content, buttons: data.buttons },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "I'm experiencing some technical difficulties. Please try again or contact us directly at 020 3837 4721.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Proactive Greeting */}
      {showProactiveGreeting && !isOpen && (
        <div className="absolute bottom-16 right-0 mb-2 animate-in slide-in-from-bottom-4 duration-500">
          <Card className="w-72 shadow-lg border bg-background/95 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground" data-testid="text-proactive-greeting">
                    Hi there! 👋 Welcome to Virgin Active. I'm here to help you find the perfect fitness solution. What brings you here today?
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      onClick={() => setIsOpen(true)}
                      className="text-xs bg-primary hover:bg-primary/90"
                      data-testid="button-start-chat"
                    >
                      Start Chat
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowProactiveGreeting(false)}
                      className="text-xs"
                      data-testid="button-dismiss-greeting"
                    >
                      Maybe later
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Toggle Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={() => setIsOpen(!isOpen)}
            className="w-14 h-14 rounded-full shadow-lg hover:scale-110 transition-all duration-300 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold"
            data-testid="button-toggle-chatbot"
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <MessageCircle className="h-6 w-6" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>💬 {isOpen ? "Close chat" : "Chat with our AI assistant!"}</p>
        </TooltipContent>
      </Tooltip>

      {/* Chat Window */}
      {isOpen && (
        <Card className="absolute bottom-16 right-0 w-80 shadow-2xl border">
          <CardHeader className="bg-primary text-primary-foreground p-4 flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-semibold" data-testid="text-chatbot-title">
                  AI Assistant
                </h4>
                <p className="text-xs text-primary-foreground/80">Online now</p>
              </div>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-primary-foreground/80 hover:text-primary-foreground p-1 bg-gradient-to-r from-red-100 to-red-200 text-red-700 hover:from-red-200 hover:to-red-300 hover:text-red-800"
                  data-testid="button-close-chatbot"
                >
                  <X className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>❌ Close chat window</p>
              </TooltipContent>
            </Tooltip>
          </CardHeader>

          <CardContent className="p-0">
            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}
                  data-testid={`message-${message.role}-${index}`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`rounded-2xl p-3 max-w-64 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-md"
                        : "bg-muted rounded-tl-md"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    {message.buttons && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.buttons.map((button, btnIndex) => (
                          <Button
                            key={btnIndex}
                            size="sm"
                            variant="outline"
                            className="text-xs h-8"
                            onClick={() => handleButtonClick(button.value)}
                          >
                            {button.text}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                  {message.role === "user" && (
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-md p-3 max-w-64">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            {(currentStep === "name" || currentStep === "email" || currentStep === "phone") && (
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder={
                      currentStep === "name" ? "Enter your name..." :
                      currentStep === "email" ? "Enter your email..." :
                      "Enter your phone number..."
                    }
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    data-testid="input-chat-message"
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={sendMessage}
                        disabled={!input.trim() || isLoading}
                        size="sm"
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold shadow-md disabled:from-gray-400 disabled:to-gray-500"
                        data-testid="button-send-message"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>📤 Send your message to the AI!</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
