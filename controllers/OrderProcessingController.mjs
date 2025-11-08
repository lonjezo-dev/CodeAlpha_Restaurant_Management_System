import { Order } from "../model/Order.mjs";
import  { Order_Item }  from "../model/Order_Item.mjs";
import { MenuItem } from "../model/MenuItem.mjs";
import { Table }  from "../model/Table.mjs";
import { Op } from '@sequelize/core';
import { sequelize } from "../config/database.mjs";

export class OrderProcessingController {
    
    // ✅ Create complete order with items
    static async createCompleteOrder(req, res) {
        const { table_id, order_items, customer_notes } = req.body;
        
        try {
            // Validate required fields
            if (!table_id || !order_items || !Array.isArray(order_items) || order_items.length === 0) {
                return res.status(400).json({ 
                    error: 'Table ID and order items are required' 
                });
            }

            // Check if table exists and is available
            const table = await Table.findByPk(table_id);
            if (!table) {
                return res.status(404).json({ error: 'Table not found' });
            }
            if (table.status === 'occupied') {
                return res.status(400).json({ error: 'Table is already occupied' });
            }

            const result = await sequelize.transaction(async (t) => {
                // 1. Calculate total amount and validate menu items
                let total_amount = 0;
                const menuItems = [];
                
                for (const item of order_items) {
                    if (!item.menu_item_id || !item.quantity) {
                        throw new Error('Each order item must have menu_item_id and quantity');
                    }

                    const menuItem = await MenuItem.findByPk(item.menu_item_id, { transaction: t });
                    if (!menuItem) {
                        throw new Error(`Menu item with ID ${item.menu_item_id} not found`);
                    }
                    
                    total_amount += parseFloat(menuItem.price) * parseInt(item.quantity);
                    menuItems.push({ 
                        ...menuItem.toJSON(), 
                        orderQuantity: item.quantity,
                        special_instructions: item.special_instructions 
                    });
                }

                // 2. Create order
                const order = await Order.create({
                    table_id,
                    total_amount,
                    order_status: 'pending',
                    order_time: new Date(),
                    customer_notes
                }, { transaction: t });
                
                // 3. Create order items with current prices
                const orderItemsData = order_items.map(item => {
                    const menuItem = menuItems.find(mi => mi.id === item.menu_item_id);
                    return {
                        order_id: order.id,
                        menu_item_id: item.menu_item_id,
                        quantity: item.quantity,
                        price: menuItem.price,
                        special_instructions: item.special_instructions,
                        item_status: 'pending'
                    };
                });
                
                await Order_Item.bulkCreate(orderItemsData, { transaction: t });
                
                // 4. Update table status to occupied
                await Table.update(
                    { status: 'occupied' },
                    { where: { id: table_id }, transaction: t }
                );
                
                return { order, order_items: orderItemsData };
            });
            
            res.status(201).json({
                message: 'Order created successfully',
                order: result.order,
                items: result.order_items
            });
            
        } catch (error) {
            console.error('Order creation error:', error);
            res.status(500).json({ 
                error: 'Failed to create order', 
                details: error.message 
            });
        }
    }
    
    // ✅ Get all orders with filtering and pagination
    static async getAllOrders(req, res) {
        const { status, table_id, date, page = 1, limit = 10 } = req.query;
        
        try {
            const whereClause = {};
            const offset = (parseInt(page) - 1) * parseInt(limit);
            
            if (status) whereClause.order_status = status;
            if (table_id) whereClause.table_id = table_id;
            if (date) {
                whereClause.order_time = {
                    [Op.between]: [
                        new Date(date + ' 00:00:00'),
                        new Date(date + ' 23:59:59')
                    ]
                };
            }
            
            const { count, rows: orders } = await Order.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: Table,
                        attributes: ['id', 'table_number', 'capacity']
                    },
                    {
                        model: Order_Item,
                        include: [{
                            model: MenuItem,
                            attributes: ['id', 'name', 'price', 'category']
                        }]
                    }
                ],
                order: [['createdAt', 'DESC']],
                limit: parseInt(limit),
                offset: offset
            });
            
            res.json({
                orders,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: Math.ceil(count / limit),
                    total_orders: count,
                    has_next: offset + orders.length < count,
                    has_prev: page > 1
                }
            });
            
        } catch (error) {
            console.error('Get orders error:', error);
            res.status(500).json({ 
                error: 'Failed to retrieve orders', 
                details: error.message 
            });
        }
    }
    
    // ✅ Get order details
    static async getOrderDetails(req, res) {
        const { id } = req.params;
        
        try {
            const order = await Order.findByPk(id, {
                include: [
                    {
                        model: Table,
                        attributes: ['id', 'table_number', 'capacity', 'status']
                    },
                    {
                        model: Order_Item,
                        include: [{
                            model: MenuItem,
                            attributes: ['id', 'name', 'description', 'category', 'price']
                        }]
                    }
                ]
            });
            
            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            }
            
            res.json(order);
            
        } catch (error) {
            console.error('Get order details error:', error);
            res.status(500).json({ 
                error: 'Failed to retrieve order details', 
                details: error.message 
            });
        }
    }
    
    // ✅ Enhanced update order
    static async updateOrder(req, res) {
        const { id } = req.params;
        const { table_id, customer_notes, preparation_notes } = req.body;
        
        try {
            const order = await Order.findByPk(id);
            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            }
            
            // Prevent updates to completed/cancelled orders
            if (['completed', 'cancelled'].includes(order.order_status)) {
                return res.status(400).json({ 
                    error: 'Cannot update completed or cancelled orders' 
                });
            }
            
            const updateData = {};
            if (table_id !== undefined) {
                // If changing table, update both tables' status
                if (table_id !== order.table_id) {
                    await sequelize.transaction(async (t) => {
                        // Free old table
                        await Table.update(
                            { status: 'available' },
                            { where: { id: order.table_id }, transaction: t }
                        );
                        // Occupy new table
                        await Table.update(
                            { status: 'occupied' },
                            { where: { id: table_id }, transaction: t }
                        );
                    });
                    updateData.table_id = table_id;
                }
            }
            if (customer_notes !== undefined) updateData.customer_notes = customer_notes;
            if (preparation_notes !== undefined) updateData.preparation_notes = preparation_notes;
            
            await order.update(updateData);
            
            res.json({ 
                message: 'Order updated successfully', 
                order 
            });
            
        } catch (error) {
            console.error('Update order error:', error);
            res.status(500).json({ 
                error: 'Failed to update order', 
                details: error.message 
            });
        }
    }
    
    // ✅ Enhanced cancel order
    static async cancelOrder(req, res) {
        const { id } = req.params;
        const { cancellation_reason } = req.body;
        
        try {
            const order = await Order.findByPk(id);
            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            }
            
            if (order.order_status === 'completed') {
                return res.status(400).json({ 
                    error: 'Cannot cancel completed orders' 
                });
            }
            
            await sequelize.transaction(async (t) => {
                // Update order status
                await order.update({ 
                    order_status: 'cancelled',
                    cancellation_reason: cancellation_reason
                }, { transaction: t });
                
                // Free up the table
                await Table.update(
                    { status: 'available' },
                    { where: { id: order.table_id }, transaction: t }
                );
            });
            
            res.json({ 
                message: 'Order cancelled successfully', 
                order 
            });
            
        } catch (error) {
            console.error('Cancel order error:', error);
            res.status(500).json({ 
                error: 'Failed to cancel order', 
                details: error.message 
            });
        }
    }
    
    // ✅ Order status update with validation
    static async updateOrderStatus(req, res) {
        const { id } = req.params;
        const { status } = req.body;
        
        const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
        const validTransitions = {
            'pending': ['in_progress', 'cancelled'],
            'in_progress': ['completed', 'cancelled'],
            'completed': [],
            'cancelled': []
        };
        
        try {
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ error: 'Invalid order status' });
            }
            
            const order = await Order.findByPk(id);
            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            }
            
            // Validate status transition
            if (!validTransitions[order.order_status].includes(status)) {
                return res.status(400).json({ 
                    error: `Invalid status transition from ${order.order_status} to ${status}` 
                });
            }
            
            await order.update({ order_status: status });
            
            // If order is completed or cancelled, free up the table
            if (status === 'completed' || status === 'cancelled') {
                await Table.update(
                    { status: 'available' },
                    { where: { id: order.table_id } }
                );
            }
            
            res.json({ 
                message: 'Order status updated successfully', 
                order 
            });
            
        } catch (error) {
            console.error('Update order status error:', error);
            res.status(500).json({ 
                error: 'Failed to update order status', 
                details: error.message 
            });
        }
    }
    
    // ✅ Add items to existing order
    static async addItemsToOrder(req, res) {
        const { id } = req.params;
        const { order_items } = req.body;
        
        try {
            if (!order_items || !Array.isArray(order_items) || order_items.length === 0) {
                return res.status(400).json({ error: 'Order items are required' });
            }

            const result = await sequelize.transaction(async (t) => {
                const order = await Order.findByPk(id, { transaction: t });
                if (!order) {
                    throw new Error('Order not found');
                }
                
                if (order.order_status === 'completed' || order.order_status === 'cancelled') {
                    throw new Error('Cannot add items to completed or cancelled order');
                }
                
                let additionalTotal = 0;
                const newOrderItems = [];
                
                for (const item of order_items) {
                    if (!item.menu_item_id || !item.quantity) {
                        throw new Error('Each item must have menu_item_id and quantity');
                    }

                    const menuItem = await MenuItem.findByPk(item.menu_item_id, { transaction: t });
                    if (!menuItem) {
                        throw new Error(`Menu item with ID ${item.menu_item_id} not found`);
                    }
                    
                    additionalTotal += parseFloat(menuItem.price) * parseInt(item.quantity);
                    
                    newOrderItems.push({
                        order_id: order.id,
                        menu_item_id: item.menu_item_id,
                        quantity: item.quantity,
                        price: menuItem.price,
                        special_instructions: item.special_instructions,
                        item_status: 'pending'
                    });
                }
                
                // Update order total
                await order.update({
                    total_amount: parseFloat(order.total_amount) + additionalTotal
                }, { transaction: t });
                
                // Add new order items
                await Order_Item.bulkCreate(newOrderItems, { transaction: t });
                
                return newOrderItems;
            });
            
            res.json({
                message: 'Items added to order successfully',
                added_items: result
            });
            
        } catch (error) {
            console.error('Add items to order error:', error);
            res.status(500).json({ 
                error: 'Failed to add items to order', 
                details: error.message 
            });
        }
    }
    
    // ✅ Remove item from order
    static async removeItemFromOrder(req, res) {
        const { orderId, itemId } = req.params;
        
        try {
            const result = await sequelize.transaction(async (t) => {
                const order = await Order.findByPk(orderId, { transaction: t });
                if (!order) {
                    throw new Error('Order not found');
                }
                
                if (['completed', 'cancelled'].includes(order.order_status)) {
                    throw new Error('Cannot modify completed or cancelled orders');
                }
                
                const orderItem = await Order_Item.findOne({
                    where: { id: itemId, order_id: orderId },
                    transaction: t
                });
                
                if (!orderItem) {
                    throw new Error('Order item not found');
                }
                
                // Recalculate total
                const itemTotal = parseFloat(orderItem.price) * parseInt(orderItem.quantity);
                const newTotal = Math.max(0, parseFloat(order.total_amount) - itemTotal);
                
                // Remove item
                await Order_Item.destroy({
                    where: { id: itemId },
                    transaction: t
                });
                
                // Update order total
                await order.update({
                    total_amount: newTotal
                }, { transaction: t });
                
                return { removed_item: orderItem, new_total: newTotal };
            });
            
            res.json({
                message: 'Item removed from order successfully',
                ...result
            });
            
        } catch (error) {
            console.error('Remove item from order error:', error);
            res.status(500).json({ 
                error: 'Failed to remove item from order', 
                details: error.message 
            });
        }
    }
    
    // ✅ Update order item status
    static async updateOrderItemStatus(req, res) {
        const { orderId, itemId } = req.params;
        const { item_status } = req.body;
        
        const validStatuses = ['pending', 'preparing', 'ready', 'served'];
        
        try {
            if (!validStatuses.includes(item_status)) {
                return res.status(400).json({ error: 'Invalid item status' });
            }
            
            const orderItem = await Order_Item.findOne({
                where: { id: itemId, order_id: orderId },
                include: [{ model: MenuItem, attributes: ['name'] }]
            });
            
            if (!orderItem) {
                return res.status(404).json({ error: 'Order item not found' });
            }
            
            await orderItem.update({ item_status });
            
            res.json({
                message: 'Order item status updated successfully',
                order_item: orderItem
            });
            
        } catch (error) {
            console.error('Update order item status error:', error);
            res.status(500).json({ 
                error: 'Failed to update order item status', 
                details: error.message 
            });
        }
    }
    
    // ✅ Get orders by status
    static async getOrdersByStatus(req, res) {
        const { status } = req.params;
        
        const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        
        try {
            const orders = await Order.findAll({
                where: { order_status: status },
                include: [
                    {
                        model: Table,
                        attributes: ['table_number']
                    },
                    {
                        model: Order_Item,
                        include: [{
                            model: MenuItem,
                            attributes: ['name', 'category']
                        }]
                    }
                ],
                order: [['order_time', 'ASC']]
            });
            
            res.json(orders);
            
        } catch (error) {
            console.error('Get orders by status error:', error);
            res.status(500).json({ 
                error: 'Failed to retrieve orders', 
                details: error.message 
            });
        }
    }
    
    // ✅ Kitchen display system - get in-progress orders
    static async getKitchenOrders(req, res) {
        try {
            const orders = await Order.findAll({
                where: { 
                    order_status: ['pending', 'in_progress'] 
                },
                include: [
                    {
                        model: Table,
                        attributes: ['table_number']
                    },
                    {
                        model: Order_Item,
                        where: {
                            item_status: ['pending', 'preparing']
                        },
                        required: false,
                        include: [{
                            model: MenuItem,
                            attributes: ['id', 'name', 'category']
                        }]
                    }
                ],
                order: [
                    ['order_time', 'ASC'],
                    [Order_Item, 'id', 'ASC']
                ]
            });
            
            res.json(orders);
            
        } catch (error) {
            console.error('Get kitchen orders error:', error);
            res.status(500).json({ 
                error: 'Failed to retrieve kitchen orders', 
                details: error.message 
            });
        }
    }
    
    // ✅ Calculate estimated preparation time
    static async getOrderPreparationTime(req, res) {
        const { id } = req.params;
        
        try {
            const order = await Order.findByPk(id, {
                include: [{
                    model: Order_Item,
                    include: [MenuItem]
                }]
            });
            
            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            }
            
            // Simple estimation logic
            let totalPrepTime = 0;
            let itemCount = 0;
            
            order.Order_Items.forEach(orderItem => {
                // Assume each item takes 5-15 minutes based on category
                const categoryPrepTimes = {
                    'appetizer': 5,
                    'main': 10,
                    'dessert': 5,
                    'beverage': 2
                };
                
                const prepTime = categoryPrepTimes[orderItem.MenuItem.category] || 8;
                totalPrepTime += prepTime * orderItem.quantity;
                itemCount += orderItem.quantity;
            });
            
            // Average prep time with parallel cooking consideration
            const estimatedTime = Math.ceil(totalPrepTime / Math.max(1, Math.min(3, itemCount)));
            
            res.json({
                order_id: id,
                estimated_preparation_time: estimatedTime,
                unit: 'minutes'
            });
            
        } catch (error) {
            console.error('Get preparation time error:', error);
            res.status(500).json({ 
                error: 'Failed to calculate preparation time', 
                details: error.message 
            });
        }
    }
    
    // ✅ Get order statistics
    static async getOrderStatistics(req, res) {
        const { startDate, endDate } = req.query;
        
        try {
            const whereClause = {};
            if (startDate && endDate) {
                whereClause.order_time = {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                };
            }
            
            const statistics = await Order.findAll({
                where: whereClause,
                attributes: [
                    'order_status',
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
                    [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_revenue']
                ],
                group: ['order_status'],
                raw: true
            });
            
            // Calculate additional statistics
            const totalOrders = statistics.reduce((sum, stat) => sum + parseInt(stat.count), 0);
            const totalRevenue = statistics.reduce((sum, stat) => sum + parseFloat(stat.total_revenue || 0), 0);
            
            res.json({
                statistics,
                summary: {
                    total_orders: totalOrders,
                    total_revenue: totalRevenue,
                    average_order_value: totalOrders > 0 ? totalRevenue / totalOrders : 0
                }
            });
            
        } catch (error) {
            console.error('Get order statistics error:', error);
            res.status(500).json({ 
                error: 'Failed to retrieve order statistics', 
                details: error.message 
            });
        }
    }
    
    // ✅ Get today's orders summary
    static async getTodaysOrders(req, res) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            const orders = await Order.findAll({
                where: {
                    order_time: {
                        [Op.between]: [today, tomorrow]
                    }
                },
                include: [
                    {
                        model: Table,
                        attributes: ['table_number']
                    }
                ],
                order: [['order_time', 'DESC']]
            });
            
            const summary = {
                total: orders.length,
                pending: orders.filter(o => o.order_status === 'pending').length,
                in_progress: orders.filter(o => o.order_status === 'in_progress').length,
                completed: orders.filter(o => o.order_status === 'completed').length,
                cancelled: orders.filter(o => o.order_status === 'cancelled').length,
                total_revenue: orders
                    .filter(o => o.order_status === 'completed')
                    .reduce((sum, order) => sum + parseFloat(order.total_amount), 0)
            };
            
            res.json({
                summary,
                recent_orders: orders.slice(0, 10) // Last 10 orders
            });
            
        } catch (error) {
            console.error('Get today\'s orders error:', error);
            res.status(500).json({ 
                error: 'Failed to retrieve today\'s orders', 
                details: error.message 
            });
        }
    }
}

// module.exports = OrderProcessingController;