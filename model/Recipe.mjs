// models/Recipe.mjs
import { sequelize } from "../config/database.mjs";
import { DataTypes } from "@sequelize/core";
import { MenuItem } from "./MenuItem.mjs";
import { Inventory } from "./Inventory.mjs";

export  const Recipe = sequelize.define("Recipe", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  menu_item_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  inventory_item_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity_required: {
    type: DataTypes.DECIMAL(10, 3), // Supports grams, ml, etc.
    allowNull: false,
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'units'
  }
}, {
  tableName: "recipes",
  timestamps: true,
});

// Relationships
MenuItem.hasMany(Recipe,{ foreignKey: {name:"menu_item_id", onDelete: "CASCADE", onUpdate: 'CASCADE'}});
Recipe.belongsTo(MenuItem, { foreignKey: {name:"menu_item_id", onDelete: "CASCADE", onUpdate: 'CASCADE'}});

Inventory.hasMany(Recipe,{foreignKey:  { name:"inventory_id", onDelete: "CASCADE", onUpdate:'CASCADE' }});
Recipe.belongsTo(Inventory, {foreignKey:  { name:"inventory_id", onDelete: "CASCADE", onUpdate:'CASCADE' }});

