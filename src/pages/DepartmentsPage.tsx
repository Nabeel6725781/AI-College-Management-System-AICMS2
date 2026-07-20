import { ArrowRight, BookOpen, Cpu, Dna, Atom, Briefcase, Palette, Sigma, Calendar } from 'lucide-react';
import { navigateTo } from '../lib/router';
import { useDepartments, usePrograms, useFaculty } from '../lib/hooks';
import { Section, SectionHeader, LoadingState } from '../components/ui';

const iconMap: Record<string, typeof BookOpen> = {
  Cpu, Dna, Atom, Briefcase, Palette, Sigma, BookOpen,
};

export default function DepartmentsPage() {
  const { data: departments, loading } = useDepartments();
  const { data: programs } = usePrograms();
  const { data: faculty } = useFaculty();

  if (loading) return <LoadingState />;

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Academic departments"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-950/80 via-ink-950/70 to-ink-950/90" />
        </div>
        <div className="container-wide relative z-10">
          <div className="section-eyebrow text-gold-400 mb-4">Academic Departments</div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] max-w-3xl text-balance">
            Six departments. One mission.
          </h1>
          <p className="mt-6 text-lg lg:text-xl text-ink-200 leading-relaxed max-w-2xl text-pretty">
            Each department at Meridian is home to distinguished faculty, innovative programs, and
            research that pushes the boundaries of human knowledge.
          </p>
        </div>
      </section>

      {/* Department cards */}
      <Section className="bg-white">
        <div className="grid lg:grid-cols-2 gap-8">
          {departments.map((dept, i) => {
            const Icon = iconMap[dept.icon] || BookOpen;
            const deptPrograms = programs.filter((p) => p.department_id === dept.id);
            const deptFaculty = faculty.filter((f) => f.department_id === dept.id);

            return (
              <div
                key={dept.id}
                className="card card-hover overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="aspect-[16/9] overflow-hidden relative">
                  <img
                    src={dept.image_url || 'https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg?auto=compress&cs=tinysrgb&w=800'}
                    alt={dept.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 to-transparent" />
                  <div className="absolute bottom-4 left-6 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center">
                      <Icon className="text-ink-900" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{dept.name}</h3>
                      {dept.established_year && (
                        <div className="text-xs text-ink-200 flex items-center gap-1">
                          <Calendar size={12} />
                          Est. {dept.established_year}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-ink-600 leading-relaxed mb-6">{dept.description}</p>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-ink-50 rounded-xl p-4">
                      <div className="text-2xl font-serif font-bold text-ink-900">{deptPrograms.length}</div>
                      <div className="text-xs text-ink-500 uppercase tracking-wider">Programs</div>
                    </div>
                    <div className="bg-ink-50 rounded-xl p-4">
                      <div className="text-2xl font-serif font-bold text-ink-900">{deptFaculty.length}+</div>
                      <div className="text-xs text-ink-500 uppercase tracking-wider">Faculty</div>
                    </div>
                  </div>
                  {deptPrograms.length > 0 && (
                    <div className="space-y-2 mb-6">
                      <div className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                        Featured Programs
                      </div>
                      {deptPrograms.slice(0, 3).map((p) => (
                        <button
                          key={p.id}
                          onClick={() => navigateTo('/programs')}
                          className="flex items-center justify-between w-full py-2 px-3 rounded-lg hover:bg-ink-50 transition-colors text-left"
                        >
                          <span className="text-sm text-ink-700">{p.name}</span>
                          <ArrowRight size={14} className="text-ink-400" />
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigateTo('/faculty')}
                      className="flex-1 px-4 py-2.5 bg-ink-100 text-ink-900 text-sm font-medium rounded-lg hover:bg-ink-200 transition-colors"
                    >
                      View Faculty
                    </button>
                    <button
                      onClick={() => navigateTo('/programs')}
                      className="flex-1 px-4 py-2.5 bg-ink-900 text-white text-sm font-medium rounded-lg hover:bg-ink-800 transition-colors"
                    >
                      View Programs
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Research section */}
      <Section className="bg-ink-50">
        <SectionHeader
          eyebrow="Research Excellence"
          title="Research that changes the world"
          subtitle="Our departments are hubs of innovation, producing research that addresses humanity's most pressing challenges — from quantum computing to antibiotic resistance."
          center
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { value: '$200M+', label: 'Annual Research Funding', desc: 'Supporting groundbreaking work across all departments.' },
            { value: '1,200+', label: 'Publications Per Year', desc: 'Peer-reviewed articles in top journals worldwide.' },
            { value: '50+', label: 'Research Centers', desc: 'Interdisciplinary institutes and specialized labs.' },
            { value: '300+', label: 'Active Patents', desc: 'Innovations licensed to industry partners.' },
            { value: '70%', label: 'Student Participation', desc: 'Undergraduates involved in research projects.' },
            { value: '15', label: 'National Awards', desc: 'Faculty honors in the past five years.' },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="card p-8 animate-fade-in-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="text-3xl font-serif font-bold text-gold-600 mb-2">{stat.value}</div>
              <div className="text-sm font-semibold text-ink-900 mb-2">{stat.label}</div>
              <div className="text-sm text-ink-500 leading-relaxed">{stat.desc}</div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
