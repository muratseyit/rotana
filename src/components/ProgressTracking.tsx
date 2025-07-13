import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, Calendar, BarChart3, Target, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { format, parseISO } from "date-fns";

interface AnalysisHistory {
  id: string;
  analysis_date: string;
  overall_score: number;
  score_breakdown: any;
  analysis_result: any;
}

interface ProgressTrackingProps {
  businessId: string;
  currentScore: number;
}

export function ProgressTracking({ businessId, currentScore }: ProgressTrackingProps) {
  const [history, setHistory] = useState<AnalysisHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalysisHistory();
  }, [businessId]);

  const fetchAnalysisHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('business_analysis_history')
        .select('*')
        .eq('business_id', businessId)
        .order('analysis_date', { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching analysis history:', error);
      toast({
        title: "Error",
        description: "Failed to load progress history",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreChange = () => {
    if (history.length < 2) return null;
    const previousScore = history[1].overall_score;
    const change = currentScore - previousScore;
    return {
      value: change,
      percentage: ((change / previousScore) * 100).toFixed(1),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'same'
    };
  };

  const getScoreIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <ArrowUp className="h-4 w-4 text-green-600" />;
      case 'down': return <ArrowDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getScoreChangeColor = (direction: string) => {
    switch (direction) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const scoreChange = getScoreChange();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{currentScore}%</div>
              <p className="text-sm text-muted-foreground">Current Score</p>
            </div>
            
            {scoreChange && (
              <div className="text-center">
                <div className={`text-2xl font-bold flex items-center justify-center gap-1 ${getScoreChangeColor(scoreChange.direction)}`}>
                  {getScoreIcon(scoreChange.direction)}
                  {Math.abs(scoreChange.value)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {scoreChange.direction === 'up' ? 'Improvement' : scoreChange.direction === 'down' ? 'Decline' : 'No Change'}
                </p>
              </div>
            )}
            
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{history.length}</div>
              <p className="text-sm text-muted-foreground">Total Assessments</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Analysis History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No previous analyses found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Run another analysis to start tracking your progress
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((analysis, index) => {
                const isLatest = index === 0;
                const previousScore = index < history.length - 1 ? history[index + 1].overall_score : null;
                const change = previousScore ? analysis.overall_score - previousScore : null;
                
                return (
                  <div 
                    key={analysis.id}
                    className={`p-4 border rounded-lg ${isLatest ? 'border-primary bg-primary/5' : 'border-border'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {format(parseISO(analysis.analysis_date), 'MMM dd, yyyy')}
                          </span>
                          {isLatest && (
                            <Badge variant="default" className="text-xs">Latest</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(parseISO(analysis.analysis_date), 'h:mm a')}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">{analysis.overall_score}%</span>
                          {change !== null && (
                            <div className={`flex items-center text-sm ${
                              change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {change > 0 ? (
                                <ArrowUp className="h-3 w-3" />
                              ) : change < 0 ? (
                                <ArrowDown className="h-3 w-3" />
                              ) : (
                                <Minus className="h-3 w-3" />
                              )}
                              {Math.abs(change)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Score Breakdown Trends */}
      {history.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Category Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.keys(history[0].score_breakdown || {}).map((category) => {
                const currentCategoryScore = history[0].score_breakdown?.[category] || 0;
                const previousCategoryScore = history[1].score_breakdown?.[category] || 0;
                const categoryChange = currentCategoryScore - previousCategoryScore;
                
                return (
                  <div key={category} className="flex items-center justify-between p-3 border rounded">
                    <span className="font-medium capitalize">
                      {category.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{currentCategoryScore}%</span>
                      {categoryChange !== 0 && (
                        <div className={`flex items-center text-sm ${
                          categoryChange > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {categoryChange > 0 ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          )}
                          {Math.abs(categoryChange)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}