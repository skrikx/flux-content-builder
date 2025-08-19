import { useState } from 'react';
import { Copy, Share2, Download, Calendar, MoreHorizontal, Eye } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { ContentItem } from '@/types';

interface ContentCardProps {
  item: ContentItem;
  onAddToQueue?: (item: ContentItem) => void;
  onExport?: (item: ContentItem, format: string) => void;
}

export function ContentCard({ item, onAddToQueue, onExport }: ContentCardProps) {
  const { toast } = useToast();
  const [showFullContent, setShowFullContent] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied to clipboard',
        description: 'Content has been copied to your clipboard.',
      });
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Unable to copy to clipboard.',
        variant: 'destructive',
      });
    }
  };

  const shareContent = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: item.text || item.content,
        });
      } catch (error) {
        // User cancelled or share failed
      }
    } else {
      copyToClipboard(item.text || item.content || '');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'caption':
        return '💬';
      case 'post':
        return '📝';
      case 'blog':
        return '📰';
      case 'image':
        return '🖼️';
      case 'video':
        return '🎥';
      default:
        return '📄';
    }
  };

  const content = item.text || item.content || '';
  const displayContent = showFullContent ? content : content.substring(0, 200);
  const needsTruncation = content.length > 200;

  return (
    <Card className="flux-panel">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getTypeIcon(item.type)}</span>
            <div>
              <CardTitle className="text-lg">{item.title}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs capitalize">
                  {item.type}
                </Badge>
                <Badge variant="outline" className="text-xs capitalize">
                  {item.status}
                </Badge>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => copyToClipboard(content)}>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </DropdownMenuItem>
              <DropdownMenuItem onClick={shareContent}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </DropdownMenuItem>
              {onAddToQueue && (
                <DropdownMenuItem onClick={() => onAddToQueue(item)}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Add to Queue
                </DropdownMenuItem>
              )}
              {onExport && (
                <>
                  <DropdownMenuItem onClick={() => onExport(item, 'txt')}>
                    <Download className="w-4 h-4 mr-2" />
                    Export as TXT
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onExport(item, 'md')}>
                    <Download className="w-4 h-4 mr-2" />
                    Export as MD
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {content && (
            <div className="space-y-2">
              <p className="text-sm whitespace-pre-wrap">
                {displayContent}
                {needsTruncation && !showFullContent && '...'}
              </p>
              {needsTruncation && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFullContent(!showFullContent)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {showFullContent ? 'Show Less' : 'Show More'}
                </Button>
              )}
            </div>
          )}

          {/* Assets */}
          {item.assets && item.assets.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Assets</h4>
              <div className="grid grid-cols-2 gap-2">
                {item.assets.map((asset, index) => (
                  <div key={index} className="border rounded-lg p-2">
                    {asset.url ? (
                      <img
                        src={asset.url}
                        alt={asset.prompt || 'Generated asset'}
                        className="w-full h-24 object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-24 bg-muted rounded flex items-center justify-center text-xs text-center p-2">
                        {asset.prompt || 'Asset placeholder'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hashtags */}
          {item.hashtags && item.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.hashtags.map((hashtag) => (
                <Badge key={hashtag} variant="outline" className="text-xs">
                  {hashtag}
                </Badge>
              ))}
            </div>
          )}

          {/* Metadata */}
          {item.metadata && (
            <div className="text-xs text-muted-foreground">
              {item.metadata.wordCount && (
                <span>{item.metadata.wordCount} words • </span>
              )}
              {item.metadata.estimatedReadTime && (
                <span>{item.metadata.estimatedReadTime} min read • </span>
              )}
              <span>Created {new Date(item.createdAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}