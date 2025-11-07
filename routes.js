// const MenuItem = require("./model/MenuItem");
const { createMenuItem, getAllMenuItems, getMenuItem, updateMenuItem, deleteMenuItem, deleteAllMenuItems } = require("./controllers/MenuItemController");
const express = require("express");
const { createTable,  getAllTables, getTable, updateTable, deleteTable} = require("./controllers/TableController");
// const { createOrder, getAllOrders, getOrderById, updateOrder, deleteorder } = require("./controllers/OrderController");
const OrderProcessingController = require("./controllers/OrderProcessingController");
const { createOrderItem, getAllOrderItems, getOrderItemById, updateOrderItem, deleteOrderItem } = require("./controllers/OrderItemController");
const { createReservation, getAllReservations, getReservationById, updateReservation, deleteReservation } = require("./controllers/ReservationController");
const { createInventoryItem, getAllInventoryItems, getInventoryItemById, updateInventoryItem, deleteInventoryItem } = require("./controllers/InventoryController");
const router = express.Router();

// Create a new menu item
router.post("/menu-items", createMenuItem); // createMenuItem(req, res)

// Get all menu items
router.get("/menu-items", getAllMenuItems); // getAllMenuItems(req, res)

// Get a specific menu item by ID
router.get("/menu-items/:id", getMenuItem); // getMenuItem(req, res)

// Update a menu item by ID
router.put("/menu-items/:id", updateMenuItem); // updateMenuItem(req, res)

// Delete a specific menu item by ID
router.delete("/menu-items/:id", deleteMenuItem); // deleteMenuItem(req, res)

// Delete all menu items
router.delete("/menu-items", deleteAllMenuItems); // deleteAllMenuItems(req, res)

router.post("/table", createTable);  // createTable(req, res)
router.get("/table",  getAllTables); // getAllTables(req, res)
router.get("/table/:id", getTable); // getAllTable by an id(req, res) 
router.put("/table/:id", updateTable); // updateTable by an id(req, res)
router.delete("/table/:id", deleteTable); // deleteTable by an id(req, res)

// router.post("/order", createOrder);  // createOrder(req, res)
// router.get("/order",  getAllOrders); // getAllOrders(req, res)
// router.get("/order/:id", getOrderById); // getOrderById by an id(req, res) 
// router.put("/order/:id", updateOrder); // updateOrder by an id(req, res)
// router.delete("/order/:id", deleteorder); // deleteorder by an id(req, res)

router.post("/orders", OrderProcessingController.createCompleteOrder);
router.get("/orders", OrderProcessingController.getAllOrders);
router.get("/orders/statistics", OrderProcessingController.getOrderStatistics);
router.get("/orders/today", OrderProcessingController.getTodaysOrders);
router.get("/orders/:id", OrderProcessingController.getOrderDetails);
router.put("/orders/:id", OrderProcessingController.updateOrder);
router.patch("/orders/:id/status", OrderProcessingController.updateOrderStatus);
router.delete("/orders/:id", OrderProcessingController.cancelOrder);
router.post("/orders/:id/items", OrderProcessingController.addItemsToOrder);
router.delete("/orders/:orderId/items/:itemId", OrderProcessingController.removeItemFromOrder);
router.patch("/orders/:orderId/items/:itemId/status", OrderProcessingController.updateOrderItemStatus);
router.get("/orders/status/:status", OrderProcessingController.getOrdersByStatus);
router.get("/orders/kitchen/display", OrderProcessingController.getKitchenOrders);
router.get("/orders/:id/preparation-time", OrderProcessingController.getOrderPreparationTime);


router.post("/order-item", createOrderItem);  // createOrderItem(req, res)
router.get("/order-item",  getAllOrderItems); // getAllOrderItems(req, res)
router.get("/order-item/:id", getOrderItemById); // getOrderById by an id(req, res) 
router.put("/order-item/:id", updateOrderItem); // updateOrderItem by an id(req, res)
router.delete("/order-item/:id", deleteOrderItem); // deleteOrderItem by an id(req, res)

router.get("/reservations", getAllReservations); // getAllReservations(req, res)
router.post("/reservations", createReservation); // createReservation(req, res)
router.get("/reservations/:id", getReservationById); // getReservationById(req, res)
router.put("/reservations/:id", updateReservation); // updateReservation(req, res)
router.delete("/reservations/:id", deleteReservation); // deleteReservation(req, res)

router.post("/inventory", createInventoryItem);  // createInventoryItem(req, res)
router.get("/inventory",  getAllInventoryItems); // getAllInventoryItems(req, res)
router.get("/inventory/:id", getInventoryItemById); // getInventoryItemById by an id(req, res) 
router.put("/inventory/:id", updateInventoryItem); // updateInventoryItem by an id(req, res)
router.delete("/inventory/:id", deleteInventoryItem); // deleteInventoryItem by an id(req, res)

module.exports = router;