import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Types
interface Chatbot {
  id: string;
  name: string;
  description: string;
  questions: Question[];
  settings: ChatbotSettings;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

interface Question {
  id: string;
  type: 'text' | 'options' | 'conditional';
  question: string;
  answer?: string;
  options?: string[];
  conditions?: Array<{
    trigger: string;
    nextQuestionId: string;
  }>;
  optionFlows?: Array<{
    optionText: string;
    nextQuestionId: string;
  }>;
  parentQuestionId?: string;
  triggerOption?: string;
  isWelcome?: boolean;
}

interface ChatbotSettings {
  enableWhatsApp: boolean;
  enableWebsite: boolean;
  whatsappNumber?: string;
  webhookUrl?: string;
}

interface Conversation {
  id: string;
  chatbotId: string;
  userPhone: string;
  messages: ConversationMessage[];
  currentQuestionId?: string;
  status: 'active' | 'completed' | 'abandoned';
  createdAt: string;
  updatedAt: string;
}

interface ConversationMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: string;
  questionId?: string;
}

interface Analytics {
  chatbotId: string;
  totalConversations: number;
  completedConversations: number;
  averageResponseTime: number;
  popularQuestions: Array<{
    questionId: string;
    question: string;
    count: number;
  }>;
  dailyStats: Array<{
    date: string;
    conversations: number;
    completions: number;
  }>;
}

// Auth middleware
const requireAuth = async (c: any, next: any) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  
  if (!accessToken) {
    return c.json({ error: 'Unauthorized - No token provided' }, 401);
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user?.id) {
      console.log('Auth error:', error);
      return c.json({ error: 'Unauthorized - Invalid token' }, 401);
    }

    c.set('userId', user.id);
    c.set('userEmail', user.email);
    await next();
  } catch (error) {
    console.log('Auth middleware error:', error);
    return c.json({ error: 'Unauthorized - Token validation failed' }, 401);
  }
};

// Health check endpoint
app.get("/make-server-97ac60b8/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Auth endpoints
app.post("/make-server-97ac60b8/auth/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: `Failed to create user: ${error.message}` }, 400);
    }

    return c.json({ 
      message: 'User created successfully', 
      user: { id: data.user?.id, email: data.user?.email, name } 
    });
  } catch (error) {
    console.log('Signup endpoint error:', error);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

// Chatbot CRUD endpoints
app.get("/make-server-97ac60b8/chatbots", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const chatbots = await kv.getByPrefix(`chatbot:${userId}:`);
    
    return c.json({ 
      chatbots: chatbots.map(item => JSON.parse(item.value)).sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
    });
  } catch (error) {
    console.log('Get chatbots error:', error);
    return c.json({ error: 'Failed to fetch chatbots' }, 500);
  }
});

app.post("/make-server-97ac60b8/chatbots", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const data = await c.req.json();
    
    const chatbot: Chatbot = {
      id: crypto.randomUUID(),
      name: data.name,
      description: data.description || '',
      questions: data.questions || [],
      settings: data.settings || { enableWhatsApp: true, enableWebsite: true },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId
    };

    await kv.set(`chatbot:${userId}:${chatbot.id}`, JSON.stringify(chatbot));
    
    return c.json({ chatbot });
  } catch (error) {
    console.log('Create chatbot error:', error);
    return c.json({ error: 'Failed to create chatbot' }, 500);
  }
});

app.put("/make-server-97ac60b8/chatbots/:id", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const chatbotId = c.req.param('id');
    const data = await c.req.json();
    
    const existingData = await kv.get(`chatbot:${userId}:${chatbotId}`);
    if (!existingData) {
      return c.json({ error: 'Chatbot not found' }, 404);
    }

    const existingChatbot = JSON.parse(existingData);
    const updatedChatbot: Chatbot = {
      ...existingChatbot,
      name: data.name,
      description: data.description,
      questions: data.questions,
      settings: data.settings,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`chatbot:${userId}:${chatbotId}`, JSON.stringify(updatedChatbot));
    
    return c.json({ chatbot: updatedChatbot });
  } catch (error) {
    console.log('Update chatbot error:', error);
    return c.json({ error: 'Failed to update chatbot' }, 500);
  }
});

app.delete("/make-server-97ac60b8/chatbots/:id", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const chatbotId = c.req.param('id');
    
    const key = `chatbot:${userId}:${chatbotId}`;
    const existingData = await kv.get(key);
    
    if (!existingData) {
      return c.json({ error: 'Chatbot not found' }, 404);
    }

    await kv.del(key);
    
    // Also delete related conversations and analytics
    const conversationKeys = await kv.getByPrefix(`conversation:${chatbotId}:`);
    for (const conv of conversationKeys) {
      await kv.del(conv.key);
    }
    
    await kv.del(`analytics:${chatbotId}`);
    
    return c.json({ message: 'Chatbot deleted successfully' });
  } catch (error) {
    console.log('Delete chatbot error:', error);
    return c.json({ error: 'Failed to delete chatbot' }, 500);
  }
});

app.get("/make-server-97ac60b8/chatbots/:id", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const chatbotId = c.req.param('id');
    
    const data = await kv.get(`chatbot:${userId}:${chatbotId}`);
    if (!data) {
      return c.json({ error: 'Chatbot not found' }, 404);
    }

    const chatbot = JSON.parse(data);
    return c.json({ chatbot });
  } catch (error) {
    console.log('Get chatbot error:', error);
    return c.json({ error: 'Failed to fetch chatbot' }, 500);
  }
});

// WhatsApp webhook endpoint (public - no auth required)
app.post("/make-server-97ac60b8/webhook/whatsapp", async (c) => {
  try {
    const body = await c.req.json();
    console.log('WhatsApp webhook received:', JSON.stringify(body, null, 2));

    // Verify webhook (WhatsApp sends a verification challenge)
    if (body.hub && body.hub.challenge) {
      return c.text(body.hub.challenge);
    }

    // Process incoming messages
    if (body.entry && body.entry[0] && body.entry[0].changes) {
      for (const change of body.entry[0].changes) {
        if (change.value && change.value.messages) {
          for (const message of change.value.messages) {
            await processWhatsAppMessage(message, change.value);
          }
        }
      }
    }

    return c.json({ status: 'ok' });
  } catch (error) {
    console.log('WhatsApp webhook error:', error);
    return c.json({ error: 'Webhook processing failed' }, 500);
  }
});

// WhatsApp verification endpoint
app.get("/make-server-97ac60b8/webhook/whatsapp", (c) => {
  const mode = c.req.query('hub.mode');
  const token = c.req.query('hub.verify_token');
  const challenge = c.req.query('hub.challenge');

  const verifyToken = Deno.env.get('WHATSAPP_VERIFY_TOKEN') || 'your-verify-token';

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WhatsApp webhook verified');
    return c.text(challenge);
  }

  return c.text('Forbidden', 403);
});

// Analytics endpoints
app.get("/make-server-97ac60b8/analytics/:chatbotId", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const chatbotId = c.req.param('chatbotId');
    
    // Verify chatbot ownership
    const chatbotData = await kv.get(`chatbot:${userId}:${chatbotId}`);
    if (!chatbotData) {
      return c.json({ error: 'Chatbot not found' }, 404);
    }

    const analyticsData = await kv.get(`analytics:${chatbotId}`);
    const analytics = analyticsData ? JSON.parse(analyticsData) : {
      chatbotId,
      totalConversations: 0,
      completedConversations: 0,
      averageResponseTime: 0,
      popularQuestions: [],
      dailyStats: []
    };

    return c.json({ analytics });
  } catch (error) {
    console.log('Get analytics error:', error);
    return c.json({ error: 'Failed to fetch analytics' }, 500);
  }
});

// Conversations endpoints
app.get("/make-server-97ac60b8/conversations", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const chatbotId = c.req.query('chatbotId');
    
    if (chatbotId) {
      // Verify chatbot ownership
      const chatbotData = await kv.get(`chatbot:${userId}:${chatbotId}`);
      if (!chatbotData) {
        return c.json({ error: 'Chatbot not found' }, 404);
      }
      
      const conversations = await kv.getByPrefix(`conversation:${chatbotId}:`);
      return c.json({
        conversations: conversations.map(item => JSON.parse(item.value))
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      });
    }

    // Get all conversations for user's chatbots
    const userChatbots = await kv.getByPrefix(`chatbot:${userId}:`);
    const allConversations = [];
    
    for (const chatbotItem of userChatbots) {
      const chatbot = JSON.parse(chatbotItem.value);
      const conversations = await kv.getByPrefix(`conversation:${chatbot.id}:`);
      allConversations.push(...conversations.map(item => JSON.parse(item.value)));
    }

    return c.json({
      conversations: allConversations.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
    });
  } catch (error) {
    console.log('Get conversations error:', error);
    return c.json({ error: 'Failed to fetch conversations' }, 500);
  }
});

// Settings endpoints
app.get("/make-server-97ac60b8/settings", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const settingsData = await kv.get(`settings:${userId}`);
    
    const settings = settingsData ? JSON.parse(settingsData) : {
      whatsappBusinessId: '',
      whatsappAccessToken: '',
      whatsappPhoneNumberId: '',
      webhookUrl: '',
      verifyToken: ''
    };

    return c.json({ settings });
  } catch (error) {
    console.log('Get settings error:', error);
    return c.json({ error: 'Failed to fetch settings' }, 500);
  }
});

app.put("/make-server-97ac60b8/settings", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const settings = await c.req.json();
    
    await kv.set(`settings:${userId}`, JSON.stringify({
      ...settings,
      updatedAt: new Date().toISOString()
    }));

    return c.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    console.log('Update settings error:', error);
    return c.json({ error: 'Failed to update settings' }, 500);
  }
});

// WhatsApp message processing function
async function processWhatsAppMessage(message: any, value: any) {
  try {
    const userPhone = message.from;
    const messageText = message.text?.body || '';
    const messageType = message.type;

    console.log(`Processing message from ${userPhone}: ${messageText}`);

    // Find active conversation or create new one
    let conversation = await findOrCreateConversation(userPhone, value);
    
    if (!conversation) {
      console.log('Failed to find or create conversation');
      return;
    }

    // Add user message to conversation
    const userMessage: ConversationMessage = {
      id: crypto.randomUUID(),
      type: 'user',
      content: messageText,
      timestamp: new Date().toISOString()
    };

    conversation.messages.push(userMessage);

    // Process the message and generate response
    const response = await generateChatbotResponse(conversation, messageText);
    
    if (response) {
      // Add bot response to conversation
      const botMessage: ConversationMessage = {
        id: crypto.randomUUID(),
        type: 'bot',
        content: response.content,
        timestamp: new Date().toISOString(),
        questionId: response.questionId
      };

      conversation.messages.push(botMessage);
      conversation.currentQuestionId = response.nextQuestionId;
      conversation.updatedAt = new Date().toISOString();

      // Save conversation
      await kv.set(`conversation:${conversation.chatbotId}:${conversation.id}`, JSON.stringify(conversation));

      // Send response via WhatsApp
      await sendWhatsAppMessage(userPhone, response.content, response.options);

      // Update analytics
      await updateAnalytics(conversation.chatbotId, conversation);
    }

  } catch (error) {
    console.log('Error processing WhatsApp message:', error);
  }
}

async function findOrCreateConversation(userPhone: string, value: any): Promise<Conversation | null> {
  try {
    // Find existing active conversation
    const conversations = await kv.getByPrefix(`conversation:`);
    const activeConversation = conversations
      .map(item => JSON.parse(item.value))
      .find((conv: Conversation) => conv.userPhone === userPhone && conv.status === 'active');

    if (activeConversation) {
      return activeConversation;
    }

    // Create new conversation - find the first available chatbot for now
    // In production, you'd implement routing logic based on WhatsApp number
    const allChatbots = await kv.getByPrefix(`chatbot:`);
    if (allChatbots.length === 0) {
      console.log('No chatbots available');
      return null;
    }

    const firstChatbot = JSON.parse(allChatbots[0].value);
    
    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      chatbotId: firstChatbot.id,
      userPhone,
      messages: [],
      currentQuestionId: undefined,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(`conversation:${firstChatbot.id}:${newConversation.id}`, JSON.stringify(newConversation));
    return newConversation;

  } catch (error) {
    console.log('Error finding/creating conversation:', error);
    return null;
  }
}

async function generateChatbotResponse(conversation: Conversation, userMessage: string): Promise<{
  content: string;
  questionId?: string;
  nextQuestionId?: string;
  options?: string[];
} | null> {
  try {
    // Get chatbot data
    const chatbotData = await kv.getByPrefix(`chatbot:`);
    const chatbot = chatbotData
      .map(item => JSON.parse(item.value))
      .find((cb: Chatbot) => cb.id === conversation.chatbotId);
    
    if (!chatbot || !chatbot.questions.length) {
      return { content: "I'm sorry, I'm not configured properly. Please contact support." };
    }

    // If no current question, start with welcome message
    if (!conversation.currentQuestionId) {
      const welcomeQuestion = chatbot.questions.find((q: Question) => q.isWelcome) || chatbot.questions[0];
      
      return {
        content: welcomeQuestion.question,
        questionId: welcomeQuestion.id,
        nextQuestionId: welcomeQuestion.id,
        options: welcomeQuestion.type === 'options' ? welcomeQuestion.options : undefined
      };
    }

    // Find current question
    const currentQuestion = chatbot.questions.find((q: Question) => q.id === conversation.currentQuestionId);
    
    if (!currentQuestion) {
      return { content: "Thank you for your message. Our team will get back to you soon." };
    }

    // Handle different question types
    if (currentQuestion.type === 'text') {
      return {
        content: currentQuestion.answer || "Thank you for your message. Our team will get back to you soon.",
        questionId: currentQuestion.id
      };
    }

    if (currentQuestion.type === 'options') {
      // Find if user's message matches any option
      const selectedOption = currentQuestion.options?.find(option => 
        option.toLowerCase().includes(userMessage.toLowerCase()) || 
        userMessage.toLowerCase().includes(option.toLowerCase())
      );

      if (selectedOption) {
        // Find follow-up question for this option
        const followUpQuestion = chatbot.questions.find((q: Question) => 
          q.parentQuestionId === currentQuestion.id && q.triggerOption === selectedOption
        );

        if (followUpQuestion) {
          return {
            content: followUpQuestion.question,
            questionId: followUpQuestion.id,
            nextQuestionId: followUpQuestion.id,
            options: followUpQuestion.type === 'options' ? followUpQuestion.options : undefined
          };
        }
      }

      return {
        content: `Thank you for selecting "${userMessage}". Our team will help you with this request.`,
        questionId: currentQuestion.id
      };
    }

    return { content: "I'm not sure how to help with that. Can you please rephrase your question?" };

  } catch (error) {
    console.log('Error generating chatbot response:', error);
    return { content: "I'm sorry, there was an error processing your request. Please try again." };
  }
}

async function sendWhatsAppMessage(to: string, text: string, options?: string[]) {
  try {
    const accessToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
    const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');

    if (!accessToken || !phoneNumberId) {
      console.log('WhatsApp credentials not configured');
      return;
    }

    let messageData;

    if (options && options.length > 0) {
      // Send interactive message with buttons
      messageData = {
        messaging_product: "whatsapp",
        to: to,
        type: "interactive",
        interactive: {
          type: "button",
          body: {
            text: text
          },
          action: {
            buttons: options.slice(0, 3).map((option, index) => ({
              type: "reply",
              reply: {
                id: `option_${index}`,
                title: option
              }
            }))
          }
        }
      };
    } else {
      // Send simple text message
      messageData = {
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: {
          body: text
        }
      };
    }

    const response = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messageData)
    });

    if (!response.ok) {
      const error = await response.text();
      console.log('WhatsApp API error:', error);
    } else {
      console.log('WhatsApp message sent successfully');
    }

  } catch (error) {
    console.log('Error sending WhatsApp message:', error);
  }
}

async function updateAnalytics(chatbotId: string, conversation: Conversation) {
  try {
    const analyticsData = await kv.get(`analytics:${chatbotId}`);
    let analytics: Analytics = analyticsData ? JSON.parse(analyticsData) : {
      chatbotId,
      totalConversations: 0,
      completedConversations: 0,
      averageResponseTime: 0,
      popularQuestions: [],
      dailyStats: []
    };

    // Update total conversations
    if (conversation.messages.length === 2) { // First user message + first bot message
      analytics.totalConversations++;
    }

    // Update completion status
    if (conversation.status === 'completed') {
      analytics.completedConversations++;
    }

    // Update daily stats
    const today = new Date().toISOString().split('T')[0];
    let todayStats = analytics.dailyStats.find(stat => stat.date === today);
    
    if (!todayStats) {
      todayStats = { date: today, conversations: 0, completions: 0 };
      analytics.dailyStats.push(todayStats);
    }

    if (conversation.messages.length === 2) {
      todayStats.conversations++;
    }

    if (conversation.status === 'completed') {
      todayStats.completions++;
    }

    // Keep only last 30 days
    analytics.dailyStats = analytics.dailyStats
      .filter(stat => {
        const statDate = new Date(stat.date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return statDate >= thirtyDaysAgo;
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    await kv.set(`analytics:${chatbotId}`, JSON.stringify(analytics));

  } catch (error) {
    console.log('Error updating analytics:', error);
  }
}

// Demo account initialization
const DEMO_EMAIL = 'demo@chatflow.com';
const DEMO_PASSWORD = 'demo123456';

async function initializeDemoAccount() {
  try {
    // Check if demo account exists
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const demoUser = existingUser?.users?.find(u => u.email === DEMO_EMAIL);
    
    let userId: string;
    
    if (!demoUser) {
      // Create demo account
      const { data, error } = await supabase.auth.admin.createUser({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
        user_metadata: { name: 'Demo User' },
        email_confirm: true
      });
      
      if (error) {
        console.log('Failed to create demo account:', error);
        return false;
      }
      
      userId = data.user!.id;
      console.log('Demo account created successfully');
    } else {
      userId = demoUser.id;
      console.log('Demo account already exists');
    }
    
    // Check if demo data already exists
    const existingChatbots = await kv.getByPrefix(`chatbot:${userId}:`);
    if (existingChatbots.length > 0) {
      console.log('Demo data already initialized');
      return true;
    }
    
    // Create sample chatbots
    const chatbot1: Chatbot = {
      id: crypto.randomUUID(),
      name: 'Customer Support Bot',
      description: 'Automated customer support with FAQ and ticket creation',
      questions: [
        {
          id: 'welcome-1',
          type: 'text',
          question: 'Hello! 👋 Welcome to our customer support. How can I help you today?',
          isWelcome: true
        },
        {
          id: 'main-menu',
          type: 'options',
          question: 'Please choose from the following options:',
          options: ['Product Info', 'Technical Support', 'Billing Question', 'Speak to Agent'],
          optionFlows: [
            { optionText: 'Product Info', nextQuestionId: 'product-info' },
            { optionText: 'Technical Support', nextQuestionId: 'tech-support' },
            { optionText: 'Billing Question', nextQuestionId: 'billing' },
            { optionText: 'Speak to Agent', nextQuestionId: 'agent' }
          ]
        },
        {
          id: 'product-info',
          type: 'text',
          question: 'Our products include:\n\n• Premium Plan - $29/month\n• Business Plan - $99/month\n• Enterprise Plan - Custom pricing\n\nWould you like more details about any specific plan?',
          parentQuestionId: 'main-menu'
        },
        {
          id: 'tech-support',
          type: 'text',
          question: 'For technical support:\n\n1. Check our documentation at docs.example.com\n2. Email: support@example.com\n3. Emergency hotline: +1-800-SUPPORT\n\nIs there anything specific I can help with?',
          parentQuestionId: 'main-menu'
        },
        {
          id: 'billing',
          type: 'text',
          question: 'For billing inquiries, please contact:\n\nEmail: billing@example.com\nPhone: +1-800-BILLING\n\nOur billing team is available Mon-Fri, 9AM-5PM EST.',
          parentQuestionId: 'main-menu'
        },
        {
          id: 'agent',
          type: 'text',
          question: 'I\'ll connect you with a live agent. Please hold...\n\nEstimated wait time: 2-3 minutes',
          parentQuestionId: 'main-menu'
        }
      ],
      settings: {
        enableWhatsApp: true,
        enableWebsite: true,
        whatsappNumber: '+1234567890'
      },
      isActive: true,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      userId
    };
    
    const chatbot2: Chatbot = {
      id: crypto.randomUUID(),
      name: 'Lead Generation Bot',
      description: 'Qualify leads and schedule appointments',
      questions: [
        {
          id: 'welcome-2',
          type: 'text',
          question: 'Hi there! 🎯 I\'m here to help you learn more about our services. What\'s your name?',
          isWelcome: true
        },
        {
          id: 'company',
          type: 'text',
          question: 'Nice to meet you! What company do you work for?'
        },
        {
          id: 'interest',
          type: 'options',
          question: 'What are you most interested in?',
          options: ['Marketing Services', 'Sales Tools', 'Analytics Platform', 'Custom Solution'],
          optionFlows: [
            { optionText: 'Marketing Services', nextQuestionId: 'schedule' },
            { optionText: 'Sales Tools', nextQuestionId: 'schedule' },
            { optionText: 'Analytics Platform', nextQuestionId: 'schedule' },
            { optionText: 'Custom Solution', nextQuestionId: 'schedule' }
          ]
        },
        {
          id: 'schedule',
          type: 'text',
          question: 'Great choice! Would you like to schedule a demo? Please reply with your preferred time (e.g., "Tomorrow at 2PM") or email address and we\'ll reach out.',
          parentQuestionId: 'interest'
        }
      ],
      settings: {
        enableWhatsApp: true,
        enableWebsite: true
      },
      isActive: true,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      userId
    };
    
    const chatbot3: Chatbot = {
      id: crypto.randomUUID(),
      name: 'Restaurant Reservation Bot',
      description: 'Handle table reservations and menu inquiries',
      questions: [
        {
          id: 'welcome-3',
          type: 'text',
          question: 'Welcome to The Gourmet Restaurant! 🍽️ How can I assist you today?',
          isWelcome: true
        },
        {
          id: 'action',
          type: 'options',
          question: 'What would you like to do?',
          options: ['Make Reservation', 'View Menu', 'Check Hours', 'Contact Us'],
          optionFlows: [
            { optionText: 'Make Reservation', nextQuestionId: 'reservation' },
            { optionText: 'View Menu', nextQuestionId: 'menu' },
            { optionText: 'Check Hours', nextQuestionId: 'hours' },
            { optionText: 'Contact Us', nextQuestionId: 'contact' }
          ]
        },
        {
          id: 'reservation',
          type: 'text',
          question: 'I\'d be happy to help with your reservation!\n\nPlease provide:\n• Date and time\n• Number of guests\n• Any special requests\n\nExample: "Tomorrow at 7PM, party of 4, window table"',
          parentQuestionId: 'action'
        },
        {
          id: 'menu',
          type: 'text',
          question: 'Our menu highlights:\n\n🥗 Appetizers: $8-$15\n🍝 Main Courses: $18-$35\n🍰 Desserts: $7-$12\n🍷 Wine List available\n\nView full menu: restaurant.com/menu',
          parentQuestionId: 'action'
        },
        {
          id: 'hours',
          type: 'text',
          question: 'Our hours:\n\n• Monday-Thursday: 5PM-10PM\n• Friday-Saturday: 5PM-11PM\n• Sunday: 4PM-9PM\n\nClosed on major holidays',
          parentQuestionId: 'action'
        },
        {
          id: 'contact',
          type: 'text',
          question: 'Contact us:\n\n📍 123 Main St, City, ST 12345\n📞 (555) 123-4567\n📧 info@restaurant.com\n\nFollow us @gourmetrestaurant',
          parentQuestionId: 'action'
        }
      ],
      settings: {
        enableWhatsApp: true,
        enableWebsite: true
      },
      isActive: false,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      userId
    };
    
    // Save chatbots
    await kv.set(`chatbot:${userId}:${chatbot1.id}`, JSON.stringify(chatbot1));
    await kv.set(`chatbot:${userId}:${chatbot2.id}`, JSON.stringify(chatbot2));
    await kv.set(`chatbot:${userId}:${chatbot3.id}`, JSON.stringify(chatbot3));
    
    // Create sample conversations and analytics
    const generateSampleConversations = async (chatbotId: string, count: number) => {
      const analytics: Analytics = {
        chatbotId,
        totalConversations: count,
        completedConversations: Math.floor(count * 0.7),
        averageResponseTime: 2.5,
        popularQuestions: [],
        dailyStats: []
      };
      
      // Generate daily stats for past 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const conversations = Math.floor(Math.random() * 15) + 5;
        const completions = Math.floor(conversations * (0.6 + Math.random() * 0.3));
        
        analytics.dailyStats.push({
          date: dateStr,
          conversations,
          completions
        });
      }
      
      await kv.set(`analytics:${chatbotId}`, JSON.stringify(analytics));
      
      // Create a few sample conversations
      for (let i = 0; i < Math.min(count, 5); i++) {
        const conversation: Conversation = {
          id: crypto.randomUUID(),
          chatbotId,
          userPhone: `+1555${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
          messages: [
            {
              id: crypto.randomUUID(),
              type: 'bot',
              content: 'Hello! How can I help you?',
              timestamp: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString()
            },
            {
              id: crypto.randomUUID(),
              type: 'user',
              content: 'I need some information',
              timestamp: new Date(Date.now() - (i * 24 * 60 * 60 * 1000) + 60000).toISOString()
            }
          ],
          status: i % 3 === 0 ? 'completed' : 'active',
          createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString(),
          updatedAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000) + 120000).toISOString()
        };
        
        await kv.set(`conversation:${chatbotId}:${conversation.id}`, JSON.stringify(conversation));
      }
    };
    
    // Generate analytics and conversations for each chatbot
    await generateSampleConversations(chatbot1.id, 156);
    await generateSampleConversations(chatbot2.id, 89);
    await generateSampleConversations(chatbot3.id, 45);
    
    // Create settings
    const settings = {
      whatsappAccessToken: '',
      whatsappPhoneNumberId: '',
      webhookVerifyToken: 'demo_verify_token_12345'
    };
    await kv.set(`settings:${userId}`, JSON.stringify(settings));
    
    console.log('Demo data initialized successfully');
    return true;
    
  } catch (error) {
    console.log('Error initializing demo account:', error);
    return false;
  }
}

// Initialize demo account on server startup
initializeDemoAccount().then(success => {
  if (success) {
    console.log('✅ Demo account ready');
  } else {
    console.log('⚠️ Demo account initialization skipped or failed');
  }
});

// Demo initialization endpoint (can be called manually if needed)
app.post("/make-server-97ac60b8/init-demo", async (c) => {
  try {
    const success = await initializeDemoAccount();
    
    if (success) {
      return c.json({ message: 'Demo account initialized successfully' });
    } else {
      return c.json({ error: 'Failed to initialize demo account' }, 500);
    }
  } catch (error) {
    console.log('Init demo endpoint error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

Deno.serve(app.fetch);