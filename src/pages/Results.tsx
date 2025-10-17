import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, ArrowRight, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    score = 0, 
    questions = [], 
    userAnswers = [], 
    analysis,
    subject,
    subtopic 
  } = location.state || {};

  const totalQuestions = questions.length;
  const correctCount = userAnswers.reduce((count: number, answer: number, idx: number) => {
    return count + (answer === questions[idx].correctAnswer ? 1 : 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-foreground">Drill Complete!</h1>
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <p className="text-muted-foreground">
            Here's how you performed in {subtopic} ({subject})
          </p>
        </div>

        {/* Score Card */}
        <Card className="bg-card rounded-2xl shadow-medium p-8 mb-6">
          <div className="text-center mb-6">
            <div className="inline-block">
              <div className="relative w-48 h-48 mx-auto mb-4">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${(score / 100) * 553} 553`}
                    className="text-primary transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold text-foreground">{score}%</span>
                  <span className="text-sm text-muted-foreground">Performance</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-accent/20 rounded-lg">
              <div className="text-2xl font-bold text-foreground">{correctCount}</div>
              <div className="text-sm text-muted-foreground">Correct</div>
            </div>
            <div className="text-center p-4 bg-accent/20 rounded-lg">
              <div className="text-2xl font-bold text-foreground">{totalQuestions - correctCount}</div>
              <div className="text-sm text-muted-foreground">Incorrect</div>
            </div>
            <div className="text-center p-4 bg-accent/20 rounded-lg">
              <div className="text-2xl font-bold text-foreground">{totalQuestions}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
          </div>
        </Card>

        {/* AI Analysis */}
        {analysis && (
          <>
            {/* Summary */}
            {analysis.summary && (
              <Card className="bg-card rounded-2xl shadow-medium p-6 mb-6">
                <h2 className="text-xl font-semibold text-foreground mb-3">Performance Summary</h2>
                <p className="text-muted-foreground">{analysis.summary}</p>
              </Card>
            )}

            {/* Lagging Areas */}
            {analysis.laggingAreas && analysis.laggingAreas.length > 0 && (
              <Card className="bg-card rounded-2xl shadow-medium p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold text-foreground">Areas to Improve</h2>
                </div>
                <div className="space-y-3">
                  {analysis.laggingAreas.map((area: any, index: number) => (
                    <div key={index} className="p-4 bg-accent/20 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-foreground">{area.area}</h3>
                        <Badge 
                          variant={area.priority === 'high' ? 'destructive' : area.priority === 'medium' ? 'default' : 'secondary'}
                        >
                          {area.priority} priority
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{area.description}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Recommendations */}
            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <Card className="bg-card rounded-2xl shadow-medium p-6 mb-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Study Recommendations</h2>
                <ul className="space-y-2">
                  {analysis.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <ArrowRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{rec}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="flex-1"
          >
            New Drill
          </Button>
          <Button
            onClick={() => window.location.reload()}
            className="flex-1 bg-gradient-primary hover:opacity-90 transition-smooth"
          >
            Review Questions
          </Button>
        </div>
      </div>
    </div>
  );
}
