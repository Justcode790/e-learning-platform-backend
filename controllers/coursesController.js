const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");

const getEnrolledStudents  = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId)
      .populate('studentsEnrolled', 'name email profilePic');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    return res.status(200).json({
      courseTitle: course.title,
      totalStudents: course.studentsEnrolled.length,
      students: course.studentsEnrolled,
    });
  } catch (error) {
    console.error('Error fetching enrolled students:', error);
    res.status(500).json({ message: 'Server error' });
  }
};





const uploadThumbnail = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    course.thumbnail = req.file.path; // Cloudinary URL
    await course.save();

    res.json({ success: true, message: 'Thumbnail uploaded', thumbnailUrl: course.thumbnail });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}


const updateThumbnail = async (req, res) => {
  try {
    const { id } = req.params;
    const { thumbnailUrl } = req.body;
    console.log("backend for thumbnail : "+thumbnailUrl);

    if (!thumbnailUrl)
      return res.status(400).json({ message: 'Thumbnail URL is required' });

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { thumbnailUrl },
      { new: true }
    );

    if (!updatedCourse)
      return res.status(404).json({ message: 'Course not found' });

    res.status(200).json({
      message: 'Thumbnail updated successfully',
      course: updatedCourse,
    });
  } catch (error) {
    console.error('Error updating thumbnail:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const uploadVideo = async (req, res) => {
  try {
    const { title, duration, description } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    course.lessons.push({
      title,
      videoUrl: req.file.path, // Cloudinary URL
      duration: duration || 0,
      description: description || ''
    });

    await course.save();

    res.json({ success: true, message: 'Lesson added', course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// async function getMyCourses(req, res) {
//   try {
//     const userId = req.user.id;
//     const userRole = req.user.role;

//     let courses = [];

//     if (userRole === 'teacher') {
//       // ✅ Get courses taught by the teacher
//       courses = await Course.find({ instructor: userId })
//         .populate('instructor', 'name email')
//         .populate()
//         .sort({ createdAt: -1 });
//     } 
//     else if (userRole === 'student') {
//       // ✅ Get student and populate enrolled courses
//       const student = await Student.findById(userId)
//         .populate({
//           path: 'enrolledCourses',
//           populate: { path: 'instructor', select: 'name email' },
//         });

//       if (!student) {
//         return res.status(404).json({ success: false, message: 'Student not found' });
//       }

//       courses = student.enrolledCourses;
//     } 
//     else {
//       return res.status(403).json({ success: false, message: 'Invalid role' });
//     }

//     res.json({ success: true, courses });
//   } catch (error) {
//     console.error('Error fetching user courses:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// }


async function getMyCourses(req, res) {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    console.log("it is coming from here: ",req.user);
    let courses = [];

    if (userRole === 'teacher') {
      // ✅ Get courses taught by the teacher with full details
      courses = await Course.find({ instructor: userId })
        .populate('instructor', 'name email')
        .populate('studentsEnrolled', 'name regNumber email')
        .populate('lessons') // assuming lessons is a ref array
        .sort({ createdAt: -1 });
        // console.log(courses);
    } 
    else if (userRole === 'student') {
      // ✅ Get student and populate enrolled courses with instructor & lessons
      const student = await Student.findById(userId)
        .populate({
          path: 'enrolledCourses',
          populate: [
            { path: 'instructor', select: 'name email' },
            { path: 'lessons' },
          ],
        });

      if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found' });
      }

      courses = student.enrolledCourses;
    } 
    else {
      return res.status(403).json({ success: false, message: 'Invalid role' });
    }

    res.json({ success: true, courses });
  } catch (error) {
    console.error('Error fetching user courses:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}



async function enrollToCourse(req, res){
  console.log(req.params);
  const { userId, id } = req.params;
  console.log("🟢 Enrolling user:", userId, "to course:", id);
  try {
    const course = await Course.findById(id);
    const student = await Student.findById(userId);

    if (!course || !student) {
      return res.status(404).json({ success: false, message: 'Course or student not found.' });
    }

    if (course.studentsEnrolled.includes(student._id)) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this course.' });
    }

    course.studentsEnrolled.push(student._id);
    student.enrolledCourses.push(course._id);
    student.progress.push({ courseId: course._id, completedLessons: 0 });

    await Promise.all([course.save(), student.save()]);

    res.json({ success: true, message: 'Enrolled successfully!' });
  } catch (error) {
    console.error('Enroll error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
}




async function listCourses(req, res, next) {
  try {
    const { search, category, price } = req.query;
    const limit = parseInt(req.query.limit) || 0; // 0 = no limit

    const filter = {};
    if (category) {
      filter.category = category;
    }

    if (price === 'free') {
      filter.price = { $lte: 0 };
    } else if (price === 'paid') {
      filter.price = { $gt: 0 };
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { /* instructor name via lookup handled by populate match later */ },
      ];
    }

    let query = Course.find(filter)
      .populate({ path: 'instructor', select: 'name' })
      .select('title category price description instructor thumbnailUrl');

    if (limit > 0) query = query.limit(limit);

    let courses = await query.lean();

    // If searching by instructor name, filter results after populate
    if (search) {
      const regex = new RegExp(search, 'i');
      courses = courses.filter(c => regex.test(c.title) || (c.instructor && regex.test(c.instructor.name)));
    }

    res.json(courses);
  } catch (err) {
    next(err);
  }
}

// 69035bfa095277c7c76a809e

async function getCourseById(req, res, next) {
  try {
    const course = await Course.findById(req.params.id)
      .populate({ path: 'instructor', select: 'name' })
      .populate({
        path: 'lessons',
        select: 'title description duration videoUrl createdAt updatedAt',
      })
      .populate({
        path: 'feedback',
        populate: { path: 'studentId', select: 'name' },
        select: 'rating comment date',
      });

    if (!course) return res.status(404).json({ message: 'Course not found' });

    res.json(course);
  } catch (err) {
    console.error('❌ Error fetching course:', err);
    next(err);
  }
}

async function createCourse(req, res, next) {
  try {
    const { title, description, category, price, thumbnailUrl, lessons } = req.body;
    const instructor = req.user.id; // teacher ID from token

    console.log("📥 Incoming course data:", req.body);
    console.log("👤 Authenticated user:", req.user);

    if (!title || !thumbnailUrl) {
      return res.status(400).json({ success: false, message: "Title and thumbnail are required" });
    }

    // ✅ Step 1 — Create course without lessons first
    const course = await Course.create({
      title,
      description,
      category,
      price,
      thumbnailUrl,
      instructor,
      lessons: [],
    });

    // ✅ Step 2 — Create lesson documents for this course
    if (Array.isArray(lessons) && lessons.length > 0) {
      const lessonDocs = await Lesson.insertMany(
        lessons.map((lesson) => ({
          title: lesson.title,
          description: lesson.description || '',
          duration: lesson.duration || 0,
          videoUrl: lesson.videoUrl,
          course: course._id,
        }))
      );

      // ✅ Step 3 — Save their ObjectIds into the course
      course.lessons = lessonDocs.map((l) => l._id);
      await course.save();
    }

    // ✅ Step 4 — Link this course to teacher’s profile
    await Teacher.findByIdAndUpdate(instructor, {
      $addToSet: { courses: course._id },
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course,
    });
  } catch (error) {
    console.error('❌ Error creating course:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while creating course',
    });
  }
}


async function updateLesson(req, res) {
  const { courseId, lessonId } = req.params;
  const updates = req.body;
  const course = await Course.findById(courseId);
  if (!course) return res.status(404).json({ message: 'Course not found' });

  const lesson = course.lessons.id(lessonId);
  if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

  Object.assign(lesson, updates);
  await course.save();
  res.json({ success: true, lesson });
}

async function deleteLesson(req, res) {
  try {
    const { courseId, lessonId } = req.params;

    // 1️⃣ Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // 2️⃣ Remove lesson reference from course.lessons array
    course.lessons = course.lessons.filter(
      (id) => id.toString() !== lessonId
    );
    await course.save();

    // 3️⃣ Delete the actual lesson document
    const deletedLesson = await Lesson.findByIdAndDelete(lessonId);
    if (!deletedLesson) {
      return res.status(404).json({ message: 'Lesson not found in Lesson collection' });
    }

    res.json({
      success: true,
      message: 'Lesson deleted successfully',
      deletedLessonId: lessonId
    });
  } catch (error) {
    console.error('❌ Error deleting lesson:', error);
    res.status(500).json({ message: 'Server error while deleting lesson' });
  }
}



async function updateCourse(req, res, next) {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.instructor.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    const { title, description, category, price } = req.body;
    course.title = title ?? course.title;
    course.description = description ?? course.description;
    course.category = category ?? course.category;
    course.price = price ?? course.price;
    await course.save();
    res.json(course);
  } catch (err) {
    next(err);
  }
}

async function deleteCourse(req, res, next) {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.instructor.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    await course.deleteOne();
    res.json({ message: 'Course deleted' });
  } catch (err) {
    next(err);
  }
}

// Recommend up to 5 courses not yet enrolled by the student, based on categories of enrolled courses
async function getRecommendedCourses(req, res) {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId).select('enrolledCourses');
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const enrolledCourses = await Course.find({ _id: { $in: student.enrolledCourses } }).select('category');
    const categories = [...new Set(enrolledCourses.map(c => c.category).filter(Boolean))];

    const baseFilter = { _id: { $nin: student.enrolledCourses } };

    let recommended = [];
    if (categories.length > 0) {
      recommended = await Course.find({ ...baseFilter, category: { $in: categories } })
        .populate({ path: 'instructor', select: 'name' })
        .select('title category price description instructor thumbnailUrl')
        .limit(5);
    }

    if (recommended.length < 1) {
      // fallback: random courses not enrolled
      recommended = await Course.aggregate([
        { $match: { _id: { $nin: student.enrolledCourses.map(id => id instanceof require('mongoose').Types.ObjectId ? id : require('mongoose').Types.ObjectId(id)) } } },
        { $sample: { size: 5 } },
        { $project: { title: 1, category: 1, price: 1, description: 1, instructor: 1, thumbnailUrl: 1 } }
      ]);
      // populate instructor names for aggregate fallback
      const ids = recommended.map(r => r.instructor);
      const teachers = await Teacher.find({ _id: { $in: ids } }).select('name');
      const map = new Map(teachers.map(t => [String(t._id), { _id: t._id, name: t.name }]));
      recommended = recommended.map(r => ({ ...r, instructor: map.get(String(r.instructor)) || null }));
    }

    res.json({ success: true, courses: recommended });
  } catch (error) {
    console.error('Error fetching recommended courses:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// async function addLesson(req, res, next) {
//   try {
//     const course = await Course.findById(req.params.id);
//     if (!course) return res.status(404).json({ message: 'Course not found' });
//     if (course.instructor.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
//     const { title, videoUrl, duration, description } = req.body;
//     if (!title) return res.status(400).json({ message: 'Lesson title is required' });
//     course.lessons.push({ title, videoUrl, duration, description });
//     await course.save();
//     res.status(201).json(course);
//   } catch (err) {
//     next(err);
//   }
// }


async function addLesson(req, res, next) {
  try {
    const { id } = req.params;
    const { title, videoUrl, duration, description } = req.body;

    // 1️⃣ Find the course
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // 2️⃣ Permission check
    if (course.instructor.toString() !== req.user.id)
      return res.status(403).json({ message: 'Forbidden' });

    // 3️⃣ Validate
    if (!title) return res.status(400).json({ message: 'Lesson title is required' });

    // 4️⃣ Create lesson in Lesson collection
    const newLesson = await Lesson.create({
      title,
      videoUrl,
      duration,
      description,
      course: course._id,
    });

    // 5️⃣ Push the ObjectId reference to course.lessons
    course.lessons.push(newLesson._id);
    await course.save();

    // 6️⃣ Return success response
    res.status(201).json({
      message: 'Lesson added successfully',
      lesson: newLesson,
    });
  } catch (err) {
    console.error('❌ Error adding lesson:', err);
    next(err);
  }
}



async function addFeedback(req, res, next) {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const { rating, comment } = req.body;
    if (!rating) return res.status(400).json({ message: 'Rating is required' });
    course.feedback.push({ studentId: req.user.id, rating, comment });
    await course.save();
    res.status(201).json({ message: 'Feedback added' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listCourses, getCourseById, createCourse, updateCourse, deleteCourse, addLesson, addFeedback,enrollToCourse,
  getMyCourses,uploadThumbnail ,
  uploadVideo,updateLesson, 
  deleteLesson,updateThumbnail,
  getEnrolledStudents,
  getRecommendedCourses

};