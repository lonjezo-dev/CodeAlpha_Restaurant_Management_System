// const { FOREIGNKEYS } = require("sequelize/lib/query-types");
const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");
const { Table } = require("./Table");

const Order = sequelize.define("Order", {
   // Each attribute will pair with a column
      // Here we define our model attributes

      // Our primaryKey, order id, our unique identifier
   id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,},
   order_status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
   },
   total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
   },
   order_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
   },
}, 
// Model options
{
    // Specify the table name
   tableName: "orders",
   //    enable the automatic addition of timestamp fields (createdAt, updatedAt)
   timestamps: true,
}); 


// 2️⃣ Define the relationship AFTER both models exist
Table.hasMany(Order, { foreignKey: "table_id", onDelete: "CASCADE" });
Order.belongsTo(Table, { foreignKey: "table_id" });

module.exports = {
    Order,
    sequelize
};