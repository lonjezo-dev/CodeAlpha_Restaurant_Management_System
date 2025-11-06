const e = require("express");
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
    // get table id from request params
    const id = req.params.id;
    Table.findByPk(id,{
        attributes: ['table_number', 'capacity', 'status'],
    })
    .then((table) => {
        res.json(table);
    })
    .catch((error) => {
        res.status(500).json({ error: "Failed to retrieve table" });
    });
}

const getAllTables = (req, res) =>{
    // fetch all tables from the database
    Table.findAll({
        attributes:['table_number', 'capacity', 'status']
    }).then((result)=>{
        return res.json(result);
    }).catch((error)=>{
        console.log(error);
         return res.status(500).json({error: "Unable to fetch tables"});
    })
}

const updateTable = (req, res) =>{

}

const deleteTable = (req, res) =>{
    pass
}

module.exports = { createTable,getTable, getAllTables,updateTable, deleteTable}