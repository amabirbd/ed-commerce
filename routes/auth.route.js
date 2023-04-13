const express = require("express");
const {
	signUpUser,
	verifyUser,
	resendOTP,
	loginUser,
	socialSignUp,
	changePassword,
	getResetPasswordCode,
	resetPassword,
	verifyResetPasswordCode,
	signUpOrg,
	signUpDonor,
	socialSignIn,
} = require("../controllers/auth.controller");

const router = express.Router();

router.post("/signup_user", signUpUser);
router.post("/signup_org", signUpOrg);
router.post("/signup_donor", signUpDonor);
router.post("/verification", verifyUser);
router.post("/resend_otp", resendOTP);
router.post("/login", loginUser);
router.post("/social_signup", socialSignUp);
router.post("/social_signin", socialSignIn);

router.post("/change_password", changePassword);
router.post("/get_reset_password_code", getResetPasswordCode);
router.post("/verify_reset_password_code", verifyResetPasswordCode);
router.post("/reset_password", resetPassword);

module.exports = router;