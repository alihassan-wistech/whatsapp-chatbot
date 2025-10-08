import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { ArrowLeft, Plus, Save, Eye, Trash2, MoreVertical, Link, ArrowRight, GitBranch, Check, MessageSquare, Globe } from 'lucide-react';
import { FlowBuilder } from './FlowBuilder';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { ChatbotPreview } from './ChatbotPreview';
import { getChatbot, createChatbot, updateChatbot } from '../utils/api';

interface ChatbotBuilderProps {
  chatbotId: string | null;
  onBack: () => void;
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

export function ChatbotBuilder({ chatbotId, onBack }: ChatbotBuilderProps) {
  const [chatbotName, setChatbotName] = useState('');
  const [chatbotDescription, setChatbotDescription] = useState('');
  const [enableWhatsApp, setEnableWhatsApp] = useState(true);
  const [enableWebsite, setEnableWebsite] = useState(true);
  const [activeTab, setActiveTab] = useState('questions');
  const [creatingFollowUp, setCreatingFollowUp] = useState<string | null>(null);
  const [showFollowUpForm, setShowFollowUpForm] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [followUpFormData, setFollowUpFormData] = useState({
    question: '',
    type: 'text' as 'text' | 'options',
    options: ['']
  });

  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    if (chatbotId) {
      loadChatbot();
    }
  }, [chatbotId]);

  const loadChatbot = async () => {
    if (!chatbotId) return;

    try {
      setIsLoading(true);
      const { data:chatbot } = await getChatbot(chatbotId);
      setChatbotName(chatbot.name);
      setChatbotDescription(chatbot.description);
      setQuestions(chatbot.questions || []);
      setEnableWhatsApp(chatbot.settings?.enableWhatsApp ?? true);
      setEnableWebsite(chatbot.settings?.enableWebsite ?? true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load chatbot');
      onBack();
    } finally {
      setIsLoading(false);
    }
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type: 'text',
      question: '',
      answer: ''
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
    setQuestions(prev => prev.map(q => ({
      ...q,
      optionFlows: q.optionFlows?.filter(flow => flow.nextQuestionId !== id)
    })));
  };

  const addOption = (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (question) {
      const updatedOptions = [...(question.options || []), ''];
      updateQuestion(questionId, { options: updatedOptions });
    }
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    const question = questions.find(q => q.id === questionId);
    if (question && question.options) {
      const updatedOptions = [...question.options];
      updatedOptions[optionIndex] = value;
      updateQuestion(questionId, { options: updatedOptions });
    }
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    const question = questions.find(q => q.id === questionId);
    if (question && question.options) {
      const optionToRemove = question.options[optionIndex];
      const updatedOptions = question.options.filter((_, index) => index !== optionIndex);
      updateQuestion(questionId, { options: updatedOptions });

      const followUpQuestions = questions.filter(q => 
        q.parentQuestionId === questionId && q.triggerOption === optionToRemove
      );
      followUpQuestions.forEach(q => deleteQuestion(q.id));
    }
  };

  const getFollowUpQuestionId = (parentId: string, option: string): string | null => {
    const followUpQuestion = questions.find(q => 
      q.parentQuestionId === parentId && q.triggerOption === option
    );
    return followUpQuestion ? followUpQuestion.id : null;
  };

  const unlinkFollowUpQuestion = (parentId: string, option: string) => {
    const followUpQuestionId = getFollowUpQuestionId(parentId, option);
    if (followUpQuestionId) {
      deleteQuestion(followUpQuestionId);
    }
  };

  const showFollowUpFormHandler = (questionId: string, option: string) => {
    setShowFollowUpForm(questionId + '-' + option);
    setFollowUpFormData({
      question: '',
      type: 'text',
      options: ['']
    });
  };

  const updateFollowUpFormData = (updates: Partial<typeof followUpFormData>) => {
    setFollowUpFormData(prev => ({ ...prev, ...updates }));
  };

  const createFollowUpQuestion = () => {
    if (!showFollowUpForm || !followUpFormData.question.trim()) return;

    const [parentId, ...optionParts] = showFollowUpForm.split('-');
    const option = optionParts.join('-');

    setCreatingFollowUp(showFollowUpForm);

    setTimeout(() => {
      const newFollowUpQuestion: Question = {
        id: Date.now().toString(),
        type: followUpFormData.type,
        question: followUpFormData.question,
        parentQuestionId: parentId,
        triggerOption: option,
        ...(followUpFormData.type === 'text' 
          ? { answer: '' }
          : { options: followUpFormData.options.filter(opt => opt.trim()) }
        )
      };

      setQuestions(prev => [...prev, newFollowUpQuestion]);
      setCreatingFollowUp(null);
      setShowFollowUpForm(null);
      setFollowUpFormData({ question: '', type: 'text', options: [''] });

      toast.success('Follow-up question created successfully!');
    }, 800);
  };

  const cancelFollowUpCreation = () => {
    setShowFollowUpForm(null);
    setFollowUpFormData({ question: '', type: 'text', options: [''] });
  };

  const updateFollowUpOption = (index: number, value: string) => {
    const updatedOptions = [...followUpFormData.options];
    updatedOptions[index] = value;
    updateFollowUpFormData({ options: updatedOptions });
  };

  const addFollowUpOption = () => {
    updateFollowUpFormData({ options: [...followUpFormData.options, ''] });
  };

  const removeFollowUpOption = (index: number) => {
    if (followUpFormData.options.length > 1) {
      const updatedOptions = followUpFormData.options.filter((_, i) => i !== index);
      updateFollowUpFormData({ options: updatedOptions });
    }
  };

  const saveChatbot = async () => {
    if (!chatbotName.trim()) {
      toast.error('Please enter a chatbot name');
      return;
    }
    
    try {
      setIsSaving(true);
      const data = {
        name: chatbotName,
        description: chatbotDescription,
        questions,
        settings: {
          enableWhatsApp,
          enableWebsite
        }
      };

      if (chatbotId) {
        await updateChatbot(chatbotId, data);
        toast.success('Chatbot updated successfully!');
      } else {
        await createChatbot(data);
        toast.success('Chatbot created successfully!');
        onBack();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save chatbot');
    } finally {
      setIsSaving(false);
    }
  };

  const previewChatbot = () => {
    if (questions.length === 0) {
      toast.error('Please add at least one question before previewing');
      return;
    }
    setShowPreview(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading chatbot...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {showPreview && (
        <ChatbotPreview
          questions={questions}
          chatbotName={chatbotName}
          onClose={() => setShowPreview(false)}
        />
      )}
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Chatbots
          </Button>
          <div>
            <h1 className="mb-1">{chatbotId ? 'Edit Chatbot' : 'Create New Chatbot'}</h1>
            <p className="text-muted-foreground">
              {chatbotId ? 'Modify your chatbot configuration' : 'Build an intelligent chatbot with conditional flows'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={previewChatbot} className="gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button onClick={saveChatbot} disabled={isSaving} className="gap-2">
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : chatbotId ? 'Update Chatbot' : 'Save Chatbot'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <Label>Chatbot Name *</Label>
            <Input
              value={chatbotName}
              onChange={(e) => setChatbotName(e.target.value)}
              placeholder="e.g., Customer Support Bot"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={chatbotDescription}
              onChange={(e) => setChatbotDescription(e.target.value)}
              placeholder="Brief description of what this chatbot does..."
              className="mt-1"
              rows={3}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <Label className="mb-3 block">Integration Channels</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-green-100 rounded flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium">WhatsApp Business</div>
                    <div className="text-sm text-muted-foreground">Direct messaging integration</div>
                  </div>
                </div>
                <Switch checked={enableWhatsApp} onCheckedChange={setEnableWhatsApp} />
              </div>
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-blue-100 rounded flex items-center justify-center">
                    <Globe className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">Website Widget</div>
                    <div className="text-sm text-muted-foreground">Embeddable chat widget</div>
                  </div>
                </div>
                <Switch checked={enableWebsite} onCheckedChange={setEnableWebsite} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="questions">Questions & Flow</TabsTrigger>
          <TabsTrigger value="flow">Visual Flow</TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="mb-1">Question Flow</h3>
              <p className="text-muted-foreground">
                Create questions and build conditional conversation flows
              </p>
            </div>
            <Button onClick={addQuestion} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Question
            </Button>
          </div>

          <div className="space-y-6">
            {questions.map((question, index) => {
              const isFollowUp = !!question.parentQuestionId;
              const parentQuestion = questions.find(q => q.id === question.parentQuestionId);
              
              return (
                <div key={question.id} className="relative">
                  {isFollowUp && (
                    <>
                      <div className="absolute left-4 -top-2 w-8 h-4 border-l-2 border-b-2 border-primary border-opacity-60 rounded-bl-lg"></div>
                      <div className="absolute -left-2 -top-1 w-4 h-4 bg-primary bg-opacity-20 rounded-full border-2 border-primary border-opacity-60"></div>
                    </>
                  )}
                  
                  <Card 
                    id={"question-" + question.id}
                    className={
                      "p-6 transition-all duration-300 " +
                      (isFollowUp ? 'ml-12 border-l-4 border-l-primary bg-gradient-to-r from-blue-50 to-blue-100 shadow-sm' : '') +
                      (!question.question && isFollowUp ? ' animate-pulse bg-blue-100' : '')
                    }
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={
                          "h-8 w-8 rounded-lg flex items-center justify-center text-sm font-medium " +
                          (isFollowUp ? 'bg-blue-100 text-primary border-2 border-blue-200' : 'bg-primary text-primary-foreground')
                        }>
                          {isFollowUp ? <ArrowRight className="h-4 w-4" /> : index + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {isFollowUp ? (
                                <span className="flex items-center gap-2">
                                  <span className="text-primary font-semibold">Follow-up Question</span>
                                  <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full font-medium">
                                    When: "{question.triggerOption}"
                                  </span>
                                </span>
                              ) : (
                                "Question " + (index + 1)
                              )}
                            </span>
                            {question.isWelcome && (
                              <Badge variant="secondary">Welcome Message</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {isFollowUp ? (
                              <span className="flex items-center gap-2">
                                <span className="capitalize">{question.type} question</span>
                                <span>•</span>
                                <span className="text-primary">Triggered by "{parentQuestion?.question || 'Parent question'}"</span>
                              </span>
                            ) : (
                              <span className="capitalize">{question.type} question</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteQuestion(question.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label>Question Text *</Label>
                        <Input
                          value={question.question}
                          onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                          placeholder="Enter your question..."
                          className="mt-1"
                        />
                      </div>

                      {question.type === 'text' && (
                        <div>
                          <Label>Bot Response</Label>
                          <Textarea
                            value={question.answer || ''}
                            onChange={(e) => updateQuestion(question.id, { answer: e.target.value })}
                            placeholder="How should the bot respond to this question?"
                            className="mt-1"
                            rows={3}
                          />
                        </div>
                      )}

                      {question.type === 'options' && (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <Label>Answer Options</Label>
                            <span className="text-xs text-muted-foreground">
                              Users will see these as clickable buttons
                            </span>
                          </div>
                          <div className="space-y-2">
                            {(question.options || []).map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center gap-2">
                                <Input
                                  value={option}
                                  onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                                  placeholder={"Option " + (optionIndex + 1)}
                                  className="flex-1"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeOption(question.id, optionIndex)}
                                  disabled={question.options && question.options.length <= 1}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addOption(question.id)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Option
                            </Button>
                          </div>

                          {question.options && question.options.length > 0 && (
                            <div className="pt-4 border-t border-border">
                              <div className="flex items-center gap-2 mb-3">
                                <GitBranch className="h-4 w-4 text-primary" />
                                <Label>Conditional Flow Setup</Label>
                              </div>
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                                <p className="text-sm text-blue-800 font-medium mb-1">
                                  💡 How to create follow-up questions:
                                </p>
                                <p className="text-sm text-blue-700">
                                  1. Add your options above<br/>
                                  2. Click "Add Follow-up" next to any option<br/>
                                  3. Fill out the follow-up question form that appears<br/>
                                  4. Click "Create Follow-up" to add the question below
                                </p>
                              </div>
                              <div className="space-y-3">
                                {question.options.map((option, optionIndex) => {
                                  const hasFollowUp = getFollowUpQuestionId(question.id, option);
                                  const followUpQuestion = hasFollowUp ? 
                                    questions.find(q => q.id === hasFollowUp) : null;
                                  
                                  return (
                                    <div key={optionIndex} className={
                                      "flex items-center justify-between p-3 rounded-lg border-2 transition-all " +
                                      (hasFollowUp ? 'bg-blue-50 border-blue-200' : 'bg-muted border-border')
                                    }>
                                      <div className="flex items-center gap-3">
                                        <div className={
                                          "h-6 w-6 rounded text-xs flex items-center justify-center font-medium " +
                                          (hasFollowUp ? 'bg-blue-100 text-primary border-2 border-blue-200' : 'bg-muted-foreground text-white')
                                        }>
                                          {optionIndex + 1}
                                        </div>
                                        <div>
                                          <div className="font-medium text-sm">
                                            {option || ("Option " + (optionIndex + 1))}
                                          </div>
                                          {followUpQuestion ? (
                                            <div className="text-xs text-primary flex items-center gap-1 font-medium">
                                              <ArrowRight className="h-3 w-3" />
                                              <span className="max-w-[200px] truncate">
                                                {followUpQuestion.question || 'Follow-up question created - click Edit to customize'}
                                              </span>
                                            </div>
                                          ) : (
                                            <div className="text-xs text-muted-foreground">
                                              No follow-up question yet
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {hasFollowUp ? (
                                          <>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => {
                                                const element = document.getElementById("question-" + hasFollowUp);
                                                if (element) {
                                                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                  const questionInput = element.querySelector('input[placeholder*="question"]') as HTMLInputElement;
                                                  if (questionInput) {
                                                    setTimeout(() => questionInput.focus(), 300);
                                                  }
                                                }
                                              }}
                                            >
                                              <ArrowRight className="h-3 w-3 mr-1" />
                                              Edit
                                            </Button>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => unlinkFollowUpQuestion(question.id, option)}
                                            >
                                              <Trash2 className="h-3 w-3 mr-1" />
                                              Unlink
                                            </Button>
                                          </>
                                        ) : (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => showFollowUpFormHandler(question.id, option)}
                                            disabled={!option.trim() || showFollowUpForm === (question.id + '-' + option) || creatingFollowUp === (question.id + '-' + option)}
                                            className={creatingFollowUp === (question.id + '-' + option) ? 'bg-primary text-primary-foreground' : ''}
                                          >
                                            {creatingFollowUp === (question.id + '-' + option) ? (
                                              <>
                                                <div className="h-3 w-3 mr-1 animate-spin border border-current border-t-transparent rounded-full" />
                                                Creating Question...
                                              </>
                                            ) : (
                                              <>
                                                <Link className="h-3 w-3 mr-1" />
                                                Add Follow-up
                                              </>
                                            )}
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {showFollowUpForm && showFollowUpForm.startsWith(question.id + '-') && (
                            <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg animate-in">
                              <div className="flex items-center gap-2 mb-4">
                                <div className="h-6 w-6 rounded bg-blue-100 flex items-center justify-center">
                                  <Plus className="h-3 w-3 text-blue-600" />
                                </div>
                                <h4 className="font-medium text-blue-900">Create Follow-up Question</h4>
                                <Badge variant="secondary" className="text-xs">
                                  Triggered by: "{showFollowUpForm ? showFollowUpForm.substring(showFollowUpForm.indexOf('-') + 1) : ''}"
                                </Badge>
                              </div>
                              
                              <div className="space-y-4">
                                <div>
                                  <Label className="text-sm font-medium text-blue-900">Follow-up Question *</Label>
                                  <Input
                                    value={followUpFormData.question}
                                    onChange={(e) => updateFollowUpFormData({ question: e.target.value })}
                                    placeholder="e.g., What specific features are you looking for?"
                                    className="mt-1 border-blue-200 focus:border-blue-400"
                                    autoFocus
                                  />
                                </div>

                                <div>
                                  <Label className="text-sm font-medium text-blue-900">Question Type</Label>
                                  <select
                                    value={followUpFormData.type}
                                    onChange={(e) => updateFollowUpFormData({ type: e.target.value as 'text' | 'options' })}
                                    className="mt-1 w-full px-3 py-2 border border-blue-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="text">Text Response</option>
                                    <option value="options">Multiple Choice</option>
                                  </select>
                                </div>

                                {followUpFormData.type === 'options' && (
                                  <div>
                                    <Label className="text-sm font-medium text-blue-900">Answer Options</Label>
                                    <div className="mt-2 space-y-2">
                                      {followUpFormData.options.map((option, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                          <Input
                                            value={option}
                                            onChange={(e) => updateFollowUpOption(index, e.target.value)}
                                            placeholder={"Option " + (index + 1)}
                                            className="flex-1 border-blue-200"
                                          />
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeFollowUpOption(index)}
                                            disabled={followUpFormData.options.length <= 1}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      ))}
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={addFollowUpOption}
                                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                      >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add Option
                                      </Button>
                                    </div>
                                  </div>
                                )}

                                <div className="flex items-center gap-3 pt-2">
                                  <Button
                                    onClick={createFollowUpQuestion}
                                    disabled={!followUpFormData.question.trim()}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                  >
                                    {creatingFollowUp ? (
                                      <>
                                        <div className="h-3 w-3 mr-2 animate-spin border border-current border-t-transparent rounded-full" />
                                        Creating...
                                      </>
                                    ) : (
                                      <>
                                        <Check className="h-3 w-3 mr-2" />
                                        Create Follow-up
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={cancelFollowUpCreation}
                                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-4 pt-2 border-t border-border">
                        <Label className="text-sm">Question Type:</Label>
                        <select
                          value={question.type}
                          onChange={(e) => updateQuestion(question.id, { type: e.target.value as any })}
                          className="px-3 py-1 border rounded-md text-sm"
                        >
                          <option value="text">Text Response</option>
                          <option value="options">Multiple Choice</option>
                        </select>
                      </div>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>

          {questions.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
              <h4 className="mb-2">No questions added yet</h4>
              <p className="text-muted-foreground mb-4">Start building your chatbot by adding questions</p>
              <Button onClick={addQuestion}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Question
              </Button>
            </div>
          )}

          {questions.length > 0 && (
            <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <GitBranch className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">📍 Looking for Follow-up Questions?</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    Follow-up questions appear <strong>indented below</strong> their parent question with:
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• <ArrowRight className="h-3 w-3 inline mr-1" /> Arrow icon instead of number</li>
                    <li>• Colored background and left border</li>
                    <li>• "Follow-up Question" label</li>
                    <li>• Connection line from parent</li>
                  </ul>
                  <p className="text-sm text-blue-700 mt-2">
                    To create: Add options to a multiple choice question → Click "Add Follow-up" → Fill the form → Click "Create Follow-up"
                  </p>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="flow">
          <FlowBuilder questions={questions} onUpdateQuestions={setQuestions} />
        </TabsContent>
      </Tabs>
    </div>
  );
}