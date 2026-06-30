import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import { useTrends } from '../hooks/useTrends';
import { briefs as briefsApi, chat as chatApi, orchestrator } from '../services/api';
import type { OrchestratorStatus } from '../services/api';

type Message = {
  id: string;
  role: 'user' | 'ai';
  content: string | React.ReactNode;
};

function ThinkingProgress() {
  const [step, setStep] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const steps = [
    "Analyzing user request...",
    "Querying knowledge base...",
    "Reviewing content operations parameters...",
    "Structuring response...",
    "Generating insights..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(prev => Math.min(prev + 1, steps.length - 1));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="reasoning-container" style={{ width: '100%', marginTop: 0, padding: 0, background: 'transparent', border: 'none' }}>
      <div 
        className="reasoning-header" 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'var(--surface-card)', border: '1px solid var(--hairline)', borderRadius: '20px', width: 'fit-content' }}
      >
        <div className="reasoning-spinner" style={{ width: '14px', height: '14px', borderWidth: '1.5px' }}></div>
        <span style={{ fontSize: '13px', color: 'var(--body)' }}>{isExpanded ? "Trendy is reasoning..." : steps[step]}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '14px', height: '14px', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--muted)', marginLeft: '4px' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
      </div>
      
      {isExpanded && (
        <div className="collapsible-section" style={{ border: 'none', marginTop: '12px' }}>
          <div className="collapsible-content" style={{ padding: '0', background: 'transparent', border: 'none', gap: '8px' }}>
            {steps.map((s, idx) => (
              idx <= step && (
                <div key={idx} className={`reasoning-step ${idx === step ? 'active' : 'completed'}`} style={{ fontSize: '13px' }}>
                  <div className="step-icon">
                    {idx < step ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    ) : (
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', animation: 'pulse 1.5s infinite' }}></div>
                    )}
                  </div>
                  <span>{s}</span>
                </div>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

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
  const [orchStatus, setOrchStatus] = useState<OrchestratorStatus | null>(null);
  const [showLogs, setShowLogs] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await orchestrator.status();
        setOrchStatus(res);
        if (res.isRunning) {
          setShowLogs(true);
        }
      } catch (err) {
        console.error("Failed to fetch orchestrator status:", err);
      }
    }
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  async function handleTriggerOrchestrator() {
    try {
      setShowLogs(true);
      await orchestrator.run();
      const res = await orchestrator.status();
      setOrchStatus(res);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to trigger orchestrator');
    }
  }

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
          {/* Orchestrator Status Banner */}
          <div style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--hairline)',
            borderRadius: '12px',
            padding: '20px 24px',
            boxShadow: '0 2px 8px rgba(20, 20, 19, 0.04)',
            marginBottom: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div className="orch-banner-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: orchStatus?.isRunning 
                    ? 'var(--primary)' 
                    : orchStatus?.lastError 
                      ? '#d9383a' 
                      : '#4a7c59',
                  boxShadow: orchStatus?.isRunning 
                    ? '0 0 8px var(--primary)' 
                    : orchStatus?.lastError 
                      ? '0 0 8px #d9383a' 
                      : 'none',
                }} />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Autonomous Agent Engine
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 500,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: orchStatus?.isRunning 
                        ? 'rgba(204,120,92,0.1)' 
                        : orchStatus?.lastError 
                          ? 'rgba(217,56,58,0.1)' 
                          : 'rgba(74,124,89,0.1)',
                      color: orchStatus?.isRunning 
                        ? 'var(--primary)' 
                        : orchStatus?.lastError 
                          ? '#d9383a' 
                          : '#4a7c59'
                    }}>
                      {orchStatus?.isRunning 
                        ? 'ACTIVE RUN' 
                        : orchStatus?.lastError 
                          ? 'FAILED' 
                          : 'STANDBY'}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
                    {orchStatus?.isRunning 
                      ? `Processing: ${orchStatus.currentStep || 'Starting lifecycle...'}` 
                      : orchStatus?.lastError
                        ? `Error: ${orchStatus.lastError}`
                        : orchStatus?.lastCompleted 
                          ? `Last complete cycle: ${new Date(orchStatus.lastCompleted).toLocaleTimeString()}`
                          : 'Standby. Orchestrator ready.'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {orchStatus?.logs && orchStatus.logs.length > 0 && (
                  <button
                    onClick={() => setShowLogs(!showLogs)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      background: 'transparent',
                      border: '1px solid var(--hairline)',
                      color: 'var(--body)',
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: showLogs ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', width: '12px', height: '12px' }}>
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                    {showLogs ? 'Hide Logs' : 'View Logs'}
                  </button>
                )}
                <button
                  onClick={handleTriggerOrchestrator}
                  disabled={orchStatus?.isRunning}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '6px',
                    background: orchStatus?.isRunning ? 'var(--hairline)' : 'var(--primary)',
                    color: orchStatus?.isRunning ? 'var(--muted)' : 'var(--on-primary)',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: orchStatus?.isRunning ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                    boxShadow: orchStatus?.isRunning ? 'none' : '0 2px 6px rgba(204,120,92,0.15)'
                  }}
                >
                  {orchStatus?.isRunning ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                      Trigger Pipeline
                    </>
                  )}
                </button>
              </div>
            </div>

            {showLogs && orchStatus?.logs && (
              <div style={{
                background: 'var(--bg)',
                border: '1px solid var(--hairline)',
                borderRadius: '8px',
                padding: '12px 16px',
                maxHeight: '200px',
                overflowY: 'auto',
                fontFamily: 'monospace',
                fontSize: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
              }}>
                {orchStatus.logs.map((log, idx) => (
                  <div key={idx} style={{ 
                    display: 'flex', 
                    gap: '12px', 
                    color: log.isError ? '#d9383a' : 'var(--body)',
                    alignItems: 'flex-start'
                  }}>
                    <span style={{ color: 'var(--muted)', flexShrink: 0 }}>
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span style={{ wordBreak: 'break-all' }}>{log.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

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
              <div className="message-content" style={{ width: '100%', maxWidth: '100%', paddingTop: 0 }}>
                <ThinkingProgress />
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
