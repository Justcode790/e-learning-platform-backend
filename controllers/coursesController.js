const Course = require('../models/Course');



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


async function getCourseOfTeacher(req,res){
  try {
    const teacherId = req.user.id; // comes from JWT payload

    const courses = await Course.find({ instructor: teacherId })
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 });

    res.json(courses);
  } catch (error) {
    console.error('Error fetching teacher courses:', error);
    res.status(500).json({ message: 'Server error' });
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
    // const { category, search, teacherId } = req.query;
    // const filter = {};
    // if (category) filter.category = category;
    // if (teacherId) filter.instructor = teacherId;
    // if (search) filter.title = { $regex: search, $options: 'i' };
     const limit = parseInt(req.query.limit) || 0; // 0 = no limit
    const courses = await Course.find({})
      .populate({ path: 'instructor', select: 'name' })
      .select('title category price description instructor thumbnailUrl').limit(limit);
      // console.log(courses);
    res.json(courses);
  } catch (err) {
    next(err);
  }
}

// 69035bfa095277c7c76a809e

async function getCourseById(req, res, next) {
  // console.log('➡️ getCourseById called with:', req.params.id); 
  try {
    const course = await Course.findById(req.params.id).populate({ path: 'instructor', select: 'name' });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    next(err);
  }
}

async function createCourse(req, res, next) {
  try {
    const { title, description, category, price } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });
    const course = await Course.create({
      title,
      description,
      category,
      price,
      instructor: req.user.id,
      lessons: []
    });
    res.status(201).json(course);
  } catch (err) {
    next(err);
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

async function addLesson(req, res, next) {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.instructor.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    const { title, videoUrl, duration, description } = req.body;
    if (!title) return res.status(400).json({ message: 'Lesson title is required' });
    course.lessons.push({ title, videoUrl, duration, description });
    await course.save();
    res.status(201).json(course);
  } catch (err) {
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

module.exports = { listCourses, getCourseById, createCourse, updateCourse, deleteCourse, addLesson, addFeedback,enrollToCourse,getCourseOfTeacher,uploadThumbnail ,uploadVideo};