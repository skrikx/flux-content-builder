import { useState } from 'react';
import { Loader2, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useBrandStore } from '@/store/brands';

interface BrandModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BrandModal({ open, onOpenChange }: BrandModalProps) {
  const { toast } = useToast();
  const { createBrand } = useBrandStore();
  
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    voice: '',
    tone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: 'Brand name required',
        description: 'Please enter a brand name.',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);
    
    try {
      await createBrand({
        name: formData.name.trim(),
        description: formData.voice.trim() || 'A dynamic brand',
        industry: 'General',
        targetAudience: 'General audience',
        toneOfVoice: formData.tone.trim() || 'Professional',
        keywords: [],
        brandColors: [],
        socialHandles: {},
      });

      toast({
        title: 'Brand created successfully!',
        description: `${formData.name} has been added to your brands.`,
      });

      setFormData({ name: '', voice: '', tone: '' });
      onOpenChange(false);
    } catch (error) {
      console.error('Brand creation failed:', error);
      toast({
        title: 'Brand creation failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Brand
          </DialogTitle>
          <DialogDescription>
            Set up a new brand profile to generate tailored content.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="brand-name">Brand Name*</Label>
            <Input
              id="brand-name"
              placeholder="e.g., TechFlow Solutions"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              disabled={isCreating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand-voice">Brand Voice</Label>
            <Input
              id="brand-voice"
              placeholder="e.g., Professional, Friendly, Authoritative"
              value={formData.voice}
              onChange={(e) => setFormData(prev => ({ ...prev, voice: e.target.value }))}
              disabled={isCreating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand-tone">Brand Tone</Label>
            <Textarea
              id="brand-tone"
              placeholder="Describe the personality and communication style of your brand..."
              value={formData.tone}
              onChange={(e) => setFormData(prev => ({ ...prev, tone: e.target.value }))}
              disabled={isCreating}
              rows={3}
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Brand
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}