import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PartnerCard } from "@/components/PartnerCard";
import { Search, Filter, TrendingUp } from "lucide-react";

interface Partner {
  id: string;
  name: string;
  description: string;
  category: string;
  specialties: string[];
  website_url: string | null;
  contact_email: string | null;
  phone: string | null;
  location: string | null;
  logo_url: string | null;
  verification_status: string;
  verified_at: string | null;
  created_at: string;
}

interface SmartPartnerFilterProps {
  partners: Partner[];
  businessContext?: {
    industry?: string;
    company_size?: string;
    business_description?: string;
    analysis_scores?: any;
  };
}

interface PartnerWithScore extends Partner {
  relevanceScore: number;
  matchReasons: string[];
}

export function SmartPartnerFilter({ partners, businessContext }: SmartPartnerFilterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showOnlyRelevant, setShowOnlyRelevant] = useState(false);

  // Smart scoring algorithm for partner relevance
  const scoredPartners = useMemo(() => {
    return partners.map(partner => {
      let score = 0;
      const reasons: string[] = [];

      // Base score for all verified partners
      score += 10;

      // Business context scoring
      if (businessContext) {
        // Industry matching
        if (businessContext.industry) {
          const industryLower = businessContext.industry.toLowerCase();
          const partnerText = `${partner.description} ${partner.specialties?.join(' ')}`.toLowerCase();
          
          if (partnerText.includes(industryLower)) {
            score += 25;
            reasons.push(`${businessContext.industry} industry expertise`);
          }

          // Industry-specific category priorities
          const industryPriorities = getIndustryPriorities(industryLower);
          if (industryPriorities.includes(partner.category)) {
            score += 15;
            reasons.push(`High priority for ${businessContext.industry} businesses`);
          }
        }

        // Company size matching
        if (businessContext.company_size) {
          const sizeScore = calculateSizeMatch(businessContext.company_size, partner);
          score += sizeScore.score;
          if (sizeScore.reason) reasons.push(sizeScore.reason);
        }

        // Business description keyword matching
        if (businessContext.business_description) {
          const keywordScore = calculateKeywordMatch(businessContext.business_description, partner);
          score += keywordScore.score;
          if (keywordScore.reason) reasons.push(keywordScore.reason);
        }

        // Analysis scores-based urgency
        if (businessContext.analysis_scores) {
          const urgencyScore = calculateUrgencyMatch(businessContext.analysis_scores, partner.category);
          score += urgencyScore.score;
          if (urgencyScore.reason) reasons.push(urgencyScore.reason);
        }
      }

      // Specialty richness bonus
      if (partner.specialties && partner.specialties.length > 3) {
        score += 5;
        reasons.push('Comprehensive service portfolio');
      }

      // Location preference (UK-based)
      if (partner.location?.toLowerCase().includes('uk') || 
          partner.location?.toLowerCase().includes('london') ||
          partner.location?.toLowerCase().includes('england')) {
        score += 8;
        reasons.push('UK-based with local market knowledge');
      }

      return {
        ...partner,
        relevanceScore: score,
        matchReasons: reasons
      } as PartnerWithScore;
    }).sort((a, b) => b.relevanceScore - a.relevanceScore);
  }, [partners, businessContext]);

  // Filter partners based on search and category
  const filteredPartners = useMemo(() => {
    let filtered = scoredPartners;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(partner =>
        partner.name.toLowerCase().includes(query) ||
        partner.description.toLowerCase().includes(query) ||
        partner.specialties?.some(s => s.toLowerCase().includes(query)) ||
        partner.category.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(partner => partner.category === selectedCategory);
    }

    // Relevance filter
    if (showOnlyRelevant) {
      filtered = filtered.filter(partner => partner.relevanceScore > 20);
    }

    return filtered;
  }, [scoredPartners, searchQuery, selectedCategory, showOnlyRelevant]);

  // Get unique categories
  const categories = useMemo(() => {
    return [...new Set(partners.map(p => p.category))];
  }, [partners]);

  return (
    <div className="space-y-6">
      {/* Smart Recommendations Banner */}
      {businessContext && (
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-primary mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-primary mb-2">Smart Recommendations</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Based on your {businessContext.industry} business profile, we've prioritized the most relevant partners for your needs.
                </p>
                <div className="flex flex-wrap gap-2">
                  {scoredPartners.slice(0, 3).map(partner => (
                    <Badge key={partner.id} variant="secondary" className="text-xs">
                      {partner.name} ({partner.relevanceScore}% match)
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search partners by name, specialty, or service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {businessContext && (
          <Button
            variant={showOnlyRelevant ? "default" : "outline"}
            onClick={() => setShowOnlyRelevant(!showOnlyRelevant)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Most Relevant
          </Button>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredPartners.length} of {partners.length} partners
          {businessContext && showOnlyRelevant && " (filtered by relevance)"}
        </p>
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchQuery("")}
          >
            Clear search
          </Button>
        )}
      </div>

      {/* Partner Grid */}
      {filteredPartners.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No partners found</h3>
            <p className="text-muted-foreground text-center">
              Try adjusting your search terms or filters to find relevant partners.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPartners.map((partner) => (
            <div key={partner.id} className="relative">
              <PartnerCard partner={partner} />
              {businessContext && partner.relevanceScore > 30 && (
                <div className="absolute -top-2 -right-2">
                  <Badge className="bg-primary text-primary-foreground text-xs">
                    {Math.round(partner.relevanceScore)}% match
                  </Badge>
                </div>
              )}
              {businessContext && partner.matchReasons.length > 0 && (
                <div className="mt-2 p-2 bg-muted/50 rounded-md">
                  <p className="text-xs text-muted-foreground">
                    <strong>Why recommended:</strong> {partner.matchReasons.slice(0, 2).join(', ')}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper functions
function getIndustryPriorities(industry: string): string[] {
  const priorities: Record<string, string[]> = {
    'healthcare': ['compliance', 'legal', 'consulting'],
    'medical': ['compliance', 'legal', 'consulting'], 
    'pharmaceutical': ['compliance', 'legal', 'consulting'],
    'finance': ['legal', 'compliance', 'accounting'],
    'fintech': ['legal', 'compliance', 'accounting'],
    'technology': ['legal', 'marketing', 'consulting'],
    'software': ['legal', 'marketing', 'consulting'],
    'retail': ['logistics', 'marketing', 'accounting'],
    'e-commerce': ['logistics', 'marketing', 'accounting'],
    'manufacturing': ['logistics', 'compliance', 'legal'],
    'food': ['compliance', 'legal', 'logistics'],
    'automotive': ['compliance', 'legal', 'logistics']
  };

  for (const [key, cats] of Object.entries(priorities)) {
    if (industry.includes(key)) {
      return cats;
    }
  }
  return [];
}

function calculateSizeMatch(companySize: string, partner: Partner): { score: number; reason?: string } {
  const partnerDesc = partner.description.toLowerCase();
  const sizeLower = companySize.toLowerCase();

  if (partnerDesc.includes('sme') || partnerDesc.includes('small business')) {
    if (sizeLower.includes('small') || sizeLower === '1-10' || sizeLower === '11-50') {
      return { score: 10, reason: 'Specializes in small businesses' };
    }
  }

  if (partnerDesc.includes('enterprise') || partnerDesc.includes('large company')) {
    if (sizeLower.includes('large') || sizeLower === '200+') {
      return { score: 10, reason: 'Enterprise-focused services' };
    }
  }

  return { score: 0 };
}

function calculateKeywordMatch(businessDescription: string, partner: Partner): { score: number; reason?: string } {
  const businessWords = businessDescription.toLowerCase().split(/\s+/);
  const partnerText = `${partner.description} ${partner.specialties?.join(' ')}`.toLowerCase();
  
  let matches = 0;
  const importantWords = businessWords.filter(word => word.length > 4);
  
  importantWords.forEach(word => {
    if (partnerText.includes(word)) {
      matches++;
    }
  });

  if (matches > 2) {
    return { score: 8, reason: 'Strong business alignment' };
  } else if (matches > 0) {
    return { score: 4, reason: 'Business relevance' };
  }

  return { score: 0 };
}

function calculateUrgencyMatch(analysisScores: any, category: string): { score: number; reason?: string } {
  if (!analysisScores.scoreBreakdown) return { score: 0 };

  const scores = analysisScores.scoreBreakdown;
  
  switch (category) {
    case 'legal':
      if (scores.regulatoryCompatibility < 50) {
        return { score: 20, reason: 'Critical legal gaps identified' };
      } else if (scores.regulatoryCompatibility < 70) {
        return { score: 10, reason: 'Legal improvements needed' };
      }
      break;
      
    case 'accounting':
      if (scores.investmentReadiness < 60) {
        return { score: 15, reason: 'Financial structuring required' };
      }
      break;
      
    case 'marketing':
      if (scores.digitalReadiness < 60 || scores.productMarketFit < 60) {
        return { score: 12, reason: 'Marketing optimization needed' };
      }
      break;
  }

  return { score: 0 };
}