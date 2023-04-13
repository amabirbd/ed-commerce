const jwt = require("jsonwebtoken");
const Role = require("../models/role.model");
const User = require("../models/user.model");

module.exports = async (req, res, next) => {
	const token = req.header("x-auth-token");

	try {
		const verified = await jwt.verify(token, process.env.JWT_SECRET);
		if (verified) {
			res.locals.id = verified.userId;
			const user = await User.findOne({
				where: {
					id: verified.userId,
					is_active: true,
					is_deleted: false,
				},
				include: [
					{
						model: Role,
						as: "role",
					},
				],
			});
			if (user === null) {
				return res.status(401).json({
					status: 401,
					message: "No user found.",
				});
			} else if (user.is_verified === false) {
				return res.status(401).json({
					status: 401,
					message: "User is not verified.",
				});
			} else if (user.role.is_admin === false) {
				return res.status(401).json({
					status: 401,
					message: "User is not an admin.",
				});
			} else {
				res.locals.id = verified.userId;

				next();
			}
		} else {
			// Access Denied
			return res.status(401).send(error);
		}
	} catch (error) {
		// Access Denied
		return res.status(401).send(error);
	}
};
