import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, Lightbulb, FileText, Search, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const { answers = [], questionCount = 10 } = location.state || {};

  // Mock calculation - in production this would be based on actual answers
  const score = 9;
  const percentage = 80;
  const incorrect = 2;
  const hintsUsed = 1;
  const firstTryCorrect = 7;

  const weakAreas = ["Vector Addition", "Vector Addition", "Implicitienation", "Kinamatics"];

  const actionCards = [
    {
      icon: Lightbulb,
      title: "Review Concept:",
      subtitle: "Vector Addition",
      color: "text-primary"
    },
    {
      icon: FileText,
      title: "Generate Cheat Sheet:",
      subtitle: "Kinmatics",
      color: "text-primary"
    },
    {
      icon: Search,
      title: "See Step Re-Styep for",
      subtitle: "for Problem 4",
      color: "text-primary"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-foreground">Drill Complete!</h1>
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <p className="text-muted-foreground">
            Targeted practice for deep understanding. Personized questions, instant insights.
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-2xl shadow-medium p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                <Trophy className="w-5 h-5 text-accent-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Your Performance Insights</h2>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Card className="p-8 border-border bg-background">
                <div className="text-center">
                  <div className="text-6xl font-bold text-foreground mb-2">
                    {score}/{questionCount}
                  </div>
                  <p className="text-lg text-muted-foreground">{percentage}% Mastery</p>
                </div>
              </Card>

              <div className="flex items-center justify-center">
                <div className="relative w-40 h-40">
                  <svg className="w-40 h-40 transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="hsl(var(--muted))"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="hsl(var(--primary))"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 70}`}
                      strokeDashoffset={`${2 * Math.PI * 70 * (1 - percentage / 100)}`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-foreground">{percentage}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-semibold text-foreground">{incorrect}</p>
                <p className="text-sm text-muted-foreground">Incorrect</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{hintsUsed}</p>
                <p className="text-sm text-muted-foreground">Hint Used</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{firstTryCorrect}</p>
                <p className="text-sm text-muted-foreground">Correct on First Try</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl shadow-medium p-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">Areas to Revisit:</h3>
            <div className="flex flex-wrap gap-2 mb-6">
              {weakAreas.map((area, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="px-4 py-2 text-sm border-primary text-primary"
                >
                  {area}
                </Badge>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4">
              {actionCards.map((card, index) => (
                <Card
                  key={index}
                  className="p-6 border-border hover:border-primary transition-smooth cursor-pointer"
                >
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                      <card.icon className={`w-6 h-6 ${card.color}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{card.title}</p>
                      <p className="text-sm text-muted-foreground">{card.subtitle}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="w-full h-12 text-base font-medium"
          >
            Start Another Drill on Dervatives
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
