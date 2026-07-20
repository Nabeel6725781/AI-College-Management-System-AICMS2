import { ArrowRight, CheckCircle2, FileText, DollarSign, Calendar, ClipboardList, Mail, Clock } from 'lucide-react';
import { navigateTo } from '../lib/router';
import { Section, SectionHeader, StatCard } from '../components/ui';
import { useCmsAdmissions, useCmsAdmissionsSteps, useCmsAdmissionsRequirements, useCmsAdmissionsDeadlines, useCmsAdmissionsAid, useScholarships } from '../lib/cms-hooks';

const iconMap: Record<string, typeof FileText> = {
  FileText, ClipboardList, Mail, CheckCircle2, DollarSign, Calendar, Clock,
};

export default function AdmissionsPage() {
  const { data: cms } = useCmsAdmissions();
  const { data: steps } = useCmsAdmissionsSteps();
  const { data: requirements } = useCmsAdmissionsRequirements();
  const { data: deadlines } = useCmsAdmissionsDeadlines();
  const { data: aidOptions } = useCmsAdmissionsAid();
  const { data: scholarships } = useScholarships();
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Students walking on campus"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-950/80 via-ink-950/70 to-ink-950/90" />
        </div>
        <div className="container-wide relative z-10">
          <div className="section-eyebrow text-gold-400 mb-4">Admissions</div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] max-w-3xl text-balance">
            {cms.hero_title}
          </h1>
          <p className="mt-6 text-lg lg:text-xl text-ink-200 leading-relaxed max-w-2xl text-pretty">
            {cms.hero_subtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <button onClick={() => navigateTo('/contact')} className="btn-gold">
              Start Your Application
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => navigateTo('/faq')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-medium rounded-lg border border-white/20 transition-all duration-300 hover:bg-white/20 hover:-translate-y-0.5"
            >
              Admissions FAQ
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-ink-900 py-12">
        <div className="container-wide">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard value={cms.stat_acceptance} label="Acceptance Rate" />
            <StatCard value={cms.stat_applications} label="Applications" />
            <StatCard value={cms.stat_class} label="Class of 2030" />
            <StatCard value={cms.stat_aid} label="Receive Aid" />
          </div>
        </div>
      </section>

      {/* Process */}
      <Section className="bg-white">
        <SectionHeader
          eyebrow="Application Process"
          title="Four steps to enrollment"
          subtitle="Our streamlined application process is designed to help you put your best foot forward."
          center
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => {
            const Icon = iconMap[step.icon] || FileText;
            return (
              <div
                key={step.id}
                className="relative p-8 rounded-2xl bg-ink-50 border border-ink-100 animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="absolute top-6 right-6 text-5xl font-serif font-bold text-ink-200">
                  {i + 1}
                </div>
                <div className="w-12 h-12 rounded-xl bg-ink-900 flex items-center justify-center mb-5 relative z-10">
                  <Icon className="text-gold-400" size={24} />
                </div>
                <h3 className="text-lg font-bold text-ink-900 mb-2">{step.title}</h3>
                <p className="text-sm text-ink-600 leading-relaxed mb-4">{step.description}</p>
                {step.deadline && (
                  <div className="flex items-center gap-2 text-xs font-medium text-gold-600">
                    <Clock size={14} />
                    Deadline: {step.deadline}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      {/* Requirements */}
      <Section className="bg-ink-50">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <div className="section-eyebrow mb-4">What You'll Need</div>
            <h2 className="text-3xl lg:text-4xl font-bold text-ink-900 leading-tight text-balance">
              Application requirements
            </h2>
            <p className="mt-4 text-ink-600 leading-relaxed">
              Carefully review the following requirements before submitting your application. All materials
              must be received by the application deadline.
            </p>
            <div className="mt-8 space-y-3">
              {requirements.map((req) => (
                <div key={req.id} className="flex items-start gap-3">
                  <CheckCircle2 className="text-gold-600 mt-0.5 flex-shrink-0" size={20} />
                  <span className="text-ink-700">{req.requirement}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-8 lg:p-10">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="text-gold-600" size={24} />
              <h3 className="text-xl font-bold text-ink-900">Key Deadlines</h3>
            </div>
            <div className="space-y-6">
              {deadlines.map((d) => (
                <div key={d.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6 border-b border-ink-100 last:border-0 last:pb-0">
                  <div>
                    <div className="font-semibold text-ink-900">{d.type}</div>
                    <div className="text-sm text-ink-500">{d.description}</div>
                  </div>
                  <div className="text-sm font-semibold text-gold-600 whitespace-nowrap">{d.date}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Financial Aid */}
      <Section className="bg-white">
        <SectionHeader
          eyebrow="Tuition & Financial Aid"
          title={cms.aid_title}
          subtitle={cms.aid_description}
          center
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {aidOptions.map((option, i) => (
            <div
              key={option.id}
              className="card p-8 animate-fade-in-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-gold-100 flex items-center justify-center mb-5">
                <DollarSign className="text-gold-600" size={24} />
              </div>
              <h3 className="text-lg font-bold text-ink-900 mb-2">{option.title}</h3>
              <p className="text-sm text-ink-600 leading-relaxed mb-4">{option.description}</p>
              <div className="text-sm font-semibold text-ink-900">{option.amount}</div>
            </div>
          ))}
        </div>

        {/* Scholarships from DB */}
        {scholarships.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-bold text-ink-900 mb-6 text-center">Available Scholarships</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {scholarships.map((s, i) => (
                <div key={s.id} className="card p-6 animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                  <h4 className="font-bold text-ink-900 mb-2">{s.name}</h4>
                  <p className="text-sm text-ink-600 mb-3">{s.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-gold-600">${s.amount.toLocaleString()}</span>
                    {s.deadline && <span className="text-ink-500">Due: {s.deadline}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="mt-12 max-w-2xl mx-auto text-center">
          <div className="card p-8 bg-ink-50">
            <h3 className="text-xl font-bold text-ink-900 mb-2">Cost of Attendance (2026-2027)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div>
                <div className="text-sm text-ink-500">Tuition</div>
                <div className="text-lg font-bold text-ink-900">{cms.tuition}</div>
              </div>
              <div>
                <div className="text-sm text-ink-500">Room & Board</div>
                <div className="text-lg font-bold text-ink-900">{cms.room_board}</div>
              </div>
              <div>
                <div className="text-sm text-ink-500">Fees</div>
                <div className="text-lg font-bold text-ink-900">{cms.fees}</div>
              </div>
              <div>
                <div className="text-sm text-ink-500">Total</div>
                <div className="text-lg font-bold text-gold-600">{cms.total}</div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <section className="bg-ink-900 py-20">
        <div className="container-wide text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white leading-tight text-balance">
            Ready to join the Meridian community?
          </h2>
          <p className="mt-4 text-ink-300 max-w-xl mx-auto">
            Our admissions team is here to help you through every step of the process.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button onClick={() => navigateTo('/contact')} className="btn-gold">
              Contact Admissions
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => navigateTo('/faq')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-medium rounded-lg border border-white/20 transition-all duration-300 hover:bg-white/20"
            >
              View FAQ
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
