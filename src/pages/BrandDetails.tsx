import { useState } from 'react';
import { useBrandStore } from '@/store/brands';
import { Save, Plus, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function BrandDetails() {
  const { activeBrand, createBrand, refreshFromDb } = useBrandStore();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: activeBrand?.name || '',
    description: activeBrand?.description || '',
    industry: activeBrand?.industry || '',
    targetAudience: activeBrand?.targetAudience || '',
    toneOfVoice: activeBrand?.toneOfVoice || '',
    website: activeBrand?.website || '',
    twitter: activeBrand?.socialHandles?.twitter || '',
    instagram: activeBrand?.socialHandles?.instagram || '',
    linkedin: activeBrand?.socialHandles?.linkedin || '',
    facebook: activeBrand?.socialHandles?.facebook || '',
  });

  const [keywords, setKeywords] = useState<string[]>(activeBrand?.keywords || []);
  const [newKeyword, setNewKeyword] = useState('');
  const [brandColors, setBrandColors] = useState<string[]>(activeBrand?.brandColors || ['#3B82F6']);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  const addColor = () => {
    setBrandColors([...brandColors, '#000000']);
  };

  const updateColor = (index: number, color: string) => {
    const newColors = [...brandColors];
    newColors[index] = color;
    setBrandColors(newColors);
  };

  const removeColor = (index: number) => {
    setBrandColors(brandColors.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const brandData = {
      ...formData,
      keywords,
      brandColors,
      socialHandles: {
        twitter: formData.twitter,
        instagram: formData.instagram,
        linkedin: formData.linkedin,
        facebook: formData.facebook,
      },
    };

    try {
      if (activeBrand) {
        // For now, we only support creating new brands
        toast({
          title: 'Update Not Supported',
          description: 'Brand updating will be available soon. Please create a new brand.',
          variant: 'destructive',
        });
      } else {
        await createBrand(brandData);
        // force refresh from DB so placeholders disappear
        await refreshFromDb?.();
        toast({
          title: 'Brand Created',
          description: 'Your new brand profile has been created.',
        });
      }
    } catch (error: any) {
      const msg = error?.message || "Failed to save brand"
      toast({
        title: 'Brand save failed',
        description: msg,
        variant: 'destructive',
      });
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {activeBrand ? 'Edit Brand' : 'Create New Brand'}
        </h1>
        <p className="text-muted-foreground">
          Define your brand identity to generate better, more targeted content.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card className="flux-panel">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Core details about your brand
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Brand Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Your brand name"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of your brand..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="industry">Industry</Label>
              <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="food-beverage">Food & Beverage</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="fitness">Fitness & Wellness</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://yourbrand.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Audience & Voice */}
        <Card className="flux-panel">
          <CardHeader>
            <CardTitle>Audience & Voice</CardTitle>
            <CardDescription>
              Define your target audience and brand voice
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Textarea
                id="targetAudience"
                value={formData.targetAudience}
                onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                placeholder="Describe your ideal customers..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="toneOfVoice">Tone of Voice</Label>
              <Textarea
                id="toneOfVoice"
                value={formData.toneOfVoice}
                onChange={(e) => handleInputChange('toneOfVoice', e.target.value)}
                placeholder="Professional, friendly, innovative..."
                rows={2}
              />
            </div>

            {/* Keywords */}
            <div>
              <Label>Keywords</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="Add keyword"
                  onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                />
                <Button onClick={addKeyword} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="flex items-center gap-1">
                    {keyword}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => removeKeyword(keyword)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Brand Colors */}
        <Card className="flux-panel">
          <CardHeader>
            <CardTitle>Brand Colors</CardTitle>
            <CardDescription>
              Define your brand color palette
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {brandColors.map((color, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => updateColor(index, e.target.value)}
                    className="w-12 h-12 rounded border border-border cursor-pointer"
                  />
                  <Input
                    value={color}
                    onChange={(e) => updateColor(index, e.target.value)}
                    className="flex-1"
                  />
                  {brandColors.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeColor(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" onClick={addColor} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Color
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card className="flux-panel">
          <CardHeader>
            <CardTitle>Social Media</CardTitle>
            <CardDescription>
              Connect your social media accounts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="twitter">Twitter/X Handle</Label>
              <Input
                id="twitter"
                value={formData.twitter}
                onChange={(e) => handleInputChange('twitter', e.target.value)}
                placeholder="@yourbrand"
              />
            </div>

            <div>
              <Label htmlFor="instagram">Instagram Handle</Label>
              <Input
                id="instagram"
                value={formData.instagram}
                onChange={(e) => handleInputChange('instagram', e.target.value)}
                placeholder="@yourbrand"
              />
            </div>

            <div>
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                value={formData.linkedin}
                onChange={(e) => handleInputChange('linkedin', e.target.value)}
                placeholder="company/yourbrand"
              />
            </div>

            <div>
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                value={formData.facebook}
                onChange={(e) => handleInputChange('facebook', e.target.value)}
                placeholder="yourbrand"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg" className="flux-gradient-bg text-white hover:opacity-90 flux-transition">
          <Save className="w-4 h-4 mr-2" />
          {activeBrand ? 'Update Brand' : 'Create Brand'}
        </Button>
      </div>
    </div>
  );
}