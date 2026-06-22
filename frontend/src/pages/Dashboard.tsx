import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import { useTrends } from '../hooks/useTrends';
import { briefs as briefsApi, chat as chatApi } from '../services/api';

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
      content: 'Hello. I am Trendy. What would you like to do today? You can ask me to "sync trends" or "generate briefs".'
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

  async function handleSend(overrideInput?: string | React.MouseEvent) {
    const textToSend = typeof overrideInput === 'string' ? overrideInput : input;
    if (!textToSend.trim()) return;
    
    const userMessage = textToSend.trim();
    if (typeof overrideInput !== 'string') {
      setInput('');
    }
    
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
        const apiMessages = messages
          .filter(m => typeof m.content === 'string')
          .map(m => ({ 
            role: m.role === 'ai' ? 'assistant' : 'user', 
            content: m.content as string
          }));
        apiMessages.push({ role: 'user', content: userMessage });

        apiMessages.unshift({ 
          role: 'system', 
          content: 'You are Trendy, the exclusive AI assistant for the Trendy Content Operations Platform. Your ONLY purpose is to assist with content strategy, trending topics, brief generation, and publishing workflows. You MUST NOT answer questions about coding, mathematics, general trivia, or any topic outside of content operations. If a user asks an out-of-scope question, politely decline.\n\nCRITICAL FORMATTING RULES:\n1. STRICTLY NO EMOJIS. You are forbidden from using any emojis (e.g., no 👋, no ✅, no 🚀). Your tone must be strictly professional, editorial, and serious.\n2. Always format your responses using clean Markdown. Use double newlines (\\n\\n) to separate paragraphs and lists so they render properly.\n3. Keep your tone concise and direct.' 
        });

        apiMessages.splice(1, 0, 
          { role: 'user', content: 'Can you write a python script for me?' },
          { role: 'assistant', content: 'I specialize strictly in content operations and strategy. I do not write code or software scripts. However, if you are looking to write an article about Python, I would be happy to help you discover the latest Python-related trends and generate a content brief for you!' }
        );
        
        const { reply } = await chatApi.send(apiMessages);
        
        setMessages(prev => [...prev, { 
          id: Date.now().toString(), 
          role: 'ai', 
          content: reply
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
                {msg.role === 'ai' ? 'T' : 'U'}
              </div>
              <div className="message-content markdown-body">
                {typeof msg.content === 'string' ? <ReactMarkdown>{msg.content}</ReactMarkdown> : msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="message ai">
              <div className="message-avatar">T</div>
              <div className="message-content" style={{ color: 'var(--muted)' }}>
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="chat-input-wrapper">
        <div className="quick-actions" style={{ display: 'flex', gap: '8px', marginBottom: '12px', justifyContent: 'center' }}>
          <button className="quick-action-chip" onClick={() => handleSend('Sync latest trends')} disabled={isTyping} style={{ padding: '6px 12px', borderRadius: '16px', border: '1px solid var(--hairline)', background: 'var(--surface-card)', fontSize: '12px', cursor: 'pointer', color: 'var(--body)' }}>Sync Trends</button>
          <button className="quick-action-chip" onClick={() => handleSend('Generate briefs for top trends')} disabled={isTyping} style={{ padding: '6px 12px', borderRadius: '16px', border: '1px solid var(--hairline)', background: 'var(--surface-card)', fontSize: '12px', cursor: 'pointer', color: 'var(--body)' }}>Generate Briefs</button>
        </div>
        <div className="chat-input-box">
          <input 
            type="text" 
            placeholder="Message Trendy..." 
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
