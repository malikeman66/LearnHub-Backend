const express = require("express");

const protect =
  require("../middleware/authMiddleware");

const authorize =
  require("../middleware/roleMiddleware");

const {
  enroll,
  myCourses,
  updateProgress
} = require("../controllers/enrollmentController");


const router =
  express.Router();


router.post(
  "/enroll",
  protect,
  authorize("Student"),
  enroll
);


router.get(
  "/my-courses",
  protect,
  authorize("Student"),
  myCourses
);


router.put(
  "/enrollments/:id/progress",
  protect,
  authorize("Student"),
  updateProgress
);


module.exports = router;