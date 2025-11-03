const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Course = require('./models/Course');
const Lesson = require('./models/Lesson');
const Feedback = require('./models/Feedback');
const Student = require('./models/Student'); // ✅ Added this import

dotenv.config();

const teacherId = '69071e8b89ec3555447683cb';
const studentId = '69071745288ccc359fa8dff9';

const mainThumbnail = 'https://res.cloudinary.com/debc5aznw/image/upload/v1762032868/learnify-media/jpmbtcjw3w4z5otrssay.png';
const defaultThumbnail = 'https://res.cloudinary.com/debc5aznw/image/upload/v1761926651/React_Foundamental_ersrpd.png';
const sampleVideo = 'https://res.cloudinary.com/debc5aznw/video/upload/v1762067609/Late_Night_Study_Course_Video_Creation_lpltbu.mp4';

async function seed() {
  try {
    await connectDB();

    console.log('🧹 Clearing old data...');
    await Promise.all([
      Course.deleteMany({}),
      Lesson.deleteMany({}),
      Feedback.deleteMany({})
    ]);

    const courseTitles = [
      'Mastering React.js Fundamentals',
      'Node.js for Beginners',
      'Express.js Complete Guide'
    ];

    const courses = [];

    console.log('📚 Creating sample courses...');

    for (let i = 0; i < courseTitles.length; i++) {
      const isSpecial = i === 0;

      // Step 1️⃣ Create Course
      const course = await Course.create({
        title: courseTitles[i],
        description: `Learn ${courseTitles[i]} step-by-step with real examples.`,
        category: 'Education',
        thumbnailUrl: isSpecial ? mainThumbnail : defaultThumbnail,
        price: 999,
        instructor: teacherId,
        studentsEnrolled: [studentId],
        lessons: [],
        feedback: []
      });

      // Step 2️⃣ Create Lessons linked to this Course
      const lessonsData = [
        {
          title: 'Introduction',
          videoUrl: sampleVideo,
          duration: 10,
          description: 'Overview and course roadmap.',
          course: course._id
        },
        {
          title: 'Core Concepts',
          videoUrl: sampleVideo,
          duration: 15,
          description: 'Deep dive into main topics.',
          course: course._id
        },
        {
          title: 'Practical Example',
          videoUrl: sampleVideo,
          duration: 20,
          description: 'Hands-on coding demo.',
          course: course._id
        }
      ];

      const createdLessons = await Lesson.insertMany(lessonsData);

      // Step 3️⃣ Create Feedback linked to this Course
      const feedbackData = [
        {
          studentId,
          courseId: course._id,
          rating: 5,
          comment: 'Fantastic course! Explained very clearly.',
          date: new Date()
        }
      ];

      const createdFeedback = await Feedback.insertMany(feedbackData);

      // Step 4️⃣ Link Lessons and Feedback IDs in Course
      course.lessons = createdLessons.map(l => l._id);
      course.feedback = createdFeedback.map(f => f._id);
      await course.save();

      // ✅ Step 5️⃣ Add Course reference in Student document
      await Student.findByIdAndUpdate(
        studentId,
        { $addToSet: { enrolledCourses: course._id } } // prevents duplicates
      );

      courses.push(course);
    }

    console.log('✅ Seeding complete!');
    console.log('-----------------------------------');
    console.log(`📘 Courses created: ${courses.length}`);
    console.log(`👩‍🏫 Teacher used: ${teacherId}`);
    console.log(`🎓 Student used: ${studentId}`);
    console.log('-----------------------------------');

    mongoose.connection.close();
  } catch (err) {
    console.error('❌ Error during seeding:', err);
    mongoose.connection.close();
  }
}

seed();
