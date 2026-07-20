import { useState } from 'react';
import { ChevronDown, Search, HelpCircle, ArrowRight } from 'lucide-react';
import { navigateTo } from '../lib/router';
import { useFaqs } from '../lib/hooks';
import { Section, LoadingState } from '../components/ui';

export default function FaqPage() {
  const { data: faqs, loading } = useFaqs();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openId, setOpenId] = useState<string | null>(null);

  const categories = ['all', ...Array.from(new Set(faqs.map((f) => f.category)))];

  const filtered = faqs.filter((f) => {
    if (selectedCategory !== 'all' && f.category !== selectedCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="FAQ"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-950/80 via-ink-950/70 to-ink-950/90" />
        </div>
        <div className="container-wide relative z-10">
          <div className="section-eyebrow text-gold-400 mb-4">Frequently Asked Questions</div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] max-w-3xl text-balance">
            Answers to your questions
          </h1>
          <p className="mt-6 text-lg lg:text-xl text-ink-200 leading-relaxed max-w-2xl text-pretty">
            Everything you need to know about admissions, academics, campus life, and more. Can't find
            what you're looking for? We're here to help.
          </p>
        </div>
      </section>

      {/* Search + categories */}
      <Section className="bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" size={20} />
            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-ink-200 bg-ink-50 text-ink-900 placeholder-ink-400 focus:outline-none focus:border-ink-900 focus:bg-white transition-colors text-lg"
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-10 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  selectedCategory === cat ? 'bg-ink-900 text-white' : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
                }`}
              >
                {cat === 'all' ? 'All Topics' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ accordion */}
        {loading ? (
          <LoadingState />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <HelpCircle className="text-ink-300 mx-auto mb-4" size={48} />
            <p className="text-ink-500">No questions match your search.</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {filtered.map((faq, i) => {
              const isOpen = openId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`card overflow-hidden transition-all duration-300 animate-fade-in-up ${
                    isOpen ? 'shadow-md' : ''
                  }`}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <button
                    onClick={() => setOpenId(isOpen ? null : faq.id)}
                    className="w-full flex items-center justify-between gap-4 p-6 text-left"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                        isOpen ? 'bg-gold-500 text-white' : 'bg-ink-100 text-ink-600'
                      }`}>
                        <span className="text-sm font-bold">Q</span>
                      </div>
                      <h3 className="text-base lg:text-lg font-bold text-ink-900 pt-0.5">{faq.question}</h3>
                    </div>
                    <ChevronDown
                      size={20}
                      className={`text-ink-400 flex-shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      isOpen ? 'max-h-96' : 'max-h-0'
                    }`}
                  >
                    <div className="px-6 pb-6 pl-[4.5rem]">
                      <p className="text-ink-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      {/* Still have questions CTA */}
      <section className="bg-ink-50 py-16">
        <div className="container-wide">
          <div className="card p-10 lg:p-16 text-center max-w-3xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-ink-900 flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="text-gold-400" size={32} />
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-ink-900 mb-4 text-balance">
              Still have questions?
            </h2>
            <p className="text-ink-600 mb-8 max-w-xl mx-auto">
              Our team is ready to help with any questions you might have about Meridian University.
              Reach out and we'll get you the answers you need.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button onClick={() => navigateTo('/contact')} className="btn-primary">
                Contact Us
                <ArrowRight size={18} />
              </button>
              <button onClick={() => navigateTo('/admissions')} className="btn-secondary">
                Admissions Info
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
