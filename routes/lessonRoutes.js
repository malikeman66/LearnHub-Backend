const express = require("express");

const router = express.Router();

const {
  createLesson,
  getCourseLessons,
  updateLesson,
  deleteLesson
} = require("../controllers/lessonController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get(
  "/course/:courseId",
  authMiddleware,
  getCourseLessons
);

router.post(
  "/",
  authMiddleware,
  roleMiddleware("Instructor", "Admin"),
  createLesson
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("Instructor", "Admin"),
  updateLesson
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("Instructor", "Admin"),
  deleteLesson
);

module.exports = router;