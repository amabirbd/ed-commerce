const { Sequelize, DataTypes } = require("sequelize");
const database = require("../database");
const EcAccount = require("./ecAccount.model");
const Quizzes = require("./quizzes.model");

const QuizzesHistory = database.define(
    "QuizzesHistory",
    {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            unique: true,
        },
        ec_account_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
        quiz_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
        answer: {
            type: DataTypes.STRING,
        },
        is_correct: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
    },
    {
        modelName: "QuizzesHistory",
        tableName: "quizzes_history",
        timestamps: true,
        underscored: true,
        freezeTableName: true,
        updatedAt: "updated_at",
        createdAt: "created_at",
    }
);

QuizzesHistory.belongsTo(EcAccount, {
	foreignKey: "ec_account_id",
	as: "ec_account",
});

QuizzesHistory.belongsTo(Quizzes, {
	foreignKey: "quiz_id",
	as: "quiz",
});

// QuizzesHistory.sync({ alter: true })
//     .then(() => console.log("QuizzesHistory table created"))
//     .catch((error) =>
//         console.log("Error creating QuizzesHistory table", error)
//     );

module.exports = QuizzesHistory;