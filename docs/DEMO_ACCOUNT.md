# Demo Account Documentation

## Overview
The ChatFlow platform includes a fully functional demo account that allows users to explore the platform without creating their own account. The demo account comes pre-populated with sample chatbots, conversations, and analytics data.

## Demo Credentials
- **Email:** demo@chatflow.com
- **Password:** demo123456

## Features

### Auto-Initialization
The demo account is automatically initialized when the server starts. The initialization process:
1. Creates the demo user account (if it doesn't exist)
2. Populates sample chatbots with realistic conversation flows
3. Generates analytics data for the past 30 days
4. Creates sample conversations for testing

### Sample Chatbots
The demo account includes three pre-configured chatbots:

#### 1. Customer Support Bot
- **Purpose:** Automated customer support with FAQ and ticket creation
- **Features:** Multi-option navigation, product info, technical support, billing inquiries
- **Status:** Active
- **Created:** 7 days ago
- **Sample Conversations:** ~156

#### 2. Lead Generation Bot
- **Purpose:** Qualify leads and schedule appointments
- **Features:** Name collection, company info, interest qualification, appointment scheduling
- **Status:** Active
- **Created:** 14 days ago
- **Sample Conversations:** ~89

#### 3. Restaurant Reservation Bot
- **Purpose:** Handle table reservations and menu inquiries
- **Features:** Reservations, menu viewing, hours info, contact details
- **Status:** Inactive (for testing)
- **Created:** 30 days ago
- **Sample Conversations:** ~45

### Analytics Data
Each chatbot includes:
- 30 days of historical conversation data
- Realistic completion rates (60-90%)
- Daily statistics with varying conversation volumes
- Sample response time metrics

### Demo Mode Indicators
When logged in with the demo account:
- A dismissible banner appears at the top of the dashboard
- The banner clearly indicates demo mode
- Users can quickly sign out to create their own account

## User Experience

### Login Flow
1. **Quick Demo Access:** Users can click "Launch Demo Account" button on the auth page
2. **Manual Login:** Users can also manually enter demo credentials
3. **Auto-Initialization:** Demo data is verified/created upon login
4. **Immediate Access:** Users immediately see populated dashboard with sample data

### Limitations
- Demo account data is shared across all demo sessions
- Changes made in demo mode may be visible to other demo users
- Demo account is intended for exploration, not production use
- WhatsApp integration requires user's own API credentials

## Technical Implementation

### Server-Side (`/supabase/functions/server/index.tsx`)
- `initializeDemoAccount()`: Main initialization function
- Runs on server startup (idempotent)
- Creates user account via Supabase Auth Admin API
- Populates KV store with sample data
- Generates realistic analytics and conversation history

### Client-Side
- **AuthPage Component:** Demo login button and credentials display
- **App Component:** Demo mode banner and detection
- **API Utilities:** Automatic demo data check on login

### Endpoints
- `POST /make-server-97ac60b8/init-demo`: Manual demo initialization trigger
- All standard chatbot/analytics endpoints work with demo account

## Maintenance

### Resetting Demo Data
To reset the demo account to its initial state:
1. Delete all keys with prefix `chatbot:${demoUserId}:*`
2. Delete all keys with prefix `conversation:*` (optional)
3. Delete all keys with prefix `analytics:*` (optional)
4. Call the `/init-demo` endpoint to repopulate

### Updating Sample Data
Edit the `initializeDemoAccount()` function in `/supabase/functions/server/index.tsx` to:
- Add new sample chatbots
- Modify conversation flows
- Adjust analytics data generation
- Change sample conversation content

## Best Practices

### For Users
- Use demo mode to explore all platform features
- Test chatbot building and flow design
- Review analytics and conversation tracking
- Create your own account when ready to deploy

### For Developers
- Keep demo data realistic and representative
- Ensure demo initialization is idempotent
- Maintain sample data quality
- Update demo content when adding new features

## Security Notes
- Demo credentials are intentionally public
- Demo account uses same auth flow as regular accounts
- Service role key is never exposed to frontend
- Demo data isolation recommended for production deployments

## Future Enhancements
- [ ] Add demo data refresh button in UI
- [ ] Implement demo session isolation
- [ ] Add guided tour for demo users
- [ ] Create role-specific demo accounts
- [ ] Add sample WhatsApp integration (mock/sandbox)
