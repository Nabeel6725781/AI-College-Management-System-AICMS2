import { useState } from 'react';
import { ArrowRight, ArrowLeft, Calendar, User, Search } from 'lucide-react';
import { navigateTo } from '../lib/router';
import { useNews, useNewsArticle } from '../lib/hooks';
import { Section, SectionHeader, LoadingState, ErrorState } from '../components/ui';
import type { Route } from '../lib/router';

export function NewsPage() {
  const { data: news, loading } = useNews();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(news.map((n) => n.category)))];

  const filtered = news.filter((n) => {
    if (selectedCategory !== 'all' && n.category !== selectedCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.excerpt.toLowerCase().includes(q);
    }
    return true;
  });

  const featured = news.find((n) => n.is_featured);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="News"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-950/80 via-ink-950/70 to-ink-950/90" />
        </div>
        <div className="container-wide relative z-10">
          <div className="section-eyebrow text-gold-400 mb-4">News & Updates</div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] max-w-3xl text-balance">
            Stories from the Meridian community
          </h1>
          <p className="mt-6 text-lg lg:text-xl text-ink-200 leading-relaxed max-w-2xl text-pretty">
            Discover the latest research breakthroughs, campus events, and achievements from across
            our university.
          </p>
        </div>
      </section>

      {/* Featured article */}
      {featured && !search && selectedCategory === 'all' && (
        <Section className="bg-white">
          <div className="section-eyebrow mb-4">Featured Story</div>
          <button
            onClick={() => navigateTo(`/news/${featured.id}`)}
            className="card card-hover overflow-hidden text-left grid lg:grid-cols-2 gap-0 w-full"
          >
            <div className="aspect-[16/10] lg:aspect-auto overflow-hidden">
              <img
                src={featured.image_url || 'https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg?auto=compress&cs=tinysrgb&w=800'}
                alt={featured.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <div className="flex items-center gap-3 text-xs text-ink-500 mb-4">
                <span className="px-2.5 py-1 rounded-full bg-gold-100 text-gold-700 font-medium">
                  {featured.category}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(featured.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-ink-900 leading-tight mb-4 text-balance">
                {featured.title}
              </h2>
              <p className="text-ink-600 leading-relaxed mb-6">{featured.excerpt}</p>
              <div className="flex items-center gap-2 text-sm font-medium text-ink-900">
                Read full story
                <ArrowRight size={18} />
              </div>
            </div>
          </button>
        </Section>
      )}

      {/* Search + filters + grid */}
      <Section className="bg-ink-50">
        <div className="flex flex-col lg:flex-row gap-4 mb-12">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" size={20} />
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-ink-200 bg-white text-ink-900 placeholder-ink-400 focus:outline-none focus:border-ink-900 transition-colors"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  selectedCategory === cat ? 'bg-ink-900 text-white' : 'bg-white text-ink-700 hover:bg-ink-100'
                }`}
              >
                {cat === 'all' ? 'All Categories' : cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <LoadingState />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-ink-500">No articles found.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((article, i) => (
              <button
                key={article.id}
                onClick={() => navigateTo(`/news/${article.id}`)}
                className="card card-hover overflow-hidden text-left group animate-fade-in-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={article.image_url || 'https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg?auto=compress&cs=tinysrgb&w=600'}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 text-xs text-ink-500 mb-3">
                    <span className="px-2.5 py-1 rounded-full bg-gold-100 text-gold-700 font-medium">
                      {article.category}
                    </span>
                    <span>{new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <h3 className="text-lg font-bold text-ink-900 leading-snug mb-3 group-hover:text-gold-600 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-ink-600 leading-relaxed line-clamp-2 mb-4">{article.excerpt}</p>
                  <div className="flex items-center gap-2 text-xs text-ink-500">
                    <User size={14} />
                    {article.author}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

export function NewsArticlePage({ route }: { route: Extract<Route, { name: 'news-article' }> }) {
  const { data: article, loading, error } = useNewsArticle(route.id);
  const { data: allNews } = useNews();

  if (loading) return <div className="pt-32"><LoadingState /></div>;
  if (error) return <div className="pt-32"><ErrorState message={error} /></div>;
  if (!article) return <div className="pt-32"><ErrorState message="Article not found." /></div>;

  const related = allNews.filter((n) => n.id !== article.id && n.category === article.category).slice(0, 3);

  return (
    <div className="animate-fade-in">
      {/* Hero with article image */}
      <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={article.image_url || 'https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg?auto=compress&cs=tinysrgb&w=1920'}
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-950/85 via-ink-950/75 to-ink-950/95" />
        </div>
        <div className="container-wide relative z-10">
          <button
            onClick={() => navigateTo('/news')}
            className="flex items-center gap-2 text-sm text-ink-300 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            Back to News
          </button>
          <div className="flex items-center gap-3 text-xs text-ink-300 mb-4">
            <span className="px-2.5 py-1 rounded-full bg-gold-500 text-white font-medium">
              {article.category}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {new Date(article.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1">
              <User size={12} />
              {article.author}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-[1.15] max-w-4xl text-balance">
            {article.title}
          </h1>
        </div>
      </section>

      {/* Article body */}
      <Section className="bg-white">
        <div className="max-w-3xl mx-auto">
          <p className="text-xl text-ink-700 leading-relaxed font-serif mb-8 text-pretty">
            {article.excerpt}
          </p>
          <div className="prose prose-lg max-w-none">
            {article.content.split('\n').map((para, i) => (
              <p key={i} className="text-ink-700 leading-relaxed mb-6 text-pretty">
                {para}
              </p>
            ))}
          </div>
        </div>
      </Section>

      {/* Related articles */}
      {related.length > 0 && (
        <Section className="bg-ink-50">
          <SectionHeader
            eyebrow="Keep Reading"
            title="Related stories"
          />
          <div className="grid md:grid-cols-3 gap-8">
            {related.map((r, i) => (
              <button
                key={r.id}
                onClick={() => navigateTo(`/news/${r.id}`)}
                className="card card-hover overflow-hidden text-left group animate-fade-in-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={r.image_url || 'https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg?auto=compress&cs=tinysrgb&w=600'}
                    alt={r.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="text-xs text-ink-500 mb-2">
                    {new Date(r.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <h3 className="text-base font-bold text-ink-900 leading-snug group-hover:text-gold-600 transition-colors line-clamp-2">
                    {r.title}
                  </h3>
                </div>
              </button>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
