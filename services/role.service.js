const { v4: uuidv4 } = require("uuid");
const Role = require("../models/role.model");

exports.createRole = async function (data) {
	try {
		console.log("data", data);

		const {
			role_name,
			is_student,
			is_teacher,
			is_guardian,
			is_admin,
			is_superadmin,
			secret_code,
		} = data;

		if (role_name == null || role_name == "") {
			throw new Error("Role Name is required");
		}
		if (is_student == null || is_student == undefined) {
			throw new Error("Student value is required");
		}
		if (is_teacher == null || is_teacher == undefined) {
			throw new Error("Teacher value is required");
		}
		if (is_guardian == null || is_guardian == undefined) {
			throw new Error("Guardian value is required");
		}
		if (is_admin == null || is_admin == undefined) {
			throw new Error("Admin value is required");
		}
		if (is_superadmin == null || is_superadmin == undefined) {
			throw new Error("Superadmin value is required");
		}
		if (secret_code == null || secret_code == "") {
			throw new Error("Secret Code is required");
		}
		if (secret_code != process.env.SECRET_KEY) {
			throw new Error("Unauthorized access");
		}

		const role = await Role.create({
			role_name,
			is_student,
			is_teacher,
			is_admin,
			is_superadmin,
		});

		return role;
	} catch (err) {
		console.log(err);
		throw new Error(err);
	}
};

exports.updateRole = async function (params, data) {
	try {
		console.log("params", params);
		console.log("data", data);

		const { id } = params;
		const {
			role_name,
			is_student,
			is_teacher,
			is_guardian,
			is_admin,
			is_superadmin,
		} = data;

		if (id == null || id == "") {
			throw new Error("Role ID is required");
		}
		if (role_name == null || role_name == "") {
			throw new Error("Role Name is required");
		}
		if (is_student == null || is_student == undefined) {
			throw new Error("Student value is required");
		}
		if (is_teacher == null || is_teacher == undefined) {
			throw new Error("Teacher value is required");
		}
		if (is_guardian == null || is_guardian == undefined) {
			throw new Error("Guardian value is required");
		}
		if (is_admin == null || is_admin == undefined) {
			throw new Error("Admin value is required");
		}
		if (is_superadmin == null || is_superadmin == undefined) {
			throw new Error("Superadmin value is required");
		}

		const roleData = await Role.findOne({
			where: {
				id,
			},
		});
		if (!roleData) {
			throw new Error("Role doesn't exist");
		}

		roleData.is_student = is_student;
		roleData.is_teacher = is_teacher;
		roleData.is_guardian = is_guardian;
		roleData.is_admin = is_admin;
		roleData.is_superadmin = is_superadmin;

		return roleData;
	} catch (err) {
		console.log(err);
		throw new Error(err);
	}
};

exports.deleteRole = async function (params) {
	try {
		console.log("params", params);

		const { id } = params;

		if (id == null || id == "") {
			throw new Error("Role ID is required");
		}

		const role = await Role.update(
			{
				is_deleted: true,
			},
			{
				where: {
					id,
				},
			}
		);

		return role;
	} catch (err) {
		console.log(err);
		throw new Error(err);
	}
};

exports.getAllRoles = async function () {
	try {
		const roles = await Role.findAll();

		return roles;
	} catch (err) {
		console.log(err);
		throw new Error(err);
	}
};
