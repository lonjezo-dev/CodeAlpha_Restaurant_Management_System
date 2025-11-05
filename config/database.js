/**
 * Import Sequelize.
 */
const Sequelize = require("sequelize");

/**
 * Create a Sequelize instance. This can be done by passing
 * the connection parameters separately to the Sequelize constructor starts with database name, database username, database password, host and database driver.
 */
const sequelize = new Sequelize("restaurant_management_system_db", "sam", "?Samuel2001@", {
   host: "127.0.0.1",
   dialect: "mysql",
});

/**
 * Export the Sequelize instance. This instance can now be
 * used in the index.js file to authenticate and establish a database connection.
 */
module.exports = sequelize;
