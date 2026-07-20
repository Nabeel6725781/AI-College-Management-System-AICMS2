import { useState } from 'react';
import { ArrowRight, GraduationCap, CheckCircle2, Clock } from 'lucide-react';
import { navigateTo } from '../lib/router';
import { usePrograms, useDepartments } from '../lib/hooks';
import { Section, SectionHeader, LoadingState } from '../components/ui';

export default function ProgramsPage() {
  const { data: programs, loading } = usePrograms();
  const { data: departments } = useDepartments();
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  const deptMap = new Map(departments.map((d) => [d.id, d.name]));

  const filtered = programs.filter((p) => {
    if (selectedDept !== 'all' && p.department_id !== selectedDept) return false;
    if (selectedLevel !== 'all') {
      if (selectedLevel === 'bachelor' && !p.degree_type.includes('Bachelor')) return false;
      if (selectedLevel === 'master' && !p.degree_type.includes('Master')) return false;
      if (selectedLevel === 'doctorate' && !p.degree_type.includes('Doctorate')) return false;
    }
    return true;
  });

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Academic programs"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-950/80 via-ink-950/70 to-ink-950/90" />
        </div>
        <div className="container-wide relative z-10">
          <div className="section-eyebrow text-gold-400 mb-4">Academic Programs</div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] max-w-3xl text-balance">
            Find your field. Pursue your passion.
          </h1>
          <p className="mt-6 text-lg lg:text-xl text-ink-200 leading-relaxed max-w-2xl text-pretty">
            With over 80 undergraduate and graduate programs across six departments, Meridian offers
            a path for every ambition. Explore our programs and discover where your curiosity can lead.
          </p>
        </div>
      </section>

      {/* Filters + Grid */}
      <Section className="bg-white">
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-ink-500 py-2 mr-2">Department:</span>
            <button
              onClick={() => setSelectedDept('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedDept === 'all' ? 'bg-ink-900 text-white' : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
              }`}
            >
              All
            </button>
            {departments.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDept(d.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedDept === d.id ? 'bg-ink-900 text-white' : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
                }`}
              >
                {d.name}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-12">
          <span className="text-sm font-medium text-ink-500 py-2 mr-2">Level:</span>
          {['all', 'bachelor', 'master', 'doctorate'].map((level) => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                selectedLevel === level ? 'bg-gold-500 text-white' : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
              }`}
            >
              {level === 'all' ? 'All Levels' : level}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingState />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-ink-500">No programs match your current filters.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((program, i) => (
              <div
                key={program.id}
                className="card card-hover overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={program.image_url || 'https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg?auto=compress&cs=tinysrgb&w=600'}
                    alt={program.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-ink-500 mb-3">
                    <span className="px-2.5 py-1 rounded-full bg-ink-100 font-medium">
                      {program.degree_type}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {program.duration}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-ink-900 mb-2 leading-snug">{program.name}</h3>
                  {program.department_id && (
                    <div className="text-sm text-gold-600 font-medium mb-3">
                      {deptMap.get(program.department_id)}
                    </div>
                  )}
                  <p className="text-sm text-ink-600 leading-relaxed line-clamp-3 mb-4">
                    {program.description}
                  </p>
                  {program.highlights && program.highlights.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {program.highlights.slice(0, 3).map((h) => (
                        <span key={h} className="text-xs px-2 py-1 rounded-md bg-gold-50 text-gold-700">
                          {h}
                        </span>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => navigateTo('/contact')}
                    className="flex items-center gap-2 text-sm font-medium text-ink-900 hover:text-gold-600 transition-colors"
                  >
                    Learn more
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Highlights section */}
      <Section className="bg-ink-50">
        <SectionHeader
          eyebrow="Why Meridian Programs"
          title="An education that goes beyond the classroom"
          center
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: GraduationCap, title: 'Small Class Sizes', desc: '9:1 student-faculty ratio with an average class size of 18 students, ensuring personalized attention.' },
            { icon: CheckCircle2, title: 'Accredited Programs', desc: 'All programs hold prestigious accreditations including ABET, AACSB, and NASAD certifications.' },
            { icon: Clock, title: 'Flexible Scheduling', desc: 'Full-time, part-time, and accelerated tracks available for most graduate programs.' },
          ].map((item, i) => (
            <div
              key={item.title}
              className="card p-8 animate-fade-in-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-ink-900 flex items-center justify-center mb-5">
                <item.icon className="text-gold-400" size={24} />
              </div>
              <h3 className="text-lg font-bold text-ink-900 mb-2">{item.title}</h3>
              <p className="text-sm text-ink-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
