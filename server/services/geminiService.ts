import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY || "" 
});

export async function generateRetentionStrategies(memberProfile: any): Promise<string> {
  if (!process.env.GEMINI_API_KEY && !process.env.API_KEY) {
    // Mock response for development
    return `
# AI Retention Strategies for ${memberProfile.name}

## 📞 Personal Outreach Strategy
Call ${memberProfile.name} personally to address their specific concerns: "${memberProfile.feedback}". Offer complimentary off-peak personal training sessions during quieter hours (2-4 PM). Highlight the personalized attention and spacious environment during these times.

## 🎯 Targeted Incentives
Provide ${memberProfile.name} with a "VIP Access Pass" that allows them to book equipment in advance during peak hours. Also offer a 20% discount on personal training packages to create a more exclusive, less crowded experience.

## 🏋️ Alternative Solutions
Introduce ${memberProfile.name} to our new "Premium Quiet Zone" - a dedicated area for focused workouts. Schedule a tour to show them this space and explain how it addresses their specific concerns about overcrowding.
    `.trim();
  }

  try {
    const prompt = `You are a retention specialist for a premium fitness club. Generate 3 distinct, personalized retention strategies for the following member:

Member Profile:
- Name: ${memberProfile.name}
- Membership Type: ${memberProfile.membershipType}
- Member Since: ${memberProfile.joinDate}
- Last Visit: ${memberProfile.lastVisit}
- Average Visits/Month: ${memberProfile.avgVisits}
- Churn Risk: ${memberProfile.churnRisk}
- Feedback/Concerns: ${memberProfile.feedback}

Please provide 3 actionable retention strategies in markdown format with headers, addressing their specific concerns and situation. Focus on practical, immediate actions the staff can take.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Unable to generate strategies at this time.";
  } catch (error) {
    console.error("Error generating retention strategies:", error);
    throw new Error("Failed to generate retention strategies");
  }
}

export async function generateChurnPreventionEmail(memberProfile: any, riskLevel: string, currentRiskBand: string, previousRiskBand?: string): Promise<{ subject: string; content: string }> {
  if (!process.env.GEMINI_API_KEY && !process.env.API_KEY) {
    // Mock response for development
    const memberName = `${memberProfile.firstName} ${memberProfile.lastName}`;
    const mockEmails = {
      high: {
        subject: `We miss you at ClubPulse, ${memberProfile.firstName}! Let's get back on track 💪`,
        content: `Dear ${memberName},

We've noticed you haven't visited ClubPulse in a while, and we want to make sure everything is alright. As a valued ${memberProfile.membershipType} member, you're important to us!

**Your Current Membership Benefits:**
• 24/7 access to all premium facilities
• Unlimited group fitness classes
• Access to our AI-powered workout recommendations
• Complimentary towel service

**Special Comeback Offer - Just for You:**
To help you get back into your routine, we're offering:
• FREE personal training session (worth £65)
• 50% off next month's supplements
• Priority booking for popular classes

Your wellness journey matters to us. Our team would love to understand any challenges you're facing and help create a plan that works better for your lifestyle.

**Ready to return?** Simply reply to this email or call us at 020 3837 4721.

Stay strong,
The ClubPulse Team

P.S. Don't forget - your membership includes unlimited access to our new meditation room and recovery zone!`
      },
      medium: {
        subject: `${memberProfile.firstName}, let's keep your momentum going! 🏃‍♀️`,
        content: `Hi ${memberName},

We've noticed a slight change in your visit pattern recently. As someone who's been crushing their fitness goals, we want to help you maintain that amazing momentum!

**Your Recent Progress:**
• Member since ${new Date(memberProfile.joinDate).toLocaleDateString('en-GB')}
• ${memberProfile.membershipType} membership benefits
• Previously averaging regular visits

**To keep you motivated:**
• NEW: Try our just-launched HIIT classes (perfect for busy schedules!)
• Book a complimentary fitness assessment to update your goals
• 20% off personal training packages this month

Sometimes life gets busy - that's completely normal! Our flexible class schedule and 24/7 access are designed to work around your lifestyle.

**Let's catch up:** Pop in this week for a quick chat with our wellness team. We're here to support your journey!

Best regards,
Your ClubPulse Family

*Remember: Consistency beats perfection. Even 20 minutes counts!*`
      },
      low: {
        subject: `New classes and features await you, ${memberProfile.firstName}! ✨`,
        content: `Hello ${memberName},

Hope you're doing well! We've added some exciting new features and classes that we think you'll love.

**What's New at ClubPulse:**
• Fresh morning yoga sessions (perfect for starting the day right)
• Advanced strength training equipment in the new zone
• Nutrition workshops every Saturday morning
• Updated AI workout recommendations based on your preferences

**Your Membership Perks:**
As a ${memberProfile.membershipType} member, you have full access to all these new offerings at no extra cost!

**This Week's Highlights:**
• Monday: Power Yoga with Sarah (7:00 AM)
• Wednesday: Strength & Conditioning masterclass
• Friday: Nutrition Q&A session

We'd love to see you soon and hear about your current fitness goals. Our team is always here to help you make the most of your membership.

See you soon!
The ClubPulse Team

*Your next visit is going to be amazing - we've got everything ready for you!*`
      }
    };

    return mockEmails[riskLevel as keyof typeof mockEmails] || mockEmails.medium;
  }

  try {
    const memberName = `${memberProfile.firstName} ${memberProfile.lastName}`;
    const daysSinceLastVisit = memberProfile.lastVisit 
      ? Math.floor((Date.now() - new Date(memberProfile.lastVisit).getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    const prompt = `You are writing a personalized churn prevention email for a UK fitness club called ClubPulse. Write a warm, encouraging email that doesn't feel pushy or desperate.

Member Details:
- Name: ${memberName}
- Membership Type: ${memberProfile.membershipType}
- Member Since: ${memberProfile.joinDate}
- Last Visit: ${memberProfile.lastVisit ? `${daysSinceLastVisit} days ago` : 'Never visited'}
- Current Risk Level: ${riskLevel}
- Risk Band Change: ${previousRiskBand ? `Moving from ${previousRiskBand} to ${currentRiskBand}` : `Currently in ${currentRiskBand} band`}

Club Details:
- Location: 25 Canary Wharf, London E14 5AB
- Phone: 020 3837 4721
- Premium membership: £59/month (24/7 access, AI coaching, group classes, 2 personal training sessions/month)
- Basic membership: £22/month (06:00-22:00 access, basic AI workouts)
- Student membership: £15/month (06:00-16:00 access, student areas)

Email Guidelines:
1. Use UK English spelling and tone
2. Include specific member benefits and club features
3. Offer relevant incentives based on risk level:
   - High risk (not visited 10+ days): Strong comeback offer (free PT session, discounts)
   - Medium risk (7-10 days): Motivational check-in with mild incentives
   - Low risk (5-7 days): New features and gentle engagement
4. Keep tone positive, supportive, and personal
5. Include call-to-action (phone, email, or visit)
6. Mention UK-specific details (opening hours, pricing in GBP)
7. Professional yet friendly closing

Return format:
{
  "subject": "Email subject line here",
  "content": "Full email content here"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const emailText = response.text || "";
    
    // Try to parse as JSON, fallback to structured format
    try {
      return JSON.parse(emailText);
    } catch {
      // If not JSON, extract subject and content manually
      const lines = emailText.split('\n');
      const subjectLine = lines.find(line => line.toLowerCase().includes('subject:'));
      const subject = subjectLine ? subjectLine.replace(/subject:\s*/i, '').trim() : `We miss you at ClubPulse, ${memberProfile.firstName}!`;
      
      const contentStart = lines.findIndex(line => line.toLowerCase().includes('content:'));
      const content = contentStart > -1 ? lines.slice(contentStart + 1).join('\n').trim() : emailText;
      
      return { subject, content };
    }
  } catch (error) {
    console.error("Error generating churn prevention email:", error);
    throw new Error("Failed to generate churn prevention email");
  }
}

export async function generateLoyaltyOffers(targetCriteria: string): Promise<{ offers: any[] }> {
  if (!process.env.GEMINI_API_KEY && !process.env.API_KEY) {
    // Mock response for development
    return {
      offers: [
        {
          id: 1,
          title: "Free Yoga Mat",
          description: "Premium branded yoga mat for dedicated practitioners",
          points: 400,
          category: "Wellness"
        },
        {
          id: 2,
          title: "Morning Yoga Package",
          description: "5 additional morning yoga classes",
          points: 600,
          category: "Classes"
        },
        {
          id: 3,
          title: "Meditation Workshop",
          description: "Exclusive mindfulness workshop with certified instructor",
          points: 350,
          category: "Wellness"
        }
      ]
    };
  }

  try {
    const prompt = `You are a loyalty program manager for a premium fitness club. Generate 3 creative loyalty offers targeted at the following member segment:

Target Criteria: ${targetCriteria}

Create offers that would appeal to this specific group. Each offer should include:
- A catchy title
- Description of what the member gets
- Point cost (between 100-1000 points)
- Category (Fitness, Wellness, Nutrition, Social, Classes, etc.)

Return the response as a JSON object with an "offers" array.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            offers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "integer" },
                  title: { type: "string" },
                  description: { type: "string" },
                  points: { type: "integer" },
                  category: { type: "string" }
                },
                required: ["id", "title", "description", "points", "category"]
              }
            }
          },
          required: ["offers"]
        }
      },
      contents: prompt,
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    } else {
      throw new Error("Empty response from model");
    }
  } catch (error) {
    console.error("Error generating loyalty offers:", error);
    throw new Error("Failed to generate loyalty offers");
  }
}

export async function sendMessageToChat(
  message: string, 
  conversationHistory: Array<{ role: string; content: string }>
): Promise<{ content: string; contactEmail?: string; contactName?: string; tourBooked?: boolean }> {
  if (!process.env.GEMINI_API_KEY && !process.env.API_KEY) {
    // Mock response for development
    const responses = [
      "Hi! I'm your AI assistant. I can help you learn about our facilities, pricing, and schedule a tour. How can I help you today?",
      "We're open 24/7 for Premium members! Basic and Student members have access from 6am-10pm daily. Would you like to know more about our membership options?",
      "Our Premium membership is £59/month and includes 24/7 access, advanced AI coaching, group fitness classes, personal training sessions, and premium loyalty rewards. Would you like to schedule a tour to see our facilities?",
      "Great! I'd love to help you schedule a tour. What's your name and email address so we can get that set up for you?"
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    return { content: randomResponse };
  }

  try {
    const systemInstruction = `You are a friendly sales assistant for ClubPulse, a premium AI-powered fitness club. Your goal is to help prospective members learn about the club and ultimately book a tour.

Follow this conversation flow:
1. Greet warmly and ask how you can help
2. Answer questions about facilities, pricing, hours, location
3. When appropriate, suggest booking a tour
4. If they're interested in a tour, collect their name and email

Club Information:
- Premium membership: £59/month (24/7 access, AI coaching, group classes, 2 personal training sessions/month)
- Basic membership: £22/month (06:00-22:00 access, basic AI workouts)
- Student membership: £15/month (06:00-16:00 access, student areas)
- Location: 25 Canary Wharf, London E14 5AB
- Phone: 020 3837 4721
- Features: AI personal trainer, smart rewards, premium equipment, wellness support

If they want to book a tour, ask for their name and email. When you have both, respond with [TIMESLOTS:weekday-morning,weekday-afternoon,weekend-morning] to show available times.

Keep responses helpful, friendly, and conversational. Always try to guide toward booking a tour.`;

    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction,
      },
    });

    // Add conversation history
    for (const msg of conversationHistory) {
      await chat.sendMessage({ message: msg.content });
    }

    const response = await chat.sendMessage({ message: message });
    const content = response.text || "I'm sorry, I didn't understand that. Could you please rephrase?";

    // Parse special commands
    let contactEmail, contactName, tourBooked;
    
    // Simple extraction for demo (in production, this would be more sophisticated)
    const emailMatch = message.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    if (emailMatch) {
      contactEmail = emailMatch[0];
      tourBooked = true;
    }

    // Extract name if email is provided
    if (contactEmail && message.toLowerCase().includes('my name is')) {
      const nameMatch = message.match(/my name is ([A-Za-z\s]+)/i);
      if (nameMatch) {
        contactName = nameMatch[1].trim();
      }
    }

    return { content, contactEmail, contactName, tourBooked };
  } catch (error) {
    console.error("Error in chat:", error);
    return { content: "I'm experiencing some technical difficulties. Please try again or contact us directly at (555) 123-4567." };
  }
}

export async function generateWorkoutPlan(goals: string, healthData?: any): Promise<{ planTitle: string; weeklySchedule: any[] }> {
  if (!process.env.GEMINI_API_KEY && !process.env.API_KEY) {
    // Mock response for development
    return {
      planTitle: "Strength & Cardio Building Program",
      weeklySchedule: [
        {
          day: "Monday",
          focus: "Upper Body Strength",
          description: "Focus on building upper body strength with compound movements",
          exercises: [
            "Bench Press - 4 sets x 8-10 reps",
            "Pull-ups - 3 sets x 6-8 reps",
            "Shoulder Press - 3 sets x 10-12 reps",
            "Dumbbell Rows - 3 sets x 10-12 reps"
          ]
        },
        {
          day: "Tuesday",
          focus: "Cardio & Core",
          description: "Improve cardiovascular fitness and core stability",
          exercises: [
            "Treadmill Run - 30 minutes moderate pace",
            "Plank - 3 sets x 45 seconds",
            "Russian Twists - 3 sets x 20 reps",
            "Mountain Climbers - 3 sets x 30 seconds"
          ]
        },
        {
          day: "Wednesday",
          focus: "Lower Body Strength",
          description: "Build leg strength and power",
          exercises: [
            "Squats - 4 sets x 10-12 reps",
            "Deadlifts - 3 sets x 8-10 reps",
            "Lunges - 3 sets x 12 reps each leg",
            "Calf Raises - 3 sets x 15 reps"
          ]
        },
        {
          day: "Thursday",
          focus: "Active Recovery",
          description: "Light activity and stretching",
          exercises: [
            "20-minute walk",
            "Full body stretching routine",
            "Foam rolling",
            "Yoga or meditation"
          ]
        }
      ]
    };
  }

  try {
    const healthProfile = healthData ? `

Health Profile:
- Age: ${healthData.age}
- Current Fitness Level: ${healthData.fitnessLevel}
- Exercise Experience: ${healthData.exerciseExperience}
- Medical Conditions/Notes: ${healthData.medicalConditions || 'None reported'}
` : '';
    
    const prompt = `You are an expert personal trainer. Create a personalized weekly workout plan based on these goals and health profile:

Goals: ${goals}${healthProfile}

IMPORTANT SAFETY GUIDELINES:
- Consider the person's age, fitness level, and experience when selecting exercises
- If medical conditions are mentioned, suggest modifications and emphasize consulting healthcare providers
- Start conservatively for beginners and progress gradually
- Include proper warm-up and cool-down recommendations
- Suggest rest days and recovery periods

Create a structured workout plan with a catchy title and weekly schedule. Each day should include the focus area, description, and specific exercises with sets/reps appropriate for their level.

Return as JSON with this structure:
{
  "planTitle": "string",
  "weeklySchedule": [
    {
      "day": "string",
      "focus": "string", 
      "description": "string",
      "exercises": ["array of exercise strings with sets/reps"]
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            planTitle: { type: "string" },
            weeklySchedule: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  day: { type: "string" },
                  focus: { type: "string" },
                  description: { type: "string" },
                  exercises: {
                    type: "array",
                    items: { type: "string" }
                  }
                },
                required: ["day", "focus", "description", "exercises"]
              }
            }
          },
          required: ["planTitle", "weeklySchedule"]
        }
      },
      contents: prompt,
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    } else {
      throw new Error("Empty response from model");
    }
  } catch (error) {
    console.error("Error generating workout plan:", error);
    throw new Error("Failed to generate workout plan");
  }
}
