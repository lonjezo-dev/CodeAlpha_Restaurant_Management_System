import { createMenuItem, getAllMenuItems, getMenuItem, updateMenuItem, deleteMenuItem, deleteAllMenuItems } from "./controllers/MenuItemController.mjs";
import express from "express";
import { createTable, getAllTables, getTable, updateTable, deleteTable } from "./controllers/TableController.mjs";
import { OrderProcessingController } from "./controllers/OrderProcessingController.mjs";
import { createOrderItem, getAllOrderItems, getOrderItemById, updateOrderItem, deleteOrderItem } from "./controllers/OrderItemController.mjs";
import { createReservation, getAllReservations, getReservationById, updateReservation, deleteReservation } from "./controllers/ReservationController.mjs";
import { createInventoryItem, getAllInventoryItems, getInventoryItemById, updateInventoryItem, deleteInventoryItem } from "./controllers/InventoryController.mjs";
import  TableAvailabilityController from './controllers/TableAvailabilityController.mjs';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     MenuItem:
 *       type: object
 *       required:
 *         - name
 *         - price
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated ID
 *         name:
 *           type: string
 *           description: Menu item name
 *         description:
 *           type: string
 *           description: Item description
 *         price:
 *           type: number
 *           format: float
 *           description: Item price
 *         category:
 *           type: string
 *           description: Item category
 * 
 *     Table:
 *       type: object
 *       required:
 *         - table_number
 *         - capacity
 *       properties:
 *         table_number:
 *           type: integer
 *           description: Unique table number
 *         capacity:
 *           type: integer
 *           description: Number of guests
 *         status:
 *           type: string
 *           enum: [available, occupied, reserved]
 *           description: Table status
 * 
 *     Order:
 *       type: object
 *       required:
 *         - table_id
 *         - order_items
 *       properties:
 *         table_id:
 *           type: integer
 *           description: ID of the table
 *         customer_notes:
 *           type: string
 *           description: Special customer instructions
 *         order_items:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - menu_item_id
 *               - quantity
 *             properties:
 *               menu_item_id:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *               special_instructions:
 *                 type: string
 * 
 *     Reservation:
 *       type: object
 *       required:
 *         - customer_name
 *         - customer_phone
 *         - reservation_time
 *         - number_of_guests
 *         - table_id
 *       properties:
 *         customer_name:
 *           type: string
 *         customer_phone:
 *           type: string
 *         reservation_time:
 *           type: string
 *           format: date-time
 *         number_of_guests:
 *           type: integer
 *         table_id:
 *           type: integer
 *         status:
 *           type: string
 *           enum: [pending, confirmed, cancelled, completed]
 * 
 *     Inventory:
 *       type: object
 *       required:
 *         - item_name
 *         - quantity
 *         - unit
 *       properties:
 *         item_name:
 *           type: string
 *         quantity:
 *           type: integer
 *         unit:
 *           type: string
 * 
 *     TableAvailabilitySearch:
 *       type: object
 *       required:
 *         - party_size
 *         - reservation_time
 *       properties:
 *         party_size:
 *           type: integer
 *           description: Number of guests
 *         reservation_time:
 *           type: string
 *           format: date-time
 *           description: Desired reservation time
 *         duration_minutes:
 *           type: integer
 *           description: Expected dining duration (default 90 minutes)
 * 
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *         details:
 *           type: string
 */

// ====================================
// MENU ITEMS ROUTES
// ====================================

/**
 * @swagger
 * /menu-items:
 *   post:
 *     summary: Create a new menu item
 *     tags: [Menu Items]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MenuItem'
 *     responses:
 *       201:
 *         description: Menu item created successfully
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/menu-items", createMenuItem);

/**
 * @swagger
 * /menu-items:
 *   get:
 *     summary: Get all menu items
 *     tags: [Menu Items]
 *     responses:
 *       200:
 *         description: List of all menu items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MenuItem'
 */
router.get("/menu-items", getAllMenuItems);

/**
 * @swagger
 * /menu-items/{id}:
 *   get:
 *     summary: Get a specific menu item by ID
 *     tags: [Menu Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Menu item ID
 *     responses:
 *       200:
 *         description: Menu item details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MenuItem'
 *       404:
 *         description: Menu item not found
 */
router.get("/menu-items/:id", getMenuItem);

/**
 * @swagger
 * /menu-items/{id}:
 *   put:
 *     summary: Update a menu item by ID
 *     tags: [Menu Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Menu item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MenuItem'
 *     responses:
 *       200:
 *         description: Menu item updated successfully
 *       404:
 *         description: Menu item not found
 */
router.put("/menu-items/:id", updateMenuItem);

/**
 * @swagger
 * /menu-items/{id}:
 *   delete:
 *     summary: Delete a specific menu item by ID
 *     tags: [Menu Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Menu item ID
 *     responses:
 *       200:
 *         description: Menu item deleted successfully
 *       404:
 *         description: Menu item not found
 */
router.delete("/menu-items/:id", deleteMenuItem);

/**
 * @swagger
 * /menu-items:
 *   delete:
 *     summary: Delete all menu items
 *     tags: [Menu Items]
 *     responses:
 *       200:
 *         description: All menu items deleted successfully
 */
router.delete("/menu-items", deleteAllMenuItems);

// ====================================
// TABLES ROUTES
// ====================================

/**
 * @swagger
 * /table:
 *   post:
 *     summary: Create a new table
 *     tags: [Tables]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Table'
 *     responses:
 *       201:
 *         description: Table created successfully
 *       400:
 *         description: Invalid input
 */
router.post("/table", createTable);

/**
 * @swagger
 * /table:
 *   get:
 *     summary: Get all tables
 *     tags: [Tables]
 *     responses:
 *       200:
 *         description: List of all tables
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Table'
 */
router.get("/table", getAllTables);

/**
 * @swagger
 * /table/{id}:
 *   get:
 *     summary: Get a specific table by ID
 *     tags: [Tables]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Table ID
 *     responses:
 *       200:
 *         description: Table details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Table'
 *       404:
 *         description: Table not found
 */
router.get("/table/:id", getTable);

/**
 * @swagger
 * /table/{id}:
 *   put:
 *     summary: Update a table by ID
 *     tags: [Tables]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Table ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Table'
 *     responses:
 *       200:
 *         description: Table updated successfully
 *       404:
 *         description: Table not found
 */
router.put("/table/:id", updateTable);

/**
 * @swagger
 * /table/{id}:
 *   delete:
 *     summary: Delete a specific table by ID
 *     tags: [Tables]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Table ID
 *     responses:
 *       200:
 *         description: Table deleted successfully
 *       404:
 *         description: Table not found
 */
router.delete("/table/:id", deleteTable);

// ====================================
// TABLE AVAILABILITY ROUTES
// ====================================

/**
 * @swagger
 * /tables/status:
 *   get:
 *     summary: Get status of all tables
 *     tags: [Table Availability]
 *     responses:
 *       200:
 *         description: All tables status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tables:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       table_number:
 *                         type: integer
 *                       capacity:
 *                         type: integer
 *                       status:
 *                         type: string
 *                       current_order_id:
 *                         type: integer
 *                         nullable: true
 *                       reserved_until:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 */
router.get("/tables/status", TableAvailabilityController.getAllTablesStatus);

/**
 * @swagger
 * /tables/availability/{tableId}:
 *   get:
 *     summary: Check table availability for a specific time
 *     tags: [Table Availability]
 *     parameters:
 *       - in: path
 *         name: tableId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Table ID
 *       - in: query
 *         name: datetime
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Date and time to check availability for
 *       - in: query
 *         name: duration
 *         schema:
 *           type: integer
 *           default: 90
 *         description: Duration in minutes (default 90)
 *     responses:
 *       200:
 *         description: Table availability checked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 available:
 *                   type: boolean
 *                 table_id:
 *                   type: integer
 *                 requested_time:
 *                   type: string
 *                   format: date-time
 *                 conflicting_reservations:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get("/tables/availability/:tableId", TableAvailabilityController.checkTableAvailability);

/**
 * @swagger
 * /tables/availability/{tableId}/immediate:
 *   get:
 *     summary: Check immediate table availability (right now)
 *     tags: [Table Availability]
 *     parameters:
 *       - in: path
 *         name: tableId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Table ID
 *     responses:
 *       200:
 *         description: Immediate availability checked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 available:
 *                   type: boolean
 *                 table_id:
 *                   type: integer
 *                 current_status:
 *                   type: string
 *                 estimated_available_time:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 */
router.get("/tables/availability/:tableId/immediate", TableAvailabilityController.checkImmediateAvailability);

/**
 * @swagger
 * /tables/availability/search:
 *   post:
 *     summary: Find available tables for a given time and party size
 *     tags: [Table Availability]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TableAvailabilitySearch'
 *     responses:
 *       200:
 *         description: Available tables found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 available_tables:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       table_number:
 *                         type: integer
 *                       capacity:
 *                         type: integer
 *                 search_criteria:
 *                   type: object
 *                   properties:
 *                     party_size:
 *                       type: integer
 *                     reservation_time:
 *                       type: string
 *                       format: date-time
 *                     duration_minutes:
 *                       type: integer
 */
router.post("/tables/availability/search", TableAvailabilityController.findAvailableTables);

/**
 * @swagger
 * /tables/{tableId}/status:
 *   get:
 *     summary: Get detailed status of a specific table
 *     tags: [Table Availability]
 *     parameters:
 *       - in: path
 *         name: tableId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Table ID
 *     responses:
 *       200:
 *         description: Table status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 table_number:
 *                   type: integer
 *                 capacity:
 *                   type: integer
 *                 status:
 *                   type: string
 *                 current_order:
 *                   type: object
 *                   nullable: true
 *                 upcoming_reservations:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get("/tables/:tableId/status", TableAvailabilityController.getTableStatus);

// ====================================
// ORDERS ROUTES
// ====================================

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a complete order with items
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post("/orders", OrderProcessingController.createCompleteOrder);

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders with filtering
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, completed, cancelled]
 *         description: Filter by order status
 *       - in: query
 *         name: table_id
 *         schema:
 *           type: integer
 *         description: Filter by table ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of orders retrieved successfully
 */
router.get("/orders", OrderProcessingController.getAllOrders);

/**
 * @swagger
 * /orders/statistics:
 *   get:
 *     summary: Get order statistics and analytics
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for statistics (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for statistics (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Order statistics retrieved successfully
 */
router.get("/orders/statistics", OrderProcessingController.getOrderStatistics);

/**
 * @swagger
 * /orders/today:
 *   get:
 *     summary: Get today's orders summary
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Today's orders summary
 */
router.get("/orders/today", OrderProcessingController.getTodaysOrders);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order details by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details retrieved successfully
 *       404:
 *         description: Order not found
 */
router.get("/orders/:id", OrderProcessingController.getOrderDetails);

/**
 * @swagger
 * /orders/{id}:
 *   put:
 *     summary: Update order information
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               table_id:
 *                 type: integer
 *               customer_notes:
 *                 type: string
 *               preparation_notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order updated successfully
 *       404:
 *         description: Order not found
 */
router.put("/orders/:id", OrderProcessingController.updateOrder);

/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     summary: Update order status
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, completed, cancelled]
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       400:
 *         description: Invalid status transition
 *       404:
 *         description: Order not found
 */
router.patch("/orders/:id/status", OrderProcessingController.updateOrderStatus);

/**
 * @swagger
 * /orders/{id}/cancel:
 *   patch:
 *     summary: Cancel an order with required reason
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cancellation_reason
 *             properties:
 *               cancellation_reason:
 *                 type: string
 *                 description: Reason for cancellation (required)
 *                 example: "Customer changed mind"
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid input or cannot cancel completed order
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Order not found
 */
router.patch("/orders/:id/cancel", OrderProcessingController.cancelOrder);

/**
 * @swagger
 * /orders/{id}/items:
 *   post:
 *     summary: Add items to existing order
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               order_items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     menu_item_id:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *                     special_instructions:
 *                       type: string
 *     responses:
 *       200:
 *         description: Items added to order successfully
 *       404:
 *         description: Order not found
 */
router.post("/orders/:id/items", OrderProcessingController.addItemsToOrder);

/**
 * @swagger
 * /orders/{orderId}/items/{itemId}:
 *   delete:
 *     summary: Remove item from order
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order item ID
 *     responses:
 *       200:
 *         description: Item removed from order successfully
 *       404:
 *         description: Order or item not found
 */
router.delete("/orders/:orderId/items/:itemId", OrderProcessingController.removeItemFromOrder);

/**
 * @swagger
 * /orders/{orderId}/items/{itemId}/status:
 *   patch:
 *     summary: Update order item status
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - item_status
 *             properties:
 *               item_status:
 *                 type: string
 *                 enum: [pending, preparing, ready, served]
 *     responses:
 *       200:
 *         description: Order item status updated successfully
 *       404:
 *         description: Order item not found
 */
router.patch("/orders/:orderId/items/:itemId/status", OrderProcessingController.updateOrderItemStatus);

/**
 * @swagger
 * /orders/status/{status}:
 *   get:
 *     summary: Get orders by status
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, completed, cancelled]
 *         description: Order status to filter by
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 */
router.get("/orders/status/:status", OrderProcessingController.getOrdersByStatus);

/**
 * @swagger
 * /orders/kitchen/display:
 *   get:
 *     summary: Get kitchen display orders
 *     tags: [Orders]
 *     description: Returns all pending and in-progress orders for kitchen display
 *     responses:
 *       200:
 *         description: Kitchen orders retrieved successfully
 */
router.get("/orders/kitchen/display", OrderProcessingController.getKitchenOrders);

/**
 * @swagger
 * /orders/{id}/preparation-time:
 *   get:
 *     summary: Get order preparation time estimate
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Preparation time estimate
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 order_id:
 *                   type: integer
 *                 estimated_preparation_time:
 *                   type: integer
 *                 unit:
 *                   type: string
 */
router.get("/orders/:id/preparation-time", OrderProcessingController.getOrderPreparationTime);

// ====================================
// ORDER ITEMS ROUTES
// ====================================

/**
 * @swagger
 * /order-item:
 *   post:
 *     summary: Create a new order item
 *     tags: [Order Items]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *               price:
 *                 type: number
 *               order_id:
 *                 type: integer
 *               menu_item_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Order item created successfully
 */
router.post("/order-item", createOrderItem);

/**
 * @swagger
 * /order-item:
 *   get:
 *     summary: Get all order items
 *     tags: [Order Items]
 *     responses:
 *       200:
 *         description: List of all order items
 */
router.get("/order-item", getAllOrderItems);

/**
 * @swagger
 * /order-item/{id}:
 *   get:
 *     summary: Get a specific order item by ID
 *     tags: [Order Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order item ID
 *     responses:
 *       200:
 *         description: Order item details
 *       404:
 *         description: Order item not found
 */
router.get("/order-item/:id", getOrderItemById);

/**
 * @swagger
 * /order-item/{id}:
 *   put:
 *     summary: Update an order item by ID
 *     tags: [Order Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *               price:
 *                 type: number
 *               order_id:
 *                 type: integer
 *               menu_item_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Order item updated successfully
 */
router.put("/order-item/:id", updateOrderItem);

/**
 * @swagger
 * /order-item/{id}:
 *   delete:
 *     summary: Delete a specific order item by ID
 *     tags: [Order Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order item ID
 *     responses:
 *       200:
 *         description: Order item deleted successfully
 */
router.delete("/order-item/:id", deleteOrderItem);

// ====================================
// RESERVATIONS ROUTES
// ====================================

/**
 * @swagger
 * /reservations:
 *   get:
 *     summary: Get all reservations
 *     tags: [Reservations]
 *     responses:
 *       200:
 *         description: List of all reservations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reservation'
 */
router.get("/reservations", getAllReservations);

/**
 * @swagger
 * /reservations:
 *   post:
 *     summary: Create a new reservation
 *     tags: [Reservations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Reservation'
 *     responses:
 *       201:
 *         description: Reservation created successfully
 *       400:
 *         description: Invalid input
 */
router.post("/reservations", createReservation);

/**
 * @swagger
 * /reservations/{id}:
 *   get:
 *     summary: Get a specific reservation by ID
 *     tags: [Reservations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Reservation ID
 *     responses:
 *       200:
 *         description: Reservation details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
 *       404:
 *         description: Reservation not found
 */
router.get("/reservations/:id", getReservationById);

/**
 * @swagger
 * /reservations/{id}:
 *   put:
 *     summary: Update a reservation by ID
 *     tags: [Reservations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Reservation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Reservation'
 *     responses:
 *       200:
 *         description: Reservation updated successfully
 *       404:
 *         description: Reservation not found
 */
router.put("/reservations/:id", updateReservation);

/**
 * @swagger
 * /reservations/{id}:
 *   delete:
 *     summary: Delete a specific reservation by ID
 *     tags: [Reservations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Reservation ID
 *     responses:
 *       200:
 *         description: Reservation deleted successfully
 *       404:
 *         description: Reservation not found
 */
router.delete("/reservations/:id", deleteReservation);

// ====================================
// INVENTORY ROUTES
// ====================================

/**
 * @swagger
 * /inventory:
 *   post:
 *     summary: Create a new inventory item
 *     tags: [Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Inventory'
 *     responses:
 *       201:
 *         description: Inventory item created successfully
 *       400:
 *         description: Invalid input
 */
router.post("/inventory", createInventoryItem);

/**
 * @swagger
 * /inventory:
 *   get:
 *     summary: Get all inventory items
 *     tags: [Inventory]
 *     responses:
 *       200:
 *         description: List of all inventory items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Inventory'
 */
router.get("/inventory", getAllInventoryItems);

/**
 * @swagger
 * /inventory/{id}:
 *   get:
 *     summary: Get a specific inventory item by ID
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Inventory item ID
 *     responses:
 *       200:
 *         description: Inventory item details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Inventory'
 *       404:
 *         description: Inventory item not found
 */
router.get("/inventory/:id", getInventoryItemById);

/**
 * @swagger
 * /inventory/{id}:
 *   put:
 *     summary: Update an inventory item by ID
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Inventory item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Inventory'
 *     responses:
 *       200:
 *         description: Inventory item updated successfully
 *       404:
 *         description: Inventory item not found
 */
router.put("/inventory/:id", updateInventoryItem);

/**
 * @swagger
 * /inventory/{id}:
 *   delete:
 *     summary: Delete a specific inventory item by ID
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Inventory item ID
 *     responses:
 *       200:
 *         description: Inventory item deleted successfully
 *       404:
 *         description: Inventory item not found
 */
router.delete("/inventory/:id", deleteInventoryItem);

export default router;