import { CheckCircle, HelpCircle, Keyboard, Book, MessageCircle, ExternalLink } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Help() {
  const quickStartSteps = [
    { id: 1, title: 'Create your first brand', completed: true },
    { id: 2, title: 'Set up AI providers', completed: true },
    { id: 3, title: 'Generate your first content', completed: false },
    { id: 4, title: 'Schedule content to calendar', completed: false },
    { id: 5, title: 'Analyze performance', completed: false },
  ];

  const keyboardShortcuts = [
    { keys: ['Cmd', 'B'], description: 'Toggle sidebar' },
    { keys: ['Cmd', 'K'], description: 'Open command palette' },
    { keys: ['Cmd', 'N'], description: 'Create new content' },
    { keys: ['Cmd', 'S'], description: 'Save current work' },
    { keys: ['Esc'], description: 'Close modals/dialogs' },
    { keys: ['Tab'], description: 'Navigate between fields' },
  ];

  const faqs = [
    {
      question: 'How does AI content generation work?',
      answer: 'FluxContent uses advanced AI models to analyze your brand profile, target audience, and current trends to generate relevant, engaging content tailored to your needs.',
    },
    {
      question: 'Can I edit generated content?',
      answer: 'Absolutely! All generated content can be edited, refined, and customized before publishing. You have full control over the final output.',
    },
    {
      question: 'How many brands can I manage?',
      answer: 'You can create and manage unlimited brands within your FluxContent account. Each brand maintains its own identity and content library.',
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, we take security seriously. All data is encrypted in transit and at rest. We never share your content or brand information with third parties.',
    },
    {
      question: 'Can I schedule content to multiple platforms?',
      answer: 'Yes, FluxContent supports scheduling to all major social platforms including LinkedIn, Twitter, Instagram, Facebook, and more.',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Help & Support</h1>
        <p className="text-muted-foreground">
          Get started quickly and find answers to common questions.
        </p>
      </div>

      <Tabs defaultValue="quickstart" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="quickstart" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Quick Start
          </TabsTrigger>
          <TabsTrigger value="shortcuts" className="flex items-center gap-2">
            <Keyboard className="w-4 h-4" />
            Shortcuts
          </TabsTrigger>
          <TabsTrigger value="faq" className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            FAQ
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <Book className="w-4 h-4" />
            Resources
          </TabsTrigger>
        </TabsList>

        {/* Quick Start */}
        <TabsContent value="quickstart" className="space-y-6">
          <Card className="flux-panel">
            <CardHeader>
              <CardTitle>Getting Started Checklist</CardTitle>
              <CardDescription>
                Follow these steps to set up your FluxContent workspace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quickStartSteps.map((step) => (
                  <div key={step.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 flux-transition">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      step.completed 
                        ? 'bg-success text-white' 
                        : 'bg-muted text-muted-foreground border-2 border-border'
                    }`}>
                      {step.completed ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <span className="text-xs font-medium">{step.id}</span>
                      )}
                    </div>
                    <span className={step.completed ? 'line-through text-muted-foreground' : 'font-medium'}>
                      {step.title}
                    </span>
                    {step.completed && (
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20 ml-auto">
                        Complete
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="flux-card">
              <CardHeader>
                <CardTitle className="text-lg">🚀 Pro Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium mb-1">Use detailed brand profiles</p>
                  <p className="text-muted-foreground">The more information you provide about your brand, the better the AI can generate relevant content.</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium mb-1">Regular content research</p>
                  <p className="text-muted-foreground">Run research weekly to stay on top of trends and competitor activities.</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium mb-1">Batch content creation</p>
                  <p className="text-muted-foreground">Generate multiple pieces of content at once for better efficiency.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="flux-card">
              <CardHeader>
                <CardTitle className="text-lg">🎯 Best Practices</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium mb-1">Review before publishing</p>
                  <p className="text-muted-foreground">Always review and customize generated content to match your voice.</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium mb-1">Use the calendar feature</p>
                  <p className="text-muted-foreground">Plan your content strategy with the built-in calendar and scheduling tools.</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium mb-1">Monitor performance</p>
                  <p className="text-muted-foreground">Track which content performs best and adjust your strategy accordingly.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Keyboard Shortcuts */}
        <TabsContent value="shortcuts" className="space-y-6">
          <Card className="flux-panel">
            <CardHeader>
              <CardTitle>Keyboard Shortcuts</CardTitle>
              <CardDescription>
                Speed up your workflow with these handy shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {keyboardShortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <Badge key={keyIndex} variant="outline" className="font-mono text-xs">
                          {key}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQ */}
        <TabsContent value="faq" className="space-y-6">
          <Card className="flux-panel">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Common questions and answers about FluxContent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index} className="space-y-2">
                    <h3 className="font-medium">{faq.question}</h3>
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                    {index < faqs.length - 1 && (
                      <div className="border-b border-border mt-4" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources */}
        <TabsContent value="resources" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="flux-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="w-5 h-5" />
                  Documentation
                </CardTitle>
                <CardDescription>
                  Comprehensive guides and tutorials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-between" disabled>
                  Getting Started Guide
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between" disabled>
                  API Documentation
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between" disabled>
                  Best Practices
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="flux-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Support
                </CardTitle>
                <CardDescription>
                  Get help from our team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-between" disabled>
                  Live Chat Support
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between" disabled>
                  Email Support
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between" disabled>
                  Community Forum
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="flux-panel">
            <CardHeader>
              <CardTitle>Video Tutorials</CardTitle>
              <CardDescription>
                Watch step-by-step tutorials to master FluxContent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white">▶</span>
                    </div>
                    <p className="text-sm font-medium">Getting Started</p>
                    <p className="text-xs text-muted-foreground">5 min</p>
                  </div>
                </div>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white">▶</span>
                    </div>
                    <p className="text-sm font-medium">Content Generation</p>
                    <p className="text-xs text-muted-foreground">8 min</p>
                  </div>
                </div>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white">▶</span>
                    </div>
                    <p className="text-sm font-medium">Advanced Features</p>
                    <p className="text-xs text-muted-foreground">12 min</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}