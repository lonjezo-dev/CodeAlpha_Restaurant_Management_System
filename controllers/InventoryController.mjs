// controllers/InventoryController.mjs
import InventoryService from "../services/inventoryService.mjs";
import { Inventory } from "../model/Inventory.mjs";
import { MenuItem } from "../model/MenuItem.mjs";
import { Recipe } from "../model/Recipe.mjs";
import { Op } from '@sequelize/core';
import { sequelize } from "../config/database.mjs";

export class InventoryController {

    // ✅ Get all inventory items with filtering and pagination
    static async getAllInventoryItems(req, res) {
        const { 
            category, 
            low_stock_only = false, 
            page = 1, 
            limit = 50,
            search 
        } = req.query;
        
        try {
            const whereClause = {};
            const offset = (parseInt(page) - 1) * parseInt(limit);
            
            if (category) whereClause.category = category;
            if (low_stock_only === 'true') {
                whereClause.quantity = {
                    [Op.lte]: 5 // Low stock threshold
                };
            }
            if (search) {
                whereClause.item_name = {
                    [Op.iLike]: `%${search}%`
                };
            }
            
            const { count, rows: inventoryItems } = await Inventory.findAndCountAll({
                where: whereClause,
                order: [['item_name', 'ASC']],
                limit: parseInt(limit),
                offset: offset
            });
            
            res.json({
                inventory_items: inventoryItems,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: Math.ceil(count / limit),
                    total_items: count,
                    has_next: offset + inventoryItems.length < count,
                    has_prev: page > 1
                }
            });
            
        } catch (error) {
            console.error('Get inventory items error:', error);
            res.status(500).json({ 
                error: 'Failed to retrieve inventory items', 
                details: error.message 
            });
        }
    }

    // ✅ Get inventory item by ID
    static async getInventoryItemById(req, res) {
        const { id } = req.params;
        
        try {
            const inventoryItem = await Inventory.findByPk(id, {
                include: [{
                    model: Recipe,
                    include: [{
                        model: MenuItem,
                        attributes: ['id', 'name', 'category']
                    }]
                }]
            });
            
            if (!inventoryItem) {
                return res.status(404).json({ error: 'Inventory item not found' });
            }
            
            res.json(inventoryItem);
            
        } catch (error) {
            console.error('Get inventory item error:', error);
            res.status(500).json({ 
                error: 'Failed to retrieve inventory item', 
                details: error.message 
            });
        }
    }

    // ✅ Create new inventory item
    static async createInventoryItem(req, res) {
        const { 
            item_name, 
            category, 
            quantity, 
            unit, 
            unit_cost, 
            supplier, 
            min_stock_level,
            reorder_quantity 
        } = req.body;
        
        try {
            // Validate required fields
            if (!item_name || !category || quantity === undefined || !unit) {
                return res.status(400).json({ 
                    error: 'Item name, category, quantity, and unit are required' 
                });
            }
            
            const inventoryItem = await Inventory.create({
                item_name,
                category,
                quantity: parseFloat(quantity) || 0,
                unit,
                unit_cost: parseFloat(unit_cost) || 0,
                supplier: supplier || null,
                min_stock_level: parseFloat(min_stock_level) || 0,
                reorder_quantity: parseFloat(reorder_quantity) || 0,
                last_updated: new Date()
            });
            
            res.status(201).json({
                message: 'Inventory item created successfully',
                inventory_item: inventoryItem
            });
            
        } catch (error) {
            console.error('Create inventory item error:', error);
            res.status(500).json({ 
                error: 'Failed to create inventory item', 
                details: error.message 
            });
        }
    }

    // ✅ Update inventory item
    static async updateInventoryItem(req, res) {
        const { id } = req.params;
        const { 
            item_name, 
            category, 
            quantity, 
            unit, 
            unit_cost, 
            supplier, 
            min_stock_level,
            reorder_quantity 
        } = req.body;
        
        try {
            const inventoryItem = await Inventory.findByPk(id);
            if (!inventoryItem) {
                return res.status(404).json({ error: 'Inventory item not found' });
            }
            
            const updateData = {};
            if (item_name !== undefined) updateData.item_name = item_name;
            if (category !== undefined) updateData.category = category;
            if (quantity !== undefined) updateData.quantity = parseFloat(quantity);
            if (unit !== undefined) updateData.unit = unit;
            if (unit_cost !== undefined) updateData.unit_cost = parseFloat(unit_cost);
            if (supplier !== undefined) updateData.supplier = supplier;
            if (min_stock_level !== undefined) updateData.min_stock_level = parseFloat(min_stock_level);
            if (reorder_quantity !== undefined) updateData.reorder_quantity = parseFloat(reorder_quantity);
            
            updateData.last_updated = new Date();
            
            await inventoryItem.update(updateData);
            
            res.json({
                message: 'Inventory item updated successfully',
                inventory_item: inventoryItem
            });
            
        } catch (error) {
            console.error('Update inventory item error:', error);
            res.status(500).json({ 
                error: 'Failed to update inventory item', 
                details: error.message 
            });
        }
    }

    // ✅ Update inventory quantity (add, subtract, set)
    static async updateInventoryQuantity(req, res) {
        const { id } = req.params;
        const { quantity, action = 'set', reason } = req.body;
        
        const validActions = ['add', 'subtract', 'set'];
        
        try {
            if (!validActions.includes(action)) {
                return res.status(400).json({ error: 'Invalid action. Use: add, subtract, or set' });
            }
            
            if (quantity === undefined || quantity < 0) {
                return res.status(400).json({ error: 'Valid quantity is required' });
            }
            
            const result = await InventoryService.updateInventoryItem(id, quantity, action);
            
            res.json({
                message: `Inventory quantity ${action}ed successfully`,
                reason: reason || 'Manual adjustment',
                ...result
            });
            
        } catch (error) {
            console.error('Update inventory quantity error:', error);
            res.status(500).json({ 
                error: 'Failed to update inventory quantity', 
                details: error.message 
            });
        }
    }

    // ✅ Delete inventory item
    static async deleteInventoryItem(req, res) {
        const { id } = req.params;
        
        try {
            const inventoryItem = await Inventory.findByPk(id);
            if (!inventoryItem) {
                return res.status(404).json({ error: 'Inventory item not found' });
            }
            
            // Check if inventory item is used in any recipes
            const recipes = await Recipe.count({
                where: { inventory_id: id }
            });
            
            if (recipes > 0) {
                return res.status(400).json({ 
                    error: 'Cannot delete inventory item that is used in recipes' 
                });
            }
            
            await inventoryItem.destroy();
            
            res.json({
                message: 'Inventory item deleted successfully'
            });
            
        } catch (error) {
            console.error('Delete inventory item error:', error);
            res.status(500).json({ 
                error: 'Failed to delete inventory item', 
                details: error.message 
            });
        }
    }

    // ✅ Get low stock alerts
    static async getLowStockAlerts(req, res) {
        try {
            const alerts = await InventoryService.getLowStockAlerts();
            
            res.json(alerts);
            
        } catch (error) {
            console.error('Get low stock alerts error:', error);
            res.status(500).json({ 
                error: 'Failed to retrieve low stock alerts', 
                details: error.message 
            });
        }
    }

    // ✅ Check menu item availability
    static async checkMenuItemAvailability(req, res) {
        const { menu_item_id, quantity } = req.body;
        
        try {
            if (!menu_item_id || !quantity) {
                return res.status(400).json({
                    error: 'Menu item ID and quantity are required'
                });
            }
            
            const availability = await InventoryService.checkMenuItemAvailability(menu_item_id, quantity);
            
            res.json(availability);
            
        } catch (error) {
            console.error('Check menu item availability error:', error);
            res.status(500).json({ 
                error: 'Failed to check menu item availability', 
                details: error.message 
            });
        }
    }

    // ✅ Get inventory usage statistics
    static async getInventoryStatistics(req, res) {
        const { startDate, endDate } = req.query;
        
        try {
            // This would typically involve more complex analytics
            // For now, return basic inventory statistics
            
            const totalItems = await Inventory.count();
            const lowStockItems = await Inventory.count({
                where: {
                    quantity: {
                        [Op.lte]: 5
                    }
                }
            });
            
            const outOfStockItems = await Inventory.count({
                where: {
                    quantity: 0
                }
            });
            
            const totalInventoryValue = await Inventory.sum('quantity * unit_cost');
            
            const categoryStats = await Inventory.findAll({
                attributes: [
                    'category',
                    [sequelize.fn('COUNT', sequelize.col('id')), 'item_count'],
                    [sequelize.fn('SUM', sequelize.col('quantity')), 'total_quantity'],
                    [sequelize.fn('SUM', sequelize.literal('quantity * unit_cost')), 'total_value']
                ],
                group: ['category'],
                raw: true
            });
            
            res.json({
                summary: {
                    total_items: totalItems,
                    low_stock_items: lowStockItems,
                    out_of_stock_items: outOfStockItems,
                    total_inventory_value: totalInventoryValue || 0
                },
                category_stats: categoryStats,
                low_stock_percentage: totalItems > 0 ? (lowStockItems / totalItems * 100).toFixed(2) : 0
            });
            
        } catch (error) {
            console.error('Get inventory statistics error:', error);
            res.status(500).json({ 
                error: 'Failed to retrieve inventory statistics', 
                details: error.message 
            });
        }
    }

    // ✅ Get inventory categories
    static async getInventoryCategories(req, res) {
        try {
            const categories = await Inventory.findAll({
                attributes: [
                    'category',
                    [sequelize.fn('COUNT', sequelize.col('id')), 'item_count']
                ],
                group: ['category'],
                order: [['category', 'ASC']]
            });
            
            res.json(categories);
            
        } catch (error) {
            console.error('Get inventory categories error:', error);
            res.status(500).json({ 
                error: 'Failed to retrieve inventory categories', 
                details: error.message 
            });
        }
    }

    // ✅ Bulk update inventory (for stock receiving)
    static async bulkUpdateInventory(req, res) {
        const { updates } = req.body;
        
        try {
            if (!updates || !Array.isArray(updates) || updates.length === 0) {
                return res.status(400).json({ 
                    error: 'Updates array is required' 
                });
            }
            
            const results = [];
            
            await sequelize.transaction(async (t) => {
                for (const update of updates) {
                    const { inventory_id, quantity, action = 'add', reason } = update;
                    
                    try {
                        const result = await InventoryService.updateInventoryItem(
                            inventory_id, 
                            quantity, 
                            action
                        );
                        
                        results.push({
                            inventory_id,
                            success: true,
                            ...result,
                            reason: reason || 'Bulk update'
                        });
                        
                    } catch (itemError) {
                        results.push({
                            inventory_id,
                            success: false,
                            error: itemError.message
                        });
                    }
                }
            });
            
            const successful = results.filter(r => r.success).length;
            const failed = results.filter(r => !r.success).length;
            
            res.json({
                message: `Bulk update completed: ${successful} successful, ${failed} failed`,
                results,
                summary: {
                    total: results.length,
                    successful,
                    failed
                }
            });
            
        } catch (error) {
            console.error('Bulk update inventory error:', error);
            res.status(500).json({ 
                error: 'Failed to perform bulk inventory update', 
                details: error.message 
            });
        }
    }

    // ✅ Get inventory items needing reorder
    static async getReorderSuggestions(req, res) {
        try {
            const reorderItems = await Inventory.findAll({
                where: {
                    quantity: {
                        [Op.lte]: sequelize.col('min_stock_level')
                    }
                },
                order: [['quantity', 'ASC']]
            });
            
            const suggestions = reorderItems.map(item => ({
                inventory_item: item,
                suggested_order_quantity: item.reorder_quantity || (item.min_stock_level * 2 - item.quantity),
                urgency: item.quantity === 0 ? 'critical' : 
                        item.quantity <= item.min_stock_level * 0.5 ? 'high' : 'medium'
            }));
            
            res.json({
                reorder_suggestions: suggestions,
                total_needing_reorder: reorderItems.length
            });
            
        } catch (error) {
            console.error('Get reorder suggestions error:', error);
            res.status(500).json({ 
                error: 'Failed to retrieve reorder suggestions', 
                details: error.message 
            });
        }
    }
}