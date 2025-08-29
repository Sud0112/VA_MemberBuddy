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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function LandingPage() {
  const handleGetStarted = () => {
    window.location.href = "/api/login";
  };

  const handleBookTour = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      {/* Enhanced Header - Virgin Active Style */}
      <header className="bg-white backdrop-blur-lg border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center cursor-pointer transform hover:scale-110 transition-all duration-300 shadow-md">
                    <Dumbbell className="text-white h-6 w-6" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Your premium fitness destination</p>
                </TooltipContent>
              </Tooltip>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-red-600 tracking-tight">
                  Member Buddy
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
                    className="text-gray-700 hover:text-red-600 transition-all duration-300 font-medium relative group text-sm uppercase tracking-wide"
                  >
                    CLUB FEATURES
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-600 group-hover:w-full transition-all duration-300"></span>
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Discover our world-class facilities</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href="#pricing"
                    className="text-gray-700 hover:text-red-600 transition-all duration-300 font-medium relative group text-sm uppercase tracking-wide"
                  >
                    MEMBERSHIP
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-600 group-hover:w-full transition-all duration-300"></span>
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Find your perfect membership plan</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href="#success"
                    className="text-gray-700 hover:text-red-600 transition-all duration-300 font-medium relative group text-sm uppercase tracking-wide"
                  >
                    SUCCESS STORIES
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-600 group-hover:w-full transition-all duration-300"></span>
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>See amazing member transformations</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href="#contact"
                    className="text-gray-700 hover:text-red-600 transition-all duration-300 font-medium relative group text-sm uppercase tracking-wide"
                  >
                    CONTACT
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-600 group-hover:w-full transition-all duration-300"></span>
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Get in touch with our team</p>
                </TooltipContent>
              </Tooltip>
            </nav>
            <div className="flex items-center gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-gray-700 hover:text-red-600 hover:bg-red-50 font-medium transition-all duration-300 text-sm uppercase tracking-wide"
                    onClick={handleGetStarted}
                    data-testid="button-sign-in"
                  >
                    LOG IN
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Access your member account</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white font-bold shadow-md transform hover:scale-105 transition-all duration-300 text-sm uppercase tracking-wide"
                    onClick={handleGetStarted}
                    data-testid="button-get-started"
                  >
                    JOIN NOW
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Start your fitness journey today</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Virgin Active Style */}
      <section className="relative bg-white py-16 lg:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="text-center lg:text-left relative z-10">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-8">
                <div className="px-6 py-2 bg-red-100 border border-red-200 rounded-full">
                  <span className="text-red-700 font-bold text-sm tracking-wider uppercase">
                    <Sparkles className="w-4 h-4 inline mr-2" />
                    Premium Experience
                  </span>
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-8 leading-tight">
                WELCOME TO{" "}
                <span className="text-red-600 block">REAL WELLNESS</span>
                <span className="block text-3xl md:text-4xl lg:text-5xl mt-2 text-gray-600 font-bold">
                  One membership. Endless variety.
                </span>
              </h1>
              <div className="space-y-4 mb-10 text-left max-w-2xl mx-auto lg:mx-0">
                <p className="text-lg md:text-xl text-gray-700 leading-relaxed font-medium">
                  <span className="text-gray-900 font-bold">Real rewards:</span>{" "}
                  instant goodies from Kauai & Mother plus partner discounts
                </p>
                <p className="text-lg md:text-xl text-gray-700 leading-relaxed font-medium">
                  <span className="text-gray-900 font-bold">
                    Real endorphins:
                  </span>{" "}
                  spacious gym floors & unlimited exercise classes
                </p>
                <p className="text-lg md:text-xl text-gray-700 leading-relaxed font-medium">
                  <span className="text-gray-900 font-bold">
                    Real relaxation:
                  </span>{" "}
                  pools, saunas & steam rooms
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start mb-12">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="lg"
                      onClick={handleGetStarted}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold text-lg px-8 py-4 transform hover:scale-105 transition-all duration-300 shadow-lg rounded-lg uppercase tracking-wide"
                      data-testid="button-start-free-trial"
                    >
                      JOIN THE CLUB
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Start your membership today</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-bold text-lg px-8 py-4 transition-all duration-300 shadow-md uppercase tracking-wide"
                      onClick={handleBookTour}
                      data-testid="button-book-tour"
                    >
                      <PlayCircle className="w-5 h-5 mr-3" />
                      BOOK A TOUR
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Visit our club and see the facilities</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-8 text-gray-600">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-gray-800">
                    Pay Nothing Until October*
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-gray-800">
                    4.9/5 Member Rating
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-gray-800">
                    50+ Premium Clubs
                  </span>
                </div>
              </div>
            </div>

            <div className="relative z-10">
              <div className="relative group">
                <img
                  src="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
                  alt="Modern gym interior with high-tech equipment"
                  className="rounded-2xl shadow-2xl w-full transform group-hover:scale-105 transition-all duration-500"
                />

                {/* AI Status Card */}
                <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow-2xl border border-gray-200">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Brain className="text-white h-7 w-7" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">
                        AI Coach Active
                      </p>
                      <p className="text-gray-600 font-medium flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Analyzing your fitness data
                      </p>
                    </div>
                  </div>
                </div>

                {/* Achievement Badge */}
                <div className="absolute -top-4 -right-4 bg-gradient-to-br from-red-500 to-red-600 text-white p-4 rounded-xl shadow-xl transform rotate-6 hover:rotate-0 transition-all duration-300">
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

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-red-100 border border-red-200 rounded-full mb-8">
              <Sparkles className="w-5 h-5 text-red-600" />
              <span className="text-red-700 font-bold text-sm tracking-wider uppercase">
                World-Class Facilities
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-8 leading-tight">
              Where Fitness Meets{" "}
              <span className="text-red-600">Excellence</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-medium">
              Experience the ultimate in fitness luxury with our premium
              facilities and expert guidance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "Personal Training",
                description:
                  "Work with certified personal trainers who create customized programs tailored to your specific goals and fitness level.",
                gradient: "from-red-500 to-red-600",
                bgGradient: "from-red-50 to-red-100",
              },
              {
                icon: Users,
                title: "Group Classes",
                description:
                  "Join energizing group fitness classes led by expert instructors in our spacious, fully-equipped studios.",
                gradient: "from-gray-700 to-gray-800",
                bgGradient: "from-gray-50 to-gray-100",
              },
              {
                icon: Dumbbell,
                title: "Premium Equipment",
                description:
                  "Train with the latest high-tech equipment and free weights in our expansive, climate-controlled gym floors.",
                gradient: "from-red-500 to-red-600",
                bgGradient: "from-red-50 to-red-100",
              },
              {
                icon: Heart,
                title: "Wellness & Spa",
                description:
                  "Relax and recover in our luxury spa facilities including pools, saunas, steam rooms, and treatment areas.",
                gradient: "from-gray-700 to-gray-800",
                bgGradient: "from-gray-50 to-gray-100",
              },
              {
                icon: Trophy,
                title: "Member Rewards",
                description:
                  "Enjoy exclusive member benefits including partner discounts, priority booking, and access to special events.",
                gradient: "from-red-500 to-red-600",
                bgGradient: "from-red-50 to-red-100",
              },
              {
                icon: Target,
                title: "Goal Achievement",
                description:
                  "Track your progress with regular assessments and celebrate milestones with our supportive member community.",
                gradient: "from-gray-700 to-gray-800",
                bgGradient: "from-gray-50 to-gray-100",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="group bg-white/95 backdrop-blur-sm border border-slate-200/60 shadow-sm hover:border-red-300/60 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 overflow-hidden"
              >
                <CardContent className="p-8">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${feature.bgGradient} rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:shadow-lg transition-all duration-300 group-hover:scale-110`}
                  >
                    <feature.icon
                      className={`bg-gradient-to-br ${feature.gradient} bg-clip-text text-transparent h-8 w-8`}
                      style={{
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    />
                  </div>
                  <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-slate-900 mb-4 group-hover:text-red-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 text-sm md:text-base leading-relaxed font-medium group-hover:text-slate-700 transition-colors duration-300">
                    {feature.description}
                  </p>

                  <div className="mt-6 flex items-center text-gray-400 group-hover:text-red-600 transition-all duration-300">
                    <span className="text-sm font-medium mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 uppercase tracking-wide">
                      Learn more
                    </span>
                    <ArrowRight className="w-4 h-4 transform translate-x-0 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Facility Showcase */}
          <div className="mt-24">
            <div className="text-center mb-16">
              <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">
                Experience Our{" "}
                <span className="text-red-600">Premium Facilities</span>
              </h3>
              <p className="text-xl text-gray-600 font-medium max-w-2xl mx-auto">
                State-of-the-art equipment and spaces designed for your success
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  image:
                    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400",
                  title: "Cardio Zone",
                  description:
                    "Latest cardio equipment with entertainment systems",
                },
                {
                  image:
                    "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400",
                  title: "Strength Training",
                  description: "Premium free weights and resistance machines",
                },
                {
                  image:
                    "https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400",
                  title: "Group Studios",
                  description: "Spacious studios for all your favorite classes",
                },
              ].map((facility, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105"
                >
                  <img
                    src={facility.image}
                    alt={facility.title}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-6 left-6 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                    <h4 className="text-xl font-bold mb-2">{facility.title}</h4>
                    <p className="text-sm text-gray-200">
                      {facility.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 lg:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              Choose Your Membership
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium">
              Flexible plans designed to fit your lifestyle and fitness goals
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Basic Plan */}
            <Card className="bg-white/95 backdrop-blur-sm border border-slate-200/60 shadow-sm hover:border-red-300/60 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 uppercase tracking-wide">
                    Basic
                  </h3>
                  <p className="text-slate-600 mb-6 font-medium leading-relaxed">
                    Perfect for getting started
                  </p>
                  <div className="text-3xl md:text-4xl font-black text-slate-900">
                    £22
                    <span className="text-lg text-gray-600 font-semibold">
                      /month
                    </span>
                  </div>
                </div>
                <ul className="space-y-4 mb-10">
                  {[
                    "Gym access (06:00-22:00)",
                    "Locker room facilities",
                    "Mobile app access",
                    "Basic fitness assessment",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="text-red-600 h-5 w-5 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-bold shadow-sm uppercase tracking-wide"
                      onClick={handleGetStarted}
                      data-testid="button-select-basic"
                    >
                      GET STARTED
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Perfect starter plan for fitness beginners</p>
                  </TooltipContent>
                </Tooltip>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="bg-red-600 relative transform lg:scale-105 shadow-xl border border-red-500/80 backdrop-blur-sm" style={{ color: 'white' }}>
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-white text-red-600 px-6 py-2 rounded-full text-sm font-bold shadow-lg border-2 border-red-600">
                MOST POPULAR
              </div>
              <CardContent className="p-8" style={{ color: 'white' }}>
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-3 uppercase tracking-wide" style={{ color: 'white' }}>
                    Premium
                  </h3>
                  <p className="mb-6 font-medium" style={{ color: '#fecaca' }}>
                    The complete experience
                  </p>
                  <div className="text-4xl font-black" style={{ color: 'white' }}>
                    £59
                    <span className="text-lg font-semibold" style={{ color: '#fecaca' }}>
                      /month
                    </span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  {[
                    "24/7 gym access",
                    "Unlimited group classes",
                    "Personal training sessions (2/month)",
                    "Premium spa facilities",
                    "Member rewards program",
                    "Nutrition consultation",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="h-5 w-5 flex-shrink-0" style={{ color: 'white' }} />
                      <span className="font-medium" style={{ color: 'white' }}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="w-full bg-white text-red-600 hover:bg-gray-100 font-bold shadow-lg uppercase tracking-wide"
                      onClick={handleGetStarted}
                      data-testid="button-select-premium"
                    >
                      START PREMIUM
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>The ultimate fitness experience</p>
                  </TooltipContent>
                </Tooltip>
              </CardContent>
            </Card>

            {/* Student Plan */}
            <Card className="bg-white/95 backdrop-blur-sm border border-slate-200/60 shadow-sm hover:border-red-300/60 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 uppercase tracking-wide">
                    Student
                  </h3>
                  <p className="text-slate-600 mb-6 font-medium leading-relaxed">
                    Special pricing for students
                  </p>
                  <div className="text-3xl md:text-4xl font-black text-slate-900">
                    £15
                    <span className="text-lg text-gray-600 font-semibold">
                      /month
                    </span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  {[
                    "Gym access (06:00-16:00)",
                    "Basic group classes",
                    "Study areas with WiFi",
                    "Student community events",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="text-red-600 h-5 w-5 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-bold shadow-sm uppercase tracking-wide"
                      onClick={handleGetStarted}
                      data-testid="button-select-student"
                    >
                      VERIFY STUDENT STATUS
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Special student discount available</p>
                  </TooltipContent>
                </Tooltip>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section id="success" className="py-20 lg:py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-red-600/20 border border-red-500/30 rounded-full mb-8">
              <Trophy className="w-5 h-5 text-red-400" />
              <span className="text-red-300 font-bold text-sm tracking-wider uppercase">
                Proven Results
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-8 leading-tight">
              Join the <span className="text-red-500">Success Revolution</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto font-medium">
              Real transformations from our community of achievers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {[
              {
                icon: Users,
                number: "2,500+",
                label: "Active Members",
                color: "blue",
              },
              {
                icon: Target,
                number: "89%",
                label: "Goal Achievement",
                color: "green",
              },
              {
                icon: Award,
                number: "4.9/5",
                label: "Member Satisfaction",
                color: "yellow",
              },
              {
                icon: Clock,
                number: "5 Years",
                label: "Average Membership",
                color: "purple",
              },
            ].map((stat, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <div className="group text-center cursor-pointer bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 hover:bg-white/15 transform hover:scale-105">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <stat.icon className="text-white h-8 w-8" />
                    </div>
                    <div className="text-3xl md:text-4xl font-black text-white mb-2 group-hover:text-red-300 transition-colors duration-300">
                      {stat.number}
                    </div>
                    <div className="text-gray-300 font-medium text-base">
                      {stat.label}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Outstanding member statistics</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          {/* Testimonials */}
          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "Virgin Active completely transformed my fitness journey. The facilities are world-class and the staff truly care about your success.",
                author: "Sarah M.",
                membership: "Premium Member, 8 months",
                image:
                  "https://images.unsplash.com/photo-1494790108755-2616b612b377?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&h=150",
              },
              {
                quote:
                  "As a busy professional, I love the 24/7 access and premium amenities. It's the perfect escape from my hectic schedule.",
                author: "Michael R.",
                membership: "Premium Member, 1.5 years",
                image:
                  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&h=150",
              },
              {
                quote:
                  "The community here is incredible. Everyone supports each other, and the luxury facilities make every workout feel special.",
                author: "Jessica L.",
                membership: "Premium Member, 2 years",
                image:
                  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&h=150",
              },
            ].map((testimonial, index) => (
              <Card
                key={index}
                className="bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/30 hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="text-yellow-400 h-4 w-4 fill-current"
                      />
                    ))}
                  </div>
                  <Quote className="text-red-400 h-6 w-6 mb-4" />
                  <p className="text-gray-200 mb-6 italic leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <img
                      src={testimonial.image}
                      alt={testimonial.author}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
                    />
                    <div>
                      <div className="font-bold text-white text-sm">
                        {testimonial.author}
                      </div>
                      <div className="text-xs text-gray-300">
                        {testimonial.membership}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">
              Why Choose Virgin Active?
            </h2>
            <p className="text-xl text-gray-600 font-medium max-w-2xl mx-auto">
              Premium facilities and expert guidance for your success
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-8 uppercase tracking-wide">
                Premium Experience
              </h3>
              <div className="space-y-8">
                {[
                  {
                    icon: Brain,
                    title: "Expert Personal Training",
                    description:
                      "Certified trainers create personalized programs that evolve with your progress and goals.",
                  },
                  {
                    icon: TrendingUp,
                    title: "Advanced Progress Tracking",
                    description:
                      "Detailed analytics and insights help you understand and optimize your fitness journey.",
                  },
                  {
                    icon: Gift,
                    title: "Exclusive Member Rewards",
                    description:
                      "Earn points for every visit and redeem them for exclusive perks and partner discounts.",
                  },
                ].map((feature, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <feature.icon className="text-red-600 h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2 text-lg">
                        {feature.title}
                      </h4>
                      <p className="text-gray-600 leading-relaxed font-medium">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=400"
                alt="Premium fitness facilities"
                className="rounded-xl shadow-xl w-full"
              />
              <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-xl shadow-xl border border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                    Premium Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center shadow-md">
                  <Dumbbell className="text-white h-5 w-5" />
                </div>
                <span className="text-xl font-black uppercase tracking-wide">
                  Virgin Active
                </span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Premium fitness facilities designed for real wellness and
                lasting results.
              </p>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors duration-300"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors duration-300"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors duration-300"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-white uppercase tracking-wide">
                Quick Links
              </h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors font-medium"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors font-medium"
                  >
                    Classes
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors font-medium"
                  >
                    Personal Training
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors font-medium"
                  >
                    Membership
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-white uppercase tracking-wide">
                Support
              </h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors font-medium"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors font-medium"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors font-medium"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors font-medium"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-white uppercase tracking-wide">
                Contact Info
              </h4>
              <ul className="space-y-4 text-gray-400">
                <li className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span className="font-medium">
                    25 Canary Wharf, London E14 5AB
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium">020 3837 4721</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium">hello@virginactive.co.uk</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400 font-medium">
              &copy; 2025 Virgin Active. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <ChatBot />
    </div>
  );
}
