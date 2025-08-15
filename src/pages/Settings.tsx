import { useState } from 'react';
import { Key, TestTube, Shield, Bell, Palette, Globe } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    anthropic: '',
    stability: '',
  });

  const [notifications, setNotifications] = useState({
    contentGenerated: true,
    scheduleReminders: true,
    weeklyReports: false,
    systemUpdates: true,
  });

  const [features, setFeatures] = useState({
    betaFeatures: false,
    advancedAnalytics: true,
    autoScheduling: true,
    aiSuggestions: true,
  });

  const handleApiKeyChange = (provider: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [provider]: value }));
  };

  const testConnection = async (provider: string) => {
    toast({
      title: 'Testing connection...',
      description: `Testing ${provider} API connection.`,
    });

    // Simulate API test
    setTimeout(() => {
      toast({
        title: 'Connection successful',
        description: `${provider} API is working correctly.`,
      });
    }, 2000);
  };

  const saveSettings = () => {
    toast({
      title: 'Settings saved',
      description: 'Your preferences have been updated successfully.',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Configure your FluxContent experience and integrations.
        </p>
      </div>

      <Tabs defaultValue="providers" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="providers" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            Providers
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <TestTube className="w-4 h-4" />
            Features
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* API Providers */}
        <TabsContent value="providers" className="space-y-6">
          <Card className="flux-panel">
            <CardHeader>
              <CardTitle>AI Provider Configuration</CardTitle>
              <CardDescription>
                Connect your AI service providers to enable content generation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* OpenAI */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">AI</span>
                    </div>
                    <div>
                      <Label className="font-medium">OpenAI</Label>
                      <p className="text-sm text-muted-foreground">GPT models for text generation</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                    Connected
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    placeholder="sk-..."
                    value={apiKeys.openai}
                    onChange={(e) => handleApiKeyChange('openai', e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={() => testConnection('OpenAI')}
                    disabled
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    Test
                  </Button>
                </div>
              </div>

              {/* Anthropic */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">C</span>
                    </div>
                    <div>
                      <Label className="font-medium">Anthropic Claude</Label>
                      <p className="text-sm text-muted-foreground">Advanced reasoning and analysis</p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    Not Connected
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    placeholder="sk-ant-..."
                    value={apiKeys.anthropic}
                    onChange={(e) => handleApiKeyChange('anthropic', e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={() => testConnection('Anthropic')}
                    disabled
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    Test
                  </Button>
                </div>
              </div>

              {/* Stability AI */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">S</span>
                    </div>
                    <div>
                      <Label className="font-medium">Stability AI</Label>
                      <p className="text-sm text-muted-foreground">Image generation and editing</p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    Not Connected
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    placeholder="sk-..."
                    value={apiKeys.stability}
                    onChange={(e) => handleApiKeyChange('stability', e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={() => testConnection('Stability AI')}
                    disabled
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    Test
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="flux-panel">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how and when you want to be notified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Content Generated</Label>
                  <p className="text-sm text-muted-foreground">Get notified when AI finishes generating content</p>
                </div>
                <Switch
                  checked={notifications.contentGenerated}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, contentGenerated: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Schedule Reminders</Label>
                  <p className="text-sm text-muted-foreground">Reminders before scheduled posts go live</p>
                </div>
                <Switch
                  checked={notifications.scheduleReminders}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, scheduleReminders: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Weekly Reports</Label>
                  <p className="text-sm text-muted-foreground">Summary of your content performance</p>
                </div>
                <Switch
                  checked={notifications.weeklyReports}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, weeklyReports: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">System Updates</Label>
                  <p className="text-sm text-muted-foreground">Important updates and maintenance notices</p>
                </div>
                <Switch
                  checked={notifications.systemUpdates}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, systemUpdates: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features */}
        <TabsContent value="features" className="space-y-6">
          <Card className="flux-panel">
            <CardHeader>
              <CardTitle>Feature Flags</CardTitle>
              <CardDescription>
                Enable or disable experimental and advanced features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Beta Features</Label>
                  <p className="text-sm text-muted-foreground">Access to experimental features before general release</p>
                </div>
                <Switch
                  checked={features.betaFeatures}
                  onCheckedChange={(checked) => 
                    setFeatures(prev => ({ ...prev, betaFeatures: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Advanced Analytics</Label>
                  <p className="text-sm text-muted-foreground">Detailed performance metrics and insights</p>
                </div>
                <Switch
                  checked={features.advancedAnalytics}
                  onCheckedChange={(checked) => 
                    setFeatures(prev => ({ ...prev, advancedAnalytics: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Auto-Scheduling</Label>
                  <p className="text-sm text-muted-foreground">Automatically schedule content at optimal times</p>
                </div>
                <Switch
                  checked={features.autoScheduling}
                  onCheckedChange={(checked) => 
                    setFeatures(prev => ({ ...prev, autoScheduling: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">AI Suggestions</Label>
                  <p className="text-sm text-muted-foreground">Get AI-powered suggestions for content improvement</p>
                </div>
                <Switch
                  checked={features.aiSuggestions}
                  onCheckedChange={(checked) => 
                    setFeatures(prev => ({ ...prev, aiSuggestions: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <Card className="flux-panel">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security and privacy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="font-medium">Change Password</Label>
                <p className="text-sm text-muted-foreground mb-3">Update your account password</p>
                <div className="space-y-3">
                  <Input type="password" placeholder="Current password" />
                  <Input type="password" placeholder="New password" />
                  <Input type="password" placeholder="Confirm new password" />
                  <Button variant="outline" disabled>
                    Update Password
                  </Button>
                </div>
              </div>

              <div>
                <Label className="font-medium">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground mb-3">Add an extra layer of security to your account</p>
                <Button variant="outline" disabled>
                  <Shield className="w-4 h-4 mr-2" />
                  Enable 2FA
                </Button>
              </div>

              <div>
                <Label className="font-medium">Data Export</Label>
                <p className="text-sm text-muted-foreground mb-3">Download all your content and data</p>
                <Button variant="outline" disabled>
                  <Globe className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveSettings} size="lg" className="flux-gradient-bg text-white hover:opacity-90 flux-transition">
          Save Settings
        </Button>
      </div>
    </div>
  );
}