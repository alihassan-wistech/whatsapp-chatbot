# Form Template Architecture

## Visual Guide for Developers

This document provides visual diagrams and architecture details for the Form Builder template system.

---

## 📐 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                  ChatbotBuilder Component                   │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Tabs: [Questions & Flow] [Form Builder] [Visual]    │ │
│  └───────────────────────────────────────────────────────┘ │
│                            │                                │
│                            ▼                                │
│  ┌───────────────────────────────────────────────────────┐ │
│  │            FormBuilder Component                      │ │
│  │                                                       │ │
│  │  State: formConfig                                   │ │
│  │  {                                                    │ │
│  │    title: string                                     │ │
│  │    position: 'start' | 'end' | 'none'               │ │
│  │    fields: FormField[]                               │ │
│  │  }                                                    │ │
│  └───────────────────────────────────────────────────────┘ │
│                            │                                │
│                     ┌──────┴──────┐                        │
│                     ▼             ▼                        │
│         ┌──────────────┐  ┌──────────────┐                │
│         │  Templates   │  │  Form Editor │                │
│         │  (if none)   │  │  (if active) │                │
│         └──────────────┘  └──────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagram

### Template Application Flow

```
User clicks "Contact Form" template button
                │
                ▼
┌─────────────────────────────────────────┐
│  applyTemplate('contact') called        │
└─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  Retrieve template from formTemplates   │
│  const template = formTemplates.contact │
└─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  Clone template & generate unique IDs   │
│  fields: template.fields.map(...)       │
└─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  Update formConfig state via onChange   │
│  onChange({ ...form, ...template })     │
└─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  UI re-renders showing form editor      │
│  Template fields now customizable       │
└─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  User saves chatbot                     │
│  formConfig included in chatbot data    │
└─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  Stored in database:                    │
│  chatbot:123 → { formConfig: {...} }    │
└─────────────────────────────────────────┘
```

---

## 🎨 UI State Machine

### Form Builder States

```
┌─────────────────────────────────────────┐
│        INITIAL STATE                    │
│  formConfig.position = 'none'           │
│  formConfig.fields = []                 │
│                                         │
│  UI: Template Selector Visible          │
└─────────────────────────────────────────┘
                │
                │ User clicks template
                ▼
┌─────────────────────────────────────────┐
│        TEMPLATE APPLIED                 │
│  formConfig.position = 'end'            │
│  formConfig.fields = [4 fields]         │
│                                         │
│  UI: Form Editor Visible                │
└─────────────────────────────────────────┘
                │
                │ User customizes
                ▼
┌─────────────────────────────────────────┐
│        CUSTOMIZED STATE                 │
│  formConfig modified                    │
│  fields added/removed/edited            │
│                                         │
│  UI: Form Editor + "Use Template" btn   │
└─────────────────────────────────────────┘
                │
                │ User clicks "Use Template"
                │ (with confirmation)
                ▼
         Back to INITIAL STATE
```

---

## 📊 Template Data Structure

### Contact Form Template

```typescript
{
  // Metadata
  title: 'Contact Information',
  description: 'Please provide your contact details so we can reach you',
  position: 'end',
  submitButtonText: 'Submit',
  
  // Fields Array
  fields: [
    {
      id: 'contact-name',          // Template ID
      label: 'Full Name',          // User-facing label
      type: 'text',                // Input type
      placeholder: 'Enter name',   // Hint text
      required: true,              // Validation
      order: 0                     // Display order
    },
    {
      id: 'contact-email',
      label: 'Email Address',
      type: 'email',
      placeholder: 'your@email.com',
      required: true,
      order: 1
    },
    {
      id: 'contact-phone',
      label: 'Phone Number',
      type: 'phone',
      placeholder: '+1234567890',
      required: false,             // Optional field
      order: 2
    },
    {
      id: 'contact-message',
      label: 'Message',
      type: 'textarea',
      placeholder: 'How can we help?',
      required: false,
      order: 3
    }
  ]
}
```

### After Application (Unique IDs)

```typescript
{
  title: 'Contact Information',
  position: 'end',
  fields: [
    {
      id: 'field-1704067200000-contact-name',  // Timestamp + template ID
      label: 'Full Name',
      type: 'text',
      // ... rest of properties
    },
    // ... other fields with unique IDs
  ]
}
```

---

## 🔧 Component Interaction

### ChatbotBuilder ↔ FormBuilder

```typescript
// ChatbotBuilder.tsx
function ChatbotBuilder({ chatbotId, onBack }) {
  // State
  const [formConfig, setFormConfig] = useState<FormConfig>({
    title: 'Contact Information',
    position: 'none',
    fields: [],
    submitButtonText: 'Submit'
  });

  // Render
  return (
    <Tabs>
      <TabsContent value="form">
        <FormBuilder
          form={formConfig}           // Pass state down
          onChange={setFormConfig}    // Pass setter down
        />
      </TabsContent>
    </Tabs>
  );

  // Save
  const saveChatbot = async () => {
    await createChatbot({
      name: chatbotName,
      formConfig: formConfig,  // Include in save
      // ... other data
    });
  };
}
```

```typescript
// FormBuilder.tsx
function FormBuilder({ form, onChange }: FormBuilderProps) {
  // Template application
  const applyTemplate = (key: TemplateKey) => {
    const template = formTemplates[key];
    onChange({              // Call parent's setter
      ...form,              // Preserve non-template props
      ...template,          // Override with template
      fields: template.fields.map(field => ({
        ...field,
        id: `field-${Date.now()}-${field.id}`  // Unique IDs
      }))
    });
  };

  // Field updates
  const updateField = (id: string, updates: Partial<FormField>) => {
    onChange({
      ...form,
      fields: form.fields.map(field =>
        field.id === id ? { ...field, ...updates } : field
      )
    });
  };

  // Render based on state
  return (
    <>
      {form.position === 'none' ? (
        <TemplateSelector onSelect={applyTemplate} />
      ) : (
        <FormEditor fields={form.fields} onUpdate={updateField} />
      )}
    </>
  );
}
```

---

## 🗄️ Database Storage

### Chatbot Object in Database

```typescript
// Key: "chatbot:abc123"
{
  id: "abc123",
  name: "Customer Support Bot",
  description: "Handles customer inquiries",
  
  // Questions array
  questions: [
    {
      id: "q1",
      type: "options",
      question: "How can we help?",
      options: ["Sales", "Support", "Billing"]
    }
    // ... more questions
  ],
  
  // Form configuration ⭐
  formConfig: {
    title: "Contact Information",
    description: "Please provide your details",
    position: "end",
    submitButtonText: "Submit",
    fields: [
      {
        id: "field-1704067200000-contact-name",
        label: "Full Name",
        type: "text",
        placeholder: "Enter your name",
        required: true,
        order: 0
      },
      {
        id: "field-1704067200001-contact-email",
        label: "Email Address",
        type: "email",
        placeholder: "your@email.com",
        required: true,
        order: 1
      }
      // ... more fields
    ]
  },
  
  // Settings
  settings: {
    enableWhatsApp: true,
    enableWebsite: true
  },
  
  created_at: "2024-01-01T00:00:00Z"
}
```

### Form Submission Storage

```typescript
// Key: "form_submission:abc123:1704067890000"
{
  chatbot_id: "abc123",
  user_phone: "+1234567890",
  
  // User-provided data mapped by field ID
  data: {
    "field-1704067200000-contact-name": "John Smith",
    "field-1704067200001-contact-email": "john@example.com",
    "field-1704067200002-contact-phone": "+1234567890",
    "field-1704067200003-contact-message": "I need help with my order"
  },
  
  submitted_at: "2024-01-01T12:00:00Z"
}
```

---

## 🎯 WhatsApp Integration Flow

### Form Collection via WhatsApp

```
┌─────────────────────────────────────────┐
│  User completes chatbot conversation    │
└─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  Server checks: formConfig.position?    │
│  if position === 'end' → show form      │
└─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  Send first field prompt                │
│  "Contact Information                   │
│   Full Name:"                           │
└─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  User responds: "John Smith"            │
└─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  Store in conversation.form_data        │
│  { "field-xxx": "John Smith" }          │
└─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  Send next field prompt                 │
│  "Email Address:"                       │
└─────────────────────────────────────────┘
                │
                ▼
         [Repeat for each field]
                │
                ▼
┌─────────────────────────────────────────┐
│  All fields collected                   │
│  Save form submission to database       │
│  "Thank you! Info submitted."           │
└─────────────────────────────────────────┘
```

### Validation Flow

```typescript
// Server-side validation during WhatsApp collection
function validateFieldInput(field: FormField, input: string): boolean {
  // Required field check
  if (field.required && !input.trim()) {
    return false;  // "This field is required"
  }

  // Type-specific validation
  switch (field.type) {
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
    case 'phone':
      return /^\+?[\d\s-()]+$/.test(input);
    case 'number':
      return !isNaN(Number(input));
    case 'date':
      return !isNaN(Date.parse(input));
    default:
      return true;  // text, textarea - no validation
  }
}
```

---

## 🧩 Drag-and-Drop Implementation

### Field Reordering Logic

```typescript
// State
const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

// Drag start - remember which field
const handleDragStart = (index: number) => {
  setDraggedIndex(index);
};

// Drag over - reorder fields
const handleDragOver = (e: React.DragEvent, index: number) => {
  e.preventDefault();
  if (draggedIndex === null || draggedIndex === index) return;

  const newFields = [...form.fields];
  
  // Remove from old position
  const [draggedItem] = newFields.splice(draggedIndex, 1);
  
  // Insert at new position
  newFields.splice(index, 0, draggedItem);

  // Update order property for each field
  onChange({
    ...form,
    fields: newFields.map((field, idx) => ({
      ...field,
      order: idx  // Ensure order matches array position
    }))
  });
  
  setDraggedIndex(index);
};

// Drag end - cleanup
const handleDragEnd = () => {
  setDraggedIndex(null);
};
```

### Visual Representation

```
Before drag:
┌────────────────┐
│ 1. Name        │  ← dragging this
├────────────────┤
│ 2. Email       │
├────────────────┤
│ 3. Phone       │
└────────────────┘

During drag over position 2:
┌────────────────┐
│ 1. Email       │  ← moved up
├────────────────┤
│ 2. Name        │  ← dropped here
├────────────────┤
│ 3. Phone       │
└────────────────┘

After drag end:
┌────────────────┐
│ 1. Email       │  order: 0
├────────────────┤
│ 2. Name        │  order: 1
├────────────────┤
│ 3. Phone       │  order: 2
└────────────────┘
```

---

## 🎨 Template Selector UI

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  Quick Start Templates                   [Sparkles Icon]│
│  Get started quickly with pre-configured forms          │
│                                                         │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐         │
│  │ ✉️ Mail    │  │ 👤 User    │  │ 💬 Message │        │
│  │ Contact   │  │ Lead      │  │ Feedback  │         │
│  │ Form      │  │ Capture   │  │ Form      │         │
│  │           │  │           │  │           │         │
│  │ Collect   │  │ Capture   │  │ Collect   │         │
│  │ name,     │  │ qualified │  │ user      │         │
│  │ email...  │  │ leads...  │  │ feedback..│         │
│  └───────────┘  └───────────┘  └───────────┘         │
│                                                         │
│  📝 Or configure a custom form manually below           │
└─────────────────────────────────────────────────────────┘
```

### Color Coding

| Template | Primary Color | Icon BG | Border Hover |
|----------|---------------|---------|--------------|
| Contact | Blue | `bg-blue-100` | `border-blue-300` |
| Lead Capture | Purple | `bg-purple-100` | `border-purple-300` |
| Feedback | Green | `bg-green-100` | `border-green-300` |

---

## 🔄 Template Switching Flow

```
User has Contact Form applied
        │
        ▼
┌─────────────────────────────────────────┐
│  Clicks "Use Template" button           │
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│  Confirmation dialog appears:           │
│  "Replace current form with template?   │
│   Your current configuration will be    │
│   lost."                                │
│                                         │
│   [Cancel]  [Confirm]                   │
└─────────────────────────────────────────┘
        │
        │ User clicks Confirm
        ▼
┌─────────────────────────────────────────┐
│  Reset form state:                      │
│  onChange({                             │
│    ...form,                             │
│    position: 'none',                    │
│    fields: []                           │
│  })                                     │
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│  UI re-renders                          │
│  Template selector now visible          │
│  User can choose new template           │
└─────────────────────────────────────────┘
```

---

## 📝 TypeScript Interfaces

### Complete Type Definitions

```typescript
// Field type
interface FormField {
  id: string;                    // Unique identifier
  label: string;                 // User-facing label
  type: FieldType;               // Input type
  placeholder?: string;          // Optional hint text
  required: boolean;             // Validation flag
  order: number;                 // Display position
}

// Field types
type FieldType = 
  | 'text'      // Single-line text
  | 'email'     // Email with validation
  | 'phone'     // Phone number
  | 'number'    // Numeric input
  | 'date'      // Date picker
  | 'textarea'; // Multi-line text

// Form configuration
interface FormConfig {
  id?: string;                   // Optional DB identifier
  title: string;                 // Form heading
  description?: string;          // Optional subtitle
  position: FormPosition;        // When to show
  fields: FormField[];           // Array of fields
  submitButtonText: string;      // Button label
}

// Position options
type FormPosition = 
  | 'start'  // Before conversation
  | 'end'    // After conversation
  | 'none';  // No form (disabled)

// Template structure
interface FormTemplate {
  title: string;
  description: string;
  position: 'start' | 'end';
  submitButtonText: string;
  fields: Omit<FormField, 'id'>[];  // Template fields without IDs
}

// Template dictionary
type FormTemplates = {
  contact: FormTemplate;
  leadCapture: FormTemplate;
  feedback: FormTemplate;
  [key: string]: FormTemplate;  // Extensible
};

// Component props
interface FormBuilderProps {
  form: FormConfig;
  onChange: (form: FormConfig) => void;
}
```

---

## 🧪 Testing Scenarios

### Template Application Test

```typescript
// Test: Contact Form template applies correctly
describe('FormBuilder - Contact Template', () => {
  it('should apply contact template with correct fields', () => {
    const mockOnChange = jest.fn();
    const { getByText } = render(
      <FormBuilder 
        form={{ position: 'none', fields: [] }} 
        onChange={mockOnChange}
      />
    );
    
    // Click contact form template
    fireEvent.click(getByText('Contact Form'));
    
    // Verify onChange called with template
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Contact Information',
        position: 'end',
        fields: expect.arrayContaining([
          expect.objectContaining({ label: 'Full Name' }),
          expect.objectContaining({ label: 'Email Address' })
        ])
      })
    );
  });
});
```

### Field Reordering Test

```typescript
// Test: Drag-and-drop reorders fields
describe('FormBuilder - Field Reordering', () => {
  it('should reorder fields when dragged', () => {
    const initialFields = [
      { id: '1', label: 'Name', order: 0 },
      { id: '2', label: 'Email', order: 1 }
    ];
    
    const mockOnChange = jest.fn();
    const { container } = render(
      <FormBuilder 
        form={{ fields: initialFields, position: 'end' }}
        onChange={mockOnChange}
      />
    );
    
    // Simulate drag from index 1 to index 0
    const fields = container.querySelectorAll('[draggable]');
    fireEvent.dragStart(fields[1]);
    fireEvent.dragOver(fields[0]);
    
    // Verify order changed
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        fields: [
          expect.objectContaining({ id: '2', order: 0 }),
          expect.objectContaining({ id: '1', order: 1 })
        ]
      })
    );
  });
});
```

---

## 🎯 Performance Considerations

### Optimization Strategies

```typescript
// 1. Memoize field components
const FormFieldItem = memo(({ field, onUpdate, onRemove }) => {
  // Field rendering logic
});

// 2. Use callback for event handlers
const handleFieldUpdate = useCallback((id: string, updates: Partial<FormField>) => {
  onChange({
    ...form,
    fields: form.fields.map(field =>
      field.id === id ? { ...field, ...updates } : field
    )
  });
}, [form, onChange]);

// 3. Debounce text input updates
const [localValue, setLocalValue] = useState(field.label);
const debouncedUpdate = useMemo(
  () => debounce((value) => onUpdate(field.id, { label: value }), 300),
  [field.id, onUpdate]
);

// 4. Virtualize large field lists (if >50 fields)
import { FixedSizeList } from 'react-window';
```

---

## 🔍 Debugging Guide

### Common Issues & Solutions

#### Issue 1: Template doesn't apply
```typescript
// Check: Is position 'none'?
console.log('Form position:', form.position);
// If not 'none', template selector won't show

// Fix: Reset position
onChange({ ...form, position: 'none', fields: [] });
```

#### Issue 2: Drag-and-drop not working
```typescript
// Check: Are event handlers attached?
console.log('Draggable elements:', document.querySelectorAll('[draggable]'));

// Check: Is draggedIndex being set?
const handleDragStart = (index) => {
  console.log('Drag started:', index);
  setDraggedIndex(index);
};
```

#### Issue 3: Form not saving
```typescript
// Check: Is formConfig included in save?
const saveChatbot = async () => {
  const data = {
    name: chatbotName,
    formConfig: formConfig,  // ← Must be included!
    // ...
  };
  console.log('Saving chatbot with data:', data);
  await createChatbot(data);
};
```

---

## 📚 Additional Resources

### Code Locations

| Feature | File | Line Range |
|---------|------|------------|
| Template definitions | FormBuilder.tsx | ~50-150 |
| Apply template function | FormBuilder.tsx | ~160-175 |
| Template selector UI | FormBuilder.tsx | ~240-310 |
| Form editor UI | FormBuilder.tsx | ~310-420 |
| Drag-drop logic | FormBuilder.tsx | ~94-116 |
| Integration with chatbot | ChatbotBuilder.tsx | ~58-66, 255-272 |

### Related Documentation

- **User Guide**: FORM_TEMPLATES_QUICK_REFERENCE.md
- **Implementation**: IMPLEMENTATION_GUIDE.md
- **API Details**: DEVELOPER_GUIDE.md
- **Design System**: styles/globals.css

---

*Architecture Document v1.0 - For Developers*
