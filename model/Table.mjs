import {sequelize} from "../config/database.mjs";
import { DataTypes } from '@sequelize/core';

export const Table = sequelize.define("Table", {
   // Each attribute will pair with a column
      // Here we define our model attributes

      // Our primaryKey, table id, our unique identifier
   id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,                 
    },
    // This will create a number for a column of the table
    table_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    // This will create a capacity for a column of the table
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // This will create a status for a column of the table
    status: {
      type: DataTypes.ENUM('available', 'occupied', 'reserved'),    
        allowNull: false,
        defaultValue: 'available',


    },}, 

// Model options
{
    // Specify the table name
   tableName: "tables",
   //    enable the automatic addition of timestamp fields (createdAt, updatedAt)
   timestamps: true,
});


