const Lesson = require("../models/Lesson");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

const createLesson = async (req, res) => {
  try {
    const {
      title,
      content,
      section,
      videoUrl,
      courseId
    } = req.body;

    if (!title || !content || !courseId) {
      return res.status(400).json({
        message: "Title, content and course are required."
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        message: "Course not found."
      });
    }

    if (
      req.user.role !== "Admin" &&
      course.instructor.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "You can only add lessons to your own courses."
      });
    }

    const lesson = await Lesson.create({
      title,
      content,
      section: section?.trim(),
      videoUrl,
      course: courseId,
      instructor: req.user._id
    });

    res.status(201).json({
      message: "Lesson created successfully.",
      lesson
    });

  } catch (error) {
    res.status(500).json({
      message: "Unable to create lesson.",
      error: error.message
    });
  }
};

const getCourseLessons = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({
        message: "Course not found."
      });
    }

    if (req.user.role === "Student") {
      const enrollment = await Enrollment.exists({
        student: req.user._id,
        course: course._id
      });

      if (!enrollment) {
        return res.status(403).json({
          message: "Enroll for free to access this course's lessons."
        });
      }
    } else if (
      req.user.role === "Instructor" &&
      course.instructor.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "You do not have access to this course's lessons."
      });
    } else if (! ["Student", "Instructor", "Admin"].includes(req.user.role)) {
      return res.status(403).json({
        message: "You are not authorized to view these lessons."
      });
    }

    const lessons = await Lesson.find({
      course: course._id
    })
      .populate("instructor", "name email")
      .sort({ createdAt: 1 });

    res.json(lessons);

  } catch (error) {
    res.status(500).json({
      message: "Unable to load lessons.",
      error: error.message
    });
  }
};

const updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        message: "Lesson not found."
      });
    }

    if (! ["Admin", "Instructor"].includes(req.user.role)) {
      return res.status(403).json({
        message: "You are not authorized to edit lessons."
      });
    }

    if (
      req.user.role === "Instructor" &&
      lesson.instructor.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "You cannot edit this lesson."
      });
    }

    const updates = {};
    const editableFields = ["title", "content", "videoUrl"];

    for (const field of editableFields) {
      if (req.body?.[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "Provide at least one editable lesson field."
      });
    }

    Object.assign(lesson, updates);
    const updatedLesson = await lesson.save();

    res.json({
      message: "Lesson updated successfully.",
      lesson: updatedLesson
    });

  } catch (error) {
    res.status(500).json({
      message: "Unable to update lesson.",
      error: error.message
    });
  }
};

const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        message: "Lesson not found."
      });
    }

    if (
      req.user.role !== "Admin" &&
      lesson.instructor.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "You cannot delete this lesson."
      });
    }

    await Lesson.findByIdAndDelete(req.params.id);

    res.json({
      message: "Lesson deleted successfully."
    });

  } catch (error) {
    res.status(500).json({
      message: "Unable to delete lesson.",
      error: error.message
    });
  }
};

module.exports = {
  createLesson,
  getCourseLessons,
  updateLesson,
  deleteLesson
};