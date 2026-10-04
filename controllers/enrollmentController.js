const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const Lesson = require("../models/Lesson");
const mongoose = require("mongoose");


// ENROLL
const enroll = async (req, res) => {

  try {

    const {
      courseId
    } = req.body;


    if (!courseId) {

      return res.status(400).json({
        message: "courseId is required."
      });

    }


    const course =
      await Course.findById(
        courseId
      );


    if (!course) {

      return res.status(404).json({
        message: "Course not found."
      });

    }


    const existing =
      await Enrollment.findOne({

        student: req.user._id,

        course: courseId

      });


    if (existing) {

      return res.status(409).json({
        message:
          "You are already enrolled in this course."
      });

    }


    const enrollment =
      await Enrollment.create({

        student: req.user._id,

        course: courseId,

        progress: 0

      });


    const result =
      await enrollment.populate(
        "course",
        "title description category price"
      );


    res.status(201).json({

      message:
        "Enrollment successful.",

      enrollment: result

    });

  } catch (error) {

    res.status(500).json({

      message: "Enrollment failed.",

      error: error.message

    });

  }
};


// MY COURSES
const myCourses = async (req, res) => {

  try {

    const enrollments =
      await Enrollment
        .find({
          student: req.user._id
        })
        .populate(
          "course",
          "title description category price instructor"
        )
        .sort({
          createdAt: -1
        });


    const enrollmentsWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        const courseId = enrollment.course?._id;

        if (!courseId) {
          return {
            ...enrollment.toObject(),
            progress: 0,
            completedLessonCount: 0,
            totalLessonCount: 0
          };
        }

        const completedLessonIds = enrollment.completedLessons || [];
        const [totalLessonCount, completedLessonCount] = await Promise.all([
          Lesson.countDocuments({ course: courseId }),
          Lesson.countDocuments({
            course: courseId,
            _id: { $in: completedLessonIds }
          })
        ]);

        const progress = totalLessonCount
          ? Math.round((completedLessonCount / totalLessonCount) * 100)
          : 0;

        return {
          ...enrollment.toObject(),
          progress,
          completedLessonCount,
          totalLessonCount
        };
      })
    );

    res.json(enrollmentsWithProgress);

  } catch (error) {

    res.status(500).json({

      message:
        "Could not fetch your courses."

    });

  }
};


// UPDATE PROGRESS
const updateProgress = async (
  req,
  res
) => {
  try {
    const { lessonId, completed } = req.body;

    if (
      !lessonId ||
      !mongoose.isValidObjectId(lessonId) ||
      typeof completed !== "boolean"
    ) {
      return res.status(400).json({
        message: "A valid lessonId and completed status are required."
      });
    }

    const enrollment = await Enrollment.findOne({
      _id: req.params.id,
      student: req.user._id
    });

    if (!enrollment) {
      return res.status(404).json({
        message: "Enrollment not found."
      });
    }

    const lesson = await Lesson.findOne({
      _id: lessonId,
      course: enrollment.course
    });

    if (!lesson) {
      return res.status(404).json({
        message: "Lesson not found in this course."
      });
    }

    const completedLessonIds = new Set(
      (enrollment.completedLessons || []).map((id) => id.toString())
    );

    if (completed) {
      completedLessonIds.add(lesson._id.toString());
    } else {
      completedLessonIds.delete(lesson._id.toString());
    }

    enrollment.completedLessons = [...completedLessonIds];

    const totalLessonCount = await Lesson.countDocuments({
      course: enrollment.course
    });
    const completedLessonCount = await Lesson.countDocuments({
      course: enrollment.course,
      _id: { $in: enrollment.completedLessons }
    });

    enrollment.progress = totalLessonCount
      ? Math.round((completedLessonCount / totalLessonCount) * 100)
      : 0;

    await enrollment.save();
    await enrollment.populate("course", "title description category price");

    res.json(enrollment);
  } catch (error) {
    res.status(400).json({
      message: "Could not update progress."
    });
  }
};


module.exports = {
  enroll,
  myCourses,
  updateProgress
};