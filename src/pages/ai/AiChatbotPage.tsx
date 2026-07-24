// src/pages/portal/ChatbotPage.tsx - Alibaba Cloud Qwen API Integration

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
  "سلام! میں کون ہوں؟",
  "کالج کے بارے میں بتاؤ",
  "طالب علموں کی تعداد کیا ہے؟",
  "اگلے سیمسٹر کی پیشن گوئی کریں",
];

// ✅ ALIBABA CLOUD QWEN API Integration
async function getAIResponse(input: string): Promise<string> {
  try {
    const apiKey = import.meta.env.VITE_ALIBABA_API_KEY?.trim();
    
    if (!apiKey) {
      console.error('❌ Alibaba API Key missing');
      return "خرابی: Alibaba Cloud API key .env میں موجود نہیں۔";
    }

    console.log('🔑 Using Alibaba API Key:', apiKey.substring(0, 20) + '...');

    // ✅ Alibaba Cloud Qwen API endpoint
    const endpoint = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation";

    console.log('📤 Sending to Alibaba Cloud Qwen API...');

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'false',
      },
      body: JSON.stringify({
        model: 'qwen-turbo', // یا qwen-plus, qwen-max
        messages: [
          {
            role: 'system',
            content: 'آپ ایک کالج مینجمنٹ سسٹم کے لیے AI اسسٹنٹ ہیں۔ طالب علموں کی تعداد، آمدنی، کارکردگی، اور تجزیات کے بارے میں سوالات کے جوابات دیں۔ جوابات مختصر، عملی اور اچھی طریقے سے فارمیٹ شدہ ہوں۔ اردو اور انگریزی میں جوابات دیں۔'
          },
          {
            role: 'user',
            content: input
          }
        ],
        parameters: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 1024,
        },
      }),
    });

    console.log('📊 Response Status:', response.status);

    const data = await response.json();

    console.log('📊 API Response:', data);

    // ✅ Check for errors
    if (!response.ok) {
      if (data.code === 'InvalidApiKey') {
        return "خرابی: API key غلط ہے۔ براہ کرم صحیح key استعمال کریں۔";
      }
      if (data.message) {
        return `خرابی: ${data.message}`;
      }
      throw new Error(`HTTP ${response.status}`);
    }

    // ✅ Extract response from Alibaba format
    if (data.output && data.output.choices && data.output.choices.length > 0) {
      const message = data.output.choices[0].message;
      if (message && message.content) {
        const aiText = message.content.trim();
        console.log('✅ AI Response received:', aiText.substring(0, 80) + '...');
        return aiText;
      }
    }

    console.warn('⚠️ No valid response structure');
    return "معافی چاہتا ہوں، جواب نہیں مل سکا۔";

  } catch (error) {
    console.error('❌ Error:', error);
    const msg = error instanceof Error ? error.message : 'نامعلوم خرابی';
    return `خرابی: ${msg}`;
  }
}

function formatContent(text: string) {
  return text.split('\n').map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <span key={i}>
        {parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} className="font-bold">{part.slice(2, -2)}</strong>;
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
    
    console.log('📝 User Message:', content);
    
    setMessages((prev) => [...prev, {
      id: `u-${Date.now()}`,
      role: 'user',
      content,
      timestamp: now,
    }]);
    
    setInput('');
    setThinking(true);
    setConnectionStatus('connecting');

    try {
      console.log('🚀 Getting Qwen response...');
      
      const aiResponse = await getAIResponse(content);
      
      console.log('✅ Response added to chat');
      
      setMessages((prev) => [...prev, {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      }]);
      
      setConnectionStatus('online');
    } catch (error) {
      console.error('❌ Error:', error);
      setMessages((prev) => [...prev, {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: 'معافی چاہتا ہوں، خرابی ہوگئی۔ براہ کرم دوبارہ کوشش کریں۔',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      }]);
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
        subtitle="Alibaba Cloud Qwen - College Assistant"
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
              {connectionStatus === 'online' ? 'Qwen Online' :
               connectionStatus === 'connecting' ? 'Connecting...' :
               'Connection Error'}
            </span>
          </div>
        }
      />

      <PortalCard className="flex flex-col h-[700px]">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-white to-ink-50/30">
          {messages.length === 0 && !thinking && (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center mb-4">
                <Bot className="text-white" size={32} />
              </div>
              <h3 className="text-lg font-bold text-ink-900 mb-2">Qwen AI Assistant</h3>
              <p className="text-sm text-ink-500 max-w-md mb-6">
                Alibaba Cloud سے چلنے والا ذہین اسسٹنٹ
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
            placeholder={thinking ? 'Qwen سوچ رہا ہے...' : 'اپنا سوال لکھیں...'}
            disabled={thinking}
            className="flex-1 px-4 py-3 border border-ink-200 rounded-lg bg-white text-ink-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:bg-ink-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={thinking || !input.trim()}
            className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 text-white hover:from-cyan-600 hover:to-teal-700 transition-all disabled:opacity-50 flex-shrink-0"
            title="پیغام بھیجیں (Enter)"
          >
            <Send size={18} />
          </button>
        </div>
      </PortalCard>
    </div>
  );
}
