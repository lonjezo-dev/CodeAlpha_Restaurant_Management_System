import {sequelize }from "../config/database.mjs";
import { DataTypes } from  '@sequelize/core';
import { MenuItem } from  "./MenuItem.mjs";
import { Order } from "./Order.mjs";

export const Order_Item = sequelize.define("Order_Item", {
   // Each attribute will pair with a column
      // Here we define our model attributes

      // Our primaryKey, order item id, our unique identifier
   id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,},
    quantity: {
        type: DataTypes.INTEGER,    
        allowNull: false,
        defaultValue: 1,
    },
     special_instructions: {
      type: DataTypes.TEXT,
      allowNull: true,
   },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
     item_status: {
      type: DataTypes.ENUM('pending', 'preparing', 'ready', 'served'),
      allowNull: false,
      defaultValue: 'pending',
   }
}, 
// Model options
{
    // Specify the table name
   tableName: "order_items",
   //    enable the automatic addition of timestamp fields (createdAt, updatedAt)
   timestamps: true,
});

Order.hasMany(Order_Item,{foreignKey: {  name:"order_id", onDelete: "CASCADE",onUpdate :"CASCADE" } });
Order_Item.belongsTo(Order,{foreignKey: { name:"order_id", onDelete: "CASCADE",onUpdate :"CASCADE" } });

MenuItem.hasMany(Order_Item, {foreignKey:{  name:"menu_item_id", onDelete: "CASCADE",onUpdate:"CASCADE" } });
Order_Item.belongsTo(MenuItem, {foreignKey: {name:"menu_item_id", onDelete: "CASCADE",onUpdate:"CASCADE" } });
