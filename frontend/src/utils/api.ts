import { projectId, publicAnonKey } from './supabase/info';
import { createClient } from '@supabase/supabase-js';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-97ac60b8`;

// Create Supabase client for auth
const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

// Auth functions
export async function signUp(email: string, password: string, name: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ email, password, name })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to sign up');
    }

    return await response.json();
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    // If this is the demo account, ensure demo data is initialized
    if (email === 'demo@chatflow.com') {
      try {
        // Trigger demo initialization (idempotent - won't recreate if exists)
        await fetch(`${API_BASE_URL}/init-demo`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        });
      } catch (initError) {
        console.log('Demo init check (non-critical):', initError);
        // Non-critical - continue even if this fails
      }
    }

    return {
      session: data.session,
      user: data.user
    };
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

export async function getSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  } catch (error) {
    console.error('Get session error:', error);
    return null;
  }
}

// Helper to get access token
async function getAccessToken() {
  const session = await getSession();
  return session?.access_token;
}

// Chatbot API functions
export async function getChatbots() {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE_URL}/chatbots`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch chatbots');
    }

    return await response.json();
  } catch (error) {
    console.error('Get chatbots error:', error);
    throw error;
  }
}

export async function getChatbot(id: string) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE_URL}/chatbots/${id}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch chatbot');
    }

    return await response.json();
  } catch (error) {
    console.error('Get chatbot error:', error);
    throw error;
  }
}

export async function createChatbot(data: {
  name: string;
  description: string;
  questions: any[];
  settings: any;
}) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE_URL}/chatbots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create chatbot');
    }

    return await response.json();
  } catch (error) {
    console.error('Create chatbot error:', error);
    throw error;
  }
}

export async function updateChatbot(id: string, data: {
  name: string;
  description: string;
  questions: any[];
  settings: any;
}) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE_URL}/chatbots/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update chatbot');
    }

    return await response.json();
  } catch (error) {
    console.error('Update chatbot error:', error);
    throw error;
  }
}

export async function deleteChatbot(id: string) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE_URL}/chatbots/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete chatbot');
    }

    return await response.json();
  } catch (error) {
    console.error('Delete chatbot error:', error);
    throw error;
  }
}

// Analytics API functions
export async function getAnalytics(chatbotId: string) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE_URL}/analytics/${chatbotId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch analytics');
    }

    return await response.json();
  } catch (error) {
    console.error('Get analytics error:', error);
    throw error;
  }
}

// Conversations API functions
export async function getConversations(chatbotId?: string) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error('Not authenticated');

    const url = chatbotId 
      ? `${API_BASE_URL}/conversations?chatbotId=${chatbotId}`
      : `${API_BASE_URL}/conversations`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch conversations');
    }

    return await response.json();
  } catch (error) {
    console.error('Get conversations error:', error);
    throw error;
  }
}

// Settings API functions
export async function getSettings() {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE_URL}/settings`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch settings');
    }

    return await response.json();
  } catch (error) {
    console.error('Get settings error:', error);
    throw error;
  }
}

export async function updateSettings(settings: any) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE_URL}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(settings)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update settings');
    }

    return await response.json();
  } catch (error) {
    console.error('Update settings error:', error);
    throw error;
  }
}