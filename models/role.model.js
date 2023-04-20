const { Sequelize, DataTypes } = require("sequelize");
const database = require("../database");

const Role = database.define(
  "Role",
  {
    uuid: {
      type: Sequelize.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
    },
    role_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    is_admin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_superadmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    modelName: "Role",
    tableName: "roles",
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    updatedAt: "updated_at",
    createdAt: "created_at",
  }
);

// Role.sync({ alter: true })
//   .then(() => console.log("Role table created"))
//   .catch((error) => console.log("Error creating Role table", error));

module.exports = Role;
