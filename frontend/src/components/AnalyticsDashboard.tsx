import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { TrendingUp, TrendingDown, MessageSquare, Users, Clock, Download } from 'lucide-react';

export function AnalyticsDashboard() {
  const stats = [
    {
      title: 'Total Conversations',
      value: '2,847',
      change: '+12.5%',
      trend: 'up',
      icon: MessageSquare,
      description: 'This month'
    },
    {
      title: 'Active Users',
      value: '1,234',
      change: '+8.2%',
      trend: 'up',
      icon: Users,
      description: 'Last 30 days'
    },
    {
      title: 'Avg Response Time',
      value: '2.3s',
      change: '-15.4%',
      trend: 'up',
      icon: Clock,
      description: 'System response'
    },
    {
      title: 'Resolution Rate',
      value: '87.2%',
      change: '+3.1%',
      trend: 'up',
      icon: TrendingUp,
      description: 'Successfully resolved'
    }
  ];

  const topQuestions = [
    { question: 'What are your business hours?', count: 342, percentage: 18.5 },
    { question: 'How can I track my order?', count: 289, percentage: 15.6 },
    { question: 'What is your return policy?', count: 245, percentage: 13.2 },
    { question: 'Do you offer international shipping?', count: 198, percentage: 10.7 },
    { question: 'How do I reset my password?', count: 167, percentage: 9.0 }
  ];

  const recentConversations = [
    {
      id: '1',
      user: 'Anonymous User',
      message: 'Hi, I need help with my order',
      timestamp: '2 minutes ago',
      status: 'active',
      chatbot: 'Customer Support Bot'
    },
    {
      id: '2',
      user: 'Anonymous User',
      message: 'What are your shipping options?',
      timestamp: '5 minutes ago',
      status: 'resolved',
      chatbot: 'Customer Support Bot'
    },
    {
      id: '3',
      user: 'Anonymous User',
      message: 'I want to know about pricing',
      timestamp: '8 minutes ago',
      status: 'escalated',
      chatbot: 'Lead Generation Bot'
    },
    {
      id: '4',
      user: 'Anonymous User',
      message: 'Technical support needed',
      timestamp: '12 minutes ago',
      status: 'resolved',
      chatbot: 'Customer Support Bot'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-700';
      case 'resolved':
        return 'bg-green-100 text-green-700';
      case 'escalated':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Monitor your chatbot performance and user interactions</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
          
          return (
            <Card key={stat.title} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                  <Icon className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  stat.trend === 'up' ? 'text-success' : 'text-destructive'
                }`}>
                  <TrendIcon className="h-4 w-4" />
                  {stat.change}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.title}</div>
                <div className="text-xs text-muted-foreground">{stat.description}</div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Top Questions */}
        <Card className="p-6">
          <h3 className="mb-4">Most Asked Questions</h3>
          <div className="space-y-4">
            {topQuestions.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium mb-1">{item.question}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.count} times asked ({item.percentage}%)
                  </div>
                </div>
                <div className="w-16 h-2 bg-muted rounded-full ml-4">
                  <div 
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${item.percentage * 5}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Conversations */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3>Recent Conversations</h3>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
          <div className="space-y-4">
            {recentConversations.map((conversation) => (
              <div key={conversation.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-primary-foreground font-medium">
                    {conversation.user.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{conversation.user}</span>
                    <Badge className={getStatusColor(conversation.status)}>
                      {conversation.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-1">
                    "{conversation.message}"
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{conversation.timestamp}</span>
                    <span>•</span>
                    <span>{conversation.chatbot}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Performance Chart Placeholder */}
      <Card className="p-6">
        <h3 className="mb-4">Conversation Volume</h3>
        <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <div className="text-muted-foreground">Chart visualization will be implemented</div>
            <div className="text-sm text-muted-foreground">with real-time conversation data</div>
          </div>
        </div>
      </Card>
    </div>
  );
}