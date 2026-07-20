import { ArrowRight, Target, Eye, Heart, Building2, Landmark, Calendar, Users, Star, Award, BookOpen, GraduationCap, Globe } from 'lucide-react';
import { navigateTo } from '../lib/router';
import { Section, SectionHeader, StatCard } from '../components/ui';
import { useCmsAbout, useCmsAboutMilestones, useCmsAboutValues } from '../lib/cms-hooks';

const iconMap: Record<string, typeof Target> = {
  Target, Eye, Heart, Users, Star, Award, BookOpen, GraduationCap, Globe,
};

export default function AboutPage() {
  const { data: cms } = useCmsAbout();
  const { data: milestones } = useCmsAboutMilestones();
  const { data: values } = useCmsAboutValues();
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/1205376/pexels-photo-1205376.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="University building"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-950/80 via-ink-950/70 to-ink-950/90" />
        </div>
        <div className="container-wide relative z-10">
          <div className="section-eyebrow text-gold-400 mb-4">About Meridian</div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] max-w-3xl text-balance">
            {cms.hero_title}
          </h1>
          <p className="mt-6 text-lg lg:text-xl text-ink-200 leading-relaxed max-w-2xl text-pretty">
            {cms.hero_subtitle}
          </p>
        </div>
      </section>

      {/* Story */}
      <Section className="bg-white">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="section-eyebrow mb-4">Our Story</div>
            <h2 className="text-3xl lg:text-4xl font-bold text-ink-900 leading-tight text-balance">
              {cms.story_title}
            </h2>
            <div className="mt-6 space-y-4 text-ink-600 leading-relaxed">
              <p>{cms.story_body1}</p>
              <p>{cms.story_body2}</p>
              <p>{cms.story_body3}</p>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.pexels.com/photos/1205376/pexels-photo-1205376.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Historic campus building"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-ink-900 rounded-2xl shadow-xl p-6 hidden sm:block">
              <div className="flex items-center gap-3">
                <Landmark className="text-gold-400" size={28} />
                <div>
                  <div className="text-2xl font-serif font-bold text-white">175</div>
                  <div className="text-xs text-ink-400 uppercase tracking-wider">Years Strong</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Mission & Vision */}
      <Section className="bg-ink-50">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="card p-10">
            <div className="w-14 h-14 rounded-xl bg-ink-900 flex items-center justify-center mb-6">
              <Target className="text-gold-400" size={28} />
            </div>
            <h3 className="text-2xl font-bold text-ink-900 mb-4">Our Mission</h3>
            <p className="text-ink-600 leading-relaxed text-pretty">
              {cms.mission_text}
            </p>
          </div>
          <div className="card p-10">
            <div className="w-14 h-14 rounded-xl bg-ink-900 flex items-center justify-center mb-6">
              <Eye className="text-gold-400" size={28} />
            </div>
            <h3 className="text-2xl font-bold text-ink-900 mb-4">Our Vision</h3>
            <p className="text-ink-600 leading-relaxed text-pretty">
              {cms.vision_text}
            </p>
          </div>
        </div>
      </Section>

      {/* Values */}
      <Section className="bg-white">
        <SectionHeader
          eyebrow="What We Stand For"
          title="Our core values"
          subtitle="These principles guide everything we do — from the classroom to the laboratory to the community."
          center
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, i) => {
            const Icon = iconMap[value.icon] || Target;
            return (
              <div
                key={value.id}
                className="p-8 rounded-2xl bg-ink-50 hover:bg-white hover:shadow-xl border border-ink-100 transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-ink-900 flex items-center justify-center mb-5">
                  <Icon className="text-gold-400" size={24} />
                </div>
                <h3 className="text-lg font-bold text-ink-900 mb-2">{value.title}</h3>
                <p className="text-sm text-ink-600 leading-relaxed">{value.description}</p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Timeline */}
      <Section className="bg-ink-50">
        <SectionHeader
          eyebrow="Our History"
          title="A timeline of milestones"
          center
        />
        <div className="relative max-w-3xl mx-auto">
          {/* Vertical line */}
          <div className="absolute left-4 lg:left-1/2 top-0 bottom-0 w-px bg-ink-200 lg:-translate-x-1/2" />
          <div className="space-y-12">
            {milestones.map((m, i) => (
              <div
                key={m.id}
                className={`relative flex items-start gap-6 lg:gap-0 ${
                  i % 2 === 0 ? 'lg:flex-row-reverse' : ''
                } animate-fade-in-up`}
              >
                {/* Dot */}
                <div className="absolute left-4 lg:left-1/2 top-2 w-3 h-3 rounded-full bg-gold-500 ring-4 ring-ink-50 lg:-translate-x-1/2 z-10" />
                {/* Content */}
                <div className={`pl-12 lg:pl-0 lg:w-1/2 ${i % 2 === 0 ? 'lg:pr-12 lg:text-right' : 'lg:pl-12'}`}>
                  <div className="flex items-center gap-2 mb-2 lg:justify-start ${i % 2 === 0 ? 'lg:justify-end' : ''}">
                    <Calendar size={14} className="text-gold-600" />
                    <span className="text-sm font-semibold text-gold-600">{m.year}</span>
                  </div>
                  <h3 className="text-xl font-bold text-ink-900 mb-2">{m.title}</h3>
                  <p className="text-sm text-ink-600 leading-relaxed">{m.description}</p>
                </div>
                <div className="hidden lg:block lg:w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Stats */}
      <section className="bg-ink-900 py-16">
        <div className="container-wide">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard value={cms.stat_alumni} label="Global Alumni" />
            <StatCard value={cms.stat_research} label="Annual Research Funding" />
            <StatCard value={cms.stat_ratio} label="Student-Faculty Ratio" />
            <StatCard value={cms.stat_placement} label="Career Placement" />
          </div>
        </div>
      </section>

      {/* Campus */}
      <Section className="bg-white">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Campus"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="section-eyebrow mb-4">Our Campus</div>
            <h2 className="text-3xl lg:text-4xl font-bold text-ink-900 leading-tight text-balance">
              {cms.campus_title}
            </h2>
            <p className="mt-6 text-lg text-ink-600 leading-relaxed text-pretty">
              {cms.campus_body}
            </p>
            <div className="mt-8 grid grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <Building2 className="text-gold-600 mt-1" size={20} />
                <div>
                  <div className="font-medium text-ink-900">45 Buildings</div>
                  <div className="text-sm text-ink-500">Academic & research</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Landmark className="text-gold-600 mt-1" size={20} />
                <div>
                  <div className="font-medium text-ink-900">12 Libraries</div>
                  <div className="text-sm text-ink-500">2M+ volumes</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="text-gold-600 mt-1" size={20} />
                <div>
                  <div className="font-medium text-ink-900">200+ Clubs</div>
                  <div className="text-sm text-ink-500">Student organizations</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Target className="text-gold-600 mt-1" size={20} />
                <div>
                  <div className="font-medium text-ink-900">18 Varsity Teams</div>
                  <div className="text-sm text-ink-500">NCAA Division I</div>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigateTo('/contact')}
              className="mt-8 inline-flex items-center gap-2 text-ink-900 font-medium link-underline"
            >
              Schedule a campus visit
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </Section>
    </div>
  );
}
