import { useState, useRef, useEffect } from 'react';
import {
  MessageSquare, Send, Bot, User, Plus, Sparkles, Brain,
  TrendingUp, DollarSign, Users, AlertTriangle, Search, Clock,
} from 'lucide-react';
import {
  PortalCard, PortalPageHeader, PortalButton,
} from '../../components/portal-ui';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

type Conversation = {
  id: string;
  title: string;
  preview: string;
  time: string;
  messages: Message[];
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

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    title: 'Enrollment Analysis Q4',
    preview: 'Enrollment is up 8% compared to last semester...',
    time: '2 hours ago',
    messages: [
      { id: 'm1', role: 'user', content: "What's the enrollment trend for this semester?", timestamp: '10:15 AM' },
      { id: 'm2', role: 'assistant', content: 'Enrollment is currently trending upward. We have 1,247 enrolled students, an 8% increase from last semester. The Computer Science and Business departments show the strongest growth at 15% and 11% respectively. Based on current application rates, I project 1,340 students by next semester.', timestamp: '10:15 AM' },
    ],
  },
  {
    id: 'c2',
    title: 'Revenue Overview',
    preview: 'Total revenue collected this fiscal year is $2.4M...',
    time: 'Yesterday',
    messages: [
      { id: 'm3', role: 'user', content: 'Show me revenue insights', timestamp: '3:42 PM' },
      { id: 'm4', role: 'assistant', content: 'Total revenue collected this fiscal year is $2.4M, which is 12% ahead of projections. However, there are 47 overdue accounts totaling $89,000. The Science Department has the highest collection rate at 96%, while Arts has the lowest at 78%. I recommend sending automated reminders to the 47 overdue accounts.', timestamp: '3:42 PM' },
    ],
  },
  {
    id: 'c3',
    title: 'At-Risk Students Report',
    preview: 'I identified 23 students showing early warning signs...',
    time: '3 days ago',
    messages: [
      { id: 'm5', role: 'user', content: 'Find at-risk students', timestamp: '9:20 AM' },
      { id: 'm6', role: 'assistant', content: 'I identified 23 students showing early warning signs — declining attendance, missed assignments, or fee defaults. 8 students have attendance below 75%, 12 have missed 3+ assignments, and 3 have overdue fees. I recommend academic counseling within 2 weeks for the high-priority group.', timestamp: '9:20 AM' },
    ],
  },
];

function generateResponse(input: string): string {
  const lower = input.toLowerCase();

  if (lower.includes('enroll') || lower.includes('admission') || lower.includes('student') && lower.includes('trend')) {
    return "Enrollment is currently trending upward. We have **1,247 enrolled students**, an **8% increase** from last semester.\n\n**Department Breakdown:**\n• Computer Science: +15% growth\n• Business: +11% growth\n• Engineering: +6% growth\n• Arts: -2% decline\n\nBased on current application rates, I project **1,340 students** by next semester. Would you like me to generate a detailed enrollment forecast report?";
  }

  if (lower.includes('revenue') || lower.includes('finance') || lower.includes('fee') || lower.includes('payment')) {
    return "Here's your revenue overview:\n\n**Total Collected:** $2.4M (12% ahead of projections)\n**Outstanding:** $89,000 across 47 accounts\n**Collection Rate:** 94.2%\n\n**By Department:**\n• Science: 96% collected\n• Business: 93% collected\n• Arts: 78% collected (needs attention)\n\nI recommend sending automated reminders to the 47 overdue accounts. Want me to draft a reminder template?";
  }

  if (lower.includes('predict') || lower.includes('semester') || lower.includes('next')) {
    return "Based on my predictive models, here's the outlook for next semester:\n\n**Enrollment:** 1,340 students (+7.4%)\n**Revenue:** $2.68M projected (+11.7%)\n**Attendance:** 92.1% average (slight dip expected)\n**At-Risk Students:** ~28 predicted (up from 23)\n\nKey factors: 3 new programs launching, scholarship expansion, and seasonal enrollment patterns. Would you like a full predictive report?";
  }

  if (lower.includes('risk') || lower.includes('at-risk') || lower.includes('struggling')) {
    return "I've identified **23 at-risk students** using multiple indicators:\n\n**Risk Distribution:**\n• High Risk: 8 students (attendance <75%)\n• Medium Risk: 12 students (3+ missed assignments)\n• Low Risk: 3 students (fee defaults)\n\n**Recommended Actions:**\n1. Academic counseling within 2 weeks (high priority)\n2. Assignment recovery plan (medium priority)\n3. Financial aid consultation (low priority)\n\nShall I generate individual intervention plans for the high-risk group?";
  }

  if (lower.includes('attendance')) {
    return "Overall attendance is at **91.4%**, up 2.1% from last month.\n\n**Day-of-Week Patterns:**\n• Monday-Thursday: 93-96%\n• Friday: 84% (lowest)\n• Saturday: 78%\n\n**Department Highlights:**\n• Science: 94% (highest)\n• Arts: 87% (lowest)\n\nI detected a Friday afternoon dip in Engineering — likely a scheduling conflict. Want me to predict next month's attendance?";
  }

  if (lower.includes('performance') || lower.includes('grade') || lower.includes('gpa') || lower.includes('result')) {
    return "Academic performance summary:\n\n**Average GPA:** 3.2 (up 0.15 from last semester)\n**Pass Rate:** 87.5%\n**Top Performers:** 142 students with GPA 3.7+\n\n**Subject Insights:**\n• Mathematics: 82% pass rate (needs attention)\n• English: 91% pass rate\n• Computer Science: 94% pass rate\n\nI can predict final grades for individual students or generate a full academic performance report.";
  }

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('help')) {
    return "Hello! I'm your Meridian AI Assistant. I can help you with:\n\n• 📊 Enrollment trends and forecasts\n• 💰 Revenue and financial insights\n• 🎓 Student performance analysis\n• ⚠️ At-risk student identification\n• 📅 Attendance predictions\n• 🔍 Smart search across records\n\nWhat would you like to know?";
  }

  return "I can help you with enrollment trends, revenue insights, student performance, at-risk identification, attendance predictions, and more. Try asking me:\n\n• 'What's the enrollment trend?'\n• 'Show me revenue insights'\n• 'Predict next semester'\n• 'Find at-risk students'\n\nWhat would you like to explore?";
}

function formatContent(text: string) {
  // Simple formatting: split by newlines, bold **text**
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
  const [conversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  const handleNewChat = () => {
    setActiveConvId(null);
    setMessages([]);
  };

  const handleSelectConversation = (conv: Conversation) => {
    setActiveConvId(conv.id);
    setMessages(conv.messages);
  };

  const handleSend = (text?: string) => {
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

    setTimeout(() => {
      const aiMsg: Message = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: generateResponse(content),
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setThinking(false);
    }, 1200 + Math.random() * 600);
  };

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="AI Chatbot"
        subtitle="Intelligent conversational assistant for institutional insights"
        icon={MessageSquare}
        action={
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-50 border border-cyan-200">
            <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-cyan-700">AI Online</span>
          </div>
        }
      />

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        {/* Left Sidebar - Conversation History */}
        <div className="space-y-4">
          <PortalButton onClick={handleNewChat} className="w-full">
            <Plus size={16} /> New Chat
          </PortalButton>

          <PortalCard className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={16} className="text-ink-500" />
              <h3 className="text-sm font-bold text-ink-900">Conversation History</h3>
            </div>
            <div className="space-y-2">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                    activeConvId === conv.id
                      ? 'bg-gradient-to-r from-cyan-50 to-teal-50 border border-cyan-200'
                      : 'bg-ink-50 hover:bg-ink-100 border border-transparent'
                  }`}
                >
                  <div className="text-sm font-medium text-ink-900 truncate">{conv.title}</div>
                  <div className="text-xs text-ink-500 truncate mt-1">{conv.preview}</div>
                  <div className="text-[10px] text-ink-400 mt-1">{conv.time}</div>
                </button>
              ))}
            </div>
          </PortalCard>

          {/* AI Capabilities */}
          <PortalCard className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-cyan-500" />
              <h3 className="text-sm font-bold text-ink-900">AI Capabilities</h3>
            </div>
            <div className="space-y-2.5">
              {CAPABILITIES.map((cap) => (
                <div key={cap.label} className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center flex-shrink-0">
                    <cap.icon className="text-cyan-600" size={15} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-ink-900">{cap.label}</div>
                    <div className="text-[10px] text-ink-500 leading-tight mt-0.5">{cap.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </PortalCard>
        </div>

        {/* Main Chat Area */}
        <PortalCard className="flex flex-col overflow-hidden" >
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-[500px] max-h-[600px]">
            {messages.length === 0 && !thinking && (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center mb-4">
                  <Bot className="text-white" size={32} />
                </div>
                <h3 className="text-lg font-bold text-ink-900 mb-2">Meridian AI Assistant</h3>
                <p className="text-sm text-ink-500 max-w-md mb-6">
                  I can help you with enrollment trends, revenue insights, student performance, predictions, and more.
                </p>
                <div className="grid sm:grid-cols-2 gap-2 max-w-lg w-full">
                  {QUICK_SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSend(s)}
                      className="text-left px-4 py-3 rounded-lg bg-ink-50 hover:bg-cyan-50 hover:border-cyan-200 border border-ink-100 text-sm text-ink-700 transition-all duration-200"
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

            {/* Typing indicator */}
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

          {/* Quick suggestion chips */}
          {messages.length > 0 && !thinking && (
            <div className="px-6 pb-3 flex flex-wrap gap-2">
              {QUICK_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="text-xs px-3 py-1.5 rounded-full bg-ink-50 hover:bg-cyan-50 hover:text-cyan-700 text-ink-600 border border-ink-100 hover:border-cyan-200 transition-all duration-200"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input area */}
          <div className="border-t border-ink-100 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !thinking) handleSend(); }}
                placeholder="Ask me anything about your institution..."
                disabled={thinking}
                className="flex-1 px-4 py-3 rounded-lg border border-ink-200 bg-white text-ink-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50"
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
    </div>
  );
}
