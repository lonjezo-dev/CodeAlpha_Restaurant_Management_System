const MenuItem = require("./model/MenuItem");
const { createMenuItem, getAllMenuItems, getMenuItem, updateMenuItem, deleteMenuItem, deleteAllMenuItems } = require("./controller");
const express = require("express");
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

module.exports = router;