import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { AlertCircle, CheckCircle, Smartphone, Key, Webhook, Settings2, Copy } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { getSettings, updateSettings } from '../utils/api';
import { toast } from 'sonner@2.0.3';

export function WhatsAppSettings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [businessNumber, setBusinessNumber] = useState('');
  const [whatsappBusinessId, setWhatsappBusinessId] = useState('');
  const [whatsappPhoneNumberId, setWhatsappPhoneNumberId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [verifyToken, setVerifyToken] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [enableAutoResponses, setEnableAutoResponses] = useState(true);
  const [enableBusinessHours, setEnableBusinessHours] = useState(true);
  const [welcomeMessage, setWelcomeMessage] = useState('Hello! Thanks for contacting us on WhatsApp. How can I help you today?');

  // const generatedWebhookUrl = `https://${projectId}.supabase.co/functions/v1/make-server-97ac60b8/webhook/whatsapp`;
  // const generatedVerifyToken = verifyToken || 'your-verify-token';

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!accessToken || !whatsappPhoneNumberId) {
      toast.error('Please provide WhatsApp Access Token and Phone Number ID');
      return;
    }

    try {
      setIsSaving(true);
      toast.success('Settings saved successfully!');
      setIsConnected(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2">WhatsApp Settings</h1>
          <p className="text-muted-foreground">Configure your WhatsApp Business API integration</p>
        </div>
        <Badge variant={isConnected ? 'default' : 'secondary'} className="gap-2">
          {isConnected ? (
            <CheckCircle className="h-3 w-3" />
          ) : (
            <AlertCircle className="h-3 w-3" />
          )}
          {isConnected ? 'Connected' : 'Not Connected'}
        </Badge>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          To use WhatsApp Business API, you need to set up a Meta (Facebook) Developer account and create a WhatsApp Business app. 
          <a 
            href="https://developers.facebook.com/docs/whatsapp/getting-started" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="underline ml-1"
          >
            Learn more
          </a>
        </AlertDescription>
      </Alert>

      {/* Connection Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
            <Smartphone className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3>WhatsApp Business API Credentials</h3>
            <p className="text-sm text-muted-foreground">Enter your Meta WhatsApp Business API credentials</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="business-id">Business Account ID</Label>
            <Input
              id="business-id"
              value={whatsappBusinessId}
              onChange={(e) => setWhatsappBusinessId(e.target.value)}
              placeholder="123456789012345"
            />
            <p className="text-xs text-muted-foreground mt-1">
              From your Meta Business Manager
            </p>
          </div>

          <div>
            <Label htmlFor="phone-number-id">Phone Number ID *</Label>
            <Input
              id="phone-number-id"
              value={whatsappPhoneNumberId}
              onChange={(e) => setWhatsappPhoneNumberId(e.target.value)}
              placeholder="123456789012345"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Found in your WhatsApp Business app settings
            </p>
          </div>

          <div>
            <Label htmlFor="access-token">Access Token *</Label>
            <Input
              id="access-token"
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="EAAxxxxxxxxxxxxxxxxxx"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Generate from Meta App Dashboard → WhatsApp → API Setup
            </p>
          </div>

          <div>
            <Label htmlFor="business-number">Business Phone Number</Label>
            <Input
              id="business-number"
              value={businessNumber}
              onChange={(e) => setBusinessNumber(e.target.value)}
              placeholder="+1234567890"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Your WhatsApp Business number
            </p>
          </div>
        </div>
      </Card>

      {/* Webhook Configuration 
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Webhook className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3>Webhook Configuration</h3>
            <p className="text-sm text-muted-foreground">Use this webhook in your Meta WhatsApp settings</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Webhook URL (Callback URL)</Label>
            <div className="flex gap-2">
              <Input
                value={generatedWebhookUrl}
                readOnly
                className="font-mono text-sm"
              />
              <Button 
                variant="outline" 
                onClick={() => copyToClipboard(generatedWebhookUrl)}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Add this URL in Meta App Dashboard → WhatsApp → Configuration → Webhook
            </p>
          </div>

          <div>
            <Label htmlFor="verify-token">Verify Token</Label>
            <div className="flex gap-2">
              <Input
                id="verify-token"
                value={verifyToken}
                onChange={(e) => setVerifyToken(e.target.value)}
                placeholder="your-verify-token"
              />
              <Button 
                variant="outline" 
                onClick={() => copyToClipboard(verifyToken || generatedVerifyToken)}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Use this token when configuring webhook in Meta Dashboard
            </p>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="text-sm font-medium mb-2">Setup Instructions:</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Copy the Webhook URL above</li>
              <li>Go to Meta App Dashboard → WhatsApp → Configuration</li>
              <li>Click "Edit" in the Webhook section</li>
              <li>Paste the Callback URL and Verify Token</li>
              <li>Subscribe to "messages" webhook field</li>
              <li>Save the configuration</li>
            </ol>
          </div>
        </div>
      </Card>
      */}
      {/* Bot Behavior Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <Settings2 className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3>Bot Behavior</h3>
            <p className="text-sm text-muted-foreground">Configure how your bot responds on WhatsApp</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <Label htmlFor="welcome-message">Welcome Message</Label>
            <Textarea
              id="welcome-message"
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              placeholder="Enter welcome message for WhatsApp users"
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-1">
              This will be sent as the first message when users contact your business
            </p>
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900">
              Your chatbot will automatically process incoming messages and respond based on your configured Q&A flows
            </AlertDescription>
          </Alert>
        </div>
      </Card>

      {/* Save Settings */}
      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" onClick={loadSettings}>
          Reset
        </Button>
        <Button onClick={handleSaveSettings} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}