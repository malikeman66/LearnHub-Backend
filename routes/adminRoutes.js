const express = require("express");

const router = express.Router();

const {
  getAnalytics,
  getUsers,
  updateUserRole,
  deleteUser
} = require("../controllers/adminController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get(
  "/analytics",
  authMiddleware,
  roleMiddleware("Admin"),
  getAnalytics
);

router.get(
  "/users",
  authMiddleware,
  roleMiddleware("Admin"),
  getUsers
);

router.put(
  "/users/:id/role",
  authMiddleware,
  roleMiddleware("Admin"),
  updateUserRole
);

router.delete(
  "/users/:id",
  authMiddleware,
  roleMiddleware("Admin"),
  deleteUser
);

module.exports = router;