import path from "path";
import { SequelizeOptions } from "sequelize-typescript";

export default {
  igerp: <SequelizeOptions>{
    dialect: process.env.DB_DIALECT,
    database: process.env.DB_IGERP,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    logging: (process.env.APP_DEBUG === "true") ? console.log : false,
    timezone: process.env.APP_TIMEZONE,
    modelPaths: [path.join(__dirname, "../../models")],
    dialectOptions: {
      options: {
        requestTimeout: 300000
      }
    },    
    define: {
      timestamps: false,
      underscored: true,
      paranoid: true
    }
  },
  clipper: <SequelizeOptions>{
    dialect: process.env.DB_DIALECT,
    database: process.env.DB_CLIPPER,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    logging: (process.env.APP_DEBUG === "true") ? console.log : false,
    timezone: process.env.APP_TIMEZONE,
    modelPaths: [path.join(__dirname, "../../models")],
    dialectOptions: {
      options: {
        requestTimeout: 300000
      }
    },    
    define: {
      timestamps: false,
      underscored: true,
      paranoid: true
    }
  }
};
