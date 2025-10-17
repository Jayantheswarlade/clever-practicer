import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subject, subtopic, questions, userAnswers, score } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Identify wrong answers
    const wrongQuestions = questions
      .map((q: any, idx: number) => ({
        question: q.question,
        correctAnswer: q.options[q.correctAnswer],
        userAnswer: q.options[userAnswers[idx]],
        explanation: q.explanation,
        wasWrong: userAnswers[idx] !== q.correctAnswer
      }))
      .filter((q: any) => q.wasWrong);

    const systemPrompt = `You are an expert educational analyst. Analyze the student's performance and provide actionable insights.

Subject: ${subject}
Subtopic: ${subtopic}
Score: ${score}%

Questions the student got wrong:
${wrongQuestions.map((q: any, i: number) => `
${i + 1}. ${q.question}
   - Student answered: ${q.userAnswer}
   - Correct answer: ${q.correctAnswer}
   - Explanation: ${q.explanation}
`).join('\n')}

Based on this performance, provide:
1. Specific areas/concepts within ${subtopic} where the student needs improvement
2. Actionable study recommendations
3. Conceptual patterns in the mistakes

Return ONLY a valid JSON object with this structure:
{
  "laggingAreas": [
    {
      "area": "Specific concept name",
      "description": "Brief explanation of the gap",
      "priority": "high" | "medium" | "low"
    }
  ],
  "recommendations": [
    "Specific actionable recommendation"
  ],
  "summary": "Overall performance summary in 2-3 sentences"
}

Important: Return ONLY the JSON object, no markdown formatting, no additional text.`;

    console.log("Analyzing results with prompt:", systemPrompt);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze the performance and provide insights.` }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI Response:", JSON.stringify(data, null, 2));
    
    let analysisText = data.choices[0].message.content.trim();
    
    // Remove markdown code blocks if present
    analysisText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    const analysis = JSON.parse(analysisText);

    console.log("Generated analysis:", analysis);

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-results:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
