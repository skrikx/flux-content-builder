import { useState } from 'react';
import { Search, TrendingUp, Users, Hash, Play, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function ContentResearch() {
  const [runningPanels, setRunningPanels] = useState<Set<string>>(new Set());

  const researchPanels = [
    {
      id: 'trends',
      title: 'Content Trends',
      description: 'Discover trending topics in your industry',
      icon: TrendingUp,
      color: 'text-accent',
      results: [
        { title: 'AI in Business Automation', engagement: '12.5k', trend: '+25%' },
        { title: 'Remote Work Solutions', engagement: '8.3k', trend: '+18%' },
        { title: 'Sustainable Technology', engagement: '6.7k', trend: '+32%' },
      ],
    },
    {
      id: 'competitors',
      title: 'Competitor Analysis',
      description: 'See what your competitors are doing',
      icon: Users,
      color: 'text-warning',
      results: [
        { company: 'TechCorp', topPost: 'New AI Features Launch', engagement: '15.2k' },
        { company: 'InnovateTech', topPost: 'Industry Report 2024', engagement: '9.8k' },
        { company: 'FutureSoft', topPost: 'Customer Success Story', engagement: '7.1k' },
      ],
    },
    {
      id: 'keywords',
      title: 'Keyword Research',
      description: 'Find high-performing keywords for your content',
      icon: Hash,
      color: 'text-success',
      results: [
        { keyword: 'AI automation', volume: '45k', difficulty: 'Medium', cpc: '$2.50' },
        { keyword: 'business intelligence', volume: '33k', difficulty: 'High', cpc: '$3.80' },
        { keyword: 'digital transformation', volume: '28k', difficulty: 'Medium', cpc: '$2.20' },
      ],
    },
  ];

  const runResearch = (panelId: string) => {
    setRunningPanels(prev => new Set([...prev, panelId]));
    
    // Simulate API call
    setTimeout(() => {
      setRunningPanels(prev => {
        const newSet = new Set(prev);
        newSet.delete(panelId);
        return newSet;
      });
    }, 3000);
  };

  const isRunning = (panelId: string) => runningPanels.has(panelId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Content Research</h1>
        <p className="text-muted-foreground">
          Discover trends, analyze competitors, and find the best keywords for your content strategy.
        </p>
      </div>

      {/* Research Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {researchPanels.map((panel) => (
          <Card key={panel.id} className="flux-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <panel.icon className={`w-5 h-5 ${panel.color}`} />
                {panel.title}
              </CardTitle>
              <CardDescription>{panel.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Run Button */}
              <Button
                onClick={() => runResearch(panel.id)}
                disabled={isRunning(panel.id)}
                className="w-full"
                variant="outline"
              >
                {isRunning(panel.id) ? (
                  <>
                    <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run Research
                  </>
                )}
              </Button>

              {/* Progress Bar */}
              {isRunning(panel.id) && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Analyzing data...</span>
                    <span>75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
              )}

              {/* Results */}
              <div className="space-y-3">
                {isRunning(panel.id) ? (
                  // Loading skeletons
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  ))
                ) : (
                  // Actual results
                  panel.results.map((result, index) => (
                    <div key={index} className="p-3 rounded-lg bg-muted/50 space-y-2">
                      {panel.id === 'trends' && (
                        <>
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-sm">{(result as any).title}</h4>
                            <Badge variant="secondary" className="text-xs">
                              {(result as any).trend}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {(result as any).engagement} interactions
                          </p>
                        </>
                      )}
                      
                      {panel.id === 'competitors' && (
                        <>
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-sm">{(result as any).company}</h4>
                            <span className="text-xs text-muted-foreground">
                              {(result as any).engagement}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {(result as any).topPost}
                          </p>
                        </>
                      )}
                      
                      {panel.id === 'keywords' && (
                        <>
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-sm">#{(result as any).keyword}</h4>
                            <Badge 
                              variant={(result as any).difficulty === 'High' ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {(result as any).difficulty}
                            </Badge>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{(result as any).volume} searches/mo</span>
                            <span>{(result as any).cpc} CPC</span>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Research Summary */}
      <Card className="flux-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Research Summary
          </CardTitle>
          <CardDescription>
            Key insights from your research sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent mb-1">25</div>
              <div className="text-sm text-muted-foreground">Trending Topics Found</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning mb-1">8</div>
              <div className="text-sm text-muted-foreground">Competitors Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success mb-1">156</div>
              <div className="text-sm text-muted-foreground">Keywords Researched</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}