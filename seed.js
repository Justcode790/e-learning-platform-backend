const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Course = require('./models/Course');
const Lesson = require('./models/Lesson');

dotenv.config();
console.log(process.env.MONGO_URI);

const teacherId = '69071bb0a4cd58e007deec11';
const studentId = '69071b94a4cd58e007deec0a';

const mainThumbnail = 'https://res.cloudinary.com/debc5aznw/image/upload/v1762032868/learnify-media/jpmbtcjw3w4z5otrssay.png';
const defaultThumbnail = 'https://res.cloudinary.com/debc5aznw/image/upload/v1761926651/React_Foundamental_ersrpd.png';
const sampleVideo = 'https://res.cloudinary.com/debc5aznw/video/upload/v1762067609/Late_Night_Study_Course_Video_Creation_lpltbu.mp4';

async function seed() {
  await connectDB();

  console.log('🧹 Clearing old courses and lessons...');
  await Promise.all([
    Course.deleteMany({}),
    Lesson.deleteMany({})
  ]);

  const courseTitles = [
    'Mastering React.js Fundamentals',
    'Node.js for Beginners',
    'Express.js Complete Guide',
    'MongoDB from Scratch',
    'Python Programming Essentials',
    'Frontend with HTML & CSS',
    'Advanced JavaScript',
    'MERN Stack Crash Course',
    'Data Structures and Algorithms',
    'Machine Learning Basics',
    'Cybersecurity for Beginners',
    'Web Performance Optimization',
    'API Development with Express',
    'Fullstack Project Bootcamp',
    'Modern ES6+ JavaScript'
  ];

  const courses = [];

  console.log('📚 Creating sample courses...');

  for (let i = 0; i < courseTitles.length; i++) {
    const isSpecial = i === 0; // First course uses special thumbnail and video

    const lessons = [
      {
        title: 'Introduction',
        videoUrl: sampleVideo,
        duration: 10,
        description: 'Overview and course roadmap.'
      },
      {
        title: 'Core Concepts',
        videoUrl: sampleVideo,
        duration: 15,
        description: 'Deep dive into main topics.'
      },
      {
        title: 'Practical Example',
        videoUrl: sampleVideo,
        duration: 20,
        description: 'Hands-on coding demo.'
      }
    ];

    const feedback = [
      {
        studentId,
        rating: 5,
        comment: 'Fantastic course! Explained very clearly.',
        date: new Date()
      }
    ];

    const courseData = {
      title: courseTitles[i],
      description: `Learn ${courseTitles[i]} step-by-step with real examples.`,
      category: 'Education',
      thumbnailUrl: isSpecial ? mainThumbnail : defaultThumbnail,
      price: 999,
      instructor: teacherId,
      lessons,
      studentsEnrolled: [studentId],
      feedback
    };

    const createdCourse = await Course.create(courseData);
    courses.push(createdCourse);

    // Add lessons to Lesson collection separately
    const courseLessons = lessons.map((lesson) => ({
      ...lesson,
      course: createdCourse._id
    }));

    await Lesson.insertMany(courseLessons);
  }

  console.log('✅ Seeding complete!');
  console.log('-----------------------------------');
  console.log(`📘 Courses created: ${courses.length}`);
  console.log(`👩‍🏫 Teacher used: ${teacherId}`);
  console.log(`🎓 Student used: ${studentId}`);
  console.log('-----------------------------------');
  mongoose.connection.close();
}

seed().catch((err) => {
  console.error('❌ Error seeding data:', err);
  mongoose.connection.close();
});


// const dotenv = require('dotenv');
// const connectDB = require('./config/db');
// const Course = require('./models/Course');
// const Student = require('./models/Student');
// const Teacher = require('./models/Teacher');

// dotenv.config();

// const studentId = '69071b94a4cd58e007deec0a';
// const courseId = '69071c0e48064617a1de5b36';
// const teacherId = '69071bb0a4cd58e007deec11';

// async function enrollStudentInCourse() {
//   await connectDB();

//   try {
//     console.log('🔍 Checking existing records...');

//     const student = await Student.findById(studentId);
//     const course = await Course.findById(courseId);
//     const teacher = await Teacher.findById(teacherId);

//     if (!student) throw new Error('❌ Student not found');
//     if (!course) throw new Error('❌ Course not found');
//     if (!teacher) throw new Error('❌ Teacher not found');

//     console.log(`👩‍🎓 Enrolling ${student.name} in ${course.title}`);

//     // 1️⃣ Add course to student's enrolledCourses and progress
//     if (!student.enrolledCourses.includes(courseId)) {
//       student.enrolledCourses.push(courseId);
//       student.progress.push({ courseId, completedLessons: 0 });
//       await student.save();
//       console.log('✅ Student updated');
//     } else {
//       console.log('⚠️ Student already enrolled in this course');
//     }

//     // 2️⃣ Add student to course's studentsEnrolled
//     if (!course.studentsEnrolled.includes(studentId)) {
//       course.studentsEnrolled.push(studentId);
//       await course.save();
//       console.log('✅ Course updated');
//     } else {
//       console.log('⚠️ Course already has this student enrolled');
//     }

//     // 3️⃣ Ensure teacher has this course in their list
//     if (!teacher.courses.includes(courseId)) {
//       teacher.courses.push(courseId);
//       await teacher.save();
//       console.log('✅ Teacher updated');
//     }

//     console.log('🎉 Enrollment successful!');
//   } catch (err) {
//     console.error('❌ Error enrolling student:', err.message);
//   } finally {
//     process.exit(0);
//   }
// }

// enrollStudentInCourse();
