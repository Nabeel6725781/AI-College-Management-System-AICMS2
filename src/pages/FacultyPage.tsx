import { useState } from 'react';
import { Mail, Search, ArrowRight } from 'lucide-react';
import { navigateTo } from '../lib/router';
import { useFaculty, useDepartments } from '../lib/hooks';
import { Section, LoadingState } from '../components/ui';

export default function FacultyPage() {
  const { data: faculty, loading } = useFaculty();
  const { data: departments } = useDepartments();
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [search, setSearch] = useState('');

  const deptMap = new Map(departments.map((d) => [d.id, d.name]));

  const filtered = faculty.filter((f) => {
    if (selectedDept !== 'all' && f.department_id !== selectedDept) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        f.name.toLowerCase().includes(q) ||
        f.title.toLowerCase().includes(q) ||
        f.research_areas?.some((r) => r.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Faculty"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-950/80 via-ink-950/70 to-ink-950/90" />
        </div>
        <div className="container-wide relative z-10">
          <div className="section-eyebrow text-gold-400 mb-4">Our Faculty</div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] max-w-3xl text-balance">
            Meet the minds behind Meridian
          </h1>
          <p className="mt-6 text-lg lg:text-xl text-ink-200 leading-relaxed max-w-2xl text-pretty">
            Our faculty are world-renowned scholars, researchers, and mentors dedicated to pushing
            the boundaries of knowledge and guiding the next generation of leaders.
          </p>
        </div>
      </section>

      {/* Search + Filter */}
      <Section className="bg-white">
        <div className="flex flex-col lg:flex-row gap-4 mb-12">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" size={20} />
            <input
              type="text"
              placeholder="Search faculty by name, title, or research area..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-ink-200 bg-ink-50 text-ink-900 placeholder-ink-400 focus:outline-none focus:border-ink-900 focus:bg-white transition-colors"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedDept('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedDept === 'all' ? 'bg-ink-900 text-white' : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
              }`}
            >
              All Departments
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

        {loading ? (
          <LoadingState />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-ink-500">No faculty members match your search.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((member, i) => (
              <div
                key={member.id}
                className="card card-hover overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="aspect-[4/3] overflow-hidden bg-ink-100">
                  <img
                    src={member.image_url || 'https://images.pexels.com/photos/5212317/pexels-photo-5212317.jpeg?auto=compress&cs=tinysrgb&w=600'}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  {member.department_id && (
                    <div className="text-xs font-semibold text-gold-600 uppercase tracking-wider mb-2">
                      {deptMap.get(member.department_id)}
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-ink-900 mb-1">{member.name}</h3>
                  <div className="text-sm text-ink-500 mb-4">{member.title}</div>
                  <p className="text-sm text-ink-600 leading-relaxed line-clamp-3 mb-4">{member.bio}</p>
                  {member.research_areas && member.research_areas.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {member.research_areas.map((area) => (
                        <span key={area} className="text-xs px-2 py-1 rounded-md bg-ink-50 text-ink-600">
                          {area}
                        </span>
                      ))}
                    </div>
                  )}
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="flex items-center gap-2 text-sm text-ink-700 hover:text-gold-600 transition-colors"
                    >
                      <Mail size={16} />
                      {member.email}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* CTA */}
      <section className="bg-ink-50 py-16">
        <div className="container-wide text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-ink-900 mb-4">
            Want to join our faculty?
          </h2>
          <p className="text-ink-600 max-w-xl mx-auto mb-8">
            We're always seeking exceptional scholars and teachers to join the Meridian community.
          </p>
          <button onClick={() => navigateTo('/contact')} className="btn-primary">
            Contact Us
            <ArrowRight size={18} />
          </button>
        </div>
      </section>
    </div>
  );
}
