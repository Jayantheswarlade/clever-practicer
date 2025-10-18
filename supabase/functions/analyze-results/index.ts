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
    
    const GOOGLE_GEMINI_API_KEY = Deno.env.get("GOOGLE_GEMINI_API_KEY");
    if (!GOOGLE_GEMINI_API_KEY) {
      throw new Error("GOOGLE_GEMINI_API_KEY is not configured");
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

    const prompt = `Analyze this student's performance and provide actionable insights.

Subject: ${subject}
Subtopic: ${subtopic}
Score: ${score}%
Total Questions: ${questions.length}
Wrong Answers: ${wrongQuestions.length}

Questions the student got wrong:
${wrongQuestions.map((q: any, i: number) => `
${i + 1}. ${q.question}
   - Student answered: ${q.userAnswer}
   - Correct answer: ${q.correctAnswer}
   - Explanation: ${q.explanation}
`).join('\n')}

Based on this performance, provide:
1. Specific areas/concepts within "${subtopic}" where the student needs improvement
2. Actionable study recommendations
3. Overall performance summary

Return ONLY a valid JSON object with this structure (no markdown, no extra text):
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
}`;

    console.log("Analyzing results with Gemini 1.5 Pro");
    console.log("Score:", score, "Wrong:", wrongQuestions.length);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GOOGLE_GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("Gemini Response:", JSON.stringify(data, null, 2));
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error("Invalid response from Gemini API");
    }

    let analysisText = data.candidates[0].content.parts[0].text.trim();
    
    // Remove markdown code blocks if present
    analysisText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    const analysis = JSON.parse(analysisText);

    console.log("Generated analysis successfully");

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-results:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred",
        details: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
