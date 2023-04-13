const AuthService = require("../services/auth.service");

module.exports = {
	signUpUser: (req, res) => {
		AuthService.signUpUser(req.body)
			.then((response) => {
				return res.status(200).json({
					status: 200,
					data: {
						user: response,
						isSocialAuth: false,
					},
					message: "User created successfully",
				});
			})
			.catch((err) => {
				console.log(err);
				res.status(500).json({
					message: "Error creating user",
					error: err.message,
				});
			});
	},
	signUpOrg: (req, res) => {
		AuthService.signUpOrg(req.body)
			.then((response) => {
				return res.status(200).json({
					status: 200,
					data: {
						user: response,
						isSocialAuth: false,
					},
					message: "Organization created successfully",
				});
			})
			.catch((err) => {
				console.log(err);
				res.status(500).json({
					message: "Error creating user",
					error: err.message,
				});
			});
	},
	signUpDonor: (req, res) => {
		AuthService.signUpDonor(req.body)
			.then((response) => {
				return res.status(200).json({
					status: 200,
					data: {
						user: response,
						isSocialAuth: false,
					},
					message: "Donor created successfully",
				});
			})
			.catch((err) => {
				console.log(err);
				res.status(500).json({
					message: "Error creating donor",
					error: err.message,
				});
			});
	},
	loginDonor: (req, res) => {
		AuthService.loginDonor(req.body)
			.then((response) => {
				return res.status(200).json({
					status: 200,
					data: response,
					message: "Donor logged in successfully",
				});
			})
			.catch((err) => {
				res.status(500).json({
					message: err.message.slice(7, 100),
				});
			});
	},
	verifyUser: (req, res) => {
		AuthService.verifyUser(req.body)
			.then((user) => {
				return res.status(200).json({
					status: 200,
					message: "User verified successfully",
				});
			})
			.catch((err) => {
				console.log(err);
				res.status(500).json({
					message: "Error verifying user",
					error: err.message,
				});
			});
	},
	resendOTP: (req, res) => {
		AuthService.resendOTP(req.body)
			.then((user) => {
				return res.status(200).json({
					status: 200,
					message: "OTP sent successfully",
				});
			})
			.catch((err) => {
				console.log(err);
				res.status(500).json({
					message: "Error sending OTP",
					error: err.message,
				});
			});
	},
	loginUser: (req, res) => {
		AuthService.loginUser(req.body)
			.then((response) => {
				return res.status(200).json({
					status: 200,
					data: response,
					message: "User logged in successfully",
				});
			})
			.catch((err) => {
				res.status(500).json({
					message: err.message.slice(7, 100),
				});
			});
	},
	socialSignUp: (req, res) => {
		AuthService.socialSignUp(req.body)
			.then((user_data) => {

				console.log({ user_data })
				user = user_data.user_data

				return res.status(200).json({
					status: 200,
					data: {
						user,
						isSocialAuth: true,
					},
					message: user_data.already_exists ? "User already exists" : "User Created successfully",
				});
			})
			.catch((err) => {
				res.status(500).json({
					message: "Error logging in user",
					error: err.message,
				});
			});
	},
	socialSignIn: (req, res) => {
		AuthService.socialSignIn(req.body)
			.then((user) => {
				console.log({ user })
				return res.status(200).json({
					status: 200,
					data: {
						user,
						isSocialAuth: true,
					},
					message: user ? "User logged in successfully" : "User does not exists",
				});
			})
			.catch((err) => {
				console.log("controller : ", err)
				res.status(500).json({
					message: "Error logging in user",
					error: err.message,
				});
			});
	},
	changePassword: (req, res) => {
		AuthService.changePassword(req.body)
			.then((response) => {
				return res.status(200).json({
					status: 200,
					data: response,
				});
			})
			.catch((err) => {
				res.status(500).json({
					message: "Error changing password",
					error: err.message,
				});
			});
	},
	getResetPasswordCode: (req, res) => {
		AuthService.getResetPasswordCode(req.body)
			.then((user) => {
				return res.status(200).json({
					status: 200,
					data: {
						email: user.email,
						resetPassworCode: user.otp_code,
					},
				});
			})
			.catch((err) => {
				res.status(500).json({
					message: "Error getting password reset code",
					error: err.message,
				});
			});
	},
	verifyResetPasswordCode: (req, res) => {
		AuthService.verifyResetPasswordCode(req.body)
			.then((response) => {
				return res.status(200).json({
					status: 200,
					data: response,
				});
			})
			.catch((err) => {
				res.status(500).json({
					message: "Error verifying password reset code",
					error: err.message,
				});
			});
	},
	resetPassword: (req, res) => {
		AuthService.resetPassword(req.body)
			.then((response) => {
				return res.status(200).json({
					status: 200,
					message: response,
				});
			})
			.catch((err) => {
				res.status(500).json({
					message: "Error resetting password",
					error: err.message,
				});
			});
	},
};
