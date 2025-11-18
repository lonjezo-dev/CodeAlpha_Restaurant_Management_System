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

      console.log('📦 Order items count:', orderItems.length);

      // Debug data structure
      console.log('🔍 Debugging data structure:');
      orderItems.forEach((item, index) => {
        console.log(`OrderItem ${index}:`, {
          id: item.id,
          menu_item_id: item.menu_item_id,
          hasMenuItem: !!item.MenuItem,
          menuItemId: item.MenuItem?.id,
          menuItemName: item.MenuItem?.name,
          menuItemData: item.MenuItem ? {
            id: item.MenuItem.id,
            name: item.MenuItem.name,
            track_inventory: item.MenuItem.track_inventory,
            current_stock: item.MenuItem.current_stock
          } : 'NO MENU ITEM'
        });
      });

      const inventoryUpdates = [];
      const lowStockAlerts = [];

      for (const orderItem of orderItems) {
        // Access the menuItem properly - check if it exists
        const menuItem = orderItem.MenuItem;

        console.log('🔍 MenuItem:', menuItem ? `Found (ID: ${menuItem.id})` : 'NOT FOUND');

        // Skip if menuItem is not found
        if (!menuItem) {
          console.warn(`⚠️ MenuItem not found for order item ${orderItem.id}`);
          continue;
        }

        console.log(`📋 Processing: ${menuItem.name}, Track Inventory: ${menuItem.track_inventory}`);
        
        // If menu item tracks inventory, deduct from its stock
        if (menuItem.track_inventory) {
          const currentStock = parseFloat(menuItem.current_stock);
          const newStock = currentStock - orderItem.quantity;
          
          await menuItem.update({ 
            current_stock: Math.max(0, newStock),
            is_available: newStock > 0
          });

          console.log(`📊 Updated menu item stock: ${currentStock} -> ${newStock}`);

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
        // Check if Recipes exists and is an array
        const recipes = menuItem.Recipes || [];
        if (recipes.length > 0) {
          for (const recipe of recipes) {
            const inventoryItem = recipe.Inventory;
            if (!inventoryItem) {
              console.warn(`⚠️ Inventory item not found for recipe ${recipe.id}`);
              continue;
            }

            const quantityToDeduct = recipe.quantity_required * orderItem.quantity;
            const currentInventoryQty = parseFloat(inventoryItem.quantity);
            const newQuantity = currentInventoryQty - quantityToDeduct;

            inventoryUpdates.push({
              inventory_item_id: inventoryItem.id,
              old_quantity: currentInventoryQty,
              new_quantity: Math.max(0, newQuantity),
              quantity_deducted: quantityToDeduct
            });

            await inventoryItem.update({
              quantity: Math.max(0, newQuantity),
              last_updated: new Date()
            });

            console.log(`📦 Updated inventory: ${inventoryItem.item_name}, ${currentInventoryQty} -> ${newQuantity}`);

            // Check for low inventory alert
            if (newQuantity <= 5) {
              lowStockAlerts.push({
                inventory_item_id: inventoryItem.id,
                inventory_item_name: inventoryItem.item_name,
                current_quantity: newQuantity,
                unit: inventoryItem.unit,
                threshold: 5
              });
            }
          }
        } else {
          console.log(`📝 No recipes found for menu item: ${menuItem.name}`);
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

      console.log('📦 Order items count for restoration:', orderItems.length);

      const inventoryRestorations = [];

      for (const orderItem of orderItems) {
        const menuItem = orderItem.MenuItem;
        
        // Skip if menuItem is not found
        if (!menuItem) {
          console.warn(`⚠️ MenuItem not found for order item ${orderItem.id}`);
          continue;
        }
        
        // Restore menu item stock
        if (menuItem.track_inventory) {
          const currentStock = parseFloat(menuItem.current_stock);
          const newStock = currentStock + orderItem.quantity;
          await menuItem.update({ 
            current_stock: newStock,
            is_available: true
          });
          console.log(`📊 Restored menu item stock: ${currentStock} -> ${newStock}`);
        }

        // Restore ingredient inventory
        const recipes = menuItem.Recipes || [];
        if (recipes.length > 0) {
          for (const recipe of recipes) {
            const inventoryItem = recipe.Inventory;
            if (!inventoryItem) {
              console.warn(`⚠️ Inventory item not found for recipe ${recipe.id}`);
              continue;
            }

            const quantityToRestore = recipe.quantity_required * orderItem.quantity;
            const currentInventoryQty = parseFloat(inventoryItem.quantity);
            const newQuantity = currentInventoryQty + quantityToRestore;

            inventoryRestorations.push({
              inventory_item_id: inventoryItem.id,
              quantity_restored: quantityToRestore,
              new_quantity: newQuantity
            });

            await inventoryItem.update({
              quantity: newQuantity,
              last_updated: new Date()
            });

            console.log(`📦 Restored inventory: ${inventoryItem.item_name}, ${currentInventoryQty} -> ${newQuantity}`);
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
      
      if (!inventoryItem) {
        throw new Error('Inventory item not found');
      }

      // Parse quantities to ensure they are numbers
      const currentQuantity = parseFloat(inventoryItem.quantity);
      const quantityNum = parseFloat(newQuantity);

      let finalQuantity;
      switch (action) {
        case 'add':
          finalQuantity = currentQuantity + quantityNum;
          break;
        case 'subtract':
          finalQuantity = Math.max(0, currentQuantity - quantityNum);
          break;
        case 'set':
        default:
          finalQuantity = quantityNum;
          break;
      }

      await inventoryItem.update({
        quantity: finalQuantity,
        last_updated: new Date()
      });

      console.log(`📦 Manual inventory update: ${inventoryItem.item_name}, ${currentQuantity} -> ${finalQuantity}`);

      return {
        inventory_item: inventoryItem,
        old_quantity: currentQuantity,
        new_quantity: finalQuantity,
        action: action
      };

    } catch (error) {
      throw new Error(`Inventory update failed: ${error.message}`);
    }
  }

  /**
   * Bulk update inventory (for stock receiving)
   */
  static async bulkUpdateInventory(updates) {
    try {
      const results = [];
      
      for (const update of updates) {
        const { inventory_id, quantity, action = 'add', reason } = update;
        
        try {
          const result = await this.updateInventoryItem(inventory_id, quantity, action);
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

      return results;

    } catch (error) {
      throw new Error(`Bulk inventory update failed: ${error.message}`);
    }
  }

  /**
   * Get inventory statistics
   */
  static async getInventoryStatistics() {
    try {
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

      return {
        summary: {
          total_items: totalItems,
          low_stock_items: lowStockItems,
          out_of_stock_items: outOfStockItems,
          total_inventory_value: totalInventoryValue || 0
        },
        category_stats: categoryStats,
        low_stock_percentage: totalItems > 0 ? (lowStockItems / totalItems * 100).toFixed(2) : 0
      };

    } catch (error) {
      throw new Error(`Failed to get inventory statistics: ${error.message}`);
    }
  }
}

export default InventoryService;