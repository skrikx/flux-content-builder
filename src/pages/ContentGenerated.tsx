import { useState, useEffect } from 'react';
import { FileText, MessageSquare, Image, Video, Copy, Share, Edit, MoreHorizontal, Plus } from 'lucide-react';
import { useContentStore } from '@/store/content';
import { useBrandStore } from '@/store/brands';
import { Link } from 'react-router-dom';

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
  const { items, loadContent } = useContentStore();
  const { activeBrand } = useBrandStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await loadContent(activeBrand?.id);
      } catch (error) {
        console.error('Failed to load content:', error);
        toast({
          title: 'Error loading content',
          description: 'Failed to load your generated content. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [activeBrand?.id, loadContent, toast]);

  // Group items by type
  const groupedContent = {
    captions: items.filter(item => item.type === 'caption'),
    posts: items.filter(item => item.type === 'post'),
    blogs: items.filter(item => item.type === 'blog'),
    images: items.filter(item => item.type === 'image'),
    videos: items.filter(item => item.type === 'video'),
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

  const ContentCard = ({ item, type }: { item: any; type: string }) => {
    const getContentText = () => {
      if (item.data?.markdown) return item.data.markdown;
      if (item.data?.content) return item.data.content;
      if (item.data?.text) return item.data.text;
      if (item.data?.description) return item.data.description;
      return 'No content available';
    };

    const getMetrics = () => {
      const content = getContentText();
      const wordCount = content.split(' ').length;
      const hashtags = (content.match(/#\w+/g) || []).length;
      return { wordCount, hashtags };
    };

    const metrics = getMetrics();
    
    return (
    <Card className="flux-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{item.title || `${type.charAt(0).toUpperCase() + type.slice(1)} Content`}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={getStatusColor(item.status)}>
                {item.status}
              </Badge>
              {item.data?.platform && (
                <Badge variant="outline" className="text-xs">
                  {item.data.platform}
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
              <DropdownMenuItem onClick={() => handleCopy(getContentText())}>
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
        <div className="mb-3">
          {type === 'images' ? (
            item.data?.url ? (
              <img src={item.data.url} alt={item.title} className="w-full h-32 object-cover rounded-md mb-2" />
            ) : (
              <div className="w-full h-32 bg-muted rounded-md mb-2 flex items-center justify-center">
                <Image className="w-8 h-8 text-muted-foreground" />
              </div>
            )
          ) : type === 'videos' ? (
            item.data?.url ? (
              <video src={item.data.url} className="w-full h-32 object-cover rounded-md mb-2" controls />
            ) : (
              <div className="w-full h-32 bg-muted rounded-md mb-2 flex items-center justify-center">
                <Video className="w-8 h-8 text-muted-foreground" />
              </div>
            )
          ) : (
            <p className="text-sm whitespace-pre-wrap line-clamp-3">{getContentText()}</p>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {type === 'captions' && (
            <>
              <span>{metrics.wordCount} words</span>
              <span>{metrics.hashtags} hashtags</span>
            </>
          )}
          {(type === 'posts' || type === 'blogs') && (
            <>
              <span>{metrics.wordCount} words</span>
              <span>{Math.ceil(metrics.wordCount / 200)} min read</span>
            </>
          )}
          {type === 'images' && (
            <>
              <span>{item.data?.dimensions || '1024x1024'}</span>
              <span>{item.data?.format || 'PNG'}</span>
            </>
          )}
          {type === 'videos' && (
            <>
              <span>{item.data?.duration || '0:30'}</span>
              <span>{item.data?.resolution || '1920x1080'}</span>
            </>
          )}
          <span>{new Date(item.createdAt || Date.now()).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
    );
  };

  const EmptyState = ({ type, icon: Icon }: { type: string; icon: any }) => (
    <Card className="flux-card text-center py-12">
      <CardContent>
        <Icon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No {type} generated yet</h3>
        <p className="text-muted-foreground mb-4">
          Start by generating content using AI or create your first {type.toLowerCase()} manually.
        </p>
        <Button asChild>
          <Link to="/">
            <Plus className="w-4 h-4 mr-2" />
            Generate Content
          </Link>
        </Button>
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
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="flux-card">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded animate-pulse" />
                      <div className="h-3 bg-muted rounded animate-pulse w-4/5" />
                      <div className="h-3 bg-muted rounded animate-pulse w-3/5" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : groupedContent.captions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupedContent.captions.map((caption) => (
                <ContentCard key={caption.id} item={caption} type="captions" />
              ))}
            </div>
          ) : (
            <EmptyState type="Captions" icon={MessageSquare} />
          )}
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <Card key={i} className="flux-card">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded animate-pulse" />
                      <div className="h-3 bg-muted rounded animate-pulse w-4/5" />
                      <div className="h-3 bg-muted rounded animate-pulse w-3/5" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : groupedContent.posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {groupedContent.posts.map((post) => (
                <ContentCard key={post.id} item={post} type="posts" />
              ))}
            </div>
          ) : (
            <EmptyState type="Posts" icon={FileText} />
          )}
        </TabsContent>

        <TabsContent value="blogs" className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <Card key={i} className="flux-card">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded animate-pulse" />
                      <div className="h-3 bg-muted rounded animate-pulse w-4/5" />
                      <div className="h-3 bg-muted rounded animate-pulse w-3/5" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : groupedContent.blogs.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {groupedContent.blogs.map((blog) => (
                <ContentCard key={blog.id} item={blog} type="blogs" />
              ))}
            </div>
          ) : (
            <EmptyState type="Blogs" icon={FileText} />
          )}
        </TabsContent>

        <TabsContent value="images" className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="flux-card">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-32 bg-muted rounded animate-pulse mb-2" />
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : groupedContent.images.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupedContent.images.map((image) => (
                <ContentCard key={image.id} item={image} type="images" />
              ))}
            </div>
          ) : (
            <EmptyState type="Images" icon={Image} />
          )}
        </TabsContent>

        <TabsContent value="videos" className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <Card key={i} className="flux-card">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-32 bg-muted rounded animate-pulse mb-2" />
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : groupedContent.videos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {groupedContent.videos.map((video) => (
                <ContentCard key={video.id} item={video} type="videos" />
              ))}
            </div>
          ) : (
            <EmptyState type="Videos" icon={Video} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}