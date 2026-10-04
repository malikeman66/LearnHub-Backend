const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");


// GET ALL COURSES
const getCourses = async (req, res) => {

  try {

    const courses = await Course
      .find()
      .populate(
        "instructor",
        "name email"
      )
      .sort({
        createdAt: -1
      });


    res.json(courses);

  } catch (error) {

    res.status(500).json({
      message: "Could not fetch courses."
    });

  }
};


// GET SINGLE COURSE
const getCourse = async (req, res) => {

  try {

    const course = await Course
      .findById(req.params.id)
      .populate(
        "instructor",
        "name email"
      );


    if (!course) {

      return res.status(404).json({
        message: "Course not found."
      });

    }


    res.json(course);

  } catch (error) {

    res.status(400).json({
      message: "Invalid course ID."
    });

  }
};


// CREATE COURSE
const createCourse = async (req, res) => {

  try {

    const {
      title,
      description,
      category,
      price
    } = req.body;


    if (
      !title ||
      !description ||
      !category
    ) {

      return res.status(400).json({
        message:
          "Title, description and category are required."
      });

    }


    const course = await Course.create({

      title,

      description,

      category,

      price: Number(price) || 0,

      instructor: req.user._id

    });


    const populatedCourse =
      await course.populate(
        "instructor",
        "name email"
      );


    res.status(201).json(
      populatedCourse
    );

  } catch (error) {

    res.status(500).json({
      message: "Could not create course."
    });

  }
};


// UPDATE COURSE
const updateCourse = async (req, res) => {

  try {

    const course =
      await Course.findById(
        req.params.id
      );


    if (!course) {

      return res.status(404).json({
        message: "Course not found."
      });

    }


    if (
      req.user.role !== "Admin" &&
      course.instructor.toString() !==
      req.user._id.toString()
    ) {

      return res.status(403).json({
        message:
          "You can only edit your own courses."
      });

    }


    Object.assign(
      course,
      req.body
    );


    if (
      req.body.price !== undefined
    ) {

      course.price =
        Number(req.body.price) || 0;

    }


    await course.save();


    const updatedCourse =
      await course.populate(
        "instructor",
        "name email"
      );


    res.json(updatedCourse);

  } catch (error) {

    res.status(400).json({
      message: "Could not update course."
    });

  }
};


// DELETE COURSE
const deleteCourse = async (req, res) => {

  try {

    const course =
      await Course.findById(
        req.params.id
      );


    if (!course) {

      return res.status(404).json({
        message: "Course not found."
      });

    }


    if (
      req.user.role !== "Admin" &&
      course.instructor.toString() !==
      req.user._id.toString()
    ) {

      return res.status(403).json({
        message:
          "You can only delete your own courses."
      });

    }


    await Enrollment.deleteMany({
      course: course._id
    });


    await course.deleteOne();


    res.json({
      message:
        "Course deleted successfully."
    });

  } catch (error) {

    res.status(400).json({
      message: "Could not delete course."
    });

  }
};


module.exports = {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse
};