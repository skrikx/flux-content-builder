import { useState } from 'react';
import { FileText, MessageSquare, Image, Video, Mail, Copy, Share, Edit, MoreHorizontal } from 'lucide-react';
import { useContentStore } from '@/store/content';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

export default function ContentGenerated() {
  const { items } = useContentStore();
  const { toast } = useToast();

  // Mock generated content data
  const generatedContent = {
    captions: [
      {
        id: '1',
        title: '🚀 AI Revolution Post',
        content: '🚀 The AI revolution is here! Businesses leveraging artificial intelligence are seeing 40% faster growth. Are you ready to transform your operations?\n\n#AI #Innovation #BusinessGrowth #Technology #DigitalTransformation',
        platform: 'LinkedIn',
        wordCount: 32,
        hashtags: 5,
        status: 'approved',
        createdAt: new Date('2024-08-14T10:30:00'),
      },
      {
        id: '2',
        title: '💡 Quick Productivity Tip',
        content: '💡 Quick tip: Use AI tools to automate your daily tasks and save 2+ hours every day!\n\nWhat\'s your favorite productivity hack? 👇\n\n#Productivity #AI #WorkSmart #Automation',
        platform: 'Twitter',
        wordCount: 25,
        hashtags: 4,
        status: 'draft',
        createdAt: new Date('2024-08-14T09:15:00'),
      },
      {
        id: '3',
        title: '📊 Industry Insights',
        content: '📊 Did you know? 85% of businesses plan to increase their AI investment in 2024.\n\nKey areas of focus:\n✅ Customer service automation\n✅ Data analytics\n✅ Process optimization\n\n#BusinessIntelligence #AI #Innovation',
        platform: 'Instagram',
        wordCount: 38,
        hashtags: 3,
        status: 'review',
        createdAt: new Date('2024-08-14T08:45:00'),
      },
    ],
    posts: [
      {
        id: '4',
        title: 'The Future of Remote Work',
        content: 'Remote work is evolving rapidly with AI-powered tools leading the charge. Companies adopting smart collaboration platforms are seeing 60% improvement in team productivity...',
        platform: 'LinkedIn',
        wordCount: 150,
        readTime: '1 min',
        status: 'approved',
        createdAt: new Date('2024-08-13T16:20:00'),
      },
      {
        id: '5',
        title: 'Customer Success Story: TechCorp',
        content: 'How TechCorp increased their operational efficiency by 45% using our AI-powered solutions. A deep dive into their digital transformation journey...',
        platform: 'Blog',
        wordCount: 200,
        readTime: '2 min',
        status: 'draft',
        createdAt: new Date('2024-08-13T14:10:00'),
      },
    ],
    blogs: [
      {
        id: '6',
        title: 'The Complete Guide to AI in Business Operations',
        content: 'Artificial intelligence is revolutionizing how businesses operate, from customer service to supply chain management. This comprehensive guide explores...',
        wordCount: 1200,
        readTime: '5 min',
        status: 'approved',
        createdAt: new Date('2024-08-12T11:30:00'),
      },
      {
        id: '7',
        title: 'Measuring ROI on AI Implementation',
        content: 'Understanding the return on investment for AI initiatives is crucial for business success. Here\'s how to measure and optimize your AI ROI...',
        wordCount: 800,
        readTime: '3 min',
        status: 'review',
        createdAt: new Date('2024-08-11T13:45:00'),
      },
    ],
    images: [
      {
        id: '8',
        title: 'AI Statistics Infographic',
        description: 'Visual representation of AI adoption statistics across industries',
        dimensions: '1080x1080',
        format: 'PNG',
        status: 'approved',
        createdAt: new Date('2024-08-14T12:00:00'),
      },
      {
        id: '9',
        title: 'Product Feature Showcase',
        description: 'Highlighting new AI features in our platform',
        dimensions: '1200x628',
        format: 'JPEG',
        status: 'draft',
        createdAt: new Date('2024-08-13T15:30:00'),
      },
    ],
    videos: [
      {
        id: '10',
        title: 'AI Demo: 60 Second Overview',
        description: 'Quick overview of our AI platform capabilities',
        duration: '0:58',
        format: 'MP4',
        resolution: '1920x1080',
        status: 'review',
        createdAt: new Date('2024-08-12T14:20:00'),
      },
    ],
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-success/10 text-success border-success/20';
      case 'review': return 'bg-warning/10 text-warning border-warning/20';
      case 'draft': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: 'Copied to clipboard',
      description: 'Content has been copied to your clipboard.',
    });
  };

  const ContentCard = ({ item, type }: { item: any; type: string }) => (
    <Card className="flux-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{item.title}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={getStatusColor(item.status)}>
                {item.status}
              </Badge>
              {item.platform && (
                <Badge variant="outline" className="text-xs">
                  {item.platform}
                </Badge>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCopy(item.content || item.description)}>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share className="w-4 h-4 mr-2" />
                Share
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        {type === 'captions' && (
          <>
            <p className="text-sm mb-3 whitespace-pre-wrap">{item.content}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{item.wordCount} words</span>
              <span>{item.hashtags} hashtags</span>
              <span>{item.createdAt.toLocaleDateString()}</span>
            </div>
          </>
        )}
        
        {(type === 'posts' || type === 'blogs') && (
          <>
            <p className="text-sm mb-3">{item.content}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{item.wordCount} words</span>
              <span>{item.readTime} read</span>
              <span>{item.createdAt.toLocaleDateString()}</span>
            </div>
          </>
        )}
        
        {type === 'images' && (
          <>
            <p className="text-sm mb-3">{item.description}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{item.dimensions}</span>
              <span>{item.format}</span>
              <span>{item.createdAt.toLocaleDateString()}</span>
            </div>
          </>
        )}
        
        {type === 'videos' && (
          <>
            <p className="text-sm mb-3">{item.description}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{item.duration}</span>
              <span>{item.resolution}</span>
              <span>{item.createdAt.toLocaleDateString()}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Generated Content</h1>
        <p className="text-muted-foreground">
          Browse and manage all your AI-generated content across different formats.
        </p>
      </div>

      <Tabs defaultValue="captions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="captions" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Captions
          </TabsTrigger>
          <TabsTrigger value="posts" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Posts
          </TabsTrigger>
          <TabsTrigger value="blogs" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Blogs
          </TabsTrigger>
          <TabsTrigger value="images" className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            Images
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            Videos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="captions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generatedContent.captions.map((caption) => (
              <ContentCard key={caption.id} item={caption} type="captions" />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {generatedContent.posts.map((post) => (
              <ContentCard key={post.id} item={post} type="posts" />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="blogs" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {generatedContent.blogs.map((blog) => (
              <ContentCard key={blog.id} item={blog} type="blogs" />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="images" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generatedContent.images.map((image) => (
              <ContentCard key={image.id} item={image} type="images" />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="videos" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {generatedContent.videos.map((video) => (
              <ContentCard key={video.id} item={video} type="videos" />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}