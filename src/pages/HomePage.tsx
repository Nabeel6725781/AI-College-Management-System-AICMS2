import { ArrowRight, BookOpen, Users, Award, Globe, Microscope, GraduationCap, Quote } from 'lucide-react';
import { navigateTo } from '../lib/router';
import { useDepartments, usePrograms, useNews } from '../lib/hooks';
import { useCmsHomepage } from '../lib/cms-hooks';
import { Section, SectionHeader, StatCard, LoadingState } from '../components/ui';

export default function HomePage() {
  const { data: departments } = useDepartments();
  const { data: programs } = usePrograms();
  const { data: news } = useNews();
  const { data: cms } = useCmsHomepage();
  const featuredNews = news.filter((n) => n.is_featured).slice(0, 3);
  const latestNews = news.slice(0, 3);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="University campus"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-950/90 via-ink-950/70 to-ink-950/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-ink-950/30" />
        </div>

        <div className="container-wide relative z-10 pt-20">
          <div className="max-w-3xl">
            <div className="section-eyebrow text-gold-400 mb-6 animate-fade-in-up">
              {cms.hero_eyebrow}
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] text-balance animate-fade-in-up">
              {cms.hero_title.split(',')[0]},
              <br />
              <span className="text-gold-400">{cms.hero_title.split(',').slice(1).join(',').trim() || 'Shaping Futures'}</span>
            </h1>
            <p className="mt-8 text-xl text-ink-200 leading-relaxed max-w-2xl text-pretty animate-fade-in-up">
              {cms.hero_subtitle}
            </p>
            <div className="mt-10 flex flex-wrap gap-4 animate-fade-in-up">
              <button onClick={() => navigateTo('/admissions')} className="btn-gold">
                {cms.hero_cta_primary}
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => navigateTo('/about')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-medium rounded-lg border border-white/20 transition-all duration-300 hover:bg-white/20 hover:-translate-y-0.5"
              >
                {cms.hero_cta_secondary}
              </button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:block">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-1.5">
            <div className="w-1 h-2 bg-white/50 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-ink-900 py-12">
        <div className="container-wide">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard value={cms.stat_years} label="Years of Excellence" />
            <StatCard value={cms.stat_students} label="Students Enrolled" />
            <StatCard value={cms.stat_faculty} label="Faculty Members" />
            <StatCard value={cms.stat_programs} label="Academic Programs" />
          </div>
        </div>
      </section>

      {/* Welcome / About preview */}
      <Section>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="section-eyebrow mb-4">Our Mission</div>
            <h2 className="text-3xl lg:text-4xl font-bold text-ink-900 leading-tight text-balance">
              {cms.welcome_title}
            </h2>
            <p className="mt-6 text-lg text-ink-600 leading-relaxed text-pretty">
              {cms.welcome_body}
            </p>
            <p className="mt-4 text-ink-600 leading-relaxed">
              With a 9:1 student-to-faculty ratio, over 80 academic programs, and a global network of alumni,
              Meridian offers an education that is both deeply personal and profoundly expansive.
            </p>
            <button
              onClick={() => navigateTo('/about')}
              className="mt-8 inline-flex items-center gap-2 text-ink-900 font-medium link-underline"
            >
              Learn more about Meridian
              <ArrowRight size={18} />
            </button>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Students studying"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-6 max-w-[200px] hidden sm:block">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gold-100 flex items-center justify-center">
                  <Award className="text-gold-600" size={24} />
                </div>
                <div>
                  <div className="text-2xl font-serif font-bold text-ink-900">Top 20</div>
                  <div className="text-xs text-ink-500">National University</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Departments preview */}
      <Section className="bg-white">
        <SectionHeader
          eyebrow="Academic Excellence"
          title="Six departments. Endless possibilities."
          subtitle="Explore our distinguished academic departments, each home to world-class faculty and innovative programs."
          center
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.slice(0, 6).map((dept, i) => (
            <button
              key={dept.id}
              onClick={() => navigateTo('/departments')}
              className="card card-hover p-8 text-left group animate-fade-in-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="w-14 h-14 rounded-xl bg-ink-900 flex items-center justify-center mb-5 group-hover:bg-gold-500 transition-colors duration-300">
                <BookOpen className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-bold text-ink-900 mb-2">{dept.name}</h3>
              <p className="text-sm text-ink-600 leading-relaxed line-clamp-3">{dept.description}</p>
              <div className="mt-4 flex items-center gap-2 text-sm font-medium text-ink-900 group-hover:text-gold-600 transition-colors">
                Learn more
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </Section>

      {/* Programs highlight */}
      <Section className="bg-ink-50">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <div className="section-eyebrow mb-4">Academic Programs</div>
            <h2 className="text-3xl lg:text-4xl font-bold text-ink-900 leading-tight text-balance">
              Programs designed for the challenges of tomorrow
            </h2>
            <p className="mt-6 text-lg text-ink-600 leading-relaxed text-pretty">
              From computer science to the fine arts, our programs combine rigorous scholarship with
              hands-on experience. Every student graduates with the knowledge, skills, and confidence
              to make their mark on the world.
            </p>
            <div className="mt-8 space-y-4">
              {programs.slice(0, 4).map((program) => (
                <div key={program.id} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white border border-ink-100 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="text-ink-600" size={20} />
                  </div>
                  <div>
                    <div className="font-medium text-ink-900">{program.name}</div>
                    <div className="text-sm text-ink-500">
                      {program.degree_type} · {program.duration}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigateTo('/programs')}
              className="mt-8 btn-primary"
            >
              View All Programs
              <ArrowRight size={18} />
            </button>
          </div>
          <div className="order-1 lg:order-2 grid grid-cols-2 gap-4">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg">
              <img
                src="https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Computer Science"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg mt-8">
              <img
                src="https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Biology"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Feature cards */}
      <Section className="bg-white">
        <SectionHeader
          eyebrow="The Meridian Experience"
          title="More than a university. A launchpad."
          center
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Microscope, title: 'Research', desc: 'Over $200M in annual research funding across all departments.' },
            { icon: Globe, title: 'Global', desc: '80+ study abroad programs in 35 countries worldwide.' },
            { icon: Users, title: 'Community', desc: 'A diverse campus with students from 48 countries.' },
            { icon: GraduationCap, title: 'Outcomes', desc: '94% of graduates employed or in grad school within 6 months.' },
          ].map((feature, i) => (
            <div
              key={feature.title}
              className="p-8 rounded-2xl bg-ink-50 hover:bg-white hover:shadow-xl border border-ink-100 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-ink-900 flex items-center justify-center mb-5">
                <feature.icon className="text-gold-400" size={24} />
              </div>
              <h3 className="text-lg font-bold text-ink-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-ink-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* News preview */}
      <Section className="bg-ink-50">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <div className="section-eyebrow mb-3">Latest News</div>
            <h2 className="text-3xl lg:text-4xl font-bold text-ink-900 leading-tight">
              What's happening at Meridian
            </h2>
          </div>
          <button
            onClick={() => navigateTo('/news')}
            className="inline-flex items-center gap-2 text-ink-900 font-medium link-underline"
          >
            All news
            <ArrowRight size={18} />
          </button>
        </div>
        {news.length === 0 ? (
          <LoadingState />
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {(featuredNews.length > 0 ? featuredNews : latestNews).slice(0, 3).map((article, i) => (
              <button
                key={article.id}
                onClick={() => navigateTo(`/news/${article.id}`)}
                className="card card-hover overflow-hidden text-left group animate-fade-in-up"
                style={{ animationDelay: `${i * 80}ms` }}
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
                  <h3 className="text-lg font-bold text-ink-900 leading-snug group-hover:text-gold-600 transition-colors">
                    {article.title}
                  </h3>
                  <p className="mt-3 text-sm text-ink-600 leading-relaxed line-clamp-2">{article.excerpt}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </Section>

      {/* Testimonial */}
      <section className="bg-ink-900 py-20 lg:py-28">
        <div className="container-narrow text-center">
          <Quote className="text-gold-400 mx-auto mb-8" size={48} />
          <blockquote className="text-2xl lg:text-3xl font-serif text-white leading-relaxed text-balance">
            "{cms.testimonial_quote}"
          </blockquote>
          <div className="mt-8">
            <div className="font-medium text-white">{cms.testimonial_author}</div>
            <div className="text-sm text-ink-400">{cms.testimonial_role}</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gold-500 py-20 lg:py-28">
        <div className="container-wide text-center">
          <h2 className="text-3xl lg:text-5xl font-bold text-white leading-tight text-balance">
            {cms.cta_title}
          </h2>
          <p className="mt-6 text-lg text-gold-50 max-w-2xl mx-auto">
            {cms.cta_subtitle}
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigateTo('/admissions')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-ink-900 text-white font-medium rounded-lg transition-all duration-300 hover:bg-ink-800 hover:shadow-xl hover:-translate-y-0.5"
            >
              Start Your Application
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => navigateTo('/contact')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-ink-900 font-medium rounded-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
            >
              Visit Campus
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
