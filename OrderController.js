const { Order } = require('./model/Order');

const createOrder = (req, res)=>{
    const { order_status, total_amount,order_time, table_id } = req.body;

    Order.create({
        order_status,
        total_amount,
        order_time,
        table_id
    })
    .then((newOrder) => {
        res.status(201).json({ message: 'Order created successfully',newOrder });
    })
    .catch((error) => {
        res.status(500).json({ error: 'Failed to create order',error });
    });
}


const getAllOrders = (req, res) =>{
    //pass
}

const getOrderById = (req, res) =>{
    //pass
}

const updateOrder = (req, res) =>{
    //pass
}

const deleteorder = (req, res)=>{
    //pass
}


module.exports = {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrder,
    deleteorder
}