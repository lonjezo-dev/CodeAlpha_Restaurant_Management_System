const { Order_Item } = require("../model/Order_Item");


// Create a new order item
const createOrderItem = (req, res) => {
    const { quantity, price, order_id, menu_item_id } = req.body;

    Order_Item.create({
        quantity,
        price,
        order_id,
        menu_item_id
    })
    .then((newOrderItem) => {
        res.status(201).json({ message: 'Order item created successfully', newOrderItem });
    })
    .catch((error) => {
        res.status(500).json({ error: 'Failed to create order item', error });
    });
}


// Get all order items
const getAllOrderItems = (req, res) => {
    Order_Item.findAll({
        attributes: ['quantity', 'price', 'order_id', 'menu_item_id']
    })
    .then((orderItems) => {
        res.json(orderItems);               
    })
    .catch((error) => {
        res.status(500).json({ error: 'Failed to retrieve order items', error });
    });
}

// Get a specific order item by ID
const getOrderItemById = (req, res) => {
    const id = req.params.id;
    Order_Item.findByPk(id, {
        attributes: ['quantity', 'price', 'order_id', 'menu_item_id']
    })
    .then((orderItem) => {
        res.json(orderItem);
    })
    .catch((error) => {
        res.status(500).json({ error: 'Failed to retrieve order item', error });
    });
}

// Update an order item by ID
const updateOrderItem = (req, res) => {
    Order_Item.update(
        {
            quantity: req.body.quantity,
            price: req.body.price,
            order_id: req.body.order_id,
            menu_item_id: req.body.menu_item_id
        },{
            where: {
                id: req.params.id,
            },
        })
        .then(() => {
            res.json({ message: 'Order item updated successfully' });
        })
        .catch((error) => {
            res.status(500).json({ error: 'Failed to update order item', error });
        });
}

// Delete an order item by ID
const deleteOrderItem = (req, res) => {
    const id = req.params.id;
    Order_Item.destroy({
        where: { id: id }
    })
    .then(() => {
        res.json({ message: 'Order item deleted successfully' });
    })
    .catch((error) => {
        res.status(500).json({ error: 'Failed to delete order item', error });
    });
}

module.exports = {
    createOrderItem,
    getAllOrderItems,
    getOrderItemById,
    updateOrderItem,
    deleteOrderItem
};