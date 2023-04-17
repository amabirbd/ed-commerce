const { Sequelize, DataTypes } = require("sequelize");
const database = require("../database");
const User = require("./user.model");

const EcAccount = database.define(
    "EcAccount",
    {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            unique: true,
        },
        user_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
        points: {
			type: DataTypes.INTEGER,
		},
        temp_points: {
			type: DataTypes.INTEGER,
		},
    },
    {
        modelName: "EcAccount",
        tableName: "ec_account",
        timestamps: true,
        underscored: true,
        freezeTableName: true,
        updatedAt: "updated_at",
        createdAt: "created_at",
    }
);

EcAccount.belongsTo(User, {
	foreignKey: "user_id",
	as: "user",
});

EcAccount.sync({ alter: true })
    .then(() => console.log("EcAccount table created"))
    .catch((error) =>
        console.log("Error creating EcAccount table", error)
    );

module.exports = EcAccount;