const express = require("express");
const {
	createRole,
	updateRole,
	deleteRole,
	getAllRoles,
} = require("../controllers/role.controller");
const authorizeAdmin = require("../middleware/authorizeAdmin");

const router = express.Router();

router.post("/create", createRole);
router.patch("/update/:id", authorizeAdmin, updateRole);
router.delete("/delete/:id", authorizeAdmin, deleteRole);
router.get("/list", authorizeAdmin, getAllRoles);

module.exports = router;
