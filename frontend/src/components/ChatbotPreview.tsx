import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { X, MessageSquare, Send, Bot, User } from 'lucide-react';
import { Input } from './ui/input';

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

interface ChatMessage {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
  isOptions?: boolean;
  options?: string[];
}

interface ChatbotPreviewProps {
  questions: Question[];
  chatbotName: string;
  onClose: () => void;
}

export function ChatbotPreview({ questions, chatbotName, onClose }: ChatbotPreviewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Start the conversation with welcome message or first question
    initializeChat();
  }, []);

  const initializeChat = () => {
    const welcomeQuestion = questions.find(q => q.isWelcome);
    const firstQuestion = welcomeQuestion || questions[0];
    
    if (firstQuestion) {
      setTimeout(() => {
        addBotMessage(firstQuestion);
        setCurrentQuestionId(firstQuestion.id);
      }, 500);
    }
  };

  const addBotMessage = (question: Question) => {
    setIsTyping(true);
    
    setTimeout(() => {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'bot',
        content: question.question,
        timestamp: new Date(),
        isOptions: question.type === 'options',
        options: question.options
      };
      
      setMessages(prev => [...prev, newMessage]);
      setIsTyping(false);
    }, 800);
  };

  const addUserMessage = (content: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  const handleOptionClick = (option: string) => {
    addUserMessage(option);
    
    // Find the current question and check for follow-up
    const currentQuestion = questions.find(q => q.id === currentQuestionId);
    if (currentQuestion) {
      // Look for a follow-up question for this option
      const followUpQuestion = questions.find(q => 
        q.parentQuestionId === currentQuestionId && q.triggerOption === option
      );
      
      if (followUpQuestion) {
        setTimeout(() => {
          addBotMessage(followUpQuestion);
          setCurrentQuestionId(followUpQuestion.id);
        }, 1000);
      } else {
        // Show a generic response if no follow-up
        setTimeout(() => {
          addGenericResponse(option);
        }, 1000);
      }
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    
    addUserMessage(userInput);
    
    // Find current question and show its answer
    const currentQuestion = questions.find(q => q.id === currentQuestionId);
    if (currentQuestion && currentQuestion.answer) {
      setTimeout(() => {
        const responseMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'bot',
          content: currentQuestion.answer || 'Thank you for your message. Our team will get back to you soon.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, responseMessage]);
      }, 1000);
    }
    
    setUserInput('');
  };

  const addGenericResponse = (option: string) => {
    const responseMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'bot',
      content: `Thank you for selecting "${option}". Our team will help you with this request.`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, responseMessage]);
  };

  const resetChat = () => {
    setMessages([]);
    setCurrentQuestionId(null);
    setUserInput('');
    initializeChat();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full h-[600px] flex flex-col animate-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-primary text-primary-foreground rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <div className="font-medium">{chatbotName || 'Chatbot Preview'}</div>
              <div className="text-xs opacity-90">Online</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetChat}
              className="text-white hover:bg-white hover:bg-opacity-20 text-xs px-2 py-1 h-auto"
            >
              Reset
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.length === 0 && !isTyping && (
            <div className="text-center text-muted-foreground py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Conversation will start shortly...</p>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-in`}
            >
              <div className={`flex items-start gap-2 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'user' 
                    ? 'bg-primary text-white' 
                    : 'bg-white border-2 border-gray-200'
                }`}>
                  {message.type === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div className={`${message.type === 'user' ? 'mr-2' : 'ml-2'}`}>
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-primary text-white ml-auto'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  
                  {message.isOptions && message.options && (
                    <div className="mt-2 space-y-2">
                      {message.options.map((option, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleOptionClick(option)}
                          className="block w-full text-left justify-start text-sm py-2 px-3 bg-white hover:bg-primary hover:text-white transition-colors"
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  )}
                  
                  <div className={`text-xs text-muted-foreground mt-1 ${
                    message.type === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start animate-in">
              <div className="flex items-start gap-2 max-w-[85%]">
                <div className="h-8 w-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="ml-2">
                  <div className="px-4 py-2 rounded-2xl bg-white border border-gray-200">
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border bg-white rounded-b-xl">
          <form onSubmit={handleTextSubmit} className="flex items-center gap-2">
            <Input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 border-gray-300 focus:border-primary"
              disabled={isTyping}
            />
            <Button
              type="submit"
              size="sm"
              disabled={!userInput.trim() || isTyping}
              className="px-3"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <div className="text-xs text-muted-foreground mt-2 text-center">
            This is a preview. Your actual chatbot will integrate with WhatsApp.
          </div>
        </div>
      </div>
    </div>
  );
}