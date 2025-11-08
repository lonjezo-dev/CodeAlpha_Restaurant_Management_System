import {Table }  from "./Table.mjs";
import {sequelize} from "../config/database.mjs";
import { DataTypes } from '@sequelize/core';

export const Reservation = sequelize.define("Reservation", {
   // Each attribute will pair with a column
      // Here we define our model attributes

      // Our primaryKey, reservation id, our unique identifier
   id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,},

    customer_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    customer_phone: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    reservation_time: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    number_of_guests: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
        allowNull: false,
        defaultValue: 'pending',
    },
}, 
// Model options
{
    // Specify the table name
   tableName: "reservations",
   //    enable the automatic addition of timestamp fields (createdAt, updatedAt)
   timestamps: true,
});     

// 2️⃣ Define the relationship AFTER both models exist
Table.hasMany(Reservation,{foreignKey:  { name:"table_id", onDelete: "CASCADE",onUpdate :"CASCADE" }});
Reservation.belongsTo(Table, {foreignKey: { name:"table_id", onDelete: "CASCADE",onUpdate :"CASCADE" }});


    