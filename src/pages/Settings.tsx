import { useState } from 'react';
import { Key, TestTube, Shield, Bell, Palette, Globe, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useProviderStore } from '@/store/providers';
import { searchProviders } from '@/providers/search';
import { llmProviders } from '@/providers/llm';
import { imageProviders } from '@/providers/image';

export default function Settings() {
  const { toast } = useToast();
  const { config, updateKeys, updateToggles, setTestResult, setUseProxy } = useProviderStore();
  const [isTestingProvider, setIsTestingProvider] = useState<string | null>(null);

  const [notifications, setNotifications] = useState({
    contentGenerated: true,
    scheduleReminders: true,
    weeklyReports: false,
    systemUpdates: true,
  });

  const handleApiKeyChange = (key: string, value: string) => {
    updateKeys({ [key]: value });
  };

  const testProvider = async (providerKey: string, providerName: string) => {
    setIsTestingProvider(providerKey);
    
    toast({
      title: 'Testing connection...',
      description: `Testing ${providerName} API connection.`,
    });

    try {
      let provider;
      
      // Map provider keys to actual providers
      switch (providerKey) {
        case 'openrouter':
          provider = llmProviders.openrouter;
          break;
        case 'hf':
          provider = llmProviders.huggingface;
          break;
        case 'tavily':
          provider = searchProviders.tavily;
          break;
        case 'unsplash':
          provider = imageProviders.unsplash;
          break;
        default:
          throw new Error('Provider not implemented');
      }

      const result = await provider.test(config);
      setTestResult(providerKey, result);

      toast({
        title: result.ok ? 'Connection successful' : 'Connection failed',
        description: result.message,
        variant: result.ok ? 'default' : 'destructive',
      });
    } catch (error) {
      const result = { ok: false, message: 'Test failed', at: new Date().toISOString() };
      setTestResult(providerKey, result);
      
      toast({
        title: 'Connection failed',
        description: 'Unable to test provider connection.',
        variant: 'destructive',
      });
    } finally {
      setIsTestingProvider(null);
    }
  };

  const getProviderStatus = (providerKey: string) => {
    const hasKey = !!config.keys[providerKey as keyof typeof config.keys];
    const testResult = config.lastTest?.[providerKey];
    
    if (!hasKey) {
      return { status: 'warning', label: 'No API Key', icon: AlertCircle };
    }
    
    if (!testResult) {
      return { status: 'secondary', label: 'Not Tested', icon: AlertCircle };
    }
    
    if (testResult.ok) {
      return { status: 'success', label: 'Connected', icon: CheckCircle };
    }
    
    return { status: 'destructive', label: 'Failed', icon: XCircle };
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
              {/* Use Proxy Toggle */}
              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                <div>
                  <Label className="font-medium">Use Proxy Server</Label>
                  <p className="text-sm text-muted-foreground">Route requests through proxy to avoid CORS issues</p>
                </div>
                <Switch
                  checked={config.useProxy}
                  onCheckedChange={setUseProxy}
                />
              </div>

              {/* OpenRouter */}
              {(() => {
                const status = getProviderStatus('openrouter');
                const StatusIcon = status.icon;
                return (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">OR</span>
                        </div>
                        <div>
                          <Label className="font-medium">OpenRouter</Label>
                          <p className="text-sm text-muted-foreground">Access to multiple LLM models</p>
                        </div>
                      </div>
                      <Badge variant={status.status as any} className="flex items-center gap-1">
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="password"
                        placeholder="sk-or-..."
                        value={config.keys.openrouter || ''}
                        onChange={(e) => handleApiKeyChange('openrouter', e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        onClick={() => testProvider('openrouter', 'OpenRouter')}
                        disabled={isTestingProvider === 'openrouter'}
                      >
                        <TestTube className="w-4 h-4 mr-2" />
                        Test
                      </Button>
                    </div>
                  </div>
                );
              })()}

              {/* HuggingFace */}
              {(() => {
                const status = getProviderStatus('hf');
                const StatusIcon = status.icon;
                return (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">HF</span>
                        </div>
                        <div>
                          <Label className="font-medium">HuggingFace</Label>
                          <p className="text-sm text-muted-foreground">Free LLM and image generation</p>
                        </div>
                      </div>
                      <Badge variant={status.status as any} className="flex items-center gap-1">
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="password"
                        placeholder="hf_..."
                        value={config.keys.hf || ''}
                        onChange={(e) => handleApiKeyChange('hf', e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        onClick={() => testProvider('hf', 'HuggingFace')}
                        disabled={isTestingProvider === 'hf'}
                      >
                        <TestTube className="w-4 h-4 mr-2" />
                        Test
                      </Button>
                    </div>
                  </div>
                );
              })()}

              {/* Tavily Search */}
              {(() => {
                const status = getProviderStatus('tavily');
                const StatusIcon = status.icon;
                return (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">T</span>
                        </div>
                        <div>
                          <Label className="font-medium">Tavily Search</Label>
                          <p className="text-sm text-muted-foreground">AI-powered web search</p>
                        </div>
                      </div>
                      <Badge variant={status.status as any} className="flex items-center gap-1">
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="password"
                        placeholder="tvly-..."
                        value={config.keys.tavily || ''}
                        onChange={(e) => handleApiKeyChange('tavily', e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        onClick={() => testProvider('tavily', 'Tavily')}
                        disabled={isTestingProvider === 'tavily'}
                      >
                        <TestTube className="w-4 h-4 mr-2" />
                        Test
                      </Button>
                    </div>
                  </div>
                );
              })()}

              {/* Unsplash */}
              {(() => {
                const status = getProviderStatus('unsplash');
                const StatusIcon = status.icon;
                return (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-gradient-to-r from-gray-600 to-gray-800 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">U</span>
                        </div>
                        <div>
                          <Label className="font-medium">Unsplash</Label>
                          <p className="text-sm text-muted-foreground">High-quality stock photos</p>
                        </div>
                      </div>
                      <Badge variant={status.status as any} className="flex items-center gap-1">
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="password"
                        placeholder="Client-ID..."
                        value={config.keys.unsplash || ''}
                        onChange={(e) => handleApiKeyChange('unsplash', e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        onClick={() => testProvider('unsplash', 'Unsplash')}
                        disabled={isTestingProvider === 'unsplash'}
                      >
                        <TestTube className="w-4 h-4 mr-2" />
                        Test
                      </Button>
                    </div>
                  </div>
                );
              })()}
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
                  <Label className="font-medium">Use Premium Providers</Label>
                  <p className="text-sm text-muted-foreground">Prefer paid providers when available for better quality</p>
                </div>
                <Switch
                  checked={config.toggles.usePremium}
                  onCheckedChange={(checked) => 
                    updateToggles({ usePremium: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Auto-Scheduling</Label>
                  <p className="text-sm text-muted-foreground">Automatically schedule content at optimal times</p>
                </div>
                <Switch
                  checked={config.toggles.autoSchedule}
                  onCheckedChange={(checked) => 
                    updateToggles({ autoSchedule: checked })
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