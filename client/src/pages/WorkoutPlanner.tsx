import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sparkles, Dumbbell } from "lucide-react";
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

export function WorkoutPlanner() {
  const [goals, setGoals] = useState("");
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const { toast } = useToast();

  const generatePlanMutation = useMutation({
    mutationFn: async (goals: string) => {
      const response = await apiRequest("POST", "/api/ai/workout-plan", { goals });
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

  const handleGeneratePlan = () => {
    if (!goals.trim()) {
      toast({
        title: "Goals Required",
        description: "Please describe your fitness goals first.",
        variant: "destructive",
      });
      return;
    }
    generatePlanMutation.mutate(goals.trim());
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Workout Planner</h1>
          <p className="text-gray-600">
            Describe your fitness goals and let our AI create a personalized workout plan for you.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Tell us about your goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Example: I want to build muscle in my upper body and improve my cardio. I can train 4 days a week and have about 1 hour per session."
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              className="min-h-32"
              data-testid="textarea-workout-goals"
            />
            <Button
              onClick={handleGeneratePlan}
              disabled={generatePlanMutation.isPending || !goals.trim()}
              className="flex items-center gap-2"
              data-testid="button-generate-plan"
            >
              <Sparkles className="h-4 w-4" />
              {generatePlanMutation.isPending ? "Creating Plan..." : "Create My Plan! ✨"}
            </Button>
          </CardContent>
        </Card>

        {/* Loading State */}
        {generatePlanMutation.isPending && (
          <Card className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-gray-600">Our AI is creating your personalized workout plan...</p>
          </Card>
        )}

        {/* Generated Workout Plan */}
        {workoutPlan && (
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary to-primary/90 text-white">
              <CardTitle className="text-2xl mb-2" data-testid="text-plan-title">
                {workoutPlan.planTitle}
              </CardTitle>
              <p className="text-primary-foreground/80">Customized for your goals and schedule</p>
            </CardHeader>
            
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
                        {day.exercises.map((exercise, exerciseIndex) => (
                          <li key={exerciseIndex} className="flex items-center gap-2">
                            <Dumbbell className="text-primary h-4 w-4" />
                            <span>{exercise}</span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
