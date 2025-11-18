import {sequelize} from "../config/database.mjs";
import { DataTypes } from '@sequelize/core';

export const Inventory = sequelize.define("Inventory", {
    // Primary Key
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },       
    
    // Basic Item Information
    item_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    
    // Category for grouping items
    category: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'general',
    },
    
    // Inventory Quantity
     quantity: { 
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    
    // Measurement unit
    unit: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    
    // Cost per unit
    unit_cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    
    // Supplier information
    supplier: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    
    // Minimum stock level for alerts
    min_stock_level: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    
    // Quantity to reorder when low
    reorder_quantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    
    // Auto-updated timestamp
    last_updated: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, 
{
    // Model options        
    tableName: "inventory",
    timestamps: true, // This will add createdAt and updatedAt automatically
});