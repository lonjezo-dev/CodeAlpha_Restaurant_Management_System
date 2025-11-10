// const e = require("express");
import {Table}  from "../model/Table.mjs";

// create Table controller function accessed by restaurant staff
export const createTable = (req, res) =>{
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

export const getTable = (req, res) =>{
    // get table id from request params
    const id = req.params.id;
    Table.findByPk(id,{
        attributes: ['id','table_number', 'capacity', 'status'],
    })
    .then((table) => {
        res.json(table);
    })
    .catch((error) => {
        res.status(500).json({ error: "Failed to retrieve table" });
    });
}

export const getAllTables = (req, res) =>{
    // fetch all tables from the database
    Table.findAll({
        attributes:['id','table_number', 'capacity', 'status']
    }).then((result)=>{
        return res.json(result);
    }).catch((error)=>{
        console.log(error);
         return res.status(500).json({error: "Unable to fetch tables"});
    })
}

export const updateTable = (req, res) =>{
    Table.update(
        {
            table_number: req.body.table_number,
            capacity: req.body.capacity,
            status: req.body.status,
        },{
            where: {
                id: req.params.id,
            },
        })
        .then(() => {
            res.json({ message: "Table updated successfully" });
        })
        .catch((error) => {
            res.status(500).json({ error: "Failed to update table" });
        });
}

export const deleteTable = (req, res) =>{
    Table.destroy({
        where: {
            id: req.params.id,
        },
    })
    .then(() => {
        res.json({ message: "Table deleted successfully" });
    })
    .catch((error) => {
        res.status(500).json({ error: "Failed to delete table" });
    });
}

