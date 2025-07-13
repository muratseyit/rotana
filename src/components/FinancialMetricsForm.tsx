import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, TrendingUp, PieChart, Calculator } from "lucide-react";

export interface FinancialMetrics {
  annualRevenue: number;
  grossMargin: number;
  netProfit: number;
  monthlyGrowthRate: number;
  cashPosition: number;
  fundingStage: string;
  exportPercentage: number;
  avgOrderValue: number;
  customerAcquisitionCost: number;
  customerLifetimeValue: number;
}

interface FinancialMetricsFormProps {
  onSubmit: (metrics: FinancialMetrics) => void;
  initialData?: Partial<FinancialMetrics>;
  isLoading?: boolean;
}

const fundingStages = [
  "Bootstrapped",
  "Pre-seed", 
  "Seed",
  "Series A",
  "Series B+",
  "Profitable/Self-sustaining"
];

export function FinancialMetricsForm({ onSubmit, initialData, isLoading }: FinancialMetricsFormProps) {
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    annualRevenue: initialData?.annualRevenue || 0,
    grossMargin: initialData?.grossMargin || 0,
    netProfit: initialData?.netProfit || 0,
    monthlyGrowthRate: initialData?.monthlyGrowthRate || 0,
    cashPosition: initialData?.cashPosition || 0,
    fundingStage: initialData?.fundingStage || "",
    exportPercentage: initialData?.exportPercentage || 0,
    avgOrderValue: initialData?.avgOrderValue || 0,
    customerAcquisitionCost: initialData?.customerAcquisitionCost || 0,
    customerLifetimeValue: initialData?.customerLifetimeValue || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(metrics);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Financial Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="annualRevenue" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Annual Revenue (USD)
              </Label>
              <Input
                id="annualRevenue"
                type="number"
                placeholder="500000"
                value={metrics.annualRevenue || ""}
                onChange={(e) => setMetrics(prev => ({ ...prev, annualRevenue: Number(e.target.value) }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="grossMargin">Gross Margin (%)</Label>
              <Input
                id="grossMargin"
                type="number"
                placeholder="60"
                min="0"
                max="100"
                value={metrics.grossMargin || ""}
                onChange={(e) => setMetrics(prev => ({ ...prev, grossMargin: Number(e.target.value) }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="netProfit">Net Profit (USD)</Label>
              <Input
                id="netProfit"
                type="number"
                placeholder="50000"
                value={metrics.netProfit || ""}
                onChange={(e) => setMetrics(prev => ({ ...prev, netProfit: Number(e.target.value) }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyGrowthRate">Monthly Growth Rate (%)</Label>
              <Input
                id="monthlyGrowthRate"
                type="number"
                placeholder="5"
                step="0.1"
                value={metrics.monthlyGrowthRate || ""}
                onChange={(e) => setMetrics(prev => ({ ...prev, monthlyGrowthRate: Number(e.target.value) }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cashPosition">Cash Position (USD)</Label>
              <Input
                id="cashPosition"
                type="number"
                placeholder="100000"
                value={metrics.cashPosition || ""}
                onChange={(e) => setMetrics(prev => ({ ...prev, cashPosition: Number(e.target.value) }))}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                Funding Stage
              </Label>
              <Select 
                value={metrics.fundingStage} 
                onValueChange={(value) => setMetrics(prev => ({ ...prev, fundingStage: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select funding stage" />
                </SelectTrigger>
                <SelectContent>
                  {fundingStages.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {stage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exportPercentage">Current Export % of Revenue</Label>
              <Input
                id="exportPercentage"
                type="number"
                placeholder="20"
                min="0"
                max="100"
                value={metrics.exportPercentage || ""}
                onChange={(e) => setMetrics(prev => ({ ...prev, exportPercentage: Number(e.target.value) }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avgOrderValue">Average Order Value (USD)</Label>
              <Input
                id="avgOrderValue"
                type="number"
                placeholder="150"
                value={metrics.avgOrderValue || ""}
                onChange={(e) => setMetrics(prev => ({ ...prev, avgOrderValue: Number(e.target.value) }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerAcquisitionCost" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Customer Acquisition Cost (USD)
              </Label>
              <Input
                id="customerAcquisitionCost"
                type="number"
                placeholder="25"
                value={metrics.customerAcquisitionCost || ""}
                onChange={(e) => setMetrics(prev => ({ ...prev, customerAcquisitionCost: Number(e.target.value) }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerLifetimeValue">Customer Lifetime Value (USD)</Label>
              <Input
                id="customerLifetimeValue"
                type="number"
                placeholder="500"
                value={metrics.customerLifetimeValue || ""}
                onChange={(e) => setMetrics(prev => ({ ...prev, customerLifetimeValue: Number(e.target.value) }))}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Financial Metrics"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}