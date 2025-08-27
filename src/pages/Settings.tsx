import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Loader2, Eye, EyeOff } from 'lucide-react';
import { getProviderKeys, saveProviderKeys, testProviderKey, type ProviderKeys } from '@/services/providerKeys';

export default function Settings() {
  const [notifications, setNotifications] = useState({
    contentGeneration: true,
    scheduleReminders: true,
    weeklyReports: false,
    systemUpdates: true,
  });

  const [testingStatus, setTestingStatus] = useState<Record<string, 'idle' | 'testing' | 'success' | 'error'>>({});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [providerKeys, setProviderKeys] = useState<ProviderKeys>({});
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();

  // Load provider keys from database on mount
  useEffect(() => {
    const loadKeys = async () => {
      try {
        const keys = await getProviderKeys();
        setProviderKeys(keys);
      } catch (error) {
        console.error('Failed to load provider keys:', error);
        toast({
          title: "Error",
          description: "Failed to load API keys",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadKeys();
  }, [toast]);

  const handleApiKeyChange = (provider: string, value: string) => {
    setProviderKeys(prev => ({ ...prev, [provider]: value }));
  };

  const testProvider = async (provider: string) => {
    const apiKey = providerKeys[provider as keyof ProviderKeys];
    if (!apiKey) {
      toast({
        title: "Error",
        description: "Please enter an API key first",
        variant: "destructive",
      });
      return;
    }

    setTestingStatus(prev => ({ ...prev, [provider]: 'testing' }));

    try {
      const result = await testProviderKey(provider, apiKey);
      const status = result.ok ? 'success' : 'error';
      setTestingStatus(prev => ({ ...prev, [provider]: status }));

      toast({
        title: result.ok ? "Success" : "Error",
        description: result.message,
        variant: result.ok ? "default" : "destructive",
      });
    } catch (error) {
      setTestingStatus(prev => ({ ...prev, [provider]: 'error' }));
      toast({
        title: "Error",
        description: "Failed to test API key",
        variant: "destructive",
      });
    }
  };

  const getProviderStatus = (provider: string) => {
    const currentStatus = testingStatus[provider];

    if (currentStatus === 'testing') {
      return { icon: <Loader2 className="w-4 h-4 animate-spin" />, color: 'text-muted-foreground' };
    }
    
    if (currentStatus === 'success') {
      return { icon: <Check className="w-4 h-4" />, color: 'text-success' };
    }
    
    if (currentStatus === 'error') {
      return { icon: <X className="w-4 h-4" />, color: 'text-destructive' };
    }

    return { icon: null, color: '' };
  };

  const saveSettings = async () => {
    try {
      const success = await saveProviderKeys(providerKeys);
      if (success) {
        toast({
          title: "Settings saved",
          description: "Your API keys have been saved successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to save settings. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Configure your API keys and preferences for FluxContent.
        </p>
      </div>

      <Tabs defaultValue="providers" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Provider Configuration</CardTitle>
              <CardDescription>
                Configure your API keys for content generation providers. Keys are stored securely and used per-user.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { key: 'openai', label: 'OpenAI API Key', placeholder: 'sk-...', description: 'For GPT models and image generation' },
                { key: 'huggingface', label: 'HuggingFace Token', placeholder: 'hf_...', description: 'For open-source AI models' },
                { key: 'replicate', label: 'Replicate API Token', placeholder: 'r8_...', description: 'For AI video generation' },
                { key: 'unsplash', label: 'Unsplash Access Key', placeholder: 'Access Key', description: 'For high-quality stock images' },
                { key: 'pexels', label: 'Pexels API Key', placeholder: 'Pexels Key', description: 'For stock videos and photos' },
                { key: 'pixabay', label: 'Pixabay API Key', placeholder: 'Pixabay Key', description: 'For free stock videos and images' },
              ].map(({ key, label, placeholder, description }) => {
                const status = getProviderStatus(key);
                return (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={key}>{label}</Label>
                      <div className="flex items-center space-x-2">
                        {status.icon && (
                          <span className={status.color}>
                            {status.icon}
                          </span>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testProvider(key)}
                          disabled={testingStatus[key] === 'testing'}
                        >
                          Test
                        </Button>
                      </div>
                    </div>
                    <div className="relative">
                      <Input
                        id={key}
                        type={showPasswords[key] ? "text" : "password"}
                        placeholder={placeholder}
                        value={providerKeys[key as keyof ProviderKeys] || ''}
                        onChange={(e) => handleApiKeyChange(key, e.target.value)}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPasswords(prev => ({ ...prev, [key]: !prev[key] }))}
                      >
                        {showPasswords[key] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how and when you want to be notified about your content.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Content Generation</Label>
                  <p className="text-sm text-muted-foreground">Get notified when content generation completes</p>
                </div>
                <Switch
                  checked={notifications.contentGeneration}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, contentGeneration: checked }))
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

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feature Flags</CardTitle>
              <CardDescription>
                Enable or disable experimental and advanced features.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Auto-Scheduling</Label>
                  <p className="text-sm text-muted-foreground">Automatically schedule content at optimal times</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Advanced Analytics</Label>
                  <p className="text-sm text-muted-foreground">Enable detailed content performance analytics</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security and data protection settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                </div>
                <Button variant="outline" disabled>Enable 2FA</Button>
              </div>

              <Separator />

              <div>
                <Label className="font-medium">Change Password</Label>
                <p className="text-sm text-muted-foreground mb-3">Update your account password</p>
                <Button variant="outline" disabled>Change Password</Button>
              </div>

              <Separator />

              <div>
                <Label className="font-medium">Export Data</Label>
                <p className="text-sm text-muted-foreground mb-3">Download a copy of your data</p>
                <Button variant="outline" disabled>Export Data</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={saveSettings} size="lg">
          Save Settings
        </Button>
      </div>
    </div>
  );
}