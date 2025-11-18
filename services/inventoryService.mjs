// services/inventoryService.mjs
import { Inventory } from '../model/Inventory.mjs';
import { MenuItem } from '../model/MenuItem.mjs';
import { Recipe } from '../model/Recipe.mjs';
import { Order_Item } from '../model/Order_Item.mjs';
import { Op } from '@sequelize/core';
import { sequelize } from '../config/database.mjs';

class InventoryService {
  
  /**
   * Deduct inventory when order is placed
   */
  static async deductInventoryForOrder(orderId) {
    try {
      console.log(`🔄 Deducting inventory for order ${orderId}`);
      
      // Get all order items with their recipes
      const orderItems = await Order_Item.findAll({
        where: { order_id: orderId },
        include: [
          {
            model: MenuItem,
            include: [{
              model: Recipe,
              include: [Inventory]
            }]
          }
        ]
      });

      const inventoryUpdates = [];
      const lowStockAlerts = [];

      for (const orderItem of orderItems) {
        const menuItem = orderItem.MenuItem;
        
        // If menu item tracks inventory, deduct from its stock
        if (menuItem.track_inventory) {
          const newStock = menuItem.current_stock - orderItem.quantity;
          await menuItem.update({ 
            current_stock: Math.max(0, newStock),
            is_available: newStock > 0
          });

          // Check for low stock alert
          if (newStock <= menuItem.low_stock_threshold) {
            lowStockAlerts.push({
              menu_item_id: menuItem.id,
              menu_item_name: menuItem.name,
              current_stock: newStock,
              threshold: menuItem.low_stock_threshold
            });
          }
        }

        // Deduct ingredients from inventory based on recipe
        if (menuItem.Recipes && menuItem.Recipes.length > 0) {
          for (const recipe of menuItem.Recipes) {
            const inventoryItem = recipe.Inventory;
            const quantityToDeduct = recipe.quantity_required * orderItem.quantity;
            const newQuantity = inventoryItem.quantity - quantityToDeduct;

            inventoryUpdates.push({
              inventory_item_id: inventoryItem.id,
              old_quantity: inventoryItem.quantity,
              new_quantity: Math.max(0, newQuantity),
              quantity_deducted: quantityToDeduct
            });

            await inventoryItem.update({
              quantity: Math.max(0, newQuantity),
              last_updated: new Date()
            });

            // Check for low inventory alert
            if (newQuantity <= 5) { // Threshold for inventory items
              lowStockAlerts.push({
                inventory_item_id: inventoryItem.id,
                inventory_item_name: inventoryItem.item_name,
                current_quantity: newQuantity,
                unit: inventoryItem.unit,
                threshold: 5
              });
            }
          }
        }
      }

      console.log(`✅ Inventory deducted for order ${orderId}`);
      
      return {
        success: true,
        order_id: orderId,
        inventory_updates: inventoryUpdates,
        low_stock_alerts: lowStockAlerts
      };

    } catch (error) {
      console.error('❌ Inventory deduction failed:', error);
      throw new Error(`Inventory deduction failed: ${error.message}`);
    }
  }

  /**
   * Check if menu item has sufficient stock
   */
  static async checkMenuItemAvailability(menuItemId, requestedQuantity) {
    try {
      const menuItem = await MenuItem.findByPk(menuItemId);
      
      if (!menuItem) {
        return { available: false, reason: 'Menu item not found' };
      }

      if (!menuItem.is_available) {
        return { available: false, reason: 'Menu item is not available' };
      }

      if (menuItem.track_inventory && menuItem.current_stock < requestedQuantity) {
        return { 
          available: false, 
          reason: `Insufficient stock. Available: ${menuItem.current_stock}, Requested: ${requestedQuantity}` 
        };
      }

      // Check ingredient availability if recipe exists
      const recipes = await Recipe.findAll({
        where: { menu_item_id: menuItemId },
        include: [Inventory]
      });

      const insufficientIngredients = [];
      
      for (const recipe of recipes) {
        const requiredQuantity = recipe.quantity_required * requestedQuantity;
        if (recipe.Inventory.quantity < requiredQuantity) {
          insufficientIngredients.push({
            ingredient: recipe.Inventory.item_name,
            required: requiredQuantity,
            available: recipe.Inventory.quantity,
            unit: recipe.unit
          });
        }
      }

      if (insufficientIngredients.length > 0) {
        return {
          available: false,
          reason: 'Insufficient ingredients',
          insufficient_ingredients: insufficientIngredients
        };
      }

      return { available: true, menuItem };

    } catch (error) {
      throw new Error(`Availability check failed: ${error.message}`);
    }
  }

  /**
   * Restore inventory when order is cancelled
   */
  static async restoreInventoryForOrder(orderId) {
    try {
      console.log(`🔄 Restoring inventory for cancelled order ${orderId}`);
      
      const orderItems = await Order_Item.findAll({
        where: { order_id: orderId },
        include: [
          {
            model: MenuItem,
            include: [{
              model: Recipe,
              include: [Inventory]
            }]
          }
        ]
      });

      const inventoryRestorations = [];

      for (const orderItem of orderItems) {
        const menuItem = orderItem.MenuItem;
        
        // Restore menu item stock
        if (menuItem.track_inventory) {
          const newStock = menuItem.current_stock + orderItem.quantity;
          await menuItem.update({ 
            current_stock: newStock,
            is_available: true
          });
        }

        // Restore ingredient inventory
        if (menuItem.Recipes && menuItem.Recipes.length > 0) {
          for (const recipe of menuItem.Recipes) {
            const inventoryItem = recipe.Inventory;
            const quantityToRestore = recipe.quantity_required * orderItem.quantity;
            const newQuantity = inventoryItem.quantity + quantityToRestore;

            inventoryRestorations.push({
              inventory_item_id: inventoryItem.id,
              quantity_restored: quantityToRestore,
              new_quantity: newQuantity
            });

            await inventoryItem.update({
              quantity: newQuantity,
              last_updated: new Date()
            });
          }
        }
      }

      console.log(`✅ Inventory restored for order ${orderId}`);
      
      return {
        success: true,
        order_id: orderId,
        inventory_restorations: inventoryRestorations
      };

    } catch (error) {
      console.error('❌ Inventory restoration failed:', error);
      throw new Error(`Inventory restoration failed: ${error.message}`);
    }
  }

  /**
   * Get low stock alerts
   */
  static async getLowStockAlerts() {
    try {
      const lowStockMenuItems = await MenuItem.findAll({
        where: {
          track_inventory: true,
          current_stock: {
            [Op.lte]: sequelize.col('low_stock_threshold')
          }
        }
      });

      const lowStockInventory = await Inventory.findAll({
        where: {
          quantity: {
            [Op.lte]: 5 // Threshold for inventory items
          }
        }
      });

      return {
        low_stock_menu_items: lowStockMenuItems,
        low_stock_inventory: lowStockInventory,
        alert_count: lowStockMenuItems.length + lowStockInventory.length
      };

    } catch (error) {
      throw new Error(`Failed to get low stock alerts: ${error.message}`);
    }
  }

  /**
   * Update inventory manually (for receiving stock)
   */
  static async updateInventoryItem(inventoryId, newQuantity, action = 'set') {
    try {
      const inventoryItem = await Inventory.findByPk(inventoryId);

      // console.log(typeof(inventoryItem.quantity))
      
      if (!inventoryItem) {
        throw new Error('Inventory item not found');
      }

      let finalQuantity;
      switch (action) {
        case 'add':
          finalQuantity = inventoryItem.quantity + newQuantity;
          break;
        case 'subtract':
          finalQuantity = Math.max(0, inventoryItem.quantity - newQuantity);
          break;
        case 'set':
        default:
          finalQuantity = newQuantity;
          break;
      }

      await inventoryItem.update({
        quantity: finalQuantity,
        last_updated: new Date()
      });

      return {
        inventory_item: inventoryItem,
        old_quantity: inventoryItem.quantity,
        new_quantity: finalQuantity,
        action: action
      };

    } catch (error) {
      throw new Error(`Inventory update failed: ${error.message}`);
    }
  }
}

export default InventoryService;