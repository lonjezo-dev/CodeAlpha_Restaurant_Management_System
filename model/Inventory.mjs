import {sequelize} from "../config/database.mjs";
import { DataTypes } from '@sequelize/core';

 export const Inventory = sequelize.define("Inventory", {
   // Each attribute will pair with a column
      // Here we define our model attributes

      // Our primaryKey, inventory id, our unique identifier
   id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,},       
    item_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    quantity: { 
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    unit: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    last_updated: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, 
// Model options        

{
    // Specify the table name
   tableName: "inventory",
});






