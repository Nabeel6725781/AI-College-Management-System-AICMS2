import { supabase } from './supabase';

export async function seedDemoData(userId: string) {
  // Check if already seeded
  const { data: existingAttendance } = await supabase
    .from('attendance')
    .select('id')
    .eq('student_id', userId)
    .limit(1)
    .maybeSingle();

  if (existingAttendance) return;

  // Get courses for enrollment
  const { data: courses } = await supabase.from('courses').select('*').limit(6);

  // Enroll in courses
  if (courses && courses.length > 0) {
    const enrollments = courses.slice(0, 5).map((c) => ({
      student_id: userId,
      course_id: c.id,
      status: 'active',
    }));
    await supabase.from('enrollments').insert(enrollments);

    // Attendance records
    const attendanceRecords: Record<string, any>[] = [];
    const statuses = ['present', 'present', 'present', 'present', 'late', 'absent'];
    courses.slice(0, 5).forEach((c) => {
      for (let i = 0; i < 8; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i * 3);
        attendanceRecords.push({
          student_id: userId,
          date: d.toISOString().split('T')[0],
          course_name: c.title,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          notes: null,
        });
      }
    });
    await supabase.from('attendance').insert(attendanceRecords);

    // Results
    const grades = [
      { grade: 'A', points: 4.0 },
      { grade: 'A-', points: 3.7 },
      { grade: 'B+', points: 3.3 },
      { grade: 'B', points: 3.0 },
      { grade: 'B-', points: 2.7 },
    ];
    const results = courses.slice(0, 5).map((c, i) => ({
      student_id: userId,
      course_name: c.title,
      course_code: c.code,
      credits: c.credits,
      grade: grades[i].grade,
      grade_points: grades[i].points,
      semester: 'Fall 2025',
      exam_type: 'Final',
    }));
    await supabase.from('results').insert(results);

    // Timetable
    const days = [0, 1, 2, 3, 4];
    const timeSlots = [
      { start: '09:00', end: '10:30' },
      { start: '11:00', end: '12:30' },
      { start: '14:00', end: '15:30' },
    ];
    const timetable: Record<string, any>[] = [];
    days.forEach((day) => {
      courses.slice(0, 3).forEach((c, i) => {
        const slot = timeSlots[i];
        timetable.push({
          student_id: userId,
          day_of_week: day,
          start_time: slot.start,
          end_time: slot.end,
          course_title: c.title,
          room: `Room ${100 + day * 10 + i}`,
          instructor: c.instructor,
        });
      });
    });
    await supabase.from('timetable_slots').insert(timetable);

    // Assignments
    const assignments = [
      { title: 'Research Paper: AI Ethics', course_title: 'Artificial Intelligence', due: 7 },
      { title: 'Database Design Project', course_title: 'Database Systems', due: 3 },
      { title: 'Algorithm Analysis', course_title: 'Data Structures and Algorithms', due: 14 },
      { title: 'Web Application Development', course_title: 'Web Development', due: 5 },
      { title: 'Calculus Problem Set 5', course_title: 'Calculus I', due: 2 },
    ];
    const assignmentRecords = assignments.map((a) => {
      const d = new Date();
      d.setDate(d.getDate() + a.due);
      return {
        student_id: userId,
        title: a.title,
        course_title: a.course_title,
        description: `Complete the ${a.title} assignment. Submit your work before the due date.`,
        due_date: d.toISOString().split('T')[0],
        status: 'pending',
      };
    });
    await supabase.from('assignments').insert(assignmentRecords);
  }

  // Fee challans
  const feeData = [
    { description: 'Fall 2025 Tuition', amount: 4500, due: '2025-09-15', category: 'Tuition', status: 'paid' },
    { description: 'Spring 2026 Tuition', amount: 4500, due: '2026-02-15', category: 'Tuition', status: 'pending' },
    { description: 'Library Fee', amount: 150, due: '2026-02-01', category: 'Library', status: 'pending' },
    { description: 'Lab Fee', amount: 300, due: '2026-02-15', category: 'Laboratory', status: 'pending' },
    { description: 'Student Activity Fee', amount: 200, due: '2026-01-30', category: 'Activity', status: 'paid' },
  ];
  const feeRecords = feeData.map((f) => ({
    student_id: userId,
    description: f.description,
    amount: f.amount,
    due_date: f.due,
    category: f.category,
    status: f.status,
    payment_date: f.status === 'paid' ? '2025-09-10' : null,
  }));
  await supabase.from('fees').insert(feeRecords);

  // Notifications
  const notifData = [
    { title: 'Welcome to Meridian Portal!', message: 'Your student account has been set up. Explore your dashboard to get started.', type: 'success' },
    { title: 'Assignment Due Soon', message: 'Calculus Problem Set 5 is due in 2 days. Make sure to submit on time.', type: 'alert' },
    { title: 'New Results Published', message: 'Your Fall 2025 Final exam results are now available on the Results page.', type: 'academic' },
    { title: 'Fee Payment Reminder', message: 'Spring 2026 tuition of $4,500 is due on February 15, 2026.', type: 'alert' },
    { title: 'Schedule Updated', message: 'Your weekly timetable has been updated. Check the Timetable page for details.', type: 'info' },
  ];
  const notifRecords = notifData.map((n, i) => {
    const d = new Date();
    d.setHours(d.getHours() - i * 12);
    return {
      student_id: userId,
      title: n.title,
      message: n.message,
      type: n.type,
      is_read: i > 1,
    };
  });
  await supabase.from('notifications').insert(notifRecords);
}
