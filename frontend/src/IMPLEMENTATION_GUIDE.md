# Implementation Guide for Developers

## Table of Contents
1. [Quick Start](#quick-start)
2. [Project Structure](#project-structure)
3. [Design System](#design-system)
4. [Core Components Implementation](#core-components-implementation)
5. [Form Builder & Templates](#form-builder--templates)
6. [Backend Implementation](#backend-implementation)
7. [WhatsApp Integration](#whatsapp-integration)
8. [Common Patterns](#common-patterns)
9. [Troubleshooting](#troubleshooting)

---

## Quick Start

### For New Developers

```bash
# 1. Clone and install
git clone <repository-url>
cd whatsapp-chatbot-platform
npm install

# 2. Set up Supabase (get credentials from team lead)
# Copy .env.example to .env and fill in values

# 3. Run development server
npm run dev

# 4. Access application
# http://localhost:3000

# 5. Login with demo account
# Email: demo@chatflow.com
# Password: demo123456
```

### Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │  App.tsx     │→ │ Components   │→ │ UI Library│ │
│  │  (Router)    │  │ (Business)   │  │ (shadcn)  │ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
│         ↓                                            │
│  ┌──────────────────────────────────────────────┐  │
│  │         utils/api.ts (API Client)            │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                       ↓ HTTPS
┌─────────────────────────────────────────────────────┐
│              SUPABASE EDGE FUNCTIONS                 │
│  ┌──────────────────────────────────────────────┐  │
│  │  supabase/functions/server/index.tsx         │  │
│  │  (Hono Web Framework)                        │  │
│  │  - /signup, /session, /chatbots, /webhook    │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                       ↓ SQL
┌─────────────────────────────────────────────────────┐
│               POSTGRESQL DATABASE                    │
│  ┌──────────────────────────────────────────────┐  │
│  │  kv_store_97ac60b8 (Key-Value Store)         │  │
│  │  - Users, Chatbots, Conversations, Analytics │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## Project Structure

```
/
├── App.tsx                    # Main entry point & routing
├── components/
│   ├── ChatbotBuilder.tsx     # Main chatbot creation UI
│   ├── FormBuilder.tsx        # Form template builder ⭐
│   ├── FlowBuilder.tsx        # Visual flow diagram
│   ├── ChatbotList.tsx        # List of chatbots
│   ├── ChatbotPreview.tsx     # Interactive preview
│   ├── AnalyticsDashboard.tsx # Metrics & charts
│   ├── IntegrationPanel.tsx   # Embed code generator
│   ├── WhatsAppSettings.tsx   # API configuration
│   ├── AuthPage.tsx           # Login/Signup
│   └── ui/                    # shadcn components
├── utils/
│   ├── api.ts                 # Frontend API client
│   └── supabase/
│       └── info.tsx           # Supabase credentials
├── supabase/functions/server/
│   ├── index.tsx              # Main server file ⭐
│   └── kv_store.tsx           # DB utilities (protected)
├── styles/
│   └── globals.css            # Tailwind V4 design system ⭐
└── guidelines/
    └── Guidelines.md          # Design principles

⭐ = Critical files for this implementation
```

---

## Design System

### Design Principles

Our application follows **Ultra-Clean Design** principles:

1. **Maximum White Space**: Generous padding and margins
2. **Minimal Color Palette**: Primary blue, neutral grays
3. **Clear Typography Hierarchy**: Defined heading levels
4. **Essential Elements Only**: Remove unnecessary decorations

### Tailwind V4 Variables (globals.css)

```css
/* Key spacing values - USE THESE */
--spacing-xs: 0.25rem;    /* 4px */
--spacing-sm: 0.5rem;     /* 8px */
--spacing-md: 1rem;       /* 16px */
--spacing-lg: 1.5rem;     /* 24px */
--spacing-xl: 2rem;       /* 32px */
--spacing-2xl: 3rem;      /* 48px */
--spacing-3xl: 4rem;      /* 64px */

/* Border radius */
--radius-sm: 0.375rem;    /* 6px */
--radius-md: 0.5rem;      /* 8px */
--radius-lg: 0.625rem;    /* 10px - default */

/* Colors */
--primary: oklch(0.465 0.243 264.376);    /* Blue */
--foreground: oklch(0.145 0 0);           /* Almost black */
--muted-foreground: #6b7280;              /* Gray */
--border: rgba(0, 0, 0, 0.1);             /* Light border */
```

### Typography Rules

**IMPORTANT**: Do NOT use font-size, font-weight, or line-height classes unless explicitly needed!

```tsx
// ❌ DON'T DO THIS
<h1 className="text-3xl font-bold">Title</h1>

// ✅ DO THIS
<h1>Title</h1>  // globals.css handles sizing

// ✅ ONLY override when necessary
<h1 className="text-4xl">Larger Title</h1>
```

Default typography (from globals.css):
- `<h1>`: 1.875rem (30px), bold, tight leading
- `<h2>`: 1.5rem (24px), semibold
- `<h3>`: 1.25rem (20px), semibold
- `<p>`: 1rem (16px), normal weight
- `<small>`: 0.875rem (14px)

### Spacing Patterns

```tsx
// Ultra-clean spacing pattern
<div className="space-y-8">         {/* 32px vertical spacing */}
  <Card className="p-6">            {/* 24px padding */}
    <h3 className="mb-4">Title</h3> {/* 16px bottom margin */}
    <div className="space-y-4">     {/* 16px between items */}
      {/* Content */}
    </div>
  </Card>
</div>
```

---

## Core Components Implementation

### 1. ChatbotBuilder Component

**Purpose**: Main interface for creating and editing chatbots

**Key Features**:
- Tabbed interface (Questions, Form, Visual Flow)
- Nested question support (unlimited depth)
- Form template integration
- Real-time preview

**State Management**:
```typescript
const [chatbotName, setChatbotName] = useState('');
const [questions, setQuestions] = useState<Question[]>([]);
const [formConfig, setFormConfig] = useState<FormConfig>({
  title: 'Contact Information',
  position: 'none',
  fields: [],
  submitButtonText: 'Submit'
});
```

**Important Functions**:

```typescript
// Add main question
const addQuestion = () => {
  const newQuestion: Question = {
    id: Date.now().toString(),
    type: 'text',
    question: '',
    answer: ''
  };
  setQuestions([...questions, newQuestion]);
};

// Create follow-up question (nested)
const createFollowUpQuestion = (parentId: string, triggerOption: string) => {
  const newQuestion: Question = {
    id: Date.now().toString(),
    type: 'text',
    question: '',
    parentQuestionId: parentId,
    triggerOption: triggerOption
  };
  setQuestions([...questions, newQuestion]);
};

// Save chatbot
const saveChatbot = async () => {
  const data = {
    name: chatbotName,
    description: chatbotDescription,
    questions,
    formConfig,  // ⭐ Include form configuration
    settings: { enableWhatsApp, enableWebsite }
  };
  
  if (chatbotId) {
    await updateChatbot(chatbotId, data);
  } else {
    await createChatbot(data);
  }
};
```

**Nested Question Calculation**:
```typescript
// Calculate depth of nested question
const getQuestionDepth = (questionId: string): number => {
  const question = questions.find(q => q.id === questionId);
  if (!question || !question.parentQuestionId) return 0;
  return 1 + getQuestionDepth(question.parentQuestionId);
};

// Get full ancestor chain
const getAncestorChain = (questionId: string): Question[] => {
  const question = questions.find(q => q.id === questionId);
  if (!question || !question.parentQuestionId) return [];
  const parent = questions.find(q => q.id === question.parentQuestionId);
  if (!parent) return [];
  return [...getAncestorChain(parent.id), parent];
};
```

---

### 2. FormBuilder Component ⭐

**Purpose**: Visual form builder with pre-configured templates

**Location**: `/components/FormBuilder.tsx`

#### Template System

**Available Templates**:

1. **Contact Form** (Most Common)
   ```typescript
   {
     title: 'Contact Information',
     description: 'Please provide your contact details so we can reach you',
     position: 'end',  // Shows AFTER conversation
     submitButtonText: 'Submit',
     fields: [
       { label: 'Full Name', type: 'text', required: true },
       { label: 'Email Address', type: 'email', required: true },
       { label: 'Phone Number', type: 'phone', required: false },
       { label: 'Message', type: 'textarea', required: false }
     ]
   }
   ```

2. **Lead Capture** (B2B)
   ```typescript
   {
     title: 'Get Started',
     description: 'Share your details and we\'ll be in touch shortly',
     position: 'end',
     submitButtonText: 'Get Started',
     fields: [
       { label: 'Your Name', type: 'text', required: true },
       { label: 'Work Email', type: 'email', required: true },
       { label: 'Phone Number', type: 'phone', required: true }
     ]
   }
   ```

3. **Feedback Form** (Post-Interaction)
   ```typescript
   {
     title: 'Share Your Feedback',
     description: 'Help us improve by sharing your thoughts',
     position: 'end',
     submitButtonText: 'Send Feedback',
     fields: [
       { label: 'Name (Optional)', type: 'text', required: false },
       { label: 'Email (Optional)', type: 'email', required: false },
       { label: 'Your Feedback', type: 'textarea', required: true }
     ]
   }
   ```

#### Implementation Details

**Template Application**:
```typescript
const applyTemplate = (templateKey: keyof typeof formTemplates) => {
  const template = formTemplates[templateKey];
  
  onChange({
    ...form,
    ...template,
    // Generate unique IDs to avoid conflicts
    fields: template.fields.map(field => ({
      ...field,
      id: `field-${Date.now()}-${field.id}`
    }))
  });
  
  toast.success('Template applied successfully!');
};
```

**Field Types**:
```typescript
type FieldType = 'text' | 'email' | 'phone' | 'number' | 'date' | 'textarea';

const fieldTypeIcons = {
  text: User,
  email: Mail,
  phone: Phone,
  number: Hash,
  date: Calendar,
  textarea: MessageSquare
};
```

**Drag-and-Drop Reordering**:
```typescript
const handleDragStart = (index: number) => {
  setDraggedIndex(index);
};

const handleDragOver = (e: React.DragEvent, index: number) => {
  e.preventDefault();
  if (draggedIndex === null || draggedIndex === index) return;

  const newFields = [...form.fields];
  const draggedItem = newFields[draggedIndex];
  
  // Remove from old position
  newFields.splice(draggedIndex, 1);
  // Insert at new position
  newFields.splice(index, 0, draggedItem);

  // Update order property
  onChange({
    ...form,
    fields: newFields.map((field, idx) => ({ ...field, order: idx }))
  });
  
  setDraggedIndex(index);
};
```

#### UI Structure

```tsx
<FormBuilder form={formConfig} onChange={setFormConfig} />

// Renders:
{
  formConfig.position === 'none' ? (
    // Show template selector
    <TemplateButtons />
  ) : (
    // Show form editor
    <FormEditor />
  )
}
```

**Template Selector UI**:
```tsx
<Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
  <h3>Quick Start Templates</h3>
  
  <div className="grid grid-cols-3 gap-3">
    <Button onClick={() => applyTemplate('contact')}>
      <Mail className="h-4 w-4" />
      Contact Form
    </Button>
    
    <Button onClick={() => applyTemplate('leadCapture')}>
      <User className="h-4 w-4" />
      Lead Capture
    </Button>
    
    <Button onClick={() => applyTemplate('feedback')}>
      <MessageSquare className="h-4 w-4" />
      Feedback Form
    </Button>
  </div>
</Card>
```

---

### 3. Integration with ChatbotBuilder

The FormBuilder is integrated into ChatbotBuilder via tabs:

```tsx
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList>
    <TabsTrigger value="questions">Questions & Flow</TabsTrigger>
    <TabsTrigger value="form">Data Collection Form</TabsTrigger>
    <TabsTrigger value="flow">Visual Flow</TabsTrigger>
  </TabsList>

  <TabsContent value="form">
    <FormBuilder
      form={formConfig}
      onChange={setFormConfig}
    />
  </TabsContent>
</Tabs>
```

When saving the chatbot, the form configuration is included:

```typescript
const saveChatbot = async () => {
  await createChatbot({
    name: chatbotName,
    questions: questions,
    formConfig: formConfig,  // ⭐ Saved with chatbot
    settings: settings
  });
};
```

---

## Backend Implementation

### Server Structure (index.tsx)

```typescript
import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Routes
app.post('/make-server-97ac60b8/signup', async (c) => { /* ... */ });
app.post('/make-server-97ac60b8/chatbots', async (c) => { /* ... */ });
app.get('/make-server-97ac60b8/chatbots/:id', async (c) => { /* ... */ });

// Start server
Deno.serve(app.fetch);
```

### Key-Value Store Usage

**Important**: Do NOT modify `/supabase/functions/server/kv_store.tsx` - it's protected!

```typescript
import * as kv from './kv_store.tsx';

// Store data
await kv.set('chatbot:123', {
  name: 'Support Bot',
  questions: [...],
  formConfig: {...}
});

// Retrieve data
const chatbot = await kv.get('chatbot:123');

// Get multiple items
const chatbots = await kv.mget([
  'chatbot:123',
  'chatbot:456'
]);

// Get by prefix
const allChatbots = await kv.getByPrefix('chatbot:');

// Delete
await kv.del('chatbot:123');
```

### Authentication Middleware

```typescript
async function requireAuth(c: Context) {
  const token = c.req.header('Authorization')?.split(' ')[1];
  
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  return user;
}

// Use in routes
app.get('/make-server-97ac60b8/chatbots', async (c) => {
  const user = await requireAuth(c);
  if (!user.id) return; // Already returned 401
  
  // Continue with authenticated request
});
```

---

## WhatsApp Integration

### Webhook Handler

```typescript
app.post('/make-server-97ac60b8/webhook', async (c) => {
  try {
    const body = await c.req.json();
    
    // Extract message
    const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message) {
      return c.json({ status: 'ok' });
    }
    
    const userPhone = message.from;
    const userMessage = message.text?.body;
    
    // Get active chatbot for this number
    const chatbot = await getActiveChatbot(userPhone);
    
    // Get conversation state
    const conversationKey = `conversation:${chatbot.id}:${userPhone}`;
    const conversation = await kv.get(conversationKey) || {
      current_question_id: null,
      messages: [],
      form_data: {}
    };
    
    // Process message and get response
    const response = await processUserMessage(
      userMessage,
      conversation,
      chatbot
    );
    
    // Send WhatsApp reply
    await sendWhatsAppMessage(userPhone, response.message);
    
    // Update conversation state
    await kv.set(conversationKey, response.updatedConversation);
    
    return c.json({ status: 'ok' });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});
```

### Sending Messages

```typescript
async function sendWhatsAppMessage(to: string, message: string) {
  const PHONE_NUMBER_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
  const ACCESS_TOKEN = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
  
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: message }
      })
    }
  );
  
  if (!response.ok) {
    const error = await response.text();
    console.error('WhatsApp API error:', error);
    throw new Error(`Failed to send message: ${error}`);
  }
  
  return response.json();
}
```

### Handling Form Submissions via WhatsApp

When a user reaches the form stage:

```typescript
// Check if we should show form
if (shouldShowForm(conversation, chatbot)) {
  const formConfig = chatbot.formConfig;
  
  // Ask for first field
  const firstField = formConfig.fields[0];
  return {
    message: `${formConfig.title}\n\n${firstField.label}:`,
    updatedConversation: {
      ...conversation,
      current_form_field: 0,
      form_started: true
    }
  };
}

// Collect form data
if (conversation.form_started) {
  const currentFieldIndex = conversation.current_form_field;
  const field = formConfig.fields[currentFieldIndex];
  
  // Validate input
  if (field.required && !userMessage.trim()) {
    return {
      message: `This field is required. Please enter your ${field.label}:`,
      updatedConversation: conversation
    };
  }
  
  // Store field data
  conversation.form_data[field.id] = userMessage;
  
  // Move to next field or complete
  if (currentFieldIndex + 1 < formConfig.fields.length) {
    const nextField = formConfig.fields[currentFieldIndex + 1];
    return {
      message: `${nextField.label}:`,
      updatedConversation: {
        ...conversation,
        current_form_field: currentFieldIndex + 1
      }
    };
  } else {
    // Form complete!
    await kv.set(
      `form_submission:${chatbot.id}:${Date.now()}`,
      {
        chatbot_id: chatbot.id,
        user_phone: userPhone,
        data: conversation.form_data,
        submitted_at: new Date().toISOString()
      }
    );
    
    return {
      message: `Thank you! Your information has been submitted.`,
      updatedConversation: {
        ...conversation,
        form_completed: true
      }
    };
  }
}
```

---

## Common Patterns

### 1. Loading States

```tsx
const [isLoading, setIsLoading] = useState(false);

const loadData = async () => {
  try {
    setIsLoading(true);
    const data = await api.getData();
    setData(data);
  } catch (error) {
    toast.error('Failed to load data');
  } finally {
    setIsLoading(false);
  }
};

// In render
{isLoading ? (
  <div className="flex items-center justify-center py-16">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
  </div>
) : (
  <Content />
)}
```

### 2. Error Handling

```typescript
try {
  await riskyOperation();
  toast.success('Success!');
} catch (error: any) {
  console.error('Operation failed:', error);
  toast.error(error.message || 'Something went wrong');
}
```

### 3. Form Validation

```typescript
const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validatePhone = (phone: string) => {
  return /^\+?[\d\s-()]+$/.test(phone);
};

// In form submission
if (!validateEmail(email)) {
  toast.error('Please enter a valid email address');
  return;
}
```

### 4. API Client Pattern

```typescript
// utils/api.ts
import { projectId, publicAnonKey } from './supabase/info';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-97ac60b8`;

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('access_token') || publicAnonKey;
  
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }
  
  return response.json();
}

export const api = {
  getChatbots: () => apiRequest('/chatbots'),
  createChatbot: (data) => apiRequest('/chatbots', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  // ... more methods
};
```

---

## Troubleshooting

### Common Issues

#### 1. Form Template Not Showing
**Problem**: Template buttons don't appear  
**Solution**: Ensure `formConfig.position === 'none'`

```typescript
// To reset and show templates
setFormConfig({
  ...formConfig,
  position: 'none',
  fields: []
});
```

#### 2. WhatsApp Messages Not Received
**Checklist**:
- [ ] Webhook URL configured correctly
- [ ] Verify token matches environment variable
- [ ] Messages field subscribed in Meta console
- [ ] Edge function logs show incoming requests
- [ ] Access token is valid

```bash
# Check logs
supabase functions logs make-server-97ac60b8 --tail
```

#### 3. Build Errors
**Common causes**:
- Missing imports
- Type errors in FormConfig
- Tailwind class typos

```bash
# Clear cache and rebuild
rm -rf node_modules
npm install
npm run build
```

#### 4. Database Connection Issues
**Check**:
- Environment variables set
- Database table created
- Supabase project active

```sql
-- Verify table exists
SELECT * FROM kv_store_97ac60b8 LIMIT 1;
```

#### 5. Form Data Not Saving
**Debug**:
```typescript
console.log('Form config before save:', formConfig);
console.log('Chatbot data being sent:', {
  name: chatbotName,
  formConfig
});
```

---

## Best Practices

### Code Style

```typescript
// ✅ Good: Clear naming
const handleFormTemplateApplication = (template: TemplateType) => {
  applyTemplate(template);
};

// ❌ Bad: Unclear naming
const handleClick = (t: string) => {
  doStuff(t);
};
```

### Component Organization

```typescript
// File structure
export function MyComponent({ prop1, prop2 }: Props) {
  // 1. State hooks
  const [state, setState] = useState();
  
  // 2. Effect hooks
  useEffect(() => {}, []);
  
  // 3. Event handlers
  const handleClick = () => {};
  
  // 4. Render helpers
  const renderSection = () => {};
  
  // 5. Main render
  return <div>{renderSection()}</div>;
}
```

### Performance Tips

```typescript
// Use memo for expensive calculations
const expensiveValue = useMemo(
  () => calculateSomething(data),
  [data]
);

// Use callback for event handlers
const handleClick = useCallback(() => {
  doSomething();
}, [dependencies]);
```

---

## Next Steps

1. **Read the DEVELOPER_GUIDE.md** for API documentation
2. **Check PRODUCTION_READY_CHECKLIST.md** before deploying
3. **Review Guidelines.md** for design principles
4. **Test with demo account** (demo@chatflow.com / demo123456)
5. **Create your first chatbot** with form template

---

## Support & Resources

- **Main Documentation**: DEVELOPER_GUIDE.md
- **Design Guidelines**: guidelines/Guidelines.md
- **Supabase Docs**: https://supabase.com/docs
- **WhatsApp API Docs**: https://developers.facebook.com/docs/whatsapp
- **Tailwind V4 Docs**: https://tailwindcss.com/docs

---

*Last Updated: Production Ready - Ready for deployment*
