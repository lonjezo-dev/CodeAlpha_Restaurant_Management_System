import {sequelize} from "../config/database.mjs";
import { DataTypes } from '@sequelize/core';

// Define the MenuItem model
export const MenuItem = sequelize.define("MenuItem", {
   // Each attribute will pair with a column
      // Here we define our model attributes

      // Our primaryKey, book id, our unique identifier
   id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
   },
   // This will create a name for a column of the menu item
   name: {
      type: DataTypes.STRING,
      allowNull: false,
   },

   // This will create a description for a column of the menu item
   description: {
      type: DataTypes.TEXT,
      allowNull: true,
   },
   // This will create a price for a column of the menu item
   price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
   },
    // This will create a category for a column of the menu item
   category: {
      type: DataTypes.STRING,
      allowNull: true,
   },

 preparation_time: {
      type: DataTypes.INTEGER,  // in minutes
      allowNull: true,
      defaultValue: 10,
   },
   is_available: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
   },

   rack_inventory: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  current_stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  low_stock_threshold: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10
  },
}, 

// Model options
{
    // Specify the table name
   tableName: "menu_items",
//    enable the automatic addition of timestamp fields (createdAt, updatedAt)
   timestamps: true,
});

