// const dotenv = require('dotenv');
// const  connectDB  = require('../config/db');
// const Teacher = require('../models/Teacher');
// const Student = require('../models/Student');
// const Course = require('../models/Course');
// const bcrypt = require('bcryptjs');

// dotenv.config();

// async function seed() {
//   await connectDB();

//   console.log('Clearing existing data...');
//   await Promise.all([Course.deleteMany({}), Teacher.deleteMany({}), Student.deleteMany({})]);

//   const teacherEmail = process.env.SEED_TEACHER_EMAIL || 'teacher@elearn.local';
//   const teacherPassword = process.env.SEED_TEACHER_PASSWORD || 'Teacher@123';
//   const studentEmail = process.env.SEED_STUDENT_EMAIL || 'student@elearn.local';
//   const studentPassword = process.env.SEED_STUDENT_PASSWORD || 'Student@123';

//   const [teacher, student] = await Promise.all([
//     Teacher.create({
//       name: 'Seed Teacher',
//       email: teacherEmail,
//       password: await bcrypt.hash(teacherPassword, 10),
//       bio: 'Experienced instructor in technology.'
//     }),
//     Student.create({
//       name: 'Seed Student',
//       email: studentEmail,
//       password: await bcrypt.hash(studentPassword, 10)
//     })
//   ]);

//   const sampleLessons = [
//     { title: 'Introduction', videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4', duration: 5, description: 'Course overview' },
//     { title: 'Getting Started', videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4', duration: 10, description: 'Setup and tools' }
//   ];

//   const coursesData = [
//     { title: 'JavaScript Basics', description: 'Learn JS from scratch', category: 'Programming', price: 0 },
//     { title: 'React Fundamentals', description: 'Build UIs with React', category: 'Frontend', price: 29 },
//     { title: 'Node & Express', description: 'APIs with Express', category: 'Backend', price: 39 },
//     { title: 'Data Science Intro', description: 'Basics of DS', category: 'Data', price: 49 }
//   ];

//   const courses = await Course.insertMany(
//     coursesData.map((c) => ({ ...c, instructor: teacher._id, lessons: sampleLessons }))
//   );

//   const firstCourse = courses[0];
//   student.enrolledCourses.push(firstCourse._id);
//   student.progress.push({ courseId: firstCourse._id, completedLessons: 0 });
//   await student.save();
//   firstCourse.studentsEnrolled.push(student._id);
//   await firstCourse.save();

//   console.log('Seed complete!');
//   console.log('Teacher login:', teacherEmail, teacherPassword);
//   console.log('Student login:', studentEmail, studentPassword);
//   process.exit(0);
// }

// seed().catch((e) => {
//   console.error(e);
//   process.exit(1);
// });





const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Course = require('../models/Course');

dotenv.config();

async function seed() {
  await connectDB();

  console.log('🧹 Clearing existing data...');
  await Promise.all([
    Course.deleteMany({}),
    Teacher.deleteMany({}),
    Student.deleteMany({})
  ]);

  // Sample data arrays
  const teacherNames = [
    'Amit', 'Rohit', 'Neha', 'Priya', 'Suresh', 'Kavita', 'Vikas', 'Nisha', 'Rahul', 'Sneha'
  ];

  const studentNames = [
    'Arjun', 'Simran', 'Manish', 'Tina', 'Raj', 'Isha', 'Deepak', 'Kiran', 'Vivek', 'Anjali'
  ];

  const courseTitles = [
    'JavaScript Basics',
    'React Fundamentals',
    'Node.js & Express',
    'MongoDB Mastery',
    'Python for Beginners',
    'Data Science Intro',
    'HTML & CSS Deep Dive',
    'Machine Learning 101',
    'C++ Programming',
    'Cybersecurity Essentials'
  ];

  const sampleLessons = [
    {
      title: 'Introduction',
      videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
      duration: 5,
      description: 'Overview of the course'
    },
    {
      title: 'Setup and Tools',
      videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
      duration: 8,
      description: 'How to set up your environment'
    },
    {
      title: 'Core Concepts',
      videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
      duration: 12,
      description: 'Learn the main concepts'
    }
  ];

  const teacherPassword = await bcrypt.hash('Teacher@123', 10);
  const studentPassword = await bcrypt.hash('Student@123', 10);

  console.log('👩‍🏫 Creating teachers...');
  const teachers = await Teacher.insertMany(
    teacherNames.map((name, i) => ({
      name,
      email: `${name.toLowerCase()}@teacher.com`,
      password: teacherPassword,
      bio: `Hi, I am ${name}, an experienced instructor in tech.`,
      profilePic: `https://api.dicebear.com/7.x/identicon/svg?seed=${name}`,
    }))
  );

  console.log('🎓 Creating students...');
  const students = await Student.insertMany(
    studentNames.map((name) => ({
      name,
      email: `${name.toLowerCase()}@student.com`,
      password: studentPassword,
      enrolledCourses: [],
      progress: []
    }))
  );

  console.log('📚 Creating courses...');
  const courses = [];

  for (let i = 0; i < courseTitles.length; i++) {
    const randomTeacher = teachers[Math.floor(Math.random() * teachers.length)];
    const course = await Course.create({
      title: courseTitles[i],
      description: `Comprehensive guide to ${courseTitles[i]}`,
      category: 'Education',
      price: Math.floor(Math.random() * 50),
      instructor: randomTeacher._id,
      lessons: sampleLessons,
      studentsEnrolled: []
    });
    courses.push(course);
  }

  console.log('🔗 Enrolling students in random courses...');
  for (const student of students) {
    const numCourses = Math.floor(Math.random() * 3) + 1; // 1–3 courses per student
    const randomCourses = courses.sort(() => 0.5 - Math.random()).slice(0, numCourses);

    for (const course of randomCourses) {
      student.enrolledCourses.push(course._id);
      student.progress.push({
        courseId: course._id,
        completedLessons: Math.floor(Math.random() * sampleLessons.length)
      });

      course.studentsEnrolled.push(student._id);
      await course.save();
    }
    await student.save();
  }

  console.log('✅ Seeding complete!');
  console.log('-----------------------------------');
  console.log(`👩‍🏫 Teachers created: ${teachers.length}`);
  console.log(`🎓 Students created: ${students.length}`);
  console.log(`📘 Courses created: ${courses.length}`);
  console.log('-----------------------------------');
  console.log('Login credentials for testing:');
  console.log('Teacher: Teacher@123');
  console.log('Student: Student@123');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
