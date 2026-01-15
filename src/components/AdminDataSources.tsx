import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw, 
  Database, 
  Globe, 
  FileText, 
  Zap,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  getMarketDataSources,
  getTradeStatistics,
  refreshMarketData,
  formatTradeValue,
  getDataAge,
  MarketDataSource,
  TradeStatistic,
} from '@/lib/api/marketIntelligence';

export function AdminDataSources() {
  const { toast } = useToast();
  const [sources, setSources] = useState<MarketDataSource[]>([]);
  const [tradeStats, setTradeStats] = useState<TradeStatistic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [sourcesData, statsData] = await Promise.all([
      getMarketDataSources(),
      getTradeStatistics(),
    ]);
    setSources(sourcesData);
    setTradeStats(statsData);
    setIsLoading(false);
  };

  const handleRefresh = async (sourceName?: string) => {
    setIsRefreshing(true);
    const result = await refreshMarketData(sourceName);
    
    if (result.success) {
      toast({
        title: 'Data Refreshed',
        description: 'Market data updated successfully',
      });
      await loadData();
    } else {
      toast({
        title: 'Refresh Failed',
        description: result.error || 'Failed to refresh data',
        variant: 'destructive',
      });
    }
    setIsRefreshing(false);
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'api': return <Zap className="h-4 w-4" />;
      case 'scrape': return <Globe className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" /> Success</Badge>;
      case 'partial':
        return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" /> Partial</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" /> Failed</Badge>;
      default:
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Market Data Sources</h2>
          <p className="text-muted-foreground">
            Manage and monitor market intelligence data feeds
          </p>
        </div>
        <Button 
          onClick={() => handleRefresh()} 
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh All
        </Button>
      </div>

      {/* Data Sources Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sources.map((source) => (
          <Card key={source.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getSourceIcon(source.source_type)}
                  <CardTitle className="text-base">{source.source_name}</CardTitle>
                </div>
                {getStatusBadge(source.last_fetch_status)}
              </div>
              <CardDescription className="text-xs">
                {source.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-1">
                {source.data_categories.map((cat) => (
                  <Badge key={cat} variant="outline" className="text-xs">
                    {cat}
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Reliability: {source.reliability_score}%</span>
                <span>{getDataAge(source.last_fetched_at)}</span>
              </div>

              <div className="flex gap-2">
                {source.source_url && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => window.open(source.source_url!, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View Source
                  </Button>
                )}
                {source.source_type !== 'document' && (
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => handleRefresh(source.source_name)}
                    disabled={isRefreshing}
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trade Statistics Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Turkey-UK Trade Statistics</CardTitle>
          <CardDescription>Latest bilateral trade data by sector</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Sector</th>
                  <th className="text-right py-2 font-medium">Exports to UK</th>
                  <th className="text-right py-2 font-medium">Imports from UK</th>
                  <th className="text-right py-2 font-medium">Growth YoY</th>
                  <th className="text-left py-2 font-medium">Top Products</th>
                  <th className="text-left py-2 font-medium">Source</th>
                </tr>
              </thead>
              <tbody>
                {tradeStats.map((stat) => (
                  <tr key={stat.id} className="border-b last:border-0">
                    <td className="py-2 font-medium">{stat.sector}</td>
                    <td className="py-2 text-right">
                      {formatTradeValue(stat.export_value, stat.currency)}
                    </td>
                    <td className="py-2 text-right">
                      {stat.import_value ? formatTradeValue(stat.import_value, stat.currency) : '-'}
                    </td>
                    <td className="py-2 text-right">
                      {stat.growth_rate_yoy ? (
                        <span className={stat.growth_rate_yoy > 0 ? 'text-green-600' : 'text-red-600'}>
                          {stat.growth_rate_yoy > 0 ? '+' : ''}{stat.growth_rate_yoy}%
                        </span>
                      ) : '-'}
                    </td>
                    <td className="py-2 max-w-xs truncate">
                      {stat.top_products?.slice(0, 3).join(', ')}
                    </td>
                    <td className="py-2 text-muted-foreground">
                      {stat.source_name || 'Unknown'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
