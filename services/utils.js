exports.isUserValid = function (user) {
	if (!user) {
		throw new Error("User does not exist");
	}
	if (!user.email) {
		throw new Error("User is invalid");
	}
};

exports.isUserActive = function (user) {
	if (!user) {
		throw new Error("User does not exist");
	}
	if (user.is_active === false) {
		throw new Error("User is inactive");
	}
};

exports.isUserVerified = function (user) {
	if (!user) {
		throw new Error("User does not exist");
	}
	if (user.is_verified === false) {
		throw new Error("User is not verified");
	}
};
