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
    const { subject, subtopic, difficulty, confidence, questionCount } = await req.json();
    
    const GOOGLE_GEMINI_API_KEY = Deno.env.get("GOOGLE_GEMINI_API_KEY");
    if (!GOOGLE_GEMINI_API_KEY) {
      throw new Error("GOOGLE_GEMINI_API_KEY is not configured");
    }

    // Craft the prompt based on user configuration
    const prompt = `Generate exactly ${questionCount} multiple choice questions about "${subtopic}" in "${subject}".

Difficulty Level: ${difficulty}
Student Confidence: ${confidence}

Requirements:
- Each question must have exactly 4 options (A, B, C, D)
- Only one correct answer per question
- Questions should match the ${difficulty} difficulty level
- Adjust complexity based on student confidence: ${confidence}
- Include clear, unambiguous questions
- Provide educational value in each question

Return ONLY a valid JSON array with this exact structure (no markdown, no extra text):
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Brief explanation of the correct answer"
  }
]`;

    console.log("Generating questions with Gemini Pro");
    console.log("Subject:", subject, "Subtopic:", subtopic, "Difficulty:", difficulty);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GOOGLE_GEMINI_API_KEY}`,
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
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
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

    let questionsText = data.candidates[0].content.parts[0].text.trim();
    
    // Remove markdown code blocks if present
    questionsText = questionsText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    const questions = JSON.parse(questionsText);
    
    if (!Array.isArray(questions)) {
      throw new Error("AI did not return a valid array of questions");
    }

    console.log("Generated", questions.length, "questions successfully");

    return new Response(
      JSON.stringify({ questions }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-questions:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred",
        details: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
