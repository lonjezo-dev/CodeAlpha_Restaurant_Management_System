const {Table} = require("./model/Table");

// create Table controller function accessed by restaurant staff
const createTable = (req, res) =>{
    // get data from request body
    const { table_number, capacity, status } = req.body;
    Table.create({table_number, capacity, status})
    .then((table) => {
        res.status(201).json({ message: "Table created successfully", table });
    })
    .catch((error) => {
        res.status(500).json({ error: "Failed to create table" });
    });
}

const getTable = (req, res) =>{
    pass
}

const getAllTables = (req, res) =>{
    pass
}

const updateTable = (req, res) =>{

}

const deleteTable = (req, res) =>{
    pass
}

module.exports = { createTable,getTable, getAllTables,updateTable, deleteTable}