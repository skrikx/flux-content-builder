import { Sparkles, TrendingUp, Calendar, FileText, Users, BarChart3 } from 'lucide-react';
import { useBrandStore } from '@/store/brands';
import { useContentStore } from '@/store/content';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function Home() {
  const { activeBrand } = useBrandStore();
  const { ideas, items, queue } = useContentStore();

  const stats = [
    {
      title: 'Content Ideas',
      value: ideas.length,
      icon: Sparkles,
      description: 'Active ideas ready for generation',
      color: 'text-accent',
    },
    {
      title: 'Generated Content',
      value: items.length,
      icon: FileText,
      description: 'Pieces of content created',
      color: 'text-success',
    },
    {
      title: 'Scheduled Posts',
      value: queue.length,
      icon: Calendar,
      description: 'Posts in your content calendar',
      color: 'text-warning',
    },
    {
      title: 'Brand Reach',
      value: '12.5K',
      icon: Users,
      description: 'Estimated monthly reach',
      color: 'text-primary',
    },
  ];

  const recentActivity = [
    { action: 'Generated blog post', target: 'AI Revolution in Business', time: '2 hours ago' },
    { action: 'Scheduled social post', target: 'Product Launch Announcement', time: '4 hours ago' },
    { action: 'Updated brand profile', target: 'TechFlow Solutions', time: '1 day ago' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            Ready to create amazing content for{' '}
            <span className="font-semibold text-foreground">
              {activeBrand?.name || 'your brand'}
            </span>
            ?
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" size="lg">
            <TrendingUp className="w-4 h-4 mr-2" />
            View Analytics
          </Button>
          <Button size="lg" className="flux-gradient-bg text-white hover:opacity-90 flux-transition">
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Content
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="flux-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Pipeline */}
        <Card className="flux-panel lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Content Pipeline
            </CardTitle>
            <CardDescription>
              Track your content creation progress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Ideas to Content</span>
                <span>75%</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Content to Schedule</span>
                <span>60%</span>
              </div>
              <Progress value={60} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Weekly Goal</span>
                <span>85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="flux-panel">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest content actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{activity.target}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                  {index < recentActivity.length - 1 && (
                    <div className="border-b border-border my-2" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="flux-panel">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Jump into your most common tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Sparkles className="w-6 h-6" />
              <span>New Content Idea</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Calendar className="w-6 h-6" />
              <span>Schedule Post</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <TrendingUp className="w-6 h-6" />
              <span>Research Trends</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}