import { supabase } from './supabase';

export async function seedTeacherData(userId: string, email: string) {
  const { data: existing } = await supabase
    .from('teacher_profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (existing) return;

  await supabase.from('teacher_profiles').insert({
    id: userId,
    full_name: email?.split('@')[0]?.replace(/[._]/g, ' ')?.replace(/\b\w/g, (c) => c.toUpperCase()) || 'Professor',
    teacher_id: `FAC${Date.now().toString().slice(-6)}`,
    department: 'Computer Science',
    title: 'Associate Professor',
    office_hours: 'Mon/Wed 2-4pm',
    office_location: 'Science Building, Room 305',
    status: 'active',
  });

  // Timetable
  const days = [0, 1, 2, 3, 4];
  const classes = [
    { course: 'Introduction to Computer Science', room: 'Lab 101', time: { start: '09:00', end: '10:30' } },
    { course: 'Data Structures and Algorithms', room: 'Room 220', time: { start: '11:00', end: '12:30' } },
    { course: 'Database Systems', room: 'Lab 103', time: { start: '14:00', end: '15:30' } },
  ];
  const timetable: Record<string, any>[] = [];
  days.forEach((day) => {
    classes.forEach((c, i) => {
      if ((day + i) % 2 === 0) {
        timetable.push({
          teacher_id: userId,
          day_of_week: day,
          start_time: c.time.start,
          end_time: c.time.end,
          course_title: c.course,
          room: c.room,
          class_name: `Section ${String.fromCharCode(65 + i)}`,
        });
      }
    });
  });
  await supabase.from('teacher_timetable_slots').insert(timetable);

  // Assignments
  const assignments = [
    { title: 'Programming Assignment 1: Hello World', course: 'Introduction to Computer Science', class: 'Section A', due: 7 },
    { title: 'Linked List Implementation', course: 'Data Structures and Algorithms', class: 'Section B', due: 5 },
    { title: 'SQL Query Exercises', course: 'Database Systems', class: 'Section C', due: 10 },
    { title: 'Midterm Project Proposal', course: 'Introduction to Computer Science', class: 'Section A', due: 14 },
  ];
  await supabase.from('teacher_assignments').insert(
    assignments.map((a) => {
      const d = new Date();
      d.setDate(d.getDate() + a.due);
      return {
        teacher_id: userId,
        course_title: a.course,
        class_name: a.class,
        title: a.title,
        description: `Please submit your work through the portal before the due date. Late submissions will be penalized.`,
        due_date: d.toISOString().split('T')[0],
        status: 'active',
      };
    })
  );

  // Marks
  const studentNames = [
    'Emma Johnson', 'Liam Smith', 'Olivia Brown', 'Noah Davis', 'Ava Wilson',
    'Ethan Moore', 'Sophia Taylor', 'Mason Anderson', 'Isabella Thomas', 'Lucas Martin',
  ];
  const courses = ['Introduction to Computer Science', 'Data Structures and Algorithms', 'Database Systems'];
  const examTypes = ['Midterm', 'Quiz 1', 'Assignment'];
  const marks: Record<string, any>[] = [];
  studentNames.forEach((name, i) => {
    courses.forEach((course, j) => {
      const score = Math.floor(Math.random() * 25 + 75);
      const grade = score >= 90 ? 'A' : score >= 85 ? 'A-' : score >= 80 ? 'B+' : score >= 75 ? 'B' : 'B-';
      marks.push({
        teacher_id: userId,
        student_name: name,
        student_id: `MU${(1000 + i * 10 + j).toString()}`,
        course_title: course,
        exam_type: examTypes[j],
        score,
        max_score: 100,
        grade,
        semester: 'Fall 2025',
      });
    });
  });
  await supabase.from('marks').insert(marks);

  // Notifications
  const notifs = [
    { title: 'Welcome to Teacher Portal!', message: 'Your faculty account is set up. Explore your dashboard to get started.', type: 'success' },
    { title: 'New Assignment Submission', message: 'Emma Johnson submitted "Programming Assignment 1". Review it on the Assignments page.', type: 'info' },
    { title: 'Attendance Reminder', message: 'Don\'t forget to mark attendance for your Database Systems class today.', type: 'alert' },
    { title: 'Department Meeting', message: 'Faculty meeting scheduled for Friday at 3pm in the Conference Room.', type: 'info' },
    { title: 'Grades Due Soon', message: 'Midterm grades are due by end of next week. Please enter marks promptly.', type: 'alert' },
  ];
  await supabase.from('teacher_notifications').insert(
    notifs.map((n, i) => {
      const d = new Date();
      d.setHours(d.getHours() - i * 8);
      return {
        teacher_id: userId,
        title: n.title,
        message: n.message,
        type: n.type,
        is_read: i > 1,
      };
    })
  );

  // Messages
  await supabase.from('messages').insert([
    {
      sender_id: userId,
      recipient_id: null,
      recipient_name: 'Emma Johnson',
      sender_name: 'You',
      subject: 'Regarding your assignment',
      body: 'Hi Emma, I reviewed your Programming Assignment 1. Great work! Please check the feedback and let me know if you have questions.',
      is_read: true,
    },
    {
      sender_id: userId,
      recipient_id: null,
      recipient_name: 'Liam Smith',
      sender_name: 'You',
      subject: 'Office hours visit',
      body: 'Liam, please come by during office hours on Wednesday to discuss your data structures project.',
      is_read: false,
    },
  ]);
}
