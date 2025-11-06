const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");
const { MenuItem } = require("./MenuItem");
const { Order } = require("./Order");

const Order_Item = sequelize.define("Order_Item", {
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
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
}, 
// Model options
{
    // Specify the table name
   tableName: "order_items",
   //    enable the automatic addition of timestamp fields (createdAt, updatedAt)
   timestamps: true,
});

Order.hasMany(Order_Item, { foreignKey: "order_id", onDelete: "CASCADE" });
Order_Item.belongsTo(Order, { foreignKey: "order_id" });

MenuItem.hasMany(Order_Item, { foreignKey: "menu_item_id", onDelete: "CASCADE" });
Order_Item.belongsTo(MenuItem, { foreignKey: "menu_item_id" });
module.exports = {
    Order_Item,
    sequelize
};