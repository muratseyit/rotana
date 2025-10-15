import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

interface ScoreInfluence {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  points: number;
  evidence: string;
}

interface ScoreInfluenceCardProps {
  category: string;
  score: number;
  influences: ScoreInfluence[];
}

export function ScoreInfluenceCard({ category, score, influences }: ScoreInfluenceCardProps) {
  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'negative':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive':
        return 'text-green-600 bg-green-50 dark:bg-green-950/20';
      case 'negative':
        return 'text-red-600 bg-red-50 dark:bg-red-950/20';
      default:
        return 'text-blue-600 bg-blue-50 dark:bg-blue-950/20';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{category}</CardTitle>
          <Badge variant={score >= 70 ? 'default' : score >= 50 ? 'secondary' : 'destructive'}>
            {score} points
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {influences.map((influence, index) => (
          <div 
            key={index}
            className={`flex items-start gap-3 p-3 rounded-lg ${getImpactColor(influence.impact)}`}
          >
            <div className="mt-0.5">
              {getImpactIcon(influence.impact)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="font-medium text-sm">{influence.factor}</p>
                <span className="text-xs font-semibold whitespace-nowrap">
                  {influence.points > 0 ? '+' : ''}{influence.points}
                </span>
              </div>
              <p className="text-xs opacity-80">{influence.evidence}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
