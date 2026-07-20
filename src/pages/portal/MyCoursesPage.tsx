import { useState } from 'react';
import { BookOpen, Plus, Search, Trash2, User } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useEnrollments, useCourses } from '../../lib/portal-hooks';
import { supabase } from '../../lib/supabase';
import { PortalCard, PortalPageHeader, PortalButton, PortalLoading, Badge, EmptyState, PortalSelect } from '../../components/portal-ui';

export default function MyCoursesPage() {
  const { user } = useAuth();
  const { data: enrollments, loading } = useEnrollments(user?.id);
  const { data: allCourses } = useCourses();
  const [showEnroll, setShowEnroll] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [search, setSearch] = useState('');

  const enrolledCourseIds = new Set(enrollments.map((e) => e.course_id));
  const availableCourses = allCourses.filter((c) => !enrolledCourseIds.has(c.id));
  const filteredEnrollments = enrollments.filter((e) =>
    e.course?.title?.toLowerCase().includes(search.toLowerCase()) ||
    e.course?.code?.toLowerCase().includes(search.toLowerCase())
  );

  const handleEnroll = async () => {
    if (!user || !selectedCourse) return;
    setEnrolling(true);
    await supabase.from('enrollments').insert({
      student_id: user.id,
      course_id: selectedCourse,
      status: 'active',
    });
    setEnrolling(false);
    setShowEnroll(false);
    setSelectedCourse('');
    window.location.reload();
  };

  const handleDrop = async (id: string) => {
    await supabase.from('enrollments').delete().eq('id', id);
    window.location.reload();
  };

  if (loading) return <PortalLoading />;

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="My Courses"
        subtitle={`${enrollments.length} course${enrollments.length !== 1 ? 's' : ''} enrolled`}
        icon={BookOpen}
        action={
          <PortalButton variant="primary" onClick={() => setShowEnroll(!showEnroll)}>
            <Plus size={16} /> Enroll
          </PortalButton>
        }
      />

      {showEnroll && (
        <PortalCard className="p-6 mb-6">
          <h3 className="text-lg font-bold text-ink-900 mb-4">Enroll in a Course</h3>
          {availableCourses.length === 0 ? (
            <p className="text-sm text-ink-500">You're already enrolled in all available courses.</p>
          ) : (
            <div className="space-y-4">
              <PortalSelect
                label="Select Course"
                value={selectedCourse}
                onChange={setSelectedCourse}
                options={[
                  { value: '', label: 'Choose a course...' },
                  ...availableCourses.map((c) => ({ value: c.id, label: `${c.code} — ${c.title}` })),
                ]}
              />
              <div className="flex gap-2">
                <PortalButton variant="secondary" onClick={() => setShowEnroll(false)}>Cancel</PortalButton>
                <PortalButton variant="gold" onClick={handleEnroll} disabled={!selectedCourse || enrolling}>
                  {enrolling ? 'Enrolling...' : 'Confirm Enrollment'}
                </PortalButton>
              </div>
            </div>
          )}
        </PortalCard>
      )}

      {enrollments.length === 0 ? (
        <EmptyState icon={BookOpen} title="No courses enrolled" message="Click 'Enroll' to browse and register for courses." />
      ) : (
        <>
          <div className="mb-4 relative max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-ink-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ink-900"
            />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEnrollments.map((enrollment) => {
              const course = enrollment.course;
              if (!course) return null;
              return (
                <PortalCard key={enrollment.id} className="p-6 card-hover">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-ink-900 flex items-center justify-center">
                      <BookOpen className="text-gold-400" size={24} />
                    </div>
                    <Badge variant={enrollment.status === 'active' ? 'success' : 'default'}>
                      {enrollment.status}
                    </Badge>
                  </div>
                  <div className="text-xs font-medium text-gold-600 mb-1">{course.code}</div>
                  <h3 className="text-lg font-bold text-ink-900 mb-2">{course.title}</h3>
                  <p className="text-sm text-ink-500 line-clamp-2 mb-4">{course.description}</p>
                  <div className="space-y-2 text-sm text-ink-600">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-ink-400" />
                      {course.instructor}
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen size={14} className="text-ink-400" />
                      {course.credits} credits · Semester {course.semester}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDrop(enrollment.id)}
                    className="mt-4 text-sm text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 size={14} /> Drop course
                  </button>
                </PortalCard>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
