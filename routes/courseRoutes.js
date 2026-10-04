const express = require("express");

const protect =
  require("../middleware/authMiddleware");

const authorize =
  require("../middleware/roleMiddleware");

const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse
} = require("../controllers/courseController");


const router =
  express.Router();


router.get(
  "/",
  getCourses
);


router.get(
  "/:id",
  getCourse
);


router.post(
  "/",
  protect,
  authorize(
    "Admin",
    "Instructor"
  ),
  createCourse
);


router.put(
  "/:id",
  protect,
  authorize(
    "Admin",
    "Instructor"
  ),
  updateCourse
);


router.delete(
  "/:id",
  protect,
  authorize(
    "Admin",
    "Instructor"
  ),
  deleteCourse
);


module.exports = router;