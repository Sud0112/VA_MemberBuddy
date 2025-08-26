import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, Dumbbell, AlertTriangle, Heart, User, Shield } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface WorkoutDay {
  day: string;
  focus: string;
  description: string;
  exercises: string[];
}

interface WorkoutPlan {
  planTitle: string;
  weeklySchedule: WorkoutDay[];
}

interface HealthData {
  age: string;
  fitnessLevel: string;
  exerciseExperience: string;
  medicalConditions: string;
  medicalClearance: boolean;
  personalTrainerConsent: boolean;
}

export function WorkoutPlanner() {
  const [currentStep, setCurrentStep] = useState(1); // 1: Health Data, 2: Goals, 3: Generated Plan
  const [healthData, setHealthData] = useState<HealthData>({
    age: '',
    fitnessLevel: '',
    exerciseExperience: '',
    medicalConditions: '',
    medicalClearance: false,
    personalTrainerConsent: false
  });
  const [goals, setGoals] = useState("");
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const { toast } = useToast();

  const generatePlanMutation = useMutation({
    mutationFn: async (data: { goals: string; healthData: HealthData }) => {
      const response = await apiRequest("POST", "/api/ai/workout-plan", data);
      return await response.json();
    },
    onSuccess: (data) => {
      setWorkoutPlan(data);
      toast({
        title: "Workout Plan Created!",
        description: "Your personalized plan is ready.",
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
      toast({
        title: "Error",
        description: "Failed to generate workout plan. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleHealthDataSubmit = () => {
    if (!healthData.age || !healthData.fitnessLevel || !healthData.exerciseExperience) {
      toast({
        title: "Information Required",
        description: "Please fill in all required health information.",
        variant: "destructive",
      });
      return;
    }
    
    if (!healthData.medicalClearance || !healthData.personalTrainerConsent) {
      toast({
        title: "Consent Required",
        description: "Please confirm both medical clearance and personal trainer consultation agreements.",
        variant: "destructive",
      });
      return;
    }
    
    setCurrentStep(2);
  };

  const handleGeneratePlan = () => {
    if (!goals.trim()) {
      toast({
        title: "Goals Required",
        description: "Please describe your fitness goals first.",
        variant: "destructive",
      });
      return;
    }
    generatePlanMutation.mutate({ goals: goals.trim(), healthData });
    setCurrentStep(3);
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 content-spacing">
          <h1 className="text-4xl md:text-5xl font-bold text-readable-primary">AI Workout Planner</h1>
          <p className="text-gray-600">
            Get a personalized workout plan designed with your health profile and goals in mind.
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              currentStep >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className={`w-16 h-1 ${
              currentStep >= 2 ? 'bg-primary' : 'bg-gray-200'
            }`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              currentStep >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
            <div className={`w-16 h-1 ${
              currentStep >= 3 ? 'bg-primary' : 'bg-gray-200'
            }`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              currentStep >= 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              3
            </div>
          </div>
        </div>
        <div className="flex justify-center mb-8 space-x-4 text-sm text-gray-600">
          <span className={currentStep === 1 ? 'font-semibold text-primary' : ''}>Health Profile</span>
          <span className={currentStep === 2 ? 'font-semibold text-primary' : ''}>Fitness Goals</span>
          <span className={currentStep === 3 ? 'font-semibold text-primary' : ''}>Your Plan</span>
        </div>

        {/* Step 1: Health Data Collection */}
        {currentStep === 1 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Health & Safety Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Medical Disclaimer */}
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Important Medical Disclaimer:</strong> Before starting any exercise program, please consult with your healthcare provider, 
                  especially if you have any medical conditions, injuries, or concerns about your health. This AI-generated workout plan is for 
                  informational purposes only and should not replace professional medical advice.
                </AlertDescription>
              </Alert>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="e.g., 25"
                    value={healthData.age}
                    onChange={(e) => setHealthData({...healthData, age: e.target.value})}
                    data-testid="input-age"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fitness-level">Current Fitness Level *</Label>
                  <Select value={healthData.fitnessLevel} onValueChange={(value) => setHealthData({...healthData, fitnessLevel: value})}>
                    <SelectTrigger data-testid="select-fitness-level">
                      <SelectValue placeholder="Select your level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner - New to exercise</SelectItem>
                      <SelectItem value="intermediate">Intermediate - Regular exercise</SelectItem>
                      <SelectItem value="advanced">Advanced - Very active lifestyle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="experience">Exercise Experience *</Label>
                  <Select value={healthData.exerciseExperience} onValueChange={(value) => setHealthData({...healthData, exerciseExperience: value})}>
                    <SelectTrigger data-testid="select-experience">
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No experience</SelectItem>
                      <SelectItem value="some">Some experience (0-2 years)</SelectItem>
                      <SelectItem value="moderate">Moderate experience (2-5 years)</SelectItem>
                      <SelectItem value="extensive">Extensive experience (5+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="conditions">Medical Conditions or Injuries (Optional)</Label>
                <Textarea
                  id="conditions"
                  placeholder="List any medical conditions, injuries, or physical limitations that should be considered..."
                  value={healthData.medicalConditions}
                  onChange={(e) => setHealthData({...healthData, medicalConditions: e.target.value})}
                  className="min-h-20"
                  data-testid="textarea-conditions"
                />
              </div>
              
              {/* Consent checkboxes */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="medical-clearance"
                    checked={healthData.medicalClearance}
                    onCheckedChange={(checked) => setHealthData({...healthData, medicalClearance: checked as boolean})}
                    data-testid="checkbox-medical-clearance"
                  />
                  <Label htmlFor="medical-clearance" className="text-sm leading-5">
                    I confirm that I have consulted with my healthcare provider about starting an exercise program, 
                    and I have been cleared for physical activity. I understand the risks involved in exercise.
                  </Label>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="trainer-consent"
                    checked={healthData.personalTrainerConsent}
                    onCheckedChange={(checked) => setHealthData({...healthData, personalTrainerConsent: checked as boolean})}
                    data-testid="checkbox-trainer-consent"
                  />
                  <Label htmlFor="trainer-consent" className="text-sm leading-5">
                    I understand this is an AI-generated plan and agree to consult with qualified personal trainers 
                    at Member Buddy before starting this workout program for proper form guidance and safety.
                  </Label>
                </div>
              </div>
              
              <Button
                onClick={handleHealthDataSubmit}
                className="w-full flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold shadow-md"
                data-testid="button-continue-health"
              >
                <Shield className="h-4 w-4" />
                Continue to Goals
              </Button>
            </CardContent>
          </Card>
        )}
        
        {/* Step 2: Goals */}
        {currentStep === 2 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Tell us about your goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Example: I want to build muscle in my upper body and improve my cardio. I can train 4 days a week and have about 1 hour per session."
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                className="min-h-32"
                data-testid="textarea-workout-goals"
              />
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300 hover:from-gray-200 hover:to-gray-300 hover:text-gray-800 font-medium"
                  data-testid="button-back-health"
                >
                  Back
                </Button>
                <Button
                  onClick={handleGeneratePlan}
                  disabled={generatePlanMutation.isPending || !goals.trim()}
                  className="flex items-center gap-2 flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold shadow-md disabled:from-gray-400 disabled:to-gray-500"
                  data-testid="button-generate-plan"
                >
                  <Sparkles className="h-4 w-4" />
                  {generatePlanMutation.isPending ? "Creating Plan..." : "Create My Plan! ✨"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Loading State and Generated Plan */}
        {currentStep === 3 && generatePlanMutation.isPending && (
          <Card className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-gray-600">Our AI is creating your personalized workout plan based on your health profile...</p>
          </Card>
        )}

        {/* Generated Workout Plan */}
        {currentStep === 3 && workoutPlan && (
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary to-primary/90 text-white">
              <CardTitle className="text-2xl mb-2" data-testid="text-plan-title">
                {workoutPlan.planTitle}
              </CardTitle>
              <p className="text-primary-foreground/80">Customized for your goals and schedule</p>
            </CardHeader>
            
            {/* AI Disclaimer */}
            <div className="px-6 pt-6">
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>AI-Generated Content:</strong> This workout plan is created by artificial intelligence based on your input. 
                  Please consult with our qualified fitness coaches or your healthcare provider before starting any new exercise program, 
                  especially if you have any health conditions or concerns.
                </AlertDescription>
              </Alert>
            </div>
            
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="space-y-4">
                {workoutPlan.weeklySchedule.map((day, index) => (
                  <AccordionItem
                    key={index}
                    value={`day-${index}`}
                    className="bg-gray-50 rounded-lg border-0"
                    data-testid={`workout-day-${index}`}
                  >
                    <AccordionTrigger className="p-4 hover:bg-gray-100 rounded-lg">
                      <span className="flex items-center justify-between w-full">
                        <span className="font-semibold text-gray-900">
                          {day.day} - {day.focus}
                        </span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-2">
                      <p className="text-gray-600 mb-3">{day.description}</p>
                      <ul className="space-y-2">
                        {day.exercises.map((exercise, exerciseIndex) => {
                          // Get appropriate icon based on exercise type
                          let icon = <Dumbbell className="text-primary h-4 w-4" />;
                          if (exercise.toLowerCase().includes('push') || exercise.toLowerCase().includes('press')) {
                            icon = <span className="text-base">💪</span>;
                          } else if (exercise.toLowerCase().includes('run') || exercise.toLowerCase().includes('cardio')) {
                            icon = <span className="text-base">🏃</span>;
                          } else if (exercise.toLowerCase().includes('squat') || exercise.toLowerCase().includes('lunge')) {
                            icon = <span className="text-base">🧿</span>;
                          } else if (exercise.toLowerCase().includes('stretch') || exercise.toLowerCase().includes('yoga')) {
                            icon = <span className="text-base">🧘</span>;
                          } else if (exercise.toLowerCase().includes('jump') || exercise.toLowerCase().includes('burpee')) {
                            icon = <span className="text-base">⚡</span>;
                          }
                          
                          return (
                            <li key={exerciseIndex} className="flex items-center gap-2">
                              {icon}
                              <span>{exercise}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              
              {/* Professional Consultation Reminder */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <Alert className="border-blue-200 bg-blue-50">
                  <Heart className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Your Safety Matters:</strong> Remember to warm up before exercising, listen to your body, and stop if you feel pain. 
                    For best results and safety, consider scheduling a session with our certified personal trainers who can review this plan 
                    and make personalized adjustments for your fitness level and any physical limitations.
                  </AlertDescription>
                </Alert>
              </div>
              
              {/* Start New Plan Button */}
              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentStep(1);
                    setWorkoutPlan(null);
                    setGoals('');
                    setHealthData({
                      age: '',
                      fitnessLevel: '',
                      exerciseExperience: '',
                      medicalConditions: '',
                      medicalClearance: false,
                      personalTrainerConsent: false
                    });
                  }}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-teal-500 hover:from-teal-600 hover:to-cyan-600 hover:border-teal-600 font-semibold shadow-md"
                  data-testid="button-new-plan"
                >
                  Create New Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
