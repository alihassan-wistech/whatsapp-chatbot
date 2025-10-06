import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Copy, Globe, Code, Smartphone, ExternalLink, Check } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function IntegrationPanel() {
  const [selectedChatbot, setSelectedChatbot] = useState('customer-support');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const chatbots = [
    { id: 'customer-support', name: 'Customer Support Bot', status: 'active' },
    { id: 'lead-generation', name: 'Lead Generation Bot', status: 'active' },
    { id: 'product-demo', name: 'Product Demo Bot', status: 'draft' }
  ];

  const embedCode = `<!-- WhatsApp ChatBot Integration -->
<script>
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://chatbot-widget.yoursite.com/widget.js?id=${selectedChatbot}'+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','chatbotLayer','CB-${selectedChatbot.toUpperCase()}');
</script>

<!-- Optional: Customize widget appearance -->
<script>
  window.chatbotConfig = {
    botId: '${selectedChatbot}',
    theme: 'light',
    position: 'bottom-right',
    primaryColor: '#25d366',
    welcomeMessage: 'Hello! How can I help you today?',
    showOnPages: ['*'], // Show on all pages
    hideOnPages: [], // Hide on specific pages
    autoOpen: false,
    showBadge: true
  };
</script>`;

  const whatsappCode = `<!-- WhatsApp Business API Integration -->
<script>
  window.whatsappConfig = {
    botId: '${selectedChatbot}',
    businessNumber: '+1234567890',
    webhookUrl: 'https://api.yoursite.com/webhook/whatsapp',
    apiKey: 'YOUR_WHATSAPP_API_KEY',
    autoRespond: true,
    businessHours: {
      enabled: true,
      timezone: 'UTC',
      hours: {
        monday: { start: '09:00', end: '18:00' },
        tuesday: { start: '09:00', end: '18:00' },
        wednesday: { start: '09:00', end: '18:00' },
        thursday: { start: '09:00', end: '18:00' },
        friday: { start: '09:00', end: '18:00' },
        saturday: { start: '10:00', end: '16:00' },
        sunday: { closed: true }
      }
    }
  };
</script>`;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(type);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const testWebsite = () => {
    if (!websiteUrl) {
      toast.error('Please enter a website URL');
      return;
    }
    
    // Simulate testing
    toast.success('Testing integration on ' + websiteUrl);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2">Integration Setup</h1>
          <p className="text-muted-foreground">Embed your chatbot on websites and configure WhatsApp integration</p>
        </div>
        <Button variant="outline" className="gap-2">
          <ExternalLink className="h-4 w-4" />
          View Documentation
        </Button>
      </div>

      {/* Chatbot Selection */}
      <Card className="p-6">
        <h3 className="mb-4">Select Chatbot</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {chatbots.map((bot) => (
            <div
              key={bot.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedChatbot === bot.id 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => setSelectedChatbot(bot.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{bot.name}</span>
                <Badge variant={bot.status === 'active' ? 'default' : 'secondary'}>
                  {bot.status}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">ID: {bot.id}</div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Website Integration */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Globe className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3>Website Integration</h3>
              <p className="text-sm text-muted-foreground">Embed chatbot widget on your website</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Website URL (for testing)</label>
              <div className="flex gap-2">
                <Input
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yourwebsite.com"
                />
                <Button variant="outline" onClick={testWebsite}>
                  Test
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Embed Code</label>
              <div className="relative">
                <Textarea
                  value={embedCode}
                  readOnly
                  className="font-mono text-xs h-48 resize-none"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2 gap-2"
                  onClick={() => copyToClipboard(embedCode, 'embed')}
                >
                  {copiedCode === 'embed' ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  {copiedCode === 'embed' ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="text-sm font-medium mb-2">Integration Steps:</h4>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Copy the embed code above</li>
                <li>Paste it before the closing {'</body>'} tag</li>
                <li>Customize the configuration as needed</li>
                <li>Test the integration</li>
              </ol>
            </div>
          </div>
        </Card>

        {/* WhatsApp Integration */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Smartphone className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3>WhatsApp Integration</h3>
              <p className="text-sm text-muted-foreground">Connect with WhatsApp Business API</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 w-4 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium">WhatsApp Business API Required</span>
              </div>
              <p className="text-sm text-yellow-700">
                You need a verified WhatsApp Business account and API access to use this feature.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Integration Code</label>
              <div className="relative">
                <Textarea
                  value={whatsappCode}
                  readOnly
                  className="font-mono text-xs h-48 resize-none"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2 gap-2"
                  onClick={() => copyToClipboard(whatsappCode, 'whatsapp')}
                >
                  {copiedCode === 'whatsapp' ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  {copiedCode === 'whatsapp' ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="text-sm font-medium mb-2">Setup Requirements:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>WhatsApp Business API access</li>
                <li>Verified business phone number</li>
                <li>Webhook endpoint configuration</li>
                <li>Valid API credentials</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      {/* Integration Preview */}
      <Card className="p-6">
        <h3 className="mb-4">Widget Preview</h3>
        <div className="bg-gray-100 rounded-lg p-8 min-h-64 relative">
          <div className="text-center text-muted-foreground">
            <Code className="h-12 w-12 mx-auto mb-4" />
            <div>Live preview of your chatbot widget</div>
            <div className="text-sm">Will appear here when implemented</div>
          </div>
          
          {/* Simulated chat widget */}
          <div className="absolute bottom-6 right-6">
            <div className="bg-green-500 rounded-full p-4 shadow-lg cursor-pointer hover:bg-green-600 transition-colors">
              <Smartphone className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}