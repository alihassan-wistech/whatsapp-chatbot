# Form Templates - Quick Reference Guide

## Overview

The Form Builder includes three pre-configured templates designed for common use cases. This guide provides everything you need to know about using and customizing these templates.

---

## 📋 Available Templates

### 1. Contact Form Template

**Best For**: General contact forms, customer support follow-ups, inquiry forms

**Configuration**:
```typescript
{
  title: 'Contact Information',
  description: 'Please provide your contact details so we can reach you',
  position: 'end',  // Displayed AFTER conversation
  submitButtonText: 'Submit',
  fields: [
    {
      label: 'Full Name',
      type: 'text',
      placeholder: 'Enter your full name',
      required: true
    },
    {
      label: 'Email Address',
      type: 'email',
      placeholder: 'your@email.com',
      required: true
    },
    {
      label: 'Phone Number',
      type: 'phone',
      placeholder: '+1 (555) 000-0000',
      required: false
    },
    {
      label: 'Message',
      type: 'textarea',
      placeholder: 'How can we help you?',
      required: false
    }
  ]
}
```

**Use Cases**:
- Customer support conversations
- General inquiries
- Service requests
- Contact information collection
- Post-chat follow-up

**What Users See** (WhatsApp):
```
Bot: "How can I help you today?"
User: [selects option or answers questions]
... conversation continues ...

Bot: "Contact Information
Please provide your contact details so we can reach you

Full Name:"
User: "John Smith"

Bot: "Email Address:"
User: "john@example.com"

Bot: "Phone Number:"
User: "+1234567890"

Bot: "Message:"
User: "I need help with my order"

Bot: "Thank you! Your information has been submitted."
```

---

### 2. Lead Capture Template

**Best For**: B2B lead generation, sales qualification, product demos

**Configuration**:
```typescript
{
  title: 'Get Started',
  description: 'Share your details and we\'ll be in touch shortly',
  position: 'end',
  submitButtonText: 'Get Started',
  fields: [
    {
      label: 'Your Name',
      type: 'text',
      placeholder: 'Enter your name',
      required: true
    },
    {
      label: 'Work Email',
      type: 'email',
      placeholder: 'your@company.com',
      required: true
    },
    {
      label: 'Phone Number',
      type: 'phone',
      placeholder: '+1 (555) 000-0000',
      required: true
    }
  ]
}
```

**Use Cases**:
- Sales qualification
- Demo requests
- Free trial sign-ups
- Newsletter subscriptions
- B2B lead generation
- Partnership inquiries

**Key Difference**: All fields are required - maximizes data quality

---

### 3. Feedback Form Template

**Best For**: Customer satisfaction surveys, product feedback, reviews

**Configuration**:
```typescript
{
  title: 'Share Your Feedback',
  description: 'Help us improve by sharing your thoughts',
  position: 'end',
  submitButtonText: 'Send Feedback',
  fields: [
    {
      label: 'Name (Optional)',
      type: 'text',
      placeholder: 'Your name',
      required: false
    },
    {
      label: 'Email (Optional)',
      type: 'email',
      placeholder: 'your@email.com',
      required: false
    },
    {
      label: 'Your Feedback',
      type: 'textarea',
      placeholder: 'Share your thoughts, suggestions, or concerns...',
      required: true
    }
  ]
}
```

**Use Cases**:
- Post-purchase feedback
- Customer satisfaction surveys
- Feature requests
- Bug reports
- Service reviews
- Anonymous feedback collection

**Key Difference**: Contact info optional - encourages honest feedback

---

## 🎯 How to Use Templates

### Step 1: Access Form Builder

1. Create or edit a chatbot
2. Click on "Data Collection Form" tab
3. You'll see the template selector if no form is configured

### Step 2: Choose a Template

Click on any template button:
- **Contact Form** (blue) - General purpose
- **Lead Capture** (purple) - Sales/B2B
- **Feedback Form** (green) - Surveys/Reviews

### Step 3: Customize (Optional)

After applying a template, you can:
- ✏️ Edit field labels
- ➕ Add new fields
- 🗑️ Remove fields
- ⚙️ Change required/optional status
- 🔄 Reorder via drag-and-drop
- 📝 Update form title and description
- 🎯 Change position (start/end)

### Step 4: Save

Click "Save Chatbot" - the form is now active!

---

## 🔧 Customization Guide

### Editing Field Properties

```typescript
// What you can customize for each field:
{
  label: 'Customer Label',        // ✏️ Field name shown to user
  type: 'text',                   // 📝 Field type (see types below)
  placeholder: 'Hint text...',    // 💬 Placeholder text
  required: true                  // ⚠️ Required vs optional
}
```

### Available Field Types

| Type | Icon | Purpose | Example |
|------|------|---------|---------|
| `text` | 👤 | Names, general text | Full Name |
| `email` | ✉️ | Email addresses | your@email.com |
| `phone` | 📞 | Phone numbers | +1234567890 |
| `number` | #️⃣ | Numeric values | Age, Quantity |
| `date` | 📅 | Date selection | Birth date |
| `textarea` | 💬 | Long text | Messages, Comments |

### Adding Custom Fields

1. Scroll to "Add Field" section
2. Click the field type button
3. Configure the new field
4. Drag to reorder if needed

### Changing Form Position

- **Before Conversation** (`start`): Collect info first, then chat
- **After Conversation** (`end`): Chat first, then collect info ⭐ (Most common)
- **No Form** (`none`): Disable form completely

---

## 💡 Best Practices

### 1. Keep It Short
- ✅ 3-5 fields maximum
- ❌ Avoid 10+ field forms
- 📊 Completion rate drops with each field

### 2. Mark Required Carefully
- ✅ Only mark essential fields as required
- ❌ Don't make everything required
- 💡 Optional fields get better quality responses

### 3. Use Clear Labels
```typescript
// ✅ Good
label: 'Work Email Address'
placeholder: 'your@company.com'

// ❌ Bad
label: 'Email'
placeholder: 'Enter email'
```

### 4. Match Template to Use Case

| Use Case | Best Template | Why |
|----------|---------------|-----|
| Customer Support | Contact Form | Balanced required/optional |
| Sales Leads | Lead Capture | All fields required |
| Feedback | Feedback Form | Anonymous option |
| General Inquiry | Contact Form | Flexible collection |
| Product Demo | Lead Capture | Qualify leads |
| Bug Reports | Feedback Form | Focus on message |

### 5. Form Position Strategy

**Use "end" position when:**
- ✅ User needs to complete conversation first
- ✅ Form is follow-up to chat
- ✅ Most common use case

**Use "start" position when:**
- ✅ Qualifying users before access
- ✅ Registration required
- ✅ Personalize chat based on form data

---

## 🔄 Switching Templates

### If Form Already Configured

1. Click "Use Template" button in Form Settings
2. Confirm replacement (current form will be lost)
3. Form resets to `position: 'none'`
4. Template selector appears
5. Choose new template

⚠️ **Warning**: Switching templates will delete current form configuration!

---

## 📊 Template Comparison

| Feature | Contact | Lead Capture | Feedback |
|---------|---------|--------------|----------|
| **Fields** | 4 | 3 | 3 |
| **Required Fields** | 2 | 3 | 1 |
| **Best For** | General | B2B Sales | Surveys |
| **Completion Rate** | High | Medium | Highest |
| **Data Quality** | Balanced | High | Variable |
| **Anonymous Option** | No | No | Yes |

---

## 🎨 Visual Examples

### Contact Form in Chatbot Builder

```
┌─────────────────────────────────────────┐
│  Quick Start Templates                  │
│  ┌───────┐  ┌───────┐  ┌───────┐       │
│  │ ✉️ Contact │ 👤 Lead │ 💬 Feedback │  │
│  │  Form  │  Capture  │   Form   │     │
│  └───────┘  └───────┘  └───────┘       │
└─────────────────────────────────────────┘

[After clicking Contact Form]

┌─────────────────────────────────────────┐
│  Form Settings                          │
│  Title: Contact Information             │
│  Description: Please provide details... │
│  Position: After Conversation     [▼]   │
│  Submit Button: Submit                  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Form Fields                            │
│  ┌─────────────────────────────────┐   │
│  │ 👤 Full Name ★ Required         │   │
│  │ Placeholder: Enter your name    │   │
│  │ [Remove]                        │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ ✉️ Email Address ★ Required     │   │
│  └─────────────────────────────────┘   │
│  ...                                    │
└─────────────────────────────────────────┘
```

---

## 🚀 Quick Start Scenarios

### Scenario 1: Customer Support Bot

**Goal**: Collect contact info after helping customer

```typescript
1. Create chatbot: "Support Bot"
2. Add questions about support topics
3. Go to "Data Collection Form" tab
4. Click "Contact Form" template
5. Customize: Change "Message" to "Describe your issue"
6. Save chatbot
```

**Result**: After support conversation, user fills contact form

---

### Scenario 2: Lead Generation Bot

**Goal**: Qualify sales leads for B2B product

```typescript
1. Create chatbot: "Product Demo Bot"
2. Add questions about company size, needs
3. Go to "Data Collection Form" tab
4. Click "Lead Capture" template
5. Add custom field: "Company Name" (required)
6. Save chatbot
```

**Result**: High-quality leads with complete information

---

### Scenario 3: Feedback Collection

**Goal**: Collect product feedback anonymously

```typescript
1. Create chatbot: "Feedback Bot"
2. Add questions about product experience
3. Go to "Data Collection Form" tab
4. Click "Feedback Form" template
5. Remove "Name" and "Email" fields (full anonymity)
6. Save chatbot
```

**Result**: Honest, anonymous feedback

---

## 📝 Form Data Storage

### Where Form Submissions Are Stored

```typescript
// Database key format
`form_submission:{chatbot_id}:{timestamp}`

// Data structure
{
  chatbot_id: "chatbot_123",
  user_phone: "+1234567890",  // WhatsApp only
  data: {
    "field-123": "John Smith",      // Name
    "field-124": "john@email.com",  // Email
    "field-125": "+1234567890",     // Phone
    "field-126": "Need help..."     // Message
  },
  submitted_at: "2024-01-01T12:00:00Z"
}
```

### Accessing Form Submissions

Form submissions can be viewed in:
1. Analytics Dashboard (coming soon)
2. Direct database query
3. Export functionality (coming soon)

---

## 🔍 Validation Rules

### Automatic Validation by Field Type

| Field Type | Validation |
|------------|------------|
| `email` | Must contain @ and domain |
| `phone` | Must contain digits, allows +, -, (), spaces |
| `number` | Must be numeric |
| `date` | Must be valid date format |
| `text` | No special validation |
| `textarea` | No special validation |

### Required Field Validation

- Required fields cannot be empty
- Whitespace-only input rejected
- User sees error message if invalid

---

## 🎓 Advanced Customization

### Creating Custom Template

Add to `/components/FormBuilder.tsx`:

```typescript
const formTemplates = {
  // ... existing templates ...
  
  customTemplate: {
    title: 'Custom Form',
    description: 'Your description',
    position: 'end' as const,
    submitButtonText: 'Submit',
    fields: [
      {
        id: 'custom-1',
        label: 'Field 1',
        type: 'text' as const,
        placeholder: 'Enter...',
        required: true,
        order: 0
      }
      // ... more fields
    ]
  }
};
```

Then add UI button in template selector section.

---

## ❓ FAQ

**Q: Can I use multiple forms in one chatbot?**  
A: No, only one form per chatbot (at start OR end).

**Q: Can I have a form in the middle of conversation?**  
A: Not currently. Only start or end positions supported.

**Q: What happens if user skips optional fields?**  
A: Field is saved as empty string. User can proceed.

**Q: Can I export form submissions?**  
A: Yes, through database query or upcoming export feature.

**Q: Do forms work on both WhatsApp and website?**  
A: Yes! Forms work on all integration channels.

**Q: Can I conditional show fields based on previous answers?**  
A: Not currently. All fields show in sequence.

**Q: How many fields can I add?**  
A: No technical limit, but 3-5 recommended for completion rate.

**Q: Can I change template after chatbot is deployed?**  
A: Yes, but it affects new conversations only.

---

## 📚 Related Documentation

- **Main Developer Guide**: DEVELOPER_GUIDE.md
- **Implementation Details**: IMPLEMENTATION_GUIDE.md
- **Production Checklist**: PRODUCTION_READY_CHECKLIST.md
- **Design Guidelines**: guidelines/Guidelines.md

---

*Quick Reference v1.0 - Production Ready*
