const express = require("express");
const sequelize = require("./config/database");
const { MenuItem } = require("./model/MenuItem");
const { Table } = require("./model/Table");
const { Order } = require("./model/Order");
const { Order_Item } = require("./model/Order_Item");
const { Reservation } = require("./model/Reservation");
const { Inventory } = require("./model/Inventory");
const app = express();
const port = 3001;


const initApp = async () => {
   try {
      await sequelize.authenticate();
      console.log("Connection has been established successfully.");


      // synchronize all defined models to the DB.
      await MenuItem.sync();
      await Table.sync()
      await Order.sync()
      await Order_Item.sync()
      await Reservation.sync()
      await Inventory.sync()
      // await sequelize.sync();

     app.use(express.json());

     // Mount API routes. All menu item routes are available under:
     //   POST   /api/menu/menu-items        -> createMenuItem
     //   GET    /api/menu/menu-items        -> getAllMenuItems
     //   GET    /api/menu/menu-items/:id    -> getMenuItem
     //   PUT    /api/menu/menu-items/:id    -> updateMenuItem
     //   DELETE /api/menu/menu-items/:id    -> deleteMenuItem
     //   DELETE /api/menu/menu-items        -> deleteAllMenuItems
     app.use('/api/menu', require('./routes'));

     app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
     });
   } catch (error) {
      console.error("Unable to connect to the database:", error);
   }
}

initApp();
