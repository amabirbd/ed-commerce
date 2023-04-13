const Sequelize = require("sequelize");
require("dotenv").config();

DATABASE_URL = `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DATABASE_DEV}`;

const database = new Sequelize(DATABASE_URL, {
	dialectOptions: {
		collate: "utf8_general_ci",
	},
	logging: false,
});

module.exports = database;
