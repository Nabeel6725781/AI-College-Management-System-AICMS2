import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Bot, User, Trash2, Download, Home } from 'lucide-react';
import { navigateTo } from '../lib/router';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

const suggestedQuestions = [
  { category: 'Admission', question: 'What are the admission requirements?' },
  { category: 'Departments', question: 'What departments are available?' },
  { category: 'Scholarships', question: 'Tell me about available scholarships' },
  { category: 'Fees', question: 'What is the fee structure?' },
  { category: 'Teachers', question: 'How can I contact faculty members?' },
  { category: 'Prospectus', question: 'Where can I get the prospectus?' },
];

// Mock AI responses
const getAIResponse = (userMessage: string): string => {
  const lower = userMessage.toLowerCase();
  
  if (lower.includes('admission') || lower.includes('apply')) {
    return 'Welcome to our admission process! We accept applications year-round. Requirements include: high school diploma or equivalent, minimum GPA of 2.5, and completion of entrance assessments. You can start your application on our Admissions page.';
  }
  if (lower.includes('department') || lower.includes('program') || lower.includes('major')) {
    return 'We offer diverse academic departments including: Computer Science, Business Administration, Engineering, Liberal Arts, Sciences, and more. Each department provides comprehensive programs designed to prepare students for successful careers.';
  }
  if (lower.includes('scholarship') || lower.includes('financial aid')) {
    return 'We offer various scholarships including merit-based, need-based, and departmental scholarships. Scholarship amounts range from $1,000 to full tuition coverage. Applications are available on our Scholarships page. Deadline is typically March 31st.';
  }
  if (lower.includes('fee') || lower.includes('tuition') || lower.includes('cost')) {
    return 'Annual tuition is $25,000 for domestic students and $35,000 for international students. This includes classroom instruction and access to campus facilities. Additional fees for housing, meals, and books are available on our Fees page.';
  }
  if (lower.includes('teacher') || lower.includes('faculty') || lower.includes('professor')) {
    return 'Our faculty members are experienced educators with advanced degrees from prestigious institutions. You can view faculty profiles, office hours, and contact information in our Faculty directory. Many faculty members are also available through the Student Portal.';
  }
  if (lower.includes('prospectus') || lower.includes('brochure') || lower.includes('catalog')) {
    return 'Our comprehensive prospectus contains detailed information about all programs, facilities, and student life. You can download the PDF prospectus or request a physical copy. Digital copies are available on our website.';
  }
  if (lower.includes('contact') || lower.includes('reach') || lower.includes('support')) {
    return 'You can reach our admissions office at admissions@university.edu or call (555) 123-4567. We\'re available Monday-Friday, 9 AM to 5 PM. For technical support, visit our Help & Support page.';
  }
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return 'Hello! 👋 I\'m your AI assistant here to help answer questions about our university. I can assist with information about admissions, departments, scholarships, fees, faculty, and more. What would you like to know?';
  }
  
  return 'Thank you for your question! I can help with information about admissions, departments, scholarships, fees, faculty, and prospectus. Please feel free to ask any specific questions about our university.';
};

export default function ChatbotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content: 'Hello! 👋 I\'m your AI Assistant. I\'m here to help answer any questions about our university - from admissions and departments to scholarships, fees, faculty, and more. What can I help you with today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    
    if (!messageText) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setShowSuggestions(false);
    setIsLoading(true);

    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Add AI response
    const aiMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: getAIResponse(messageText),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, aiMessage]);
    setIsLoading(false);
  };

  const handleClearChat = () => {
    if (confirm('Are you sure you want to clear the conversation?')) {
      setMessages([
        {
          id: '0',
          role: 'assistant',
          content: 'Hello! 👋 I\'m your AI Assistant. I\'m here to help answer any questions about our university - from admissions and departments to scholarships, fees, faculty, and more. What can I help you with today?',
          timestamp: new Date(),
        },
      ]);
      setShowSuggestions(true);
    }
  };

  const handleExportChat = () => {
    const chatText = messages
      .map(msg => `${msg.role === 'user' ? 'You' : 'AI Assistant'}: ${msg.content}`)
      .join('\n\n');
    
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(chatText));
    element.setAttribute('download', `chat-${new Date().getTime()}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ink-50 via-white to-gold-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-ink-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateTo('/')}
              className="p-2 hover:bg-ink-100 rounded-lg transition-colors"
              title="Back to home"
            >
              <Home size={20} className="text-ink-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ink-900 to-ink-700 flex items-center justify-center">
                <Bot className="text-gold-400" size={24} />
              </div>
              <h1 className="text-2xl font-bold text-ink-900">AI Assistant</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportChat}
              className="p-2 hover:bg-ink-100 rounded-lg transition-colors"
              title="Export chat"
            >
              <Download size={18} className="text-ink-600" />
            </button>
            <button
              onClick={handleClearChat}
              className="p-2 hover:bg-red-100 rounded-lg transition-colors"
              title="Clear chat"
            >
              <Trash2 size={18} className="text-red-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex justify-center items-center min-h-[calc(100vh-120px)] p-4">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-2xl border border-ink-200 shadow-lg flex flex-col h-[600px]">
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-ink-300 scrollbar-track-ink-100">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 animate-fade-in ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-ink-900 to-ink-700'
                        : 'bg-gradient-to-br from-gold-400 to-gold-500'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User className="text-white" size={16} />
                    ) : (
                      <Bot className="text-ink-900" size={16} />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-ink-900 to-ink-800 text-white rounded-tr-sm shadow-md'
                        : 'bg-gradient-to-br from-ink-50 to-ink-100 text-ink-900 rounded-tl-sm border border-ink-200'
                    }`}
                  >
                    {message.isTyping ? (
                      <div className="flex gap-1.5 py-1">
                        <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    ) : (
                      message.content
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="text-ink-900" size={16} />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-gradient-to-br from-ink-50 to-ink-100 text-ink-900 rounded-tl-sm border border-ink-200">
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

            {/* Suggested Questions (shown when no meaningful conversation) */}
            {showSuggestions && messages.length === 1 && (
              <div className="px-6 pb-4">
                <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-3">Suggested Questions</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {suggestedQuestions.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(item.question)}
                      className="text-left px-3 py-2.5 rounded-lg bg-gradient-to-br from-ink-50 to-ink-100 hover:from-ink-100 hover:to-ink-200 text-sm text-ink-700 transition-all duration-200 border border-ink-200 hover:border-ink-300"
                    >
                      <div className="text-xs font-semibold text-ink-500 mb-0.5">{item.category}</div>
                      <div className="line-clamp-1">{item.question}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="border-t border-ink-200 p-4 bg-gradient-to-br from-ink-50 to-white rounded-b-2xl">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex gap-3"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 rounded-xl border border-ink-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ink-900 focus:border-transparent transition-all disabled:opacity-50 disabled:bg-ink-50"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-ink-900 to-ink-800 text-white hover:from-ink-800 hover:to-ink-700 transition-all duration-200 disabled:opacity-50 flex-shrink-0 shadow-md hover:shadow-lg"
                >
                  <Send size={18} />
                </button>
              </form>
              <p className="text-xs text-ink-400 mt-2 px-2">Press Enter or click Send to submit your question</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-ink-900 text-white py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-ink-300 mb-2">
              💡 <strong>Tip:</strong> This AI Assistant can help with questions about admission, departments, scholarships, fees, faculty, and prospectus.
            </p>
            <p className="text-sm text-ink-400">
              For more detailed information, visit our main website or contact admissions office directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
