import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { MoreHorizontal, Edit3, Trash2, Globe, MessageCircle, Users } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { getChatbots, deleteChatbot } from '../utils/api';
import { toast } from 'sonner@2.0.3';

interface Chatbot {
  id: string;
  name: string;
  description: string;
  questions: any[];
  settings: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

interface ChatbotListProps {
  onEditChatbot: (chatbotId: string) => void;
}

export function ChatbotList({ onEditChatbot }: ChatbotListProps) {
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chatbotToDelete, setChatbotToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadChatbots();
  }, []);

  const loadChatbots = async () => {
    try {
      setIsLoading(true);
      const response = await getChatbots();
      setChatbots(response.data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load chatbots');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (chatbotId: string) => {
    setChatbotToDelete(chatbotId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!chatbotToDelete) return;

    try {
      await deleteChatbot(chatbotToDelete);
      toast.success('Chatbot deleted successfully');
      setChatbots(chatbots.filter(cb => cb.id !== chatbotToDelete));
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete chatbot');
    } finally {
      setDeleteDialogOpen(false);
      setChatbotToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading chatbots...</p>
      </div>
    );
  }

  if (chatbots.length === 0) {
    return (
      <div className="text-center py-16">
        <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="mb-2">No chatbots yet</h3>
        <p className="text-muted-foreground mb-6">Create your first chatbot to get started with WhatsApp integration</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6">
        {chatbots.map((chatbot) => (
          <Card key={chatbot.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-medium">{chatbot.name}</h3>
                  <Badge className={chatbot.isActive ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'}>
                    {chatbot.isActive ? 'active' : 'inactive'}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">{chatbot.description || 'No description'}</p>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEditChatbot(chatbot.id)}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={() => handleDeleteClick(chatbot.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="font-medium">{chatbot.questions?.length || 0}</div>
                  <div className="text-xs text-muted-foreground">Questions</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="font-medium">-</div>
                  <div className="text-xs text-muted-foreground">Conversations</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="font-medium">{chatbot.settings?.enableWebsite ? '1' : '0'}</div>
                  <div className="text-xs text-muted-foreground">Websites</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <div className="text-xs text-muted-foreground">
                Modified {new Date(chatbot.updatedAt).toLocaleDateString()}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onEditChatbot(chatbot.id)}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Bot
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chatbot</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this chatbot? This action cannot be undone and will also delete all associated conversations and analytics.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}