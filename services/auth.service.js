const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const JWT = require("jsonwebtoken");
const User = require("../models/user.model");
const Role = require("../models/role.model");
const SocialAuth = require("../models/socialAuth.model");
const Course = require("../models/course.model");
const Organization = require("../models/organization.model");
const Donor = require("../models/donor.model");
const Course_x_Student = require("../models/course_x_student.model");
const {
  isUserValid,
  isUserActive,
  isUserVerified,
  isDonorValid,
} = require("./utils");
const { InstanceError } = require("sequelize");

require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_AUTH_USER,
    pass: process.env.EMAIL_AUTH_PASSWORD,
  },
});

const forbiddenUsernameList = [
  "dashboard",
  "moderator",
  "home",
  "logout",
  "username",
  "password",
  "login",
  "signup",
  "forgotpassword",
  "resetpassword",
  "auth",
  "demo",
  "privacy-policy",
  "terms",
  "settings",
  "forms",
  "organization",
  "course",
  "courses",
  "chapter",
  "chapters",
  "class",
  "subject",
  "material",
  "organization",
  "organisation",
  "user",
  "users",
  "teacher",
  "teachers",
  "student",
  "students",
  "course",
  "courses",
  "routine",
  "routines",
  "attendance",
  "attendances",
  "exam",
  "exams",
  "question",
  "questions",
  "answer",
  "answers",
  "donor",
];

exports.signUpUser = async function (user_data) {
  try {
    console.log("user_data", user_data);

    const {
      firstName,
      lastName,
      username,
      email,
      password,
      confirmPassword,
      asStudent,
      asTeacher,
      asGuardian,
    } = user_data;

    var format = !/^[a-zA-Z0-9_]*$/;

    if (firstName === null || firstName === "") {
      throw new Error("First name is required");
    } else if (lastName === null || lastName === "") {
      throw new Error("Last name is required");
    } else if (username === null || username === "") {
      throw new Error("Username is required");
    } else if (!/^[a-zA-Z0-9_]*$/.test(username)) {
      throw new Error("Username cannot contain spaces or special characters");
    } else if (email === null || email === "") {
      throw new Error("Email is required");
    } else if (password === null || password === "") {
      throw new Error("Password is required");
    } else if (confirmPassword === null || confirmPassword === "") {
      throw new Error("Confirm password is required");
    } else if (password !== confirmPassword) {
      throw new Error("Passwords do not match");
    }

    var user = await User.findOne({
      where: { email },
    });
    if (user) {
      throw new Error("Email Address is already registered");
    }
    user = await User.findOne({
      where: {
        username,
      },
    });
    if (user) {
      throw new Error("Username is already taken");
    }

    var org = await Organization.findOne({
      where: {
        email,
      },
    });
    if (org) {
      console.log(org);
      throw new Error("Email Address is already registered");
    }
    org = await Organization.findOne({
      where: {
        username,
      },
    });
    if (org) {
      throw new Error("Username is already registered");
    }

    var donor = await Donor.findOne({
      where: {
        email,
      },
    });
    if (donor) {
      throw new Error("Email Address is already registered");
    }
    donor = await Donor.findOne({
      where: {
        username,
      },
    });
    if (donor) {
      throw new Error("Username is already registered");
    }

    if (forbiddenUsernameList.includes(username)) {
      throw new Error("Username is not allowed");
    }
    const otpCode = Math.floor(1000 + Math.random() * 9000);
    var referCode = makeRandomString(6);
    // console.log(referCode);
    const role_id = asStudent ? 2 : asTeacher ? 3 : asGuardian ? 4 : 0;

    user = await User.create({
      first_name: firstName,
      last_name: lastName,
      username,
      email,
      password: await bcrypt.hash(password, 10),
      is_verified: true,
      is_active: true,
      otp_code: otpCode,
      otp_expiry: new Date(new Date().getTime() + 10 * 60 * 1000),
      reffer_code: referCode,
      role_id,
    });

    // Send email to user with OTP
    var to = email;
    var subject = "OTP for Sign Up";
    var text = "Your OTP is " + otpCode;
    sendEmail(to, subject, text);

    user = await User.findOne({
      where: {
        email,
      },
      attributes: [
        "id",
        "email",
        "username",
        "phone",
        "first_name",
        "last_name",
        "profile_picture",
        "reffer_code",
        "role_id",
        "is_active",
        "is_verified",
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
    return user;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

exports.signUpOrg = async function (user_data) {
  try {
    console.log(user_data);
    const { fullName, username, email, password, confirmPassword } = user_data;

    if (fullName === null || fullName === "") {
      throw new Error("Organization name is required");
    } else if (username === null || username === "") {
      throw new Error("Organization username is required");
    } else if (email === null || email === "") {
      throw new Error("Organization email is required");
    } else if (password === null || password === "") {
      throw new Error("Organization password is required");
    } else if (confirmPassword === null || confirmPassword === "") {
      throw new Error("Organization confirm password is required");
    } else if (password !== confirmPassword) {
      throw new Error("Organization passwords do not match");
    }

    var user = await User.findOne({
      where: { email },
    });
    if (user) {
      throw new Error("Email Address is already registered");
    }
    user = await User.findOne({
      where: {
        username,
      },
    });
    if (user) {
      throw new Error("Username is already taken");
    }

    var org = await Organization.findOne({
      where: {
        email,
      },
    });
    if (org) {
      console.log(org);
      throw new Error("Email Address is already registered");
    }
    org = await Organization.findOne({
      where: {
        username,
      },
    });
    if (org) {
      throw new Error("Username is already registered");
    }

    var donor = await Donor.findOne({
      where: {
        email,
      },
    });
    if (donor) {
      throw new Error("Email Address is already registered");
    }
    donor = await Donor.findOne({
      where: {
        username,
      },
    });
    if (donor) {
      throw new Error("Username is already registered");
    }

    if (forbiddenUsernameList.includes(username)) {
      throw new Error("Username is not allowed");
    }

    const otpCode = Math.floor(1000 + Math.random() * 9000);
    org = await Organization.create({
      uuid: uuidv4(),
      name: fullName,
      username: username,
      email: email,
      password: await bcrypt.hash(password, 10),
      is_verified: false,
      is_active: true,
      otp_code: otpCode,
      otp_expiry: new Date(new Date().getTime() + 10 * 60 * 1000),
    });

    // Send email to user with OTP
    var to = email;
    var subject = "OTP for Sign Up";
    var text = "Your OTP is " + otpCode;
    sendEmail(to, subject, text);

    org = await Organization.findOne({
      where: {
        email,
      },
      // all attributes except password
      attributes: [
        "id",
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
        "token",
        "is_active",
        "is_deleted",
        "is_verified",
      ],
    });
    return org;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};


exports.verifyUser = async function (data) {
  const { email, code, resetPassword } = data;
  var user = await User.findOne({
    where: {
      email: email,
    },
  });
  if (!user) {
    user = await Donor.findOne({
      where: {
        email,
      },
    });
  }
  if (!user) {
    user = await Organization.findOne({
      where: {
        email,
      },
    });
  }

  console.log(user);
  isUserValid(user);
  console.log(user.otp_code);
  console.log(code);
  if (user.otp_code != code) {
    // console.log("OTP does not match");
    throw new Error("OTP does not match");
  }
  // if (!resetPassword && user.otp_expiry < new Date()) {
  // 	throw new Error("OTP expired");
  // }
  user.otp_code = null;
  user.otp_expiry = null;
  user.is_active = true;
  user.is_verified = true;
  await user.save();

  if (!resetPassword) {
    // Send success email
    var to = email;
    var subject = "Account Verified";
    var text = "Your account has been verified";
    sendEmail(to, subject, text);
  }

  return user;
};

exports.verifyOrg = async function (data) {};

exports.resendOTP = async function (data) {
  const { email } = data;
  var user = await User.findOne({
    where: {
      email: email,
    },
  });
  if (!user) {
    throw new Error("Email Address is not registered");
  }
  const otpCode = Math.floor(1000 + Math.random() * 9000);
  const otpExpiry = new Date(new Date().getTime() + 10 * 60 * 1000);
  user.otp_code = otpCode;
  user.otp_expiry = otpExpiry;
  await user.save();

  // Send email to user with OTP
  var to = email;
  var subject = "OTP for Sign Up";
  var text = "Your OTP from ischool to verify your account: " + otpCode;
  sendEmail(to, subject, text);

  return user;
};

exports.loginUser = async function (user_data) {
  try {
    console.log(user_data);
    let { email, password } = user_data;
    email = email.toLowerCase();
    var user_data = await User.findOne({
      where: {
        email,
      },
      attributes: ["id", "password", "is_active", "is_verified"],
    });
    var org_data = await Organization.findOne({
      where: {
        email,
      },
      attributes: ["id", "password", "is_active", "is_verified"],
    });
    var donor_data = await Donor.findOne({
      where: {
        email,
      },
      attributes: ["id", "password", "is_active", "is_verified"],
    });
    if (!user_data && !org_data && !donor_data) {
      throw new Error("Email Address is not registered");
    }
    var user;
    if (user_data) {
      user = user_data;
    } else if (org_data) {
      user = org_data;
    } else if (donor_data) {
      user = donor_data;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error("Email or Password does not match");
    }
    isUserActive(user);

    // if (!user.is_verified) {
    // 	var otpCode = Math.floor(1000 + Math.random() * 9000);
    // 	user.otp_code = otpCode;
    // 	user.otp_expiry = new Date(new Date().getTime() + 10 * 60 * 1000);
    // 	await user.save();
    // 	// Send email to user with OTP
    // 	var to = user.email;
    // 	var subject = "OTP for Sign Up";
    // 	var text =
    // 		"Your OTP from ischool to verify your account: " + otpCode;
    // 	sendEmail(to, subject, text);
    // 	throw new Error(
    // 		"User is not verified. Verification code has been sent again. Please verify your account."
    // 	);
    // }

    const token = await JWT.sign(
      {
        userId: user.id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "4h",
      }
    );

    user.token = token;
    await user.save();
    if (user_data) {
      user = await User.findOne({
        where: {
          email,
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
              "is_admin",
              "is_superadmin",
            ],
          },
        ],
      });

      // get class count
      var courses = await Course.findAll({
        where: {
          created_by: user.id,
        },
        attributes: ["id"],
      });
      var student_count = 0;
      for (let i = 0; i < courses.length; i++) {
        const course = courses[i];
        const course_x_students = await Course_x_Student.findAll({
          where: {
            course_id: course.id,
          },
        });
        student_count += course_x_students.length;
      }

      user.dataValues.class_count = courses.length;
      user.dataValues.student_count = student_count;
      user.dataValues.isOrg = false;
      user.dataValues.isDonor = false;
    } else if (org_data) {
      user = await Organization.findOne({
        where: {
          email,
        },
        attributes: [
          "id",
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
          "token",
          "is_active",
          "is_deleted",
          "is_verified",
        ],
      });
      user.dataValues.isOrg = true;
      user.dataValues.isDonor = false;
    } else if (donor_data) {
      user = await Donor.findOne({
        where: {
          email,
        },
        attributes: [
          "id",
          "name",
          "email",
          "username",
          "phone",
          "token",
          "is_active",
          "is_deleted",
          "is_verified",
        ],
      });
      user.dataValues.isOrg = false;
      user.dataValues.isDonor = true;
    }
    // console.log(user)
    return user;
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

exports.socialSignIn = async function (user_data) {
  try {
    const { result } = user_data;
    const { user: userData } = result;
    const { email } = userData;

    var user = await User.findOne({
      where: {
        email,
      },
      attributes: [
        "id",
        "email",
        "username",
        "phone",
        "first_name",
        "last_name",
        "profile_picture",
        "reffer_code",
        "role_id",
        "is_active",
        "is_verified",
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
      ],
    });
    if (user) {
      const token = await JWT.sign(
        {
          userId: user.id,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "4h",
        }
      );

      user.token = token;
      await user.save();
      console.log(user);

      return user;
    } else {
      // throw new Error("User Not Found")
      return 0;
    }
  } catch (err) {
    console.log(err);
    return err;
  }
};
exports.socialSignUp = async function (user_data) {
  try {
    const { result, role } = user_data;
    const { _tokenResponse, user: userData } = result;
    const { email, photoURL, stsTokenManager } = userData;
    const { providerId, firstName, lastName, idToken, refreshToken } =
      _tokenResponse;
    const makeUserName = (fn, ln) => {
      return (fn + ln).replace(/[^a-z0-9]/gi, "").toLowerCase();
    };
    const asStudent = role === "student" && 2;
    const asTeacher = role === "teacher" && 3;
    const asGuardian = role === "guardian" && 4;
    const role_id = asStudent ? 2 : asTeacher ? 3 : asGuardian ? 4 : 0;

    var referCode = makeRandomString(6);

    var user = await User.findOne({
      where: {
        email,
      },
      attributes: [
        "id",
        "email",
        "username",
        "phone",
        "first_name",
        "last_name",
        "profile_picture",
        "reffer_code",
        "role_id",
        "is_active",
        "is_verified",
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
      ],
    });

    if (user) {
      return {
        user_data: user,
        already_exists: true,
      };
      // return user, true;
    }

    var socialUser = await SocialAuth.create({
      provider: providerId,
      email,
      is_deleted: false,
    });

    user = await User.create({
      first_name: firstName,
      last_name: lastName || " ",
      username: makeUserName(firstName, lastName || " "),
      email,
      profile_picture: photoURL.toString(),
      social_auth_id: socialUser.id,
      is_verified: true,
      is_active: true,
      reffer_code: referCode,
      role_id,
    });

    const token = await JWT.sign(
      {
        userId: user.id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "4h",
      }
    );

    user.token = token;
    await user.save();

    user = await User.findOne({
      where: {
        email,
      },
      attributes: [
        "id",
        "email",
        "username",
        "phone",
        "first_name",
        "last_name",
        "profile_picture",
        "reffer_code",
        "role_id",
        "is_active",
        "is_verified",
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
      ],
    });
    return {
      user_data: user,
      already_exists: false,
    };
    // return user, false;
  } catch (err) {
    return err;
  }
};

exports.changePassword = async function (user_data) {
  const { email, oldPassword, newPassword, confirmPassword } = user_data;
  if (email == null || email == "") {
    throw new Error("Email is required");
  } else if (oldPassword == null || oldPassword == "") {
    throw new Error("Old Password is required");
  } else if (newPassword == null || newPassword == "") {
    throw new Error("New Password is required");
  } else if (confirmPassword == null || confirmPassword == "") {
    throw new Error("Confirm Password is required");
  } else if (newPassword.length < 6) {
    throw new Error("Password must be atleast 6 characters long");
  } else if (newPassword != confirmPassword) {
    throw new Error("New Password and Confirm Password does not match");
  }
  var user = await User.findOne({
    where: {
      email: email,
      is_active: true,
      is_deleted: false,
    },
  });

  isUserValid(user);

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    throw new Error("Old Password is incorrect");
  }
  var newPassHashed = await bcrypt.hash(newPassword, 10);
  user.password = newPassHashed;
  await user.save();
  return "Password changed successfully";
};

exports.getResetPasswordCode = async function (data) {
  console.log("data", data);

  const { email } = data;

  var user_data = await User.findOne({
    where: {
      email,
    },
  });
  var org_data = await Organization.findOne({
    where: {
      email,
    },
  });
  var donor_data = await Donor.findOne({
    where: {
      email,
    },
  });
  if (!user_data && !org_data && !donor_data) {
    throw new Error("Email Address is not registered");
  }
  var user;
  if (user_data) {
    user = user_data;
  } else if (org_data) {
    user = org_data;
  } else if (donor_data) {
    user = donor_data;
  }

  var code = Math.floor(1000 + Math.random() * 9000);
  user.otp_code = code;
  await user.save();

  // Send email to user with Password Reset Code
  var to = email;
  var subject = "Password Reset Code";
  var text = "Use this code to reset your password: " + code;
  sendEmail(to, subject, text);
  return user;
};

exports.verifyResetPasswordCode = async function (data) {
  console.log("data", data);

  const { email, code } = data;

  var user_data = await User.findOne({
    where: {
      email,
    },
  });
  var org_data = await Organization.findOne({
    where: {
      email,
    },
  });
  var donor_data = await Donor.findOne({
    where: {
      email,
    },
  });
  if (!user_data && !org_data && !donor_data) {
    throw new Error("Email Address is not registered");
  }
  var user;
  if (user_data) {
    user = user_data;
  } else if (org_data) {
    user = org_data;
  } else if (donor_data) {
    user = donor_data;
  }

  var isCodeMatch = user.otp_code == code;
  return isCodeMatch;
};

exports.resetPassword = async function (data) {
  console.log("data", data);

  const { email, otpCode, newPassword, confirmPassword } = data;

  var user_data = await User.findOne({
    where: {
      email,
    },
  });
  var org_data = await Organization.findOne({
    where: {
      email,
    },
  });
  var donor_data = await Donor.findOne({
    where: {
      email,
    },
  });
  if (!user_data && !org_data && !donor_data) {
    throw new Error("Email Address is not registered");
  }
  var user;
  if (user_data) {
    user = user_data;
  } else if (org_data) {
    user = org_data;
  } else if (donor_data) {
    user = donor_data;
  }

  if (user.otp_code != otpCode) {
    throw new Error("Invalid OTP Code");
  }
  if (newPassword.length < 6) {
    throw new Error("Password must be atleast 6 characters long");
  }
  if (newPassword != confirmPassword) {
    throw new Error("Password does not match");
  }
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return "Password reset successfully";
};

const makeRandomString = function (length) {
  var result = "";
  var characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

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
