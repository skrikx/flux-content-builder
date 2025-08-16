import { useState, useEffect } from 'react';
import { Calendar, Clock, MoreHorizontal, Plus } from 'lucide-react';
import { useContentStore } from '@/store/content';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function CalendarQueue() {
  const { queue, items, loadQueue, loadContent } = useContentStore();
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    loadQueue();
    loadContent();
  }, [loadQueue, loadContent]);

  // Get today's scheduled items
  const today = new Date();
  const todaysItems = queue.filter(item => {
    const itemDate = new Date(item.scheduledAt);
    return itemDate.toDateString() === today.toDateString();
  });

  // Get content details for queue items
  const queueWithContent = queue.map(queueItem => {
    const content = items.find(item => item.id === queueItem.contentId);
    return {
      ...queueItem,
      title: content?.title || 'Untitled Content',
      type: content?.type || 'post',
    };
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-success/10 text-success border-success/20';
      case 'draft': return 'bg-warning/10 text-warning border-warning/20';
      case 'published': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'blog': return '📝';
      case 'post': return '💬';
      case 'image': return '🖼️';
      case 'video': return '🎥';
      case 'email': return '📧';
      default: return '📄';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Content Calendar & Queue</h1>
          <p className="text-muted-foreground">
            Schedule and manage your content publishing timeline.
          </p>
        </div>
        <Button className="flux-gradient-bg text-white hover:opacity-90 flux-transition">
          <Plus className="w-4 h-4 mr-2" />
          Schedule Content
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <Card className="flux-panel lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Calendar View
            </CardTitle>
            <CardDescription>
              Visual timeline of your scheduled content
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Calendar Grid - Simplified for demo */}
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days with Events */}
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }, (_, i) => {
                  const day = i - 6; // Start from previous month
                  const isCurrentMonth = day > 0 && day <= 31;
                  const hasEvent = isCurrentMonth && [15, 16, 18, 22].includes(day);
                  
                  return (
                    <div
                      key={i}
                      className={`
                        h-20 p-1 border border-border rounded-lg cursor-pointer flux-transition
                        ${isCurrentMonth ? 'bg-background hover:bg-muted/50' : 'bg-muted/30 text-muted-foreground'}
                        ${hasEvent ? 'ring-2 ring-accent/20' : ''}
                      `}
                    >
                      <div className="text-sm font-medium mb-1">
                        {isCurrentMonth ? day : ''}
                      </div>
                      {hasEvent && (
                        <div className="space-y-1">
                          <div className="w-full h-1 bg-accent rounded" />
                          <div className="text-xs truncate">Blog post</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card className="flux-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Today's Schedule
            </CardTitle>
            <CardDescription>
              Content scheduled for today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todaysItems.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No content scheduled for today</p>
                </div>
              ) : (
                todaysItems.map((item) => {
                  const content = items.find(c => c.id === item.contentId);
                  return (
                    <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="text-lg">{getTypeIcon(content?.type || 'post')}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{content?.title || 'Untitled Content'}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {new Date(item.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {item.platform}
                          </Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-auto p-1">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Reschedule</DropdownMenuItem>
                          <DropdownMenuItem>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Queue */}
      <Card className="flux-panel">
        <CardHeader>
          <CardTitle>Content Queue</CardTitle>
          <CardDescription>
            All your scheduled and draft content in chronological order
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {queueWithContent.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No content in queue</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Generate some content and schedule it to see it here
                </p>
              </div>
            ) : (
              queueWithContent.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 flux-transition">
                  <div className="text-2xl">{getTypeIcon(item.type)}</div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium">{item.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span>{item.platform}</span>
                      <span>•</span>
                      <span>{new Date(item.scheduledAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{new Date(item.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  <Badge className={getStatusColor(item.status)}>
                    {item.status}
                  </Badge>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View</DropdownMenuItem>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Reschedule</DropdownMenuItem>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}