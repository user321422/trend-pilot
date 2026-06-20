import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useTrends } from '../hooks/useTrends';
import { briefs as briefsApi } from '../services/api';

type Message = {
  id: string;
  role: 'user' | 'ai';
  content: string | React.ReactNode;
};

export default function Dashboard() {
  const { data: trendData, refresh } = useTrends();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content: 'Hello. I am TrendPilot. What would you like to do today? You can ask me to "sync trends" or "generate briefs".'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  async function handleSend() {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setInput('');
    
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userMessage }]);
    setIsTyping(true);

    const lowercaseInput = userMessage.toLowerCase();

    try {
      if (lowercaseInput.includes('sync') || lowercaseInput.includes('trend')) {
        await refresh();
        // Give it a tiny delay to feel conversational
        await new Promise(r => setTimeout(r, 600));
        
        setMessages(prev => [...prev, { 
          id: Date.now().toString(), 
          role: 'ai', 
          content: (
            <div>
              <p>I found the latest trending topics. Here are the top opportunities:</p>
              <div className="trend-list">
                {trendData.slice(0, 3).map(t => (
                  <div key={t.id} className="trend-item">
                    <span className="title">{t.title}</span>
                    <span className="meta">Score: {t.opportunityScore.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        }]);
      } 
      else if (lowercaseInput.includes('generate') || lowercaseInput.includes('brief')) {
        if (!trendData.length) {
          throw new Error('Please sync trends first before generating briefs.');
        }
        
        const top3 = trendData.slice(0, 3);
        await Promise.all(top3.map(t => briefsApi.generate(t.id)));
        
        setMessages(prev => [...prev, { 
          id: Date.now().toString(), 
          role: 'ai', 
          content: `I've successfully generated and queued briefs for the top ${top3.length} trends. You can review them in the Briefs tab.`
        }]);
      } 
      else {
        await new Promise(r => setTimeout(r, 600));
        setMessages(prev => [...prev, { 
          id: Date.now().toString(), 
          role: 'ai', 
          content: "I'm focused on content operations right now. Try asking me to 'sync trends' or 'generate briefs'."
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'ai', 
        content: `Sorry, I ran into an error: ${err instanceof Error ? err.message : 'Unknown error'}`
      }]);
    } finally {
      setIsTyping(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      <div className="chat-container">
        <div className="chat-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`message ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === 'ai' ? 'TP' : 'U'}
              </div>
              <div className="message-content">
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="message ai">
              <div className="message-avatar">TP</div>
              <div className="message-content" style={{ color: 'var(--text-tertiary)' }}>
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="chat-input-wrapper">
        <div className="chat-input-box">
          <input 
            type="text" 
            placeholder="Message TrendPilot..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isTyping}
            autoFocus
          />
          <button 
            className="send-btn" 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            aria-label="Send message"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
