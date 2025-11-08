// config/database.mjs
import { Sequelize } from "@sequelize/core";
import { PostgresDialect } from "@sequelize/postgres";
import dotenv from "dotenv";

dotenv.config();

const getConfig = () => {
  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);

    return {
      database: url.pathname.substring(1),
      user: url.username, // corrected property (was url.user)
      password: url.password,
      host: url.hostname,
      port: parseInt(url.port),
      dialect: PostgresDialect,
      ssl: {
        require: true,
        rejectUnauthorized: false, // ✅ put inside ssl object
      },
    };
  } else {
    // Local configuration
    return {
      database: process.env.DB_NAME || "restaurant_management_system_db",
      user: process.env.DB_USER || "sam",
      password: process.env.DB_PASS || "123456",
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
      dialect: PostgresDialect,
      ssl: false,
    };
  }
};

export const sequelize = new Sequelize({
  ...getConfig(),
  logging: false,
  clientMinMessages: "notice",
});
