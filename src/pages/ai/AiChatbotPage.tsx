import { useState, useRef, useEffect } from 'react';
import {
  MessageSquare, Send, Bot, User, Brain,
  TrendingUp, DollarSign, Users, AlertTriangle, Search,
} from 'lucide-react';
import {
  PortalCard, PortalPageHeader,
} from '../../components/portal-ui';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

const QUICK_SUGGESTIONS = [
  "What's the enrollment trend?",
  'Show me revenue insights',
  'Predict next semester',
  'Find at-risk students',
];

const CAPABILITIES = [
  { icon: TrendingUp, label: 'Enrollment Analytics', desc: 'Trends, forecasts, and demographic breakdowns' },
  { icon: DollarSign, label: 'Revenue Insights', desc: 'Fee collection, outstanding balances, projections' },
  { icon: Users, label: 'Student Performance', desc: 'At-risk identification, grade analysis, predictions' },
  { icon: AlertTriangle, label: 'Anomaly Detection', desc: 'Unusual patterns in attendance, grades, or finances' },
  { icon: Search, label: 'Smart Search', desc: 'Find students, courses, documents, and reports' },
  { icon: Brain, label: 'Predictions', desc: 'Semester outcomes, attendance, and performance forecasts' },
];

async function getAIResponse(input: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    return "Error: Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file.";
  }

  // Mock responses for testing (comment out when production ready)
  const mockResponses: Record<string, string> = {
    "enrollment": "The current enrollment is 12,000+ students across 6 departments. Enrollment trends show a 5% increase year-over-year.",
    "revenue": "Total revenue collected: $5.2M. Outstanding fees: $320K. Projected revenue for next quarter: $6.1M.",
    "semester": "Based on current trends, next semester will see approximately 2,600 enrollments with 95% retention rate.",
    "at-risk": "Currently 45 students are identified as at-risk based on attendance and grade patterns. Recommended interventions: tutoring programs.",
  };

  // Check for mock keywords
  const lowerInput = input.toLowerCase();
  for (const [key, response] of Object.entries(mockResponses)) {
    if (lowerInput.includes(key)) {
      return response;
    }
  }

  // Google Gemini 1.5 Flash API Call
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `You are an AI assistant for a college management system. Answer questions about student enrollment, revenue, performance, and institutional insights. Keep responses concise, practical, and well-formatted with key details bolded where appropriate.\n\nUser question: ${input}`
                }
              ]
            }
          ]
        }),
      }
    );

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(`Gemini API Error: ${errData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates.length > 0 && data.candidates[0].content?.parts?.length > 0) {
      const reply = data.candidates[0].content.parts[0].text;
      return reply || "I'm processing your request. Please try again.";
    }

    return "Unable to generate response. Please try again.";
  } catch (error) {
    console.error('AI API Error:', error);
    return `Error: ${error instanceof Error ? error.message : 'Failed to connect to AI service'}. Please try again later.`;
  }
}

function formatContent(text: string) {
  return text.split('\n').map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <span key={i}>
        {parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} className="font-bold text-ink-900">{part.slice(2, -2)}</strong>;
          }
          return <span key={j}>{part}</span>;
        })}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    );
  });
}

export default function AiChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'connecting' | 'error'>('online');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  const handleSend = async (text?: string) => {
    const content = (text || input).trim();
    if (!content || thinking) return;

    const now = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content,
      timestamp: now,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setThinking(true);
    setConnectionStatus('connecting');

    try {
      const aiResponse = await getAIResponse(content);
      const aiMsg: Message = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setConnectionStatus('online');
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMsg: Message = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please check your connection and try again.',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
      setConnectionStatus('error');
    } finally {
      setThinking(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="AI Chatbot"
        subtitle="Intelligent assistant powered by Gemini 1.5 Flash"
        icon={MessageSquare}
        action={
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${
            connectionStatus === 'online' ? 'bg-cyan-50 border-cyan-200' :
            connectionStatus === 'connecting' ? 'bg-yellow-50 border-yellow-200' :
            'bg-red-50 border-red-200'
          }`}>
            <span className={`w-2 h-2 rounded-full animate-pulse ${
              connectionStatus === 'online' ? 'bg-cyan-500' :
              connectionStatus === 'connecting' ? 'bg-yellow-500' :
              'bg-red-500'
            }`} />
            <span className={`text-xs font-medium ${
              connectionStatus === 'online' ? 'text-cyan-700' :
              connectionStatus === 'connecting' ? 'text-yellow-700' :
              'text-red-700'
            }`}>
              {connectionStatus === 'online' ? 'AI Online' :
               connectionStatus === 'connecting' ? 'Connecting...' :
               'Connection Error'}
            </span>
          </div>
        }
      />

      <PortalCard className="flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-[500px] max-h-[600px]">
          {messages.length === 0 && !thinking && (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center mb-4">
                <Bot className="text-white" size={32} />
              </div>
              <h3 className="text-lg font-bold text-ink-900 mb-2">Meridian AI Assistant</h3>
              <p className="text-sm text-ink-500 max-w-md mb-6">
                Ask anything about your institution's enrollment, performance, or analytics
              </p>
              <div className="grid sm:grid-cols-2 gap-2 max-w-lg w-full">
                {QUICK_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="text-left px-4 py-3 rounded-lg bg-ink-50 hover:bg-cyan-50 border border-ink-100 text-sm text-ink-700 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-ink-900'
                    : 'bg-gradient-to-br from-cyan-500 to-teal-600'
                }`}
              >
                {msg.role === 'user' ? (
                  <User className="text-white" size={18} />
                ) : (
                  <Bot className="text-white" size={18} />
                )}
              </div>
              <div className={`max-w-[75%] ${msg.role === 'user' ? 'flex flex-col items-end' : ''}`}>
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-ink-900 text-white rounded-tr-sm'
                      : 'bg-gradient-to-br from-cyan-50 to-teal-50 text-ink-900 rounded-tl-sm border border-cyan-100'
                  }`}
                >
                  {formatContent(msg.content)}
                </div>
                <div className={`text-[10px] text-ink-400 mt-1 px-2 ${msg.role === 'user' ? 'text-right' : ''}`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {thinking && (
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                <Bot className="text-white" size={18} />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-gradient-to-br from-cyan-50 to-teal-50 rounded-tl-sm border border-cyan-100">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-ink-100 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !thinking) handleSend(); }}
              placeholder={thinking ? "AI is thinking..." : "Ask me anything..."}
              disabled={thinking}
              className="flex-1 px-4 py-3 rounded-lg border border-ink-200 bg-white text-ink-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
            />
            <button
              onClick={() => handleSend()}
              disabled={thinking || !input.trim()}
              className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 text-white hover:from-cyan-600 hover:to-teal-700 transition-all disabled:opacity-50 flex-shrink-0"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </PortalCard>
    </div>
  );
}
