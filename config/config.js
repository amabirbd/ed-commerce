require("dotenv").config();

const {
    POSTGRES_USER,
    POSTGRES_PASSWORD,
    POSTGRES_DATABASE_DEV,
    POSTGRES_DATABASE_TEST,
    POSTGRES_DATABASE_PROD,
    POSTGRES_HOST,
    POSTGRES_PORT,
} = process.env;

module.exports = {
    development: {
        username: POSTGRES_USER,
        password: POSTGRES_PASSWORD,
        database: POSTGRES_DATABASE_DEV,
        host: POSTGRES_HOST,
        port: POSTGRES_PORT,
        dialect: "postgres",
        logging: true,
        define: {
            timestamps: false,
            underscored: true,
            freezeTableName: true,
            charset: "utf8",
            dialectOptions: {
                collate: "utf8_general_ci",
            },
        },
    },
    test: {
        username: POSTGRES_USER,
        password: POSTGRES_PASSWORD,
        database: POSTGRES_DATABASE_TEST,
        host: POSTGRES_HOST,
        dialect: "postgres",
        logging: true,
        define: {
            timestamps: false,
            underscored: true,
            freezeTableName: true,
            charset: "utf8",
            dialectOptions: {
                collate: "utf8_general_ci",
            },
        },
    },
    production: {
        username: POSTGRES_USER,
        password: POSTGRES_PASSWORD,
        database: POSTGRES_DATABASE_PROD,
        host: POSTGRES_HOST,
        dialect: "postgres",
        logging: true,
        define: {
            timestamps: false,
            underscored: true,
            freezeTableName: true,
            charset: "utf8",
            dialectOptions: {
                collate: "utf8_general_ci",
            },
        },
    },
};
