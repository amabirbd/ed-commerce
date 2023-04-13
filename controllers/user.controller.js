const UserService = require("../services/user.service");

module.exports = {
	getAllUsers: (req, res) => {
		UserService.getAllUsers()
			.then((response) => {
				return res.status(200).json({
					data: response,
				});
			})
			.catch((err) => {
				res.status(500).json({
					message: "Error fetching information",
					error: err.message,
				});
			});
	},
	getAllTeachers: (req, res) => {
		UserService.getAllTeachers()
			.then((response) => {
				return res.status(200).json({
					data: response,
				});
			})
			.catch((err) => {
				res.status(500).json({
					message: "Error fetching information",
					error: err.message,
				});
			});
	},
	getAllStudents: (req, res) => {
		UserService.getAllStudents()
			.then((response) => {
				return res.status(200).json({
					data: response,
				});
			})
			.catch((err) => {
				res.status(500).json({
					message: "Error fetching information",
					error: err.message,
				});
			});
	},
	getUserDetailsByUsername: (req, res) => {
		UserService.getUserDetailsByUsername(req.params, res.locals.id)
			.then((response) => {
				return res.status(200).json({
					data: response,
				});
			})
			.catch((err) => {
				res.status(500).json({
					message: "Error fetching user",
					error: err.message,
				});
			});
	},
	getUserDetailsByUserId: (req, res) => {
		UserService.getUserDetailsByUserId(req.params, res.locals.id)
			.then((response) => {
				return res.status(200).json({
					data: response,
				});
			})
			.catch((err) => {
				res.status(500).json({
					message: "Error fetching user",
					error: err.message,
				});
			});
	},
	getAllStudentsByTeacherId: (req, res) => {
		UserService.getAllStudentsByTeacherId(req.params, res.locals.id)
			.then((user) => {
				return res.status(200).json({
					data: user,
				});
			})
			.catch((err) => {
				res.status(500).json({
					message: "Error fetching user",
					error: err.message,
				});
			});
	},
	updateUser: (req, res) => {
		UserService.updateUser(req.body, res.locals.id)
			.then((response) => {
				return res.status(200).json({
					data: response,
					message: "User updated successfully",
				});
			})
			.catch((err) => {
				res.status(500).json({
					message: "Error updating user",
					error: err.message,
				});
			});
	},
	updateUsername: (req, res) => {
		UserService.updateUsername(req.body, res.locals.id)
			.then((response) => {
				return res.status(200).json({
					data: response,
					message: "Username updated successfully",
				});
			})
			.catch((err) => {
				res.status(500).json({
					message: "Error updating user",
					error: err.message,
				});
			});
	},
	updateUsernameByAdmin: (req, res) => {
		UserService.updateUsernameByAdmin(req.body, res.locals.id)
			.then((response) => {
				return res.status(200).json({
					data: response,
					message: "Username updated successfully",
				});
			})
			.catch((err) => {
				res.status(500).json({
					message: "Error updating user",
					error: err.message,
				});
			});
	},
	updateProfilePicture: (req, res) => {
		UserService.updateProfilePicture(req.files, res.locals.id)
			.then((response) => {
				return res.status(200).json({
					data: response,
					message: "Username updated successfully",
				});
			})
			.catch((err) => {
				res.status(500).json({
					message: "Error updating user",
					error: err.message,
				});
			});
	},
	verifyEmail: (req, res) => {
		UserService.verifyEmail(req.body, res.locals.id)
			.then((response) => {
				return res.status(200).json({
					message: "Verification email sent",
				});
			})
			.catch((err) => {
				res.status(500).json({
					message: "Error updating user",
					error: err.message,
				});
			});
	},
	updateEmail: (req, res) => {
		UserService.updateEmail(req.body, res.locals.id)
			.then((response) => {
				return res.status(200).json({
					data: response,
					message: "Email updated successfully",
				});
			})
			.catch((err) => {
				res.status(500).json({
					message: "Error updating user",
					error: err.message,
				});
			});
	},
	updatePassword: (req, res) => {
		UserService.updatePassword(req.body, res.locals.id)
			.then((response) => {
				return res.status(200).json({
					message: "Password updated successfully",
				});
			})
			.catch((err) => {
				res.status(500).json({
					message: "Error updating user",
					error: err.message,
				});
			});
	},
	createAdmin: (req, res) => {
		UserService.createAdmin(req.body)
			.then((response) => {
				return res.status(200).json({
					data: response,
					message: "Admin created successfully",
				});
			})
			.catch((err) => {
				res.status(500).json({
					message: "Error creating admin",
					error: err.message,
				});
			});
	},
	// Organization
	getAllOrganizations: (req, res) => {
		UserService.getAllOrganizations()
			.then((response) => {
				return res.status(200).json({
					data: response,
					message: "Organizations fetched successfully",
				});
			})
			.catch((err) => {
				res.status(500).json({
					message: "Error fetching organizations",
					error: err.message,
				});
			});
	},
};
