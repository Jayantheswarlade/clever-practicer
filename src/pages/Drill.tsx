import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Lightbulb, ClipboardList, ChevronRight, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function Drill() {
  const location = useLocation();
  const navigate = useNavigate();
  const { subject, subtopic, difficulty, confidence, questionCount = 10, questions: initialQuestions = [], batchNumber: initialBatch = 1 } = location.state || {};
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [answers, setAnswers] = useState<number[]>([]);
  const [showVisualization, setShowVisualization] = useState(false);
  const [questions, setQuestions] = useState(initialQuestions);
  const [batchNumber, setBatchNumber] = useState(initialBatch);
  const [isLoadingNextBatch, setIsLoadingNextBatch] = useState(false);

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questionCount) * 100;

  const loadNextBatch = async () => {
    setIsLoadingNextBatch(true);
    try {
      // Calculate performance for current batch
      const correctCount = answers.reduce((count, answer, idx) => {
        return count + (answer === questions[idx].correctAnswer ? 1 : 0);
      }, 0);
      
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
            confidence,
            questionCount: Math.min(5, questionCount - questions.length),
            batchNumber: batchNumber + 1,
            performanceData: {
              correctCount,
              totalAnswered: answers.length,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate next batch");
      }

      const { questions: newQuestions } = await response.json();
      setQuestions([...questions, ...newQuestions]);
      setBatchNumber(batchNumber + 1);
    } catch (error) {
      console.error("Error loading next batch:", error);
      alert("Failed to load next batch of questions. Please try again.");
    } finally {
      setIsLoadingNextBatch(false);
    }
  };

  const handleNext = async () => {
    const newAnswers = [...answers, parseInt(selectedAnswer)];
    setAnswers(newAnswers);
    
    // Check if we need to load next batch
    const isEndOfCurrentBatch = (currentQuestion + 1) % 5 === 0;
    const hasMoreQuestions = currentQuestion + 1 < questionCount;
    const needsMoreQuestions = currentQuestion + 1 >= questions.length;
    
    if (isEndOfCurrentBatch && hasMoreQuestions && needsMoreQuestions) {
      await loadNextBatch();
    }
    
    if (currentQuestion + 1 >= questionCount) {
      // Calculate final score
      const correctCount = newAnswers.reduce((count, answer, idx) => {
        return count + (answer === questions[idx].correctAnswer ? 1 : 0);
      }, 0);
      const score = Math.round((correctCount / questionCount) * 100);

      // Get AI analysis
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-results`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              subject,
              subtopic,
              questions,
              userAnswers: newAnswers,
              score,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to analyze results");
        }

        const { analysis } = await response.json();

        navigate("/results", {
          state: {
            score,
            questions,
            userAnswers: newAnswers,
            analysis,
            subject,
            subtopic,
          },
        });
      } catch (error) {
        console.error("Error analyzing results:", error);
        navigate("/results", {
          state: {
            score,
            questions,
            userAnswers: newAnswers,
            subject,
            subtopic,
          },
        });
      }
    } else {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer("");
    }
  };

  if (!question || isLoadingNextBatch) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-foreground">
            {isLoadingNextBatch ? "Generating next batch based on your performance..." : "Loading questions..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-foreground">
              Question {currentQuestion + 1} of {questionCount}
            </h1>
            <Progress value={progress} className="w-64" />
          </div>
          <p className="text-muted-foreground">
            Targeted practice for deep understanding. Personalized questions, instant insights.
          </p>
        </div>

        <div className="bg-card rounded-2xl shadow-medium p-8">
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Question {currentQuestion + 1}
            </h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVisualization(!showVisualization)}
                className="gap-2"
              >
                <Lightbulb className="w-4 h-4" />
                Concept Visualization
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <ClipboardList className="w-4 h-4" />
                My Notes
              </Button>
            </div>
          </div>

          <div className="mb-8">
            <p className="text-foreground text-lg leading-relaxed mb-6">
              {question.question}
            </p>

            {showVisualization && question.explanation && (
              <div className="bg-accent/20 border border-accent rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-foreground">{question.explanation}</p>
              </div>
            )}

            <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
              <div className="space-y-3">
                {question.options.map((option: string, index: number) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-3 p-4 rounded-lg border transition-smooth ${
                      selectedAnswer === index.toString()
                        ? "border-primary bg-accent"
                        : "border-input hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label
                      htmlFor={`option-${index}`}
                      className="flex-1 cursor-pointer text-foreground"
                    >
                      {String.fromCharCode(65 + index)}) {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          <Button
            onClick={handleNext}
            disabled={!selectedAnswer}
            className="w-full h-12 text-base font-medium bg-gradient-primary hover:opacity-90 transition-smooth"
          >
            {currentQuestion + 1 >= questionCount ? "Finish Drill" : "Next Question"}
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
