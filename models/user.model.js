const { Sequelize, DataTypes } = require("sequelize");
const database = require("../database");
// const Role = require("./role.model");
const SocialAuth = require("./socialAuth.model");

const User = database.define(
  "User",
  {
    uuid: {
      type: Sequelize.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    about_me: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    date_of_birth: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    profile_picture: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cover_picture: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // role_id: {
    // 	type: DataTypes.INTEGER,
    // 	allowNull: false,
    // 	defaultValue: 1,
    // },
    social_auth_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    otp_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    otp_expiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reffer_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_email_private: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    is_phone_private: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    is_date_of_birth_private: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    is_address_private: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    validate: {
      passwordOrsocialauthid: function () {
        if (this.password === null && this.social_auth_id === null) {
          throw Error("Both password and social auth id cannot be null"); // Use any custom error class if your application has such class.
        }
      },
    },
    modelName: "User",
    tableName: "users",
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    updatedAt: "updated_at",
    createdAt: "created_at",
  }
);

User.belongsTo(SocialAuth, {
  foreignKey: "social_auth_id",
  as: "social_auth",
});

// User.sync({ alter: true })
// 	.then(() => console.log("User table created"))
// 	.catch((error) => console.log("Error creating User table", error));

module.exports = User;
