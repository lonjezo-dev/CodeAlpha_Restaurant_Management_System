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
    Order.findAll({
        attributes: ['order_status', 'total_amount', 'order_time', 'table_id']
    })
    .then((orders) => {
        res.json(orders);               

    }).catch((error) => {
        res.status(500).json({ error: 'Failed to retrieve orders',error });
    });
  
}

const getOrderById = (req, res) =>{
    const id = req.params.id;
    Order.findByPk(id,{
        attributes: ['order_status', 'total_amount', 'order_time', 'table_id']
    })
    .then((order) => {
        res.json(order);
    })
    .catch((error) => {
        res.status(500).json({ error: 'Failed to retrieve order',error });
    });
  
}

const updateOrder = (req, res) =>{
    Order.update(
        {
            order_status: req.body.order_status,
            total_amount: req.body.total_amount,
            order_time: req.body.order_time,
            table_id: req.body.table_id
        },{
            where: {
                id: req.params.id,
            },
        })
        .then(() => {
            res.json({ message: "Order updated successfully" });
        })
        .catch((error) => {
            res.status(500).json({ error: "Failed to update order",error });
        });
    //pass
}

const deleteorder = (req, res)=>{
    Order.destroy({
        where: {
            id: req.params.id,
        },
    })
    .then(() => {
        res.json({ message: "Order deleted successfully" });
    })
    .catch((error) => {
        res.status(500).json({ error: "Failed to delete order",error });
    });
    //pass
}


module.exports = {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrder,
    deleteorder
}