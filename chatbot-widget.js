/**
 * Chatbot Widget
 * Standalone JavaScript widget for embedding chatbot on any website
 */

(function() {
  'use strict';

  const ChatbotWidget = {
    config: {
      chatbotId: null,
      apiUrl: null,
      primaryColor: '#3b82f6',
      position: 'bottom-right'
    },
    
    state: {
      isOpen: false,
      isInitialized: false,
      questions: [],
      chatbotName: '',
      messages: [],
      currentQuestionId: null,
      isTyping: false
    },

    /**
     * Initialize the widget
     */
    init: function(options) {
      if (this.state.isInitialized) {
        console.warn('Chatbot widget already initialized');
        return;
      }

      // Merge options with defaults
      this.config = { ...this.config, ...options };

      // Validate required options
      if (!this.config.chatbotId) {
        console.error('Chatbot Widget: chatbotId is required');
        return;
      }
      if (!this.config.apiUrl) {
        console.error('Chatbot Widget: apiUrl is required');
        return;
      }

      // Inject styles
      this.injectStyles();

      // Create widget UI
      this.createWidget();

      // Load chatbot data
      this.loadChatbot();

      this.state.isInitialized = true;
    },

    /**
     * Inject CSS styles
     */
    injectStyles: function() {
      const styles = `
        .chatbot-widget-container * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .chatbot-widget-button {
          position: fixed;
          ${this.config.position === 'bottom-right' ? 'bottom: 20px; right: 20px;' : ''}
          ${this.config.position === 'bottom-left' ? 'bottom: 20px; left: 20px;' : ''}
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: ${this.config.primaryColor};
          color: white;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          z-index: 999999;
        }

        .chatbot-widget-button:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }

        .chatbot-widget-button svg {
          width: 28px;
          height: 28px;
        }

        .chatbot-widget-window {
          position: fixed;
          ${this.config.position === 'bottom-right' ? 'bottom: 90px; right: 20px;' : ''}
          ${this.config.position === 'bottom-left' ? 'bottom: 90px; left: 20px;' : ''}
          width: 380px;
          height: 600px;
          max-width: calc(100vw - 40px);
          max-height: calc(100vh - 120px);
          background: white;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
          display: none;
          flex-direction: column;
          z-index: 999999;
          overflow: hidden;
          animation: slideUp 0.3s ease;
        }

        .chatbot-widget-window.open {
          display: flex;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .chatbot-widget-header {
          background: ${this.config.primaryColor};
          color: white;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .chatbot-widget-header-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .chatbot-widget-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chatbot-widget-avatar svg {
          width: 18px;
          height: 18px;
        }

        .chatbot-widget-title {
          font-weight: 600;
          font-size: 15px;
        }

        .chatbot-widget-status {
          font-size: 12px;
          opacity: 0.9;
        }

        .chatbot-widget-header-actions {
          display: flex;
          gap: 8px;
        }

        .chatbot-widget-header-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          transition: background 0.2s;
        }

        .chatbot-widget-header-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .chatbot-widget-close {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .chatbot-widget-close:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .chatbot-widget-close svg {
          width: 20px;
          height: 20px;
        }

        .chatbot-widget-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          background: #f9fafb;
        }

        .chatbot-widget-message {
          display: flex;
          margin-bottom: 16px;
          animation: messageSlide 0.3s ease;
        }

        @keyframes messageSlide {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .chatbot-widget-message.user {
          justify-content: flex-end;
        }

        .chatbot-widget-message-content {
          display: flex;
          gap: 8px;
          max-width: 85%;
        }

        .chatbot-widget-message.user .chatbot-widget-message-content {
          flex-direction: row-reverse;
        }

        .chatbot-widget-message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .chatbot-widget-message.bot .chatbot-widget-message-avatar {
          background: white;
          border: 2px solid #e5e7eb;
        }

        .chatbot-widget-message.user .chatbot-widget-message-avatar {
          background: ${this.config.primaryColor};
          color: white;
        }

        .chatbot-widget-message-avatar svg {
          width: 16px;
          height: 16px;
        }

        .chatbot-widget-message.bot .chatbot-widget-message-avatar svg {
          color: ${this.config.primaryColor};
        }

        .chatbot-widget-message-bubble {
          padding: 10px 14px;
          border-radius: 16px;
          font-size: 14px;
          line-height: 1.4;
        }

        .chatbot-widget-message.bot .chatbot-widget-message-bubble {
          background: white;
          border: 1px solid #e5e7eb;
          color: #1f2937;
        }

        .chatbot-widget-message.user .chatbot-widget-message-bubble {
          background: ${this.config.primaryColor};
          color: white;
        }

        .chatbot-widget-message-time {
          font-size: 11px;
          color: #9ca3af;
          margin-top: 4px;
        }

        .chatbot-widget-options {
          margin-top: 8px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .chatbot-widget-option-btn {
          background: white;
          border: 1px solid #e5e7eb;
          padding: 10px 14px;
          border-radius: 12px;
          cursor: pointer;
          font-size: 13px;
          text-align: left;
          transition: all 0.2s;
          color: #1f2937;
        }

        .chatbot-widget-option-btn:hover {
          background: ${this.config.primaryColor};
          color: white;
          border-color: ${this.config.primaryColor};
        }

        .chatbot-widget-typing {
          display: flex;
          gap: 8px;
        }

        .chatbot-widget-typing-bubble {
          background: white;
          border: 1px solid #e5e7eb;
          padding: 12px 14px;
          border-radius: 16px;
          display: flex;
          gap: 4px;
        }

        .chatbot-widget-typing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #9ca3af;
          animation: typingBounce 1.4s infinite;
        }

        .chatbot-widget-typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .chatbot-widget-typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typingBounce {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-8px);
          }
        }

        .chatbot-widget-input-area {
          padding: 16px;
          background: white;
          border-top: 1px solid #e5e7eb;
        }

        .chatbot-widget-input-form {
          display: flex;
          gap: 8px;
        }

        .chatbot-widget-input {
          flex: 1;
          padding: 10px 14px;
          border: 1px solid #d1d5db;
          border-radius: 24px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }

        .chatbot-widget-input:focus {
          border-color: ${this.config.primaryColor};
        }

        .chatbot-widget-send-btn {
          background: ${this.config.primaryColor};
          color: white;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.2s;
        }

        .chatbot-widget-send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .chatbot-widget-send-btn svg {
          width: 18px;
          height: 18px;
        }

        .chatbot-widget-footer {
          padding: 8px 16px;
          text-align: center;
          font-size: 11px;
          color: #9ca3af;
          background: white;
        }

        .chatbot-widget-error {
          padding: 16px;
          text-align: center;
          color: #ef4444;
        }

        .chatbot-widget-empty {
          padding: 32px 16px;
          text-align: center;
          color: #9ca3af;
        }

        .chatbot-widget-empty svg {
          width: 48px;
          height: 48px;
          margin: 0 auto 12px;
          opacity: 0.5;
        }

        @media (max-width: 480px) {
          .chatbot-widget-window {
            width: calc(100vw - 40px);
            height: calc(100vh - 120px);
          }
        }
      `;

      const styleSheet = document.createElement('style');
      styleSheet.textContent = styles;
      document.head.appendChild(styleSheet);
    },

    /**
     * Create widget HTML structure
     */
    createWidget: function() {
      const container = document.createElement('div');
      container.className = 'chatbot-widget-container';
      container.innerHTML = `
        <button class="chatbot-widget-button" id="chatbot-widget-toggle">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>

        <div class="chatbot-widget-window" id="chatbot-widget-window">
          <div class="chatbot-widget-header">
            <div class="chatbot-widget-header-info">
              <div class="chatbot-widget-avatar">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <div>
                <div class="chatbot-widget-title" id="chatbot-widget-name">Chatbot</div>
                <div class="chatbot-widget-status">Online</div>
              </div>
            </div>
            <div class="chatbot-widget-header-actions">
              <button class="chatbot-widget-header-btn" id="chatbot-widget-reset">Reset</button>
              <button class="chatbot-widget-close" id="chatbot-widget-close">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          <div class="chatbot-widget-messages" id="chatbot-widget-messages"></div>

          <div class="chatbot-widget-input-area">
            <form class="chatbot-widget-input-form" id="chatbot-widget-form">
              <input 
                type="text" 
                class="chatbot-widget-input" 
                id="chatbot-widget-input"
                placeholder="Type your message..."
              />
              <button type="submit" class="chatbot-widget-send-btn" id="chatbot-widget-send">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </form>
            <div class="chatbot-widget-footer">
              Powered by your chatbot platform
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(container);

      // Attach event listeners
      this.attachEventListeners();
    },

    /**
     * Attach event listeners
     */
    attachEventListeners: function() {
      const toggleBtn = document.getElementById('chatbot-widget-toggle');
      const closeBtn = document.getElementById('chatbot-widget-close');
      const resetBtn = document.getElementById('chatbot-widget-reset');
      const form = document.getElementById('chatbot-widget-form');

      toggleBtn.addEventListener('click', () => this.toggleWidget());
      closeBtn.addEventListener('click', () => this.toggleWidget());
      resetBtn.addEventListener('click', () => this.resetChat());
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    },

    /**
     * Toggle widget open/close
     */
    toggleWidget: function() {
      this.state.isOpen = !this.state.isOpen;
      const window = document.getElementById('chatbot-widget-window');
      
      if (this.state.isOpen) {
        window.classList.add('open');
      } else {
        window.classList.remove('open');
      }
    },

    /**
     * Load chatbot data from API
     */
    loadChatbot: async function() {
      try {
        const domain = window.location.hostname;
        const response = await fetch(
          `${this.config.apiUrl}/widget/chatbot/${this.config.chatbotId}`,
          {
            headers: {
              'X-Widget-Domain': domain,
              'Accept': 'application/json'
            }
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          this.showError(data.message || 'Failed to load chatbot');
          return;
        }

        this.state.questions = data.data.questions || [];
        this.state.chatbotName = data.data.name || 'Chatbot';

        // Update chatbot name in UI
        document.getElementById('chatbot-widget-name').textContent = this.state.chatbotName;

        // Update primary color if provided
        if (data.data.primaryColor) {
          this.config.primaryColor = data.data.primaryColor;
          this.updatePrimaryColor();
        }

        // Initialize chat
        this.initializeChat();

      } catch (error) {
        console.error('Chatbot Widget Error:', error);
        this.showError('Failed to connect to chatbot service');
      }
    },

    /**
     * Update primary color dynamically
     */
    updatePrimaryColor: function() {
      const elements = [
        '.chatbot-widget-button',
        '.chatbot-widget-header',
        '.chatbot-widget-send-btn',
        '.chatbot-widget-message.user .chatbot-widget-message-bubble',
        '.chatbot-widget-message.user .chatbot-widget-message-avatar'
      ];

      elements.forEach(selector => {
        const els = document.querySelectorAll(selector);
        els.forEach(el => {
          el.style.background = this.config.primaryColor;
        });
      });
    },

    /**
     * Show error message
     */
    showError: function(message) {
      const messagesContainer = document.getElementById('chatbot-widget-messages');
      messagesContainer.innerHTML = `
        <div class="chatbot-widget-error">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 12px; display: block;">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p>${message}</p>
        </div>
      `;
    },

    /**
     * Initialize chat with welcome message
     */
    initializeChat: function() {
      if (this.state.questions.length === 0) {
        return;
      }

      const welcomeQuestion = this.state.questions.find(q => q.isWelcome);
      const firstQuestion = welcomeQuestion || this.state.questions[0];

      setTimeout(() => {
        this.addBotMessage(firstQuestion);
        this.state.currentQuestionId = firstQuestion.id;
      }, 500);
    },

    /**
     * Add bot message
     */
    addBotMessage: function(question) {
      this.state.isTyping = true;
      this.renderMessages();

      setTimeout(() => {
        const message = {
          id: Date.now().toString(),
          type: 'bot',
          content: question.question,
          timestamp: new Date(),
          isOptions: question.type === 'options',
          options: question.options
        };

        this.state.messages.push(message);
        this.state.isTyping = false;
        this.renderMessages();
      }, 800);
    },

    /**
     * Add user message
     */
    addUserMessage: function(content) {
      const message = {
        id: Date.now().toString(),
        type: 'user',
        content: content,
        timestamp: new Date()
      };

      this.state.messages.push(message);
      this.renderMessages();
    },

    /**
     * Handle option click
     */
    handleOptionClick: function(option) {
      this.addUserMessage(option);

      const currentQuestion = this.state.questions.find(q => q.id === this.state.currentQuestionId);
      if (currentQuestion) {
        const followUpQuestion = this.state.questions.find(q =>
          q.parentQuestionId === this.state.currentQuestionId && q.triggerOption === option
        );

        if (followUpQuestion) {
          setTimeout(() => {
            this.addBotMessage(followUpQuestion);
            this.state.currentQuestionId = followUpQuestion.id;
          }, 1000);
        } else {
          setTimeout(() => {
            this.addGenericResponse(option);
          }, 1000);
        }
      }
    },

    /**
     * Handle form submit
     */
    handleSubmit: function(e) {
      e.preventDefault();
      
      const input = document.getElementById('chatbot-widget-input');
      const message = input.value.trim();

      if (!message || this.state.isTyping) return;

      this.addUserMessage(message);

      const currentQuestion = this.state.questions.find(q => q.id === this.state.currentQuestionId);
      if (currentQuestion && currentQuestion.answer) {
        setTimeout(() => {
          const responseMessage = {
            id: Date.now().toString(),
            type: 'bot',
            content: currentQuestion.answer || 'Thank you for your message. Our team will get back to you soon.',
            timestamp: new Date()
          };
          this.state.messages.push(responseMessage);
          this.renderMessages();
        }, 1000);
      }

      input.value = '';
    },

    /**
     * Add generic response
     */
    addGenericResponse: function(option) {
      const message = {
        id: Date.now().toString(),
        type: 'bot',
        content: `Thank you for selecting "${option}". Our team will help you with this request.`,
        timestamp: new Date()
      };
      this.state.messages.push(message);
      this.renderMessages();
    },

    /**
     * Reset chat
     */
    resetChat: function() {
      this.state.messages = [];
      this.state.currentQuestionId = null;
      this.state.isTyping = false;
      this.renderMessages();
      this.initializeChat();
    },

    /**
     * Render messages
     */
    renderMessages: function() {
      const container = document.getElementById('chatbot-widget-messages');
      
      let html = '';

      if (this.state.messages.length === 0 && !this.state.isTyping) {
        html = `
          <div class="chatbot-widget-empty">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <p>Conversation will start shortly...</p>
          </div>
        `;
      } else {
        this.state.messages.forEach(message => {
          html += this.renderMessage(message);
        });

        if (this.state.isTyping) {
          html += this.renderTypingIndicator();
        }
      }

      container.innerHTML = html;
      container.scrollTop = container.scrollHeight;

      // Attach option click handlers
      const optionBtns = container.querySelectorAll('.chatbot-widget-option-btn');
      optionBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const option = e.target.textContent;
          this.handleOptionClick(option);
        });
      });
    },

    /**
     * Render single message
     */
    renderMessage: function(message) {
      const timeString = this.formatTime(message.timestamp);
      const avatarIcon = message.type === 'user' 
        ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>';

      let optionsHtml = '';
      if (message.isOptions && message.options) {
        optionsHtml = '<div class="chatbot-widget-options">';
        message.options.forEach(option => {
          optionsHtml += `<button class="chatbot-widget-option-btn">${option}</button>`;
        });
        optionsHtml += '</div>';
      }

      return `
        <div class="chatbot-widget-message ${message.type}">
          <div class="chatbot-widget-message-content">
            <div class="chatbot-widget-message-avatar">
              ${avatarIcon}
            </div>
            <div>
              <div class="chatbot-widget-message-bubble">
                ${message.content}
              </div>
              ${optionsHtml}
              <div class="chatbot-widget-message-time">${timeString}</div>
            </div>
          </div>
        </div>
      `;
    },

    /**
     * Render typing indicator
     */
    renderTypingIndicator: function() {
      return `
        <div class="chatbot-widget-message bot">
          <div class="chatbot-widget-message-content">
            <div class="chatbot-widget-message-avatar">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <div class="chatbot-widget-typing">
              <div class="chatbot-widget-typing-bubble">
                <div class="chatbot-widget-typing-dot"></div>
                <div class="chatbot-widget-typing-dot"></div>
                <div class="chatbot-widget-typing-dot"></div>
              </div>
            </div>
          </div>
        </div>
      `;
    },

    /**
     * Format time
     */
    formatTime: function(date) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  // Expose to global scope
  window.ChatbotWidget = ChatbotWidget;

})();