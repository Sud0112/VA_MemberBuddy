import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dumbbell,
  Brain,
  Gift,
  TrendingUp,
  Users,
  Heart,
  Facebook,
  Instagram,
  Twitter,
  MapPin,
  Phone,
  Mail,
  Check,
  Star,
  Award,
  Target,
  Clock,
  Quote,
  Zap,
  Shield,
  Sparkles,
  ArrowRight,
  PlayCircle,
  MessageCircle,
  Trophy,
  Rocket,
} from "lucide-react";
import { ChatBot } from "@/components/ChatBot";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function LandingPage() {
  const handleGetStarted = () => {
    window.location.href = "/api/login";
  };

  const handleBookTour = () => {
    // This would trigger the chatbot or a booking form
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      {/* Enhanced Header */}
      <header className="bg-white backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center cursor-pointer transform hover:scale-110 transition-all duration-300 shadow-lg">
                    <Dumbbell className="text-white h-5 w-5" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>🏋️ Your AI-powered fitness companion!</p>
                </TooltipContent>
              </Tooltip>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-primary tracking-tight">
                  CLUBPULSE
                </span>
                <span className="text-xs text-gray-500 font-medium tracking-wider uppercase">
                  Real Wellness
                </span>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href="#features"
                    className="text-gray-600 hover:text-primary transition-all duration-300 font-semibold relative group"
                  >
                    Features
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>✨ Discover what makes us special!</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href="#pricing"
                    className="text-gray-600 hover:text-primary transition-all duration-300 font-semibold relative group"
                  >
                    Pricing
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>💰 Find the perfect plan for your goals!</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href="#success"
                    className="text-gray-600 hover:text-primary transition-all duration-300 font-semibold relative group"
                  >
                    Success Stories
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>🏆 See amazing transformations!</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href="#contact"
                    className="text-gray-600 hover:text-primary transition-all duration-300 font-semibold relative group"
                  >
                    Contact
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>📞 Get in touch with our friendly team!</p>
                </TooltipContent>
              </Tooltip>
            </nav>
            <div className="flex items-center gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-gray-600 hover:text-primary hover:bg-gray-50 font-semibold transition-all duration-300"
                    onClick={handleGetStarted}
                    data-testid="button-sign-in"
                  >
                    Log in
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>🔐 Welcome back, fitness champion!</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="bg-primary hover:bg-primary-600 text-white font-bold shadow-sm transform hover:scale-105 transition-all duration-300"
                    onClick={handleGetStarted}
                    data-testid="button-get-started"
                  >
                    Join now
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>🚀 Begin your incredible fitness transformation!</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </header>

      {/* Revolutionary Hero Section */}
      <section className="relative bg-white section-spacing overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-left content-spacing relative z-10">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                <div className="px-4 py-2 bg-gradient-to-r from-orange-500/20 to-pink-500/20 backdrop-blur-sm border border-orange-400/30 rounded-full">
                  <span className="text-orange-300 font-bold text-sm tracking-wider uppercase">
                    <Sparkles className="w-4 h-4 inline mr-2" />
                    AI-Powered Platform
                  </span>
                </div>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-8 leading-tight">
                WELCOME TO{" "}
                <span className="text-primary block">
                  REAL WELLNESS
                </span>
                <span className="block text-4xl md:text-5xl lg:text-6xl mt-2 text-gray-600">
                  One membership. Endless variety.
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
                <span className="text-gray-900 font-semibold">Real rewards:</span> instant goodies from Kauai & Mother plus partner discounts<br/>
                <span className="text-gray-900 font-semibold">Real endorphins:</span> spacious gym floors & unlimited exercise classes<br/>
                <span className="text-gray-900 font-semibold">Real relaxation:</span> pools, saunas & steam rooms
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start mb-8">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="lg"
                      onClick={handleGetStarted}
                      className="bg-primary hover:bg-primary-600 text-white font-bold text-lg px-8 py-4 transform hover:scale-105 transition-all duration-300 shadow-lg rounded-lg"
                      data-testid="button-start-free-trial"
                    >
                      JOIN THE CLUB
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>🎉 Full access for 7 days - no commitments!</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="lg"
                      className="bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/20 hover:border-white/50 font-semibold text-lg px-8 py-4 transition-all duration-300 shadow-xl"
                      onClick={handleBookTour}
                      data-testid="button-book-tour"
                    >
                      <PlayCircle className="w-5 h-5 mr-3" />
                      Watch Demo
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>🎞️ See our AI technology in action!</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 text-gray-600">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Pay Nothing Until October*</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  <span className="font-semibold">4.9/5 Member Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="font-semibold">50+ Premium Clubs</span>
                </div>
              </div>
            </div>
            <div className="relative z-10">
              <div className="relative group">
                <img
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
                  alt="Modern gym interior with high-tech equipment"
                  className="rounded-3xl shadow-2xl w-full transform group-hover:scale-105 transition-all duration-500 border-4 border-white/20"
                />
                {/* Gradient overlay for better contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/30 to-transparent rounded-3xl"></div>
                
                {/* Dynamic AI Status Card */}
                <div className="absolute -bottom-8 -left-8 bg-gradient-to-br from-slate-800/90 via-purple-800/90 to-indigo-800/90 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-purple-400/30">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center animate-pulse">
                      <Brain className="text-white h-7 w-7" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-lg">AI Coach Active</p>
                      <p className="text-purple-300 font-medium flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Analyzing your fitness data
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Floating Achievement Badge */}
                <div className="absolute -top-6 -right-6 bg-gradient-to-br from-orange-500 to-red-600 text-white p-4 rounded-2xl shadow-xl transform rotate-12 hover:rotate-0 transition-all duration-300">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-6 h-6" />
                    <div>
                      <p className="font-bold text-sm">89% Success</p>
                      <p className="text-xs opacity-90">Goal Achievement</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Revolutionary Features Section */}
      <section
        id="features"
        className="py-24 bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-orange-600 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-600 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24 relative z-10">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-orange-100 to-pink-100 rounded-full mb-6 border border-orange-200">
              <Sparkles className="w-5 h-5 text-orange-600" />
              <span className="text-orange-800 font-bold text-sm tracking-wider uppercase">Revolutionary Technology</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-8 leading-tight">
              Where AI Meets{" "}
              <span className="bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                Human Potential
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-medium">
              Step into the future of fitness with our groundbreaking AI-powered platform.
              <span className="block mt-3 text-orange-600 font-semibold">
                Personalized • Intelligent • Transformative
              </span>
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            {[
              {
                icon: Brain,
                title: "AI Personal Trainer",
                description:
                  "Revolutionary AI technology creates personalized workout plans that evolve with your progress. Real-time form correction and motivation.",
                color: "from-orange-500 to-red-500",
                bgColor: "from-orange-50 to-red-50",
                iconBg: "from-orange-100 to-red-100",
              },
              {
                icon: Zap,
                title: "Smart Analytics",
                description:
                  "Advanced performance tracking with predictive insights. Our AI analyzes patterns to optimize your results and prevent plateaus.",
                color: "from-blue-500 to-purple-500",
                bgColor: "from-blue-50 to-purple-50",
                iconBg: "from-blue-100 to-purple-100",
              },
              {
                icon: Trophy,
                title: "Gamified Rewards",
                description:
                  "Earn points, unlock achievements, and climb leaderboards. Redeem rewards for premium services and exclusive member perks.",
                color: "from-yellow-500 to-orange-500",
                bgColor: "from-yellow-50 to-orange-50",
                iconBg: "from-yellow-100 to-orange-100",
              },
              {
                icon: Users,
                title: "Elite Community",
                description:
                  "Connect with motivated members, join exclusive challenges, and access expert-led group sessions in our premium environment.",
                color: "from-green-500 to-emerald-500",
                bgColor: "from-green-50 to-emerald-50",
                iconBg: "from-green-100 to-emerald-100",
              },
              {
                icon: Dumbbell,
                title: "Premium Equipment",
                description:
                  "State-of-the-art fitness technology with smart sensors. Equipment that adapts to your workout and tracks every rep automatically.",
                color: "from-purple-500 to-pink-500",
                bgColor: "from-purple-50 to-pink-50",
                iconBg: "from-purple-100 to-pink-100",
              },
              {
                icon: Heart,
                title: "Holistic Wellness",
                description:
                  "Complete wellness ecosystem including nutrition AI, recovery optimization, stress management, and mental health support.",
                color: "from-pink-500 to-rose-500",
                bgColor: "from-pink-50 to-rose-50",
                iconBg: "from-pink-100 to-rose-100",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className={`group bg-gradient-to-br ${feature.bgColor} border-2 border-transparent hover:border-gray-200 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 relative overflow-hidden`}
              >
                {/* Hover glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                
                <CardContent className="p-8 relative z-10">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.iconBg} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                    <feature.icon className={`bg-gradient-to-br ${feature.color} bg-clip-text text-transparent h-8 w-8`} />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-4 group-hover:text-gray-700 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed font-medium group-hover:text-gray-800 transition-colors duration-300">
                    {feature.description}
                  </p>
                  
                  {/* Animated arrow on hover */}
                  <div className="mt-6 flex items-center text-gray-400 group-hover:text-gray-600 transition-all duration-300">
                    <span className="text-sm font-semibold mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">Learn more</span>
                    <ArrowRight className="w-4 h-4 transform translate-x-0 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Immersive Facility Showcase */}
          <div className="mt-24 relative z-10">
            <div className="text-center mb-16">
              <h3 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
                Experience Our{" "}
                <span className="bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                  Premium Facilities
                </span>
              </h3>
              <p className="text-xl text-gray-600 font-medium max-w-2xl mx-auto">
                State-of-the-art equipment and spaces designed for your success
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                <img
                  src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400"
                  alt="Cardio area with modern treadmills"
                  className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-6 left-6 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                  <h4 className="text-xl font-bold mb-2">Cardio Zone</h4>
                  <p className="text-sm opacity-90">Smart treadmills with AI coaching</p>
                </div>
              </div>
              
              <div className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                <img
                  src="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400"
                  alt="Weight training area with dumbbells"
                  className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-6 left-6 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                  <h4 className="text-xl font-bold mb-2">Strength Training</h4>
                  <p className="text-sm opacity-90">Premium equipment with form tracking</p>
                </div>
              </div>
              
              <div className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                <img
                  src="https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400"
                  alt="Group fitness studio with yoga setup"
                  className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-6 left-6 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                  <h4 className="text-xl font-bold mb-2">Group Studios</h4>
                  <p className="text-sm opacity-90">Classes with expert instructors</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="py-20 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-readable-primary mb-6">
              Choose Your Membership
            </h2>
            <p className="text-xl md:text-2xl text-readable-secondary max-w-3xl mx-auto leading-relaxed">
              Flexible plans designed to fit your lifestyle and fitness goals
              <span className="block mt-2 text-lg text-readable-muted">(UK pricing)</span>
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Basic Plan */}
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 border-2 border-blue-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8">
                <div className="text-center mb-8 content-spacing">
                  <h3 className="text-2xl md:text-3xl font-bold text-readable-primary mb-3">
                    Basic
                  </h3>
                  <p className="text-readable-secondary mb-4 font-medium text-base md:text-lg">
                    Perfect for getting started
                  </p>
                  <div className="text-4xl md:text-5xl font-bold text-readable-primary">
                    £22
                    <span className="text-lg md:text-xl text-readable-muted font-semibold">
                      /month
                    </span>
                  </div>
                </div>
                <ul className="space-y-4 mb-10">
                  {[
                    "Gym access (6am-10pm)",
                    "Basic AI workout plans",
                    "Locker room access",
                    "Mobile app access",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="text-primary h-5 w-5" />
                      <span className="text-readable-secondary font-medium text-base md:text-lg">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-500 hover:from-green-600 hover:to-emerald-600 hover:border-green-600 font-semibold shadow-md"
                      onClick={handleGetStarted}
                      data-testid="button-select-basic"
                    >
                      Get Started
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>💪 Perfect starter plan for fitness beginners!</p>
                  </TooltipContent>
                </Tooltip>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="bg-gradient-to-br from-primary/10 to-primary/20 text-gray-900 relative transform lg:scale-105 shadow-xl border-2 border-primary/20">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-full text-sm font-bold shadow-2xl border-4 border-white z-20">
                <span className="drop-shadow-md text-white font-black">
                  Most Popular
                </span>
              </div>
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">Premium</h3>
                  <p className="text-gray-700 mb-4">The complete experience</p>
                  <div className="text-4xl font-bold text-gray-900">
                    £59
                    <span className="text-lg text-gray-700 font-semibold">
                      /month
                    </span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  {[
                    "24/7 gym access",
                    "Advanced AI coaching",
                    "Group fitness classes",
                    "Personal training sessions (2/month)",
                    "Premium loyalty rewards",
                    "Nutrition consultation",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="text-primary h-5 w-5" />
                      <span className="text-gray-900">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      className="w-full bg-gradient-to-r from-orange-400 to-red-400 text-white hover:from-orange-500 hover:to-red-500 font-bold shadow-lg"
                      onClick={handleGetStarted}
                      data-testid="button-select-premium"
                    >
                      Start Premium
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>⭐ The ultimate fitness experience - most popular choice!</p>
                  </TooltipContent>
                </Tooltip>
              </CardContent>
            </Card>

            {/* Student Plan */}
            <Card className="bg-gradient-to-br from-blue-50 to-sky-100 border-2 border-sky-200 hover:border-sky-400 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Student
                  </h3>
                  <p className="text-gray-700 mb-4 font-medium">
                    Special pricing for students
                  </p>
                  <div className="text-4xl font-bold text-gray-900">
                    £15
                    <span className="text-lg text-gray-700 font-semibold">
                      /month
                    </span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  {[
                    "Gym access (6am-4pm)",
                    "Basic AI workout plans",
                    "Study areas",
                    "Student community events",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="text-primary h-5 w-5" />
                      <span className="text-gray-800 font-medium">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-500 hover:from-blue-600 hover:to-indigo-600 hover:border-blue-600 font-semibold shadow-md"
                      onClick={handleGetStarted}
                      data-testid="button-select-student"
                    >
                      Verify Student Status
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>🎓 Special student discount - verify your enrollment!</p>
                  </TooltipContent>
                </Tooltip>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Dynamic Success Showcase */}
      <section id="success" className="py-24 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-br from-orange-400/10 to-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-br from-purple-400/10 to-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 relative z-10">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-orange-500/20 to-pink-500/20 backdrop-blur-sm border border-orange-400/30 rounded-full mb-8">
              <Trophy className="w-5 h-5 text-orange-300" />
              <span className="text-orange-200 font-bold text-sm tracking-wider uppercase">Proven Results</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-white mb-8 leading-tight">
              Join the{" "}
              <span className="bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Success Revolution
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-purple-200 max-w-3xl mx-auto font-medium">
              Real transformations from our elite community of achievers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="group text-center cursor-pointer bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300 hover:bg-white/15 transform hover:scale-105">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                    <Users className="text-white h-10 w-10" />
                  </div>
                  <div className="text-4xl md:text-5xl font-black text-white mb-3 group-hover:text-blue-300 transition-colors duration-300">
                    2,500+
                  </div>
                  <div className="text-purple-200 font-semibold text-lg">Elite Members</div>
                  <div className="text-purple-300 text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Growing daily
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>👥 Join our exclusive fitness community!</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center cursor-pointer">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="text-green-600 h-8 w-8" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">89%</div>
                  <div className="text-gray-600">Goal Achievement Rate</div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>🎯 Most members crush their fitness goals!</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center cursor-pointer">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="text-orange-600 h-8 w-8" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">4.9/5</div>
                  <div className="text-gray-600">Member Satisfaction</div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>⭐ Nearly perfect satisfaction ratings!</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center cursor-pointer">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="text-purple-600 h-8 w-8" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    5 Years
                  </div>
                  <div className="text-gray-600">Average Membership</div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>🕐 Members love staying with us long-term!</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-pink-50 via-rose-50 to-red-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Success Stories
            </h2>
            <p className="text-lg text-gray-600">
              Hear from members who transformed their lives
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="text-yellow-400 h-5 w-5 fill-current"
                    />
                  ))}
                </div>
                <Quote className="text-primary h-8 w-8 mb-4" />
                <p className="text-gray-700 mb-6 italic">
                  "The AI coaching completely changed my approach to fitness.
                  I've lost 30 pounds and feel stronger than ever. The
                  personalized plans actually work!"
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src="https://images.unsplash.com/photo-1494790108755-2616b612b377?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&h=150"
                    alt="Sarah M."
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">Sarah M.</div>
                    <div className="text-sm text-gray-600">
                      Premium Member, 8 months
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="text-yellow-400 h-5 w-5 fill-current"
                    />
                  ))}
                </div>
                <Quote className="text-primary h-8 w-8 mb-4" />
                <p className="text-gray-700 mb-6 italic">
                  "As a busy professional, I love how the AI adapts to my
                  schedule. The loyalty rewards keep me motivated, and I've
                  never been more consistent with working out."
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&h=150"
                    alt="Michael R."
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">
                      Michael R.
                    </div>
                    <div className="text-sm text-gray-600">
                      Premium Member, 1.5 years
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="text-yellow-400 h-5 w-5 fill-current"
                    />
                  ))}
                </div>
                <Quote className="text-primary h-8 w-8 mb-4" />
                <p className="text-gray-700 mb-6 italic">
                  "The community here is incredible. Everyone supports each
                  other, and the staff genuinely cares about your progress. It's
                  more than just a gym!"
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&h=150"
                    alt="Jessica L."
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">
                      Jessica L.
                    </div>
                    <div className="text-sm text-gray-600">
                      Premium Member, 2 years
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Enhanced Features Showcase */}
      <section className="py-20 bg-gradient-to-br from-violet-50 via-indigo-50 to-cyan-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Member Buddy?
            </h2>
            <p className="text-lg text-gray-600">
              Advanced technology meets premium fitness experience
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Smart AI Technology
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Brain className="text-blue-600 h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Adaptive Workout Plans
                    </h4>
                    <p className="text-gray-600">
                      AI learns from your progress and adjusts plans in
                      real-time for optimal results.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="text-green-600 h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Progress Tracking
                    </h4>
                    <p className="text-gray-600">
                      Detailed analytics and insights help you understand your
                      fitness journey.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Gift className="text-orange-600 h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Smart Rewards
                    </h4>
                    <p className="text-gray-600">
                      Earn points for every visit and redeem them for exclusive
                      perks and rewards.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=400"
                alt="AI fitness technology in action"
                className="rounded-xl shadow-lg w-full"
              />
              <div className="absolute -bottom-4 -right-4 bg-gradient-to-tl from-white to-purple-50 p-4 rounded-lg shadow-xl">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-900">
                    AI Coach Online
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                  <Dumbbell className="text-white h-4 w-4" />
                </div>
                <span className="text-xl font-bold">Member Buddy</span>
              </div>
              <p className="text-gray-400 mb-6">
                The future of fitness, powered by AI and designed for your
                success.
              </p>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Classes
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Personal Training
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Membership
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact Info</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>123 Fitness Ave, Wellness City</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>(555) 123-4567</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>hello@clubpulse.ai</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Member Buddy. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <ChatBot />
    </div>
  );
}
