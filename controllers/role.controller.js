const RoleService = require("../services/role.service");

module.exports = {
	createRole: (req, res) => {
		RoleService.createRole(req.body)
			.then((response) => {
				return res.status(200).json({
					data: response,
					message: "Role created successfully",
				});
			})
			.catch((err) => {
				res.status(500).json({
					message: "Error creating role",
					error: err.message,
				});
			});
	},
	updateRole: (req, res) => {
		RoleService.updateRole(req.params, req.body)
			.then((response) => {
				return res.status(200).json({
					data: response,
					message: "Role updated successfully",
				});
			})
			.catch((err) => {
				res.status(500).json({
					message: "Error updating role",
					error: err.message,
				});
			});
	},
	deleteRole: (req, res) => {
		RoleService.deleteRole(req.params)
			.then((response) => {
				return res.status(200).json({
					data: response,
					message: "Role deleted successfully",
				});
			})
			.catch((err) => {
				res.status(500).json({
					message: "Error deleting role",
					error: err.message,
				});
			});
	},
	getAllRoles: (req, res) => {
		RoleService.getAllRoles()
			.then((response) => {
				return res.status(200).json({
					data: response,
					message: "Roles fetched successfully",
				});
			})
			.catch((err) => {
				res.status(500).json({
					message: "Error getting roles",
					error: err.message,
				});
			});
	},
};
