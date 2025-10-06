import { useState, useCallback, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ArrowRight, MessageCircle, List, GitBranch, Plus, ArrowDownRight, FileText } from 'lucide-react';
import { FormConfig } from './FormBuilder';

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

interface FlowBuilderProps {
  questions: Question[];
  onUpdateQuestions: (questions: Question[]) => void;
  formConfig?: FormConfig;
}

interface FlowNode {
  id: string;
  question: Question;
  x: number;
  y: number;
  connections: string[];
}

export function FlowBuilder({ questions, onUpdateQuestions, formConfig }: FlowBuilderProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  // Organize questions: main questions first, then their follow-ups recursively
  const organizeQuestions = () => {
    const organized: Question[] = [];
    const followUpMap = new Map<string, Question[]>();
    
    // Group follow-ups by parent
    questions.forEach(q => {
      if (q.parentQuestionId) {
        if (!followUpMap.has(q.parentQuestionId)) {
          followUpMap.set(q.parentQuestionId, []);
        }
        followUpMap.get(q.parentQuestionId)!.push(q);
      }
    });
    
    // Recursive function to add question and its children
    const addQuestionAndChildren = (question: Question) => {
      organized.push(question);
      const children = followUpMap.get(question.id) || [];
      children.forEach(child => addQuestionAndChildren(child));
    };
    
    // Add main questions and their follow-ups in order
    questions.filter(q => !q.parentQuestionId).forEach(mainQ => {
      addQuestionAndChildren(mainQ);
    });
    
    return organized;
  };

  // Helper to get question depth
  const getQuestionDepth = (questionId: string): number => {
    const question = questions.find(q => q.id === questionId);
    if (!question || !question.parentQuestionId) return 0;
    return 1 + getQuestionDepth(question.parentQuestionId);
  };

  const [flowNodes, setFlowNodes] = useState<FlowNode[]>([]);

  // Update flow nodes when questions change
  useEffect(() => {
    const organized = organizeQuestions();
    const newFlowNodes = organized.map((question, index) => ({
      id: question.id,
      question,
      x: 100 + (index % 3) * 300,
      y: 100 + Math.floor(index / 3) * 200,
      connections: []
    }));
    setFlowNodes(newFlowNodes);
  }, [questions]);

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return MessageCircle;
      case 'options':
        return List;
      case 'conditional':
        return GitBranch;
      default:
        return MessageCircle;
    }
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'text':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'options':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'conditional':
        return 'bg-purple-50 border-purple-200 text-purple-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-16">
        <GitBranch className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="mb-2">No Questions to Display</h3>
        <p className="text-muted-foreground mb-6">Add some questions first to see the conversation flow</p>
        <Button variant="outline">
          Go to Questions Tab
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3>Conversation Flow</h3>
          <p className="text-sm text-muted-foreground">Visual representation of your chatbot's conversation flow</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              // Auto-scroll to top for better view
              const flowContainer = document.querySelector('.flow-container');
              if (flowContainer) {
                flowContainer.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            Reset View
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              // Create a simple text export of the flow
              const flowText = questions.map((q, index) => {
                let text = `${index + 1}. ${q.question || 'Untitled question'}\n`;
                if (q.type === 'text' && q.answer) {
                  text += `   Answer: ${q.answer}\n`;
                }
                if (q.type === 'options' && q.options) {
                  text += `   Options: ${q.options.join(', ')}\n`;
                  if (q.optionFlows) {
                    q.optionFlows.forEach(flow => {
                      const followUp = questions.find(fq => fq.id === flow.nextQuestionId);
                      if (followUp) {
                        text += `   "${flow.optionText}" → ${followUp.question}\n`;
                      }
                    });
                  }
                }
                if (q.parentQuestionId) {
                  text += `   (Follow-up for: ${q.triggerOption})\n`;
                }
                return text;
              }).join('\n');
              
              navigator.clipboard.writeText(flowText).then(() => {
                // Could add a toast notification here
                alert('Flow exported to clipboard!');
              });
            }}
          >
            Export Flow
          </Button>
        </div>
      </div>

      <div className="flow-container border rounded-lg bg-gray-50/50 min-h-[600px] relative overflow-auto">
        <div className="p-8">
          <div className="space-y-8">
            {/* Start Form */}
            {formConfig && formConfig.position === 'start' && formConfig.fields.length > 0 && (
              <Card className="p-6 bg-amber-50 border-amber-200 max-w-xl">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-amber-900">Start Form</h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-200 text-amber-800">Before Conversation</span>
                    </div>
                    <p className="text-sm text-amber-700 mb-3">{formConfig.title}</p>
                    <div className="space-y-1">
                      {formConfig.fields.map(field => (
                        <div key={field.id} className="text-sm text-amber-600 flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-amber-400"></div>
                          {field.label} 
                          {field.required && <span className="text-amber-500">*</span>}
                          <span className="text-xs text-amber-500">({field.type})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {flowNodes.length > 0 && (
                  <div className="flex justify-center mt-4">
                    <ArrowDownRight className="h-6 w-6 text-amber-400" />
                  </div>
                )}
              </Card>
            )}

            {flowNodes.map((node, index) => {
              const Icon = getNodeIcon(node.question.type);
              const isSelected = selectedNode === node.id;
              const hasFollowUps = node.question.optionFlows && node.question.optionFlows.length > 0;
              const isFollowUp = node.question.parentQuestionId;
              const depth = getQuestionDepth(node.id);
              const indentLevel = depth * 32; // 32px per level
              
              return (
                <div key={node.id} style={{ marginLeft: isFollowUp ? `${indentLevel}px` : '0' }}>
                  <div className="flex items-center gap-6">
                    <Card 
                      className={`p-4 cursor-pointer transition-all max-w-sm ${
                        isSelected ? 'ring-2 ring-primary' : ''
                      } ${getNodeColor(node.question.type)} ${
                        isFollowUp ? 'border-l-4 border-primary' : ''
                      }`}
                      onClick={() => setSelectedNode(node.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm mb-1">
                            {isFollowUp ? (
                              <span className="text-primary">
                                Follow-up {index + 1}
                                {depth > 1 && <span className="text-xs ml-1">(Level {depth})</span>}
                              </span>
                            ) : (
                              `Question ${index + 1}`
                            )}
                          </div>
                          <div className="text-sm truncate mb-2">
                            {node.question.question || 'Untitled question'}
                          </div>
                          {isFollowUp && node.question.triggerOption && (
                            <div className="text-xs text-primary mb-1">
                              Triggered by: "{node.question.triggerOption}"
                            </div>
                          )}
                          <div className="text-xs opacity-75 capitalize">
                            {node.question.type} question
                          </div>
                        </div>
                      </div>

                      {node.question.type === 'options' && node.question.options && (
                        <div className="mt-3 pt-3 border-t border-white/50">
                          <div className="text-xs font-medium mb-2">Options:</div>
                          <div className="space-y-1">
                            {node.question.options.slice(0, 3).map((option, idx) => {
                              const hasConnection = node.question.optionFlows?.some(
                                flow => flow.optionText === option
                              );
                              return (
                                <div key={idx} className={`text-xs px-2 py-1 rounded truncate flex items-center justify-between ${
                                  hasConnection ? 'bg-primary/20 text-primary' : 'bg-white/50'
                                }`}>
                                  <span>{option || `Option ${idx + 1}`}</span>
                                  {hasConnection && <ArrowDownRight className="h-3 w-3" />}
                                </div>
                              );
                            })}
                            {node.question.options.length > 3 && (
                              <div className="text-xs opacity-75">
                                +{node.question.options.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </Card>
                    
                    {!isFollowUp && !hasFollowUps && index < flowNodes.length - 1 && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <ArrowRight className="h-4 w-4" />
                        <div className="text-xs">Next</div>
                      </div>
                    )}
                  </div>

                  {/* Show follow-up questions immediately after parent */}
                  {hasFollowUps && (
                    <div className="ml-8 mt-4 space-y-4">
                      {node.question.optionFlows?.map((flow, flowIndex) => {
                        const followUpQuestion = questions.find(q => q.id === flow.nextQuestionId);
                        if (!followUpQuestion) return null;
                        
                        const FollowUpIcon = getNodeIcon(followUpQuestion.type);
                        
                        return (
                          <div key={flowIndex} className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <div className="w-4 h-px bg-border"></div>
                              <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs">
                                {flow.optionText}
                              </span>
                              <ArrowRight className="h-3 w-3" />
                            </div>
                            <Card 
                              className={`p-3 cursor-pointer transition-all max-w-sm border-l-4 border-primary ${
                                selectedNode === followUpQuestion.id ? 'ring-2 ring-primary' : ''
                              } ${getNodeColor(followUpQuestion.type)}`}
                              onClick={() => setSelectedNode(followUpQuestion.id)}
                            >
                              <div className="flex items-start gap-2">
                                <div className="h-6 w-6 rounded bg-white flex items-center justify-center flex-shrink-0">
                                  <FollowUpIcon className="h-3 w-3" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-xs mb-1 text-primary">
                                    Follow-up Question
                                  </div>
                                  <div className="text-xs truncate">
                                    {followUpQuestion.question || 'Untitled question'}
                                  </div>
                                </div>
                              </div>
                            </Card>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* End Form */}
            {formConfig && formConfig.position === 'end' && formConfig.fields.length > 0 && flowNodes.length > 0 && (
              <>
                <div className="flex justify-center">
                  <ArrowDownRight className="h-6 w-6 text-emerald-400" />
                </div>
                <Card className="p-6 bg-emerald-50 border-emerald-200 max-w-xl">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-emerald-900">End Form</h4>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800">After Conversation</span>
                      </div>
                      <p className="text-sm text-emerald-700 mb-3">{formConfig.title}</p>
                      <div className="space-y-1">
                        {formConfig.fields.map(field => (
                          <div key={field.id} className="text-sm text-emerald-600 flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400"></div>
                            {field.label} 
                            {field.required && <span className="text-emerald-500">*</span>}
                            <span className="text-xs text-emerald-500">({field.type})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </>
            )}
          </div>

          {flowNodes.length > 0 && (
            <div className="mt-8 p-4 border-2 border-dashed border-border rounded-lg">
              <div className="flex items-center justify-center gap-3">
                <Plus className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Add more questions to extend the flow</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedNode && (
        <Card className="p-4 bg-muted">
          <h4 className="mb-2">Flow Actions</h4>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Add Connection
            </Button>
            <Button variant="outline" size="sm">
              Edit Question
            </Button>
            <Button variant="outline" size="sm">
              Duplicate
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Text Questions</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {questions.filter(q => q.type === 'text').length}
          </div>
          <div className="text-xs text-muted-foreground">Simple Q&A responses</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <List className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Choice Questions</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {questions.filter(q => q.type === 'options').length}
          </div>
          <div className="text-xs text-muted-foreground">Multiple choice options</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <GitBranch className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium">Conditional</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {questions.filter(q => q.type === 'conditional').length}
          </div>
          <div className="text-xs text-muted-foreground">Branching logic</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDownRight className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium">Max Depth</span>
          </div>
          <div className="text-2xl font-bold text-orange-600">
            {Math.max(0, ...questions.map(q => getQuestionDepth(q.id)))}
          </div>
          <div className="text-xs text-muted-foreground">Nested follow-up levels</div>
        </Card>
      </div>
    </div>
  );
}