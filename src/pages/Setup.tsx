import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Info, Plus, Minus } from "lucide-react";

export default function Setup() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState("");
  const [subtopic, setSubtopic] = useState("");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [confidence, setConfidence] = useState([2]); // 0: Vague, 1: Got Basics, 2: Ready to Master
  const [questionCount, setQuestionCount] = useState(10);
  const [questionType, setQuestionType] = useState("conceptual"); // "conceptual" or "problem-solving"

  const confidenceLevels = ["Vague", "Got the Basics", "Ready of Master"];

  const handleStart = async () => {
    try {
      // Generate first batch of 5 questions
      const initialBatchSize = Math.min(5, questionCount);
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-questions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
            body: JSON.stringify({
              subject,
              subtopic,
              difficulty,
              confidence: confidenceLevels[confidence[0]],
              questionCount: initialBatchSize,
              batchNumber: 1,
              questionType,
            }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate questions");
      }

      const { questions } = await response.json();

      navigate("/drill", {
        state: {
          subject,
          subtopic,
          difficulty,
          confidence: confidenceLevels[confidence[0]],
          questionCount,
          questionType,
          questions,
          batchNumber: 1,
        },
      });
    } catch (error) {
      console.error("Error generating questions:", error);
      alert("Failed to generate questions. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">AI Mastery Drill</h1>
          <p className="text-muted-foreground">
            Targeted practice for deep understanding. Personized questions, instant insights.
          </p>
        </div>

        <div className="bg-card rounded-2xl shadow-medium p-8">
          <div className="flex items-center gap-2 mb-8">
            <h2 className="text-xl font-semibold text-foreground">1. Define Your Focus</h2>
            <Info className="w-5 h-5 text-muted-foreground" />
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label htmlFor="subject" className="text-foreground mb-2 block">Subject</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Physics, Calculus"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="bg-background border-input"
                />
              </div>

              <div>
                <Label htmlFor="subtopic" className="text-foreground mb-2 block">Subtopic</Label>
                <Input
                  id="subtopic"
                  placeholder="e.g., Ohm's Law, Derivatives"
                  value={subtopic}
                  onChange={(e) => setSubtopic(e.target.value)}
                  className="bg-background border-input"
                />
              </div>
            </div>

            <div>
              <Label className="text-foreground mb-2 block">Difficulty Level</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="bg-background border-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="Beginner">Beginner (L1)</SelectItem>
                  <SelectItem value="Intermediate">Intermediate (L2)</SelectItem>
                  <SelectItem value="Advanced">Advanced (L3)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-foreground">How confident are you in this subtopic?</Label>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground w-32">Vague</span>
                <Slider
                  value={confidence}
                  onValueChange={setConfidence}
                  max={2}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground w-32 text-right">Ready of Master</span>
              </div>
              <div className="mt-2 text-center">
                <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium">
                  {confidenceLevels[confidence[0]]}
                </span>
              </div>
            </div>

            <div>
              <Label className="text-foreground mb-3 block">Number of Questions</Label>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuestionCount(Math.max(5, questionCount - 5))}
                  disabled={questionCount <= 5}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <div className="flex-1 text-center">
                  <span className="text-3xl font-bold text-foreground">{questionCount}</span>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuestionCount(Math.min(20, questionCount + 5))}
                  disabled={questionCount >= 20}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2 text-center">Multiples of 5 (Max 20)</p>
            </div>

            <div>
              <Label className="text-foreground mb-3 block">Question Type Preference</Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setQuestionType("conceptual")}
                  className={`p-4 rounded-lg border-2 transition-smooth text-left ${
                    questionType === "conceptual"
                      ? "border-primary bg-accent"
                      : "border-input hover:border-primary/50"
                  }`}
                >
                  <div className="text-2xl mb-2">🧠</div>
                  <div className="font-semibold text-foreground mb-1">Conceptual Questions</div>
                  <div className="text-sm text-muted-foreground">Focus on understanding core ideas</div>
                </button>
                <button
                  type="button"
                  onClick={() => setQuestionType("problem-solving")}
                  className={`p-4 rounded-lg border-2 transition-smooth text-left ${
                    questionType === "problem-solving"
                      ? "border-primary bg-accent"
                      : "border-input hover:border-primary/50"
                  }`}
                >
                  <div className="text-2xl mb-2">⚙️</div>
                  <div className="font-semibold text-foreground mb-1">Problem-Solving Questions</div>
                  <div className="text-sm text-muted-foreground">Focus on application and calculations</div>
                </button>
              </div>
            </div>
          </div>

          <Button
            onClick={handleStart}
            disabled={!subject || !subtopic}
            className="w-full mt-8 h-12 text-base font-medium bg-gradient-primary hover:opacity-90 transition-smooth"
          >
            Start {questionCount}-Question Drill
          </Button>
        </div>
      </div>
    </div>
  );
}
