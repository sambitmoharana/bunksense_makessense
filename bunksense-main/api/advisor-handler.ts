// Backend AI Academic Advisor and Weekly Insights Handler
import { percent, safeBunks, recoveryNeeded, status } from "./advisor-math.js";

export type Subject = {
  id: string;
  user_id: string;
  subject_name: string;
  total_classes: number;
  attended_classes: number;
  required_percentage: number;
  color: string;
  created_at: string;
};

export type TimetableSlot = {
  id: string;
  user_id: string;
  day_of_week: number;
  period: number;
  subject_id: string | null;
};

export type ChatMessage = {
  role: "user" | "model";
  content: string;
};

export type AdvisorRequest = {
  action: "chat" | "insights";
  messages?: ChatMessage[];
  context: {
    subjects: Subject[];
    timetable: TimetableSlot[];
  };
};

// Main Handler function
export async function handleAdvisorRequest(
  body: AdvisorRequest,
  apiKey: string | undefined
) {
  const { action, messages = [], context } = body;
  const { subjects = [], timetable = [] } = context;

  // Calculate detailed stats for each subject
  const subjectsWithStats = subjects.map((s) => {
    const p = percent(s.attended_classes, s.total_classes);
    const sb = safeBunks({
      attended: s.attended_classes,
      total: s.total_classes,
      required: Number(s.required_percentage),
    });
    const rn = recoveryNeeded({
      attended: s.attended_classes,
      total: s.total_classes,
      required: Number(s.required_percentage),
    });
    const st = status({
      attended: s.attended_classes,
      total: s.total_classes,
      required: Number(s.required_percentage),
    });
    return {
      name: s.subject_name,
      attended: s.attended_classes,
      total: s.total_classes,
      percent: p,
      required: s.required_percentage,
      safeBunks: sb,
      recoveryNeeded: rn,
      status: st,
    };
  });

  const overallTotal = subjects.reduce((a, s) => a + s.total_classes, 0);
  const overallAttended = subjects.reduce((a, s) => a + s.attended_classes, 0);
  const overallPercent = percent(overallAttended, overallTotal);

  const totalBunkBudget = subjectsWithStats.reduce(
    (a, s) => a + (Number.isFinite(s.safeBunks) ? s.safeBunks : 0),
    0
  );
  const totalRecoveryNeeded = subjectsWithStats.reduce(
    (a, s) => a + (Number.isFinite(s.recoveryNeeded) ? s.recoveryNeeded : 0),
    0
  );
  const shortageCount = subjectsWithStats.filter((s) => s.status === "shortage").length;
  const warningCount = subjectsWithStats.filter((s) => s.status === "warning").length;

  // Determine risk level
  let riskLevel: "low" | "medium" | "high" = "low";
  if (shortageCount > 0) riskLevel = "high";
  else if (warningCount > 0 || overallPercent < 77) riskLevel = "medium";

  // Build timetable analysis
  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const timetableAnalysis = DAYS.map((dayName, index) => {
    const daySlots = timetable.filter((s) => s.day_of_week === index && s.subject_id);
    const daySubjects = daySlots
      .map((slot) => {
        const sub = subjects.find((s) => s.id === slot.subject_id);
        if (!sub) return null;
        const subStat = subjectsWithStats.find((s) => s.name === sub.subject_name);
        return {
          name: sub.subject_name,
          status: subStat?.status || "safe",
          recoveryNeeded: subStat?.recoveryNeeded || 0,
        };
      })
      .filter(Boolean) as { name: string; status: string; recoveryNeeded: number }[];

    let dayRisk: "free" | "safe" | "warning" | "danger" = "free";
    if (daySubjects.length > 0) {
      if (daySubjects.some((s) => s.status === "shortage" || s.recoveryNeeded > 0)) {
        dayRisk = "danger";
      } else if (daySubjects.some((s) => s.status === "warning")) {
        dayRisk = "warning";
      } else {
        dayRisk = "safe";
      }
    }

    return {
      day: dayName,
      risk: dayRisk,
      classes: daySubjects.map((s) => s.name),
    };
  });

  // If API Key is available, make call to Gemini
  if (apiKey && apiKey.trim() !== "") {
    try {
      const systemInstruction = `You are BunkSense AI, an expert academic advisor specialized in attendance optimization. You help college students decide when it's safe to bunk classes and how to recover from shortages without falling below required attendance levels (typically 75%).
      
Here is the student's current academic status:
- Overall Attendance: ${overallPercent.toFixed(1)}%
- Total Subjects: ${subjects.length}
- Subjects in Shortage: ${shortageCount}
- Subjects in Warning: ${warningCount}
- Safe Bunk Budget: ${totalBunkBudget} classes overall
- Total Recovery Classes Needed: ${totalRecoveryNeeded} classes

Subject Details:
${subjectsWithStats
  .map(
    (s) =>
      `- ${s.name}: Attended ${s.attended}/${s.total} (${s.percent.toFixed(1)}%, Target: ${s.required}%) | Status: ${s.status.toUpperCase()} | Safe Bunks: ${
        Number.isFinite(s.safeBunks) ? s.safeBunks : "Infinity"
      } | Recovery needed: ${s.recoveryNeeded}`
  )
  .join("\n")}

Timetable Schedule:
${timetableAnalysis
  .map(
    (d) =>
      `- ${d.day}: [${d.classes.join(", ") || "No classes"}] | Risk level: ${d.risk.toUpperCase()}`
  )
  .join("\n")}

Rules for your responses:
1. Keep responses direct, actionable, formatted in Markdown, and slightly witty or encouraging.
2. If the user asks about bunking, check their safe bunks budget and warn them if they have zero buffer.
3. If they ask how to recover, tell them exactly how many classes they need to attend consecutively.
4. If they ask about their schedule, analyze their timetable risks.
5. Do not make up any attendance percentages or numbers. Stick strictly to the provided statistics.`;

      let prompt = "";
      let geminiContents: any[] = [];

      if (action === "insights") {
        prompt = `Generate a Weekly BunkSense Briefing report. 
Create a detailed, beautifully-formatted academic advice summary of about 2-3 paragraphs.
Include sections:
1. **Attendance Diagnostic**: Summarize where they stand (risks, strengths).
2. **Weekly Bunk Strategy**: Identify which days this week are safe to skip and which days are high risk based on scheduled classes.
3. **Immediate Priorities**: Highlight specific recovery goals (e.g. "Attend Math on Monday and Wednesday").
Make the tone engaging, helpful, and sharp.`;
        
        geminiContents = [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ];
      } else {
        // Map messages history to Gemini format
        // Gemini expects role to be 'user' or 'model'
        geminiContents = messages.map((m) => ({
          role: m.role,
          parts: [{ text: m.content }]
        }));
        
        // Ensure there is at least one message
        if (geminiContents.length === 0) {
          geminiContents.push({
            role: "user",
            parts: [{ text: "Hello! Summarize my attendance and give me some advice." }]
          });
        }
      }

      // API Call to Gemini 2.5 Flash
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemInstruction }],
            },
            contents: geminiContents,
            generationConfig: {
              maxOutputTokens: 1000,
              temperature: 0.7,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const resData = await response.json();
      const text = resData?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return {
          success: true,
          source: "gemini",
          text: text,
          meta: {
            overallPercent,
            totalBunkBudget,
            shortageCount,
            riskLevel,
            timetableAnalysis,
          },
        };
      } else {
        throw new Error("Empty response from Gemini API");
      }
    } catch (err: any) {
      console.warn("Gemini API call failed, falling back to local engine:", err.message);
      // Fallback is handled below
    }
  }

  // Local Rules Heuristic Engine (Fallback)
  if (action === "insights") {
    const briefing = generateLocalInsightsBriefing(
      subjectsWithStats,
      overallPercent,
      totalBunkBudget,
      totalRecoveryNeeded,
      shortageCount,
      warningCount,
      timetableAnalysis
    );
    return {
      success: true,
      source: "local-rules",
      text: briefing,
      meta: {
        overallPercent,
        totalBunkBudget,
        shortageCount,
        riskLevel,
        timetableAnalysis,
      },
    };
  } else {
    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === "user")?.content || "";
    
    const reply = generateLocalChatResponse(
      lastUserMessage,
      subjectsWithStats,
      overallPercent,
      totalBunkBudget,
      totalRecoveryNeeded,
      shortageCount,
      warningCount,
      timetableAnalysis
    );

    return {
      success: true,
      source: "local-rules",
      text: reply,
      meta: {
        overallPercent,
        totalBunkBudget,
        shortageCount,
        riskLevel,
        timetableAnalysis,
      },
    };
  }
}

// Generate fallback insights
function generateLocalInsightsBriefing(
  subjects: any[],
  overall: number,
  bunkBudget: number,
  recovery: number,
  shortages: number,
  warnings: number,
  timetableAnalysis: any[]
): string {
  if (subjects.length === 0) {
    return `### Welcome to your BunkSense Briefing! 👋

It looks like you haven't added any subjects yet. Once you add subjects and set up your weekly schedule, I'll analyze your attendance details, predict your risks, and help you draft an optimized skip strategy. 

Click the **Subjects** tab to get started!`;
  }

  const riskEmoji = shortages > 0 ? "🚨 HIGH RISK" : warnings > 0 ? "⚠️ MEDIUM RISK" : "✅ LOW RISK";
  
  // Find safest and riskiest subjects
  const worst = [...subjects].sort((a, b) => a.percent - b.percent)[0];
  const safest = [...subjects].filter(s => Number.isFinite(s.safeBunks) && s.safeBunks > 0).sort((a, b) => b.safeBunks - a.safeBunks)[0];

  // Determine risky days based on scheduled classes
  const dangerDays = timetableAnalysis.filter(d => d.risk === "danger").map(d => d.day);
  const safeDays = timetableAnalysis.filter(d => d.risk === "safe" && d.classes.length > 0).map(d => d.day);

  let diagText = "";
  if (shortages > 0) {
    diagText = `Your overall attendance is **${overall.toFixed(1)}%**. You currently have **${shortages} subject(s) in shortage** (below target threshold). Immediate attention is required to lift these subjects back into safety.`;
  } else if (warnings > 0) {
    diagText = `Your overall attendance is **${overall.toFixed(1)}%**. You have **${warnings} subject(s) in the warning zone**. You are meeting your targets, but your buffers are extremely thin (1 class or less before shortage).`;
  } else {
    diagText = `Great job! Your overall attendance is **${overall.toFixed(1)}%**, and all of your subjects are comfortably safe. You have maintained a healthy buffer across the board.`;
  }

  let strategyText = "";
  if (bunkBudget > 0) {
    strategyText = `You have a total **Bunk Budget of ${bunkBudget} class(es)** you can skip this week without dropping below your targets. `;
    if (safest) {
      strategyText += `The safest subject to skip is **${safest.name}**, where you have **${safest.safeBunks}** safe bunk(s) available. `;
    }
  } else {
    strategyText = `You have **0 safe bunks available** across all subjects this week. Bunking any class right now will push you into the danger zone. `;
  }

  if (dangerDays.length > 0) {
    strategyText += `Based on your timetable, **${dangerDays.join(" and ")}** are strict **Must-Attend** days because they contain classes currently in shortage or warning. `;
  }
  if (safeDays.length > 0) {
    strategyText += `On the other hand, **${safeDays.join(", ")}** are relatively safe days where you have classes with healthy buffers.`;
  }

  let actionText = "";
  if (recovery > 0) {
    actionText = `Prioritize attending classes in **${worst.name}** (currently at **${worst.percent.toFixed(1)}%**). You need to attend the next **${worst.recoveryNeeded}** classes consecutively to restore your attendance to the required **${worst.required}%**.`;
  } else {
    actionText = `Maintain your current routine! Attend all scheduled periods to lock in your margins. You are on track to pass all attendance inspections this semester.`;
  }

  return `### AI Weekly Briefing (${riskEmoji})

${diagText}

### Weekly Bunk Strategy
${strategyText}

### Immediate Priorities & Actions
* **Focus Area**: ${actionText}
* **Bunk Budget**: Use your **${bunkBudget}** missable classes sparingly, preferably saving them for exam preparation or unavoidable breaks.
* **Timetable Guidance**: Try to achieve perfect attendance on days with classes in shortage. Check the daily heatmap for exact session risks!`;
}

// Generate fallback chat responses
function generateLocalChatResponse(
  query: string,
  subjects: any[],
  overall: number,
  bunkBudget: number,
  recovery: number,
  shortages: number,
  warnings: number,
  timetableAnalysis: any[]
): string {
  const q = query.toLowerCase();

  if (subjects.length === 0) {
    return "You haven't set up any subjects yet! Go ahead and add some subjects in the dashboard so I can help analyze your situation.";
  }

  // 1. Check if user is asking to skip/bunk
  if (q.includes("skip") || q.includes("bunk") || q.includes("miss") || q.includes("absent")) {
    const list = subjects.filter((s) => s.safeBunks > 0);
    if (list.length === 0) {
      return `🛑 **No safe bunks available!** Bunking any class right now will cause an attendance shortage. 

Your overall attendance is **${overall.toFixed(1)}%** and you have **${shortages}** subjects in shortage. I highly recommend attending all classes this week.`;
    }

    const subList = list
      .map((s) => `- **${s.name}**: You can safely miss **${s.safeBunks}** class(es) (current: ${s.percent.toFixed(1)}%, target: ${s.required}%)`)
      .join("\n");
    return `🟢 Here are the classes you can safely skip right now:

${subList}

*Note: Bunking these will decrease your percentage but will keep you at or above your required threshold. Try to space out your skips!*`;
  }

  // 2. Check if user is asking to recover
  if (q.includes("recover") || q.includes("improve") || q.includes("raise") || q.includes("fix") || q.includes("shortage")) {
    const list = subjects.filter((s) => s.status === "shortage");
    if (list.length === 0) {
      return `🎉 **No recovery needed!** All your subjects are currently above their required attendance thresholds (minimum ${subjects[0]?.required || 75}%). Keep going!`;
    }

    const subList = list
      .map((s) => `- **${s.name}**: Need to attend the next **${s.recoveryNeeded}** classes consecutively (current: ${s.percent.toFixed(1)}%, target: ${s.required}%)`)
      .join("\n");
    return `📈 Here is your recovery plan to escape the attendance shortage zone:

${subList}

If you attend these classes without any misses, your attendance will return to safe levels. Prioritize these days above all!`;
  }

  // 3. Check if user is asking about a specific subject
  for (const s of subjects) {
    if (q.includes(s.name.toLowerCase())) {
      const sbText = Number.isFinite(s.safeBunks) && s.safeBunks > 0 
        ? `You can safely miss **${s.safeBunks}** classes.` 
        : `You have **0** safe bunks left.`;
      
      const rcText = s.recoveryNeeded > 0
        ? `You need to attend **${s.recoveryNeeded}** consecutive classes to recover.`
        : `You are in the safety zone!`;

      return `📊 **Subject Analysis: ${s.name}**
- **Current Attendance**: ${s.percent.toFixed(1)}% (${s.attended}/${s.total} classes)
- **Target Attendance**: ${s.required}%
- **Status**: ${s.status.toUpperCase()}
- **Skip Budget**: ${sbText}
- **Recovery Requirement**: ${rcText}

Let me know if you want to know about other subjects or need overall planning advice!`;
    }
  }

  // 4. Timetable queries
  if (q.includes("timetable") || q.includes("schedule") || q.includes("today") || q.includes("tomorrow") || q.includes("day")) {
    const riskDays = timetableAnalysis.filter((d) => d.risk === "danger");
    if (riskDays.length === 0) {
      return "Your weekly schedule looks very clean! None of your scheduled days contain subjects in danger/shortage. You are free to budget your skips as you like.";
    }

    const daysText = riskDays
      .map((d) => `- **${d.day}**: Strict attendance required. Scheduled: [${d.classes.join(", ")}]`)
      .join("\n");
    return `📅 **Schedule Risk Assessment:**

The following days are high risk because they contain subjects currently in attendance shortage or warning:
${daysText}

Make sure to attend these sessions to prevent further damage to your percentages!`;
  }

  // 5. General response / Greeting
  return `👋 Hello! I am your **BunkSense AI Advisor**. I analyze your attendance dashboard and timetable to help you maintain your percentages and make smart skip choices.

Here is a quick snapshot of your status:
- **Overall Attendance**: ${overall.toFixed(1)}%
- **Safe Bunk Budget**: ${bunkBudget} classes overall
- **Subjects in Shortage**: ${shortages} subject(s)
- **Classes to Recover**: ${recovery} classes needed

You can ask me questions like:
- *"Can I skip any classes today?"*
- *"How can I recover my attendance?"*
- *"Show me my schedule risk analysis."*
- *"Tell me about a specific subject like Chemistry."*`;
}
