import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY || "",
});

export async function generateRetentionStrategies(
  memberProfile: any,
): Promise<string> {
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
      model: "gemini-1.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    return (
      response.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Unable to generate strategies at this time."
    );
  } catch (error) {
    console.error("Error generating retention strategies:", error);
    throw new Error("Failed to generate retention strategies");
  }
}

export async function generateSalesEmail(
  prompt: string,
  systemInstruction: string,
  model: string = "gemini-1.5-flash",
): Promise<{ content: string }> {
  if (!process.env.GEMINI_API_KEY && !process.env.API_KEY) {
    // Mock response for development
    return {
      content: `Subject: Discover Your Perfect Fitness Journey at Virgin Active

Dear [Name],

I hope this email finds you well! I noticed your passion for fitness and wellness, and I wanted to personally reach out to introduce you to Virgin Active - London's premier fitness destination.

Based on your interests in [interests], I believe you'd absolutely love our state-of-the-art facilities and expert-led programs designed specifically for people like you who are serious about their health and fitness goals.

**What makes Virgin Active special:**
• World-class equipment and facilities across London
• Expert personal trainers and group fitness classes
• Exclusive member benefits and flexible membership options
• Community of like-minded fitness enthusiasts

I'd love to invite you to experience everything we have to offer with a **complimentary 7-day trial** - completely free, no strings attached.

**Ready to see for yourself?**
Click here to take our virtual tour: [Virgin Active Virtual Tour Link]

Or if you'd prefer, I can arrange a personal tour at your convenience. Simply reply to this email or call me directly.

Your fitness journey deserves the best support, and I'm confident Virgin Active can provide exactly that.

Looking forward to welcoming you to our community!

Best regards,
[Your Name]
Virgin Active Sales Team

P.S. Don't forget to book your free trial session - spaces are limited!`,
    };
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      systemInstruction
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;

    return {
      content: text || "Email generated successfully",
    };
  } catch (error) {
    console.error("Error generating sales email:", error);
    throw new Error("Failed to generate sales email");
  }
}

export async function generateChurnPreventionEmail(
  memberProfile: any,
  riskLevel: string,
  currentRiskBand: string,
  previousRiskBand?: string,
): Promise<{ subject: string; content: string }> {
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

P.S. Don't forget - your membership includes unlimited access to our new meditation room and recovery zone!`,
      },
      medium: {
        subject: `${memberProfile.firstName}, let's keep your momentum going! 🏃‍♀️`,
        content: `Hi ${memberName},

We've noticed a slight change in your visit pattern recently. As someone who's been crushing their fitness goals, we want to help you maintain that amazing momentum!

**Your Recent Progress:**
• Member since ${new Date(memberProfile.joinDate).toLocaleDateString("en-GB")}
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

*Remember: Consistency beats perfection. Even 20 minutes counts!*`,
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

*Your next visit is going to be amazing - we've got everything ready for you!*`,
      },
    };

    return (
      mockEmails[riskLevel as keyof typeof mockEmails] || mockEmails.medium
    );
  }

  try {
    const memberName = `${memberProfile.firstName} ${memberProfile.lastName}`;
    const daysSinceLastVisit = memberProfile.lastVisit
      ? Math.floor(
          (Date.now() - new Date(memberProfile.lastVisit).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 999;

    const prompt = `You are writing a personalized churn prevention email for a UK fitness club called ClubPulse. Write a warm, encouraging email that doesn't feel pushy or desperate.

Member Details:
- Name: ${memberName}
- Membership Type: ${memberProfile.membershipType}
- Member Since: ${memberProfile.joinDate}
- Last Visit: ${memberProfile.lastVisit ? `${daysSinceLastVisit} days ago` : "Never visited"}
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
      model: "gemini-1.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const emailText = response.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Try to parse as JSON, fallback to structured format
    try {
      return JSON.parse(emailText);
    } catch {
      // If not JSON, extract subject and content manually
      const lines = emailText.split("\n");
      const subjectLine = lines.find((line) =>
        line.toLowerCase().includes("subject:"),
      );
      const subject = subjectLine
        ? subjectLine.replace(/subject:\s*/i, "").trim()
        : `We miss you at ClubPulse, ${memberProfile.firstName}!`;

      const contentStart = lines.findIndex((line) =>
        line.toLowerCase().includes("content:"),
      );
      const content =
        contentStart > -1
          ? lines
              .slice(contentStart + 1)
              .join("\n")
              .trim()
          : emailText;

      return { subject, content };
    }
  } catch (error) {
    console.error("Error generating churn prevention email:", error);
    throw new Error("Failed to generate churn prevention email");
  }
}

export async function generateLoyaltyOffers(
  targetCriteria: string,
): Promise<{ offers: any[] }> {
  if (!process.env.GEMINI_API_KEY && !process.env.API_KEY) {
    // Mock response for development
    return {
      offers: [
        {
          id: 1,
          title: "Free Yoga Mat",
          description: "Premium branded yoga mat for dedicated practitioners",
          points: 400,
          category: "Wellness",
        },
        {
          id: 2,
          title: "Morning Yoga Package",
          description: "5 additional morning yoga classes",
          points: 600,
          category: "Classes",
        },
        {
          id: 3,
          title: "Meditation Workshop",
          description:
            "Exclusive mindfulness workshop with certified instructor",
          points: 350,
          category: "Wellness",
        },
      ],
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
      model: "gemini-1.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const rawJson = response.candidates?.[0]?.content?.parts?.[0]?.text;
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

// =================================================================
// ===== ACQUISITION CHATBOT FUNCTION - UPDATED AS PER YOUR DATA =====
// =================================================================
export async function sendMessageToChat(
  message: string,
  conversationHistory: Array<{ role: string; content: string }>,
): Promise<{
  content: string;
  contactEmail?: string;
  contactName?: string;
  tourBooked?: boolean;
}> {
  if (!process.env.GEMINI_API_KEY && !process.env.API_KEY) {
    // Mock response for development
    const responses = [
      "Hi there! Welcome to Virgin Active. To get started, which language would you prefer for this chat?",
      "Great! How would you like to explore today? You can [Find clubs near me], learn about [Your goals], [Compare memberships], take a [Virtual club tour], [Show class options], or [Request a call back].",
      "To suggest the best for you, what’s your main fitness goal? Some popular ones are [Weight loss], [Build muscle], or [Improve endurance].",
      "Based on your goal to get stronger and visit 3-4 times a week, our 'Virgin Active All Access (Annual)' plan is the best value. It includes unlimited classes and full gym access for about £1.30 per visit. Would you like to explore clubs near you?",
    ];

    const randomResponse =
      responses[Math.floor(Math.random() * responses.length)];
    return { content: randomResponse };
  }

  try {
    // UPDATED: This system instruction now uses your detailed VA Demo data
    const systemInstruction = `You are a friendly, motivating, and knowledgeable AI assistant for Virgin Active. Your primary goal is to understand a potential new member's needs and guide them to the perfect club and membership plan. Be conversational and avoid being robotic.

Follow this conversational flow based on the user's choices:

1.  **Greeting & Setup:**
    * Start by welcoming the user to Virgin Active.
    * First, ask their preferred language: "[English] [Spanish] [French] [Other]".
    * Once confirmed, present the main menu of options: "[Find clubs near me] [Your goals] [Compare memberships] [Virtual club tour] [Show class options] [Request a call back]".

2.  **Path A: "Your goals" (Research and Discovery)**
    * If the user wants to explore their goals, follow this question sequence to build a profile. Don't ask all questions at once; make it a natural conversation.
    * a) Main fitness goal? ([Weight loss] [Build muscle] [Improve endurance] [Rehab / recovery] [Flexibility / mobility] [Stress & wellbeing] [Social / classes] [Not sure])
    * b) Target or timeline? ([Within 3 months] [3–6 months] [6+ months] [No specific timeline])
    * c) Fitness experience level? ([Beginner] [Intermediate] [Advanced] [Prefer trainer guidance])
    * d) Preferred workout style? ([Group classes] [Solo gym sessions] [Personal training] [Virtual workouts / on-demand] [Mix of these])
    * e) Ask to explore clubs. ([Use my location] [Enter a suburb or postcode])
    * f) Ask for search radius. ([5 km] [10 km] [20 km] [Custom])
    * g) Ask about important filters/amenities. ([Pool] [Sauna & spa] [Late opening] [Ladies-only] [24/7 access] [Studio classes] [Personal training] [Family-friendly])
    * h) How often they plan to visit? ([1–2x/week] [3–4x/week] [5+x/week] [Not sure])
    * i) Preferred session length? ([30 mins] [45 mins] [60 mins] [No preference])
    * j) Any injuries or medical conditions? ([Yes — I’ll explain] [No])
    * k) Any other preferences? ([Evening classes] [Weekend classes] [Beginner-friendly] [Advanced classes] [Wheelchair access] [Childcare])
    * l) Best times to work out? ([Early mornings] [Lunchtime] [Evenings] [Weekends] [No preference])
    * m) How to receive follow-ups? ([Email] [SMS] [App notifications] [Phone call] [No follow-up])

3.  **Path B: "Compare Memberships"**
    * If the user wants to compare plans, ask: "[Show me top plans] [Compare clubs & plans] [Find best plan for me] [Enter promo code]".
    * Based on their choice, you can ask clarifying questions like:
        * Membership type interest? ([Individual monthly] [Individual annual] [Family] [Student] [Corporate] [Pay-as-you-go])
        * Expected usage frequency? ([1–2x/week] [3–4x/week] [5+ / week] [Unsure])
        * Must-have amenities? ([Pool] [Sauna & spa] [Group classes] [Personal training] [24/7 gym] [Kids club])

4.  **Making Recommendations:**
    * After gathering information from Path A or B, use the following membership data to make a personalized recommendation. Explain WHY you're recommending it based on their answers.
    * **Virgin Active Lite (Monthly):**
        * **Price:** £29 / month
        * **Commitment:** No contract, cancel anytime.
        * **Access:** Gym floor only.
        * **Classes:** Pay-per-class / on-demand.
        * **Best for:** Occasional visitors, those on a budget, or people who prefer flexibility and don't need classes or pool access.
    * **Virgin Active All Access (Annual):**
        * **Price:** £39 / month (billed annually at £468).
        * **Commitment:** 12 months.
        * **Access:** Gym floor, unlimited group classes, pool, sauna.
        * **Perks:** 1 guest pass/month, can freeze up to 3 months.
        * **Best for:** Regular members (3+ times/week), those who want classes, pool, and the best overall value.

5.  **Handling Other Options:**
    * **[Find clubs near me]:** Ask for their location (postcode or suburb).
    * **[Request a call back]:** Ask for their name and phone number.
    * **[Virtual club tour] / [Show class options]:** Provide links or summary information and ask what they'd like to see first.

Keep responses helpful, friendly, and guide the user through the process smoothly.`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        ...conversationHistory.map((msg) => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        })),
        { role: "user", parts: [{ text: message }] }
      ],
      systemInstruction,
    });

    const content =
      response.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm sorry, I didn't understand that. Could you please rephrase?";

    // NOTE: The simple contact extraction logic is kept for demo purposes.
    // A more robust solution might use function calling or more advanced parsing.
    let contactEmail, contactName, tourBooked;
    const emailMatch = message.match(
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
    );
    if (emailMatch) {
      contactEmail = emailMatch[0];
      tourBooked = true; // Assuming providing an email implies booking interest
    }
    if (contactEmail && message.toLowerCase().includes("my name is")) {
      const nameMatch = message.match(/my name is ([A-Za-z\s]+)/i);
      if (nameMatch) {
        contactName = nameMatch[1].trim();
      }
    }

    return { content, contactEmail, contactName, tourBooked };
  } catch (error) {
    console.error("Error in chat:", error);
    return {
      content:
        "I'm experiencing some technical difficulties. Please try again or contact us directly.",
    };
  }
}

export async function generateWorkoutPlan(
  goals: string,
  healthData?: any,
): Promise<{ planTitle: string; weeklySchedule: any[] }> {
  if (!process.env.GEMINI_API_KEY && !process.env.API_KEY) {
    // Mock response for development
    return {
      planTitle: "Strength & Cardio Building Program",
      weeklySchedule: [
        {
          day: "Monday",
          focus: "Upper Body Strength",
          description:
            "Focus on building upper body strength with compound movements",
          exercises: [
            "Bench Press - 4 sets x 8-10 reps",
            "Pull-ups - 3 sets x 6-8 reps",
            "Shoulder Press - 3 sets x 10-12 reps",
            "Dumbbell Rows - 3 sets x 10-12 reps",
          ],
        },
        {
          day: "Tuesday",
          focus: "Cardio & Core",
          description: "Improve cardiovascular fitness and core stability",
          exercises: [
            "Treadmill Run - 30 minutes moderate pace",
            "Plank - 3 sets x 45 seconds",
            "Russian Twists - 3 sets x 20 reps",
            "Mountain Climbers - 3 sets x 30 seconds",
          ],
        },
        {
          day: "Wednesday",
          focus: "Lower Body Strength",
          description: "Build leg strength and power",
          exercises: [
            "Squats - 4 sets x 10-12 reps",
            "Deadlifts - 3 sets x 8-10 reps",
            "Lunges - 3 sets x 12 reps each leg",
            "Calf Raises - 3 sets x 15 reps",
          ],
        },
        {
          day: "Thursday",
          focus: "Active Recovery",
          description: "Light activity and stretching",
          exercises: [
            "20-minute walk",
            "Full body stretching routine",
            "Foam rolling",
            "Yoga or meditation",
          ],
        },
      ],
    };
  }

  try {
    const healthProfile = healthData
      ? `

Health Profile:
- Age: ${healthData.age}
- Current Fitness Level: ${healthData.fitnessLevel}
- Exercise Experience: ${healthData.exerciseExperience}
- Medical Conditions/Notes: ${healthData.medicalConditions || "None reported"}
`
      : "";

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
      model: "gemini-1.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const rawJson = response.candidates?.[0]?.content?.parts?.[0]?.text;
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
