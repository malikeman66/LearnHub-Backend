const Course = require("../models/Course");
const User = require("../models/User");

const getPublicStats = async (req, res) => {
  try {
    const [courses, instructors, students] = await Promise.all([
      Course.countDocuments(),
      User.countDocuments({ role: "Instructor" }),
      User.countDocuments({ role: "Student" })
    ]);

    res.json({
      courses,
      instructors,
      students
    });
  } catch (error) {
    console.error("Unable to load public statistics:", error.message);
    res.status(500).json({
      message: "Unable to load public statistics."
    });
  }
};

module.exports = {
  getPublicStats
};