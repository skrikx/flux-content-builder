import { useState } from 'react';
import { Loader2, Sparkles, Calendar, Eye } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useBrandStore } from '@/store/brands';
import { useContentStore } from '@/store/content';
import { useProviderStore } from '@/store/providers';
import { batchGenerate } from '@/lib/generate';
import { createSchedule } from '@/lib/schedule';

interface GenerateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GenerateModal({ open, onOpenChange }: GenerateModalProps) {
  const { toast } = useToast();
  const { activeBrand } = useBrandStore();
  const { addItem } = useContentStore();
  const { config } = useProviderStore();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<Record<string, boolean>>({
    caption: true,
    post: true,
    blog: false,
    image: true,
    video: false,
  });
  const [counts, setCounts] = useState<Record<string, number>>({
    caption: 5,
    post: 3,
    blog: 1,
    image: 4,
    video: 1,
  });
  const [autoSchedule, setAutoSchedule] = useState(false);

  const handleGenerate = async () => {
    if (!activeBrand) {
      toast({
        title: 'No brand selected',
        description: 'Please select a brand first.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const types = Object.entries(selectedTypes)
        .filter(([, selected]) => selected)
        .map(([type]) => type as 'caption' | 'post' | 'blog' | 'image' | 'video');

      if (types.length === 0) {
        toast({
          title: 'No content types selected',
          description: 'Please select at least one content type.',
          variant: 'destructive',
        });
        return;
      }

      const maxCount = Math.max(...types.map(type => counts[type]));
      const items = await batchGenerate(types, maxCount, activeBrand.id, config);

      // Add items to store
      const createdItems = items;
      items.forEach(item => addItem(item));

      // Auto-schedule if enabled
      if (autoSchedule) {
        // schedule everything 2 minutes from now by default
        const when = new Date(Date.now() + 120000).toISOString()
        for (const it of createdItems) {
          try {
            await createSchedule(it.id, activeBrand.id, when)
          } catch (e) {
            console.warn('Auto schedule failed for', it.id, e)
          }
        }
      }

      toast({
        title: 'Content generated successfully!',
        description: `Generated ${items.length} content items.${autoSchedule ? ' Auto-scheduled for 2 minutes from now.' : ''}`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Generation failed:', error);
      toast({
        title: 'Generation failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const contentTypes = [
    { key: 'caption', label: 'Captions', description: 'Short social media captions' },
    { key: 'post', label: 'Posts', description: 'Longer social media posts' },
    { key: 'blog', label: 'Blog Articles', description: 'In-depth blog content' },
    { key: 'image', label: 'Images', description: 'Visual content and graphics' },
    { key: 'video', label: 'Videos', description: 'Video scripts and prompts' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Generate Content
          </DialogTitle>
          <DialogDescription>
            Create AI-powered content for your brand across multiple formats.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Content Types */}
          <div>
            <Label className="text-base font-medium">Content Types</Label>
            <div className="grid grid-cols-1 gap-4 mt-3">
              {contentTypes.map(type => (
                <div key={type.key} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={type.key}
                      checked={selectedTypes[type.key]}
                      onCheckedChange={(checked) =>
                        setSelectedTypes(prev => ({ ...prev, [type.key]: !!checked }))
                      }
                    />
                    <div>
                      <Label htmlFor={type.key} className="font-medium">
                        {type.label}
                      </Label>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor={`${type.key}-count`} className="text-sm">
                      Count:
                    </Label>
                    <Input
                      id={`${type.key}-count`}
                      type="number"
                      min="1"
                      max="10"
                      value={counts[type.key]}
                      onChange={(e) =>
                        setCounts(prev => ({ ...prev, [type.key]: parseInt(e.target.value) || 1 }))
                      }
                      className="w-16"
                      disabled={!selectedTypes[type.key]}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="auto-schedule"
                checked={autoSchedule}
                onCheckedChange={(checked) => setAutoSchedule(!!checked)}
              />
              <Label htmlFor="auto-schedule" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Auto-schedule content across next 30 days
              </Label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isGenerating}>
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" disabled={isGenerating}>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Content
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}