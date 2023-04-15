const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const User = require("../models/user.model");
const Role = require("../models/role.model");
const SocialAuth = require("../models/socialAuth.model");
const { isUserValid, isUserActive, isUserVerified } = require("./utils");

require("dotenv").config();

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.EMAIL_AUTH_USER,
		pass: process.env.EMAIL_AUTH_PASSWORD,
	},
});

exports.getAllUsers = async function () {
	try {
		const admin_users = await getUsersByRoleId(1);
		const student_users = await getUsersByRoleId(2);
		const teacher_users = await getUsersByRoleId(3);

		return {
			admin_users,
			student_users,
			teacher_users,
		};
	} catch (err) {
		console.log(err);
		throw new Error(err);
	}
};


exports.getUserDetailsByUsername = async function (params, reqUserId) {
	console.log("params", params);
	try {
		const { username } = params;
		if (!username) {
			throw new Error("Username is required");
		}
		const user_data = await User.findOne({
			where: {
				username,
			},
			attributes: [
				"id",
				"first_name",
				"last_name",
				"username",
				"email",
				"phone",
				"date_of_birth",
				"address",
				"about_me",
				"is_verified",
				"is_active",
				"profile_picture",
				"token",
			],
			include: [
				{
					model: Role,
					as: "role",
					attributes: [
						"role_name",
						"is_student",
						"is_teacher",
						"is_admin",
						"is_superadmin",
					],
				},
				{
					model: SocialAuth,
					as: "social_auth",
				},
			],
		});

		const reqUser = await User.findOne({
			where: {
				id: reqUserId,
			},
		});

		const org_data = await Organization.findOne({
			where: {
				username,
			},
		});

		const donor_data = await Donor.findOne({
			where: {
				username,
			},
		});

		if (!user_data && !org_data && !donor_data) {
			throw new Error("User not found");
		}
		var user;
		if (user_data) {
			user = user_data;
			isUserValid(user);
			isUserActive(user);
			isUserVerified(user);

			if (user.role.role_name == "teacher") {
				// get class count
				const allCourses = await Course.findAll({
					where: {
						created_by: user.id,
					},
					attributes: [
						"id",
						"course_title",
						"course_code",
						"subject_id",
						"is_active",
					],
					include: [
						{
							model: Subject,
							as: "subject",
							attributes: [
								"id",
								"class_id",
								"subject_name",
								"subject_icon_id",
							],
							include: [
								{
									model: Class,
									as: "class",
									attributes: ["id", "class_name"],
								},
								{
									model: File,
									as: "subject_icon",
									attributes: ["file_path"],
								},
							],
						},
						{
							model: User,
							as: "instructor",
							attributes: ["id", 'username', 'first_name', "last_name"],
						}
					]
				});
				const ongoingCourses = allCourses.filter(
					(course) => course.is_active
				);
				const inactiveCourses = allCourses.filter(
					(course) => course.is_active === false
				);
				var totalStudents = 0;
				for (let i = 0; i < allCourses.length; i++) {
					const course = allCourses[i];
					const course_x_students = await Course_x_Student.findAll({
						where: {
							course_id: course.id,
						},
					});
					totalStudents += course_x_students.length;
				}
				user.dataValues.totalCourses = allCourses.length;
				user.dataValues.totalOngoingCourses = ongoingCourses.length;
				user.dataValues.totalStudents = totalStudents;
				user.dataValues.isDonor = false;
				user.dataValues.isOrg = false;

				return {
					user,
					ongoingCourses,
					inactiveCourses,
				};
			} else if (user.role.role_name === "student") {
				const allCourses = await Course_x_Student.findAll({
					where: {
						user_id: user.id,
					},
					attributes: ["id", "course_id"],
					include: {
						model: Course,
						as: "course",

						attributes: [
							"id",
							"course_title",
							"course_code",
							"subject_id",
							"is_active",
						],
						include: [
							{
								model: Subject,
								as: "subject",
								attributes: [
									"id",
									"class_id",
									"subject_name",
									"subject_icon_id",
								],
								include: [
									{
										model: Class,
										as: "class",

										attributes: ["id", "class_name"],
									},
									{
										model: File,
										as: "subject_icon",
										attributes: ["file_path"],
									},
								],
							},
							{
								model: User,
								as: "instructor",
								attributes: ["id", 'username', 'first_name', "last_name"],
							}
						]
					},
				});

				const acceptedScholarships =
					await Scholarship_x_Student.findAll({
						where: {
							student_id: user.id,
						},
						include: [
							{
								model: Scholarship,
								as: "scholarship",
								attributes: [
									"uuid",
									"id",
									"name",
									"details",
									"type",
									"donor_details",
									"email",
									"phone",
									"amount",
									"amount_per_student",
									"number_of_students",
									"eligibility",
									"application_deadline",
									"donation_period",
									"created_by",
									"image",
									"created_at",
									"updated_at",
									"is_active",
									"is_deleted",
								],
							},
						],
					});
				const ongoingCourses = allCourses.filter(
					(item) => item.course.is_active
				);
				const inactiveCourses = allCourses.filter(
					(item) => item.course.is_active === false
				);
				user.dataValues.totalOngoingCourses = ongoingCourses.length;
				user.dataValues.totalInactiveCourses = inactiveCourses.length;
				user.dataValues.isDonor = false;
				user.dataValues.isOrg = false;

				return {
					user,
					ongoingCourses,
					inactiveCourses,
					acceptedScholarships,
				};
			}
		} else if (org_data) {
			user = org_data;
			user.dataValues.isDonor = false;
			user.dataValues.isOrg = true;

			return {
				user,
			};
		} else if (donor_data) {
			user = donor_data;

			user.dataValues.isDonor = false;
			user.dataValues.isOrg = false;
		}
	} catch (error) {
		console.log(error);
		throw new Error(error);
	}
};

exports.getUserDetailsByUserId = async function (params) {
	console.log("params", params);

	try {
		const { userId } = params;
		if (!userId) {
			throw new Error("User Id is required");
		}
		const user_data = await User.findOne({
			where: {
				id: userId,
			},
			attributes: [
				"id",
				"first_name",
				"last_name",
				"username",
				"email",
				"phone",
				"date_of_birth",
				"address",
				"about_me",
				"is_verified",
				"is_active",
				"profile_picture",
				"token",
			],
			include: [
				{
					model: Role,
					as: "role",
					attributes: [
						"role_name",
						"is_student",
						"is_teacher",
						"is_admin",
						"is_superadmin",
					],
				},
				{
					model: SocialAuth,
					as: "social_auth",
				},
			],
		});

		const org_data = await Organization.findOne({
			where: {
				id: userId,
			},
		});

		if (!user_data && !org_data) {
			throw new Error("Email Address is not registered");
		}
		var user;
		if (user_data) {
			user = user_data;
			isUserValid(user);
			isUserActive(user);
			isUserVerified(user);

			if (user.role.role_name == "teacher") {
				// get class count
				const allCourses = await Course.findAll({
					where: {
						created_by: user.id,
					},
					attributes: [
						"id",
						"course_title",
						"course_code",
						"subject_id",
						"is_active",
					],
					include: {
						model: Subject,
						as: "subject",
						attributes: [
							"id",
							"class_id",
							"subject_name",
							"subject_icon_id",
						],
						include: [
							{
								model: Class,
								as: "class",
								attributes: ["id", "class_name"],
							},
							{
								model: File,
								as: "subject_icon",
								attributes: ["file_path"],
							},
						],
					},
				});
				const ongoingCourses = allCourses.filter(
					(course) => course.is_active
				);
				const inactiveCourses = allCourses.filter(
					(course) => course.is_active === false
				);
				var totalStudents = 0;
				for (let i = 0; i < allCourses.length; i++) {
					const course = allCourses[i];
					const course_x_students = await Course_x_Student.findAll({
						where: {
							course_id: course.id,
						},
					});
					totalStudents += course_x_students.length;
				}
				user.dataValues.totalCourses = allCourses.length;
				user.dataValues.totalOngoingCourses = ongoingCourses.length;
				user.dataValues.totalStudents = totalStudents;
				user.dataValues.isOrg = false;

				return {
					user,
					ongoingCourses,
					inactiveCourses,
				};
			} else if (user.role.role_name === "student") {
				const allCourses = await Course_x_Student.findAll({
					where: {
						user_id: user.id,
					},
					attributes: ["id", "course_id"],
					include: {
						model: Course,
						as: "course",

						attributes: [
							"id",
							"course_title",
							"course_code",
							"subject_id",
						],
						include: {
							model: Subject,
							as: "subject",
							attributes: [
								"id",
								"class_id",
								"subject_name",
								"subject_icon_id",
							],
							include: [
								{
									model: Class,
									as: "class",

									attributes: ["id", "class_name"],
								},
								{
									model: File,
									as: "subject_icon",
									attributes: ["file_path"],
								},
							],
						},
					},
				});
				const ongoingCourses = allCourses.filter(
					(item) => item.course.is_active
				);
				const inactiveCourses = allCourses.filter(
					(item) => item.course.is_active === false
				);
				user.dataValues.isOrg = false;

				return {
					user,
					ongoingCourses,
					inactiveCourses,
				};
			}
		} else {
			user = org_data;
			user.dataValues.isOrg = true;

			return {
				user,
			};
		}
	} catch (error) {
		console.log(error);
		throw new Error(error);
	}
};

exports.getAllStudentsByTeacherId = async function (params, userId) {
	try {
		console.log(params);
		const { teacherId } = params;

		if (!teacherId) {
			throw new Error("Teacher Id is required");
		}
		if (userId != teacherId) {
			throw new Error("Unauthorized Access");
		}

		const teacher = await User.findOne({
			where: {
				id: teacherId,
			},
		});
		if (!teacher) {
			throw new Error("User not found");
		}

		const courses = await Course.findAll({
			where: {
				created_by: teacherId,
			},
		});

		var students = [];
		for (let i = 0; i < courses.length; i++) {
			const course = courses[i];
			const course_x_students = await Course_x_Student.findAll({
				where: {
					course_id: course.id,
				},
			});
			for (let j = 0; j < course_x_students.length; j++) {
				const course_x_student = course_x_students[j];
				const student = await User.findOne({
					where: {
						id: course_x_student.user_id,
					},
					attributes: [
						"id",
						"first_name",
						"last_name",
						"username",
						"email",
						"phone",
						"about_me",
						"profile_picture",
					],
					include: [
						{
							model: Role,
							as: "role",
							attributes: [
								"role_name",
								"is_student",
								"is_teacher",
								"is_admin",
								"is_superadmin",
							],
						},
					],
				});
				students.push(student);
			}
		}
		// remove duplicate students
		students = students.filter(
			(student, index, self) =>
				index === self.findIndex((t) => t.id === student.id)
		);

		// sort students by first name
		students.sort((a, b) => {
			if (a.first_name < b.first_name) {
				return -1;
			}
			if (a.first_name > b.first_name) {
				return 1;
			}
			return 0;
		});

		return students;
	} catch (err) {
		console.log(err);
		throw new Error(err);
	}
};

exports.searchUser = async function (data) {
	try {
		const { username, phone, email } = data;
		const users = await User.findAll({
			where: {
				username: {
					[Op.like]: `%${username}%`,
				},
				phone: phone && { [Op.like]: `%${phone}%` },
				email: email && { [Op.like]: `%${email}%` },
			},
			attributes: [
				"id",
				"first_name",
				"last_name",
				"username",
				"email",
				"phone",
				"about_me",
				"is_verified",
				"is_active",
			],
		});
		return users;
	} catch (error) {
		console.log(error);
		throw new Error(error);
	}
};

exports.updateUser = async function (data, userId) {
	try {
		console.log("data", data);
		const { firstName, lastName, phone, dateOfBirth, address, bio } = data;

		if (!userId) {
			throw new Error("User Id is required");
		}
		if (!firstName) {
			throw new Error("First Name is required");
		}
		if (!lastName) {
			throw new Error("Last Name is required");
		}
		var user = await User.findOne({
			where: {
				id: userId,
			},
			attributes: [
				"id",
				"first_name",
				"last_name",
				"username",
				"email",
				"phone",
				"date_of_birth",
				"address",
				"about_me",
				"is_verified",
				"is_active",
				"profile_picture",
				"token",
			],
			include: [
				{
					model: Role,
					as: "role",
					attributes: [
						"role_name",
						"is_student",
						"is_teacher",
						"is_admin",
						"is_superadmin",
					],
				},
				{
					model: SocialAuth,
					as: "social_auth",
				},
			],
		});

		isUserValid(user);
		isUserActive(user);
		isUserVerified(user);

		if (firstName > 15) {
			throw new Error("First Name must be less than 15 characters");
		}
		if (lastName > 15) {
			throw new Error("Last Name must be less than 15 characters");
		}
		user.first_name = firstName;
		user.last_name = lastName;

		if (phone) {
			if (phone.length > 20) {
				throw new Error("Phone number is too long");
			}
			user.phone = phone;
		}
		if (dateOfBirth) {
			user.date_of_birth = dateOfBirth;
		}
		if (address) {
			if (address.length > 200) {
				throw new Error("Address is too long");
			}
			user.address = address;
		}
		if (bio) {
			if (bio.length > 255) {
				throw new Error("Bio must be less than 255 characters");
			}
			user.about_me = bio;
		}

		await user.save();

		user.dataValues.isOrg = false;

		return user;
	} catch (error) {
		console.log(error);
		throw new Error(error);
	}
};

exports.updateUsername = async function (data, userId) {
	const { username } = data;

	if (!userId) {
		throw new Error("User Id is required");
	}
	if (!username) {
		throw new Error("Username is required");
	}

	const userData = await User.findOne({
		where: {
			id: userId,
		},
		attributes: [
			"id",
			"first_name",
			"last_name",
			"username",
			"email",
			"phone",
			"date_of_birth",
			"address",
			"about_me",
			"is_verified",
			"is_active",
			"profile_picture",
			"token",
		],
		include: [
			{
				model: Role,
				as: "role",
				attributes: [
					"role_name",
					"is_student",
					"is_teacher",
					"is_admin",
					"is_superadmin",
				],
			},
			{
				model: SocialAuth,
				as: "social_auth",
			},
		],
	});

	const existingUser = await User.findOne({
		where: {
			username: username,
		},
	});
	if (existingUser && existingUser.id != userId) {
		throw new Error("Username already exists");
	}

	var orgData = await Organization.findOne({
		where: {
			id: userId,
		},
	});

	if (!userData && !orgData) {
		throw new Error("Email Address is not registered");
	}
	var user;
	if (userData) {
		user = userData;
		isUserValid(user);
		isUserActive(user);
		isUserVerified(user);

		user.username = username;
		await user.save();

		user.dataValues.isOrg = false;

		return user;
	} else {
		user = orgData;
		isUserValid(user);
		isUserActive(user);

		user.username = username;
		await user.save();

		user.dataValues.isOrg = true;

		return user;
	}
};

exports.updateUsernameByAdmin = async function (data, userId) {
	const { oldUsername, newUsername } = data;

	if (!userId) {
		throw new Error("User Id is required");
	}
	if (!oldUsername) {
		throw new Error("Old Username is required");
	}
	if (!newUsername) {
		throw new Error("New Username is required");
	}

	const reqUser = await User.findOne({
		where: {
			id: userId,
		},
		include: [
			{
				model: Role,
				as: "role",
			},
		],
	});

	if (!reqUser) {
		throw new Error("User not found");
	}

	if (!reqUser.role.is_admin) {
		throw new Error("You are not authorized to perform this action");
	}

	const userData = await User.findOne({
		where: {
			username: oldUsername,
		},
		attributes: [
			"id",
			"first_name",
			"last_name",
			"username",
			"email",
			"phone",
			"date_of_birth",
			"address",
			"about_me",
			"is_verified",
			"is_active",
			"profile_picture",
			"token",
		],
		include: [
			{
				model: Role,
				as: "role",
				attributes: [
					"role_name",
					"is_student",
					"is_teacher",
					"is_admin",
					"is_superadmin",
				],
			},
			{
				model: SocialAuth,
				as: "social_auth",
			},
		],
	});
	var orgData = await Organization.findOne({
		where: {
			username: oldUsername,
		},
	});
	if (!userData && !orgData) {
		throw new Error("User not found");
	}

	const existingUser = await User.findOne({
		where: {
			username: newUsername,
		},
	});
	if (existingUser) {
		throw new Error("Username already exists");
	}

	var user;
	if (userData) {
		user = userData;
		isUserValid(user);
		isUserActive(user);
		isUserVerified(user);

		user.username = newUsername;
		await user.save();

		user.dataValues.isOrg = false;

		return user;
	} else {
		user = orgData;
		isUserValid(user);
		isUserActive(user);

		user.username = newUsername;
		await user.save();

		user.dataValues.isOrg = true;

		return user;
	}
};

exports.updateProfilePicture = async function (files, userId) {
	try {
		console.log("files", files);
		console.log("userId", userId);

		if (!files.profilePicture) {
			throw new Error("Profile Picture is required");
		}
		if (!userId) {
			throw new Error("User Id is required");
		}

		const profilePicture = files.profilePicture[0];

		const user_data = await User.findOne({
			where: {
				id: userId,
			},
			attributes: [
				"id",
				"first_name",
				"last_name",
				"username",
				"email",
				"phone",
				"date_of_birth",
				"address",
				"about_me",
				"is_verified",
				"is_active",
				"profile_picture",
				"token",
				"otp_code",
			],
			include: [
				{
					model: Role,
					as: "role",
					attributes: [
						"is_student",
						"is_teacher",
						"is_admin",
						"is_superadmin",
					],
				},
				{
					model: SocialAuth,
					as: "social_auth",
				},
			],
		});

		const org_data = await Organization.findOne({
			where: {
				id: userId,
			},
		});

		if (!user_data && !org_data) {
			throw new Error("Email Address is not registered");
		}

		var user;
		if (user_data) {
			user = user_data;
			isUserValid(user);
			isUserActive(user);
			// isUserVerified(user);

			user.profile_picture = profilePicture.location;
			await user.save();

			user.dataValues.isOrg = false;

			return user;
		} else {
			user = org_data;
			isUserValid(user);
			isUserActive(user);

			user.profile_picture = profilePicture.location;
			await user.save();

			user.dataValues.isOrg = true;

			return {
				user,
			};
		}
	} catch (error) {
		console.log(error);
		throw new Error(error);
	}
};

exports.verifyEmail = async function (data, userId) {
	try {
		console.log("data", data);

		const { email } = data;

		if (!userId) {
			throw new Error("User Id is required");
		}
		if (!email) {
			throw new Error("Email is required");
		}

		const user = await User.findOne({
			where: {
				id: userId,
			},
		});
		if (!user) {
			throw new Error("User not found");
		}

		const otpCode = Math.floor(1000 + Math.random() * 9000);
		user.otp_code = otpCode;
		user.otp_expiry = new Date(new Date().getTime() + 10 * 60 * 1000);
		await user.save();

		// Send email to user with OTP
		var to = email;
		var subject = "Verify Email";
		var text =
			"Your OTP is " +
			otpCode +
			" . Please enter this code to verify your email address.";
		sendEmail(to, subject, text);

		return { message: "Verification code sent successfully" };
	} catch (error) {
		console.log(error);
		throw new Error(error);
	}
};

exports.updateEmail = async function (data, userId) {
	try {
		console.log("data", data);

		const { email, otp } = data;

		if (!userId) {
			throw new Error("User Id is required");
		}
		if (!email) {
			throw new Error("Email is required");
		}
		if (!otp) {
			throw new Error("OTP is required");
		}
		var user_data = await User.findOne({
			where: {
				id: userId,
			},
			attributes: [
				"id",
				"first_name",
				"last_name",
				"username",
				"email",
				"phone",
				"date_of_birth",
				"address",
				"about_me",
				"is_verified",
				"is_active",
				"profile_picture",
				"token",
				"otp_code",
			],
			include: [
				{
					model: Role,
					as: "role",
					attributes: [
						"role_name",
						"is_student",
						"is_teacher",
						"is_admin",
						"is_superadmin",
					],
				},
				{
					model: SocialAuth,
					as: "social_auth",
				},
			],
		});

		var org_data = await Organization.findOne({
			where: {
				id: userId,
			},
		});

		if (!user_data && !org_data) {
			throw new Error("Email Address is not registered");
		}
		const anotherUser = await User.findOne({
			where: {
				email: email,
			},
		});
		if (anotherUser) {
			throw new Error("Email is already registered");
		}

		var user;
		if (user_data) {
			user = user_data;
			if (user.otp_code != otp) {
				throw new Error("Invalid OTP");
			}
			isUserValid(user);
			isUserActive(user);
			isUserVerified(user);

			user.email = email;
			user.otp_code = null;
			user.otp_expiry = null;
			await user.save();

			user.dataValues.isOrg = false;

			return user;
		} else {
			user = org_data;
			isUserValid(user);
			isUserActive(user);

			user.email = email;
			user.otp_code = null;
			user.otp_expiry = null;
			await user.save();

			user.dataValues.isOrg = true;

			return {
				user,
			};
		}
	} catch (error) {
		console.log(error);
		throw new Error(error);
	}
};

exports.updatePassword = async function (data) {
	console.log(data);

	const { userId, oldPassword, newPassword, confirmPassword } = data;

	if (!userId) {
		throw new Error("User Id is required");
	}
	var user = await User.findOne({
		where: {
			id: userId,
		},
	});

	isUserValid(user);
	isUserActive(user);
	isUserVerified(user);

	if (!oldPassword) {
		throw new Error("Old Password is required");
	}
	if (!newPassword) {
		throw new Error("Password is required");
	}
	if (newPassword.length < 6) {
		throw new Error("Password must be atleast 6 characters");
	}
	if (newPassword !== confirmPassword) {
		throw new Error("Password and confirm password does not match");
	}
	var isValid = await bcrypt.compare(oldPassword, user.password);
	if (!isValid) {
		throw new Error("Old password is incorrect");
	}
	if (isValid && newPassword === confirmPassword && newPassword.length > 5) {
		var hash = await bcrypt.hash(newPassword, 10);
		user.password = hash;
		await user.save();
	}
	return user;
};

exports.createAdmin = async function (data) {
	try {
		console.log("data", data);
		const { email, password, username, first_name, last_name, secret_key } =
			data;
		if (secret_key !== process.env.SECRET_KEY) {
			throw new Error("Unauthorized access");
		}
		if (!email) {
			throw new Error("Email is required");
		}
		if (!password) {
			throw new Error("Password is required");
		}
		if (!username) {
			throw new Error("Username is required");
		}
		if (!first_name) {
			throw new Error("First name is required");
		}
		if (!last_name) {
			throw new Error("Last name is required");
		}
		const user = await User.findOne({ where: { email } });
		if (user) {
			throw new Error("User already exists");
		}
		const hashedPassword = await bcrypt.hash(password, 10);

		var newUser = await User.create({
			email,
			password: hashedPassword,
			username,
			first_name,
			last_name,
			role_id: 1,
			is_verified: true,
			is_active: true,
		});

		const userData = await User.findOne({
			where: { id: newUser.id },
			attributes: [
				"id",
				"first_name",
				"last_name",
				"username",
				"email",
				"profile_picture",
				"role_id",
			],
			include: [
				{
					model: Role,
					as: "role",
					attributes: [
						"role_name",
						"is_student",
						"is_teacher",
						"is_guardian",
						"is_admin",
						"is_superadmin",
					],
				},
			],
		});
		return userData;
	} catch (error) {
		console.log(error);
		throw new Error(error);
	}
};

// Organization
exports.getAllOrganizations = async function () {
	try {
		var organizations = await Organization.findAll({
			where: {
				is_active: true,
				is_deleted: false,
			},
			attributes: [
				"id",
				"name",
				"email",
				"username",
				"phone",
				"description",
				"established",
				"founder",
				"profile_picture",
				"cover_picture",
				"type",
				"total_teachers",
				"total_students",
				"is_active",
				"is_verified",
			],
		});
		return organizations;
	} catch (error) {
		console.log(error);
		throw new Error(error);
	}
};

exports.updateOrganization = async function (data, userId) {
	try {
		console.log("data", data);
		const { name, phone, description, established, founder, type } = data;
		if (!name) {
			throw new Error("Name is required");
		}
		var org = await Organization.findOne({
			where: {
				id: userId,
			},
		});

		isUserValid(org);
		isUserActive(org);

		org.name = name;

		if (phone) {
			org.phone = phone;
		}
		if (description) {
			org.description = description;
		}
		if (established) {
			org.established = established;
		}
		if (founder) {
			org.founder = founder;
		}
		if (type) {
			org.type = type;
		}
		await org.save();

		org.dataValues.isOrg = true;

		return org;
	} catch (error) {
		console.log(error);
		throw new Error(error);
	}
};

function makeRandomString(length) {
	var result = "";
	var characters = "abcdefghijklmnopqrstuvwxyz0123456789";
	var charactersLength = characters.length;
	for (var i = 0; i < length; i++) {
		result += characters.charAt(
			Math.floor(Math.random() * charactersLength)
		);
	}
	return result;
}

async function getUsersByRoleId(roleId) {
	return await User.findAll({
		where: {
			role_id: roleId,
		},
		attributes: [
			"id",
			"first_name",
			"last_name",
			"username",
			"email",
			"phone",
			"address",
			"about_me",
			"is_verified",
			"is_active",
			"otp_code",
			"reffer_code",
			"profile_picture",
			"role_id",
		],
		order: [["id", "ASC"]],
		include: [
			{
				model: Role,
				as: "role",
				attributes: [
					"is_student",
					"is_teacher",
					"is_admin",
					"is_superadmin",
				],
			},
			{
				model: SocialAuth,
				as: "social_auth",
			},
		],
	});
}

const sendEmail = (to, subject, text) => {
	const mailOptions = {
		from: process.env.EMAIL_AUTH_USER,
		to: to,
		subject: subject,
		text: text,
	};
	transporter.sendMail(mailOptions, function (error, info) {
		if (error) {
			console.log(error);
		} else {
			console.log("Email sent: " + info.response);
		}
	});
};
