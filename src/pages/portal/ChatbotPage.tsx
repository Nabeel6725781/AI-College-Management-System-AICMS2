import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Bot, User, Trash2 } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useChatbotMessages } from '../../lib/portal-hooks';
import { supabase } from '../../lib/supabase';
import { PortalCard, PortalPageHeader, PortalLoading } from '../../components/portal-ui';

const suggestions = [
  'What are my upcoming assignments?',
  'How is my attendance?',
  'When is my next fee due?',
  'What courses am I enrolled in?',
];

function generateResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('assignment') || lower.includes('homework')) {
    return "You can view all your assignments on the Assignments page. I'd recommend checking the pending section for upcoming due dates. Would you like me to help you prioritize?";
  }
  if (lower.includes('attendance')) {
    return "Your attendance is tracked on the Attendance page. You can see your overall rate, per-course breakdown, and detailed history there. Is there a specific course you're concerned about?";
  }
  if (lower.includes('fee') || lower.includes('payment') || lower.includes('challan')) {
    return "Your fee challans are available on the Fee Challan page. You can view pending and paid invoices, and make payments directly. Would you like to know your current balance?";
  }
  if (lower.includes('course') || lower.includes('enroll')) {
    return "You can manage your course enrollments on the My Courses page. Browse available courses and enroll with a single click. Need help choosing a course?";
  }
  if (lower.includes('result') || lower.includes('grade') || lower.includes('gpa')) {
    return "Your academic results are available on the Results page. You can view grades by semester, your cumulative GPA, and download transcripts. Want to see your latest results?";
  }
  if (lower.includes('timetable') || lower.includes('schedule')) {
    return "Your weekly timetable is on the Timetable page. It shows today's classes and your full weekly schedule with room and instructor details.";
  }
  if (lower.includes('document') || lower.includes('upload') || lower.includes('ocr')) {
    return "You can upload documents on the Document Upload page and verify them using AI-powered OCR on the OCR Verification page. What type of document are you looking to upload?";
  }
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return "Hello! I'm your AI assistant. I can help you with questions about your courses, assignments, attendance, results, fees, and more. What can I help you with today?";
  }
  return "I'm here to help with your student portal questions! You can ask me about your courses, assignments, attendance, results, fees, timetable, documents, and more. What would you like to know?";
}

export default function ChatbotPage() {
  const { user } = useAuth();
  const { data: messages, loading } = useChatbotMessages(user?.id);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const content = text || input;
    if (!user || !content.trim()) return;

    setSending(true);
    setInput('');

    // Save user message
    await supabase.from('chatbot_messages').insert({
      student_id: user.id,
      role: 'user',
      content: content.trim(),
    });

    // Generate and save bot response after a delay
    setTimeout(async () => {
      const response = generateResponse(content);
      await supabase.from('chatbot_messages').insert({
        student_id: user.id,
        role: 'assistant',
        content: response,
      });
      setSending(false);
      window.location.reload();
    }, 800);
  };

  const handleClear = async () => {
    if (!user) return;
    await supabase.from('chatbot_messages').delete().eq('student_id', user.id);
    window.location.reload();
  };

  if (loading) return <PortalLoading />;

  return (
    <div className="animate-fade-in h-full flex flex-col">
      <PortalPageHeader
        title="AI Chatbot"
        subtitle="Your intelligent academic assistant"
        icon={MessageSquare}
        action={
          messages.length > 0 ? (
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-red-600 transition-colors"
            >
              <Trash2 size={16} /> Clear
            </button>
          ) : undefined
        }
      />

      <PortalCard className="flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-[400px]">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-ink-900 flex items-center justify-center mb-4">
                <Bot className="text-gold-400" size={32} />
              </div>
              <h3 className="text-lg font-bold text-ink-900 mb-2">Welcome to Meridian AI Assistant</h3>
              <p className="text-sm text-ink-500 max-w-md mb-6">
                I can help you with questions about your courses, assignments, attendance, results, fees, and more.
              </p>
              <div className="grid sm:grid-cols-2 gap-2 max-w-lg w-full">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="text-left px-4 py-3 rounded-lg bg-ink-50 hover:bg-ink-100 text-sm text-ink-700 transition-colors"
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
                  msg.role === 'user' ? 'bg-ink-900' : 'bg-gold-100'
                }`}
              >
                {msg.role === 'user' ? (
                  <User className="text-white" size={18} />
                ) : (
                  <Bot className="text-gold-600" size={18} />
                )}
              </div>
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-ink-900 text-white rounded-tr-sm'
                    : 'bg-ink-50 text-ink-900 rounded-tl-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-gold-100 flex items-center justify-center flex-shrink-0">
                <Bot className="text-gold-600" size={18} />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-ink-50 rounded-tl-sm">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-ink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-ink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-ink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-ink-100 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !sending) handleSend(); }}
              placeholder="Ask me anything..."
              disabled={sending}
              className="flex-1 px-4 py-3 rounded-lg border border-ink-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ink-900 disabled:opacity-50"
            />
            <button
              onClick={() => handleSend()}
              disabled={sending || !input.trim()}
              className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-ink-900 text-white hover:bg-ink-800 transition-all disabled:opacity-50 flex-shrink-0"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </PortalCard>
    </div>
  );
}
