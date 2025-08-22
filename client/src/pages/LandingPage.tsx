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
  Quote
} from "lucide-react";
import { ChatBot } from "@/components/ChatBot";

export function LandingPage() {
  const handleGetStarted = () => {
    window.location.href = "/api/login";
  };

  const handleBookTour = () => {
    // This would trigger the chatbot or a booking form
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                <Dumbbell className="text-white h-4 w-4" />
              </div>
              <span className="text-xl font-bold text-gray-900">ClubPulse AI</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</a>
            </nav>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={handleGetStarted}
                data-testid="button-sign-in"
              >
                Sign In
              </Button>
              <Button
                onClick={handleGetStarted}
                data-testid="button-get-started"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-white to-blue-50 pt-16 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Your AI-Powered{" "}
                <span className="text-primary font-black drop-shadow-sm">
                  Fitness Journey
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Experience the future of fitness with personalized AI coaching, smart workout plans,
                and a premium wellness community designed for your success.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  size="lg"
                  onClick={handleGetStarted}
                  className="transform hover:scale-105 transition-all duration-200 shadow-lg"
                  data-testid="button-start-free-trial"
                >
                  Start Free Trial
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleBookTour}
                  data-testid="button-book-tour"
                >
                  Book a Tour
                </Button>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
                alt="Modern gym interior with high-tech equipment"
                className="rounded-2xl shadow-2xl w-full"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Brain className="text-primary h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">AI Coach Active</p>
                    <p className="text-sm text-gray-600">Personalizing your workout</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Powered by AI, Designed for You
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience cutting-edge technology meets premium fitness facilities
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "AI Personal Trainer",
                description: "Get personalized workout plans generated by our advanced AI that adapts to your goals, schedule, and fitness level.",
                color: "text-primary"
              },
              {
                icon: Gift,
                title: "Smart Rewards",
                description: "Earn points for every workout and redeem them for exclusive perks, personal training sessions, and premium amenities.",
                color: "text-blue-600"
              },
              {
                icon: TrendingUp,
                title: "Progress Tracking",
                description: "Monitor your fitness journey with detailed analytics and insights powered by AI to optimize your results.",
                color: "text-purple-600"
              },
              {
                icon: Users,
                title: "Premium Community",
                description: "Join a community of like-minded fitness enthusiasts with exclusive events, challenges, and group training sessions.",
                color: "text-orange-600"
              },
              {
                icon: Dumbbell,
                title: "Premium Equipment",
                description: "Access state-of-the-art fitness equipment and facilities designed for optimal performance and safety.",
                color: "text-green-600"
              },
              {
                icon: Heart,
                title: "Wellness Support",
                description: "Comprehensive wellness support including nutrition guidance, recovery protocols, and mental health resources.",
                color: "text-red-600"
              }
            ].map((feature, index) => (
              <Card
                key={index}
                className="bg-gradient-to-br from-white to-gray-50 border hover:border-primary/20 hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-8">
                  <div className={`w-12 h-12 bg-${feature.color.split('-')[1]}-100 rounded-xl flex items-center justify-center mb-6`}>
                    <feature.icon className={`${feature.color} h-6 w-6`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Facility Showcase */}
          <div className="mt-20">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-12">World-Class Facilities</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <img
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400"
                alt="Cardio area with modern treadmills"
                className="rounded-xl shadow-lg w-full h-64 object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400"
                alt="Weight training area with dumbbells"
                className="rounded-xl shadow-lg w-full h-64 object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400"
                alt="Group fitness studio with yoga setup"
                className="rounded-xl shadow-lg w-full h-64 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Membership
            </h2>
            <p className="text-xl text-gray-600">
              Flexible plans designed to fit your lifestyle and fitness goals (UK pricing)
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Basic Plan */}
            <Card className="border hover:border-primary/20 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Basic</h3>
                  <p className="text-gray-600 mb-4">Perfect for getting started</p>
                  <div className="text-4xl font-bold text-gray-900">
                    £22<span className="text-lg text-gray-600">/month</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  {[
                    "Gym access (6am-10pm)",
                    "Basic AI workout plans",
                    "Locker room access",
                    "Mobile app access"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="text-primary h-5 w-5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleGetStarted}
                  data-testid="button-select-basic"
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="bg-gradient-to-br from-primary to-primary/90 text-white relative transform lg:scale-105 shadow-xl">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg border-2 border-white z-10">
                Most Popular
              </div>
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">Premium</h3>
                  <p className="text-primary-foreground/80 mb-4">The complete experience</p>
                  <div className="text-4xl font-bold">
                    £59<span className="text-lg text-primary-foreground/80">/month</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  {[
                    "24/7 gym access",
                    "Advanced AI coaching",
                    "Group fitness classes",
                    "Personal training sessions (2/month)",
                    "Premium loyalty rewards",
                    "Nutrition consultation"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="text-white h-5 w-5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant="secondary"
                  className="w-full bg-white text-primary hover:bg-gray-50"
                  onClick={handleGetStarted}
                  data-testid="button-select-premium"
                >
                  Start Premium
                </Button>
              </CardContent>
            </Card>

            {/* Student Plan */}
            <Card className="border hover:border-primary/20 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Student</h3>
                  <p className="text-gray-600 mb-4">Special pricing for students</p>
                  <div className="text-4xl font-bold text-gray-900">
                    £15<span className="text-lg text-gray-600">/month</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  {[
                    "Gym access (6am-4pm)",
                    "Basic AI workout plans", 
                    "Study areas",
                    "Student community events"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="text-primary h-5 w-5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleGetStarted}
                  data-testid="button-select-student"
                >
                  Verify Student Status
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Success Statistics */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Thousands</h2>
            <p className="text-lg text-gray-600">Real results from our amazing community</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-blue-600 h-8 w-8" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">2,500+</div>
              <div className="text-gray-600">Active Members</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="text-green-600 h-8 w-8" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">89%</div>
              <div className="text-gray-600">Goal Achievement Rate</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-orange-600 h-8 w-8" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">4.9/5</div>
              <div className="text-gray-600">Member Satisfaction</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="text-purple-600 h-8 w-8" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">5 Years</div>
              <div className="text-gray-600">Average Membership</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Success Stories</h2>
            <p className="text-lg text-gray-600">Hear from members who transformed their lives</p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="bg-white hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="text-yellow-400 h-5 w-5 fill-current" />
                  ))}
                </div>
                <Quote className="text-primary h-8 w-8 mb-4" />
                <p className="text-gray-700 mb-6 italic">
                  "The AI coaching completely changed my approach to fitness. I've lost 30 pounds and feel stronger than ever. The personalized plans actually work!"
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src="https://images.unsplash.com/photo-1494790108755-2616b612b377?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&h=150"
                    alt="Sarah M."
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">Sarah M.</div>
                    <div className="text-sm text-gray-600">Premium Member, 8 months</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="text-yellow-400 h-5 w-5 fill-current" />
                  ))}
                </div>
                <Quote className="text-primary h-8 w-8 mb-4" />
                <p className="text-gray-700 mb-6 italic">
                  "As a busy professional, I love how the AI adapts to my schedule. The loyalty rewards keep me motivated, and I've never been more consistent with working out."
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&h=150"
                    alt="Michael R."
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">Michael R.</div>
                    <div className="text-sm text-gray-600">Premium Member, 1.5 years</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="text-yellow-400 h-5 w-5 fill-current" />
                  ))}
                </div>
                <Quote className="text-primary h-8 w-8 mb-4" />
                <p className="text-gray-700 mb-6 italic">
                  "The community here is incredible. Everyone supports each other, and the staff genuinely cares about your progress. It's more than just a gym!"
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&h=150"
                    alt="Jessica L."
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">Jessica L.</div>
                    <div className="text-sm text-gray-600">Premium Member, 2 years</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Enhanced Features Showcase */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose ClubPulse AI?</h2>
            <p className="text-lg text-gray-600">Advanced technology meets premium fitness experience</p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Smart AI Technology</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Brain className="text-blue-600 h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Adaptive Workout Plans</h4>
                    <p className="text-gray-600">AI learns from your progress and adjusts plans in real-time for optimal results.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="text-green-600 h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Progress Tracking</h4>
                    <p className="text-gray-600">Detailed analytics and insights help you understand your fitness journey.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Gift className="text-orange-600 h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Smart Rewards</h4>
                    <p className="text-gray-600">Earn points for every visit and redeem them for exclusive perks and rewards.</p>
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
              <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-lg shadow-xl">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-900">AI Coach Online</span>
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
                <span className="text-xl font-bold">ClubPulse AI</span>
              </div>
              <p className="text-gray-400 mb-6">
                The future of fitness, powered by AI and designed for your success.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Classes</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Personal Training</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Membership</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
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
            <p>&copy; 2025 ClubPulse AI. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <ChatBot />
    </div>
  );
}
