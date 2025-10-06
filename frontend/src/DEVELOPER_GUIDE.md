# WhatsApp Chatbot Platform - Developer Guide

## Table of Contents
1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Getting Started](#getting-started)
5. [Environment Setup](#environment-setup)
6. [Database Schema](#database-schema)
7. [API Documentation](#api-documentation)
8. [Component Architecture](#component-architecture)
9. [Form Builder & Templates](#form-builder--templates)
10. [WhatsApp Integration](#whatsapp-integration)
11. [Authentication Flow](#authentication-flow)
12. [Deployment Guide](#deployment-guide)
13. [Best Practices](#best-practices)
14. [Troubleshooting](#troubleshooting)
15. [Testing](#testing)

---

## Overview

This is a production-ready WhatsApp chatbot integration platform that allows administrators to create sophisticated chatbots with conditional logic flows, form builders, and website integration capabilities.

### Key Features
- **Visual Chatbot Builder**: Create complex Q&A flows with unlimited nesting
- **Form Builder**: Pre-built templates (Contact, Lead Capture, Feedback) with drag-drop interface
- **WhatsApp Business API Integration**: Full webhook support for real-time messaging
- **Analytics Dashboard**: Track conversation performance and user engagement
- **Website Integration**: Generate embed codes for any website
- **Demo Account**: Pre-populated sample data for testing
- **Authentication**: Secure Supabase auth with social login support

---

## Technology Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS v4.0
- **UI Components**: shadcn/ui
- **Icons**: lucide-react
- **State Management**: React hooks (useState, useEffect)
- **Notifications**: Sonner (toast notifications)

### Backend
- **Platform**: Supabase
- **Edge Functions**: Deno runtime with Hono web framework
- **Database**: PostgreSQL
- **Storage**: Supabase Storage (for file uploads)
- **Authentication**: Supabase Auth

### External Services
- **WhatsApp Business API**: Meta's official API for messaging

---

## Architecture

### Three-Tier Architecture
```
┌─────────────────────────────────────────┐
│         Frontend (React)                │
│  - Components                           │
│  - UI/UX Layer                          │
│  - API Client (utils/api.ts)           │
└──────────────┬──────────────────────────┘
               │ HTTPS
               ▼
┌─────────────────────────────────────────┐
│    Server (Supabase Edge Functions)    │
│  - Hono Web Framework                   │
│  - Business Logic                       │
│  - WhatsApp Webhook Handler             │
│  - API Routes (/make-server-97ac60b8/*) │
└──────────────┬──────────────────────────┘
               │ SQL
               ▼
┌─────────────────────────────────────────┐
│       Database (PostgreSQL)             │
│  - Key-Value Store (kv_store_97ac60b8)  │
│  - User Data                            │
│  - Chatbot Configurations               │
└─────────────────────────────────────────┘
```

### Data Flow
1. **User Action** → Frontend sends request to Edge Function
2. **Edge Function** → Processes request, interacts with database
3. **Database** → Returns data to Edge Function
4. **Edge Function** → Sends response to Frontend
5. **WhatsApp Webhooks** → Edge Function receives and processes messages

---

## Getting Started

### Prerequisites
- Node.js 18+ or Bun
- Supabase account
- WhatsApp Business API access (optional for testing)
- Git

### Local Development Setup

1. **Clone the repository** (if applicable)
```bash
git clone <repository-url>
cd whatsapp-chatbot-platform
```

2. **Install dependencies**
```bash
npm install
# or
bun install
```

3. **Set up environment variables**
Create `.env` file (see Environment Setup section)

4. **Run development server**
```bash
npm run dev
# or
bun dev
```

5. **Access the application**
Open `http://localhost:3000` in your browser

---

## Environment Setup

### Required Environment Variables

The following environment variables are managed by Supabase and must be set:

```env
# Supabase Configuration (Auto-configured in Supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_DB_URL=postgresql://postgres:password@db.project.supabase.co:5432/postgres

# WhatsApp Business API (User-provided)
WHATSAPP_ACCESS_TOKEN=your-whatsapp-access-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_VERIFY_TOKEN=your-verify-token
```

### How to Obtain WhatsApp Credentials

1. **Create Meta Developer Account**
   - Go to https://developers.facebook.com/
   - Create a new app with WhatsApp Business API

2. **Get Phone Number ID**
   - Navigate to WhatsApp > API Setup
   - Copy the "Phone number ID"

3. **Get Access Token**
   - Navigate to WhatsApp > API Setup
   - Generate a permanent access token
   - Store securely (never commit to git)

4. **Set Verify Token**
   - Create a random secure string
   - Use same token in webhook configuration

### Setting Environment Variables in Supabase

```bash
# Using Supabase CLI
supabase secrets set WHATSAPP_ACCESS_TOKEN=your-token
supabase secrets set WHATSAPP_PHONE_NUMBER_ID=your-id
supabase secrets set WHATSAPP_VERIFY_TOKEN=your-verify-token
```

Or use the Supabase Dashboard:
1. Go to Project Settings > Edge Functions
2. Click "Manage secrets"
3. Add each secret key-value pair

---

## Database Schema

### Key-Value Store Table: `kv_store_97ac60b8`

```sql
CREATE TABLE kv_store_97ac60b8 (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for efficient prefix searches
CREATE INDEX idx_kv_store_key_prefix ON kv_store_97ac60b8 (key text_pattern_ops);
```

### Data Structure Examples

#### User Data
```json
{
  "key": "user:{user_id}",
  "value": {
    "email": "user@example.com",
    "created_at": "2024-01-01T00:00:00Z",
    "settings": {
      "whatsapp_configured": true
    }
  }
}
```

#### Chatbot Configuration
```json
{
  "key": "chatbot:{chatbot_id}",
  "value": {
    "id": "chatbot_123",
    "name": "Customer Support Bot",
    "description": "Handles customer inquiries",
    "questions": [
      {
        "id": "q1",
        "type": "options",
        "question": "How can we help you?",
        "options": ["Sales", "Support", "Billing"],
        "parentQuestionId": null
      }
    ],
    "formConfig": {
      "title": "Contact Information",
      "position": "end",
      "fields": [...]
    },
    "settings": {
      "enableWhatsApp": true,
      "enableWebsite": true
    },
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### Conversation History
```json
{
  "key": "conversation:{chatbot_id}:{user_phone}",
  "value": {
    "chatbot_id": "chatbot_123",
    "user_phone": "+1234567890",
    "messages": [
      {
        "timestamp": "2024-01-01T12:00:00Z",
        "from": "user",
        "message": "Hello"
      },
      {
        "timestamp": "2024-01-01T12:00:05Z",
        "from": "bot",
        "message": "How can we help you?"
      }
    ],
    "current_question_id": "q1",
    "form_data": {},
    "started_at": "2024-01-01T12:00:00Z"
  }
}
```

#### Analytics Data
```json
{
  "key": "analytics:{chatbot_id}:{date}",
  "value": {
    "date": "2024-01-01",
    "total_conversations": 150,
    "completed_conversations": 120,
    "form_submissions": 85,
    "avg_response_time": 2.5,
    "user_satisfaction": 4.2
  }
}
```

---

## API Documentation

### Base URL
```
https://{project-id}.supabase.co/functions/v1/make-server-97ac60b8
```

### Authentication
All requests require Authorization header:
```
Authorization: Bearer {SUPABASE_ANON_KEY}
```

Protected routes (user-specific) require user access token:
```
Authorization: Bearer {USER_ACCESS_TOKEN}
```

### API Endpoints

#### 1. Authentication

**POST `/signup`**
```typescript
// Request
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}

// Response
{
  "user": {
    "id": "user_123",
    "email": "user@example.com"
  }
}
```

**POST `/session`**
```typescript
// Request
{
  "email": "user@example.com",
  "password": "securepassword"
}

// Response
{
  "session": {
    "access_token": "jwt_token",
    "user": {
      "id": "user_123",
      "email": "user@example.com"
    }
  }
}
```

**POST `/signout`**
```typescript
// Request
Headers: { Authorization: "Bearer {access_token}" }

// Response
{
  "message": "Signed out successfully"
}
```

#### 2. Chatbots

**GET `/chatbots`**
```typescript
// Request
Headers: { Authorization: "Bearer {access_token}" }

// Response
{
  "chatbots": [
    {
      "id": "chatbot_123",
      "name": "Customer Support Bot",
      "description": "...",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**GET `/chatbots/:id`**
```typescript
// Response
{
  "chatbot": {
    "id": "chatbot_123",
    "name": "Customer Support Bot",
    "questions": [...],
    "formConfig": {...},
    "settings": {...}
  }
}
```

**POST `/chatbots`**
```typescript
// Request
{
  "name": "New Chatbot",
  "description": "Description",
  "questions": [],
  "formConfig": {
    "position": "end",
    "fields": []
  },
  "settings": {
    "enableWhatsApp": true,
    "enableWebsite": true
  }
}

// Response
{
  "chatbot": { id: "chatbot_456", ... }
}
```

**PUT `/chatbots/:id`**
```typescript
// Request (same as POST)
// Response (updated chatbot object)
```

**DELETE `/chatbots/:id`**
```typescript
// Response
{
  "message": "Chatbot deleted successfully"
}
```

#### 3. Analytics

**GET `/analytics/:chatbotId`**
```typescript
// Query params: ?days=30
// Response
{
  "analytics": {
    "total_conversations": 500,
    "completed_conversations": 420,
    "completion_rate": 84,
    "form_submissions": 350,
    "avg_response_time": 2.3,
    "daily_data": [...]
  }
}
```

#### 4. WhatsApp Webhook

**GET `/webhook`** (Verification)
```typescript
// Query params:
// hub.mode=subscribe
// hub.verify_token={WHATSAPP_VERIFY_TOKEN}
// hub.challenge=challenge_string

// Response: challenge_string
```

**POST `/webhook`** (Message Handler)
```typescript
// Request (from Meta)
{
  "entry": [{
    "changes": [{
      "value": {
        "messages": [{
          "from": "1234567890",
          "text": { "body": "Hello" }
        }]
      }
    }]
  }]
}

// Response
{ "status": "ok" }
```

---

## Component Architecture

### Core Components

#### 1. **App.tsx** (Main Entry Point)
- Manages global authentication state
- Handles routing between sections
- Renders main layout with sidebar navigation
- Displays demo mode banner

```typescript
<App>
  ├── <AuthPage> (if not authenticated)
  └── Main Layout (if authenticated)
      ├── Sidebar Navigation
      └── Content Area
          ├── <ChatbotList>
          ├── <ChatbotBuilder>
          ├── <AnalyticsDashboard>
          ├── <IntegrationPanel>
          └── <WhatsAppSettings>
</App>
```

#### 2. **ChatbotBuilder.tsx**
Main component for creating/editing chatbots.

**Key Features:**
- Three tabs: Questions & Flow, Data Collection Form, Visual Flow
- Question CRUD operations
- Nested follow-up questions (unlimited depth)
- Form integration
- Preview functionality

**Props:**
```typescript
interface ChatbotBuilderProps {
  chatbotId: string | null;  // null = create new
  onBack: () => void;
}
```

#### 3. **FormBuilder.tsx**
Visual form builder with template system.

**Key Features:**
- Pre-built templates (Contact, Lead Capture, Feedback)
- Drag-and-drop field reordering
- Field types: text, email, phone, number, date, textarea
- Position control (start/end/none)
- Template switching

**Props:**
```typescript
interface FormBuilderProps {
  form: FormConfig;
  onChange: (form: FormConfig) => void;
}
```

**FormConfig Interface:**
```typescript
interface FormConfig {
  id?: string;
  title: string;
  description?: string;
  position: 'start' | 'end' | 'none';
  fields: FormField[];
  submitButtonText: string;
}

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'number' | 'date' | 'textarea';
  placeholder?: string;
  required: boolean;
  order: number;
}
```

#### 4. **FlowBuilder.tsx**
Visual representation of conversation flow.

**Features:**
- Shows question hierarchy
- Displays branching logic
- Visual tree structure
- Read-only visualization

#### 5. **ChatbotPreview.tsx**
Interactive preview of chatbot conversation.

**Features:**
- Simulates real conversation flow
- Follows conditional logic
- Shows form integration
- Mobile-like UI

#### 6. **AnalyticsDashboard.tsx**
Performance metrics and insights.

**Metrics:**
- Total conversations
- Completion rate
- Form submissions
- Response times
- Daily trends (charts)

#### 7. **IntegrationPanel.tsx**
Website embed code generator.

**Features:**
- Select chatbot
- Generate embed code
- Copy to clipboard
- Setup instructions

#### 8. **WhatsAppSettings.tsx**
Configure WhatsApp Business API.

**Features:**
- API credentials management
- Webhook URL display
- Connection testing
- Setup guide

---

## Form Builder & Templates

### Template System

The Form Builder includes three pre-configured templates for common use cases:

#### 1. Contact Form Template
```typescript
{
  title: 'Contact Information',
  description: 'Please provide your contact details so we can reach you',
  position: 'end',
  submitButtonText: 'Submit',
  fields: [
    { label: 'Full Name', type: 'text', required: true },
    { label: 'Email Address', type: 'email', required: true },
    { label: 'Phone Number', type: 'phone', required: false },
    { label: 'Message', type: 'textarea', required: false }
  ]
}
```

**Use Case:** General contact forms after customer support conversations

#### 2. Lead Capture Template
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

**Use Case:** B2B lead generation, sales qualification

#### 3. Feedback Form Template
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

**Use Case:** Customer satisfaction surveys, product feedback

### Implementing Templates in Your Application

#### Step 1: Navigate to Form Builder
1. Create or edit a chatbot
2. Click "Data Collection Form" tab
3. Templates appear when form position is set to "none"

#### Step 2: Apply Template
```typescript
// In your component
const applyTemplate = (templateKey: 'contact' | 'leadCapture' | 'feedback') => {
  const template = formTemplates[templateKey];
  setFormConfig({
    ...formConfig,
    ...template,
    fields: template.fields.map(field => ({
      ...field,
      id: `field-${Date.now()}-${field.id}` // Ensure unique IDs
    }))
  });
};
```

#### Step 3: Customize (Optional)
- Modify field labels
- Add/remove fields
- Change required status
- Reorder via drag-and-drop
- Update position (start/end)

#### Step 4: Save
Form configuration is saved with chatbot:
```typescript
await updateChatbot(chatbotId, {
  name: chatbotName,
  questions: questions,
  formConfig: formConfig, // Includes template data
  settings: settings
});
```

### Adding Custom Templates

To add your own template:

```typescript
// In FormBuilder.tsx, add to formTemplates object
const formTemplates = {
  // ... existing templates
  
  customTemplate: {
    title: 'Your Template Name',
    description: 'Description',
    position: 'end' as const,
    submitButtonText: 'Submit',
    fields: [
      {
        id: 'custom-field-1',
        label: 'Field Label',
        type: 'text' as const,
        placeholder: 'Placeholder',
        required: true,
        order: 0
      }
      // ... more fields
    ]
  }
};
```

Then add UI button:
```tsx
<Button onClick={() => applyTemplate('customTemplate')}>
  <div className="flex items-center gap-2">
    <YourIcon className="h-4 w-4" />
    <span>Your Template</span>
  </div>
  <span className="text-xs">Description</span>
</Button>
```

---

## WhatsApp Integration

### Setup Process

#### 1. Configure Meta Developer App
1. Create app at https://developers.facebook.com/
2. Add WhatsApp product
3. Get test phone number or configure business phone number

#### 2. Set Environment Variables
```bash
WHATSAPP_ACCESS_TOKEN=your-permanent-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-id
WHATSAPP_VERIFY_TOKEN=random-secure-string
```

#### 3. Configure Webhook
**Webhook URL:**
```
https://your-project.supabase.co/functions/v1/make-server-97ac60b8/webhook
```

**Subscribe to:**
- messages
- message_status (optional)

**Verify Token:** Same as `WHATSAPP_VERIFY_TOKEN` env variable

#### 4. Test Connection
Send a test message to your WhatsApp number. Check Edge Function logs:
```bash
supabase functions logs make-server-97ac60b8 --tail
```

### Message Flow

```
User sends WhatsApp message
        ↓
Meta sends webhook POST to /webhook
        ↓
Server extracts message & sender
        ↓
Server fetches chatbot configuration
        ↓
Server determines current conversation state
        ↓
Server generates response based on logic
        ↓
Server sends reply via WhatsApp API
        ↓
Server updates conversation state
```

### Webhook Handler Code Structure

```typescript
app.post('/webhook', async (c) => {
  const body = await c.req.json();
  
  // Extract message data
  const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  const userPhone = message?.from;
  const userMessage = message?.text?.body;
  
  // Get conversation state
  const conversationKey = `conversation:${chatbotId}:${userPhone}`;
  const conversation = await kv.get(conversationKey);
  
  // Process message & determine response
  const response = processUserMessage(userMessage, conversation, chatbot);
  
  // Send WhatsApp reply
  await sendWhatsAppMessage(userPhone, response);
  
  // Update conversation state
  await kv.set(conversationKey, updatedConversation);
  
  return c.json({ status: 'ok' });
});
```

### Sending WhatsApp Messages

```typescript
async function sendWhatsAppMessage(to: string, message: string) {
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
    throw new Error(`WhatsApp API error: ${await response.text()}`);
  }
  
  return response.json();
}
```

### Sending Interactive Buttons

```typescript
{
  messaging_product: 'whatsapp',
  to: userPhone,
  type: 'interactive',
  interactive: {
    type: 'button',
    body: { text: 'How can we help you?' },
    action: {
      buttons: [
        { type: 'reply', reply: { id: 'opt1', title: 'Sales' } },
        { type: 'reply', reply: { id: 'opt2', title: 'Support' } }
      ]
    }
  }
}
```

---

## Authentication Flow

### Sign Up Flow
```
User enters email/password
        ↓
Frontend calls /signup API
        ↓
Server creates user with Supabase Admin API
        ↓
User is auto-confirmed (email_confirm: true)
        ↓
Server returns user object
        ↓
Frontend redirects to sign in
```

### Sign In Flow
```
User enters credentials
        ↓
Frontend calls Supabase signInWithPassword
        ↓
Supabase returns session with access_token
        ↓
Frontend stores session state
        ↓
Frontend includes token in API requests
```

### Demo Account
```typescript
Email: demo@chatflow.com
Password: demo123456

Features:
- Pre-populated with sample chatbots
- Full functionality access
- Read-only in some areas
- Displays demo mode banner
```

### Protected Routes
Server-side route protection:

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

// Usage
app.get('/chatbots', async (c) => {
  const user = await requireAuth(c);
  if (!user.id) return; // Already returned 401
  
  // Proceed with authorized user
});
```

---

## Deployment Guide

### Prerequisites
- Supabase project created
- Domain name (optional)
- Environment variables configured

### Step 1: Deploy Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy make-server-97ac60b8
```

### Step 2: Set Environment Variables

```bash
supabase secrets set WHATSAPP_ACCESS_TOKEN=your-token
supabase secrets set WHATSAPP_PHONE_NUMBER_ID=your-id
supabase secrets set WHATSAPP_VERIFY_TOKEN=your-verify-token
```

### Step 3: Create Database Table

```sql
-- Run in Supabase SQL Editor
CREATE TABLE IF NOT EXISTS kv_store_97ac60b8 (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_kv_store_key_prefix 
ON kv_store_97ac60b8 (key text_pattern_ops);
```

### Step 4: Configure WhatsApp Webhook

1. Go to Meta Developer Console
2. Navigate to WhatsApp > Configuration
3. Set webhook URL:
   ```
   https://your-project.supabase.co/functions/v1/make-server-97ac60b8/webhook
   ```
4. Set verify token (same as env variable)
5. Subscribe to `messages` field

### Step 5: Deploy Frontend

#### Option A: Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Option B: Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

#### Option C: Static Hosting
```bash
# Build
npm run build

# Upload /dist folder to hosting provider
```

### Step 6: Set Frontend Environment Variables

Create `.env.production`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Step 7: Verify Deployment

1. Access your deployed URL
2. Sign up for a new account
3. Create a test chatbot
4. Send WhatsApp message
5. Check Edge Function logs:
   ```bash
   supabase functions logs make-server-97ac60b8 --tail
   ```

---

## Best Practices

### Code Organization

#### Component Structure
```typescript
// 1. Imports
import { useState } from 'react';
import { Button } from './ui/button';

// 2. Interfaces/Types
interface Props {
  id: string;
  onSave: () => void;
}

// 3. Component
export function MyComponent({ id, onSave }: Props) {
  // 4. State
  const [data, setData] = useState();
  
  // 5. Effects
  useEffect(() => {}, []);
  
  // 6. Handlers
  const handleClick = () => {};
  
  // 7. Render helpers
  const renderContent = () => {};
  
  // 8. Return JSX
  return <div>{renderContent()}</div>;
}
```

#### File Naming
- Components: PascalCase (`ChatbotBuilder.tsx`)
- Utilities: camelCase (`api.ts`)
- Constants: UPPER_SNAKE_CASE (`API_ENDPOINT`)

### Performance Optimization

#### 1. Lazy Loading
```typescript
const ChatbotBuilder = lazy(() => import('./ChatbotBuilder'));

<Suspense fallback={<Loading />}>
  <ChatbotBuilder />
</Suspense>
```

#### 2. Memoization
```typescript
const expensiveValue = useMemo(() => 
  computeExpensiveValue(data),
  [data]
);

const handleClick = useCallback(() => {
  // handler logic
}, [dependencies]);
```

#### 3. Virtualization
For large lists, use virtualization:
```typescript
import { FixedSizeList } from 'react-window';
```

### Security Best Practices

#### 1. Never Expose Service Role Key
```typescript
// ❌ WRONG - Never in frontend
const supabase = createClient(url, SERVICE_ROLE_KEY);

// ✅ CORRECT - Use anon key
const supabase = createClient(url, ANON_KEY);
```

#### 2. Validate User Input
```typescript
// Server-side validation
if (!email || !email.includes('@')) {
  return c.json({ error: 'Invalid email' }, 400);
}
```

#### 3. Use Row Level Security
```sql
ALTER TABLE kv_store_97ac60b8 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own data"
ON kv_store_97ac60b8
FOR ALL
USING (key LIKE 'user:' || auth.uid() || '%');
```

#### 4. Rate Limiting
```typescript
// In Edge Function
const rateLimiter = new Map();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userRequests = rateLimiter.get(userId) || [];
  const recentRequests = userRequests.filter(
    time => now - time < 60000
  );
  
  if (recentRequests.length >= 60) {
    return false; // Rate limit exceeded
  }
  
  rateLimiter.set(userId, [...recentRequests, now]);
  return true;
}
```

### Error Handling

#### Frontend
```typescript
try {
  const response = await api.call();
  toast.success('Success!');
} catch (error: any) {
  console.error('Operation failed:', error);
  toast.error(error.message || 'Something went wrong');
}
```

#### Backend
```typescript
app.post('/chatbots', async (c) => {
  try {
    // Business logic
    return c.json({ chatbot });
  } catch (error) {
    console.error('Create chatbot error:', error);
    return c.json({ 
      error: 'Failed to create chatbot',
      details: error.message 
    }, 500);
  }
});
```

### Logging

#### Structured Logging
```typescript
console.log(JSON.stringify({
  level: 'info',
  timestamp: new Date().toISOString(),
  event: 'chatbot_created',
  user_id: userId,
  chatbot_id: chatbotId
}));
```

#### Error Context
```typescript
console.error(JSON.stringify({
  level: 'error',
  timestamp: new Date().toISOString(),
  event: 'whatsapp_send_failed',
  error: error.message,
  stack: error.stack,
  context: { to: userPhone, chatbotId }
}));
```

---

## Troubleshooting

### Common Issues

#### 1. WhatsApp Webhook Not Receiving Messages

**Symptoms:** Messages sent but no webhook POST received

**Solutions:**
- Verify webhook URL is correct
- Check verify token matches env variable
- Ensure webhook is subscribed to `messages` field
- Check Edge Function logs for errors
- Verify HTTPS (required by Meta)

**Debug:**
```bash
# Check Edge Function logs
supabase functions logs make-server-97ac60b8 --tail

# Test webhook manually
curl -X POST https://your-project.supabase.co/functions/v1/make-server-97ac60b8/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

#### 2. Database Connection Errors

**Symptoms:** "Failed to connect to database"

**Solutions:**
- Verify `SUPABASE_DB_URL` is correct
- Check database is online in Supabase dashboard
- Verify service role key has database access
- Check connection pooling limits

**Debug:**
```typescript
// Test database connection
const { data, error } = await supabase
  .from('kv_store_97ac60b8')
  .select('*')
  .limit(1);

console.log({ data, error });
```

#### 3. Authentication Issues

**Symptoms:** "Unauthorized" errors

**Solutions:**
- Verify access token is being sent in Authorization header
- Check token hasn't expired
- Ensure user is signed in on frontend
- Verify Supabase auth is configured correctly

**Debug:**
```typescript
// Check session
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);

// Check user
const { data: { user } } = await supabase.auth.getUser();
console.log('User:', user);
```

#### 4. Form Templates Not Appearing

**Symptoms:** Template buttons don't show

**Solutions:**
- Ensure form position is set to 'none'
- Check FormBuilder component is rendered
- Verify templates object is defined
- Clear browser cache

**Debug:**
```typescript
console.log('Form position:', formConfig.position);
console.log('Templates:', Object.keys(formTemplates));
```

#### 5. Edge Function Deployment Failures

**Symptoms:** `supabase functions deploy` fails

**Solutions:**
- Update Supabase CLI: `npm i -g supabase@latest`
- Verify project is linked: `supabase link`
- Check function code for syntax errors
- Ensure all imports use correct specifiers (npm:, node:)

**Debug:**
```bash
# Check CLI version
supabase --version

# Verify project link
supabase projects list

# Test function locally
supabase functions serve make-server-97ac60b8
```

#### 6. CORS Errors

**Symptoms:** "CORS policy blocked"

**Solutions:**
- Verify CORS headers in Edge Function
- Check origin is allowed
- Ensure preflight requests handled

**Fix:**
```typescript
import { cors } from 'npm:hono/cors';

app.use('*', cors({
  origin: '*', // or specific origin
  credentials: true
}));
```

### Performance Issues

#### Slow API Responses

**Solutions:**
1. Add database indexes
2. Optimize queries
3. Implement caching
4. Use connection pooling

```typescript
// Cache example
const cache = new Map();

async function getChatbot(id: string) {
  if (cache.has(id)) {
    return cache.get(id);
  }
  
  const chatbot = await kv.get(`chatbot:${id}`);
  cache.set(id, chatbot);
  
  return chatbot;
}
```

#### Large Bundle Size

**Solutions:**
1. Code splitting
2. Tree shaking
3. Remove unused dependencies
4. Use dynamic imports

```typescript
// Dynamic import
const HeavyComponent = lazy(() => 
  import('./HeavyComponent')
);
```

---

## Testing

### Unit Testing

#### Setup
```bash
npm install --save-dev vitest @testing-library/react
```

#### Example Test
```typescript
// ChatbotBuilder.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatbotBuilder } from './ChatbotBuilder';

describe('ChatbotBuilder', () => {
  it('renders chatbot name input', () => {
    render(<ChatbotBuilder chatbotId={null} onBack={() => {}} />);
    expect(screen.getByLabelText('Chatbot Name')).toBeInTheDocument();
  });
  
  it('loads existing chatbot data', async () => {
    // Test implementation
  });
});
```

### Integration Testing

```typescript
// api.test.ts
describe('API Integration', () => {
  it('creates chatbot successfully', async () => {
    const chatbot = await createChatbot({
      name: 'Test Bot',
      questions: []
    });
    
    expect(chatbot.id).toBeDefined();
    expect(chatbot.name).toBe('Test Bot');
  });
});
```

### E2E Testing

```bash
npm install --save-dev playwright
```

```typescript
// e2e/chatbot-creation.spec.ts
import { test, expect } from '@playwright/test';

test('create chatbot flow', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Sign in
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');
  
  // Create chatbot
  await page.click('text=Create Chatbot');
  await page.fill('[name="chatbotName"]', 'Test Bot');
  await page.click('text=Save Chatbot');
  
  // Verify
  await expect(page.locator('text=Test Bot')).toBeVisible();
});
```

### Manual Testing Checklist

#### Authentication
- [ ] Sign up new user
- [ ] Sign in existing user
- [ ] Sign out
- [ ] Demo account access

#### Chatbot Builder
- [ ] Create new chatbot
- [ ] Edit existing chatbot
- [ ] Add questions (text & options)
- [ ] Create nested follow-ups
- [ ] Delete questions
- [ ] Save changes
- [ ] Preview chatbot

#### Form Builder
- [ ] Apply Contact template
- [ ] Apply Lead Capture template
- [ ] Apply Feedback template
- [ ] Add custom fields
- [ ] Reorder fields (drag-drop)
- [ ] Mark fields required
- [ ] Change form position
- [ ] Switch templates

#### WhatsApp Integration
- [ ] Configure settings
- [ ] Send test message
- [ ] Receive bot response
- [ ] Test conditional flow
- [ ] Test form submission

#### Analytics
- [ ] View conversation stats
- [ ] Check completion rate
- [ ] Verify charts render
- [ ] Export data

#### Integration Panel
- [ ] Select chatbot
- [ ] Generate embed code
- [ ] Copy to clipboard
- [ ] Verify instructions

---

## Appendix

### Key File Locations

```
/App.tsx                          # Main application entry
/components/ChatbotBuilder.tsx    # Chatbot creation/editing
/components/FormBuilder.tsx       # Form template system
/components/FlowBuilder.tsx       # Visual flow display
/supabase/functions/server/       # Edge Function server
/utils/api.ts                     # API client utilities
/styles/globals.css               # Global styles & design tokens
```

### Design Tokens Reference

```css
/* Spacing */
--spacing-sm: 0.5rem    /* 8px */
--spacing-md: 1rem      /* 16px */
--spacing-lg: 1.5rem    /* 24px */
--spacing-xl: 2rem      /* 32px */

/* Colors */
--primary: oklch(0.465 0.243 264.376)      /* Blue */
--success: oklch(0.627 0.172 161.02)       /* Green */
--destructive: oklch(0.577 0.245 27.325)   /* Red */
--muted-foreground: #6b7280                /* Gray */

/* Typography */
--text-sm: 0.875rem     /* 14px */
--text-base: 1rem       /* 16px */
--text-lg: 1.125rem     /* 18px */
--text-xl: 1.25rem      /* 20px */

/* Border Radius */
--radius-md: 0.5rem     /* 8px */
--radius-lg: 0.625rem   /* 10px */
```

### Useful Commands

```bash
# Development
npm run dev                           # Start dev server
npm run build                         # Build for production
npm run preview                       # Preview production build

# Supabase
supabase start                        # Start local Supabase
supabase db reset                     # Reset database
supabase functions serve              # Test functions locally
supabase functions deploy <name>      # Deploy function
supabase secrets set KEY=value        # Set environment variable

# Git
git add .
git commit -m "feat: add feature"
git push origin main

# Testing
npm test                              # Run unit tests
npm run test:e2e                      # Run E2E tests
npm run test:watch                    # Watch mode
```

### Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **WhatsApp Business API**: https://developers.facebook.com/docs/whatsapp
- **React Documentation**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com
- **shadcn/ui**: https://ui.shadcn.com

### Contributing

When contributing to this project:

1. Follow existing code style
2. Write meaningful commit messages
3. Add tests for new features
4. Update documentation
5. Test thoroughly before submitting

### License

[Add your license information here]

---

**Last Updated:** 2024
**Version:** 1.0.0
**Maintainer:** [Your Name/Team]
