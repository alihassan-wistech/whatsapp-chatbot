import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Card } from './ui/card';
import { Plus, Trash2, GripVertical, Mail, Phone, User, Hash, Calendar, MessageSquare, FileText, Sparkles } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'number' | 'date' | 'textarea';
  placeholder?: string;
  required: boolean;
  order: number;
}

export interface FormConfig {
  id?: string;
  title: string;
  description?: string;
  position: 'start' | 'end' | 'none';
  fields: FormField[];
  submitButtonText: string;
}

interface FormBuilderProps {
  form: FormConfig;
  onChange: (form: FormConfig) => void;
}

const fieldTypeIcons = {
  text: User,
  email: Mail,
  phone: Phone,
  number: Hash,
  date: Calendar,
  textarea: MessageSquare,
};

const defaultFieldsByType = {
  text: { label: 'Full Name', placeholder: 'Enter your name' },
  email: { label: 'Email Address', placeholder: 'your@email.com' },
  phone: { label: 'Phone Number', placeholder: '+1234567890' },
  number: { label: 'Number', placeholder: 'Enter a number' },
  date: { label: 'Date', placeholder: 'Select a date' },
  textarea: { label: 'Message', placeholder: 'Enter your message' },
};

// Form Templates
const formTemplates = {
  contact: {
    title: 'Contact Information',
    description: 'Please provide your contact details so we can reach you',
    position: 'end' as const,
    submitButtonText: 'Submit',
    fields: [
      {
        id: 'contact-name',
        label: 'Full Name',
        type: 'text' as const,
        placeholder: 'Enter your full name',
        required: true,
        order: 0
      },
      {
        id: 'contact-email',
        label: 'Email Address',
        type: 'email' as const,
        placeholder: 'your@email.com',
        required: true,
        order: 1
      },
      {
        id: 'contact-phone',
        label: 'Phone Number',
        type: 'phone' as const,
        placeholder: '+1 (555) 000-0000',
        required: false,
        order: 2
      },
      {
        id: 'contact-message',
        label: 'Message',
        type: 'textarea' as const,
        placeholder: 'How can we help you?',
        required: false,
        order: 3
      }
    ]
  },
  leadCapture: {
    title: 'Get Started',
    description: 'Share your details and we\'ll be in touch shortly',
    position: 'end' as const,
    submitButtonText: 'Get Started',
    fields: [
      {
        id: 'lead-name',
        label: 'Your Name',
        type: 'text' as const,
        placeholder: 'Enter your name',
        required: true,
        order: 0
      },
      {
        id: 'lead-email',
        label: 'Work Email',
        type: 'email' as const,
        placeholder: 'your@company.com',
        required: true,
        order: 1
      },
      {
        id: 'lead-phone',
        label: 'Phone Number',
        type: 'phone' as const,
        placeholder: '+1 (555) 000-0000',
        required: true,
        order: 2
      }
    ]
  },
  feedback: {
    title: 'Share Your Feedback',
    description: 'Help us improve by sharing your thoughts',
    position: 'end' as const,
    submitButtonText: 'Send Feedback',
    fields: [
      {
        id: 'feedback-name',
        label: 'Name (Optional)',
        type: 'text' as const,
        placeholder: 'Your name',
        required: false,
        order: 0
      },
      {
        id: 'feedback-email',
        label: 'Email (Optional)',
        type: 'email' as const,
        placeholder: 'your@email.com',
        required: false,
        order: 1
      },
      {
        id: 'feedback-message',
        label: 'Your Feedback',
        type: 'textarea' as const,
        placeholder: 'Share your thoughts, suggestions, or concerns...',
        required: true,
        order: 2
      }
    ]
  }
};

export function FormBuilder({ form, onChange }: FormBuilderProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const applyTemplate = (templateKey: keyof typeof formTemplates) => {
    const template = formTemplates[templateKey];
    onChange({
      ...form,
      ...template,
      fields: template.fields.map(field => ({
        ...field,
        id: `field-${Date.now()}-${field.id}`
      }))
    });
    toast.success('Template applied successfully!');
  };

  const addField = (type: FormField['type']) => {
    const defaults = defaultFieldsByType[type];
    const newField: FormField = {
      id: `field-${Date.now()}`,
      label: defaults.label,
      type,
      placeholder: defaults.placeholder,
      required: false,
      order: form.fields.length,
    };

    onChange({
      ...form,
      fields: [...form.fields, newField],
    });

    toast.success('Field added');
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    onChange({
      ...form,
      fields: form.fields.map(field =>
        field.id === id ? { ...field, ...updates } : field
      ),
    });
  };

  const removeField = (id: string) => {
    onChange({
      ...form,
      fields: form.fields.filter(field => field.id !== id).map((field, index) => ({
        ...field,
        order: index,
      })),
    });
    toast.success('Field removed');
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newFields = [...form.fields];
    const draggedItem = newFields[draggedIndex];
    newFields.splice(draggedIndex, 1);
    newFields.splice(index, 0, draggedItem);

    onChange({
      ...form,
      fields: newFields.map((field, idx) => ({ ...field, order: idx })),
    });
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-6">
      {/* Quick Templates */}
      {form.position === 'none' && (
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="mb-0">Quick Start Templates</h3>
            </div>
            <p className="text-muted-foreground">
              Get started quickly with pre-configured forms for common use cases
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="h-auto flex-col items-start gap-2 p-4 bg-white hover:bg-blue-50 hover:border-blue-300 border-2"
                onClick={() => applyTemplate('contact')}
              >
                <div className="flex items-center gap-2 w-full">
                  <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="font-medium">Contact Form</span>
                </div>
                <span className="text-xs text-muted-foreground text-left">
                  Collect name, email, phone, and message after the conversation
                </span>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto flex-col items-start gap-2 p-4 bg-white hover:bg-purple-50 hover:border-purple-300 border-2"
                onClick={() => applyTemplate('leadCapture')}
              >
                <div className="flex items-center gap-2 w-full">
                  <div className="h-8 w-8 rounded bg-purple-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="font-medium">Lead Capture</span>
                </div>
                <span className="text-xs text-muted-foreground text-left">
                  Capture qualified leads with essential contact information
                </span>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto flex-col items-start gap-2 p-4 bg-white hover:bg-green-50 hover:border-green-300 border-2"
                onClick={() => applyTemplate('feedback')}
              >
                <div className="flex items-center gap-2 w-full">
                  <div className="h-8 w-8 rounded bg-green-100 flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="font-medium">Feedback Form</span>
                </div>
                <span className="text-xs text-muted-foreground text-left">
                  Collect user feedback and suggestions at the end
                </span>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <FileText className="h-3 w-3" />
              Or configure a custom form manually using the settings below
            </p>
          </div>
        </Card>
      )}

      {/* Form Settings */}
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="mb-0">Form Settings</h3>
              {form.position !== 'none' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const confirmReset = window.confirm('Replace current form with a template? Your current form configuration will be lost.');
                    if (confirmReset) {
                      onChange({
                        ...form,
                        position: 'none',
                        fields: []
                      });
                      toast.info('Form reset. Choose a template above to get started.');
                    }
                  }}
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Use Template
                </Button>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="form-title">Form Title</Label>
                <Input
                  id="form-title"
                  value={form.title}
                  onChange={(e) => onChange({ ...form, title: e.target.value })}
                  placeholder="Contact Information"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="form-description">Description (Optional)</Label>
                <Input
                  id="form-description"
                  value={form.description || ''}
                  onChange={(e) => onChange({ ...form, description: e.target.value })}
                  placeholder="Please provide your contact details"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="form-position">Form Position</Label>
                <Select
                  value={form.position}
                  onValueChange={(value: 'start' | 'end' | 'none') => onChange({ ...form, position: value })}
                >
                  <SelectTrigger id="form-position" className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Form</SelectItem>
                    <SelectItem value="start">Before Conversation</SelectItem>
                    <SelectItem value="end">After Conversation</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1.5">
                  {form.position === 'start' && 'Form will be shown before the chatbot conversation starts'}
                  {form.position === 'end' && 'Form will be shown after the conversation ends'}
                  {form.position === 'none' && 'No form will be shown'}
                </p>
              </div>

              <div>
                <Label htmlFor="submit-button">Submit Button Text</Label>
                <Input
                  id="submit-button"
                  value={form.submitButtonText}
                  onChange={(e) => onChange({ ...form, submitButtonText: e.target.value })}
                  placeholder="Submit"
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Form Fields */}
      {form.position !== 'none' && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h3>Form Fields</h3>
              <p className="text-muted-foreground mt-1">Add and configure fields to collect information</p>
            </div>
          </div>

          {/* Add Field Buttons */}
          <Card className="p-6">
            <div>
              <Label className="mb-3 block">Add Field</Label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(fieldTypeIcons).map(([type, Icon]) => (
                  <Button
                    key={type}
                    variant="outline"
                    size="sm"
                    onClick={() => addField(type as FormField['type'])}
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </Card>

          {/* Field List */}
          {form.fields.length > 0 ? (
            <div className="space-y-3">
              {form.fields
                .sort((a, b) => a.order - b.order)
                .map((field, index) => {
                  const Icon = fieldTypeIcons[field.type];
                  
                  return (
                    <Card
                      key={field.id}
                      className="p-4"
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="space-y-4">
                        {/* Field Header */}
                        <div className="flex items-start gap-3">
                          <div className="mt-2 cursor-move text-muted-foreground hover:text-foreground">
                            <GripVertical className="h-5 w-5" />
                          </div>
                          
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium capitalize">{field.type} Field</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs">Field Label</Label>
                                <Input
                                  value={field.label}
                                  onChange={(e) => updateField(field.id, { label: e.target.value })}
                                  placeholder="Label"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Placeholder</Label>
                                <Input
                                  value={field.placeholder || ''}
                                  onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                                  placeholder="Placeholder text"
                                  className="mt-1"
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Switch
                                checked={field.required}
                                onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                              />
                              <Label className="text-sm cursor-pointer" onClick={() => updateField(field.id, { required: !field.required })}>
                                Required field
                              </Label>
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeField(field.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <div className="text-muted-foreground">
                <Plus className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p>No fields added yet</p>
                <p className="text-sm mt-1">Add fields using the buttons above</p>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
