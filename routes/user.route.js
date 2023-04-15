const express = require("express");
const {
  getAllUsers,
  updateUser,
  updatePassword,
  createAdmin,
  getUserDetailsByUsername,
  getUserDetailsByUserId,
  getAllOrganizations,
  updateUsername,
  updateEmail,
  getAllStudentsByTeacherId,
  verifyEmail,
  updateUsernameByAdmin,
  getAllStudents,
  getAllTeachers,
} = require("../controllers/user.controller");
const authorizeAdmin = require("../middleware/authorizeAdmin");
const authorizeVerifiedUser = require("../middleware/authorizeVerifiedUser");

const router = express.Router();

// user routes
router.get("/list", authorizeAdmin, getAllUsers);
router.get("/list/teacher", authorizeAdmin, getAllTeachers);
router.get("/list/student", authorizeAdmin, getAllStudents);
router.get(
  "/username/:username",
  authorizeVerifiedUser,
  getUserDetailsByUsername
);
router.get("/userId/:userId", getUserDetailsByUserId);

router.patch("/update_user", authorizeVerifiedUser, updateUser);
router.patch("/update_username", authorizeVerifiedUser, updateUsername);
router.patch(
  "/update_username_by_admin",
  authorizeAdmin,
  updateUsernameByAdmin
);
router.post("/verify_email", authorizeVerifiedUser, verifyEmail);
router.patch("/update_email", authorizeVerifiedUser, updateEmail);
router.patch("/update_password", authorizeVerifiedUser, updatePassword);
router.post("/create_admin", createAdmin);

// organization routes
router.get("/list_organizations", authorizeAdmin, getAllOrganizations);

module.exports = router;
