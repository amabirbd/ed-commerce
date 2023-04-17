const { Sequelize, DataTypes } = require("sequelize");
const database = require("../database");

const Quizzes = database.define(
    "Quizzes",
    {
        uuid: {
            type: Sequelize.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            unique: true,
        },
        question: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        option_1: {
            type: DataTypes.STRING,
        },
        option_2: {
            type: DataTypes.STRING,
        },
        option_3: {
            type: DataTypes.STRING,
        },
        option_4: {
            type: DataTypes.STRING,
        },
        answer: {
            type: DataTypes.STRING,
        },
        explanation: {
            type: DataTypes.STRING,
        },
        category: {
            type: DataTypes.STRING,
        },
        language: {
            type: DataTypes.STRING,
        },
    },
    {
        modelName: "Quizzes",
        tableName: "quizzes",
        timestamps: true,
        underscored: true,
        freezeTableName: true,
        updatedAt: "updated_at",
        createdAt: "created_at",
    }
);

Quizzes.sync({ alter: true })
    .then(() => console.log("Quizzes table created"))
    .catch((error) =>
        console.log("Error creating Quizzes table", error)
    );

module.exports = Quizzes;