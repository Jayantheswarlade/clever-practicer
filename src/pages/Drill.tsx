import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Lightbulb, ClipboardList, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

// Mock questions - in production this would come from AI
const mockQuestions = [
  {
    id: 1,
    question: "A block of mass m = 2 kg is pulled along a frictionless horizontal surface by force F of magnitude 10 N, directed at angle θ = 30° above the horizontal. What is the magnitude of the block's acceleration?",
    options: [
      "4.33 m/s²",
      "2.3 m/s²",
      "4.33 m/s²"
    ],
    correctAnswer: 2,
    diagram: true
  },
  {
    id: 2,
    question: "What is the derivative of f(x) = 3x² + 2x - 5?",
    options: [
      "6x + 2",
      "3x + 2",
      "6x - 2"
    ],
    correctAnswer: 0
  },
  // Add more mock questions as needed
];

export default function Drill() {
  const location = useLocation();
  const navigate = useNavigate();
  const { questionCount = 10 } = location.state || {};
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [answers, setAnswers] = useState<number[]>([]);
  const [showVisualization, setShowVisualization] = useState(false);

  const question = mockQuestions[currentQuestion % mockQuestions.length];
  const progress = ((currentQuestion + 1) / questionCount) * 100;

  const handleNext = () => {
    setAnswers([...answers, parseInt(selectedAnswer)]);
    
    if (currentQuestion + 1 >= questionCount) {
      navigate("/results", {
        state: { answers, questionCount }
      });
    } else {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer("");
    }
  };

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
            Targeted practice for deep understanding. Personized questions, instant insights.
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

            {question.diagram && (
              <div className="bg-muted rounded-lg p-8 mb-6 flex items-center justify-center">
                <div className="text-center">
                  <svg width="200" height="120" className="mx-auto">
                    <line x1="50" y1="80" x2="150" y2="80" stroke="currentColor" strokeWidth="2" />
                    <line x1="100" y1="80" x2="150" y2="30" stroke="currentColor" strokeWidth="2" />
                    <circle cx="150" cy="30" r="4" fill="currentColor" />
                    <text x="155" y="25" className="text-sm">d</text>
                    <text x="95" y="100" className="text-sm">20</text>
                  </svg>
                </div>
              </div>
            )}

            <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
              <div className="space-y-3">
                {question.options.map((option, index) => (
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
            Next Question
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
