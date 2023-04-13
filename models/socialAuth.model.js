const { Sequelize, DataTypes } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const database = require("../database");

const SocialAuth = database.define(
	"SocialAuth",
	{
		uuid: {
			type: Sequelize.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
			unique: true,
		},
		provider: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		access_token: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		refresh_token: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		api_response: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		is_active: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: true,
		},
		is_deleted: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
	},
	{
		modelName: "SocialAuth",
		tableName: "social_auth",
		timestamps: true,
		underscored: true,
		freezeTableName: true,
		updatedAt: "updated_at",
		createdAt: "created_at",
	}
);

// SocialAuth.sync({ alter: true })
// 	.then(() => console.log("SocialAuth table created successfully"))
// 	.catch((err) => console.log("Error creating SocialAuth table", err));

module.exports = SocialAuth;
