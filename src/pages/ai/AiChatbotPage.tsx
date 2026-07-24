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

async function getAIResponse(input: string): Promise<string> {
  const apiKey = import.meta.env.VITE_HF_API_KEY?.trim();
  
  if (!apiKey) {
    return "Error: VITE_HF_API_KEY is missing. Please add your Hugging Face API key to .env file.";
  }

  // Purely configured for Qwen 2.5 7B Instruct
  const endpoint = "https://huggingface.co";

  const systemPrompt = `You are an AI assistant for a college management system. Answer questions about student enrollment, revenue, performance, and institutional insights. Keep responses concise, practical, and well-formatted with key details bolded where appropriate. Always reply politely in a mix of English and Roman Urdu based on user language.`;

  const fullPrompt = `<|im_start|>system\n${systemPrompt}<|im_end|>\n<|im_start|>user\n${input}<|im_end|>\n<|im_start|>assistant\n`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: fullPrompt,
        parameters: { 
          max_new_tokens: 500, 
          temperature: 0.6,
          return_full_text: false 
        }
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Hugging Face API Error Payload:', data);
      throw new Error(data.error || `HTTP ${response.status} Error`);
    }

    let botReply = "";
    if (Array.isArray(data) && data[0]?.generated_text) {
      botReply = data[0].generated_text.trim();
    } else if (data.generated_text) {
      botReply = data.generated_text.trim();
    } else if (data.error) {
      return "Model abhi load ho raha hai, bara-e-meherbani 10 seconds baad dobara check karein.";
    } else {
      return "Unable to generate response from Qwen model. Please try again.";
    }

    return botReply.replace("<|im_end|>", "").replace("<|im_start|>", "").trim();

  } catch (error) {
    console.error('AI API Error:', error);
    return `Error: ${error instanceof Error ? error.message : 'Failed to connect to AI service'}. Please check your API key.`;
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
        subtitle="Intelligent assistant powered by Qwen 2.5 7B Instruct"
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
              {connectionStatus === 'online' ? 'Qwen AI Online' :
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
              <h3 className="text-lg font-bold text-ink-900 mb-2">College AI Assistant</h3>
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
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user' ? 'bg-cyan-100 text-cyan-700' : 'bg-ink-100 text-ink-700'
              }`}>
                {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>
              <div className={`flex flex-col max-w-[70%] ${msg.role === 'user' ? 'items-end' : ''}`}>
                <div className={`rounded-2xl px-4 py-2.5 text-sm ${
                  msg.role === 'user' 
                    ? 'bg-cyan-600 text-white rounded-tr-none' 
                    : 'bg-ink-50 text-ink-800 rounded-tl-none'
                }`}>
                  {formatContent(msg.content)}
                </div>
                <span className="text-[10px] text-ink-400 mt-1 px-1">{msg.timestamp}</span>
              </div>
            </div>
          ))}

          {thinking && (
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-ink-100 text-ink-700 flex items-center justify-center flex-shrink-0">
                <Bot size={18} />
              </div>
              <div className="bg-ink-50 text-ink-500 text-sm rounded-2xl rounded-tl-none px-4 py-2.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-ink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-ink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-ink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-ink-50/50 border-top border-ink-100 flex gap-2 items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about college insights..."
            disabled={thinking}
