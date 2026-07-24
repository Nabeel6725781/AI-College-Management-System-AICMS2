// src/pages/portal/ChatbotPage.tsx - Fixed Hugging Face Integration

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Bot, User } from 'lucide-react';
import { PortalCard, PortalPageHeader } from '../../components/portal-ui';

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

// ✅ FIXED: Use Hugging Face Inference API with correct endpoint
async function getAIResponse(input: string): Promise<string> {
  const apiKey = import.meta.env.VITE_HF_API_KEY?.trim();
  
  if (!apiKey) {
    console.error('❌ Hugging Face API key missing');
    return "خرابی: VITE_HF_API_KEY .env فائل میں موجود نہیں ہے۔";
  }

  // ✅ CORRECT: Use Hugging Face Inference API endpoint
  const endpoint = "https://api-inference.huggingface.co/models/Qwen/Qwen2.5-7B-Instruct";

  const systemPrompt = `You are an AI assistant for a college management system. Answer questions about student enrollment, revenue, performance, and institutional insights. Keep responses concise, practical, and well-formatted. Always reply politely in English and Urdu based on user language.`;

  try {
    console.log('🔑 Using Hugging Face API Key:', apiKey.substring(0, 20) + '...');
    console.log('📤 Sending request to Qwen model...');

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: input,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.6,
          top_p: 0.95,
          do_sample: true,
        },
      }),
    });

    console.log('📊 Response Status:', response.status);

    const data = await response.json();

    console.log('📊 API Response:', data);

    // ✅ Handle model loading response
    if (!response.ok) {
      console.error('❌ Hugging Face API Error:', data);
      
      // Model is loading
      if (data.error && data.error.includes('currently loading')) {
        return "🔄 ماڈل لوڈ ہو رہا ہے۔ براہ کرم 30 سیکنڈ میں دوبارہ کوشش کریں۔";
      }
      
      throw new Error(data.error?.[0] || data.error || `HTTP ${response.status}`);
    }

    // ✅ Extract generated text from response
    let botReply = "";

    if (Array.isArray(data) && data.length > 0) {
      // Array response
      if (data[0].generated_text) {
        botReply = data[0].generated_text;
      } else if (data[0].summary_text) {
        botReply = data[0].summary_text;
      }
    } else if (data.generated_text) {
      // Direct response
      botReply = data.generated_text;
    } else if (data[0] && data[0].generated_text) {
      botReply = data[0].generated_text;
    }

    if (!botReply) {
      console.warn('⚠️ No generated text in response');
      return "معافی چاہتا ہوں، جواب تیار نہیں کر سکا۔ براہ کرم دوبارہ کوشش کریں۔";
    }

    // ✅ Clean up response
    botReply = botReply
      .replace(input, '') // Remove input text
      .replace('<|im_end|>', '')
      .replace('<|im_start|>', '')
      .replace('<|assistant|>', '')
      .trim();

    console.log('✅ AI Response:', botReply.substring(0, 100) + '...');

    return botReply || "جواب موجود نہیں۔ براہ کرم دوبارہ کوشش کریں۔";

  } catch (error) {
    console.error('❌ Hugging Face API Error:', error);
    const errorMsg = error instanceof Error ? error.message : 'نامعلوم خرابی';
    return `خرابی: ${errorMsg}`;
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

export default function ChatbotPage() {
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

    console.log('📝 User Message:', content);

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setThinking(true);
    setConnectionStatus('connecting');

    try {
      console.log('🚀 Getting AI response...');
      
      const aiResponse = await getAIResponse(content);
      
      const aiMsg: Message = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      };

      console.log('✅ AI response added to chat');
      setMessages((prev) => [...prev, aiMsg]);
      setConnectionStatus('online');
    } catch (error) {
      console.error('❌ Error getting AI response:', error);
      const errorMsg: Message = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: 'معافی چاہتا ہوں، درخواست میں خرابی ہوئی۔ براہ کرم دوبارہ کوشش کریں۔',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
      setConnectionStatus('error');
    } finally {
      setThinking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !thinking) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="AI Chatbot"
        subtitle="Intelligent assistant powered by Qwen 2.5 7B"
        icon={MessageSquare}
        action={
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${
              connectionStatus === 'online'
                ? 'bg-cyan-50 border-cyan-200'
                : connectionStatus === 'connecting'
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-red-50 border-red-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full animate-pulse ${
                connectionStatus === 'online'
                  ? 'bg-cyan-500'
                  : connectionStatus === 'connecting'
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
              }`}
            />
            <span
              className={`text-xs font-medium ${
                connectionStatus === 'online'
                  ? 'text-cyan-700'
                  : connectionStatus === 'connecting'
                    ? 'text-yellow-700'
                    : 'text-red-700'
              }`}
            >
              {connectionStatus === 'online'
                ? 'AI Online'
                : connectionStatus === 'connecting'
                  ? 'Connecting...'
                  : 'Connection Error'}
            </span>
          </div>
        }
      />

      <PortalCard className="flex flex-col overflow-hidden h-[700px]">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-white to-ink-50/30">
          {messages.length === 0 && !thinking && (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center mb-4">
                <Bot className="text-white" size={32} />
              </div>
              <h3 className="text-lg font-bold text-ink-900 mb-2">College AI Assistant</h3>
              <p className="text-sm text-ink-500 max-w-md mb-6">
                Ask anything about your institution's enrollment, performance, or analytics
              </p>
              <div className="grid sm:grid-cols-2 gap-2 max-w-lg w-full">
                {QUICK_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="text-left px-4 py-3 rounded-lg bg-ink-50 hover:bg-cyan-50 border border-ink-100 text-sm text-ink-700 transition-all hover:border-cyan-300"
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
                    ? 'bg-gradient-to-br from-cyan-500 to-teal-600 text-white'
                    : 'bg-gradient-to-br from-ink-200 to-ink-300 text-ink-700'
                }`}
              >
                {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>
              <div className={`flex flex-col max-w-[70%] ${msg.role === 'user' ? 'items-end' : ''}`}>
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-cyan-500 to-teal-600 text-white rounded-tr-none'
                      : 'bg-white text-ink-800 rounded-tl-none border border-ink-200'
                  }`}
                >
                  {formatContent(msg.content)}
                </div>
                <span className="text-[10px] text-ink-400 mt-1 px-1">{msg.timestamp}</span>
              </div>
            </div>
          ))}

          {thinking && (
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-ink-200 to-ink-300 text-ink-700 flex items-center justify-center flex-shrink-0">
                <Bot size={18} />
              </div>
              <div className="bg-white border border-ink-200 text-ink-500 text-sm rounded-2xl rounded-tl-none px-4 py-2.5 flex items-center gap-1.5">
                <span
                  className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"
                  style={{ animationDelay: '0ms' }}
                />
                <span
                  className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
                <span
                  className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-ink-100 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={thinking ? 'AI is thinking...' : 'Ask about college insights...'}
            disabled={thinking}
            className="flex-1 px-4 py-3 border border-ink-200 rounded-lg bg-white text-ink-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:bg-ink-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={thinking || !input.trim()}
            className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 text-white hover:from-cyan-600 hover:to-teal-700 transition-all disabled:opacity-50 flex-shrink-0"
            title="Send message (Enter)"
          >
            <Send size={18} />
          </button>
        </div>
      </PortalCard>
    </div>
  );
}
