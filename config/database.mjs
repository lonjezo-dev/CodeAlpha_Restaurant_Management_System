// config/database.mjs
import { Sequelize } from "@sequelize/core";
import { PostgresDialect } from "@sequelize/postgres";
import dotenv from "dotenv";

dotenv.config();

// Use Render's DATABASE_URL if available, otherwise use your existing config
const getConfig = () => {
  if (process.env.DATABASE_URL) {
    // For Render production
    return {
      connectionString: process.env.DATABASE_URL,
      dialect: PostgresDialect,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    };
  } else {
    // For local development - keep your exact words
    return {
      database: process.env.DB_NAME || "restaurant_management_system_db",
      user: process.env.DB_USER || "sam",
      password: process.env.DB_PASS || "123456",
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
      dialect: PostgresDialect,
      ssl: false
    };
  }
};

export const sequelize = new Sequelize({
  ...getConfig(),
  logging: false,
  clientMinMessages: "notice"
});