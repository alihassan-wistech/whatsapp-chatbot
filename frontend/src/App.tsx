import { useState, useEffect } from 'react';
import { Button } from './components/ui/button';
import { Plus, MessageSquare, Settings, BarChart3, Globe, LogOut, Info } from 'lucide-react';
import { ChatbotBuilder } from './components/ChatbotBuilder';
import { ChatbotList } from './components/ChatbotList';
import { IntegrationPanel } from './components/IntegrationPanel';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { WhatsAppSettings } from './components/WhatsAppSettings';
import { AuthPage } from './components/AuthPage';
import { Toaster } from './components/ui/sonner';
import { Alert, AlertDescription } from './components/ui/alert';
import { getSession, logout } from './utils/api';
import { toast } from 'sonner@2.0.3';

type ActiveSection = 'chatbots' | 'builder' | 'analytics' | 'integration' | 'settings';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<ActiveSection>('chatbots');
  const [selectedChatbotId, setSelectedChatbotId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [showDemoBanner, setShowDemoBanner] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const session = await getSession();
      setIsAuthenticated(!!session);
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const isDemoMode = userEmail === 'demo@chatflow.com';

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleSignOut = async () => {
    try {
      logout();
      setIsAuthenticated(false);
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  const sidebarItems = [
    {
      id: 'chatbots' as const,
      label: 'Chatbots',
      icon: MessageSquare,
      description: 'Manage your chatbots'
    },
    {
      id: 'analytics' as const,
      label: 'Analytics',
      icon: BarChart3,
      description: 'View performance metrics'
    },
    {
      id: 'integration' as const,
      label: 'Integration',
      icon: Globe,
      description: 'Embed on websites'
    },
    {
      id: 'settings' as const,
      label: 'WhatsApp Settings',
      icon: Settings,
      description: 'Configure WhatsApp API'
    }
  ];

  const handleCreateChatbot = () => {
    setSelectedChatbotId(null);
    setActiveSection('builder');
  };

  const handleEditChatbot = (chatbotId: string) => {
    setSelectedChatbotId(chatbotId);
    setActiveSection('builder');
  };

  const renderMainContent = () => {
    switch (activeSection) {
      case 'chatbots':
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="mb-2">WhatsApp Chatbots</h1>
                <p className="text-muted-foreground">Create and manage intelligent chatbots for your websites</p>
              </div>
              <Button onClick={handleCreateChatbot} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Chatbot
              </Button>
            </div>
            <ChatbotList onEditChatbot={handleEditChatbot} />
          </div>
        );
      case 'builder':
        return (
          <ChatbotBuilder 
            chatbotId={selectedChatbotId}
            onBack={() => setActiveSection('chatbots')}
          />
        );
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'integration':
        return <IntegrationPanel />;
      case 'settings':
        return <WhatsAppSettings />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Toaster />
      
      {/* Demo Mode Banner */}
      {isDemoMode && showDemoBanner && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <Alert className="rounded-none border-x-0 border-t-0 bg-primary/5 border-primary/20">
            <Info className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                You're in <strong>demo mode</strong>. Explore the platform with sample data. 
                <a href="#" onClick={(e) => { e.preventDefault(); handleSignOut(); }} className="ml-2 underline">
                  Sign out to create your own account
                </a>
              </span>
              <button 
                onClick={() => setShowDemoBanner(false)}
                className="text-muted-foreground hover:text-foreground ml-4"
              >
                ✕
              </button>
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-surface flex flex-col" style={{ marginTop: isDemoMode && showDemoBanner ? '52px' : '0' }}>
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <div className="font-medium">ChatFlow</div>
              <div className="text-xs text-muted-foreground">WhatsApp Integration</div>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-xs opacity-80 truncate">{item.description}</div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Sign Out Button */}
        <div className="p-4 border-t border-border">
          <Button 
            variant="outline" 
            className="w-full gap-2" 
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden" style={{ marginTop: isDemoMode && showDemoBanner ? '52px' : '0' }}>
        <div className="h-full overflow-auto">
          <div className="container max-w-none h-full p-8">
            {renderMainContent()}
          </div>
        </div>
      </div>
    </div>
  );
}